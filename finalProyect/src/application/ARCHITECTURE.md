/**
 * ARQUITECTURA DE 3 CAPAS - ESTRUCTURA DE APLICACIÓN
 * 
 * CAPA 1: DOMAIN (Ya existía)
 * ────────────────────────────────────────────────────────────
 * Localización: src/domain/
 * Contiene: Todas las entidades del dominio
 *   - architecture/ (LogicalAddress, PhysicalAddress, ArchitectureConfig)
 *   - operating-system/ (OperatingSystem, PCB)
 *   - process/ (Process, SegmentTable, Segment, PageTable, Page)
 *   - memory/ (RAM, Frame)
 *   - mmu/ (MMU)
 * 
 * Responsabilidad: Modelar el negocio (simulador de memoria con segmentación paginada)
 * No tiene dependencias de aplicación o presentación
 * 
 * 
 * CAPA 2: APPLICATION (NUEVA - Implementada aquí)
 * ────────────────────────────────────────────────────────────
 * Localización: src/application/
 * 
 * Subcapas:
 * 
 * A. DTOs (Data Transfer Objects)
 *    Archivos: ProcessDTO.js, MemoryDTO.js, SegmentDTO.js
 *    Responsabilidad: Representar datos para transferencia
 *    Sin lógica, solo propiedades
 *    Usados: Por servicios para retornar resultados
 * 
 * B. Mappers
 *    Archivo: DomainMapper.js
 *    Responsabilidad: Convertir Domain Objects → DTOs
 *    Patrón: Mapper (One-way: Domain → DTO)
 *    Beneficio: Descoplar presentación del dominio
 * 
 * C. Services (Casos de Uso)
 *    Archivos: 9 servicios principales
 *    
 *    1. ConfigureArchitectureService
 *       - Expone configuración del sistema
 *       - Métodos: getArchitectureInfo(), getMemoryConfiguration(), validateArchitecture()
 *       - Devuelve: Configuración en formato legible
 * 
 *    2. CreateProcessService
 *       - Crea procesos con segmentos
 *       - Métodos: createProcess(), createProcessWithDefaults()
 *       - Devuelve: ProcessDTO con información del crear proceso
 * 
 *    3. LoadProcessIntoMemoryService
 *       - Asigna marcos a páginas
 *       - Métodos: loadProcessIntoMemory(), preloadSegment(), loadPageOnDemand()
 *       - Devuelve: Estado de carga y utilización de RAM
 * 
 *    4. RemoveProcessFromMemoryService
 *       - Termina procesos y libera memoria
 *       - Métodos: removeProcess(), removeAllProcesses()
 *       - Devuelve: Confirmación y estado de memoria
 * 
 *    5. TranslateAddressService
 *       - Traduce direcciones lógicas a físicas
 *       - Métodos: translateAddress(), validateAddress(), getTLBStats()
 *       - Devuelve: AddressTranslationResultDTO
 * 
 *    6. MemoryVisualizationService
 *       - Proporciona datos de visualización de RAM
 *       - Métodos: getMemoryLayout(), getFragmentation(), getASCIIVisualization()
 *       - Devuelve: MemoryLayoutDTO, estadísticas
 * 
 *    7. ProcessVisualizationService
 *       - Proporciona datos de procesos
 *       - Métodos: getProcessList(), getSystemStats(), getProcessComparison()
 *       - Devuelve: ProcessListDTO, estadísticas comparativas
 * 
 *    8. SegmentTableService
 *       - Gestiona tablas de segmentación
 *       - Métodos: getSegmentTable(), getSegment(), getSegmentStats()
 *       - Devuelve: SegmentTableDTO, estadísticas
 * 
 *    9. PageTableService
 *       - Gestiona tablas de páginas
 *       - Métodos: getPageTable(), getPage(), getPageStats()
 *       - Devuelve: PageTableDTO, estadísticas detalladas
 * 
 * Patrón: Service Locator (todos accesibles desde un punto)
 * Cada servicio es stateless, accede a singletons del dominio
 * 
 * 
 * CAPA 3: PRESENTATION (A implementar por usuario)
 * ────────────────────────────────────────────────────────────
 * Ejemplos posibles:
 * - API REST (Express, Fastify)
 * - CLI (comando line)
 * - GUI Web (React, Vue, Svelte)
 * - Desktop App (Electron)
 * 
 * Importa SOLO de la capa Application:
 *   import {
 *     ConfigureArchitectureService,
 *     CreateProcessService,
 *     ProcessDTO,
 *     SegmentDTO,
 *     ...
 *   } from './application/index.js'
 * 
 * NUNCA importa del Domain:
 *   ❌ import Process from './domain/process/Process.js'
 *   ❌ import OperatingSystem from './domain/operating-system/OperatingSystem.js'
 * 
 * 
 * FLUJO DE UNA SOLICITUD
 * ────────────────────────────────────────────────────────────
 * 
 * 1. Presentación hace solicitud:
 *    api.createNewProcess('MyApp', [...])
 * 
 * 2. Application (Service) recibe:
 *    CreateProcessService.createProcess(name, segments)
 * 
 * 3. Service interactúa con Domain:
 *    OperatingSystem.getInstance()
 *    new Process(pid, name)
 *    process.setSegmentTable(segmentTable)
 * 
 * 4. Service mapea resultado:
 *    DomainMapper.processToDTO(process, ram)
 * 
 * 5. Service devuelve DTO:
 *    { success: true, processDTO: {...}, error: null }
 * 
 * 6. Presentación recibe DTO (no las entidades del dominio)
 *    Solo puede leer propiedades, no puede mutar estado
 * 
 * 
 * BENEFICIOS DE ESTA ARQUITECTURA
 * ────────────────────────────────────────────────────────────
 * 
 * ✓ Separación de responsabilidades
 *   - Domain solo modela negocio
 *   - Application coordina casos de uso
 *   - Presentation consume servicios
 * 
 * ✓ Fácil de testear
 *   - Services se pueden mockear
 *   - DTOs son simples objetos
 *   - Domain no depende de capas superiores
 * 
 * ✓ Múltiples presentaciones
 *   - Mismos servicios para API, CLI, GUI
 *   - Cada capa es independiente
 * 
 * ✓ Cambios seguros
 *   - Cambios en Domain no rompen Presentation (si mantienes DTOs)
 *   - Cambios en UI no afectan lógica de negocio
 * 
 * ✓ Escalabilidad
 *   - Fácil agregar nuevos servicios
 *   - Fácil agregar nuevas presentaciones
 *   - Código modular y mantenible
 * 
 * 
 * ESTRUCTURA DE CARPETAS
 * ────────────────────────────────────────────────────────────
 * 
 * src/
 * ├── domain/                    (Ya existía)
 * │   ├── architecture/
 * │   ├── operating-system/
 * │   ├── process/
 * │   ├── memory/
 * │   ├── mmu/
 * │   └── examples/
 * │
 * ├── application/               (NUEVA)
 * │   ├── services/              (9 servicios)
 * │   │   ├── ConfigureArchitectureService.js
 * │   │   ├── CreateProcessService.js
 * │   │   ├── LoadProcessIntoMemoryService.js
 * │   │   ├── RemoveProcessFromMemoryService.js
 * │   │   ├── TranslateAddressService.js
 * │   │   ├── MemoryVisualizationService.js
 * │   │   ├── ProcessVisualizationService.js
 * │   │   ├── SegmentTableService.js
 * │   │   ├── PageTableService.js
 * │   │   └── index.js           (barrel export)
 * │   │
 * │   ├── dtos/                  (Data Transfer Objects)
 * │   │   ├── ProcessDTO.js
 * │   │   ├── MemoryDTO.js
 * │   │   ├── SegmentDTO.js
 * │   │   └── index.js
 * │   │
 * │   ├── mappers/               (Conversión Domain → DTO)
 * │   │   ├── DomainMapper.js
 * │   │   └── index.js
 * │   │
 * │   ├── ExampleApplicationUsage.js
 * │   └── index.js               (barrel export - point of entry)
 * │
 * └── presentation/              (A implementar)
 *     ├── api/                   (Express/Fastify REST API)
 *     ├── cli/                   (Command line interface)
 *     ├── gui/                   (Web UI - React/Vue/Svelte)
 *     └── index.js
 * 
 * 
 * USO DESDE PRESENTATION
 * ────────────────────────────────────────────────────────────
 * 
 * import {
 *   ConfigureArchitectureService,
 *   CreateProcessService,
 *   TranslateAddressService,
 *   MemoryVisualizationService,
 * } from '../application/index.js'
 * 
 * // En un controlador REST
 * app.post('/api/processes', (req, res) => {
 *   const service = new CreateProcessService()
 *   const result = service.createProcess(req.body.name, req.body.segments)
 *   res.json(result) // DTO, no entidades del dominio
 * })
 * 
 * // En un componente React
 * const [memory, setMemory] = useState(null)
 * 
 * useEffect(() => {
 *   const service = new MemoryVisualizationService()
 *   const layout = service.getMemoryLayout()
 *   setMemory(layout) // DTO seguro
 * }, [])
 * 
 * 
 * GARANTÍAS
 * ────────────────────────────────────────────────────────────
 * 
 * ✓ DTOs son objetos planos (no tienen métodos de lógica de negocio)
 * ✓ Presentation NO puede acceder a métodos del Domain
 * ✓ Cambios en Domain son transparentes a Presentation (si usas Mappers)
 * ✓ Fácil mockear servicios para testing
 * ✓ Fácil documentar API desde servicios
 */
