/**
 * ExampleApplicationUsage.js
 * 
 * EJEMPLO: Cómo consumir la capa de Aplicación desde una API o interfaz gráfica
 * 
 * Esta es la CAPA DE PRESENTACIÓN que no interactúa directamente con el dominio
 * sino con los servicios de aplicación
 */

import {
  ConfigureArchitectureService,
  CreateProcessService,
  LoadProcessIntoMemoryService,
  RemoveProcessFromMemoryService,
  TranslateAddressService,
  MemoryVisualizationService,
  ProcessVisualizationService,
  SegmentTableService,
  PageTableService,
} from '../application/index.js';

/**
 * EJEMPLO: API REST que consumiría estos servicios
 */
export class SimulatorAPI {
  constructor() {
    // Instanciar servicios
    this.architectureService = new ConfigureArchitectureService();
    this.processService = new CreateProcessService();
    this.loadService = new LoadProcessIntoMemoryService();
    this.removeService = new RemoveProcessFromMemoryService();
    this.addressService = new TranslateAddressService();
    this.memoryVisualization = new MemoryVisualizationService();
    this.processVisualization = new ProcessVisualizationService();
    this.segmentService = new SegmentTableService();
    this.pageService = new PageTableService();
  }

  /**
   * ENDPOINTS DE CONFIGURACIÓN
   */

  getSystemInfo() {
    return this.architectureService.getArchitectureInfo();
  }

  getMemoryConfig() {
    return this.architectureService.getMemoryConfiguration();
  }

  getAddressingScheme() {
    return this.architectureService.getAddressingScheme();
  }

  validateArchitecture() {
    return this.architectureService.validateArchitecture();
  }

  /**
   * ENDPOINTS DE PROCESOS
   */

  createNewProcess(name, segments) {
    return this.processService.createProcess(name, segments);
  }

  createProcessWithDefaults(name) {
    return this.processService.createProcessWithDefaults(name);
  }

  getAllProcesses() {
    return this.processVisualization.getProcessList();
  }

  getProcessDetail(pid) {
    return this.processVisualization.getProcessDetail(pid);
  }

  removeProcess(pid) {
    return this.removeService.removeProcess(pid);
  }

  removeAllProcesses() {
    return this.removeService.removeAllProcesses();
  }

  /**
   * ENDPOINTS DE MEMORIA
   */

  getMemoryStatus() {
    return this.memoryVisualization.getMemoryStatus();
  }

  getMemoryLayout() {
    return this.memoryVisualization.getMemoryLayout();
  }

  getFrameInfo(frameNumber) {
    return this.memoryVisualization.getFrameInfo(frameNumber);
  }

  getFragmentation() {
    return this.memoryVisualization.getFragmentation();
  }

  getMemoryASCII(maxRows) {
    return this.memoryVisualization.getASCIIVisualization(maxRows);
  }

  /**
   * ENDPOINTS DE CARGA DE MEMORIA
   */

  loadProcessIntoMemory(pid, strategy) {
    return this.loadService.loadProcessIntoMemory(pid, strategy);
  }

  preloadSegment(pid, segmentId) {
    return this.loadService.preloadSegment(pid, segmentId);
  }

  loadPageOnDemand(pid, segmentId, pageId) {
    return this.loadService.loadPageOnDemand(pid, segmentId, pageId);
  }

  getLoadStatus(pid) {
    return this.loadService.getLoadStatus(pid);
  }

  /**
   * ENDPOINTS DE TRADUCCIÓN DE DIRECCIONES
   */

  translateAddress(pid, logicalAddress) {
    return this.addressService.translateAddress(pid, logicalAddress);
  }

  translateAddresses(pid, logicalAddresses) {
    return this.addressService.translateAddresses(pid, logicalAddresses);
  }

  validateAddress(pid, logicalAddress, accessType) {
    return this.addressService.validateAddress(pid, logicalAddress, accessType);
  }

  getTLBStats(pid) {
    return this.addressService.getTLBStats(pid);
  }

  flushTLB(pid) {
    return this.addressService.flushTLB(pid);
  }

  /**
   * ENDPOINTS DE SEGMENTACIÓN
   */

