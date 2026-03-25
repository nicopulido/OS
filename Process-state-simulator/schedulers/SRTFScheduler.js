export default class SRTFScheduler extends Scheduler {
    constructor() {
        super();
    }
    
    getNextProcess(readyProcesses) {
        // Shortest Remaining Time First scheduling algorithm
        let selectedPCB = readyProcesses[0] || null;
        for (let pcb of readyProcesses) {
            if (pcb.remainingExecutionTime < selectedPCB.remainingExecutionTime) {
                selectedPCB = pcb; // Update selected PCB if it has less remaining execution time
            } else if (pcb.remainingExecutionTime === selectedPCB.remainingExecutionTime) {
                if (this.selectByArrivalTime(pcb, selectedPCB) < 0) {
                    selectedPCB = pcb;
                }
            }
        }
        return selectedPCB;
    }
}