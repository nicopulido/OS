/**
 * ConfigureArchitectureService.js
 * 
 * RESPONSABILIDAD: Proveer información de arquitectura del sistema
 * Aislado del dominio, expone solo DTOs
 * 
 * RECIBE:
 * - Ninguno (configuración es inmutable y singleton)
 * 
 * DEVUELVE:
 * - Configuración de arquitectura en DTOs
 * 
 * DEPENDENCIAS:
 * - ArchitectureConfig (dominio)
 * 
 * API EXPUESTA:
 * - getArchitectureInfo() → Configuración del sistema
 * - getMemoryConfiguration() → Detalles de memoria
 * - getAddressingScheme() → Esquema de direccionamiento
 * - validateArchitecture() → Valida configuración
 */

import ArchitectureConfig from '../../domain/architecture/ArchitectureConfig.js';
import RAM from '../../domain/memory/RAM.js';
import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';

export class ConfigureArchitectureService {
  constructor() {
    this.config = ArchitectureConfig.getInstance();
  }

  /**
   * Reconfigura la arquitectura con nuevos valores
   * @param {number} logicalBits
   * @param {number} physicalBits
   * @param {number} pageSize
   */
  configure(logicalBits, physicalBits, pageSize) {
    // Resetear singletons dependientes antes de reconfigurar
    RAM.reset();
    OperatingSystem.reset();
    ArchitectureConfig.reconfigure(logicalBits, physicalBits, pageSize);
    this.config = ArchitectureConfig.getInstance();
  }

  /**
   * Obtiene información completa de la arquitectura
   * @returns {Object} Configuración de arquitectura
   */
  getArchitectureInfo() {
    return {
      addressingScheme: {
        logicalAddressBits: this.config.getLogicalAddressBits(),
        physicalAddressBits: this.config.getPhysicalAddressBits(),
        totalLogicalSpace: Math.pow(2, this.config.getLogicalAddressBits()),
        totalPhysicalSpace: Math.pow(2, this.config.getPhysicalAddressBits()),
      },
      segmentation: {
        segmentIdBits: this.config.getSegmentBits(),
        maxSegments: this.config.getMaxSegments(),
        segmentNamespace: {
          0: 'CODE',
          1: 'DATA',
          2: 'STACK',
          3: 'HEAP',
        },
      },
      paging: {
        pageIdBits: this.config.getPageBits(),
        offsetBits: this.config.getOffsetBits(),
        pageSize: this.config.getPageSize(),
        pagesPerSegment: this.config.getPagesPerSegment(),
      },
      memory: {
        totalRAM: this.config.getTotalRAMBytes(),
        totalFrames: this.config.getTotalFrames(),
        frameSize: this.config.getPageSize(),
      },
      tlb: {
        size: 16, // Hardcoded in MMU, could be configurable
      },
    };
  }

  /**
   * Obtiene configuración de memoria
   * @returns {Object}
   */
  getMemoryConfiguration() {
    return {
      totalRAM: {
        bytes: this.config.getTotalRAMBytes(),
        kilobytes: this.config.getTotalRAMBytes() / 1024,
        megabytes: this.config.getTotalRAMBytes() / (1024 * 1024),
      },
      pageSize: {
        bytes: this.config.getPageSize(),
        kilobytes: this.config.getPageSize() / 1024,
      },
      frames: {
        total: this.config.getTotalFrames(),
        size: this.config.getPageSize(),
      },
      segments: {
        maxPerProcess: this.config.getMaxSegments(),
        maxPages: this.config.getPagesPerSegment(),
      },
    };
  }

  /**
   * Obtiene esquema de direccionamiento
   * @returns {Object}
   */
  getAddressingScheme() {
    const masks = this.config.getMasks();
    return {
      logicalAddress: {
        bits: this.config.getLogicalAddressBits(),
        components: {
          segmentId: {
            bits: this.config.getSegmentBits(),
            mask: masks.segmentMask,
            shift: this.config.getOffsetBits() + this.config.getPageBits(),
          },
          pageId: {
            bits: this.config.getPageBits(),
            mask: masks.pageMask,
            shift: this.config.getOffsetBits(),
          },
          offset: {
            bits: this.config.getOffsetBits(),
            mask: masks.offsetMask,
            shift: 0,
          },
        },
        example: '0x00010102 → [Seg=0|Page=1|Offset=2]',
      },
      physicalAddress: {
        bits: this.config.getPhysicalAddressBits(),
        components: {
          frameNumber: {
            bits: this.config.getPhysicalAddressBits() - this.config.getOffsetBits(),
          },
          offset: {
            bits: this.config.getOffsetBits(),
          },
        },
        formula: 'physAddr = (frameNum * pageSize) + offset',
      },
    };
  }

  /**
   * Valida si la arquitectura está correctamente configurada
   * @returns {Object} Resultado de validación
   */
  validateArchitecture() {
    const errors = [];
    const warnings = [];

    // Validar bits de dirección
    const logicalBits = this.config.getLogicalAddressBits();
    const segmentBits = this.config.getSegmentBits();
    const pageBits = this.config.getPageBits();
    const offsetBits = this.config.getOffsetBits();

    if (segmentBits + pageBits + offsetBits !== logicalBits) {
      errors.push(
        `Invalid addressing scheme: segment(${segmentBits}) + page(${pageBits}) + offset(${offsetBits}) != logical(${logicalBits})`
      );
    }

    // Validar consistencia de tamaño de página
    if (Math.pow(2, offsetBits) !== this.config.getPageSize()) {
      errors.push(
        `Page size mismatch: 2^${offsetBits} != ${this.config.getPageSize()}`
      );
    }

    // Validar máximo de segmentos
    if (Math.pow(2, segmentBits) !== this.config.getMaxSegments()) {
      errors.push(
        `Max segments mismatch: 2^${segmentBits} != ${this.config.getMaxSegments()}`
      );
    }

    // Validar máximo de páginas
    if (Math.pow(2, pageBits) !== this.config.getPagesPerSegment()) {
      errors.push(
        `Max pages mismatch: 2^${pageBits} != ${this.config.getPagesPerSegment()}`
      );
    }

    // Validar RAM
    const expectedFrames = Math.pow(2, logicalBits) / this.config.getPageSize();
    const actualFrames = this.config.getTotalFrames();
    if (expectedFrames !== actualFrames) {
      warnings.push(
        `RAM frame count mismatch: expected ${expectedFrames}, got ${actualFrames}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      summary: {
        addressSpace: `${logicalBits}-bit logical → ${this.config.getPhysicalAddressBits()}-bit physical`,
        addressComponents: `${segmentBits}-bit segment | ${pageBits}-bit page | ${offsetBits}-bit offset`,
        memory: `${this.config.getTotalRAMBytes() / (1024 * 1024)}MiB in ${this.config.getTotalFrames()} frames`,
      },
    };
  }

  /**
   * Obtiene resumen de arquitectura
   * @returns {Object}
   */
  getSummary() {
    return {
      system: 'Segmented Paging Memory Simulator',
      architecture: `${this.config.getLogicalAddressBits()}-bit Segmentation + Paging`,
      memorySize: `${this.config.getTotalRAMBytes() / (1024 * 1024)}MiB`,
      pageSize: `${this.config.getPageSize() / 1024}KiB`,
      maxProcesses: 'Unlimited (by design)',
      maxSegmentsPerProcess: this.config.getMaxSegments(),
      maxPagesPerSegment: this.config.getPagesPerSegment(),
    };
  }
}
