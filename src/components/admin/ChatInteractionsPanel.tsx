
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Globe, Target, TrendingUp, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatInteraction {
  id: string;
  user_id: string;
  detected_language: string;
  original_message: string;
  translated_message?: string;
  matched_intent?: string;
  response: string;
  translated_response?: string;
  confidence_score?: number;
  created_at: string;
  profiles?: {
    full_name?: string;
  };
}

const ChatInteractionsPanel = () => {
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['admin-chat-interactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_interactions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ChatInteraction[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['chat-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_interactions')
        .select('detected_language, matched_intent, confidence_score');
      
      if (error) throw error;
      
      const languageStats = data.reduce((acc: Record<string, number>, item) => {
        acc[item.detected_language] = (acc[item.detected_language] || 0) + 1;
        return acc;
      }, {});
      
      const intentStats = data.reduce((acc: Record<string, number>, item) => {
        if (item.matched_intent) {
          acc[item.matched_intent] = (acc[item.matched_intent] || 0) + 1;
        }
        return acc;
      }, {});
      
      const avgConfidence = data
        .filter(item => item.confidence_score)
        .reduce((sum, item) => sum + (item.confidence_score || 0), 0) / 
        data.filter(item => item.confidence_score).length;
      
      return {
        total: data.length,
        languages: languageStats,
        intents: intentStats,
        avgConfidence: avgConfidence || 0,
      };
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading chat interactions...</div>;
  }

  const exportChatLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_interactions')
        .select('id, created_at, user_id, detected_language, original_message, response, matched_intent, matched_service, confidence_score, urgency_level, emotional_state, safety_concerns, requires_human_intervention')
        .order('created_at', { ascending: false })
        .limit(10000);

      if (error) throw error;
      if (!data?.length) {
        toast({ title: 'No data to export' });
        return;
      }

      const headers = ['Timestamp', 'User ID', 'Language', 'Message', 'Response', 'Intent', 'Service', 'Confidence', 'Urgency', 'Emotional State', 'Safety Concern', 'Needs Human'];
      const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const rows = data.map(r => [
        r.created_at, r.user_id || 'anonymous', r.detected_language, r.original_message, r.response,
        r.matched_intent, r.matched_service, r.confidence_score, r.urgency_level, r.emotional_state,
        r.safety_concerns ? 'Yes' : 'No', r.requires_human_intervention ? 'Yes' : 'No',
      ].map(esc).join(','));

      const csv = [headers.map(esc).join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chatbot-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Export successful', description: 'Chat logs CSV downloaded' });
    } catch (err: any) {
      toast({ title: 'Export failed', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages Used</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats?.languages || {}).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats?.avgConfidence || 0) * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Intent Matches</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(stats?.intents || {}).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Chat Interactions</CardTitle>
          <CardDescription>
            Review recent conversations to improve AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {interactions.map((interaction) => (
                <div key={interaction.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {interaction.profiles?.full_name || 'Anonymous'}
                      </Badge>
                      <Badge variant="secondary">
                        {interaction.detected_language}
                      </Badge>
                      {interaction.matched_intent && (
                        <Badge variant="default">
                          {interaction.matched_intent}
                        </Badge>
                      )}
                      {interaction.confidence_score && (
                        <Badge 
                          variant={interaction.confidence_score > 0.7 ? "default" : "destructive"}
                        >
                          {Math.round(interaction.confidence_score * 100)}%
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(interaction.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-2 rounded text-sm">
                      <strong>User:</strong> {interaction.original_message}
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <strong>Bot:</strong> {interaction.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInteractionsPanel;
