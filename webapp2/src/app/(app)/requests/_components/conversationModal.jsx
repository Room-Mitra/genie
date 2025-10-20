"use client";
import { useActionState } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@material-tailwind/react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export default function ConversationModal({ getConversation, roomId }) {
  const [state, formAction, isPending] = useActionState(getConversation, []);

  const [open, setOpen] = useState(false);

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="roomId" value={roomId} />
        <button
          type="submit"
          disabled={isPending}
          onClick={() => setOpen(true)}
          className="bg-primary text-white p-2 rounded-lg dark:bg-indigo-800 hover:bg-primary/80 hover:dark:bg-indigo-900"
        >
          {isPending ? "Loading..." : "View Conversation"}
        </button>
      </form>

      <div>
        <Dialog open={open} onClose={setOpen} className="relative z-40">
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
                {isPending ? (
                  <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                    <Spinner className="mx-auto" />
                  </div>
                ) : (
                  <div>
                    <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                      <div className="sm:flex sm:items-start">
                        <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-300/20 sm:mx-0 sm:size-10">
                          <ChatBubbleLeftRightIcon
                            aria-hidden="true"
                            className="size-6 text-yellow-300"
                          />
                        </div>
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                          <DialogTitle
                            as="h3"
                            className="text-base font-semibold text-dark dark:text-white"
                          >
                            Conversation Log
                          </DialogTitle>
                          <div className="mt-2">
                            <Table>
                              <TableBody>
                                {state?.length > 0 &&
                                  state.map((log, i) => (
                                    <TableRow key={i}>
                                      <TableCell className="text-lg font-medium">
                                        {log.role}
                                      </TableCell>
                                      <TableCell className="text-lg font-medium">
                                        {log.content}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-300 px-4 py-3 dark:bg-gray-700/25 sm:flex sm:flex-row-reverse sm:px-6">
                      <button
                        type="button"
                        data-autofocus
                        onClick={() => setOpen(false)}
                        className="inset-ring inset-ring-white/5 mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold hover:bg-white/20 dark:bg-white/10 dark:text-white sm:mt-0 sm:w-auto"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      </div>
    </>
  );
}
