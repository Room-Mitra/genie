import { ChatBubbleLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MicVAD } from '@ricky0123/vad-web';

const SERVER_URL = 'ws://localhost:3001';

// Must match server
const SAMPLE_RATE = 16000;

export const Agent = ({ onClose, onSuccess }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);
  const [conversationEnded, setConversationEnded] = useState(false);

  // Chat messages { id, role: 'user' | 'agent' | 'system', text }
  const [messages, setMessages] = useState([
    {
      id: 'init',
      role: 'system',
      text: 'Connecting you to the Room Mitra voice agent...',
    },
  ]);

  const wsRef = useRef(null);
  const vadRef = useRef(null);

  const isRecordingRef = useRef(false);
  const manualCloseRef = useRef(false); // true when user explicitly ends conversation or closes UI

  // Used to avoid reacting to our own TTS
  const isAgentSpeakingRef = useRef(false);
  const agentLastSpeechEndTimeRef = useRef(0);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Utility to append a message
  const pushMessage = useCallback((role, text) => {
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text,
      },
    ]);
  }, []);

  // Convert Float32 PCM ([-1,1]) to Int16 for server
  function float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = float32Array[i];
      if (s > 1) s = 1;
      else if (s < -1) s = -1;
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  // Core cleanup for VAD + socket
  const cleanupResources = useCallback(() => {
    manualCloseRef.current = true; // avoid auto reconnect on purpose

    // Stop VAD if active
    if (vadRef.current) {
      try {
        // Different versions expose pause/stop; guard with typeof
        if (typeof vadRef.current.pause === 'function') {
          vadRef.current.pause();
        } else if (typeof vadRef.current.stop === 'function') {
          vadRef.current.stop();
        }
      } catch (e) {
        console.warn('[VAD] Error stopping VAD instance', e);
      }
      vadRef.current = null;
    }

    // Stop recording flag
    isRecordingRef.current = false;
    setIsRecording(false);

    // Close socket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        console.warn('Error closing WebSocket', e);
      }
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsThinking(false);
  }, []);

  // Start MicVAD: WebRTC-style VAD, no manual silence detection
  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to the server. Cannot start listening.');
      return;
    }

    try {
      setError(null);

      // Only create VAD once
      if (!vadRef.current) {
        const vad = await MicVAD.new({
          onSpeechStart: () => {
            // Speech started (user likely talking)
            // You could set some UI indicator here if desired
          },
          onSpeechEnd: (audio) => {
            // audio is a Float32Array at 16kHz containing JUST the speech segment
            const now = Date.now();

            // Ignore segments that are clearly from our own TTS
            if (isAgentSpeakingRef.current || now - agentLastSpeechEndTimeRef.current < 500) {
              return;
            }

            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
              return;
            }

            if (!audio || !audio.length) return;

            // --- Tiny filter for coughs, "uh", throat clearing etc. ---

            // 1) Duration check
            const durationSec = audio.length / SAMPLE_RATE;
            const MIN_DURATION_SEC = 0.35; // 350 ms, tweak as needed

            // 2) Loudness check (RMS)
            let sumSquares = 0;
            for (let i = 0; i < audio.length; i++) {
              const s = audio[i];
              sumSquares += s * s;
            }
            const rms = Math.sqrt(sumSquares / audio.length);
            const MIN_RMS = 0.02; // tweak if needed

            // Drop tiny or very quiet segments
            if (durationSec < MIN_DURATION_SEC || rms < MIN_RMS) {
              // You can console.log here for debugging if you want
              // console.log('[VAD] Dropped short/quiet segment', { durationSec, rms });
              return;
            }

            // --- If we got here, this is a "real" utterance. Send it. ---
            const pcm16 = float32ToInt16(audio);

            try {
              wsRef.current.send(pcm16);
              wsRef.current.send(JSON.stringify({ type: 'END_UTTERANCE' }));
            } catch (err) {
              console.error('[CLIENT] Failed to send utterance audio:', err);
            }
          },

          // Load WASM and model from CDN, as recommended in the README
          // (this avoids bundling ONNX manually)
          onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
          baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/',
        });

        vadRef.current = vad;
        await vad.start();

        pushMessage('system', 'Listening. You can start speaking at any time.');
      }

      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.error('Error starting VAD/mic:', err);
      setError(
        'Could not access microphone. Check permissions or ensure the app is served over HTTPS or localhost.'
      );
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  }, [pushMessage]);

  // WebSocket setup
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      return;
    }

    manualCloseRef.current = false;

    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;
    ws.binaryType = 'arraybuffer';

    // Local TTS chunk buffer
    let ttsAudioChunks = [];
    let isReceivingAudio = false;

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
      pushMessage('system', 'Connected. Setting up your call with the agent...');

      // First message: START_CALL
      try {
        ws.send(JSON.stringify({ type: 'START_CALL' }));
      } catch (e) {
        console.error('Failed to send START_CALL:', e);
      }

      // Start microphone + VAD pipeline automatically
      startRecording();
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      const reason = `Code: ${event.code}, Reason: ${
        event.reason || 'No specific reason provided'
      }`;

      if (!manualCloseRef.current) {
        // Unplanned disconnect: show error and attempt reconnect
        setError(`Connection lost to ${ws.url} (${reason}). Attempting reconnection...`);
        setTimeout(() => {
          connectWebSocket();
        }, 5000);
      } else {
        // Manual close. No auto reconnect.
        pushMessage('system', 'Conversation ended.');
      }
    };

    ws.onerror = (e) => {
      console.warn(
        'WebSocket connection error. Check server status and URL:',
        wsRef.current?.url,
        e
      );
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        setError(
          `Failed to connect to ${ws.url}. Ensure the Node.js server is running and accessible.`
        );
      } else {
        setError('WebSocket connection error. Check console for details.');
      }
    };

    ws.onmessage = async (event) => {
      // Binary: audio chunks
      if (typeof event.data !== 'string') {
        if (isReceivingAudio) {
          ttsAudioChunks.push(event.data);
        }
        return;
      }

      // Text: JSON control messages
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'transcript') {
          // STT transcript from your speech
          if (message.text) {
            pushMessage('user', message.text);
          }
          setIsThinking(true);
        } else if (message.type === 'reply_text') {
          // Agent's reply text
          if (message.text) {
            pushMessage('agent', message.text);
          }
        } else if (message.type === 'audio_start') {
          ttsAudioChunks = [];
          isReceivingAudio = true;
        } else if (message.type === 'audio_end') {
          isReceivingAudio = false;
          setIsThinking(false);

          if (!ttsAudioChunks.length) {
            console.error('No TTS audio chunks received before audio_end');
            return;
          }

          const audioBlob = new Blob(ttsAudioChunks, { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          // Mark that agent is speaking so we ignore its voice in VAD onSpeechEnd
          isAgentSpeakingRef.current = true;

          audio.play().catch((e) => {
            console.error('Audio playback error:', e);
            // If playback fails, clear the flag so mic works again
            isAgentSpeakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
          });

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            isAgentSpeakingRef.current = false;

            // Short cooldown window so any trailing echo doesn't create segments
            agentLastSpeechEndTimeRef.current = Date.now();
          };
        } else if (message.type === 'error') {
          setError(`Server Error: ${message.message}`);
          setIsThinking(false);
          pushMessage('system', `Server error: ${message.message}`);
        }
      } catch (e) {
        console.warn('Received non JSON message:', event.data, e);
      }
    };
  }, [pushMessage, startRecording]);

  // Init WebSocket when component mounts
  useEffect(() => {
    connectWebSocket();
    return () => {
      cleanupResources();
    };
  }, [connectWebSocket, cleanupResources]);

  const statusColor = isConnected ? 'bg-green-500' : 'bg-red-500';

  // End only the conversation (no onClose)
  const handleEndConversation = () => {
    setConversationEnded(true);
    cleanupResources();
  };

  // Close the UI, but first clean up everything
  const handleCloseClick = () => {
    cleanupResources();
    onClose?.();
  };

  const renderMessageBubble = (msg) => {
    const isUser = msg.role === 'user';
    const isAgent = msg.role === 'agent';
    const isSystem = msg.role === 'system';

    if (isSystem) {
      return (
        <div key={msg.id} className="flex justify-center my-2">
          <div className="text-xs text-gray-400 italic">{msg.text}</div>
        </div>
      );
    }

    return (
      <div key={msg.id} className={`flex my-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-gray-200 text-gray-900 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-800 max-w-2xl shadow-2xl p-6 space-y-4 flex flex-col h-[480px]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-xs">
          <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
          <span className="text-gray-200">
            {isConnected ? 'Connected to agent' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-300">
          {isRecording && !conversationEnded && (
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening
            </span>
          )}
          {isThinking && (
            <span className="flex items-center gap-1">
              <SparklesIcon className="w-4 h-4 animate-spin" />
              Thinking
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-xl border border-red-300 text-xs">
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {/* Conversation thread */}
      <div className="flex-1 bg-gray-900/40 rounded-2xl p-4 overflow-y-auto space-y-1">
        {messages.map((m) => renderMessageBubble(m))}
        {!conversationEnded && (
          <div className="mt-3 text-[11px] text-gray-400 flex items-center gap-1">
            <ChatBubbleLeftIcon className="w-3 h-3" />
            Speak naturally. The agent is listening and will reply with voice and text.
          </div>
        )}
        {conversationEnded && (
          <div className="mt-3 text-[11px] text-gray-400 italic">
            Conversation has ended. You can close this window.
          </div>
        )}
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 px-2 py-2 bg-gray-900/60 rounded-xl">
        <button
          type="button"
          disabled={conversationEnded || !isConnected}
          onClick={handleEndConversation}
          className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold
            ${
              conversationEnded || !isConnected
                ? 'bg-gray-500 text-gray-200 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
        >
          End conversation
        </button>

        <button
          type="button"
          data-autofocus
          onClick={handleCloseClick}
          className="inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold bg-white/10 text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  );
};
