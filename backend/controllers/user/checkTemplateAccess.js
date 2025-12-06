// checkTemplateAccess.js
const { canUserAccessTemplate } = require('./helpers');
const User = require('../../models/User');
const Template = require('../../models/Template');

exports.checkTemplateAccess = async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const canAccess = await canUserAccessTemplate(req.user.id, templateId);
    
    const user = await User.findById(req.user.id);
    const template = await Template.findById(templateId).populate('accessLevel', 'name');

    res.json({
      success: true,
      hasAccess: canAccess,
      userPlan: user?.plan || 'Free',
      planId: user?.planId || 'free',
      isPremium: user?.isPremium || false,
      templateAccessLevel: template?.accessLevel?.name,
      message: canAccess ? 'Access granted' : 'Access denied. Upgrade your plan.'
    });
  } catch (error) {
    console.error('Check template access error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};