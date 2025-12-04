export function summarizeConciergeServices(conciergeServices) {
  return {
    prompt: `
    The summary field contains tabular data of the concierge services.
    The header key has the column nammes.
    The rows key has the individual rows of data
    `,
    summary: {
      headers: ['title', 'description'],
      rows: conciergeServices?.map((a) => [a.title, a.description]),
    },
  };
}
