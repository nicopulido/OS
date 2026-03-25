export default class FCFSScheduler extends Scheduler {
    constructor() {
        super();
    }

    getNextProcess(readyProcesses) {
        // First-Come, First-Served scheduling algorithm
        let selectedPCB = readyProcesses[0] || null; // Select the first process in the ready queue
        for (let pcb of readyProcesses) {
            if (pcb.process.arrivalTime < selectedPCB.process.arrivalTime) {
                selectedPCB = pcb; // Update selected PCB if it has an earlier arrival time
            }
        }
        return selectedPCB;
    }
}