/**
 * Process.js
 * 
 * RESPONSABILIDAD: Representa un proceso en ejecución en el sistema operativo.
 * 
 * Contiene:
 * - Identificador único (PID)
 * - Bloque de control (PCB)
 * - Tabla de segmentos
 * - Métodos para acceso a memoria
 * 
 * PATRÓN: Entity (identidad por PID)
 * DEPENDENCIAS: PCB, SegmentTable
 * CREADA POR: OperatingSystem
 * UTILIZADA POR: OperatingSystem, MMU
 */

import PCB from '../operating-system/PCB.js';

class Process {
  /**
   * Constructor
   * @param {number} pid - Process ID único
   * @param {string} name - Nombre del proceso
   */
  constructor(pid, name) {
    this.pid = pid;
    this.name = name;
    this.pcb = new PCB(pid);
    this.pcb.setProcessName(name);
    this.segmentTable = null; // Se asigna después
    this.creationTime = Date.now();
  }

  /**
   * Obtiene el PID
   * @returns {number}
   */
  getPid() {
    return this.pid;
  }

  /**
   * Obtiene el nombre
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Obtiene el PCB
   * @returns {PCB}
   */
  getPCB() {
    return this.pcb;
  }

  /**
   * Establece la tabla de segmentos
   * @param {SegmentTable} segmentTable
   */
  setSegmentTable(segmentTable) {
    this.segmentTable = segmentTable;
    this.pcb.setSegmentTable(segmentTable);
  }

  /**
   * Obtiene la tabla de segmentos
   * @returns {SegmentTable}
   */
  getSegmentTable() {
    return this.segmentTable;
  }

  /**
   * Obtiene estado del proceso
   * @returns {string}
   */
  getState() {
    return this.pcb.getState();
  }

  /**
   * Establece estado del proceso
   * @param {string} state
   */
  setState(state) {
    this.pcb.setState(state);
  }

  /**
   * Lee memoria del proceso
   * @param {LogicalAddress} logicalAddress
   * @param {number} size
   * @returns {Uint8Array}
   */
  readMemory(logicalAddress, size) {
    // TODO: Implementar lectura
    // - Usar MMU para traducir dirección
    // - Leer desde RAM
    throw new Error('readMemory no implementado aún');
  }

  /**
   * Escribe en memoria del proceso
   * @param {LogicalAddress} logicalAddress
   * @param {Uint8Array} data
   */
  writeMemory(logicalAddress, data) {
    // TODO: Implementar escritura
    // - Usar MMU para traducir dirección
    // - Escribir en RAM
    throw new Error('writeMemory no implementado aún');
  }

  /**
   * Obtiene información del proceso
   * @returns {object}
   */
  getInfo() {
    return {
      pid: this.pid,
      name: this.name,
      state: this.getState(),
      allocatedMemory: this.pcb.getAllocatedMemory(),
      pageFaults: this.pcb.getPageFaults(),
      segmentationFaults: this.pcb.getSegmentationFaults(),
      creationTime: this.creationTime
    };
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `Process {
  pid: ${this.pid},
  name: '${this.name}',
  state: '${this.getState()}',
  allocatedMemory: ${this.pcb.getAllocatedMemory()} bytes
}`;
  }
}

export default Process;
