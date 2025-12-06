// downloadTemplate.js
const { gridFSBucket, getContentType, canUserAccessTemplate } = require('./helpers');
const Template = require('../../models/Template');
const UserDocument = require('../../models/UserDocument');

exports.downloadTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Check if user can access this template
    const canAccess = await canUserAccessTemplate(req.user.id, req.params.id);
    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Upgrade your plan to access this template.'
      });
    }

    // Check if user already has a document for this template
    let userDoc = await UserDocument.findOne({
      user: req.user.id,
      originalTemplate: req.params.id
    });

    // If no user document exists, create one
    if (!userDoc) {
      console.log(`📄 Creating user document for template ${template.name} for user ${req.user.email}`);

      const source = gridFSBucket.openDownloadStream(template.file.fileId);
      const upload = gridFSBucket.openUploadStream(template.file.fileName);
      source.pipe(upload);

      const newFile = await new Promise((resolve, reject) => {
        upload.on("finish", resolve);
        upload.on("error", reject);
      });

      userDoc = await UserDocument.create({
        user: req.user.id,
        originalTemplate: req.params.id,
        name: `${template.name} (My Copy)`,
        file: {
          fileId: newFile._id,
          fileName: template.file.fileName
        },
        documentType: 'template'
      });

      console.log(`✅ User document created: ${userDoc._id}`);
    }

    // Return the file for download
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    const gridFSFile = files[0];
    const originalFileName = gridFSFile.filename;
    const fileExtension = originalFileName.split('.').pop().toLowerCase();
    const filename = `${template.name.replace(/\s+/g, '_')}.${fileExtension}`;
    
    const contentType = getContentType(fileExtension);
    
    // Update download count
    template.downloadCount = (template.downloadCount || 0) + 1;
    await template.save();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'no-cache');

    const downloadStream = gridFSBucket.openDownloadStream(template.file.fileId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('File download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file'
        });
      }
    });

  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading template'
    });
  }
};