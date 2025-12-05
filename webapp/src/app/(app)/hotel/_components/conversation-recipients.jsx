"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ConversationRecipients = ({ hotelId }) => {
  const [transcriptRecipients, setTranscriptRecipients] = useState("");

  const [newRecipients, setNewRecipients] = useState("");

  async function getHotelInfo() {
    const res = await fetch("/api/hotel", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch hotel");
    return await res.json();
  }

  useEffect(() => {
    (async () => {
      if (hotelId) {
        const hotelInfo = await getHotelInfo();
        setTranscriptRecipients(
          hotelInfo.transcriptRecipients?.join(",") || "",
        );
        setNewRecipients(hotelInfo.transcriptRecipients?.join(",") || "");
      }
    })();
  }, [hotelId]);

  function parseEmailListStrict(str) {
    if (!str || typeof str !== "string") return [];

    const emails = str
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    const invalid = emails.filter((email) => !emailRegex.test(email));

    if (invalid.length > 0) {
      throw new Error(`Invalid emails: ${invalid.join(", ")}`);
    }

    return emails;
  }

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const recipients = parseEmailListStrict(newRecipients);

      const res = await fetch(`/api/hotel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptRecipients: recipients }),
      });

      if (!res.ok) {
        throw new Error("Failed to save recipients");
      }

      setNewRecipients(recipients?.join(","));
      setTranscriptRecipients(recipients?.join(","));

      toast.success("Recipients saved successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating recipients");
    }
  };

  return (
    <>
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-sm dark:bg-gray-dark">
        <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-300">
          Transcript Recipients
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Configure email addresses that should receive the chat transcripts
          from <span className="font-semibold">Vaani - Chat Bot.</span>
        </p>

        {/* Add domain form */}
        <form
          onSubmit={handleSave}
          className="mb-4 flex flex-col gap-2 sm:flex-row"
        >
          <InputGroup
            type="text"
            className="flex-1 rounded-md text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter comma separted email addresses (Eg: akshay@hotel.com,kumar@hotel.com)"
            label="Recipients"
            value={newRecipients || transcriptRecipients}
            handleChange={(e) => setNewRecipients(e.target.value)}
          />
          <div className="flex items-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
              disabled={newRecipients === transcriptRecipients}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ConversationRecipients;
