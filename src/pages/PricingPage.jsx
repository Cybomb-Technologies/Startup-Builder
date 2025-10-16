
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const PricingPage = () => {
  const { toast } = useToast();

  const plans = [
    {
      name: 'Free',
      price: '₹0',
      period: '',
      features: [
        '5 downloads/month',
        'Basic templates',
        'PDF export only',
        'Community support'
      ]
    },
    {
      name: 'Pro',
      price: '₹499',
      period: '/month',
      popular: true,
      features: [
        'Unlimited templates',
        'Cloud storage (10GB)',
        'All formats (PDF, DOCX, XLSX)',
        'Priority support',
        'Advanced editor features',
        'Custom branding'
      ]
    },
    {
      name: 'Business',
      price: '₹999',
      period: '/month',
      features: [
        'Everything in Pro',
        'Team accounts (up to 10)',
        'Shared workspace',
        'Cloud storage (50GB)',
        'API access',
        'Dedicated account manager',
        'Custom templates'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      features: [
        'Everything in Business',
        'Unlimited team members',
        'White labeling',
        'Custom integrations',
        'Unlimited storage',
        'SLA guarantee',
        'On-premise deployment option'
      ]
    }
  ];

  const handleSubscribe = (planName) => {
    toast({
      title: "🚧 Payment Integration Coming Soon!",
      description: `${planName} plan subscription will be available once payment processing is set up. You can request Stripe/Razorpay integration in your next prompt! 🚀`
    });
  };

  return (
    <>
      <Helmet>
        <title>Pricing - StartupDocs Builder</title>
        <meta name="description" content="Choose the perfect plan for your business. Simple, transparent pricing with no hidden fees." />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Choose the plan that fits your needs. No hidden fees, cancel anytime.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-4 ring-blue-600 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-2 font-semibold">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 text-lg">{plan.period}</span>}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.name)}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Free' ? 'Get Started' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Subscribe Now'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">All Plans Include:</h2>
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
        </div>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
  