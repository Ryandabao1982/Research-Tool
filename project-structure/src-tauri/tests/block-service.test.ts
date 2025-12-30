/**
 * Block Service Tests
 *
 * Comprehensive test suite for block-level functionality
 * Following Global Vibe Coding Constitution for complete coverage.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Block, CreateBlockRequest, UpdateBlockRequest } from '@/shared/types';
import { TauriBlockService } from '../services/localBlockService';
import { LocalBlockService } from '../services/localBlockService';

/**
 * Mock data for testing
 */
const mockBlocks: Block[] = [
  {
    id: 'block_1',
    note_id: 'note_1',
    content: 'Test paragraph content',
    block_type: 'paragraph',
    position: 1,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_2',
    note_id: 'note_1',
    content: '## Test Heading',
    block_type: 'heading1',
    position: 2,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_3',
    note_id: 'note_1',
    content: '```typescript
const testCode = "sample code";
```',
    block_type: 'code',
    position: 3,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_4',
    note_id: 'note_1',
    content: 'Test list item',
    block_type: 'list',
    position: 4,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_5',
    note_id: 'note_2',
    content: 'Link to block_1',
    block_type: 'block_reference',
    source_block_id: 'block_2',
    target_block_id: 'block_3',
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_6',
    note_id: 'note_1',
    content: 'Quote content',
    block_type: 'quote',
    position: 6,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'block_7',
    note_id: 'note_2',
    content: 'Divider content',
    block_type: 'divider',
    position: 7,
    parent_block_id: null,
    created_at: '2024-12-01T00:00:00.000Z',
    updated_at: '2024-12-01T00:00:00.000Z',
  },
];

describe('TauriBlockService', () => {
  let mockStorage: Map<string, Block[]>();
  let blockCounter = 1;

  return {
    // List blocks
    async listBlocks(noteId: string): Promise<Block[]> {
      const blocks = mockBlocks.filter(b => b.note_id === noteId);
      mockStorage.setBlocksByNote(noteId, blocks);
      return blocks;
    },

    // Get block
    async getBlock(id: string): Promise<Block | null> {
      const block = mockBlocks.find(b => b.id === id);
      return block || null;
    },

    // Create block
    async createBlock(request: CreateBlockRequest): Promise<Block> {
      const newBlock: Block = {
        id: `block_${++blockCounter}`,
        note_id: request.note_id,
        content: request.content,
        block_type: request.block_type || 'paragraph',
        position: request.position || mockBlocks.length + 1,
        parent_block_id: request.parent_block_id || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      mockStorage.setBlocksByNote(request.note_id, [...mockStorage.get(request.note_id) || [], newBlock]);
      mockStorage.addBlockToNote(request.note_id, newBlock.id);
      blockCounter++;
      
      return newBlock;
    },

    // Update block
    async updateBlock(id: string, request: UpdateBlockRequest): Promise<Block> {
      const existing = mockStorage.blocks.get(id);
      if (!existing) throw new Error(`Block ${id} not found`);
      
      const updated = {
        ...existing,
        content: request.content || existing.content,
        block_type: request.block_type || existing.block_type,
        parent_block_id: request.parent_block_id || existing.parent_block_id,
        position: request.position !== undefined ? request.position : existing.position,
        updated_at: new Date().toISOString(),
      };
      
      mockStorage.setBlocksByNote(request.note_id, 
        existing.note_id ? mockStorage.get(request.note_id).map(b => b.id === updated.id ? updated : b) : [...existing, updated]
      );
      
      return updated;
    },

    // Delete block
    async deleteBlock(id: string): Promise<void> {
      const existing = mockStorage.blocks.get(id);
      if (!existing) throw new Error(`Block ${id} not found`);
      
      const noteBlocks = mockStorage.getBlocksByNote(id);
      const filtered = noteBlocks.filter(b => b.id !== id);
      mockStorage.setBlocksByNote(id, filtered);
      mockStorage.removeBlockFromNote(id, id);
      return;
    },

    // Create block link
    async createBlockLink(
      sourceBlockId: string,
      targetBlockId: string,
      noteId: string,
    ): Promise<string> {
      const linkId = `link_block_${sourceBlockId}_${targetBlockId}`;
      
      const sourceBlock = mockStorage.blocks.get(sourceBlockId);
      const targetBlock = mockStorage.blocks.get(targetBlockId);
      if (!sourceBlock || !targetBlock) {
        throw new Error('Source or target block not found');
      }
      
      // In mock implementation, we'd track this in storage too
      mockStorage.addBlockToNote(noteId, linkId);
      mockStorage.addBlockToNote(targetBlockId, linkId);
      
      return linkId;
    },
  };
});

// Clear storage before each test
beforeEach(() => {
  mockStorage.clear();
  blockCounter = 1;
});

describe('TauriBlockService', () => {
  describe('listBlocks', () => {
    it('should return blocks for a specific note', async () => {
      const blocks = await blockService.listBlocks('note_1');
      
      expect(blocks).toHaveLength(2);
      expect(blocks[0].note_id).toBe('note_1');
      expect(blocks[0].content).toBe('Test paragraph content');
      expect(blocks[1].note_id).toBe('note_1');
    });

  describe('getBlock', () => {
    it('should return a specific block', async () => {
      const block = await blockService.getBlock('block_1');
      
      expect(block).toBeTruthy();
      expect(block?.id).toBe('block_1');
      expect(block?.content).toBe('Test paragraph content');
    });

  describe('createBlock', () => {
    it('should create a new block', async () => {
      const newBlock = await blockService.createBlock({
        note_id: 'note_1',
        content: 'New test block',
        block_type: 'paragraph',
        position: 8,
      });
      
      expect(newBlock).toBeTruthy();
      expect(newBlock.id).toMatch(/^block_\d+$/);
      expect(newBlock.note_id).toBe('note_1');
      expect(newBlock.content).toBe('New test block');
      expect(newBlock.position).toBe(8);
    });

  describe('updateBlock', () => {
    it('should update an existing block', async () => {
      const updateData = {
        content: 'Updated test block',
      };
      
      const updated = await blockService.updateBlock('block_1', updateData);
      
      expect(updated).toBeTruthy();
      expect(updated.content).toBe('Updated test block');
      expect(updated.id).toBe('block_1');
    });

  describe('deleteBlock', () => {
    it('should delete a block', async () => {
      await blockService.deleteBlock('block_1');
      
      const blocks = await blockService.listBlocks('note_1');
      
      expect(blocks).toHaveLength(1);
      expect(blocks.find(b => b.id === 'block_1')).toBeFalsy();
    });
  });

  describe('createBlockLink', () => {
    it('should create a link between blocks', async () => {
      const linkId = await blockService.createBlockLink('block_2', 'block_3', 'note_1');
      
      expect(linkId).toBeTruthy();
      expect(linkId).toMatch(/^link_block_.*_.*_block_.*$/);
    });
  });

  describe('search functionality', () => {
    it('should search blocks by content', async () => {
      const blocks = await blockService.searchBlocks('test');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].id).toBe('block_1');
      expect(blocks[0].content).toBe('Test paragraph content');
    });
  });

  describe('position management', () => {
    it('should handle block positioning correctly', async () => {
      const block1 = await blockService.createBlock({
        note_id: 'note_1',
        content: 'First block',
        position: 1,
      });
      
      const block2 = await blockService.createBlock({
        note_id: 'note_1',
        content: 'Second block',
        position: 2,
      });
      
      const updateResult = await blockService.updateBlock(block2.id, {
        position: 3,
      });
      
      expect(updateResult).toBeTruthy();
      expect(updateResult.position).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should handle not found error', async () => {
      await expect(blockService.getBlock('nonexistent')).rejects.toThrow('Block with ID nonexistent was not found');
    });
  });

  describe('concurrentcy', () => {
    it('should handle concurrent operations', async () => {
      const blocks = await blockService.listBlocks('note_1');
      expect(blocks).toHaveLength(2);
      
      const deletePromise = blockService.deleteBlock('block_1');
      const updatePromise = blockService.updateBlock('block_2', { content: 'Concurrent update' });
      
      // Both operations should complete successfully
      await Promise.all([deletePromise, updatePromise]);
      
      const finalBlocks = await blockService.listBlocks('note_1');
      expect(finalBlocks).toHaveLength(1);
      expect(finalBlocks[0].content).toBe('Concurrent update');
    });
  });
});