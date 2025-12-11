import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';


const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
  <title>Privacy Policy - Paplixo</title>
  <meta
    name="description"
    content="Read Paplixo's Privacy Policy to understand how we collect, use, protect, and manage your data while using our platform."
  />
</Helmet>


      <div className="min-h-screen bg-gray-50">
        

        <section className="pt-32 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-xl text-blue-100">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <div className="prose prose-lg max-w-none">
                <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-blue-800 font-semibold">
                    This Privacy Policy describes how StartupDocs Builder ("we," "our," or "us") collects, uses, 
                    and protects your personal information when you use our website and services.
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Information We Collect */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <FileText className="w-6 h-6 mr-3 text-blue-600" />
                      1. Information We Collect
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-3 text-gray-900">Personal Information</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>Name and contact details (email address, phone number)</li>
                          <li>Company information and professional details</li>
                          <li>Billing and payment information</li>
                          <li>Account credentials and preferences</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="font-semibold mb-3 text-gray-900">Usage Data</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>Document templates accessed and edited</li>
                          <li>Website usage patterns and analytics</li>
                          <li>Device information and browser type</li>
                          <li>IP address and general location data</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* How We Use Your Information */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Eye className="w-6 h-6 mr-3 text-blue-600" />
                      2. How We Use Your Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2 text-blue-900">Service Delivery</h4>
                        <p className="text-blue-800">
                          Provide access to document templates, enable editing features, and process downloads
                        </p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2 text-blue-900">Communication</h4>
                        <p className="text-blue-800">
                          Send service updates, security alerts, and support messages
                        </p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2 text-blue-900">Improvement</h4>
                        <p className="text-blue-800">
                          Enhance our services, develop new features, and optimize user experience
                        </p>
                      </div>
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-2 text-blue-900">Security</h4>
                        <p className="text-blue-800">
                          Protect against fraud, unauthorized access, and ensure service integrity
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Data Protection */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Lock className="w-6 h-6 mr-3 text-blue-600" />
                      3. Data Protection & Security
                    </h2>
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h3 className="font-semibold mb-4 text-green-900">Security Measures</h3>
                      <div className="grid md:grid-cols-2 gap-4 text-green-800">
                        <div>
                          <h4 className="font-medium mb-2">✓ Encryption</h4>
                          <p className="text-sm">All data transmitted using SSL/TLS encryption</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">✓ Access Controls</h4>
                          <p className="text-sm">Strict access controls and authentication</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">✓ Secure Storage</h4>
                          <p className="text-sm">Data stored on secure cloud servers with backups</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">✓ Regular Audits</h4>
                          <p className="text-sm">Continuous security monitoring and testing</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Data Sharing */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Data Sharing</h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        We do not sell your personal information to third parties. We may share your information with:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Service providers who assist in delivering our services</li>
                        <li>Payment processors for transaction handling</li>
                        <li>Legal authorities when required by law</li>
                        <li>Professional advisors under confidentiality agreements</li>
                      </ul>
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">5. Your Rights</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-semibold mb-2">Access & Correction</h4>
                        <p className="text-gray-700 text-sm">
                          Access your personal data and request corrections
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-semibold mb-2">Data Portability</h4>
                        <p className="text-gray-700 text-sm">
                          Request a copy of your data in machine-readable format
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-semibold mb-2">Deletion</h4>
                        <p className="text-gray-700 text-sm">
                          Request deletion of your personal information
                        </p>
                      </div>
                      <div className="border-l-4 border-blue-600 pl-4">
                        <h4 className="font-semibold mb-2">Opt-out</h4>
                        <p className="text-gray-700 text-sm">
                          Opt-out of marketing communications at any time
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">6. Cookies & Tracking</h2>
                    <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                      <p className="text-orange-800">
                        We use cookies and similar technologies to enhance your experience, analyze usage, 
                        and personalize content. You can control cookie preferences through your browser settings.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Contact Us</h2>
                    <div className="bg-gray-100 p-6 rounded-xl">
                      <div className="flex items-start mb-4">
                        <Mail className="w-5 h-5 mr-3 mt-1 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Privacy Questions</h4>
                          <p className="text-gray-700">privacy@startupdocsbuilder.com</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        For any questions about this Privacy Policy or your personal data, 
                        please contact our privacy team at the email above.
                      </p>
                    </div>
                  </section>

                  {/* Updates */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">8. Policy Updates</h2>
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <p className="text-purple-800">
                        We may update this Privacy Policy periodically. We will notify you of any material changes 
                        by posting the new policy on our website and updating the "Last updated" date. 
                        Continued use of our services after changes constitutes acceptance of the updated policy.
                      </p>
                    </div>
                  </section>
                </div>

                <div className="mt-12 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Need More Information?</h3>
                  <p className="mb-4 text-blue-100">
                    Contact our privacy team for any clarification or to exercise your data rights.
                  </p>
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Privacy Team
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        
      </div>
    </>
  );
};

export default PrivacyPolicy;