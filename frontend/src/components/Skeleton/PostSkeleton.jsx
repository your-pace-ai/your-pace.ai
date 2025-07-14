import { SkeletonLoader, SkeletonCard, SkeletonText, SkeletonCircle } from './SkeletonLoader'

export const PostSkeleton = () => {
   return (
       <SkeletonCard className="skeleton-post">
           <div className="skeleton-header">
               <SkeletonCircle size="40px" className="skeleton-avatar" />
               <div style={{ flex: 1 }}>
                   <SkeletonLoader width="120px" height="16px" style={{ marginBottom: '4px' }} />
                   <SkeletonLoader width="80px" height="14px" />
               </div>
           </div>

           <div className="skeleton-content">
               <SkeletonLoader width="70%" height="20px" style={{ marginBottom: '12px' }} />

               <SkeletonText lines={2} />

               {/* Optional image placeholder - only show randomly */}
               {Math.random() > 0.3 && (
                   <SkeletonLoader
                       width="100%"
                       height="200px"
                       borderRadius="8px"
                       style={{ marginTop: '12px' }}
                   />
               )}
           </div>

           <div className="skeleton-actions">
               <div className="skeleton-button">
                   <SkeletonLoader width="20px" height="20px" />
                   <SkeletonLoader width="20px" height="16px" />
               </div>
               <div className="skeleton-button">
                   <SkeletonLoader width="20px" height="20px" />
                   <SkeletonLoader width="20px" height="16px" />
               </div>
               <div className="skeleton-button">
                   <SkeletonLoader width="20px" height="20px" />
               </div>
           </div>
       </SkeletonCard>
   )
}

export const PostFeedSkeleton = ({ count = 3 }) => {
   return (
       <div>
           {Array.from({ length: count }, (_, index) => (
               <PostSkeleton key={index} />
           ))}
       </div>
   )
}
