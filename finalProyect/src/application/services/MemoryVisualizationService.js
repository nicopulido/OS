/**
 * MemoryVisualizationService.js
 * 
 * RESPONSABILIDAD: Proporcionar datos de visualización de memoria física
 * 
 * RECIBE:
 * - Ninguno (accede a estado del dominio)
 * 
 * DEVUELVE:
 * - MemoryLayoutDTO con estado de todos los marcos
 * 
 * DEPENDENCIAS:
 * - RAM, OperatingSystem (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - getMemoryLayout() → Visualización completa
 * - getMemoryStatus() → Resumen de uso
 * - getFrameInfo(frameNumber) → Detallesframa
 * - getProcessMemoryMap(pid) → Mapeo de procesos
 * - getFragmentation() → Análisis de fragmentación
 */

import RAM from '../../domain/memory/RAM.js';
import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class MemoryVisualizationService {
  constructor() {
    this.ram = RAM.getInstance();
    this.os = OperatingSystem.getInstance();
  }

  /**
   * Obtiene el layout completo de memoria
   * @returns {MemoryLayoutDTO}
   */
  getMemoryLayout() {
    return DomainMapper.memoryLayoutToDTO(this.ram);
  }

  /**
   * Obtiene estado de memoria (resumen)
   * @returns {RAMStatusDTO}
   */
  getMemoryStatus() {
    return DomainMapper.ramStatusToDTO(this.ram);
  }

  /**
   * Obtiene información de un marco específico
   * @param {number} frameNumber
   * @returns {Object}
   */
  getFrameInfo(frameNumber) {
    try {
      const frame = this.ram.frames?.get(frameNumber);
      if (!frame) {
        throw new Error(`Frame ${frameNumber} not found`);
      }

      const frameDTO = DomainMapper.frameToDTO(frame, frameNumber);
      const info = frame.getInfo?.() || {};

      return {
        frameDTO: frameDTO,
        details: {
          address: frameNumber * this.ram.config.getPageSize(),
          sizeBytes: this.ram.config.getPageSize(),
          accessCount: frame.getAccessCount?.() || 0,
          lastAccessTime: frame.getLastAccessTime?.() || null,
        },
        error: null,
      };
    } catch (error) {
      return {
        frameDTO: null,
        details: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene mapeo de memoria de un proceso
   * @param {number} pid
   * @returns {Object}
   */
  getProcessMemoryMap(pid) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error(`Process ${pid} has no segment table`);
      }

      const segments = segmentTable.getAllSegments?.() || [];
      const memoryMap = [];

      for (let segIdx = 0; segIdx < segments.length; segIdx++) {
        const segment = segments[segIdx];
        const pageTable = segment.getPageTable?.();
        const pages = pageTable?.getAllPages?.() || [];

        for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
          const page = pages[pageIdx];
          const frameNumber = page.getFrameNumber?.();

          if (frameNumber !== undefined && frameNumber !== -1) {
            const physicalAddress = (frameNumber * this.ram.config.getPageSize());
            memoryMap.push({
              segmentId: segIdx,
              segmentType: segment.getType?.() || 'UNKNOWN',
              pageId: pageIdx,
              frameNumber: frameNumber,
              physicalAddress: physicalAddress,
              sizeBytes: this.ram.config.getPageSize(),
              isDirty: page.isDirty?.() || false,
              isPresent: page.isPresent?.() || false,
            });
          }
        }
      }

      return {
        pid: pid,
        processName: process.getName(),
        memoryMap: memoryMap,
        totalMemory: segmentTable.getTotalMemory?.() || 0,
        error: null,
      };
    } catch (error) {
      return {
        pid: pid,
        processName: null,
        memoryMap: [],
        totalMemory: 0,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene mapa de todos los procesos en memoria
   * @returns {Array}
   */
  getAllProcessesMemoryMap() {
    const processes = this.os.getAllProcesses();
    return processes.map(p => this.getProcessMemoryMap(p.getPid()));
  }

  /**
   * Analiza fragmentación de memoria
   * @returns {Object}
   */
  getFragmentation() {
    const layout = DomainMapper.memoryLayoutToDTO(this.ram);
    const frames = layout.frames;

    let allocatedSegments = 0;
    let freeSegments = 0;
    let maxFreeContiguous = 0;
    let currentFreeContiguous = 0;

    for (const frame of frames) {
      if (frame.isAllocated) {
        allocatedSegments++;
        if (currentFreeContiguous > 0) {
          maxFreeContiguous = Math.max(maxFreeContiguous, currentFreeContiguous);
        }
        currentFreeContiguous = 0;
      } else {
        freeSegments++;
        currentFreeContiguous++;
      }
    }

    if (currentFreeContiguous > 0) {
      maxFreeContiguous = Math.max(maxFreeContiguous, currentFreeContiguous);
    }

    return {
      allocatedFrames: allocatedSegments,
      freeFrames: freeSegments,
      totalFrames: frames.length,
      fragmentationRatio: freeSegments > 0 ? allocatedSegments / freeSegments : 0,
      maxFreeContiguousFrames: maxFreeContiguous,
      maxFreeContiguousBytes: maxFreeContiguous * this.ram.config.getPageSize(),
    };
  }

  /**
   * Obtiene visualización de memoria en formato ASCII
   * @param {number} maxRows - Máximo de filas a mostrar
   * @returns {string}
   */
  getASCIIVisualization(maxRows = 10) {
    const layout = DomainMapper.memoryLayoutToDTO(this.ram);
    const frames = layout.frames;
    const frameSize = this.ram.config.getPageSize();
    
    // Calcular cuántos marcos mostrar por fila
    const framesPerRow = Math.ceil(frames.length / maxRows);
    let visualization = '';

    visualization += `Memory Layout (${layout.ramStatus.allocatedFrames}/${layout.ramStatus.totalFrames} frames allocated)\n`;
    visualization += '─'.repeat(80) + '\n';

    for (let row = 0; row < maxRows; row++) {
      const startFrame = row * framesPerRow;
      const endFrame = Math.min(startFrame + framesPerRow, frames.length);

      visualization += `${String(row).padStart(2, '0')} | `;

      for (let i = startFrame; i < endFrame; i++) {
        const frame = frames[i];
        const symbol = frame.isAllocated ? '█' : '░';
        const pid = frame.ownerPid ? `${frame.ownerPid}` : ' ';
        visualization += `${symbol}`;
      }

      visualization += ` | ${(startFrame * frameSize / 1024).toFixed(0)}-${(endFrame * frameSize / 1024).toFixed(0)}KiB\n`;
    }

    visualization += '─'.repeat(80) + '\n';
    visualization += `Legend: █ = allocated,  ░ = free\n`;

    return visualization;
  }
}
