/**
 * MMU.js (Memory Management Unit)
 * 
 * RESPONSABILIDAD: Unidad de gestión de memoria. Coordina la traducción
 * de direcciones lógicas a direcciones físicas.
 * 
 * El MMU es el responsable de:
 * - Traducir dirección lógica → dirección física
 * - Mantener caché TLB (Translation Lookaside Buffer)
 * - Manejar page faults y segmentation faults
 * - Coordinar con tablas de segmentación y paginación
 * 
 * PATRÓN: Service (stateless logic, aunque mantiene caché)
 * DEPENDENCIAS: RAM, ArchitectureConfig
 * UTILIZADA POR: OperatingSystem, Process
 * UTILIZA: AddressTranslator (lógica pura)
 */

import RAM from '../memory/RAM.js';
import ArchitectureConfig from '../architecture/ArchitectureConfig.js';
import PhysicalAddress from '../architecture/PhysicalAddress.js';

class MMU {
  /**
   * Constructor
   */
  constructor() {
    this.config = ArchitectureConfig.getInstance();
    this.ram = RAM.getInstance();
    
    // Translation Lookaside Buffer (caché de traducciones recientes)
    this.tlb = new Map(); // Map<logicalAddrValue, physicalAddress>
    this.tlbSize = 16;    // Pequeño caché para ejemplo
    
    // Estadísticas
    this.tlbHits = 0;
    this.tlbMisses = 0;
  }

  /**
   * TRADUCCIÓN: Traduce dirección lógica a física
   * 
   * Flujo:
   * 1. Verificar TLB (caché)
   * 2. Si hit: retornar
   * 3. Si miss: traducir usando tablas
   * 4. Almacenar en TLB
   * 5. Retornar dirección física
   * 
   * @param {Process} process - Proceso que realiza la solicitud
   * @param {LogicalAddress} logicalAddress - Dirección lógica a traducir
   * @returns {PhysicalAddress} Dirección física traducida
   * @throws {Error} Si hay segmentation fault o page fault
   */
  translate(process, logicalAddress) {
    // TODO: Implementar traducción completa
    // - Verificar en TLB
    // - Validar segmento
    // - Validar página
    // - Obtener marco
    // - Calcular dirección física
    throw new Error('translate no implementado aún');
  }

  /**
   * Verifica si hay hit en TLB
   * @param {number} logicalAddressValue
   * @returns {boolean}
   */
  isTLBHit(logicalAddressValue) {
    return this.tlb.has(logicalAddressValue);
  }

  /**
   * Obtiene entrada del TLB
   * @param {number} logicalAddressValue
   * @returns {PhysicalAddress}
   */
  getTLBEntry(logicalAddressValue) {
    return this.tlb.get(logicalAddressValue) || null;
  }

  /**
   * Añade entrada al TLB
   * @param {number} logicalAddressValue
   * @param {PhysicalAddress} physicalAddress
   */
  addTLBEntry(logicalAddressValue, physicalAddress) {
    // Si TLB está lleno, remover entrada más antigua (FIFO simple)
    if (this.tlb.size >= this.tlbSize) {
      const firstKey = this.tlb.keys().next().value;
      this.tlb.delete(firstKey);
    }
    
    this.tlb.set(logicalAddressValue, physicalAddress);
  }

  /**
   * Limpia el TLB (invalidar todas las entradas)
   * 
   * Usado cuando:
   * - Cambia el proceso actual (context switch)
   * - Se actualiza tabla de segmentos/páginas
   */
  flushTLB() {
    this.tlb.clear();
  }

  /**
   * Lee memoria del proceso
   * @param {Process} process
   * @param {LogicalAddress} logicalAddress
   * @param {number} size
   * @returns {Uint8Array}
   */
  readMemory(process, logicalAddress, size) {
    // TODO: Implementar lectura
    // - Traducir dirección
    // - Leer de RAM
    throw new Error('readMemory no implementado aún');
  }

  /**
   * Escribe en memoria del proceso
   * @param {Process} process
   * @param {LogicalAddress} logicalAddress
   * @param {Uint8Array} data
   */
  writeMemory(process, logicalAddress, data) {
    // TODO: Implementar escritura
    // - Traducir dirección
    // - Escribir en RAM
    throw new Error('writeMemory no implementado aún');
  }

  /**
   * Obtiene estadísticas del TLB
   * @returns {object}
   */
  getTLBStats() {
    const total = this.tlbHits + this.tlbMisses;
    const hitRate = total > 0 ? (this.tlbHits / total) * 100 : 0;

    return {
      hits: this.tlbHits,
      misses: this.tlbMisses,
      total: total,
      hitRate: hitRate.toFixed(2) + '%',
      entriesUsed: this.tlb.size,
      maxEntries: this.tlbSize
    };
  }

  /**
   * Reinicia estadísticas
   */
  resetStatistics() {
    this.tlbHits = 0;
    this.tlbMisses = 0;
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    const stats = this.getTLBStats();
    return `MMU {
  tlbHits: ${stats.hits},
  tlbMisses: ${stats.misses},
  hitRate: ${stats.hitRate},
  tlbUsage: ${stats.entriesUsed}/${stats.maxEntries}
}`;
  }
}

export default MMU;
