const Template = require('../models/Template');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const UserAccess = require('../models/UserAccess');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

// Initialize GridFS bucket
let gridFSBucket;
const initializeGridFS = () => {
  const db = mongoose.connection.db;
  gridFSBucket = new GridFSBucket(db, {
    bucketName: 'files'
  });
};

mongoose.connection.on('connected', () => {
  initializeGridFS();
});

// @desc    Get all templates
// @route   GET /api/admin/templates
// @access  Private/Admin
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find()
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Enhance templates with image URLs
    const enhancedTemplates = templates.map(template => {
      const templateObj = template.toObject();
      if (template.images && template.images.length > 0) {
        templateObj.imageUrls = template.images.map(img => ({
          url: `/api/templates/${template._id}/images/${img.fileId}`,
          thumbnail: `/api/templates/${template._id}/images/${img.fileId}?size=thumbnail`,
          ...img.toObject ? img.toObject() : img
        }));
      } else {
        templateObj.imageUrls = [];
      }
      return templateObj;
    });

    res.status(200).json({
      success: true,
      count: enhancedTemplates.length,
      templates: enhancedTemplates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching templates'
    });
  }
};

// @desc    Create a template with file upload to MongoDB
// @route   POST /api/admin/templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  try {
    console.log('📥 CREATE TEMPLATE REQUEST RECEIVED');
    console.log('📥 Request body:', req.body);
    console.log('📥 Request files:', req.files);
    
    const { 
      name, 
      description, 
      category, 
      subCategory, 
      accessLevel, 
      content 
    } = req.body;

    // Enhanced validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (!accessLevel) {
      return res.status(400).json({
        success: false,
        message: 'Access level is required'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Template content is required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if access level exists
    const accessLevelExists = await UserAccess.findById(accessLevel);
    if (!accessLevelExists) {
      return res.status(400).json({
        success: false,
        message: 'Access level not found'
      });
    }

    // Check if subcategory exists and belongs to category
    if (subCategory && subCategory.trim() && subCategory !== 'undefined') {
      const subCategoryExists = await SubCategory.findOne({
        _id: subCategory,
        category: category
      });
      if (!subCategoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Subcategory not found or does not belong to selected category'
        });
      }
    }

    let fileData = {};
    
    // Handle file upload to MongoDB GridFS
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit'
        });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, Word, Excel, and text files are allowed.'
        });
      }

      return new Promise((resolve, reject) => {
        const uploadStream = gridFSBucket.openUploadStream(file.name, {
          metadata: {
            templateName: name,
            uploadedBy: req.admin._id,
            uploadDate: new Date(),
            documentId: uuidv4()
          }
        });

        uploadStream.end(file.data);

        uploadStream.on('finish', async (uploadedFile) => {
          try {
            fileData = {
              fileId: uploadedFile._id,
              fileName: uploadedFile.filename,
              fileSize: uploadedFile.length,
              fileType: file.mimetype,
              uploadDate: new Date()
            };

            console.log('✅ File uploaded to GridFS:', fileData);

            // Create template with file reference
            const template = await Template.create({
              name: name.trim(),
              description: description ? description.trim() : '',
              category,
              subCategory: (subCategory && subCategory.trim() && subCategory !== 'undefined') ? subCategory : null,
              accessLevel,
              content: content.trim(),
              file: fileData,
              createdBy: req.admin._id
            });

            await template.populate('category', 'name');
            await template.populate('subCategory', 'name');
            await template.populate('accessLevel', 'name');
            await template.populate('createdBy', 'name email');

            console.log('✅ Template created successfully with file:', {
              id: template._id,
              documentId: template.documentId,
              name: template.name
            });

            res.status(201).json({
              success: true,
              message: 'Template created successfully',
              template
            });
            resolve();
          } catch (error) {
            console.error('❌ Create template error after file upload:', error);
            
            if (error.code === 11000) {
              return res.status(400).json({
                success: false,
                message: 'Duplicate document detected. Please try again.'
              });
            }
            
            res.status(500).json({
              success: false,
              message: 'Error creating template: ' + error.message
            });
            reject(error);
          }
        });

        uploadStream.on('error', (error) => {
          console.error('❌ File upload error:', error);
          res.status(500).json({
            success: false,
            message: 'Error uploading file: ' + error.message
          });
          reject(error);
        });
      });
    } else {
      // Create template without file
      console.log('📝 Creating template without file');
      
      try {
        const template = await Template.create({
          name: name.trim(),
          description: description ? description.trim() : '',
          category,
          subCategory: (subCategory && subCategory.trim() && subCategory !== 'undefined') ? subCategory : null,
          accessLevel,
          content: content.trim(),
          createdBy: req.admin._id
        });

        await template.populate('category', 'name');
        await template.populate('subCategory', 'name');
        await template.populate('accessLevel', 'name');
        await template.populate('createdBy', 'name email');

        console.log('✅ Template created successfully (no file):', {
          id: template._id,
          documentId: template.documentId,
          name: template.name
        });

        res.status(201).json({
          success: true,
          message: 'Template created successfully',
          template
        });
      } catch (error) {
        console.error('❌ Create template error:', error);
        
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'Duplicate document detected. Please try again.'
          });
        }
        
        res.status(500).json({
          success: false,
          message: 'Error creating template: ' + error.message
        });
      }
    }
  } catch (error) {
    console.error('❌ Create template error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate document detected. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating template: ' + error.message
    });
  }
};

