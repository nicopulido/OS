export default class Process {
    constructor(id, name, executionTime, initiationTime) {
        this.id = id; // Unique identifier for the process
        this.name = name; // Name of the process 
        this.executionTime = executionTime; // Total time required for the process to complete execution
        this.initiationTime = initiationTime; // Time at which the process is initiated
        this.blockingEvents = []; // List of blocking events for the process
    }

    addBlockingEvent(startTime, duration) {
        // Ensure that the blocking event's start time is within the execution time of the process
        if(startTime < this.executionTime && startTime >= 0) {
            const event = new BlockingEvent(startTime, duration);
            this.blockingEvents.push(event);
        } else {
            console.error(`Invalid blocking event start time: ${startTime}. It must be between 0 and the process's execution time.`);
        }
    }
}