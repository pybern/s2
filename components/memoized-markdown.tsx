"use client"

import { marked } from "marked"
import { memo, useMemo } from "react"
import ReactMarkdown from "react-markdown"

// --- The Fix ---
// Define the components object *once* outside the component render cycle.
// This object will have a stable reference across all renders.
const markdownComponents = {
  code: ({ className, children, ...props }: any) => {
    const isInline = !className
    if (isInline) {
      return (
        <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm font-mono break-words" {...props}>
          {children}
        </code>
      )
    }
    return (
      <pre className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded border overflow-x-auto max-w-full">
        <code className="text-sm font-mono whitespace-pre-wrap break-words" {...props}>
          {children}
        </code>
      </pre>
    )
  },
  pre: ({ children, ...props }: any) => (
    <pre
      className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded border overflow-x-auto max-w-full whitespace-pre-wrap"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto max-w-full my-4">
      <table className="min-w-full border-collapse" {...props}>
        {children}
      </table>
    </div>
  ),
  p: ({ children, ...props }: any) => (
    <p className="break-words" {...props}>
      {children}
    </p>
  ),
}

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <div className="max-w-full overflow-hidden break-words prose prose-sm dark:prose-invert max-w-none">
        {/* Now, we pass the stable components object */}
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>
    )
  },
  // This custom comparison is still valuable for the block itself
  (prevProps, nextProps) => {
    return prevProps.content === nextProps.content
  },
)
MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

export const MemoizedMarkdown = memo(({ content, id }: { content: string; id: string }) => {
  const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content])
  return blocks.map((block, index) => <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />)
})
MemoizedMarkdown.displayName = "MemoizedMarkdown"
