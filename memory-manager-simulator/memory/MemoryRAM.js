export default class MemoryRAM {
	static MEMORY_SIZE_MIB = 16;
	static MEMORY_SIZE_BYTES = MemoryRAM.MEMORY_SIZE_MIB * 1024 * 1024;

	constructor() {
		this.totalSizeBytes = MemoryRAM.MEMORY_SIZE_BYTES;
		this.buffer = new ArrayBuffer(this.totalSizeBytes);
		this.view = new Uint8Array(this.buffer);
	}

	getTotalSizeBytes() {
		return this.totalSizeBytes;
	}

	getTotalSizeMiB() {
		return this.totalSizeBytes / (1024 * 1024);
	}


	clearMemory() {
		this.view.fill(0);
	}

	validateAddress(address, length) {
		if (!Number.isInteger(address) || address < 0) {
			throw new Error(`Address must be a non-negative integer. Received: ${address}`);
		}

		if (!Number.isInteger(length) || length < 0) {
			throw new Error(`Length must be a non-negative integer. Received: ${length}`);
		}

		if (address + length > this.totalSizeBytes) {
			throw new Error(
				`Memory access out of bounds. Address: ${address}, Length: ${length}, Total size: ${this.totalSizeBytes}`
			);
		}
	}
}
