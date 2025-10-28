import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Mail, Phone, MapPin } from "lucide-react";
import axios from "axios";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5001/api/newsletter/subscribe", { email });
      setMessage("✅ Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data.message === "Already subscribed") {
        setMessage("⚠️ You are already subscribed.");
      } else {
        setMessage("❌ Subscription failed. Please try again.");
      }
    }
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* 🔹 Newsletter Section (Now ABOVE StartupDocs heading) */}
        <div className="text-center mb-12">
          <h4 className="text-xl font-semibold mb-2">Subscribe to Our Newsletter</h4>
          <p className="text-gray-300 text-sm mb-4">
            Get the latest templates, updates, and insights directly to your inbox.
          </p>
          <form
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row justify-center items-center gap-2"
          >
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded-md text-gray-800 outline-none w-full sm:w-80 focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition-all duration-200"
            >
              Subscribe
            </button>
          </form>
          {message && <p className="mt-2 text-sm text-gray-200">{message}</p>}
        </div>

        {/* 🔹 Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">StartupDocs</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your all-in-one platform for business documentation. Access 1000+ verified templates, 
              streamline compliance, and focus on what matters most — growing your business.
            </p>
          </div>

          {/* Column 2: Quick Links */}
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

          {/* Column 3: Categories */}
          <div>
            <span className="font-semibold text-lg mb-4 block">Categories</span>
            <div className="space-y-2">
              <Link to="/categories/accounts" className="text-gray-300 hover:text-white transition-colors">
                Accounts
              </Link><br />
              <Link to="/categories/hr" className="text-gray-300 hover:text-white transition-colors">
                Human Resource
              </Link><br />
              <Link to="/categories/legal" className="text-gray-300 hover:text-white transition-colors">
                Legal
              </Link><br />
              <Link to="/categories/business" className="text-gray-300 hover:text-white transition-colors">
                Business
              </Link><br />
              <Link to="/categories/marketing" className="text-gray-300 hover:text-white transition-colors">
                Marketing
              </Link>
            </div>
          </div>

          {/* Column 4: Contact */}
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

        {/* 🔹 Footer Bottom */}
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-400 text-sm">
          <p>&copy; 2025 StartupDocs Builder. All rights reserved.</p>
        </div>

        {/* 🔹 Policy Links */}
        <div className="flex justify-center md:justify-end space-x-6 mt-4 text-gray-400 text-sm">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/cookies" className="hover:text-white transition-colors">
            Cookies Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
