"use client";

import React, { useMemo, useState, useEffect } from "react";

function canonicalDomain(hostname) {
  if (!hostname) return "";
  let h = hostname.trim().toLowerCase();
  if (h.startsWith("http://") || h.startsWith("https://")) {
    try {
      h = new URL(h).hostname;
    } catch {
      // ignore parse error, fall back to raw
    }
  }
  if (h.startsWith("www.")) {
    h = h.slice(4);
  }
  return h;
}

async function addAllowedDomain({ allowedDomains }) {
  const res = await fetch(`/api/hotel`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ allowedDomains }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add allowed domain");
  }

  return res.json();
}

const DomainConfig = ({ hotelId }) => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [signatures, setSignatures] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingSignatures, setIsFetchingSignatures] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  // Compute unique canonical domains
  const canonicalDomains = useMemo(() => {
    const set = new Set();
    for (const d of domains) {
      const c = canonicalDomain(d);
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  }, [domains]);

  // Fetch signatures from backend when canonical domains change
  useEffect(() => {
    const fetchSignatures = async () => {
      try {
        setIsFetchingSignatures(true);
        setError(null);

        // Example API, adjust to your backend
        const res = await fetch(
          "/api/widget-config/web-voice-agent/signatures",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch signatures");
        }

        const data = await res.json();
        setSignatures(data.signatures || {});
        setDomains(data.map((s) => s.allowedDomain));
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch signatures");
      } finally {
        setIsFetchingSignatures(false);
      }
    };

    if (hotelId) fetchSignatures();
  }, [hotelId]);

  const handleAddDomain = (e) => {
    e.preventDefault();
    const trimmed = newDomain.trim();
    if (!trimmed) return;

    const canon = canonicalDomain(trimmed);
    if (!canon) return;

    setDomains((prev) => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });


    
    setNewDomain("");
    setStatus(null);
  };

  const handleRemoveDomain = (domain) => {
    setDomains((prev) => prev.filter((d) => d !== domain));
    setStatus(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setStatus(null);

      // Example API, adjust to your backend
      const res = await fetch(`/api/hotels/${hotelId}/domains`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains }),
      });

      if (!res.ok) {
        throw new Error("Failed to save domains");
      }

      setStatus("Domains saved successfully");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save domains");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySnippet = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet);
      setStatus("Snippet copied to clipboard");
    } catch (err) {
      console.error(err);
      setError("Failed to copy snippet");
    }
  };

  const buildSnippet = (domain) => {
    const signature = signatures[domain] || "SIGNATURE_FROM_DASHBOARD_OR_API";

    return `<script
  src="https://widget.roommitra.com/request-callback.js"
  data-hotel-id="${hotelId}"
  data-domain="${domain}"
  data-signature="${signature}"
></script>`;
  };

  return (
    <div className="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-semibold text-gray-900">
        Allowed Domains
      </h2>
      <p className="mb-4 text-sm text-gray-600">
        Configure which domains can embed the Room Mitra widget for this hotel.
        We generate a unique code snippet for each canonical domain.
      </p>

      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {status && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {status}
        </div>
      )}

      {/* Add domain form */}
      <form
        onSubmit={handleAddDomain}
        className="mb-4 flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter domain (eg. woodroseclub.com or https://www.woodroseclub.com)"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={!newDomain.trim()}
        >
          Add
        </button>
      </form>

      {/* Current domains list */}
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-gray-800">Raw domains</h3>
        {domains.length === 0 ? (
          <p className="text-sm text-gray-500">
            No domains added yet. Add at least one domain to generate snippets.
          </p>
        ) : (
          <ul className="space-y-1">
            {domains.map((domain) => (
              <li
                key={domain}
                className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-1.5 text-sm"
              >
                <span className="text-gray-800">{domain}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(domain)}
                  className="text-xs text-gray-500 hover:text-red-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Save button */}
      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save domains"}
        </button>
      </div>

      {/* Snippets */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-800">
            Embed code snippets
          </h3>
          {isFetchingSignatures && (
            <span className="text-xs text-gray-500">
              Updating signatures...
            </span>
          )}
        </div>
        {canonicalDomains.length === 0 ? (
          <p className="text-sm text-gray-500">
            Add at least one domain to see the embed snippets.
          </p>
        ) : (
          <div className="space-y-4">
            {canonicalDomains.map((domain) => {
              const snippet = buildSnippet(domain);
              const hasSignature = Boolean(signatures[domain]);

              return (
                <div
                  key={domain}
                  className="rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Canonical domain
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {domain}
                      </p>
                      {!hasSignature && (
                        <p className="mt-1 text-xs text-amber-600">
                          Signature not loaded. Using placeholder value.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopySnippet(snippet)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Copy snippet
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">
                    <code>{snippet}</code>
                  </pre>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainConfig;
