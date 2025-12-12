import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Shield, CreditCard, Building2, Crown, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Helmet } from 'react-helmet';

const API_URL = import.meta.env.VITE_API_URL;

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth(); // ✅ Added logout to handle invalid tokens

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [currency, setCurrency] = useState('INR');

  const navigationState = location.state || {};

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to proceed with payment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    fetchPlanDetails();
  }, [planId, user, navigate]);

  const fetchPlanDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/api/pricing/${planId}`);
      const data = await res.json();

      if (data.success) {
        setPlan(data.plan);

        if (navigationState.billingCycle) {
          setBillingCycle(navigationState.billingCycle);
        }
        if (navigationState.currency) {
          setCurrency(navigationState.currency);
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to load plan details",
          variant: "destructive",
        });
        navigate("/pricing");
      }
    } catch (error) {
      console.error("Error fetching plan details:", error);
      toast({
        title: "Error",
        description: "Failed to load plan details. Please try again.",
        variant: "destructive",
      });
      navigate("/pricing");
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to proceed with payment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // ✅ Use token directly instead of getToken()
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please login again",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!plan) {
      toast({
        title: "Plan Error",
        description: "Plan information is not loaded yet. Please wait.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlanId = plan._id || plan.id || plan.planId;

    if (!selectedPlanId) {
      toast({
        title: "Plan Error",
        description: "Plan ID is missing. Please select a plan again.",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    // Handle free plan
    if (plan.planId === 'free') {
      toast({
        title: "Welcome to Paplixo ! ",
        description: "Your free plan has been activated. Start creating now!",
      });
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlanId,
          billingCycle,
          currency,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          toast({
            title: "Session Expired",
            description: "Please login again to continue",
            variant: "destructive",
          });
          logout();
          navigate("/login");
          return;
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        window.open(data.paymentLink, "_blank");
        // window.location.href = data.paymentLink;
      } else {
        throw new Error(data.message || "Failed to create payment order");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate price based on plan data
  const calculatePrice = () => {
    if (!plan) return currency === "INR" ? "₹0" : "$0";

    let price;
    if (billingCycle === "annual") {
      price = plan.yearlyPrice;
    } else {
      price = plan.monthlyPrice;
    }

    // Convert to USD if needed
    if (currency === "USD") {
      const exchangeRate = navigationState.exchangeRate || 83;
      return `$${(price / exchangeRate).toFixed(2)}`;
    }
    return `₹${Math.round(price).toLocaleString("en-IN")}`;
  };

  const calculateSavings = () => {
    if (billingCycle === "annual" && plan.monthlyPrice) {
      const monthlyCost = plan.monthlyPrice;
      const annualCost = plan.yearlyPrice;
      const savings = monthlyCost * 12 - annualCost;

      if (savings > 0) {
        return currency === "INR"
          ? `Save ₹${Math.round(savings).toLocaleString("en-IN")}`
          : `Save $${(savings / (navigationState.exchangeRate || 83)).toFixed(2)}`;
      }
    }
    return null;
  };

  const savings = calculateSavings();

  // Get features
  const getFeatures = () => {
    if (!plan || !plan.features) return [];

    return plan.features.map(feature =>
      typeof feature === 'string' ? feature : feature.name || feature.text
    );
  };

  const features = getFeatures();

  // Get plan icon and color
  const getPlanIcon = () => {
    if (!plan) return FileText;

    const iconMap = {
      'free': FileText,
      'pro': Crown,
      'business': Building2
    };

    return iconMap[plan.planId] || FileText;
  };

  const getPlanColor = () => {
    if (!plan) return 'from-blue-500 to-cyan-600';

    const colorMap = {
      'free': 'from-green-500 to-emerald-600',
      'pro': 'from-blue-500 to-cyan-600',
      'business': 'from-purple-500 to-pink-500'
    };

    return colorMap[plan.planId] || 'from-blue-500 to-cyan-600';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading plan details...</p>
      </div>
    );
  }

  const PlanIcon = getPlanIcon();
  const planColor = getPlanColor();
  const isFreePlan = plan.planId === 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <Helmet>
        <title>Checkout - Paplixo | Download & Edit Professional Templates</title>
        <meta
          name="description"
          content="Complete your purchase on Paplixo. Get instant access to professional, editable templates designed for beginners, and startups to launch and grow smarter."
        />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate("/pricing")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {plan.name} Plan
            </h1>
            <p className="text-gray-600">Complete your subscription</p>
          </div>
          <div className="w-24"></div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plan Features - Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Plan Overview */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${planColor} flex items-center justify-center`}>
                  <PlanIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name} Plan</h2>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{calculatePrice()}</div>
                  <p className="text-sm text-gray-600">
                    {billingCycle === "annual" ? "per year" : "per month"}
                    {savings && (
                      <span className="text-green-600 font-semibold ml-2">{savings}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`px-4 py-2 rounded-lg border transition-colors ${billingCycle === "monthly"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle("annual")}
                    className={`px-4 py-2 rounded-lg border transition-colors ${billingCycle === "annual"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                  >
                    Annual {plan.annualDiscount && `(${plan.annualDiscount}% off)`}
                  </button>
                </div>
              </div>

              {/* Currency Toggle */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-3">
                  Currency
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrency("USD")}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${currency === "USD"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                  >
                    USD ($)
                  </button>
                  <button
                    onClick={() => setCurrency("INR")}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${currency === "INR"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                      }`}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>
            </div>

            {/* All Features */}
            {features.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Features Included</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {features.slice(0, 10).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">{feature}</span>
                    </div>
                  ))}
                  {features.length > 10 && (
                    <div className="col-span-2 text-center text-gray-500 text-sm">
                      +{features.length - 10} more features
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Payment Section - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Security & Final CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-gray-900">
                  {isFreePlan ? 'Secure Activation' : 'Secure Payment'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {isFreePlan
                  ? 'Your account will be activated immediately with access to all free features.'
                  : 'Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.'
                }
              </p>

              {/* Order Summary */}
              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{calculatePrice()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">
                    {currency === "INR" ? "Included" : "$0"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{calculatePrice()}</span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 text-lg font-semibold ${loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-gradient-to-r ${planColor} hover:opacity-90`
                  }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : isFreePlan ? (
                  'Activate Free Plan'
                ) : (
                  `Pay ${calculatePrice()}`
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-3">
                By completing your {isFreePlan ? 'activation' : 'purchase'}, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>256-bit SSL secured</span>
              </div>

              {!isFreePlan && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 text-center">
                    <strong>14-day free trial</strong> - No charges until your trial ends
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;