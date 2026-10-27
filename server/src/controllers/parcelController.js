const Parcel = require('../models/Parcel');
const Evidence = require('../models/Evidence');

// Generate unique parcel code format: PRCL-XXXXXX
const generateParcelCode = () => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampPart = Date.now().toString(36).slice(-4).toUpperCase();
  return `PRCL-${timestampPart}${randomPart}`;
};

/**
 * @desc    Get all parcels for current seller with pagination, filtering & search
 * @route   GET /api/parcels
 * @access  Private
 */
const getParcels = async (req, res, next) => {
  try {
    const {
      search,
      status,
      courier,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { sellerId: req.sellerId };

    // Status filter
    if (status && status !== 'All') {
      query.shipmentStatus = status;
    }

    // Courier filter
    if (courier && courier !== 'All') {
      query.courierCompany = courier;
    }

    // Search query across code, orderId, customerName, trackingNumber, productName
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { parcelCode: searchRegex },
        { orderId: searchRegex },
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { trackingNumber: searchRegex },
        { productName: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sort order
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const total = await Parcel.countDocuments(query);
    const parcels = await Parcel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: parcels.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      parcels,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new parcel
 * @route   POST /api/parcels
 * @access  Private
 */
const createParcel = async (req, res, next) => {
  try {
    const {
      parcelCode,
      orderId,
      productName,
      quantity,
      declaredValue,
      customerName,
      customerPhone,
      shippingAddress,
      courierCompany,
      trackingNumber,
      dispatchDate,
      shipmentStatus = 'Booked',
      notes,
    } = req.body;

    // Validate mandatory required fields
    if (
      !orderId?.trim() ||
      !productName?.trim() ||
      !customerName?.trim() ||
      !customerPhone?.trim() ||
      !shippingAddress?.trim() ||
      !courierCompany?.trim() ||
      !trackingNumber?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: Order ID, Product Name, Customer Name, Customer Phone, Shipping Address, Courier Company, and Tracking Number.',
      });
    }

    // Validate quantity
    const numQuantity = Number(quantity);
    if (quantity === undefined || quantity === null || isNaN(numQuantity) || numQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid integer greater than or equal to 1.',
      });
    }

    // Validate declared value
    const numDeclaredValue = Number(declaredValue);
    if (declaredValue === undefined || declaredValue === null || isNaN(numDeclaredValue) || numDeclaredValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Declared value must be a valid non-negative number.',
      });
    }

    // Determine parcel code
    let finalCode = (parcelCode || '').trim().toUpperCase();
    if (!finalCode) {
      finalCode = generateParcelCode();
    }

    // Check if parcelCode already exists for this seller
    const codeExists = await Parcel.findOne({
      sellerId: req.sellerId,
      parcelCode: finalCode,
    });

    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: `A parcel with code ${finalCode} already exists in your inventory.`,
      });
    }

    // Prepare initial status history entry
    const initialStatusHistory = [
      {
        previousStatus: shipmentStatus,
        newStatus: shipmentStatus,
        changedAt: new Date(),
        note: notes ? `Initial registration: ${notes}` : 'Parcel booked in ParcelProof system',
      },
    ];

    const parcel = await Parcel.create({
      sellerId: req.sellerId,
      parcelCode: finalCode,
      orderId: orderId.trim(),
      productName: productName.trim(),
      quantity: Math.floor(numQuantity),
      declaredValue: numDeclaredValue,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      courierCompany: courierCompany.trim(),
      trackingNumber: trackingNumber.trim(),
      dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
      shipmentStatus,
      notes: (notes || '').trim(),
      statusHistory: initialStatusHistory,
    });

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully.',
      parcel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get parcel by ID with linked evidence records
 * @route   GET /api/parcels/:id
 * @access  Private
 */
const getParcelById = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found or access unauthorized.',
      });
    }

    // Fetch related evidence files for this parcel
    const evidence = await Evidence.find({
      parcelId: parcel._id,
      sellerId: req.sellerId,
    }).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      parcel,
      evidence,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update parcel details
 * @route   PUT /api/parcels/:id
 * @access  Private
 */
const updateParcel = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found or access unauthorized.',
      });
    }

    const {
      orderId,
      productName,
      quantity,
      declaredValue,
      customerName,
      customerPhone,
      shippingAddress,
      courierCompany,
      trackingNumber,
      dispatchDate,
      notes,
    } = req.body;

    if (orderId) parcel.orderId = orderId.trim();
    if (productName) parcel.productName = productName.trim();
    if (typeof quantity !== 'undefined') {
      const q = Number(quantity);
      if (isNaN(q) || q < 1) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a valid integer greater than or equal to 1.',
        });
      }
      parcel.quantity = Math.floor(q);
    }
    if (typeof declaredValue !== 'undefined') {
      const v = Number(declaredValue);
      if (isNaN(v) || v < 0) {
        return res.status(400).json({
          success: false,
          message: 'Declared value must be a valid non-negative number.',
        });
      }
      parcel.declaredValue = v;
    }
    if (customerName) parcel.customerName = customerName.trim();
    if (customerPhone) parcel.customerPhone = customerPhone.trim();
    if (shippingAddress) parcel.shippingAddress = shippingAddress.trim();
    if (courierCompany) parcel.courierCompany = courierCompany;
    if (trackingNumber) parcel.trackingNumber = trackingNumber.trim();
    if (dispatchDate) parcel.dispatchDate = new Date(dispatchDate);
    if (typeof notes !== 'undefined') parcel.notes = notes.trim();

    await parcel.save();

    res.status(200).json({
      success: true,
      message: 'Parcel updated successfully.',
      parcel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update parcel shipment status and record timeline entry
 * @route   PATCH /api/parcels/:id/status
 * @access  Private
 */
const updateParcelStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'New shipment status is required.',
      });
    }

    const validStatuses = [
      'Booked',
      'In Transit',
      'Out for Delivery',
      'Delivered',
      'Returned',
      'Cancelled',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const parcel = await Parcel.findOne({
      _id: req.params.id,
      sellerId: req.sellerId,
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found or access unauthorized.',
      });
    }

    const previousStatus = parcel.shipmentStatus;
    parcel.shipmentStatus = status;

    // Push history item
    parcel.statusHistory.push({
      previousStatus,
      newStatus: status,
      changedAt: new Date(),
      note: (note || '').trim() || `Status updated from ${previousStatus} to ${status}`,
    });

    await parcel.save();

    res.status(200).json({
      success: true,
      message: `Shipment status updated to ${status}.`,
      parcel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get parcel status history timeline
 * @route   GET /api/parcels/:id/history
 * @access  Private
 */
const getParcelHistory = async (req, res, next) => {
  try {
    const parcel = await Parcel.findOne(
      { _id: req.params.id, sellerId: req.sellerId },
      'parcelCode trackingNumber shipmentStatus statusHistory createdAt'
    );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.',
      });
    }

    res.status(200).json({
      success: true,
      parcelCode: parcel.parcelCode,
      currentStatus: parcel.shipmentStatus,
      history: parcel.statusHistory,
      statusHistory: parcel.statusHistory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParcels,
  createParcel,
  getParcelById,
  updateParcel,
  updateParcelStatus,
  getParcelHistory,
};
