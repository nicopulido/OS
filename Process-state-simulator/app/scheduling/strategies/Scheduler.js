export default class Scheduler {

    getNextProcess(readyProcesses) {
        // Default implementation - returns the first process in the ready queue
        return readyProcesses.length > 0 ? readyProcesses[0] : null;
    }

    // Returns a negative value if pcbA arrives before pcbB, positive if pcbA arrives after pcbB, and 0 if they arrive at the same time
    selectByArrivalTime(pcbA, pcbB) {
        // Comparison function for sorting by arrival time
        return pcbA.process.arrivalTime - pcbB.process.arrivalTime;
    }
}