import React from 'react';
import { cn } from '@/lib/utils';

const ScrollArea = ({ className, children, ...props }) => (
  <div className={cn('overflow-auto', className)} {...props}>
    {children}
  </div>
);

export { ScrollArea };