export const extractId = (url="") => {
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?.*v=|embed\/)|youtu\.be\/)([\w-]{11})/
    )
    return match ? match[1] : null
}
