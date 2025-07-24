
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Copy, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from './ImageUpload';
import type { FileObject } from '@supabase/storage-js';

interface ImageGalleryProps {
  onImageSelect?: (url: string) => void;
  selectionMode?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onImageSelect, selectionMode = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['blog-images'],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .list();
      
      if (error) throw error;
      return data as FileObject[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileName: string) => {
      const { error } = await supabase.storage
        .from('blog-images')
        .remove([fileName]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-images'] });
      toast.success('Image deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  });

  const getImageUrl = (fileName: string) => {
    return supabase.storage
      .from('blog-images')
      .getPublicUrl(fileName).data.publicUrl;
  };

  const handleImageClick = (fileName: string) => {
    if (selectionMode && onImageSelect) {
      onImageSelect(getImageUrl(fileName));
    }
  };

  const handleCopyUrl = (fileName: string) => {
    const url = getImageUrl(fileName);
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  const handleDelete = (fileName: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(fileName);
    }
  };

  const handleBulkDelete = () => {
    if (selectedImages.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) {
      selectedImages.forEach(fileName => {
        deleteMutation.mutate(fileName);
      });
      setSelectedImages([]);
    }
  };

  const filteredImages = images.filter(image =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {selectedImages.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              Delete Selected ({selectedImages.length})
            </Button>
          )}
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <ImageIcon className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload New Image</DialogTitle>
            </DialogHeader>
            <ImageUpload
              onImageUploaded={() => {
                queryClient.invalidateQueries({ queryKey: ['blog-images'] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No images found</h3>
            <p className="text-gray-600">Upload your first image to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <Card key={image.name} className={`cursor-pointer hover:shadow-lg transition-shadow ${selectionMode ? 'hover:border-blue-500' : ''}`}>
              <div 
                className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden"
                onClick={() => handleImageClick(image.name)}
              >
                <img
                  src={getImageUrl(image.name)}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm truncate flex-1">{image.name}</h3>
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedImages([...selectedImages, image.name]);
                      } else {
                        setSelectedImages(selectedImages.filter(name => name !== image.name));
                      }
                    }}
                    className="ml-2"
                  />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {image.metadata?.size ? formatFileSize(image.metadata.size) : 'Unknown size'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(image.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyUrl(image.name)}
                    className="flex-1"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy URL
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.name)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
