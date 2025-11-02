import { ENTITY_TABLE_NAME, GSI_ACTIVE_NAME } from '#Constants/DB.constants.js';
import DDB from '#clients/DynamoDb.client.js';

export async function getMessages({ conversationId }) {
  const params = {
    TableName: ENTITY_TABLE_NAME,
    IndexName: GSI_ACTIVE_NAME,
    KeyConditionExpression: '#pk = :p',
    ExpressionAttributeNames: { '#pk': 'active_pk' },
    ExpressionAttributeValues: { ':p': `CONVERSATION#${conversationId}` },
    ScanIndexForward: true,
  };

  const items = [];
  let lastEvaluatedKey;

  try {
    do {
      const res = await DDB.query(params).promise();
      if (res.Items?.length) items.push(...res.Items);
      lastEvaluatedKey = res.LastEvaluatedKey;
      params.ExclusiveStartKey = lastEvaluatedKey;
    } while (lastEvaluatedKey);

    return items;
  } catch (err) {
    console.error('Failed to retrieve messages:', err);
    throw new Error('Failed to retrieve messages');
  }
}
/**
 * getMessagesByConversationIds
 * @param {string[]} conversationIds - array of ULIDs
 * @param {{ consistentRead?: boolean, projection?: string, concurrency?: number }} opts
 * @returns {Promise<Map<string, any[]>>}
 */
export async function getMessagesByConversationIds(conversationIds = [], opts = {}) {
  if (!conversationIds.length) return new Map();

  const { consistentRead = false, projection, concurrency = 8 } = opts;

  // de-dupe while preserving order
  const seen = new Set();
  const deduped = [];
  for (const id of conversationIds) {
    if (!seen.has(id)) {
      seen.add(id);
      deduped.push(id);
    }
  }

  // simple concurrency limiter
  const queue = [...deduped];
  const results = new Map();

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      const items = await queryAllMessagesForConversation(id, { consistentRead, projection });
      // sort by sk (MESSAGE#<ulid>) so it's chronological by ULID
      items.sort((a, b) => String(a.sk).localeCompare(String(b.sk)));
      results.set(id, items);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, deduped.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

async function queryAllMessagesForConversation(conversationId, { consistentRead, projection }) {
  const items = [];
  let ExclusiveStartKey;

  do {
    const params = {
      TableName: ENTITY_TABLE_NAME,
      IndexName: GSI_ACTIVE_NAME,
      ConsistentRead: !!consistentRead,
      KeyConditionExpression: '#pk = :pk AND begins_with(#sk, :skPrefix)',
      ExpressionAttributeNames: { '#pk': 'active_pk', '#sk': 'active_sk' },
      ExpressionAttributeValues: {
        ':pk': `CONVERSATION#${conversationId}`,
        ':skPrefix': 'MESSAGE#',
      },
      ...(projection ? { ProjectionExpression: projection } : {}),
      ...(ExclusiveStartKey ? { ExclusiveStartKey } : {}),
    };

    const res = await DDB.query(params).promise();
    if (res.Items?.length) items.push(...res.Items);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return items;
}
