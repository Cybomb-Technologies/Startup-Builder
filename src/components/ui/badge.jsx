import React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ 
  className, 
  variant = 'default', 
  children, 
  ...props 
}) => {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    outline: 'border border-gray-300 text-gray-700',
    destructive: 'bg-red-100 text-red-800 border border-red-200'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };