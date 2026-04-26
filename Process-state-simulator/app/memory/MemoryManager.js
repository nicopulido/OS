export class MemoryManager {
    constructor() {
        this.ramCapacity;
        this.partitionsTable = [];
    }

    setRamCapacity(capacity) {
        this.ramCapacity = capacity;
    }

    addPartition(base, size) {
        const partition = new Partition(base, size);
        this.partitionsTable.push(partition);
    }
}