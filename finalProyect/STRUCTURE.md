/**
 * STRUCTURE.md
 * 
 * Árbol completo de carpetas y archivos del proyecto
 * Simulador de Segmentación Paginada
 */

# 📁 Estructura Completa del Proyecto

```
finalProyect/
│
├── 📄 package.json                              # Configuración del proyecto Node.js
├── 📄 README.md                                 # Documentación principal
│
└── 📂 src/                                      # Código fuente principal
    │
    ├── 📂 architecture/                         # Configuración y direcciones
    │   ├── ArchitectureConfig.js               # [Singleton] Configuración global
    │   │   RESPONSABILIDAD: Define toda la arquitectura de memoria
    │   │   ATRIBUTOS: bits, tamaño de página, límites
    │   │   MÉTODOS: getters de configuración, cálculo de máscaras
    │   │
    │   ├── LogicalAddress.js                   # [Value Object] Dirección lógica
    │   │   RESPONSABILIDAD: Representa dirección emitida por proceso
    │   │   ATRIBUTOS: value (32 bits), config
    │   │   MÉTODOS: getSegmentId(), getPageId(), getOffset()
    │   │
    │   └── PhysicalAddress.js                  # [Value Object] Dirección física
    │       RESPONSABILIDAD: Representa ubicación real en RAM
    │       ATRIBUTOS: address (ubicación en bytes)
    │       MÉTODOS: getFrameNumber(), getOffset()
    │
    ├── 📂 operating-system/                     # Sistema operativo
    │   ├── OperatingSystem.js                  # [Singleton Orchestrator] SO principal
    │   │   RESPONSABILIDAD: Orquesta procesos, memoria, traducción
    │   │   ATRIBUTOS: processes, ram, mmu
    │   │   MÉTODOS: createProcess(), terminateProcess(), readMemory(), writeMemory()
    │   │
    │   └── PCB.js                              # [Entity] Bloque de control del proceso
    │       RESPONSABILIDAD: Información de estado y recursos del proceso
    │       ATRIBUTOS: pid, state, segmentTable, allocatedMemory
    │       MÉTODOS: setState(), allocateMemory(), recordPageFault()
    │
    ├── 📂 process/                              # Estructuras de proceso
    │   ├── Process.js                          # [Entity] Proceso del SO
    │   │   RESPONSABILIDAD: Representa un proceso en ejecución
    │   │   ATRIBUTOS: pid, name, pcb, segmentTable
    │   │   MÉTODOS: getPid(), getName(), readMemory(), writeMemory()
    │   │
    │   ├── SegmentTable.js                     # [Entity] Tabla de segmentos
    │   │   RESPONSABILIDAD: Primer nivel de traducción (segment → PageTable)
    │   │   ATRIBUTOS: segments (Map), processId
    │   │   MÉTODOS: addSegment(), getSegment(), getAllSegments()
    │   │
    │   ├── Segment.js                          # [Entity] Segmento lógico
    │   │   RESPONSABILIDAD: Un segmento (CODE, DATA, STACK, HEAP)
    │   │   ATRIBUTOS: id, name, sizeBytes, pageTable, permissions
    │   │   MÉTODOS: getPageTable(), canRead(), canWrite(), canExecute()
    │   │
    │   ├── PageTable.js                        # [Entity] Tabla de páginas
    │   │   RESPONSABILIDAD: Segundo nivel de traducción (page → frame)
    │   │   ATRIBUTOS: pages (Map), segmentId, processId
    │   │   MÉTODOS: addPage(), getPage(), getAllPages()
    │   │
    │   └── Page.js                             # [Entity] Página individual
    │       RESPONSABILIDAD: Mapeo página lógica → marco físico
    │       ATRIBUTOS: pageNumber, frameNumber, present, dirty
    │       MÉTODOS: getFrameNumber(), isPresent(), markDirty(), recordAccess()
    │
    ├── 📂 memory/                               # Memoria física
    │   ├── RAM.js                              # [Singleton Entity] Memoria RAM
    │   │   RESPONSABILIDAD: Gestión de memoria física (16 MiB)
    │   │   ATRIBUTOS: memory (Uint8Array), frames (Map)
    │   │   MÉTODOS: read(), write(), allocateFrame(), deallocateFrame()
    │   │
    │   └── Frame.js                            # [Entity] Marco individual
    │       RESPONSABILIDAD: Un marco de 4 KiB en RAM
    │       ATRIBUTOS: frameNumber, occupied, processId
    │       MÉTODOS: allocate(), deallocate(), recordAccess()
    │
    ├── 📂 mmu/                                  # Memory Management Unit
    │   └── MMU.js                              # [Service] Traductor de direcciones
    │       RESPONSABILIDAD: Traducción lógica → física + caché TLB
    │       ATRIBUTOS: tlb (caché), statistics
    │       MÉTODOS: translate(), readMemory(), writeMemory(), flushTLB()
    │
    ├── 📂 examples/                             # Ejemplos
    │   └── exampleProcess.js                   # Demostración de creación de proceso
    │       FUNCIONES:
    │         - createExampleProcess(): Crea proceso con segmentos
    │         - demonstrateAddressTranslation(): Muestra traducción
    │
    └── index.js                                # [Main Entry Point] Punto de entrada
        RESPONSABILIDAD: Demostración completa del sistema
        FUNCIONES: main() - ejecuta todas las fases


═══════════════════════════════════════════════════════════════════════════════
ESTADÍSTICAS DEL PROYECTO
═════════════════════════════════════════════════════════════════════════════

ARCHIVOS:
  - Total de archivos: 16
  - Archivos .js: 15
  - Archivos .json: 1
  - Archivos .md: 2 (README.md + STRUCTURE.md)

CARPETAS:
  - Total de carpetas: 8
    - src/
    - src/architecture/
    - src/operating-system/
    - src/process/
    - src/memory/
    - src/mmu/
    - src/examples/

CLASES (15 clases):
  - Arquitectura: 3 (ArchitectureConfig, LogicalAddress, PhysicalAddress)
  - SO: 2 (OperatingSystem, PCB)
  - Proceso: 5 (Process, SegmentTable, Segment, PageTable, Page)
  - Memoria: 2 (RAM, Frame)
  - Servicios: 1 (MMU)
  - Ejemplos: 1 (exampleProcess) + Main

PATRONES DE DISEÑO UTILIZADOS:
  ✓ Singleton: ArchitectureConfig, OperatingSystem, RAM
  ✓ Value Object: LogicalAddress, PhysicalAddress
  ✓ Entity: Process, PCB, SegmentTable, Segment, PageTable, Page, Frame
  ✓ Service: MMU
  ✓ Factory: LogicalAddress.fromComponents(), PhysicalAddress.fromFrameAndOffset()
  ✓ Repository: ProcessRepository (en diseño)
  ✓ Orchestrator: OperatingSystem


═══════════════════════════════════════════════════════════════════════════════
ESTRUCTURA JERÁRQUICA DEL SISTEMA
═════════════════════════════════════════════════════════════════════════════

ArchitectureConfig (Singleton)
    ↑
    ├─ LogicalAddress (utiliza para máscaras)
    ├─ PhysicalAddress (utiliza para cálculos)
    ├─ RAM (utiliza para pageSize, totalFrames)
    ├─ SegmentTable (utiliza para límites)
    ├─ PageTable (utiliza para límites)
    └─ MMU (utiliza para traducción)

OperatingSystem (Singleton)
    ├─ RAM (referencia)
    ├─ MMU (referencia)
    └─ Process[] (gestiona)
        └─ PCB (contiene)
            └─ SegmentTable (contiene)
                └─ Segment[] (contiene)
                    ├─ PageTable (contiene)
                    │   └─ Page[] (contiene)
                    │       └─ frameNumber → Frame (en RAM)
                    └─ Permisos (read, write, execute)

RAM (Singleton)
    └─ Frame[] (contiene 4096 marcos)
        ├─ memory[4096] (datos)
        ├─ frameNumber
        ├─ occupied
        └─ ownerInfo {processId, segmentId, pageNumber}

MMU (Service, usada por OperatingSystem)
    ├─ tlb (caché de traducciones)
    ├─ translate(process, logicalAddress) → physicalAddress
    └─ read/writeMemory()


═══════════════════════════════════════════════════════════════════════════════
FLUJO DE TRADUCCIÓN DE DIRECCIONES
═════════════════════════════════════════════════════════════════════════════

Proceso solicita: readMemory(logicalAddress)
    ↓
OperatingSystem.readMemory() → MMU.readMemory()
    ↓
MMU.translate(process, logicalAddress)
    ├─ Verificar TLB (caché)
    │   ├─ Si hit: retornar cached physicalAddress
    │   └─ Si miss: continuar...
    │
    ├─ Extraer componentes (usando ArchitectureConfig):
    │   ├─ segmentId = (logicalAddress >> (pageBits + offsetBits)) & segmentMask
    │   ├─ pageId = (logicalAddress >> offsetBits) & pageMask
    │   └─ offset = logicalAddress & offsetMask
    │
    ├─ Validar segmento:
    │   ├─ process.segmentTable.getSegment(segmentId)
    │   └─ Verificar permisos
    │
    ├─ Obtener tabla de páginas del segmento:
    │   └─ segment.getPageTable()
    │
    ├─ Validar página en tabla:
    │   ├─ pageTable.getPage(pageId)
    │   └─ Verificar if present en RAM
    │
    ├─ Obtener número de marco:
    │   └─ page.getFrameNumber()
    │
    ├─ Calcular dirección física:
    │   └─ physicalAddress = (frameNumber * pageSize) + offset
    │
    ├─ Almacenar en TLB:
    │   └─ tlb[logicalAddress] = physicalAddress
    │
    └─ Leer de RAM:
        └─ ram.read(physicalAddress, size)
            ├─ Validar rango
            └─ Retornar bytes[] desde memory[]


═════════════════════════════════════════════════════════════════════════════
EJEMPLO PRÁCTICO: CREAR PROCESO CON 3 SEGMENTOS
═════════════════════════════════════════════════════════════════════════════

1. OperatingSystem.createProcess("Firefox")
   ├─ Generar PID = 1
   ├─ Crear Process(1, "Firefox")
   ├─ Crear PCB(1)
   └─ Crear SegmentTable(1)

2. Para cada segmento (CODE, DATA, STACK):
   ├─ Crear Segment(id, name, size)
   ├─ Crear PageTable(segmentId, processId)
   ├─ Para cada página:
   │   ├─ Crear Page(pageId)
   │   ├─ Obtener marco disponible de RAM
   │   ├─ page.setFrameNumber(frame)
   │   └─ ram.allocateFrame(frame, processId, segmentId, pageId)
   └─ segmentTable.addSegment(segment)

3. Resultado: Proceso con toda estructura lógica mapeada a física
   Process(1)
   ├─ PCB
   └─ SegmentTable
       ├─ Segment(0, "CODE", 8192)
       │   └─ PageTable
       │       ├─ Page(0) → Frame 0
       │       └─ Page(1) → Frame 1
       ├─ Segment(1, "DATA", 8192)
       │   └─ PageTable
       │       ├─ Page(0) → Frame 2
       │       └─ Page(1) → Frame 3
       └─ Segment(2, "STACK", 16384)
           └─ PageTable
               ├─ Page(0) → Frame 4
               ├─ Page(1) → Frame 5
               ├─ Page(2) → Frame 6
               └─ Page(3) → Frame 7


═════════════════════════════════════════════════════════════════════════════
DIVISIÓN DE DIRECCIÓN LÓGICA DE 32 BITS
═════════════════════════════════════════════════════════════════════════════

Dirección Lógica: 0x00010502 = 66818 decimal = 00000000 00010101 00000010 binario

┌──────────────────┬──────────────────┬──────────────────┐
│   Segment ID     │    Page ID       │     Offset       │
│    (8 bits)      │    (8 bits)      │    (16 bits)     │
├──────────────────┼──────────────────┼──────────────────┤
│        0         │        5         │        2         │
└──────────────────┴──────────────────┴──────────────────┘
  bits 31-24         bits 23-16         bits 15-0

Extracción:
  segmentId   = (0x00010502 >> 16) & 0xFF  = 0x00 = 0
  pageId      = (0x00010502 >> 8)  & 0xFF  = 0x05 = 5
  offset      = (0x00010502 >>  0) & 0xFFFF = 0x02 = 2

Traducción:
  segmentId=0 → Tabla de Páginas del segmento CODE
  pageId=5    → Marco en RAM (ejemplo: 42)
  offset=2    → Bytes específicos dentro del marco

Dirección Física = (42 * 4096) + 2 = 172034 = 0x2A002


═════════════════════════════════════════════════════════════════════════════
CONFIGURACIÓN POR DEFECTO
═════════════════════════════════════════════════════════════════════════════

Address Space:
  - Dirección lógica: 32 bits (0x00000000 - 0xFFFFFFFF)
  - Dirección física: 32 bits (0x00000000 - 0xFFFFFFFF)

Segmentación:
  - Máximo de segmentos: 256 (8 bits)
  - Bits para segment ID: 8

Paginación:
  - Tamaño de página: 4096 bytes (4 KiB)
  - Bits para offset: 12 (log₂(4096))
  - Páginas por segmento: 256 (8 bits)
  - Bits para page ID: 8

Memoria Física:
  - RAM Total: 16,777,216 bytes (16 MiB)
  - Total de marcos: 4,096 (16 MiB / 4 KiB)

MMU:
  - Tamaño de TLB: 16 entradas (caché de traducciones)

─────────────────────────────────────────────────────────────────────────────
```

## Status

✅ **Estructura completada**  
✅ **Todas las clases creadas**  
✅ **Documentación incluida**  
✅ **Ejemplo de proceso listooperational**  
⏳ **Pendiente: Implementación de lógica de traducción completa**  

