import React, { useState, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageData, ImageEditData } from '@/types/image';

interface ImageEditModalProps {
  image: ImageData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: ImageEditData) => void;
}

const ImageEditModal: React.FC<ImageEditModalProps> = ({ image, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (image) {
      setName(image.name);
      setTags([...image.tags]);
    }
  }, [image]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = () => {
    if (image) {
      onSave(image.id, { name: name.trim(), tags });
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  if (!isOpen || !image) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            画像を編集
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image preview */}
          <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              画像名
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              placeholder="画像の名前を入力"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              タグ
            </Label>
            
            {/* Add new tag */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="新しいタグを追加"
                className="flex-1"
              />
              <Button
                onClick={handleAddTag}
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Existing tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditModal;
