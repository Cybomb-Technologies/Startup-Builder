// Replace the entire PricingPage.jsx with this dynamic version
import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, IndianRupee, DollarSign, Globe, Check, FileText, Crown, Building2, Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PricingPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const exchangeRate = 83;

  // Fetch plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/pricing');
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

  const formatPrice = (inrPrice, isCustom = false) => {
    if (isCustom) return 'Custom';
    
    if (currency === 'USD') {
      const usdPrice = inrPrice / exchangeRate;
      return `$${usdPrice.toFixed(2)}`;
    }
    return `₹${inrPrice}`;
  };

  const handleSubscribe = async (planName, planId) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    
    try {
      // For free plan, show toast and redirect to dashboard
      if (planId === 'free') {
        toast({
          title: "Welcome to StartupDocs! 🎉",
          description: "Your free plan has been activated. Start creating documents now!",
        });
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        return;
      }

      // For paid plans, navigate to checkout
      navigate(`/checkout/${planId}`, { 
        state: { 
          billingCycle: isYearly ? 'annual' : 'monthly',
          currency,
          exchangeRate,
          planName: planName
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
      question: 'What can I do with the free plan?',
      answer: 'The free plan includes 5 document downloads per month with basic templates and PDF export only. Perfect for occasional personal use or testing the platform.'
    },
    {
      question: 'What document formats do you support?',
      answer: 'We support all major formats including PDF, DOCX, XLSX, and more. Free plan supports PDF export only. Higher plans unlock all formats and advanced features.'
    },
    {
      question: 'How secure are my documents?',
      answer: 'Your documents are encrypted in transit and at rest. We automatically delete all processed files from our servers within 24 hours. Enterprise plans offer extended retention options.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. When you cancel, you\'ll continue to have access to your plan features until the end of your billing period.'
    },
    {
      question: `Do you offer discounts for annual billing?`,
      answer: `Yes, we offer discounts when you choose annual billing instead of monthly payments across all paid plans. The free plan remains completely free forever.`
    },
    {
      question: 'What happens if I exceed my monthly download limit?',
      answer: 'If you exceed your monthly limit on the free plan, you can upgrade to a higher plan or wait until your limits reset the following month.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial for both Pro and Business plans with full access to all features. No credit card required to start your trial.'
    },
    {
      question: `Do you support Indian Rupee (INR) payments?`,
      answer: `Yes! You can view prices in INR or USD and pay in your preferred currency. We support all major Indian payment methods including UPI, Net Banking, and credit/debit cards.`
    }
  ];

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-300 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-8 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-12 bg-gray-300 rounded w-3/4 mx-auto mb-6"></div>
                <div className="space-y-3">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pricing - StartupDocs Builder</title>
        <meta name="description" content="Choose the perfect plan for your business. Simple, transparent pricing with no hidden fees." />
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
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const originalPrice = isYearly ? plan.monthlyPrice * 12 : null;
              
              return (
                <div key={plan._id} className="relative">
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Free Forever Badge */}
                  {isFreePlan && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-50 w-full flex justify-center">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1 shadow-lg whitespace-nowrap">
                        <Star className="h-3 w-3" />
                        Free Forever
                      </div>
                    </div>
                  )}
                  
                  {/* Card Content */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-2xl shadow-lg flex flex-col hover:shadow-xl transition-all duration-300 border border-gray-200 h-full ${
                      plan.popular ? 'ring-2 ring-blue-500 mt-8' : 'mt-8'
                    }`}
                  >
                    <div className="p-8 flex flex-col flex-grow">
                      {/* Header section */}
                      <div className="text-center mb-6">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 mx-auto`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                        <div className="mb-2">
                          <div className="flex items-baseline justify-center">
                            <span className="text-4xl font-bold text-gray-900">{formatPrice(price, plan.planId === 'enterprise')}</span>
                            {plan.planId !== 'free' && plan.planId !== 'enterprise' && (
                              <span className="text-gray-600 text-lg ml-1">
                                {isYearly ? '/year' : '/month'}
                              </span>
                            )}
                          </div>
                          {originalPrice && plan.planId !== 'enterprise' && (
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
                          disabled={isNavigating}
                          className={`w-full ${
                            plan.popular
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              : isFreePlan
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                              : 'bg-gray-900 hover:bg-gray-800'
                          } ${isNavigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isNavigating ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Redirecting...
                            </div>
                          ) : (
                            plan.ctaText
                          )}
                        </Button>
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
                  <p className="font-semibold text-gray-900">Indian Compliance Focused</p>
                  <p className="text-sm text-gray-600">Templates verified for Indian regulations</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Regular Updates</p>
                  <p className="text-sm text-gray-600">New templates added monthly</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Secure & Private</p>
                  <p className="text-sm text-gray-600">Your data is encrypted and protected</p>
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
                        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Ready to Transform Your Document Workflow?</h2>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl mx-auto">
              Start with our free plan today. No credit card required. Upgrade anytime to unlock powerful features.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => handleSubscribe('Free', 'free')}
                disabled={isNavigating}
                className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNavigating ? 'Redirecting...' : 'Start Free Plan'}
              </Button>
              <Button 
                onClick={() => {
                  const proPlan = plans.find(p => p.planId === 'pro');
                  if (proPlan) handleSubscribe(proPlan.name, proPlan.planId);
                }}
                disabled={isNavigating}
                className="bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-6 py-2 font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isNavigating ? 'Redirecting...' : 'Try Professional Free'}
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