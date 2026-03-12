import Process from './Process.js';
import PROCESS_STATES from './PROCESS_STATES.js';

export { Process, PROCESS_STATES };

class PCB {
    constructor(process) {
        this.pid = process.id;
        this.state =  PROCESS_STATES.NEW; 
        this.programCounter = 0;
        this.registers = {};
    }

}