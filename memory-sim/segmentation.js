/**
 * segmentation.js
 * Handles memory allocation using Segmentation.
 * Divides process into semantic segments and places them in free holes.
 */
import { firstFit, bestFit, worstFit } from './allocationStrategies.js';

const STRATEGIES = { firstFit, bestFit, worstFit };

export class SegmentationManager {
  constructor(totalMemoryBytes, osSizeBytes, strategyName) {
    this.totalMemoryBytes = totalMemoryBytes;
    this.osSizeBytes = osSizeBytes;
    this.strategyName = strategyName;
    
    // We maintain a list of all memory blocks (holes + segments + OS) in address order
    this.blocks = [
      { id: 'os', startAddress: 0, size: osSizeBytes, isOS: true, isFree: false },
      { id: 'hole_0', startAddress: osSizeBytes, size: totalMemoryBytes - osSizeBytes, isOS: false, isFree: true }
    ];
    this.nextBlockId = 1;
  }

  getHoles() {
    return this.blocks.filter(b => b.isFree);
  }

  allocate(process) {
    // Clone blocks to simulate transaction (all segments must fit)
    const originalBlocks = this.blocks.map(b => ({ ...b }));
    const originalNextBlockId = this.nextBlockId;
    const strategy = STRATEGIES[this.strategyName];
    
    const segmentNames = Object.keys(process.segments);
    const allocated = [];

    for (const segName of segmentNames) {
      const segSize = process.segments[segName];
      if (segSize <= 0) continue;

      const holes = this.getHoles();
      const holeIdx = strategy(holes, segSize);
      
      if (holeIdx === -1) {
        // Rollback if any segment fails
        this.blocks = originalBlocks;
        this.nextBlockId = originalNextBlockId;
        return false;
      }

      const hole = holes[holeIdx];
      const blockIdx = this.blocks.findIndex(b => b.id === hole.id);
      
      const remainder = hole.size - segSize;
      
      const newSegBlock = {
        id: `seg_${this.nextBlockId++}`,
        startAddress: hole.startAddress,
        size: segSize,
        isOS: false,
        isFree: false,
        process: process,
        segmentName: segName
      };

      allocated.push(newSegBlock);
      this.blocks[blockIdx] = newSegBlock;

      if (remainder > 0) {
        this.blocks.splice(blockIdx + 1, 0, {
          id: `hole_${this.nextBlockId++}`,
          startAddress: hole.startAddress + segSize,
          size: remainder,
          isOS: false,
          isFree: true
        });
      }
    }

    process.allocatedSegments = allocated;
    return true;
  }

  deallocate(process) {
    // Mark process segments as free holes
    for (const b of this.blocks) {
      if (b.process && b.process.pid === process.pid) {
        b.isFree = true;
        b.process = null;
        b.segmentName = null;
        b.id = `hole_${this.nextBlockId++}`;
      }
    }
    this.mergeHoles();
    process.allocatedSegments = [];
  }

  mergeHoles() {
    let i = 0;
    while (i < this.blocks.length - 1) {
      const curr = this.blocks[i];
      const next = this.blocks[i + 1];
      if (curr.isFree && next.isFree) {
        curr.size += next.size;
        this.blocks.splice(i + 1, 1);
      } else {
        i++;
      }
    }
  }

  compact() {
    // Shift all occupied blocks to the bottom (just above OS)
    const occupied = this.blocks.filter(b => !b.isFree && !b.isOS);
    
    let addr = this.osSizeBytes;
    this.blocks = [this.blocks[0]]; // Keep OS
    
    for (const b of occupied) {
      b.startAddress = addr;
      this.blocks.push(b);
      addr += b.size;
    }
    
    const freeSpace = this.totalMemoryBytes - addr;
    if (freeSpace > 0) {
      this.blocks.push({
        id: `hole_${this.nextBlockId++}`,
        startAddress: addr,
        size: freeSpace,
        isOS: false,
        isFree: true
      });
    }
  }

  getBlocks() {
    return this.blocks;
  }

  getMetrics() {
    const holes = this.getHoles();
    const usedBytes = this.blocks.filter(b => !b.isFree).reduce((s, b) => s + b.size, 0);
    return {
      usedBytes,
      freeBytes: this.totalMemoryBytes - usedBytes,
      externalFragmentation: holes.length > 1,
      freeHolesCount: holes.length,
      internalFragBytes: 0 // Segmentation has no internal fragmentation
    };
  }
}
