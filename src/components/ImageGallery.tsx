import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Shuffle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import ImageCard from './ImageCard';
import ImageUpload from './ImageUpload';
import ImageEditModal from './ImageEditModal';
import SlideshowModal from './SlideshowModal';
import { ImageData, ImageEditData } from '@/types/image';
import { supabase } from '@/integrations/supabase/client';

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [currentSlideshowIndex, setCurrentSlideshowIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load images from database on component mount
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sexywoman')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const imageData: ImageData[] = data.map((img) => ({
        id: img.id,
        name: img.name,
        file: null as any, // We don't need the file object for loaded images
        url: supabase.storage.from('images').getPublicUrl(img.file_path).data.publicUrl,
        tags: img.tags || [],
        uploadDate: new Date(img.created_at),
      }));

      setImages(imageData);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "エラー",
        description: "画像の読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (newImages: ImageData[]) => {
    for (const imageData of newImages) {
      try {
        // Upload file to storage
        const fileExt = imageData.file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imageData.file);

        if (uploadError) throw uploadError;

        // Save metadata to database
        const { data, error: dbError } = await supabase
          .from('sexywoman')
          .insert({
            name: imageData.name,
            file_path: fileName,
            file_size: imageData.file.size,
            content_type: imageData.file.type,
            tags: imageData.tags,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Add to local state
        const newImageData: ImageData = {
          id: data.id,
          name: data.name,
          file: imageData.file,
          url: supabase.storage.from('images').getPublicUrl(fileName).data.publicUrl,
          tags: data.tags || [],
          uploadDate: new Date(data.created_at),
        };

        setImages(prev => [newImageData, ...prev]);

        toast({
          title: "成功",
          description: `${imageData.name} をアップロードしました`,
        });

      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "エラー",
          description: `${imageData.name} のアップロードに失敗しました`,
          variant: "destructive",
        });
      }
    }
  };

  const handleImageEdit = async (id: string, data: ImageEditData) => {
    try {
      const { error } = await supabase
        .from('sexywoman')
        .update({
          name: data.name,
          tags: data.tags,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      setImages(prev => prev.map(img => 
        img.id === id ? { ...img, name: data.name, tags: data.tags } : img
      ));

      toast({
        title: "成功",
        description: "画像情報を更新しました",
      });

    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "エラー",
        description: "画像情報の更新に失敗しました",
        variant: "destructive",
      });
    }
  };

  const handleImageDelete = async (id: string) => {
    try {
      // Get image data to find file path
      const imageToDelete = images.find(img => img.id === id);
      if (!imageToDelete) return;

      // Get file path from database
      const { data: imageData, error: fetchError } = await supabase
        .from('sexywoman')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('images')
        .remove([imageData.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('sexywoman')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== id));

      toast({
        title: "成功",
        description: "画像を削除しました",
      });

    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "エラー",
        description: "画像の削除に失敗しました",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-2xl font-semibold text-gray-700">読み込み中...</h3>
        </div>
      </div>
    );
  }

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
