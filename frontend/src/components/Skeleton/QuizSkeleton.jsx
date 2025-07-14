import { SkeletonLoader, SkeletonCard } from './SkeletonLoader'


export const QuizSkeleton = () => {
   return (
       <SkeletonCard>
           <SkeletonLoader width="80px" height="20px" className="skeleton-quiz-header" />

           <div className="skeleton-quiz-difficulty">
               <SkeletonLoader width="60px" height="32px" borderRadius="6px" />
               <SkeletonLoader width="70px" height="32px" borderRadius="6px" />
               <SkeletonLoader width="60px" height="32px" borderRadius="6px" />
           </div>

           <SkeletonLoader width="150px" height="18px" className="skeleton-quiz-header" />

           <SkeletonLoader width="100%" height="24px" className="skeleton-quiz-header" />

           <div style={{ marginBottom: '20px' }}>
               <SkeletonLoader width="100%" className="skeleton-quiz-option" />
               <SkeletonLoader width="100%" className="skeleton-quiz-option" />
               <SkeletonLoader width="100%" className="skeleton-quiz-option" />
               <SkeletonLoader width="100%" className="skeleton-quiz-option" />
           </div>

           <SkeletonLoader width="80px" height="36px" borderRadius="6px" />
       </SkeletonCard>
   )
}
