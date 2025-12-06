// controllers/adminPayment/getPaymentStats.js
const Payment = require("../../models/Payment");

// @desc    Get payment statistics
// @route   GET /api/admin/payments/stats
// @access  Private/Admin
const getPaymentStats = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    const today = new Date();
    const startOfPeriod = new Date();
    
    if (period === 'weekly') {
      startOfPeriod.setDate(today.getDate() - 7);
    } else if (period === 'monthly') {
      startOfPeriod.setMonth(today.getMonth() - 1);
    } else if (period === 'yearly') {
      startOfPeriod.setFullYear(today.getFullYear() - 1);
    }

    // Overall statistics
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfPeriod } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Monthly revenue trend
    const monthlyTrend = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfPeriod } } },
      { $group: { 
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Plan-wise statistics
    const planStats = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfPeriod } } },
      { $group: { 
        _id: '$planName',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }},
      { $sort: { total: -1 } }
    ]);

    // Payment method statistics
    const paymentMethodStats = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: startOfPeriod } } },
      { $group: { 
        _id: '$paymentMethod',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }}
    ]);

    // Success rate
    const totalTransactions = await Payment.countDocuments({ createdAt: { $gte: startOfPeriod } });
    const successfulTransactions = await Payment.countDocuments({ 
      status: 'success', 
      createdAt: { $gte: startOfPeriod } 
    });
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions * 100) : 0;

    // Upcoming renewals (next 7 days)
    const upcomingRenewals = await Payment.find({
      status: 'success',
      autoRenewal: true,
      renewalStatus: 'scheduled',
      expiryDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    .populate('userId', 'username email')
    .sort({ expiryDate: 1 })
    .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        period,
        totalRevenue: totalRevenue[0]?.total || 0,
        transactionCount: totalRevenue[0]?.count || 0,
        successRate: successRate.toFixed(2),
        monthlyTrend,
        planStats,
        paymentMethodStats,
        upcomingRenewals: upcomingRenewals.map(payment => ({
          id: payment._id,
          transactionId: payment.transactionId,
          user: payment.userId ? {
            id: payment.userId._id,
            username: payment.userId.username,
            email: payment.userId.email
          } : null,
          planName: payment.planName,
          amount: payment.amount,
          expiryDate: payment.expiryDate,
          autoRenewal: payment.autoRenewal
        }))
      }
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = getPaymentStats;