import Image from "next/image";

export function Order({ items = [], instructions }) {
  if (!items?.length) return null;

  return (
    <div className="flex w-full flex-col gap-1 text-xs sm:w-[260px] sm:text-sm md:w-[300px]">
      {items.map((i, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Thumbnail */}
          <div className="relative h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
            <Image
              // i?.image?.url
              src={`/images/food-placeholder.webp`}
              alt={i.name}
              fill
              sizes="40px"
              className="rounded object-cover"
            />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div
              className="truncate font-medium text-gray-900 dark:text-gray-100"
              title={i.name}
            >
              {i.name}
            </div>

            <div className="flex items-center gap-1 truncate text-[11px] text-gray-600 dark:text-gray-400 sm:text-xs">
              <span>×{i.quantity}</span>
              {i.notes && (
                <span className="truncate italic" title={i.notes}>
                  ({i.notes})
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {instructions && (
        <div
          className="mt-1 truncate text-[11px] italic text-gray-600 dark:text-gray-400 sm:text-xs"
          title={instructions}
        >
          “{instructions}”
        </div>
      )}
    </div>
  );
}
