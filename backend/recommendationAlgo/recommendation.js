const PriorityQueue = require("./priorityQueue")

// base coefficients
let CATEGORY_COEFFICIENT = 0.2
let ENGAGEMENT_COEFFICIENT = 0.4
let FOLLOWING_COEFFICIENT = 0.8
let TRENDING_COEFFICIENT = 0.6
let DISCOVERY_COEFFICIENT = 0.3
let RECENCY_COEFFICIENT = 0.2
const TOP_K = 10

// matrix Factorization and Gradient Descent Parameters
const LEARNING_RATE = 0.01
const REGULARIZATION_LAMBDA = 0.1
const LATENT_FACTORS = 10
const GRADIENT_ITERATIONS = 50
const CONVERGENCE_THRESHOLD = 0.001

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
const WEEK_HOURS_THRESHOLD = 168

const VERY_RECENT_BOOST = 1.0
const RECENT_BOOST = 0.8
const TODAY_BOOST = 0.5
const WEEK_BOOST = 0.2
const NO_RECENCY_BOOST = 0

const LIKES_WEIGHT_IN_ENGAGEMENT = 0.6
const COMMENTS_WEIGHT_IN_ENGAGEMENT = 1.4

// matrix Factorization with Gradient Descent - User-Item Interaction Matrix
class MatrixFactorization {
   constructor(latentFactors = LATENT_FACTORS) {
       this.latentFactors = latentFactors
       this.userFactors = new Map()
       this.itemFactors = new Map()
       this.userBiases = new Map()
       this.itemBiases = new Map()
       this.globalMean = 0
       this.interactionMatrix = new Map()
       this.initialized = false
   }

   // initialize matrices with random values using Xavier initialization
   initializeFactors(userIds, itemIds) {
       const xavier = Math.sqrt(6.0 / (userIds.length + itemIds.length))

       userIds.forEach(userId => {
           this.userFactors.set(userId, Array.from({length: this.latentFactors}, () => (Math.random() - 0.5) * xavier))
           this.userBiases.set(userId, 0)
       })

       itemIds.forEach(itemId => {
           this.itemFactors.set(itemId, Array.from({length: this.latentFactors}, () => (Math.random() - 0.5) * xavier))
           this.itemBiases.set(itemId, 0)
       })

       this.initialized = true
   }

   // record user interaction (likes, comments) as implicit feedback
   recordInteraction(userId, itemId, likes, comments) {
       const interactionScore = this.calculateInteractionScore(likes, comments)

       if (!this.interactionMatrix.has(userId)) {
           this.interactionMatrix.set(userId, new Map())
       }
       this.interactionMatrix.get(userId).set(itemId, interactionScore)
   }

   // calculate interaction score from likes and comments
   calculateInteractionScore(likes, comments) {
       // logarithmic scaling to handle large values
       const logLikes = Math.log(likes + 1)
       // comments weighted higher
       const logComments = Math.log(comments + 1) * 2

       // sigmoid normalization to bound between 0 and 1
       return 1 / (1 + Math.exp(-(logLikes + logComments)))
   }

   // gradient Descent optimization
   trainModel(iterations = GRADIENT_ITERATIONS) {
       if (!this.initialized) return

       this.calculateGlobalMean()
       let previousLoss = Infinity

       for (let iter = 0; iter < iterations; iter++) {
           const currentLoss = this.performGradientDescentStep()

           // check for convergence using criterion
           if (Math.abs(previousLoss - currentLoss) < CONVERGENCE_THRESHOLD) {
               break
           }
           previousLoss = currentLoss
       }
   }

