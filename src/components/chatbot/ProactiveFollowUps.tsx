
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useProactiveFollowups } from '@/hooks/useProactiveFollowups';

interface ProactiveFollowUpsProps {
  onActionClick: (message: string, language: string) => void;
}

export const ProactiveFollowUps = ({ onActionClick }: ProactiveFollowUpsProps) => {
  const { pendingFollowups, markFollowUpCompleted, getPendingFollowups } = useProactiveFollowups();
  const [showFollowUps, setShowFollowUps] = useState(false);

  useEffect(() => {
    getPendingFollowups();
  }, []);

  const handleFollowUpAction = async (followUp: any) => {
    try {
      await markFollowUpCompleted(followUp.id);
      onActionClick(followUp.message, 'english');
    } catch (error) {
      console.error('Error handling follow-up:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      case 'high':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'medium':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };

  if (pendingFollowups.length === 0) return null;

  return (
    <div className="border-b border-gray-200 bg-blue-50">
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Follow-up Actions ({pendingFollowups.length})
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFollowUps(!showFollowUps)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFollowUps ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {showFollowUps && (
          <div className="space-y-2">
            {pendingFollowups.slice(0, 3).map((followUp) => (
              <div
                key={followUp.id}
                className="bg-white p-2 rounded border border-blue-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getPriorityIcon(followUp.priority)}
                      <Badge variant={getPriorityColor(followUp.priority)} className="text-xs">
                        {followUp.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-700 mb-2">{followUp.message}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFollowUpAction(followUp)}
                      className="text-xs h-6"
                    >
                      Respond
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
