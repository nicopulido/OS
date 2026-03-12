import PROCESS_STATES from './PROCESS_STATES.js';

export default class Scheduler {

    
    selectNextProcess(processes) {
        const readyIndex = processes.findIndex(
            (pcb) => pcb.state === PROCESS_STATES.READY
        );

        if (readyIndex === -1) {
            console.log('No processes in READY state to schedule.');
            return null;
        }
        
        const [nextProcess] = processes.splice(readyIndex, 1);

        console.log(
            `Scheduler selected process ${nextProcess.process.name} with PID ${nextProcess.pid} for execution.`
        );
        return nextProcess;
    }
}