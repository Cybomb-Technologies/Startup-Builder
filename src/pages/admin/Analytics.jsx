import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, TrendingUp, Users, FileText } from 'lucide-react';

const Analytics = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BarChart className="w-6 h-6 text-purple-600" />
          Analytics
        </h2>
      </div>

      <div className="text-center py-12 text-gray-500">
        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
        <p>Analytics features will be implemented here</p>
        <p className="text-sm mt-1">Track user engagement, template usage, and platform performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-800">Active Users</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-800">Templates Used</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-purple-600">0%</p>
              <p className="text-sm text-purple-800">Growth Rate</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;