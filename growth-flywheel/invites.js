// Invite sender — SMS via Twilio, email via Resend
// Each invite is personalized to the vendor and contains a viral referral link

const twilio = require("twilio");
const { Resend } = require("resend");

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendInvites(vendorId, contacts) {
  const sent   = [];
  const failed = [];

  // Run all invites concurrently — don't send sequentially
  const results = await Promise.allSettled(
    contacts.map((contact) => sendSingleInvite(vendorId, contact))
  );

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      sent.push(contacts[i]);
    } else {
      failed.push({ contact: contacts[i], error: result.reason?.message });
    }
  });

  return { sent, failed };
}

async function sendSingleInvite(vendorId, contact) {
  const referralLink = buildReferralLink(vendorId, contact);
  const vendorName   = await getVendorName(vendorId);
  const greeting     = contact.name ? `Hi ${contact.name.split(" ")[0]}` : "Hi there";

  const message = `${greeting}, ${vendorName} invited you to Lemon — the easiest way to book local services. Join here: ${referralLink}`;

  if (contact.phone) {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: contact.phone,
    });
  } else if (contact.email) {
    await resend.emails.send({
      from: `${vendorName} via Lemon <invites@uselemon.com>`,
      to: contact.email,
      subject: `${vendorName} invited you to Lemon`,
      html: `<p>${message}</p>`,
    });
  } else {
    throw new Error("Contact has no phone or email");
  }
}

function buildReferralLink(vendorId, contact) {
  const base = process.env.APP_BASE_URL || "https://uselemon.com";
  const ref  = Buffer.from(`${vendorId}:${contact.phone || contact.email}`).toString("base64url");
  return `${base}/join?ref=${ref}`;
}

// Replace with real DB lookup in production
async function getVendorName(vendorId) {
  const vendors = {
    vendor_001: "Glow Beauty Studio",
    vendor_002: "Iron & Co. Fitness",
  };
  return vendors[vendorId] || "A local business";
}

module.exports = { sendInvites };
