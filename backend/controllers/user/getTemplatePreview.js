// getTemplatePreview.js
const { gridFSBucket, canUserAccessTemplate } = require('./helpers');
const Template = require('../../models/Template');

exports.getTemplatePreview = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
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
        message: 'Access denied. Upgrade your plan to preview this template.'
      });
    }

    // Get actual file info from GridFS with enhanced detection
    let actualFileInfo = null;
    let detectedFileExtension = 'docx';

    if (template.file && template.file.fileId) {
      const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
      if (files.length > 0) {
        const gridFSFile = files[0];
        
        const fileName = gridFSFile.filename;
        const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
        const fileExtension = extensionMatch ? extensionMatch[1].toLowerCase() : 'docx';
        
        const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
        detectedFileExtension = validExtensions.includes(fileExtension) ? fileExtension : 'docx';
        
        actualFileInfo = {
          fileName: gridFSFile.filename,
          fileSize: gridFSFile.length,
          actualFileType: detectedFileExtension,
          uploadDate: gridFSFile.uploadDate
        };
      }
    }

    let finalFileExtension = detectedFileExtension;
    
    if (template.fileType && finalFileExtension === 'docx') {
      const templateFileType = template.fileType.replace('.', '').toLowerCase();
      const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
      if (validExtensions.includes(templateFileType)) {
        finalFileExtension = templateFileType;
      }
    }

    if (template.file?.fileType && finalFileExtension === 'docx') {
      const fileObjectType = template.file.fileType.replace('.', '').toLowerCase();
      const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
      if (validExtensions.includes(fileObjectType)) {
        finalFileExtension = fileObjectType;
      }
    }

    res.json({
      success: true,
      template: {
        id: template._id,
        name: template.name,
        description: template.description,
        category: template.category,
        subCategory: template.subCategory,
        accessLevel: template.accessLevel,
        fileType: finalFileExtension,
        fileExtension: finalFileExtension,
        fileSize: actualFileInfo?.fileSize || template.file?.fileSize,
        downloadCount: template.downloadCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        tags: template.tags,
        hasFile: !!(template.file && template.file.fileId),
        actualFileInfo: actualFileInfo
      }
    });
  } catch (error) {
    console.error('Preview template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching template preview'
    });
  }
};