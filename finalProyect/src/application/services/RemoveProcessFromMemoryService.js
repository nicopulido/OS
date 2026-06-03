/**
 * RemoveProcessFromMemoryService.js
 * 
 * RESPONSABILIDAD: Terminar procesos y liberar memoria
 * 
 * RECIBE:
 * - pid: número
 * 
 * DEVUELVE:
 * - Confirmación de eliminación y estado de memoria después
 * 
 * DEPENDENCIAS:
 * - OperatingSystem, RAM (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - removeProcess(pid) → Confirmación
 * - removeAllProcesses() → Estado final
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import RAM from '../../domain/memory/RAM.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class RemoveProcessFromMemoryService {
  constructor() {
    this.os = OperatingSystem.getInstance();
    this.ram = RAM.getInstance();
  }

  /**
   * Elimina un proceso y libera su memoria
   * 
   * @param {number} pid - Process ID a eliminar
   * @returns {Object} { success, freedMemory, ramStatusAfter, error }
   */
  removeProcess(pid) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      // Obtener memoria ocupada antes
      const segmentTable = process.getSegmentTable?.();
      const memoryBefore = segmentTable?.getTotalMemory?.() || 0;

      // Liberar marcos asignados
      const segmentTable2 = process.getSegmentTable?.();
      if (segmentTable2) {
        const segments = segmentTable2.getAllSegments?.() || [];
        for (const segment of segments) {
          const pageTable = segment.getPageTable?.();
          if (pageTable) {
            const pages = pageTable.getAllPages?.() || [];
            for (const page of pages) {
              const frameNumber = page.getFrameNumber?.();
              if (frameNumber !== undefined && frameNumber !== -1) {
                this.ram.deallocateFrame(frameNumber);
              }
            }
          }
        }
      }

      // Remover proceso del SO
      this.os.removeProcess(pid);

      // Obtener estado de memoria después
      const ramStatus = DomainMapper.ramStatusToDTO(this.ram);

      return {
        success: true,
        pid: pid,
        freedMemory: {
          bytes: memoryBefore,
          kilobytes: memoryBefore / 1024,
          megabytes: memoryBefore / (1024 * 1024),
        },
        ramStatusAfter: ramStatus,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        pid: pid,
        freedMemory: null,
        ramStatusAfter: DomainMapper.ramStatusToDTO(this.ram),
        error: error.message,
      };
    }
  }

  /**
   * Elimina todos los procesos
   * @returns {Object}
   */
  removeAllProcesses() {
    try {
      const allProcesses = this.os.getAllProcesses();
      const results = [];

      for (const process of allProcesses) {
        const result = this.removeProcess(process.getPid());
        results.push(result);
      }

      const ramStatus = DomainMapper.ramStatusToDTO(this.ram);

      return {
        success: true,
        processesRemoved: results.length,
        results: results,
        ramStatusAfter: ramStatus,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        processesRemoved: 0,
        results: [],
        ramStatusAfter: DomainMapper.ramStatusToDTO(this.ram),
        error: error.message,
      };
    }
  }

  /**
   * Obtiene información de memoria que será liberada
   * @param {number} pid
   * @returns {Object}
   */
  getProcessMemoryInfo(pid) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        return { memory: 0, segments: 0, pages: 0, frames: 0 };
      }

      let totalFrames = 0;
      let totalPages = 0;
      const segments = segmentTable.getAllSegments?.() || [];

      for (const segment of segments) {
        const pageTable = segment.getPageTable?.();
        const pages = pageTable?.getAllPages?.() || [];
        totalPages += pages.length;
        totalFrames += pages.length;
      }

      return {
        memory: segmentTable.getTotalMemory?.() || 0,
        segments: segments.length,
        pages: totalPages,
        frames: totalFrames,
      };
    } catch (error) {
      return {
        error: error.message,
        memory: 0,
        segments: 0,
        pages: 0,
        frames: 0,
      };
    }
  }
}
