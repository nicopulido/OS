export default class CPU {
    constructor() {
        this.currentPCB = null; // The PCB of the currently running process on the CPU
    }

    // Method to assign a process to the CPU for execution
    assignProcess(pcb) {
        this.currentPCB = pcb;
    }

    // Method to simulate the execution of the current process for one time unit
    execute() {
        if (this.currentPCB) {
            this.currentPCB.programCounter += 1;
            this.currentPCB.updateRemainingExecutionTime(1); // Simulate one CPU time unit
        }
    }

    // Alias used by the UI/OS loop to advance one simulation time unit
    tick() {
        this.execute();
    }
}