import { Skeleton } from '@/components/ui/skeleton'

export default function TweetSkeleton() {
  return (
    <div className="flex gap-3 border-b px-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function TweetListSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <TweetSkeleton key={i} />
      ))}
    </div>
  )
}
