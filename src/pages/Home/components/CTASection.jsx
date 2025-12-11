import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth'; // Update import path

const CTASection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Simplify Your Documentation?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of startups already using Paplixo
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/login"}>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6">
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;