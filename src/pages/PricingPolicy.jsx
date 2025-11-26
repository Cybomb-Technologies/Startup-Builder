import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  CreditCard, 
  RefreshCw, 
  Tag, 
  TrendingUp, 
  Mail,
  CheckCircle,
  FileText
} from 'lucide-react';


const PricingPolicy = () => {
  const policies = [
    {
      icon: FileText,
      title: "Pricing Structure",
      content: "All prices are displayed in INR and may vary based on applicable taxes or offers. Monthly and yearly subscription plans are available.",
      features: [
        "Free, Basic, Pro, and Enterprise plans",
        "Monthly and yearly billing options",
        "Prices in INR (exclusive of GST)",
        "Taxes applied as per government regulations"
      ]
    },
    {
      icon: RefreshCw,
      title: "Subscription & Renewal",
      content: "Subscriptions automatically renew at the end of each billing cycle unless cancelled at least 24 hours before renewal.",
      features: [
        "Auto-renewal for uninterrupted service",
        "Renewal reminders sent 7 days prior",
        "Easy cancellation process",
        "No hidden charges"
      ]
    },
    {
      icon: CreditCard,
      title: "Payment Methods",
      content: "We accept major credit cards, UPI, and Razorpay payments. All transactions are securely processed.",
      features: [
        "Credit/Debit Cards (Visa, MasterCard, RuPay)",
        "UPI & Net Banking",
        "Razorpay secure payments",
        "PCI-DSS compliant processing"
      ]
    },
    {
      icon: Shield,
      title: "Refund & Cancellation Policy",
      content: "Refunds are available within 7 days of purchase for eligible plans. No refunds will be issued after services have been used or activated.",
      features: [
        "7-day refund policy for new subscriptions",
        "No refunds for used services/downloads",
        "Partial refunds for annual plans",
        "Cancellation anytime"
      ]
    },
    {
      icon: Tag,
      title: "Discounts, Coupons & Offers",
      content: "Discount codes are valid only during promotional periods and cannot be combined with other ongoing offers.",
      features: [
        "Limited-time promotional offers",
        "One-time use coupons",
        "Non-transferable codes",
        "Cannot combine multiple offers"
      ]
    },
    {
      icon: TrendingUp,
      title: "Price Changes",
      content: "We reserve the right to modify prices at any time, with prior notice to existing subscribers.",
      features: [
        "30-day advance notice for price changes",
        "Existing subscribers maintain current pricing for current cycle",
        "Transparent communication",
        "Option to cancel before changes take effect"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pricing Policy
          </h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This Pricing Policy explains how our pricing, billing, renewals, and refunds work for all our services and subscription plans.
          </p>
        </motion.div>

        {/* Main Policies */}
        <div className="space-y-8">
          {policies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100"
            >
              <div className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center">
                      <policy.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {policy.title}
                    </h2>
                    <p className="text-gray-600 text-lg mb-4 leading-relaxed">
                      {policy.content}
                    </p>
                    <ul className="space-y-2">
                      {policy.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-gray-700">
                          <CheckCircle className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Security & Billing Protection</h3>
          </div>
          <p className="text-lg opacity-90 leading-relaxed">
            All payments are processed through secure, PCI-compliant gateways. We do not store any card details on our servers. 
            Your financial information is protected with bank-level security encryption.
          </p>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-blue-100"
        >
          <div className="flex items-center space-x-4 mb-6">
            <Mail className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
          </div>
          <p className="text-gray-600 text-lg mb-4">
            For any billing or pricing-related questions, please contact us at:
          </p>
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-indigo-600 text-xl font-semibold">
              📩 support@startupdocs.com
            </p>
            <p className="text-gray-600 mt-2">
              Our support team typically responds within 24 hours.
            </p>
          </div>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-gray-500"
        >
          <p className="text-sm">
            Last updated: {new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPolicy;