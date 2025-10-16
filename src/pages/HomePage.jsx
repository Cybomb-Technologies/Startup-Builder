
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Cloud, Edit, Zap, Shield, ArrowRight, CheckCircle, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const features = [
    { icon: Edit, title: 'Editable Templates', desc: 'Edit documents online with our powerful editor' },
    { icon: Cloud, title: 'Cloud Storage', desc: 'Save and access your documents anywhere' },
    { icon: Shield, title: 'eSign Ready', desc: 'Digital signature integration for quick approvals' },
    { icon: Zap, title: 'AI Autofill', desc: 'Smart auto-fill for faster document creation' },
    { icon: FileText, title: '1000+ Templates', desc: 'Comprehensive library of business documents' },
    { icon: Download, title: 'Multiple Formats', desc: 'Download as PDF, DOCX, or XLSX' }
  ];

  const testimonials = [
    { name: 'Rajesh Kumar', role: 'Founder, TechStart', text: 'StartupDocs saved us weeks of legal paperwork. Highly recommended!', rating: 5 },
    { name: 'Priya Sharma', role: 'HR Manager', text: 'The HR templates are comprehensive and easy to customize.', rating: 5 },
    { name: 'Amit Patel', role: 'Consultant', text: 'Perfect for my clients. Professional templates at great value.', rating: 5 }
  ];

  return (
    <>
      <Helmet>
        <title>StartupDocs Builder - All Your Startup Documents in One Place</title>
        <meta name="description" content="Access, edit, and download 1000+ verified business templates instantly. Simplify compliance and amplify growth for your startup." />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />

        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20 md:py-32">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  All Your Startup Documents in One Place
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-blue-100">
                  Access, edit, and download 1000+ verified business templates instantly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/templates">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                      Explore Templates
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/login">
                  <Button 
  size="lg" 
  variant="outline" 
  className="border-2 border-white text-white bg-transparent hover:bg-transparent text-lg px-8 py-6"
>
  Start Free
</Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                  <img alt="StartupDocs platform dashboard showing document templates" src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Powerful Features for Your Business
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage your startup documentation efficiently
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 hover:shadow-xl transition-all duration-300 border border-blue-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600">Choose the plan that fits your needs</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
  {[
    { name: 'Free', price: '₹0', features: ['5 downloads/month', 'Basic templates', 'PDF export'] },
    { name: 'Pro', price: '₹499', features: ['Unlimited templates', 'Cloud storage', 'All formats', 'Priority support'], popular: true },
    { name: 'Business', price: '₹999', features: ['Team accounts', 'Custom branding', 'Shared workspace', 'API access'] }
  ].map((plan, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col ${
        plan.popular ? 'ring-2 ring-blue-600 scale-105' : ''
      }`}
    >
      {/* Header section with badge */}
      <div className="mb-4">
        {plan.popular && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-1 rounded-full inline-block mb-4">
            Most Popular
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <div className="mb-6">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.price !== '₹0' && <span className="text-gray-600">/month</span>}
        </div>
      </div>

      {/* Features list - this will grow to fill available space */}
      <ul className="space-y-3 mb-8 flex-grow">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Button at the bottom - always aligned */}
      <div className="mt-auto">
        <Link to="/pricing">
          <Button className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}>
            Get Started
          </Button>
        </Link>
      </div>
    </motion.div>
  ))}
</div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
                Trusted by Founders & Consultants
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Simplify Your Documentation?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of startups already using StartupDocs Builder
              </p>
              <Link to="/login">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
  