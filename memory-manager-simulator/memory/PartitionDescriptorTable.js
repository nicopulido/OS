import Partition from './Partition.js';

export default class PartitionDescriptorTable {
	constructor() {
		this.partitions = [];
	}

	addPartition(pid, startAddress, sizeBytes) {
		const newPartition = new Partition(pid, startAddress, sizeBytes);
		this.checkForOverlap(newPartition);

		this.partitions.push(newPartition);
		this.partitions.sort((a, b) => a.startAddress - b.startAddress);
		return newPartition;
	}

	removePartition(pid) {
		const index = this.partitions.findIndex((p) => p.pid === pid);

		if (index === -1) {
			throw new Error(`Partition with PID ${pid} not found.`);
		}

		return this.partitions.splice(index, 1)[0];
	}

	getPartition(pid) {
		return this.partitions.find((p) => p.pid === pid);
	}

	getAllPartitions() {
		return [...this.partitions];
	}

	checkForOverlap(newPartition) {
		for (const partition of this.partitions) {
			if (newPartition.overlapsWithPartition(partition)) {
				throw new Error(
					`Partition overlaps with existing partition. New: [${newPartition.startAddress}, ${newPartition.endAddress}], ` +
					`Existing: [${partition.startAddress}, ${partition.endAddress}]`
				);
			}
		}
	}
}
