// Demo script — runs the full pipeline with mocked Twilio/Resend
// No real API keys needed. Safe to run live on camera.
// node demo.js

const fs = require("fs");
const path = require("path");
const { parseCSV } = require("./parser");
const { deduplicateContacts } = require("./deduplicator");

async function mockSendInvites(vendorId, contacts) {
  const sent = [];
  const failed = [];

  for (const contact of contacts) {
    const referralLink = `https://uselemon.com/join?ref=${Buffer.from(`${vendorId}:${contact.phone || contact.email}`).toString("base64url")}`;
    const channel = contact.phone ? "SMS" : "Email";
    const destination = contact.phone || contact.email;
    const greeting = contact.name ? `Hi ${contact.name.split(" ")[0]}` : "Hi there";

    console.log(`  ✓ [${channel}] → ${destination}`);
    console.log(`    "${greeting}, Glow Beauty Studio invited you to Lemon: ${referralLink}"`);
    sent.push(contact);
  }

  return { sent, failed };
}

async function runDemo() {
  console.log("=== Lemon Growth Flywheel — Live Demo ===\n");

  // Step 1: Parse
  console.log("STEP 1: Parsing vendor CSV...");
  const csvBuffer = fs.readFileSync(path.join(__dirname, "sample-contacts.csv"));
  const contacts = await parseCSV(csvBuffer);
  console.log(`  Parsed ${contacts.length} valid contacts\n`);

  // Step 2: Deduplicate
  console.log("STEP 2: Deduplicating...");
  const { fresh, skipped } = await deduplicateContacts("vendor_001", contacts);
  console.log(`  ${fresh.length} fresh contacts to invite`);
  console.log(`  ${skipped.length} skipped:`);
  skipped.forEach((s) => console.log(`    - ${s.email || s.phone} (${s.reason})`));
  console.log();

  // Step 3: Send invites (mocked)
  console.log("STEP 3: Sending personalized invites...");
  const { sent, failed } = await mockSendInvites("vendor_001", fresh);
  console.log();

  // Summary
  console.log("=== SUMMARY ===");
  console.log(`  Total parsed:       ${contacts.length}`);
  console.log(`  Skipped duplicates: ${skipped.length}`);
  console.log(`  Invites sent:       ${sent.length}`);
  console.log(`  Failed:             ${failed.length}`);
  console.log("\nIn production: swap mock sender for real Twilio + Resend calls.");
  console.log("1 vendor upload → thousands of personalized invites → viral referral loop.");
}

runDemo().catch(console.error);
