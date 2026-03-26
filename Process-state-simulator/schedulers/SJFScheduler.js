import Scheduler from './Scheduler.js';

export default class SJFScheduler extends Scheduler {
    constructor() {
        super();
    }

    getNextProcess(readyProcesses) {
        // Shortest Job First scheduling algorithm
        let selectedPCB = readyProcesses[0] || null;
        for (let pcb of readyProcesses) {
            if (pcb.process.executionTime < selectedPCB.process.executionTime) {
                selectedPCB = pcb; // Update selected PCB if it has a shorter execution time
            }else if (pcb.process.executionTime === selectedPCB.process.executionTime) {
                // If execution times are equal, use arrival time as a tiebreaker
                if (this.selectByArrivalTime(pcb, selectedPCB) < 0) {
                    selectedPCB = pcb;
                }
            }
        }
        return selectedPCB;
    }
}