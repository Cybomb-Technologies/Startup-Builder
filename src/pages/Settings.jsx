// src/pages/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Shield, Bell, CreditCard, Download } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Simple card component
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );

  const CardHeader = ({ children, className = '' }) => (
    <div className={`border-b border-gray-200 px-6 py-4 ${className}`}>
      {children}
    </div>
  );

  const CardContent = ({ children, className = '' }) => (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );

  const Input = ({ label, type = 'text', value, onChange, placeholder, ...props }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        {...props}
      />
    </div>
  );

  const Button = ({ children, variant = 'primary', ...props }) => (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        variant === 'primary' 
          ? 'bg-blue-600 text-white hover:bg-blue-700' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      {...props}
    >
      {children}
    </button>
  );

  const TabButton = ({ active, children, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-4">
            <nav className="space-y-1">
              <TabButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 inline mr-2" />
                Profile
              </TabButton>
              <TabButton 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Account
              </TabButton>
              <TabButton 
                active={activeTab === 'notifications'} 
                onClick={() => setActiveTab('notifications')}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
              </TabButton>
              <TabButton 
                active={activeTab === 'billing'} 
                onClick={() => setActiveTab('billing')}
              >
                <CreditCard className="w-4 h-4 inline mr-2" />
                Billing
              </TabButton>
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your personal information and how others see you on the platform.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    defaultValue={user?.name || ''}
                    placeholder="Enter your full name"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={user?.email || ''}
                    disabled
                  />
                </div>
                <Input
                  label="Bio"
                  placeholder="Tell us about yourself"
                  multiline
                  rows={3}
                />
                <Button>Update Profile</Button>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your account security and preferences.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      placeholder="Enter current password"
                    />
                    <Input
                      label="New Password"
                      type="password"
                      placeholder="Enter new password"
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      placeholder="Confirm new password"
                    />
                    <Button>Update Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Billing & Plan</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your subscription and billing information.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-blue-900">Free Plan</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        3 documents • Basic templates • Limited exports
                      </p>
                    </div>
                    <Button>Upgrade Plan</Button>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Billing History</h3>
                  <p className="text-gray-500 text-center py-4">
                    No billing history available
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Choose how you want to be notified.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Product Updates</h4>
                    <p className="text-sm text-gray-600">Get notified about new features</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;