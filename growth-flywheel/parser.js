// Parses vendor CSV into normalized contact objects
// Accepts flexible column names (e.g. "Phone", "phone_number", "mobile")

const csv = require("csv-parse/sync");
const { parsePhoneNumber, isValidPhoneNumber } = require("libphonenumber-js");

const PHONE_ALIASES = ["phone", "phone_number", "mobile", "cell", "telephone", "contact"];
const EMAIL_ALIASES = ["email", "email_address", "e-mail", "mail"];
const NAME_ALIASES  = ["name", "full_name", "customer_name", "first_name", "contact_name"];

function resolveColumn(headers, aliases) {
  return headers.find((h) => aliases.includes(h.toLowerCase().trim()));
}

async function parseCSV(buffer) {
  const records = csv.parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (records.length === 0) return [];

  const headers = Object.keys(records[0]);
  const phoneCol = resolveColumn(headers, PHONE_ALIASES);
  const emailCol = resolveColumn(headers, EMAIL_ALIASES);
  const nameCol  = resolveColumn(headers, NAME_ALIASES);

  const contacts = [];

  for (const row of records) {
    const rawPhone = phoneCol ? row[phoneCol] : null;
    const email    = emailCol ? row[emailCol]?.toLowerCase() : null;
    const name     = nameCol  ? row[nameCol] : null;

    // Each contact needs at least a phone or email to be reachable
    if (!rawPhone && !email) continue;

    let phone = null;
    if (rawPhone) {
      // Default to US; vendor can pass countryCode column in future iteration
      const cleaned = rawPhone.replace(/\s|-|\(|\)/g, "");
      if (isValidPhoneNumber(cleaned, "US") || isValidPhoneNumber(cleaned)) {
        phone = parsePhoneNumber(cleaned, "US").format("E.164");
      }
    }

    contacts.push({ name, phone, email });
  }

  return contacts;
}

module.exports = { parseCSV };
