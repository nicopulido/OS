/**
 * CreateProcessService.js
 * 
 * RESPONSABILIDAD: Crear nuevos procesos con su tabla de segmentos
 * Coordina con dominio para crear entidades
 * 
 * RECIBE:
 * - processName: string
 * - segments: Array de { type, sizeBytes, permissions }
 * 
 * DEVUELVE:
 * - ProcessDTO con información del proceso creado
 * 
 * DEPENDENCIAS:
 * - OperatingSystem (dominio)
 * - Process, SegmentTable, Segment, PageTable, Page (dominio)
 * - RAM (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - createProcess(name, segments) → ProcessDTO
 * - validateSegmentDefinition() → Validación
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import Process from '../../domain/process/Process.js';
import SegmentTable from '../../domain/process/SegmentTable.js';
import Segment from '../../domain/process/Segment.js';
import PageTable from '../../domain/process/PageTable.js';
import Page from '../../domain/process/Page.js';
import RAM from '../../domain/memory/RAM.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class CreateProcessService {
  constructor() {
    this.os = OperatingSystem.getInstance();
    this.ram = RAM.getInstance();
  }

  /**
   * Crea un nuevo proceso con segmentos
   * 
   * @param {string} processName - Nombre del proceso
   * @param {Array} segments - Array de { type, sizeBytes, permissions }
   *   Ejemplo: [
   *     { type: 'CODE', sizeBytes: 8192, permissions: { canRead: true, canWrite: false, canExecute: true } },
   *     { type: 'DATA', sizeBytes: 8192, permissions: { canRead: true, canWrite: true, canExecute: false } }
   *   ]
   * 
   * @returns {Object} { success, processDTO, error }
   */
  createProcess(processName, segments = []) {
    try {
      // Validar entrada
      if (!processName || typeof processName !== 'string') {
        throw new Error('Invalid process name');
      }

      if (!Array.isArray(segments)) {
        throw new Error('Segments must be an array');
      }

      // Generar PID
      const pid = this._generatePID();

      // Crear entidad Process
      const process = new Process(pid, processName);
      const segmentTable = new SegmentTable(pid);
      process.setSegmentTable(segmentTable);

      // Crear segmentos
      for (let i = 0; i < segments.length; i++) {
        const segmentDef = segments[i];
        
        // Validar definición
        this._validateSegmentDefinition(segmentDef);

        // Crear Segment
        const segment = new Segment(
          i,
          segmentDef.type || 'DATA',
          segmentDef.sizeBytes || 0
        );

        // Establecer permisos si se proporcionan
        if (segmentDef.permissions) {
          if (!segmentDef.permissions.canWrite) {
            segment.setReadOnly();
          }
          // Otros permisos se manejan en el dominio
        }

        // Crear PageTable para el segmento
        const pageTable = new PageTable(i, pid);
        const pageSize = this.ram.config.getPageSize();
        const pagesNeeded = Math.ceil(segmentDef.sizeBytes / pageSize);

        // Crear páginas y asignar marcos
        for (let pageIdx = 0; pageIdx < pagesNeeded; pageIdx++) {
          const page = new Page(pageIdx, -1); // -1 = no asignado aún
          
          try {
            // Intentar asignar marco físico
            const frameNumber = this._allocateFrame(pid, i, pageIdx);
            page.setFrameNumber(frameNumber);
            page.markPresent();
          } catch (e) {
            // Si no hay marcos disponibles, la página quedará sin asignar
            console.warn(`Could not allocate frame for page ${pageIdx} of segment ${i} in process ${pid}: ${e.message}`);
          }

          pageTable.addPage(page);
        }

        segment.setPageTable(pageTable);
        segmentTable.addSegment(segment);
      }

      // Registrar proceso en el SO
      this.os.registerProcess(process);

      // Retornar como DTO
      const processDTO = DomainMapper.processToDTO(process, this.ram);

      return {
        success: true,
        pid: pid,
        processDTO: processDTO,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        pid: null,
        processDTO: null,
        error: error.message,
      };
    }
  }

  /**
   * Crea un proceso con configuración predeterminada
   * Útil para pruebas rápidas
   * 
   * @param {string} name - Nombre del proceso
   * @returns {Object} { success, processDTO, error }
   */
  createProcessWithDefaults(name) {
    const segments = [
      { type: 'CODE', sizeBytes: 8192, permissions: { canRead: true, canWrite: false, canExecute: true } },
      { type: 'DATA', sizeBytes: 8192, permissions: { canRead: true, canWrite: true, canExecute: false } },
      { type: 'STACK', sizeBytes: 16384, permissions: { canRead: true, canWrite: true, canExecute: false } },
    ];

    return this.createProcess(name, segments);
  }

  /**
   * Obtiene lista de definiciones de segmento válidas
   * @returns {Array}
   */
  getAvailableSegmentTypes() {
    return [
      { name: 'CODE', description: 'Machine instructions', defaultSize: 8192 },
      { name: 'DATA', description: 'Global and static variables', defaultSize: 8192 },
      { name: 'STACK', description: 'Automatic variables and return addresses', defaultSize: 16384 },
      { name: 'HEAP', description: 'Dynamic memory allocation', defaultSize: 32768 },
    ];
  }

  /**
   * Valida que una definición de segmento sea correcta
   * @private
   * @param {Object} segmentDef
   * @throws {Error}
   */
  _validateSegmentDefinition(segmentDef) {
    if (!segmentDef || typeof segmentDef !== 'object') {
      throw new Error('Segment definition must be an object');
    }

    const validTypes = ['CODE', 'DATA', 'STACK', 'HEAP'];
    if (!validTypes.includes(segmentDef.type)) {
      throw new Error(`Invalid segment type "${segmentDef.type}". Must be one of: ${validTypes.join(', ')}`);
    }

    if (typeof segmentDef.sizeBytes !== 'number' || segmentDef.sizeBytes <= 0) {
      throw new Error('Segment sizeBytes must be a positive number');
    }

    const maxPageSize = 'maxSize'; // Could check against architecture limits
    if (segmentDef.sizeBytes > this.ram.config.getTotalRAMBytes()) {
      throw new Error('Segment size exceeds total RAM');
    }
  }

  /**
   * Genera el siguiente PID
   * @private
   * @returns {number}
   */
  _generatePID() {
    return this.os.getNextPid?.() || Date.now();
  }

  /**
   * Asigna un marco físico para una página
   * @private
   * @param {number} pid
   * @param {number} segmentId
   * @param {number} pageId
   * @returns {number} frameNumber
   * @throws {Error}
   */
  _allocateFrame(pid, segmentId, pageId) {
    const availableFrames = this.ram.getAvailableFrames?.();
    
    if (!availableFrames || availableFrames.length === 0) {
      throw new Error('No available frames to allocate');
    }

    // Tomar el primer marco disponible
    const frameNumber = availableFrames[0];
    this.ram.allocateFrame(frameNumber, pid);

    return frameNumber;
  }
}
