import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Users, Shield, Award, Clock, TrendingUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const HRPage = () => {
  const templates = [
    {
      title: 'Employee Offer Letter',
      description: 'Professional offer letter template with all statutory clauses',
      category: 'Recruitment',
      downloads: '3.2k',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Appointment Letter',
      description: 'Comprehensive appointment letter as per Indian labor laws',
      category: 'Onboarding',
      downloads: '2.8k',
      rating: 4.8,
      image: 'https://media.licdn.com/dms/image/v2/D4D12AQHJ191hlTBTUg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1675457329416?e=2147483647&v=beta&t=xJVUTgUABDld-V1u9swf94UfI_EPfMINKuclINd5paw'
    },
    {
      title: 'Employee Handbook',
      description: 'Complete employee handbook with company policies',
      category: 'Policies',
      downloads: '2.1k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Legal Compliance',
      description: 'All templates compliant with Indian labor laws and regulations'
    },
    {
      icon: Users,
      title: 'Employee Focused',
      description: 'Designed to create positive employee experiences'
    },
    {
      icon: Award,
      title: 'Professional Standards',
      description: 'Meet industry best practices and professional standards'
    },
    {
      icon: Clock,
      title: 'Time Saving',
      description: 'Save hours of drafting with ready-to-use templates'
    }
  ];

  return (
    <>
      <Helmet>
        <title>HR & People Management Templates - StartupDocs Builder</title>
        <meta name="description" content="Complete HR templates for recruitment, onboarding, policies, and employee management. Compliant with Indian labor laws." />
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-pink-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Human Resources</h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
              Complete HR templates for recruitment, onboarding, policies, and employee management
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Build a Strong HR Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From hiring to retirement, manage your entire employee lifecycle with professional HR templates
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-purple-100"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Templates Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Popular HR Templates</h2>
            <p className="text-gray-600">Choose from our professionally designed HR templates</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {template.category}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <FileText className="w-4 h-4 mr-1" />
                      {template.downloads} downloads
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{template.title}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {'★'.repeat(Math.floor(template.rating))}
                        {'☆'.repeat(5 - Math.floor(template.rating))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({template.rating})</span>
                    </div>
                    <Button className="bg-purple-600 hover:bg-purple-700">Use Template</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Streamline Your HR Processes?</h3>
            <p className="text-purple-100 mb-6 text-lg">
              Join 10,000+ companies that trust our HR templates
            </p>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Explore All HR Templates
            </Button>
          </div>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default HRPage;