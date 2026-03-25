import PROCESS_STATES from './PROCESS_STATES.js';

export default class PCB {
    constructor(process) {
        this.process = process;
        this.pid = process.id;
        this.state = PROCESS_STATES.NEW;
        this.programCounter = 0;
        this.remainingExecutionTime = process.executionTime;
    }
    
    updateState(newState) {
        this.state = newState;
    }

    updateRemainingExecutionTime(time) {
        this.remainingExecutionTime = Math.max(0, this.remainingExecutionTime - time);
        // Ensure remaining execution time does not go below zero
    }
}