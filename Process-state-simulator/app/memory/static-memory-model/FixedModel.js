import { MemoryModel } from "../MemoryModel.js";
export default class FixedModel extends MemoryModel {
    constructor() {
        super();
    }

    //This method will add 1mib of per partition, and 16 partitions, so 16mib of total memory
    changeMemoryModel(memoryManager) {
        for (let i = 0; i < 16; i++) {
            memoryManager.addPartition(i * MiB, MiB);
        }
    }

}