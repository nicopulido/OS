/**
 * Page.js
 * 
 * RESPONSABILIDAD: Una página individual dentro de una tabla de páginas.
 * 
 * Una página es el mapeo final:
 * Page ID (lógica) → Frame Number (física)
 * 
 * Propiedades:
 * - page number: ID dentro de la tabla de páginas del segmento
 * - frame number: ID del marco en RAM donde está la página
 * - presente: ¿está en RAM o en disco?
 * - dirty: ¿ha sido modificada?
 * - estadísticas: accesos, último acceso
 * 
 * PATRÓN: Entity (identidad por pageNumber)
 * DEPENDENCIAS: Ninguna directa
 * CONTENIDA POR: PageTable
 * UTILIZADA POR: AddressTranslator
 */

class Page {
  /**
   * Constructor
   * @param {number} pageNumber - ID de la página
   * @param {number} frameNumber - Número de marco donde reside
   */
  constructor(pageNumber, frameNumber = null) {
    this.pageNumber = pageNumber;
    this.frameNumber = frameNumber; // null si está en disco
    
    // Estado de la página
    this.present = frameNumber !== null; // ¿Está en RAM?
    this.dirty = false;               // ¿Has sido modificada?
    
    // Estadísticas
    this.accessCount = 0;
    this.lastAccessTime = Date.now();
  }

  /**
   * Obtiene el número de página
   * @returns {number}
   */
  getPageNumber() {
    return this.pageNumber;
  }

  /**
   * Obtiene el número de marco
   * @returns {number}
   */
  getFrameNumber() {
    return this.frameNumber;
  }

  /**
   * Establece el número de marco
   * @param {number} frameNumber
   */
  setFrameNumber(frameNumber) {
    this.frameNumber = frameNumber;
    this.present = frameNumber !== null;
  }

  /**
   * Verifica si la página está presente en RAM
   * @returns {boolean}
   */
  isPresent() {
    return this.present;
  }

  /**
   * Marca la página como present
   */
  markPresent() {
    this.present = true;
  }

  /**
   * Marca la página como not present (en disco)
   */
  markNotPresent() {
    this.present = false;
  }

  /**
   * Verifica si la página es dirty (modificada)
   * @returns {boolean}
   */
  isDirty() {
    return this.dirty;
  }

  /**
   * Marca la página como dirty
   */
  markDirty() {
    this.dirty = true;
  }

  /**
   * Marca la página como clean
   */
  markClean() {
    this.dirty = false;
  }

  /**
   * Registra un acceso a la página
   */
  recordAccess() {
    this.accessCount++;
    this.lastAccessTime = Date.now();
  }

  /**
   * Obtiene cantidad de accesos
   * @returns {number}
   */
  getAccessCount() {
    return this.accessCount;
  }

  /**
   * Obtiene último tiempo de acceso
   * @returns {number}
   */
  getLastAccessTime() {
    return this.lastAccessTime;
  }

  /**
   * Obtiene información de la página
   * @returns {object}
   */
  getInfo() {
    return {
      pageNumber: this.pageNumber,
      frameNumber: this.frameNumber,
      present: this.present,
      dirty: this.dirty,
      accessCount: this.accessCount,
      lastAccessTime: this.lastAccessTime
    };
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `Page {
  pageNumber: ${this.pageNumber},
  frameNumber: ${this.frameNumber},
  present: ${this.present},
  dirty: ${this.dirty},
  accessCount: ${this.accessCount}
}`;
  }
}

export default Page;
