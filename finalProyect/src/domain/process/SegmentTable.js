/**
 * SegmentTable.js
 * 
 * RESPONSABILIDAD: Tabla de segmentos del proceso (primer nivel de
 * traducción de direcciones).
 * 
 * Mapea:
 * Segment ID (de dirección lógica) → Descriptor de Segmento
 * 
 * El descriptor contiene:
 * - Base address (ubicación en RAM)
 * - Límite (tamaño)
 * - Tabla de páginas del segmento
 * 
 * PATRÓN: Entity (agregador de segmentos)
 * DEPENDENCIAS: Segment
 * CONTENIDA POR: PCB (del Process)
 * UTILIZADA POR: AddressTranslator, MMU
 */

class SegmentTable {
  /**
   * Constructor
   * @param {number} processId - PID del proceso propietario
   */
  constructor(processId) {
    this.processId = processId;
    this.segments = new Map(); // Map<segmentId, Segment>
    this.nextSegmentId = 0;
  }

  /**
   * Obtiene el PID propietario
   * @returns {number}
   */
  getProcessId() {
    return this.processId;
  }

  /**
   * Añade un segmento a la tabla
   * @param {Segment} segment
   */
  addSegment(segment) {
    const segmentId = segment.getId();
    if (this.segments.has(segmentId)) {
      throw new Error(`Segmento ${segmentId} ya existe`);
    }
    this.segments.set(segmentId, segment);
  }

  /**
   * Obtiene un segmento por ID
   * @param {number} segmentId
   * @returns {Segment}
   */
  getSegment(segmentId) {
    return this.segments.get(segmentId) || null;
  }

  /**
   * Verifica si existe un segmento
   * @param {number} segmentId
   * @returns {boolean}
   */
  hasSegment(segmentId) {
    return this.segments.has(segmentId);
  }

  /**
   * Remueve un segmento
   * @param {number} segmentId
   */
  removeSegment(segmentId) {
    this.segments.delete(segmentId);
  }

  /**
   * Obtiene todos los segmentos
   * @returns {Array<Segment>}
   */
  getAllSegments() {
    return Array.from(this.segments.values());
  }

  /**
   * Obtiene cantidad de segmentos
   * @returns {number}
   */
  getSegmentCount() {
    return this.segments.size;
  }

  /**
   * Obtiene memoria total utilizada por segmentos
   * @returns {number}
   */
  getTotalMemory() {
    let total = 0;
    for (const segment of this.segments.values()) {
      total += segment.getSizeBytes();
    }
    return total;
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `SegmentTable {
  processId: ${this.processId},
  segmentCount: ${this.segments.size},
  totalMemory: ${this.getTotalMemory()} bytes
}`;
  }
}

export default SegmentTable;
