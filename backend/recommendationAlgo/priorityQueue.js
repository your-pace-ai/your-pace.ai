
class PriorityQueue {
    constructor(compareFunction) {
        this.compareFunction = compareFunction ?? ((a,b) => (a > b))
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
    }
    pop() {
        const len = this.priorityQueue.length
        // base cases
        if (len === 0) return null
        if (len === 1) return this.priorityQueue.pop()

        const top = this.priorityQueue[0]
        // move the last element to the top
        this.priorityQueue[0] = this.priorityQueue.pop()
        return top
    }
}
