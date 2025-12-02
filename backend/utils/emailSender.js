const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send invoice email - Modern Startup Design
 */
async function sendInvoiceEmail(
  to,
  pdfBuffer,
  transactionId,
  userName,
  amountDisplay,
  planName,
  billingCycle
) {
  const safeName = userName || "Customer";
  const safeAmount = amountDisplay || "—";
  const safePlan = planName || "Subscription Plan";
  const safeCycle = billingCycle || "billing";

  const currentYear = new Date().getFullYear();
  const dashboardUrl = `${process.env.CLIENT_URL || "https://app.startupbuilder.com"}/dashboard/billing`;

  return transporter.sendMail({
    from: `"Startup Builder Team" <${process.env.SMTP_USER}>`,
    to,
    subject: `🚀 Invoice ${transactionId} | Your Startup Builder Subscription`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Poppins', sans-serif;
    -webkit-font-smoothing: antialiased;
    background: linear-gradient(135deg, #667eea0d 0%, #764ba20d 50%, #f093fb0d 100%);
  }
  
  .gradient-text {
    background: linear-gradient(90deg, #667eea, #f093fb, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .pulse-ring {
    animation: pulse-ring 2s infinite;
  }
  
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.8; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  .floating {
    animation: float 3s ease-in-out infinite;
  }
  
  .grid-pattern {
    background-image: 
      radial-gradient(circle at 25px 25px, rgba(102, 126, 234, 0.1) 2%, transparent 0%), 
      radial-gradient(circle at 75px 75px, rgba(118, 75, 162, 0.1) 2%, transparent 0%);
    background-size: 100px 100px;
  }
  
  @media (prefers-color-scheme: dark) {
    body {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%) !important;
    }
    .card {
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
    }
    .summary-card {
      background: rgba(30, 41, 59, 0.5) !important;
      border: 1px solid rgba(102, 126, 234, 0.2) !important;
    }
    .text-primary { color: #c7d2fe !important; }
    .text-muted { color: #94a3b8 !important; }
    .btn-primary {
      background: linear-gradient(90deg, #667eea, #764ba2) !important;
      border: none !important;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3) !important;
    }
  }
</style>
</head>
<body style="padding: 40px 20px;">
  <div style="max-width: 680px; margin: 0 auto; position: relative;">
    
    <!-- Background Elements -->
    <div style="position: absolute; top: -100px; right: -100px; width: 300px; height: 300px; 
                background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%); 
                z-index: 0;"></div>
    <div style="position: absolute; bottom: -100px; left: -100px; width: 300px; height: 300px; 
                background: radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%); 
                z-index: 0;"></div>
    
    <!-- Main Card -->
    <div class="card" style="
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.1);
      position: relative;
      z-index: 1;
      overflow: hidden;
    ">
      
      <!-- Header with Abstract Pattern -->
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
        padding: 40px 30px 60px;
        position: relative;
        overflow: hidden;
      ">
        <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; 
                    background: radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        <div style="position: absolute; bottom: 0; left: 0; width: 150px; height: 150px; 
                    background: radial-gradient(circle at bottom left, rgba(255,255,255,0.1) 0%, transparent 50%);"></div>
        
        <div style="text-align: center; position: relative; z-index: 2;">
          <div style="
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(5px);
            border-radius: 16px;
            padding: 12px 20px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 25px;
            border: 1px solid rgba(255, 255, 255, 0.2);
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #ffffff;
              border-radius: 50%;
              position: relative;
            ">
              <div class="pulse-ring" style="
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.5);
              "></div>
            </div>
            <span style="color: white; font-weight: 500; font-size: 14px; letter-spacing: 1px;">INVOICE RECEIPT</span>
          </div>
          
          <h1 style="
            font-family: 'Space Grotesk', sans-serif;
            font-size: 42px;
            font-weight: 700;
            margin: 0 0 10px;
            color: white;
          ">
            Startup<span style="font-weight: 300;">Builder</span>
          </h1>
          
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">
            Building tomorrow's unicorns, today
          </p>
        </div>
      </div>
      
      <!-- Content Area -->
      <div style="padding: 40px; position: relative; z-index: 2;">
        
        <!-- Success Badge -->
        <div style="
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          border-radius: 12px;
          padding: 20px;
          margin: -60px auto 40px;
          max-width: 500px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
          position: relative;
          z-index: 3;
        ">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
            <div style="
              width: 40px;
              height: 40px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.6667 5L7.50004 14.1667L3.33337 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 style="margin: 0; color: white; font-size: 22px; font-weight: 600;">Payment Successful!</h2>
              <p style="margin: 5px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                Your subscription is now active
              </p>
            </div>
          </div>
        </div>
        
        <!-- Greeting -->
        <div style="text-align: center; margin-bottom: 40px;">
          <h3 style="
            font-family: 'Space Grotesk', sans-serif;
            font-size: 24px;
            font-weight: 600;
            margin: 0 0 15px;
            color: #1e293b;
          ">
            Hello <span class="gradient-text" style="font-weight: 700;">${safeName}</span> 👋
          </h3>
          <p style="
            color: #64748b;
            font-size: 16px;
            line-height: 1.6;
            max-width: 500px;
            margin: 0 auto;
          ">
            Thank you for choosing Startup Builder! Your payment has been processed successfully and your invoice is attached to this email.
          </p>
        </div>
        
        <!-- Summary Card -->
        <div class="summary-card" style="
          background: #f8fafc;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          padding: 30px;
          margin-bottom: 40px;
          position: relative;
        ">
          <div style="position: absolute; top: 20px; right: 20px;">
            <div style="
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          
          <h4 style="
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 25px;
            display: flex;
            align-items: center;
            gap: 10px;
          ">
            <span style="
              width: 4px;
              height: 20px;
              background: linear-gradient(to bottom, #667eea, #764ba2);
              border-radius: 2px;
            "></span>
            Transaction Details
          </h4>
          
          <div class="grid-pattern" style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            background-size: 100px 100px;
            padding: 20px;
            border-radius: 16px;
          ">
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500;">TRANSACTION ID</div>
              <div style="
                font-family: 'Space Grotesk', sans-serif;
                font-size: 16px;
                font-weight: 600;
                color: #1e293b;
                word-break: break-all;
              ">${transactionId}</div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500;">AMOUNT PAID</div>
              <div style="
                font-family: 'Space Grotesk', sans-serif;
                font-size: 24px;
                font-weight: 700;
                color: #10b981;
                background: linear-gradient(90deg, #10b981, #34d399);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              ">${safeAmount}</div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500;">PLAN</div>
              <div style="
                font-family: 'Space Grotesk', sans-serif;
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
              ">${safePlan}</div>
            </div>
            
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 8px; font-weight: 500;">BILLING CYCLE</div>
              <div style="
                font-family: 'Space Grotesk', sans-serif;
                font-size: 16px;
                font-weight: 600;
                color: #667eea;
                text-transform: capitalize;
              ">${safeCycle}</div>
            </div>
          </div>
        </div>
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 50px 0 40px;">
          <a href="${dashboardUrl}" class="btn-primary" style="
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 16px 40px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 30px rgba(102, 126, 234, 0.4)'" 
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.3)'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 19C9 19.75 8.79 20.46 8.42 21.06C7.73 22.22 6.46 23 5 23C3.54 23 2.27 22.22 1.58 21.06C1.21 20.46 1 19.75 1 19C1 16.24 3.24 14 6 14C8.76 14 11 16.24 11 19Z" stroke="white" stroke-width="2"/>
              <path d="M17 21C19.2091 21 21 19.2091 21 17C21 14.7909 19.2091 13 17 13C14.7909 13 13 14.7909 13 17C13 19.2091 14.7909 21 17 21Z" stroke="white" stroke-width="2"/>
              <path d="M22 12V8C22 6.93913 21.5786 5.92172 20.8284 5.17157C20.0783 4.42143 19.0609 4 18 4H4C2.93913 4 1.92172 4.42143 1.17157 5.17157C0.421427 5.92172 0 6.93913 0 8V16C0 17.0609 0.421427 18.0783 1.17157 18.8284C1.92172 19.5786 2.93913 20 4 20H12" stroke="white" stroke-width="2"/>
            </svg>
            Open Billing Dashboard
          </a>
          
          <p style="
            color: #94a3b8;
            font-size: 14px;
            margin-top: 20px;
          ">
            Your invoice PDF is attached to this email. Download it for your records.
          </p>
        </div>
        
        <!-- Support Section -->
        <div style="
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          border: 1px solid #e2e8f0;
        ">
          <div style="display: inline-flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
                      stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h4 style="margin: 0; color: #1e293b; font-size: 18px; font-weight: 600;">Need Help?</h4>
          </div>
          <p style="color: #64748b; font-size: 15px; margin: 0 0 15px;">
            Our support team is here to help you succeed
          </p>
          <a href="mailto:support@startupbuilder.com" style="
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
            font-size: 15px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          ">
            support@startupbuilder.com
          </a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 25px;
        text-align: center;
      ">
        <div style="margin-bottom: 15px;">
          <span style="
            font-family: 'Space Grotesk', sans-serif;
            font-size: 20px;
            font-weight: 700;
            color: #1e293b;
          ">
            Startup<span style="font-weight: 300; color: #64748b;">Builder</span>
          </span>
        </div>
        <p style="
          color: #94a3b8;
          font-size: 13px;
          margin: 0 0 10px;
          line-height: 1.6;
        ">
          Empowering entrepreneurs to build, launch, and scale their dreams
        </p>
        <p style="
          color: #cbd5e1;
          font-size: 12px;
          margin: 0;
        ">
          © ${currentYear} Startup Builder. All rights reserved.
        </p>
      </div>
    </div>
    
    <!-- Floating Elements -->
    <div class="floating" style="
      position: absolute;
      top: 50px;
      left: -30px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
      border-radius: 50%;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(102, 126, 234, 0.1);
      z-index: 0;
    "></div>
    
    <div class="floating" style="
      position: absolute;
      bottom: 100px;
      right: -30px;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f093fb20 0%, #764ba220 100%);
      border-radius: 50%;
      backdrop-filter: blur(5px);
      border: 1px solid rgba(118, 75, 162, 0.1);
      z-index: 0;
    "></div>
  </div>
</body>
</html>
    `,
    attachments: [
      {
        filename: `invoice-${transactionId}.pdf`,
        content: pdfBuffer,
      }
    ],
  });
}

module.exports = { sendInvoiceEmail };