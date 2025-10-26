export function conversationResponse(res) {
  if (!res) return null;

  const { converastionId } = res;

  return {
    converastionId,
  };
}
