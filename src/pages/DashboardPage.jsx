// src/pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Plus, FolderOpen, Download, Clock, Users } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  // Simple card component
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, color = 'blue' }) => (
    <Card>
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-50 mr-4`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name || user?.email}!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={FileText} 
          title="Total Documents" 
          value="12" 
          color="blue" 
        />
        <StatCard 
          icon={FolderOpen} 
          title="Projects" 
          value="5" 
          color="green" 
        />
        <StatCard 
          icon={Download} 
          title="Downloads" 
          value="8" 
          color="purple" 
        />
        <StatCard 
          icon={Users} 
          title="Team Members" 
          value="3" 
          color="orange" 
        />
      </div>

      {/* Quick Actions & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Plus className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-700">New Document</span>
            </button>
            <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <FolderOpen className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-700">Browse Templates</span>
            </button>
            <button className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-600 mr-3" />
              <span className="font-medium text-gray-700">Invite Team</span>
            </button>
          </div>
        </Card>

        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Business Plan Template {item}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Updated 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Share
                  </button>
                </div>
              </div>
            ))}
            
            {[1, 2, 3].length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No documents yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first document to get started</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;