'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/src/lib/utils';
import { SUPPORTED_COUNTRIES } from './SupportedCountries';

// ---------------- PHONE UTILS ----------------
function parseInternationalNumber(raw) {
  const value = raw.replace(/[^\d+]/g, '');
  if (!value.startsWith('+')) {
    const digits = value.replace(/[^\d]/g, '');
    return { country: null, normalized: value, localDigits: digits, isSupported: false };
  }

  const digits = value.slice(1);
  const sorted = [...SUPPORTED_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);

  for (const meta of sorted) {
    if (digits.startsWith(meta.dialCode)) {
      const rest = digits.slice(meta.dialCode.length).replace(/[^\d]/g, '');
      const max = meta.maxLocalLength || 15;
      const limitedLocal = rest.slice(0, max);

      return {
        country: meta,
        localDigits: limitedLocal,
        normalized: `+${meta.dialCode}${limitedLocal}`,
        isSupported: true,
      };
    }
  }

  const digitsOnly = digits.replace(/[^\d]/g, '');
  return { country: null, normalized: value, localDigits: digitsOnly, isSupported: false };
}

function formatLocalNumber(country, digits) {
  if (!digits) return '';
  const code = country?.code ?? 'IN';

  if (code === 'IN') {
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  }

  if (['US', 'CA'].includes(code)) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  if (['FR', 'IT', 'GB', 'AE'].includes(code)) {
    const parts = [];
    for (let i = 0; i < digits.length; i += 2) parts.push(digits.slice(i, i + 2));
    return parts.join(' ');
  }

  const parts = [];
  for (let i = 0; i < digits.length; i += 3) parts.push(digits.slice(i, i + 3));
  return parts.join(' ');
}

// ---------------- LEAD FORM ----------------
export function LeadForm({ hotelId, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // phone state
  const DEFAULT_COUNTRY = 'IN';
  const [phoneInput, setPhoneInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    SUPPORTED_COUNTRIES.find((c) => c.code === DEFAULT_COUNTRY)
  );
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const dropdownRef = useRef(null);

  // close dropdown
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

  const applyLocalFormatting = (country, raw) => {
    const max = country.maxLocalLength || 15;
    const digitsOnly = raw.replace(/[^\d]/g, '').slice(0, max);
    return formatLocalNumber(country, digitsOnly);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.trim();
    setErrorMessage('');

    if (value.startsWith('+')) {
      const parsed = parseInternationalNumber(value);

      if (parsed.country) {
        setSelectedCountry(parsed.country);
        setPhoneInput(applyLocalFormatting(parsed.country, parsed.localDigits));
        return;
      }

      setPhoneInput(value);
      return;
    }

    setPhoneInput(applyLocalFormatting(selectedCountry, value));
  };

  const buildFullPhone = () => {
    const digitsOnly = phoneInput.replace(/[^\d]/g, '');
    return `+${selectedCountry.dialCode}${digitsOnly}`;
  };

  const canSubmit = useMemo(() => {
    const digits = phoneInput.replace(/[^\d]/g, '');
    return name.trim() && language && digits.length >= 8 && !sending;
  }, [name, language, phoneInput, sending]);

  // ---------------- STEP: SEND OTP ONLY ----------------
  const onSubmitLead = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSending(true);
    setErrorMessage('');

    const phone = buildFullPhone();

    try {
      const res = await fetch('/api/web-voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId,
          phone,
          name,
          language,
        }),
      });

      if (!res.ok) throw new Error('Failed to send OTP');

      // continue to OTPForm
      onSuccess({ name, language, phone });

    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setSending(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <form onSubmit={onSubmitLead} className="flex h-full flex-col bg-gray-800">
      <div className="flex items-center justify-between border-gray-700/60 bg-gray-900/60 px-6 py-4">
        <div className="text-xs font-semibold text-gray-200">I am Vani, your Voice Agent</div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm px-5 py-10 text-center mx-auto">
          <div className="grid gap-4">

            {/* NAME */}
            <div className="flex flex-col text-left">
              <label className="text-gray-200 font-semibold mb-2">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* LANGUAGE */}
            <div className="flex flex-col text-left">
              <label className="text-gray-200 font-semibold mb-2">Language *</label>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-800 text-gray-200"
              >
                <option value="" disabled>Select a language</option>
                <option value="english">English</option>
                <option value="kannada">Kannada</option>
                <option value="hindi">Hindi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="malayalam">Malayalam</option>
              </select>
            </div>

            {/* PHONE */}
            <div className="flex flex-col text-left">
              <label className="text-gray-200 font-semibold mb-2">Phone Number *</label>

              <div className="flex items-center rounded-lg border border-gray-600 bg-gray-800 px-2 py-2">
                {/* Country Selector */}
                <div ref={dropdownRef} className="relative mr-2 flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsCountryOpen((o) => !o)}
                    className="flex items-center gap-1 border-r border-gray-600 pr-2 text-xs text-gray-200"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-mono">+{selectedCountry.dialCode}</span>
                    <span className="text-[10px] opacity-60">▾</span>
                  </button>

                  {isCountryOpen && (
                    <div className="absolute left-0 top-full z-40 mt-1 w-56 bg-slate-900 rounded-lg shadow-lg ring-1 ring-slate-700 max-h-40 overflow-y-auto">
                      {SUPPORTED_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(c);
                            const digits = phoneInput.replace(/[^\d]/g, '');
                            setPhoneInput(applyLocalFormatting(c, digits));
                            setIsCountryOpen(false);
                          }}
                          className="flex items-center gap-2 px-2 py-1 text-xs text-gray-200 hover:bg-gray-700 w-full"
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                          <span className="ml-auto font-mono">+{c.dialCode}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  type="tel"
                  value={phoneInput}
                  onChange={handlePhoneChange}
                  placeholder="Enter number"
                  className="w-full bg-transparent text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="border-t border-gray-700/60 bg-gray-900/60 px-4 py-3 flex gap-3 justify-center sm:flex-row-reverse">

        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-3 py-2 rounded-md bg-white/20 text-white hover:bg-white/40 text-sm font-semibold"
        >
          Close
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            'w-full sm:w-auto px-3 py-2 rounded-md text-sm font-semibold',
            !canSubmit
              ? 'bg-gray-700 text-gray-400'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          )}
        >
          {sending ? 'Sending...' : 'Continue'}
        </button>
      </div>
    </form>
  );
}
