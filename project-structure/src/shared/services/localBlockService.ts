import type {
  Block,
  CreateBlockRequest,
  UpdateBlockRequest,
  BlockType,
} from "../types";

/**
 * Local Block Service
 * Block-level operations for browser environment
 */

export class LocalBlockService implements BlockService {
  private blocks: Map<string, Block> = new Map();

  async listBlocks(noteId: string): Promise<Block[]> {
    const allBlocks = Array.from(this.blocks.values())
      .filter((block) => block.note_id === noteId)
      .sort((a, b) => a.position - b.position);
    return allBlocks;
  }

  async getBlock(id: string): Promise<Block | null> {
    return this.blocks.get(id) || null;
  }

  async createBlock(request: CreateBlockRequest): Promise<Block> {
    const block: Block = {
      id: crypto.randomUUID(),
      note_id: request.note_id,
      content: request.content,
      block_type: request.block_type || "paragraph",
      position: await this.getMaxPosition(request.note_id),
      parent_block_id: request.parent_block_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.blocks.set(block.id, block);
    return block;
  }

  async updateBlock(id: string, request: UpdateBlockRequest): Promise<Block> {
    const existing = this.blocks.get(id);
    if (!existing) {
      throw new Error(`Block ${id} not found`);
    }

    const block: Block = {
      ...existing,
      content: request.content || existing.content,
      block_type: request.block_type || existing.block_type,
      parent_block_id:
        request.parent_block_id !== undefined
          ? request.parent_block_id
          : existing.parent_block_id,
      position:
        request.position !== undefined ? request.position : existing.position,
      updated_at: new Date().toISOString(),
    };

    this.blocks.set(id, block);
    return block;
  }

  async deleteBlock(id: string): Promise<void> {
    this.blocks.delete(id);
  }

  async createBlockLink(
    sourceBlockId: string,
    targetBlockId: string,
    noteId: string,
  ): Promise<string> {
    // For local implementation, we store this as metadata on blocks
    const sourceBlock = this.blocks.get(sourceBlockId);
    const targetBlock = this.blocks.get(targetBlockId);

    if (!sourceBlock || !targetBlock) {
      throw new Error("Block not found");
    }

    const linkId = crypto.randomUUID();
    // In local implementation, we'd need to track links separately
    // For now, just return the ID
    return linkId;
  }

  async searchBlocks(query: string, noteId?: string): Promise<Block[]> {
    const allBlocks = Array.from(this.blocks.values())
      .filter((block) => !noteId || block.note_id === noteId)
      .filter((block) =>
        block.content.toLowerCase().includes(query.toLowerCase()),
      );

    return allBlocks;
  }

  private async getMaxPosition(noteId: string): Promise<number> {
    const blocks = await this.listBlocks(noteId);
    return blocks.length > 0 ? Math.max(...blocks.map((b) => b.position)) : -1;
  }
}
