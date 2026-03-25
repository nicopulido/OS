import PROCESS_STATES from './PROCESS_STATES.js';

export default class Scheduler {

    getNextProcess(readyProcesses) {
        // Default implementation - returns the first process in the ready queue
        return readyProcesses.length > 0 ? readyProcesses[0] : null;
    }
}