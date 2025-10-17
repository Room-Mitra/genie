// npm i ulid
import { ulid } from 'ulid';

/**
 * Entity types your table supports
 */
export type EntityType =
  | 'HOTEL'
  | 'ROOM'
  | 'REQUEST'
  | 'CONVERSATION'
  | 'MESSAGE'
  | 'USER'
  | 'DEVICE';

/**
 * Common base fields across items
 */
export interface BaseCommon {
  hotelId?: string; // required for all entities in this model
  createdAtEpoch?: number;
  updatedAtEpoch?: number;
  createdAtIso?: string;
  ttlEpoch?: number; // optional TTL if you use it on some items
}

/**
 * Entity-specific inputs
 */
export interface HotelInput extends BaseCommon {
  entityType: 'HOTEL';
  hotelId: string;
  name?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface RoomInput extends BaseCommon {
  entityType: 'ROOM';
  roomId: string;
  roomNumber?: string;
  floor?: string;
  status?: string;
  capacity?: string;
}

export interface RequestInput extends BaseCommon {
  entityType: 'REQUEST';
  requestId?: string; // if not given, will be ULID
  roomId: string;
  summary?: string;
  category?: string;
  status: 'Open' | 'InProgress' | 'Done' | 'Cancelled';
  priority?: 'P1' | 'P2' | 'P3';
  assignedToUserId?: string;
  conversationId?: string; // if created from a conversation
}

export interface ConversationInput extends BaseCommon {
  entityType: 'CONVERSATION';
  conversationId?: string; // if not given, will be ULID
  roomId?: string; // may be missing for lobby/WA channels
  channel?: 'tablet' | 'voice' | 'whatsapp' | 'web' | string;
  topic?: string;
  status: 'Open' | 'Resolved' | 'Escalated';
  assignedToUserId?: string;
  requestId?: string; // if escalated to a request
}

export interface MessageInput extends BaseCommon {
  entityType: 'MESSAGE';
  conversationId: string;
  roomId?: string;
  messageId?: string; // ULID if not provided
  senderType: 'guest' | 'staff' | 'bot';
  content: string;
  requestId?: string; // if this message created a request
}

export interface UserInput extends BaseCommon {
  entityType: 'USER';
  userId?: string; // ULID if not provided
  emailLower: string;
  role?: string;
  groups?: string[];
  active?: boolean;
}

export interface DeviceInput extends BaseCommon {
  entityType: 'DEVICE';
  deviceId?: string; // ULID if not provided
  roomId?: string; // if bound to a room
  serial?: string;
  model?: string;
  state?: string;
  lastSeenEpoch?: number;
}

/**
 * Build options to toggle optional GSIs
 */
export interface BuildOptions {
  // If you kept the hotelType GSI, enable this and it will be populated.
  includeHotelTypeIndex?: boolean;
}

export type BuildInput =
  | HotelInput
  | RoomInput
  | RequestInput
  | ConversationInput
  | MessageInput
  | UserInput
  | DeviceInput;

/**
 * Utility to ensure timestamps exist
 */
function withTimestamps<T extends BaseCommon>(input: T): T {
  const now = Math.floor(Date.now() / 1000);
  return {
    createdAtEpoch: input.createdAtEpoch ?? now,
    updatedAtEpoch: input.updatedAtEpoch ?? now,
    createdAtIso: input.createdAtIso ?? new Date(now * 1000).toISOString(),
    ...input,
  };
}

/**
 * Remove undefined keys so you do not write noisy attributes
 */
function clean<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

/**
 * Build the base table keys
 */
function baseKeys(hotelId: string, sk: string) {
  return { pk: `HOTEL#${hotelId}`, sk };
}

/**
 * Optionally add hotelType_* if you kept that GSI
 */
function maybeHotelType(
  opts: BuildOptions | undefined,
  hotelId: string,
  typeTag: string,
  timeId: string
) {
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
export function buildEntityItem(input: BuildInput, options?: BuildOptions) {
  const i = withTimestamps(input as any);

  switch (i.entityType) {
    case 'HOTEL': {
      const sk = `HOTEL#${i.hotelId}`;
      const base = baseKeys(i.hotelId, sk);
      const extra = maybeHotelType(options, i.hotelId, 'HOTEL', i.hotelId);
      return clean({
        ...base,
        ...extra,
        entityType: 'HOTEL',
        hotelId: i.hotelId,
        name: i.name,
        address: i.address,
        contactEmail: i.contactEmail,
        contactPhone: i.contactPhone,
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
      });
    }

    case 'ROOM': {
      const sk = `ROOM#${i.roomId}`;
      const base = baseKeys(i.hotelId, sk);
      const extra = {
        // Room timeline GSI
        roomType_pk: `ROOM#${i.roomId}`,
        roomType_sk: `ROOM#${i.roomId}`,
        ...maybeHotelType(options, i.hotelId, 'ROOM', i.roomId),
      };
      return clean({
        ...base,
        ...extra,
        entityType: 'ROOM',
        hotelId: i.hotelId,
        roomId: i.roomId,
        roomNumber: i.roomNumber,
        floor: i.floor,
        status: i.status,
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
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
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
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
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
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
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
      });
    }

    case 'USER': {
      const userId = i.userId ?? ulid();
      const sk = `USER#${userId}`;
      const base = baseKeys(i.hotelId, sk);
      return clean({
        ...base,
        // Email lookup
        email_pk: `EMAIL#${i.emailLower}`,
        email_sk: `USER#${userId}`,

        entityType: 'USER',
        hotelId: i.hotelId,
        userId,
        emailLower: i.emailLower,
        role: i.role,
        groups: i.groups,
        active: i.active ?? true,
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
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
        createdAtEpoch: i.createdAtEpoch,
        updatedAtEpoch: i.updatedAtEpoch,
        createdAtIso: i.createdAtIso,
        ttlEpoch: i.ttlEpoch,
      });
    }

    default:
      // Exhaustive guard
      const neverType = i;
      throw new Error(`Unsupported entityType: ${(neverType as any)?.entityType}`);
  }
}

/* ----------------------------
   Example usage
----------------------------- */

// a new request from room R359 in hotel H1
const requestItem = buildEntityItem({
  entityType: 'REQUEST',
  hotelId: 'H1',
  roomId: 'R359',
  status: 'Open',
  priority: 'P2',
  summary: 'Black coffee',
});

// a conversation that does not create a request
const convItem = buildEntityItem({
  entityType: 'CONVERSATION',
  hotelId: 'H1',
  roomId: 'R247',
  status: 'Resolved',
  channel: 'tablet',
  topic: 'Airport distance',
});

// a message in that conversation
const msgItem = buildEntityItem({
  entityType: 'MESSAGE',
  hotelId: 'H1',
  conversationId: 'C1001',
  roomId: 'R247',
  senderType: 'bot',
  content: 'KIA is ~44 km; 60–90 minutes by car.',
});
