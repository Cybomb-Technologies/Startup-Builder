import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Mail, BarChart3, LogOut } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`);
  };

  const menuItems = [
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-white shadow-xl min-h-screen p-6 flex flex-col">
      {/* Header */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <p className="text-gray-500 text-sm mt-1">Management Dashboard</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Back to Site</span>
        </button>
      </div>
    </div>
  );
};

// ✅ Make sure this line is exactly like this:
export default Sidebar;