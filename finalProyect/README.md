# Simulador de Segmentación Paginada

Un simulador académico completo de un sistema de **Segmentación Paginada** implementado en JavaScript moderno (ES6 Modules).

## 📚 ¿Qué es Segmentación Paginada?

La Segmentación Paginada es un esquema de gestión de memoria que combina:

- **Segmentación**: Divide el espacio de direcciones del proceso en segmentos lógicos (Código, Datos, Stack, Heap, etc.)
- **Paginación**: Divide cada segmento en páginas de tamaño fijo

### Ventajas

✅ **Flexibilidad**: Múltiples espacios lógicos (segmentos)  
✅ **Eficiencia**: Sin fragmentación externa (paginación)  
✅ **Control de acceso**: Permisos por segmento  
✅ **Compartimiento**: De memoria a nivel de segmento

## 🏗️ Estructura del Proyecto

```
finalProyect/
├── src/
│   ├── architecture/
│   │   ├── ArchitectureConfig.js    # Configuración de la arquitectura
│   │   ├── LogicalAddress.js        # Dirección lógica (Value Object)
│   │   └── PhysicalAddress.js       # Dirección física (Value Object)
│   │
│   ├── operating-system/
│   │   ├── OperatingSystem.js       # Orquestador principal (Singleton)
│   │   └── PCB.js                   # Process Control Block
│   │
│   ├── process/
│   │   ├── Process.js               # Proceso (entidad)
│   │   ├── SegmentTable.js          # Tabla de segmentos
│   │   ├── Segment.js               # Segmento individual
│   │   ├── PageTable.js             # Tabla de páginas
│   │   └── Page.js                  # Página individual
│   │
│   ├── memory/
│   │   ├── RAM.js                   # Memoria física (Singleton)
│   │   └── Frame.js                 # Marco individual
│   │
│   ├── mmu/
│   │   └── MMU.js                   # Memory Management Unit
│   │
│   ├── examples/
│   │   └── exampleProcess.js        # Ejemplo de creación de proceso
│   │
│   └── index.js                     # Punto de entrada
│
├── package.json
└── README.md
```

## 🔄 Flujo de Traducción de Direcciones

### Traducción: Dirección Lógica → Dirección Física

```
Dirección Lógica: 0x00010502
         ↓
Extracción de componentes:
  - Segment ID = 0
  - Page ID    = 1
  - Offset     = 2
         ↓
Búsqueda en Tabla de Segmentos:
  Segment 0 → Base = 0x1000, PageTable
         ↓
Búsqueda en Tabla de Páginas:
  Page 1 → Frame = 42
         ↓
Cálculo de Dirección Física:
  PhysicalAddress = (Frame * PageSize) + Offset
  PhysicalAddress = (42 * 4096) + 2 = 172,034
         ↓
Acceso a RAM:
  RAM[172,034] = dato
```

## 📦 Conceptos Principales

### `ArchitectureConfig` (Singleton)
Define la configuración hardware:
- Bits de dirección (32 bits lógicos, 32 bits físicos)
- Tamaño de página (4 KiB)
- Número de segmentos (256)
- Número de páginas por segmento (256)
- Cantidad de RAM (16 MiB)

### `LogicalAddress` (Value Object)
Dirección emitida por el proceso. Contiene:
- `segmentId`: ID del segmento (bits más significativos)
- `pageId`: ID de la página (bits intermedios)
- `offset`: Offset dentro de la página (bits menos significativos)

### `PhysicalAddress` (Value Object)
Ubicación real en RAM. Contiene:
- `frameNumber`: Número de marco
- `offset`: Offset dentro del marco

### `Process` (Entity)
Representa un proceso del SO:
- PID único
- PCB (bloque de control)
- SegmentTable (tabla de segmentos)

### `SegmentTable` (Entity)
Primer nivel de traducción. Mapea:
```
Segment ID → Descriptor del Segmento (base, límite, PageTable)
```

### `Segment` (Entity)
Uno de los segmentos lógicos:
- CODE: Código ejecutable (read, execute)
- DATA: Datos globales (read, write)
- STACK: Pila del proceso (read, write)
- HEAP: Memoria dinámica (read, write)

### `PageTable` (Entity)
Segundo nivel de traducción dentro de un segmento. Mapea:
```
Page ID (dentro del segmento) → Frame Number (en RAM)
```

