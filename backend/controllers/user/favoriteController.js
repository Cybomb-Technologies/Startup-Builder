// favoriteController.js - Handle user favorites
const User = require('../../models/User');
const Template = require('../../models/Template');
const mongoose = require('mongoose');

// Add template to favorites
exports.addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.body;

    console.log('⭐ Adding to favorites:', { userId, templateId });

    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required'
      });
    }

    // Check if template exists
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Find user and update favorites
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Convert user to document to access _id
    const userDoc = user._doc || user;
    
    // Use mongoose.Types.ObjectId for consistency
    const templateObjectId = new mongoose.Types.ObjectId(templateId);
    
    // Check if already favorited
    if (userDoc.favorites && userDoc.favorites.some(fav => 
      fav.template && fav.template.toString() === templateObjectId.toString()
    )) {
      return res.status(200).json({
        success: true,
        message: 'Template already in favorites',
        favorites: userDoc.favorites
      });
    }

    // Add to favorites
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          favorites: {
            template: templateObjectId,
            addedAt: new Date()
          }
        }
      },
      { new: true }
    ).populate({
      path: 'favorites.template',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' },
        { path: 'accessLevel', select: 'name' }
      ]
    });

    res.json({
      success: true,
      message: 'Added to favorites',
      favorites: updatedUser.favorites || []
    });

  } catch (error) {
    console.error('❌ Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding to favorites',
      error: error.message
    });
  }
};

// Remove template from favorites
exports.removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { templateId } = req.params;

    console.log('❌ Removing from favorites:', { userId, templateId });

    const templateObjectId = new mongoose.Types.ObjectId(templateId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          favorites: { template: templateObjectId }
        }
      },
      { new: true }
    ).populate({
      path: 'favorites.template',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'subCategory', select: 'name' },
        { path: 'accessLevel', select: 'name' }
      ]
    });

    res.json({
      success: true,
      message: 'Removed from favorites',
      favorites: updatedUser.favorites || []
    });

  } catch (error) {
    console.error('❌ Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing from favorites',
      error: error.message
    });
  }
};

// Get user favorites
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📋 Getting favorites for user:', userId);

    const user = await User.findById(userId)
      .populate({
        path: 'favorites.template',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'subCategory', select: 'name' },
          { path: 'accessLevel', select: 'name' }
        ]
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out any favorites with null templates (if template was deleted)
    const validFavorites = (user.favorites || []).filter(fav => fav.template);

    res.json({
      success: true,
      favorites: validFavorites,
      count: validFavorites.length
    });

  } catch (error) {
    console.error('❌ Error getting favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting favorites',
      error: error.message
    });
  }
};