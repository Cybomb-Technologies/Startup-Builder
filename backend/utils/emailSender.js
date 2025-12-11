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
 * Send invoice email
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
  const dashboardUrl = `${process.env.CLIENT_URL || "https://pdfworks.com"}/dashboard`;

  return transporter.sendMail({
    from: `"Paplixo Billing" <${process.env.SMTP_USER}>`,
    to,
    subject: `Your Paplixo Invoice – ${transactionId}`,
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<style>
  body {
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }
  @keyframes subtleFade {
    0% { opacity: 0.95; }
    50% { opacity: 1; }
    100% { opacity: 0.95; }
  }
  .header-gradient {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
  }
  .header-gradient::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.1) 75%, transparent 75%, transparent);
    background-size: 60px 60px;
    animation: subtleFade 3s ease-in-out infinite;
  }
  @media (prefers-color-scheme: dark) {
    body, .wrapper {
      background-color: #0f172a !important;
      color: #f1f5f9 !important;
    }
    .card {
      background-color: #1e293b !important;
      border-color: #334155 !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3) !important;
    }
    .muted {
      color: #94a3b8 !important;
    }
    .footer-text {
      color: #64748b !important;
    }
    .summary-box {
      background-color: #0f172a !important;
      border-left-color: #8b5cf6 !important;
    }
    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%) !important;
      color: #ffffff !important;
      border-color: transparent !important;
    }
    .amount-highlight {
      color: #60a5fa !important;
    }
  }
</style>
</head>
<body style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); margin:0; padding:24px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div class="wrapper" style="max-width:640px; margin:0 auto;">
    <div class="card" style="
      background:#ffffff;
      border-radius:20px;
      overflow:hidden;
      border:1px solid #e2e8f0;
      box-shadow:0 20px 40px rgba(15,23,42,0.1);
    ">

      <div class="header-gradient" style="
        padding:28px 24px;
        position: relative;
      ">
        <div style="position: relative; z-index: 2;">
          <div style="font-size:26px; font-weight:800; color:#ffffff; text-align:center; letter-spacing:-0.5px;">
            Satartup Builder
          </div>
          <div style="font-size:14px; font-weight:500; color:rgba(255,255,255,0.9); text-align:center; margin-top:8px;">
            Your Invoice & Payment Receipt
          </div>
        </div>
      </div>

      <div style="padding:32px 28px 28px 28px; color:#334155;">
        <div style="display:flex; align-items:center; margin-bottom:24px;">
          <div style="width:48px; height:48px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius:12px; display:flex; align-items:center; justify-content:center; margin-right:16px;">
            <span style="color:white; font-size:24px;">✓</span>
          </div>
          <div>
            <p style="font-size:18px; font-weight:600; margin:0 0 4px 0; color:#1e293b;">
              Payment Successful!
            </p>
            <p style="font-size:14px; margin:0; color:#64748b;">
              Hi <b>${safeName}</b>, your subscription is now active
            </p>
          </div>
        </div>

        <div class="summary-box" style="
          margin:24px 0;
          background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius:16px;
          padding:20px;
          border-left:4px solid #8b5cf6;
          border:1px solid #e2e8f0;
        ">
          <div style="font-size:12px; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.08em; color:#64748b; font-weight:600;">
            Payment Summary
          </div>
          <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px; color:#334155; width:100%;">
            <tr>
              <td style="padding:8px 0; width:140px; color:#64748b;">Transaction ID:</td>
              <td style="padding:8px 0;"><b style="color:#1e293b; font-family: 'Monaco', 'Consolas', monospace;">${transactionId}</b></td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#64748b;">Amount Paid:</td>
              <td style="padding:8px 0;">
                <b class="amount-highlight" style="color:#3b82f6; font-size:16px;">${safeAmount}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#64748b;">Plan:</td>
              <td style="padding:8px 0;"><b style="color:#1e293b;">${safePlan}</b></td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#64748b;">Billing Cycle:</td>
              <td style="padding:8px 0;">
                <span style="background:#e0e7ff; color:#4f46e5; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">
                  ${safeCycle}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <p style="margin:24px 0 16px 0; font-size:14px; color:#475569; line-height:1.6;">
          Your invoice PDF is attached to this email. You can also access it anytime from your billing dashboard.
        </p>

        <div style="text-align:center; margin:28px 0;">
          <a class="btn-primary" href="${dashboardUrl}" target="_blank" rel="noopener"
            style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              gap:8px;
              padding:14px 32px;
              border-radius:12px;
              background:linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
              color:#ffffff;
              font-size:15px;
              font-weight:600;
              text-decoration:none;
              box-shadow:0 4px 20px rgba(139, 92, 246, 0.3);
              transition:all 0.3s ease;
              border:none;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 25px rgba(139, 92, 246, 0.4)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(139, 92, 246, 0.3)';">
            <span>📊</span>
            Open Billing Dashboard
          </a>
        </div>

        <div style="background:#f8fafc; border-radius:12px; padding:20px; margin-top:28px; border:1px solid #e2e8f0;">
          <p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#475569;">
            💡 Need Help?
          </p>
          <p class="muted" style="margin:0; font-size:12px; color:#64748b; line-height:1.6;">
            If you have any questions about your invoice or subscription, reply to this email or contact our support team at
            <b style="color:#3b82f6;">support@cybomb.com</b>. We're here to help!
          </p>
        </div>
      </div>

      <div class="footer-text" style="
        text-align:center;
        font-size:11px;
        color:#94a3b8;
        padding:20px;
        border-top:1px solid #e2e8f0;
        background:#f8fafc;
      ">
        <div>© ${currentYear} Paplixo · Cybomb Technologies Pvt Ltd</div>
        <div style="margin-top:4px; font-size:10px; color:#cbd5e1;">
          This email was sent automatically. Please do not reply to this address.
        </div>
      </div>
    </div>
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