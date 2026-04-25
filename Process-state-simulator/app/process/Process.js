import BlockingEvent from './BlockingEvent.js';

export default class Process {
    constructor(id, name, executionTime, arrivalTime, heapSize, stackSize, textSize, dataSize, bssSize) {
        this.id = id; // Unique identifier for the process
        this.name = name; // Name of the process 
        this.executionTime = executionTime; // Total time required for the process to complete execution
        this.arrivalTime = arrivalTime // Time at which the process is initiated
        this.blockingEvents = []; // List of blocking events for the process
        this.totalBlockingDuration = 0; // Sum of all configured blocking durations
        this.totalSize = heapSize + stackSize + textSize + dataSize + bssSize; // Total memory size required by the process
        this.heapSize = heapSize; // Memory allocated for the process's heap
        this.stackSize = stackSize; // Memory allocated for the process's stack
        this.textSize = textSize; // Memory allocated for the process's text segment
        this.dataSize = dataSize; // Memory allocated for the process's data segment
        this.bssSize = bssSize; // Memory allocated for the process's BSS segment
    }

    addBlockingEvent(startTime, duration) {
        // Ensure that the blocking event's start time is within the execution time of the process
        // Only allow a maximum of 5 blocking events per process to prevent excessive blocking
        if(startTime < this.executionTime && startTime >= 0 && duration > 0 && this.blockingEvents.length < 5) {
            const event = new BlockingEvent(startTime, duration);
            this.blockingEvents.push(event);
            this.totalBlockingDuration += duration;
        } else {
            console.error(`Invalid blocking event start time: ${startTime}. It must be between 0 and the process's execution time.`);
        }
        this.blockingEvents.sort((a, b) => a.startTime - b.startTime); // Ensure blocking events are sorted by start time
    }
}