  getSegmentTable(pid) {
    return this.segmentService.getSegmentTable(pid);
  }

  getSegment(pid, segmentId) {
    return this.segmentService.getSegment(pid, segmentId);
  }

  getAllSegments(pid) {
    return this.segmentService.getAllSegments(pid);
  }

  getSegmentStats(pid, segmentId) {
    return this.segmentService.getSegmentStats(pid, segmentId);
  }

  /**
   * ENDPOINTS DE PAGINACIÓN
   */

  getPageTable(pid, segmentId) {
    return this.pageService.getPageTable(pid, segmentId);
  }

  getPage(pid, segmentId, pageId) {
    return this.pageService.getPage(pid, segmentId, pageId);
  }

  getAllPages(pid, segmentId) {
    return this.pageService.getAllPages(pid, segmentId);
  }

  getPageStats(pid, segmentId, pageId) {
    return this.pageService.getPageStats(pid, segmentId, pageId);
  }

  getPageTableSummary(pid, segmentId) {
    return this.pageService.getPageTableSummary(pid, segmentId);
  }

  /**
   * ENDPOINTS DE VISUALIZACIÓN Y ANÁLISIS
   */

  getSystemStats() {
    return this.processVisualization.getSystemStats();
  }

  getProcessMemoryMap(pid) {
    return this.memoryVisualization.getProcessMemoryMap(pid);
  }

  getAllProcessesMemoryMap() {
    return this.memoryVisualization.getAllProcessesMemoryMap();
  }

  getProcessComparison() {
    return this.processVisualization.getProcessComparison();
  }

  getProcessTree() {
    return this.processVisualization.getProcessTree();
  }
}

/**
 * EJEMPLO DE USO COMO SI FUERA UNA API REST
 */
