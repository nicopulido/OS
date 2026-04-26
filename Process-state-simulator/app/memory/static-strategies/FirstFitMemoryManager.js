import {memoryManager} from "../MemoryModel.js";
import {MemoryModel} from "../MemoryModel.js";
import {VariableModel} from "./VariableModel.js";
import {FixedModel} from "./FixedModel.js";

export default class FirstFitMemoryManager extends MemoryManager {
    constructor() {
        super();
    }

    allocateProcess(PID, sizeInBytes) {
        memoryManager.partitionsTable.forEach(partition => {
            if (partition.isFree() && partition.getSize() >= sizeInBytes) {
                partition.allocate(PID, sizeInBytes);
                console.log(`Process ${PID} allocated in partition with base ${partition.getBase()} and size ${partition.getSize()} bytes.`);
                return;
            }
        }
        console.log(`No suitable partition found for process ${PID} with size ${sizeInBytes} bytes.`);
    }
}