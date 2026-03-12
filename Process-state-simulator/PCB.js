import PROCESS_STATES from './PROCESS_STATES.js';

export default class PCB {
    constructor(process) {
        this.process = process;
        this.pid = process.id;
        this.state = PROCESS_STATES.NEW;
        this.programCounter = 0;
    }
}