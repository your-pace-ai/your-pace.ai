import { useState, useEffect } from 'react'
import { getPosts, deletePost, likePost, commentOnPost, getRecommendedPosts, getFollowers, getFollowing, getAllUsers, followUser, unfollowUser, searchContent } from '../../../api/api'
import { PostCard } from './PostCard'
import { PostFeedSkeleton } from '../../Skeleton'
import './PostFeed.css'
import { TypeAheadSearchbar } from '../../TypeAheadSearchbar/TypeAheadSearchbar.jsx'

const UserList = ({ users, onFollow, feedType }) => {
    if (!users || users.length === 0) {
        return (
            <div className="no-users">
                <h3>No users found</h3>
                <p>Try exploring the community!</p>
            </div>
        )
    }

    return (
        <div className="users-container">
            {users.map(user => (
                <div key={user.id} className="user-item">
                    <div className="user-avatar">
                        {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-info">
                        <span className="user-email">{user.email}</span>
                    </div>
                    {(!user.isFollowing && feedType === 'followers') ? (
                        <button
                            className="follow-btn follow-back"
                            onClick={() => onFollow(user.id, false)}
                        >
                            Follow Back
                        </button>
                    ) : (
                        <button
                            className={`follow-btn ${user.isFollowing ? (feedType === 'followers' || feedType === 'following' || feedType === 'all-users' ? 'unfollow' : 'following') : ''}`}
                            onClick={() => onFollow(user.id, user.isFollowing)}
                        >
                            {user.isFollowing ? 'Unfollow' : 'Follow'}
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
    const [feedType, setFeedType] = useState('for-you')
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        hasPrev: false,
        hasNext: false
    })
    const [searchRequestId, setSearchRequestId] = useState(0)


   useEffect(() => {
        if (feedType === 'for-you' || feedType === 'posts') {
       loadPosts()
        } else {
            loadUsers()
        }
   }, [currentPage, feedType])

    const loadPosts = async () => {
        setLoading(true)
        try {
            let postsData
            if (feedType === 'for-you') {
                postsData = await getRecommendedPosts()
       } else {
                postsData = await getPosts('all', currentPage, 10)
       }
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

        }
    }

    const handleLike = async (postId) => {
        try {
            const result = await likePost(postId)

            // Update the posts state with the new like status
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        isLikedByUser: result.liked,
                        like: result.liked ? (post.like + 1) : Math.max(0, post.like - 1)
                    }
                }
                return post
            }))

            return result; // Return the result so the PostCard component can update its state
        } catch (error) {
            console.error("Error liking post:", error);
            throw error; // Rethrow the error so the PostCard component can handle it
        }
    }

    const handleComment = async (postId, commentText) => {
        try {
            const newComment = await commentOnPost(postId, commentText)

            // Update the posts state with the new comment
            setPosts(prevPosts => prevPosts.map(post => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comment: [...(post.comment || []), newComment]
                    }
                }
                return post
            }))

            return newComment; // Return the result so the PostCard component can update its state
        } catch (error) {
            console.error("Error commenting on post:", error);
            throw error; // Rethrow the error so the PostCard component can handle it
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

        }
    }

    const handleSearch = async (term) => {
       if (!term || !term.trim()) return

       const currentRequestId = searchRequestId + 1
       setSearchRequestId(currentRequestId)

       try {
           const searchResults = await searchContent(term)

           if (currentRequestId === searchRequestId) {
               setPosts(searchResults.posts || [])
               setFeedType('search')
           }
       } catch (error) {
           if (currentRequestId === searchRequestId) {
               setPosts([])
           }
       }
   }


  if (loading) {
      return (
          <div className="content community-content">
              <div className="feed-container">
                  <div className="post-feed">
                      <div className="feed-header">
                          <h1>Community</h1>
                      </div>
                      <div className="feed-selector">
                          <button className={feedType === 'for-you' ? 'active' : ''}>For You</button>
                          <button className={feedType === 'posts' ? 'active' : ''}>All Posts</button>
                          <button className={feedType === 'followers' ? 'active' : ''}>Followers</button>
                          <button className={feedType === 'following' ? 'active' : ''}>Following</button>
                          <button className={feedType === 'all-users' ? 'active' : ''}>All Users</button>
                      </div>
                      <div className="content-container">
                          {feedType === 'for-you' || feedType === 'posts' ? (
                              <PostFeedSkeleton count={5} />
                          ) : (
                              <div className="users-container">
                                  {Array.from({ length: 5 }, (_, index) => (
                                      <div key={index} className="user-item skeleton-item">
                                          <div className="user-avatar skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }}></div>
                                          <div className="user-info" style={{ flex: 1 }}>
                                              <div className="skeleton" style={{ width: '150px', height: '16px', marginBottom: '4px' }}></div>
                                          </div>
                                          <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }}></div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
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
                            className={`${feedType === 'for-you' ? 'active' : ''} button-hover cursor-pointer`}
                            onClick={() => { setFeedType('for-you'); setCurrentPage(1); }}
                            title="Show personalized content"
                        >
                            For You
                        </button>
                        <button
                            className={`${feedType === 'posts' ? 'active' : ''} button-hover cursor-pointer`}
                            onClick={() => { setFeedType('posts'); setCurrentPage(1); }}
                            title="Show all posts"
                        >
                            All Posts
                        </button>
                        <button
                            className={`${feedType === 'followers' ? 'active' : ''} button-hover cursor-pointer`}
                            onClick={() => { setFeedType('followers'); setCurrentPage(1); }}
                            title="Show your followers"
                        >
                            Followers
                   </button>
                   <button
                       className={`${feedType === 'following' ? 'active' : ''} button-hover cursor-pointer`}
                       onClick={() => { setFeedType('following'); setCurrentPage(1); }}
                       title="Show people you follow"
                   >
                            Following
                        </button>
                        <button
                            className={`${feedType === 'all-users' ? 'active' : ''} button-hover cursor-pointer`}
                            onClick={() => { setFeedType('all-users'); setCurrentPage(1); }}
                            title="Show all users"
                        >
                            All Users
                   </button>
               </div>

               <TypeAheadSearchbar onSearch={handleSearch}/>

                    <div className="content-container">
                        {feedType === 'for-you' ? (
                            <div className="posts-container">
                                {posts.length === 0 ? (
                                    <div className="no-posts">
                                        <h3>Your personalized feed is empty</h3>
                                        <p>Follow more people and explore content to see recommendations!</p>
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
                        ) : feedType === 'posts' ? (
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
