import MemoryEvent from './MemoryEvent.js';

export default class Process {
	constructor(textSizeBytes = 0, dataSizeBytes = 0, bssSizeBytes = 0, heapSizeBytes = 0, stackSizeBytes = 0) {
		this.textSizeBytes = this.validateSize(textSizeBytes, 'textSizeBytes');
		this.dataSizeBytes = this.validateSize(dataSizeBytes, 'dataSizeBytes');
		this.bssSizeBytes = this.validateSize(bssSizeBytes, 'bssSizeBytes');
		this.heapSizeBytes = this.validateSize(heapSizeBytes, 'heapSizeBytes');
		this.stackSizeBytes = this.validateSize(stackSizeBytes, 'stackSizeBytes');
		this.memoryOccupationEvents = [];
	}

	addMemoryOccupationEvent(entryTime, duration) {
		const newEvent = new MemoryEvent(entryTime, duration);

		for (const existingEvent of this.memoryOccupationEvents) {
			if (newEvent.overlapsWithEvent(existingEvent)) {
				throw new Error(
					`Cannot add memory occupation event. Event overlaps with existing event at the same time. ` +
					`New event: [${newEvent.entryTime}, ${newEvent.getExitTime()}), ` +
					`Existing event: [${existingEvent.entryTime}, ${existingEvent.getExitTime()})`
				);
			}
		}

		this.memoryOccupationEvents.push(newEvent);
		return newEvent;
	}

	validateSize(value, fieldName) {
		if (!Number.isFinite(value) || value < 0) {
			throw new Error(`${fieldName} must be a non-negative finite number.`);
		}

		return value;
	}
}
