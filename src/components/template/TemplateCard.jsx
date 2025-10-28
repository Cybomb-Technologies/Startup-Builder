import React from 'react';
import { Download, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FileIcon from './FileIcon';

const TemplateCard = ({ template, onAction, onFavorite }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
      <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
        <FileIcon format={template.format} />
        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-semibold text-white ${
          template.access === 'Free' ? 'bg-green-500' : 
          template.access === 'Pro' ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {template.access}
        </span>
      </div>
      <div className="p-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className="text-xl font-semibold text-gray-900 truncate">
                {template.title || template.name}
              </h3>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last Updated: {template.lastUpdated}</p>
              <p>File Size: {template.size}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <p className="text-gray-600 my-2 h-10">{template.description}</p>
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
            .{template.format.toLowerCase()}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            {template.category}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onAction('preview', template)} variant="outline" className="flex-1">
            Preview
          </Button>
          <Button onClick={() => onAction('edit', template)} className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600">
            Edit Online
          </Button>
          <Button onClick={() => onAction('download', template)} variant="outline">
            <Download className="w-4 h-4" />
          </Button>
          <Button onClick={() => onFavorite(template.id)} variant="outline">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;