// @desc    Update a template
// @route   PUT /api/admin/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  try {
    console.log('📥 UPDATE TEMPLATE REQUEST RECEIVED');
    console.log('📥 Request body:', req.body);
    console.log('📥 Request files:', req.files);
    
    const { 
      name, 
      description, 
      category, 
      subCategory, 
      accessLevel, 
      content,
      isActive 
    } = req.body;

    let template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Handle file upload if new file is provided
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 10MB limit'
        });
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, Word, Excel, and text files are allowed.'
        });
      }

      return new Promise((resolve, reject) => {
        // Delete old file if exists
        if (template.file && template.file.fileId) {
          gridFSBucket.delete(template.file.fileId, (err) => {
            if (err) {
              console.log('⚠️ Could not delete old file:', err.message);
            } else {
              console.log('✅ Old file deleted');
            }
          });
        }

        const uploadStream = gridFSBucket.openUploadStream(file.name, {
          metadata: {
            templateName: name,
            uploadedBy: req.admin._id,
            uploadDate: new Date(),
            documentId: template.documentId
          }
        });

        uploadStream.end(file.data);

        uploadStream.on('finish', async (uploadedFile) => {
          try {
            const fileData = {
              fileId: uploadedFile._id,
              fileName: uploadedFile.filename,
              fileSize: uploadedFile.length,
              fileType: file.mimetype,
              uploadDate: new Date()
            };

            console.log('✅ New file uploaded to GridFS:', fileData);

            // Update template with new file
            template = await Template.findByIdAndUpdate(
              req.params.id,
              { 
                name: name.trim(),
                description: description ? description.trim() : '',
                category, 
                subCategory: (subCategory && subCategory.trim() && subCategory !== 'undefined') ? subCategory : null, 
                accessLevel, 
                content: content.trim(),
                isActive,
                file: fileData
              },
              { new: true, runValidators: true }
            )
            .populate('category', 'name')
            .populate('subCategory', 'name')
            .populate('accessLevel', 'name')
            .populate('createdBy', 'name email');

            console.log('✅ Template updated successfully with file:', {
              id: template._id,
              documentId: template.documentId
            });

            res.status(200).json({
              success: true,
              message: 'Template updated successfully',
              template
            });
            resolve();
          } catch (error) {
            console.error('Update template error:', error);
            
            if (error.code === 11000) {
              return res.status(400).json({
                success: false,
                message: 'Duplicate document detected.'
              });
            }
            
            res.status(500).json({
              success: false,
              message: 'Error updating template'
            });
            reject(error);
          }
        });

        uploadStream.on('error', (error) => {
          console.error('File upload error:', error);
          res.status(500).json({
            success: false,
            message: 'Error uploading file'
          });
          reject(error);
        });
      });
    } else {
      // Update template without changing file
      template = await Template.findByIdAndUpdate(
        req.params.id,
        { 
          name: name.trim(),
          description: description ? description.trim() : '',
          category, 
          subCategory: (subCategory && subCategory.trim() && subCategory !== 'undefined') ? subCategory : null, 
          accessLevel, 
          content: content.trim(),
          isActive 
        },
        { new: true, runValidators: true }
      )
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

      console.log('✅ Template updated successfully:', {
        id: template._id,
        documentId: template.documentId
      });

      res.status(200).json({
        success: true,
        message: 'Template updated successfully',
        template
      });
    }
  } catch (error) {
    console.error('Update template error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate document detected.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating template'
    });
  }
};

