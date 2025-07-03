import React, { useState, useEffect } from 'react'
import './PostFeed.css'
import { PostCard } from './PostCard'

// mock generated data for testing
const initialMockPosts = [
   {
       id: 1,
       title: "Just finished learning React Hooks!",
       content: "Had an amazing breakthrough today while learning about React hooks. The useState and useEffect patterns are so powerful! Can't wait to implement these in my next project. Has anyone else had those 'aha!' moments while coding? 🚀",
       userId: 2,
       user: {
           id: 2,
           email: "sarah.chen@example.com"
       },
       like: 24,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-15T10:30:00Z",
       comment: [
           {
               id: 1,
               comment: "That's awesome! React Hooks changed everything for me too. Have you tried useContext yet?",
               userId: 3,
               user: {
                   id: 3,
                   email: "mike.torres@example.com"
               },
               createdAt: "2024-01-15T11:15:00Z"
           },
           {
               id: 2,
               comment: "Love the enthusiasm! Keep building and practicing 💪",
               userId: 4,
               user: {
                   id: 4,
                   email: "emma.wilson@example.com"
               },
               createdAt: "2024-01-15T12:00:00Z"
           }
       ]
   },
   {
       id: 2,
       title: "Data Structures Study Group Anyone?",
       content: "Looking to form a study group for advanced data structures and algorithms. Planning to cover trees, graphs, dynamic programming, and system design. Meeting twice a week online. Who's interested? 📚",
       userId: 3,
       user: {
           id: 3,
           email: "mike.torres@example.com"
       },
       like: 18,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-14T15:45:00Z",
       comment: [
           {
               id: 3,
               comment: "I'm definitely interested! What timezone are you thinking?",
               userId: 5,
               user: {
                   id: 5,
                   email: "alex.rodriguez@example.com"
               },
               createdAt: "2024-01-14T16:20:00Z"
           },
           {
               id: 4,
               comment: "Count me in! Been wanting to strengthen my algorithm skills",
               userId: 2,
               user: {
                   id: 2,
                   email: "sarah.chen@example.com"
               },
               createdAt: "2024-01-14T17:30:00Z"
           },
           {
               id: 5,
               comment: "This sounds perfect! DM me the details please 🙌",
               userId: 6,
               user: {
                   id: 6,
                   email: "jordan.kim@example.com"
               },
               createdAt: "2024-01-14T18:00:00Z"
           }
       ]
   },
   {
       id: 3,
       title: "Machine Learning Project Showcase",
       content: "Just deployed my first ML model to production! Built a recommendation system using collaborative filtering. The journey from Jupyter notebook to scalable API was incredible. Learned so much about MLOps, Docker, and cloud deployment. Happy to share resources! 🤖✨",
       userId: 4,
       user: {
           id: 4,
           email: "emma.wilson@example.com"
       },
       like: 42,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-13T09:20:00Z",
       comment: [
           {
               id: 6,
               comment: "This is incredible! Would love to see the architecture diagram if you can share",
               userId: 7,
               user: {
                   id: 7,
                   email: "david.park@example.com"
               },
               createdAt: "2024-01-13T10:45:00Z"
           },
           {
               id: 7,
               comment: "Congratulations! 🎉 What stack did you use for deployment?",
               userId: 3,
               user: {
                   id: 3,
                   email: "mike.torres@example.com"
               },
               createdAt: "2024-01-13T11:30:00Z"
           }
       ]
   },
   {
       id: 4,
       title: "CSS Grid vs Flexbox - Quick Guide",
       content: "Made a visual comparison chart for CSS Grid vs Flexbox! 📊\n\nUse Flexbox for:\n• One-dimensional layouts\n• Component alignment\n• Navigation bars\n\nUse Grid for:\n• Two-dimensional layouts\n• Complex page layouts\n• Magazine-style designs\n\nBoth are powerful - know when to use which! 💡",
       userId: 5,
       user: {
           id: 5,
           email: "alex.rodriguez@example.com"
       },
       like: 31,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-12T14:10:00Z",
       comment: [
           {
               id: 8,
               comment: "This is so helpful! I always get confused about when to use which",
               userId: 2,
               user: {
                   id: 2,
                   email: "sarah.chen@example.com"
               },
               createdAt: "2024-01-12T15:20:00Z"
           },
           {
               id: 9,
               comment: "Great breakdown! I'd add that Grid is also perfect for responsive designs",
               userId: 8,
               user: {
                   id: 8,
                   email: "lisa.johnson@example.com"
               },
               createdAt: "2024-01-12T16:45:00Z"
           }
       ]
   },
   {
       id: 5,
       title: "Debugging Horror Story 😱",
       content: "Spent 6 hours debugging a 'mysterious' bug in my React app. Component state wasn't updating, tried everything - useState, useEffect, even rewrote the whole component. \n\nTurns out... I was mutating state directly instead of creating a new object. One spread operator fixed everything. 🤦‍♂️\n\nRemember: Always create new objects/arrays when updating state!",
       userId: 6,
       user: {
           id: 6,
           email: "jordan.kim@example.com"
       },
       like: 67,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-11T20:30:00Z",
       comment: [
           {
               id: 10,
               comment: "We've all been there! 😅 State mutation is a classic trap",
               userId: 4,
               user: {
                   id: 4,
                   email: "emma.wilson@example.com"
               },
               createdAt: "2024-01-11T21:00:00Z"
           },
           {
               id: 11,
               comment: "This is why I love strict mode - helps catch these issues early!",
               userId: 7,
               user: {
                   id: 7,
                   email: "david.park@example.com"
               },
               createdAt: "2024-01-11T21:30:00Z"
           },
           {
               id: 12,
               comment: "Thanks for sharing! These stories help us all learn from mistakes",
               userId: 3,
               user: {
                   id: 3,
                   email: "mike.torres@example.com"
               },
               createdAt: "2024-01-11T22:15:00Z"
           }
       ]
   },
   {
       id: 6,
       title: "Open Source Contribution Tips",
       content: "Just made my first meaningful open source contribution! 🎉 Here's what I learned:\n\n1. Start small - fix typos, update docs\n2. Read CONTRIBUTING.md carefully\n3. Test locally before submitting PR\n4. Be patient with review process\n5. Ask questions if stuck\n\nThe community is so welcoming. Don't be intimidated - just start! What was your first OSS contribution?",
       userId: 7,
       user: {
           id: 7,
           email: "david.park@example.com"
       },
       like: 29,
       thumbnail: "https://picsum.photos/200/300",
       createdAt: "2024-01-10T13:45:00Z",
       comment: [
           {
               id: 13,
               comment: "Congrats! 🙌 My first was fixing a broken link in documentation. Small wins count!",
               userId: 5,
               user: {
                   id: 5,
                   email: "alex.rodriguez@example.com"
               },
               createdAt: "2024-01-10T14:20:00Z"
           }
       ]
   }
]


