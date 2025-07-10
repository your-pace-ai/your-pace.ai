const topKRecommendations = require('./recommendation')
const data = require('./sample')

const videos = data
const recommendations = topKRecommendations(videos, 10)

console.table(
  recommendations.map(({ id, category, likes, comments, score }) => ({
    id,
    category,
    likes,
    comments,
    score: score.toFixed(0)
  }))
)
