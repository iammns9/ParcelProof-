const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema(
  {
    previousStatus: {
      type: String,
      required: true,
      enum: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'],
    },
    newStatus: {
      type: String,
      required: true,
      enum: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'],
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const parcelSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller ID is required'],
      index: true,
    },
    parcelCode: {
      type: String,
      required: [true, 'Parcel code is required'],
      trim: true,
      uppercase: true,
      index: true,
    },
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      trim: true,
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    declaredValue: {
      type: Number,
      required: [true, 'Declared value in PKR is required'],
      min: [0, 'Declared value cannot be negative'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    shippingAddress: {
      type: String,
      required: [true, 'Shipping address is required'],
      trim: true,
    },
    courierCompany: {
      type: String,
      required: [true, 'Courier company is required'],
      enum: {
        values: ['TCS', 'Leopards', 'M&P', 'Pakistan Post', 'Other'],
        message: '{VALUE} is not a supported courier company',
      },
    },
    trackingNumber: {
      type: String,
      required: [true, 'Tracking number is required'],
      trim: true,
    },
    dispatchDate: {
      type: Date,
      default: Date.now,
    },
    shipmentStatus: {
      type: String,
      required: true,
      enum: {
        values: ['Booked', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned', 'Cancelled'],
        message: '{VALUE} is not a valid shipment status',
      },
      default: 'Booked',
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Composite indexes for efficient seller-scoped searching and filtering
parcelSchema.index({ sellerId: 1, createdAt: -1 });
parcelSchema.index({ sellerId: 1, shipmentStatus: 1 });
parcelSchema.index({ sellerId: 1, parcelCode: 1 }, { unique: true });

const Parcel = mongoose.model('Parcel', parcelSchema);

module.exports = Parcel;
