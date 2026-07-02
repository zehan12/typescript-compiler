'use client';

import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { getHighlighterInstance } from './CodeBlock';
import { Highlighter } from 'shiki';

interface ShikiEditorProps {
    value: string;
    onChange: (value: string) => void;
    lang?: string;
    theme?: string;
    className?: string;
}

export default function ShikiEditor({ value, onChange, lang = 'typescript', theme = 'vitesse-dark', className = '' }: ShikiEditorProps) {
    const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

    useEffect(() => {
        getHighlighterInstance().then(setHighlighter);
    }, []);

    const highlight = (code: string) => {
        if (!highlighter) {
            return `<pre class="font-mono text-base leading-relaxed p-0 bg-transparent text-neutral-300">${code}</pre>`;
        }

        // We need to use 'inline' structure or manually strip pre/code tags if we want strict control,
        // but react-simple-code-editor expects HTML that looks like the content.
        // Shiki returns a <pre>...</pre> block.
        // We can use the transformer to strip it or just regex it out if needed.
        // Or we can just use the inner HTML.

        const html = highlighter.codeToHtml(code, {
            lang,
            theme,
            structure: 'inline',
        });

        // If structure is inline, it returns <span>...</span>. We might need to wrap it in our own styled span/div?
        // Actually react-simple-code-editor puts this HTML inside a <pre><code>...</code></pre> usually?
        // No, it puts it inside a <div ...> <pre ...> ... </pre> </div> structure.
        // Let's just return the html.

        return html;
    };

    return (
        <div className={`relative font-mono text-base leading-relaxed overflow-hidden ${className}`}>
            <Editor
                value={value}
                onValueChange={onChange}
                highlight={highlight}
                padding={16}
                className="font-mono text-base bg-transparent min-h-full"
                textareaClassName="focus:outline-none"
                style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    fontSize: '1rem', // text-base
                    lineHeight: '1.625', // leading-relaxed
                    backgroundColor: 'transparent',
                }}
            />
        </div>
    );
}
