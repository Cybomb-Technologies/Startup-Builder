import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Check, Shield, Lock, CreditCard, Building2, Crown, FileText, Zap, Mail, Phone, Users, Database, Clock, Star, Globe, Download, Upload, Settings, Key, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
// FIXED IMPORT - Import from the correct location
import { useAuth } from '@/hooks/useAuth'; // This matches your file location

const CheckoutPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth(); // Now this will work
  
  const { billingCycle = 'monthly', currency = 'INR', exchangeRate = 83 } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });

  const planDetails = {
    free: {
      name: 'Free',
      icon: Zap,
      color: 'from-green-500 to-emerald-600',
      description: 'Perfect for getting started with basic document needs',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { icon: Download, text: '5 downloads per month', available: true },
        { icon: Database, text: 'Basic templates', available: true },
        { icon: FileText, text: 'PDF export only', available: true },
        { icon: Users, text: 'Community support', available: true },
        { icon: Database, text: '1 GB cloud storage', available: true },
        { icon: Clock, text: 'Standard processing', available: true },
        { icon: Settings, text: 'Watermarked outputs', available: true }
      ],
      limitations: [
        'Limited downloads',
        'Basic templates only',
        'No advanced features'
      ],
      isFree: true
    },
    pro: {
      name: 'Pro',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      description: 'Ideal for freelancers and small businesses',
      monthlyPrice: 499,
      annualPrice: 499 * 12 * 0.85, // 15% discount
      features: [
        { icon: Download, text: 'Unlimited downloads', available: true },
        { icon: Database, text: 'Unlimited templates', available: true },
        { icon: FileText, text: 'All formats (PDF, DOCX, XLSX)', available: true },
        { icon: Users, text: 'Priority support', available: true },
        { icon: Database, text: '10 GB cloud storage', available: true },
        { icon: Clock, text: 'Advanced editor features', available: true },
        { icon: Settings, text: 'Custom branding', available: true },
        { icon: Upload, text: 'No watermarks', available: true },
        { icon: Key, text: 'Batch processing', available: true }
      ],
      limitations: [
        'No team collaboration',
        'Limited API access'
      ],
      isFree: false
    },
    business: {
      name: 'Business',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      description: 'Perfect for growing teams and agencies',
      monthlyPrice: 999,
      annualPrice: 999 * 12 * 0.85, // 15% discount
      features: [
        { icon: Download, text: 'Unlimited downloads', available: true },
        { icon: Database, text: 'Everything in Pro', available: true },
        { icon: FileText, text: 'Team accounts (up to 10)', available: true },
        { icon: Users, text: 'Shared workspace', available: true },
        { icon: Database, text: '50 GB cloud storage', available: true },
        { icon: Clock, text: 'API access', available: true },
        { icon: Settings, text: 'Dedicated account manager', available: true },
        { icon: Upload, text: 'Custom templates', available: true },
        { icon: Key, text: 'Advanced analytics', available: true },
        { icon: Star, text: 'White-label options', available: true }
      ],
      limitations: [
        'Limited to 10 team members',
        'Custom enterprise features not included'
      ],
      isFree: false
    },
    enterprise: {
      name: 'Enterprise',
      icon: Building2,
      color: 'from-indigo-600 to-purple-600',
      description: 'For large organizations with advanced needs',
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        { icon: Download, text: 'Everything in Business', available: true },
        { icon: Database, text: 'Unlimited team members', available: true },
        { icon: FileText, text: 'White labeling', available: true },
        { icon: Users, text: 'Custom integrations', available: true },
        { icon: Database, text: 'Unlimited storage', available: true },
        { icon: Clock, text: 'SLA guarantee', available: true },
        { icon: Settings, text: 'On-premise deployment', available: true },
        { icon: Upload, text: '24/7 dedicated support', available: true },
        { icon: Key, text: 'Custom workflows', available: true },
        { icon: Star, text: 'SSO integration', available: true }
      ],
      limitations: [
        'Custom pricing based on requirements',
        'Minimum contract period may apply'
      ],
      isFree: false,
      isEnterprise: true
    }
  };

  const plan = planDetails[planId];

  const formatPrice = (inrPrice, isCustom = false) => {
    if (isCustom) return 'Custom';
    if (inrPrice === 0) return 'Free';
    
    if (currency === 'USD') {
      const usdPrice = inrPrice / exchangeRate;
      return `$${usdPrice.toFixed(2)}`;
    }
    return `₹${inrPrice}`;
  };

  const getCurrentPrice = () => {
    if (planId === 'enterprise') return 'Custom Pricing';
    if (planId === 'free') return 'Free Forever';
    
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    return formatPrice(price);
  };

  const getBillingDescription = () => {
    if (planId === 'enterprise') return 'Tailored to your needs';
    if (planId === 'free') return 'No credit card required';
    
    if (billingCycle === 'annual') {
      const annualPrice = plan.monthlyPrice * 12;
      return `Billed annually (${formatPrice(annualPrice)}) - Save 15%`;
    }
    return 'Billed monthly - Cancel anytime';
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { from: `/checkout/${planId}` } });
    }
  };

  const handlePayment = async () => {
    if (planId === 'enterprise') {
      toast({
        title: "Request Received! 📧",
        description: "Our team will contact you within 24 hours to discuss your enterprise needs.",
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      return;
    }

    if (planId === 'free') {
      updateUser({ plan: 'free' });
      toast({
        title: "Welcome to StartupDocs! 🎉",
        description: "Your free plan has been activated. Start creating documents now!",
      });
      navigate('/dashboard');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing for paid plans
    setTimeout(() => {
      updateUser({ plan: planId });
      setIsProcessing(false);
      toast({
        title: "Welcome to StartupDocs! 🎉",
        description: `You've successfully subscribed to the ${plan.name} plan`,
      });
      navigate('/dashboard');
    }, 2000);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 24 hours.",
    });
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const Icon = plan?.icon;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan Not Found</h1>
          <Button onClick={() => navigate('/pricing')}>
            Back to Pricing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/pricing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {planId === 'enterprise' ? 'Enterprise Plan' : `${plan.name} Plan`}
            </h1>
            <p className="text-gray-600">
              {planId === 'enterprise' ? 'Get custom pricing for your organization' : 'Complete your subscription'}
            </p>
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
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{plan.name} Plan</h2>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-3xl font-bold text-gray-900">{getCurrentPrice()}</div>
                  <p className="text-sm text-gray-600">{getBillingDescription()}</p>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    onClick={handleGetStarted}
                    className={`bg-gradient-to-r ${plan.color} hover:opacity-90 px-6 py-3 font-semibold`}
                  >
                    {user ? 'Go to Dashboard' : 'Login to Get Started'}
                  </Button>
                </div>
              </div>
            </div>

            {/* All Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">All Features Included</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {plan.features.map((feature, index) => {
                  const FeatureIcon = feature.icon;
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <FeatureIcon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Limitations (if any) */}
            {plan.limitations && plan.limitations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Limitations</h3>
                <div className="space-y-2">
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      {limitation}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan Comparison */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Why Choose {plan.name}?</h3>
              <div className="space-y-3">
                {planId === 'free' && (
                  <>
                    <p className="text-gray-700">Perfect for students, casual users, and anyone getting started with document creation. Experience our basic features without any commitment.</p>
                    <p className="text-gray-700">Upgrade anytime to unlock more powerful features and higher limits.</p>
                  </>
                )}
                {planId === 'pro' && (
                  <>
                    <p className="text-gray-700">Ideal for individual professionals, freelancers, and small businesses. Get access to essential document tools with professional features.</p>
                    <p className="text-gray-700">Perfect for users who need reliable document processing without enterprise-level features.</p>
                  </>
                )}
                {planId === 'business' && (
                  <>
                    <p className="text-gray-700">Designed for growing teams, agencies, and businesses that rely on document creation daily.</p>
                    <p className="text-gray-700">Includes advanced features like team collaboration, API access, and dedicated support to boost your productivity.</p>
                  </>
                )}
                {planId === 'enterprise' && (
                  <>
                    <p className="text-gray-700">Built for large organizations with demanding document creation requirements and advanced workflow needs.</p>
                    <p className="text-gray-700">Includes custom solutions, dedicated support, and enterprise-grade security for mission-critical operations.</p>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Payment/Contact Section - Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {planId === 'enterprise' ? (
              /* Enterprise Contact Form */
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Contact Our Sales Team</h2>
                <p className="text-gray-600 mb-6">
                  Tell us about your requirements and we'll prepare a custom solution for your organization.
                </p>
                
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your work email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={contactForm.company}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Requirements
                    </label>
                    <textarea
                      name="message"
                      rows="4"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us about your document creation needs, team size, and any specific requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 text-lg font-semibold ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      'Contact Sales Team'
                    )}
                  </Button>
                </form>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Email us directly:</span>
                  </div>
                  <a href="mailto:sales@startupdocs.com" className="text-blue-600 hover:underline text-sm">
                    sales@startupdocs.com
                  </a>
                  
                  <div className="flex items-center gap-3 mt-3 mb-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Call us:</span>
                  </div>
                  <a href="tel:+911234567890" className="text-blue-600 hover:underline text-sm">
                    +91 1234567890
                  </a>
                </div>
              </div>
            ) : (
              /* Regular Payment Section */
              <>
                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h2 className="text-xl font-bold mb-4">
                    {planId === 'free' ? 'Activate Plan' : 'Payment Method'}
                  </h2>
                  
                  {planId !== 'free' && (
                    <div className="space-y-3 mb-6">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600"
                        />
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">Credit/Debit Card</span>
                      </label>

                      {currency === 'INR' && (
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                          <input
                            type="radio"
                            name="payment"
                            value="upi"
                            checked={paymentMethod === 'upi'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-blue-600"
                          />
                          <Building2 className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">UPI Payment</span>
                        </label>
                      )}

                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                        <input
                          type="radio"
                          name="payment"
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="text-blue-600"
                        />
                        <Building2 className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">PayPal</span>
                      </label>
                    </div>
                  )}

                  {/* Payment Form */}
                  {planId !== 'free' && paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {planId !== 'free' && paymentMethod === 'upi' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">You'll be redirected to your UPI app to complete the payment</p>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Pay with UPI
                      </Button>
                    </div>
                  )}

                  {planId !== 'free' && paymentMethod === 'paypal' && (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">You'll be redirected to PayPal to complete your payment</p>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Pay with PayPal
                      </Button>
                    </div>
                  )}
                </div>

                {/* Security & Final CTA */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Secure {planId === 'free' ? 'Activation' : 'Payment'}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {planId === 'free' 
                      ? 'Your account will be activated immediately with access to all free features.'
                      : 'Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.'
                    }
                  </p>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className={`w-full py-3 text-lg font-semibold ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : planId === 'free' ? (
                      'Activate Free Plan'
                    ) : (
                      `Start ${plan.name} Plan Trial`
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    By completing your {planId === 'free' ? 'activation' : 'purchase'}, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                  </p>

                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                    <Lock className="h-4 w-4" />
                    <span>256-bit SSL secured</span>
                  </div>

                  {planId !== 'free' && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-800 text-center">
                        <strong>14-day free trial</strong> - No charges until your trial ends
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;