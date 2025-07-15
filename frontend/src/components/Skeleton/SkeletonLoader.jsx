import './SkeletonLoader.css'

export const SkeletonLoader = ({ width = '100%', height = '20px', className = '', borderRadius = '4px' }) => {
   return (
       <div
           className={`skeleton ${className}`}
           style={{
               width,
               height,
               borderRadius
           }}
       />
   )
}

export const SkeletonCard = ({ children, className = '' }) => {
   return (
       <div className={`skeleton-card ${className}`}>
           {children}
       </div>
   )
}

export const SkeletonText = ({ lines = 1, className = '' }) => {
   return (
       <div className={`skeleton-text-container ${className}`}>
           {Array.from({ length: lines }, (_, index) => (
               <SkeletonLoader
                   key={index}
                   height="16px"
                   width={index === lines - 1 ? '70%' : '100%'}
                   className="skeleton-text-line"
               />
           ))}
       </div>
   )
}

export const SkeletonCircle = ({ size = '40px', className = '' }) => {
   return (
       <SkeletonLoader
           width={size}
           height={size}
           borderRadius="50%"
           className={`skeleton-circle ${className}`}
       />
   )
}
