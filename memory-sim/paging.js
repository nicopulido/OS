/**
 * paging.js
 * Handles memory allocation using Paging.
 * Divides memory into fixed-size frames and processes into pages.
 */

export class PagingManager {
  constructor(totalMemoryBytes, osSizeBytes, pageSizeKB) {
    this.totalMemoryBytes = totalMemoryBytes;
    this.pageSizeBytes = pageSizeKB * 1024;
    this.osSizeBytes = osSizeBytes;
    
    this.totalFrames = Math.floor(this.totalMemoryBytes / this.pageSizeBytes);
    this.osFrames = Math.ceil(this.osSizeBytes / this.pageSizeBytes);
    
    // true = occupied, false = free
    this.frames = new Array(this.totalFrames).fill(false);
    
    // Occupy OS frames
    for (let i = 0; i < this.osFrames; i++) {
      this.frames[i] = true;
    }
    
    // Visual representation for UI
    this.blocks = [];
    this.rebuildBlocks();
  }

  getFreeFramesCount() {
    return this.frames.filter(f => !f).length;
  }

  allocate(process) {
    const requiredPages = Math.ceil(process.totalSize / this.pageSizeBytes);
    
    if (this.getFreeFramesCount() < requiredPages) {
      return false; // Not enough free frames
    }
    
    const pageTable = [];
    let allocatedCount = 0;
    
    for (let i = 0; i < this.totalFrames; i++) {
      if (!this.frames[i]) {
        this.frames[i] = { process, pageNum: allocatedCount };
        pageTable.push(i);
        allocatedCount++;
        if (allocatedCount === requiredPages) break;
      }
    }
    
    process.pageTable = pageTable;
    this.rebuildBlocks();
    return true;
  }

  deallocate(process) {
    for (let i = 0; i < this.totalFrames; i++) {
      if (this.frames[i] && this.frames[i].process && this.frames[i].process.pid === process.pid) {
        this.frames[i] = false;
      }
    }
    process.pageTable = [];
    this.rebuildBlocks();
  }

  // Paging does not require compaction
  compact() {
    return false;
  }

  rebuildBlocks() {
    // Rebuild visual blocks by grouping contiguous identical frames for performance
    const newBlocks = [];
    let currentBlock = null;
    
    for (let i = 0; i < this.totalFrames; i++) {
      const isOS = i < this.osFrames;
      const frameData = this.frames[i];
      const isFree = frameData === false && !isOS;
      const process = isFree || isOS ? null : frameData.process;
      
      const frameType = isOS ? 'os' : isFree ? 'free' : `proc_${process.pid}`;
      
      if (!currentBlock || currentBlock.type !== frameType) {
        if (currentBlock) newBlocks.push(currentBlock);
        currentBlock = {
          type: frameType,
          startAddress: i * this.pageSizeBytes,
          size: this.pageSizeBytes,
          isOS,
          isFree,
          process,
          frameCount: 1
        };
      } else {
        currentBlock.size += this.pageSizeBytes;
        currentBlock.frameCount++;
      }
    }
    if (currentBlock) newBlocks.push(currentBlock);
    this.blocks = newBlocks;
  }

  getBlocks() {
    return this.blocks;
  }

  getMetrics() {
    let usedBytes = this.osFrames * this.pageSizeBytes;
    let internalFragBytes = 0;
    const processSet = new Set();
    
    for (let i = this.osFrames; i < this.totalFrames; i++) {
      if (this.frames[i]) {
        usedBytes += this.pageSizeBytes;
        processSet.add(this.frames[i].process);
      }
    }
    
    // Calculate internal fragmentation: Wasted space in the last page of each process
    for (const proc of processSet) {
      const requiredPages = Math.ceil(proc.totalSize / this.pageSizeBytes);
      const wasted = (requiredPages * this.pageSizeBytes) - proc.totalSize;
      internalFragBytes += wasted;
    }
    
    return {
      usedBytes,
      freeBytes: this.totalMemoryBytes - usedBytes,
      externalFragmentation: false,
      freeHolesCount: 0,
      internalFragBytes
    };
  }
}
