/**
 * DomainMapper.js - Convierte objetos del dominio a DTOs
 * 
 * Responsabilidad: Aislar la capa de aplicación del dominio
 * Patrón: Mapper (One-way: Domain → DTO)
 */

import { ProcessDTO, ProcessListDTO } from '../dtos/ProcessDTO.js';
import { RAMStatusDTO, FrameDTO, MemoryLayoutDTO, AddressTranslationResultDTO } from '../dtos/MemoryDTO.js';
import { SegmentDTO, PageDTO, SegmentTableDTO, PageTableDTO } from '../dtos/SegmentDTO.js';

export class DomainMapper {
  /**
   * Convierte Process → ProcessDTO
   */
  static processToDTO(process, ram) {
    const pcb = process.getPCB();
    const segmentTable = process.getSegmentTable?.();
    const faults = {
      pageFailts: pcb.getPageFaultCount?.() || 0,
      segmentationFaults: pcb.getSegmentationFaultCount?.() || 0,
    };

    return new ProcessDTO(
      process.getPid(),
      process.getName(),
      pcb.getState?.() || 'UNKNOWN',
      process.creationTime || Date.now(),
      segmentTable?.getTotalMemory?.() || 0,
      segmentTable?.getAllSegments?.()?.length || 0,
      faults
    );
  }

  /**
   * Convierte array de procesos a ProcessListDTO
   */
  static processListToDTO(processes, ram) {
    const processDTOs = processes.map(p => this.processToDTO(p, ram));
    const ramStatus = ram ? this.ramStatusToDTO(ram) : null;
    
    const usedFrames = ram?.allocatedFrames || 0;
    const totalFrames = ram?.config?.getTotalFrames?.() || 1;
    const usedBytes = (usedFrames * ram?.getFrameSize?.()) || 0;
    const totalBytes = ram?.getTotalRAMBytes?.() || 1;

    return new ProcessListDTO(
      processDTOs,
      processes.length,
      {
        used: usedBytes,
        total: totalBytes,
        percent: (usedBytes / totalBytes) * 100,
      }
    );
  }

  /**
   * Convierte RAM → RAMStatusDTO
   */
  static ramStatusToDTO(ram) {
    const config = ram.config;
    const totalFrames = config.getTotalFrames();
    const allocatedFrames = ram.allocatedFrames || 0;
    const frameSize = config.getPageSize();
    
    const totalRAM = totalFrames * frameSize;
    const usedRAM = allocatedFrames * frameSize;
    const freeRAM = totalRAM - usedRAM;
    const utilizationPercent = (usedRAM / totalRAM) * 100;

    return new RAMStatusDTO(
      totalRAM,
      usedRAM,
      freeRAM,
      utilizationPercent,
      totalFrames,
      allocatedFrames,
      totalFrames - allocatedFrames
    );
  }

  /**
   * Convierte Frame → FrameDTO
   */
  static frameToDTO(frame, frameNumber) {
    const info = frame.getInfo?.();
    return new FrameDTO(
      frameNumber,
      frame.isOccupied?.() || false,
      info?.processId ?? null,
      info?.segmentId ?? null,
      info?.pageNumber ?? null,
      false
    );
  }

  /**
   * Convierte memoria física a MemoryLayoutDTO
   */
  static memoryLayoutToDTO(ram) {
    const frames = [];
    if (ram.frames) {
      ram.frames.forEach((frame, frameNumber) => {
        frames.push(this.frameToDTO(frame, frameNumber));
      });
    }

    return new MemoryLayoutDTO(
      frames,
      this.ramStatusToDTO(ram)
    );
  }

  /**
   * Convierte traducción de dirección a DTO
   */
  static addressTranslationToDTO(logicalAddress, segmentId, pageId, offset, frameNumber, physicalAddress, success, error = null) {
    return new AddressTranslationResultDTO(
      logicalAddress?.toString?.() || logicalAddress,
      segmentId,
      pageId,
      offset,
      frameNumber,
      physicalAddress?.toString?.() || physicalAddress,
      success,
      error
    );
  }

  /**
   * Convierte Segment → SegmentDTO
   */
  static segmentToDTO(segment, segmentId) {
    const pageTable = segment.getPageTable?.();
    const pages = pageTable?.getAllPages?.()?.map((page, idx) => 
      this.pageToDTO(page, idx)
    ) || [];

    const permissions = {
      canRead: segment.canRead?.() || false,
      canWrite: segment.canWrite?.() || false,
      canExecute: segment.canExecute?.() || false,
    };

    const sizeBytes = segment.getSizeBytes?.() || 0;
    const pageTable2 = segment.getPageTable?.();
    const pageCount = pageTable2?.getPageCount?.() || (pages ? pages.length : 0);

    return new SegmentDTO(
      segmentId,
      segment.getName?.() || 'UNKNOWN',
      sizeBytes,
      pageCount,
      permissions,
      pages
    );
  }

  /**
   * Convierte Page → PageDTO
   */
  static pageToDTO(page, pageId) {
    return new PageDTO(
      pageId,
      page.getFrameNumber?.() || -1,
      page.isPresent?.() || false,
      page.isDirty?.() || false,
      page.getAccessCount?.() || 0,
      page.getLastAccessTime?.() || null
    );
  }

  /**
   * Convierte SegmentTable → SegmentTableDTO
   */
  static segmentTableToDTO(segmentTable, pid) {
    const segments = segmentTable.getAllSegments?.()?.map((seg, idx) =>
      this.segmentToDTO(seg, idx)
    ) || [];

    return new SegmentTableDTO(
      pid,
      segments,
      segmentTable.getTotalMemory?.() || 0
    );
  }

  /**
   * Convierte PageTable → PageTableDTO
   */
  static pageTableToDTO(pageTable, pid, segmentId) {
    const pages = pageTable.getAllPages?.()?.map((page, idx) =>
      this.pageToDTO(page, idx)
    ) || [];

    return new PageTableDTO(
      pid,
      segmentId,
      pages,
      pages.length
    );
  }
}
