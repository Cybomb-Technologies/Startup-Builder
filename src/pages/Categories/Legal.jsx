import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Scale, Shield, Clock, CheckCircle, Gavel } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const LegalPage = () => {
  const templates = [
    {
      title: 'Founders Agreement',
      description: 'Comprehensive agreement defining roles, equity, and responsibilities between co-founders',
      category: 'Startup',
      downloads: '4.2k',
      rating: 4.9,
      image: 'https://i0.wp.com/jiahkimlaw.com/wp-content/uploads/2017/04/Agreement.jpg?fit=1000%2C667&ssl=1'
    },
    {
      title: 'Privacy Policy',
      description: 'GDPR and Indian IT Act compliant privacy policy for websites and apps',
      category: 'Compliance',
      downloads: '3.8k',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Service Agreement',
      description: 'Professional service agreement template for client engagements',
      category: 'Business',
      downloads: '3.5k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'NDA Agreement',
      description: 'Non-disclosure agreement to protect confidential business information',
      category: 'Confidentiality',
      downloads: '4.1k',
      rating: 4.8,
      image: 'https://media.istockphoto.com/id/1046403910/photo/man-is-filling-in-non-disclosure-agreement-nda.jpg?s=612x612&w=0&k=20&c=dhoW8RewVWIwgjYVJMHzkLNlcOyk4c0ctJg5UatNG1c='
    },
    {
      title: 'Website Terms of Service',
      description: 'Comprehensive terms and conditions for websites and online services',
      category: 'Compliance',
      downloads: '3.2k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Shareholders Agreement',
      description: 'Legal agreement between shareholders outlining rights and obligations',
      category: 'Corporate',
      downloads: '2.8k',
      rating: 4.6,
      image: 'https://preachlaw.com/wp-content/uploads/2023/12/shutterstock_1524935897-scaled-1.jpg'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Legally Verified',
      description: 'All templates reviewed by legal experts'
    },
    {
      icon: Scale,
      title: 'Court Approved',
      description: 'Drafted as per Indian legal standards'
    },
    {
      icon: Clock,
      title: 'Time Saving',
      description: 'Save legal consultation costs and time'
    },
    {
      icon: CheckCircle,
      title: 'Regular Updates',
      description: 'Updated with latest legal amendments'
    }
  ];

  const legalCategories = [
    {
      name: 'Business Formation',
      count: '12 Templates',
      icon: '🏢',
      description: 'Company registration and incorporation documents'
    },
    {
      name: 'Contracts',
      count: '18 Templates',
      icon: '📝',
      description: 'Service agreements and business contracts'
    },
    {
      name: 'Compliance',
      count: '15 Templates',
      icon: '🛡️',
      description: 'Legal compliance and regulatory documents'
    },
    {
      name: 'Intellectual Property',
      count: '8 Templates',
      icon: '💡',
      description: 'Trademark, copyright, and IP protection'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Legal Documents & Agreements - StartupDocs Builder</title>
        <meta name="description" content="Professional legal templates, contracts, and agreements. Legally verified documents for startups and businesses in India." />
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Scale className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Legal Documents</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Legally verified templates, contracts, and agreements for your business
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
              Legally Sound Documents
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional legal templates reviewed by experts and compliant with Indian laws
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
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-blue-100"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legal Categories */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Comprehensive Legal Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect legal document for every business need
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {legalCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{category.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{category.count}</p>
                <p className="text-gray-600 text-sm">{category.description}</p>
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Popular Legal Templates</h2>
                <p className="text-gray-600">Professionally drafted legal documents for your business</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Button variant="outline" className="text-sm">Most Popular</Button>
                <Button variant="outline" className="text-sm">Newest</Button>
                <Button variant="outline" className="text-sm">All Categories</Button>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 group"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-blue-700 rounded-full text-sm font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {template.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FileText className="w-4 h-4 mr-1" />
                        {template.downloads}
                      </div>
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 text-sm">
                          {'★'.repeat(Math.floor(template.rating))}
                          {'☆'.repeat(5 - Math.floor(template.rating))}
                        </div>
                        <span className="ml-1 text-sm text-gray-600">({template.rating})</span>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700">Use Template</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Legal Compliance Info */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200"
        >
          <div className="max-w-4xl mx-auto text-center">
            <Gavel className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Legal Compliance Made Simple</h3>
            <p className="text-gray-700 mb-6 text-lg">
              All our legal templates are regularly updated to comply with:
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Indian Contract Act</p>
                  <p className="text-sm text-gray-600">Compliant with latest amendments</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Companies Act 2013</p>
                  <p className="text-sm text-gray-600">Corporate legal requirements</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">IT Act & GDPR</p>
                  <p className="text-sm text-gray-600">Data protection compliance</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <Scale className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Protect Your Business Legally</h3>
            <p className="text-blue-100 mb-6 text-lg">
              Join 15,000+ businesses that trust our legal templates for their compliance needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Explore All Legal Templates
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-transparent">
                Consult Legal Expert
              </Button>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default LegalPage;