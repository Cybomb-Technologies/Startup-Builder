const mongoose = require("mongoose");

const userDocumentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  originalTemplate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true
  },
  file: {
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
    fileName: { type: String, required: true },
    fileSize: Number,
    fileType: String,
    uploadDate: { type: Date, default: Date.now }
  },
  name: { type: String, required: true },
  updatedAt: { type: Date, default: Date.now }
});

userDocumentSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("UserDocument", userDocumentSchema);
