'use client';

import React, { useMemo, useState } from 'react';

const SUPPORTED_COUNTRIES = [
  { code: 'IN', dialCode: '91', flag: '🇮🇳', name: 'India' },
  { code: 'US', dialCode: '1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AE', dialCode: '971', flag: '🇦🇪', name: 'United Arab Emirates' },
];

const DEFAULT_COUNTRY = 'IN';

function detectCountryFromPhone(raw) {
  // Keep only + and digits
  let value = raw.replace(/[^\d+]/g, '');

  // If user did not type +, assume default country and treat as local number
  if (!value.startsWith('+') && value.length > 0) {
    const defaultMeta = SUPPORTED_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY);
    value = `+${defaultMeta.dialCode}${value}`;
  }

  if (!value.startsWith('+')) {
    return {
      country: SUPPORTED_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY),
      formatted: value,
      isSupported: true,
    };
  }

  const digits = value.slice(1); // remove +
  // Sort by dial code length to match longest first
  const sorted = [...SUPPORTED_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const meta of sorted) {
    if (digits.startsWith(meta.dialCode)) {
      const rest = digits.slice(meta.dialCode.length);
      const formatted = rest.length > 0 ? `+${meta.dialCode} ${rest}` : `+${meta.dialCode}`;
      return { country: meta, formatted, isSupported: true };
    }
  }

  // Unknown country code
  return { country: null, formatted: value, isSupported: false };
}

const CallbackWidget = ({ hotelId }) => {
  const [input, setInput] = useState('');
  const [serverError, setServerError] = (useState < string) | (null > null);
  const [localError, setLocalError] = (useState < string) | (null > null);
  const [successMsg, setSuccessMsg] = (useState < string) | (null > null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsed = useMemo(() => detectCountryFromPhone(input), [input]);

  const handleChange = (e) => {
    setInput(e.target.value);
    setLocalError(null);
    setServerError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    if (!input.trim()) {
      setLocalError('Please enter your mobile number.');
      return;
    }

    if (!parsed.isSupported || !parsed.country) {
      setLocalError('Sorry, this country code is not supported yet.');
      return;
    }

    if (parsed.formatted.replace(/[^\d]/g, '').length < 8) {
      setLocalError('Please enter a valid phone number.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          phone: parsed.formatted.replace(/\s+/g, ''),
          country: parsed.country.code,
        }),
      });

      if (!res.ok) {
        throw new Error('Request failed');
      }

      setSuccessMsg('Thank you. A member of the hotel team will call you back shortly.');
      setInput('');
    } catch (err) {
      console.error(err);
      setServerError('Something went wrong while submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900/90 p-4 text-slate-50 shadow-xl ring-1 ring-slate-700/70">
      <h3 className="mb-1 text-base font-semibold">Request a call back</h3>
      <p className="mb-4 text-xs text-slate-300">
        Enter your mobile number and the hotel will get back to you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="rm-callback-phone"
            className="mb-1 block text-xs font-medium text-slate-200"
          >
            Mobile number
          </label>
          <div className="flex items-center rounded-xl border border-slate-600 bg-slate-800/80 px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500">
            <div className="mr-2 flex items-center gap-1 border-r border-slate-600 pr-2 text-xs text-slate-100">
              <span className="text-lg">{parsed.country?.flag ?? '🌍'}</span>
              <span className="font-mono">
                {parsed.country ? `+${parsed.country.dialCode}` : '+…'}
              </span>
            </div>
            <input
              id="rm-callback-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={parsed.formatted || input}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {localError && <p className="mt-1 text-xs text-rose-400">{localError}</p>}
          {!localError && !parsed.isSupported && input && (
            <p className="mt-1 text-xs text-amber-400">Country code not supported.</p>
          )}
        </div>

        {serverError && <p className="text-xs text-rose-400">{serverError}</p>}

        {successMsg && <p className="text-xs text-emerald-400">{successMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-400"
        >
          {isSubmitting ? 'Submitting…' : 'Request a call back'}
        </button>

        <p className="pt-1 text-[10px] text-slate-500">
          By submitting, you agree to be contacted by the hotel on this number.
        </p>
      </form>
    </div>
  );
};

export default CallbackWidget;
