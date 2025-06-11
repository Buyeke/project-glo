
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

const Blog = () => {
  const { data: blogPosts, isLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMonthYear = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Follow Glo's story from conception to impact, documenting our mission to support homeless women and children.
          </p>
        </div>

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-8">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {blogPosts?.map((post, index) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-sm">
                      {getMonthYear(post.published_at)}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.published_at)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>
                  
                  {post.thumbnail_url && (
                    <div className="mt-6">
                      <img 
                        src={post.thumbnail_url} 
                        alt={post.title}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        3 min read
                      </div>
                      <div>
                        Post #{blogPosts.length - index}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {blogPosts?.length === 0 && !isLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
              <p className="text-gray-600">
                Check back soon for updates on our journey and impact.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Be Part of Our Story</h2>
            <p className="text-lg mb-6">
              Join our community and help us create more positive impact stories together.
            </p>
            <div className="space-x-4">
              <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get Support
              </button>
              <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors">
                Volunteer with Us
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;
