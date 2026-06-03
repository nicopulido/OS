/**
 * ProcessDTO.js - Data Transfer Object para procesos
 * 
 * Expone solo información de lectura del proceso sin exponer entidades del dominio
 */

export class ProcessDTO {
  constructor(pid, name, state, creationTime, allocatedMemory, segmentCount, faults) {
    this.pid = pid;
    this.name = name;
    this.state = state;
    this.creationTime = creationTime;
    this.allocatedMemory = allocatedMemory;
    this.segmentCount = segmentCount;
    this.faults = faults; // { pageFailts, segmentationFaults }
  }
}

export class ProcessListDTO {
  constructor(processes, totalProcesses, systemMemoryUsage) {
    this.processes = processes; // Array<ProcessDTO>
    this.totalProcesses = totalProcesses;
    this.systemMemoryUsage = systemMemoryUsage; // { used, total, percent }
  }
}
