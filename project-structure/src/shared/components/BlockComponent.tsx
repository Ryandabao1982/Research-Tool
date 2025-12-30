import React, { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Link2, MoreHorizontal, GripVertical } from "lucide-react";
import { useServices } from "../../services/serviceContext";
import type { Block, BlockType } from "../../types";
import { toast } from "react-hot-toast";

interface BlockComponentProps {
  block: Block;
  onUpdate?: (block: Block) => void;
  onDelete?: () => void;
  onLinkCreate?: (targetBlockId: string) => void;
  isDragging?: boolean;
}

/**
 * Block Component
 * Displays individual content blocks with reference capabilities
 */
export function BlockComponent({
  block,
  onUpdate,
  onDelete,
  onLinkCreate,
  isDragging,
}: BlockComponentProps) {
  const { blockService } = useServices();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(block.content);
  const [showMenu, setShowMenu] = useState(false);

  const blockTypeIcons: Record<BlockType, React.ReactNode> = {
    paragraph: null,
    heading1: "📌 H1",
    heading2: "📖 H2",
    heading3: "📝 H3",
    list: "•",
    code: "💻",
    quote: '"',
    divider: "─",
  };

  const handleSave = async () => {
    if (onUpdate) {
      onUpdate({ ...block, content });
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (onDelete && confirm("Are you sure you want to delete this block?")) {
      await blockService.deleteBlock(block.id);
      onDelete();
      toast.success("Block deleted");
    }
  };

  const getBlockStyles = () => {
    switch (block.block_type) {
      case "heading1":
        return "text-3xl font-black tracking-tighter py-4";
      case "heading2":
        return "text-2xl font-black tracking-tight py-3";
      case "heading3":
        return "text-xl font-bold py-2";
      case "code":
        return "font-mono text-sm bg-black/10 p-4 rounded-xl border border-white/10 my-2";
      case "quote":
        return "border-l-4 border-vibe-purple/30 pl-6 italic text-white/80 my-4";
      case "list":
        return "flex items-start gap-3 py-2";
      case "divider":
        return "border-t border-white/20 my-6";
      default:
        return "py-2 leading-relaxed";
    }
  };

  const getBlockElement = () => {
    switch (block.block_type) {
      case "heading1":
      case "heading2":
      case "heading3":
        return <h2 className="font-bold">{content}</h2>;
      case "code":
        return (
          <pre className="text-vibe-cyan">
            <code>{content}</code>
          </pre>
        );
      case "quote":
        return <p>{content}</p>;
      case "list":
        return (
          <div className="flex items-start gap-3">
            <span className="text-vibe-glow">•</span>
            <span>{content}</span>
          </div>
        );
      case "divider":
        return null;
      default:
        return <p>{content}</p>;
    }
  };

  return (
    <motion.div
      className={`
                relative group bg-white/[0.03] backdrop-blur-atmosphere
                border border-white/10 rounded-2xl p-4 shadow-float
                ${isDragging ? "shadow-glow border-vibe-glow/50" : "hover:border-white/20"}
            `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      layoutId={block.id}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-white/40" />
      </div>

      {/* Block Content */}
      <div className={`ml-6 pl-4 ${getBlockStyles()}`}>
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === "Escape") {
                setIsEditing(false);
                setContent(block.content);
              }
            }}
            className={`
                            w-full bg-transparent border-none outline-none
                            focus:bg-white/10 rounded-lg px-3 py-2
                            resize-none text-white
                            ${block.block_type === "code" ? "font-mono text-sm" : ""}
                        `}
            autoFocus
            rows={block.block_type === "paragraph" ? 3 : 1}
          />
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="cursor-text min-h-[40px] transition-all hover:bg-white/5 rounded-lg px-2 -mx-2 py-1"
          >
            {getBlockElement()}
          </div>
        )}
      </div>

      {/* Block Menu */}
      <div className="absolute right-2 top-2">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-white/40 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <motion.div
            className="absolute right-0 top-8 bg-black/80 backdrop-blur-xl
                        border border-white/20 rounded-xl py-2 min-w-[200px] shadow-atmosphere z-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Block Type Selector */}
            <div className="px-3 py-2 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold text-white/40 mb-2">
                Block Type
              </span>
              <div className="space-y-1">
                {(Object.keys(blockTypeIcons) as BlockType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (onUpdate) {
                        onUpdate({ ...block, block_type: type });
                      }
                      setShowMenu(false);
                    }}
                    className={`
                                            w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                            text-left transition-all
                                            ${
                                              block.block_type === type
                                                ? "bg-vibe-glow/20 text-vibe-glow"
                                                : "text-white/80 hover:bg-white/10"
                                            }
                                        `}
                  >
                    <span className="text-lg">{blockTypeIcons[type]}</span>
                    <span className="text-sm capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link Option */}
            <div className="px-3 py-2 border-b border-white/10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  if (onLinkCreate) {
                    onLinkCreate(block.id);
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                text-white/80 hover:bg-white/10 hover:text-white text-left transition-all"
              >
                <Link2 className="w-4 h-4" />
                <span>Link to Block</span>
              </button>
            </div>

            {/* Delete Option */}
            <div className="px-3 py-2">
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                text-red-400 hover:bg-red-500/20 text-left transition-all"
              >
                <span className="text-sm">Delete Block</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Block ID Badge (for linking) */}
      <div className="absolute -left-16 -top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          onClick={() => {
            navigator.clipboard.writeText(`[(${block.id})`);
            toast.success("Block ID copied");
          }}
          className="px-2 py-1 bg-black/60 backdrop-blur text-[9px] 
                           text-white/40 rounded-md font-mono cursor-pointer hover:bg-vibe-glow/20 
                           transition-all"
        >
          {block.id.slice(0, 8)}...
        </div>
      </div>
    </motion.div>
  );
}
