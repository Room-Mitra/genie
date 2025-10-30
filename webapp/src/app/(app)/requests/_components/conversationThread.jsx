// ConversationThread.jsx
import { Avatar } from "@/components/Avatar/avatar";
import { formatMessageTime } from "@/lib/format-message-time";
import { cn } from "@/lib/utils";
import React, { useMemo } from "react";

/**
 * Message shape:
 * {
 *   id: string,
 *   content: string,
 *   createdAt: string | Date, // ISO ok
 *   author: {
 *     type: 'guest' | 'assistant',
 *     name: string,
 *     avatarUrl?: string
 *   }
 * }
 */
export default function ConversationThread({ messages = [], guest }) {
  const items = useMemo(
    () =>
      [...messages]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((m) => ({ ...m })),
    [messages],
  );

  const fullName = useMemo(
    () => `${guest?.firstName || ""} ${guest?.lastName || ""}`.trim(),
    [guest],
  );
  return (
    <div className="w-full space-y-4 ">
      {items.map((msg) => {
        const isGuest = msg.role === "user";

        return (
          <div key={msg.messageId} className="space-y-2">
            <div
              className={cn(
                "flex items-start gap-3 py-2",
                isGuest ? "justify-start" : "justify-end",
              )}
            >
              {/* Left avatar for guest, right avatar for assistant */}
              {isGuest && (
                <Avatar
                  name={fullName}
                  fallback={"G"}
                  url={guest?.profileImage?.url}
                  size={36}
                />
              )}

              <div className={["max-w-[78%] sm:max-w-[70%]"].join(" ")}>
                <div
                  className={[
                    "rounded-2xl px-3 py-2 shadow-sm",
                    "whitespace-pre-wrap break-words",
                    isGuest
                      ? "border border-gray-200 bg-white text-gray-900"
                      : "bg-indigo-600 text-white",
                  ].join(" ")}
                >
                  {/* Header with name (guest only) */}

                  <div
                    className={cn(
                      "mb-1 text-sm font-semibold",
                      isGuest && "text-gray-700",
                    )}
                  >
                    {isGuest ? fullName || "Guest" : "Room Mitra"}
                  </div>

                  <div className="text-md leading-relaxed">{msg.content}</div>
                </div>

                <div
                  className={[
                    "mt-1 text-[11px] leading-none text-gray-500",
                    isGuest ? "text-left" : "text-right",
                  ].join(" ")}
                >
                  {formatMessageTime(msg.createdAt)}
                </div>
              </div>

              {!isGuest && (
                <Avatar
                  name="Room Mitra"
                  url={"/images/room-mitra-square-logo.png"}
                  fallback="RM"
                  size={36}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


