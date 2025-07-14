# Recommendation Algorithm Documentation


## Overview


This is a **Recommendation Algorithm** that combines a discovery-focused approach with educational content prioritization. The algorithm balances personal preferences (following) with content discovery and trending detection to create an engaging yet educational feed.


## Algorithm Philosophy


The algorithm operates on the principle that users should see:
1. **Educational content** (prioritized but not overwhelming)
2. **Viral/trending posts** (TikTok-style discovery)
3. **Content from followed users** (personal relevance)
4. **New creator content** (platform diversity)
5. **Recent content** (freshness)


## Scoring Formula


```
Final Score = CategoryScore + EngagementScore + FollowingScore + TrendingScore + DiscoveryScore + RecencyScore
```


Each component is weighted by its respective coefficient and calculated independently.


## Main Algorithm Coefficients


| Coefficient | Value | Purpose | Impact |
|-------------|-------|---------|---------|
| `CATEGORY_COEFFICIENT` | 0.2 | Weight for educational category bias | Reduced to be less dominant than previous versions |
| `ENGAGEMENT_COEFFICIENT` | 0.4 | Weight for user engagement signals | Combines likes and comments |
| `FOLLOWING_COEFFICIENT` | 0.8 | Weight for posts from followed users | Reduced from 2.0 for better discovery |
| `TRENDING_COEFFICIENT` | 0.6 | Weight for trending content detection | viral content boost |
| `DISCOVERY_COEFFICIENT` | 0.3 | Weight for new creator discovery boost | Promotes platform diversity |
| `RECENCY_COEFFICIENT` | 0.2 | Weight for recent posts time-based boost | Keeps feed fresh |


## Category Weights


Educational content maintains priority while allowing content diversity:


| Category | Weight | Priority Level |
|----------|--------|----------------|
| `EDUCATION` | 1.0 | Highest (but not overwhelming) |
| `SCIENCE_TECH` | 0.9 | Very High |
| `BUSINESS` | 0.8 | High |
| `HEALTH_FITNESS` | 0.8 | High |
| `LANGUAGE` | 0.8 | High |
| `ARTS_CRAFTS` | 0.7 | Medium-High |
| `COOKING` | 0.7 | Medium-High |
| `MUSIC` | 0.6 | Medium |
| `ENTERTAINMENT` | 0.6 | Medium (boosted for discovery) |
| `OTHER` | 0.4 | Low (but not penalized) |


## Scoring Components


### 1. Category Score
```javascript
categoryScore = CATEGORY_COEFFICIENT * CATEGORY_WEIGHTS[category]
```
- **Purpose**: Maintain educational bias while allowing content diversity
- **Range**: 0.08 (OTHER) to 0.2 (EDUCATION)


### 2. Engagement Score
```javascript
engagementScore = ENGAGEMENT_COEFFICIENT * (likes * 0.6 + comments * 1.4)
```
- **Purpose**: Prioritize content with high user engagement
- **Comments weighted higher**: Comments indicate deeper engagement than likes
- **Range**: Unlimited (scales with engagement)


### 3. Following Score
```javascript
followingScore = isFromFollowing ? FOLLOWING_COEFFICIENT : 0
```
- **Purpose**: Boost content from users you follow
- **Binary**: Either 0.8 boost or no boost
- **Reduced impact**: From previous 2.0 to allow more discovery


### 4. Trending Score
```javascript
trendingScore = TRENDING_COEFFICIENT * getTrendingScore(likes, comments, hoursOld)
```
- **Purpose**: Detect and promote viral content (TikTok-style)
- **Formula**: `(likes + comments * 1.5) / hoursOld / 10`
- **Capped**: Maximum score of 2.0 to prevent outliers
- **Comments weighted higher**: 1.5x multiplier for comments in trending calculation


### 5. Discovery Score
```javascript
discoveryScore = DISCOVERY_COEFFICIENT * getDiscoveryScore(creatorFollowerCount, isFromFollowing)
```
- **Purpose**: Promote content from new/smaller creators
- **Thresholds and Boosts**:
 - < 10 followers: 1.0 boost (New creators)
 - < 50 followers: 0.7 boost (Small creators)
 - < 100 followers: 0.4 boost (Medium creators)
 - < 500 followers: 0.2 boost (Large creators)
 - 500+ followers: 0 boost (Popular creators)
- **No boost for followed creators**: Discovery is only for unknown creators


### 6. Recency Score
```javascript
recencyScore = RECENCY_COEFFICIENT * getRecencyScore(hoursOld)
```
- **Purpose**: Keep feed fresh with recent content
- **Time-based boosts**:
 - ≤ 1 hour: 1.0 boost (Very recent)
 - ≤ 6 hours: 0.8 boost (Recent)
 - ≤ 24 hours: 0.5 boost (Today)
 - ≤ 72 hours: 0.2 boost (This week)
 - > 72 hours: 0 boost (Old content)


## Technical Constants


### Trending Calculation
| Constant | Value | Purpose |
|----------|-------|---------|
| `MIN_HOURS_TO_PREVENT_DIVISION` | 0.1 | Prevents division by zero for very new posts |
| `COMMENT_WEIGHT_IN_TRENDING` | 1.5 | Comments are more valuable than likes in trending |
| `TRENDING_NORMALIZATION_FACTOR` | 10 | Normalizes engagement rate to reasonable score range |
| `MAX_TRENDING_SCORE` | 2.0 | Caps trending score to prevent outliers |


