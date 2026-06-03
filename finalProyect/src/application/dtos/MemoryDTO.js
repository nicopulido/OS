/**
 * MemoryDTO.js - Data Transfer Objects para memoria
 */

export class RAMStatusDTO {
  constructor(totalRAM, usedRAM, freeRAM, utilizationPercent, totalFrames, allocatedFrames, freeFrames) {
    this.totalRAM = totalRAM; // bytes
    this.usedRAM = usedRAM;   // bytes
    this.freeRAM = freeRAM;   // bytes
    this.utilizationPercent = utilizationPercent;
    this.totalFrames = totalFrames;
    this.allocatedFrames = allocatedFrames;
    this.freeFrames = freeFrames;
  }
}

export class FrameDTO {
  constructor(frameNumber, isAllocated, ownerPid, segmentId, pageId, isDirty) {
    this.frameNumber = frameNumber;
    this.isAllocated = isAllocated;
    this.ownerPid = ownerPid; // null si libre
    this.segmentId = segmentId;
    this.pageId = pageId;
    this.isDirty = isDirty;
  }
}

export class MemoryLayoutDTO {
  constructor(frames, ramStatus) {
    this.frames = frames; // Array<FrameDTO>
    this.ramStatus = ramStatus; // RAMStatusDTO
  }
}

export class AddressTranslationResultDTO {
  constructor(logicalAddress, segmentId, pageId, offset, frameNumber, physicalAddress, success, error) {
    this.logicalAddress = logicalAddress;
    this.segmentId = segmentId;
    this.pageId = pageId;
    this.offset = offset;
    this.frameNumber = frameNumber;
    this.physicalAddress = physicalAddress;
    this.success = success;
    this.error = error;
  }
}
