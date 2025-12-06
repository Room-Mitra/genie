import SES from '#clients/SES.client.js';
import { formatTimestamp } from '#common/timestamp.helper.js';
import { getMessagesByConversationIds } from '#repositories/Message.repository.js';
import { getHotelById } from '#services/Hotel.service.js';
import { conversationEmail } from './templates/conversationEmail.js';
import { staffInviteEmail } from './templates/staffInviteEmail.js';
import { verificationEmail } from './templates/verificationEmail.js';
import { SendEmailCommand } from '@aws-sdk/client-ses';

export async function sendEmail({ to, subject, html, text, from }) {
  if (!from) {
    throw new Error('from address not specified');
  }

  if (!subject) {
    throw new Error("sendEmail: 'subject' is required");
  }

  if (!html && !text) {
    throw new Error("sendEmail: at least one of 'html' or 'text' is required");
  }

  const Source = from;

  const params = {
    Source,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        ...(text
          ? {
              Text: {
                Data: text,
                Charset: 'UTF-8',
              },
            }
          : {}),
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    return await SES.send(command);
  } catch (err) {
    console.error(
      'SES v3 sendEmail error details:',
      JSON.stringify(
        {
          name: err.name,
          code: err.code,
          statusCode: err.$metadata?.httpStatusCode,
          time: err.time,
          message: err.message,
          requestId: err.$metadata?.requestId,
          retryable: err.$retryable,
        },
        null,
        2
      )
    );
    throw err;
  }
}

export async function sendVerificationEmail({ to, name, code }) {
  const { subject, html, text } = verificationEmail({ name, code });
  return sendEmail({ to, subject, html, text, from: 'no-reply@roommitra.com' });
}

export async function sendStaffInviteEmail({ to, staffName, hotelName, inviteLink }) {
  const { subject, html, text } = staffInviteEmail({ staffName, hotelName, inviteLink });
  return sendEmail({ to, subject, html, text, from: 'no-reply@roommitra.com' });
}

export async function sendConversationEmail({ to, guest, conversationId, hotel, startedAt }) {
  if (!hotel) {
    const err = new Error('hotel required to send converastion email');
    err.code = 'HOTEL_REQUIRED';
    throw err;
  }

  const messages = await getMessagesByConversationIds([conversationId]);

  const { subject, html, text } = conversationEmail({
    guestName: guest.name,
    guestEmail: guest.email,
    transcript: messages.get(conversationId).map(({ content, createdAt, messageId, role }) => ({
      content,
      createdAt,
      role,
      messageId,
    })),
    conversationId,
    hotelName: hotel.name,
    startedAt: formatTimestamp(startedAt),
  });

  to = Array.isArray(to) ? to : [to];
  await Promise.all(
    to.map((t) => sendEmail({ to: t, subject, html, text, from: 'no-reply@roommitra.com' }))
  );
}
