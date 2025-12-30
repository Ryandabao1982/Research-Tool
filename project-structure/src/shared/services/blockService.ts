import { invoke } from "@tauri-apps/api/tauri";
import type { Block, CreateBlockRequest, UpdateBlockRequest } from "../types";

/**
 * Block Service
 * Manages block-level content operations for granular references
 */

export class BlockService {
  /**
   * List all blocks for a note
   */
  async listBlocks(noteId: string): Promise<Block[]> {
    return await invoke<Block[]>("list_blocks", { noteId });
  }

  /**
   * Get a single block by ID
   */
  async getBlock(id: string): Promise<Block | null> {
    return await invoke<Option<Block>>("get_block", { id });
  }

  /**
   * Create a new block
   */
  async createBlock(request: CreateBlockRequest): Promise<Block> {
    return await invoke<Block>("create_block", { request });
  }

  /**
   * Update an existing block
   */
  async updateBlock(id: string, request: UpdateBlockRequest): Promise<Block> {
    return await invoke<Block>("update_block", { id, request });
  }

  /**
   * Delete a block
   */
  async deleteBlock(id: string): Promise<void> {
    await invoke("delete_block", { id });
  }

  /**
   * Create a link between two blocks
   */
  async createBlockLink(
    sourceBlockId: string,
    targetBlockId: string,
    noteId: string,
  ): Promise<string> {
    return await invoke<string>("create_block_link", {
      sourceBlockId,
      targetBlockId,
      noteId,
    });
  }

  /**
   * Search blocks using FTS5
   */
  async searchBlocks(query: string, noteId?: string): Promise<Block[]> {
    return await invoke<Block[]>("search_blocks", { query, noteId });
  }
}
