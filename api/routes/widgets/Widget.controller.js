import express from 'express';
import { generateOtpForSMS, verifyOtp } from '#services/Otp.service.js';
import { OtpPurpose } from '#Constants/OtpPurpose.constants.js';
import { Languages } from '#Constants/Language.constants.js';
import { requestCallback } from '#services/Bolna.service.js';
import { initWidget } from '#services/Widget.service.js';

const router = express.Router();

router.post('/web-voice-agent', async (req, res) => {
  const { name, phone, language, otp, hotelId } = req.body || {};

  if (!hotelId) {
    return res.status(400).json({ ok: false, error: 'hotelId is required' });
  }

  if (!phone) {
    return res.status(400).json({ ok: false, error: 'Phone Number is required' });
  }

  try {
    // Case 1: request OTP
    if (name && !otp) {
      if (!language) {
        return res.status(400).json({ ok: false, error: 'language is required' });
      }

      if (!Languages.includes(language)) {
        return res.status(400).json({ error: 'unsupported language' });
      }

      await generateOtpForSMS(phone, name, language, OtpPurpose.VOICE_AGENT_TRIAL_REQUEST, hotelId);

      return res.json({
        message: 'Verification code sent to email',
      });
    }

    // Case 2: verify OTP
    if (otp && !name) {
      const token = await verifyOtp(phone, otp, OtpPurpose.VOICE_AGENT_TRIAL_REQUEST, hotelId);
      return res.json({
        token,
      });
    }

    // Bad payload
    return res.status(400).json({
      error: 'Provide either { name, phone } to request an OTP, or { email, otp } to verify',
    });
  } catch (err) {
    console.error('Error in /web-voice-agent', err);
    if (err.code === 'INVALID_CODE') {
      return res.status(400).json({
        error: 'Invalid or expired verification code',
      });
    }
    return res.status(500).json({
      error: err?.message || 'Internal server error',
    });
  }
});

router.post('/request-callback', async (req, res) => {
  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({ ok: false, error: 'phone is required' });
  }

  try {
    await requestCallback(phone);

    return res.status(200).json({
      ok: true,
      message: 'requested callback',
    });
  } catch (err) {
    console.error('Error in /request-callback', err);
    if (err.code === 'INVALID_CODE') {
      return res.status(400).json({
        error: 'Invalid or expired verification code',
      });
    }
    return res.status(500).json({
      error: err?.message || 'Internal server error',
    });
  }
});

router.post('/init', async (req, res) => {
  try {
    const { hotelId, signature, referer, origin } = req.body;

    if (!hotelId || !signature) {
      return res.status(400).json({ error: 'Missing hotelId/signature' });
    }

    // Determine which domain is calling
    const urlString = origin || referer;

    if (!urlString) {
      return res.status(400).json({ error: 'Missing origin/referer' });
    }

    let host;
    try {
      const url = new URL(urlString);
      host = url.port ? `${url.hostname}:${url.port}` : url.hostname;
    } catch {
      return res.status(400).json({ error: 'Bad origin/referer' });
    }

    const widgetConfig = await initWidget({ hotelId, host, signature });

    return res.json(widgetConfig);
  } catch (err) {
    console.error('Widget init error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
