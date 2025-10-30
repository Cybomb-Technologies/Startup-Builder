// utils/otp.js
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

function generateNumericOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) otp += digits[Math.floor(Math.random() * digits.length)];
  return otp;
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, SALT_ROUNDS);
}

async function compareOtp(plainOtp, hash) {
  return bcrypt.compare(plainOtp, hash);
}

module.exports = { generateNumericOTP, hashOtp, compareOtp };