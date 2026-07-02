'use client';

import React, { useEffect, useState } from 'react';
import { createHighlighter, Highlighter } from 'shiki';

interface CodeBlockProps {
    code: string;
    lang?: string;
    theme?: string;
}

let highlighterPromise: Promise<Highlighter> | null = null;

export const getHighlighterInstance = async () => {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: ['vitesse-dark'],
            langs: ['typescript', 'javascript'],
        });
    }
    return highlighterPromise;
};

export default function CodeBlock({ code, lang = 'typescript', theme = 'vitesse-dark' }: CodeBlockProps) {
    const [html, setHtml] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const highlight = async () => {
            try {
                const highlighter = await getHighlighterInstance();
                const highlightedCode = highlighter.codeToHtml(code, {
                    lang,
                    theme,
                    structure: 'inline', // Use inline structure to avoid default pre/code wrapper styles if needed, or just style the output
                });
                // We can also just strip the background from the output or use a transformer
                // But simplest is to just let shiki do its thing and override via CSS or use a theme that matches.
                // Let's use the standard output but force transparent background via style prop on the container if needed.
                // Actually, shiki adds a bg color to the <pre>. We can override this.

                if (mounted) {
                    setHtml(highlightedCode);
                    setIsLoading(false);
                }
            } catch (error) {
                console.error('Failed to highlight code:', error);
                if (mounted) {
                    // Fallback to plain text if highlighting fails
                    setHtml(`<pre><code>${code}</code></pre>`);
                    setIsLoading(false);
                }
            }
        };

        highlight();

        return () => {
            mounted = false;
        };
    }, [code, lang, theme]);

    if (isLoading) {
        return (
            <div className="animate-pulse bg-neutral-800 rounded-md h-full w-full min-h-[100px]" />
        );
    }

    return (
        <div
            className="shiki-container h-full text-base leading-relaxed overflow-x-auto [&>pre]:bg-transparent! [&>pre]:p-4 [&>pre]:font-mono [&>pre]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
