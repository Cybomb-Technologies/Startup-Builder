import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Users, Mail, BarChart3, LogOut, MessageSquare } from 'lucide-react';
 
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
 
  const handleNavigation = (tab) => {
    setActiveTab(tab);
    // Navigate to the specific admin route based on the tab
    switch(tab) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'templates':
        navigate('/admin/templates');
        break;
      case 'users':
        navigate('/admin/users');
        break;
      case 'contact-messages':
        navigate('/admin/contact-messages');
        break;
      case 'newsletter':
        navigate('/admin/newsletter');
        break;
      case 'upload':
        navigate('/admin/upload');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };
 
  // Update active tab based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes('/templates')) {
      setActiveTab('templates');
    } else if (path.includes('/users')) {
      setActiveTab('users');
    } else if (path.includes('/contact-messages')) {
      setActiveTab('contact-messages');
    } else if (path.includes('/newsletter')) {
      setActiveTab('newsletter');
    } else if (path.includes('/upload')) {
      setActiveTab('upload');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname, setActiveTab]);
 
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'contact-messages', label: 'Contact Messages', icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'upload', label: 'Upload Templates', icon: FileText },
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
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-l-4 border-blue-600 shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>
 
      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.removeItem('adminUser');
            navigate('/');
          }}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
       
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200 mt-2"
        >
          <span className="font-medium">← Back to Main Site</span>
        </button>
      </div>
    </div>
  );
};
 
export default Sidebar;