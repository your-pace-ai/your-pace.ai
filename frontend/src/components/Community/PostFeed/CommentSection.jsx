import './CommentSection.css'
import { formatDate } from '../../../utils/utils.js'

export const CommentSection = ({ comments, postId, onUpdate, post }) => {

   return (
       <div className="comment-section">
           {comments.length === 0 ? (
               <div className="no-comments">
                   No comments yet. Be the first to comment!
               </div>
           ) : (
               <div className="comments-list">
                   {comments.map(comment => (
                       <div key={comment.id} className="comment-item">
                           <div className="comment-avatar">
                               {comment.user?.email?.charAt(0).toUpperCase() || 'U'}
                           </div>
                           <div className="comment-content">
                               <div className="comment-header">
                                   <span className="comment-username">
                                       {comment.user?.email || 'Unknown User'}
                                   </span>
                                   <span className="comment-time">
                                       {formatDate(comment.createdAt)}
                                   </span>
                               </div>
                               <p className="comment-text">{comment.comment}</p>
                           </div>
                       </div>
                   ))}
               </div>
           )}
       </div>
   )
}