   // single step of gradient descent with partial derivatives
   performGradientDescentStep() {
       let totalLoss = 0
       let sampleCount = 0

       // iterate through all user-item interactions
       for (const [userId, userInteractions] of this.interactionMatrix) {
           for (const [itemId, actualRating] of userInteractions) {
               // forward pass:: predict rating
               const prediction = this.predict(userId, itemId)
               const error = actualRating - prediction

               // accumulate loss (mean Squared Error with L2 regularization)
               totalLoss += error * error
               sampleCount++

               // get factor vectors for gradient computation
               const userFactor = this.userFactors.get(userId)
               const itemFactor = this.itemFactors.get(itemId)
               const userBias = this.userBiases.get(userId)
               const itemBias = this.itemBiases.get(itemId)

               // compute gradients using partial derivatives
               const userBiasGradient = -2 * error + 2 * REGULARIZATION_LAMBDA * userBias
               const itemBiasGradient = -2 * error + 2 * REGULARIZATION_LAMBDA * itemBias

               // update biases using gradient descent
               this.userBiases.set(userId, userBias - LEARNING_RATE * userBiasGradient)
               this.itemBiases.set(itemId, itemBias - LEARNING_RATE * itemBiasGradient)

               // update latent factors using partial derivatives
               for (let f = 0; f < this.latentFactors; f++) {
                   const userFactorGradient = -2 * error * itemFactor[f] + 2 * REGULARIZATION_LAMBDA * userFactor[f]
                   const itemFactorGradient = -2 * error * userFactor[f] + 2 * REGULARIZATION_LAMBDA * itemFactor[f]
                   // gradient descent update
                   userFactor[f] -= LEARNING_RATE * userFactorGradient
                   itemFactor[f] -= LEARNING_RATE * itemFactorGradient
               }
           }
       }
       // add regularization term to loss
       totalLoss += this.calculateRegularizationLoss()
       return totalLoss / sampleCount
   }

   // calculate L2 regularization loss
   calculateRegularizationLoss() {
       let regLoss = 0
       // regularize user factors and biases
       for (const userFactor of this.userFactors.values()) {
           regLoss += userFactor.reduce((sum, val) => sum + val * val, 0)
       }

       for (const userBias of this.userBiases.values()) {
           regLoss += userBias * userBias
       }
       // regularize item factors and biases
       for (const itemFactor of this.itemFactors.values()) {
           regLoss += itemFactor.reduce((sum, val) => sum + val * val, 0)
       }
       for (const itemBias of this.itemBiases.values()) {
           regLoss += itemBias * itemBias
       }
       return REGULARIZATION_LAMBDA * regLoss
   }
   // predict rating using matrix factorization
   predict(userId, itemId) {
       if (!this.userFactors.has(userId) || !this.itemFactors.has(itemId)) {
           return this.globalMean
       }

       const userFactor = this.userFactors.get(userId)
       const itemFactor = this.itemFactors.get(itemId)
       const userBias = this.userBiases.get(userId) || 0
       const itemBias = this.itemBiases.get(itemId) || 0

       // dot product of latent factors
       const dotProduct = userFactor.reduce((sum, val, i) => sum + val * itemFactor[i], 0)

       return this.globalMean + userBias + itemBias + dotProduct
   }
   // calculate global mean for baseline
   calculateGlobalMean() {
       let sum = 0
       let count = 0

       for (const userInteractions of this.interactionMatrix.values()) {
           for (const rating of userInteractions.values()) {
               sum += rating
               count++
           }
       }
       this.globalMean = count > 0 ? sum / count : 0
   }

   // calculate similarity between items using cosine similarity
   calculateItemSimilarity(itemId1, itemId2) {
       const factor1 = this.itemFactors.get(itemId1)
       const factor2 = this.itemFactors.get(itemId2)

       if (!factor1 || !factor2) return 0

       const dotProduct = factor1.reduce((sum, val, i) => sum + val * factor2[i], 0)
       const norm1 = Math.sqrt(factor1.reduce((sum, val) => sum + val * val, 0))
       const norm2 = Math.sqrt(factor2.reduce((sum, val) => sum + val * val, 0))
       return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0
   }


