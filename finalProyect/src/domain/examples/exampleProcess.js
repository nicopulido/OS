/**
 * exampleProcess.js
 * 
 * EJEMPLO: Demostración de creación de un proceso con segmentos.
 * 
 * Este archivo muestra cómo:
 * 1. Crear un proceso
 * 2. Crear segmentos (CODE, DATA, STACK)
 * 3. Crear tablas de páginas para cada segmento
 * 4. Crear páginas dentro de esas tablas
 * 5. Asignar marcos a páginas
 */

import Process from '../process/Process.js';
import SegmentTable from '../process/SegmentTable.js';
import Segment from '../process/Segment.js';
import PageTable from '../process/PageTable.js';
import Page from '../process/Page.js';
import ArchitectureConfig from '../architecture/ArchitectureConfig.js';
import RAM from '../memory/RAM.js';

/**
 * Crea un ejemplo de proceso con estructura completa
 * 
 * @returns {Process} Proceso configurado
 */
export function createExampleProcess() {
  const config = ArchitectureConfig.getInstance();
  const ram = RAM.getInstance();

  // 1. Crear proceso
  const process = new Process(1, 'ExampleApp');
  process.setState('READY');

  console.log('✓ Proceso creado:', process.toString());

  // 2. Crear tabla de segmentos
  const segmentTable = new SegmentTable(process.getPid());
  process.setSegmentTable(segmentTable);

  console.log('\n✓ Tabla de segmentos creada');

  // ============================================
  // SEGMENTO 0: CODE (Código ejecutable)
  // ============================================
  const codeSegment = new Segment(0, 'CODE', 8192); // 8 KiB
  codeSegment.setReadPermission(true);
  codeSegment.setWritePermission(false);
  codeSegment.setExecutePermission(true);

  // Crear tabla de páginas para segmento CODE
  const codePageTable = new PageTable(0, process.getPid());
  codePageTable.baseAddressInRAM = 0x1000; // Ubicación en RAM
  codeSegment.setPageTable(codePageTable);

  // Crear páginas en segmento CODE (8 KiB / 4 KiB = 2 páginas)
  for (let i = 0; i < 2; i++) {
    const page = new Page(i);
    
    // Asignar marco disponible
    if (i === 0) {
      page.setFrameNumber(0);
      ram.allocateFrame(0, process.getPid(), 0, i);
    } else if (i === 1) {
      page.setFrameNumber(1);
      ram.allocateFrame(1, process.getPid(), 0, i);
    }
    
    page.markPresent();
    codePageTable.addPage(page);
  }

  segmentTable.addSegment(codeSegment);
  console.log('✓ Segmento CODE creado con', codePageTable.getPageCount(), 'páginas');

  // ============================================
  // SEGMENTO 1: DATA (Datos globales)
  // ============================================
  const dataSegment = new Segment(1, 'DATA', 8192); // 8 KiB
  dataSegment.setReadPermission(true);
  dataSegment.setWritePermission(true);
  dataSegment.setExecutePermission(false);

  // Crear tabla de páginas para segmento DATA
  const dataPageTable = new PageTable(1, process.getPid());
  dataPageTable.baseAddressInRAM = 0x2000; // Ubicación en RAM
  dataSegment.setPageTable(dataPageTable);

  // Crear páginas en segmento DATA (8 KiB / 4 KiB = 2 páginas)
  for (let i = 0; i < 2; i++) {
    const page = new Page(i);
    
    // Asignar marco disponible
    if (i === 0) {
      page.setFrameNumber(2);
      ram.allocateFrame(2, process.getPid(), 1, i);
    } else if (i === 1) {
      page.setFrameNumber(3);
      ram.allocateFrame(3, process.getPid(), 1, i);
    }
    
    page.markPresent();
    dataPageTable.addPage(page);
  }

  segmentTable.addSegment(dataSegment);
  console.log('✓ Segmento DATA creado con', dataPageTable.getPageCount(), 'páginas');

  // ============================================
  // SEGMENTO 2: STACK (Pila del proceso)
  // ============================================
  const stackSegment = new Segment(2, 'STACK', 16384); // 16 KiB
  stackSegment.setReadPermission(true);
  stackSegment.setWritePermission(true);
  stackSegment.setExecutePermission(false);

  // Crear tabla de páginas para segmento STACK
  const stackPageTable = new PageTable(2, process.getPid());
  stackPageTable.baseAddressInRAM = 0x3000; // Ubicación en RAM
  stackSegment.setPageTable(stackPageTable);

  // Crear páginas en segmento STACK (16 KiB / 4 KiB = 4 páginas)
  for (let i = 0; i < 4; i++) {
    const page = new Page(i);
    
    // Asignar marco disponible
    const frameNumber = 4 + i;
    page.setFrameNumber(frameNumber);
    ram.allocateFrame(frameNumber, process.getPid(), 2, i);
    
    page.markPresent();
    stackPageTable.addPage(page);
  }

  segmentTable.addSegment(stackSegment);
  console.log('✓ Segmento STACK creado con', stackPageTable.getPageCount(), 'páginas');

  // ============================================
  // ESTADÍSTICAS DEL PROCESO
  // ============================================
  console.log('\n' + '='.repeat(50));
  console.log('RESUMEN DEL PROCESO');
  console.log('='.repeat(50));

  const totalSegments = segmentTable.getSegmentCount();
  const totalMemory = segmentTable.getTotalMemory();
  
  console.log(`Proceso: ${process.getName()} (PID: ${process.getPid()})`);
  console.log(`Segmentos: ${totalSegments}`);
  console.log(`Memoria total: ${totalMemory} bytes`);
  
  console.log('\nDetalle de segmentos:');
  segmentTable.getAllSegments().forEach(segment => {
    const pageTable = segment.getPageTable();
    const pageCount = pageTable.getPageCount();
    console.log(`  - ${segment.getName()}: ${segment.getSizeBytes()} bytes, ${pageCount} páginas`);
    
    // Listar páginas del segmento
    pageTable.getAllPages().forEach(page => {
      console.log(`    Página ${page.getPageNumber()} → Marco ${page.getFrameNumber()} (presente: ${page.isPresent()})`);
    });
  });

  console.log('\nUso de RAM:');
  console.log(`  Marcos asignados: ${ram.getAllocatedFrames()}/${ram.getTotalFrames()}`);
  console.log(`  Utilización: ${(ram.getUtilization() * 100).toFixed(2)}%`);

  return process;
}

