import React from 'react';
import { 
  FileText, 
  Users, 
  Mail, 
  BarChart,
  FolderOpen,
  FolderTree,
  UserCheck,
  FileType,
  Settings,
  LogOut,
  Contact
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const navigationItems = [
    {
      name: 'Templates',
      path: 'templates',
      icon: FileText,
      description: 'Manage document templates'
    },
    {
      name: 'Users',
      path: 'users',
      icon: Users,
      description: 'Manage registered users'
    },
    {
      name: 'Newsletter',
      path: 'newsletter',
      icon: Mail,
      description: 'Manage newsletter subscribers'
    },
    {
      name: 'Analytics',
      path: 'analytics',
      icon: BarChart,
      description: 'View platform analytics'
    },
    {
      type: 'divider',
      label: 'Content Management'
    },
    {
      name: 'Categories',
      path: 'categories',
      icon: FolderOpen,
      description: 'Manage main categories'
    },
    {
      name: 'SubCategories',
      path: 'subcategories',
      icon: FolderTree,
      description: 'Manage subcategories'
    },
    {
      name: 'User Access',
      path: 'user-access',
      icon: UserCheck,
      description: 'Manage access levels'
    },
    {
      name: 'Contact Submissions',
      path: 'Contact-submissions',
      icon: Contact,
      description: 'Getting User Contacts Submission'
    },
    {
      type: 'divider',
      label: 'Settings'
    },
    {
      name: 'System Settings',
      path: 'settings',
      icon: Settings,
      description: 'System configuration'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    toast({
      title: 'Logged out',
      description: 'You have been logged out from admin panel',
    });
    navigate('/admin/login');
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-600 text-sm mt-1">StartupDocs Builder</p>
      </div>

      {/* Navigation - Hide scrollbar */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navigationItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={index} className="pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">
                  {item.label}
                </p>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setActiveTab(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <div className="flex-1 min-w-0">
                <span className="font-medium block text-sm">{item.name}</span>
                <span className={`text-xs block mt-0.5 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;