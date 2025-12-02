import { CheckIcon } from "@/assets/icons";
import { CopyIcon } from "lucide-react";
import { useState } from "react";

export function CopySnippetButton({ snippet, noToolTip }) {
  const handleCopySnippet = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const [copied, setCopied] = useState(false);

  return (
    <div className="group relative inline-block">
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <CopyIcon
          width={16}
          height={16}
          className="cursor-pointer text-black/90 hover:text-black/40 dark:text-white dark:hover:text-white/60"
          onClick={handleCopySnippet}
        />
      )}

      {/* Tooltip */}
      {!noToolTip && (
        <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-200 group-hover:block group-hover:opacity-100">
          Copy Snippet
        </span>
      )}
    </div>
  );
}
