import { SkeletonLoader, SkeletonCard, SkeletonText } from './SkeletonLoader'

export const ChapterSkeleton = () => {
   return (
       <SkeletonCard>
           <SkeletonLoader width="100px" height="20px" className="skeleton-chapter-title" />

           {Array.from({ length: 3 }, (_, index) => (
               <div key={index} className="skeleton-chapter">
                   <SkeletonLoader
                       width={`${Math.random() * 30 + 60}%`}
                       height="18px"
                       className="skeleton-chapter-title"
                   />

                   <SkeletonText lines={3} />
               </div>
           ))}
       </SkeletonCard>
   )
}
