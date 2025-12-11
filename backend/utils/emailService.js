const nodemailer = require('nodemailer');
 
// Force production mode for testing
console.log('🔧 Current NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 SMTP_USER:', process.env.SMTP_USER);
 
const sendEmail = async (emailOptions) => {
  try {
    console.log('📧 Attempting to send email to:', emailOptions.to);
   
    let transporter;
 
    // TEMPORARY: Force production mode for testing
    const isProduction = true; // Change this to force production
 
    if (isProduction) {
      console.log('🚀 USING PRODUCTION SMTP SETTINGS');
      console.log('🔧 SMTP Host:', process.env.SMTP_HOST);
      console.log('🔧 SMTP User:', process.env.SMTP_USER);
     
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false
        }
      });
 
      // Verify connection
      await transporter.verify();
      console.log('✅ SMTP connection verified');
 
    } else {
      // Development - Ethereal email
      console.log('🔧 Using Ethereal email');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
 
    const mailOptions = {
      from: `"Paplixo" <${process.env.SMTP_USER}>`,
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
    };
 
    console.log('📤 Sending via:', isProduction ? 'PRODUCTION SMTP' : 'ETHEREAL');
   
    const info = await transporter.sendMail(mailOptions);
   
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
   
    if (!isProduction) {
      console.log('📧 Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
    } else {
      console.log('📧 Sent via production SMTP to:', emailOptions.to);
    }
   
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw error;
  }
};
 
module.exports = sendEmail;
 