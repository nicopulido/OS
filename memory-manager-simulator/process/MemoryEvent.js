export default class MemoryEvent {
	constructor(entryTime, duration) {
		this.entryTime = this.validateTime(entryTime, 'entryTime');
		this.duration = this.validateDuration(duration, 'duration');
	}

	validateTime(value, fieldName) {
		if (!Number.isFinite(value) || value < 0) {
			throw new Error(`${fieldName} must be a non-negative finite number.`);
		}

		return value;
	}

	validateDuration(value, fieldName) {
		if (!Number.isFinite(value) || value <= 0) {
			throw new Error(`${fieldName} must be a finite number greater than zero.`);
		}

		return value;
	}

	getExitTime() {
		return this.entryTime + this.duration;
	}

	overlapsWithEvent(otherEvent) {
		const thisStart = this.entryTime;
		const thisEnd = this.getExitTime();
		const otherStart = otherEvent.entryTime;
		const otherEnd = otherEvent.getExitTime();

		return !(thisEnd <= otherStart || otherEnd <= thisStart);
	}
}
