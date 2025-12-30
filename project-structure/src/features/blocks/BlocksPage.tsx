/**
 * Blocks Page
 *
 * Main interface for managing content blocks within notes
 * with full CRUD operations and block-level references.
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Block } from "@/shared/types";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import { BlockList } from "@/shared/components/BlockList";
import { useServices } from "@/shared/services/serviceContext";

/**
 * Blocks Page - Main block management interface
 */
export function BlocksPage() {
  const { blockService } = useServices();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [noteId, setNoteId] = useState<string>("");

  // Load blocks for a note
  const loadBlocks = async (id: string) => {
    try {
      const noteBlocks = await blockService.listBlocks(id);
      setBlocks(noteBlocks);
      setNoteId(id);
    } catch (error) {
      console.error("Failed to load blocks:", error);
    }
  };

  // Search blocks
  const searchBlocks = async (query: string) => {
    try {
      const results = await blockService.searchBlocks(
        query,
        noteId || undefined,
      );
      setBlocks(results);
    } catch (error) {
      console.error("Failed to search blocks:", error);
    }
  };

  // Create new block
  const handleBlockCreate = async (
    block: Omit<Block, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const newBlock = await blockService.createBlock({
        note_id: noteId,
        content: block.content,
        block_type: block.block_type,
        position: block.position,
        parent_block_id: block.parent_block_id,
      });

      setBlocks((prev) => [...prev, { ...newBlock, id: newBlock.id }]);
    } catch (error) {
      console.error("Failed to create block:", error);
    }
  };

  // Update block
  const handleBlockUpdate = async (updatedBlock: Block) => {
    try {
      const block = await blockService.updateBlock(updatedBlock.id, {
        content: updatedBlock.content,
        block_type: updatedBlock.block_type,
        parent_block_id: updatedBlock.parent_block_id,
        position: updatedBlock.position,
      });

      setBlocks((prev) =>
        prev.map((b) => (b.id === updatedBlock.id ? block : b)),
      );
    } catch (error) {
      console.error("Failed to update block:", error);
    }
  };

  // Delete block
  const handleBlockDelete = async (blockId: string) => {
    try {
      await blockService.deleteBlock(blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
      setSelectedBlock(null);
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  // Create block link
  const handleLinkCreate = async (
    sourceBlockId: string,
    targetBlockId: string,
  ) => {
    try {
      const linkId = await blockService.createBlockLink(
        sourceBlockId,
        targetBlockId,
        noteId,
      );
      console.log("Created block link:", linkId);
    } catch (error) {
      console.error("Failed to create block link:", error);
    }
  };

  // Reorder blocks
  const handleBlockReorder = async (blockIds: string[]) => {
    try {
      // Update positions based on new order
      const updates = blockIds.map((id, index) =>
        blockService.updateBlock(id, { position: index }),
      );

      await Promise.all(updates);
      setBlocks((prev) => {
        const reordered = [...prev];
        blockIds.forEach((id, index) => {
          const block = reordered.find((b) => b.id === id);
          if (block) {
            const oldIndex = reordered.findIndex((b) => b.id === id);
            reordered.splice(oldIndex, 1);
            reordered.splice(index, 0, block);
          }
        });
        return reordered;
      });
    } catch (error) {
      console.error("Failed to reorder blocks:", error);
    }
  };

  // Load initial blocks from URL or use default
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("note");
    if (id) {
      loadBlocks(id);
    } else {
      setBlocks([]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-vibe-purple to-slate-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <Card variant="glass" className="mb-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white mb-4">
                {noteId ? `Blocks for Note ${noteId}` : "Block Management"}
              </h1>

              <div className="flex gap-4">
                {noteId && (
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreateMode(!isCreateMode)}
                    className="bg-white/10 hover:bg-white/20"
                  >
                    {isCreateMode ? "View Blocks" : "Add Block"}
                  </Button>
                )}

                <Input
                  placeholder="Search blocks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery) {
                      searchBlocks(searchQuery);
                    }
                  }}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Note Selection for testing */}
            {!noteId && (
              <div className="mb-4">
                <Input
                  placeholder="Enter note ID to manage blocks..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value) {
                      loadBlocks(e.currentTarget.value);
                    }
                  }}
                  className="w-full"
                />
              </div>
            )}
          </Card>

          {/* Create Mode */}
          {isCreateMode && noteId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card variant="glass" className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Create New Block
                </h2>

                <div className="space-y-4">
                  <Input
                    placeholder="Block content..."
                    multiline
                    rows={4}
                    onChange={(e) => {
                      // Could store this in state for form
                    }}
                    className="w-full"
                  />

                  <div className="flex gap-4">
                    <Button
                      onClick={() => {
                        handleBlockCreate({
                          content: "New block content",
                          block_type: "paragraph",
                          position: blocks.length,
                        });
                        setIsCreateMode(false);
                      }}
                    >
                      Create Block
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => setIsCreateMode(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Blocks List */}
          {blocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {searchQuery
                    ? `Search Results (${blocks.length})`
                    : `All Blocks (${blocks.length})`}
                </h2>

                <div className="text-white/60 text-sm">
                  {noteId && `Note: ${noteId}`}
                </div>
              </div>

              <BlockList
                blocks={blocks}
                noteId={noteId}
                onBlockUpdate={handleBlockUpdate}
                onBlockDelete={handleBlockDelete}
                onBlockCreate={handleBlockCreate}
                onBlockReorder={handleBlockReorder}
                onLinkCreate={handleLinkCreate}
              />
            </motion.div>
          )}

          {/* Empty State */}
          {blocks.length === 0 && noteId && !isCreateMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-white/60">
                <h3 className="text-xl font-semibold mb-4">No blocks found</h3>
                <p className="text-white/80 mb-4">
                  {searchQuery
                    ? "No blocks match your search."
                    : "This note has no blocks yet."}
                </p>
                <Button
                  onClick={() => setIsCreateMode(true)}
                  className="bg-vibe-blue hover:bg-vibe-blue/80"
                >
                  Create First Block
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
