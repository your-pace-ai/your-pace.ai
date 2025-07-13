const PriorityQueue = require("./priorityQueue")

const CATEGORY_COEFFICIENT = 0.2
const ENGAGEMENT_COEFFICIENT = 0.4
const FOLLOWING_COEFFICIENT = 0.8
const TRENDING_COEFFICIENT = 0.6
const DISCOVERY_COEFFICIENT = 0.3
const RECENCY_COEFFICIENT = 0.2
const TOP_K = 10

const CATEGORY_WEIGHTS = {
   'EDUCATION': 1.0,
   'SCIENCE_TECH': 0.9,
   'BUSINESS': 0.8,
   'HEALTH_FITNESS': 0.8,
   'LANGUAGE': 0.8,
   'ARTS_CRAFTS': 0.7,
   'COOKING': 0.7,
   'MUSIC': 0.6,
   'ENTERTAINMENT': 0.6,
   'OTHER': 0.4
}

const MIN_HOURS_TO_PREVENT_DIVISION = 0.1
const COMMENT_WEIGHT_IN_TRENDING = 1.5
const TRENDING_NORMALIZATION_FACTOR = 10
const MAX_TRENDING_SCORE = 2.0

const NEW_CREATOR_FOLLOWER_THRESHOLD = 10
const SMALL_CREATOR_FOLLOWER_THRESHOLD = 50
const MEDIUM_CREATOR_FOLLOWER_THRESHOLD = 100
const LARGE_CREATOR_FOLLOWER_THRESHOLD = 500

const NEW_CREATOR_BOOST = 1.0
const SMALL_CREATOR_BOOST = 0.7
const MEDIUM_CREATOR_BOOST = 0.4
const LARGE_CREATOR_BOOST = 0.2
const NO_DISCOVERY_BOOST = 0

const VERY_RECENT_HOURS_THRESHOLD = 1
const RECENT_HOURS_THRESHOLD = 6
const TODAY_HOURS_THRESHOLD = 24
const WEEK_HOURS_THRESHOLD = 72

const VERY_RECENT_BOOST = 1.0
const RECENT_BOOST = 0.8
const TODAY_BOOST = 0.5
const WEEK_BOOST = 0.2
const NO_RECENCY_BOOST = 0

const LIKES_WEIGHT_IN_ENGAGEMENT = 0.6
const COMMENTS_WEIGHT_IN_ENGAGEMENT = 1.4

const getTrendingScore = (likes, comments, hoursOld) => {
   if (hoursOld <= 0) hoursOld = MIN_HOURS_TO_PREVENT_DIVISION
   const engagementRate = (likes + comments * COMMENT_WEIGHT_IN_TRENDING) / hoursOld
   return Math.min(engagementRate / TRENDING_NORMALIZATION_FACTOR, MAX_TRENDING_SCORE)
}


const getDiscoveryScore = (creatorFollowerCount, userFollowsCreator) => {
   if (userFollowsCreator) return NO_DISCOVERY_BOOST

   if (creatorFollowerCount < NEW_CREATOR_FOLLOWER_THRESHOLD) return NEW_CREATOR_BOOST
   if (creatorFollowerCount < SMALL_CREATOR_FOLLOWER_THRESHOLD) return SMALL_CREATOR_BOOST
   if (creatorFollowerCount < MEDIUM_CREATOR_FOLLOWER_THRESHOLD) return MEDIUM_CREATOR_BOOST
   if (creatorFollowerCount < LARGE_CREATOR_FOLLOWER_THRESHOLD) return LARGE_CREATOR_BOOST
   return NO_DISCOVERY_BOOST
}

const getRecencyScore = (hoursOld) => {
   if (hoursOld <= VERY_RECENT_HOURS_THRESHOLD) return VERY_RECENT_BOOST
   if (hoursOld <= RECENT_HOURS_THRESHOLD) return RECENT_BOOST
   if (hoursOld <= TODAY_HOURS_THRESHOLD) return TODAY_BOOST
   if (hoursOld <= WEEK_HOURS_THRESHOLD) return WEEK_BOOST
   return NO_RECENCY_BOOST
}

const videoScore = ({
   category,
   likes,
   comments,
   isFromFollowing,
   hoursOld,
   creatorFollowerCount = 0
}) => {
   const categoryWeight = CATEGORY_WEIGHTS[category] || CATEGORY_WEIGHTS['OTHER']
   const categoryScore = CATEGORY_COEFFICIENT * categoryWeight
   const engagementScore = ENGAGEMENT_COEFFICIENT * (likes * LIKES_WEIGHT_IN_ENGAGEMENT + comments * COMMENTS_WEIGHT_IN_ENGAGEMENT)
   const followingScore = isFromFollowing ? FOLLOWING_COEFFICIENT : 0

   const trendingScore = TRENDING_COEFFICIENT * getTrendingScore(likes, comments, hoursOld)
   const discoveryScore = DISCOVERY_COEFFICIENT * getDiscoveryScore(creatorFollowerCount, isFromFollowing)
   const recencyScore = RECENCY_COEFFICIENT * getRecencyScore(hoursOld)

   return categoryScore + engagementScore + followingScore + trendingScore + discoveryScore + recencyScore
}

const topKRecommendations = (videos, k = TOP_K) => {
   const pq = new PriorityQueue((a,b) => a.score > b.score)

   videos.forEach(video => {
       pq.push({ ...video, score: videoScore(video)})
   })

   const output = []
   while (!pq.isEmpty() && output.length < k) {
       output.push(pq.pop())
   }
   return output
}

module.exports = topKRecommendations
