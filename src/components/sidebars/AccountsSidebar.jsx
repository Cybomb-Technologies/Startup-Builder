import React from 'react';
import { Calculator } from 'lucide-react';

export const accountsSubcategories = [
  'Accounting Templates', 
  'Income Tax', 
  'Inventory Management', 
  'Invoices', 
  'MIS Reports', 
  'Sales Tax', 
  'TDS & TCS'
];

const AccountsSidebar = ({ selectedCategory, onCategoryChange }) => {
  const accountsCategories = {
    accounts: {
      name: 'Accounts',
      subcategories: accountsSubcategories
    }
  };

  return (
    <>
      {Object.entries(accountsCategories).map(([key, category]) => (
        <button 
          key={key} 
          onClick={() => onCategoryChange(key, category.subcategories[0])}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${
            selectedCategory === key 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Calculator className="mr-3 w-5 h-5 flex-shrink-0" />
          {category.name}
        </button>
      ))}
    </>
  );
};

export default AccountsSidebar;