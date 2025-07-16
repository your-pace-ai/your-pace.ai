class TrieNode {
    constructor() {
        this.children = {}
        this.words = []
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode()
    }

    add(word) {
        let curr = this.root
        for (const c of word) {
            if (!curr.children[c]) {
                curr.children[c] = new TrieNode()
            }
            curr = curr.children[c]
            curr.words.push(word)
        }
    }

    find(word) {
        let curr = this.root
        const res = []
        for (const c of word) {
            if (!curr.children[c]) {
                break
            }
            curr = curr.children[c]
            res.push(curr.words)
        }
        return res
  }
}

const autoComplete = (words, searchWord) => {
    words.sort()
    const trie = new Trie()
    for (const p of words) {
        trie.add(p)
    }
    return trie.find(searchWord)
}

const getData = async () => {
    const response = await fetch("http://localhost:3000/api/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body:JSON.stringify({query: "byte"})
    })

    const data = await response.json()
    return data
}

try {
    let data = await getData()

    const extractAllStrings = (obj) => {
        let result = []

        const dfs = (value, key = null) => {
            if (typeof value === 'string') {
                // skip if key is id or type
                if (key != "id" && key != "type") {
                    result.push(value.toLowerCase())
                }
            } else if (Array.isArray(value)) {
                value.forEach(item => dfs(item));
            } else if (value && typeof value === 'object') {
                for (const [k, v] of Object.entries(value)) {
                    dfs(v, k)
                }
            }
        }

        dfs(obj)
        return result
    }
    // manual test
    const words = extractAllStrings(data)
    console.log(autoComplete(words, "build"))
} catch (error) {
    throw new Error({cause: error})
}
