const PriorityQueue = require("./priorityQueue")

// using different category weights for mock category data
const CATEGORY_WEIGHTS = {
  Education: 5,
  ScienceTech: 4,
  Entertainment: 3,
  Music: 2,
  Other: 1,
}

const CATEGORY_MULTIPLIER = 1000
const LIKE_COEFFICIENT = 0.5
const COMMENT_COEFFICIENT = 0.5
const TOP_K = 10

const videoScore = ({ category, likes, comments }) => {
    return (CATEGORY_WEIGHTS[category] ?? CATEGORY_WEIGHTS.Other) * CATEGORY_MULTIPLIER + (0.5 * LIKE_COEFFICIENT) + (0.5 * COMMENT_COEFFICIENT)
}

const priorityQueue = new PriorityQueue((a,b) => a.score > b.score)

const topKRecommendations = (videos, k = TOP_K) => {
    videos.forEach(video => {
        priorityQueue.push({ ...video, score: videoScore(video)})
    })
    const output = []
    while (!priorityQueue.isEmpty() && output.length < k) {
        output.push(priorityQueue.pop())
    }
    return output
}

module.exports = topKRecommendations
