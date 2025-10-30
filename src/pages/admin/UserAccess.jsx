import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Users, Crown, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const UserAccess = () => {
  const { toast } = useToast();
  const [accessLevels, setAccessLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newAccessLevel, setNewAccessLevel] = useState('');

  // Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Load access levels
  useEffect(() => {
    loadAccessLevels();
  }, []);

  const loadAccessLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/admin/access-levels', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccessLevels(data.accessLevels || []);
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to load access levels');
      }
    } catch (error) {
      console.error('Error loading access levels:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccessLevel = async () => {
    if (!newAccessLevel.trim()) return;

    try {
      const response = await fetch('http://localhost:5001/api/admin/access-levels', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newAccessLevel.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessLevels(prev => [...prev, data.accessLevel]);
        setNewAccessLevel('');
        toast({
          title: 'Success',
          description: 'Access level created successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create access level');
      }
    } catch (error) {
      console.error('Error creating access level:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateAccessLevel = async (id) => {
    if (!editValue.trim()) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/access-levels/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: editValue.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setAccessLevels(prev => prev.map(level => 
          level._id === id ? data.accessLevel : level
        ));
        setEditingId(null);
        setEditValue('');
        toast({
          title: 'Success',
          description: 'Access level updated successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to update access level');
      }
    } catch (error) {
      console.error('Error updating access level:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccessLevel = async (id) => {
    if (!confirm('Are you sure you want to delete this access level?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/admin/access-levels/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setAccessLevels(prev => prev.filter(level => level._id !== id));
        toast({
          title: 'Success',
          description: 'Access level deleted successfully',
        });
      } else if (response.status === 401) {
        throw new Error('Authentication failed');
      } else {
        throw new Error('Failed to delete access level');
      }
    } catch (error) {
      console.error('Error deleting access level:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const startEditing = (accessLevel) => {
    setEditingId(accessLevel._id);
    setEditValue(accessLevel.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const getAccessLevelIcon = (levelName) => {
    const name = levelName.toLowerCase();
    if (name.includes('free')) return <User className="w-4 h-4" />;
    if (name.includes('pro')) return <Star className="w-4 h-4" />;
    if (name.includes('premium') || name.includes('enterprise')) return <Crown className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
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
          <Users className="w-6 h-6 text-purple-600" />
          User Access Levels ({accessLevels.length})
        </h2>
      </div>

      {/* Add New Access Level */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Add New Access Level</h3>
        <div className="flex gap-2">
          <Input
            type="text"
            value={newAccessLevel}
            onChange={(e) => setNewAccessLevel(e.target.value)}
            placeholder="Enter access level name (e.g., Free, Pro, Premium)"
            className="flex-1"
          />
          <Button onClick={handleCreateAccessLevel} disabled={!newAccessLevel.trim()}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Access Levels List */}
      <div className="space-y-3">
        {accessLevels.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No access levels found</p>
            <p className="text-sm">Create your first access level to get started</p>
          </div>
        ) : (
          accessLevels.map((accessLevel) => (
            <div
              key={accessLevel._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {editingId === accessLevel._id ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdateAccessLevel(accessLevel._id)}
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
                    <div className="p-2 bg-purple-100 rounded-lg">
                      {getAccessLevelIcon(accessLevel.name)}
                    </div>
                    <div>
                      <span className="font-medium">{accessLevel.name}</span>
                      <p className="text-sm text-gray-500">
                        Defines user permissions and feature access
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEditing(accessLevel)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAccessLevel(accessLevel._id)}
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

export default UserAccess;