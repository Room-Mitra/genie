import { listHotels } from '#services/Hotel.service.js';
import {
  queryRequestsByStatusType,
  updateRequestStatusWithLog,
} from '#repositories/Request.repository.js';
import { ActiveRequestStatuses, RequestStatus } from '#Constants/statuses.constants.js';

// Optional: tune this if you want fewer requests per page
const PAGE_LIMIT = 500;

/**
 * For every hotel:
 *   1. Fetch all ACTIVE requests (paginated).
 *   2. For each request whose estimatedTimeOfFulfillment has passed,
 *      set status to DELAYED via updateRequestStatusWithLog.
 */
export async function checkDelayedRequests() {
  const hotels = await listHotels({});

  if (!hotels || hotels.count === 0) {
    console.log('[checkDelayedRequests] No hotels found, exiting');
    return;
  }

  const now = new Date();

  await Promise.all(
    hotels.items.map(async (hotel) => {
      // Adapt to your hotel shape
      const hotelId = hotel.hotelId;
      if (!hotelId) {
        console.warn('[checkDelayedRequests] Hotel without id, skipping', hotel);
        return;
      }

      console.log(`[checkDelayedRequests] Processing hotel ${hotelId} (${hotel.name || ''})`);

      let nextToken = undefined;

      do {
        let page;
        try {
          page = await queryRequestsByStatusType({
            hotelId,
            statusType: 'ACTIVE',
            limit: PAGE_LIMIT,
            nextToken,
          });
        } catch (err) {
          console.error(
            `[checkDelayedRequests] Failed to query ACTIVE requests for hotel ${hotelId}`,
            err
          );
          return;
        }

        const requests = page?.items || page?.requests || [];
        nextToken = page?.nextToken;

        if (!requests.length) continue;

        // Find ACTIVE requests whose ETA has passed
        const toDelay = requests.filter((request) => {
          const eta = request.estimatedTimeOfFulfillment;
          if (!eta) return false;

          const etaDate = new Date(eta);
          if (Number.isNaN(etaDate.getTime())) return false;

          // Only touch ACTIVE ones, just to be safe
          const status = request.status || request.statusType;
          return (
            ActiveRequestStatuses.includes(status) &&
            etaDate < now &&
            status !== RequestStatus.DELAYED
          );
        });

        if (!toDelay.length) continue;

        console.log(
          `[checkDelayedRequests] Hotel ${hotelId}: marking ${toDelay.length} requests as DELAYED`
        );

        await Promise.all(
          toDelay.map(async (request) => {
            try {
              await updateRequestStatusWithLog({
                request,
                toStatus: RequestStatus.DELAYED,
                note: 'Automatically marked as delayed because ETA has passed',
                actor: {
                  type: 'SYSTEM',
                  userId: 'SYSTEM',
                },
              });
            } catch (err) {
              console.error(
                `[checkDelayedRequests] Failed to update request to DELAYED`,
                {
                  hotelId,
                  requestId: request.requestId,
                },
                err
              );
            }
          })
        );
      } while (nextToken);
    })
  );
}
