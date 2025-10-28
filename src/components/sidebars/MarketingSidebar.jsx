import React from 'react';
import { Megaphone } from 'lucide-react';

export const marketingSubcategories = [
  'Email Templates', 
  'Indian Festival Infographics',
  'Social Media Templates',
  'Marketing Reports',
  'Campaign Plans'
];

const MarketingSidebar = ({ selectedCategory, onCategoryChange }) => {
  const marketingCategories = {
    marketing: {
      name: 'Marketing',
      subcategories: marketingSubcategories
    }
  };

  return (
    <>
      {Object.entries(marketingCategories).map(([key, category]) => (
        <button 
          key={key} 
          onClick={() => onCategoryChange(key, category.subcategories[0])}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
            selectedCategory === key 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Megaphone className="mr-3 w-5 h-5 flex-shrink-0" />
          {category.name}
        </button>
      ))}
    </>
  );
};

export default MarketingSidebar;