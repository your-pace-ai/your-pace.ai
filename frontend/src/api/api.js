const apiUrl = import.meta.env.VITE_API_URL
const agentUrl = import.meta.env.VITE_AGENT_API_URL

export const signup = async (email, password) => {
    const response = await fetch(`${apiUrl}/local-auth/signup`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    })

    if (!response.ok) {
        throw new Error('Signup failed')
    }
    return response.json()
}

export const login = async (email, password) => {
    const response = await fetch(`${apiUrl}/local-auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password
        })
    })

    if (!response.ok) {
        throw new Error('Login failed')
    }
    return response.json()
}

export const logout = async () => {
    await fetch(`${apiUrl}/local-auth/logout`, {
        method: 'POST',
        credentials: 'include'
    })
}

export const currentUser = async () => {
    const response = await fetch(`${apiUrl}/user`, {
        method: 'GET',
        credentials: 'include'
    })

    if (!response.ok) {
        throw new Error('Failed to fetch current user')
    }
    const data = await response.json()
    return data.user
}

export const createLearningHub = async(title="anonymous") => {
    const response = await fetch(`${apiUrl}/learning-hub/create`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title
        })
    })

    if (!response.ok) throw new Error("Failed to create learning Hub")
}

export const createSubHub = async (title, youtubeUrl, learningHubId=null, category='OTHER') => {
    const requestData = {
        title,
        youtubeUrl,
        category
    }

    if (learningHubId) requestData.learningHubId = learningHubId

    const response = await fetch(`${apiUrl}/subhub/create`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
    })
    if (!response.ok) throw new Error("Failed to create sub hub")
    const data = await response.json()
    return data
}

export const getSubHubs = async () => {
    const response = await fetch(`${apiUrl}/subhub/all`, {
        method: "GET",
        credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to get sub hubs")
    const data = await response.json()
    return data
}

export const getLearningHubs = async () => {
    const response = await fetch(`${apiUrl}/learning-hub`, {
        method: "GET",
        credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to get learning hubs")
    const data = await response.json()
    return data
}

export const getSubHubsForLearningHub = async (learningHubId) => {
    const response = await fetch(`${apiUrl}/learning-hub/${learningHubId}/subhubs`, {
        method: "GET",
        credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to get sub hubs for learning hub")
    const data = await response.json()
    return data
}

export const deletedLearningHub = async (learningHubId) => {
    const response = await fetch(`${apiUrl}/learning-hub/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            learningHubId
        })
    })
    if (!response.ok) throw new Error("Failed to delete learning hub")
    const data = await response.json()
    return data
}

export const deleteSubHub = async (subHubId) => {
    const response = await fetch(`${apiUrl}/subhub/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            subHubId
        })
    })
    if (!response.ok) throw new Error("Failed to delete sub hub")
    const data = await response.json()
    return data
}

export const getChapters = async (videoUrl) => {
    const response = await fetch(`${agentUrl}/chapters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            youtubeUrl: videoUrl
        })
    })

    if (!response.ok) throw new Error("Failed to get chapters")
    const data = await response.json()
    return data
}

export const getFlashCards = async (videoUrl) => {
    const response = await fetch(`${agentUrl}/flash-cards`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            youtubeUrl: videoUrl
        })
    })

    if (!response.ok) throw new Error("Failed to get flash cards")
    const data = await response.json()
    return data
}

export const getQuiz = async (videoUrl) => {
    const response = await fetch(`${agentUrl}/quiz`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            youtubeUrl: videoUrl
        })
    })
    if (!response.ok) throw new Error("Failed to get quiz")
    const data = await response.json()
    return data
}

// Post API functions
export const getPosts = async (feedType = 'all', page = 1, limit = 10) => {
    const response = await fetch(`${apiUrl}/posts?feedType=${feedType}&page=${page}&limit=${limit}`, {
        method: "GET",
        credentials: "include",
    })
    if (!response.ok) throw new Error("Failed to get posts")
    const data = await response.json()
    return data
}

