/**
 * PCB.js (Process Control Block)
 * 
 * RESPONSABILIDAD: Bloque de control del proceso que almacena información
 * sobre estado del proceso, recursos de memoria, y estadísticas.
 * 
 * Contiene:
 * - Identificación del proceso
 * - Estado actual
 * - Referencia a tabla de segmentos
 * - Estadísticas de acceso
 * 
 * PATRÓN: Entity (mutabilidad controlada)
 * DEPENDENCIAS: Ninguna directa aquí; Process las proporciona
 * CONTENIDA POR: Process
 * UTILIZADA POR: OperatingSystem, Process
 */

class PCB {
  /**
   * Constructor
   * @param {number} pid - Process ID único
   */
  constructor(pid) {
    this.pid = pid;
    this.processName = '';
    this.state = 'CREATED'; // CREATED, READY, RUNNING, BLOCKED, TERMINATED
    
    // Memoria
    this.segmentTable = null;
    this.allocatedMemory = 0;
    this.usedMemory = 0;
    
    // Estadísticas
    this.pageFaults = 0;
    this.segmentationFaults = 0;
    this.creationTime = Date.now();
    this.lastAccessTime = Date.now();
  }

  /**
   * Obtiene el PID
   * @returns {number}
   */
  getPid() {
    return this.pid;
  }

  /**
   * Obtiene el nombre del proceso
   * @returns {string}
   */
  getProcessName() {
    return this.processName;
  }

  /**
   * Establece el nombre del proceso
   * @param {string} name
   */
  setProcessName(name) {
    this.processName = name;
  }

  /**
   * Obtiene el estado actual
   * @returns {string}
   */
  getState() {
    return this.state;
  }

  /**
   * Establece el estado
   * @param {string} newState
   */
  setState(newState) {
    this.state = newState;
    this.lastAccessTime = Date.now();
  }

  /**
   * Establece la tabla de segmentos
   * @param {SegmentTable} segmentTable
   */
  setSegmentTable(segmentTable) {
    this.segmentTable = segmentTable;
  }

  /**
   * Obtiene la tabla de segmentos
   * @returns {SegmentTable}
   */
  getSegmentTable() {
    return this.segmentTable;
  }

  /**
   * Registra asignación de memoria
   * @param {number} bytes
   */
  allocateMemory(bytes) {
    this.allocatedMemory += bytes;
  }

  /**
   * Registra liberación de memoria
   * @param {number} bytes
   */
  deallocateMemory(bytes) {
    this.allocatedMemory -= bytes;
    if (this.allocatedMemory < 0) {
      this.allocatedMemory = 0;
    }
  }

  /**
   * Obtiene memoria asignada
   * @returns {number}
   */
  getAllocatedMemory() {
    return this.allocatedMemory;
  }

  /**
   * Registra un page fault
   */
  recordPageFault() {
    this.pageFaults++;
  }

  /**
   * Obtiene cantidad de page faults
   * @returns {number}
   */
  getPageFaults() {
    return this.pageFaults;
  }

  /**
   * Registra un segmentation fault
   */
  recordSegmentationFault() {
    this.segmentationFaults++;
  }

  /**
   * Obtiene cantidad de segmentation faults
   * @returns {number}
   */
  getSegmentationFaults() {
    return this.segmentationFaults;
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `PCB {
  pid: ${this.pid},
  name: '${this.processName}',
  state: '${this.state}',
  allocatedMemory: ${this.allocatedMemory} bytes,
  pageFaults: ${this.pageFaults},
  segmentationFaults: ${this.segmentationFaults}
}`;
  }
}

export default PCB;
