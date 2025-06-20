
import React, { useState } from 'react';
import { Search, Grid, List, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageCard from './ImageCard';
import ImageUpload from './ImageUpload';
import ImageEditModal from './ImageEditModal';
import SlideshowModal from './SlideshowModal';
import { ImageData, ImageEditData } from '@/types/image';

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [currentSlideshowIndex, setCurrentSlideshowIndex] = useState(0);

  const handleImageUpload = (newImages: ImageData[]) => {
    setImages(prev => [...newImages, ...prev]);
  };

  const handleImageEdit = (id: string, data: ImageEditData) => {
    setImages(prev => prev.map(img => 
      img.id === id ? { ...img, name: data.name, tags: data.tags } : img
    ));
  };

  const handleImageDelete = (id: string) => {
    setImages(prev => {
      const imageToDelete = prev.find(img => img.id === id);
      if (imageToDelete) {
        URL.revokeObjectURL(imageToDelete.url);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const openEditModal = (image: ImageData) => {
    setEditingImage(image);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingImage(null);
    setIsEditModalOpen(false);
  };

  const openSlideshow = (image: ImageData) => {
    const index = filteredImages.findIndex(img => img.id === image.id);
    setCurrentSlideshowIndex(index);
    setIsSlideshowOpen(true);
  };

  const startRandomSlideshow = () => {
    if (filteredImages.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredImages.length);
      setCurrentSlideshowIndex(randomIndex);
      setIsSlideshowOpen(true);
    }
  };

  // Get all unique tags
  const allTags = Array.from(new Set(images.flatMap(img => img.tags)));

  // Filter images based on search and tag
  const filteredImages = images.filter(image => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === 'all' || image.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm shadow-lg border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                セクシーギャラリー
              </h1>
              <p className="text-gray-600 mt-2">あなたの美しいコレクション</p>
            </div>
            <div className="flex items-center gap-4">
              {images.length > 0 && (
                <Button
                  onClick={startRandomSlideshow}
                  variant="outline"
                  className="border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  ランダム再生
                </Button>
              )}
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {images.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="画像を検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2 items-center">
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-40 border-pink-200 focus:border-pink-400">
                  <SelectValue placeholder="タグで絞り込み" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex border border-pink-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-pink-500 hover:bg-pink-600' : 'hover:bg-pink-50'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-pink-500 hover:bg-pink-600' : 'hover:bg-pink-50'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white bg-opacity-60 rounded-3xl p-12 max-w-md mx-auto backdrop-blur-sm">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">ギャラリーが空です</h3>
              <p className="text-gray-500 mb-6">最初の画像をアップロードしてコレクションを始めましょう</p>
              <ImageUpload onImageUpload={handleImageUpload} />
            </div>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white bg-opacity-60 rounded-3xl p-12 max-w-md mx-auto backdrop-blur-sm">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">見つかりませんでした</h3>
              <p className="text-gray-500">検索条件を変更してみてください</p>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
              : 'space-y-4'
          }>
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onEdit={openEditModal}
                onDelete={handleImageDelete}
                onClick={openSlideshow}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ImageEditModal
        image={editingImage}
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleImageEdit}
      />

      <SlideshowModal
        images={filteredImages}
        currentIndex={currentSlideshowIndex}
        isOpen={isSlideshowOpen}
        onClose={() => setIsSlideshowOpen(false)}
      />
    </div>
  );
};

export default ImageGallery;
