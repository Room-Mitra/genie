// npm i ulid
import { ulid } from 'ulid';

/**
 * Ensure timestamps exist
 */
function withTimestamps(input) {
  const now = Math.floor(Date.now() / 1000);
  return {
    createdAt: input.createdAt ?? new Date(now * 1000).toISOString(),
    updatedAt: input.updatedAt ?? new Date(now * 1000).toISOString(),
    ...input,
  };
}

/**
 * Remove undefined keys so you do not write noisy attributes
 */
function clean(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * The main builder
 * Returns a plain JS object ready to send via DynamoDBDocumentClient
 */
export function buildHotelEntityItem(input) {
  const i = withTimestamps(input || {});

  switch (i.entityType) {
    case 'HOTEL': {
      const hotelId = i.hotelId ?? ulid();
      const pk = `CATALOG#HOTEL`;
      const sk = `HOTEL#${hotelId}`;

      return clean({
        pk,
        sk,
        hotelId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'HOTEL',
        name: i.name,
        address: i.address,
        contactEmail: i.contactEmail,
        contactPhone: i.contactPhone,
        createdAt: i.createdAt,
      });
    }

    case 'ROOM': {
      const roomId = i.roomId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `ROOM#${roomId}`;

      return clean({
        pk,
        sk,
        roomId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'ROOM',
        hotelId: i.hotelId,
        number: i.number,
        type: i.type,
        floor: i.floor,
        description: i.description,
        createdAt: i.createdAt,
      });
    }

    case 'BOOKING': {
      const bookingId = i.bookingId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `BOOKING#${bookingId}`;

      return clean({
        pk,
        sk,
        bookingId,

        active_pk: pk,
        active_sk: sk,

        // Room GSI (for bookings per room)
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `BOOKING#${bookingId}`,

        // Bookings by status
        status_pk: `BOOKINGSTATUS#${i.status}#HOTEL#${i.hotelId}`,
        status_sk: `BOOKING#${bookingId}`,

        entityType: 'BOOKING',
        hotelId: i.hotelId,
        roomId: i.roomId,

        checkInTime: i.checkInTime,
        checkOutTime: i.checkOutTime,

        guest: i.guest,
        status: i.status,

        createdAt: i.createdAt,
      });
    }

    case 'REQUEST': {
      const requestId = i.requestId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `REQUEST#${requestId}`;

      return clean({
        pk,
        sk,
        requestId,

        active_pk: pk,
        active_sk: sk,

        // Room timeline GSI (for requests per room)
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `REQUEST#${requestId}`,

        // booking timeline gsi (for requests per booking)
        bookingType_pk: `BOOKING#${i.bookingId}`,
        bookingType_sk: `REQUEST#${requestId}`,

        // Requests by status board
        status_pk: `REQSTATUS#${i.statusType}#HOTEL#${i.hotelId}`,
        status_sk: `REQUEST#${requestId}`,

        entityType: 'REQUEST',
        hotelId: i.hotelId,
        roomId: i.roomId,
        orderId: i.orderId,

        department: i.department,
        requestType: i.requestType,
        details: i.details,
        priority: i.priority,

        estimatedTimeOfFulfillment: i.estimatedTimeOfFulfillment,
        status: i.status,
        statusType: i.statusType,
        assignedToUserId: i.assignedToUserId,
        conversationId: i.conversationId,
        guestUserId: i.guestUserId,
        createdAt: i.createdAt,
      });
    }

    case 'CONVERSATION': {
      const conversationId = i.conversationId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `CONVERSATION#${conversationId}`;

      return clean({
        pk,
        sk,
        conversationId,

        active_pk: pk,
        active_sk: sk,

        // Room timeline
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `CONVERSATION#${conversationId}`,

        // booking timeline gsi (for requests per booking)
        bookingType_pk: `BOOKING#${i.bookingId}`,
        bookingType_sk: `CONVERSATION#${conversationId}`,

        entityType: 'CONVERSATION',
        hotelId: i.hotelId,
        deviceId: i.deviceId,

        roomId: i.roomId,
        status: i.status,

        channel: i.channel,
        createdAt: i.createdAt,
      });
    }

    case 'MESSAGE': {
      const messageId = i.messageId ?? ulid();
      const pk = `CONVERSATION#${i.conversationId}`;
      const sk = `MESSAGE#${messageId}`;
      return clean({
        pk,
        sk,
        messageId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'MESSAGE',
        hotelId: i.hotelId,
        conversationId: i.conversationId,
        roomId: i.roomId,
        senderType: i.senderType,
        content: i.content,
        isUserResponseNeeded: i.isUserResponseNeeded,
        agents: i.agents,
        role: i.role,
        requestDetails: i.requestDetails,
        requestId: i.requestId,
        createdAt: i.createdAt,
      });
    }

    case 'DEVICE': {
      const deviceId = i.deviceId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `DEVICE#${deviceId}`;

      return clean({
        pk,
        sk,
        deviceId,

        active_pk: pk,
        active_sk: sk,

        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `DEVICE#${deviceId}`,

        entityType: 'DEVICE',
        hotelId: i.hotelId,
        roomId: i.roomId,
        serial: i.serial,
        model: i.model,
        state: i.state,
        lastSeen: i.lastSeen,
        createdAt: i.createdAt,
      });
    }

    case 'AMENITY': {
      const amenityId = i.amenityId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `HOTEL#META#AMENITY#${amenityId}`;
      return clean({
        pk,
        sk,
        amenityId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'AMENITY',
        hotelId: i.hotelId,
        title: i.title,
        description: i.description,
        headerImage: i.headerImage,
        createdAt: i.createdAt,
      });
    }

    case 'CONCIERGE': {
      const serviceId = i.serviceId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `HOTEL#META#CONCIERGE#${serviceId}`;

      return clean({
        pk,
        sk,
        serviceId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'CONCIERGE',
        hotelId: i.hotelId,
        title: i.title,
        description: i.description,
        headerImage: i.headerImage,
        createdAt: i.createdAt,
      });
    }

    case 'MENU': {
      const menuId = i.menuId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `HOTEL#META#MENU#${menuId}`;

      return clean({
        pk,
        sk,
        menuId,

        active_pk: pk,
        active_sk: sk,

        entityType: 'MENU',
        hotelId: i.hotelId,
        contents: i.contents,
        createdAt: i.createdAt,
      });
    }

    case 'ORDER': {
      const orderId = i.orderId ?? ulid();
      const pk = `HOTEL#${i.hotelId}`;
      const sk = `ORDER#${orderId}`;

      return clean({
        pk,
        sk,
        orderId,

        active_pk: pk,
        active_sk: sk,

        // room timeline gsi (for order per room)
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `ORDER#${orderId}`,

        // booking timeline gsi (for order per booking)
        bookingType_pk: `BOOKING#${i.bookingId}`,
        bookingType_sk: `ORDER#${orderId}`,

        entityType: 'ORDER',

        requestId: i.requestId,
        guestUserId: i.guestUserId,
        cart: i.cart,

        createdAt: i.createdAt,
      });
    }

    default:
      throw new Error(`Unsupported entityType: ${i?.entityType}`);
  }
}
