import React from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

const Templates = ({ templates, handleDelete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Templates
        </h2>
        <Button>Add Template</Button>
      </div>

      {templates.length === 0 ? (
        <p className="text-gray-500">No templates available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-700">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Category</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{template.name}</td>
                  <td className="p-3">{template.category}</td>
                  <td className="p-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
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

export default Templates;
