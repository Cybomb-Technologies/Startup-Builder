import React from 'react';

const Notices = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Notices</h2>
        <p className="text-gray-600 mb-6">Official business notices and announcement templates.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">Meeting Notice</h3>
            <p className="text-gray-600 text-sm mb-4">Board and team meeting notices</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">Use Template</button>
          </div>
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg mb-2">Policy Change Notice</h3>
            <p className="text-gray-600 text-sm mb-4">Company policy updates</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">Use Template</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notices;