/**
 * PageTableService.js
 * 
 * RESPONSABILIDAD: Gestionar y visualizar tablas de páginas
 * 
 * RECIBE:
 * - pid, segmentId
 * 
 * DEVUELVE:
 * - PageTableDTO
 * 
 * DEPENDENCIAS:
 * - OperatingSystem, Process, Segment (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - getPageTable(pid, segmentId) → PageTableDTO
 * - getPage(pid, segmentId, pageId) → PageDTO
 * - getAllPages(pid, segmentId) → Array<PageDTO>
 * - getPageStats(pid, segmentId, pageId) → Estadísticas
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class PageTableService {
  constructor() {
    this.os = OperatingSystem.getInstance();
  }

  /**
   * Obtiene tabla de páginas de un segmento
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  getPageTable(pid, segmentId) {
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
      if (!pageTable) {
        throw new Error(`Segment ${segmentId} has no page table`);
      }

      const pageTableDTO = DomainMapper.pageTableToDTO(pageTable, pid, segmentId);

      return {
        pageTableDTO: pageTableDTO,
        error: null,
      };
    } catch (error) {
      return {
        pageTableDTO: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene información de una página específica
   * @param {number} pid
   * @param {number} segmentId
   * @param {number} pageId
   * @returns {Object}
   */
  getPage(pid, segmentId, pageId) {
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
      if (!pageTable) {
        throw new Error(`Page table not found`);
      }

      const page = pageTable.getPage(pageId);
      if (!page) {
        throw new Error(`Page ${pageId} not found in segment ${segmentId}`);
      }

      const pageDTO = DomainMapper.pageToDTO(page, pageId);
      const frameNumber = page.getFrameNumber?.();
      const config = this.os.ram?.config;

      return {
        pageDTO: pageDTO,
        details: {
          logicalAddress: (pageId * config?.getPageSize?.()) || 0,
          physicalAddress: frameNumber !== -1 && frameNumber !== undefined
            ? (frameNumber * config?.getPageSize?.()) || 0
            : null,
          frameNumber: frameNumber,
          isInRAM: page.isPresent?.() || false,
          isDirty: page.isDirty?.() || false,
          accessCount: page.getAccessCount?.() || 0,
          lastAccess: page.getLastAccessTime?.() || null,
        },
        error: null,
      };
    } catch (error) {
      return {
        pageDTO: null,
        details: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene todas las páginas de un segmento
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  getAllPages(pid, segmentId) {
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
      if (!pageTable) {
        throw new Error(`Page table not found`);
      }

      const pages = pageTable.getAllPages?.() || [];
      const pageDTOs = pages.map((page, idx) =>
        DomainMapper.pageToDTO(page, idx)
      );

      const presentPages = pages.filter(p => p.isPresent?.()).length;
      const dirtyPages = pages.filter(p => p.isDirty?.()).length;

      return {
        pid: pid,
        segmentId: segmentId,
        pages: pageDTOs,
        totalPages: pages.length,
        presentPages: presentPages,
        absentPages: pages.length - presentPages,
        dirtyPages: dirtyPages,
        error: null,
      };
    } catch (error) {
      return {
        pid: pid,
        segmentId: segmentId,
        pages: [],
        totalPages: 0,
        presentPages: 0,
        absentPages: 0,
        dirtyPages: 0,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene estadísticas de una página
   * @param {number} pid
   * @param {number} segmentId
   * @param {number} pageId
   * @returns {Object}
   */
  getPageStats(pid, segmentId, pageId) {
    try {
      const pageResult = this.getPage(pid, segmentId, pageId);
      if (!pageResult.pageDTO) {
        throw new Error(pageResult.error);
      }

      const pageDTO = pageResult.pageDTO;
      const details = pageResult.details;

      return {
        pid: pid,
        segmentId: segmentId,
        pageId: pageId,
        presence: {
          inRAM: details.isInRAM,
          frameNumber: details.frameNumber,
        },
        modification: {
          isDirty: details.isDirty,
        },
        access: {
          totalAccesses: details.accessCount,
          lastAccessTime: details.lastAccess,
          timeSinceLastAccess: details.lastAccess
            ? Date.now() - details.lastAccess
            : null,
        },
        addresses: {
          logical: details.logicalAddress,
          physical: details.physicalAddress,
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
   * Obtiene resumen de una tabla de páginas
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  getPageTableSummary(pid, segmentId) {
    try {
      const allPages = this.getAllPages(pid, segmentId);
      if (allPages.error) {
        throw new Error(allPages.error);
      }

      const pages = allPages.pages;
      let totalAccesses = 0;
      let maxAccesses = 0;
      let minAccesses = Infinity;

      for (const page of pages) {
        totalAccesses += page.accessCount || 0;
        maxAccesses = Math.max(maxAccesses, page.accessCount || 0);
        minAccesses = Math.min(minAccesses, page.accessCount || 0);
      }

      return {
        pid: pid,
        segmentId: segmentId,
        pages: {
          total: allPages.totalPages,
          present: allPages.presentPages,
          absent: allPages.absentPages,
          dirty: allPages.dirtyPages,
        },
        accessStats: {
          total: totalAccesses,
          average: pages.length > 0 ? totalAccesses / pages.length : 0,
          max: maxAccesses,
          min: minAccesses === Infinity ? 0 : minAccesses,
        },
        error: null,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
