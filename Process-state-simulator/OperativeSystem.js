import CPU from './CPU.js';
import Disk from './Disk.js';
import Scheduler from './Schedulers/Scheduler.js';
import Process from './Process.js';
import PCB from './PCB.js';
import PROCESS_STATES from './PROCESS_STATES.js';

export default class OperativeSystem {
    constructor() {
        this.allProcesses = []; // List of all processes in the system
        this.blockedProcesses = []; //queue of blocked processes
        this.readyProcesses = []; //queue of ready processes
        //Update will have no problem because this arrays contain pointers to the same PCB objects in allProcesses

        this.CPU = new CPU();
        this.disk = new Disk();
        this.scheduler = new Scheduler();
    }
    
    createProcess(id, name, executionTime) {
        const process = new Process(id, name, executionTime, this.allProcesses.length); 
        // Priority is determined by the order of creation
        const pcb = new PCB(process);
        pcb.state = PROCESS_STATES.NEW;
        console.log(`Process ${process.name} with PID ${pcb.pid} is created and in NEW state.`);    
        pcb.state = PROCESS_STATES.READY;
        console.log(`Process ${process.name} with PID ${pcb.pid} is now in READY state.`);
        this.allProcesses.push(pcb);
    }

}