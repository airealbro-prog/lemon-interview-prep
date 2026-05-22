// Core pipeline: parse → deduplicate → invite → track

const { parseCSV } = require("./parser");
const { deduplicateContacts } = require("./deduplicator");
const { sendInvites } = require("./invites");

async function processVendorUpload(vendorId, csvBuffer) {
  // Step 1: Parse CSV into contact objects
  const contacts = await parseCSV(csvBuffer);

  if (contacts.length === 0) {
    return { success: false, error: "No valid contacts found in CSV" };
  }

  // Step 2: Deduplicate — remove contacts already on Lemon or already invited
  const { fresh, skipped } = await deduplicateContacts(vendorId, contacts);

  // Step 3: Send personalized invites with viral referral links
  const { sent, failed } = await sendInvites(vendorId, fresh);

  return {
    success: true,
    summary: {
      totalParsed: contacts.length,
      skippedDuplicates: skipped.length,
      invited: sent.length,
      failed: failed.length,
    },
    // Expose failures so vendor can review and retry
    failures: failed,
  };
}

module.exports = { processVendorUpload };
