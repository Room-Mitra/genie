export function summarizeAmenities(amenities) {
  return {
    prompt: `
    The summary field contains tabular data of the amenities.
    The header key has the column nammes.
    The rows key has the individual rows of data
    `,
    summary: {
      headers: ['title', 'description', 'imageUrl'],
      rows: amenities?.map((a) => [a.title, a.description, a.headerImage.url]),
    },
  };
}
