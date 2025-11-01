"use client";
import React, { useEffect, useMemo, useState } from "react";
import { ID } from "../ui/id";
import { Spinner } from "@material-tailwind/react";
import { AddItemModal } from "./add-item";

/* ------------------------------------------------------------------
   MOCK API (in-memory)
-------------------------------------------------------------------*/

async function apiUploadImage(file) {
  // mock “upload” delay
  await new Promise((r) => setTimeout(r, 500));
  // Return a blob URL so it actually displays; replace with real upload later
  return { url: URL.createObjectURL(file) };
}

const _memdb = {
  menus: [],
};

function uid(prefix = "") {
  return (
    prefix +
    Math.random().toString(36).slice(2, 7) +
    Date.now().toString(36).slice(4)
  );
}

async function apiCreateMenu({ name, currency = "INR" }) {
  const menu = {
    id: "01K8SRERF604E7KBJ7MYWJ3WEW",
    name,
    currency,
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  _memdb.menus.push(menu);
  return structuredClone(menu);
}

async function apiGetMenu(menuId) {
  const m = _memdb.menus.find((x) => x.id === menuId);
  if (!m) throw new Error("Menu not found");
  return structuredClone(m);
}

async function apiUpdateMenu(menuId, updater) {
  const idx = _memdb.menus.findIndex((x) => x.id === menuId);
  if (idx === -1) throw new Error("Menu not found");
  const before = _memdb.menus[idx];
  const after =
    typeof updater === "function" ? updater(structuredClone(before)) : updater;
  after.updatedAt = new Date().toISOString();
  _memdb.menus[idx] = after;
  return structuredClone(after);
}

/* ------------------------------------------------------------------
   UTIL
-------------------------------------------------------------------*/
function currencySymbol(curr) {
  if (curr === "INR") return "₹";
  if (curr === "USD") return "$";
  return curr + " ";
}

function moveIndex(arr, from, to) {
  const copy = arr.slice();
  const item = copy.splice(from, 1)[0];
  copy.splice(to, 0, item);
  return copy;
}

/* ------------------------------------------------------------------
   MAIN COMPONENT
-------------------------------------------------------------------*/
export default function MenuManager() {
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

  // seed one menu on first render for convenience
  useEffect(() => {
    (async () => {
      if (_memdb.menus.length === 0) {
        const m = await apiCreateMenu({ name: "Sample Menu", currency: "INR" });
        // add sample section and item
        await apiUpdateMenu(m.id, (current) => {
          current.sections.push({
            id: uid("sec_"),
            name: "Soups",
            items: [
              {
                id: uid("itm_"),
                name: "Pumpkin Soup",
                description: "Silky pumpkin soup with toasted seeds.",
                unitPrice: "160.00",
                image: {
                  url: "https://images.pexels.com/photos/1277483/pexels-photo-1277483.jpeg",
                },
                allergens: ["dairy"],
                calories: 220,
                dietary: { veg: true, vegan: false, glutenFree: true },
                spicyLevel: 1, // 0-3
                available: true,
              },
            ],
          });
          return current;
        });
      }
      const first = _memdb.menus[0];
      setMenuId(first.id);
      const fresh = await apiGetMenu(first.id);
      setMenu(fresh);
    })();
  }, []);

  async function handleCreateMenu(e) {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const created = await apiCreateMenu({
        name: newMenuName,
        currency: "INR",
      });
      setMenuId(created.id);
      setMenu(created);
    } catch (err) {
      setError(err?.message || "Failed to create menu");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    if (!menuId) return;
    const m = await apiGetMenu(menuId);
    setMenu(m);
  }

  async function updateMenu(mutator) {
    const updated = await apiUpdateMenu(menuId, mutator);
    setMenu(updated);
  }

  // SECTION actions
  async function addSection() {
    const name = prompt("Section name");
    if (!name) return;
    await updateMenu((m) => {
      m.sections.push({ id: uid("sec_"), name, items: [] });
      return m;
    });
  }

  async function renameSection(sectionId) {
    const sec = menu.sections.find((s) => s.id === sectionId);
    const name = prompt("New section name", sec?.name || "");
    if (!name) return;
    await updateMenu((m) => {
      const s = m.sections.find((x) => x.id === sectionId);
      if (s) s.name = name;
      return m;
    });
  }

  async function deleteSection(sectionId) {
    const ok = confirm("Delete this section and ALL items under it?");
    if (!ok) return;
    await updateMenu((m) => {
      m.sections = m.sections.filter((s) => s.id !== sectionId);
      return m;
    });
  }

  async function moveSection(sectionIndex, direction) {
    const to = direction === "up" ? sectionIndex - 1 : sectionIndex + 1;
    if (to < 0 || to >= menu.sections.length) return;
    await updateMenu((m) => {
      m.sections = moveIndex(m.sections, sectionIndex, to);
      return m;
    });
  }

  // ITEM actions
  function addItem(sectionId) {
    setActiveSectionId(sectionId);
    setItemForm({
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
    setIsAddItemOpen(true);
  }

  async function editItem(sectionId, itemId) {
    const s = menu.sections.find((x) => x.id === sectionId);
    const it = s?.items.find((x) => x.id === itemId);
    if (!it) return;

    const name = prompt("Item name", it.name) ?? it.name;
    const price = prompt("Unit price", it.unitPrice) ?? it.unitPrice;
    const desc =
      prompt("Description", it.description || "") ?? (it.description || "");
    const img =
      prompt("Image URL", it.image?.url || "") ?? (it.image?.url || "");
    const allergensStr = prompt(
      "Allergens (comma separated: dairy, nuts, gluten, soy, egg, shellfish)",
      it.allergens?.join(", ") || "",
    );
    const caloriesStr = prompt("Calories (kcal)", it.calories ?? "");
    const spicy =
      prompt("Spicy level (0-3)", String(it.spicyLevel ?? 0)) ??
      String(it.spicyLevel ?? 0);
    const veg = confirm("Is this Vegetarian? OK = yes, Cancel = no");
    const vegan = confirm("Is this Vegan? OK = yes, Cancel = no");
    const gf = confirm("Is this Gluten Free? OK = yes, Cancel = no");
    const avail = confirm("Mark as Available? OK = yes, Cancel = no");

    await updateMenu((m) => {
      const sec = m.sections.find((x) => x.id === sectionId);
      const item = sec?.items.find((x) => x.id === itemId);
      if (!item) return m;
      item.name = name;
      item.unitPrice = price;
      item.description = desc;
      item.image = { url: img };
      item.allergens = (allergensStr || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      item.calories = caloriesStr ? Number(caloriesStr) : undefined;
      item.spicyLevel = Math.max(0, Math.min(3, Number(spicy) || 0));
      item.dietary = { veg, vegan, glutenFree: gf };
      item.available = !!avail;
      return m;
    });
  }

  async function deleteItem(sectionId, itemId) {
    const ok = confirm("Delete this item?");
    if (!ok) return;
    await updateMenu((m) => {
      const sec = m.sections.find((x) => x.id === sectionId);
      if (!sec) return m;
      sec.items = sec.items.filter((i) => i.id !== itemId);
      return m;
    });
  }

  async function moveItem(sectionId, itemIndex, direction) {
    const s = menu.sections.find((x) => x.id === sectionId);
    if (!s) return;
    const to = direction === "up" ? itemIndex - 1 : itemIndex + 1;
    if (to < 0 || to >= s.items.length) return;
    await updateMenu((m) => {
      const sec = m.sections.find((x) => x.id === sectionId);
      sec.items = moveIndex(sec.items, itemIndex, to);
      return m;
    });
  }

  const currency = useMemo(
    () => currencySymbol(menu?.currency || "INR"),
    [menu],
  );

  return (
    <div className="mx-auto p-3">
      {/* current menu header */}
      {menu && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 p-6 dark:bg-gray-dark">
          <div className="space-y-1">
            <ID ulid={menu.id} />
            <div className="text-xs text-gray-400">
              Updated: {new Date(menu.updatedAt).toLocaleString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={addSection}
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              + Add Section
            </button>
            <button
              onClick={refresh}
              className="rounded border border-gray-700 px-3 py-1.5 text-sm text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* sections */}
      {!menu ? (
        <div className="text-gray-400">
          <Spinner />
        </div>
      ) : menu.sections.length === 0 ? (
        <div className="rounded border border-dashed border-gray-700 p-8 text-center text-gray-400">
          No sections yet. Click “Add Section”.
        </div>
      ) : (
        <div className="space-y-8">
          {menu.sections.map((sec, sIdx) => (
            <section
              key={sec.id}
              className="rounded-lg bg-white dark:bg-gray-dark"
            >
              <div className="flex items-center justify-between border-b-2 p-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold">{sec.name}</h2>
                  <span className="rounded bg-gray-300 px-2 py-0.5 text-xs text-dark dark:bg-gray-800 dark:text-gray-300">
                    {sec.items.length} item{sec.items.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSection(sIdx, "up")}
                    className="rounded border border-gray-700 px-2 py-1 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    ▲ Move Up
                  </button>
                  <button
                    onClick={() => moveSection(sIdx, "down")}
                    className="rounded border border-gray-700 px-2 py-1 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    ▼ Move Down
                  </button>
                  <button
                    onClick={() => renameSection(sec.id)}
                    className="rounded border border-gray-700 px-2 py-1 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => addItem(sec.id)}
                    className="rounded bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                  >
                    + Add Item
                  </button>
                  <button
                    onClick={() => deleteSection(sec.id)}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                  >
                    Delete Section
                  </button>
                </div>
              </div>

              {/* items grid */}
              {sec.items.length === 0 ? (
                <div className="p-6 text-sm text-gray-400">
                  No items in this section.
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sec.items.map((it, iIdx) => (
                    <li
                      key={it.id}
                      className="max-w-75 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-900"
                    >
                      <div className="relative aspect-square w-full">
                        {it.image?.url ? (
                          <img
                            src={it.image.url}
                            alt={it.name}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-gray-400">
                            No image
                          </div>
                        )}
                        {!it.available && (
                          <span className="absolute right-2 top-2 rounded bg-yellow-600/90 px-2 py-0.5 text-xs font-medium text-black">
                            Unavailable
                          </span>
                        )}
                      </div>
                      <div className="space-y-2 p-4 text-dark dark:text-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-semibold">
                              {it.name}
                            </h3>
                            <div className="mt-1 text-xs text-gray-800 dark:text-gray-300">
                              {it.dietary?.veg ? "Veg" : "Non-Veg"}
                              {it.dietary?.vegan ? " • Vegan" : ""}
                              {it.dietary?.glutenFree ? " • GF" : ""}
                              {typeof it.spicyLevel === "number"
                                ? " • " +
                                  "🌶".repeat(
                                    Math.max(0, Math.min(3, it.spicyLevel)),
                                  )
                                : ""}
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold">
                            {currency}
                            {it.unitPrice}
                          </div>
                        </div>
                        {it.description && (
                          <p className="text-sm text-gray-900 dark:text-gray-300">
                            {it.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {Array.isArray(it.allergens) &&
                            it.allergens.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1 text-xs text-white">
                                {it.allergens.map((al) => (
                                  <span
                                    key={al}
                                    className="rounded bg-stone-600 px-1.5 py-0.5"
                                  >
                                    {al}
                                  </span>
                                ))}
                              </div>
                            )}
                          {typeof it.calories === "number" && (
                            <span className="text-xs text-gray-800 dark:text-gray-400">
                              {it.calories} kcal
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => moveItem(sec.id, iIdx, "up")}
                              className="rounded border border-gray-700 px-2 py-1 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveItem(sec.id, iIdx, "down")}
                              className="rounded border border-gray-700 px-2 py-1 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              ▼
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => editItem(sec.id, it.id)}
                              className="rounded border border-gray-700 px-3 py-1.5 text-xs text-dark hover:bg-gray-300 dark:text-gray-200 dark:hover:bg-gray-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem(sec.id, it.id)}
                              className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        showModal={isAddItemOpen}
        onClose={() => {
          setIsAddItemOpen(false);
        }}
        item={itemForm}
      />
    </div>
  );
}
