import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Briefcase, Target, Users, TrendingUp, Lightbulb } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const BusinessPage = () => {
  const templates = [
    {
      title: 'Business Plan Template',
      description: 'Comprehensive business plan with financial projections and market analysis',
      category: 'Planning',
      downloads: '5.2k',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Pitch Deck Presentation',
      description: 'Investor-ready pitch deck template with modern design',
      category: 'Funding',
      downloads: '4.8k',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'SWOT Analysis Template',
      description: 'Strategic SWOT analysis framework for business planning',
      category: 'Strategy',
      downloads: '3.9k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Executive Summary',
      description: 'Professional executive summary for business proposals',
      category: 'Planning',
      downloads: '3.5k',
      rating: 4.6,
      image: 'https://img.freepik.com/free-photo/business-data-analysis-graph_53876-95240.jpg'
    },
    {
      title: 'Market Research Report',
      description: 'Structured market research template with analysis framework',
      category: 'Research',
      downloads: '2.8k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Competitor Analysis',
      description: 'Comprehensive competitor analysis and benchmarking template',
      category: 'Strategy',
      downloads: '3.2k',
      rating: 4.8,
      image: 'https://usabilitygeek.com/wp-content/uploads/2017/09/ux-competitor-analysis-lead.jpg'
    }
  ];

  const features = [
    {
      icon: Target,
      title: 'Strategic Planning',
      description: 'Tools for effective business strategy and planning'
    },
    {
      icon: TrendingUp,
      title: 'Growth Focused',
      description: 'Templates designed to drive business growth'
    },
    {
      icon: Users,
      title: 'Investor Ready',
      description: 'Professional documents to attract investors'
    },
    {
      icon: Lightbulb,
      title: 'Innovation Driven',
      description: 'Frameworks to foster business innovation'
    }
  ];

  const businessStages = [
    {
      stage: 'Ideation & Planning',
      templates: ['Business Plan', 'Market Research', 'Feasibility Study'],
      color: 'from-green-500 to-emerald-500',
      icon: '💡'
    },
    {
      stage: 'Funding & Investment',
      templates: ['Pitch Deck', 'Financial Model', 'Investor Update'],
      color: 'from-blue-500 to-cyan-500',
      icon: '💰'
    },
    {
      stage: 'Growth & Scaling',
      templates: ['Growth Strategy', 'OKR Framework', 'Performance Dashboard'],
      color: 'from-purple-500 to-pink-500',
      icon: '📈'
    },
    {
      stage: 'Operations',
      templates: ['SOPs', 'Process Flows', 'Team Structure'],
      color: 'from-orange-500 to-red-500',
      icon: '⚙️'
    }
  ];

  const successStories = [
    {
      company: 'TechStart Innovations',
      result: 'Secured ₹2Cr funding',
      using: 'Business Plan & Pitch Deck',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      company: 'EcoSolutions Ltd',
      result: 'Expanded to 3 new cities',
      using: 'Market Research & Growth Strategy',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      company: 'HealthTech Plus',
      result: '50% revenue growth',
      using: 'Financial Models & OKR Framework',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Business Planning & Strategy Templates - StartupDocs Builder</title>
        <meta name="description" content="Professional business templates, strategic plans, pitch decks, and growth frameworks for startups and established businesses." />
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Business Planning</h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Strategic templates, business plans, and growth frameworks to scale your business
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
              Build Your Business Foundation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to execution, get all the business planning tools you need for success
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
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-green-100"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Business Stages */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Templates for Every Business Stage
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're starting up or scaling up, we have the right templates for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {businessStages.map((stage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${stage.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="text-3xl mb-4">{stage.icon}</div>
                <h3 className="text-xl font-bold mb-4">{stage.stage}</h3>
                <ul className="space-y-2">
                  {stage.templates.map((template, i) => (
                    <li key={i} className="flex items-center text-sm opacity-90">
                      <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                      {template}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how businesses achieved remarkable results using our templates
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center"
              >
                <img
                  src={story.image}
                  alt={story.company}
                  className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-bold mb-2 text-gray-900">{story.company}</h3>
                <p className="text-green-600 font-semibold mb-2">{story.result}</p>
                <p className="text-gray-600 text-sm">Using: {story.using}</p>
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
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Popular Business Templates</h2>
                <p className="text-gray-600">Strategic documents to plan, pitch, and grow your business</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Button variant="outline" className="text-sm">Most Popular</Button>
                <Button variant="outline" className="text-sm">Planning</Button>
                <Button variant="outline" className="text-sm">Funding</Button>
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
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 rounded-full text-sm font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-green-600 transition-colors">
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
                    <Button className="bg-green-600 hover:bg-green-700">Use Template</Button>
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
          className="mt-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Start Building Your Business Empire</h3>
            <p className="text-green-100 mb-6 text-lg">
              Join 25,000+ entrepreneurs and businesses that use our templates for strategic planning and growth
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Explore Business Templates
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-transparent">
                Get Business Consultation
              </Button>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default BusinessPage;