export async function exampleAPIUsage() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  EJEMPLO: USO DE LA CAPA DE APLICACIÓN');
  console.log('═══════════════════════════════════════════════════════════\n');

  const api = new SimulatorAPI();

  try {
    // 1. Obtener información de arquitectura
    console.log('1. ARQUITECTURA DEL SISTEMA');
    console.log('─'.repeat(60));
    const archInfo = api.getSystemInfo();
    console.log(`  Espacio lógico: ${archInfo.addressingScheme.logicalAddressBits} bits`);
    console.log(`  Segmentación: ${archInfo.segmentation.segmentIdBits} bits (${archInfo.segmentation.maxSegments} máx)`);
    console.log(`  Paginación: ${archInfo.paging.pageIdBits} bits, tamaño ${archInfo.paging.pageSize} bytes`);
    console.log(`  RAM: ${archInfo.memory.totalRAM / (1024 * 1024)} MiB en ${archInfo.memory.totalFrames} marcos\n`);

    // 2. Validar arquitectura
    console.log('2. VALIDACIÓN DE CONFIGURACIÓN');
    console.log('─'.repeat(60));
    const validation = api.validateArchitecture();
    console.log(`  Válida: ${validation.valid}`);
    console.log(`  Dirección: ${validation.summary.addressSpace}`);
    console.log(`  Memoria: ${validation.summary.memory}\n`);

    // 3. Crear procesos
    console.log('3. CREAR PROCESOS');
    console.log('─'.repeat(60));
    const p1 = api.createProcessWithDefaults('Chrome');
    if (!p1.success) {
      console.log(`  ❌ Error al crear proceso: ${p1.error}\n`);
      throw new Error(p1.error);
    }
    console.log(`  Proceso ${p1.pid}: ${p1.processDTO.name} - ${p1.processDTO.allocatedMemory} bytes\n`);

    const p2 = api.createProcessWithDefaults('VSCode');
    if (!p2.success) {
      console.log(`  ❌ Error al crear proceso: ${p2.error}\n`);
      throw new Error(p2.error);
    }
    console.log(`  Proceso ${p2.pid}: ${p2.processDTO.name} - ${p2.processDTO.allocatedMemory} bytes\n`);

    // 4. Estado de memoria
    console.log('4. ESTADO DE MEMORIA');
    console.log('─'.repeat(60));
    const memStatus = api.getMemoryStatus();
    console.log(`  Memoria usada: ${memStatus.usedRAM / 1024}KiB / ${memStatus.totalRAM / (1024 * 1024)}MiB`);
    console.log(`  Utilización: ${memStatus.utilizationPercent.toFixed(2)}%`);
    console.log(`  Marcos: ${memStatus.allocatedFrames} / ${memStatus.totalFrames}\n`);

    // 5. Traducción de direcciones
    console.log('5. TRADUCCIÓN DE DIRECCIONES');
    console.log('─'.repeat(60));
    const translation = api.translateAddress(p1.pid, 0x00000102);
    if (translation.success) {
      console.log(`  Dirección lógica: 0x${translation.translation.logicalAddress.toString(16).padStart(8, '0')}`);
      console.log(`  Componentes: Seg=${translation.translation.segmentId}, Page=${translation.translation.pageId}, Offset=${translation.translation.offset}`);
      console.log(`  Marco: ${translation.translation.frameNumber}`);
      console.log(`  Dirección física: 0x${translation.translation.physicalAddress.toString(16).padStart(8, '0')}\n`);
    } else {
      console.log(`  Error: ${translation.error}\n`);
    }

    // 6. Información de procesos
    console.log('6. LISTA DE PROCESOS');
    console.log('─'.repeat(60));
    const procList = api.getAllProcesses();
    procList.processes.forEach(p => {
      console.log(`  PID=${p.pid}: ${p.name} (${p.allocatedMemory} bytes, ${p.segmentCount} segmentos)`);
    });
    console.log();

    // 7. Estadísticas del sistema
    console.log('7. ESTADÍSTICAS DEL SISTEMA');
    console.log('─'.repeat(60));
    const stats = api.getSystemStats();
    console.log(`  Procesos: ${stats.processes.total}`);
    console.log(`  Memoria utilizada: ${(stats.memory.usedRAM / (1024 * 1024)).toFixed(2)}MiB`);
    console.log(`  Utilización: ${stats.memory.utilizationPercent.toFixed(2)}%\n`);

    // 8. Comparación de procesos
    console.log('8. COMPARACIÓN DE PROCESOS');
    console.log('─'.repeat(60));
    const comparison = api.getProcessComparison();
    console.log(`  Más grande: PID=${comparison.largest.pid} (${comparison.largest.memory} bytes)`);
    console.log(`  Más pequeño: PID=${comparison.smallest.pid} (${comparison.smallest.memory} bytes)`);
    console.log(`  Promedio: ${comparison.average_memory.toFixed(0)} bytes\n`);

    // 9. Mapeo de memoria
    console.log('9. MAPEO DE MEMORIA (PID=${p1.pid})');
    console.log('─'.repeat(60));
    const memMap = api.getProcessMemoryMap(p1.pid);
    if (memMap.memoryMap) {
      memMap.memoryMap.slice(0, 3).forEach(m => {
        console.log(`    Seg${m.segmentId} (${m.segmentType}) Page${m.pageId} → Frame ${m.frameNumber} @ 0x${m.physicalAddress.toString(16).padStart(8, '0')}`);
      });
      console.log(`    ... (${memMap.memoryMap.length} total)\n`);
    }

    // 10. Remover procesos
    console.log('10. REMOVER PROCESOS');
    console.log('─'.repeat(60));
    const removed = api.removeProcess(p1.pid);
    console.log(`   Eliminado PID ${removed.pid}, liberados ${(removed.freedMemory.bytes / 1024).toFixed(0)}KiB\n`);

    // 11. Estado final de memoria
    console.log('11. ESTADO FINAL DE MEMORIA');
    console.log('─'.repeat(60));
    const finalStatus = api.getMemoryStatus();
    console.log(`  Memoria usada: ${finalStatus.usedRAM / 1024}KiB / ${finalStatus.totalRAM / (1024 * 1024)}MiB`);
    console.log(`  Utilización: ${finalStatus.utilizationPercent.toFixed(2)}%\n`);

    console.log('═'.repeat(60));
    console.log('✅ DEMOSTRACIÓN COMPLETADA');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}
