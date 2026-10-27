const express = require('express');
const router = express.Router();
const {
  getAllEvidence,
  uploadEvidence,
  getEvidenceById,
  downloadEvidence,
  verifyEvidence,
} = require('../controllers/evidenceController');
const { protect } = require('../middleware/auth');
const { uploadSingleEvidence } = require('../middleware/upload');

// All evidence routes are protected
router.use(protect);

router.route('/')
  .get(getAllEvidence)
  .post(uploadSingleEvidence, uploadEvidence);

router.get('/:id', getEvidenceById);
router.get('/:id/download', downloadEvidence);
router.get('/:id/verify', verifyEvidence);

module.exports = router;
