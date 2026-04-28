export default class Partition {
	constructor(pid, startAddress, sizeBytes) {
		this.pid = this.validatePid(pid);
		this.startAddress = this.validateStartAddress(startAddress);
		this.sizeBytes = this.validateSizeBytes(sizeBytes);
		this.endAddress = this.startAddress + this.sizeBytes - 1;
	}

	validatePid(value) {
		if (!Number.isInteger(value) || value < 0) {
			throw new Error(`PID must be a non-negative integer. Received: ${value}`);
		}

		return value;
	}

	validateStartAddress(value) {
		if (!Number.isInteger(value) || value < 0) {
			throw new Error(`Start address must be a non-negative integer. Received: ${value}`);
		}

		return value;
	}

	validateSizeBytes(value) {
		if (!Number.isInteger(value) || value <= 0) {
			throw new Error(`Size must be a positive integer. Received: ${value}`);
		}

		return value;
	}

	overlapsWithPartition(otherPartition) {
		return !(this.endAddress < otherPartition.startAddress || this.startAddress > otherPartition.endAddress);
	}
}
