export function amenityResponse(amenity) {
  if (!amenity) return null;

  const { amenityId, title, description, image } = amenity;
  return {
    amenityId,
    title,
    description,
    image,
  };
}
