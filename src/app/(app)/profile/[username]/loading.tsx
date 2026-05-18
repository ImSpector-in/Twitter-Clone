import { Skeleton } from '@/components/ui/skeleton'
import { TweetListSkeleton } from '@/components/tweet/TweetSkeleton'

export default function Loading() {
  return (
    <div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <TweetListSkeleton />
    </div>
  )
}
