// controllers/template/uploadTemplateImages.js
const Template = require('../../models/Template');
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

// @desc    Upload images for template
// @route   POST /api/admin/templates/:id/images
// @access  Private/Admin
const uploadTemplateImages = async (req, res) => {
  try {
    // console.log('📸 UPLOAD TEMPLATE IMAGES REQUEST RECEIVED');
    // console.log('📸 Request files:', req.files);
    
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
      // console.log('📸 Processing image:', {
      //   fileName: image.name,
      //   fileSize: image.size,
      //   fileType: image.mimetype
      // });

      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(image.mimetype)) {
        // console.log('❌ Invalid image type:', image.mimetype);
        continue; // Skip invalid images but continue with others
      }

      // Validate image size (5MB limit)
      if (image.size > 5 * 1024 * 1024) {
        // console.log('❌ Image too large:', image.size);
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

    // console.log('✅ Images uploaded successfully:', uploadedImages.length);

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

module.exports = uploadTemplateImages;