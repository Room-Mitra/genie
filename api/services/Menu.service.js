import { queryMenuByHotel } from '#repositories/Menu.repository.js';

function normalizeText(input) {
  if (!input) return '';
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9\s]/g, ' ') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input) {
  if (!input) return [];
  return input.split(' ').filter(Boolean);
}

/**
 * Very simple relevance score.
 * Higher is better.
 */
function computeRelevanceScore(query, text) {
  const q = normalizeText(query);
  const t = normalizeText(text);
  if (!q || !t) return 0;

  if (t === q) return 10;
  if (t.startsWith(q)) return 8;
  if (t.includes(q)) return 6;

  const qTokens = tokenize(q);
  const tTokens = tokenize(t);

  if (!qTokens.length || !tTokens.length) return 0;

  const tSet = new Set(tTokens);
  const intersection = qTokens.filter((token) => tSet.has(token));
  if (!intersection.length) return 0;

  const unionSize = new Set([...qTokens, ...tTokens]).size;
  const jaccard = intersection.length / unionSize; // between 0 and 1

  return jaccard * 5; // scale up a bit
}

export async function handleFetchMenuItems({ hotelId, args }) {
  const {
    searchText,
    cuisines,
    categories,
    veganOnly,
    vegOnly,
    glutenFree,
    excludeAllergens,
    includeUnavailable,
    maxItems = 50,
  } = args;

  const menu = await queryMenuByHotel({ hotelId });
  if (!menu || !menu.sections || menu.sections.length === 0) {
    return { items: [] };
  }

  // 1. Flatten sections + items into a list with section context
  const flattened = [];
  for (const section of menu.sections) {
    for (const item of section.items || []) {
      flattened.push({ item, section });
    }
  }

  // 2. Apply basic filters (cuisines, categories, vegOnly, availability)
  let filtered = flattened.filter(({ item }) => {
    // vegOnly filter
    if (veganOnly) {
      return item.vegan;
    }

    if (vegOnly) {
      return item.veg;
    }

    if (glutenFree) {
      return item.glutenFree;
    }

    if (excludeAllergens && excludeAllergens.length > 0) {
      const itemAllergens = (item.allergens || []).map((a) => a.toLowerCase());
      const notWanted = excludeAllergens.map((a) => a.toLowerCase());
      const hasOverlap = notWanted.some((a) => itemAllergens.includes(a));
      if (hasOverlap) return false;
    }

    // cuisines filter
    if (cuisines && cuisines.length > 0) {
      const itemCuisines = (item.cuisines || []).map((c) => c.toLowerCase());
      const wanted = cuisines.map((c) => c.toLowerCase());
      const hasOverlap = wanted.some((c) => itemCuisines.includes(c));
      if (!hasOverlap) return false;
    }

    // categories filter
    if (categories && categories.length > 0) {
      // normalize requested categories
      const wanted = categories.map((c) => c.toLowerCase());

      // normalize item categories
      let itemCategories = [];

      if (Array.isArray(item.categories)) {
        itemCategories = item.categories.map((c) => c.toLowerCase());
      }

      // check if ANY category matches
      const matches = itemCategories.some((cat) => wanted.includes(cat));

      if (!matches) {
        return false;
      }
    }

    // availability filter
    if (!includeUnavailable) {
      if (item?.available === false) return false;
    }

    return true;
  });

  // 3. If no searchText, just return filtered items truncated
  if (!searchText || !searchText.trim()) {
    const limited = filtered.slice(0, maxItems);
    return limited.map(toDTO);
  }

  // 4. Apply fuzzy-ish search over item + section
  const scored = [];

  for (const entry of filtered) {
    const { item, section } = entry;
    let score = 0;

    score += computeRelevanceScore(searchText, item.name);
    if (item.description) {
      score += computeRelevanceScore(searchText, item.description) * 0.8;
    }
    if (section.name) {
      score += computeRelevanceScore(searchText, section.name) * 0.7;
    }
    if (section.description) {
      score += computeRelevanceScore(searchText, section.description) * 0.5;
    }

    if (score > 0) {
      scored.push({ entry, score });
    }
  }

  // If no matches from fuzzy search, fall back to filtered with no search
  if (scored.length === 0) {
    const limited = filtered.slice(0, maxItems);
    return limited.map(toDTO);
  }

  scored.sort((a, b) => b.score - a.score);

  const limited = scored.slice(0, maxItems).map((s) => s.entry);
  return limited.map(toDTO);
}

function toDTO({ item }) {
  return {
    itemId: item.itemId,
    name: item.name,
    unitPrice: item.unitPrice,
    description: item.description,
    category: item.category,
    cuisines: item.cuisines,
    veg: item.veg,
    vegan: item.vegan,
    glutenFree: item.glutenFree,
    price: item.price,
    available: item.available !== false,
  };
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

export async function handleFetchMenuSections({ hotelId, args }) {
  const menu = await queryMenuByHotel({ hotelId });
  return menu?.sections
    ?.map((s) => ({
      name: s.name,
      description: s.description,
      count: s.items.length,
      items: sample(s.items, Math.min(s.items.length, args.itemsPerSection)),
    }))
    .sort(() => 0.5 - Math.random());
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
