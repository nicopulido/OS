import {memoryManager} from "../MemoryModel.js";
import {MemoryModel} from "../MemoryModel.js";
import {VariableModel} from "./VariableModel.js";
import {FixedModel} from "./FixedModel.js";

export default class BestFitMemoryManager extends MemoryManager {
    constructor() {
        super();
    }

    // This method will find the smallest free partition that can accommodate the process
    allocateProcess(process) {
        let bestPartition = null;
        memoryManager.partitionsTable.forEach(partition => {
            if (partition.isFree() && partition.getSize() >= process.sizeInBytes) {
                if (!bestPartition || partition.getSize() < bestPartition.getSize()) {
                    bestPartition = partition;
                }
            }
        });

        if (bestPartition) {
            bestPartition.allocate(process.PID, process.sizeInBytes);
            console.log(`Process ${process.PID} allocated in partition with base ${bestPartition.getBase()} and size ${bestPartition.getSize()} bytes.`);
        } else {
            console.log(`No suitable partition found for process ${process.PID} with size ${process.sizeInBytes} bytes.`);
        }
    }
}