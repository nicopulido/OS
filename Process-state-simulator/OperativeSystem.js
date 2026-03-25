import CPU from './CPU.js';
import Disk from './Disk.js';
import Scheduler from './Scheduler.js';
import Process from './Process.js';
import PCB from './PCB.js';
import PROCESS_STATES from './PROCESS_STATES.js';

export default class OperativeSystem {
    constructor() {
        this.processes = [];
        this.CPU = new CPU();
        this.disk = new Disk();
        this.scheduler = new Scheduler();
    }
    
    createProcess(id, name, executionTime, initiationTime) {
        const process = new Process(id, name, executionTime, initiationTime);
        const pcb = new PCB(process);
        pcb.state = PROCESS_STATES.NEW;
        console.log(`Process ${process.name} with PID ${pcb.pid} is created and in NEW state.`);    
        pcb.state = PROCESS_STATES.READY;
        console.log(`Process ${process.name} with PID ${pcb.pid} is now in READY state.`);
        this.processes.push(pcb);
    }

}