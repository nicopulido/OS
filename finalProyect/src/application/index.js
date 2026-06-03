/**
 * index.js - Punto de entrada para la capa de Aplicación
 * 
 * Uso desde API/Presentación:
 *   import {
 *     ConfigureArchitectureService,
 *     CreateProcessService,
 *     TranslateAddressService,
 *     MemoryVisualizationService,
 *     ProcessVisualizationService,
 *     ...
 *   } from '../application/index.js'
 *
 * O importar DTOs:
 *   import { ProcessDTO, SegmentDTO, PageTableDTO, ... } from '../application/index.js'
 */

// Servicios
export {
  ConfigureArchitectureService,
  CreateProcessService,
  LoadProcessIntoMemoryService,
  RemoveProcessFromMemoryService,
  TranslateAddressService,
  MemoryVisualizationService,
  ProcessVisualizationService,
  SegmentTableService,
  PageTableService,
} from './services/index.js';

// DTOs
export {
  ProcessDTO,
  ProcessListDTO,
  RAMStatusDTO,
  FrameDTO,
  MemoryLayoutDTO,
  AddressTranslationResultDTO,
  SegmentDTO,
  PageDTO,
  SegmentTableDTO,
  PageTableDTO,
} from './dtos/index.js';

// Mappers
export { DomainMapper } from './mappers/index.js';
