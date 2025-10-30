// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT, // e.g., 587
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Your App" <${process.env.SMTP_FROM}>`,
    to,
    subject: 'Your OTP to reset password',
    html: `
      <p>We received a request to reset your password.</p>
      <p><strong>Your OTP is: ${otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendOtpEmail };
