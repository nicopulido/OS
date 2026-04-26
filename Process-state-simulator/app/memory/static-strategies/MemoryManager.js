import MemoryUnits from "../MemoryUnits.js";

export class MemoryManager {
    constructor() {
        this.ramCapacity = 16*MemoryUnits.MiB;
        this.partitionsTable = [];
        this.memmoryModel = null;
    }

    addPartition(base, size) {
        const partition = new Partition(base, size);
        this.partitionsTable.push(partition);
    }

    changeMemoryModel(model) {
        this.memmoryModel = model;
    }

    restartPartitions() {
        this.partitionsTable = [];
    }

    allocateProcess(PID, sizeInBytes) {
        console.log(`Allocating process ${PID} with size ${sizeInBytes} bytes...`);
    }
}