// controllers/payment/paymentController.js
const createOrder = require('./createOrder');
const verifyPayment = require('./verifyPayment');
const handlePaymentWebhook = require('./handlePaymentWebhook');
const getUserPayments = require('./getUserPayments');
const getUserPlanDetails = require('./getUserPlanDetails');
const updateUserPlan = require('./updateUserPlan');
const downloadInvoice = require('./downloadInvoice');

module.exports = {
  createOrder,
  verifyPayment,
  handlePaymentWebhook,
  getUserPayments,
  getUserPlanDetails,
  updateUserPlan,
  downloadInvoice
};