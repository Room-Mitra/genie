import { ChatBubbleLeftIcon, SparklesIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect, useCallback } from 'react';

const SERVER_URL = 'ws://localhost:3001';

// Must match server
const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

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
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  const isRecordingRef = useRef(false);
  const lastSpeechTimeRef = useRef(Date.now());
  const hasSentEndForThisUtteranceRef = useRef(false);
  const isAgentSpeakingRef = useRef(false);
  const manualCloseRef = useRef(false); // true when user explicitly ends conversation or closes UI
  // Prevent the user's mic from triggering END_UTTERANCE immediately after TTS ends
  const agentLastSpeechEndTimeRef = useRef(0);

  // When did this utterance start (first non-silent chunk)?
  const currentUtteranceStartRef = useRef(null);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Utility to append a message
  const pushMessage = useCallback((role, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        role,
        text,
      },
    ]);
  }, []);

  // Convert Float32 PCM to Int16 for server
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

  // Core cleanup for mic + audio + socket
  const cleanupResources = useCallback(() => {
    manualCloseRef.current = true; // avoid auto reconnect on purpose

    // Stop recording flag
    isRecordingRef.current = false;
    setIsRecording(false);

    // Stop ScriptProcessor
    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch (e) {
        console.warn('Error disconnecting processor', e);
      }
      processorRef.current = null;
    }

    // Stop audio tracks
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn('Error stopping media tracks', e);
      }
      streamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn('Error closing AudioContext', e);
      }
      audioContextRef.current = null;
    }

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

  // Start mic streaming to server continuously
  const startRecording = useCallback(async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError('Not connected to the server. Cannot start listening.');
      return;
    }

    try {
      setError(null);

      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: SAMPLE_RATE,
        });
        audioContextRef.current = audioContext;

        // Optional: add a high-pass filter for hum/rumble removal
        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 120; // Remove low rumble from fans/AC

        // Save it so we can connect through it
        audioContextRef.current.highpassFilter = highpass;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: SAMPLE_RATE,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,

            // These new constraints help the browser AGC behave properly
            voiceIsolation: true, // If the browser supports it (Safari/Chrome)
            googEchoCancellation: true,
            googNoiseSuppression: true,
            googAutoGainControl: true,
          },
        });

        streamRef.current = stream;

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const now = Date.now();

          // Ignore mic input if agent is speaking OR still in cooldown window
          if (
            isAgentSpeakingRef.current ||
            now - agentLastSpeechEndTimeRef.current < 1000 // 1 second suppression after TTS
          ) {
            return;
          }

          // Only stream while recording and WebSocket is open
          if (
            !isRecordingRef.current ||
            !wsRef.current ||
            wsRef.current.readyState !== WebSocket.OPEN
          ) {
            return;
          }

          const input = e.inputBuffer.getChannelData(0); // Float32Array
          if (!input || input.length === 0) return;

          const pcm16 = float32ToInt16(input); // Int16Array

          // --- Basic silence detection to decide when an utterance has ended ---
          // Compute RMS volume of this chunk
          let sumSquares = 0;
          for (let i = 0; i < input.length; i++) {
            const sample = input[i];
            sumSquares += sample * sample;
          }
          const rms = Math.sqrt(sumSquares / input.length);

          // Tunables
          const SILENCE_THRESHOLD = 0.01; // how loud is "speech" vs "silence"
          const SILENCE_DURATION_MS = 1500; // wait 1.5s of silence before END_UTTERANCE
          const MIN_UTTERANCE_MS = 400; // require at least 0.4s of speech

          if (rms > SILENCE_THRESHOLD) {
            // We have speech in this chunk
            lastSpeechTimeRef.current = now;
            hasSentEndForThisUtteranceRef.current = false;

            // If this is the first speech after silence, mark utterance start
            if (currentUtteranceStartRef.current === null) {
              currentUtteranceStartRef.current = now;
            }
          } else {
            // Chunk is "silent" -> check how long we have been silent
            const silenceFor = now - lastSpeechTimeRef.current;

            if (
              !hasSentEndForThisUtteranceRef.current &&
              silenceFor > SILENCE_DURATION_MS &&
              currentUtteranceStartRef.current !== null &&
              wsRef.current &&
              wsRef.current.readyState === WebSocket.OPEN
            ) {
              const utteranceDuration =
                lastSpeechTimeRef.current - currentUtteranceStartRef.current;

              // Only treat it as an utterance if we had enough speech
              if (utteranceDuration >= MIN_UTTERANCE_MS) {
                try {
                  wsRef.current.send(JSON.stringify({ type: 'END_UTTERANCE' }));
                  hasSentEndForThisUtteranceRef.current = true;
                } catch (err) {
                  console.error('[CLIENT] Failed to send END_UTTERANCE:', err);
                }
              }

              // Reset for next utterance (whether or not we sent END_UTTERANCE)
              currentUtteranceStartRef.current = null;
            }
          }

          try {
            // Send audio to server
            wsRef.current.send(pcm16);
          } catch (err) {
            console.error('[CLIENT] Failed to send audio chunk:', err);
          }
        };

        // Route: mic → highpassFilter → processor → (silent) destination
        if (audioContextRef.current.highpassFilter) {
          source.connect(audioContextRef.current.highpassFilter);
          audioContextRef.current.highpassFilter.connect(processor);
        } else {
          source.connect(processor);
        }

        processor.connect(audioContext.destination);
      } else if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setIsRecording(true);
      isRecordingRef.current = true;
      pushMessage('system', 'Listening. You can start speaking at any time.');
    } catch (err) {
      console.error('Error accessing microphone:', err);
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

      // Start microphone streaming automatically
      startRecording();
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      const reason = `Code: ${event.code}, Reason: ${event.reason || 'No specific reason provided'}`;

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
          // console.log('Finished receiving TTS audio. Chunks:', ttsAudioChunks.length);
          isReceivingAudio = false;
          setIsThinking(false);

          if (!ttsAudioChunks.length) {
            console.error('No TTS audio chunks received before audio_end');
            return;
          }

          const audioBlob = new Blob(ttsAudioChunks, { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);

          // Mark that agent is speaking so we ignore mic input
          isAgentSpeakingRef.current = true;

          audio.play().catch((e) => {
            console.error('Audio playback error:', e);
            // If playback fails, clear the flag so mic works again
            isAgentSpeakingRef.current = false;
            URL.revokeObjectURL(audioUrl);
          });

          audio.onended = () => {
            // Reset AGC baseline after TTS, prevents "rebound" pumping
            if (audioContextRef.current && audioContextRef.current.highpassFilter) {
              try {
                audioContextRef.current.highpassFilter.frequency.setValueAtTime(
                  120,
                  audioContextRef.current.currentTime
                );
              } catch (e) {
                console.warn('AGC reset skipped:', e);
              }
            }

            URL.revokeObjectURL(audioUrl);

            // Agent finished speaking
            isAgentSpeakingRef.current = false;

            // Start a cooldown window (mute the mic for 1 second)
            agentLastSpeechEndTimeRef.current = Date.now();

            // Reset silence detection state
            lastSpeechTimeRef.current = Date.now();
            hasSentEndForThisUtteranceRef.current = false;
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
