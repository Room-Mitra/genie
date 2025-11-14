import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { UploadIcon } from "@/assets/icons";

export function ImageUpload({ onFileSelected, aspectRatio }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState(null);

  // Create/revoke preview URL
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function onFilePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    setFile(f);
    onFileSelected(f);
  }

  function onDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Please drop a valid image file.");
      return;
    }
    setFile(f);
  }

  const aspectRatioRecommendation = {
    "4 / 1": "2000px (w) x 500px (h)",
    "1 / 1": "500px (w) x 500px (h)",
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name="profilePhoto"
        id="profilePhoto"
        accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
        hidden
        onChange={onFilePick}
      />

      {!previewUrl ? (
        <label
          htmlFor="profilePhoto"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={onDrop}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-5 rounded-xl border border-dashed p-4 sm:py-7.5",
            "border-gray-4 bg-gray-2 hover:border-primary",
            "dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary",
            isDragging ? "border-primary bg-gray-1/50 dark:bg-dark-2/60" : "",
          ].join(" ")}
        >
          <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
            <UploadIcon />
          </div>

          <p className="mt-2.5 text-body-sm font-medium">
            <span className="text-primary">Click to upload</span> or drag and
            drop
          </p>

          <p className="mt-1 text-center text-body-xs">
            PNG, JPG, GIF or WEBP, <br /> recommended{" "}
            {aspectRatioRecommendation[aspectRatio]}
          </p>
        </label>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-stroke dark:border-dark-3">
          <div className="relative w-full" style={{ aspectRatio }}>
            <Image
              src={previewUrl}
              alt="Selected facility"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
              priority
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-stroke p-2 dark:border-dark-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Change image
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                onFileSelected(null);
              }}
              className="rounded-md px-3 py-1 text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-2"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
