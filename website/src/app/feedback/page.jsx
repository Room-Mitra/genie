'use client';

import { useState, useRef } from 'react';

export default function FeedbackPage() {
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioSubmitting, setAudioSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  async function handleTextSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('name', name);
      formData.append('roomNumber', roomNumber);
      formData.append('message', message);

      const res = await fetch('/api/feedback', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to submit feedback');
      }

      setSuccess('Thank you for your feedback.');
      setMessage('');
    } catch (err) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function startRecording() {
    try {
      setError(null);
      setSuccess(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function submitAudio() {
    if (!audioBlob) return;

    setError(null);
    setSuccess(null);
    setAudioSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', 'audio');
      formData.append('name', name);
      formData.append('roomNumber', roomNumber);
      formData.append('audio', audioBlob, 'feedback.webm');

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const endpoint = `${apiBase.replace(/\/+$/, '')}/website/feedback`;

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to submit voice feedback');
      }

      setSuccess('Thank you for your voice feedback.');
      setAudioBlob(null);
      setAudioUrl(null);
    } catch (err) {
      setError(err?.message || 'Something went wrong while uploading audio.');
    } finally {
      setAudioSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center">Room Mitra Feedback</h1>
        <p className="text-center text-sm text-zinc-400">
          Tell us how your experience was. You can type it out or leave a short voice message.
        </p>

        {/* Name and Room fields shared by both methods */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-200" htmlFor="name">
              Name (optional)
            </label>
            <input
              id="name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Your name or initials"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-200" htmlFor="roomNumber">
              Room number
            </label>
            <input
              id="roomNumber"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Eg. 302"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Text feedback card */}
          <form
            onSubmit={handleTextSubmit}
            className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
          >
            <h2 className="text-base font-semibold">Text feedback</h2>
            <textarea
              className="min-h-[140px] w-full rounded-lg border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Share your thoughts about Room Mitra or your stay."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-400 transition"
            >
              {isSubmitting ? 'Sending...' : 'Submit text feedback'}
            </button>
          </form>

          {/* Voice feedback card */}
          <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
            <h2 className="text-base font-semibold">Voice feedback</h2>
            <p className="text-xs text-zinc-400">
              Hold your device close and speak clearly. We recommend a short message under one
              minute.
            </p>

            <div className="flex items-center gap-3">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 transition"
                >
                  Start recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition"
                >
                  Stop recording
                </button>
              )}

              <span className="text-xs text-zinc-400">
                {isRecording ? 'Recording in progress...' : 'Tap to start.'}
              </span>
            </div>

            {audioUrl && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-300">Preview your message:</p>
                <audio controls src={audioUrl} className="w-full" />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={submitAudio}
                    disabled={audioSubmitting}
                    className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-400 transition"
                  >
                    {audioSubmitting ? 'Uploading...' : 'Submit voice feedback'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {(error || success) && (
          <div className="text-sm">
            {error && <p className="text-red-400">{error}</p>}
            {success && <p className="text-emerald-400">{success}</p>}
          </div>
        )}

        <p className="text-[11px] text-center text-zinc-500">
          Your feedback helps us improve Room Mitra for future guests.
        </p>
      </div>
    </div>
  );
}
