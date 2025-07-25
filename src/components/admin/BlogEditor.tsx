
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, Eye, Calendar, Image, Tag, FileText, Globe, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ImageGallery from './ImageGallery';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnail_url?: string;
  featured_image_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  category?: string;
  tags?: string[];
  meta_description?: string;
  seo_title?: string;
  scheduled_publish_at?: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogEditorProps {
  post?: BlogPost | null;
  onSave: () => void;
  onCancel: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onSave, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    featured_image_url: '',
    published: false,
    category: '',
    tags: [] as string[],
    meta_description: '',
    seo_title: '',
    scheduled_publish_at: ''
  });
  const [publishMode, setPublishMode] = useState<'now' | 'schedule' | 'custom'>('now');
  const [customPublishDate, setCustomPublishDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [imageTargetField, setImageTargetField] = useState<'thumbnail' | 'featured' | 'content'>('thumbnail');

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BlogCategory[];
    }
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        thumbnail_url: post.thumbnail_url || '',
        featured_image_url: post.featured_image_url || '',
        published: post.published || false,
        category: post.category || '',
        tags: post.tags || [],
        meta_description: post.meta_description || '',
        seo_title: post.seo_title || '',
        scheduled_publish_at: post.scheduled_publish_at ? new Date(post.scheduled_publish_at).toISOString().slice(0, 16) : ''
      });

      // Set publish mode based on existing post data
      if (post.published_at && post.published) {
        const publishedDate = new Date(post.published_at);
        const now = new Date();
        if (publishedDate > now) {
          setPublishMode('schedule');
        } else {
          setPublishMode('custom');
          setCustomPublishDate(publishedDate.toISOString().slice(0, 16));
        }
      } else if (post.scheduled_publish_at) {
        setPublishMode('schedule');
      }
    }
  }, [post]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo_title: prev.seo_title || title
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageSelect = (url: string) => {
    if (imageTargetField === 'thumbnail') {
      setFormData(prev => ({ ...prev, thumbnail_url: url }));
    } else if (imageTargetField === 'featured') {
      setFormData(prev => ({ ...prev, featured_image_url: url }));
    } else if (imageTargetField === 'content') {
      const imageMarkdown = `![Image](${url})`;
      setFormData(prev => ({ ...prev, content: prev.content + '\n\n' + imageMarkdown }));
    }
    setImageGalleryOpen(false);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let publishedAt = null;
      
      if (data.published) {
        if (publishMode === 'now') {
          publishedAt = new Date().toISOString();
        } else if (publishMode === 'custom' && customPublishDate) {
          publishedAt = new Date(customPublishDate).toISOString();
        } else if (publishMode === 'schedule' && data.scheduled_publish_at) {
          publishedAt = new Date(data.scheduled_publish_at).toISOString();
        }
      }

      const postData = {
        ...data,
        tags: data.tags.length > 0 ? data.tags : null,
        scheduled_publish_at: publishMode === 'schedule' && data.scheduled_publish_at ? new Date(data.scheduled_publish_at).toISOString() : null,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
        ...(post ? {} : { created_by: user?.id })
      };

      if (post) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', post.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(`Blog post ${post ? 'updated' : 'created'} successfully`);
      onSave();
    },
    onError: (error) => {
      console.error('Error saving blog post:', error);
      toast.error(`Failed to ${post ? 'update' : 'create'} blog post`);
    }
  });

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return;
    }
    
    if (publishMode === 'custom' && !customPublishDate && formData.published) {
      toast.error('Please select a custom publish date');
      return;
    }

    if (publishMode === 'schedule' && !formData.scheduled_publish_at && formData.published) {
      toast.error('Please select a scheduled publish date');
      return;
    }
    
    saveMutation.mutate(formData);
  };

  const getDisplayDate = () => {
    if (publishMode === 'now') {
      return new Date().toLocaleDateString();
    } else if (publishMode === 'custom' && customPublishDate) {
      return new Date(customPublishDate).toLocaleDateString();
    } else if (publishMode === 'schedule' && formData.scheduled_publish_at) {
      return new Date(formData.scheduled_publish_at).toLocaleDateString();
    }
    return new Date().toLocaleDateString();
  };

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            Media
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter blog post title"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="url-friendly-title"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL: /blog/{formData.slug || 'your-post-slug'}
              </p>
            </div>
            
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief description of the blog post"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Tag className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="content">Content *</Label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImageTargetField('content');
                    setImageGalleryOpen(true);
                  }}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Insert Image
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your blog post content here..."
                rows={15}
                className="font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can use Markdown syntax. Images: ![alt text](url), Links: [text](url)
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label>Thumbnail Image</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageTargetField('thumbnail');
                    setImageGalleryOpen(true);
                  }}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Browse
                </Button>
              </div>
              {formData.thumbnail_url && (
                <div className="mt-2">
                  <img src={formData.thumbnail_url} alt="Thumbnail" className="w-32 h-20 object-cover rounded" />
                </div>
              )}
            </div>
            
            <div>
              <Label>Featured Image</Label>
              <div className="flex gap-2 items-center">
                <Input
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/featured.jpg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageTargetField('featured');
                    setImageGalleryOpen(true);
                  }}
                >
                  <Image className="h-4 w-4 mr-1" />
                  Browse
                </Button>
              </div>
              {formData.featured_image_url && (
                <div className="mt-2">
                  <img src={formData.featured_image_url} alt="Featured" className="w-32 h-20 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="seo-title">SEO Title</Label>
              <Input
                id="seo-title"
                value={formData.seo_title}
                onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO optimized title"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.seo_title.length}/60 characters
              </p>
            </div>
            
            <div>
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                value={formData.meta_description}
                onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                placeholder="Brief description for search engines"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.meta_description.length}/160 characters
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={formData.published ? 'default' : 'secondary'}>
                  {formData.published ? 'Published' : 'Draft'}
                </Badge>
                {formData.category && (
                  <Badge variant="outline">{formData.category}</Badge>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  {getDisplayDate()}
                </div>
              </div>
              <CardTitle className="text-2xl">{formData.title || 'Blog Post Title'}</CardTitle>
              <CardDescription className="text-base">
                {formData.excerpt || 'Blog post excerpt will appear here...'}
              </CardDescription>
              {formData.featured_image_url && (
                <div className="mt-4">
                  <img src={formData.featured_image_url} alt="Featured" className="w-full h-64 object-cover rounded" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                {formData.content ? (
                  formData.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Blog post content will appear here...</p>
                )}
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
        <div className="flex flex-col gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={formData.published}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
            />
            <Label htmlFor="published">Publish</Label>
          </div>
          
          {formData.published && (
            <div className="space-y-3">
              <Label>Publishing Options</Label>
              <RadioGroup value={publishMode} onValueChange={(value: 'now' | 'schedule' | 'custom') => setPublishMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="now" id="now" />
                  <Label htmlFor="now" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Publish now
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule for later
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Custom publish date (backdate)
                  </Label>
                </div>
              </RadioGroup>
              
              {publishMode === 'schedule' && (
                <div>
                  <Label htmlFor="schedule-date">Schedule Date & Time</Label>
                  <Input
                    id="schedule-date"
                    type="datetime-local"
                    value={formData.scheduled_publish_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_publish_at: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
              
              {publishMode === 'custom' && (
                <div>
                  <Label htmlFor="custom-date">Custom Publish Date & Time</Label>
                  <Input
                    id="custom-date"
                    type="datetime-local"
                    value={customPublishDate}
                    onChange={(e) => setCustomPublishDate(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Set any date in the past or future
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : (post ? 'Update' : 'Create')} Post
          </Button>
        </div>
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={imageGalleryOpen} onOpenChange={setImageGalleryOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Select Image</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <ImageGallery onImageSelect={handleImageSelect} selectionMode />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogEditor;
