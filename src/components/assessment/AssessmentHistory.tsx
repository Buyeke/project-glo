
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssessment } from '@/hooks/useAssessment';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';

const AssessmentHistory = () => {
  const { assessments, isLoadingAssessments } = useAssessment();

  if (isLoadingAssessments) {
    return <div className="p-4">Loading assessment history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-blue-600" />
            Assessment History
          </CardTitle>
          <CardDescription>
            Your completed needs assessments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No assessments completed yet.</p>
              <p className="text-sm">Complete your first assessment to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Assessment #{assessment.assessment_number}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Completed {formatDistanceToNow(new Date(assessment.completed_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {assessment.is_emergency && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Emergency
                          </Badge>
                        )}
                        <Badge 
                          variant={assessment.urgency_level === 'high' ? 'destructive' : 
                                  assessment.urgency_level === 'medium' ? 'default' : 'secondary'}
                        >
                          {assessment.urgency_level.toUpperCase()} Priority
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Needs Identified:</h4>
                        <div className="flex flex-wrap gap-1">
                          {assessment.need_types.map(need => (
                            <Badge key={need} variant="outline" className="text-xs">
                              {need.replace('_', ' ').toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Language:</h4>
                        <Badge variant="outline">{assessment.language_preference}</Badge>
                      </div>
                    </div>

                    {assessment.vulnerability_tags && assessment.vulnerability_tags.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Special Considerations:</h4>
                        <div className="flex flex-wrap gap-1">
                          {assessment.vulnerability_tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag.replace('_', ' ').toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {assessment.location_data?.region && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm text-gray-700 mb-1">Location:</h4>
                        <p className="text-sm">{assessment.location_data.region}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Assessment completed and processed
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentHistory;
