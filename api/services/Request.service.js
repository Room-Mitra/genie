import * as requestRepo from '#repositories/Request.repository.js';

export async function listRequests({ bookingId }) {
  const requests = await requestRepo.queryRequestsForBooking({ bookingId });
  return {
    items: requests,
    count: requests.length,
  };
}
