import express from 'express';
import multer from 'multer';
import { WebClient } from '@slack/web-api';

const router = express.Router();

const WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_FEEDBACK_CHANNEL = process.env.SLACK_FEEDBACK_CHANNEL;
const slackClient = new WebClient(SLACK_BOT_TOKEN);

// store audio in memory for forwarding to Slack
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
});

// register lead
router.post('/leads', async (req, res) => {
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

router.post('/feedback', upload.single('audio'), async (req, res) => {
  if (!WEBHOOK) {
    return res.status(200).json({ ok: false, message: 'SLACK_WEBHOOK_URL not set' });
  }

  try {
    const { name = '', roomNumber = '', message = '', rating = '', source = '' } = req.body || {};
    const audioFile = req.file; // from multer, field name: "audio"

    // Allow anonymous + audio-only feedback, but reject truly empty
    if (!message.trim() && !audioFile) {
      return res.status(400).json({ ok: false, error: 'Feedback message or audio is required' });
    }

    const displayName = name.trim() || 'Guest';
    const displayRoom = roomNumber.trim() || 'N/A';

    const textPlain = `New Room Mitra feedback from ${displayName} (Room ${displayRoom})`;

    const fields = [
      { type: 'mrkdwn', text: `*Name*\n${displayName}` },
      { type: 'mrkdwn', text: `*Room*\n${displayRoom}` },
    ];

    if (rating) {
      fields.push({
        type: 'mrkdwn',
        text: `*Rating*\n${rating}`,
      });
    }

    if (source) {
      fields.push({
        type: 'mrkdwn',
        text: `*Source*\n${source}`,
      });
    }

    const blocks = [
      {
        type: 'header',
        text: { type: 'plain_text', text: '⭐ Guest Feedback', emoji: true },
      },
      { type: 'divider' },
      {
        type: 'section',
        fields,
      },
    ];

    if (message.trim()) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Text feedback*\n${message}`,
        },
      });
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Received: ${new Date().toLocaleString()}`,
        },
      ],
    });

    // 1) Send main message via chat.postMessage
    await slackClient.chat.postMessage({
      channel: SLACK_FEEDBACK_CHANNEL,
      text: textPlain,
      blocks,
    });

    // 2) Upload audio file (if any)
    if (audioFile) {
      try {
        await slackClient.files.uploadV2({
          channel_id: SLACK_FEEDBACK_CHANNEL,
          initial_comment: `🎧 Voice feedback from ${displayName} (Room ${displayRoom})`,
          file_uploads: [
            {
              file: audioFile.buffer,
              filename: audioFile.originalname || 'feedback.webm',
              title: 'Guest voice feedback',
            },
          ],
        });
      } catch (err) {
        console.error('Slack file upload failed', JSON.stringify(err));
      }
    }

    return res.json({ ok: true, message: 'Feedback captured and sent to Slack' });
  } catch (err) {
    console.error('Feedback submit failed', err);
    return res.status(500).json({ ok: false, error: 'Internal server error' });
  }
});

export default router;
