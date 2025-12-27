const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${uniqueSuffix}-${safeName}`);
  }
});

const upload = multer({ storage });

// POST /api/upload/profile - single profile picture
router.post('/profile', upload.single('profilePicture'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const filePath = `/uploads/${req.file.filename}`;
    res.status(200).json({ success: true, path: filePath });
  } catch (err) {
    console.error('Profile upload error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/upload/media - multiple media files
router.post('/media', upload.array('media', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, message: 'No files uploaded' });
    const paths = req.files.map(f => `/uploads/${f.filename}`);
    res.status(200).json({ success: true, paths });
  } catch (err) {
    console.error('Media upload error', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
