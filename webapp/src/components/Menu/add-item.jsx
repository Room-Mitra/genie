import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import InputGroup from "../FormElements/InputGroup";
import { TextAreaGroup } from "../FormElements/InputGroup/text-area";
import { MultiSelectGroup } from "../FormElements/multiSelect";
import CheckboxTwo from "../FormElements/Checkboxes/CheckboxTwo";
import { RadioInput } from "../FormElements/radio";
import { useMemo, useState } from "react";
import { ImageUpload } from "../Upload/upload";
import { cn } from "@/lib/utils";

const ALLERGEN_OPTIONS = [
  { label: "Gluten", value: "gluten" },
  { label: "Crustacean", value: "crustacean" },
  { label: "Egg", value: "egg" },
  { label: "Fish", value: "fish" },
  { label: "Peanuts", value: "peanuts" },
  { label: "Soya", value: "soya" },
  { label: "Milk", value: "milk" },
  { label: "Nuts", value: "nuts" },
  { label: "Celery", value: "celery" },
  { label: "Mustard", value: "mustard" },
  { label: "Sesame", value: "sesame" },
  { label: "Sulphite", value: "sulphite" },
  { label: "Shellfish", value: "shellfish" },
  { label: "Lupins", value: "lupins" },
];

export function AddItemModal({ item, onClose, showModal }) {
  const [menuId, setMenuId] = useState(null);
  const [menu, setMenu] = useState(null);
  const [newMenuName, setNewMenuName] = useState("My Restaurant Menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [itemForm, setItemForm] = useState({
    name: "",
    unitPrice: "0.00",
    description: "",
    allergens: "",
    calories: "",
    veg: false,
    vegan: false,
    glutenFree: false,
    spicyLevel: 0,
    available: true,
    imageFile: null,
  });

  const [savingItem, setSavingItem] = useState(false);

  const canSubmitItem = useMemo(() => {
    return (
      itemForm.name && itemForm.unitPrice && itemForm.imageFile && !savingItem
    );
  }, [itemForm, savingItem]);

  async function handleSaveNewItem() {
    if (!activeSectionId) return;

    let uploaded = { url: "" };
    if (itemForm.imageFile) {
      uploaded = await apiUploadImage(itemForm.imageFile);
    }

    const allergens = (itemForm.allergens || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await updateMenu((m) => {
      const sec = m.sections.find((x) => x.id === activeSectionId);
      if (!sec) return m;
      sec.items.push({
        id: uid("itm_"),
        name: itemForm.name || "Untitled",
        description: itemForm.description || "",
        unitPrice: itemForm.unitPrice || "0.00",
        image: { url: uploaded.url || "" },
        allergens,
        calories: itemForm.calories ? Number(itemForm.calories) : undefined,
        dietary: {
          veg: !!itemForm.veg,
          vegan: !!itemForm.vegan,
          glutenFree: !!itemForm.glutenFree,
        },
        spicyLevel: Math.max(0, Math.min(3, Number(itemForm.spicyLevel) || 0)),
        available: !!itemForm.available,
      });
      return m;
    });

    setIsAddItemOpen(false);
    setActiveSectionId(null);
  }

  return (
    <Dialog
      open={showModal}
      onClose={() => onClose()}
      className="relative z-50"
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl ring-1 ring-gray-800 dark:bg-gray-950">
            <DialogTitle className="text-lg font-semibold">
              Add Item
            </DialogTitle>

            <form onSubmit={handleSaveNewItem}>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InputGroup
                  required
                  height="sm"
                  type="text"
                  name="name"
                  label="Name"
                  placeholder="Pumpkin soup"
                  value={itemForm.name || ""}
                  handleChange={(e) =>
                    setItemForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
                <InputGroup
                  required
                  height="sm"
                  type="text"
                  name="unitPrice"
                  label="Unit Price"
                  placeholder="160.00"
                  value={itemForm.unitPrice || ""}
                  handleChange={(e) =>
                    setItemForm((f) => ({ ...f, unitPrice: e.target.value }))
                  }
                />

                <TextAreaGroup
                  className="col-span-1 sm:col-span-2"
                  name="description"
                  label="Description"
                  placeholder="Silky pumpkin soup with toasted seeds."
                  value={itemForm.description}
                  handleChange={(e) =>
                    setItemForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />

                <MultiSelectGroup
                  label="Allergens"
                  name="allergens"
                  options={ALLERGEN_OPTIONS}
                  value={itemForm.allergens}
                  onChange={(selectedOptions) => {
                    setItemForm((f) => ({
                      ...f,
                      allergens: selectedOptions.map((o) => o.value),
                    }));
                  }}
                  placeholder="Dairy, Gluten"
                  helperText="Choose one or more"
                />

                <InputGroup
                  height="sm"
                  type="text"
                  name="calories"
                  label="Calories"
                  placeholder="220"
                  value={itemForm.calories || ""}
                  handleChange={(e) =>
                    setItemForm((f) => ({ ...f, calories: e.target.value }))
                  }
                />

                <ImageUpload
                  aspectRatio={"1 / 1"}
                  onFileSelected={(fl) =>
                    setItemForm((f) => ({
                      ...f,
                      imageFile: fl,
                    }))
                  }
                />

                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4">
                    <CheckboxTwo
                      id={"veg"}
                      label={"Veg"}
                      value={itemForm.veg}
                      handleChange={(e) =>
                        setItemForm((f) => ({ ...f, veg: e.target.checked }))
                      }
                    />

                    <CheckboxTwo
                      id={"vegan"}
                      label={"Vegan"}
                      value={itemForm.vegan}
                      handleChange={(e) =>
                        setItemForm((f) => ({ ...f, vegan: e.target.checked }))
                      }
                    />

                    <CheckboxTwo
                      id={"glutenFree"}
                      label={"Gluten Free"}
                      value={itemForm.glutenFree}
                      handleChange={(e) =>
                        setItemForm((f) => ({
                          ...f,
                          glutenFree: e.target.checked,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="spiceLevel"
                      className="block pb-4 text-body-sm font-medium text-dark dark:text-white"
                    >
                      Spice Level
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <RadioInput
                        id="spiceLevel"
                        label="Mild"
                        name="spiceLevel"
                        value="mild"
                      />

                      <RadioInput
                        id="spiceLevel"
                        label="Medium"
                        name="spiceLevel"
                        value="medium"
                      />

                      <RadioInput
                        id="spiceLevel"
                        label="Spicy"
                        name="spiceLevel"
                        value="spicy"
                      />

                      <RadioInput
                        id="spiceLevel"
                        label="Extra Spicy"
                        name="spiceLevel"
                        value="extra_spicy"
                      />
                    </div>
                  </div>

                  <CheckboxTwo
                    id={"available"}
                    label={"Available"}
                    value={itemForm.available}
                    handleChange={(e) =>
                      setItemForm((f) => ({
                        ...f,
                        available: e.target.checked,
                      }))
                    }
                  />
                </div>
              </div>
            </form>

            <div className="mt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onClose()}
                className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-dark hover:bg-gray-300 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={cn(
                  "rounded-xl px-4 py-2 text-sm font-medium",
                  !canSubmitItem
                    ? "bg-gray-700 text-gray-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-500",
                )}
                disabled={!canSubmitItem}
              >
                {savingItem ? "Saving..." : "Save item"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
