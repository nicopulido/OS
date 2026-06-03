/**
 * SegmentDTO.js - Data Transfer Objects para segmentación
 */

export class SegmentDTO {
  constructor(segmentId, type, sizeBytes, pageCount, permissions, pages) {
    this.segmentId = segmentId;
    this.type = type; // 'CODE', 'DATA', 'STACK', 'HEAP'
    this.sizeBytes = sizeBytes;
    this.pageCount = pageCount;
    this.permissions = permissions; // { canRead, canWrite, canExecute }
    this.pages = pages; // Array<PageDTO>
  }
}

export class PageDTO {
  constructor(pageId, frameNumber, isPresent, isDirty, accessCount, lastAccessTime) {
    this.pageId = pageId;
    this.frameNumber = frameNumber;
    this.isPresent = isPresent;
    this.isDirty = isDirty;
    this.accessCount = accessCount;
    this.lastAccessTime = lastAccessTime;
  }
}

export class SegmentTableDTO {
  constructor(pid, segments, totalMemory) {
    this.pid = pid;
    this.segments = segments; // Array<SegmentDTO>
    this.totalMemory = totalMemory; // bytes
  }
}

export class PageTableDTO {
  constructor(pid, segmentId, pages, pageCount) {
    this.pid = pid;
    this.segmentId = segmentId;
    this.pages = pages; // Array<PageDTO>
    this.pageCount = pageCount;
  }
}
