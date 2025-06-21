
import React from 'react';
import { FileText } from 'lucide-react';

interface ImageSizeDisplayProps {
  size?: number;
  className?: string;
}

const ImageSizeDisplay: React.FC<ImageSizeDisplayProps> = ({ size, className = "" }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!size) return null;

  return (
    <div className={`flex items-center gap-1 text-xs text-gray-500 ${className}`}>
      <FileText className="w-3 h-3" />
      <span>{formatFileSize(size)}</span>
    </div>
  );
};

export default ImageSizeDisplay;
