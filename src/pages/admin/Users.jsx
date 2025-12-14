import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Calendar,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Package,
  DollarSign,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  Search,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const UsersPage = () => {
  const { toast } = useToast();
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    plan: 'all',
    status: 'all'
  });
  const [availablePlans, setAvailablePlans] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // ✅ Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ✅ Load users on mount
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.plan !== 'all') params.append('plan', filters.plan);
      if (filters.status !== 'all') params.append('status', filters.status);

      const queryString = params.toString();
      const url = `${API_BASE_URL}/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setRegisteredUsers(data.users || []);
        setAvailablePlans(data.filters?.plans || []);
      } else if (response.status === 401) {
        throw new Error("Authentication failed");
      } else {
        throw new Error("Failed to load users");
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setRegisteredUsers([]);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load user details for preview
  const loadUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setIsPreviewOpen(true);
      } else {
        throw new Error("Failed to load user details");
      }
    } catch (error) {
      console.error("Error loading user details:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    try {
      const dataForExport = registeredUsers.map(user => ({
        'User Name': user.username || user.name || 'N/A',
        'Email': user.email || 'N/A',
        'Plan': user.plan || 'Free',
        'Plan ID': user.planId || 'free',
        'Plan Expiry': user.planExpiryDate ? new Date(user.planExpiryDate).toLocaleDateString() : 'N/A',
        'Joined Date': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A',
        'Account Status': user.isActive ? 'Active' : 'Inactive'
      }));

      const ws = XLSX.utils.json_to_sheet(dataForExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);

      toast({
        title: "Success",
        description: "Users exported to Excel successfully",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Error",
        description: "Failed to export users",
        variant: "destructive",
      });
    }
  };

  // ✅ Toggle row expansion
  const toggleRowExpansion = (userId) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(userId)) {
      newExpandedRows.delete(userId);
    } else {
      newExpandedRows.add(userId);
    }
    setExpandedRows(newExpandedRows);
  };

  // ✅ Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Get plan badge color
  const getPlanBadgeColor = (planId) => {
    switch (planId) {
      case 'free':
        return "bg-gray-100 text-gray-800";
      case 'basic':
        return "bg-blue-100 text-blue-800";
      case 'pro':
        return "bg-purple-100 text-purple-800";
      case 'enterprise':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Get status badge color
  const getStatusBadgeColor = (status, isPremium) => {
    if (status === 'active') return "bg-green-100 text-green-800";
    if (status === 'inactive') return "bg-gray-100 text-gray-800";
    if (isPremium) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // ✅ Loading spinner
  if (loading && registeredUsers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Registered Users
          </h2>
          <p className="text-gray-600 mt-1">
            {registeredUsers.length} total users
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Excel
          </Button>

        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
            {filters.search && (
              <button
                onClick={() => setFilters({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <Select
            value={filters.plan}
            onValueChange={(value) => setFilters({ ...filters, plan: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {availablePlans.map(plan => (
                <SelectItem key={plan} value={plan}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>



          <Button
            onClick={() => setFilters({ search: '', plan: 'all', status: 'all' })}
            variant="outline"
            className="w-full"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {registeredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No registered users found.</p>
          <p className="text-gray-400 text-sm mt-1">
            {filters.search || filters.plan !== 'all' || filters.status !== 'all'
              ? "Try adjusting your filters"
              : "Users will appear here once they register on your site."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registeredUsers.map((user) => (
                  <React.Fragment key={user._id}>
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 text-sm font-medium">
                              {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || user.username || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {user.plan || 'Free'}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(user.planId)}`}>
                            <Package className="w-3 h-3 mr-1" />
                            {user.planId || 'free'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadUserDetails(user._id)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </Button>

                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Row Details */}
                    {expandedRows.has(user._id) && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Subscription Details</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Billing Cycle:</span>
                                  <span className="font-medium">{user.billingCycle || 'monthly'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Plan Expiry:</span>
                                  <span className="font-medium">{formatDate(user.planExpiryDate)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last Payment:</span>
                                  <span className="font-medium">{formatDate(user.lastPaymentDate)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Account Information</h4>
                              <div className="space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Current Plan ID:</span>
                                  <span className="font-medium">{user.currentPlanId || 'free'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Account Active:</span>
                                  <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {user.isActive ? 'Yes' : 'No'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last Updated:</span>
                                  <span className="font-medium">{formatDateTime(user.updatedAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Quick Actions</h4>
                              <div className="space-y-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => loadUserDetails(user._id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Full Details
                                </Button>

                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-2xl font-bold">
                      {selectedUser.name?.charAt(0)?.toUpperCase() || selectedUser.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.name || selectedUser.username || 'N/A'}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(selectedUser.planId)}`}>
                        {selectedUser.plan || 'Free'} Plan
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(selectedUser.subscriptionStatus, selectedUser.isPremium)}`}>
                        {selectedUser.subscriptionStatus || 'inactive'}
                      </span>
                      {selectedUser.isPremium && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Premium User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900 border-b pb-2">
                    Subscription Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Name:</span>
                      <span className="font-medium">{selectedUser.plan || 'Free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan ID:</span>
                      <span className="font-medium">{selectedUser.planId || 'free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Plan ID:</span>
                      <span className="font-medium">{selectedUser.currentPlanId || 'free'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Billing Cycle:</span>
                      <span className="font-medium">{selectedUser.billingCycle || 'monthly'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subscription Status:</span>
                      <span className="font-medium">{selectedUser.subscriptionStatus || 'inactive'}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900 border-b pb-2">
                    Payment Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plan Expiry Date:</span>
                      <span className="font-medium">{formatDateTime(selectedUser.planExpiryDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Payment Date:</span>
                      <span className="font-medium">{formatDateTime(selectedUser.lastPaymentDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg text-gray-900 border-b pb-2">
                    Account Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Account Status:</span>
                      <span className={`font-medium ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Joined Date:</span>
                      <span className="font-medium">{formatDateTime(selectedUser.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="font-medium">{formatDateTime(selectedUser.updatedAt)}</span>
                    </div>
                    {selectedUser.accessLevel && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Access Level:</span>
                        <span className="font-medium">{selectedUser.accessLevel.name}</span>
                      </div>
                    )}
                  </div>
                </div>


              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default UsersPage;