// @desc    Download template file from MongoDB
// @route   GET /api/admin/templates/:id/download
// @access  Private/Admin
exports.downloadTemplateFile = async (req, res) => {
  try {
    console.log('📥 Download request for template:', req.params.id);
    
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.file || !template.file.fileId) {
      return res.status(404).json({
        success: false,
        message: 'No file attached to this template'
      });
    }

    // Check if file exists in GridFS
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found in storage'
      });
    }

    // Increment download count
    template.downloadCount += 1;
    await template.save();

    console.log('✅ Streaming file download:', {
      fileName: template.file.fileName,
      fileSize: template.file.fileSize
    });

    // Set headers
    res.setHeader('Content-Type', template.file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${template.file.fileName}"`);
    res.setHeader('Content-Length', template.file.fileSize);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream file from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(template.file.fileId);
    
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('❌ File download stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error downloading file stream'
        });
      }
    });

  } catch (error) {
    console.error('❌ Download template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading file: ' + error.message
    });
  }
};

// @desc    Delete template and its file from MongoDB
// @route   DELETE /api/admin/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    console.log('🗑️ Deleting template:', {
      id: template._id,
      documentId: template.documentId,
      name: template.name
    });

    // Delete file from GridFS if exists
    if (template.file && template.file.fileId) {
      try {
        await gridFSBucket.delete(template.file.fileId);
        console.log('✅ File deleted from GridFS');
      } catch (error) {
        console.log('⚠️ Could not delete file from GridFS:', error.message);
      }
    }

    // Delete all images from GridFS
    if (template.images && template.images.length > 0) {
      for (const image of template.images) {
        try {
          await gridFSBucket.delete(image.fileId);
          console.log('✅ Image deleted from GridFS:', image.fileId);
        } catch (error) {
          console.log('⚠️ Could not delete image from GridFS:', error.message);
        }
      }
    }

    await Template.findByIdAndDelete(req.params.id);

    console.log('✅ Template deleted successfully:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting template'
    });
  }
};

// @desc    Delete only the file from template
// @route   DELETE /api/admin/templates/:id/file
// @access  Private/Admin
exports.deleteTemplateFile = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!template.file || !template.file.fileId) {
      return res.status(400).json({
        success: false,
        message: 'No file attached to this template'
      });
    }

    console.log('🗑️ Deleting file from template:', {
      templateId: template._id,
      fileId: template.file.fileId
    });

    // Delete file from GridFS
    await gridFSBucket.delete(template.file.fileId);

    // Remove file data from template
    template.file = null;
    await template.save();

    console.log('✅ File deleted from template:', req.params.id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      template
    });

  } catch (error) {
    console.error('Delete template file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
};

// @desc    Get template file info (for debugging)
// @route   GET /api/admin/templates/:id/file-info
// @access  Private/Admin
exports.getTemplateFileInfo = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    let fileExists = false;
    let fileInfo = null;
    
    if (template.file && template.file.fileId) {
      const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
      fileExists = files.length > 0;
      fileInfo = files[0] || null;
    }

    res.status(200).json({
      success: true,
      template: {
        id: template._id,
        documentId: template.documentId,
        name: template.name,
        file: template.file,
        fileExistsInGridFS: fileExists,
        gridFSFileInfo: fileInfo
      }
    });
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file info'
    });
  }
};

// ==================== NEW IMAGE MANAGEMENT METHODS ====================

