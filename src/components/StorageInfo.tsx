
import React, { useState, useEffect } from 'react';
import { HardDrive, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StorageInfoProps {
  images: any[];
}

const StorageInfo: React.FC<StorageInfoProps> = ({ images }) => {
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Supabaseの無料プランの制限
  const MAX_STORAGE_BYTES = 1024 * 1024 * 1024; // 1GB
  const MAX_STORAGE_MB = MAX_STORAGE_BYTES / (1024 * 1024);

  useEffect(() => {
    calculateStorageUsed();
  }, [images]);

  const calculateStorageUsed = async () => {
    try {
      setLoading(true);
      
      // 画像のファイルサイズの合計を計算
      const totalSize = images.reduce((sum, image) => {
        return sum + (image.file?.size || 0);
      }, 0);

      // データベースからファイルサイズの情報も取得
      const { data, error } = await supabase
        .from('sexywoman')
        .select('file_size');

      if (!error && data) {
        const dbTotalSize = data.reduce((sum, item) => {
          return sum + (item.file_size || 0);
        }, 0);
        setStorageUsed(Math.max(totalSize, dbTotalSize));
      } else {
        setStorageUsed(totalSize);
      }
    } catch (error) {
      console.error('Error calculating storage:', error);
      setStorageUsed(0);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const usagePercentage = (storageUsed / MAX_STORAGE_BYTES) * 100;

  if (loading) {
    return (
      <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <HardDrive className="w-5 h-5" />
          <span>ストレージ情報を読み込み中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-60 rounded-lg p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-700">ストレージ使用量</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Database className="w-4 h-4" />
          <span>{images.length} 枚の画像</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">使用量</span>
          <span className="font-medium">{formatFileSize(storageUsed)} / {formatFileSize(MAX_STORAGE_BYTES)}</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              usagePercentage > 90 ? 'bg-red-500' : 
              usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{usagePercentage.toFixed(1)}% 使用中</span>
          <span>残り {formatFileSize(MAX_STORAGE_BYTES - storageUsed)}</span>
        </div>
      </div>
    </div>
  );
};

export default StorageInfo;
