/**
 * PageTable.js
 * 
 * RESPONSABILIDAD: Tabla de páginas para un segmento (segundo nivel de
 * traducción de direcciones).
 * 
 * Mapea:
 * Page ID (de dirección lógica) → Page (que contiene número de marco)
 * 
 * Cada proceso tiene una tabla de páginas POR SEGMENTO.
 * 
 * PATRÓN: Entity (agregador de páginas)
 * DEPENDENCIAS: Page
 * CONTENIDA POR: Segment
 * UTILIZADA POR: AddressTranslator
 */

class PageTable {
  /**
   * Constructor
   * @param {number} segmentId - ID del segmento propietario
   * @param {number} processId - ID del proceso propietario
   */
  constructor(segmentId, processId) {
    this.segmentId = segmentId;
    this.processId = processId;
    this.pages = new Map(); // Map<pageId, Page>
    this.baseAddressInRAM = 0; // Ubicación en RAM de esta tabla
  }

  /**
   * Obtiene el ID del segmento
   * @returns {number}
   */
  getSegmentId() {
    return this.segmentId;
  }

  /**
   * Obtiene el ID del proceso
   * @returns {number}
   */
  getProcessId() {
    return this.processId;
  }

  /**
   * Añade una página a la tabla
   * @param {Page} page
   */
  addPage(page) {
    const pageId = page.getPageNumber();
    if (this.pages.has(pageId)) {
      throw new Error(`Página ${pageId} ya existe en tabla de segmento ${this.segmentId}`);
    }
    this.pages.set(pageId, page);
  }

  /**
   * Obtiene una página por ID
   * @param {number} pageId
   * @returns {Page}
   */
  getPage(pageId) {
    return this.pages.get(pageId) || null;
  }

  /**
   * Verifica si existe una página
   * @param {number} pageId
   * @returns {boolean}
   */
  hasPage(pageId) {
    return this.pages.has(pageId);
  }

  /**
   * Remueve una página
   * @param {number} pageId
   */
  removePage(pageId) {
    this.pages.delete(pageId);
  }

  /**
   * Obtiene todas las páginas
   * @returns {Array<Page>}
   */
  getAllPages() {
    return Array.from(this.pages.values());
  }

  /**
   * Obtiene cantidad de páginas
   * @returns {number}
   */
  getPageCount() {
    return this.pages.size;
  }

  /**
   * Obtiene memoria total utilizada por páginas
   * @returns {number}
   */
  getTotalMemory() {
    // Cada página ocupa pageSize bytes
    // Esto se calcula como pageCount * pageSize
    // Pero generalmente se pasan ya las páginas con su tamaño
    return this.pages.size; // Simplemente, cantidad de páginas
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `PageTable {
  segmentId: ${this.segmentId},
  processId: ${this.processId},
  pageCount: ${this.pages.size},
  baseAddressInRAM: 0x${this.baseAddressInRAM.toString(16).padStart(8, '0')}
}`;
  }
}

export default PageTable;