### Discovery Thresholds
| Threshold | Value | Creator Category |
|-----------|-------|------------------|
| `NEW_CREATOR_FOLLOWER_THRESHOLD` | 10 | New creators |
| `SMALL_CREATOR_FOLLOWER_THRESHOLD` | 50 | Small creators |
| `MEDIUM_CREATOR_FOLLOWER_THRESHOLD` | 100 | Medium creators |
| `LARGE_CREATOR_FOLLOWER_THRESHOLD` | 500 | Large creators |


### Recency Thresholds
| Threshold | Value | Time Category |
|-----------|-------|---------------|
| `VERY_RECENT_HOURS_THRESHOLD` | 1 | Very recent posts |
| `RECENT_HOURS_THRESHOLD` | 6 | Recent posts |
| `TODAY_HOURS_THRESHOLD` | 24 | Today's posts |
| `WEEK_HOURS_THRESHOLD` | 72 | This week's posts |


### Engagement Weights
| Weight | Value | Purpose |
|--------|-------|---------|
| `LIKES_WEIGHT_IN_ENGAGEMENT` | 0.6 | Weight for likes in engagement calculation |
| `COMMENTS_WEIGHT_IN_ENGAGEMENT` | 1.4 | Weight for comments (higher value) |


## Example Scoring Scenarios


### Scenario 1: Viral Educational Post from New Creator
- **Category**: EDUCATION (0.2 × 1.0 = 0.2)
- **Engagement**: 50 likes + 20 comments (0.4 × (50×0.6 + 20×1.4) = 23.2)
- **Following**: Not followed (0)
- **Trending**: High engagement in 2 hours (0.6 × 1.5 = 0.9)
- **Discovery**: New creator with 5 followers (0.3 × 1.0 = 0.3)
- **Recency**: 2 hours old (0.2 × 0.8 = 0.16)
- **Total Score**: 24.76


### Scenario 2: Post from Followed User
- **Category**: ENTERTAINMENT (0.2 × 0.6 = 0.12)
- **Engagement**: 10 likes + 5 comments (0.4 × (10×0.6 + 5×1.4) = 5.2)
- **Following**: Followed user (0.8)
- **Trending**: Low engagement (0.6 × 0.5 = 0.3)
- **Discovery**: Already followed (0)
- **Recency**: 12 hours old (0.2 × 0.5 = 0.1)
- **Total Score**: 6.52


### Scenario 3: Trending Entertainment from Unknown Creator
- **Category**: ENTERTAINMENT (0.2 × 0.6 = 0.12)
- **Engagement**: 100 likes + 30 comments (0.4 × (100×0.6 + 30×1.4) = 40.8)
- **Following**: Not followed (0)
- **Trending**: Viral in 1 hour (0.6 × 2.0 = 1.2)
- **Discovery**: Medium creator with 80 followers (0.3 × 0.2 = 0.06)
- **Recency**: 1 hour old (0.2 × 1.0 = 0.2)
- **Total Score**: 42.38


## Algorithm Flow


1. **Data Collection**: Fetch all posts with engagement data and creator follower counts
2. **Following Detection**: Get user's following list to determine relationship with creators
3. **Time Calculation**: Calculate post age in hours for trending and recency scoring
4. **Score Calculation**: Apply the scoring formula to each post
5. **Priority Queue**: Use max-heap to efficiently get top K recommendations
6. **Filtering**: Remove user's own posts from recommendations
7. **Return**: Ordered list of top recommendations


## Performance Characteristics


- **Time Complexity**: O(n log k) where n = total posts, k = TOP_K recommendations
- **Space Complexity**: O(n) for storing post data and scores
- **Scalability**: Priority queue approach scales well with large datasets
- **Request Isolation**: New priority queue instance per request prevents interference


## Tuning Guidelines


### Increase Educational Bias
- Increase `CATEGORY_COEFFICIENT` (0.2 → 0.3)
- Adjust `CATEGORY_WEIGHTS` to favor educational categories more


### Increase Discovery (TikTok-style)
- Increase `TRENDING_COEFFICIENT` (0.6 → 0.8)
- Increase `DISCOVERY_COEFFICIENT` (0.3 → 0.5)
- Decrease `FOLLOWING_COEFFICIENT` (0.8 → 0.6)


### Favor Following More
- Increase `FOLLOWING_COEFFICIENT` (0.8 → 1.2)
- Decrease `TRENDING_COEFFICIENT` (0.6 → 0.4)


### Promote Newer Content
- Increase `RECENCY_COEFFICIENT` (0.2 → 0.4)
- Adjust recency thresholds for different time windows


## Dependencies


- **PriorityQueue**: Custom max-heap implementation for efficient top-K selection
- **Database**: Requires post engagement data (likes, comments) and creator follower counts
- **Following System**: Needs user following relationships for personalization


## Usage


```javascript
const topKRecommendations = require('./recommendation')


const posts = [
 {
   category: 'EDUCATION',
   likes: 10,
   comments: 5,
   isFromFollowing: false,
   hoursOld: 2,
   creatorFollowerCount: 25
 }
 // ... more posts
]


const recommendations = topKRecommendations(posts, 10)
```
