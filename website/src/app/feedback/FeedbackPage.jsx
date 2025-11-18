'use client';

import { useState, useRef } from 'react';

export default function FeedbackPage({ hotel }) {
  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isVoiceSubmitting, setIsVoiceSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('');

  // Text form state
  const [name, setName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isTextSubmitting, setIsTextSubmitting] = useState(false);

  // Shared feedback
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Voice recording handlers
  async function startRecording() {
    try {
      setError(null);
      setSuccess(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/ogg' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      setError('Could not access microphone. Please check browser permissions.');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function submitVoiceFeedback() {
    if (!audioBlob) {
      setError('Please record a message before submitting.');
      return;
    }

    setFeedbackType('voice');
    setError(null);
    setSuccess(null);
    setIsVoiceSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', 'audio');
      formData.append('audio', audioBlob, 'feedback.webm');
      formData.append('roomNumber', hotel);

      const res = await fetch('/api/feedback', {
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
      console.error(err);
      setError(err?.message || 'Something went wrong while submitting voice feedback.');
    } finally {
      setIsVoiceSubmitting(false);
    }
  }

  // Text feedback handler
  async function submitTextFeedback(e) {
    e.preventDefault();

    if (!message.trim()) {
      setError('Please enter your feedback before submitting.');
      return;
    }

    setFeedbackType('text');
    setError(null);
    setSuccess(null);
    setIsTextSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', 'text');
      formData.append('name', name);
      formData.append('roomNumber', [hotel, roomNumber].filter(Boolean).join(','));
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
      console.error(err);
      setError(err?.message || 'Something went wrong while submitting feedback.');
    } finally {
      setIsTextSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-gray-800 shadow-lg rounded-2xl p-8 space-y-8 mt-10 lg:mt-0">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Guest Feedback</h1>
          <p className="text-sm text-gray-500">
            You can either leave a short voice message or fill in a simple form.
          </p>
        </div>

        {/* Section 1: Voice feedback only */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">Voice feedback</h2>
            <p className="text-sm text-gray-500">
              Please mention your name, hotel and room number at the start of the recording.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-400"
              >
                Start recording
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Stop recording
              </button>
            )}

            <span className="text-xs text-gray-500">
              {isRecording ? 'Recording in progress...' : 'Tap to start a short message.'}
            </span>
          </div>

          {audioUrl && (
            <div className="space-y-3">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitVoiceFeedback}
                  disabled={isVoiceSubmitting}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 disabled:bg-blue-300"
                >
                  {isVoiceSubmitting ? 'Submitting...' : 'Submit voice feedback'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }}
                  className="border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  Discard
                </button>
              </div>
            </div>
          )}
        </section>

        {(error || success) && feedbackType === 'voice' && (
          <div className="text-sm">
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
          </div>
        )}

        <div className="text-center font-bold text-gray-600"> OR </div>

        {/* Section 2: Text feedback with name and room */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-800">Text feedback</h2>
            <p className="text-sm text-gray-500">
              If you prefer typing, you can share your feedback here.
            </p>
          </div>

          <form onSubmit={submitTextFeedback} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="name">
                  Name (optional)
                </label>
                <input
                  name="name"
                  className="mt-1 w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="roomNumber">
                  Hotel & Room number
                </label>
                <input
                  name="roomNumber"
                  className="mt-1 w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Eg. Woodlands, 104"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="feedback">
                Your feedback
              </label>
              <textarea
                name="feedback"
                className="mt-1 w-full min-h-[140px] border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us what you liked, or what we could improve."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isTextSubmitting || !message.trim()}
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-500 disabled:bg-blue-300"
            >
              {isTextSubmitting ? 'Submitting...' : 'Submit text feedback'}
            </button>
          </form>
        </section>

        {(error || success) && feedbackType === 'text' && (
          <div className="text-sm">
            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Thank you for helping us improve Room Mitra.
        </p>
      </div>
    </div>
  );
}
