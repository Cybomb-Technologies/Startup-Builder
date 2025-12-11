/********************************************************************************************
 * INVOICE CONTROLLER – MODERN UI VERSION
 * FULL FUNCTIONALITY WITH REFRESHED DESIGN
 ********************************************************************************************/

const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const Payment = require("../models/Payment");
const User = require("../models/User");
const { sendInvoiceEmail } = require("../utils/emailSender");

/********************************************************************************************
 * FORMAT CURRENCY EXACTLY AS DISPLAYED
 ********************************************************************************************/
function formatCurrency(amount, currency) {
  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/********************************************************************************************
 * INTERNAL FUNCTION — BUILD PDF INTO BUFFER
 * USED FOR: download + email attachment
 ********************************************************************************************/
async function buildInvoicePdfBuffer(transactionId, userId) {
  // ================================
  // FETCH PAYMENT RECORD
  // ================================
  const payment = await Payment.findOne({ transactionId, userId });
  if (!payment) return null;

  // ================================
  // FETCH USER
  // ================================
  const user = await User.findById(userId);
  if (!user) return null;

  // ================================
  // GST MATH
  // ================================
  let baseAmount = payment.amount;
  let gstAmount = 0;

  if (payment.currency === "INR") {
    baseAmount = Math.round((payment.amount / 1.18) * 100) / 100;
    gstAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  }

  // ================================
  // QR GENERATION
  // ================================
  const qrPayload = {
    transactionId,
    amount: payment.amount,
    currency: payment.currency,
    userName: user.name,
    email: user.email,
    date: payment.createdAt,
  };
  const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrPayload));

  // ================================
  // BUILD PDF INTO BUFFER
  // ================================
  return await new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 0, size: "A4" });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      /********************************************************************************************
       * MODERN HEADER SECTION — DARK GRADIENT
       ********************************************************************************************/
      const headerGradient = doc.linearGradient(0, 0, pageWidth, 0);
      headerGradient.stop(0, "#0f172a");
      headerGradient.stop(1, "#1e293b");
      doc.rect(0, 0, pageWidth, 140).fill(headerGradient);

      // Add subtle pattern overlay
      doc.fillColor("#ffffff").opacity(0.05);
      for (let i = 0; i < 10; i++) {
        doc.circle(40 + i * 80, 70, 20).fill();
      }
      doc.opacity(1);

      // Logo placeholder with modern shape
      doc.fillColor("#ffffff")
        .roundedRect(40, 30, 60, 60, 12)
        .fill();
      
      try {
        doc.image("server/assets/logo.png", 50, 40, { width: 40 });
      } catch {
        // If no logo, show text
        doc.fillColor("#3b82f6")
          .fontSize(16)
          .font("Helvetica-Bold")
          .text("SB", 50, 50);
      }

      // Company Name
      doc.fillColor("#ffffff")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("Paplixo", 120, 40);

      doc.fontSize(10)
        .font("Helvetica")
        .fillColor("#cbd5e1")
        .text("Paplixo Template Platform", 120, 75);

      doc.fontSize(9)
        .text(
          "Cybomb Technologies Pvt Ltd.\n" +
            "GSTIN: IN07AADCT2341D2Z\n" +
            "Chennai, Tamil Nadu, India",
          120,
          95
        );


      /********************************************************************************************
       * BILL TO SECTION
       ********************************************************************************************/
      doc.fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("BILL TO:", 40, 170);

      doc.rect(40, 185, 280, 60)
        .fill("#f8fafc")
        .stroke("#e2e8f0");

      doc.fillColor("#334155").font("Helvetica").fontSize(11);
      doc.text(user.name || "Customer", 50, 195);
      doc.text(user.email || "", 50, 215);
      if (user.phone) doc.text(user.phone, 50, 235);

      /********************************************************************************************
       * RIGHT SIDE INFO CARD
       ********************************************************************************************/
      const rightBoxX = pageWidth - 280;
      doc.fillColor("#ffffff")
        .roundedRect(rightBoxX, 165, 240, 80, 8)
        .fill()
        .stroke("#e2e8f0");

      doc.fillColor("#64748b").fontSize(9).font("Helvetica");

      const createdDate = new Date(payment.createdAt).toLocaleDateString("en-IN");
      const expiryDate = new Date(payment.expiryDate).toLocaleDateString("en-IN");

      doc.text("Invoice Date:", rightBoxX + 15, 175);
      doc.fillColor("#0f172a").font("Helvetica-Bold");
      doc.text(createdDate, rightBoxX + 90, 175);

      doc.fillColor("#64748b").font("Helvetica");
      doc.text("Status:", rightBoxX + 15, 190);
      doc.fillColor("#10b981").font("Helvetica-Bold");
      doc.text((payment.status || "success").toUpperCase(), rightBoxX + 90, 190);

      doc.fillColor("#64748b").font("Helvetica");
      doc.text("Billing Cycle:", rightBoxX + 15, 205);
      doc.fillColor("#0f172a").font("Helvetica-Bold");
      doc.text(payment.billingCycle || "", rightBoxX + 90, 205);

      doc.fillColor("#64748b").font("Helvetica");
      doc.text("Service Period:", rightBoxX + 15, 220);
      doc.fillColor("#0f172a").font("Helvetica");
      doc.text(`${createdDate} to ${expiryDate}`, rightBoxX + 90, 220, {
        width: 120,
      });

      /********************************************************************************************
       * TABLE HEADER WITH GRADIENT
       ********************************************************************************************/
      const tableGradient = doc.linearGradient(0, 265, 0, 293);
      tableGradient.stop(0, "#8b5cf6");
      tableGradient.stop(1, "#6366f1");
      doc.rect(0, 265, pageWidth, 28).fill(tableGradient);

      doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold")
        .text("DESCRIPTION", 40, 273);
      doc.text("QTY", 350, 273);
      doc.text("PRICE", 420, 273);
      doc.text("AMOUNT", 500, 273);

      /********************************************************************************************
       * DESCRIPTION ROW WITH MODERN STYLING
       ********************************************************************************************/
      const descY = 305;
      
      // Row background
      doc.fillColor("#f8fafc")
        .roundedRect(35, descY - 10, pageWidth - 70, 50, 6)
        .fill();

      doc.fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`${payment.planName} Subscription`, 40, descY);

      doc.fillColor("#64748b").font("Helvetica").fontSize(9)
        .text(`${payment.billingCycle} billing with full feature access`, 40, descY + 18);

      doc.fillColor("#334155").fontSize(10);
      doc.text("1", 355, descY);
      doc.text(formatCurrency(baseAmount, payment.currency), 415, descY);
      doc.text(formatCurrency(baseAmount, payment.currency), 500, descY);

      /********************************************************************************************
       * TOTAL SECTION WITH ACCENT COLOR
       ********************************************************************************************/
      const summaryY = descY + 70;

      // Total box
      doc.fillColor("#ffffff")
        .roundedRect(350, summaryY - 15, 200, payment.currency === "INR" ? 90 : 65, 8)
        .fill()
        .stroke("#e2e8f0");

      doc.fillColor("#64748b").font("Helvetica").fontSize(10)
        .text("Subtotal:", 360, summaryY);
      doc.fillColor("#0f172a").font("Helvetica-Bold");
      doc.text(formatCurrency(baseAmount, payment.currency), 460, summaryY);

      if (payment.currency === "INR") {
        doc.fillColor("#64748b").font("Helvetica");
        doc.text("GST (18%):", 360, summaryY + 20);
        doc.fillColor("#0f172a").font("Helvetica-Bold");
        doc.text(formatCurrency(gstAmount, payment.currency), 460, summaryY + 20);

        doc.fillColor("#8b5cf6").font("Helvetica-Bold").fontSize(13)
          .text("TOTAL PAID", 360, summaryY + 50);
        doc.fontSize(14)
          .text(formatCurrency(payment.amount, payment.currency), 460, summaryY + 50);
      } else {
        doc.fillColor("#8b5cf6").font("Helvetica-Bold").fontSize(13)
          .text("TOTAL PAID", 360, summaryY + 25);
        doc.fontSize(14)
          .text(formatCurrency(payment.amount, payment.currency), 460, summaryY + 25);
      }

      /********************************************************************************************
       * QR CODE IN MODERN CONTAINER
       ********************************************************************************************/
      const qrY = summaryY + (payment.currency === "INR" ? 100 : 85);
      
      doc.fillColor("#ffffff")
        .roundedRect(40, qrY, 100, 100, 8)
        .fill()
        .stroke("#e2e8f0");
      
      doc.image(qrCodeImage, 50, qrY + 10, { width: 80 });

      /********************************************************************************************
       * TERMS AND FOOTER SECTION
       ********************************************************************************************/
      const termsX = 150;
      
      doc.fillColor("#0f172a")
        .font("Helvetica-Bold")
        .fontSize(11)


      doc.fillColor("#64748b").fontSize(8).font("Helvetica")
        .text(
          "INVOICE TERMS\n" +
          "• This is a computer-generated invoice\n" +
          "• All amounts are inclusive of applicable taxes\n" +
          "• For support, contact: support@cybomb.com\n" +
          "• Invoice ID: " + transactionId + "\n\n",
          termsX, qrY + 25
        );

      /********************************************************************************************
       * FOOTER
       ********************************************************************************************/
      doc.fillColor("#f8fafc")
        .rect(0, pageHeight - 40, pageWidth, 40)
        .fill();
      
      doc.fillColor("#64748b").fontSize(9)
        .text("Thank you for choosing Paplixo!", 0, pageHeight - 30, {
          align: "center",
          width: pageWidth
        });

      doc.fillColor("#94a3b8").fontSize(8)
        .text(`Invoice generated on ${new Date().toLocaleDateString()}`, 0, pageHeight - 15, {
          align: "center",
          width: pageWidth
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/********************************************************************************************
 * PUBLIC FUNCTION — RETURN PDF TO USER DOWNLOAD
 ********************************************************************************************/
const generateInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.id;

    const pdfBuffer = await buildInvoicePdfBuffer(transactionId, userId);
    if (!pdfBuffer)
      return res.status(404).json({ message: "Invoice not found" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${transactionId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Invoice generation error:", error);
    return res.status(500).json({ message: "Failed to generate invoice" });
  }
};

/********************************************************************************************
 * PUBLIC FUNCTION — SEND EMAIL AFTER PAYMENT
 ********************************************************************************************/
const sendInvoiceAfterPayment = async (transactionId, userId) => {
  try {
    const pdfBuffer = await buildInvoicePdfBuffer(transactionId, userId);
    if (!pdfBuffer) {
      console.warn("No PDF buffer created for invoice email");
      return;
    }

    const payment = await Payment.findOne({ transactionId, userId });
    if (!payment) {
      console.warn("Payment not found for invoice email");
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      console.warn("User not found for invoice email");
      return;
    }

    const amountDisplay = formatCurrency(payment.amount, payment.currency);
    const planName = payment.planName;
    const billingCycle = payment.billingCycle;

    await sendInvoiceEmail(
      user.email,
      pdfBuffer,
      transactionId,
      user.name || "Customer",
      amountDisplay,
      planName,
      billingCycle
    );

    console.log("📨 Invoice email successfully sent to:", user.email);
  } catch (err) {
    console.error("❌ Failed to send invoice email:", err);
  }
};

module.exports = { generateInvoice, sendInvoiceAfterPayment };