   // update recommendation coefficients based on learned patterns
   updateRecommendationCoefficients() {
       // calculate coefficient adjustments
       const coefficientAdjustments = this.calculateCoefficientAdjustments()

       // apply adjustments with bounds checking
       CATEGORY_COEFFICIENT = Math.max(0.1, Math.min(1.0, CATEGORY_COEFFICIENT + coefficientAdjustments.category))
       ENGAGEMENT_COEFFICIENT = Math.max(0.1, Math.min(1.0, ENGAGEMENT_COEFFICIENT + coefficientAdjustments.engagement))
       FOLLOWING_COEFFICIENT = Math.max(0.1, Math.min(1.5, FOLLOWING_COEFFICIENT + coefficientAdjustments.following))
       TRENDING_COEFFICIENT = Math.max(0.1, Math.min(1.0, TRENDING_COEFFICIENT + coefficientAdjustments.trending))
       DISCOVERY_COEFFICIENT = Math.max(0.1, Math.min(1.0, DISCOVERY_COEFFICIENT + coefficientAdjustments.discovery))
       RECENCY_COEFFICIENT = Math.max(0.1, Math.min(1.0, RECENCY_COEFFICIENT + coefficientAdjustments.recency))
   }
   // calculate coefficient adjustments using matrix analysis
   calculateCoefficientAdjustments() {
       // Analyze user preference patterns from latent factors
       const userPreferenceMeans = this.calculateUserPreferenceMeans()
       const itemFeatureMeans = this.calculateItemFeatureMeans()
       // use correlation analysis to adjust coefficients
       return {
           category: (userPreferenceMeans.category + itemFeatureMeans.category)* 0.1,
           engagement: (userPreferenceMeans.engagement + itemFeatureMeans.engagement) * 0.1,
           following: (userPreferenceMeans.following + itemFeatureMeans.following )* 0.1,
           trending: (userPreferenceMeans.trending + itemFeatureMeans.trending) * 0.1,
           discovery: (userPreferenceMeans.discovery + itemFeatureMeans.discovery) * 0.1,
           recency: (userPreferenceMeans.recency + itemFeatureMeans.recency) * 0.1
       }
   }
   // calculate mean preferences from user latent factors
   calculateUserPreferenceMeans() {
       const means = { category: 0, engagement: 0, following: 0, trending: 0, discovery: 0, recency: 0 }
       let userCount = 0
       for (const userFactor of this.userFactors.values()) {
           means.category += userFactor[0] || 0
           means.engagement += userFactor[1] || 0
           means.following += userFactor[2] || 0
           means.trending += userFactor[3] || 0
           means.discovery += userFactor[4] || 0
           means.recency += userFactor[5] || 0
           userCount++
       }
       if (userCount > 0) Object.keys(means).forEach(key => means[key] /= userCount)
       return means
   }
   // calculate mean features from item latent factors
   calculateItemFeatureMeans() {
       const means = { category: 0, engagement: 0, following: 0, trending: 0, discovery: 0, recency: 0 }
       let itemCount = 0

       for (const itemFactor of this.itemFactors.values()) {
           means.category += itemFactor[0] || 0
           means.engagement += itemFactor[1] || 0
           means.following += itemFactor[2] || 0
           means.trending += itemFactor[3] || 0
           means.discovery += itemFactor[4] || 0
           means.recency += itemFactor[5] || 0
           itemCount++
       }
       if (itemCount > 0) Object.keys(means).forEach(key => means[key] /= itemCount)
       return means
   }
}
// global matrix factorization instance
const matrixFactorization = new MatrixFactorization()

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

  // initialize matrix factorization
  if (!matrixFactorization.initialized && videos.length > 0) {
      // extract unique user IDs and item IDs from videos
      const userIds = [...new Set(videos.map(v => v.userId || 'anonymous').filter(id => id))]
      const itemIds = [...new Set(videos.map(v => v.id).filter(id => id))]

      if (userIds.length > 0 && itemIds.length > 0) {
          matrixFactorization.initializeFactors(userIds, itemIds)

          // record existing interactions from video data
          videos.forEach(video => {
              if (video.userId && video.id && (video.likes > 0 || video.comments > 0)) {
                  matrixFactorization.recordInteraction(video.userId, video.id, video.likes, video.comments)
              }
          })
          // train the model
          matrixFactorization.trainModel()
          // update recommendation coefficients based on learned patterns
          matrixFactorization.updateRecommendationCoefficients()
      }
  }

  videos.forEach(video => {
      // calculate base score using existing algorithm
      const baseScore = videoScore(video)

      // add collaborative filtering score if available
      let collaborativeScore = 0
      if (video.userId && video.id && matrixFactorization.initialized) {
          const prediction = matrixFactorization.predict(video.userId, video.id)
          // weight collaborative filtering
          collaborativeScore = prediction * 0.3
      }

      // calculate item similarity bonus
      let similarityBonus = 0
      if (matrixFactorization.initialized && video.id) {
          // find similar items and boost score
          const similarItems = videos.filter(v => v.id !== video.id && v.id)
          if (similarItems.length > 0) {
              const maxSimilarity = Math.max(...similarItems.map(v =>
                  matrixFactorization.calculateItemSimilarity(video.id, v.id)
              ))
              similarityBonus = maxSimilarity * 0.2
          }
      }

      const finalScore = baseScore + collaborativeScore + similarityBonus
      pq.push({ ...video, score: finalScore, baseScore, collaborativeScore, similarityBonus })
  })

   const output = []
   while (!pq.isEmpty() && output.length < k) {
       output.push(pq.pop())
   }
   return output
}

