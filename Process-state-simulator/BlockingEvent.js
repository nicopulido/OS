export default class BlockingEvent {
    constructor(startTime, duration) {
        this.startTime = startTime; // Time at which the blocking event starts in the process's execution timeline
        this.duration = duration; // Duration of the blocking event
    }

    get endTime() {
        return this.startTime + this.duration; // Time at which the blocking event ends
    }
}