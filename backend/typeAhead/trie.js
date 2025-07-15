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

const suggestedProducts = (products, searchWord) => {
    products.sort()
    const trie = new Trie()
    for (const p of products) {
        trie.add(p)
    }
    return trie.find(searchWord)
}

//test use case
const products = ["mobile", "mouse", "moneypot", "monitor", "mousepad"]
const searchWord = "mouse"
console.log(suggestedProducts(products, searchWord))

