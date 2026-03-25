export default class Process {
    constructor(id, name, executionTime, initiationTime, ) {
        this.id = id; // Unique identifier for the process
        this.name = name; // Name of the process 
        this.executionTime = executionTime; // Total time required for the process to complete execution
        this.initiationTime = initiationTime; // Time at which the process is initiated
    }
}