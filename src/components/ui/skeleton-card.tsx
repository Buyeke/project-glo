import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SkeletonCard = () => (
  <Card>
    <CardHeader className="pb-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </CardContent>
  </Card>
);

export const SkeletonPage = () => (
  <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <div className="grid gap-4 md:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);
