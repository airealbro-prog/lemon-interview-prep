# Lemon App — International Phone Verification Bug Fix

> Found, diagnosed, and fixed before the interview.

## The Bug

Lemon's phone verification fails for any non-US number. Users with international numbers (e.g. Sri Lanka +94, UK +44, Nigeria +234) cannot receive an SMS verification code and are locked out of the app entirely.

**Affected users:** Every non-US user attempting to sign up.

## Root Cause

Two problems in the verification backend:

1. Phone input is validated against a US-only 10-digit regex — international numbers are rejected immediately
2. The country code is hardcoded to `+1` before calling Twilio — so a Sri Lankan number `0771234567` gets sent as `+10771234567`, which Twilio rejects

## The Fix

- Use [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js) to validate and normalize any international number to E.164 format
- Accept `countryCode` alongside `phoneNumber` from the frontend
- Pass the correctly formatted number (`+94771234567`) to Twilio

## Files

| File | Description |
|------|-------------|
| `phone-verify-fix.js` | Full before/after backend fix with Express routes |
| `loom-script.md` | 90-second Loom video script walking through the bug and fix |

## Quick Start

```bash
npm install twilio libphonenumber-js express

# Set your environment variables
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

**Send a verification code (any country):**
```json
POST /auth/send-code
{
  "phoneNumber": "0771234567",
  "countryCode": "LK"
}
```

**Verify the code:**
```json
POST /auth/verify-code
{
  "phoneNumber": "0771234567",
  "countryCode": "LK",
  "code": "482910"
}
```

## Why This Matters

Lemon's mission is to connect **everyone on Earth** with the right service. A signup flow that only works for US numbers is a direct contradiction of that mission — and it's a two-line fix.
