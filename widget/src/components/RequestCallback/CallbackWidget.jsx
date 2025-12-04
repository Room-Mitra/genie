'use client';

import './callback.css';
import React, { useState, useEffect, useRef } from 'react';
import { SUPPORTED_COUNTRIES } from './SupportedCountries';

const DEFAULT_COUNTRY = 'IN';

function parseInternationalNumber(raw) {
  const value = raw.replace(/[^\d+]/g, '');
  if (!value.startsWith('+')) {
    const digits = value.replace(/[^\d]/g, '');
    return {
      country: null,
      normalized: value,
      localDigits: digits,
      isSupported: false,
    };
  }

  const digits = value.slice(1); // after +
  const sorted = [...SUPPORTED_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const meta of sorted) {
    if (digits.startsWith(meta.dialCode)) {
      const rest = digits.slice(meta.dialCode.length).replace(/[^\d]/g, '');
      const max = meta.maxLocalLength || 15;
      const limitedLocal = rest.slice(0, max);
      const normalized = `+${meta.dialCode}${limitedLocal}`;

      return {
        country: meta,
        normalized,
        localDigits: limitedLocal,
        isSupported: true,
      };
    }
  }

  const digitsOnly = digits.replace(/[^\d]/g, '');
  return {
    country: null,
    normalized: value,
    localDigits: digitsOnly,
    isSupported: false,
  };
}

// Simple per-country formatter for the **local** part (no +CC)
function formatLocalNumber(country, digits) {
  if (!digits) return '';
  const code = country?.code ?? DEFAULT_COUNTRY;

  // India: 5 + 5 → 98765 43210
  if (code === 'IN') {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  }

  // US / Canada: 3-3-4 → 555 123 4567
  if (code === 'US' || code === 'CA') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) {
      return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  // Most EU / others: group as 2-2-2-2 or 3-3-3
  if (code === 'FR' || code === 'IT' || code === 'GB' || code === 'AE') {
    const parts = [];
    let i = 0;
    const step = 2;
    while (i < digits.length) {
      parts.push(digits.slice(i, i + step));
      i += step;
    }
    return parts.join(' ');
  }

  // Fallback: groups of 3
  const parts = [];
  for (let i = 0; i < digits.length; i += 3) {
    parts.push(digits.slice(i, i + 3));
  }
  return parts.join(' ');
}

const CallbackWidget = ({ hotelId, primary, cardBgColor }) => {
  const [input, setInput] = useState('');
  const [serverError, setServerError] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(() => {
    return SUPPORTED_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY) || SUPPORTED_COUNTRIES[0];
  });

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

  // Theme defaults
  // TODO: use this somewhere
  const themePrimary = primary || '#6366f1';
  const themeCardBg = cardBgColor || 'rgba(15,23,42,0.9)';

  const applyLocalFormatting = (country, raw) => {
    const meta = country || SUPPORTED_COUNTRIES[0];
    const max = meta.maxLocalLength || 15;
    const digitsOnly = String(raw).replace(/[^\d]/g, '').slice(0, max);
    return formatLocalNumber(meta, digitsOnly);
  };

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

        // If user typed ONLY "+<dialCode>" for ANY supported country
        // then: set that country and clear the input so they can type local number.
        if (afterPrefix === '') {
          setSelectedCountry(parsed.country);
          setInput('');
          return;
        }

        // If they typed +CC plus some digits in the same go
        // → set country, keep only the local digits formatted.
        setSelectedCountry(parsed.country);
        const formatted = applyLocalFormatting(parsed.country, parsed.localDigits);
        setInput(formatted);
        return;
      }

      // If not recognized, just let them keep what they typed (rare)
      setInput(value);
      return;
    }

    // No plus → local number for currently selected country, auto-formatted
    const formatted = applyLocalFormatting(selectedCountry, value);
    setInput(formatted);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData('text') || window.clipboardData?.getData('Text') || '';
    const trimmed = text.trim();

    setLocalError('');
    setServerError('');
    setSuccessMsg('');

    // If pasted value has a +CC, detect and strip it
    if (trimmed.startsWith('+')) {
      const parsed = parseInternationalNumber(trimmed);
      if (parsed.country) {
        const max = parsed.country.maxLocalLength || 15;
        const limited = parsed.localDigits.slice(0, max);
        const formatted = applyLocalFormatting(parsed.country, limited);
        setInput(formatted);
        return;
      }
    }

    // Otherwise treat as local number
    const formatted = applyLocalFormatting(selectedCountry, trimmed);
    setInput(formatted);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsCountryOpen(false);
    setLocalError('');

    // Reformat current local part according to new country's pattern
    const digits = input.replace(/[^\d]/g, '');
    const formatted = applyLocalFormatting(country, digits);
    setInput(formatted);
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

    const digitsOnly = trimmed.replace(/[^\d]/g, '');
    if (digitsOnly.length < 8) {
      setLocalError('Please enter a valid phone number.');
      return;
    }

    // Final E.164-ish: +CC + local digits
    const phoneForSubmit = `+${selectedCountry.dialCode}${digitsOnly}`;

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/request-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          phone: phoneForSubmit,
          country: selectedCountry.code,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      setSuccessMsg('Thank you. You will receive a call shortly.');
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
      className="w-full max-w-xs rounded-2xl p-4 text-slate-50 shadow-xl ring-1 ring-slate-700/70"
      style={{ backgroundColor: themeCardBg }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
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
                <div className="absolute left-0 top-full z-20 mt-1 w-56 whitespace-nowrap rounded-lg bg-slate-900 shadow-lg ring-1 ring-slate-700 max-h-25 overflow-y-auto">
                  {SUPPORTED_COUNTRIES.sort((a, b) => (a.name < b.name ? -1 : 1)).map((country) => (
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
              onPaste={handlePaste}
              placeholder="Enter number"
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
          className="cta-btn mt-1 inline-flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold text-black shadow-sm  disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            'Submitting…'
          ) : (
            <>
              Request a call back
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CallbackWidget;
