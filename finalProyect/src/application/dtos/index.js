/**
 * index.js - Barrel exports para todos los DTOs
 * 
 * Use from API:
 *   import { ProcessDTO, RAMStatusDTO, SegmentDTO, ... } from './dtos/index.js'
 */

export { ProcessDTO, ProcessListDTO } from './ProcessDTO.js';
export { RAMStatusDTO, FrameDTO, MemoryLayoutDTO, AddressTranslationResultDTO } from './MemoryDTO.js';
export { SegmentDTO, PageDTO, SegmentTableDTO, PageTableDTO } from './SegmentDTO.js';
