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
}