
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Download, ArrowLeft, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const EditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState('');

  const handleSave = () => {
    const savedDocs = JSON.parse(localStorage.getItem('savedDocuments') || '[]');
    savedDocs.push({
      id: Date.now(),
      templateId: id,
      content,
      savedAt: new Date().toISOString()
    });
    localStorage.setItem('savedDocuments', JSON.stringify(savedDocs));
    
    toast({
      title: "Document Saved",
      description: "Your document has been saved to your library."
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your document is being prepared for download..."
    });
  };

  return (
    <>
      <Helmet>
        <title>Document Editor - StartupDocs Builder</title>
        <meta name="description" content="Edit your business documents online with our powerful editor." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate('/templates')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center">
              <FileText className="w-6 h-6 mr-3" />
              <h1 className="text-xl font-semibold">Document Editor</h1>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border-2 border-dashed border-blue-300 min-h-[600px]">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start editing your document here... (Online editor integration coming soon)"
                  className="w-full h-full min-h-[500px] bg-transparent border-none outline-none resize-none text-gray-800 text-lg"
                />
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> This is a demo editor. In production, this would integrate with OnlyOffice or CKEditor for full document editing capabilities including formatting, tables, images, and more!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default EditorPage;
  