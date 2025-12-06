// getUserStats.js
const UserDocument = require('../../models/UserDocument');

exports.getUserStats = async (req, res) => {
  try {
    // Only count template-based documents
    const documents = await UserDocument.find({ 
      user: req.user.id,
      originalTemplate: { $exists: true, $ne: null }
    });
    
    const totalDocuments = documents.length;
    
    // Calculate unique projects (group by template)
    const uniqueProjects = new Set(
      documents.map(doc => doc.originalTemplate.toString())
    ).size;

    res.json({
      success: true,
      stats: {
        totalDocuments,
        projects: uniqueProjects || totalDocuments,
        downloads: totalDocuments,
        recentActivity: documents.slice(0, 5).map(doc => ({
          id: doc._id,
          name: doc.name,
          type: 'template',
          action: 'created',
          timestamp: doc.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
};