export default class CPU {
    constructor() {
        this.currentPCB = null; // The PCB of the currently running process on the CPU
    }

    // Method to assign a process to the CPU for execution
    assignProcess(pcb) {
        this.currentPCB = pcb;
    }


    executeSimulation() {
        if (this.currentPCB) {
            console.log(`Executing process ${this.currentPCB.process.name} with PID ${this.currentPCB.pid}.`);
            this.currentPCB.programCounter += 1;
            console.log(`Process ${this.currentPCB.process.name} with PID ${this.currentPCB.pid} has program counter at ${this.currentPCB.programCounter}.`);
        } else {
            console.log("No process is currently running on the CPU.");
        }
    }
}