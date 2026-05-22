// ============================================================
// BUG: Phone verification fails for non-US international numbers
// ROOT CAUSE: Number passed to Twilio without E.164 formatting,
//             and input validation rejects non-US country codes.
// FIX: Normalize all numbers to E.164 format using libphonenumber-js
//      before sending to Twilio, and accept any valid country code.
// ============================================================

// npm install twilio libphonenumber-js

const twilio = require("twilio");
const { parsePhoneNumber, isValidPhoneNumber } = require("libphonenumber-js");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ❌ BROKEN — what they likely have
async function sendVerificationCodeBroken(phoneNumber) {
  // Assumes 10-digit US number, breaks for +94XXXXXXXXX (Sri Lanka) etc.
  const usOnlyRegex = /^\d{10}$/;
  if (!usOnlyRegex.test(phoneNumber)) {
    throw new Error("Invalid phone number"); // Sri Lankan users hit this wall
  }

  const formatted = `+1${phoneNumber}`; // Hardcodes US country code
  await client.messages.create({
    body: `Your Lemon verification code is: ${generateCode()}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formatted, // Sends +1094... for a Sri Lankan number — always fails
  });
}

// ✅ FIXED — accepts any valid international number
async function sendVerificationCode(phoneNumber, countryCode = "US") {
  // Validate and normalize to E.164 format (+94XXXXXXXXX, +1XXXXXXXXXX, etc.)
  if (!isValidPhoneNumber(phoneNumber, countryCode)) {
    throw new Error("Invalid phone number for the given country code");
  }

  const parsed = parsePhoneNumber(phoneNumber, countryCode);
  const e164Number = parsed.format("E.164"); // e.g. +94771234567

  const code = generateCode();

  await client.messages.create({
    body: `Your Lemon verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: e164Number, // Correctly formatted for any country
  });

  // Store code server-side for verification step
  await storeVerificationCode(e164Number, code);

  return { success: true, sentTo: e164Number };
}

// Verify the code the user enters
async function verifyCode(phoneNumber, countryCode = "US", submittedCode) {
  if (!isValidPhoneNumber(phoneNumber, countryCode)) {
    throw new Error("Invalid phone number");
  }

  const e164Number = parsePhoneNumber(phoneNumber, countryCode).format("E.164");
  const stored = await getStoredVerificationCode(e164Number);

  if (!stored) throw new Error("Code expired or not found");
  if (stored.code !== submittedCode) throw new Error("Incorrect code");
  if (Date.now() > stored.expiresAt) throw new Error("Code expired");

  await clearVerificationCode(e164Number);
  return { verified: true };
}

// Express routes
const express = require("express");
const router = express.Router();

// Frontend sends: { phoneNumber: "0771234567", countryCode: "LK" }
router.post("/auth/send-code", async (req, res) => {
  const { phoneNumber, countryCode } = req.body;

  if (!phoneNumber || !countryCode) {
    return res.status(400).json({ error: "phoneNumber and countryCode are required" });
  }

  try {
    const result = await sendVerificationCode(phoneNumber, countryCode);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/auth/verify-code", async (req, res) => {
  const { phoneNumber, countryCode, code } = req.body;

  try {
    const result = await verifyCode(phoneNumber, countryCode, code);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Helpers ──────────────────────────────────────────────────

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

// Replace with Redis or your DB in production
const codeStore = new Map();

async function storeVerificationCode(e164Number, code) {
  codeStore.set(e164Number, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min TTL
  });
}

async function getStoredVerificationCode(e164Number) {
  return codeStore.get(e164Number) || null;
}

async function clearVerificationCode(e164Number) {
  codeStore.delete(e164Number);
}

module.exports = router;
