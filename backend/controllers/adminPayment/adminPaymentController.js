// controllers/adminPayment/adminPaymentController.js
const getAllPayments = require('./getAllPayments');
const getPaymentById = require('./getPaymentById');
const updatePaymentStatus = require('./updatePaymentStatus');
// const toggleAutoRenewal = require('./toggleAutoRenewal');
const getPaymentStats = require('./getPaymentStats');
// const deletePayment = require('./deletePayment');

module.exports = {
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
//   toggleAutoRenewal,
  getPaymentStats,
//   deletePayment
};