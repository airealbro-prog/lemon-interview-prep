// Deduplication layer
// Filters out contacts who are already Lemon users or already invited by this vendor
// In production: replace the Sets with real DB lookups (e.g. Supabase/Postgres)

// Simulated existing Lemon user store
const existingLemonUsers = new Set([
  "+13051234567",
  "existing@example.com",
]);

// Tracks who each vendor has already invited (vendorId → Set of phone/email)
const vendorInviteLog = new Map();

async function deduplicateContacts(vendorId, contacts) {
  if (!vendorInviteLog.has(vendorId)) {
    vendorInviteLog.set(vendorId, new Set());
  }

  const alreadyInvited = vendorInviteLog.get(vendorId);
  const fresh   = [];
  const skipped = [];

  for (const contact of contacts) {
    const identifier = contact.phone || contact.email;

    const isExistingUser = existingLemonUsers.has(contact.phone) ||
                           existingLemonUsers.has(contact.email);
    const alreadySent    = alreadyInvited.has(identifier);

    if (isExistingUser || alreadySent) {
      skipped.push({ ...contact, reason: isExistingUser ? "already_on_lemon" : "already_invited" });
    } else {
      fresh.push(contact);
      alreadyInvited.add(identifier); // Mark as invited so re-uploads don't resend
    }
  }

  return { fresh, skipped };
}

module.exports = { deduplicateContacts };
