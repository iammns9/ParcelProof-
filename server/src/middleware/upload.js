const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve upload directory
const uploadDir = path.resolve(__dirname, '../../storage/uploads');

// Ensure directory exists synchronously on startup
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'application/pdf',
]);

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.pdf']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueId = crypto.randomUUID();
    const safeKey = `${uniqueId}${ext}`;
    cb(null, safeKey);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
    return cb(
      new Error(
        `Unsupported file type (${ext || mime}). Only JPG, JPEG, PNG, WEBP, MP4, and PDF are allowed.`
      ),
      false
    );
  }

  cb(null, true);
};

// Enforce max 60MB ceiling at Multer level; category-specific limits enforced in validator/controller
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 60 * 1024 * 1024, // 60 MB safety ceiling
  },
});

// Middleware supporting both 'file' and 'evidenceFile' field names
const uploadSingleEvidence = (req, res, next) => {
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'evidenceFile', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      req.file = req.files['file']?.[0] || req.files['evidenceFile']?.[0];
    }
    next();
  });
};

module.exports = {
  upload,
  uploadSingleEvidence,
  uploadDir,
};
