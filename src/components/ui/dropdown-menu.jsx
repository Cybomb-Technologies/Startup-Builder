import React from 'react';
import { cn } from '@/lib/utils';

const DropdownMenu = ({ children }) => <div className="relative">{children}</div>;
const DropdownMenuTrigger = ({ children }) => children;
const DropdownMenuContent = ({ children, className }) => (
  <div className={cn('absolute z-50 min-w-[8rem] rounded-md border bg-white p-1 shadow-md', className)}>
    {children}
  </div>
);
const DropdownMenuItem = ({ children, className, ...props }) => (
  <div
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };