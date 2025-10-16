import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText, Megaphone, TrendingUp, Users, BarChart, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const MarketingPage = () => {
  const templates = [
    {
      title: 'Social Media Calendar',
      description: 'Complete social media planning calendar with content ideas and scheduling',
      category: 'Social Media',
      downloads: '4.8k',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Marketing Plan Template',
      description: 'Comprehensive marketing strategy with goals, channels, and budget planning',
      category: 'Strategy',
      downloads: '3.9k',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Email Campaign Template',
      description: 'Professional email sequences for lead nurturing and customer engagement',
      category: 'Email Marketing',
      downloads: '4.2k',
      rating: 4.7,
      image: 'https://images.ctfassets.net/eut50lk49cau/7GGbgH1FshaWFcEoRwvJEU/ef8a7a21b8ab4349e4803a16c5181af4/fundraising.png'
    },
    {
      title: 'Content Calendar',
      description: 'Monthly content planning calendar for blogs, videos, and social media',
      category: 'Content Marketing',
      downloads: '3.5k',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Marketing Budget Template',
      description: 'Detailed marketing budget planner with ROI tracking and analytics',
      category: 'Budgeting',
      downloads: '2.8k',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'Competitor Analysis',
      description: 'Marketing competitor analysis with SWOT and positioning strategy',
      category: 'Research',
      downloads: '3.1k',
      rating: 4.8,
      image: 'https://www.aimtechnologies.co/wp-content/uploads/2024/12/Competitors-Analysis.png'
    }
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Growth Driven',
      description: 'Templates designed to drive measurable business growth'
    },
    {
      icon: Target,
      title: 'ROI Focused',
      description: 'Track and optimize your marketing return on investment'
    },
    {
      icon: Users,
      title: 'Audience Centric',
      description: 'Strategies focused on customer engagement and retention'
    },
    {
      icon: BarChart,
      title: 'Data Driven',
      description: 'Analytics and metrics to measure campaign performance'
    }
  ];

  const marketingChannels = [
    {
      channel: 'Digital Marketing',
      templates: ['SEO Strategy', 'PPC Campaigns', 'Social Media Ads'],
      color: 'from-blue-500 to-cyan-500',
      icon: '📱'
    },
    {
      channel: 'Content Marketing',
      templates: ['Blog Calendar', 'Video Scripts', 'Email Sequences'],
      color: 'from-purple-500 to-pink-500',
      icon: '📝'
    },
    {
      channel: 'Social Media',
      templates: ['Content Calendar', 'Post Templates', 'Analytics Reports'],
      color: 'from-green-500 to-emerald-500',
      icon: '👍'
    },
    {
      channel: 'Analytics & Reporting',
      templates: ['KPI Dashboards', 'ROI Calculator', 'Performance Reports'],
      color: 'from-orange-500 to-red-500',
      icon: '📊'
    }
  ];

  const campaignResults = [
    {
      metric: '45%',
      description: 'Average increase in social media engagement',
      icon: '📈'
    },
    {
      metric: '3.2x',
      description: 'Higher email open rates with our templates',
      icon: '📧'
    },
    {
      metric: '67%',
      description: 'Businesses save time on marketing planning',
      icon: '⏱️'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Marketing Templates & Strategy Tools - StartupDocs Builder</title>
        <meta name="description" content="Professional marketing templates, social media calendars, email campaigns, and marketing strategy tools for business growth." />
      </Helmet>

      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Megaphone className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Marketing</h1>
            <p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
              Professional marketing templates, campaigns, and strategy tools to grow your business
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
              Drive Explosive Growth
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional marketing templates designed to increase engagement, generate leads, and boost sales
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
                className="text-center p-6 bg-white rounded-xl shadow-lg border border-orange-100"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Marketing Channels */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Complete Marketing Toolkit
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Templates for every marketing channel and strategy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketingChannels.map((channel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${channel.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <div className="text-3xl mb-4">{channel.icon}</div>
                <h3 className="text-xl font-bold mb-4">{channel.channel}</h3>
                <ul className="space-y-2">
                  {channel.templates.map((template, i) => (
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

        {/* Results Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Proven Marketing Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the impact our marketing templates deliver
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {campaignResults.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{result.icon}</div>
                <div className="text-4xl font-bold text-orange-600 mb-2">{result.metric}</div>
                <p className="text-gray-600 text-lg">{result.description}</p>
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
                <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">Popular Marketing Templates</h2>
                <p className="text-gray-600">Professional marketing documents to plan, execute, and measure campaigns</p>
              </div>
              <div className="flex space-x-3 mt-4 md:mt-0">
                <Button variant="outline" className="text-sm">Social Media</Button>
                <Button variant="outline" className="text-sm">Email Marketing</Button>
                <Button variant="outline" className="text-sm">Strategy</Button>
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
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-700 rounded-full text-sm font-medium">
                      {template.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-orange-600 transition-colors">
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
                    <Button className="bg-orange-600 hover:bg-orange-700">Use Template</Button>
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
          className="mt-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white text-center"
        >
          <div className="max-w-3xl mx-auto">
            <TrendingUp className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Launch High-Converting Marketing Campaigns</h3>
            <p className="text-orange-100 mb-6 text-lg">
              Join 18,000+ marketers and businesses that use our templates to drive measurable results
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Explore Marketing Templates
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-transparent">
                Get Marketing Consultation
              </Button>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </>
  );
};

export default MarketingPage;