import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '../../../shared/utils';
import { useWikiNavigation } from '../../../shared/hooks/useWikiNavigation';

interface MarkdownPreviewProps {
    content: string;
    className?: string;
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
    const { handleWikiLinkClick } = useWikiNavigation();

    // Process WikiLinks: [[Title]] or [[Title|Alias]]
    const processedContent = useMemo(() => {
        return content.replace(/\[\[(.*?)\]\]/g, (match, capture) => {
            const [title, alias] = capture.split('|');
            const displayText = alias || title;
            const url = `/notes/${encodeURIComponent(title.trim())}`;
            return `[${displayText}](${url})`;
        });
    }, [content]);

    return (
        <div
            className={cn(
                "prose prose-invert prose-blue max-w-none prose-p:leading-relaxed prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-headings:font-bold prose-headings:tracking-tight",
                className
            )}
            data-testid="markdown-preview"
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Custom link handling
                    a: ({ node, ...props }) => {
                        const href = props.href || '';
                        const isInternal = href.startsWith('/notes/');

                        const handleClick = async (e: React.MouseEvent) => {
                            if (!isInternal) return;
                            e.preventDefault();

                            // Extract title from URL path
                            const title = decodeURIComponent(href.replace('/notes/', ''));
                            await handleWikiLinkClick(title);
                        };

                        if (isInternal) {
                            return (
                                <a
                                    href={href}
                                    onClick={handleClick}
                                    className="cursor-pointer text-blue-400 hover:text-blue-300 no-underline border-b border-blue-500/30 hover:border-blue-400 transition-colors"
                                >
                                    {props.children}
                                </a>
                            );
                        }

                        return (
                            <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 no-underline border-b border-blue-500/30 hover:border-blue-400 transition-colors"
                            />
                        );
                    },
                    blockquote: ({ node, ...props }) => (
                        <blockquote {...props} className="border-l-4 border-blue-500/50 bg-blue-500/5 px-4 py-1 italic" />
                    )
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div >
    );
}
