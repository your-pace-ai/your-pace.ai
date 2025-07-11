import { useState, useEffect } from 'react'
import { PostCard } from './PostCard'
import './PostFeed.css'
import { 
    getPosts, 
    getFollowers, 
    getFollowing, 
    getAllUsers, 
    deletePost, 
    likePost, 
    commentOnPost, 
    followUser, 
    unfollowUser 
} from '../../../api/api'

const UserList = ({ users, onFollow, feedType }) => {
    if (!users || users.length === 0) {
        return (
            <div className="no-users">
                <h3>No users found</h3>
                <p>Check back later or adjust your filters.</p>
            </div>
        )
    }

    return (
        <div className="users-list">
            {users.map(user => (
                <div key={user.id} className="user-card">
                    <div className="user-info">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p>{user.email}</p>
                    </div>
                    {feedType === 'all-users' && (
                        <button 
                            className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
                            onClick={() => onFollow(user.id, user.isFollowing)}
                        >
                            {user.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                    {feedType === 'followers' && !user.isFollowing && (
                        <button 
                            className="follow-btn follow-back"
                            onClick={() => onFollow(user.id, false)}
                        >
                            Follow Back
                        </button>
                    )}
                    {feedType === 'followers' && user.isFollowing && (
                        <button 
                            className="follow-btn unfollow"
                            onClick={() => onFollow(user.id, true)}
                        >
                            Unfollow
                        </button>
                    )}
                </div>
            ))}
        </div>
    )
}

export const PostFeed = () => {
    const [posts, setPosts] = useState([])
    const [users, setUsers] = useState([])
   const [loading, setLoading] = useState(false)
    const [feedType, setFeedType] = useState('posts')
   const [currentPage, setCurrentPage] = useState(1)
   const [pagination, setPagination] = useState({
       totalPages: 1,
       currentPage: 1,
       hasPrev: false,
       hasNext: false
   })

   useEffect(() => {
        if (feedType === 'posts') {
       loadPosts()
        } else {
            loadUsers()
        }
   }, [currentPage, feedType])

    const loadPosts = async () => {
        setLoading(true)
        try {
            const postsData = await getPosts('all', currentPage, 10)
            setPosts(postsData)
            setPagination({ totalPages: 1, currentPage: 1, hasPrev: false, hasNext: false })
        } catch (error) {
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    const loadUsers = async () => {
        setLoading(true)
        try {
            let userData = []
            if (feedType === 'followers') {
                userData = await getFollowers()
            } else if (feedType === 'following') {
                userData = await getFollowing()
            } else if (feedType === 'all-users') {
                userData = await getAllUsers()
            }
            setUsers(userData)
        } catch (error) {
            setUsers([])
        } finally {
       setLoading(false)
        }
   }

   const handlePostUpdate = (updatedPost) => {
       setPosts(posts.map(post =>
           post.id === updatedPost.id ? updatedPost : post
       ))
   }

    const handlePostDelete = async (deletedPostId) => {
        try {
            await deletePost(deletedPostId)
       setPosts(posts.filter(post => post.id !== deletedPostId))
        } catch (error) {
            alert('Failed to delete post. Please try again.')
        }
    }

    const handleLike = async (postId) => {
        try {
            const result = await likePost(postId)
            
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLikedByUser: result.liked,
                        like: result.liked ? (post.like + 1) : Math.max(0, post.like - 1)
                    }
                }
                return post
            }))
        } catch (error) {
            // Silently fail - user will see no change
        }
    }

    const handleComment = async (postId, commentText) => {
        try {
            const newComment = await commentOnPost(postId, commentText)
            
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comment: [...(post.comment || []), newComment]
                    }
                }
                return post
            }))
        } catch (error) {
            alert('Failed to add comment. Please try again.')
        }
    }

    const handleFollow = async (userId, isCurrentlyFollowing) => {
        try {
            if (isCurrentlyFollowing) {
                await unfollowUser(userId)
            } else {
                await followUser(userId)
            }
            
            loadUsers()
        } catch (error) {
            alert('Failed to update follow status. Please try again.')
        }
    }

   if (loading) {
       return (
           <div className="post-feed-loading">
               <div className="loading-spinner"></div>
               <p>Loading posts...</p>
           </div>
       )
   }

   return (
    <div className="content community-content">
       <div className="feed-container">
           <div className="post-feed">
               <div className="feed-header">
                   <h1>Community</h1>
               </div>
               <div className="feed-selector">
                   <button
                            className={feedType === 'posts' ? 'active' : ''}
                            onClick={() => { setFeedType('posts'); setCurrentPage(1); }}
                        >
                            All Posts
                        </button>
                        <button
                            className={feedType === 'followers' ? 'active' : ''}
                            onClick={() => { setFeedType('followers'); setCurrentPage(1); }}
                        >
                            Followers
                   </button>
                   <button
                       className={feedType === 'following' ? 'active' : ''}
                       onClick={() => { setFeedType('following'); setCurrentPage(1); }}
                   >
                            Following
                        </button>
                        <button
                            className={feedType === 'all-users' ? 'active' : ''}
                            onClick={() => { setFeedType('all-users'); setCurrentPage(1); }}
                        >
                            All Users
                   </button>
               </div>
                    
                    <div className="content-container">
                        {feedType === 'posts' ? (
               <div className="posts-container">
                   {posts.length === 0 ? (
                       <div className="no-posts">
                           <h3>No posts yet</h3>
                           <p>Be the first to share something!</p>
                       </div>
                   ) : (
                       posts.map(post => (
                           <PostCard
                               key={post.id}
                               post={post}
                                            isLiked={post.isLikedByUser}
                               onUpdate={handlePostUpdate}
                               onDelete={handlePostDelete}
                               onLike={handleLike}
                               onComment={handleComment}
                           />
                       ))
                                )}
                            </div>
                        ) : (
                            <UserList 
                                users={users} 
                                onFollow={handleFollow}
                                feedType={feedType}
                            />
                   )}
               </div>

               {pagination.totalPages > 1 && (
                   <div className="pagination">
                       <button
                           disabled={!pagination.hasPrev}
                           onClick={() => setCurrentPage(currentPage - 1)}
                           className="pagination-btn"
                       >
                           Previous
                       </button>
                       <span className="pagination-info">
                           Page {pagination.currentPage} of {pagination.totalPages}
                       </span>
                       <button
                           disabled={!pagination.hasNext}
                           onClick={() => setCurrentPage(currentPage + 1)}
                           className="pagination-btn"
                       >
                           Next
                       </button>
                   </div>
               )}
           </div>
       </div>
    </div>
   )
}
