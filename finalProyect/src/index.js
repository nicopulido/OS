/**
 * index.js
 * 
 * PUNTO DE ENTRADA: Demostración de todo el sistema de Segmentación Paginada.
 * 
 * Ejecuta:
 * 1. Inicializa componentes del sistema
 * 2. Crea un ejemplo de proceso
 * 3. Demuestra estructura de memoria
 * 4. Muestra estadísticas del sistema
 */

import ArchitectureConfig from './architecture/ArchitectureConfig.js';
import RAM from './memory/RAM.js';
import OperatingSystem from './operating-system/OperatingSystem.js';
import { 
  createExampleProcess, 
  demonstrateAddressTranslation 
} from './examples/exampleProcess.js';

/**
 * Main: Ejecuta la demostración completa
 */
function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   SIMULADOR DE SEGMENTACIÓN PAGINADA - DEMOSTRACIÓN      ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  // 1. Inicializar configuración
  console.log('📋 FASE 1: INICIALIZACIÓN DE ARQUITECTURA');
  console.log('─'.repeat(60));
  
  const config = ArchitectureConfig.getInstance();
  console.log('\nConfiguración de memoria:');
  console.log(`  Dirección lógica: ${config.getLogicalAddressBits()} bits`);
  console.log(`  Dirección física: ${config.getPhysicalAddressBits()} bits`);
  console.log(`  Tamaño de página: ${config.getPageSize()} bytes (${config.getPageSize() / 1024} KiB)`);
  console.log(`  Segmentos máximos: ${config.getMaxSegments()}`);
  console.log(`  Páginas por segmento: ${config.getPagesPerSegment()}`);
  console.log(`  RAM total: ${config.getTotalRAMBytes()} bytes (${config.getTotalRAMBytes() / (1024 * 1024)} MiB)`);
  console.log(`  Marcos totales: ${config.getTotalFrames()}`);

  // 2. Inicializar RAM
  console.log('\n📋 FASE 2: INICIALIZACIÓN DE MEMORIA FÍSICA');
  console.log('─'.repeat(60));
  
  const ram = RAM.getInstance();
  console.log('\n✓ RAM inicializada');
  console.log(`  Marcos disponibles: ${ram.getAvailableFrames()}`);
  console.log(`  Utilización: ${(ram.getUtilization() * 100).toFixed(2)}%`);

  // 3. Inicializar Sistema Operativo
  console.log('\n📋 FASE 3: INICIALIZACIÓN DEL SISTEMA OPERATIVO');
  console.log('─'.repeat(60));
  
  const os = OperatingSystem.getInstance();
  console.log('✓ Sistema Operativo inicializado');
  console.log(os.toString());

  // 4. Crear proceso de ejemplo
  console.log('\n📋 FASE 4: CREACIÓN DE EJEMPLO DE PROCESO');
  console.log('─'.repeat(60));
  
  const process = createExampleProcess();

  // 5. Demostración de traducción
  console.log('\n📋 FASE 5: DEMOSTRACIÓN DE TRADUCCIÓN DE DIRECCIONES');
  console.log('─'.repeat(60));
  
  demonstrateAddressTranslation();

  // 6. Estadísticas finales
  console.log('\n📋 FASE 6: ESTADÍSTICAS FINALES DEL SISTEMA');
  console.log('─'.repeat(60));
  
  const memoryInfo = ram.getMemoryInfo();
  console.log('\nEstadísticas de RAM:');
  Object.entries(memoryInfo).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  const info = os.getSystemInfo();
  console.log('\nEstadísticas del Sistema Operativo:');
  Object.entries(info).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // 7. Información de estructura
  console.log('\n📋 INFORMACIÓN DE ESTRUCTURA');
  console.log('─'.repeat(60));
  
  console.log('\n📁 Jerarquía de objetos del proceso:');
  console.log('Process');
  console.log('  └─ PCB (Process Control Block)');
  console.log('  └─ SegmentTable');
  console.log(`       ├─ Segment 0: CODE`);
  console.log(`       │    └─ PageTable (2 páginas)`);
  console.log(`       │         ├─ Page 0 → Frame 0`);
  console.log(`       │         └─ Page 1 → Frame 1`);
  console.log(`       ├─ Segment 1: DATA`);
  console.log(`       │    └─ PageTable (2 páginas)`);
  console.log(`       │         ├─ Page 0 → Frame 2`);
  console.log(`       │         └─ Page 1 → Frame 3`);
  console.log(`       └─ Segment 2: STACK`);
  console.log(`            └─ PageTable (4 páginas)`);
  console.log(`                 ├─ Page 0 → Frame 4`);
  console.log(`                 ├─ Page 1 → Frame 5`);
  console.log(`                 ├─ Page 2 → Frame 6`);
  console.log(`                 └─ Page 3 → Frame 7`);

  console.log('\n✅ DEMOSTRACIÓN COMPLETADA');
  console.log('═'.repeat(60));

  return {
    config,
    ram,
    os,
    process
  };
}

// Ejecutar
const systemState = main();

// Exportar para uso en otros módulos
export { systemState };
export default main;
