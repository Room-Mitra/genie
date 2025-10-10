'use client';

import { useState } from 'react';

export default function RequestDemoForm() {
  const [formState, setFormState] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Read from env so you can change environments without touching code
  // eslint-disable-next-line no-undef
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const endpoint = `${apiBase.replace(/\/+$/, '')}/leads`;

  async function onSubmit(e) {
    e.preventDefault();
    setFormState('submitting');
    setErrorMsg('');

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Optional minimal validation
    if (!String(data.name).trim() || !String(data.email).trim()) {
      setFormState('error');
      setErrorMsg('Please fill in your name and email.');
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          hotel: data.hotel,
          message: data.message,
          // simple honeypot (hidden field). If filled, ignore submission server side
          hp: data.hp,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Request failed with ${res.status}`);
      }

      setFormState('success');
      form.reset();
    } catch (err) {
      setFormState('error');
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col text-left">
          <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-col text-left">
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col text-left">
          <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col text-left">
          <label htmlFor="hotel" className="block text-gray-700 font-semibold mb-2">
            Hotel <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="hotel"
            name="hotel"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex flex-col text-left py-3">
        <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          className="border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        ></textarea>
      </div>

      {/* Honeypot field for bots */}
      <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" />

      <button
        type="submit"
        className="cta-btn px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        disabled={formState === 'submitting'}
      >
        {formState === 'submitting' ? 'Submitting…' : 'Submit'}
      </button>

      {formState === 'success' && (
        <p className="text-green-700 text-sm py-4">
          Thanks. Your request has been submitted. We will get in touch shortly.
        </p>
      )}

      {formState === 'error' && <p className="text-red-700 text-sm">{errorMsg}</p>}
    </form>
  );
}
