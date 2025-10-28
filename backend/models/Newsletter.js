const mongoose = require("mongoose");
const Newsletter = require('../models/Newsletter');
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Newsletter", newsletterSchema);
