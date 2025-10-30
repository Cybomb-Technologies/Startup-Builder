const Template = require('../models/Template');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const UserAccess = require('../models/UserAccess');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid'); // Import UUID

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

    res.status(200).json({
      success: true,
      count: templates.length,
      templates
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
    console.log('📥 Request headers content-type:', req.headers['content-type']);
    
    // Parse the form data fields
    const { 
      name, 
      description, 
      category, 
      subCategory, 
      accessLevel, 
      content 
    } = req.body;

    console.log('📥 Parsed template data:', {
      name: name || 'UNDEFINED',
      description: description || 'UNDEFINED', 
      category: category || 'UNDEFINED',
      subCategory: subCategory || 'UNDEFINED', 
      accessLevel: accessLevel || 'UNDEFINED', 
      content: content || 'UNDEFINED',
      hasFile: !!(req.files && req.files.file)
    });

    // Enhanced validation with better logging
    if (!name || !name.trim()) {
      console.log('❌ Validation failed: Name is required');
      return res.status(400).json({
        success: false,
        message: 'Template name is required'
      });
    }

    if (!category) {
      console.log('❌ Validation failed: Category is required');
      return res.status(400).json({
        success: false,
        message: 'Category is required'
      });
    }

    if (!accessLevel) {
      console.log('❌ Validation failed: Access level is required');
      return res.status(400).json({
        success: false,
        message: 'Access level is required'
      });
    }

    if (!content || !content.trim()) {
      console.log('❌ Validation failed: Content is required');
      return res.status(400).json({
        success: false,
        message: 'Template content is required'
      });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      console.log('❌ Category not found:', category);
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if access level exists
    const accessLevelExists = await UserAccess.findById(accessLevel);
    if (!accessLevelExists) {
      console.log('❌ Access level not found:', accessLevel);
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
        console.log('❌ Subcategory not found or does not belong to category:', subCategory);
        return res.status(400).json({
          success: false,
          message: 'Subcategory not found or does not belong to selected category'
        });
      }
    }

    let fileData = {};
    
    // Handle file upload to MongoDB GridFS with express-fileupload
    if (req.files && req.files.file) {
      const file = req.files.file;
      
      console.log('📁 Processing file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.mimetype
      });

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        console.log('❌ File too large:', file.size);
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
        console.log('❌ Invalid file type:', file.mimetype);
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
            documentId: uuidv4() // Add UUID to file metadata
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
            // documentId will be auto-generated by the model
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
              name: template.name,
              category: template.category.name,
              hasFile: !!template.file
            });

            res.status(201).json({
              success: true,
              message: 'Template created successfully',
              template
            });
            resolve();
          } catch (error) {
            console.error('❌ Create template error after file upload:', error);
            
            // Handle duplicate key error specifically
            if (error.code === 11000) {
              console.log('❌ Duplicate key error:', error.keyValue);
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
          name: template.name,
          category: template.category.name
        });

        res.status(201).json({
          success: true,
          message: 'Template created successfully',
          template
        });
      } catch (error) {
        console.error('❌ Create template error:', error);
        
        // Handle duplicate key error specifically
        if (error.code === 11000) {
          console.log('❌ Duplicate key error:', error.keyValue);
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
    
    // Handle duplicate key error specifically
    if (error.code === 11000) {
      console.log('❌ Duplicate key error:', error.keyValue);
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

    console.log('📥 Update template data:', {
      name,
      description,
      category,
      subCategory,
      accessLevel,
      content,
      isActive,
      hasFile: !!(req.files && req.files.file)
    });

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
      
      console.log('📁 Processing file update:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.mimetype
      });

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
            documentId: template.documentId // Use existing documentId
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
            
            // Handle duplicate key error
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
    
    // Handle duplicate key error
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
      console.log('❌ Template not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    console.log('📥 Template found:', {
      id: template._id,
      documentId: template.documentId,
      name: template.name,
      hasFile: !!(template.file && template.file.fileId)
    });

    if (!template.file || !template.file.fileId) {
      console.log('❌ No file attached to template:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'No file attached to this template'
      });
    }

    // Check if file exists in GridFS
    const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
    if (files.length === 0) {
      console.log('❌ File not found in GridFS:', template.file.fileId);
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
      fileSize: template.file.fileSize,
      fileType: template.file.fileType,
      documentId: template.documentId
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

    // Handle client disconnect
    req.on('close', () => {
      console.log('⚠️ Client disconnected during download');
      downloadStream.destroy();
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
      documentId: template.documentId,
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

