const express = require('express');
const router = express.Router();
const {
  getParcels,
  createParcel,
  getParcelById,
  updateParcel,
  updateParcelStatus,
  getParcelHistory,
} = require('../controllers/parcelController');
const {
  uploadEvidence,
  getParcelEvidence,
} = require('../controllers/evidenceController');
const { protect } = require('../middleware/auth');
const { uploadSingleEvidence } = require('../middleware/upload');

// All parcel routes are protected
router.use(protect);

router.route('/')
  .get(getParcels)
  .post(createParcel);

router.route('/:id')
  .get(getParcelById)
  .put(updateParcel);

router.patch('/:id/status', updateParcelStatus);
router.get('/:id/history', getParcelHistory);

// Evidence routes linked directly to parcel
router.route('/:id/evidence')
  .get(getParcelEvidence)
  .post(uploadSingleEvidence, uploadEvidence);

module.exports = router;
