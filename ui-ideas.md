# UI Ideas — Visual Demo for the Interview

## Option 1: Live Pipeline Dashboard (Best Pick)
A single-page web app where you drag-drop a CSV and watch the pipeline animate in real time.

**What it looks like:**
- 3 animated stage cards: Parse → Deduplicate → Invite
- Each card lights up green as its step completes
- A live counter ticks up: "952 invites sent..." 
- Sample invite messages appear in a feed on the right as they fire
- Final summary card pops up at the end with the stats

**Why it works on camera:** You drag a file in, hit Send, and the whole flywheel runs visually in under 5 seconds. Zero explanation needed — they see exactly what it does.

**Stack:** Single HTML file with vanilla JS + the backend running locally. No framework needed.

---

## Option 2: Vendor Portal Mock (Most Product-Realistic)
A simple two-screen UI that looks like the actual vendor-facing product Lemon would ship.

**Screen 1 — Upload:**
- Lemon branding, vendor name ("Glow Beauty Studio")
- CSV drag-drop zone with column preview after upload
- "Send Invites" button

**Screen 2 — Results:**
- Summary stats: Parsed / Skipped / Sent / Failed
- A scrollable invite log showing each message sent
- A "referral link performance" placeholder section

**Why it works on camera:** Looks like a real product feature, not a dev tool. Shows you think in terms of what ships, not just what runs.

**Stack:** Next.js + Tailwind, or a single styled HTML file.

---

## Option 3: Terminal + Split Screen (Fastest to Build)
No UI build needed — just make the terminal output prettier.

**What to do:**
- Add color to `demo.js` output using the `chalk` package
- Green checkmarks for sent, yellow for skipped, red for failed
- A big ASCII progress bar as invites fire
- Box-draw the final summary

**Why it works on camera:** Takes 20 minutes to add, looks sharp on screen recording, no new dependencies beyond chalk.

**Stack:** Just update `demo.js`.

---

## Recommendation

If you have **1 hour**: build Option 1 — the animated pipeline dashboard. It's the most visually striking and requires no framework.

If you have **20 minutes**: do Option 3 — chalk up the terminal output. Fast, looks clean, zero risk.

If you want to go deeper: combine Option 1 visuals with Option 2 branding.

---

## Bonus: Phone Verification UI

A simple two-screen mobile mockup (in browser) showing:
- Screen 1: Phone input with a country code dropdown (+94 LK selected)
- Screen 2: OTP entry screen
- A toggle that switches between "Broken" and "Fixed" behavior so you can demo the bug and fix side by side

This directly pairs with the Loom bug demo and takes about 30 minutes to build as a static HTML page.
