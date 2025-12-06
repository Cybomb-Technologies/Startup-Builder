// testOtp.js
const { generateNumericOTP, hashOtp } = require('../../utils/otp');

exports.testOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateNumericOTP(6);
    const hashedOtp = await hashOtp(otp);
    
    console.log('🔧 TEST - Generated OTP:', otp);
    console.log('🔧 TEST - Hashed OTP:', hashedOtp);

    res.json({
      success: true,
      message: 'OTP generated successfully',
      otp: otp,
      hashedOtp: hashedOtp,
      email: email
    });
  } catch (error) {
    console.error('Test OTP error:', error);
    res.status(500).json({ error: error.message });
  }
};