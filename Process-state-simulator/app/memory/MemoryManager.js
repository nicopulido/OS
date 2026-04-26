export class MemoryManager {
    constructor() {
        this.ramCapacity;
        this.partitionsTable = [];
        this.memmoryModel = null;
    }

    setRamCapacity(capacity) {
        this.ramCapacity = capacity;
    }

    addPartition(base, size) {
        const partition = new Partition(base, size);
        this.partitionsTable.push(partition);
    }

    changeMemoryModel(model) {
        this.memmoryModel = model;
    }

    restarPartitions() {
        this.partitionsTable = [];
    }
}