import { UploadIcon } from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import Image from "next/image";

export function FacilityUploadForm({ onCancel }) {
  return (
    <div className="rounded-[10px] bg-white p-6 dark:bg-gray-dark">
      <form>
        <div className="mb-5.5 flex flex-col gap-5 sm:flex-row">
          <div className="mt-9 h-[50%] w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary sm:w-[33%]">
            <input
              type="file"
              name="profilePhoto"
              id="profilePhoto"
              accept="image/png, image/jpg, image/jpeg"
              hidden
            />

            <label
              htmlFor="profilePhoto"
              className="flex cursor-pointer flex-col items-center justify-center gap-5 p-4 sm:py-7.5"
            >
              <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                <UploadIcon />
              </div>

              <p className="mt-2.5 text-body-sm font-medium">
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>

              <p className="mt-1 text-body-xs">
                SVG, PNG, JPG or GIF (max, 800 X 800px)
              </p>
            </label>
          </div>

          <div className="grid w-[66%] gap-4 sm:ml-8">
            <InputGroup
              type="text"
              name="title"
              label="Title"
              placeholder="Fitness Center"
              required
              // handleChange={(e) => setHotelName(e.target.value)}
              // value={hotelName}
            />

            <TextAreaGroup
              label="Description"
              placeholder="Avail world class gym facilities on site"
              // handleChange={(e) => setNote(e.target.value)}
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
