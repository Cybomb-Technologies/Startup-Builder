
import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">StartupDocs</span>
            </div>
            <p className="text-gray-300 text-sm">
              Simplify Compliance. Amplify Growth.
            </p>
          </div>

          <div>
            <span className="font-semibold text-lg mb-4 block">Quick Links</span>
            <div className="space-y-2">
              <Link to="/templates" className="block text-gray-300 hover:text-white transition-colors">
                Templates
              </Link>
              <Link to="/pricing" className="block text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/blog" className="block text-gray-300 hover:text-white transition-colors">
                Blog
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-white transition-colors">
                About Us
              </Link>
            </div>
          </div>

          <div>
            <span className="font-semibold text-lg mb-4 block">Categories</span>
            <div className="space-y-2">
              <p className="text-gray-300">Accounts</p>
              <p className="text-gray-300">Human Resources</p>
              <p className="text-gray-300">Legal</p>
              <p className="text-gray-300">Business</p>
              <p className="text-gray-300">Marketing</p>
            </div>
          </div>

          <div>
            <span className="font-semibold text-lg mb-4 block">Contact</span>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@startupdocs.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 StartupDocs Builder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
  