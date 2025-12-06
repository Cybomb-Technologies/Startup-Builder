// controllers/template/updateTemplate.js
const Template = require('../../models/Template');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

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

// @desc    Update a template
// @route   PUT /api/admin/templates/:id
// @access  Private/Admin
const updateTemplate = async (req, res) => {
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

module.exports = updateTemplate;