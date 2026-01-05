// Replace the entire PricingPage.jsx with this version
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, IndianRupee, DollarSign, Globe, Check, FileText, Crown, Building2, Download, Star, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.paplixo.com';

const PricingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);
  const [userPayments, setUserPayments] = useState([]);
  const [checkingPayments, setCheckingPayments] = useState(true);
  const [refreshingPlan, setRefreshingPlan] = useState(false);

  const exchangeRate = 83;

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/api/pricing`);
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        } else {
          throw new Error('Failed to fetch plans');
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast({
          title: 'Error',
          description: 'Failed to load pricing plans',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [toast]);

  // Refresh user plan data
  const refreshUserPlanData = async () => {
    if (!user || !token) return;

    setRefreshingPlan(true);
    try {
      // Refresh user data from auth context
      await refreshUser();

      // Fetch updated user plan
      const response = await fetch(`${API_URL}/api/users/current-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserPlan(data);
        }
      }

      // Fetch updated payment history
      const paymentResponse = await fetch(`${API_URL}/api/payments/user-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setUserPayments(paymentData.payments || []);
      }
    } catch (error) {
      console.error('Error refreshing user plan:', error);
    } finally {
      setRefreshingPlan(false);
    }
  };

  // Fetch user's current plan info
  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user || !token) {
        setUserPlan(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/current-plan`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('User plan data:', data);
            setUserPlan(data);
          }
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    fetchUserPlan();
  }, [user, token]);

  // Fetch user's payment history if logged in
  useEffect(() => {
    const fetchUserPayments = async () => {
      if (!user || !token) {
        setCheckingPayments(false);
        return;
      }

      try {
        setCheckingPayments(true);
        const response = await fetch(`${API_URL}/api/payments/user-payments`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('User payments:', data.payments);
          setUserPayments(data.payments || []);
        } else {
          console.error('Failed to fetch user payments:', response.status);
        }
      } catch (error) {
        console.error('Error fetching user payments:', error);
      } finally {
        setCheckingPayments(false);
      }
    };

    fetchUserPayments();
  }, [user, token]);

  // Get user's current active plan ID
  const getUserCurrentPlanId = () => {
    if (!user) return null;

    // Priority 1: Check userPlan from API (most accurate)
    if (userPlan && userPlan.planId) {
      return userPlan.planId;
    }

    // Priority 2: Check user context
    if (user.planId && user.planId !== 'free') {
      return user.planId;
    }

    // Priority 3: Check for most recent successful payment
    const successfulPayments = userPayments.filter(p => p.status === 'success');
    if (successfulPayments.length > 0) {
      // Sort by payment date (newest first)
      successfulPayments.sort((a, b) => new Date(b.paidAt || b.createdAt) - new Date(a.paidAt || a.createdAt));
      const latestPayment = successfulPayments[0];
      return latestPayment.planId;
    }

    // Default to free if no paid plan found
    return 'free';
  };

  // Check if a specific plan is the user's current active plan
  const isPlanCurrentPlan = (planId) => {
    const currentPlanId = getUserCurrentPlanId();
    return currentPlanId === planId;
  };

  // Check if user has any active paid subscription
  const hasActivePaidSubscription = () => {
    const currentPlanId = getUserCurrentPlanId();
    return currentPlanId && currentPlanId !== 'free';
  };

  const formatPrice = (inrPrice, isCustom = false) => {
    if (isCustom) return 'Custom';

    if (currency === 'USD') {
      const usdPrice = inrPrice / exchangeRate;
      return `$${usdPrice.toFixed(2)}`;
    }
    return `₹${inrPrice}`;
  };

  const getButtonText = (planId, planName) => {
    if (!user) {
      return planId === 'free' ? 'Get Started Free' : 'Subscribe Now';
    }

    if (isPlanCurrentPlan(planId)) {
      return 'Current Plan';
    }

    if (planId === 'free') {
      return 'Switch to Free';
    }

    return 'Upgrade Now';
  };

  const getButtonVariant = (planId, isPopular) => {
    if (!user) {
      return isPopular ? 'gradient-blue' : 'default';
    }

    if (isPlanCurrentPlan(planId)) {
      return 'current-plan';
    }

    return isPopular ? 'gradient-blue' : 'default';
  };

  const handleSubscribe = async (planName, planId) => {
    if (isNavigating) return;

    // Prevent action if user is already subscribed to this plan
    if (user && isPlanCurrentPlan(planId)) {
      toast({
        title: "Already Subscribed",
        description: `You are already subscribed to the ${planName} plan`,
        variant: "default"
      });
      return;
    }

    setIsNavigating(true);

    try {
      // For free plan, redirect to checkout page
      if (planId === 'free') {
        if (!user) {
          toast({
            title: "Login Required",
            description: "Please login to activate your free plan",
            variant: "destructive"
          });
          navigate('/login', { state: { from: '/pricing' } });
          return;
        }

        // Navigate to checkout page for free plan
        navigate(`/checkout/${planId}`, {
          state: {
            billingCycle: isYearly ? 'annual' : 'monthly',
            currency,
            exchangeRate,
            planName: planName,
            currentPlanId: getUserCurrentPlanId()
          }
        });
        return;
      }

      // For enterprise plan, redirect to checkout with contact form
      if (planId === 'enterprise') {
        navigate(`/checkout/${planId}`, {
          state: {
            billingCycle: isYearly ? 'annual' : 'monthly',
            currency,
            exchangeRate,
            planName: planName
          }
        });
        return;
      }

      // Check if user is logged in for paid plans
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to proceed with payment",
          variant: "destructive"
        });
        navigate('/login', { state: { from: `/checkout/${planId}` } });
        return;
      }

      // For paid plans, navigate to checkout
      navigate(`/checkout/${planId}`, {
        state: {
          billingCycle: isYearly ? 'annual' : 'monthly',
          currency,
          exchangeRate,
          planName: planName,
          currentPlanId: getUserCurrentPlanId()
        }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsNavigating(false);
    }
  };

  const icons = {
    Zap: Zap,
    FileText: FileText,
    Crown: Crown,
    Building2: Building2
  };

  const faqs = [
    {
      question: "Can I switch plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. When you upgrade, you'll get immediate access to new features. When you downgrade, the changes take effect at the end of your current billing period."
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! All paid plans come with a 14-day free trial. No credit card is required to start the trial. You can cancel anytime during the trial period without being charged."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), debit cards, and UPI payments. We use secure payment processing with encryption to protect your financial information."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. After cancellation, you'll continue to have access to your paid plan features until the end of your current billing period."
    },
    {
      question: "Do you offer discounts for annual plans?",
      answer: "Yes! Annual plans save you up to 20% compared to monthly billing. The discount is automatically applied when you choose annual billing."
    },
    {
      question: "What happens to my documents if I downgrade?",
      answer: "When you downgrade, you'll retain access to all your existing documents. However, you may lose access to certain premium features or hit limitations based on your new plan. We'll notify you before any changes take effect."
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Refresh button component
  // const RefreshButton = () => (
  //   <Button
  //     variant="outline"
  //     size="sm"
  //     onClick={refreshUserPlanData}
  //     disabled={refreshingPlan}
  //     className="ml-2"
  //   >
  //     {refreshingPlan ? (
  //       <>
  //         <Loader2 className="h-3 w-3 animate-spin mr-1" />
  //         Refreshing...
  //       </>
  //     ) : (
  //       <>
  //         <RefreshCw className="h-3 w-3 mr-1" />
  //         Refresh Plan
  //       </>
  //     )}
  //   </Button>
  // );

  if (loading || checkingPayments) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing – Paplixo</title>
        <meta
          name="description"
          content="Explore Paplixo pricing plans and unlock access to premium editable templates."
        />
      </Helmet>


      <div className="min-h-screen bg-white">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your needs. No hidden fees, cancel anytime.
                {user && (
                  <span className="block mt-2 text-sm font-medium text-green-600">
                    Your current plan: <span className="font-bold">{userPlan?.plan || user?.plan || 'Free'}</span>
                    {hasActivePaidSubscription() && (
                      <span className="ml-2 text-blue-600">✓ Active Subscription</span>
                    )}
                    {/* <RefreshButton /> */}
                  </span>
                )}
              </p>
            </motion.div>

            {/* Toggle Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8"
            >
              {/* Billing Toggle */}
              <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
                <span className={`font-semibold ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isYearly}
                    onChange={() => setIsYearly(!isYearly)}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className={`font-semibold flex items-center gap-2 ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                  Annual
                  <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    Save up to {Math.max(...plans.filter(p => p.annualDiscount).map(p => p.annualDiscount))}%
                  </span>
                </span>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className={`font-semibold ${currency === 'USD' ? 'text-gray-900' : 'text-gray-500'}`}>
                  USD
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={currency === 'INR'}
                    onChange={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <span className={`font-semibold ${currency === 'INR' ? 'text-gray-900' : 'text-gray-500'}`}>
                  INR
                </span>
              </div>
            </motion.div>

            {/* Discount Notice */}
            {plans.some(plan => plan.annualDiscount > 0) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-200 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-3 text-gray-800">
                  <Star className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Annual plans save you up to {Math.max(...plans.filter(p => p.annualDiscount).map(p => p.annualDiscount))}%</span>
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Switch to annual billing to save on all paid plans. Perfect for long-term users!
                </p>
              </motion.div>
            )}

            {/* Exchange Rate Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <p className="text-sm text-gray-600">
                {currency === 'INR' ? (
                  <>Exchange rate: 1 USD ≈ ₹{exchangeRate}. Prices in INR include all applicable taxes.</>
                ) : (
                  <>All prices in USD. Switch to INR for local currency pricing.</>
                )}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {plans.map((plan, index) => {
              const Icon = icons[plan.icon] || Zap;
              const isFreePlan = plan.planId === 'free';
              const isEnterprisePlan = plan.planId === 'enterprise';
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly ? plan.monthlyPrice * 12 : null;
              const isCurrentPlan = user && isPlanCurrentPlan(plan.planId);

              return (
                <div key={plan._id} className="relative">
                  {/* Most Popular Badge */}
                  {plan.popular && !isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <CheckCheck className="h-3 w-3" />
                        Your Current Plan
                      </div>
                    </div>
                  )}

                  {/* Free Forever Badge */}
                  {/* {isFreePlan && !isCurrentPlan && !plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Star className="h-3 w-3" />
                        Free Forever
                      </div>
                    </div>
                  )} */}

                  {/* Enterprise Badge */}
                  {/* {isEnterprisePlan && !isCurrentPlan && !plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Building2 className="h-3 w-3" />
                        Enterprise
                      </div>
                    </div>
                  )} */}

                  {/* Card Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-lg flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 h-full ${plan.popular && !isCurrentPlan ? 'ring-2 ring-blue-500 mt-8' :
                      isCurrentPlan ? 'ring-2 ring-blue-500 mt-8' : 'mt-8'
                      }`}
                  >
                    <div className="p-8 flex flex-col flex-grow">
                      {/* Header section */}
                      <div className="text-center mb-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 mx-auto ${isCurrentPlan ? 'opacity-100' : ''
                          }`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-2">
                          <div className="flex items-baseline justify-center">
                            <span className="text-4xl font-bold text-gray-900">{formatPrice(price, isEnterprisePlan)}</span>
                            {!isFreePlan && !isEnterprisePlan && (
                              <span className="text-gray-600 text-lg ml-1">
                                {isYearly ? '/year' : '/month'}
                              </span>
                            )}
                          </div>
                          {originalPrice && !isEnterprisePlan && (
                            <div className="flex items-center gap-2 mt-1 justify-center">
                              <span className="text-gray-500 line-through text-sm">
                                {formatPrice(originalPrice)}
                              </span>
                              {isYearly && (
                                <span className="text-green-600 text-sm font-medium">
                                  {formatPrice(plan.monthlyPrice)}/mo
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-6 text-center">{plan.description}</p>

                      {/* Features list */}
                      <ul className="space-y-3 mb-8 flex-grow">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className={`h-5 w-5 ${feature.included ? 'text-green-500' : 'text-gray-400'} flex-shrink-0 mt-0.5`} />
                            <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-500 line-through'}`}>
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Button at the bottom */}
                      <div className="mt-auto">
                        <Button
                          onClick={() => handleSubscribe(plan.name, plan.planId)}
                          disabled={isNavigating || isCurrentPlan || refreshingPlan}
                          className={`w-full ${isCurrentPlan
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                            : plan.popular
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              : isFreePlan
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                : isEnterprisePlan
                                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                  : 'bg-gray-900 hover:bg-gray-800'
                            } ${(isNavigating || isCurrentPlan || refreshingPlan) ? 'opacity-90 cursor-not-allowed' : ''}`}
                        >
                          {isNavigating || refreshingPlan ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              {isNavigating ? 'Redirecting...' : 'Refreshing...'}
                            </div>
                          ) : isCurrentPlan ? (
                            <div className="flex items-center gap-2">
                              <CheckCheck className="h-4 w-4" />
                              Current Plan
                            </div>
                          ) : (
                            getButtonText(plan.planId, plan.name)
                          )}
                        </Button>
                        {isCurrentPlan && (
                          <p className="text-xs text-blue-600 text-center mt-2 font-medium">
                            ✓ You're subscribed to this plan
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* All Plans Include Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">All Plans Include:</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Secure & Private</p>
                  <p className="text-sm text-gray-600">Your documents are encrypted and protected</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Regular Updates</p>
                  <p className="text-sm text-gray-600">New features and templates added regularly</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Multi-Format Support</p>
                  <p className="text-sm text-gray-600">PDF, DOCX, XLSX and more formats supported</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-12"
          >
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 max-w-4xl mx-auto">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors bg-white"
                >
                  <div
                    className="p-4 flex justify-between items-center hover:bg-blue-50 rounded-lg transition-colors"
                    onClick={() => toggleFaq(index)}
                  >
                    <h3 className="font-semibold text-gray-900 text-sm">{faq.question}</h3>
                    <span className={`transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                  {expandedFaq === index && (
                    <div className="p-4 pt-0 text-gray-700 text-sm border-t">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-3xl border border-blue-200"
          >
            <div className="flex justify-center mb-4">
              <Download className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Ready to Transform Your PDF Workflow?</h2>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl mx-auto">
              Start with our free plan today. No credit card required. Upgrade anytime to unlock powerful PDF features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => handleSubscribe('Free', 'free')}
                disabled={isNavigating || (user && isPlanCurrentPlan('free'))}
                className={`${(user && isPlanCurrentPlan('free')) ? 'bg-green-500 cursor-default' : 'bg-blue-600 hover:bg-blue-700'} text-white px-6 py-2 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isNavigating ? 'Redirecting...' : (user && isPlanCurrentPlan('free')) ? 'Current Plan ✓' : 'Start Free Plan'}
              </Button>
              <Button
                onClick={() => {
                  const proPlan = plans.find(p => p.planId === 'pro');
                  if (proPlan) handleSubscribe(proPlan.name, proPlan.planId);
                }}
                disabled={isNavigating || (user && isPlanCurrentPlan('pro'))}
                className={`${(user && isPlanCurrentPlan('pro')) ? 'bg-green-100 text-green-700 border-green-300 cursor-default' : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50'} px-6 py-2 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isNavigating ? 'Redirecting...' : (user && isPlanCurrentPlan('pro')) ? 'Current Pro Plan ✓' : 'Try Professional Free'}
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              {currency === 'INR' ? 'Prices in INR include taxes • ' : ''}
              14-day free trial on paid plans • No commitment
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;