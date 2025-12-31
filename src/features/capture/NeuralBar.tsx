import { useState, useEffect } from 'react';

export function NeuralBar() {
    const [query, setQuery] = useState('');

    // Auto-focus logic will go here
    useEffect(() => {
        // Focus input on mount
    }, []);

    return (
        <div className="h-full w-full flex items-center justify-center p-2 bg-transparent">
            {/* Glassmorphism Container with Neural Pulse */}
            <div
                className={`
          w-full h-14 bg-slate-900/80 backdrop-blur-2xl 
          border border-white/10 rounded-xl shadow-2xl 
          flex items-center px-4 gap-3 overflow-hidden 
          transition-all duration-300 ease-out
          ${query.length > 0 ? 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] border-blue-500/30' : 'shadow-xl'}
        `}
            >

                {/* Icon / Leading */}
                <div className={`transition-colors duration-300 ${query.length > 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Capture a thought..."
                    className="bg-transparent border-none outline-none text-white placeholder-slate-500 text-lg w-full font-medium"
                    autoFocus
                />

                {/* Trailing / Actions */}
                <div className="flex items-center gap-2">
                    <div className={`transition-all duration-300 ${query.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                        <span className="text-[10px] bg-blue-500/20 text-blue-200 px-2 py-1 rounded font-mono border border-blue-500/30">
                            ENTER
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
