import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    Sparkles, Send, BrainCircuit, Quote, Clock, ShieldCheck, 
    Plus, Settings, FileText, Copy, ThumbsUp, ThumbsDown, 
    RotateCcw, MessageSquare, Zap, TrendingUp, BookOpen
} from 'lucide-react';
import { useServices } from '../../shared/services/serviceContext';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
    AIConversation, 
    AIMessage, 
    AIModel, 
    TokenUsage,
    AICitation 
} from '../../shared/types';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AIChatPanelProps {
    activeNoteId?: string;
    className?: string;
}

export function AIChatPanel({ activeNoteId, className }: AIChatPanelProps) {
    const { aiService } = useServices();
    const queryClient = useQueryClient();
    
    // UI State
    const [query, setQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedContent, setStreamedContent] = useState('');
    const [showModels, setShowModels] = useState(false);
    const [showNewConversation, setShowNewConversation] = useState(false);
    
    // Refs
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Queries
    const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
        queryKey: ['ai-conversations'],
        queryFn: () => aiService.listConversations(),
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const { data: models = [] } = useQuery({
        queryKey: ['ai-models'],
        queryFn: () => aiService.getAvailableModels(),
    });

    const { data: messages = [] } = useQuery({
        queryKey: ['ai-messages', selectedConversation],
        queryFn: () => selectedConversation ? aiService.getConversationHistory(selectedConversation) : [],
        enabled: !!selectedConversation,
    });

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamedContent]);

    // Initialize providers on mount
    useEffect(() => {
        aiService.initializeProviders().catch(console.error);
    }, [aiService]);

    // Mutations
    const generateMutation = useMutation({
        mutationFn: async (request: any) => {
            if (!request.stream) {
                return aiService.generate(request);
            } else {
                // Handle streaming
                setIsStreaming(true);
                setStreamedContent('');
                let fullResponse = '';
                
                for await (const chunk of aiService.generateStream(request)) {
                    fullResponse += chunk;
                    setStreamedContent(fullResponse);
                }
                
                setIsStreaming(false);
                return {
                    answer: fullResponse,
                    citations: [],
                    confidence_score: 0.9,
                    model_used: 'phi3.1:mini',
                    processing_time: 1500,
                    token_usage: {
                        prompt_tokens: aiService.estimateTokens(request.query),
                        completion_tokens: aiService.estimateTokens(fullResponse),
                        total_tokens: aiService.estimateTokens(request.query + fullResponse)
                    }
                };
            }
        },
        onSuccess: (data) => {
            if (selectedConversation) {
                // Add user message
                addUserMessage.mutate({
                    conversationId: selectedConversation,
                    role: 'user',
                    content: query
                });
                
                // Add assistant message
                setTimeout(() => {
                    addAssistantMessage.mutate({
                        conversationId: selectedConversation,
                        role: 'assistant',
                        content: data.answer,
                        citations: JSON.stringify(data.citations)
                    });
                }, 100);
            }
        },
        onError: (error) => {
            console.error('AI generation error:', error);
            setIsStreaming(false);
        }
    });

    const createConversationMutation = useMutation({
        mutationFn: (title: string) => aiService.createConversation(title),
        onSuccess: (conversation) => {
            setSelectedConversation(conversation.id);
            setShowNewConversation(false);
            queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
    });

    const addUserMessage = useMutation({
        mutationFn: (message: { conversationId: string; role: string; content: string }) => 
            aiService.addMessage(message.conversationId, message.role, message.content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-messages', selectedConversation] });
            queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
    });

    const addAssistantMessage = useMutation({
        mutationFn: (message: { conversationId: string; role: string; content: string; citations?: string }) => 
            aiService.addMessage(message.conversationId, message.role, message.content, message.citations),
        onSuccess: () => {
            setQuery('');
            setStreamedContent('');
            queryClient.invalidateQueries({ queryKey: ['ai-messages', selectedConversation] });
            queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
    });

    // Handlers
    const handleSend = (useStreaming = true) => {
        if (!query.trim() || generateMutation.isPending || isStreaming) return;

        if (!selectedConversation) {
            // Create new conversation automatically
            createConversationMutation.mutate(`Chat about: ${query.substring(0, 30)}...`);
        }

        const contextDocuments = activeNoteId ? [activeNoteId] : [];
        
        generateMutation.mutate({
            query,
            context_documents: contextDocuments,
            include_citations: true,
            model_preference: aiService.selectOptimalModel(query, models),
            temperature: 0.7,
            max_tokens: 2048,
            stream: useStreaming
        });
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleNewConversation = () => {
        createConversationMutation.mutate('New Conversation');
    };

    const selectedModel = models.find(m => m.id === 'phi3.1:mini') || models[0];

    return (
        <Card variant="solid" className={cn("h-full flex flex-col p-0 border-white/5 bg-zinc-950/50 backdrop-blur-2xl overflow-hidden rounded-[2.5rem]", className)}>
            
            {/* Header */}
            <header className="p-6 border-b border-white/5 bg-zinc-900/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-vibe-blue/10 flex items-center justify-center border border-vibe-blue/20">
                            <BrainCircuit className="text-vibe-blue w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black tracking-tight uppercase">Research Assistant</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                    {selectedModel?.name || 'Loading...'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowModels(!showModels)}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <Settings className="w-4 h-4 text-white/30" />
                        </button>
                        <ShieldCheck className="text-white/10 w-5 h-5" />
                    </div>
                </div>

                {/* Model Selector */}
                {showModels && models.length > 0 && (
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/5">
                        <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Available Models</h4>
                        <div className="space-y-2">
                            {models.map(model => (
                                <div key={model.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            model.requires_gpu ? "bg-orange-500" : "bg-green-500"
                                        )} />
                                        <div>
                                            <div className="text-xs font-semibold">{model.name}</div>
                                            <div className="text-[9px] text-white/30">
                                                {model.context_length.toLocaleString()} tokens • {model.size_mb}MB
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {model.capabilities.includes('Streaming') && (
                                            <Zap className="w-3 h-3 text-white/20" />
                                        )}
                                        {model.capabilities.includes('ChatCompletion') && (
                                            <MessageSquare className="w-3 h-3 text-white/20" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conversation Selector */}
                {conversations.length > 0 && (
                    <div className="mt-4">
                        <select 
                            value={selectedConversation || ''}
                            onChange={(e) => setSelectedConversation(e.target.value || null)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-vibe-blue/40"
                        >
                            <option value="">New Conversation</option>
                            {conversations.map(conv => (
                                <option key={conv.id} value={conv.id}>
                                    {conv.title} ({conv.message_count} messages)
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                
                {/* Empty State */}
                {messages.length === 0 && !isStreaming && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 px-8">
                        <Sparkles className="w-12 h-12 mb-2" />
                        <h4 className="font-bold">Neural Grounding Active</h4>
                        <p className="text-xs leading-relaxed">
                            I can analyze your current note or search across your entire knowledge base using local-first intelligence.
                        </p>
                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="w-6 h-6 text-white/20" />
                                <span className="text-[9px] font-bold">Document Analysis</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <TrendingUp className="w-6 h-6 text-white/20" />
                                <span className="text-[9px] font-bold">Smart Q&A</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <BookOpen className="w-6 h-6 text-white/20" />
                                <span className="text-[9px] font-bold">Study Guides</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Render messages */}
                {messages.map((message, i) => (
                    <div key={i} className={cn(
                        "flex flex-col gap-2 max-w-[85%]",
                        message.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}>
                        
                        {/* Message bubble */}
                        <div className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-atmosphere relative group",
                            message.role === 'user'
                                ? "bg-vibe-blue/10 text-vibe-blue border border-vibe-blue/20"
                                : "bg-white/5 text-white/80 border border-white/5"
                        )}>
                            
                            {/* Copy button */}
                            <button
                                onClick={() => handleCopy(message.content)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Copy className="w-3 h-3 text-white/20" />
                            </button>

                            {message.content}
                            
                            {/* Token usage for assistant messages */}
                            {message.role === 'assistant' && message.token_usage && (
                                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-white/20">
                                    <span>{message.token_usage.total_tokens} tokens</span>
                                    <span>{message.model_used}</span>
                                </div>
                            )}
                        </div>

                        {/* Citations */}
                        {message.citations && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {JSON.parse(message.citations || '[]').map((citation: AICitation, ci: number) => (
                                    <div key={ci} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-tighter">
                                        <Quote size={10} /> {citation.document_title}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Message metadata */}
                        <div className="text-[9px] font-bold text-white/10 uppercase tracking-widest px-1 flex items-center gap-2">
                            <span>{message.role === 'assistant' ? 'Assistant' : 'You'}</span>
                            <span>•</span>
                            <Clock className="inline w-2 h-2" />
                            <span>{new Date(message.created_at).toLocaleTimeString()}</span>
                            
                            {/* Feedback for assistant messages */}
                            {message.role === 'assistant' && (
                                <>
                                    <span>•</span>
                                    <div className="flex gap-1">
                                        <button className="hover:text-white/30">
                                            <ThumbsUp className="w-3 h-3" />
                                        </button>
                                        <button className="hover:text-white/30">
                                            <ThumbsDown className="w-3 h-3" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* Streaming response */}
                {isStreaming && streamedContent && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <BrainCircuit className="text-white/20 w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed bg-white/5 text-white/80 border border-white/5">
                                {streamedContent}
                                <span className="inline-block w-2 h-4 bg-vibe-blue/50 animate-pulse ml-1" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading indicator */}
                {generateMutation.isPending && !isStreaming && (
                    <div className="flex items-start gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                            <BrainCircuit className="text-white/20 w-4 h-4" />
                        </div>
                        <div className="space-y-2 mt-1">
                            <div className="h-3 w-48 bg-white/5 rounded-full" />
                            <div className="h-3 w-32 bg-white/5 rounded-full" />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <footer className="p-6 bg-zinc-900/30 border-t border-white/5">
                <div className="relative group">
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(true); // Default to streaming
                            } else if (e.key === 'Enter' && e.shiftKey) {
                                e.preventDefault();
                                handleSend(false); // Non-streaming on Shift+Enter
                            }
                        }}
                        placeholder="Ask your knowledge base... (Enter to send, Shift+Enter for non-streaming)"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-20 text-sm focus:outline-none focus:border-vibe-blue/40 transition-all placeholder:text-white/10"
                    />
                    
                    <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
                        {activeNoteId && (
                            <div className="px-2 py-1 bg-vibe-blue/10 border border-vibe-blue/20 rounded-lg text-[9px] font-bold text-vibe-blue">
                                Context Active
                            </div>
                        )}
                        
                        <button
                            onClick={() => handleNewConversation()}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            title="New conversation"
                        >
                            <Plus size={16} className="text-white/30" />
                        </button>
                        
                        <button
                            onClick={() => handleSend(true)}
                            disabled={!query.trim() || generateMutation.isPending || isStreaming}
                            className="w-10 h-10 rounded-xl bg-vibe-blue text-white flex items-center justify-center hover:bg-vibe-blue/80 transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                    <p className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em]">
                        Privacy Guaranteed • No Cloud Processing
                    </p>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowNewConversation(true)}
                            className="text-[9px] text-white/20 hover:text-white/30 transition-colors"
                        >
                            <RotateCcw className="inline w-3 h-3 mr-1" />
                            Reset
                        </button>
                    </div>
                </div>
            </footer>
        </Card>
    );
}