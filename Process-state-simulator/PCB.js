import PROCESS_STATES from './PROCESS_STATES.js';

export default class PCB {
    constructor(process) {
        this.process = process;
        this.pid = process.id;
        this.state = PROCESS_STATES.NEW;
        this.programCounter = 0;
        this.remainingExecutionTime = process.executionTime;
        this.remainingblockedTime = 0; // Time left for the process to remain blocked
    }

    updateState(newState) {
        this.state = newState;
    }

    updateRemainingExecutionTime(time) {
        this.remainingExecutionTime = Math.max(0, this.remainingExecutionTime - time);
        // Ensure remaining execution time does not go below zero
    }

    updateRemainingBlockedTime(time) {
        this.remainingblockedTime = Math.max(0, this.remainingblockedTime - time);
        // Ensure remaining blocked time does not go below zero
    }
    
}