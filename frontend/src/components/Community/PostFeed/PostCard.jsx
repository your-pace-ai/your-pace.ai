import React, { useState } from 'react'
import './PostCard.css'
import { currentUser } from '../../../api/api'

export const PostCard = ({ post, isLiked, onDelete, onLike }) => {
   const [showComments, setShowComments] = useState(false)
   const [isLiking, setIsLiking] = useState(false)
   const [currentUserId, setCurrentUserId] = useState("")


   useEffect(() => {
       loadCurrentUser()
   }, [])


   const loadCurrentUser = async () => {
       try {
           const user = await currentUser();
           setCurrentUserId(user)
       } catch (error) {
           throw new Error(error)
       }
   }


   const handleLike = () => {
       if (isLiking) return

        setIsLiking(true)
        onLike(post.id)
        setIsLiking(false)
   }

   const handleDelete = () => {
           onDelete(post.id)
   }

   const formatDate = (dateString) => {
       const date = new Date(dateString)
       const now = new Date()
       const diffMs = now - date
       const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
       const diffDays = Math.floor(diffHours / 24)


       if (diffHours < 1) return 'Just now'
       if (diffHours < 24) return `${diffHours}h`
       if (diffDays < 7) return `${diffDays}d`
       return date.toLocaleDateString()
   }


   const isOwnPost = post.userId === currentUserId


   return (
       <div className="post-card">
           <div className="post-header">
               <div className="user-info">
                   <div className="user-avatar">
                       {post.user.email.charAt(0).toUpperCase()}
                   </div>
                   <div className="user-details">
                       <span className="username">{post.user.email}</span>
                       <span className="post-time">{formatDate(post.createdAt)}</span>
                   </div>
               </div>
               {isOwnPost && (
                   <button className="delete-btn" onClick={handleDelete} title="Delete post">
                       🗑️
                   </button>
               )}
           </div>

           <div className="post-content">
               <h3 className="post-title">{post.title}</h3>
               <p className="post-text">{post.content}</p>
               {post.thumbnail && (
                   <img src={post.thumbnail} alt={post.title} className="post-image" />
               )}
           </div>
           <div className="post-actions">
               <div className="action-buttons">
                   <button
                       className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''}`}
                       onClick={handleLike}
                       disabled={isLiking}
                       title={isLiked ? 'Unlike' : 'Like'}
                   >
                       {isLiked ? '❤️' : '🤍'} <span>{post.like || 0}</span>
                   </button>
                   <button
                       className="action-btn comment-btn"
                       onClick={() => setShowComments(!showComments)}
                   >
                       💬 <span>{post.comment?.length || 0}</span>
                   </button>
                   <button className="action-btn share-btn">
                       📤
                   </button>
               </div>
           </div>
       </div>
   );
};
