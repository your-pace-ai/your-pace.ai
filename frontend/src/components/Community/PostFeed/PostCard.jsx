import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PostCard.css'
import { currentUser } from '../../../api/api'
import { CommentSection } from './CommentSection'
import { formatDate } from '../../../utils/utils.js'

export const PostCard = ({ post, isLiked, onUpdate, onDelete, onLike, onComment }) => {
   const [showComments, setShowComments] = useState(false)
   const [newComment, setNewComment] = useState('')
   const [isLiking, setIsLiking] = useState(false)
   const [isCommenting, setIsCommenting] = useState(false)
   const [currentUserId, setCurrentUserId] = useState("")
   const navigate = useNavigate()


   useEffect(() => {
       loadCurrentUser()
   }, [])


   const loadCurrentUser = async () => {
       try {
           const user = await currentUser()
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


   const handleComment = (e) => {
       e.preventDefault()
       if (!newComment.trim() || isCommenting) return

        setIsCommenting(true)
        onComment(post.id, newComment)
        setNewComment('')
        setIsCommenting(false)
   }

   const handleDelete = () => {
           onDelete(post.id)
   }

   const handleSharedSubHubClick = () => {
      if (post.sharedSubHub && post.sharedSubHub.youtubeUrl) {
          navigate('/subhub', {
              state: {
                  youtubeUrl: post.sharedSubHub.youtubeUrl,
                  hubName: post.sharedSubHub.name,
                  hubId: post.sharedSubHub.id,
              }
          })
      }
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
               {post.sharedSubHub && (
                   <div className="shared-subhub-badge clickable"
                        onClick={handleSharedSubHubClick}
                        title='Click to view shared subhub'
                    >
                       📚 Shared Learning: {post.sharedSubHub.name}
                   </div>
               )}
               <div className="post-text">{post.content}</div>
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
           <div className="comments-section">
               <form onSubmit={handleComment} className="add-comment">
                   <input
                       type="text"
                       placeholder="Add a comment..."
                       value={newComment}
                       onChange={(e) => setNewComment(e.target.value)}
                       className="comment-input"
                   />
                   <button
                       type="submit"
                       disabled={!newComment.trim() || isCommenting}
                       className="comment-submit"
                   >
                       {isCommenting ? '...' : 'Post'}
                   </button>
               </form>

               {showComments && (
                   <CommentSection
                       comments={post.comment || []}
                       postId={post.id}
                       onUpdate={onUpdate}
                       post={post}
                   />
               )}
           </div>
       </div>
   )
}