// update the model with new user interactions
const updateUserInteraction = (userId, itemId, likes, comments) => {
   if (!matrixFactorization.initialized) {
       matrixFactorization.initializeFactors([userId], [itemId])
   } else {
       // add new user/item if not exists
       if (!matrixFactorization.userFactors.has(userId)) {
           const xavier = Math.sqrt(6.0 / (matrixFactorization.userFactors.size + matrixFactorization.itemFactors.size))
           matrixFactorization.userFactors.set(userId, Array.from({length: matrixFactorization.latentFactors}, () => (Math.random() - 0.5) * xavier))
           matrixFactorization.userBiases.set(userId, 0)
       }

       if (!matrixFactorization.itemFactors.has(itemId)) {
           const xavier = Math.sqrt(6.0 / (matrixFactorization.userFactors.size + matrixFactorization.itemFactors.size))
           matrixFactorization.itemFactors.set(itemId, Array.from({length: matrixFactorization.latentFactors}, () => (Math.random() - 0.5) * xavier))
           matrixFactorization.itemBiases.set(itemId, 0)
       }
   }

   matrixFactorization.recordInteraction(userId, itemId, likes, comments)
   matrixFactorization.trainModel(20)
   matrixFactorization.updateRecommendationCoefficients()
}

// get current dynamic coefficients
const getCurrentCoefficients = () => {
   return {
       category: CATEGORY_COEFFICIENT,
       engagement: ENGAGEMENT_COEFFICIENT,
       following: FOLLOWING_COEFFICIENT,
       trending: TRENDING_COEFFICIENT,
       discovery: DISCOVERY_COEFFICIENT,
       recency: RECENCY_COEFFICIENT
   }
}

// get user-item prediction
const getUserItemPrediction = (userId, itemId) => {
   if (!matrixFactorization.initialized) return 0
   return matrixFactorization.predict(userId, itemId)
}

// get item similarity
const getItemSimilarity = (itemId1, itemId2) => {
   if (!matrixFactorization.initialized) return 0
   return matrixFactorization.calculateItemSimilarity(itemId1, itemId2)
}

module.exports = topKRecommendations
module.exports.updateUserInteraction = updateUserInteraction
module.exports.getCurrentCoefficients = getCurrentCoefficients
module.exports.getUserItemPrediction = getUserItemPrediction
module.exports.getItemSimilarity = getItemSimilarity
