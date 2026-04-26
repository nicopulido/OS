export class MemoryModel{
    constructor() {
        this.memoryManager = new MemoryManager();
    }

    //This method will add 1mib of per partition, and 16 partitions, so 16mib of total memory
    useFixedStaticPartitioning() {
        for (let i = 0; i < 16; i++) {
            this.memoryManager.addPartition(i * MiB, MiB);
        }
    }

    //This method will add 4 partitions of 1mib, 2 partitions of 2mib and 2 partitions of 4mib, so 16mib of total memory
    useVariableStaticPartitioning() {
        const partitions = [
            { count: 4, size: 1 * MiB },
            { count: 2, size: 2 * MiB },
            { count: 2, size: 4 * MiB }
        ];
        
        let offset = 0;
        partitions.forEach(({ count, size }) => {
            for (let i = 0; i < count; i++) {
            this.memoryManager.addPartition(offset, size);
            offset += size;
            }
        });
    }
}