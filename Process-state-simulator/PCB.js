import Process from './Process.js';
import PROCESS_STATES from './PROCESS_STATES.js';

export { Process, PROCESS_STATES };

class PCB {
    constructor(process) {
        this.pid = process.id;
        this.programCounter = 0;
    }

}