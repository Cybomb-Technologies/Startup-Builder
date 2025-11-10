const Template = require("../models/Template");
const gridFsService = require("../services/gridFsService");

const ONLYOFFICE_SERVER = process.env.ONLYOFFICE_URL || "http://localhost"; // Change later for production

exports.getEditorConfig = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await Template.findById(templateId);
    if (!template || !template.file?.fileId) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const fileUrl = `${process.env.SERVER_URL}/api/editor/${templateId}/file`;
    const callbackUrl = `${process.env.SERVER_URL}/api/editor/${templateId}/save`;

    const config = {
      document: {
        fileType: "docx",
        key: template.updatedAt.getTime(),
        title: template.name,
        url: fileUrl,
      },
      editorConfig: {
        mode: "edit",
        callbackUrl: callbackUrl
      }
    };

    res.json(config);

  } catch (error) {
    console.error("Config Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFile = async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template?.file?.fileId) return res.status(404).send("File not found");

    const stream = await gridFsService.getFileStream(template.file.fileId);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    stream.pipe(res);
  } catch (error) {
    console.error("File stream error:", error);
    res.status(500).send("Failed to stream file");
  }
};

exports.saveFile = async (req, res) => {
  try {
    const template = await Template.findById(req.params.templateId);
    if (!template?.file?.fileId) return res.status(404).send("File not found");

    const newFileStream = req; // ONLYOFFICE sends raw binary in req body

    const newFileId = await gridFsService.replaceFile(
      template.file.fileId,
      newFileStream,
      template.file.fileName || "document.docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    template.file.fileId = newFileId;
    await template.save();

    res.json({ status: "success" });

  } catch (error) {
    console.error("Save Error:", error);
    res.status(500).send("Failed to save");
  }
};
