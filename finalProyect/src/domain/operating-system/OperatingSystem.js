/**
 * OperatingSystem.js
 * 
 * RESPONSABILIDAD: Orquestador principal que gestiona procesos, memoria
 * y traducción de direcciones.
 * 
 * Es el punto de entrada para:
 * - Crear y terminar procesos
 * - Acceder a memoria de procesos
 * - Gestionar recursos del sistema
 * 
 * PATRÓN: Singleton Orchestrator
 * DEPENDENCIAS: RAM, MMU, ProcessRepository
 * UTILIZADO POR: Aplicación principal
 */

import RAM from '../memory/RAM.js';
import MMU from '../mmu/MMU.js';

class OperatingSystem {
  static _instance = null;

  /**
   * Constructor privado (Singleton)
   * @private
   */
  constructor() {
    if (OperatingSystem._instance) {
      return OperatingSystem._instance;
    }

    this.nextPid = 1;
    this.processes = new Map(); // Map<pid, Process>
    this.runningProcess = null;
    
    // Componentes principales
    this.ram = RAM.getInstance();
    this.mmu = new MMU();

    // Estadísticas globales
    this.totalProcessesCreated = 0;
    this.totalProcessesTerminated = 0;

    OperatingSystem._instance = this;
  }

  /**
   * Obtiene la instancia singleton
   * @static
   * @returns {OperatingSystem}
   */
  static getInstance() {
    if (!OperatingSystem._instance) {
      new OperatingSystem();
    }
    return OperatingSystem._instance;
  }

  /**
   * Resetea el singleton
   * @static
   */
  static reset() {
    OperatingSystem._instance = null;
  }

  /**
   * Registra un proceso en el sistema (usado por servicios de aplicación)
   * @param {Process} process - Proceso a registrar
   */
  registerProcess(process) {
    const pid = process.getPid();
    this.processes.set(pid, process);
    this.totalProcessesCreated++;
  }

  /**
   * Remueve un proceso del sistema
   * @param {number} pid
   */
  removeProcess(pid) {
    if (this.processes.has(pid)) {
      this.processes.delete(pid);
      this.totalProcessesTerminated++;
      
      if (this.runningProcess?.getPid() === pid) {
        this.runningProcess = null;
      }
    }
  }

  /**
   * Obtiene el siguiente PID
   * @returns {number}
   */
  getNextPid() {
    return this.nextPid++;
  }

  /**
   * Crea un nuevo proceso
   * @param {string} processName - Nombre del proceso
   * @returns {Process} - El proceso creado
   */
  createProcess(processName) {
    // TODO: Implementar creación de proceso
    // - Generar PID
    // - Crear PCB
    // - Crear SegmentTable
    // - Registrar en this.processes
    throw new Error('createProcess no implementado aún');
  }

  /**
   * Termina un proceso
   * @param {number} pid
   */
  terminateProcess(pid) {
    // TODO: Implementar terminación
    // - Obtener proceso
    // - Liberar memoria
    // - Remover de procesos activos
    throw new Error('terminateProcess no implementado aún');
  }

  /**
   * Obtiene proceso por PID
   * @param {number} pid
   * @returns {Process}
   */
  getProcess(pid) {
    return this.processes.get(pid) || null;
  }

  /**
   * Obtiene todos los procesos
   * @returns {Array<Process>}
   */
  getAllProcesses() {
    return Array.from(this.processes.values());
  }

  /**
   * Cambia el proceso actual en ejecución
   * @param {number} pid
   */
  switchToProcess(pid) {
    const process = this.getProcess(pid);
    if (!process) {
      throw new Error(`Proceso ${pid} no encontrado`);
    }
    this.runningProcess = process;
  }

  /**
   * Obtiene el proceso actual
   * @returns {Process}
   */
  getRunningProcess() {
    return this.runningProcess;
  }

  /**
   * Lee memoria del proceso actual
   * @param {LogicalAddress} logicalAddress - Dirección lógica
   * @param {number} size - Cantidad de bytes a leer
   * @returns {Uint8Array}
   */
  readMemory(logicalAddress, size) {
    if (!this.runningProcess) {
      throw new Error('No hay proceso en ejecución');
    }
    
    // TODO: Implementar lectura
    // - Validar dirección
    // - Traducir dirección lógica a física
    // - Leer desde RAM
    throw new Error('readMemory no implementado aún');
  }

  /**
   * Escribe en memoria del proceso actual
   * @param {LogicalAddress} logicalAddress - Dirección lógica
   * @param {Uint8Array} data - Datos a escribir
   */
  writeMemory(logicalAddress, data) {
    if (!this.runningProcess) {
      throw new Error('No hay proceso en ejecución');
    }
    
    // TODO: Implementar escritura
    // - Validar dirección
    // - Traducir dirección lógica a física
    // - Escribir en RAM
    throw new Error('writeMemory no implementado aún');
  }

  /**
   * Obtiene información del sistema
   * @returns {object}
   */
  getSystemInfo() {
    return {
      totalProcesses: this.processes.size,
      totalProcessesCreated: this.totalProcessesCreated,
      totalProcessesTerminated: this.totalProcessesTerminated,
      runningProcess: this.runningProcess ? this.runningProcess.getPid() : null,
      ramUtilization: this.ram.getUtilization(),
      totalFrames: this.ram.getTotalFrames(),
      allocatedFrames: this.ram.getAllocatedFrames()
    };
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `OperatingSystem {
  processes: ${this.processes.size},
  runningProcess: ${this.runningProcess ? this.runningProcess.getPid() : 'none'},
  ramUtilization: ${(this.ram.getUtilization() * 100).toFixed(2)}%
}`;
  }
}

export default OperatingSystem;
