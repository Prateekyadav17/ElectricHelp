const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// ----------------- helpers -----------------
function requireFields(fields, body) {
  for (const f of fields) {
    if (!body || typeof body[f] !== 'string' || body[f].trim() === '') {
      return `Missing or invalid field: ${f}`;
    }
  }
  return null;
}

const transporter = nodemailer.createTransport({
  // Gmail SMTP – change only if using other provider
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,   // your gmail
    pass: process.env.GMAIL_PASS    // app password
  }
});

async function sendResetMail(toEmail, token) {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  const link = `${appUrl}/reset?token=${token}`;

  await transporter.sendMail({
    from: `"ElectricHelp" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'ElectricHelp Password Reset',
    html: `
      <p>Dear user,</p>
      <p>Use the following link to reset your password (valid for 15 minutes):</p>
      <p><a href="${link}">${link}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    `
  });
}

// ----------------- LOGIN -----------------

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const bad = requireFields(['email', 'password'], req.body);
    if (bad) return res.status(400).json({ error: bad });

    const email = req.body.email.trim().toLowerCase();
    const password = req.body.password;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash || '');
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server misconfigured: JWT secret missing' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, email: user.email, name: user.name || '' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || undefined,
        specialization: user.specialization || undefined,
        phone: user.phone || undefined
      }
    });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// ----------------- FORGOT PASSWORD -----------------

// POST /api/auth/forgot  { email }
router.post('/forgot', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    // Always respond OK to avoid email enumeration
    if (!user) return res.json({ ok: true });

    const token = crypto.randomBytes(20).toString('hex'); // 40 chars
    const exp = Date.now() + 15 * 60 * 1000;             // 15 minutes

    user.resetToken = token;
    user.resetTokenExp = exp;
    await user.save();

    // PRODUCTION/DEMO: send Gmail mail
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        await sendResetMail(email, token);
        return res.json({ ok: true });   // no devToken in prod
      }
    } catch (mailErr) {
      console.error('Error sending reset mail:', mailErr);
      // even if mail fails, still return ok:true for security
      return res.json({ ok: true });
    }

    // DEV ONLY: if SMTP not set, return token in response so you can copy it
    return res.json({ ok: true, devToken: token });
  } catch (e) {
    console.error('POST /auth/forgot error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/reset  { token, newPassword }
router.post('/reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'token and newPassword are required' });
    }
    if (String(newPassword).length < 6) {
      return res.status(400).json({ error: 'Password too short (min 6)' });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    return res.json({ ok: true });
  } catch (e) {
    console.error('POST /auth/reset error', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
