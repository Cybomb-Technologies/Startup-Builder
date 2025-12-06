// downloadTemplateFile.js
const { gridFSBucket, getContentType, canUserAccessTemplate } = require('./helpers');
const Template = require('../../models/Template');

exports.downloadTemplateFile = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('accessLevel', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Template not available'
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

    // Check if file exists in GridFS
    if (!template.file || !template.file.fileId) {
      return res.status(404).json({
        success: false,
        message: 'Template file not found'
      });
    }

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

    // Stream file from GridFS
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