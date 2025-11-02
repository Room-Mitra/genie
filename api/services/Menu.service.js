import { keywordScore } from '#libs/ranking.js';
import { queryMenuByHotel } from '#repositories/Menu.repository.js';

// type FetchArgs = {
//   hotelId: string;
//   sections?: string[];
//   query?: string;
//   topK?: number;
//   withSectionsSummary?: boolean;
// };

export async function handleFetchMenu(args) {
  const { hotelId, sections, query, withSectionsSummary = true } = args;
  const topK = Math.min(Math.max(args.topK ?? 20, 1), 50);

  // 1) Get candidates
  const all = (await queryMenuByHotel({ hotelId, sections })).filter((i) => i.available !== false); // default to available if missing

  if (!query?.trim()) {
    // No query: return a compact section summary + a few popular items per section
    const bySection = {};
    for (const it of all) {
      (bySection[it.section] ||= []).push(it);
    }
    const sectionsOut = Object.entries(bySection).map(([name, items]) => ({
      name,
      count: items.length,
      items: items.slice(0, Math.min(8, topK)).map(minify),
    }));

    return {
      type: 'summary',
      menuVersion: all[0]?.menuVersion,
      sections: withSectionsSummary
        ? sectionsOut.map((s) => ({ name: s.name, count: s.count }))
        : undefined,
      sample: sectionsOut,
    };
  }

  // 2) Cheap keyword prefilter (keeps costs low)
  const withKw = all
    .map((it) => ({ it, s: keywordScore(query, it) }))
    .filter(({ s }) => s > 0 || all.length <= 300); // allow everything if menu small
  const kwCandidates = withKw.length
    ? withKw
        .sort((a, b) => b.s - a.s)
        .slice(0, 300)
        .map((x) => x.it)
    : all.slice(0, 300);

  let ranked = kwCandidates.slice(0, topK);

  return {
    type: 'results',
    menuVersion: ranked[0]?.menuVersion,
    totalConsidered: kwCandidates.length,
    items: ranked.map(minify),
  };
}

function minify(it) {
  return {
    itemId: it.itemId,
    section: it.section,
    name: it.name,
    unitPrice: it.unitPrice,
    dietary: it.dietary,
    imageUrl: it.imageUrl,
    tags: it.tags,
  };
}
