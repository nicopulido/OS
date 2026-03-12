class OperativeSystem {
    constructor() {
        this.processes = [];
        this.CPU = new CPU();
        this.scheduler = new Scheduler();
    }
    
    createProcess(id, name) {
        const process = new Process(id, name);
        const pcb = new PCB(process);
        this.processes.push(pcb);
        console.log(`Process ${process.name} created with PID ${pcb.pid} (${pcb.state})`);
    }

    schedule() {
        const nextPCB = this.scheduler.selectNextProcess(this.processes);
        if (nextPCB) {
            this.CPU.execute(nextPCB);
        }
    }   
}