import DDB from '#config/DynamoDb.config.js';
import { GUEST_TABLE_NAME as USER_LOGIN_TABLE_NAME } from '#Constants/DB.constants.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';
import { toIsoString } from '#common/timestamp.helper.js';

export async function transactCreateUserWithEmailGuard({ user }) {
  const now = new Date();

  const userItem = {
    pk: `CATALOG#USER`,
    sk: `USER#${user.userId}`,

    userId: user.userId,
    entityType: 'USER_INDEX',
    ...user,

    createdAt: toIsoString(now),
    updatedAt: toIsoString(now),
  };
  const emailKey = `USER#${user.email}`;
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: ENTITY_TABLE_NAME,
          Item: userItem,
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
      {
        Put: {
          TableName: ENTITY_TABLE_NAME,
          Item: {
            pk: emailKey,
            sk: `EMAIL_REGISTRY`,
            entityType: 'EMAIL_REGISTRY',
            userId: userItem.userId,
            createdAt: toIsoString(now),
            updatedAt: toIsoString(now),
          },
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
    ],
  };

  return DDB.transactWrite(params).promise();
}

export async function transactCreateUserWithMobileGuard({ user }) {
  const now = new Date();

  const userItem = {
    pk: `CATALOG#USER`,
    sk: `USER#${user.userId}`,

    userId: user.userId,
    entityType: 'USER_INDEX',
    ...user,

    createdAt: toIsoString(now),
    updatedAt: toIsoString(now),
  };
  const mobileKey = `USER#${user.mobileNumber}`;
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: ENTITY_TABLE_NAME,
          Item: userItem,
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
      {
        Put: {
          TableName: ENTITY_TABLE_NAME,
          Item: {
            pk: mobileKey,
            sk: `MOBILE_REGISTRY`,
            entityType: 'MOBILE_REGISTRY',
            userId: userItem.userId,
            createdAt: toIsoString(now),
            updatedAt: toIsoString(now),
          },
          ConditionExpression: 'attribute_not_exists(pk)',
        },
      },
    ],
  };

  return DDB.transactWrite(params).promise();
}

export const getUser = async (userId) => {
  const params = {
    TableName: USER_LOGIN_TABLE_NAME,
    ExpressionAttributeValues: {
      ':id': `${userId}`,
    },
    KeyConditionExpression: 'id=:id',
  };
  try {
    const userData = await DDB.query(params).promise();
    if (userData && userData.Items && userData.Items.length) {
      return { ...userData.Items[0] };
    }
  } catch (e) {
    console.error(
      'Error while accessing login details from DB',
      e,
      ' :: for input params ::',
      params
    );
  }
  return null;
};

export async function getEmailRegistryByEmail(email) {
  const pk = `USER#${email}`;

  // We wrote exactly one item per email in sign-up, so query with pk and limit 1
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': pk,
    },
    Limit: 1,
  };

  const { Items } = await DDB.query(params).promise();
  if (!Items || Items.length === 0) return null;

  // expected shape:
  // { pk: 'EMAIL#x@y.com', sk: 'USER#<userId>', userId: '<userId>', ... }
  return Items[0];
}

export async function getMobileRegistryByMobile(mobile) {
  const pk = `USER#${mobile}`;

  // We wrote exactly one item per email in sign-up, so query with pk and limit 1
  const params = {
    TableName: ENTITY_TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': pk,
    },
    Limit: 1,
  };

  const { Items } = await DDB.query(params).promise();
  if (!Items || Items.length === 0) return null;

  return Items[0];
}

export async function getUserProfileById(userId) {
  if (!userId) return null;

  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: {
      pk: `CATALOG#USER`,
      sk: `USER#${userId}`,
    },
  };

  const { Item } = await DDB.get(params).promise();
  return Item || null;
}

/**
 * getUsersByIds
 * - Accepts >100 ids (chunks into 100)
 * - Retries UnprocessedKeys with exponential backoff
 * - Optional: { consistentRead, projection }
 * - Returns results in the same order as input userIds
 */
export async function getUsersByIds(userIds = [], opts = {}) {
  if (!userIds.length) return [];
  const { consistentRead = false, projection } = opts;

  // de-dupe while preserving order
  const seen = new Set();
  const deduped = [];
  for (const id of userIds) {
    if (!seen.has(id)) {
      seen.add(id);
      deduped.push(id);
    }
  }

  const chunks = chunk(deduped, 100);
  const allItems = [];

  for (const ids of chunks) {
    const keys = ids.map((id) => ({ pk: 'CATALOG#USER', sk: `USER#${id}` }));
    const params = {
      RequestItems: {
        [ENTITY_TABLE_NAME]: {
          Keys: keys,
          ...(projection
            ? {
                ProjectionExpression: projection,
              }
            : {}),
          ...(consistentRead ? { ConsistentRead: true } : {}),
        },
      },
    };

    const items = await batchGetWithRetry(params);
    allItems.push(...items);
  }

  // index by userId for re-ordering
  const byId = new Map(allItems.map((it) => [String(it.sk).replace(/^USER#/, ''), it]));

  // return in the same order as the original input (including duplicates)
  return userIds.map((id) => byId.get(id)).filter(Boolean);
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function batchGetWithRetry(initialParams, { maxRetries = 6 } = {}) {
  let params = JSON.parse(JSON.stringify(initialParams));
  let attempts = 0;
  const collected = [];

  while (attempts < maxRetries) {
    const res = await DDB.batchGet(params).promise();

    if (res.Responses && res.Responses[ENTITY_TABLE_NAME]) {
      collected.push(...res.Responses[ENTITY_TABLE_NAME]);
    }

    const unprocessed = res.UnprocessedKeys && res.UnprocessedKeys[ENTITY_TABLE_NAME];

    if (unprocessed && unprocessed.Keys && unprocessed.Keys.length) {
      console.log(
        `batchGetWithRetry has ${unprocessed.Keys.length} unprocessed keys. attempting again after sleep`
      );
      attempts += 1;
      // backoff with jitter: 100ms * 2^attempts plus 0-100ms
      const delay = 100 * Math.pow(2, attempts) + Math.floor(Math.random() * 100);
      await sleep(delay);

      params = {
        RequestItems: {
          [ENTITY_TABLE_NAME]: unprocessed,
        },
      };
      continue;
    }

    break;
  }

  return collected;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