### `Page` (Entity)
Mapeo de página a marco:
- `pageNumber`: ID dentro de tabla de páginas
- `frameNumber`: Marco en RAM
- `present`: ¿Está en RAM o en disco?
- `dirty`: ¿Ha sido modificada?

### `RAM` (Singleton)
Memoria física del sistema:
- Almacena 16 MiB de datos
- Organizada en marcos de 4 KiB
- Gestiona asignación/liberación de marcos

### `Frame` (Entity)
Marco individual en RAM:
- 4 KiB de datos
- ID de propietario (PID)
- Ocupado/libre

### `MMU` (Service)
Memory Management Unit. Traduce direcciones:
- Realiza traducción lógica → física
- Mantiene caché TLB (Translation Lookaside Buffer)
- Gestiona estadísticas de acceso

## 🚀 Uso

### Ejecutar la demostración:

```bash
node src/index.js
```

### Ejemplo de salida:

```
╔═══════════════════════════════════════════════════════════╗
║   SIMULADOR DE SEGMENTACIÓN PAGINADA - DEMOSTRACIÓN      ║
╚═══════════════════════════════════════════════════════════╝

📋 FASE 1: INICIALIZACIÓN DE ARQUITECTURA
────────────────────────────────────────────────────────────

Configuración de memoria:
  Dirección lógica: 32 bits
  Dirección física: 32 bits
  Tamaño de página: 4096 bytes (4 KiB)
  Segmentos máximos: 256
  Páginas por segmento: 256
  RAM total: 16777216 bytes (16 MiB)
  Marcos totales: 4096

...
```

## 🔧 Clases y Responsabilidades

| Clase | Responsabilidad | Patrón |
|-------|-----------------|--------|
| `ArchitectureConfig` | Configuración global | Singleton |
| `LogicalAddress` | Dirección del proceso | Value Object |
| `PhysicalAddress` | Ubicación en RAM | Value Object |
| `Process` | Representa un proceso | Entity |
| `PCB` | Bloque de control | Entity |
| `SegmentTable` | Mapeo segmento → descriptor | Entity |
| `Segment` | Segmento lógico | Entity |
| `PageTable` | Mapeo página → marco | Entity |
| `Page` | Página individual | Entity |
| `RAM` | Memoria física | Singleton Entity |
| `Frame` | Marco individual | Entity |
| `MMU` | Traducción de direcciones | Service |
| `OperatingSystem` | Orquestador | Singleton Orchestrator |

## 📊 División de Dirección Lógica (32 bits)

```
┌────────────────┬──────────────┬─────────────────┐
│   Segment ID   │   Page ID    │     Offset      │
│   (8 bits)     │   (8 bits)   │    (16 bits)    │
└────────────────┴──────────────┴─────────────────┘
   bits 31-24      bits 23-16      bits 15-0
```

- **Segment ID** (8 bits): Identifica 1 de 256 segmentos
- **Page ID** (8 bits): Identifica 1 de 256 páginas dentro del segmento
- **Offset** (16 bits): Offset dentro de la página (0-65535 bytes)

## 💡 Características Implementadas

✅ **Estructura completa de clases**  
✅ **Separación de responsabilidades**  
✅ **Patrones de diseño** (Singleton, Value Object, Entity)  
✅ **Modelo de dominio completo**  
✅ **Documentación detallada**  
✅ **Ejemplo de creación de proceso**  
✅ **Sin dependencias externas**  

## 🔮 Funcionalidades Futuras

- [ ] Implementación completa de traducción de direcciones
- [ ] Manejo de page faults y interrupciones
- [ ] Políticas de reemplazo de páginas (LRU, FIFO, Optimal)
- [ ] Swapping a disco
- [ ] Estadísticas detalladas y profiling
- [ ] Tests unitarios e integración
- [ ] Visualización de estado de memoria
- [ ] Simulación de procesos concurrentes

## 📖 Referencias

- Tanenbaum, A. S. (2009). *Sistemas Operativos Modernos*
- Stallings, W. (2018). *Operating Systems: Internals and Design Principles*
- Conceptos de Virtual Memory, Paging, Segmentation

## 📝 Licencia

MIT

---

**Construcción**: Código base inicial (v1.0)  
**Estado**: Listo para implementación de lógica de traducción y funcionamiento completo
