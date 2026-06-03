/**
 * LogicalAddress.js
 * 
 * RESPONSABILIDAD: Value Object que representa una dirección lógica emitida
 * por un proceso (32 bits).
 * 
 * Una dirección lógica se divide en:
 * - Segment ID (bits más significativos)
 * - Page ID (bits intermedios)
 * - Offset (bits menos significativos)
 * 
 * PATRÓN: Value Object inmutable
 * DEPENDENCIAS: ArchitectureConfig
 * CREADA POR: Process, AddressTranslator
 * UTILIZADA POR: MMU, AddressTranslator
 */

import ArchitectureConfig from './ArchitectureConfig.js';

class LogicalAddress {
  /**
   * Constructor
   * @param {number} value - Valor completo de dirección lógica (0-0xFFFFFFFF)
   */
  constructor(value) {
    if (typeof value !== 'number' || value < 0 || value > 0xFFFFFFFF) {
      throw new Error(`LogicalAddress value ${value} debe estar en rango [0, 0xFFFFFFFF]`);
    }

    this.value = Math.floor(value);
    this.config = ArchitectureConfig.getInstance();
    
    // Computar componentes eagerly (antes del freeze)
    const shift = this.config.getPageBits() + this.config.getOffsetBits();
    const masks = this.config.getMasks();
    this._segmentId = (this.value >> shift) & masks.segmentMask;
    this._pageId = (this.value >> this.config.getOffsetBits()) & masks.pageMask;
    this._offset = this.value & masks.offsetMask;

    Object.freeze(this);
  }

  /**
   * Factory: Crear desde componentes individuales
   * @static
   * @param {number} segmentId - ID del segmento
   * @param {number} pageId - ID de la página
   * @param {number} offset - Offset dentro de la página
   * @returns {LogicalAddress}
   */
  static fromComponents(segmentId, pageId, offset) {
    const config = ArchitectureConfig.getInstance();
    
    // Validar rangos
    if (segmentId < 0 || segmentId >= config.getMaxSegments()) {
      throw new Error(`segmentId ${segmentId} fuera de rango`);
    }
    if (pageId < 0 || pageId >= config.getPagesPerSegment()) {
      throw new Error(`pageId ${pageId} fuera de rango`);
    }
    if (offset < 0 || offset >= config.getPageSize()) {
      throw new Error(`offset ${offset} fuera de rango`);
    }

    // Construir valor combinando componentes con shifts
    const value = (segmentId << (config.getPageBits() + config.getOffsetBits())) |
                  (pageId << config.getOffsetBits()) |
                  offset;

    return new LogicalAddress(value);
  }

  /**
   * Factory: Crear desde un valor numérico
   * @static
   * @param {number} value - Valor de dirección lógica
   * @returns {LogicalAddress}
   */
  static fromValue(value) {
    return new LogicalAddress(value);
  }

  /**
   * Extrae el ID del segmento
   * @returns {number}
   */
  getSegmentId() {
    return this._segmentId;
  }

  /**
   * Extrae el ID de la página
   * @returns {number}
   */
  getPageId() {
    return this._pageId;
  }

  /**
   * Extrae el offset dentro de la página
   * @returns {number}
   */
  getOffset() {
    return this._offset;
  }

  /**
   * Obtiene el valor completo
   * @returns {number}
   */
  getValue() {
    return this.value;
  }

  /**
   * Comparación de igualdad
   * @param {LogicalAddress} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof LogicalAddress)) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * Representación hexadecimal
   * @returns {string}
   */
  toHexString() {
    return '0x' + this.value.toString(16).padStart(8, '0').toUpperCase();
  }

  /**
   * Representación binaria
   * @returns {string}
   */
  toBinaryString() {
    return this.value.toString(2).padStart(32, '0');
  }

  /**
   * Representación desglosada (para debugging)
   * @returns {string}
   */
  toDebugString() {
    return `LogicalAddress {
  value: ${this.toHexString()} (${this.value} decimal)
  segmentId: ${this.getSegmentId()}
  pageId: ${this.getPageId()}
  offset: ${this.getOffset()}
}`;
  }

  /**
   * Representación estándar
   * @returns {string}
   */
  toString() {
    return this.toHexString();
  }
}

export default LogicalAddress;
