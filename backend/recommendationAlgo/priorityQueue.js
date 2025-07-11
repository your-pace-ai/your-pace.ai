/**
 * Custom OOP implementation of a priority(going for a max-heap idea here)
 * armotized O(logn) push/pop
 * O(1) peak/ size/ isEmpty
 */
class PriorityQueue {
    constructor(compareFunction) {
        // (a,b) => true:: a has higher priotity than b
        this.compare = compareFunction ?? ((a,b) => (a > b))
        this.priorityQueue = []
    }

    size() {
        return this.priorityQueue.length
    }

    isEmpty() {
        return this.size() === 0
    }
    peek () {
        return this.priorityQueue[0]
    }
    push (value) {
        this.priorityQueue.push(value)
        this.#bubbleUp(this.priorityQueue.length - 1)
    }
    pop() {
        const len = this.priorityQueue.length
        // base cases
        if (len === 0) return null
        if (len === 1) return this.priorityQueue.pop()

        const top = this.peek()
        // move the last element to the top
        this.priorityQueue[0] = this.priorityQueue.pop()
        this.#bubbleDown(0)
        return top
    }

    /**
     * private methods
     */

    #parent(i) {
        // bit-wise floor (i - 1) /2
        return ((i - 1) >> 1)
    }
    #left(i) {
        return (i << 1) + 1
    }
    #right(i) {
        return (i << 1) + 2
    }

    #bubbleUp(i) {
        while (i > 0) {
            const p = this.#parent(i)
            if (this.compare(this.priorityQueue[p], this.priorityQueue[i])) break
            this.#swap(i,p)
            i = p
        }
    }

    #bubbleDown(i) {
        const len = this.priorityQueue.length
        let current = i
        
        while (current < len) {
            const l = this.#left(current)
            const r = this.#right(current)

            // pick child with higher priority
            let swapIdx = current
            if (l < len && !this.compare(this.priorityQueue[swapIdx], this.priorityQueue[l])) {
                swapIdx = l
            }
            if (r < len && !this.compare(this.priorityQueue[swapIdx], this.priorityQueue[r])) {
                swapIdx = r
            }
            if (swapIdx === current) break
            this.#swap(current, swapIdx)
            current = swapIdx
        }
    }

    #swap(i,j) {
        [this.priorityQueue[i], this.priorityQueue[j]] = [this.priorityQueue[j], this.priorityQueue[i]]
    }
}

module.exports = PriorityQueue
