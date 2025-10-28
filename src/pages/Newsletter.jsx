import React, { useEffect, useState } from "react";
import axios from "axios";

const NewsletterAdmin = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);

  // ✅ Use import.meta.env for Vite
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Fetching subscribers from:", `${API_BASE_URL}/api/newsletter/subscribers`);
      
      const response = await axios.get(`${API_BASE_URL}/api/newsletter/subscribers`, {
        timeout: 10000,
      });
      
      console.log("API Response:", response.data);
      
      // ✅ Handle different response structures
      // ✅ Handle different response structures
let subscribersData = [];

if (response.data && Array.isArray(response.data.subscribers)) {
  subscribersData = response.data.subscribers;
} else if (Array.isArray(response.data)) {
  subscribersData = response.data;
} else if (response.data && response.data.data) {
  subscribersData = response.data.data;
}
      
      console.log("Processed subscribers:", subscribersData);
      setSubscribers(subscribersData);
      
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        setError("❌ Backend server is not running. Please start the server on port 5001.");
      } else if (error.response?.status === 404) {
        setError("❌ Subscribers endpoint not found. Check your backend routes.");
      } else if (error.response?.data?.message) {
        setError(`❌ ${error.response.data.message}`);
      } else {
        setError("❌ Failed to fetch subscribers. Please try again.");
      }
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    try {
      setDeleteLoading(email);
      await axios.delete(`${API_BASE_URL}/api/newsletter/subscribers`, {
        data: { email }
      });
      
      // Remove from local state
      setSubscribers(prev => prev.filter(sub => sub !== email));
      console.log(`Deleted subscriber: ${email}`);
      
    } catch (error) {
      console.error("Error deleting subscriber:", error);
      alert("❌ Failed to delete subscriber. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const exportToCSV = () => {
    if (subscribers.length === 0) {
      alert("No subscribers to export.");
      return;
    }

    const headers = "Email,Subscription Date\n";
    const csvContent = subscribers.map((email, index) => 
      `${email},${new Date().toLocaleDateString()}`
    ).join("\n");
    
    const fullCSV = headers + csvContent;
    const blob = new Blob([fullCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const clearAllSubscribers = async () => {
    if (!window.confirm("Are you sure you want to delete ALL subscribers? This cannot be undone.")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/newsletter/clear`);
      setSubscribers([]);
      alert("✅ All subscribers cleared successfully.");
    } catch (error) {
      console.error("Error clearing subscribers:", error);
      alert("❌ Failed to clear subscribers.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Newsletter Subscribers</h1>
            <p className="text-gray-600 mt-2">
              Total: <span className="font-semibold">{subscribers.length}</span> subscriber{subscribers.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              disabled={subscribers.length === 0}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              📊 Export CSV
            </button>
            <button
              onClick={clearAllSubscribers}
              disabled={subscribers.length === 0}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={fetchSubscribers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="text-red-700 hover:text-red-900 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        {/* <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Debug Info:</strong> API URL: {API_BASE_URL}/api/newsletter/subscribers
          </p>
        </div> */}

        {/* Subscribers Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4 font-semibold">#</th>
                <th className="p-4 font-semibold">Email Address</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-8 text-gray-500">
                    {error ? "❌ Unable to load subscribers" : "📭 No subscribers yet."}
                  </td>
                </tr>
              ) : (
                subscribers.map((email, index) => (
                  <tr 
                    key={email} 
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-700 font-medium">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                          {email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(email)}
                        disabled={deleteLoading === email}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded font-medium transition-colors min-w-20 text-sm"
                      >
                        {deleteLoading === email ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                            Deleting...
                          </span>
                        ) : (
                          "🗑️ Delete"
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Stats Footer */}
        {subscribers.length > 0 && (
          <div className="mt-6 text-center text-gray-600 text-sm">
            📊 Showing {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
            {" • "}
            <button 
              onClick={() => console.log('Subscribers:', subscribers)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View Console Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterAdmin;