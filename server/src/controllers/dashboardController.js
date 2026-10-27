const mongoose = require('mongoose');
const Parcel = require('../models/Parcel');
const Evidence = require('../models/Evidence');

/**
 * @desc    Get dashboard summary statistics using MongoDB aggregation
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getSummary = async (req, res, next) => {
  try {
    const sellerObjectId = new mongoose.Types.ObjectId(req.sellerId);

    // Run parallel aggregation pipelines
    const [statusAgg, totalEvidence, recentParcels, recentEvidence] = await Promise.all([
      // Status breakdown aggregation for seller
      Parcel.aggregate([
        { $match: { sellerId: sellerObjectId } },
        {
          $group: {
            _id: '$shipmentStatus',
            count: { $sum: 1 },
            totalValue: { $sum: '$declaredValue' },
          },
        },
      ]),

      // Total evidence count
      Evidence.countDocuments({ sellerId: req.sellerId }),

      // 5 most recent parcels
      Parcel.find({ sellerId: req.sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('parcelCode orderId customerName courierCompany trackingNumber shipmentStatus declaredValue createdAt')
        .lean(),

      // 5 most recent evidence uploads
      Evidence.find({ sellerId: req.sellerId })
        .populate('parcelId', 'parcelCode orderId')
        .sort({ uploadedAt: -1 })
        .limit(5)
        .select('evidenceType originalFilename fileSize mimeType uploadedAt sha256Hash')
        .lean(),
    ]);

    // Compute status counts
    const statusMap = {
      Booked: 0,
      'In Transit': 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Returned: 0,
      Cancelled: 0,
    };

    let totalParcels = 0;
    let totalDeclaredValue = 0;

    statusAgg.forEach((item) => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
      totalParcels += item.count;
      totalDeclaredValue += item.totalValue || 0;
    });

    const stats = {
      totalParcels,
      deliveredParcels: statusMap['Delivered'] || 0,
      inTransitParcels: statusMap['In Transit'] || 0,
      outForDeliveryParcels: statusMap['Out for Delivery'] || 0,
      bookedParcels: statusMap['Booked'] || 0,
      returnedParcels: statusMap['Returned'] || 0,
      cancelledParcels: statusMap['Cancelled'] || 0,
      totalEvidence,
      totalDeclaredValue,
      statusDistribution: statusMap,
      recentParcels,
      recentEvidence,
    };

    res.status(200).json({
      success: true,
      stats,
      summary: stats,
      recentParcels,
      recentEvidence,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
