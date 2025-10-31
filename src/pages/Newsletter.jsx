import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Newsletter = () => {
  const { toast } = useToast();
  const [newsletterSubscribers, setNewsletterSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/newsletter/subscribers');
      if (response.ok) {
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
          setNewsletterSubscribers(data);
        } else if (data.subscribers && Array.isArray(data.subscribers)) {
          setNewsletterSubscribers(data.subscribers);
        } else if (data.data && Array.isArray(data.data)) {
          setNewsletterSubscribers(data.data);
        } else {
          setNewsletterSubscribers([]);
        }
      } else {
        setNewsletterSubscribers([]);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
      setNewsletterSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (email) => {
    try {
      const response = await fetch('http://localhost:5000/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setNewsletterSubscribers(prev => prev.filter(sub => sub.email !== email));
        toast({
          title: 'Success',
          description: `${email} unsubscribed successfully`,
        });
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe user',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Mail className="w-6 h-6 text-green-600" />
          Newsletter Subscribers ({newsletterSubscribers.length})
        </h2>
      </div>

      {newsletterSubscribers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No newsletter subscribers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletterSubscribers.map((subscriber) => (
            <div
              key={subscriber.id || subscriber.email}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Send className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{subscriber.email}</p>
                  {subscriber.subscribedAt && (
                    <p className="text-sm text-gray-500">
                      Subscribed: {new Date(subscriber.subscribedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleUnsubscribe(subscriber.email)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Newsletter;