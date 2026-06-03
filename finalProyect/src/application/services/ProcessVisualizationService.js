/**
 * ProcessVisualizationService.js
 * 
 * RESPONSABILIDAD: Proporcionar datos para visualizar procesos
 * 
 * RECIBE:
 * - pid (opcional)
 * 
 * DEVUELVE:
 * - ProcessDTO o ProcessListDTO
 * 
 * DEPENDENCIAS:
 * - OperatingSystem (dominio)
 * - RAM (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - getProcessList() → Todos los procesos
 * - getProcessDetail(pid) → Detalles de un proceso
 * - getProcessTree() → Jerarquía de procesos
 * - getSystemStats() → Estadísticas globales
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import RAM from '../../domain/memory/RAM.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class ProcessVisualizationService {
  constructor() {
    this.os = OperatingSystem.getInstance();
    this.ram = RAM.getInstance();
  }

  /**
   * Obtiene lista de todos los procesos
   * @returns {ProcessListDTO}
   */
  getProcessList() {
    const processes = this.os.getAllProcesses();
    return DomainMapper.processListToDTO(processes, this.ram);
  }

  /**
   * Obtiene detalles de un proceso específico
   * @param {number} pid
   * @returns {Object}
   */
  getProcessDetail(pid) {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      const processDTO = DomainMapper.processToDTO(process, this.ram);
      const segmentTable = process.getSegmentTable?.();

      // Información adicional
      const segmentCount = segmentTable?.getAllSegments?.()?.length || 0;
      let totalPages = 0;
      let totalFrames = 0;

      if (segmentTable) {
        for (const segment of segmentTable.getAllSegments?.() || []) {
          const pages = segment.getPageTable?.getAllPages?.() || [];
          totalPages += pages.length;
          
          for (const page of pages) {
            if (page.isPresent?.()) {
              totalFrames++;
            }
          }
        }
      }

      return {
        processDTO: processDTO,
        details: {
          pid: pid,
          name: process.getName(),
          creationTime: process.creationTime,
          uptime: Date.now() - process.creationTime,
          segments: segmentCount,
          totalPages: totalPages,
          totalFrames: totalFrames,
        },
        error: null,
      };
    } catch (error) {
      return {
        processDTO: null,
        details: null,
        error: error.message,
      };
    }
  }

  /**
   * Obtiene árbol de procesos (simulado, ya que no hay padres/hijos)
   * @returns {Array}
   */
  getProcessTree() {
    const processes = this.os.getAllProcesses();
    // En este simulador, todos son procesos raíz
    return processes.map(p => ({
      pid: p.getPid(),
      name: p.getName(),
      state: p.getPCB?.()?.getState?.() || 'UNKNOWN',
      memory: p.getSegmentTable?.()?.getTotalMemory?.() || 0,
      children: [],
    }));
  }

  /**
   * Obtiene estadísticas del sistema
   * @returns {Object}
   */
  getSystemStats() {
    const processList = this.getProcessList();
    const memLayout = this.ram ? DomainMapper.memoryLayoutToDTO(this.ram) : null;

    return {
      timestamp: Date.now(),
      system: 'Segmented Paging Memory Simulator',
      processes: {
        total: processList.totalProcesses,
        running: this.os.getRunningProcess?.() ? 1 : 0,
        memory: processList.systemMemoryUsage,
      },
      memory: {
        totalRAM: memLayout?.ramStatus?.totalRAM || 0,
        usedRAM: memLayout?.ramStatus?.usedRAM || 0,
        freeRAM: memLayout?.ramStatus?.freeRAM || 0,
        utilizationPercent: memLayout?.ramStatus?.utilizationPercent || 0,
        allocatedFrames: memLayout?.ramStatus?.allocatedFrames || 0,
        totalFrames: memLayout?.ramStatus?.totalFrames || 0,
      },
      processes_list: processList.processes.map(p => ({
        pid: p.pid,
        name: p.name,
        memory: p.allocatedMemory,
        segments: p.segmentCount,
      })),
    };
  }

  /**
   * Obtiene comparación de procesos
   * @returns {Object}
   */
  getProcessComparison() {
    const processes = this.os.getAllProcesses();
    const comparison = {
      largest: null,
      smallest: null,
      most_pages: null,
      average_memory: 0,
    };

    if (processes.length === 0) {
      return comparison;
    }

    let totalMemory = 0;
    let maxMemory = 0;
    let minMemory = Infinity;
    let maxPages = 0;
    let largestPid = null;
    let smallestPid = null;
    let mostPagesPid = null;

    for (const process of processes) {
      const memory = process.getSegmentTable?.()?.getTotalMemory?.() || 0;
      totalMemory += memory;

      if (memory > maxMemory) {
        maxMemory = memory;
        largestPid = process.getPid();
      }

      if (memory < minMemory) {
        minMemory = memory;
        smallestPid = process.getPid();
      }

      let pageCount = 0;
      for (const seg of process.getSegmentTable?.()?.getAllSegments?.() || []) {
        pageCount += seg.getPageTable?.getAllPages?.()?.length || 0;
      }

      if (pageCount > maxPages) {
        maxPages = pageCount;
        mostPagesPid = process.getPid();
      }
    }

    comparison.largest = largestPid ? {
      pid: largestPid,
      memory: maxMemory,
    } : null;

    comparison.smallest = smallestPid ? {
      pid: smallestPid,
      memory: minMemory === Infinity ? 0 : minMemory,
    } : null;

    comparison.most_pages = mostPagesPid ? {
      pid: mostPagesPid,
      pages: maxPages,
    } : null;

    comparison.average_memory = totalMemory / processes.length;

    return comparison;
  }

  /**
   * Obtiene timeline de eventos simulados
   * @returns {Array}
   */
  getEventTimeline() {
    // Podría rastrearse desde los eventos del dominio
    return [
      { timestamp: Date.now(), event: 'System initialized' },
    ];
  }
}
