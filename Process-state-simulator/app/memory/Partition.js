export class Partition {
    constructor(base, limit) {
        this.PID = 0;
        this.base = base;
        this.limit = limit;
    }

    setPID(PID) {
        this.PID = PID;
    }
}