import {MemoryModel} from '../MemoryModel.js';
export default class VariableModel extends MemoryModel {
    constructor() {
        super();
    }

    changeMemoryModel(memoryManager) {
        const partitions = changeMemoryModel
            { count: 4, size: 1 * MiB },
            { count: 2, size: 2 * MiB },
            { count: 2, size: 4 * MiB }
        ];

        memoryManager.restartPartitions();
        
        let offset = 0;
        partitions.forEach(({ count, size }) => {
            for (let i = 0; i < count; i++) {
            memoryManager.addPartition(offset, size);
            offset += size;
            }
        });
    }
}