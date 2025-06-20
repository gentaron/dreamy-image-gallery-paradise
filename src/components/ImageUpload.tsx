
import React, { useRef } from 'react';
import { Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageData } from '@/types/image';

interface ImageUploadProps {
  onImageUpload: (images: ImageData[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const imageData: ImageData = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name.split('.')[0],
          file,
          url: URL.createObjectURL(file),
          tags: [],
          uploadDate: new Date(),
        };
        newImages.push(imageData);
      }
    });

    if (newImages.length > 0) {
      onImageUpload(newImages);
    }
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <Button
        onClick={triggerFileSelect}
        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Upload className="w-5 h-5 mr-2" />
        画像をアップロード
      </Button>
    </div>
  );
};

export default ImageUpload;
