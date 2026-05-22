# Loom Script — Lemon App Bug Fix (90 seconds)

---

## [0:00 – 0:20] Show the Bug

Open the Lemon app on your phone.

Say:
"I downloaded Lemon before this interview. The first thing I tried was signing up with my number — a Sri Lankan number. Watch what happens."

Enter your number with the +94 country code. Show that no SMS arrives or the number gets rejected.

Say:
"No verification code. I'm completely locked out. Any non-US user hits this same wall on day one."

---

## [0:20 – 0:45] Diagnose the Root Cause

Cut to your code editor showing the broken snippet.

Say:
"The root cause is here. The backend validates phone numbers against a US-only regex — 10 digits, no country code. Then it hardcodes a +1 prefix before passing the number to Twilio. So a Sri Lankan number like 0771234567 gets sent to Twilio as +10771234567 — which is not a real number. Twilio rejects it. No SMS sent."

Point at these two lines:
- The `^\d{10}$` regex
- The `+1${phoneNumber}` hardcoded prefix

---

## [0:45 – 1:20] Show the Fix

Cut to the fixed code.

Say:
"The fix is straightforward. I brought in libphonenumber-js — the industry standard for international phone parsing. Now the API accepts a phone number and a country code from the frontend. It validates the combination, then formats it to E.164 — the format Twilio actually expects."

Point at this line:
`parsePhoneNumber("0771234567", "LK").format("E.164") → +94771234567`

Say:
"That's the correct format. Twilio sends the SMS. User gets in. Every country works — not just the US."

Scroll down briefly to show the Express routes.

Say:
"The routes are clean. Frontend sends a phone number and country code. Backend normalizes, sends the code, stores it with a 10-minute TTL, and verifies on the second call. Production-ready."

---

## [1:20 – 1:30] Close

Look at camera.

Say:
"This bug blocks every international user from signing up — which is a problem for a platform whose mission is to connect everyone on Earth with the right service. I found it, diagnosed it, and wrote the fix. Happy to ship it on day one."

---

## Notes

- Keep your tone calm and direct — no hype, just clarity
- Screen record your phone for the bug demo, then switch to desktop for the code
- Upload to Loom, copy the link, and drop it into the interview chat the moment the call starts
- Repo link goes in the same message as the Loom link
