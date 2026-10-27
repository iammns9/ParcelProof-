const path = require('path');
const fs = require('fs');
const Evidence = require('../models/Evidence');
const Parcel = require('../models/Parcel');
const { calculateFileHash, verifyFileIntegrity } = require('../utils/hashUtil');
const { uploadDir } = require('../middleware/upload');

// Size limits in bytes
const SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10 MB
  PDF: 10 * 1024 * 1024,   // 10 MB
  VIDEO: 50 * 1024 * 1024, // 50 MB
};

/**
 * @desc    Upload evidence file linked to a parcel
 * @route   POST /api/parcels/:id/evidence OR POST /api/evidence
 * @access  Private
 */
const uploadEvidence = async (req, res, next) => {
  try {
    const parcelId = req.params.id || req.body.parcelId;
    const { evidenceType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded. Please attach a file.',
      });
    }

    if (!parcelId) {
      // Remove temporary uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Parcel ID is required to link evidence.',
      });
    }

    if (!evidenceType) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Evidence category is required.',
      });
    }

    // Verify parcel belongs to authenticated seller
    const parcel = await Parcel.findOne({
      _id: parcelId,
      sellerId: req.sellerId,
    });

    if (!parcel) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Associated parcel not found or access unauthorized.',
      });
    }

    // Validate category specific limits
    const fileSize = req.file.size;
    const mime = req.file.mimetype.toLowerCase();

    if (mime.startsWith('image/') && fileSize > SIZE_LIMITS.IMAGE) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Image files must not exceed 10 MB.',
      });
    }

    if (mime === 'application/pdf' && fileSize > SIZE_LIMITS.PDF) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'PDF files must not exceed 10 MB.',
      });
    }

    if (mime.startsWith('video/') && fileSize > SIZE_LIMITS.VIDEO) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Video files must not exceed 50 MB.',
      });
    }

    // Calculate SHA-256 cryptographic hash of the saved file
    const sha256Hash = await calculateFileHash(req.file.path);

    // Persist evidence record
    const evidence = await Evidence.create({
      parcelId: parcel._id,
      sellerId: req.sellerId,
      evidenceType,
      originalFilename: req.file.originalname,
      storageKey: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256Hash,
      uploadedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Evidence uploaded and cryptographic hash generated successfully.',
      evidence,
    });
  } catch (error) {
    // Cleanup physical file on failure if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Failed to clean up uploaded file:', e);
      }
    }
    next(error);
  }
};

/**
 * @desc    Get all evidence records for current seller with optional filtering
 * @route   GET /api/evidence
 * @access  Private
 */
const getAllEvidence = async (req, res, next) => {
  try {
    const { parcelId, evidenceType, search, page = 1, limit = 20 } = req.query;

    const query = { sellerId: req.sellerId };

    if (parcelId) {
      query.parcelId = parcelId;
    }

    if (evidenceType && evidenceType !== 'All') {
      query.evidenceType = evidenceType;
    }

    if (search && search.trim() !== '') {
      query.originalFilename = new RegExp(search.trim(), 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await Evidence.countDocuments(query);
    const evidenceList = await Evidence.find(query)
      .populate('parcelId', 'parcelCode orderId customerName courierCompany trackingNumber')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: evidenceList.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      evidence: evidenceList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get evidence files for a specific parcel
 * @route   GET /api/parcels/:id/evidence
 * @access  Private
 */
const getParcelEvidence = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.',
      });
    }

    const evidence = await Evidence.find({
      parcelId: parcel._id,
      sellerId: req.sellerId,
    }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: evidence.length,
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single evidence metadata
 * @route   GET /api/evidence/:id
 * @access  Private
 */
const getEvidenceById = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    }).populate('parcelId', 'parcelCode orderId customerName courierCompany trackingNumber');

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found.',
      });
    }

    res.status(200).json({
      success: true,
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Securely download or preview evidence file (authenticated streaming)
 * @route   GET /api/evidence/:id/download
 * @access  Private
 */
const downloadEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found or access unauthorized.',
      });
    }

    const filePath = path.join(uploadDir, evidence.storageKey);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical file not found in secure storage.',
      });
    }

    // Determine inline preview vs attachment download
    const isInline = req.query.inline === 'true';
    const dispositionType = isInline ? 'inline' : 'attachment';

    res.setHeader('Content-Type', evidence.mimeType);
    res.setHeader(
      'Content-Disposition',
      `${dispositionType}; filename="${encodeURIComponent(evidence.originalFilename)}"`
    );
    res.setHeader('Cache-Control', 'private, max-age=3600');

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify evidence integrity by recalculating SHA-256 from stored disk file
 * @route   GET /api/evidence/:id/verify
 * @access  Private
 */
const verifyEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    }).populate('parcelId', 'parcelCode orderId customerName');

    if (!evidence) {
      return res.status(404).json({
        success: false,
        message: 'Evidence record not found.',
      });
    }

    const filePath = path.join(uploadDir, evidence.storageKey);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Physical evidence file was not found in server storage.',
        evidenceId: evidence._id,
        verification: {
          isValid: false,
          computedHash: null,
          expectedHash: evidence.sha256Hash,
          fileMissing: true,
          explanation: 'Physical evidence file was not found in server storage. Integrity cannot be verified.',
          disclaimer: 'Notice: SHA-256 cryptographic verification confirms digital file integrity against the registered upload signature. It does not verify the physical contents or condition of the parcel.',
        },
      });
    }

    const verification = await verifyFileIntegrity(filePath, evidence.sha256Hash);

    res.status(200).json({
      success: true,
      evidenceId: evidence._id,
      originalFilename: evidence.originalFilename,
      category: evidence.evidenceType,
      parcelCode: evidence.parcelId?.parcelCode,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadEvidence,
  getAllEvidence,
  getParcelEvidence,
  getEvidenceById,
  downloadEvidence,
  verifyEvidence,
};
