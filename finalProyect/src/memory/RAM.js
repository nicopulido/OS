/**
 * RAM.js
 * 
 * RESPONSABILIDAD: Memoria física del sistema, organizada en marcos.
 * 
 * RAM es responsable de:
 * - Almacenar datos en bytes
 * - Gestionar disponibilidad de marcos
 * - Permitir lectura y escritura de datos
 * - Rastrear qué marcos están ocupados
 * 
 * PATRÓN: Singleton Entity
 * DEPENDENCIAS: Frame, ArchitectureConfig
 * UTILIZADA POR: MMU, AddressTranslator, MemoryManager
 */

import ArchitectureConfig from '../architecture/ArchitectureConfig.js';
import Frame from './Frame.js';

class RAM {
  static _instance = null;

  /**
   * Constructor privado (Singleton)
   * @private
   */
  constructor() {
    if (RAM._instance) {
      return RAM._instance;
    }

    this.config = ArchitectureConfig.getInstance();
    
    // Almacenamiento: Array de bytes para toda la RAM
    this.memory = new Uint8Array(this.config.getTotalRAMBytes());
    
    // Marcos: Map de número → Frame
    // Cada marco es una "vista" lógica sobre un rango de bytes en memory
    this.frames = new Map(); // Map<frameNumber, Frame>
    this._initializeFrames();
    
    // Estadísticas
    this.allocatedFrames = 0;

    RAM._instance = this;
  }

  /**
   * Inicializa todos los marcos
   * @private
   */
  _initializeFrames() {
    const pageSize = this.config.getPageSize();
    const totalFrames = this.config.getTotalFrames();

    for (let i = 0; i < totalFrames; i++) {
      const frame = new Frame(i, pageSize);
      this.frames.set(i, frame);
    }
  }

  /**
   * Obtiene la instancia singleton
   * @static
   * @returns {RAM}
   */
  static getInstance() {
    if (!RAM._instance) {
      new RAM();
    }
    return RAM._instance;
  }

  /**
   * Lee datos desde una dirección física
   * @param {PhysicalAddress} physicalAddress
   * @param {number} size - Bytes a leer
   * @returns {Uint8Array}
   */
  read(physicalAddress, size) {
    const startAddr = physicalAddress.getAddress();
    const endAddr = Math.min(startAddr + size, this.config.getTotalRAMBytes());
    
    if (startAddr >= this.config.getTotalRAMBytes()) {
      throw new Error(`Dirección física ${startAddr} fuera de rango`);
    }

    return this.memory.slice(startAddr, endAddr);
  }

  /**
   * Escribe datos en una dirección física
   * @param {PhysicalAddress} physicalAddress
   * @param {Uint8Array} data
   */
  write(physicalAddress, data) {
    const startAddr = physicalAddress.getAddress();
    const endAddr = startAddr + data.length;

    if (endAddr > this.config.getTotalRAMBytes()) {
      throw new Error(`Escritura fuera de rango: ${startAddr} - ${endAddr}`);
    }

    this.memory.set(data, startAddr);
  }

  /**
   * Lee un byte individual
   * @param {PhysicalAddress} physicalAddress
   * @returns {number}
   */
  readByte(physicalAddress) {
    const addr = physicalAddress.getAddress();
    if (addr >= this.config.getTotalRAMBytes()) {
      throw new Error(`Dirección física ${addr} fuera de rango`);
    }
    return this.memory[addr];
  }

  /**
   * Escribe un byte individual
   * @param {PhysicalAddress} physicalAddress
   * @param {number} byte
   */
  writeByte(physicalAddress, byte) {
    const addr = physicalAddress.getAddress();
    if (addr >= this.config.getTotalRAMBytes()) {
      throw new Error(`Dirección física ${addr} fuera de rango`);
    }
    if (byte < 0 || byte > 255) {
      throw new Error(`Byte ${byte} fuera de rango [0, 255]`);
    }
    this.memory[addr] = byte;
  }

  /**
   * Obtiene un marco por número
   * @param {number} frameNumber
   * @returns {Frame}
   */
  getFrame(frameNumber) {
    if (frameNumber < 0 || frameNumber >= this.config.getTotalFrames()) {
      throw new Error(`Frame ${frameNumber} fuera de rango`);
    }
    return this.frames.get(frameNumber);
  }

  /**
   * Asigna un marco (lo marca como ocupado)
   * @param {number} frameNumber
   * @param {number} processId
   */
  allocateFrame(frameNumber, processId) {
    const frame = this.getFrame(frameNumber);
    if (frame.isOccupied()) {
      throw new Error(`Frame ${frameNumber} ya está ocupado`);
    }
    frame.allocate(processId);
    this.allocatedFrames++;
  }

  /**
   * Desasigna un marco (lo marca como libre)
   * @param {number} frameNumber
   */
  deallocateFrame(frameNumber) {
    const frame = this.getFrame(frameNumber);
    if (!frame.isOccupied()) {
      throw new Error(`Frame ${frameNumber} no está ocupado`);
    }
    frame.deallocate();
    this.allocatedFrames--;
  }

  /**
   * Obtiene cantidad de marcos disponibles
   * @returns {number}
   */
  getAvailableFrames() {
    return this.config.getTotalFrames() - this.allocatedFrames;
  }

  /**
   * Obtiene cantidad de marcos asignados
   * @returns {number}
   */
  getAllocatedFrames() {
    return this.allocatedFrames;
  }

  /**
   * Obtiene cantidad total de marcos
   * @returns {number}
   */
  getTotalFrames() {
    return this.config.getTotalFrames();
  }

  /**
   * Obtiene utilización de memoria (0.0 a 1.0)
   * @returns {number}
   */
  getUtilization() {
    return this.allocatedFrames / this.config.getTotalFrames();
  }

  /**
   * Limpia un marco (pone todos bytes a 0)
   * @param {number} frameNumber
   */
  clearFrame(frameNumber) {
    const frame = this.getFrame(frameNumber);
    const startAddr = frameNumber * this.config.getPageSize();
    this.memory.fill(0, startAddr, startAddr + this.config.getPageSize());
  }

  /**
   * Obtiene información de utilización
   * @returns {object}
   */
  getMemoryInfo() {
    return {
      totalRAMBytes: this.config.getTotalRAMBytes(),
      totalFrames: this.config.getTotalFrames(),
      allocatedFrames: this.allocatedFrames,
      availableFrames: this.getAvailableFrames(),
      utilizationPercent: (this.getUtilization() * 100).toFixed(2)
    };
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `RAM {
  totalRAMBytes: ${this.config.getTotalRAMBytes()},
  totalFrames: ${this.config.getTotalFrames()},
  allocatedFrames: ${this.allocatedFrames},
  availableFrames: ${this.getAvailableFrames()},
  utilization: ${(this.getUtilization() * 100).toFixed(2)}%
}`;
  }
}

export default RAM;
