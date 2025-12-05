import { PutCommand, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { DDBV3 } from '#clients/DynamoDb.client.js';
import { ENTITY_TABLE_NAME, GSI_ACTIVE_NAME } from '#Constants/DB.constants.js';

export async function saveOTP(contactInfo, name, language, otp, ttl, purpose, hotelId) {
  const pk = `OTP#${contactInfo}`;
  const sk = `${purpose}#CODE#${otp}`;
  const otpItem = {
    pk,
    sk,
    active_pk: pk,
    active_sk: sk,
    contactInfo,
    name,
    language,
    code: otp,
    purpose,

    hotelType_pk: `HOTEL#${hotelId}`,
    hotelType_sk: `${pk}#${sk}`,

    hotelId,
    createdAt: new Date().toISOString(),
    ttl,
  };

  await DDBV3.send(
    new PutCommand({
      TableName: ENTITY_TABLE_NAME,
      Item: otpItem,
    })
  );

  return otpItem;
}

export async function getOtp(contactInfo, code, purpose, hotelId) {
  const resp = await DDBV3.send(
    new QueryCommand({
      TableName: ENTITY_TABLE_NAME,
      IndexName: GSI_ACTIVE_NAME,
      KeyConditionExpression: '#pk = :p AND #sk = :s',
      FilterExpression: '#hotelId = :hotelId',
      ExpressionAttributeNames: {
        '#pk': 'active_pk',
        '#sk': 'active_sk',
        '#hotelId': 'hotelId',
      },
      ExpressionAttributeValues: {
        ':p': `OTP#${contactInfo}`,
        ':s': `${purpose}#CODE#${code}`,
        ':hotelId': hotelId,
      },
    })
  );

  const items = resp.Items;
  return items && items.length > 0 ? items[0] : null;
}

export async function deleteOtp(contactInfo, code, purpose) {
  const pk = `OTP#${contactInfo}`;
  const sk = `${purpose}#CODE#${code}`;
  const params = {
    TableName: ENTITY_TABLE_NAME,
    Key: {
      pk,
      sk,
    },
    UpdateExpression:
      'SET deletedAt = :now REMOVE active_pk, active_sk, hotelType_pk, hotelType_sk',
    ExpressionAttributeValues: {
      ':now': new Date().toISOString(),
    },
  };
  await DDBV3.send(new UpdateCommand(params));
}
