// getAllTemplates.js
const { gridFSBucket, getAccessibleAccessLevels } = require('./helpers');
const User = require('../../models/User');
const Template = require('../../models/Template');
const UserAccess = require('../../models/UserAccess');

exports.getAllTemplates = async (req, res) => {
  try {
    // Get user to determine accessible templates
    const user = req.user ? await User.findById(req.user.id) : null;
    const userPlanId = user?.planId || 'free';

    // Get accessible access levels for this user
    const accessibleAccessLevels = await getAccessibleAccessLevels(userPlanId);

    // Build query based on user's access
    let query = { isActive: true };
    
    // If user is logged in, filter by accessible access levels
    if (req.user && accessibleAccessLevels.length > 0) {
      query.accessLevel = { $in: accessibleAccessLevels };
    } else {
      // For non-logged in users, only show free templates
      const freeAccessLevel = await UserAccess.findOne({ name: 'free' });
      if (freeAccessLevel) {
        query.accessLevel = freeAccessLevel._id;
      } else {
        query.accessLevel = null; // No templates if free access level doesn't exist
      }
    }

    console.log('🔍 Fetching templates with query:', {
      userPlanId,
      accessibleAccessLevels: accessibleAccessLevels.map(id => id.toString()),
      query
    });

    const templates = await Template.find(query)
      .populate('category', 'name icon')
      .populate('subCategory', 'name')
      .populate('accessLevel', 'name')
      .sort({ createdAt: -1 });

    const enhancedTemplates = await Promise.all(
      templates.map(async (template) => {
        let fileExtension = 'docx';
        
        if (template.file && template.file.fileId) {
          try {
            const files = await gridFSBucket.find({ _id: template.file.fileId }).toArray();
            if (files.length > 0) {
              const gridFSFile = files[0];
              const fileName = gridFSFile.filename;
              const extensionMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
              if (extensionMatch) {
                const ext = extensionMatch[1].toLowerCase();
                const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
                if (validExtensions.includes(ext)) {
                  fileExtension = ext;
                }
              }
            }
          } catch (error) {
            console.warn(`Could not get file info for template ${template._id}:`, error.message);
          }
        }

        if (fileExtension === 'docx' && template.fileType) {
          const templateFileType = template.fileType.replace('.', '').toLowerCase();
          const validExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pdf', 'pptx', 'ppt', 'txt', 'csv', 'rtf'];
          if (validExtensions.includes(templateFileType)) {
            fileExtension = templateFileType;
          }
        }

        const templateObj = template.toObject();
        templateObj.fileExtension = fileExtension;
        
        return templateObj;
      })
    );

    console.log(`✅ Found ${enhancedTemplates.length} accessible templates for user with plan ${userPlanId}`);

    res.json({
      success: true,
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