import { SkeletonLoader, SkeletonCard } from './SkeletonLoader'

export const FlashcardSkeleton = () => {
   return (
       <SkeletonCard>
           <SkeletonLoader width="120px" height="20px" className="skeleton-chapter-title" />

           <SkeletonLoader
               width="100%"
               height="200px"
               className="skeleton-flashcard"
               borderRadius="8px"
           />

           <div className="skeleton-flashcard-controls">
               <SkeletonLoader width="80px" height="36px" borderRadius="6px" />
               <SkeletonLoader width="60px" height="16px" />
               <SkeletonLoader width="80px" height="36px" borderRadius="6px" />
           </div>
       </SkeletonCard>
   )
}
