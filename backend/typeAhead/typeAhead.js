const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

class TrieNode {
    constructor() {
        this.children = {}
        this.words = new Map()
        this.isEnd = false
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode()
        // store all words for fuzzy matching
        this.allWords = new Set()
    }

    add(word, frequency = 1) {
        let curr = this.root
        const lowerWord = word.toLowerCase()
        this.allWords.add(lowerWord)

        for (const c of lowerWord) {
            if (!curr.children[c]) {
                curr.children[c] = new TrieNode()
            }
            curr = curr.children[c]
            // curr.words.push(word)

            const currFreq = curr.words.get(lowerWord) || 0
            curr.words.set(lowerWord, currFreq + frequency)
        }
        curr.isEnd = true
    }

    findPrefix(word) {
        let curr = this.root
        const lowerWord = word.toLowerCase()
        for (const c of lowerWord) {
            if (!curr.children[c]) {
                return []
            }
            curr = curr.children[c]
        }
        // convert map to array and sort by frequency
        return Array.from(curr.words.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([word]) => word)
  }
}

const levenshteinDistance = (s1, s2) => {
    const m = s1.length
    const n = s2.length
    const dp = new Array(m + 1).fill(null).map(() => new Array(n + 1).fill(0))

    for (let i = 0; i <= m; i++) dp[i][0] = i
    for (let j = 0; j <= n; j++) dp[0][j] = j

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (s1[i - 1] === s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]
            } else {
                dp[i][j] = Math.min(
                    dp[i -1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                )
            }
        }
    }
    return dp[m][n]

}

// fuzzy search with scoring
const fuzzySearch = (query, words, threshold = 2) => {
    const lowerQuery = query.toLowerCase()
    const results = []

    for (const word of words) {
        const distance = levenshteinDistance(lowerQuery, word)

        // include words within threshold distance
        if (distance <= threshold) {
            // calculate similarity score (higher is better)
            const similarity = 1 - (distance / Math.max(lowerQuery.length, word.length))

            // boost score for prefix matches
            const isPrefixMatch = word.startsWith(lowerQuery)
            const score = isPrefixMatch ? similarity + 0.5 : similarity

            results.push({
                word,
                distance,
                score,
                isPrefixMatch
            })
        }
    }

    // sort by score (descending) and then by length (ascending)
    return results
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return a.word.length - b.word.length
        })
        .map(r => r.word)
}

class AutocompleteSystem {
    constructor() {
        this.trie = new Trie()
        this.wordFrequency = new Map()
    }
    // index content from search results
    indexContent(searchResults) {
        const extractedWords = this.extractAllStrings(searchResults)

        for (const word of extractedWords) {
            // split by common delimiters and index individual words(PS:: I'm skipping very short words)
            const tokens = word.split(/[\s,;.:!?'"()\[\]{}<>\/\\-_]+/)
                .filter(token => token.length > 2)
            for (const token of tokens) {
                const freq = this.wordFrequency.get(token) || 0
                this.wordFrequency.set(token, freq + 1)
                this.trie.add(token, freq + 1)
            }
        }
    }

    // extract all strings from nested object
    extractAllStrings(obj) {
        let result = []

        const dfs = (value, key = null) => {
            if (typeof value === 'string') {
                // skip id and type fields
                if (key !== "id" && key !== "type") {
                    result.push(value.toLowerCase())
                }
            } else if (Array.isArray(value)) {
                value.forEach(item => dfs(item))
            } else if (value && typeof value === 'object') {
                for (const [k, v] of Object.entries(value)) {
                    dfs(v, k)
                }
            }
        }

        dfs(obj)
        return result
    }

    // search method
    search(query, options = {}) {
        const {
            maxResults = 10,
            fuzzyThreshold = 2,
            includeFuzzy = true
        } = options

        if (!query || query.trim() === '') {
            return []
        }

        const cleanQuery = query.trim().toLowerCase()
        const results = new Set()

        // try exact prefix match first
        const prefixMatches = this.trie.findPrefix(cleanQuery)
        prefixMatches.forEach(match => results.add(match))

        // if not enough results and fuzzy is enabled, do fuzzy search
        if (results.size < maxResults && includeFuzzy) {
            const fuzzyMatches = fuzzySearch(
                cleanQuery,
                Array.from(this.trie.allWords),
                fuzzyThreshold
            )

            // add fuzzy matches until we reach maxResults
            for (const match of fuzzyMatches) {
                if (results.size >= maxResults) break
                results.add(match)
            }
        }

        return Array.from(results).slice(0, maxResults)
    }
}

// helper function to build typeahead index
const buildTypeaheadIndex = async () => {
    // fetch sample data from all content types for indexing (useing limit to avoid timeout)
    const [flashcards, quizzes, subHubs, chapters, posts] = await Promise.all([
        prisma.flashCard.findMany({
            select: { question: true, answer: true },
            take: 100
        }),
        prisma.quiz.findMany({
            select: { question: true, answer: true, options: true },
            take: 100
        }),
        prisma.subHub.findMany({
            select: { name: true, aiSummary: true },
            take: 100
        }),
        prisma.chapter.findMany({
            select: { title: true, summary: true },
            take: 100
        }),
        prisma.post.findMany({
            select: { title: true, content: true },
            take: 100
        })
    ])

    return {
        flashcards,
        quizzes,
        subHubs,
        chapters,
        posts
    }
}

module.exports = {
    buildTypeaheadIndex,
    AutocompleteSystem
}
