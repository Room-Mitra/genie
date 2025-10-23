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
 * Build the base table keys
 */
function baseKeys(hotelId, sk) {
  return { pk: `HOTEL#${hotelId}`, sk };
}

/**
 * Optionally add hotelType_* if you kept that GSI
 */
function maybeHotelType(opts, hotelId, typeTag, timeId) {
  if (!opts?.includeHotelTypeIndex) return {};
  return {
    hotelType_pk: `HOTEL#${hotelId}`,
    hotelType_sk: `${typeTag}#${timeId}`,
  };
}

/**
 * The main builder
 * Returns a plain JS object ready to send via DynamoDBDocumentClient
 */
export function buildHotelEntityItem(input, options) {
  const i = withTimestamps(input || {});

  switch (i.entityType) {
    case 'HOTEL': {
      const pk = `CATALOG#HOTEL`;
      const sk = `HOTEL#${i.hotelId}`;

      const extra = maybeHotelType(options, i.hotelId, 'HOTEL', i.hotelId);
      return clean({
        pk,
        sk,
        ...extra,
        entityType: 'HOTEL',
        hotelId: i.hotelId,
        name: i.name,
        address: i.address,
        contactEmail: i.contactEmail,
        contactPhone: i.contactPhone,
        createdAt: i.createdAt,
      });
    }

    case 'ROOM': {
      const sk = `ROOM#${i.roomId}`;
      const base = baseKeys(i.hotelId, sk);
      const extra = {
        ...maybeHotelType(options, i.hotelId, 'ROOM', i.roomId),
      };
      return clean({
        ...base,
        ...extra,
        entityType: 'ROOM',
        hotelId: i.hotelId,
        roomId: i.roomId,
        number: i.number,
        type: i.type,
        floor: i.floor,
        description: i.description,
        createdAt: i.createdAt,
      });
    }

    case 'BOOKING': {
      const bookingId = i.bookingId ?? ulid();
      const sk = `BOOKING#${bookingId}`;
      const base = baseKeys(i.hotelId, sk);

      return clean({
        ...base,

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

        createdAt: i.createdAt,
      });
    }

    case 'REQUEST': {
      const reqId = i.requestId ?? ulid();
      const timeId = reqId; // ULID is time ordered
      const sk = `REQUEST#${reqId}`;
      const base = baseKeys(i.hotelId, sk);
      return clean({
        ...base,
        // Room timeline GSI (for requests per room)
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `REQUEST#${timeId}`,

        // Requests by status board
        status_pk: `REQSTATUS#${i.status}#HOTEL#${i.hotelId}`,
        status_sk: `${i.priority ?? 'P3'}#${timeId}`,

        // Requests by assignee (if assigned)
        ...(i.assignedToUserId
          ? {
              assignee_pk: `ASSIGNEE#${i.assignedToUserId}`,
              assignee_sk: `${i.status}#HOTEL#${i.hotelId}#${timeId}`,
            }
          : {}),

        ...maybeHotelType(options, i.hotelId, 'REQUEST', timeId),

        entityType: 'REQUEST',
        hotelId: i.hotelId,
        roomId: i.roomId,
        requestId: reqId,
        summary: i.summary,
        category: i.category,
        status: i.status,
        priority: i.priority ?? 'P3',
        assignedToUserId: i.assignedToUserId,
        conversationId: i.conversationId,
        createdAt: i.createdAt,
      });
    }

    case 'CONVERSATION': {
      const convId = i.conversationId ?? ulid();
      const timeId = convId;
      const sk = `CONV#${convId}`;
      const base = baseKeys(i.hotelId, sk);
      return clean({
        ...base,
        // Room timeline
        ...(i.roomId
          ? {
              roomType_pk: `ROOM#${i.roomId}`,
              roomType_sk: `CONV#${timeId}`,
            }
          : {}),
        // Conversation status board
        convStatus_pk: `CONVSTATUS#${i.status}#HOTEL#${i.hotelId}`,
        convStatus_sk: `${timeId}`,
        // Assignment (optional)
        ...(i.assignedToUserId
          ? {
              convAssignee_pk: `CONVASSIGNEE#${i.assignedToUserId}`,
              convAssignee_sk: `${i.status}#HOTEL#${i.hotelId}#${timeId}`,
            }
          : {}),
        ...maybeHotelType(options, i.hotelId, 'CONV', timeId),

        entityType: 'CONVERSATION',
        hotelId: i.hotelId,
        conversationId: convId,
        roomId: i.roomId,
        status: i.status,
        channel: i.channel,
        topic: i.topic,
        requestId: i.requestId,
        assignedToUserId: i.assignedToUserId,
        createdAt: i.createdAt,
      });
    }

    case 'MESSAGE': {
      const msgId = i.messageId ?? ulid();
      const timeId = msgId;
      const sk = `MSG#${i.conversationId}#${msgId}`;
      const base = baseKeys(i.hotelId, sk);
      return clean({
        ...base,
        // Conversation -> messages thread fetch
        conversation_pk: `CONV#${i.conversationId}`,
        conversation_sk: `MSG#${timeId}`,
        // Room timeline (optional if message tied to a room)
        ...(i.roomId
          ? {
              roomType_pk: `ROOM#${i.roomId}`,
              roomType_sk: `MSG#${timeId}`,
            }
          : {}),
        ...maybeHotelType(options, i.hotelId, 'MSG', timeId),

        entityType: 'MESSAGE',
        hotelId: i.hotelId,
        conversationId: i.conversationId,
        messageId: msgId,
        roomId: i.roomId,
        senderType: i.senderType,
        content: i.content,
        requestId: i.requestId,
        createdAt: i.createdAt,
      });
    }

    case 'DEVICE': {
      const deviceId = i.deviceId ?? ulid();
      const sk = `DEVICE#${deviceId}`;
      const base = baseKeys(i.hotelId, sk);
      return clean({
        ...base,
        // Device -> binding lookup
        device_pk: `DEVICE#${deviceId}`,
        device_sk: `ROOM#${i.roomId ?? 'UNBOUND'}#HOTEL#${i.hotelId}`,
        // Room timeline if bound
        ...(i.roomId
          ? {
              roomType_pk: `ROOM#${i.roomId}`,
              roomType_sk: `DEVICE#${deviceId}`,
            }
          : {}),
        ...maybeHotelType(options, i.hotelId, 'DEVICE', deviceId),

        entityType: 'DEVICE',
        hotelId: i.hotelId,
        deviceId,
        roomId: i.roomId,
        serial: i.serial,
        model: i.model,
        state: i.state,
        lastSeenEpoch: i.lastSeenEpoch,
        createdAt: i.createdAt,
      });
    }

    default:
      throw new Error(`Unsupported entityType: ${i?.entityType}`);
  }
}
