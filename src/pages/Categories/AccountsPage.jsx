import React from 'react';
import { Helmet } from 'react-helmet';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';
const AccountsPage = () => {
  return (
    <>
    <Navbar/>
      <Helmet>
        <title>Accounts & Finance Templates - StartupDocs Builder</title>
        <meta name="description" content="Professional accounting templates for your business" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Simple Header */}
        <div className="bg-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Accounts & Finance</h1>
            <p className="text-xl">Professional accounting templates for your business</p>
          </div>
        </div>

        {/* Simple Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Accounting Templates</h2>
            <p className="text-gray-600 mb-6">
              This is a test page to check if the Accounts page is working properly.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Invoice Template</h3>
                <p className="text-sm text-gray-600">Professional GST-compliant invoices</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Balance Sheet</h3>
                <p className="text-sm text-gray-600">Financial statement templates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default AccountsPage;