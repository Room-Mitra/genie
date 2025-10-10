import express from 'express';
const router = express.Router();

const WEBHOOK = process.env.SLACK_WEBHOOK_URL;

// register lead
router.post('/', async (req, res) => {
  if (!WEBHOOK) {
    return res.status(200).json({ ok: false, message: 'SLACK_WEBHOOK_URL not set' });
  }

  try {
    const { name = '', email = '', phone = '', hotel = '', message = '' } = req.body || {};

    // minimal validation
    if (!name.trim() || !email.trim()) {
      return res.status(400).json({ ok: false, error: 'name and email are required' });
    }

    // Slack payload - Blocks for neat formatting
    const textPlain = `New Room Mitra demo request from ${name}`;
    const slackPayload = {
      text: textPlain,
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '🛎️ New Demo Request', emoji: true },
        },
        { type: 'divider' },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name*\n${name}` },
            { type: 'mrkdwn', text: `*Email*\n${email}` },
            { type: 'mrkdwn', text: `*Phone*\n${phone || '—'}` },
            { type: 'mrkdwn', text: `*Hotel*\n${hotel || '—'}` },
          ],
        },
        ...(message
          ? [
              {
                type: 'section',
                text: { type: 'mrkdwn', text: `*Message*\n${message}` },
              },
            ]
          : []),
        {
          type: 'context',
          elements: [{ type: 'mrkdwn', text: `Received: ${new Date().toLocaleString()}` }],
        },
      ],
    };

    const slackRes = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });

    if (!slackRes.ok) {
      const errText = await slackRes.text().catch(() => '');
      return res
        .status(502)
        .json({ ok: false, error: `Slack error: ${slackRes.status} ${errText}` });
    }

    return res.json({ ok: true, message: 'Lead captured and sent to Slack' });
  } catch (err) {
    console.error('Lead submit failed', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
