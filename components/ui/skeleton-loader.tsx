import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonLoader() {
  return (
    <div className="flex items-center space-x-4 w-full mb-4">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="space-y-2 w-[500px]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}