export const extractId = (url="") => {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([\w-]{11})/
    )
    return match ? match[1] : null
}

export const formatDate = (dateString) => {
    const MAX_HOURS_PER_DAY = 24
    const MAX_DAYS_PER_WEEK = 7
    const JUST_NOW = 1
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / MAX_HOURS_PER_DAY)

    if (diffHours < JUST_NOW) return 'Just now'
    if (diffHours < MAX_HOURS_PER_DAY) return `${diffHours}h`
    if (diffDays < MAX_DAYS_PER_WEEK) return `${diffDays}d`
    return date.toLocaleDateString()
}
