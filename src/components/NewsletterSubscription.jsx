// src/components/NewsletterSubscription.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { subscribeToNewsletter } from '@/utils/newsletter';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      subscribeToNewsletter(email);
      toast({
        title: "Successfully Subscribed!",
        description: "You've been added to our newsletter list.",
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-gray-600">Get the latest templates and updates delivered to your inbox.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subscribing...
            </span>
          ) : 'Subscribe to Newsletter'}
        </Button>
      </form>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default NewsletterSubscription;