
import React from 'react';
import { Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageData } from '@/types/image';

interface ImageCardProps {
  image: ImageData;
  onEdit: (image: ImageData) => void;
  onDelete: (id: string) => void;
  onClick: (image: ImageData) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, onDelete, onClick }) => {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => onClick(image)}>
        <img
          src={image.url}
          alt={image.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      {/* Overlay with controls */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(image);
            }}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image.id);
            }}
            className="bg-red-500 bg-opacity-90 hover:bg-opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 truncate mb-2">{image.name}</h3>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {image.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {image.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{image.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Upload date */}
        <p className="text-xs text-gray-500">
          {image.uploadDate.toLocaleDateString('ja-JP')}
        </p>
      </div>
    </div>
  );
};

export default ImageCard;
