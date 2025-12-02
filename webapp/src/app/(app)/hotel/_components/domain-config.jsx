"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { DeleteButton } from "@/components/ui/delete-button";
import { DeleteModal } from "@/components/ui/delete-modal";
import React, { useMemo, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CopySnippetButton } from "./copy-snippet-button";
import { Spinner } from "@material-tailwind/react";

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

const DomainConfig = ({ hotelId }) => {
  const [domains, setDomains] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [signatures, setSignatures] = useState({});
  const [isFetchingSignatures, setIsFetchingSignatures] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [domainToDelete, setDomainToDelete] = useState(null);

  const fetchSignatures = async () => {
    try {
      setIsFetchingSignatures(true);
      setError(null);

      // Example API, adjust to your backend
      const res = await fetch("/api/widget-config/web-voice-agent/signatures", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch signatures");
      }

      const data = await res.json();
      setSignatures(
        new Map(data.signatures.map((s) => [s.allowedDomain, s.signature])),
      );
      setDomains(data.signatures.map((s) => s.allowedDomain));
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch signatures");
    } finally {
      setIsFetchingSignatures(false);
    }
  };

  useEffect(() => {
    if (hotelId) fetchSignatures();
  }, [hotelId]);

  const handleDeleteDomain = async (domain) => {
    const newAllowedDomains = [...domains].filter((d) => d !== domain);

    try {
      setError(null);

      const res = await fetch(`/api/hotel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedDomains: newAllowedDomains }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove domain");
      }

      toast.success(`Domain ${domain} removed`);
      setNewDomain("");
      fetchSignatures();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to remove domain");
    } finally {
      setShowDeleteModal(false);
      setDomainToDelete("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setError(null);

      const trimmed = newDomain.trim();
      if (!trimmed) return;

      const canon = canonicalDomain(trimmed);
      if (!canon) return;

      if (domains.includes(canon)) {
        toast.warn("Domain already exists");
        setNewDomain("");
        return;
      }

      const newAllowedDomains = [...domains, canon];

      const res = await fetch(`/api/hotel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowedDomains: newAllowedDomains }),
      });

      if (!res.ok) {
        throw new Error("Failed to save domains");
      }

      setDomains(newAllowedDomains);

      toast.success("Domains saved successfully");
      setNewDomain("");
      fetchSignatures();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save domains");
    }
  };

  const buildSnippet = (domain) => {
    const signature =
      signatures.get(domain) || "SIGNATURE_FROM_DASHBOARD_OR_API";

    return `<script
  src="https://widget.roommitra.com/request-callback.js"
  data-hotel-id="${hotelId}"
  data-signature="${signature}"
/>`;
  };

  return (
    <>
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm dark:bg-gray-dark">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-300">
          Allowed Domains
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Configure which domains can embed the{" "}
          <span className="font-semibold">Vaani - Chat Bot</span> widget for
          this hotel. Each domain has a unique code snippet.
        </p>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Add domain form */}
        <form
          onSubmit={handleSave}
          className="mb-4 flex flex-col gap-2 sm:flex-row"
        >
          <InputGroup
            type="text"
            className="flex-1 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter domain (eg. example.com or https://www.example.com)"
            label="Domain"
            value={newDomain}
            handleChange={(e) => setNewDomain(e.target.value)}
          />
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
              disabled={!newDomain.trim()}
            >
              Add
            </button>
          </div>
        </form>

        {isFetchingSignatures && (
          <div className="my-4">
            <Spinner className="mx-auto" />
          </div>
        )}

        {/* Current domains list */}
        <div className="mb-4">
          {domains.length === 0 ? (
            !isFetchingSignatures && (
              <p className="text-sm text-gray-500">
                No domains added yet. Add at least one domain to generate
                snippets.
              </p>
            )
          ) : (
            <ul className="space-y-4">
              {domains.map((domain) => {
                const snippet = buildSnippet(domain);
                const hasSignature = Boolean(signatures.get(domain));

                return (
                  <li key={domain} className="">
                    <div
                      key={domain}
                      className="rounded-md bg-gray-100 p-3 dark:bg-gray-700"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-200">
                            Canonical domain
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {domain}
                          </p>
                          {!hasSignature && (
                            <p className="mt-1 text-xs text-amber-600">
                              Signature not loaded. Using placeholder value.
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <CopySnippetButton snippet={snippet} />

                          <DeleteButton
                            onClick={() => {
                              setDomainToDelete(domain);
                              setShowDeleteModal(true);
                            }}
                          />
                        </div>
                      </div>
                      <pre className="overflow-x-auto rounded-md bg-gray-800 p-3 text-xs text-gray-100 dark:bg-gray-900">
                        <code>{snippet}</code>
                      </pre>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      <DeleteModal
        showModal={showDeleteModal}
        onClose={() => {
          setDomainToDelete(null);
          setShowDeleteModal(false);
        }}
        message={
          <div className="px-6 py-5">
            <div className="pb-2 pt-6 font-bold">
              Are you sure you want to delete domain?
            </div>
            <div className="mx-auto w-fit">
              <span className="font-semibold">{domainToDelete}</span>
            </div>
          </div>
        }
        header={"Delete domain"}
        onConfirmDelete={async () => await handleDeleteDomain(domainToDelete)}
      />
    </>
  );
};

export default DomainConfig;
