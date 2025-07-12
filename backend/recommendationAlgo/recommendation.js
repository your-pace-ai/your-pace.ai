const PriorityQueue = require("./priorityQueue")

const CATEGORY_COEFFICIENT = 0.7
const LIKE_COEFFICIENT = 0.5
const COMMENT_COEFFICIENT = 0.5
const TOP_K = 10

const videoScore = ({ category, likes, comments }) => {
    return CATEGORY_COEFFICIENT + (likes * LIKE_COEFFICIENT) + (comments * COMMENT_COEFFICIENT)
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
