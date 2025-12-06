// controllers/adminPayment/getAllPayments.js
const Payment = require("../../models/Payment");

// @desc    Get all payments with filtering and pagination
// @route   GET /api/admin/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      planId,
      userId,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (planId) {
      filter.planId = planId;
    }

    if (userId) {
      filter.userId = userId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { planName: { $regex: search, $options: 'i' } },
        { 'userEmail': { $regex: search, $options: 'i' } },
        { 'userName': { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const payments = await Payment.find(filter)
      .populate('userId', 'username email')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalPayments = await Payment.countDocuments(filter);

    // Calculate payment statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const paymentStats = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { 
        _id: { 
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' }
        },
        monthlyTotal: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Get plan-wise statistics
    const planStats = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { 
        _id: '$planName',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }},
      { $sort: { totalAmount: -1 } }
    ]);

    res.status(200).json({
      success: true,
      count: payments.length,
      total: totalPayments,
      totalPages: Math.ceil(totalPayments / limit),
      currentPage: parseInt(page),
      stats: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalTransactions: totalPayments,
        successRate: totalPayments > 0 
          ? ((await Payment.countDocuments({ status: 'success' })) / totalPayments * 100).toFixed(2)
          : 0,
        monthlyStats: paymentStats,
        planStats: planStats
      },
      payments: payments.map(payment => ({
        id: payment._id,
        transactionId: payment.transactionId,
        user: payment.userId ? {
          id: payment.userId._id,
          username: payment.userId.username,
          email: payment.userId.email
        } : null,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        planId: payment.planId,
        planName: payment.planName,
        billingCycle: payment.billingCycle,
        paymentMethod: payment.paymentMethod,
        autoRenewal: payment.autoRenewal,
        renewalStatus: payment.renewalStatus,
        createdAt: payment.createdAt,
        paidAt: payment.paidAt,
        expiryDate: payment.expiryDate
      }))
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = getAllPayments;