import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const FileTypes = () => {
  const { toast } = useToast();
  const [fileTypes, setFileTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newFileType, setNewFileType] = useState('');

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load file types
  useEffect(() => {
    loadFileTypes();
  }, []);

  const loadFileTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/file-types', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setFileTypes(data.fileTypes || []);
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to load file types');
      }
    } catch (error) {
      console.error('Error loading file types:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFileType = async () => {
    if (!newFileType.trim()) return;

    try {
      const response = await fetch('http://localhost:5001/api/admin/file-types', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newFileType.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setFileTypes(prev => [...prev, data.fileType]);
        setNewFileType('');
        toast({
          title: 'Success',
          description: 'File type created successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create file type');
      }
    } catch (error) {
      console.error('Error creating file type:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateFileType = async (id) => {
    if (!editValue.trim()) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/file-types/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: editValue.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setFileTypes(prev => prev.map(type => 
          type._id === id ? data.fileType : type
        ));
        setEditingId(null);
        setEditValue('');
        toast({
          title: 'Success',
          description: 'File type updated successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to update file type');
      }
    } catch (error) {
      console.error('Error updating file type:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteFileType = async (id) => {
    if (!confirm('Are you sure you want to delete this file type?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/file-types/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setFileTypes(prev => prev.filter(type => type._id !== id));
        toast({
          title: 'Success',
          description: 'File type deleted successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to delete file type');
      }
    } catch (error) {
      console.error('Error deleting file type:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEditing = (fileType) => {
    setEditingId(fileType._id);
    setEditValue(fileType.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <File className="w-6 h-6 text-orange-600" />
          File Types ({fileTypes.length})
        </h2>
      </div>

      {/* Add New File Type */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Add New File Type</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newFileType}
            onChange={(e) => setNewFileType(e.target.value)}
            placeholder="Enter file type (e.g., PDF, DOCX, XLSX)"
            className="flex-1"
          />
          <Button onClick={handleCreateFileType} disabled={!newFileType.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* File Types List */}
      <div className="space-y-3">
        {fileTypes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <File className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No file types found</p>
            <p className="text-sm">Create your first file type to get started</p>
          </div>
        ) : (
          fileTypes.map((fileType) => (
            <div
              key={fileType._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingId === fileType._id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateFileType(fileType._id)}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <File className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-medium">{fileType.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(fileType)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFileType(fileType._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default FileTypes;