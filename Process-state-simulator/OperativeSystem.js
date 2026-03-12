import CPU from './CPU.js';
import Scheduler from './Scheduler.js';
import Process from './Process.js';
import PCB from './PCB.js';
import PROCESS_STATES from './PROCESS_STATES.js';

export default class OperativeSystem {
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
            nextPCB.state = PROCESS_STATES.RUNNING;
            console.log(`Process ${nextPCB.pid} is now in RUNNING state.`);
            this.CPU.execute(nextPCB);
        }

    }

    setProcessWaiting() {
        if (this.CPU.currentPCB) {
            this.CPU.currentPCB.state = PROCESS_STATES.WAITING;
            console.log(`Process ${this.CPU.currentPCB.pid} is now in WAITING state.`);
            this.CPU.currentPCB = null;
        } else {
            console.log("No process is currently running to set to WAITING state.");
        }
    }
    
    terminateProcess() {
        if (this.CPU.currentPCB) {
            this.CPU.currentPCB.state = PROCESS_STATES.TERMINATED;
            console.log(`Process ${this.CPU.currentPCB.pid} is now in TERMINATED state.`);
            this.CPU.currentPCB = null;
        } else {
            console.log("No process is currently running to terminate.");
        }
    }

    changeProcess(pid) {
        const pcb = this.processes.find(p => p.pid === pid);
        if (pcb) {
            if (this.CPU.currentPCB) {
                this.CPU.currentPCB.state = PROCESS_STATES.READY;
                console.log(`Process ${this.CPU.currentPCB.pid} is now in READY state.`);
            }
            pcb.state = PROCESS_STATES.RUNNING;
            console.log(`Process ${pcb.pid} is now in RUNNING state.`);
            this.CPU.execute(pcb);
        } else {
            console.log(`No process found with PID ${pid}.`);
        }
    }
}