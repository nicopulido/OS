/**
 * ArchitectureConfig.js
 * 
 * RESPONSABILIDAD: Singleton que define la configuración de la arquitectura
 * de memoria (bits, tamaños, límites).
 * 
 * Esta clase centraliza toda la configuración relacionada con:
 * - Bits de direccionamiento lógico y físico
 * - Tamaño de página
 * - Cantidad de segmentos y páginas
 * - Cantidad de marcos disponibles
 * 
 * PATRÓN: Singleton inmutable
 * DEPENDENCIAS: Ninguna
 * UTILIZADO POR: LogicalAddress, PhysicalAddress, MMU, RAM, etc.
 */

class ArchitectureConfig {
  static _instance = null;

  /**
   * Constructor privado (Singleton)
   * @private
   */
  constructor() {
    if (ArchitectureConfig._instance) {
      return ArchitectureConfig._instance;
    }

    // CONFIGURACIÓN DE DIRECCIONAMIENTO
    this.logicalAddressBits = 32;      // Bits totales de dirección lógica
    this.physicalAddressBits = 32;     // Bits totales de dirección física

    // CONFIGURACIÓN DE SEGMENTACIÓN
    this.maxSegments = 256;            // 2^8 segmentos
    this.segmentBits = 8;              // Bits para ID de segmento

    // CONFIGURACIÓN DE PAGINACIÓN
    this.pageSize = 4096;              // Bytes por página (4 KiB)
    this.offsetBits = 12;              // Bits para offset (log2(4096) = 12)
    this.pageBits = 8;                 // Bits para ID de página (8 bits)
    this.pagesPerSegment = 256;        // 2^8 páginas por segmento

    // MEMORIA FÍSICA
    this.totalRAMBytes = 16777216;     // 16 MiB
    this.totalFrames = this.totalRAMBytes / this.pageSize; // 4096 marcos

    Object.freeze(this);
    ArchitectureConfig._instance = this;
  }

  /**
   * Obtiene la instancia singleton
   * @static
   * @returns {ArchitectureConfig} instancia única
   */
  static getInstance() {
    if (!ArchitectureConfig._instance) {
      new ArchitectureConfig();
    }
    return ArchitectureConfig._instance;
  }

  /**
   * Getters de configuración
   */
  getLogicalAddressBits() {
    return this.logicalAddressBits;
  }

  getPhysicalAddressBits() {
    return this.physicalAddressBits;
  }

  getPageSize() {
    return this.pageSize;
  }

  getSegmentBits() {
    return this.segmentBits;
  }

  getPageBits() {
    return this.pageBits;
  }

  getOffsetBits() {
    return this.offsetBits;
  }

  getMaxSegments() {
    return this.maxSegments;
  }

  getPagesPerSegment() {
    return this.pagesPerSegment;
  }

  getTotalRAMBytes() {
    return this.totalRAMBytes;
  }

  getTotalFrames() {
    return this.totalFrames;
  }

  /**
   * Calcula máscaras binarias para extracción de bits
   * @returns {object} máscaras {segmentMask, pageMask, offsetMask}
   */
  getMasks() {
    return {
      segmentMask: (1 << this.segmentBits) - 1,
      pageMask: (1 << this.pageBits) - 1,
      offsetMask: (1 << this.offsetBits) - 1
    };
  }

  /**
   * Representación en texto
   */
  toString() {
    return `ArchitectureConfig {
  logicalAddressBits: ${this.logicalAddressBits},
  physicalAddressBits: ${this.physicalAddressBits},
  pageSize: ${this.pageSize} bytes,
  segmentBits: ${this.segmentBits},
  pageBits: ${this.pageBits},
  offsetBits: ${this.offsetBits},
  maxSegments: ${this.maxSegments},
  pagesPerSegment: ${this.pagesPerSegment},
  totalRAMBytes: ${this.totalRAMBytes},
  totalFrames: ${this.totalFrames}
}`;
  }
}

export default ArchitectureConfig;
