
class PriorityQueue {
    constructor(compareFunction) {
        this.compare = compareFunction ?? ((a,b) => (a > b))
        this.priorityQueue = []
    }

    size() {
        return this.priorityQueue.length
    }

    isEmpty() {
        return this.priorityQueue.length === 0
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

        const top = this.priorityQueue[0]
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
        while (true) {
            const l = this.#left(i)
            const r = this.#right(i)

            // pick child with higher priority
            let swapIdx = i
            if (l < len && !this.compare(this.priorityQueue[swapIdx], this.priorityQueue[l])) {
                swapIdx = l
            }
            if (r < len && !this.compare(this.priorityQueue[swapIdx], this.priorityQueue[r])) {
                swapIdx = r
            }
            if (swapIdx == i) break
            this.#swap(i, swapIdx)
            i = swapIdx
        }
    }
    
    #swap(i,j) {
        [this.priorityQueue[i], this.priorityQueue[j]] = [this.priorityQueue[j], this.priorityQueue[i]]
    }
}
