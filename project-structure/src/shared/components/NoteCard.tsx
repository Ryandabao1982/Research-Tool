import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Note } from '../types';
import { Calendar, Hash, ArrowUpRight } from 'lucide-react';

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
            className="group glass relative p-6 rounded-[2rem] border border-white/5 hover:border-vibe-purple/40 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer flex flex-col gap-4 overflow-hidden animate-slide-up"
        >
            {/* Background Atmosphere */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-vibe-purple/5 blur-[80px] group-hover:bg-vibe-purple/15 transition-all duration-700" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-vibe-blue/5 blur-[50px] group-hover:bg-vibe-blue/10 transition-all duration-700" />

            <div className="flex justify-between items-start relative z-10">
                <div className="space-y-1">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-vibe-purple transition-colors duration-500 line-clamp-2">
                        {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
                        <Calendar size={10} />
                        <span>Updated {date}</span>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <ArrowUpRight size={14} className="text-vibe-purple" />
                </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed relative z-10 group-hover:text-white/60 transition-colors duration-500">
                {note.content || 'Start recording your research discoveries...'}
            </p>

            <div className="flex flex-wrap gap-2 mt-auto relative z-10">
                {note.tags.slice(0, 3).map(tag => (
                    <div key={tag} className="flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/5 group-hover:border-vibe-blue/20 group-hover:text-vibe-blue group-hover:bg-vibe-blue/5 transition-all duration-500">
                        <Hash size={8} />
                        {tag}
                    </div>
                ))}
            </div>

            {/* Scale Effect on Hover */}
            <div className="absolute inset-0 border border-white/0 group-hover:border-white/5 rounded-[2rem] transition-all duration-700 pointer-events-none" />
        </div>
    );
}
