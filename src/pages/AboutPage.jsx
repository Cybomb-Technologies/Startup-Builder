
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, Users, Lightbulb, Mail } from 'lucide-react';


const AboutPage = () => {
  const values = [
    { icon: Target, title: 'Our Mission', desc: 'Empowering Indian startups with accessible, compliant business documentation' },
    { icon: Lightbulb, title: 'Our Vision', desc: 'To be the go-to platform for all startup documentation needs across India' },
    { icon: Users, title: 'Our Team', desc: 'Experienced professionals from legal, HR, and technology backgrounds' }
  ];

  return (
    <>
      <Helmet>
        <title>About Us - StartupDocs Builder</title>
        <meta name="description" content="Learn about StartupDocs Builder - empowering Indian startups with professional business documentation." />
      </Helmet>

      <div className="min-h-screen">
       

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">About StartupDocs Builder</h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                Simplifying compliance and amplifying growth for Indian startups
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Who We Are
              </h2>
              <p className="text-lg text-gray-700 mb-4">
                StartupDocs Builder was founded with a simple mission: to make professional business documentation accessible to every startup, SME, and freelancer in India.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                We understand the challenges new businesses face when dealing with legal documents, HR policies, and compliance requirements. That's why we've created a platform that simplifies the entire process.
              </p>
              <p className="text-lg text-gray-700">
                Our team of legal experts, HR professionals, and technology specialists work together to ensure every template is accurate, compliant, and easy to use.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img alt="Team collaboration in modern office" src="https://images.unsplash.com/photo-1551135049-8a33b5883817" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border border-blue-200"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-700">{value.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center"
          >
            <Mail className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl mb-6 text-blue-100">
              Have questions? We'd love to hear from you.
            </p>
            <div className="space-y-2">
              <p className="text-lg">Email: support@startupdocs.com</p>
              <p className="text-lg">Phone: +91 98765 43210</p>
              <p className="text-lg">Location: Chennai, India</p>
            </div>
          </motion.div>
        </div>

        
      </div>
    </>
  );
};

export default AboutPage;
  