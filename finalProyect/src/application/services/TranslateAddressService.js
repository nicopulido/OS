/**
 * TranslateAddressService.js
 * 
 * RESPONSABILIDAD: Traducir direcciones lógicas a físicas
 * Expone la lógica del MMU sin exponer detalles del dominio
 * 
 * RECIBE:
 * - pid: número
 * - logicalAddress: número o LogicalAddress
 * 
 * DEVUELVE:
 * - AddressTranslationResultDTO
 * 
 * DEPENDENCIAS:
 * - OperatingSystem, MMU, Process (dominio)
 * - DomainMapper
 * 
 * API EXPUESTA:
 * - translateAddress(pid, logicalAddress) → ResultDTO
 * - validateAddress(pid, logicalAddress) → Validación
 * - getTLBStats() → Estadísticas del caché
 */

import OperatingSystem from '../../domain/operating-system/OperatingSystem.js';
import LogicalAddress from '../../domain/architecture/LogicalAddress.js';
import { DomainMapper } from '../mappers/DomainMapper.js';

export class TranslateAddressService {
  constructor() {
    this.os = OperatingSystem.getInstance();
  }

  /**
   * Traduce dirección lógica a física
   * 
   * @param {number} pid - Process ID
   * @param {number | LogicalAddress} logicalAddress - Dirección a traducir
   * @returns {Object} { success, translation, error }
   */
  translateAddress(pid, logicalAddress) {
    try {
      // Obtener proceso
      const process = this.os.getProcess(pid);
      if (!process) {
        throw new Error(`Process ${pid} not found`);
      }

      // Convertir a LogicalAddress si es número
      let logAddr = logicalAddress;
      if (typeof logicalAddress === 'number') {
        // Asumir que es dirección de 32 bits
        logAddr = LogicalAddress.fromValue(logicalAddress);
      }

      // Extraer componentes
      const segmentId = logAddr.getSegmentId();
      const pageId = logAddr.getPageId();
      const offset = logAddr.getOffset();

      // Validar segmento
      const segmentTable = process.getSegmentTable?.();
      if (!segmentTable) {
        throw new Error('Process has no segment table');
      }

      const segment = segmentTable.getSegment(segmentId);
      if (!segment) {
        throw new Error(`Segment ${segmentId} not found in process ${pid}`);
      }

      // Validar permisos de acceso
      // TODO: Considerar tipo de acceso (read/write/execute)

      // Obtener tabla de páginas
      const pageTable = segment.getPageTable?.();
      if (!pageTable) {
        throw new Error(`Segment ${segmentId} has no page table`);
      }

      // Obtener página
      const page = pageTable.getPage(pageId);
      if (!page) {
        throw new Error(`Page ${pageId} not found in segment ${segmentId}`);
      }

      // Obtener número de marco
      const frameNumber = page.getFrameNumber?.();
      if (frameNumber === undefined || frameNumber === -1) {
        throw new Error(`Page ${pageId} not present in RAM (page fault)`);
      }

      // Calcular dirección física
      const pageSize = segment.pageTable?.config?.getPageSize?.() || 4096;
      const physicalAddress = (frameNumber * pageSize) + offset;

      // Retornar DTO
      const translation = DomainMapper.addressTranslationToDTO(
        logicalAddress,
        segmentId,
        pageId,
        offset,
        frameNumber,
        physicalAddress,
        true
      );

      return {
        success: true,
        translation: translation,
        error: null,
      };
    } catch (error) {
      const translation = DomainMapper.addressTranslationToDTO(
        logicalAddress,
        null,
        null,
        null,
        null,
        null,
        false,
        error.message
      );

      return {
        success: false,
        translation: translation,
        error: error.message,
      };
    }
  }

  /**
   * Traduce múltiples direcciones
   * @param {number} pid
   * @param {Array<number>} logicalAddresses
   * @returns {Array} Array de resultados
   */
  translateAddresses(pid, logicalAddresses) {
    return logicalAddresses.map(addr => this.translateAddress(pid, addr));
  }

  /**
   * Valida si una dirección es accesible
   * @param {number} pid
   * @param {number} logicalAddress
   * @param {string} accessType - 'read', 'write', 'execute'
   * @returns {Object} { valid, reason }
   */
  validateAddress(pid, logicalAddress, accessType = 'read') {
    try {
      const process = this.os.getProcess(pid);
      if (!process) {
        return { valid: false, reason: `Process ${pid} not found` };
      }

      const logAddr = typeof logicalAddress === 'number' 
        ? LogicalAddress.fromValue(logicalAddress)
        : logicalAddress;

      const segmentId = logAddr.getSegmentId();
      const pageId = logAddr.getPageId();
      const config = this.os.ram.config;

      // Validar rango de segmento
      if (segmentId >= config.getMaxSegments()) {
        return { valid: false, reason: `Segment ID ${segmentId} out of range` };
      }

      // Validar rango de página
      if (pageId >= config.getPagesPerSegment()) {
        return { valid: false, reason: `Page ID ${pageId} out of range` };
      }

      // Validar que el segmento exista
      const segmentTable = process.getSegmentTable?.();
      const segment = segmentTable?.getSegment(segmentId);
      if (!segment) {
        return { valid: false, reason: `Segment ${segmentId} not allocated` };
      }

      // Validar permisos
      if (accessType === 'write' && segment.isReadOnly?.()) {
        return { valid: false, reason: `Segment ${segmentId} is read-only` };
      }

      if (accessType === 'execute' && !segment.canExecute?.()) {
        return { valid: false, reason: `Segment ${segmentId} is not executable` };
      }

      return { valid: true, reason: 'Address is valid' };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }

  /**
   * Obtiene estadísticas del TLB
   * @param {number} pid
   * @returns {Object}
   */
  getTLBStats(pid) {
    const mmu = this.os.mmu;
    if (!mmu) {
      return { enabled: false };
    }

    return {
      enabled: true,
      hits: mmu.tlbHits || 0,
      misses: mmu.tlbMisses || 0,
      size: mmu.tlbSize || 16,
      entries: mmu.tlb?.size || 0,
      hitRate: mmu.tlbHits && (mmu.tlbHits + mmu.tlbMisses) > 0 
        ? (mmu.tlbHits / (mmu.tlbHits + mmu.tlbMisses)) * 100
        : 0,
    };
  }

  /**
   * Limpia el caché TLB
   * @param {number} pid
   */
  flushTLB(pid) {
    const mmu = this.os.mmu;
    if (mmu && mmu.flushTLB) {
      mmu.flushTLB();
      return { success: true };
    }
    return { success: false, error: 'TLB not available' };
  }
}
