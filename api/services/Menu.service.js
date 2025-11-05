import { queryMenuByHotel } from '#repositories/Menu.repository.js';

// type FetchArgs = {
//   hotelId: string;
//   sections?: string[];
//   query?: string;
//   topK?: number;
//   withSectionsSummary?: boolean;
// };

// Given: availableSectionNames from DB, and modelSections from tool args
export function pickValidSections(availableSectionNames, modelSections) {
  if (!modelSections?.length) return [];

  // 1) Build normalization helpers
  const norm = (s) => s.trim().toLowerCase();

  // Optional: small alias map for common variants
  const aliases = new Map([
    ['soup', 'soups'],
    ['starter', 'starters'], // if you have "Starters"
    ['dessert', 'desserts'],
    ['drink', 'beverages'], // if your section is "Beverages"
  ]);

  const availNorm = new Map(); // norm -> canonical
  for (const sec of availableSectionNames) {
    availNorm.set(norm(sec), sec);
  }

  const resolved = [];
  for (const raw of modelSections) {
    const n = norm(raw);
    // exact normalized
    if (availNorm.has(n)) {
      resolved.push(availNorm.get(n));
      continue;
    }
    // alias normalized
    if (aliases.has(n)) {
      const aliasNorm = aliases.get(n);
      if (availNorm.has(aliasNorm)) {
        resolved.push(availNorm.get(aliasNorm));
      }
    }
    // otherwise: ignore silently; the model may ask for a non-existent section
  }

  // De-dup while preserving order
  return [...new Set(resolved)];
}

export async function handleFetchMenu({ hotelId, args }) {
  const { mode, sections } = args;
  const topK = Math.min(Math.max(args.topK ?? 20, 1), 50);

  const availableSections = await getAvailableSections({ hotelId, withSamples: true });
  const availableSectionNames = availableSections.map((s) => s.name);
  const menuVersion = await getMenuVersion({ hotelId });

  function getSummary() {
    // counts + tiny sample to keep tokens low
    const perSectionCounts = new Map(availableSections.map((s) => [s.name, s.count]));
    const samples = new Map(
      availableSections.map((s) => [s.name, s.items.map((i) => i.name)].slice(0, 3))
    );

    return {
      type: 'summary',
      menuVersion: menuVersion,
      available_sections: availableSectionNames,
      counts: Object.fromEntries(perSectionCounts),
      sample: Object.fromEntries(samples),
    };
  }

  // 1) Sections-only response by default
  if (mode === 'sections' && !sections?.length) {
    return getSummary();
  }

  // 2) Items mode with sections or query
  let items = [];
  const menu = await queryMenuByHotel({});
  if (sections?.length) {
    // Normalize helper (optional)
    const norm = (s) => (s ?? '').trim().toLowerCase();

    const chosenNames = new Set(
      (pickValidSections(availableSectionNames, sections) || []).map(norm)
    );

    items = (menu?.sections ?? [])
      .filter((s) => chosenNames.has(norm(s?.name)) && Array.isArray(s?.items))
      .flatMap((s) => {
        const randomItems = sample(s.items, Math.min(topK, s.items.length));
        return randomItems.map((i) => ({
          itemId: i.itemId,
          description: i.description,
          name: i.name,
          section: s.name,
        }));
      });
  } else {
    // Safety: if model asked mode=items without sections or query, do NOT send all items
    // Fall back to sections summary
    return getSummary();
  }

  return {
    type: 'results',
    menuVersion: menuVersion,
    available_sections: availableSectionNames,
    items: items,
  };
}

export async function getAvailableSections({ hotelId, withSamples = false }) {
  const menu = await queryMenuByHotel({ hotelId });
  return menu?.sections?.map((s) => ({
    name: s.name,
    description: s.description,
    count: s.items.length,
    available: true,
    items: withSamples ? sample(s.items, 5) : [],
  }));
}

export async function getItemsOnMenu({ hotelId }) {
  const menu = await queryMenuByHotel({ hotelId });
  return (menu?.sections ?? [])
    .filter((s) => Array.isArray(s?.items))
    .flatMap((s) => {
      return s?.items.map((i) => ({
        itemId: i.itemId,
        name: i.name,
        unitPrice: i.unitPrice,
        description: i.description,
        image: i.image,
        available: true,
        section: s.name,
      }));
    });
}

function getMenuVersion({ hotelId }) {
  return 'v1';
}

/**
 * Randomly samples `n` elements from an array.
 * If n is not specified, returns a single random element.
 */
function sample(array, n = 1) {
  if (!Array.isArray(array) || array.length === 0) return [];
  if (n === 1) {
    return array[Math.floor(Math.random() * array.length)];
  }

  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, array.length));
}