let persistentPostsData = [...initialMockPosts]
const getPersistentPosts = () => persistentPostsData

const updatePersistentPost = (postId, updates) => {
   persistentPostsData = persistentPostsData.map(post =>
       post.id === postId ? { ...post, ...updates } : post
   )
   return persistentPostsData.find(post => post.id === postId)
}

const addPersistentPost = (newPost) => {
   persistentPostsData = [newPost, ...persistentPostsData];
   return persistentPostsData
}

const deletePersistentPost = (postId) => {
   persistentPostsData = persistentPostsData.filter(post => post.id !== postId)
   return persistentPostsData
}

export const PostFeed = () => {
   const [posts, setPosts] = useState(getPersistentPosts())
   const [loading, setLoading] = useState(false)
   const [feedType, setFeedType] = useState('all')
   const [currentPage, setCurrentPage] = useState(1)
   const [likedPosts, setLikedPosts] = useState(new Set())
   const [pagination, setPagination] = useState({
       totalPages: 1,
       currentPage: 1,
       hasPrev: false,
       hasNext: false
   })


   useEffect(() => {
       loadPosts()
   }, [currentPage, feedType])


   const loadPosts = () => {
       setLoading(true);

       if (feedType === 'following') {
           setPosts(getPersistentPosts().slice(0, 3))
       } else {
           setPosts(getPersistentPosts())
       }
       setPagination({ totalPages: 1, currentPage: 1, hasPrev: false, hasNext: false })

       setLoading(false)
   }


   const handlePostCreated = (newPost) => {
       const postWithDefaults = {
           ...newPost,
           id: Date.now(),
           like: 0,
           comment: [],
           user: {
               id: 1,
               email: "you@yourpace.com"
           },
           createdAt: new Date().toISOString()
       }

       const updatedPosts = addPersistentPost(postWithDefaults)
       setPosts([...updatedPosts])
   }


   const handlePostUpdate = (updatedPost) => {
       updatePersistentPost(updatedPost.id, updatedPost)
       setPosts(posts.map(post =>
           post.id === updatedPost.id ? updatedPost : post
       ))
   }


   const handlePostDelete = (deletedPostId) => {
       setPosts(posts.filter(post => post.id !== deletedPostId))
   }
   const handleLike = (postId) => {
       const post = posts.find(p => p.id === postId);
       if (post) {
           const isCurrentlyLiked = likedPosts.has(postId)
           const newLikeCount = isCurrentlyLiked
               ? Math.max(0, (post.like || 0) - 1)
               : (post.like || 0) + 1

           const updatedPost = updatePersistentPost(postId, {
               like: newLikeCount
           })

           const newLikedPosts = new Set(likedPosts)
           if (isCurrentlyLiked) {
               newLikedPosts.delete(postId)
           } else {
               newLikedPosts.add(postId)
           }
           setLikedPosts(newLikedPosts)

           setPosts(posts.map(p => p.id === postId ? updatedPost : p))
       }
   }


   const handleComment = (postId, commentText) => {
       const post = posts.find(p => p.id === postId)
       if (post) {
           const newComment = {
               id: Date.now(),
               comment: commentText,
               userId: 1,
               user: {
                   id: 1,
                   email: "you@yourpace.com"
               },
               createdAt: new Date().toISOString()
           }

           const updatedPost = updatePersistentPost(postId, {
               comment: [...(post.comment || []), newComment]
           })
           setPosts(posts.map(p => p.id === postId ? updatedPost : p))
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
       <div className="post-feed">
           <div className="feed-selector">
               <button
                   className={feedType === 'all' ? 'active' : ''}
                   onClick={() => { setFeedType('all'); setCurrentPage(1); }}
               >
                   All Posts ({posts.length})
               </button>
               <button
                   className={feedType === 'following' ? 'active' : ''}
                   onClick={() => { setFeedType('following'); setCurrentPage(1); }}
               >
                   Following (3)
               </button>
           </div>
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
                           isLiked={likedPosts.has(post.id)}
                           onUpdate={handlePostUpdate}
                           onDelete={handlePostDelete}
                           onLike={handleLike}
                           onComment={handleComment}
                       />
                   ))
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
   )
}
