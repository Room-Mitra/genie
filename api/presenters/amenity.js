export function amenityOrConciergeResponse(ac) {
  if (!ac) return null;

  const { title, description, headerImage } = ac;
  const ret = {
    title,
    description,
    headerImage,
  };

  if (ac.amenityId) ret['amenityId'] = ac.amenityId;
  if (ac.serviceId) ret['serviceId'] = ac.serviceId;

  return ret;
}
