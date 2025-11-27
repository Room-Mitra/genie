'use client';

export function TryVoiceAgent() {
  return (
    <>
      <div className="flex justify-center font-medium text-sm pt-6 pb-10">
        <button
          className="flex items-center cta-btn py-2.5 px-4 rounded-full duration-150"
          onClick={() => {
            /* eslint-disable-next-line no-undef */
            RoomMitraWidget.open();
          }}
        >
          Try the Web Voice Agent
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
