const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Parcel',
      required: [true, 'Associated parcel ID is required'],
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true,
    },
    evidenceType: {
      type: String,
      required: [true, 'Evidence category is required'],
      enum: {
        values: [
          'Packing Photo',
          'Packing Video',
          'Shipping Label',
          'Courier Receipt',
          'PDF Document',
        ],
        message: '{VALUE} is not a valid evidence category',
      },
    },
    originalFilename: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    storageKey: {
      type: String,
      required: [true, 'Storage key is required'],
      unique: true,
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be greater than 0'],
    },
    sha256Hash: {
      type: String,
      required: [true, 'SHA-256 hash is required'],
      length: 64,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

evidenceSchema.index({ sellerId: 1, uploadedAt: -1 });
evidenceSchema.index({ parcelId: 1, uploadedAt: -1 });

const Evidence = mongoose.model('Evidence', evidenceSchema);

module.exports = Evidence;
