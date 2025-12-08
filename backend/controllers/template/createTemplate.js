// controllers/template/createTemplate.js
const Template = require('../../models/Template');
const Category = require('../../models/Category');
const SubCategory = require('../../models/SubCategory');
const UserAccess = require('../../models/UserAccess');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

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

// @desc    Create a template with file upload to MongoDB
// @route   POST /api/admin/templates
// @access  Private/Admin
const createTemplate = async (req, res) => {
  try {
    // console.log('📥 CREATE TEMPLATE REQUEST RECEIVED');
    // console.log('📥 Request body:', req.body);
    // console.log('📥 Request files:', req.files);
    
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

            // console.log('✅ File uploaded to GridFS:', fileData);

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

            // console.log('✅ Template created successfully with file:', {
            //   id: template._id,
            //   documentId: template.documentId,
            //   name: template.name
            // });

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
      // console.log('📝 Creating template without file');
      
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

        // console.log('✅ Template created successfully (no file):', {
        //   id: template._id,
        //   documentId: template.documentId,
        //   name: template.name
        // });

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

module.exports = createTemplate;