// Utility functions for extracting YouTube video thumbnails

// Extract video ID from various YouTube URL formats
function extractVideoId(url) {
   if (!url) return null

   const patterns = [
       // Standard youtube.com URLs
       /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
       // Shortened youtu.be URLs
       /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
       // YouTube embed URLs
       /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
       // YouTube playlist URLs with video
       /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)&list=/,
       // YouTube URLs with additional parameters
       /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/
   ]

   for (const pattern of patterns) {
       const match = url.match(pattern)
       if (match && match[1]) {
           return match[1]
       }
   }

   return null
}

// quality - Thumbnail quality (default(120x90), hqdefault(480x360), mqdefault(320x180), sddefault(640x480), maxresdefault(1280x720))
function getThumbnailUrl(videoId, quality = 'hqdefault') {
   if (!videoId) return null

   // YouTube thumbnail URL format
   return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

function extractThumbnailFromUrl(youtubeUrl, quality = 'hqdefault') {
   const videoId = extractVideoId(youtubeUrl)
   if (!videoId) return null

   return getThumbnailUrl(videoId, quality)
}

// Get multiple thumbnail qualities for a YouTube URL
function getAllThumbnailQualities(youtubeUrl) {
   const videoId = extractVideoId(youtubeUrl)
   if (!videoId) return null

   return {
       default: getThumbnailUrl(videoId, 'default'),
       medium: getThumbnailUrl(videoId, 'mqdefault'),
       high: getThumbnailUrl(videoId, 'hqdefault'),
       standard: getThumbnailUrl(videoId, 'sddefault'),
       maxres: getThumbnailUrl(videoId, 'maxresdefault')
   }
}

// Validate if URL is a valid YouTube URL
function isValidYouTubeUrl(url) {
   return extractVideoId(url) !== null
}

module.exports = {
   extractVideoId,
   getThumbnailUrl,
   extractThumbnailFromUrl,
   getAllThumbnailQualities,
   isValidYouTubeUrl
}
