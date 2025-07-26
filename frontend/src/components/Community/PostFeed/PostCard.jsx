import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './PostCard.css'
import { currentUser } from '../../../api/api'
import { CommentSection } from './CommentSection'
import { formatDate } from '../../../utils/utils.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faTrash,
    faBook,
    faHeart,
    faComment,
    faShareFromSquare
} from '@fortawesome/free-solid-svg-icons'

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


   const handleLike = async () => {
       if (isLiking) return

        setIsLiking(true)
        try {
            await onLike(post.id)
        } catch (error) {
            console.error("Error liking post:", error)
        } finally {
            setIsLiking(false)
        }
   }


   const handleComment = async (e) => {
       e.preventDefault()
       if (!newComment.trim() || isCommenting) return

        setIsCommenting(true)
        try {
            await onComment(post.id, newComment)
            setNewComment('')
        } catch (error) {
            console.error("Error commenting on post:", error)
        } finally {
            setIsCommenting(false)
        }
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
                       <FontAwesomeIcon icon={faTrash} />
                   </button>
               )}
           </div>

           <div className="post-content">
               <h3 className="post-title">{post.title}</h3>
               {post.sharedSubHub && (
                   <div className="shared-subhub-badge clickable hover-effect cursor-pointer"
                        onClick={handleSharedSubHubClick}
                        title='Click to view shared subhub'
                    >
                       <FontAwesomeIcon icon={faBook} /> Shared Learning: {post.sharedSubHub.name}
                   </div>
               )}
               <div className="post-text">{post.content}</div>
               {post.thumbnail && (
                   <img src={post.thumbnail} alt={post.title} className="post-image cursor-zoom" />
               )}
           </div>
           <div className="post-actions">
               <div className="action-buttons">
                   <button
                       className={`action-btn like-btn ${isLiked ? 'liked' : ''} ${isLiking ? 'loading' : ''} click-effect cursor-pointer`}
                       onClick={handleLike}
                       disabled={isLiking}
                       title={isLiked ? 'Unlike' : 'Like'}
                   >
                       <FontAwesomeIcon icon={faHeart} className={isLiked ? 'liked-icon' : ''} /> <span>{post.like || 0}</span>
                   </button>
                   <button
                       className="action-btn comment-btn cursor-pointer"
                       onClick={() => setShowComments(!showComments)}
                       title={showComments ? "Hide comments" : "Show comments"}
                   >
                       <FontAwesomeIcon icon={faComment} /> <span>{post.comment?.length || 0}</span>
                   </button>
                   <button className="action-btn share-btn button-hover cursor-pointer" title="Share this post">
                       <FontAwesomeIcon icon={faShareFromSquare} />
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
                       className="comment-input cursor-text"
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
