import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileEdit, Download, CheckCircle, ArrowRight, Users, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: "Discover & Browse Templates",
      description: "Explore our extensive collection of 1000+ professional business templates across all categories. Use advanced search and filters to find the perfect template for your specific needs.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=400&fit=crop",
      icon: Search,
      features: [
        "1000+ Professional Templates",
        "Advanced Search & Filters", 
        "Category-based Browsing",
        "Preview Before Download"
      ],
      stats: "95% satisfaction rate",
      cta: "Browse Templates"
    },
    {
      step: 2,
      title: "Customize & Edit Online",
      description: "Use our powerful online editor to customize templates in real-time. No software installation required. Collaborate with team members and make changes instantly.",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500&h=400&fit=crop",
      icon: FileEdit,
      features: [
        "Real-time Online Editor",
       // "Team Collaboration",
       // "Auto-save & Version History",
        "No Software Required"
      ],
      stats: "3x faster editing",
      cta: "Start Editing"
    },
    {
      step: 3,
      title: "Download & Use Instantly",
      description: "Download your customized documents in multiple formats. Ready to use immediately for contracts, proposals, reports, and all your business documentation needs.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=400&fit=crop",
      icon: Download,
      features: [
        "Multiple Format Support",
        "Instant Download",
        "Professional Quality",
        "Ready to Use"
      ],
      stats: "50k+ downloads monthly",
      cta: "Download Now"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-[95%] mx-auto px-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple three-step process to create professional business documents in minutes
          </p>
        </motion.div>

        {/* Three Cards Using Full Width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer h-full flex flex-col"
            >
              {/* Image Section - 65% of card */}
              <div className="relative h-[65%] min-h-[320px] overflow-hidden">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Step Number */}
                {/* <div className="absolute top-4 left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg">
                  <span className="font-bold text-lg">{step.step}</span>
                </div> */}

                {/* Icon Overlay */}
                {/* <div className="absolute top-4 right-4 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div> */}

                {/* Stats Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {step.stats}
                  </div>
                </div>
              </div>

              {/* Content Section - 35% of card */}
              <div className="p-6 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed flex-1">
                  {step.description}
                </p>

                {/* Features List */}
                <div className="space-y-2 mb-6">
                  {step.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 group/btn">
                  {step.cta}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Trusted by Businesses</h4>
            <p className="text-gray-600">Used by 10,000+ companies worldwide</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Save Time</h4>
            <p className="text-gray-600">Reduce document creation time by 80%</p>
          </div>

          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Secure & Reliable</h4>
            <p className="text-gray-600">Enterprise-grade security and reliability</p>
          </div>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            Start Your Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <p className="text-gray-600 mt-4">No credit card required • 7-day free trial</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;