import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '../types';

interface NoteCardProps {
    note: Note;
    onClick?: (note: Note) => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
    const navigate = useNavigate();
    const date = new Date(note.updated_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });

    const handleOpen = () => {
        if (onClick) {
            onClick(note);
        } else {
            navigate(`/notes/${note.id}`);
        }
    };

    return (
        <div
            onClick={handleOpen}
            className="glass group p-5 rounded-3xl border border-white/5 hover:border-vibe-purple/40 transition-all duration-300 cursor-pointer flex flex-col gap-3 relative overflow-hidden"
        >
            {/* Accent Glow */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-vibe-purple/10 blur-3xl group-hover:bg-vibe-purple/20 transition-all" />

            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg leading-tight group-hover:text-vibe-purple transition-colors line-clamp-2">
                    {note.title || 'Untitled Note'}
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded-md">
                    {date}
                </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {note.content || 'Empty note content...'}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto">
                {note.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-vibe-blue/10 text-vibe-blue border border-vibe-blue/20">
                        #{tag}
                    </span>
                ))}
                {note.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                        +{note.tags.length - 3} more
                    </span>
                )}
            </div>
        </div>
    );
}
