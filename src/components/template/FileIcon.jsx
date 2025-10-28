import React from 'react';
import { FileType, FileUp, FileDown, FileText } from 'lucide-react';

const FileIcon = ({ format }) => {
  if (format === 'DOCX') return <FileType className="w-20 h-20 text-blue-600" />;
  if (format === 'XLSX') return <FileUp className="w-20 h-20 text-green-600" />;
  if (format === 'PDF') return <FileDown className="w-20 h-20 text-red-600" />;
  return <FileText className="w-20 h-20 text-gray-600" />;
};

export default FileIcon;