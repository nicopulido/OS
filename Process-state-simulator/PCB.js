import PROCESS_STATES from './PROCESS_STATES.js';

export default class PCB {
    constructor(process) {
        this.process = process;
        this.pid = process.id;
        this.state = PROCESS_STATES.NEW;
        this.programCounter = 0;
        this.remainingExecutionTime = process.executionTime;
        this.remainingblockedTime = 0; // Time left for the process to remain blocked
        this.totalReadyTime = 0; // Total ticks spent waiting in READY state
        this.finishedAtTick = null; // Simulation tick when process reaches TERMINATED
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

    incrementReadyTime(time = 1) {
        this.totalReadyTime += Math.max(0, time);
    }

    setFinishedAtTick(tick) {
        if (this.finishedAtTick === null) {
            this.finishedAtTick = tick;
        }
    }
    
}