import React from "react";
import { motion } from "framer-motion";
import { Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Newsletter = ({ newsletterSubscribers, handleUnsubscribe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-600" />
          Newsletter Subscribers
        </h2>
      </div>

      {newsletterSubscribers.length === 0 ? (
        <p className="text-gray-500">No active subscribers.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Subscribed On</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {newsletterSubscribers.map((sub) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{sub.email}</td>
                  <td className="p-3">{new Date(sub.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnsubscribe(sub.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Unsubscribe
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default Newsletter;
