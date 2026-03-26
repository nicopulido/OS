import CPU from './CPU.js';
import Disk from './Disk.js';
import Scheduler from './schedulers/Scheduler.js';
import Process from './process/Process.js';
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

    setScheduler(scheduler) {
        this.scheduler = scheduler;
    }

    tick() {
        // Update the state of blocked processes
        this.updateBlockedProcesses();
        // Simulate the execution of the current process on the CPU
        this.CPU.execute();
        // Update the state of the running process and handle blocking or termination
        this.updateRunningProcess();

        // If the CPU is idle, select the next process to run
        if (!this.CPU.currentPCB) {
            this.schedule();
        }
    }

    updateBlockedProcesses() {
        for (let pcb of this.blockedProcesses) {
            pcb.updateRemainingBlockedTime(1); // Simulate the passage of time for blocked processes
            if (pcb.remainingblockedTime <= 0) {
                pcb.state = PROCESS_STATES.READY;
                //Update the state of the PCB to READY and move it back to the ready queue
                this.readyProcesses.push(pcb);
                console.log(`Process ${pcb.process.name} with PID ${pcb.pid} has finished blocking and is now in READY state.`);
            }
        }

        //remove processes that are no longer blocked from the blockedProcesses array

        this.blockedProcesses = this.blockedProcesses.filter(pcb => pcb.state === PROCESS_STATES.BLOCKED);
    }

    updateRunningProcess() {
        const runningPCB = this.CPU.currentPCB;
        if(runningPCB.programCounter == runningPCB.process.blockingEvents[0]?.startTime) {
            // If the process has a blocking event at the current program counter, move it to the blocked queue
            const blockedPCB = runningPCB;
            blockedPCB.state = PROCESS_STATES.BLOCKED;
            blockedPCB.remainingblockedTime = blockedPCB.process.blockingEvents[0].duration;
            this.blockedProcesses.push(blockedPCB);
            console.log(`Process ${blockedPCB.process.name} with PID ${blockedPCB.pid} is now BLOCKED for ${blockedPCB.remainingblockedTime} time units.`);
            this.CPU.currentPCB = null; // Remove the process from the CPU

            // Remove the blocking event that has just been triggered
            blockedPCB.process.blockingEvents.shift();
            //The remaining blocked time is already set to the duration of the blocking event, so we just need to remove it from the list of blocking events
        }else if(runningPCB.remainingExecutionTime <= 0) {
            // If the process has finished execution, move it to the terminated state
            runningPCB.state = PROCESS_STATES.TERMINATED;
            console.log(`Process ${runningPCB.process.name} with PID ${runningPCB.pid} has finished execution and is now in TERMINATED state.`);
            this.CPU.currentPCB = null; // Remove the process from the CPU
        }
    }

    schedule() {
        const nextPCB = this.scheduler.getNextProcess(this.readyProcesses);
            if (nextPCB) {
                this.CPU.assignProcess(nextPCB);
                nextPCB.state = PROCESS_STATES.RUNNING;
                console.log(`Process ${nextPCB.process.name} with PID ${nextPCB.pid} is now RUNNING on the CPU.`);
                this.readyProcesses = this.readyProcesses.filter(pcb => pcb.pid !== nextPCB.pid);
            } else {
                console.log("No processes are ready to run on the CPU.");
            }
    }
}