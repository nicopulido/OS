import PROCESS_STATES from './PROCESS_STATES.js';

export default class Scheduler {

    
    selectNextProcess(processes) {
        const nextProcess = processes.find(
            (pcb) => pcb.state === PROCESS_STATES.READY
        );

        if (!nextProcess) {
            console.log('No processes in READY state to schedule.');
            return null;
        }

        console.log(
            `Scheduler selected process ${nextProcess.process.name} with PID ${nextProcess.pid} for execution.`
        );
        return nextProcess;
    }
}