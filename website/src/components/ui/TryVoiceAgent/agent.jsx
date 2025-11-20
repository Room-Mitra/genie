import {
  ArrowUpIcon,
  ChatBubbleLeftIcon,
  MicrophoneIcon,
  SparklesIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useState, useRef, useEffect, useCallback } from 'react';
// // Using lucide-react icons (assuming it's available in the environment)
// import { Mic, Zap, MessageCircle, Volume2, ArrowUp, XCircle } from 'lucide-react';

const SERVER_URL = 'ws://localhost:3001'; // UPDATED: Changed from 8080 to 3001

// --- Audio Configuration (Must match server.js) ---
const SAMPLE_RATE = 16000;
const BUFFER_SIZE = 4096;

export const Agent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('Tap the mic to start speaking...');
  const [replyText, setReplyText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const streamRef = useRef(null);

  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // --- 1. WebSocket Setup ---

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsConnected(true);
      return;
    }

    // console.log(`Attempting to connect to WebSocket server at: ${SERVER_URL}`);

    const ws = new WebSocket(SERVER_URL);
    wsRef.current = ws;

    // Make sure binary frames come in as ArrayBuffer
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      // console.log('WebSocket connected');
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = (event) => {
      // Added 'event' argument
      setIsConnected(false); // Immediate update on close
      let reason = `Code: ${event.code}, Reason: ${event.reason || 'No specific reason provided'}`;
      // console.log(`WebSocket disconnected (${reason}). Attempting to reconnect in 5s...`);
      setError(`Connection lost to ${ws.url}. Attempting reconnection...`);
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = (e) => {
      // Updated error logging to provide more context
      console.warn(
        'WebSocket connection attempt failed. Check server status and URL:',
        wsRef.current?.url,
        e
      );
      // Check if the connection is immediately closing (likely a connection refused error)
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
        setError(
          `Failed to connect to ${ws.url}. Ensure the Node.js server is running and accessible.`
        );
      } else {
        setError(`WebSocket connection error. Check console for details.`);
      }
      // Do not call ws.close() here as it might be called in onclose handler already
    };

    // This buffer holds chunks of the incoming TTS audio (MP3)
    let ttsAudioChunks = [];
    let isReceivingAudio = false;

    ws.onmessage = async (event) => {
      // 1. Binary frames = TTS audio data (since we set binaryType = 'arraybuffer')
      if (typeof event.data !== 'string') {
        if (isReceivingAudio) {
          // event.data is already an ArrayBuffer
          ttsAudioChunks.push(event.data);
        }
        return;
      }

      // 2. Text frames = JSON messages
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'transcript') {
          // console.log('Received STT Transcript:', message.text);
          setTranscript(message.text);
          setIsThinking(true);
        } else if (message.type === 'reply_text') {
          setReplyText(message.text);
        } else if (message.type === 'audio_start') {
          // console.log('Receiving TTS audio...');
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

          audio.play().catch((e) => console.error('Audio playback error:', e));
          audio.onended = () => URL.revokeObjectURL(audioUrl);
        } else if (message.type === 'error') {
          setError(`Server Error: ${message.message}`);
          setIsThinking(false);
        }
      } catch (e) {
        console.warn('Received non-JSON message:', event.data, e);
      }
    };
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      // Only close the WebSocket when the component unmounts
      if (wsRef.current) wsRef.current.close();
      // IMPORTANT: If we started the AudioContext, we should close it here too
      // to ensure microphone resource is released on unmount.
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [connectWebSocket]);

  // --- 2. Audio Recording Logic (Web Audio API for PCM/LINEAR16) ---
  function float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      let s = float32Array[i];
      // clamp
      if (s > 1) s = 1;
      else if (s < -1) s = -1;
      // scale to 16-bit signed
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  const startRecording = async () => {
    if (!isConnected) {
      setError('Not connected to the server. Please check the connection.');
      return;
    }

    try {
      // Reset state
      setTranscript('Listening...');
      setReplyText('');
      setError(null);
      setIsThinking(false);

      if (!audioContextRef.current) {
        // Create AudioContext only on the first run
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: SAMPLE_RATE,
        });
        // console.log('[CLIENT] Actual AudioContext sampleRate:', audioContext.sampleRate);

        audioContextRef.current = audioContext;

        // Get microphone stream (only need to acquire once)
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { sampleRate: SAMPLE_RATE, channelCount: 1 },
        });
        streamRef.current = stream;

        const source = audioContext.createMediaStreamSource(stream);

        // Create a ScriptProcessorNode to process audio chunks
        const processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
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

          // For debugging: log a small sample of values
          // console.log('[CLIENT] PCM16 slice:', pcm16.slice(0, 10));

          try {
            // TypedArray is fine; browser will send underlying ArrayBuffer
            wsRef.current.send(pcm16);
          } catch (err) {
            console.error('[CLIENT] Failed to send audio chunk:', err);
          }
        };

        // Connect nodes: Source -> Processor -> Destination (necessary to trigger onaudioprocess)
        source.connect(processor);
        processor.connect(audioContext.destination);
      } else {
        // If Context exists, resume it (this re-activates the stream/processor)
        await audioContextRef.current.resume();
      }

      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(
        'Could not access microphone. Check permissions or ensure the app is served over HTTPS/localhost.'
      );
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!isRecordingRef.current) return;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'STOP_RECORDING' }));
      // console.log('[DEBUG CLIENT] Dispatched STOP_RECORDING');
      setTranscript('Transcription complete. Waiting for agent reply...');
    }

    setIsRecording(false);

    if (audioContextRef.current && audioContextRef.current.state === 'running') {
      audioContextRef.current
        .suspend()
        .catch((e) => console.error('Error suspending AudioContext:', e));
    }
  };

  // Handler for the microphone button press
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // --- UI Rendering (Omitted for brevity) ---

  const statusColor = isConnected ? 'bg-green-500' : 'bg-red-500';

  const renderIcon = () => {
    if (!isConnected) {
      return <XCircleIcon className="w-12 h-12 text-white" />;
    }
    if (isRecording) {
      return <MicrophoneIcon className="w-12 h-12 text-white animate-pulse" />;
    }
    if (isThinking) {
      return <SparklesIcon className="w-12 h-12 text-white animate-spin" />;
    }
    return <MicrophoneIcon className="w-12 h-12 text-white" />;
  };

  return (
    <div className="w-full bg-gray-800 max-w-2xl  shadow-2xl p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm">
          <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
          <span className="text-gray-200">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Status/Error Messages */}
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-xl border border-red-300">
          <strong>Connection Error:</strong> {error}
        </div>
      )}

      {/* Transcription Display */}
      <div className="bg-gray-100 p-6 rounded-2xl shadow-inner min-h-[100px]">
        <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2 flex items-center">
          <ArrowUpIcon className="w-4 h-4 mr-1 text-gray-500" />
          Your Speech (STT Result)
        </h2>
        <p className={`text-xl font-medium ${isRecording ? 'text-indigo-600' : 'text-gray-900'}`}>
          {transcript}
        </p>
      </div>

      {/* Reply Display */}
      <div className="bg-indigo-50 p-6 rounded-2xl shadow-md min-h-[120px]">
        <h2 className="text-xs font-semibold uppercase text-indigo-500 mb-2 flex items-center">
          <ChatBubbleLeftIcon className="w-4 h-4 mr-1 text-indigo-500" />
          Agent Reply (TTS Source)
        </h2>
        {isThinking ? (
          <div className="flex items-center space-x-2 text-indigo-600">
            <SparklesIcon className="w-4 h-4 animate-spin" />
            <p className="italic">Generating response...</p>
          </div>
        ) : (
          <p className="text-lg text-indigo-900">
            {replyText || 'Agent is ready for your command.'}
          </p>
        )}
      </div>

      {/* Microphone Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={toggleRecording}
          disabled={!isConnected && !isRecording}
          className={`
                            p-6 rounded-full transition-all duration-300 shadow-xl
                            ${
                              isRecording
                                ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-300/50'
                                : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-300/50'
                            }
                            ${!isConnected && !isRecording ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {renderIcon()}
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>
          Tap the button to start/stop recording. Ensure your Node.js server is running on{' '}
          {SERVER_URL}.
        </p>
      </div>
    </div>
  );
};
