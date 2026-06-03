/**
 * Frame.js
 * 
 * RESPONSABILIDAD: Un marco individual de memoria física (unidad de asignación).
 * 
 * Un marco es:
 * - Un rango de bytes contiguos en RAM
 * - Identificado por número único
 * - Con tamaño = pageSize
 * - Con estado: ocupado/libre
 * - Con información del propietario (processId, segmentId, pageNumber)
 * 
 * PATRÓN: Entity (identidad por frameNumber)
 * DEPENDENCIAS: Ninguna
 * CONTENIDA POR: RAM
 * UTILIZADA POR: RAM, MemoryManager
 */

class Frame {
  /**
   * Constructor
   * @param {number} frameNumber - ID del marco
   * @param {number} pageSize - Tamaño del marco en bytes
   */
  constructor(frameNumber, pageSize) {
    this.frameNumber = frameNumber;
    this.pageSize = pageSize;
    
    // Estado
    this.occupied = false;
    
    // Propietario (cuando está asignado)
    this.processId = null;
    this.segmentId = null;
    this.pageNumber = null;
    
    // Estadísticas
    this.allocationTime = null;
    this.accessCount = 0;
    this.lastAccessTime = null;
  }

  /**
   * Obtiene número de marco
   * @returns {number}
   */
  getFrameNumber() {
    return this.frameNumber;
  }

  /**
   * Obtiene tamaño del marco
   * @returns {number}
   */
  getPageSize() {
    return this.pageSize;
  }

  /**
   * Verifica si el marco está ocupado
   * @returns {boolean}
   */
  isOccupied() {
    return this.occupied;
  }

  /**
   * Asigna el marco a un proceso
   * @param {number} processId
   * @param {number} segmentId - Opcional
   * @param {number} pageNumber - Opcional
   */
  allocate(processId, segmentId = null, pageNumber = null) {
    if (this.occupied) {
      throw new Error(`Frame ${this.frameNumber} ya está ocupado`);
    }
    
    this.occupied = true;
    this.processId = processId;
    this.segmentId = segmentId;
    this.pageNumber = pageNumber;
    this.allocationTime = Date.now();
    this.accessCount = 0;
  }

  /**
   * Libera el marco
   */
  deallocate() {
    if (!this.occupied) {
      throw new Error(`Frame ${this.frameNumber} no está ocupado`);
    }
    
    this.occupied = false;
    this.processId = null;
    this.segmentId = null;
    this.pageNumber = null;
    this.allocationTime = null;
    this.accessCount = 0;
    this.lastAccessTime = null;
  }

  /**
   * Obtiene PID del propietario
   * @returns {number}
   */
  getProcessId() {
    return this.processId;
  }

  /**
   * Obtiene ID del segmento
   * @returns {number}
   */
  getSegmentId() {
    return this.segmentId;
  }

  /**
   * Obtiene número de página
   * @returns {number}
   */
  getPageNumber() {
    return this.pageNumber;
  }

  /**
   * Registra un acceso al marco
   */
  recordAccess() {
    this.accessCount++;
    this.lastAccessTime = Date.now();
  }

  /**
   * Obtiene cantidad de accesos
   * @returns {number}
   */
  getAccessCount() {
    return this.accessCount;
  }

  /**
   * Obtiene último tiempo de acceso
   * @returns {number}
   */
  getLastAccessTime() {
    return this.lastAccessTime;
  }

  /**
   * Obtiene tiempo desde última asignación
   * @returns {number} milisegundos
   */
  getAge() {
    if (!this.allocationTime) {
      return 0;
    }
    return Date.now() - this.allocationTime;
  }

  /**
   * Obtiene información del marco
   * @returns {object}
   */
  getInfo() {
    return {
      frameNumber: this.frameNumber,
      pageSize: this.pageSize,
      occupied: this.occupied,
      processId: this.processId,
      segmentId: this.segmentId,
      pageNumber: this.pageNumber,
      accessCount: this.accessCount,
      age: this.getAge()
    };
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `Frame {
  frameNumber: ${this.frameNumber},
  pageSize: ${this.pageSize},
  occupied: ${this.occupied},
  processId: ${this.processId},
  segmentId: ${this.segmentId},
  pageNumber: ${this.pageNumber}
}`;
  }
}

export default Frame;
