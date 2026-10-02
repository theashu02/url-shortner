import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalyticsDetailSkeleton() {
  return (
    <div className="flex-1 w-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-20 rounded-none" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-28 rounded-none" />
            <Skeleton className="h-4 w-full max-w-md rounded-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Card className="rounded-none border-border/50 bg-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-3.5 w-20 rounded-none" />
              <Skeleton className="h-3.5 w-3.5 rounded-none" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-6 w-16 rounded-none" />
            </CardContent>
          </Card>
          <Card className="rounded-none border-border/50 bg-background/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-3.5 w-24 rounded-none" />
              <Skeleton className="h-3.5 w-3.5 rounded-none" />
            </CardHeader>
            <CardContent className="pt-0">
              <Skeleton className="h-6 w-16 rounded-none" />
            </CardContent>
          </Card>
        </div>

      <Card className="rounded-none border-border/40">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <Skeleton className="h-4 w-28 rounded-none" />
          <Skeleton className="h-3.5 w-3.5 rounded-none" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[220px] sm:h-[260px] w-full rounded-none" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex gap-1 bg-muted/50 border border-border/60 rounded-none inline-flex h-10 items-center justify-center p-1">
          <Skeleton className="h-8 w-20 rounded-none" />
          <Skeleton className="h-8 w-20 rounded-none" />
          <Skeleton className="h-8 w-16 rounded-none" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="rounded-none border-border/40 h-full">
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-20 rounded-none" />
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-16 rounded-none" />
                      <Skeleton className="h-3.5 w-14 rounded-none" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-none" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
