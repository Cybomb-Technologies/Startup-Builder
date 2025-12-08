import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  MoreVertical,
  Calendar,
  CreditCard,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Percent,
  Receipt,
  Download // Add this import
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx"; // Import XLSX library

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PaymentsPage = () => {
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    planId: '',
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false); // New state for export loading

  // Tax rate (18% included in the total amount)
  const TAX_RATE = 0.18; // 18% GST

  // ✅ Get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ✅ Calculate amount breakdown with tax
  const calculateAmountBreakdown = (totalAmount) => {
    const total = parseFloat(totalAmount) || 0;
    
    // Calculate base amount (total / 1.18)
    const baseAmount = total / (1 + TAX_RATE);
    
    // Calculate tax amount (18% of base amount)
    const taxAmount = baseAmount * TAX_RATE;
    
    return {
      baseAmount: parseFloat(baseAmount.toFixed(2)),     // 0.85 for 1.00 total
      taxAmount: parseFloat(taxAmount.toFixed(2)),       // 0.15 for 1.00 total
      total: parseFloat(total.toFixed(2))                // 1.00
    };
  };

  // ✅ Load payments with filters
  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/payments?${queryParams}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          total: data.total
        });
        
        if (data.stats) {
          setStats(data.stats);
        }
      } else if (response.status === 401) {
        throw new Error("Authentication failed");
      } else {
        throw new Error("Failed to load payments");
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      setPayments([]);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  // ✅ Load payment stats
  const loadStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/payments/stats`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // ✅ Load payments on mount
  useEffect(() => {
    loadPayments();
    loadStats();
  }, [loadPayments]);

  // ✅ Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // ✅ Format date for Excel
  const formatDateForExcel = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US');
  };

  // ✅ Export payments to Excel
  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // If we're filtering, we need to fetch all data without pagination
      let allPayments = [];
      
      // If filters are applied, fetch all matching data
      if (filters.status || filters.planId || filters.search) {
        const queryParams = new URLSearchParams({
          ...filters,
          page: 1,
          limit: 10000, // Large number to get all data
        });
        
        const response = await fetch(
          `${API_BASE_URL}/api/admin/payments?${queryParams}`,
          {
            headers: getAuthHeaders(),
          }
        );

        if (response.ok) {
          const data = await response.json();
          allPayments = data.payments || [];
        } else {
          // Fallback to current payments if API fails
          allPayments = payments;
        }
      } else {
        // Use current payments if no filters
        allPayments = payments;
      }

      // Prepare data for Excel
      const excelData = allPayments.map(payment => {
        const breakdown = calculateAmountBreakdown(payment.amount);
        
        return {
          'Transaction ID': payment.transactionId || 'N/A',
          'User Name': payment.user?.username || 'N/A',
          'User Email': payment.user?.email || 'N/A',
          'Plan Name': payment.planName || 'N/A',
          'Plan ID': payment.planId || 'N/A',
          'Billing Cycle': payment.billingCycle || 'N/A',
          'Status': payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A',
          'Payment Method': payment.paymentMethod || 'N/A',
          'Currency': payment.currency || 'INR',
          'Total Amount (INR)': payment.amount || 0,
          'Base Amount (excl. tax)': breakdown.baseAmount,
          'Tax Amount (18% GST)': breakdown.taxAmount,
          'Tax Percentage': '18%',
          'Created Date': formatDateForExcel(payment.createdAt),
          'Expiry Date': formatDateForExcel(payment.expiryDate),
          'Gateway Response': payment.gatewayResponse ? JSON.stringify(payment.gatewayResponse) : '',
          'Gateway Transaction ID': payment.gatewayTransactionId || '',
          'Refund Status': payment.refundStatus || 'N/A',
          'Refund Amount': payment.refundAmount || 0,
          'Refund Date': formatDateForExcel(payment.refundDate),
        };
      });

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Create a worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // Transaction ID
        { wch: 15 }, // User Name
        { wch: 25 }, // User Email
        { wch: 15 }, // Plan Name
        { wch: 10 }, // Plan ID
        { wch: 12 }, // Billing Cycle
        { wch: 10 }, // Status
        { wch: 15 }, // Payment Method
        { wch: 8 },  // Currency
        { wch: 15 }, // Total Amount
        { wch: 15 }, // Base Amount
        { wch: 15 }, // Tax Amount
        { wch: 12 }, // Tax Percentage
        { wch: 10 }, // Auto Renewal
        { wch: 20 }, // Created Date
        { wch: 20 }, // Paid Date
        { wch: 20 }, // Expiry Date
        { wch: 10 }, // User ID
        { wch: 12 }, // Plan Type
        { wch: 30 }, // Notes
        { wch: 30 }, // Gateway Response
        { wch: 25 }, // Gateway Transaction ID
        { wch: 12 }, // Refund Status
        { wch: 12 }, // Refund Amount
        { wch: 20 }, // Refund Date
      ];
      ws['!cols'] = colWidths;
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Payments");
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `payments-export-${timestamp}.xlsx`;
      
      // Write the workbook and trigger download
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Export Successful",
        description: `Exported ${excelData.length} payment records to ${filename}`,
      });
      
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export payments data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // ✅ View payment details
  const handleViewDetails = async (paymentId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/payments/${paymentId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedPayment(data.payment);
        setIsDetailsOpen(true);
      } else {
        throw new Error("Failed to load payment details");
      }
    } catch (error) {
      console.error("Error loading payment details:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ View invoice details
  const handleViewInvoice = (payment) => {
    setSelectedPayment(payment);
    setIsInvoiceModalOpen(true);
  };

  // ✅ Update payment status
  const handleUpdateStatus = async () => {
    if (!selectedPayment || !newStatus) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/payments/${selectedPayment.id}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        
        // Update local state
        setPayments(prev => prev.map(p => 
          p.id === selectedPayment.id 
            ? { ...p, status: newStatus }
            : p
        ));
        
        setIsUpdateStatusOpen(false);
        setNewStatus('');
      } else {
        throw new Error("Failed to update payment status");
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount, currency = 'INR') => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // ✅ Generate invoice data
  const generateInvoiceData = (payment) => {
    const breakdown = calculateAmountBreakdown(payment.amount);
    
    return {
      invoiceNumber: payment.transactionId,
      date: payment.paidAt || payment.createdAt,
      status: payment.status,
      plan: payment.planName,
      billingCycle: payment.billingCycle,
      currency: payment.currency,
      paymentMethod: payment.paymentMethod || 'Credit Card',
      customer: {
        name: payment.user?.username || 'Customer',
        email: payment.user?.email || 'customer@example.com',
        userId: payment.user?.id || payment.userId
      },
      company: {
        name: 'TemplateFlow',
        address: '123 Business Street',
        city: 'City, State 12345',
        email: 'support@templateflow.com',
        website: 'www.templateflow.com',
        taxId: 'TAX-789-456-123',
        gstin: '18ABCDE1234F1Z5'
      },
      items: [
        {
          id: 1,
          description: `${payment.planName} Subscription - ${payment.billingCycle === 'annual' ? 'Yearly' : 'Monthly'}`,
          billingPeriod: payment.billingCycle === 'annual' ? 'Yearly' : 'Monthly',
          unitPrice: breakdown.baseAmount,
          amount: breakdown.baseAmount,
          quantity: 1
        }
      ],
      baseAmount: breakdown.baseAmount,
      taxAmount: breakdown.taxAmount,
      taxRate: TAX_RATE * 100, // 18%
      totalAmount: breakdown.total
    };
  };

  // ✅ Invoice Modal Component
  const InvoiceModal = () => {
    if (!isInvoiceModalOpen || !selectedPayment) return null;

    const invoiceData = generateInvoiceData(selectedPayment);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tax Invoice</h3>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Company Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold">{invoiceData.company.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{invoiceData.company.address}</p>
                <p className="text-sm text-gray-600">{invoiceData.company.city}</p>
                <p className="text-sm text-gray-600">{invoiceData.company.email}</p>
                <p className="text-sm text-gray-600">{invoiceData.company.website}</p>
                <p className="text-sm text-gray-500">GSTIN: {invoiceData.company.gstin}</p>
              </div>
              
              {/* Invoice Info */}
              <div className="text-right space-y-2">
                <h2 className="text-2xl font-bold">TAX INVOICE</h2>
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {invoiceData.status.toUpperCase()}
                </div>
                <div className="space-y-1 text-sm">
                  <p>Invoice #: {invoiceData.invoiceNumber}</p>
                  <p>Date: {new Date(invoiceData.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Bill To Section */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Bill To:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{invoiceData.customer.name}</p>
                  <p className="text-sm text-gray-600">{invoiceData.customer.email}</p>
                  <p className="text-sm text-gray-500">Customer ID: {invoiceData.customer.userId}</p>
                </div>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div className="mb-8">
              <h4 className="font-medium mb-4">Invoice Items</h4>
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Billing Period</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Unit Price (excl. tax)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount (excl. tax)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3">{item.billingPeriod}</td>
                      <td className="px-4 py-3">{formatCurrency(item.unitPrice, invoiceData.currency)}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(item.amount, invoiceData.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Summary */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal (excl. tax):</span>
                  <span className="font-medium">
                    {formatCurrency(invoiceData.baseAmount, invoiceData.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Percent className="w-3 h-3 mr-1" />
                    GST ({invoiceData.taxRate}%):
                  </span>
                  <span className="font-medium">
                    {formatCurrency(invoiceData.taxAmount, invoiceData.currency)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-300">
                  <span className="text-lg font-semibold">Total Amount:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                  </span>
                </div>
                
                {/* Breakdown */}
                <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
                  <p className="font-medium mb-2">Amount Breakdown:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <span>Base Amount:</span>
                    <span className="text-right">
                      {formatCurrency(invoiceData.baseAmount, invoiceData.currency)}
                    </span>
                    <span>GST ({invoiceData.taxRate}%):</span>
                    <span className="text-right">
                      {formatCurrency(invoiceData.taxAmount, invoiceData.currency)}
                    </span>
                    <span className="font-semibold">Total Paid:</span>
                    <span className="text-right font-semibold">
                      {formatCurrency(invoiceData.totalAmount, invoiceData.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Payment Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium">{invoiceData.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{invoiceData.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Billing Cycle</p>
                  <p className="font-medium capitalize">{invoiceData.billingCycle}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>This is a computer-generated invoice and does not require a signature.</p>
              <p>GST @ {invoiceData.taxRate}% is included in the total amount.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end mt-8 pt-6 border-t">
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Here you can implement PDF download functionality
                  toast({
                    title: "Invoice Downloaded",
                    description: "Invoice PDF has been generated",
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Loading spinner
  if (loading && payments.length === 0) {
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
      className="p-6 space-y-6"
    >
      {/* Invoice Modal */}
      <InvoiceModal />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            Payment Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor all payment transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          
          {/* Export Button */}
          <button
            onClick={exportToExcel}
            disabled={isExporting || payments.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isExporting || payments.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export to Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold mt-2">
              {formatCurrency(stats.totalRevenue)}
              <span className="text-xs text-gray-500 block mt-1">
                (incl. {TAX_RATE * 100}% GST)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From {stats.totalTransactions} transactions
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold mt-2">{stats.successRate}%</div>
            <div className="flex items-center text-xs mt-1">
              {stats.successRate > 90 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600">Excellent</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-600 mr-1" />
                  <span className="text-red-600">Needs attention</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold mt-2">
              {payments.filter(p => p.status === 'success' && p.autoRenewal).length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Upcoming Renewals</h3>
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold mt-2">
              {stats.upcomingRenewals?.length || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Next 7 days
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Plan</label>
            <select
              value={filters.planId}
              onChange={(e) => handleFilterChange('planId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Transaction ID, User, Plan..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                status: '',
                planId: '',
                search: '',
                page: 1,
                limit: 20,
                sortBy: 'createdAt',
                sortOrder: 'desc'
              })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">Payment Transactions ({pagination.total})</h3>
            <p className="text-sm text-gray-500 mt-1">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          </div>
          </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (incl. tax)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payment transactions found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const breakdown = calculateAmountBreakdown(payment.amount);
                  
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {payment.user?.username || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.user?.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{payment.planName}</div>
                          <div className="text-sm text-gray-500">
                            {payment.billingCycle}
                            {payment.autoRenewal && (
                              <span className="ml-2 text-green-600">🔁</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Base: {formatCurrency(breakdown.baseAmount, payment.currency)} + 
                            Tax: {formatCurrency(breakdown.taxAmount, payment.currency)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center ">
                          
                          
                          <button
                            onClick={() => handleViewDetails(payment.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {payments.length} of {pagination.total} payments
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={filters.page <= 1}
                className={`px-3 py-1 border border-gray-300 rounded ${
                  filters.page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="px-3 py-1 text-sm">
                Page {filters.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handleFilterChange('page', Math.min(pagination.totalPages, filters.page + 1))}
                disabled={filters.page >= pagination.totalPages}
                className={`px-3 py-1 border border-gray-300 rounded ${
                  filters.page >= pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {isDetailsOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Payment Details</h3>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Transaction Info */}
                {/* Transaction Info */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="sm:col-span-2">
    <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
    <p className="font-mono">{selectedPayment.transactionId}</p>
  </div>
  <div>
    <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
    <p className="flex items-center gap-2">
      <CreditCard className="w-4 h-4" />
      {selectedPayment.paymentMethod || 'N/A'}
    </p>
  </div>
  <div>
    <h4 className="text-sm font-medium text-gray-500">Status</h4>
    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
  </div>
</div>

                {/* User Info */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">User Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs text-gray-500">Name</h5>
                      <p>{selectedPayment.user?.username || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Email</h5>
                      <p>{selectedPayment.user?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Current Plan</h5>
                      <p>{selectedPayment.user?.currentPlan || 'N/A'}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Subscription Status</h5>
                      <p>{selectedPayment.user?.subscriptionStatus || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Plan Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs text-gray-500">Plan Name</h5>
                      <p>{selectedPayment.planName}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Plan ID</h5>
                      <p>{selectedPayment.planId}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Billing Cycle</h5>
                      <p className="capitalize">{selectedPayment.billingCycle}</p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Expiry Date</h5>
                      <p>{formatDate(selectedPayment.expiryDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Payment Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs text-gray-500">Total Amount (incl. tax)</h5>
                      <p className="text-lg font-bold">
                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Base Amount (excl. tax)</h5>
                      <p>
                        {formatCurrency(selectedPayment.amount / (1 + TAX_RATE), selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Tax Amount ({TAX_RATE * 100}% GST)</h5>
                      <p>
                        {formatCurrency(selectedPayment.amount * TAX_RATE / (1 + TAX_RATE), selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs text-gray-500">Created At</h5>
                      <p>{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleViewInvoice(selectedPayment);
                    setIsDetailsOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  View Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isUpdateStatusOpen && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Update Payment Status</h3>
              <p className="text-sm text-gray-500 mb-4">
                Update status for transaction: {selectedPayment.transactionId}
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Changing status to "success" will automatically update the user's plan.
                    Changing to "failed" will not affect the user's current plan.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6 pt-4 border-t">
                <button
                  onClick={() => setIsUpdateStatusOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={!newStatus}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !newStatus 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentsPage;