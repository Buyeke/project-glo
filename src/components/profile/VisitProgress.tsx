
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock, Unlock } from 'lucide-react';

interface VisitProgressProps {
  visitCount: number;
  supportStage: string;
}

const VisitProgress = ({ visitCount, supportStage }: VisitProgressProps) => {
  const visitThresholds = [
    { visits: 1, reward: 'Initial Assessment Complete', unlocked: visitCount >= 1 },
    { visits: 3, reward: 'Basic Resources Unlocked', unlocked: visitCount >= 3 },
    { visits: 5, reward: 'Advanced Support Available', unlocked: visitCount >= 5 },
    { visits: 10, reward: 'Mentor Program Access', unlocked: visitCount >= 10 },
  ];

  const progressPercentage = Math.min((visitCount / 10) * 100, 100);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'initial': return 'bg-blue-100 text-blue-800';
      case 'assessment': return 'bg-yellow-100 text-yellow-800';
      case 'active_support': return 'bg-green-100 text-green-800';
      case 'transitioning': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Progress & Milestones
        </CardTitle>
        <CardDescription>
          Track your journey and unlock new resources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Visit Progress</span>
            <span className="text-sm text-muted-foreground">{visitCount}/10 visits</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium">Current Stage:</span>
            <Badge className={getStageColor(supportStage)}>
              {supportStage?.replace('_', ' ').toUpperCase() || 'INITIAL'}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Milestones</h4>
          {visitThresholds.map((threshold, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                threshold.unlocked 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`p-1 rounded ${
                threshold.unlocked ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {threshold.unlocked ? (
                  <Unlock className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  threshold.unlocked ? 'text-green-800' : 'text-gray-600'
                }`}>
                  {threshold.reward}
                </p>
                <p className="text-xs text-muted-foreground">
                  {threshold.visits} visit{threshold.visits > 1 ? 's' : ''} required
                </p>
              </div>
              {threshold.unlocked && (
                <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                  Unlocked
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitProgress;
