# Lemon App — Interview Engineering Work

Two backend systems built before the interview to demonstrate ownership, urgency, and direct alignment with what Lemon is building.

---

## 1. International Phone Verification Bug Fix

### The Bug

Lemon's phone verification fails for any non-US number. Users with international numbers (e.g. Sri Lanka +94, UK +44, Nigeria +234) cannot receive an SMS verification code and are locked out of the app entirely.

**Affected users:** Every non-US user attempting to sign up.

### Root Cause

Two problems in the verification backend:

1. Phone input is validated against a US-only 10-digit regex — international numbers are rejected immediately
2. The country code is hardcoded to `+1` before calling Twilio — so a Sri Lankan number `0771234567` gets sent as `+10771234567`, which Twilio rejects

### The Fix

- Use [`libphonenumber-js`](https://github.com/catamphetamine/libphonenumber-js) to validate and normalize any international number to E.164 format
- Accept `countryCode` alongside `phoneNumber` from the frontend
- Pass the correctly formatted number (`+94771234567`) to Twilio

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

> See [`phone-verify-fix.js`](./phone-verify-fix.js) for the full before/after implementation.

---

## 2. Growth Flywheel Service

The viral growth loop Jim described: vendor uploads their customer contact list → Lemon deduplicates → sends personalized invites with referral links → 1 vendor can loop in thousands of users automatically.

### Pipeline

```
POST /vendor/:vendorId/upload-contacts  (CSV file)
        │
        ▼
   [parser.js]
   Parse CSV → normalize phone numbers to E.164
   Handle flexible column names (phone/mobile/cell etc.)
        │
        ▼
   [deduplicator.js]
   Filter out existing Lemon users
   Filter out contacts already invited by this vendor
        │
        ▼
   [invites.js]
   Send personalized SMS (Twilio) or email (Resend)
   Append viral referral link per vendor
   Run all invites concurrently via Promise.allSettled
        │
        ▼
   Return summary: parsed / skipped / invited / failed
```

### Example Response

```json
{
  "success": true,
  "summary": {
    "totalParsed": 1000,
    "skippedDuplicates": 43,
    "invited": 952,
    "failed": 5
  },
  "failures": [
    { "contact": { "phone": "+13051239999" }, "error": "Twilio: invalid number" }
  ]
}
```

### Quick Start

```bash
cd growth-flywheel
npm install
cp .env.example .env  # fill in Twilio + Resend keys
node index.js
```

**Upload a vendor's contact list:**
```bash
curl -X POST http://localhost:3001/vendor/vendor_001/upload-contacts \
  -F "contacts=@sample-contacts.csv"
```

### Sample CSV Format

```csv
name,phone,email
John Smith,+13051234568,john@example.com
Maria Garcia,+13051234569,maria@example.com
```

> Flexible column names supported: `phone / phone_number / mobile / cell / telephone`

> See [`growth-flywheel/`](./growth-flywheel/) for the full implementation.

---

## Files

| File | Description |
|------|-------------|
| `phone-verify-fix.js` | International phone verification fix |
| `loom-script.md` | Loom video script |
| `growth-flywheel/index.js` | Express server |
| `growth-flywheel/pipeline.js` | Pipeline orchestrator |
| `growth-flywheel/parser.js` | CSV parser with E.164 normalization |
| `growth-flywheel/deduplicator.js` | Duplicate filtering logic |
| `growth-flywheel/invites.js` | SMS + email invite sender with referral links |

---

## Why This Matters

Lemon's mission is to connect **everyone on Earth** with the right service. A signup flow that only works for US numbers directly contradicts that mission — and it's a two-line fix. The growth flywheel turns every vendor into a distribution channel, which is the fastest path to the network effect Lemon needs.
