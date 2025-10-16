
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const BlogPage = () => {
  const posts = [
    {
      title: '10 Essential HR Policies Every Startup Needs',
      excerpt: 'Learn about the must-have HR policies that will protect your startup and create a positive work culture.',
      author: 'Priya Sharma',
      date: '2025-01-15',
      category: 'HR',
      image: 'HR policies and employee handbook for startups'
    },
    {
      title: 'Legal Documents Checklist for New Businesses',
      excerpt: 'A comprehensive guide to all the legal documents you need when starting a business in India.',
      author: 'Rajesh Kumar',
      date: '2025-01-12',
      category: 'Legal',
      image: 'Legal documents and contracts for business registration'
    },
    {
      title: 'How to Create Professional Invoices',
      excerpt: 'Master the art of creating invoices that get paid faster with our expert tips and templates.',
      author: 'Amit Patel',
      date: '2025-01-10',
      category: 'Accounts',
      image: 'Professional invoice template with GST compliance'
    },
    {
      title: 'Building Your First Business Plan',
      excerpt: 'Step-by-step guide to creating a compelling business plan that attracts investors.',
      author: 'Neha Gupta',
      date: '2025-01-08',
      category: 'Business',
      image: 'Business plan presentation and strategy documents'
    },
    {
      title: 'Email Marketing Templates That Convert',
      excerpt: 'Discover proven email templates that boost engagement and drive conversions.',
      author: 'Vikram Singh',
      date: '2025-01-05',
      category: 'Marketing',
      image: 'Email marketing campaign templates and designs'
    },
    {
      title: 'Productivity Tips for Startup Founders',
      excerpt: 'Time management strategies and tools to help you stay productive as a founder.',
      author: 'Ananya Reddy',
      date: '2025-01-03',
      category: 'Business',
      image: 'Productive workspace with planning tools and documents'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Blog - StartupDocs Builder</title>
        <meta name="description" content="Expert insights on startup documentation, HR policies, legal templates, and business productivity." />
      </Helmet>

      <div className="min-h-screen">
        <Navbar />

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Blog & Resources</h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Expert insights and guides for startup success
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100"
              >
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-4">
                  <img alt={post.title} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-gray-900 line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.article>
            ))}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;
  