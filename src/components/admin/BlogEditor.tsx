
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Save, Eye, Calendar, Image, Tag, FileText, Globe, Clock,
  Bold, Italic, Underline, Heading1, Heading2, Heading3,
  List, ListOrdered, Link, Quote, Code, Minus, Type,
  AlignLeft, AlignCenter, AlignRight, Strikethrough
} from 'lucide-react';
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

const FONT_OPTIONS = [
  { value: 'Georgia, serif', label: 'Georgia (Default)' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: '"Helvetica Neue", sans-serif', label: 'Helvetica' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
  { value: '"Palatino Linotype", serif', label: 'Palatino' },
  { value: '"Segoe UI", sans-serif', label: 'Segoe UI' },
];

const FONT_SIZE_OPTIONS = [
  { value: '14px', label: 'Small' },
  { value: '16px', label: 'Normal' },
  { value: '18px', label: 'Large' },
  { value: '20px', label: 'Extra Large' },
];

const BlogEditor: React.FC<BlogEditorProps> = ({ post, onSave, onCancel }) => {
  const { user } = useAuth();
  const contentRef = useRef<HTMLTextAreaElement>(null);
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
  const [selectedFont, setSelectedFont] = useState('Georgia, serif');
  const [selectedFontSize, setSelectedFontSize] = useState('16px');

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
      if (post.published_at && post.published) {
        const publishedDate = new Date(post.published_at);
        if (publishedDate > new Date()) {
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

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

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
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const insertMarkdown = useCallback((prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end) || placeholder;
    const newContent = formData.content.substring(0, start) + prefix + selectedText + suffix + formData.content.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  }, [formData.content]);

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
        if (publishMode === 'now') publishedAt = new Date().toISOString();
        else if (publishMode === 'custom' && customPublishDate) publishedAt = new Date(customPublishDate).toISOString();
        else if (publishMode === 'schedule' && data.scheduled_publish_at) publishedAt = new Date(data.scheduled_publish_at).toISOString();
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
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert(postData);
        if (error) throw error;
      }
    },
    onSuccess: () => { toast.success(`Blog post ${post ? 'updated' : 'created'} successfully`); onSave(); },
    onError: (error) => { console.error('Error saving blog post:', error); toast.error(`Failed to ${post ? 'update' : 'create'} blog post`); }
  });

  const handleSave = () => {
    if (!formData.title.trim()) { toast.error('Please enter a title'); return; }
    if (!formData.content.trim()) { toast.error('Please enter content'); return; }
    if (publishMode === 'custom' && !customPublishDate && formData.published) { toast.error('Please select a custom publish date'); return; }
    if (publishMode === 'schedule' && !formData.scheduled_publish_at && formData.published) { toast.error('Please select a scheduled publish date'); return; }
    saveMutation.mutate(formData);
  };

  const getDisplayDate = () => {
    if (publishMode === 'now') return new Date().toLocaleDateString();
    if (publishMode === 'custom' && customPublishDate) return new Date(customPublishDate).toLocaleDateString();
    if (publishMode === 'schedule' && formData.scheduled_publish_at) return new Date(formData.scheduled_publish_at).toLocaleDateString();
    return new Date().toLocaleDateString();
  };

  const ToolbarButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="ghost" size="sm" onClick={onClick} className="h-8 w-8 p-0 hover:bg-accent">
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom"><p className="text-xs">{label}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="max-h-[75vh] overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title */}
          <div>
            <Input
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Post title..."
              className="text-2xl font-bold border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/40"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              /{formData.slug || 'your-post-slug'}
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5 block">Excerpt</Label>
            <Textarea
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Brief description of the blog post..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="border rounded-lg bg-muted/30">
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b">
              {/* Font family */}
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger className="h-8 w-[140px] text-xs border-0 bg-transparent">
                  <Type className="h-3 w-3 mr-1 flex-shrink-0" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font size */}
              <Select value={selectedFontSize} onValueChange={setSelectedFontSize}>
                <SelectTrigger className="h-8 w-[90px] text-xs border-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZE_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Separator orientation="vertical" className="h-5 mx-1" />

              {/* Text formatting */}
              <ToolbarButton icon={Bold} label="Bold (**text**)" onClick={() => insertMarkdown('**', '**', 'bold text')} />
              <ToolbarButton icon={Italic} label="Italic (*text*)" onClick={() => insertMarkdown('*', '*', 'italic text')} />
              <ToolbarButton icon={Strikethrough} label="Strikethrough (~~text~~)" onClick={() => insertMarkdown('~~', '~~', 'strikethrough')} />
              <ToolbarButton icon={Code} label="Inline code (`code`)" onClick={() => insertMarkdown('`', '`', 'code')} />

              <Separator orientation="vertical" className="h-5 mx-1" />

              {/* Headings */}
              <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => insertMarkdown('\n# ', '\n', 'Heading 1')} />
              <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => insertMarkdown('\n## ', '\n', 'Heading 2')} />
              <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => insertMarkdown('\n### ', '\n', 'Heading 3')} />

              <Separator orientation="vertical" className="h-5 mx-1" />

              {/* Lists & blocks */}
              <ToolbarButton icon={List} label="Bullet list" onClick={() => insertMarkdown('\n- ', '\n', 'list item')} />
              <ToolbarButton icon={ListOrdered} label="Numbered list" onClick={() => insertMarkdown('\n1. ', '\n', 'list item')} />
              <ToolbarButton icon={Quote} label="Blockquote" onClick={() => insertMarkdown('\n> ', '\n', 'quote')} />
              <ToolbarButton icon={Minus} label="Horizontal rule" onClick={() => insertMarkdown('\n---\n', '')} />

              <Separator orientation="vertical" className="h-5 mx-1" />

              {/* Media */}
              <ToolbarButton icon={Link} label="Insert link" onClick={() => insertMarkdown('[', '](url)', 'link text')} />
              <ToolbarButton
                icon={Image}
                label="Insert image"
                onClick={() => { setImageTargetField('content'); setImageGalleryOpen(true); }}
              />
            </div>

            {/* Content textarea */}
            <Textarea
              ref={contentRef}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Start writing your post..."
              rows={18}
              className="border-0 rounded-t-none focus-visible:ring-0 resize-none"
              style={{ fontFamily: selectedFont, fontSize: selectedFontSize }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Supports Markdown syntax. Use the toolbar above or type directly.
          </p>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish settings */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="text-sm">Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                  />
                  <Badge variant={formData.published ? 'default' : 'secondary'} className="text-xs">
                    {formData.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </div>

              {formData.published && (
                <RadioGroup value={publishMode} onValueChange={(v: any) => setPublishMode(v)} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="now" id="pub-now" />
                    <Label htmlFor="pub-now" className="text-xs">Publish now</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="schedule" id="pub-schedule" />
                    <Label htmlFor="pub-schedule" className="text-xs">Schedule</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="custom" id="pub-custom" />
                    <Label htmlFor="pub-custom" className="text-xs">Backdate</Label>
                  </div>
                  {publishMode === 'schedule' && (
                    <Input
                      type="datetime-local"
                      value={formData.scheduled_publish_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduled_publish_at: e.target.value }))}
                      min={new Date().toISOString().slice(0, 16)}
                      className="text-xs"
                    />
                  )}
                  {publishMode === 'custom' && (
                    <Input
                      type="datetime-local"
                      value={customPublishDate}
                      onChange={(e) => setCustomPublishDate(e.target.value)}
                      className="text-xs"
                    />
                  )}
                </RadioGroup>
              )}
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-title"
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug} className="text-xs">{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Tags</Label>
                <div className="flex gap-1.5 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add tag..."
                    className="text-xs"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" onClick={handleAddTag} variant="outline" size="sm" className="text-xs shrink-0">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-destructive/20" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Thumbnail</Label>
                {formData.thumbnail_url ? (
                  <div className="relative group">
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="w-full h-24 object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => { setImageTargetField('thumbnail'); setImageGalleryOpen(true); }}>
                        Change
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setImageTargetField('thumbnail'); setImageGalleryOpen(true); }}>
                    <Image className="h-3 w-3 mr-1" /> Add thumbnail
                  </Button>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Featured Image</Label>
                {formData.featured_image_url ? (
                  <div className="relative group">
                    <img src={formData.featured_image_url} alt="Featured" className="w-full h-24 object-cover rounded-md" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                      <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => { setImageTargetField('featured'); setImageGalleryOpen(true); }}>
                        Change
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => setFormData(prev => ({ ...prev, featured_image_url: '' }))}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => { setImageTargetField('featured'); setImageGalleryOpen(true); }}>
                    <Image className="h-3 w-3 mr-1" /> Add featured image
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                SEO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  SEO Title <span className="text-muted-foreground/60">({formData.seo_title.length}/60)</span>
                </Label>
                <Input
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  placeholder="SEO optimized title"
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Meta Description <span className="text-muted-foreground/60">({formData.meta_description.length}/160)</span>
                </Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="Brief description for search engines"
                  rows={2}
                  className="text-xs resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom action bar */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-border sticky bottom-0 bg-background pb-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formData.content.split(/\s+/).filter(Boolean).length} words</span>
          <Separator orientation="vertical" className="h-3" />
          <span>{formData.content.length} characters</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending} size="sm">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {saveMutation.isPending ? 'Saving...' : (post ? 'Update' : 'Create')} Post
          </Button>
        </div>
      </div>

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
