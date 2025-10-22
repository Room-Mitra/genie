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

export async function getUserProfileById(userId) {
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
