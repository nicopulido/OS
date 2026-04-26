export class Partition {
    constructor(base, size) {
        this.PID = 0;
        this.base = base;
        this.size = size;
    }

    setPID(PID) {
        this.PID = PID;
    }
}