import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, FileText, Shield, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - StartupDocs Builder</title>
        <meta name="description" content="Terms and conditions for using StartupDocs Builder services and templates." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <section className="pt-32 pb-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Scale className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-xl text-green-100">
                Effective date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
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
                <div className="mb-8 p-6 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-green-800 font-semibold">
                    Please read these Terms of Service carefully before using StartupDocs Builder. 
                    By accessing or using our service, you agree to be bound by these terms.
                  </p>
                </div>

                <div className="space-y-12">
                  {/* Agreement */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
                      1. Agreement to Terms
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        By accessing or using StartupDocs Builder ("Service"), you agree to be bound by these 
                        Terms of Service and all applicable laws and regulations. If you do not agree with any 
                        of these terms, you are prohibited from using or accessing this Service.
                      </p>
                    </div>
                  </section>

                  {/* Accounts */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Shield className="w-6 h-6 mr-3 text-green-600" />
                      2. User Accounts
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h4 className="font-semibold mb-3 text-green-900">Account Creation</h4>
                        <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
                          <li>You must provide accurate and complete information</li>
                          <li>You are responsible for maintaining account security</li>
                          <li>You must be at least 18 years old to create an account</li>
                          <li>One account per individual or business entity</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h4 className="font-semibold mb-3 text-green-900">Account Responsibilities</h4>
                        <ul className="list-disc list-inside space-y-2 text-green-800 text-sm">
                          <li>Keep your password secure and confidential</li>
                          <li>Notify us immediately of any unauthorized use</li>
                          <li>You are liable for all activities under your account</li>
                          <li>Accounts are non-transferable</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Services */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <FileText className="w-6 h-6 mr-3 text-green-600" />
                      3. Services & License
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-3 text-blue-900">License Grant</h4>
                        <p className="text-blue-800">
                          We grant you a limited, non-exclusive, non-transferable license to use our document 
                          templates for your personal or business use, subject to these terms.
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                        <h4 className="font-semibold mb-3 text-yellow-900">Permitted Use</h4>
                        <ul className="list-disc list-inside space-y-2 text-yellow-800">
                          <li>Customize templates for your specific needs</li>
                          <li>Use templates for your business documentation</li>
                          <li>Download and store templates for personal use</li>
                          <li>Share completed documents with relevant parties</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                        <h4 className="font-semibold mb-3 text-red-900">Prohibited Use</h4>
                        <ul className="list-disc list-inside space-y-2 text-red-800">
                          <li>Resell, redistribute, or sublicense templates</li>
                          <li>Use templates for illegal or fraudulent purposes</li>
                          <li>Reverse engineer or extract source code</li>
                          <li>Create competing template services</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Payments */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Payments & Subscriptions</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-semibold mb-2">Subscription Plans</h4>
                        <p className="text-gray-700 text-sm">
                          Paid subscriptions automatically renew until canceled. You can cancel anytime from your account settings.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-semibold mb-2">Refund Policy</h4>
                        <p className="text-gray-700 text-sm">
                          We offer a 14-day money-back guarantee for annual plans. Monthly plans are non-refundable.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-semibold mb-2">Price Changes</h4>
                        <p className="text-gray-700 text-sm">
                          We reserve the right to change pricing with 30 days notice. Current subscribers maintain existing rates for their billing cycle.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-600 pl-4">
                        <h4 className="font-semibold mb-2">Taxes</h4>
                        <p className="text-gray-700 text-sm">
                          All prices exclude applicable taxes. You are responsible for any taxes related to your purchases.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Intellectual Property */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">5. Intellectual Property</h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        StartupDocs Builder owns all intellectual property rights in the Service, including but not limited to:
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Document templates and their structure</li>
                        <li>Website design, layout, and user interface</li>
                        <li>Software code, algorithms, and systems</li>
                        <li>Branding, logos, and trademarks</li>
                      </ul>
                      <p className="mt-4">
                        You retain ownership of the specific content you add to our templates. By using our Service, 
                        you grant us a license to store and process your content solely for providing the Service.
                      </p>
                    </div>
                  </section>

                  {/* Disclaimer */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
                      6. Legal Disclaimer
                    </h2>
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                      <h3 className="font-semibold mb-4 text-orange-900">Important Notice</h3>
                      <p className="text-orange-800 mb-4">
                        Our document templates are provided for informational purposes only and do not constitute 
                        legal, financial, or professional advice.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-orange-800">
                        <li>Consult with qualified professionals for legal or financial matters</li>
                        <li>Review and customize templates to fit your specific situation</li>
                        <li>We are not liable for any damages from template usage</li>
                        <li>Templates may need modification to comply with local laws</li>
                      </ul>
                    </div>
                  </section>

                  {/* Limitation of Liability */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Limitation of Liability</h2>
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <p className="text-gray-700 mb-4">
                        To the maximum extent permitted by law, StartupDocs Builder shall not be liable for:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                        <li>Any indirect, incidental, or consequential damages</li>
                        <li>Loss of profits, data, or business opportunities</li>
                        <li>Damages resulting from template usage or reliance</li>
                        <li>Service interruptions or technical issues</li>
                        <li>Third-party actions or content</li>
                      </ul>
                    </div>
                  </section>

                  {/* Termination */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">8. Termination</h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        We may suspend or terminate your account at our sole discretion if you violate these terms. 
                        You may terminate your account at any time through your account settings.
                      </p>
                      <p>
                        Upon termination, your right to use the Service will immediately cease. We may retain your 
                        data for a reasonable period as required by law or for legitimate business purposes.
                      </p>
                    </div>
                  </section>

                  {/* Changes to Terms */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">9. Changes to Terms</h2>
                    <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                      <p className="text-purple-800">
                        We reserve the right to modify these terms at any time. We will provide notice of 
                        material changes via email or through the Service. Continued use after changes 
                        constitutes acceptance of the modified terms.
                      </p>
                    </div>
                  </section>

                  {/* Governing Law */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">10. Governing Law</h2>
                    <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                      <p className="text-indigo-800">
                        These Terms shall be governed by the laws of India, without regard to its conflict of law provisions. 
                        Any disputes shall be resolved in the courts located in Bangalore, Karnataka.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">11. Contact Information</h2>
                    <div className="bg-gray-100 p-6 rounded-xl">
                      <div className="flex items-start mb-4">
                        <BookOpen className="w-5 h-5 mr-3 mt-1 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Questions about Terms?</h4>
                          <p className="text-gray-700">legal@startupdocsbuilder.com</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        For any questions about these Terms of Service, please contact our legal team.
                      </p>
                    </div>
                  </section>
                </div>

                <div className="mt-12 p-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Need Legal Clarification?</h3>
                  <p className="mb-4 text-green-100">
                    Contact our legal team for any questions about these terms or your rights and responsibilities.
                  </p>
                  <Link 
                    to="/contact" 
                    className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Contact Legal Team
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;