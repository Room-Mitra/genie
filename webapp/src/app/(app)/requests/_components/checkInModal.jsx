import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import { ArrowLeftEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { DateTime } from "@/components/ui/datetime";
import InputGroup from "@/components/FormElements/InputGroup";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { combineToUTC } from "@/lib/format-message-time";
import { toast } from "react-toastify";

async function checkIn(bookingData) {
  const res = await fetch(`/api/booking/check-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookingData),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to check in guest");
  }
  return await res.json();
}

export function CheckInModal({ room, requestId, onClose, showModal }) {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("13:00");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("11:00");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [creating, setCreating] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      checkInDate &&
      checkInTime &&
      checkOutDate &&
      checkOutTime &&
      room &&
      firstName &&
      lastName &&
      mobileNumber &&
      !creating
    );
  }, [
    checkInDate,
    checkInTime,
    checkOutDate,
    checkOutTime,
    room,
    firstName,
    lastName,
    mobileNumber,
    creating,
  ]);

  function resetForm() {
    setCheckInDate("");
    setCheckInTime("13:00");
    setCheckOutDate("");
    setCheckOutTime("11:00");
    setFirstName("");
    setLastName("");
    setMobileNumber("");
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setCreating(true);
    try {
      const data = {
        checkInTime: combineToUTC(checkInDate, checkInTime),
        checkOutTime: combineToUTC(checkOutDate, checkOutTime),
        roomId: room.roomId,
        requestId,
        guest: {
          firstName: firstName,
          lastName: lastName,
          mobileNumber: mobileNumber,
        },
      };

      const booking = await checkIn(data);

      toast.success(
        `Guest checked in with booking ${booking.bookingId.slice(0, 6)}`,
      );
      resetForm();
      onClose(true);
    } catch (err) {
      toast.error(err?.message || "Failed to create booking");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <Dialog
        open={showModal}
        onClose={() => onClose()}
        className="relative z-40"
      >
        <DialogBackdrop
          transition
          className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in fixed inset-0 bg-gray-900/80 transition-opacity"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95 relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all sm:my-8 sm:max-w-3xl"
            >
              <form onSubmit={handleCheckIn} className="grid grid-cols-1">
                <div className="overflow-auto bg-white dark:bg-gray-800">
                  <div className="bg-gray-200 text-dark dark:bg-gray-900 sm:p-5">
                    <div className="flex flex-row p-3 sm:p-0">
                      <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10">
                        <ArrowLeftEndOnRectangleIcon
                          aria-hidden="true"
                          className="size-6 text-orange-500"
                        />
                      </div>
                      <div className="mx-3 flex w-full items-center align-middle">
                        <div className="grid w-full grid-cols-2 justify-between gap-4">
                          <DialogTitle
                            as="h3"
                            className="text-base font-semibold text-dark dark:text-white"
                          >
                            Check In Guest
                          </DialogTitle>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 text-center">
                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <InputGroup
                        type="date"
                        label="Check in"
                        name="checkinDate"
                        value={checkInDate}
                        handleChange={(e) => setCheckInDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />

                      <InputGroup
                        type="time"
                        label="&nbsp;"
                        name="checkinTime"
                        value={checkInTime}
                        handleChange={(e) => setCheckInTime(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />

                      <InputGroup
                        type="date"
                        label="Check out"
                        name="checkoutDate"
                        value={checkOutDate}
                        handleChange={(e) => setCheckOutDate(e.target.value)}
                        min={checkInDate || undefined}
                        required
                      />

                      <InputGroup
                        type="time"
                        label="&nbsp;"
                        name="checkoutTime"
                        value={checkOutTime}
                        handleChange={(e) => setCheckOutTime(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>

                    <hr className="my-5" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <InputGroup
                        required
                        type="text"
                        name="firstName"
                        label="First Name"
                        placeholder="Kiran"
                        value={firstName}
                        handleChange={(e) => setFirstName(e.target.value)}
                      />

                      <InputGroup
                        required
                        type="text"
                        name="lastName"
                        label="Last Name"
                        placeholder="Kumar"
                        value={lastName}
                        handleChange={(e) => setLastName(e.target.value)}
                      />

                      <InputGroup
                        type="tel"
                        name="mobile"
                        label="Mobile"
                        placeholder="9910203040"
                        value={mobileNumber}
                        handleChange={(e) =>
                          setMobileNumber(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
                        required
                      />
                    </div>

                    <hr className="my-5" />

                    {/* Summary */}
                    <div className="rounded-2xl border border-gray-700 p-4 text-dark dark:text-white">
                      <h3 className="text-md mb-3 font-semibold">Summary</h3>
                      <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
                        <div className="text-md">
                          <span>Check in:</span>{" "}
                          <span className="font-semibold">
                            {(checkInDate && checkInTime && (
                              <DateTime
                                dateTimeIso={combineToUTC(
                                  checkInDate,
                                  checkInTime,
                                )}
                              />
                            )) ||
                              "—"}
                          </span>
                        </div>
                        <div className="text-md">
                          <span>Check out:</span>{" "}
                          <span className="font-semibold">
                            {(checkOutDate && checkOutTime && (
                              <DateTime
                                dateTimeIso={combineToUTC(
                                  checkOutDate,
                                  checkOutTime,
                                )}
                              />
                            )) ||
                              "—"}
                          </span>
                        </div>
                        <div className="text-md">
                          <span>Room:</span>{" "}
                          <span className="font-semibold">
                            {room ? `#${room.number} (${room.type})` : "—"}
                          </span>
                        </div>
                        <div className="text-md">
                          <span>Guest:</span>{" "}
                          {!firstName && !lastName && !mobileNumber ? (
                            <span className="font-semibold">{"—"} </span>
                          ) : (
                            <span className="font-semibold">
                              {firstName} {lastName}{" "}
                              {mobileNumber && `(${mobileNumber})`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 gap-2 bg-gray-300 px-4 py-3 dark:bg-gray-700/25 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        "rounded-md px-4 py-2 text-sm font-medium",
                        canSubmit
                          ? "bg-indigo-600 text-white hover:bg-indigo-500"
                          : "cursor-not-allowed bg-gray-700 text-gray-400",
                      )}
                    >
                      {creating ? "Checking In..." : "Check In Guest"}
                    </button>

                    <button
                      type="button"
                      data-autofocus
                      onClick={(e) => {
                        resetForm();
                        onClose();
                      }}
                      className="inset-ring inset-ring-white/5 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold hover:bg-white/20 dark:bg-white/10 dark:text-white sm:mt-0 sm:w-auto"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </form>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
