"use client";

import { useMemo, useState } from "react";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { toast } from "react-toastify";
import { cn, toTitleCaseFromSnake } from "@/lib/utils";
import { ImageUpload } from "@/components/Upload/upload";

export function FacilityUploadForm({ onCancel, entityType, refresh }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const canSubmit = useMemo(() => {
    return file && title && description && !uploading;
  }, [file, title, description, uploading]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) {
      alert("Please select an image before saving.");
      return;
    }
    setUploading(true);
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("image", file);

    try {
      const endpoint = {
        AMENITY: "amenities",
        CONCIERGE: "concierge",
      };
      const res = await fetch(`/api/hotel/${endpoint[entityType]}`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }

      setFile(null);
      setTitle("");
      setDescription("");
      toast.success(`${toTitleCaseFromSnake(entityType)} added!`);

      if (onCancel) onCancel();
      if (refresh) refresh();
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <form onSubmit={onSubmit}>
        <div className="mb-5.5 flex flex-col gap-5 sm:flex-row">
          <div className="mt-10 w-full sm:w-[33%]">
            <ImageUpload aspectRatio = {"4 / 1"} onFileSelected={(f) => setFile(f)} />
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
              handleChange={(e) => setTitle(e.target.value)} // support either prop name
            />

            <TextAreaGroup
              name="description"
              label="Description"
              placeholder="Avail world class gym facilities on site"
              value={description}
              handleChange={(e) => setDescription(e.target.value)}
              required
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
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium",
              canSubmit
                ? "bg-indigo-600 text-white hover:bg-indigo-500"
                : "cursor-not-allowed bg-gray-700 text-gray-400",
            )}
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