// @desc    Upload images for template
// @route   POST /api/admin/templates/:id/images
// @access  Private/Admin
exports.uploadTemplateImages = async (req, res) => {
  try {
    console.log('📸 UPLOAD TEMPLATE IMAGES REQUEST RECEIVED');
    console.log('📸 Request files:', req.files);
    
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    if (!req.files || !req.files.images) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
    const uploadedImages = [];

    // Process each image
    for (const image of images) {
      console.log('📸 Processing image:', {
        fileName: image.name,
        fileSize: image.size,
        fileType: image.mimetype
      });

      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(image.mimetype)) {
        console.log('❌ Invalid image type:', image.mimetype);
        continue; // Skip invalid images but continue with others
      }

      // Validate image size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        console.log('❌ Image too large:', image.size);
        continue;
      }

      // Upload to GridFS
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = gridFSBucket.openUploadStream(image.name, {
          metadata: {
            templateId: template._id,
            templateName: template.name,
            uploadedBy: req.admin._id,
            uploadDate: new Date(),
            isImage: true,
            documentId: uuidv4()
          }
        });

        uploadStream.end(image.data);

        uploadStream.on('finish', (uploadedFile) => {
          const imageData = {
            fileId: uploadedFile._id,
            fileName: uploadedFile.filename,
            fileSize: uploadedFile.length,
            fileType: image.mimetype,
            uploadDate: new Date(),
            order: template.images.length,
            altText: `Preview image for ${template.name}`
          };

          // Set first image as primary if no primary exists
          if (template.images.length === 0) {
            imageData.isPrimary = true;
          }

          uploadedImages.push(imageData);
          resolve(imageData);
        });

        uploadStream.on('error', (error) => {
          console.error('❌ Image upload error:', error);
          reject(error);
        });
      });

      await uploadPromise;
    }

    // Add images to template
    template.images.push(...uploadedImages);
    await template.save();

    console.log('✅ Images uploaded successfully:', uploadedImages.length);

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Successfully uploaded ${uploadedImages.length} images`,
      images: uploadedImages,
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Upload template images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images: ' + error.message
    });
  }
};

// @desc    Get template image
// @route   GET /api/templates/:id/images/:imageId
// @access  Public
exports.getTemplateImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const { size } = req.query;

    console.log('📸 Getting template image:', { id, imageId, size });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const image = template.images.find(img => img.fileId.toString() === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if file exists in GridFS
    const files = await gridFSBucket.find({ _id: image.fileId }).toArray();
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found in storage'
      });
    }

    const gridFSFile = files[0];

    // Set appropriate content type
    res.setHeader('Content-Type', image.fileType || 'image/jpeg');
    res.setHeader('Content-Length', gridFSFile.length);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    // Stream image from GridFS
    const downloadStream = gridFSBucket.openDownloadStream(image.fileId);
    downloadStream.pipe(res);

    downloadStream.on('error', (error) => {
      console.error('❌ Image download error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming image'
        });
      }
    });

  } catch (error) {
    console.error('❌ Get template image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving image: ' + error.message
    });
  }
};

// @desc    Delete template image
// @route   DELETE /api/admin/templates/:id/images/:imageId
// @access  Private/Admin
exports.deleteTemplateImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    console.log('🗑️ Deleting template image:', { id, imageId });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const imageIndex = template.images.findIndex(img => img.fileId.toString() === imageId);
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = template.images[imageIndex];
    const wasPrimary = image.isPrimary;

    // Delete from GridFS
    try {
      await gridFSBucket.delete(image.fileId);
      console.log('✅ Image deleted from GridFS');
    } catch (error) {
      console.log('⚠️ Could not delete image from GridFS:', error.message);
    }

    // Remove from template images array
    template.images.splice(imageIndex, 1);

    // If deleted image was primary, set a new primary
    if (wasPrimary && template.images.length > 0) {
      template.images[0].isPrimary = true;
    }

    await template.save();

    console.log('✅ Image deleted from template');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Delete template image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image: ' + error.message
    });
  }
};

// @desc    Set primary image
// @route   PUT /api/admin/templates/:id/images/:imageId/primary
// @access  Private/Admin
exports.setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;

    console.log('⭐ Setting primary image:', { id, imageId });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Reset all images to not primary
    template.images.forEach(img => {
      img.isPrimary = img.fileId.toString() === imageId;
    });

    await template.save();

    console.log('✅ Primary image set');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Primary image set successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Set primary image error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting primary image: ' + error.message
    });
  }
};

// @desc    Reorder images
// @route   PUT /api/admin/templates/:id/images/reorder
// @access  Private/Admin
exports.reorderImages = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrder } = req.body;

    console.log('🔄 Reordering images:', { id, imageOrder });

    const template = await Template.findById(id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Update order for each image
    imageOrder.forEach(({ imageId, order }) => {
      const image = template.images.find(img => img.fileId.toString() === imageId);
      if (image) {
        image.order = order;
      }
    });

    // Sort images by order
    template.images.sort((a, b) => a.order - b.order);

    await template.save();

    console.log('✅ Images reordered');

    // Populate the updated template
    const updatedTemplate = await Template.findById(template._id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Images reordered successfully',
      template: updatedTemplate
    });

  } catch (error) {
    console.error('❌ Reorder images error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reordering images: ' + error.message
    });
  }
};