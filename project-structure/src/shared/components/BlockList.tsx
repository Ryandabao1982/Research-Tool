/**
 * Block List Component
 *
 * Displays a list of blocks with drag-and-drop reordering
 * and block management features following Global Vibe Coding Constitution.
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Block, BlockType } from "@/shared/types";
import { BlockComponent } from "./BlockComponent";
import { useServices } from "@/shared/services/serviceContext";

interface BlockListProps {
  blocks: Block[];
  noteId: string;
  onBlockUpdate?: (block: Block) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockCreate?: (
    block: Omit<Block, "id" | "created_at" | "updated_at">,
  ) => void;
  onBlockReorder?: (blockIds: string[]) => void;
  onLinkCreate?: (sourceBlockId: string, targetBlockId: string) => void;
  className?: string;
}

/**
 * Block List Component - Manages ordered list of content blocks
 */
export function BlockList({
  blocks,
  noteId,
  onBlockUpdate,
  onBlockDelete,
  onBlockCreate,
  onBlockReorder,
  onLinkCreate,
  className,
}: BlockListProps) {
  const { blockService } = useServices();
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const handleReorder = useCallback(
    async (newOrder: string[]) => {
      try {
        // Update positions for all blocks
        for (let i = 0; i < newOrder.length; i++) {
          const block = blocks.find((b) => b.id === newOrder[i]);
          if (block) {
            await blockService.updateBlock(block.id, { position: i });
          }
        }

        onBlockReorder?.(newOrder);
      } catch (error) {
        console.error("Failed to reorder blocks:", error);
      }
    },
    [blocks, blockService, onBlockReorder],
  );

  const handleBlockCreate = useCallback(
    async (position: number, parentBlockId?: string) => {
      if (!onBlockCreate) return;

      try {
        const newBlock = await blockService.createBlock({
          note_id: noteId,
          content: "New block",
          block_type: "paragraph",
          position,
          parent_block_id: parentBlockId,
        });

        onBlockCreate(newBlock);
      } catch (error) {
        console.error("Failed to create block:", error);
      }
    },
    [noteId, blockService, onBlockCreate],
  );

  return (
    <div className={cn("space-y-3", className)}>
      <AnimatePresence mode="popLayout">
        {blocks.map((block) => (
          <Reorder key={block.id} value={block.id} onReorder={handleReorder}>
            <motion.div
              layout
              layoutId={block.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative"
              drag
              dragMomentum={false}
              onDragStart={() => setDraggedBlock(block.id)}
              onDragEnd={() => {
                setDraggedBlock(null);
                setDropTarget(null);
              }}
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            >
              <BlockComponent
                block={block}
                onUpdate={onBlockUpdate}
                onDelete={onBlockDelete}
                onLink={onLinkCreate}
                isDragging={draggedBlock === block.id}
              />

              {/* Drop Target Indicator */}
              <motion.div
                className={cn(
                  "absolute inset-0 border-2 border-dashed rounded-2xl pointer-events-none",
                  dropTarget === block.id
                    ? "border-vibe-blue bg-vibe-blue/10"
                    : "border-white/20 bg-white/5",
                )}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: dropTarget === block.id ? 1 : 0,
                  scale: dropTarget === block.id ? 1.02 : 1,
                }}
                exit={{ opacity: 0 }}
              />

              {/* Insertion Points */}
              {position === 0 && (
                <motion.div
                  className="absolute -top-8 left-4 w-px h-8 bg-vibe-blue rounded-full opacity-0"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  whileHover={{ opacity: 1, scale: 1.2 }}
                  onClick={() => handleBlockCreate(0)}
                  title="Insert block at beginning"
                >
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full shadow-lg"
                    layoutId={`insert-start-${noteId}`}
                  >
                    <span className="text-vibe-blue text-2xl">+</span>
                  </motion.div>
                </motion.div>
              )}

              {blocks.map((b, index) => (
                <motion.div
                  key={`insert-after-${b.id}`}
                  className="absolute -left-2 top-0 bottom-0 w-px h-full opacity-0"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{
                    opacity: draggedBlock ? 0.3 : 0,
                    scaleY: dropTarget === b.id ? 1 : 0,
                  }}
                  whileHover={{ opacity: 0.6, scaleY: 1 }}
                  onClick={() => handleBlockCreate(b.position + 1, b.id)}
                  title="Insert block after this one"
                />
              ))}
            </motion.div>
          </Reorder>
        ))}
      </AnimatePresence>

      {/* Add Block Button */}
      <motion.button
        className="w-full p-8 border-2 border-dashed border-white/30 rounded-2xl
                     bg-white/5 hover:bg-white/10 transition-all duration-300
                     hover:border-vibe-blue/50 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleBlockCreate(blocks.length)}
        title="Add new block"
      >
        <motion.div
          className="w-12 h-12 mx-auto bg-vibe-blue rounded-full flex items-center justify-center"
          whileHover={{ rotate: 90 }}
        >
          <span className="text-white text-2xl">+</span>
        </motion.div>
        <span className="mt-2 text-white/60 text-sm">Add Block</span>
      </motion.button>
    </div>
  );
}
