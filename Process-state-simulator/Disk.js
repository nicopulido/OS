export default class Disk {
    constructor() {
        this.currentPCB = null;
    }

    startRead(pcb) {
        if (this.currentPCB) {
            return null;
        }

        this.currentPCB = pcb;
        return pcb;
    }

    completeRead() {
        if (!this.currentPCB) {
            return null;
        }

        const pcb = this.currentPCB;
        this.currentPCB = null;
        return pcb;
    }
}