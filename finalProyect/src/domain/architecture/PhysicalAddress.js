/**
 * PhysicalAddress.js
 * 
 * RESPONSABILIDAD: Value Object que representa una dirección física
 * (ubicación real en RAM).
 * 
 * Resultado final del proceso de traducción:
 * Dirección Lógica → (a través de tablas) → Dirección Física
 * 
 * PATRÓN: Value Object inmutable
 * DEPENDENCIAS: ArchitectureConfig
 * CREADA POR: AddressTranslator
 * UTILIZADA POR: MMU, RAM
 */

import ArchitectureConfig from './ArchitectureConfig.js';

class PhysicalAddress {
  /**
   * Constructor
   * @param {number} address - Dirección física (0 a totalRAMBytes - 1)
   */
  constructor(address) {
    const config = ArchitectureConfig.getInstance();
    
    if (typeof address !== 'number' || address < 0 || address >= config.getTotalRAMBytes()) {
      throw new Error(`PhysicalAddress ${address} debe estar en rango [0, ${config.getTotalRAMBytes() - 1}]`);
    }

    this.address = Math.floor(address);
    this.config = config;

    Object.freeze(this);
  }

  /**
   * Factory: Crear desde número de marco y offset
   * @static
   * @param {number} frameNumber - Número de marco
   * @param {number} offset - Offset dentro del marco
   * @returns {PhysicalAddress}
   */
  static fromFrameAndOffset(frameNumber, offset) {
    const config = ArchitectureConfig.getInstance();

    if (frameNumber < 0 || frameNumber >= config.getTotalFrames()) {
      throw new Error(`frameNumber ${frameNumber} fuera de rango`);
    }
    if (offset < 0 || offset >= config.getPageSize()) {
      throw new Error(`offset ${offset} fuera de rango`);
    }

    const address = (frameNumber * config.getPageSize()) + offset;
    return new PhysicalAddress(address);
  }

  /**
   * Obtiene el número de marco
   * @returns {number}
   */
  getFrameNumber() {
    return Math.floor(this.address / this.config.getPageSize());
  }

  /**
   * Obtiene el offset dentro del marco
   * @returns {number}
   */
  getOffset() {
    return this.address % this.config.getPageSize();
  }

  /**
   * Obtiene la dirección completa
   * @returns {number}
   */
  getAddress() {
    return this.address;
  }

  /**
   * Comparación de igualdad
   * @param {PhysicalAddress} other
   * @returns {boolean}
   */
  equals(other) {
    if (!(other instanceof PhysicalAddress)) {
      return false;
    }
    return this.address === other.address;
  }

  /**
   * Representación hexadecimal
   * @returns {string}
   */
  toHexString() {
    return '0x' + this.address.toString(16).padStart(8, '0').toUpperCase();
  }

  /**
   * Representación desglosada (para debugging)
   * @returns {string}
   */
  toDebugString() {
    return `PhysicalAddress {
  address: ${this.toHexString()} (${this.address} decimal)
  frameNumber: ${this.getFrameNumber()}
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

export default PhysicalAddress;
