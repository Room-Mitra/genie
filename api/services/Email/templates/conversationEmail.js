import { baseLayout, stripHtml } from './layout.js'; //  :contentReference[oaicite:0]{index=0}

export function conversationEmail({
  guestName,
  guestEmail,
  transcript, // array of { role: 'guest' | 'assistant', content: string }
  conversationId, // optional
  hotelName, // optional
  startedAt, // optional ISO timestamp
}) {
  const title = 'Guest Conversation Summary';
  const subject = `Conversation Summary with ${guestName || 'Guest'}`;

  // Build transcript HTML
  const transcriptHtml = transcript
    .map(
      (t) => `
        <div style="margin:0 0 12px 0;">
          <strong style="color:#E2C044;">${t.role === 'assistant' ? 'Vaani' : guestName || 'Guest'}:</strong>
          <div style="margin-top:4px; white-space:pre-wrap; color:#e5e7eb;">${t.content}</div>
        </div>
      `
    )
    .join('');

  // Body HTML for the email
  const bodyHtml = `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="color:#f5f5f5; font-family:Arial, sans-serif; font-size:14px; line-height:1.6;">
      <tr>
        <td>

          <div style="font-size:18px; font-weight:bold; margin:0 0 16px 0; color:#ffffff;">
            Guest Conversation Summary
          </div>

          <div style="margin-bottom:12px;">
            <strong style="color:#E2C044;">Guest name:</strong> ${guestName || 'Unknown'}
          </div>

          <div style="margin-bottom:12px;">
            <strong style="color:#E2C044;">Guest email:</strong> ${guestEmail || 'Not provided'}
          </div>

          ${
            hotelName
              ? `
          <div style="margin-bottom:12px;">
            <strong style="color:#E2C044;">Hotel:</strong> ${hotelName}
          </div>`
              : ''
          }

          ${
            startedAt
              ? `
          <div style="margin-bottom:12px;">
            <strong style="color:#E2C044;">Started at:</strong> ${startedAt}
          </div>`
              : ''
          }

          ${
            conversationId
              ? `
          <div style="margin-bottom:20px;">
            <strong style="color:#E2C044;">Conversation ID:</strong> ${conversationId}
          </div>`
              : ''
          }

          <div style="margin:24px 0 8px 0; font-size:16px; font-weight:bold; color:#ffffff;">
            Full Conversation
          </div>

          <div style="padding:16px; background:#1b1d24; border-radius:6px; color:#d1d5db; border:1px solid #252836;">
            ${transcriptHtml || '<em>No messages recorded.</em>'}
          </div>

        </td>
      </tr>
    </table>
  `;

  // Generate final HTML with baseLayout
  const html = baseLayout({ title, bodyHtml }); //  :contentReference[oaicite:1]{index=1}

  // Plain-text version for email clients
  const textTranscript = transcript
    .map((t) => `${t.role === 'assistant' ? 'Vaani' : guestName || 'Guest'}: ${t.content}`)
    .join('\n\n');

  const text = stripHtml(
    `
Guest Conversation Summary

Guest name: ${guestName || 'Unknown'}
Guest email: ${guestEmail || 'Not provided'}
${hotelName ? `Hotel: ${hotelName}` : ''}
${startedAt ? `Started at: ${startedAt}` : ''}
${conversationId ? `Conversation ID: ${conversationId}` : ''}

Full Conversation:
${textTranscript}
  `.trim()
  ); //  :contentReference[oaicite:2]{index=2}

  return { subject, html, text };
}
