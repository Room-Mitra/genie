"use client";

import ConversationModal from "./_components/conversationModal";
import SortTable from "@/components/ui/sort-table";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { Checkbox } from "@/components/FormElements/checkbox";

const getDaysSinceEpoch = (timeStamp) => {
  const date = new Date(+timeStamp);
  return Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
};

async function getIntents({ range }) {
  const day = getDaysSinceEpoch(Date.now());
  const res = await fetch(
    `/api/intents/${day}?range=${encodeURIComponent(range)}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Error fetching intents");
  }
  return res.json();
}

export default function Page() {
  const columns = useMemo(
    () => [
      { key: "date", label: "DATE" },
      { key: "time", label: "TIME" },
      { key: "intentName", label: "NAME" },
      { key: "intentType", label: "TYPE " },
      { key: "roomId", label: "ROOM" },
      { key: "deviceId", label: "DEVICE" },
      { key: "acknowledge", label: "ACKNOWLEDGE", sortable: false },
      { key: "viewConversation", label: "VIEW CONVERSATION", sortable: false },
    ],
    [],
  );

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Call getIntents *inside* useEffect in a client component
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await getIntents({ range: 2 });
        // The API appears to return a dictionary of arrays. Flatten + sort.
        const flattened = [];
        Object.keys(response || {}).forEach((k) => {
          const arr = Array.isArray(response[k]) ? response[k] : [];
          flattened.push(...arr);
        });

        flattened.sort(
          (a, b) => (b.requestedTime || 0) - (a.requestedTime || 0),
        );

        const rows = flattened.map((i) => ({
          ...i,
          date: new Date(i.requestedTime).toLocaleDateString(),
          time: new Date(i.requestedTime).toLocaleTimeString(),
          viewConversation: (
            <ConversationModal history={i?.conversationLog?.history} />
          ),
          acknowledge: (
            <Checkbox
              withIcon="check"
              defaultChecked={i?.isAcknowledged}
              onChange={(k) => {
                console.log(k.target.checked);
              }}
            />
          ),
        }));

        if (!cancelled) setData(rows);
      } catch (e) {
        if (!cancelled) toast.error(e.message || "Failed to load intents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white p-6 dark:bg-gray-dark">
      <h2 className="mb-4 text-body-2xlg font-bold text-dark dark:text-white">
        Intents
      </h2>

      <SortTable
        columns={columns}
        data={data}
        loading={loading}
        tableRowClassNames={["text-base font-medium text-dark dark:text-white"]}
      />
    </div>
  );
}
