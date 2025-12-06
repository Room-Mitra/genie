// Minimal STA AH config
const STA_AH_ENDPOINT = 'https://csbe.staah.net/';
const PROPERTY_ID = decodeURIComponent(
  '981MgIuc40XLDoFWOm6Lb03jIkZRzwdE4dsh4FCblzqm3k8JVzcdjjQ3MDY%3D'
);
const API_KEY = 'cPPq1uh0xD6BpfDFpGWEx9fxnDOUA3Y25RdigC0X';

// RoomId to human name mapping
const ROOM_ID_TO_NAME = {
  140885: 'Superior',
  140886: 'Deluxe Balcony Room',
  140892: 'Club Room With Kitchenette',
};

/**
 * Helper: generate date strings for each night between startDate and endDate
 * startDate inclusive, endDate exclusive
 */
function getDateRangeNights(startDate, endDate) {
  const result = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  for (let d = new Date(start.getTime()); d < end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    result.push(`${year}-${month}-${day}`);
  }

  return result;
}

function safeNumber(value) {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Extracts the rate for a date from a given RatePlan
 *
 * Rules:
 * - From OBP, always get the second element's RateBeforeTax as the room rate
 *   In this payload OBP is an object keyed {"1", "2", "3"}
 *   so we use OBP["2"] as the "second element".
 */
function getRateForDate(ratePlan, date) {
  const rateObj = ratePlan?.Rates?.[date];
  if (!rateObj) {
    return { rate: null };
  }

  const obp = rateObj.OBP;
  if (!obp || typeof obp !== 'object') {
    return { rate: null };
  }

  // Second element is the one with key "2"
  const second = obp['2'] || obp[2];
  if (!second) {
    return { rate: null };
  }

  const rateBeforeTax = safeNumber(second.RateBeforeTax);
  return { rate: rateBeforeTax };
}

/**
 * Wrapper around the STA AH bedata API.
 *
 * Input:
 *   startDate: YYYY-MM-DD
 *   endDate:   YYYY-MM-DD
 *
 * Output:
 * {
 *   startDate,
 *   endDate,
 *   availableRooms: [
 *     {
 *       roomId,
 *       roomType,
 *       bedConfigurations: string[],
 *       maxOccupancy: number | null,
 *       currency: string,
 *       availability: {
 *         availableRooms: number,          // minimum inventory across all nights
 *         availableForEntireStay: boolean, // always true for returned rooms
 *       },
 *       pricing: {
 *         withoutBreakfast: {
 *           ratePlanId,
 *           ratePlanName,
 *           breakfastIncluded: false,
 *           pricePerNight,                 // average per night
 *           totalForStay,                  // sum across nights
 *         } | null,
 *         withBreakfast: {
 *           ratePlanId,
 *           ratePlanName,
 *           breakfastIncluded: true,
 *           pricePerNight,
 *           totalForStay,
 *         } | null,
 *       },
 *       nightlyBreakdown: [
 *         {
 *           date: YYYY-MM-DD,
 *           withoutBreakfast: number | null,
 *           withBreakfast: number | null,
 *         }
 *       ],
 *     },
 *   ]
 * }
 *
 * Availability rules:
 * - A room is available for a night if Inventory[date] > 0
 * - A room is included only if it has Inventory[date] > 0 for every night
 * - availableRooms is the minimum Inventory across all nights
 */
export async function getAvailableRooms(startDate, endDate) {
  const nights = getDateRangeNights(startDate, endDate);

  if (nights.length === 0) {
    return {
      startDate,
      endDate,
      availableRooms: [],
    };
  }

  const params = new URLSearchParams({
    RequestType: 'bedata',
    Product: 'no',
    PropertyId: PROPERTY_ID,
    CheckInDate: startDate,
    CheckOutDate: endDate,
    JDRN: 'Y',
    Country: 'IN',
    DeviceType: 'desktop',
    Lang: 'EN',
  });

  const response = await fetch(`${STA_AH_ENDPOINT}?${params.toString()}`, {
    headers: {
      accept: 'application/json',
      'x-api-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`STA AH request failed with status ${response.status}`);
  }

  const json = await response.json();

  const products = json?.Product || [];
  if (!Array.isArray(products) || products.length === 0) {
    return {
      startDate,
      endDate,
      availableRooms: [],
    };
  }

  const product = products[0];
  const productCurrency = product.Currency || 'INR';
  const rooms = product.Rooms || [];

  const roomsOut = [];

  rooms.forEach((room) => {
    const roomId = String(room.RoomId ?? room.RoomID ?? '');
    const mappedName = ROOM_ID_TO_NAME[roomId];
    const roomType = mappedName || `Room ${roomId}`;

    const maxOccupancy = safeNumber(room.MaxOccupancy ?? room.Occupancy) ?? 2;

    const inventoryByDate = room.Inventory || {};

    // RatePlans[0] = without breakfast, RatePlans[1] = with breakfast
    const ratePlans = room.RatePlans || [];
    const ratePlanNoBreakfast = ratePlans[0] || null;
    const ratePlanWithBreakfast = ratePlans[1] || null;

    const nightlyBreakdown = [];
    const nightlyWithout = [];
    const nightlyWith = [];
    let minInventoryAcrossNights = Number.POSITIVE_INFINITY;

    for (const date of nights) {
      const inventoryForDate = Number(inventoryByDate[date] ?? 0);

      // Track minimum inventory across all nights
      minInventoryAcrossNights = Math.min(minInventoryAcrossNights, inventoryForDate);

      // Get rates for both rate plans
      const noBr = ratePlanNoBreakfast ? getRateForDate(ratePlanNoBreakfast, date) : { rate: null };

      const withBr = ratePlanWithBreakfast
        ? getRateForDate(ratePlanWithBreakfast, date)
        : { rate: null };

      nightlyWithout.push(noBr.rate);
      nightlyWith.push(withBr.rate);

      nightlyBreakdown.push({
        date,
        withoutBreakfast: noBr.rate,
        withBreakfast: withBr.rate,
      });
    }

    const availableForEntireStay = minInventoryAcrossNights > 0;

    if (!availableForEntireStay) {
      // This room is not available for the full duration, skip it
      return;
    }

    const totalWithout = nightlyWithout.reduce((sum, v) => (v != null ? sum + v : sum), 0);
    const totalWith = nightlyWith.reduce((sum, v) => (v != null ? sum + v : sum), 0);

    const nightsCount = nights.length;

    const avgWithout = totalWithout > 0 && nightsCount > 0 ? totalWithout / nightsCount : null;
    const avgWith = totalWith > 0 && nightsCount > 0 ? totalWith / nightsCount : null;

    const pricingWithout =
      ratePlanNoBreakfast && avgWithout != null
        ? {
            ratePlanId: String(ratePlanNoBreakfast.RateId ?? ''),
            ratePlanName: 'Room only',
            breakfastIncluded: false,
            pricePerNight: avgWithout,
            totalForStay: totalWithout,
          }
        : null;

    const pricingWith =
      ratePlanWithBreakfast && avgWith != null
        ? {
            ratePlanId: String(ratePlanWithBreakfast.RateId ?? ''),
            ratePlanName: 'With breakfast',
            breakfastIncluded: true,
            pricePerNight: avgWith,
            totalForStay: totalWith,
          }
        : null;

    roomsOut.push({
      roomId,
      roomType,
      maxOccupancy,
      currency: productCurrency,
      availability: {
        availableRooms:
          minInventoryAcrossNights === Number.POSITIVE_INFINITY ? 0 : minInventoryAcrossNights,
        availableForEntireStay: true,
      },
      pricing: {
        withoutBreakfast: pricingWithout,
        withBreakfast: pricingWith,
      },
      nightlyBreakdown,
    });
  });

  return {
    startDate,
    endDate,
    availableRooms: roomsOut,
  };
}
