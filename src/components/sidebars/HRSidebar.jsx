import React from 'react';
import { Users } from 'lucide-react';

export const hrSubcategories = [
  'Statutories', 
  'Engagement Plans', 
  'Performance Management', 
  'Records & Formats', 
  'Training Modules', 
  'Employee Policy', 
  'Exit Process', 
  'Employee Onboarding', 
  'Company Forms', 
  'HR Forms', 
  'Job Descriptions'
];

const HRSidebar = ({ selectedCategory, onCategoryChange }) => {
  const hrCategories = {
    hr: {
      name: 'Human Resources',
      subcategories: hrSubcategories
    }
  };

  return (
    <>
      {Object.entries(hrCategories).map(([key, category]) => (
        <button 
          key={key} 
          onClick={() => onCategoryChange(key, category.subcategories[0])}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
            selectedCategory === key 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Users className="mr-3 w-5 h-5 flex-shrink-0" />
          {category.name}
        </button>
      ))}
    </>
  );
};

export default HRSidebar;