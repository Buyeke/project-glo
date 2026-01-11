import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Circle, ArrowRight, Star, 
  FileText, Users, Briefcase, Heart, 
  Home, GraduationCap, Shield, Trophy,
  ChevronRight, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'upcoming';
  date?: string;
  resources?: string[];
}

interface JourneyTimelineProps {
  currentStage: string;
  visitCount: number;
  completedServices?: string[];
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ 
  currentStage, 
  visitCount, 
  completedServices = [] 
}) => {
  // Define the journey stages
  const journeyStages: JourneyMilestone[] = [
    {
      id: 'initial',
      title: 'Initial Contact',
      description: 'First connection with our support system',
      icon: Heart,
      status: visitCount >= 1 ? 'completed' : 'upcoming',
      resources: ['AI Chat Support', 'Resource Directory'],
    },
    {
      id: 'assessment',
      title: 'Needs Assessment',
      description: 'Understanding your unique situation and needs',
      icon: FileText,
      status: currentStage === 'assessment' ? 'current' : 
              ['active_support', 'transitioning', 'completed'].includes(currentStage) ? 'completed' : 'upcoming',
      resources: ['Support Quiz', 'Caseworker Meeting'],
    },
    {
      id: 'resource_matching',
      title: 'Resource Matching',
      description: 'Connecting you with the right services',
      icon: Users,
      status: visitCount >= 3 && currentStage !== 'initial' ? 'completed' : 
              currentStage === 'assessment' ? 'current' : 'upcoming',
      resources: ['Service Providers', 'Partner Organizations'],
    },
    {
      id: 'active_support',
      title: 'Active Support',
      description: 'Receiving ongoing assistance and care',
      icon: Shield,
      status: currentStage === 'active_support' ? 'current' :
              ['transitioning', 'completed'].includes(currentStage) ? 'completed' : 'upcoming',
      resources: ['Counseling', 'Skills Training', 'Housing Support'],
    },
    {
      id: 'skills_building',
      title: 'Skills Building',
      description: 'Developing new capabilities for independence',
      icon: GraduationCap,
      status: visitCount >= 5 ? 'completed' : 'upcoming',
      resources: ['Financial Literacy', 'Digital Skills', 'Job Training'],
    },
    {
      id: 'employment',
      title: 'Employment Support',
      description: 'Finding sustainable work opportunities',
      icon: Briefcase,
      status: currentStage === 'transitioning' ? 'current' :
              currentStage === 'completed' ? 'completed' : 'upcoming',
      resources: ['Job Listings', 'Resume Help', 'Interview Prep'],
    },
    {
      id: 'stable_housing',
      title: 'Stable Housing',
      description: 'Securing safe and permanent accommodation',
      icon: Home,
      status: visitCount >= 10 ? 'completed' : 'upcoming',
      resources: ['Housing Programs', 'Rental Assistance'],
    },
    {
      id: 'independence',
      title: 'Independence Achieved',
      description: 'Successfully transitioning to self-sufficiency',
      icon: Trophy,
      status: currentStage === 'completed' ? 'completed' : 'upcoming',
      resources: ['Alumni Network', 'Mentorship Program'],
    },
  ];

  const completedCount = journeyStages.filter(s => s.status === 'completed').length;
  const progressPercentage = (completedCount / journeyStages.length) * 100;

  const currentMilestone = journeyStages.find(s => s.status === 'current');
  const nextSteps = journeyStages
    .filter(s => s.status === 'upcoming')
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Journey Progress</h2>
              <p className="text-muted-foreground">
                {completedCount} of {journeyStages.length} milestones completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{Math.round(progressPercentage)}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
          <Progress value={progressPercentage} className="h-3 mt-4" />
        </CardContent>
      </Card>

      {/* Current Stage Highlight */}
      {currentMilestone && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Current Stage
              </Badge>
            </div>
            <CardTitle className="flex items-center gap-3 mt-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <currentMilestone.icon className="w-6 h-6 text-primary" />
              </div>
              {currentMilestone.title}
            </CardTitle>
            <CardDescription>{currentMilestone.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {currentMilestone.resources?.map((resource, index) => (
                <Badge key={index} variant="secondary">{resource}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Journey Timeline
          </CardTitle>
          <CardDescription>
            Track your progress through each stage of support
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {journeyStages.map((stage, index) => (
              <div key={stage.id} className="relative pb-8 last:pb-0">
                {/* Connecting Line */}
                {index < journeyStages.length - 1 && (
                  <div 
                    className={`absolute left-4 top-8 w-0.5 h-full -ml-px ${
                      stage.status === 'completed' ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
                
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${
                    stage.status === 'completed' 
                      ? 'bg-primary text-primary-foreground' 
                      : stage.status === 'current'
                        ? 'bg-primary/20 text-primary ring-4 ring-primary/20'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : stage.status === 'current' ? (
                      <Circle className="w-5 h-5 fill-current" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 min-w-0 ${
                    stage.status === 'upcoming' ? 'opacity-60' : ''
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <stage.icon className={`w-4 h-4 ${
                        stage.status === 'completed' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <h4 className={`font-semibold ${
                        stage.status === 'current' ? 'text-primary' : 'text-foreground'
                      }`}>
                        {stage.title}
                      </h4>
                      {stage.status === 'completed' && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          Completed
                        </Badge>
                      )}
                      {stage.status === 'current' && (
                        <Badge className="text-xs bg-primary text-primary-foreground">
                          In Progress
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{stage.description}</p>
                    
                    {/* Resources for completed/current stages */}
                    {(stage.status === 'completed' || stage.status === 'current') && stage.resources && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {stage.resources.map((resource, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-primary" />
              Next Steps
            </CardTitle>
            <CardDescription>
              Here's what's coming up in your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nextSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                >
                  <div className="p-2 bg-muted rounded-full">
                    <step.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1">
                <Link to="/services">
                  Explore Services
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/resources">
                  View Resources
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Unlocked */}
      {completedCount >= 3 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-yellow-800">Achievement Unlocked!</h3>
                <p className="text-yellow-700">
                  You've completed {completedCount} milestones. Keep going - you're making amazing progress!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JourneyTimeline;
