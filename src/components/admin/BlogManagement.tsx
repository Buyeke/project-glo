
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, Calendar, Image as ImageIcon, Tag, FileText, Search,
  MoreHorizontal, Eye, EyeOff, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import BlogEditor from './BlogEditor';
import ImageGallery from './ImageGallery';
import CategoryManager from './CategoryManager';

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

const BlogManagement = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    }
  });

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

  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Blog post deleted');
    },
    onError: () => toast.error('Failed to delete blog post')
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ postId, published }: { postId: string; published: boolean }) => {
      const updates: any = { published, updated_at: new Date().toISOString() };
      if (published && !posts.find(p => p.id === postId)?.published_at) {
        updates.published_at = new Date().toISOString();
      }
      const { error } = await supabase.from('blog_posts').update(updates).eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success('Post updated');
    },
    onError: () => toast.error('Failed to update post')
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && post.published) ||
                         (statusFilter === 'draft' && !post.published);
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getCategoryName = (slug: string) => categories.find(c => c.slug === slug)?.name || slug;

  const publishedCount = posts.filter(p => p.published).length;
  const draftCount = posts.filter(p => !p.published).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="posts" className="gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1.5 text-xs">
              <ImageIcon className="h-3.5 w-3.5" />
              Media
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5 text-xs">
              <Tag className="h-3.5 w-3.5" />
              Categories
            </TabsTrigger>
          </TabsList>
          <Button onClick={() => { setSelectedPost(null); setIsEditorOpen(true); }} size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Post
          </Button>
        </div>

        <TabsContent value="posts" className="space-y-5 mt-0">
          {/* Stats bar */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              <strong className="text-foreground">{posts.length}</strong> total
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{publishedCount}</strong> published
            </span>
            <span className="text-muted-foreground">
              <strong className="text-foreground">{draftCount}</strong> drafts
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Posts</SelectItem>
                <SelectItem value="published" className="text-xs">Published</SelectItem>
                <SelectItem value="draft" className="text-xs">Drafts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug} className="text-xs">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Posts list */}
          <div className="space-y-2">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="border-muted hover:border-border transition-colors group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {post.thumbnail_url && (
                      <img
                        src={post.thumbnail_url}
                        alt=""
                        className="w-16 h-16 rounded-md object-cover flex-shrink-0 hidden sm:block"
                      />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold truncate">{post.title}</h3>
                        <Badge
                          variant={post.published ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
                        >
                          {post.published ? 'Live' : 'Draft'}
                        </Badge>
                        {post.scheduled_publish_at && !post.published && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            Scheduled
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                        {post.excerpt || 'No excerpt'}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        {post.category && (
                          <span className="flex items-center gap-0.5">
                            <Tag className="h-2.5 w-2.5" />
                            {getCategoryName(post.category)}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-2.5 w-2.5" />
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : new Date(post.created_at).toLocaleDateString()
                          }
                        </span>
                        {post.tags && post.tags.length > 0 && (
                          <span>{post.tags.length} tag{post.tags.length > 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => { setSelectedPost(post); setIsEditorOpen(true); }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => togglePublishMutation.mutate({ postId: post.id, published: !post.published })}
                      >
                        {post.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 hover:text-destructive"
                        onClick={() => {
                          if (window.confirm('Delete this post?')) deleteMutation.mutate(post.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPosts.length === 0 && (
              <div className="text-center py-16">
                <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">No posts found</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first blog post'}
                </p>
                <Button size="sm" onClick={() => { setSelectedPost(null); setIsEditorOpen(true); }}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New Post
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <ImageGallery />
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[92vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedPost ? 'Edit Post' : 'New Post'}
            </DialogTitle>
          </DialogHeader>
          <BlogEditor
            post={selectedPost}
            onSave={() => {
              setIsEditorOpen(false);
              queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
            }}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogManagement;
