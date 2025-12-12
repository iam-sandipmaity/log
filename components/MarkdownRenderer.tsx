import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'

interface MarkdownRendererProps {
    content: string
    className?: string
    disableLinks?: boolean // Prevents nested <a> tags when rendered inside a Link
}

export default function MarkdownRenderer({ content, className = '', disableLinks = false }: MarkdownRendererProps) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                    // Render links as spans when inside a clickable context to prevent nested <a> tags
                    a: ({ node, ...props }) => {
                        if (disableLinks) {
                            return <span className="text-blue-600 hover:underline" {...props} />
                        }
                        return <a {...props} target="_blank" rel="noopener noreferrer" />
                    },
                    // Style code blocks
                    code: ({ node, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        const isInline = !className
                        return isInline ? (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    },
                    // Add proper styling for task lists
                    input: ({ node, ...props }) => {
                        if (props.type === 'checkbox') {
                            return <input {...props} className="mr-2 align-middle" disabled />
                        }
                        return <input {...props} />
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
