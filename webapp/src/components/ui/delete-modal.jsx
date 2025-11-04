import {
  Dialog,
  DialogBackdrop,
  DialogTitle,
  DialogPanel,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function DeleteModal({
  onClose,
  showModal,
  onConfirmDelete,
  message,
  header,
}) {
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!showModal) setDeleting(false);
  }, [showModal]);

  return (
    <>
      <Dialog
        open={showModal}
        onClose={() => {
          setDeleting(false);
          onClose();
        }}
        className="relative z-40"
      >
        <DialogBackdrop
          transition
          className="data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in fixed inset-0 bg-gray-900/50 transition-opacity"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in data-closed:sm:translate-y-0 data-closed:sm:scale-95 relative transform overflow-hidden rounded-lg bg-gray-800 text-left shadow-xl outline -outline-offset-1 outline-white/10 transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div>
                <div className="max-h-180 overflow-auto bg-white dark:bg-gray-800">
                  <div className="bg-gray-200 text-dark dark:bg-gray-900 sm:p-5">
                    <div className="flex flex-row p-3 sm:p-0">
                      <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10">
                        <ExclamationTriangleIcon
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
                            {header}
                          </DialogTitle>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 text-center">{message}</div>
                </div>
                <div className="flex gap-3 bg-gray-300 px-4 py-3 dark:bg-gray-700/25 sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleting(true);
                      onConfirmDelete();
                    }}
                    className={cn(
                      "bg-indigo-600 text-white hover:bg-indigo-500",
                      "inset-ring inset-ring-white/5 mt-3 inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold sm:mt-0 sm:w-auto",
                    )}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    type="button"
                    data-autofocus
                    onClick={onClose}
                    className="inset-ring inset-ring-white/5 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold hover:bg-white/50 dark:bg-white/30 dark:text-white dark:hover:bg-white/50 sm:mt-0 sm:w-auto"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
