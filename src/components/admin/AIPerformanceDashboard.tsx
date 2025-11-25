import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Clock, DollarSign, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Users, Zap } from 'lucide-react';
import { useAIMetrics, useAIMetricsDetails, useAIErrorMetrics } from '@/hooks/useAIMetrics';
import { useChatbotSatisfaction, useLowSatisfactionResponses } from '@/hooks/useChatbotSatisfaction';
import { subDays } from 'date-fns';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export const AIPerformanceDashboard = () => {
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('7d');

  const start = dateRange === '24h' ? subDays(new Date(), 1) 
    : dateRange === '7d' ? subDays(new Date(), 7) 
    : subDays(new Date(), 30);
  const end = new Date();

  const { data: metricsSummary, isLoading: loadingMetrics } = useAIMetrics({ start, end });
  const { data: metricsDetails, isLoading: loadingDetails } = useAIMetricsDetails({ start, end });
  const { data: errorMetrics, isLoading: loadingErrors } = useAIErrorMetrics({ start, end });
  const { data: satisfaction, isLoading: loadingSatisfaction } = useChatbotSatisfaction({ start, end });
  const { data: lowSatResponses } = useLowSatisfactionResponses(2);

  if (loadingMetrics || loadingDetails || loadingErrors || loadingSatisfaction) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Calculate aggregate metrics
  const totalRequests = metricsSummary?.reduce((sum, m) => sum + m.total_requests, 0) || 0;
  const successfulRequests = metricsSummary?.reduce((sum, m) => sum + m.successful_requests, 0) || 0;
  const totalCost = metricsSummary?.reduce((sum, m) => sum + m.total_cost_usd, 0) || 0;
  const avgResponseTime = metricsSummary?.length 
    ? metricsSummary.reduce((sum, m) => sum + m.avg_response_time_ms, 0) / metricsSummary.length 
    : 0;
  const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;

  // Prepare chart data
  const responseTimeData = metricsSummary?.map(m => ({
    date: new Date(m.date).toLocaleDateString(),
    avg: m.avg_response_time_ms,
    median: m.median_response_time_ms,
    p95: m.p95_response_time_ms
  })) || [];

  const costData = metricsSummary?.map(m => ({
    date: new Date(m.date).toLocaleDateString(),
    cost: parseFloat(m.total_cost_usd.toString())
  })) || [];

  const satisfactionData = satisfaction ? [
    { name: '5 Stars', value: satisfaction.distribution[5] || 0, fill: '#22c55e' },
    { name: '4 Stars', value: satisfaction.distribution[4] || 0, fill: '#84cc16' },
    { name: '3 Stars', value: satisfaction.distribution[3] || 0, fill: '#eab308' },
    { name: '2 Stars', value: satisfaction.distribution[2] || 0, fill: '#f97316' },
    { name: '1 Star', value: satisfaction.distribution[1] || 0, fill: '#ef4444' }
  ] : [];

  const errorTypeData = errorMetrics?.errorsByType ? Object.entries(errorMetrics.errorsByType).map(([type, count]) => ({
    type: type.replace(/_/g, ' '),
    count
  })) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Performance Analytics</h2>
          <p className="text-sm text-muted-foreground">Monitor GLO's AI chatbot performance, costs, and user satisfaction</p>
        </div>
        <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              {avgResponseTime < 1500 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Excellent
                </span>
              ) : avgResponseTime < 3000 ? (
                <span className="text-yellow-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Good
                </span>
              ) : (
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Needs attention
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ~${(totalCost / (totalRequests || 1)).toFixed(4)} per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            {successRate >= 95 ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulRequests} / {totalRequests} requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            {(satisfaction?.avgRating || 0) >= 4 ? (
              <Zap className="h-4 w-4 text-yellow-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{satisfaction?.avgRating.toFixed(1) || 'N/A'}/5</div>
            <p className="text-xs text-muted-foreground">
              From {satisfaction?.totalFeedback || 0} responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for detailed metrics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Average, median, and 95th percentile response times</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avg" stroke="#3b82f6" name="Average" />
                  <Line type="monotone" dataKey="median" stroke="#10b981" name="Median" />
                  <Line type="monotone" dataKey="p95" stroke="#f59e0b" name="P95" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Slowest Interactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Slowest Interactions</CardTitle>
              <CardDescription>Top 10 slowest AI responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metricsDetails?.slice(0, 10).sort((a, b) => b.response_time_ms - a.response_time_ms).map((metric) => (
                  <div key={metric.id} className="flex justify-between items-center p-2 border rounded">
                    <div className="flex-1">
                      <span className="text-sm font-mono">{metric.id.substring(0, 8)}...</span>
                    </div>
                    <Badge variant={metric.response_time_ms > 3000 ? 'destructive' : 'secondary'}>
                      {metric.response_time_ms}ms
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(metric.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Tracking</CardTitle>
              <CardDescription>Daily AI processing costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
                  <Bar dataKey="cost" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>User feedback breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={satisfactionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {satisfactionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
                <CardDescription>Detailed satisfaction scores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Response Relevance</span>
                    <span className="text-sm font-medium">{satisfaction?.avgResponseRelevance.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(satisfaction?.avgResponseRelevance || 0) * 20}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Language Quality</span>
                    <span className="text-sm font-medium">{satisfaction?.avgLanguageQuality.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(satisfaction?.avgLanguageQuality || 0) * 20}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Cultural Sensitivity</span>
                    <span className="text-sm font-medium">{satisfaction?.avgCulturalSensitivity.toFixed(1)}/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(satisfaction?.avgCulturalSensitivity || 0) * 20}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Satisfaction Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Low Satisfaction Responses</CardTitle>
              <CardDescription>Interactions rated 2 stars or below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowSatResponses?.slice(0, 5).map((feedback: any) => (
                  <div key={feedback.id} className="p-3 border rounded space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-1">
                        {Array.from({ length: feedback.rating }).map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                        {Array.from({ length: 5 - feedback.rating }).map((_, i) => (
                          <span key={i} className="text-gray-300">★</span>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">{feedback.feedback_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{feedback.comment || 'No comment provided'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Rate by Type</CardTitle>
              <CardDescription>Failed requests breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>Total errors: {errorMetrics?.totalErrors || 0}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(errorMetrics?.errorsByType || {}).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center p-2 border rounded">
                    <span className="text-sm font-medium capitalize">{type.replace(/_/g, ' ')}</span>
                    <Badge variant="destructive">{count} errors</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