export const createPost = async (title, content, sharedSubHubId = null) => {
    const response = await fetch(`${apiUrl}/posts`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            content,
            sharedSubHubId
        })
    })
    if (!response.ok) throw new Error("Failed to create post")
    const data = await response.json()
    return data
}

export const likePost = async (postId) => {
    const response = await fetch(`${apiUrl}/posts/${postId}/like`, {
        method: "POST",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to like/unlike post")
    const data = await response.json()
    return data
}

export const commentOnPost = async (postId, comment) => {
    const response = await fetch(`${apiUrl}/posts/${postId}/comment`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ comment })
    })
    if (!response.ok) throw new Error("Failed to comment on post")
    const data = await response.json()
    return data
}

export const deletePost = async (postId) => {
    const response = await fetch(`${apiUrl}/posts/${postId}`, {
        method: "DELETE",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to delete post")
    const data = await response.json()
    return data
}

export const shareSubHub = async (subHubId, title = null, content = null) => {
    const requestBody = { subHubId }
    // Only include title and content if they are provided
    if (title) requestBody.title = title
    if (content) requestBody.content = content

    const response = await fetch(`${apiUrl}/posts/share-subhub`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    if (!response.ok) throw new Error("Failed to share SubHub")
    const data = await response.json()
    return data
}

// Community API functions
export const getAllUsers = async () => {
    const response = await fetch(`${apiUrl}/community/users`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get users")
    const data = await response.json()
    return data
}

export const getFollowers = async () => {
    const response = await fetch(`${apiUrl}/community/followers`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get followers")
    const data = await response.json()
    return data
}

export const getFollowing = async () => {
    const response = await fetch(`${apiUrl}/community/following`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get following")
    const data = await response.json()
    return data
}

export const followUser = async (userId) => {
    const response = await fetch(`${apiUrl}/community/follow/${userId}`, {
        method: "POST",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to follow user")
    const data = await response.json()
    return data
}

export const unfollowUser = async (userId) => {
    const response = await fetch(`${apiUrl}/community/follow/${userId}`, {
        method: "DELETE",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to unfollow user")
    const data = await response.json()
    return data
}

export const getCommunityStats = async () => {
    const response = await fetch(`${apiUrl}/community/stats`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get community stats")
    const data = await response.json()
    return data
}

export const getRecommendations = async () => {
    const response = await fetch(`${apiUrl}/subhub/recommendations`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get recommendations")
    const data = await response.json()
    return data
}

export const getRecommendedPosts = async () => {
    const response = await fetch(`${apiUrl}/posts/recommendations`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get recommended posts")
    const data = await response.json()
    return data
}

export const generateSummaryFromChapters = async (chapters) => {
    const response = await fetch(`${agentUrl}/summary-from-chapters`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ chapters })
    })
    if (!response.ok) throw new Error("Failed to generate summary from chapters")
    const data = await response.json()
    return data
 }

export const getChaptersFromDB = async (subHubId) => {
    const response = await fetch(`${apiUrl}/subhub/${subHubId}/chapters`, {
        method: "GET",
        credentials: "include"
    })
    if (!response.ok) throw new Error("Failed to get chapters from database")
    const data = await response.json()
    return data
}

export const getFlashCardsFromDB = async (youtubeUrl, subHubId = null) => {
    const requestBody = { youtubeUrl }
    if (subHubId) requestBody.subHubId = subHubId

    const response = await fetch(`${apiUrl}/flashcards/smart-get`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    if (!response.ok) throw new Error("Failed to get flashcards")
    const data = await response.json()
    return data
}

export const getQuizFromDB = async (youtubeUrl, subHubId = null) => {
    const requestBody = { youtubeUrl }
    if (subHubId) requestBody.subHubId = subHubId

    const response = await fetch(`${apiUrl}/quizzes/smart-get`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    if (!response.ok) throw new Error("Failed to get quizzes")
    const data = await response.json()
    return data
}
