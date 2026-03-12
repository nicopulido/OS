class OperativeSystem {
    constructor() {
        this.processes = [];
        this.CPU = new CPU();
        this.scheduler = new Scheduler();
    }
    
    createProcess(id, name) {
        const process = new Process(id, name);
        const pcb = new PCB(process);
        pcb.state = PROCESS_STATES.NEW;
        console.log(`Process ${process.name} with PID ${pcb.pid} is created and in NEW state.`);    
        pcb.state = PROCESS_STATES.READY;
        console.log(`Process ${process.name} with PID ${pcb.pid} is now in READY state.`);
        this.processes.push(pcb);

    }

    schedule() {
        const nextPCB = this.scheduler.selectNextProcess(this.processes);
        if (nextPCB) {
            this.CPU.execute(nextPCB);
        }

    }
}