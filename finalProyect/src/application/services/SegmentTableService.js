/**
 * SegmentTableService.js
 * 
 * RESPONSABILIDAD: Gestionar y visualizar tablas de segmentación
 * 
 * RECIBE:
 * - pid: número
 * 
 * DEVUELVE:
 * - SegmentTableDTO
 * 
 * DEPENDENCIAS:
 * - OperatingSystem, Process (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - getSegmentTable(pid) → SegmentTableDTO
 * - getSegment(pid, segmentId) → SegmentDTO
 * - getAllSegments(pid) → Array<SegmentDTO>
 * - getSegmentStats(pid, segmentId) → Estadísticas
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class SegmentTableService {
  constructor() {
    this.os = OperatingSystem.getInstance();
  }

  /**
   * Obtiene tabla de segmentos de un proceso
   * @param {number} pid
   * @returns {Object}
   */
  getSegmentTable(pid) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error(`Process ${pid} has no segment table`);
      }

      const segmentTableDTO = DomainMapper.segmentTableToDTO(segmentTable, pid);

      return {
        segmentTableDTO: segmentTableDTO,
        error: null,
      };
    } catch (error) {
      return {
        segmentTableDTO: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene información de un segmento específico
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  getSegment(pid, segmentId) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error(`Process ${pid} has no segment table`);
      }

      const segment = segmentTable.getSegment(segmentId);
      if (!segment) {
        throw new Error(`Segment ${segmentId} not found in process ${pid}`);
      }

      const segmentDTO = DomainMapper.segmentToDTO(segment, segmentId);

      return {
        segmentDTO: segmentDTO,
        details: {
          type: segment.getType?.() || 'UNKNOWN',
          baseAddress: 0, // En segmentación paginada
          limitAddress: segment.getSize?.() || 0,
          pageCount: segment.getPageTable?.getAllPages?.()?.length || 0,
          allocatedFrames: this._countAllocatedFrames(segment),
        },
        error: null,
      };
    } catch (error) {
      return {
        segmentDTO: null,
        details: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene todos los segmentos de un proceso
   * @param {number} pid
   * @returns {Object}
   */
  getAllSegments(pid) {
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
      const segmentDTOs = segments.map((seg, idx) =>
        DomainMapper.segmentToDTO(seg, idx)
      );

      return {
        pid: pid,
        segments: segmentDTOs,
        totalSegments: segmentDTOs.length,
        totalMemory: segmentTable.getTotalMemory?.() || 0,
        error: null,
      };
    } catch (error) {
      return {
        pid: pid,
        segments: [],
        totalSegments: 0,
        totalMemory: 0,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene estadísticas de un segmento
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  getSegmentStats(pid, segmentId) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error(`Process ${pid} has no segment table`);
      }

      const segment = segmentTable.getSegment(segmentId);
      if (!segment) {
        throw new Error(`Segment ${segmentId} not found`);
      }

      const pageTable = segment.getPageTable?.();
      const pages = pageTable?.getAllPages?.() || [];

      let allocatedFrames = 0;
      let dirtyPages = 0;
      let totalAccesses = 0;
      let mostRecentAccess = null;

      for (const page of pages) {
        if (page.isPresent?.()) {
          allocatedFrames++;
        }
        if (page.isDirty?.()) {
          dirtyPages++;
        }
        totalAccesses += page.getAccessCount?.() || 0;
        const lastAccess = page.getLastAccessTime?.();
        if (lastAccess && (!mostRecentAccess || lastAccess > mostRecentAccess)) {
          mostRecentAccess = lastAccess;
        }
      }

      return {
        pid: pid,
        segmentId: segmentId,
        type: segment.getType?.() || 'UNKNOWN',
        size: segment.getSize?.() || 0,
        pages: pages.length,
        allocatedFrames: allocatedFrames,
        freePages: pages.length - allocatedFrames,
        dirtyPages: dirtyPages,
        permissions: {
          read: segment.canRead?.() || false,
          write: segment.canWrite?.() || false,
          execute: segment.canExecute?.() || false,
        },
        accessStats: {
          totalAccesses: totalAccesses,
          averageAccesses: pages.length > 0 ? totalAccesses / pages.length : 0,
          lastAccess: mostRecentAccess,
        },
        error: null,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  /**
   * Cuenta marcos asignados en un segmento
   * @private
   */
  _countAllocatedFrames(segment) {
    const pageTable = segment.getPageTable?.();
    if (!pageTable) return 0;

    const pages = pageTable.getAllPages?.() || [];
    return pages.filter(p => p.isPresent?.()).length;
  }
}
