// getUserDocuments.js
const UserDocument = require('../../models/UserDocument');

exports.getUserDocuments = async (req, res) => {
  try {
    const documents = await UserDocument.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('originalTemplate', 'name category fileType')
      .lean();

    // Filter to show only template-based documents (hide empty documents)
    const templateDocuments = documents.filter(doc => doc.originalTemplate);

    res.json({
      success: true,
      documents: templateDocuments.map(doc => ({
        _id: doc._id,
        name: doc.name,
        file: doc.file,
        updatedAt: doc.updatedAt,
        originalTemplate: doc.originalTemplate,
        documentType: doc.documentType,
        createdAt: doc.createdAt
      })),
      downloadCount: templateDocuments.length
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
};