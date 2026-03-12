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
        if (this.CPU.currentPCB) {
            return this.CPU.currentPCB;
        }

        const nextPCB = this.scheduler.selectNextProcess(this.processes);
        if (nextPCB) {
            nextPCB.state = PROCESS_STATES.RUNNING;
            console.log(`Process ${nextPCB.pid} is now in RUNNING state.`);
            this.CPU.execute(nextPCB);
        }

        return nextPCB;

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

    startDiskRead() {
        if (this.disk.currentPCB) {
            console.log(`Disk is already reading for process ${this.disk.currentPCB.pid}.`);
            return null;
        }

        if (!this.CPU.currentPCB) {
            console.log('No process is currently running to start a disk read.');
            return null;
        }

        const pcb = this.CPU.currentPCB;
        pcb.state = PROCESS_STATES.WAITING;
        this.CPU.currentPCB = null;
        this.disk.startRead(pcb);

        console.log(`Process ${pcb.pid} requested disk read and moved to WAITING state.`);
        this.schedule();
        return pcb;
    }

    completeDiskRead() {
        if (!this.disk.currentPCB) {
            console.log('No disk read is currently active.');
            return null;
        }

        const pcb = this.disk.completeRead();
        pcb.state = PROCESS_STATES.READY;

        console.log(`Disk read for process ${pcb.pid} completed. Process is now in READY state.`);

        if (!this.CPU.currentPCB) {
            this.schedule();
        }

        return pcb;
    }
    
    terminateProcess() {
        if (this.CPU.currentPCB) {
            const terminatedPid = this.CPU.currentPCB.pid;
            this.CPU.currentPCB.state = PROCESS_STATES.TERMINATED;
            console.log(`Process ${terminatedPid} is now in TERMINATED state.`);

            const index = this.processes.findIndex(p => p.pid === terminatedPid);
            if (index !== -1) {
                this.processes.splice(index, 1);
                console.log(`Process ${terminatedPid} removed from process table.`);
            }

            this.CPU.currentPCB = null;
            this.schedule();
        } else {
            console.log("No process is currently running to terminate.");
        }
    }

    changeProcess(pid) {
        const pcb = this.processes.find(p => p.pid === pid);
        if (pcb) {
            if (pcb.state === PROCESS_STATES.TERMINATED) {
                console.log(`Process ${pcb.pid} is TERMINATED and cannot run.`);
                return;
            }

            if (pcb.state === PROCESS_STATES.WAITING) {
                console.log(`Process ${pcb.pid} is in WAITING state and cannot run.`);
                return;
            }

            if (this.CPU.currentPCB && this.CPU.currentPCB.pid === pcb.pid) {
                console.log(`Process ${pcb.pid} is already RUNNING.`);
                return;
            }

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