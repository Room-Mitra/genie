import { buildEntityItem } from '#common/entity.helper.js';
import DDB from '#config/DynamoDb.config.js';
import { GUEST_TABLE_NAME as USER_LOGIN_TABLE_NAME } from '#Constants/DB.constants.js';
import { ENTITY_TABLE_NAME } from '#Constants/DB.constants.js';

export async function transactCreateUserWithEmailGuard({ user }) {
  user.entityType = 'USER';
  const userItem = buildEntityItem(user);
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
            createdAt: userItem.createdAt,
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
    console.info(`${userId} ->` + 'Accessing Login details from DB with params', params);
    const userData = await DDB.query(params).promise();
    console.info(
      `${userId} ->` + 'User Data From DB :: ',
      userData,
      ' :: for input params ::',
      params
    );
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
  const pk = `USER#${userId}`;
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
  // { pk: 'USER#01L38..', name: 'Adi', passwordHash: '38adjh1' ... }
  return Items[0];
}
