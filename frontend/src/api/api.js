const apiUrl = import.meta.env.VITE_API_URL

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
