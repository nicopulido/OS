export class Partition {
    constructor(base, size) {
        this.PID = 0;
        this.base = base;
        this.size = size;
        this.limit = base + size - 1;
    }

    setPID(PID) {
        this.PID = PID;
    }

    isFree() {
        return this.PID === 0;
    }

    canFit(sizeInBytes) {
        return this.isFree() && this.size >= sizeInBytes;
    }

    allocateTo(PID) {
        this.PID = PID;
    }

    release() {
        this.PID = 0;
    }
}