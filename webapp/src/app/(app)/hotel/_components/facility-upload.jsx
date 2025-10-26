"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UploadIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";

export function FacilityUploadForm({ onCancel }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

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

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select an image before saving.");
      return;
    }
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("image", file);

    try {
      const res = await fetch("/api/facilities/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }
      const data = await res.json();
      // data.imageUrl will be a stubbed URL from the API route
      alert(`Uploaded! Title: ${data.title}\nImage URL: ${data.imageUrl}`);
      // reset
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error(err);
      alert(err?.message || "Something went wrong");
    }
  }

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <form onSubmit={onSubmit}>
        <div className="mb-5.5 flex flex-col gap-5 sm:flex-row">
          {/* Upload / Preview panel */}
          <div className="mt-1 w-full sm:w-[33%]">
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
                  isDragging
                    ? "border-primary bg-gray-1/50 dark:bg-dark-2/60"
                    : "",
                ].join(" ")}
              >
                <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                  <UploadIcon />
                </div>

                <p className="mt-2.5 text-body-sm font-medium">
                  <span className="text-primary">Click to upload</span> or drag
                  and drop
                </p>

                <p className="mt-1 text-body-xs">
                  PNG, JPG, GIF or WEBP (recommended up to 2000px)
                </p>
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-stroke dark:border-dark-3">
                <div className="relative h-64 w-full">
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
                    onClick={() => setFile(null)}
                    className="rounded-md px-3 py-1 text-sm font-medium text-dark hover:bg-gray-2 dark:text-white dark:hover:bg-dark-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title / Description fields */}
          <div className="grid w-full gap-4 sm:ml-8 sm:w-[66%]">
            <InputGroup
              type="text"
              name="title"
              label="Title"
              placeholder="Fitness Center"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              handleChange={(e) => setTitle(e.target.value)} // support either prop name
            />

            <TextAreaGroup
              name="description"
              label="Description"
              placeholder="Avail world class gym facilities on site"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              handleChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
