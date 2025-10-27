import React from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const Analytics = ({ performanceMetrics }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        Analytics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700">DOM Load</h3>
          <p className="text-2xl font-bold text-blue-700">
            {performanceMetrics.domContentLoaded} ms
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700">Page Load</h3>
          <p className="text-2xl font-bold text-green-700">
            {performanceMetrics.loadEvent} ms
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700">Total Load</h3>
          <p className="text-2xl font-bold text-purple-700">
            {performanceMetrics.totalLoadTime} ms
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;
