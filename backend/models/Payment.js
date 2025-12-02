const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    currency: { 
      type: String, 
      default: "INR" 
    },
    status: { 
      type: String, 
      enum: ["success", "failed", "pending"], 
      default: "pending" 
    },
    transactionId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    planId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Pricing",
      required: true 
    },
    planName: {
      type: String,
      required: true
    },
    billingCycle: { 
      type: String, 
      enum: ["monthly", "annual"], 
      required: true 
    },
    expiryDate: { 
      type: Date, 
      required: true 
    },
    paymentMethod: {
      type: String
    },
    autoRenewal: {
      type: Boolean,
      default: true
    },
    renewalStatus: {
      type: String,
      enum: ["scheduled", "cancelled"],
      default: "scheduled"
    }
  },
  { timestamps: true }
);

// Indexes for better performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Payment", paymentSchema);