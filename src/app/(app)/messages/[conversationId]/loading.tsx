import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-3 p-4 h-full">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-2/3' : 'w-1/2'}`} />
        </div>
      ))}
    </div>
  )
}
