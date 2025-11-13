import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cookie, Settings, Shield, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookiesPolicy = () => {
  const cookieTypes = [
    {
      name: 'Essential Cookies',
      necessary: true,
      description: 'Required for basic website functionality and security',
      examples: ['Authentication', 'Session management', 'Security features'],
      duration: 'Session'
    },
    {
      name: 'Performance Cookies',
      necessary: false,
      description: 'Help us understand how visitors interact with our website',
      examples: ['Page visits', 'Error rates', 'Loading times'],
      duration: '1-2 years'
    },
    {
      name: 'Functional Cookies',
      necessary: false,
      description: 'Enable enhanced functionality and personalization',
      examples: ['Language preferences', 'Region settings', 'Layout choices'],
      duration: '1 year'
    },
    {
      name: 'Analytics Cookies',
      necessary: false,
      description: 'Help us improve our services by collecting usage data',
      examples: ['User behavior', 'Feature usage', 'Conversion tracking'],
      duration: '2 years'
    }
  ];

  const handleAcceptAll = () => {
    // Implement cookie acceptance logic
    console.log('All cookies accepted');
    // Typically you would set a cookie consent flag here
  };

  const handleRejectNonEssential = () => {
    // Implement cookie rejection logic
    console.log('Non-essential cookies rejected');
    // Typically you would set preferences here
  };

  const handleCustomize = () => {
    // Implement custom cookie settings
    console.log('Open custom cookie settings');
  };

  return (
    <>
      <Helmet>
        <title>Cookies Policy - StartupDocs Builder</title>
        <meta name="description" content="Learn about how StartupDocs Builder uses cookies and similar technologies to enhance your experience." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        

        <section className="pt-32 pb-20 bg-gradient-to-br from-amber-600 to-orange-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Cookie className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookies Policy</h1>
              <p className="text-xl text-amber-100">
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
                <div className="mb-8 p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-amber-800 font-semibold">
                    This Cookies Policy explains how StartupDocs Builder uses cookies and similar technologies 
                    to recognize you when you visit our website. It explains what these technologies are and 
                    why we use them, as well as your rights to control our use of them.
                  </p>
                </div>

                <div className="space-y-12">
                  {/* What are Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Cookie className="w-6 h-6 mr-3 text-amber-600" />
                      1. What Are Cookies?
                    </h2>
                    <div className="space-y-4 text-gray-700">
                      <p>
                        Cookies are small text files that are placed on your computer or mobile device when you 
                        visit our website. They are widely used to make websites work more efficiently and 
                        provide information to the website owners.
                      </p>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h4 className="font-semibold mb-3 text-gray-900">How Cookies Work:</h4>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                          <li>Stored in your browser when you visit our site</li>
                          <li>Sent back to our server with each subsequent request</li>
                          <li>Help maintain your session and preferences</li>
                          <li>Typically contain anonymous unique identifiers</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Types of Cookies We Use */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Settings className="w-6 h-6 mr-3 text-amber-600" />
                      2. Types of Cookies We Use
                    </h2>
                    <div className="space-y-6">
                      {cookieTypes.map((cookieType, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-6 rounded-xl border ${
                            cookieType.necessary 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-xl font-semibold text-gray-900">
                              {cookieType.name}
                              {cookieType.necessary && (
                                <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                                  Necessary
                                </span>
                              )}
                            </h3>
                            <div className="text-sm text-gray-600">
                              Duration: {cookieType.duration}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{cookieType.description}</p>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                            <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                              {cookieType.examples.map((example, i) => (
                                <li key={i}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Why We Use Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">3. Why We Use Cookies</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h4 className="font-semibold mb-3 text-purple-900">Essential Functions</h4>
                        <ul className="list-disc list-inside space-y-2 text-purple-800 text-sm">
                          <li>Keep you logged in securely</li>
                          <li>Remember your preferences</li>
                          <li>Protect against fraudulent use</li>
                          <li>Enable core website features</li>
                        </ul>
                      </div>
                      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold mb-3 text-indigo-900">Improvement & Analytics</h4>
                        <ul className="list-disc list-inside space-y-2 text-indigo-800 text-sm">
                          <li>Understand how you use our service</li>
                          <li>Identify areas for improvement</li>
                          <li>Measure feature performance</li>
                          <li>Optimize user experience</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Third-Party Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Third-Party Cookies</h2>
                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                      <p className="text-yellow-800 mb-4">
                        In some special cases, we also use cookies provided by trusted third parties. 
                        The following section details which third-party cookies you might encounter through our site.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4 text-yellow-800">
                        <div>
                          <h4 className="font-medium mb-2">Analytics Providers</h4>
                          <p className="text-sm">Google Analytics, Hotjar, etc.</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Payment Processors</h4>
                          <p className="text-sm">Stripe, Razorpay, etc.</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Customer Support</h4>
                          <p className="text-sm">Intercom, Zendesk, etc.</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Marketing Tools</h4>
                          <p className="text-sm">Mailchimp, HubSpot, etc.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Your Cookie Choices */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Shield className="w-6 h-6 mr-3 text-amber-600" />
                      5. Your Cookie Choices
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h4 className="font-semibold mb-3 text-green-900">Browser Controls</h4>
                        <p className="text-green-800 mb-3">
                          You can set or amend your web browser controls to accept or refuse cookies. 
                          Most browsers automatically accept cookies, but you can usually modify your 
                          browser setting to decline cookies if you prefer.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                          <div>
                            <h5 className="font-medium mb-1">Chrome</h5>
                            <p>Settings → Privacy and security → Cookies</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Firefox</h5>
                            <p>Options → Privacy & Security → Cookies</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Safari</h5>
                            <p>Preferences → Privacy → Cookies</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-1">Edge</h5>
                            <p>Settings → Site permissions → Cookies</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-semibold mb-3 text-blue-900">Our Cookie Consent Tool</h4>
                        <p className="text-blue-800 mb-4">
                          We provide a cookie consent tool that allows you to customize your cookie preferences. 
                          You can access this tool at any time using the button below.
                        </p>
                        <div className="flex flex-wrap gap-4">
                          <Button 
                            onClick={handleAcceptAll}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept All Cookies
                          </Button>
                          <Button 
                            onClick={handleRejectNonEssential}
                            variant="outline"
                          >
                            Reject Non-Essential
                          </Button>
                          <Button 
                            onClick={handleCustomize}
                            variant="outline"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Customize Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Managing Cookies */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900">
                      <Trash2 className="w-6 h-6 mr-3 text-amber-600" />
                      6. Managing & Deleting Cookies
                    </h2>
                    <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                      <h3 className="font-semibold mb-4 text-red-900">How to Clear Cookies</h3>
                      <p className="text-red-800 mb-4">
                        You can delete cookies that are already on your device. Doing this may:
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-red-800">
                        <li>Log you out of our services</li>
                        <li>Reset your preferences and settings</li>
                        <li>Remove personalized features</li>
                        <li>Affect website performance</li>
                      </ul>
                      <p className="text-red-800 mt-4 text-sm">
                        To clear cookies, go to your browser settings and look for "Clear browsing data" 
                        or "Privacy and security" sections.
                      </p>
                    </div>
                  </section>

                  {/* Updates to Policy */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Updates to This Policy</h2>
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <p className="text-gray-700">
                        We may update this Cookies Policy from time to time to reflect changes in technology, 
                        legislation, or our services. We will notify you of any material changes by posting 
                        the new policy on our website with a updated "Last updated" date.
                      </p>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">8. Contact Us</h2>
                    <div className="bg-gray-100 p-6 rounded-xl">
                      <div className="flex items-start mb-4">
                        <Eye className="w-5 h-5 mr-3 mt-1 text-amber-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">Questions about Cookies?</h4>
                          <p className="text-gray-700">privacy@startupdocsbuilder.com</p>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm">
                        If you have any questions about our use of cookies or other technologies, 
                        please contact our privacy team.
                      </p>
                    </div>
                  </section>
                </div>

                <div className="mt-12 p-6 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Manage Your Cookie Preferences</h3>
                  <p className="mb-4 text-amber-100">
                    Take control of your privacy by managing which cookies we can use.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button 
                      onClick={handleAcceptAll}
                      className="bg-white text-amber-600 hover:bg-gray-100"
                    >
                      Accept All
                    </Button>
                    <Button 
                      onClick={handleRejectNonEssential}
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Essential Only
                    </Button>
                    <Button 
                      onClick={handleCustomize}
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Customize
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        
      </div>
    </>
  );
};

export default CookiesPolicy;