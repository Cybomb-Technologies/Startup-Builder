import React from 'react';
import { motion } from 'framer-motion';
import TemplateCard from './TemplateCard';

const TemplateGrid = ({ templates, onAction, onFavorite }) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {templates.map((template, index) => (
        <motion.div 
          key={template.id} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: index * 0.1 }}
        >
          <TemplateCard 
            template={template}
            onAction={onAction}
            onFavorite={onFavorite}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default TemplateGrid;