/**
 * Demuestra traducción de dirección lógica
 */
export function demonstrateAddressTranslation() {
  console.log('\n' + '='.repeat(50));
  console.log('DEMOSTRACIÓN DE TRADUCCIÓN DE DIRECCIÓN');
  console.log('='.repeat(50));

  const config = ArchitectureConfig.getInstance();
  console.log(`\nConfiguración de arquitectura:`);
  console.log(`  - Bits de segmento: ${config.getSegmentBits()}`);
  console.log(`  - Bits de página: ${config.getPageBits()}`);
  console.log(`  - Bits de offset: ${config.getOffsetBits()}`);
  console.log(`  - Tamaño de página: ${config.getPageSize()} bytes`);

  // Ejemplo: dirección lógica 0x00000102
  // Segmento 0, Página 1, Offset 2
  console.log(`\nEjemplo de dirección lógica: 0x00000102`);
  console.log(`  Desglose binario: [00][01][02]`);
  console.log(`  - Segmento ID: 0`);
  console.log(`  - Página ID: 1`);
  console.log(`  - Offset: 2`);
  console.log(`\nTraducciones esperadas:`);
  console.log(`  Segmento 0 (CODE) → Tabla de Páginas del Código`);
  console.log(`  Página 1 → Marco 1 (segundo marco del segmento CODE)`);
  console.log(`  Dirección física = (Marco 1 * Page Size) + Offset`);
  console.log(`  Dirección física = (1 * 4096) + 2 = 4098`);
  console.log(`  Dirección física = 0x00001002`);
}

export default { createExampleProcess, demonstrateAddressTranslation };
