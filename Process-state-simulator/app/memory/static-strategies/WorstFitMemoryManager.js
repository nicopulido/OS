import {memoryManager} from "../MemoryModel.js";
import {MemoryModel} from "../MemoryModel.js";
import {VariableModel} from "./VariableModel.js";
import {FixedModel} from "./FixedModel.js";

export default class WorstFitMemoryManager extends MemoryManager {
    constructor() {
        super();
    }

    // This method will find the largest free partition and allocate the process there
    allocateProcess(PID, sizeInBytes) {
        let worstPartition = null;
        memoryManager.partitionsTable.forEach(partition => {
            if (partition.isFree() && partition.getSize() >= sizeInBytes) {
                if (!worstPartition || partition.getSize() > worstPartition.getSize()) {
                    worstPartition = partition;
                }
            }
        });

        if (worstPartition) {
            worstPartition.allocate(PID, sizeInBytes);
            console.log(`Process ${PID} allocated in partition with base ${worstPartition.getBase()} and size ${worstPartition.getSize()} bytes.`);
        } else {
            console.log(`No suitable partition found for process ${PID} with size ${sizeInBytes} bytes.`);
        }
    }
}