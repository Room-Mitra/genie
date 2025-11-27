'use client';

import React, { useState, useEffect, useRef } from 'react';

const SUPPORTED_COUNTRIES = [
  { code: 'IN', dialCode: '91', flag: '🇮🇳', name: 'India' },
  { code: 'US', dialCode: '1', flag: '🇺🇸', name: 'United States' },
  { code: 'GB', dialCode: '44', flag: '🇬🇧', name: 'United Kingdom' },
  { code: 'AE', dialCode: '971', flag: '🇦🇪', name: 'United Arab Emirates' },
  { code: 'FR', dialCode: '33', flag: '🇫🇷', name: 'France' },
  { code: 'IT', dialCode: '39', flag: '🇮🇹', name: 'Italy' },
];

const DEFAULT_COUNTRY = 'IN';

function parseInternationalNumber(raw) {
  const value = raw.replace(/[^\d+]/g, '');
  if (!value.startsWith('+')) {
    return { country: null, normalized: value, isSupported: false };
  }

  const digits = value.slice(1);
  const sorted = [...SUPPORTED_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const meta of sorted) {
    if (digits.startsWith(meta.dialCode)) {
      const rest = digits.slice(meta.dialCode.length);
      const normalized = `+${meta.dialCode}${rest}`;
      return { country: meta, normalized, isSupported: true };
    }
  }

  return { country: null, normalized: value, isSupported: false };
}

const CallbackWidget = ({ hotelId, primaryColor, cardBgColor }) => {
  const [input, setInput] = useState('');
  const [serverError, setServerError] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isCountryOpen) return;

    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCountryOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCountryOpen]);

  const [selectedCountry, setSelectedCountry] = useState(() => {
    return SUPPORTED_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY) || SUPPORTED_COUNTRIES[0];
  });

  // Theme defaults
  const themePrimary = primaryColor || '#6366f1'; // indigo-500
  const themeCardBg = cardBgColor || 'rgba(15,23,42,0.9)'; // slate-900/90

  const handleChange = (e) => {
    const value = e.target.value;
    const trimmed = value.trim();

    setLocalError('');
    setServerError('');
    setSuccessMsg('');

    // If user is typing an international prefix
    if (trimmed.startsWith('+')) {
      const parsed = parseInternationalNumber(trimmed);

      if (parsed.country) {
        const dial = parsed.country.dialCode;
        const afterPrefix = trimmed.slice(1 + dial.length).trim();

        // If user typed ONLY "+<dialCode>"
        // then: treat it as "I want India", switch the pill, and clear the input
        // so they type the 10-digit local number next.
        if (afterPrefix === '') {
          setSelectedCountry(parsed.country);
          console.log(input);
          setInput(''); // clear +91 from the box
          return;
        }

        // Otherwise (e.g. "+1", "+1 662...", "+44 20...", "+971...")
        // just update the country pill and keep what they typed.
        setSelectedCountry(parsed.country);
      }

      setInput(value);
      return;
    }

    // No plus → treat as local number for currently selected country.
    // Keep what they type (spaces, etc.); we’ll clean digits in handleSubmit.
    setInput(value);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');
    setLocalError('');

    const trimmed = input.trim();
    if (!trimmed) {
      setLocalError('Please enter your mobile number.');
      return;
    }

    let phoneForSubmit = '';
    let countryForSubmit = selectedCountry;

    if (trimmed.startsWith('+')) {
      // International format; detect and validate
      const parsed = parseInternationalNumber(trimmed);
      if (!parsed.country || !parsed.isSupported) {
        setLocalError('Sorry, this country code is not supported yet.');
        return;
      }

      const digitsOnly = parsed.normalized.replace(/[^\d]/g, '');
      if (digitsOnly.length < 8) {
        setLocalError('Please enter a valid phone number.');
        return;
      }

      countryForSubmit = parsed.country;
      phoneForSubmit = parsed.normalized.replace(/\s+/g, '');
    } else {
      // Local format; prepend selected country code
      const digitsOnly = trimmed.replace(/[^\d]/g, '');
      if (digitsOnly.length < 8) {
        setLocalError('Please enter a valid phone number.');
        return;
      }

      phoneForSubmit = `+${countryForSubmit.dialCode}${digitsOnly}`;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/callback-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          phone: phoneForSubmit,
          country: countryForSubmit.code,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

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
    <div
      className="w-full max-w-md rounded-2xl p-4 text-slate-50 shadow-xl ring-1 ring-slate-700/70"
      style={{ backgroundColor: themeCardBg }}
    >
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
            {/* Country selector */}
            <div ref={dropdownRef} className="relative mr-2 flex items-center">
              <button
                type="button"
                onClick={() => setIsCountryOpen((open) => !open)}
                className="flex items-center gap-1 border-r border-slate-600 pr-2 text-xs text-slate-100 hover:text-white"
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="font-mono">+{selectedCountry.dialCode}</span>
                <span className="text-[10px] opacity-70">▾</span>
              </button>

              {isCountryOpen && (
                <div className="absolute left-0 top-full z-20 mt-1 w-56 whitespace-nowrap rounded-lg bg-slate-900 shadow-lg ring-1 ring-slate-700 max-h-48 overflow-y-auto">
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={`flex w-full items-center gap-2 px-2 py-1 text-xs text-slate-100 hover:bg-slate-700 ${
                        country.code === selectedCountry.code ? 'bg-slate-800' : ''
                      }`}
                    >
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                      <span className="ml-auto font-mono">+{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Phone input */}
            <input
              id="rm-callback-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={input}
              onChange={handleChange}
              placeholder="98765 43210 or +1 555 123 4567"
              className="w-full bg-transparent text-sm text-slate-50 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {localError && <p className="mt-1 text-xs text-rose-400">{localError}</p>}
        </div>

        {serverError && <p className="text-xs text-rose-400">{serverError}</p>}

        {successMsg && <p className="text-xs text-emerald-400">{successMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: themePrimary }}
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
