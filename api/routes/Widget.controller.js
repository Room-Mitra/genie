import express from 'express';
import { generateOtpForEmail, verifyOtpForEmail } from '#services/Otp.service.js';
import { OtpPurpose } from '#Constants/OtpPurpose.constants.js';
import { Languages } from '#Constants/Language.constants.js';
import { requestCallback } from '#services/Bolna.service.js';

const router = express.Router();

router.post('/web-voice-agent', async (req, res) => {
  const { name, email, language, otp } = req.body || {};

  if (!email) {
    return res.status(400).json({ ok: false, error: 'Email is required' });
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

      await generateOtpForEmail(email, name, language, OtpPurpose.VOICE_AGENT_TRIAL_REQUEST);

      return res.json({
        message: 'Verification code sent to email',
      });
    }

    // Case 2: verify OTP
    if (otp && !name) {
      const token = await verifyOtpForEmail(email, otp, OtpPurpose.VOICE_AGENT_TRIAL_REQUEST);
      return res.json({
        token,
      });
    }

    // Bad payload
    return res.status(400).json({
      error: 'Provide either { name, email } to request an OTP, or { email, otp } to verify',
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

export default router;
