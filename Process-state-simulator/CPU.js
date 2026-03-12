class CPU {
    constructor() {
        this.currentPCB = null;
    }

    execute(pcb) {
        this.currentPCB = pcb;
    }

}