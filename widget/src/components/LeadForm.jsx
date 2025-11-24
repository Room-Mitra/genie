import { cn } from '@/src/lib/utils';
import { useMemo, useState } from 'react';

export function LeadForm({ onClose, onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('');

  const canSubmit = useMemo(() => {
    return !submitting && name.trim() !== '' && email.trim() !== '' && language !== '';
  }, [submitting, name, email, language]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!String(data.name).trim() || !String(data.email).trim()) {
      setSubmitting(false);
      setErrorMessage('Please fill in your name and email, and choose a language.');
      return;
    }

    try {
      const res = await fetch('/api/voice-agent-trial-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          language: data.language,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => '');
        throw new Error(j?.error || `Request failed with ${res.status}`);
      }

      form.reset();
      onSuccess({ email, name, language });
      setName('');
      setEmail('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col bg-gray-800">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm px-5 py-10 text-center mx-auto">
          <div className="grid gap-4">
            <div className="flex flex-col text-left">
              <label htmlFor="name" className="block text-gray-200 font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border text-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col text-left">
              <label htmlFor="name" className="block text-gray-200 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border text-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col text-left">
              <label htmlFor="language" className="block text-gray-200 font-semibold mb-2">
                Language <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <select
                  id="language"
                  name="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  required
                  className="w-full appearance-none px-3 pr-9 bg-gray-800 py-2 border text-gray-200 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="" disabled hidden>
                    Select a language
                  </option>
                  <option value="english">English</option>
                  <option value="kannada">Kannada</option>
                  <option value="hindi">Hindi</option>
                  <option value="tamil">Tamil</option>
                  <option value="telugu">Telugu</option>
                  <option value="malayalam">Malayalam</option>
                </select>

                {/* Custom dropdown arrow */}
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </div>
            </div>
            {errorMessage && <p className="mt-4 text-sm text-red-500">{errorMessage}</p>}
          </div>
        </div>
      </div>
      {/* BUTTON ROW PINNED TO BOTTOM */}
      <div className="border-t border-gray-700/60 bg-gray-900/60 px-4 py-3 flex gap-3 justify-center sm:flex-row-reverse sm:px-6">
        <button
          type="button"
          data-autofocus
          onClick={() => {
            setEmail('');
            setName('');
            setErrorMessage('');
            setSubmitting(false);
            onClose();
          }}
          className="inset-ring inset-ring-white/5 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold bg-white/20 text-white hover:bg-white/40 sm:w-auto"
        >
          Close
        </button>

        <button
          type="submit"
          className={cn(
            'inset-ring inset-ring-white/5 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:w-auto',
            !canSubmit
              ? 'bg-gray-700 text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          )}
          disabled={!canSubmit}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
