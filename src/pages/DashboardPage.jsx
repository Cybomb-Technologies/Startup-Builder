// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  FolderOpen,
  Download,
  Clock,
  Edit,
  Share,
  RefreshCw,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Users,
  BarChart,
  Globe,
  Shield,
  Lock,
  Receipt,
  ExternalLink,
  Eye,
  X,
  Calendar,
  Tag,
  Building,
  Mail,
  User,
  Percent
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Helmet } from 'react-helmet';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDocuments: 0,
    projects: 0
  });
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingDocument, setCreatingDocument] = useState(false);
  const [billingData, setBillingData] = useState({
    planName: 'Free',
    planId: 'free',
    billingCycle: 'monthly',
    subscriptionStatus: 'inactive',
    planExpiry: null,
    nextPayment: null,
    invoicesCount: 0,
    totalSpent: 0
  });
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Invoice View Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Tax rate (18% included in the total amount)
  const TAX_RATE = 0.18; // 18% GST

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user payment history
  const fetchPaymentHistory = async () => {
    if (!isAuthenticated) return;

    try {
      setLoadingPayments(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/api/payments/user-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Calculate breakdown of amount with tax included
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

  // Fetch invoice details for view
  const fetchInvoiceDetails = async (payment) => {
    try {
      setLoadingInvoice(true);
      setSelectedInvoice(payment);

      // Calculate breakdown of amounts
      const breakdown = calculateAmountBreakdown(payment.amount);

      // Create invoice details with proper spacing
      const invoiceData = {
        invoiceNumber: payment.transactionId,
        date: payment.paidAt || payment.createdAt,
        dueDate: payment.expiryDate,
        status: payment.status,
        plan: payment.planName,
        billingCycle: payment.billingCycle,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod || 'Credit Card',
        customer: {
          name: user?.name || user?.username || 'Customer',
          email: user?.email || 'customer@example.com',
          userId: user?.id || payment.userId
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

      setInvoiceDetails(invoiceData);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Failed to load invoice details');
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Download invoice
  const handleDownloadInvoice = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please login again to download invoice');
        navigate('/login');
        return;
      }

      // Create a hidden iframe to download the invoice
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${API_BASE_URL}/api/payments/invoice/${transactionId}?token=${encodeURIComponent(token)}`;

      document.body.appendChild(iframe);

      // Remove iframe after download
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 5000);

    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  // Fetch user data including billing
  const fetchUserData = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all data in parallel
      const [documentsResponse, statsResponse, billingResponse, paymentsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/documents`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/payments/plan-details`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/api/payments/user-payments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        const templateDocuments = documentsData.documents || [];
        setRecentTemplates(templateDocuments);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {
          totalDocuments: 0,
          projects: 0
        });
      }

      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        if (billingData.success) {
          setBillingData({
            planName: billingData.user?.planName || billingData.user?.plan || 'Free',
            planId: billingData.user?.planId || billingData.user?.currentPlanId || 'free',
            billingCycle: billingData.user?.billingCycle || 'monthly',
            subscriptionStatus: billingData.user?.subscriptionStatus || 'inactive',
            planExpiry: billingData.user?.planExpiryDate || null,
            nextPayment: billingData.user?.nextPaymentDate || null,
            invoicesCount: billingData.paymentDetails ? 1 : 0,
            totalSpent: billingData.paymentDetails?.amount || 0
          });
        }
      }

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPaymentHistory(paymentsData.payments || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated]);

  // Listen for template download/edit events to refresh data
  useEffect(() => {
    const handleTemplateAction = () => {
      fetchUserData();
    };

    window.addEventListener('templateDownloaded', handleTemplateAction);
    window.addEventListener('templateEdited', handleTemplateAction);

    return () => {
      window.removeEventListener('templateDownloaded', handleTemplateAction);
      window.removeEventListener('templateEdited', handleTemplateAction);
    };
  }, []);

  // Handle new document creation
  const handleNewDocument = async () => {
    try {
      setCreatingDocument(true);
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Please log in to create a new document');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/editor/new/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/editor/userdoc/${data.documentId}`);
      } else {
        const errorData = await response.json();

        if (response.status === 401) {
          alert('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          alert(errorData.message || 'Failed to create new document. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating new document:', error);
      alert('Error creating new document. Please try again.');
    } finally {
      setCreatingDocument(false);
    }
  };

  const handleEditTemplate = (documentId) => {
    navigate(`/editor/userdoc/${documentId}`);
  };

  const handleBrowseTemplates = () => {
    navigate('/templates');
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return '$0.00';
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    }
  };

  // Plan features based on current plan
  const getPlanFeatures = () => {
    const baseFeatures = [
      { icon: <Zap className="h-4 w-4 text-blue-500" />, text: "Basic Templates" },
      { icon: <Users className="h-4 w-4 text-green-500" />, text: "Single User" },
    ];

    if (billingData.planName.toLowerCase().includes('pro') || billingData.planName.toLowerCase().includes('premium')) {
      return [
        ...baseFeatures,
        { icon: <BarChart className="h-4 w-4 text-purple-500" />, text: "Advanced Analytics" },
        { icon: <Globe className="h-4 w-4 text-orange-500" />, text: "Priority Support" },
        { icon: <Shield className="h-4 w-4 text-red-500" />, text: "Enhanced Security" },
        { icon: <Lock className="h-4 w-4 text-indigo-500" />, text: "Team Collaboration" },
      ];
    }

    if (billingData.planName.toLowerCase().includes('business')) {
      return [
        ...baseFeatures,
        { icon: <BarChart className="h-4 w-4 text-purple-500" />, text: "Advanced Analytics" },
        { icon: <Globe className="h-4 w-4 text-orange-500" />, text: "Priority Support" },
        { icon: <Shield className="h-4 w-4 text-red-500" />, text: "Enhanced Security" },
        { icon: <Lock className="h-4 w-4 text-indigo-500" />, text: "Team Collaboration" },
        { icon: <Download className="h-4 w-4 text-green-500" />, text: "Unlimited Downloads" },
      ];
    }

    return baseFeatures;
  };

  // Render payment status badge
  const renderPaymentStatus = (status) => {
    const statusConfig = {
      success: { color: 'bg-green-100 text-green-800', text: 'Success' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Invoice View Modal Component - FIXED ALIGNMENT
  const InvoiceModal = () => {
    if (!showInvoiceModal || !invoiceDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b">
            <div className="flex items-center space-x-3">
              <Receipt className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Invoice Details</h2>
                <p className="text-sm text-gray-500">Transaction ID: {invoiceDetails.invoiceNumber}</p>
              </div>
            </div>
            <button
              onClick={() => setShowInvoiceModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Invoice Header - Fixed spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Company Info - Left Column */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{invoiceDetails.company.name}</h3>
                </div>
                <p className="text-gray-600">{invoiceDetails.company.address}</p>
                <p className="text-gray-600">{invoiceDetails.company.city}</p>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{invoiceDetails.company.email}</span>
                </div>
                <p className="text-gray-600">{invoiceDetails.company.website}</p>
                {invoiceDetails.company.gstin && (
                  <p className="text-sm text-gray-500">GSTIN: {invoiceDetails.company.gstin}</p>
                )}
                {invoiceDetails.company.taxId && (
                  <p className="text-sm text-gray-500">Tax ID: {invoiceDetails.company.taxId}</p>
                )}
              </div>

              {/* Invoice Title - Right Column */}
              <div className="text-right space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">TAX INVOICE</h1>
                <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                  {invoiceDetails.status.toUpperCase()}
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Generated on {new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Invoice Details - Fixed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 p-6 bg-gray-50 rounded-lg">
              {/* Bill To Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Bill To</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900 font-medium">{invoiceDetails.customer.name}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-600">{invoiceDetails.customer.email}</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">
                    Customer ID: {invoiceDetails.customer.userId}
                  </p>
                </div>
              </div>

              {/* Invoice Info Section */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 text-lg border-b pb-2">Invoice Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Invoice #</p>
                    <p className="font-medium text-gray-900 break-all">{invoiceDetails.invoiceNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(invoiceDetails.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-900">
                      {invoiceDetails.dueDate ? new Date(invoiceDetails.dueDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium text-gray-900">{invoiceDetails.plan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items Table - Fixed spacing */}
            <div className="mb-10">
              <h4 className="font-semibold text-gray-900 text-lg mb-4">Invoice Items</h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Billing Period</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Unit Price (excl. tax)</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount (excl. tax)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceDetails.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-gray-700">{item.description}</td>
                        <td className="px-6 py-4 text-gray-700">{item.billingPeriod}</td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatCurrency(item.unitPrice, invoiceDetails.currency)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.quantity}</td>
                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {formatCurrency(item.amount, invoiceDetails.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary - Fixed alignment */}
            <div className="mb-10">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Subtotal (excl. tax)</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoiceDetails.baseAmount, invoiceDetails.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <Percent className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-gray-600">GST ({invoiceDetails.taxRate}%)</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(invoiceDetails.taxAmount, invoiceDetails.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-gray-300">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(invoiceDetails.totalAmount, invoiceDetails.currency)}
                    </span>
                  </div>

                  {/* Breakdown for clarity */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs">
                    <p className="text-gray-600 font-medium mb-1">Amount Breakdown:</p>
                    <div className="grid grid-cols-2 gap-1">
                      <span>Base Amount:</span>
                      <span className="text-right">{formatCurrency(invoiceDetails.baseAmount, invoiceDetails.currency)}</span>
                      <span>GST ({invoiceDetails.taxRate}%):</span>
                      <span className="text-right">{formatCurrency(invoiceDetails.taxAmount, invoiceDetails.currency)}</span>
                      <span className="font-semibold">Total Paid:</span>
                      <span className="text-right font-semibold">{formatCurrency(invoiceDetails.totalAmount, invoiceDetails.currency)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information - Fixed spacing */}
            <div className="p-6 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-4 text-lg">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900">{invoiceDetails.paymentMethod}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Tag className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Subscription Plan</p>
                    <p className="font-medium text-gray-900">{invoiceDetails.plan}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Billing Cycle</p>
                    <p className="font-medium text-gray-900 capitalize">{invoiceDetails.billingCycle}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  Thank you for choosing TemplateFlow. Please keep this invoice for your records.
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  For any questions about this invoice, contact support@templateflow.com
                </p>
                <div className="mt-4 text-xs text-gray-400">
                  <p>This is a computer-generated invoice and does not require a signature.</p>
                  <p>GST @ {invoiceDetails.taxRate}% is included in the total amount.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer - Fixed positioning */}
          <div className="sticky bottom-0 bg-white border-t p-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Invoice generated on {new Date().toLocaleDateString()}
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    handleDownloadInvoice(invoiceDetails.invoiceNumber);
                    setShowInvoiceModal(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access dashboard</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Dashboard - Paplixo</title>
        <meta
          name="description"
          content="Your central workspace on Paplixo to manage templates, edits, downloads, and project activity."
        />
      </Helmet>

      {/* Invoice Modal */}
      <InvoiceModal />

      {/* Header with Refresh Button */}
      {/* <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email}!
            {billingData.planId && (
              <span className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">
                Plan: {billingData.planId}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div> */}

      {/* Quick Stats Grid - Including Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Templates Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 mr-4">
              <FolderOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : stats.projects}</p>
            </div>
          </div>
        </div>

        {/* Plan ID Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 mr-4">
              <Receipt className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Plan ID</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : billingData.planId || 'free'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg mr-4 ${billingData.subscriptionStatus === 'active'
              ? 'bg-green-50'
              : billingData.subscriptionStatus === 'expired'
                ? 'bg-red-50'
                : 'bg-yellow-50'
              }`}>
              {billingData.subscriptionStatus === 'active' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : billingData.subscriptionStatus === 'expired' ? (
                <AlertCircle className="w-6 h-6 text-red-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-2xl font-bold capitalize ${billingData.subscriptionStatus === 'active'
                ? 'text-green-600'
                : billingData.subscriptionStatus === 'expired'
                  ? 'text-red-600'
                  : 'text-yellow-600'
                }`}>
                {billingData.subscriptionStatus || 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
            <button
              onClick={() => setShowPaymentHistory(!showPaymentHistory)}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              {showPaymentHistory ? 'Hide History' : 'Show History'}
              <ArrowRight className={`w-4 h-4 ml-1 transition-transform ${showPaymentHistory ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showPaymentHistory && (
            <div className="mt-4">
              {loadingPayments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="space-y-4">
                  {paymentHistory.slice(0, 5).map((payment) => {
                    // Calculate breakdown for display
                    const breakdown = calculateAmountBreakdown(payment.amount);

                    return (
                      <div key={payment._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <h3 className="font-medium text-gray-900">{payment.planName}</h3>
                            {renderPaymentStatus(payment.status)}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(payment.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Transaction ID: {payment.transactionId}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {formatCurrency(breakdown.total, payment.currency)}
                              <span className="text-xs text-gray-500 block">
                                (incl. {TAX_RATE * 100}% GST)
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {payment.billingCycle} • {payment.paymentMethod || 'Card'}
                            </p>
                            <div className="text-xs text-gray-400 mt-1">
                              Base: {formatCurrency(breakdown.baseAmount, payment.currency)} +
                              Tax: {formatCurrency(breakdown.taxAmount, payment.currency)}
                            </div>
                          </div>
                          {payment.status === 'success' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => fetchInvoiceDetails(payment)}
                                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleDownloadInvoice(payment.transactionId)}
                                className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {paymentHistory.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => navigate('/billing/history')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View All {paymentHistory.length} Payments
                        <ExternalLink className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No payment history found</p>
                  <p className="text-sm text-gray-400 mt-1">Upgrade your plan to see payment history</p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Billing Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleNewDocument}
                disabled={creatingDocument}
                className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingDocument ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-3" />
                ) : (
                  <Plus className="w-5 h-5 text-blue-600 mr-3" />
                )}
                <span className="font-medium text-gray-700">
                  {creatingDocument ? 'Creating...' : 'New Document'}
                </span>
              </button>
              <button
                onClick={handleBrowseTemplates}
                className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-gray-600 mr-3" />
                <span className="font-medium text-gray-700">Browse Templates</span>
              </button>

            </div>
          </div>

          {/* Billing Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Billing Summary</h2>

            </div>

            <div className="space-y-4">
              {/* Plan ID */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan ID:</span>
                <span className="font-semibold font-mono text-sm">{billingData.planId || 'free'}</span>
              </div>

              {/* Current Plan */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Plan:</span>
                <span className="font-semibold">{billingData.planName}</span>
              </div>

              {/* Billing Cycle */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Billing:</span>
                <span className="font-semibold capitalize">{billingData.billingCycle}</span>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold capitalize ${billingData.subscriptionStatus === 'active'
                  ? 'text-green-600'
                  : 'text-gray-600'
                  }`}>
                  {billingData.subscriptionStatus || 'Inactive'}
                </span>
              </div>

              {/* Expiry/Renewal Date */}
              {billingData.planExpiry && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    {billingData.subscriptionStatus === 'active' ? 'Renews on:' : 'Expired on:'}
                  </span>
                  <span className="font-semibold">
                    {new Date(billingData.planExpiry).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Total Spent (with tax included) */}
              {billingData.totalSpent > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="font-semibold">
                      {/* *** MODIFIED HERE *** Pass 'INR' as the second argument to formatCurrency
                */}
                      {formatCurrency(billingData.totalSpent, 'INR')}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Base Amount:</span>
                      {/* *** MODIFIED HERE *** */}
                      <span>{formatCurrency(billingData.totalSpent / (1 + TAX_RATE), 'INR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({TAX_RATE * 100}%):</span>
                      {/* *** MODIFIED HERE *** */}
                      <span>{formatCurrency(billingData.totalSpent * TAX_RATE / (1 + TAX_RATE), 'INR')}</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Recent Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Templates Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Templates</h2>
              {recentTemplates.length > 0 && (
                <button
                  onClick={handleBrowseTemplates}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Browse More
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-300 mr-3" />
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-12 h-8 bg-gray-200 rounded"></div>
                      <div className="w-12 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTemplates.length > 0 ? (
              <div className="space-y-4">
                {recentTemplates.slice(0, 5).map((template) => (
                  <div key={template._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Updated {formatDate(template.updatedAt)}
                        </p>
                        {template.originalTemplate && (
                          <p className="text-xs text-gray-400 mt-1">
                            Based on: {template.originalTemplate.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTemplate(template._id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 transition-colors flex items-center">
                        <Share className="w-3 h-3 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No templates yet</p>
                <p className="text-sm text-gray-400 mt-1">Edit a template online to see it here</p>
                <button
                  onClick={handleBrowseTemplates}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Templates
                </button>
              </div>
            )}
          </div>

          {/* Plan Features Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your {billingData.planName} Plan Features
              </h2>
              {billingData.planName === 'Free' && (
                <Button
                  onClick={() => navigate('/pricing')}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getPlanFeatures().map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {feature.icon}
                  </div>
                  <span className="font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Upgrade Prompt for Free Users */}
            {billingData.planName === 'Free' && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Ready to level up?</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Upgrade to unlock premium features, priority support, and unlimited templates.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/pricing')}
                  className="w-full mt-4"
                >
                  Explore Premium Plans
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;