import { bytesToHexAddress, formatBytes } from '../core/memoryUnits.js';

function validateInteger(value, fieldName, minValue = 0) {
  if (!Number.isInteger(value) || value < minValue) {
    throw new Error(`${fieldName} must be an integer greater than or equal to ${minValue}.`);
  }
}

export default class MemoryPartition {
  constructor({ baseAddress, sizeBytes, kind = 'free', pid = null, name = 'Libre' }) {
    validateInteger(baseAddress, 'baseAddress', 0);
    validateInteger(sizeBytes, 'sizeBytes', 1);

    this.baseAddress = baseAddress;
    this.sizeBytes = sizeBytes;
    this.kind = kind;
    this.pid = pid;
    this.name = name;
  }

  get endAddress() {
    return this.baseAddress + this.sizeBytes - 1;
  }

  get isFree() {
    return this.kind === 'free';
  }

  toJSON() {
    return {
      baseAddress: this.baseAddress,
      endAddress: this.endAddress,
      sizeBytes: this.sizeBytes,
      kind: this.kind,
      pid: this.pid,
      name: this.name,
      baseAddressHex: bytesToHexAddress(this.baseAddress),
      endAddressHex: bytesToHexAddress(this.endAddress),
      sizeLabel: formatBytes(this.sizeBytes),
    };
  }
}
