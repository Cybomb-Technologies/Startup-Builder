const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const jwt = require("jsonwebtoken");
const mime = require("mime-types");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

const Template = require("../models/Template");
const UserDocument = require("../models/UserDocument");
const User = require("../models/User");

// --- ENV ---
const APP_BASE_URL     = process.env.APP_BASE_URL     || "http://localhost:5000";
const APP_INTERNAL_URL = process.env.APP_INTERNAL_URL || "http://host.docker.internal:5000";
const DS_PUBLIC_URL    = process.env.DS_PUBLIC_URL    || "http://localhost:8081";
const DS_JWT_SECRET    = process.env.DOCUMENT_SERVER_JWT_SECRET;
const APP_JWT_SECRET   = process.env.JWT_SECRET;

// --- GridFS Bucket ---
let bucket;
mongoose.connection.once("open", () => {
  bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "files" });
  console.log("✅ GridFS initialized");
});

// --- Helpers ---
function extractToken(req) {
  if (req.headers.authorization?.startsWith("Bearer ")) return req.headers.authorization.slice(7);
  if (req.query.token) return req.query.token;
  return null;
}

async function verifyToken(req, allowDS = false) {
  const token = extractToken(req);
  if (!token) throw new Error("Missing token");

  try {
    const decoded = jwt.verify(token, APP_JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) throw new Error("Invalid user");
    return { user, token, ds: false };
  } catch (err) {
    if (allowDS) {
      const decodedWeak = jwt.decode(token);
      const user = decodedWeak?.userId ? await User.findById(decodedWeak.userId).select("-password") : null;
      if (user) return { user, token, ds: true };
      return { user: { _id: "ds_callback_user" }, token, ds: true };
    }
    throw err;
  }
}

function extToDocTypeAndFileType(filename = "document.docx") {
  const ext = filename.split(".").pop().toLowerCase();
  if (["xlsx", "xls", "csv"].includes(ext)) return { documentType: "cell", fileType: ext };
  if (["pptx", "ppt"].includes(ext)) return { documentType: "slide", fileType: ext };
  return { documentType: "word", fileType: ext };
}

// =================== GET EDITOR CONFIG ===================
router.get("/:id/config", async (req, res) => {
  try {
    const { user, token } = await verifyToken(req);

    // ✅ Atomic check to prevent duplicates
    let userDoc = await UserDocument.findOne({
      user: user._id,
      originalTemplate: req.params.id
    });

    if (!userDoc) {
      // Double-check before creating (handles concurrent hits)
      const existing = await UserDocument.findOne({
        user: user._id,
        originalTemplate: req.params.id
      });
      if (existing) userDoc = existing;
      else {
        const template = await Template.findById(req.params.id);
        if (!template?.file?.fileId)
          return res.status(404).json({ message: "Template file missing" });

        console.log(`📄 Cloning template ${template.name} for user ${user.email}`);

        const source = bucket.openDownloadStream(template.file.fileId);
        const upload = bucket.openUploadStream(template.file.fileName);
        source.pipe(upload);

        const newFile = await new Promise((resolve, reject) => {
          upload.on("finish", resolve);
          upload.on("error", reject);
        });

        userDoc = await UserDocument.create({
          user: user._id,
          originalTemplate: req.params.id,
          name: `${template.name} (My Document)`,
          file: {
            fileId: newFile._id,
            fileName: template.file.fileName
          }
        });
      }
    }

    const { documentType, fileType } = extToDocTypeAndFileType(userDoc.file.fileName);

    const fileUrl = `${APP_INTERNAL_URL}/api/editor/userdoc/${userDoc._id}/file?token=${token}`;
    const callbackUrl = `${APP_INTERNAL_URL}/api/editor/userdoc/${userDoc._id}/save?token=${token}`;

    const configPayload = {
      type: "desktop",
      documentType,
      document: {
        title: userDoc.name,
        fileType,
        url: fileUrl,
        key: String(userDoc._id)
      },
      editorConfig: {
        callbackUrl,
        mode: "edit",
        user: { id: String(user._id), name: user.email },
        customization: {
          about: false,
          feedback: false,
          support: false,
          logo: { image: "", imageEmbedded: "", url: "" } // ✅ hides OnlyOffice logo
        }
      }
    };

    const tokenForDS = jwt.sign(configPayload, DS_JWT_SECRET, { expiresIn: "24h" });

    res.json({
      documentServerApiUrl: `${DS_PUBLIC_URL}/web-apps/apps/api/documents/api.js`,
      config: configPayload,
      token: tokenForDS
    });
  } catch (err) {
    console.error("❌ CONFIG ERROR:", err);
    res.status(401).json({ message: err.message });
  }
});

// =================== GET USER FILE ===================
router.get("/userdoc/:id/file", async (req, res) => {
  try {
    const { user, ds } = await verifyToken(req, true);
    const userDoc = await UserDocument.findById(req.params.id);
    if (!userDoc) return res.status(404).json({ message: "Document missing" });

    if (!ds && userDoc.user.toString() !== user._id.toString())
      return res.status(403).json({ message: "Forbidden" });

    res.setHeader("Content-Disposition", `attachment; filename="${userDoc.file.fileName}"`);
    res.setHeader("Content-Type", mime.lookup(userDoc.file.fileName) || "application/octet-stream");

    bucket.openDownloadStream(userDoc.file.fileId).pipe(res);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

// =================== SAVE CALLBACK ===================
router.post("/userdoc/:id/save", async (req, res) => {
  try {
    const { user, ds } = await verifyToken(req, true);
    const userDoc = await UserDocument.findById(req.params.id);
    if (!userDoc) return res.json({ error: 1 });

    if (!ds && userDoc.user.toString() !== user._id.toString())
      return res.json({ error: 1 });

    const { status, url } = req.body;
    if (![2, 4].includes(Number(status))) return res.json({ error: 0 });

    const response = await fetch(url);
    if (!response.ok) return res.json({ error: 1 });

    if (userDoc.file.fileId) await bucket.delete(userDoc.file.fileId);

    const upload = bucket.openUploadStream(userDoc.file.fileName);
    response.body.pipe(upload);

    upload.on("finish", async (file) => {
      userDoc.file.fileId = file._id;
      await userDoc.save();
      res.json({ error: 0 });
    });

    upload.on("error", () => res.json({ error: 1 }));
  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    res.json({ error: 1 });
  }
});

module.exports = router;
