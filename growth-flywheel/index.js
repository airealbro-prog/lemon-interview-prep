// Growth Flywheel Service
// Pipeline: Vendor uploads customer CSV → deduplicate → send personalized invites
// Each invite contains a viral referral link tied to the vendor

require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { processVendorUpload } = require("./pipeline");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());

// Vendor uploads their customer contact list
// POST /vendor/:vendorId/upload-contacts
// Body: multipart/form-data with a CSV file
app.post("/vendor/:vendorId/upload-contacts", upload.single("contacts"), async (req, res) => {
  const { vendorId } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "No CSV file uploaded" });
  }

  try {
    const result = await processVendorUpload(vendorId, req.file.buffer);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Growth Flywheel running on port ${PORT}`));
