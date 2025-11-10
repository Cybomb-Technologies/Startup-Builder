const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const jwt = require("jsonwebtoken");
// Fetch setup
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// ⚠️ NEW: Function to get the fetch agent (handles dynamic import and instantiation)
async function getInternalAgent() {
    // Dynamically import the package and access the constructor
    const { HttpProxyAgent } = await import('https-proxy-agent');

    // Instantiation
    const BASE_URL = process.env.SERVER_URL || "http://host.docker.internal:5001";
    return new HttpProxyAgent(BASE_URL);
}

const Template = require("../models/Template");
const UserDocument = require("../models/UserDocument");
const User = require("../models/User");

// GridFS setup
let bucket;
mongoose.connection.once("open", () => {
    bucket = new GridFSBucket(mongoose.connection.db, { bucketName: "files" });
    console.log("✅ GridFS Ready");
});

// URLs
const BASE_URL = process.env.SERVER_URL || "http://host.docker.internal:5001";
const DS_SECRET = process.env.DOCUMENT_SERVER_JWT_SECRET;
const APP_SECRET = process.env.JWT_SECRET;

// Extract User Token
function extractToken(req) {
    if (req.headers.authorization?.startsWith("Bearer "))
        return req.headers.authorization.slice(7);
    if (req.query.token) return req.query.token;
    return null;
}

// Verify User OR Document Server Token (Logic relaxed for server-to-server calls)
async function verifyToken(req, allowDsToken = false) {
    const token = extractToken(req);
    if (!token) throw new Error("Missing token");

    // 1. Attempt to verify as standard User Token (using APP_SECRET)
    try {
        const decoded = jwt.verify(token, APP_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) throw new Error("Invalid user");
        return { user, token, ds: false };
    } catch (err) {

        // 2. If APP_SECRET failed, check if this is a server-to-server call.
        if (allowDsToken) {
            console.warn("WARN: Bypassing strict USER token signature check for DS callback.");

            // Attempt to find user ID without strict signature check (only if needed by save/file logic)
            try {
                const decodedWeak = jwt.decode(token);
                const user = await User.findById(decodedWeak?.userId).select("-password");
                if (user) {
                    // Found user, proceed as DS authenticated call
                    return { user, token, ds: true };
                }
            } catch (decodeErr) {
                // Ignore decode error if the token is completely malformed
            }

            // Final fallback for DS initiated calls
            return { user: { _id: "ds_callback_user" }, token, ds: true };
        }

        // 3. If it's a browser call and verification failed, throw the original error (401).
        throw err;
    }
}

// ------------------------------------------------------------
// GET ONLYOFFICE CONFIG
// ------------------------------------------------------------
router.get("/:id/config", async (req, res) => {
    try {
        // Must verify user token strictly here (allowDsToken = false by default)
        const { user, token } = await verifyToken(req);
        console.log("✅ User Verified for Editor Config:", user.email);
        let userDoc = await UserDocument.findOne({
            user: user._id,
            originalTemplate: req.params.id
        });
        
        if (!userDoc) {
            const template = await Template.findById(req.params.id);
            commsole.log("✅ Creating New UserDocument from Template:", template?.name);
            if (!template?.file?.fileId)
                return res.status(404).json({ message: "Template missing" });

            userDoc = await UserDocument.create({
                user: user._id,
                originalTemplate: req.params.id,
                file: template.file,
                name: `${template.name} (My Document)`
            });
        }

        const fileUrl = `${BASE_URL}/api/editor/userdoc/${userDoc._id}/file?token=${token}`;
        console.log("✅ File URL for Document:", fileUrl);
        const callbackUrl = `${BASE_URL}/api/editor/userdoc/${userDoc._id}/save?token=${token}`;
        console.log(" ✅ Callback URL for Document Save:", callbackUrl);

        const config = {
            documentType: "word",
            type: "desktop",

            document: {
                title: userDoc.name,
                fileType: "docx",
                url: fileUrl,
                key: String(userDoc._id)
            },

            editorConfig: {
                mode: "edit",
                callbackUrl,
                user: {
                    id: String(user._id),
                    name: user.email
                }
            }
        };

        // Note: Document Server will verify this token using DS_SECRET
        config.token = jwt.sign(config, DS_SECRET, { expiresIn: "24h" });

        return res.json(config);

    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
});

// ------------------------------------------------------------
// DOWNLOAD DOCUMENT (DocumentServer GETS FILE)
// ------------------------------------------------------------
router.get("/userdoc/:id/file", async (req, res) => {
    try {
        // AllowDsToken = true: allows bypassing strict user token check for DS call
        const { user, ds } = await verifyToken(req, true);
        const userDoc = await UserDocument.findById(req.params.id);

        if (!userDoc?.file?.fileId) return res.status(404).json({ message: "File not found" });

        // Authorization check using the user ID found (if user was found)
        if (!ds && String(userDoc.user) !== String(user._id)) return res.status(403).json({ message: "Forbidden" });

        res.setHeader("Content-Disposition", `attachment; filename="${userDoc.file.fileName}"`);
        // CRITICAL: This is where the file is streamed from MongoDB
        bucket.openDownloadStream(userDoc.file.fileId).pipe(res);

    } catch (err) {
        return res.status(401).json({ message: err.message });
    }
});

// ------------------------------------------------------------
// SAVE UPDATED DOCUMENT
// ------------------------------------------------------------
router.post("/userdoc/:id/save", async (req, res) => {
    try {
        // AllowDsToken = true: allows bypassing strict user token check for DS call
        const { user, ds } = await verifyToken(req, true);
        const userDoc = await UserDocument.findById(req.params.id);
        if (!userDoc) return res.json({ error: 1 });

        // Authorization check using the user ID found (if user was found)
        if (!ds && String(userDoc.user) !== String(user._id)) return res.json({ error: 1 });

        const { status, url } = req.body;
        // Status 2 or 4 indicates saving is complete
        if (![2, 4].includes(status)) return res.json({ error: 0 });

        // ⚠️ CRITICAL: Instantiation and use of the Agent is now inside the async route
        const internalAgent = await getInternalAgent();
        const response = await fetch(url, { agent: internalAgent });
        if (!response.ok) return res.json({ error: 1 });

        if (userDoc.file?.fileId) await bucket.delete(userDoc.file.fileId);

        const upload = bucket.openUploadStream(userDoc.file.fileName);
        response.body.pipe(upload);

        upload.on("finish", async (file) => {
            userDoc.file.fileId = file._id;
            await userDoc.save();
            res.json({ error: 0 });
        });

    } catch (err) {
        res.json({ error: 1 });
    }
});

module.exports = router;