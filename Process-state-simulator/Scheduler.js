import PROCESS_STATES from './PROCESS_STATES.js';

export default class Scheduler {

    
    selectNextProcess(processes) {
        const readyProcesses = processes.filter(pcb => pcb.state === PROCESS_STATES.READY);
        if (readyProcesses.length === 0) {
            console.log("No processes in READY state to schedule.");
            return null;
        }
        // We use first-come, first-served (FCFS) scheduling because we have just seen this algorithm in class
        const nextProcess = readyProcesses.shift();
        console.log(`Scheduler selected process ${nextProcess.process.name} with PID ${nextProcess.pid} for execution.`);
        return nextProcess;
    }
}