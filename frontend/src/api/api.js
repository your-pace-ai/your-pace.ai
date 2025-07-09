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

export const createSubHub = async (title, youtubeUrl, learningHubId=null) => {
    const requestData = {
        title,
        youtubeUrl
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
