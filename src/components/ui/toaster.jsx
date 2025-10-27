// src/components/ui/toaster.jsx
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X } from "lucide-react";

export const ToastProvider = ToastPrimitive.Provider;

export const Toaster = () => {
  return (
    <ToastPrimitive.Root className="fixed top-5 right-5 flex flex-col gap-2 z-50">
      {/* This component will render all active toasts */}
    </ToastPrimitive.Root>
  );
};

export const Toast = React.forwardRef(
  ({ title, description, action, ...props }, ref) => (
    <ToastPrimitive.Root
      ref={ref}
      className="bg-white border shadow-lg rounded-lg p-4 w-80 flex flex-col"
      {...props}
    >
      {title && (
        <ToastPrimitive.Title className="text-gray-900 font-bold text-sm">
          {title}
        </ToastPrimitive.Title>
      )}
      {description && (
        <ToastPrimitive.Description className="text-gray-600 text-xs mt-1">
          {description}
        </ToastPrimitive.Description>
      )}
      {action && <div className="mt-2">{action}</div>}
      <ToastPrimitive.Close asChild>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">
          <X className="w-4 h-4" />
        </button>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
);

Toast.displayName = "Toast";
