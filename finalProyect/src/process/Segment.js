/**
 * Segment.js
 * 
 * RESPONSABILIDAD: Un segmento lógico de memoria (código, datos, stack, heap, etc.)
 * 
 * Un segmento es una unidad lógica que:
 * - Tiene un ID único dentro del proceso
 * - Tiene un nombre (CODE, DATA, STACK, HEAP, etc.)
 * - Tiene un tamaño en bytes
 * - Contiene una tabla de páginas
 * - Tiene permisos (read, write, execute)
 * 
 * PATRÓN: Entity (identidad por ID dentro del proceso)
 * DEPENDENCIAS: PageTable
 * CONTENIDA POR: SegmentTable
 * UTILIZADA POR: AddressTranslator
 */

class Segment {
  /**
   * Constructor
   * @param {number} id - ID del segmento (0-255)
   * @param {string} name - Nombre (CODE, DATA, STACK, HEAP)
   * @param {number} sizeBytes - Tamaño en bytes
   */
  constructor(id, name, sizeBytes) {
    this.id = id;
    this.name = name;
    this.sizeBytes = sizeBytes;
    this.pageTable = null; // Se asigna después
    
    // Permisos
    this.permissions = {
      read: true,
      write: true,
      execute: false
    };

    // Estado
    this.isValid = true;
    this.baseAddressInRAM = 0; // Ubicación de tabla de páginas en RAM
  }

  /**
   * Obtiene el ID
   * @returns {number}
   */
  getId() {
    return this.id;
  }

  /**
   * Obtiene el nombre
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   * Obtiene tamaño en bytes
   * @returns {number}
   */
  getSizeBytes() {
    return this.sizeBytes;
  }

  /**
   * Establece la tabla de páginas
   * @param {PageTable} pageTable
   */
  setPageTable(pageTable) {
    this.pageTable = pageTable;
  }

  /**
   * Obtiene la tabla de páginas
   * @returns {PageTable}
   */
  getPageTable() {
    return this.pageTable;
  }

  /**
   * Establece permisos de lectura
   * @param {boolean} canRead
   */
  setReadPermission(canRead) {
    this.permissions.read = canRead;
  }

  /**
   * Verifica permiso de lectura
   * @returns {boolean}
   */
  canRead() {
    return this.permissions.read;
  }

  /**
   * Establece permiso de escritura
   * @param {boolean} canWrite
   */
  setWritePermission(canWrite) {
    this.permissions.write = canWrite;
  }

  /**
   * Verifica permiso de escritura
   * @returns {boolean}
   */
  canWrite() {
    return this.permissions.write;
  }

  /**
   * Establece permiso de ejecución
   * @param {boolean} canExecute
   */
  setExecutePermission(canExecute) {
    this.permissions.execute = canExecute;
  }

  /**
   * Verifica permiso de ejecución
   * @returns {boolean}
   */
  canExecute() {
    return this.permissions.execute;
  }

  /**
   * Valida acceso
   * @param {string} operation - 'read', 'write', 'execute'
   * @returns {boolean}
   */
  validateAccess(operation) {
    if (!this.isValid) {
      return false;
    }
    return this.permissions[operation] === true;
  }

  /**
   * Obtiene cantidad de páginas
   * @returns {number}
   */
  getPageCount() {
    return this.pageTable ? this.pageTable.getPageCount() : 0;
  }

  /**
   * Representación en texto
   * @returns {string}
   */
  toString() {
    return `Segment {
  id: ${this.id},
  name: '${this.name}',
  sizeBytes: ${this.sizeBytes},
  pageCount: ${this.getPageCount()},
  permissions: {read: ${this.canRead()}, write: ${this.canWrite()}, execute: ${this.canExecute()}}
}`;
  }
}

export default Segment;
