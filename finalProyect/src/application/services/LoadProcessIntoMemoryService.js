/**
 * LoadProcessIntoMemoryService.js
 * 
 * RESPONSABILIDAD: Cargar procesos en memoria, asignando marcos a páginas
 * 
 * RECIBE:
 * - pid: número
 * - loadStrategy: 'demand' | 'preload' (opcional)
 * 
 * DEVUELVE:
 * - Estado de carga y asignación de marcos
 * 
 * DEPENDENCIAS:
 * - OperatingSystem, RAM, Process (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - loadProcessIntoMemory(pid, strategy) → Resultado de carga
 * - preloadSegment(pid, segmentId) → Precarga de segmento
 * - loadSegmentOnDemand(pid, segmentId) → Carga bajo demanda
 * - getLoadStatus(pid) → Estado actual de carga
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import RAM from '../../domain/memory/RAM.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class LoadProcessIntoMemoryService {
  constructor() {
    this.os = OperatingSystem.getInstance();
    this.ram = RAM.getInstance();
  }

  /**
   * Carga un proceso en memoria
   * 
   * @param {number} pid - Process ID
   * @param {string} strategy - 'demand' (default) o 'preload'
   * @returns {Object} { success, loadedBytes, loadedFrames, loadedSegments, error }
   */
  loadProcessIntoMemory(pid, strategy = 'demand') {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error(`Process ${pid} has no segment table`);
      }

      if (strategy === 'preload') {
        return this._preloadAllSegments(process, segmentTable);
      } else if (strategy === 'demand') {
        return this._structureDemandLoading(process, segmentTable);
      } else {
        throw new Error(`Unknown strategy: ${strategy}`);
      }
    } catch (error) {
      return {
        success: false,
        pid: pid,
        loadedBytes: 0,
        loadedFrames: 0,
        loadedSegments: 0,
        strategy: strategy,
        error: error.message,
      };
    }
  }

  /**
   * Precarga todos los segmentos de un proceso
   * @private
   */
  _preloadAllSegments(process, segmentTable) {
    const segments = segmentTable.getAllSegments?.() || [];
    let totalLoadedBytes = 0;
    let totalLoadedFrames = 0;
    const results = [];

    for (let segIdx = 0; segIdx < segments.length; segIdx++) {
      const segment = segments[segIdx];
      const pageTable = segment.getPageTable?.();
      if (!pageTable) continue;

      const pages = pageTable.getAllPages?.() || [];
      for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const page = pages[pageIdx];
        
        if (!page.isPresent?.()) {
          try {
            const frameNumber = this._allocateFrame(process.getPid(), segIdx, pageIdx);
            page.setFrameNumber(frameNumber);
            page.markPresent();

            totalLoadedBytes += this.ram.config.getPageSize();
            totalLoadedFrames++;
          } catch (e) {
            results.push({
              segmentId: segIdx,
              pageId: pageIdx,
              success: false,
              error: e.message,
            });
          }
        }
      }
    }

    const ramStatus = DomainMapper.ramStatusToDTO(this.ram);

    return {
      success: true,
      pid: process.getPid(),
      loadedBytes: totalLoadedBytes,
      loadedFrames: totalLoadedFrames,
      loadedSegments: segments.length,
      strategy: 'preload',
      ramStatusAfter: ramStatus,
      details: results,
      error: null,
    };
  }

  /**
   * Prepara estructura para carga bajo demanda
   * Las páginas se cargan conforme se acceden
   * @private
   */
  _structureDemandLoading(process, segmentTable) {
    const segments = segmentTable.getAllSegments?.() || [];
    let preparedSegments = 0;
    let preparedPages = 0;

    for (const segment of segments) {
      const pageTable = segment.getPageTable?.();
      if (!pageTable) continue;

      const pages = pageTable.getAllPages?.() || [];
      preparedPages += pages.length;
      preparedSegments++;
    }

    return {
      success: true,
      pid: process.getPid(),
      loadedBytes: 0,
      loadedFrames: 0,
      loadedSegments: 0,
      preparedSegments: preparedSegments,
      preparedPages: preparedPages,
      strategy: 'demand',
      message: 'Process structured for on-demand loading',
      error: null,
    };
  }

  /**
   * Precarga un segmento específico
   * @param {number} pid
   * @param {number} segmentId
   * @returns {Object}
   */
  preloadSegment(pid, segmentId) {
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

      const pages = pageTable.getAllPages?.() || [];
      let loadedFrames = 0;
      let failedFrames = 0;

      for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
        const page = pages[pageIdx];

        if (!page.isPresent?.()) {
          try {
            const frameNumber = this._allocateFrame(pid, segmentId, pageIdx);
            page.setFrameNumber(frameNumber);
            page.markPresent();
            loadedFrames++;
          } catch (e) {
            failedFrames++;
          }
        }
      }

      const ramStatus = DomainMapper.ramStatusToDTO(this.ram);

      return {
        success: failedFrames === 0,
        pid: pid,
        segmentId: segmentId,
        loadedFrames: loadedFrames,
        failedFrames: failedFrames,
        totalPages: pages.length,
        ramStatusAfter: ramStatus,
        error: failedFrames > 0 ? `Failed to load ${failedFrames} pages` : null,
      };
    } catch (error) {
      return {
        success: false,
        pid: pid,
        segmentId: segmentId,
        loadedFrames: 0,
        failedFrames: 0,
        totalPages: 0,
        ramStatusAfter: DomainMapper.ramStatusToDTO(this.ram),
        error: error.message,
      };
    }
  }

  /**
   * Carga una página bajo demanda
   * @param {number} pid
   * @param {number} segmentId
   * @param {number} pageId
   * @returns {Object}
   */
  loadPageOnDemand(pid, segmentId, pageId) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const segmentTable = process.getSegmentTable?.();
      const segment = segmentTable?.getSegment(segmentId);
      const pageTable = segment?.getPageTable?.();
      const page = pageTable?.getPage(pageId);

      if (!page) {
        throw new Error(`Page ${pageId} not found in segment ${segmentId}`);
      }

      if (page.isPresent?.()) {
        return {
          success: true,
          pid: pid,
          segmentId: segmentId,
          pageId: pageId,
          loaded: false,
          message: 'Page already in RAM',
          error: null,
        };
      }

      // Asignar marco
      const frameNumber = this._allocateFrame(pid, segmentId, pageId);
      page.setFrameNumber(frameNumber);
      page.markPresent();

      const ramStatus = DomainMapper.ramStatusToDTO(this.ram);

      return {
        success: true,
        pid: pid,
        segmentId: segmentId,
        pageId: pageId,
        frameNumber: frameNumber,
        loaded: true,
        ramStatusAfter: ramStatus,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        pid: pid,
        segmentId: segmentId,
        pageId: pageId,
        loaded: false,
        ramStatusAfter: DomainMapper.ramStatusToDTO(this.ram),
        error: error.message,
      };
    }
  }

  /**
   * Obtiene estado de carga de un proceso
   * @param {number} pid
   * @returns {Object}
   */
  getLoadStatus(pid) {
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
      let totalPages = 0;
      let loadedPages = 0;
      let unloadedPages = 0;
      const segmentStatus = [];

      for (let segIdx = 0; segIdx < segments.length; segIdx++) {
        const segment = segments[segIdx];
        const pageTable = segment.getPageTable?.();
        const pages = pageTable?.getAllPages?.() || [];

        let segLoaded = 0;
        let segUnloaded = 0;

        for (const page of pages) {
          totalPages++;
          if (page.isPresent?.()) {
            loadedPages++;
            segLoaded++;
          } else {
            unloadedPages++;
            segUnloaded++;
          }
        }

        segmentStatus.push({
          segmentId: segIdx,
          type: segment.getType?.() || 'UNKNOWN',
          totalPages: pages.length,
          loadedPages: segLoaded,
          unloadedPages: segUnloaded,
          loadPercent: pages.length > 0 ? (segLoaded / pages.length) * 100 : 0,
        });
      }

      return {
        pid: pid,
        processName: process.getName(),
        totalPages: totalPages,
        loadedPages: loadedPages,
        unloadedPages: unloadedPages,
        loadPercent: totalPages > 0 ? (loadedPages / totalPages) * 100 : 0,
        segments: segmentStatus,
        error: null,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  /**
   * Asigna marco físico
   * @private
   */
  _allocateFrame(pid, segmentId, pageId) {
    const availableFrames = this.ram.getAvailableFrames?.();

    if (!availableFrames || availableFrames.length === 0) {
      throw new Error('No available frames to allocate');
    }

    const frameNumber = availableFrames[0];
    this.ram.allocateFrame(frameNumber, pid);

    return frameNumber;
  }
}
