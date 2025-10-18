// common/entity.helper.js
import { ulid } from 'ulid';

/**
 * Map entityType -> canonical id field name.
 * Extend as you add more entity types.
 */
const ID_FIELD_BY_TYPE = {
  HOTEL: 'hotelId',
  ROOM: 'roomId',
  REQUEST: 'requestId',
  USER: 'userId',
  STAFF: 'staffId',
  DEVICE: 'deviceId',
  // fallback for anything else: "id"
};

/**
 * Build a single-table ENTITY item with proper keys and id field.
 *
 * Input example (REQUEST):
 * {
 *   entityType: "REQUEST",
 *   hotelId: "H123",
 *   roomId: "136",
 *   // optional ways to pass the id, precedence shown:
 *   requestId?: "R999",
 *   id?: "R888",
 *   createdAt?: number | string | Date,
 *   ...attrs
 * }
 */
export function buildEntityItem(pojo) {
  if (!pojo || typeof pojo !== 'object') {
    throw new Error('buildEntityItem requires a plain object');
  }

  const {
    entityType,
    hotelId,
    roomId,
    createdAt,
    id, // generic id, used if specific id field not provided
    ...attrs
  } = pojo;

  if (!entityType) {
    throw new Error('entityType is required');
  }

  // Work out the canonical id field for this type
  const idField = ID_FIELD_BY_TYPE[entityType] || 'id';

  // If caller provided the type-specific id, use it; else fall back to generic id; else ulid()
  const providedSpecificId = pojo[idField];
  let primaryId = providedSpecificId || id || ulid();

  // For HOTEL/ROOM, if hotelId/roomId present, that should be the primary id
  if (entityType === 'HOTEL' && hotelId) primaryId = hotelId;
  if (entityType === 'ROOM' && roomId) primaryId = roomId;

  // Time keys
  const isoNow = toIsoString(createdAt);
  const entityTypeTimestamp = `${entityType}#${isoNow}`;

  // PK/SK
  const pk = `${entityType}#${primaryId}`;
  const sk = entityTypeTimestamp;

  // Build final item
  const item = {
    pk,
    sk,
    entityType,
    entityTypeTimestamp, // used by your GSIs as RANGE
    createdAt: isoNow,
    updatedAt: isoNow,

    // GSI partition keys (included only if present)
    ...(hotelId ? { hotelId } : {}),
    ...(roomId ? { roomId } : {}),

    // Ensure the canonical id field is present on the item
    [idField]: primaryId,

    // All remaining attributes
    ...attrs,
  };

  return item;
}

/** Normalize to ISO string for lexicographic sort */
function toIsoString(input) {
  if (!input) return new Date().toISOString();
  if (typeof input === 'number') return new Date(input).toISOString();
  if (input instanceof Date) return input.toISOString();
  return new Date(input).toISOString();
}
