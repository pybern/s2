import { unified } from "unified"
import remarkParse from "remark-parse"
import { visit } from "unist-util-visit"

/**
 * Extracts all SQL code blocks from a Markdown string using an AST parser.
 *
 * @param markdownText The Markdown text to parse.
 * @returns An array of SQL code snippets.
 */
export function extractSqlWithRemark(markdownText: string): string[] {
  const sqlBlocks: string[] = []
  const processor = unified().use(remarkParse)
  const tree = processor.parse(markdownText)

  // CORRECTED LINE: The 'lang' property can also be 'null'.
  visit(tree, "code", (node: { type: "code"; lang?: string | null; value: string }) => {
    if (node.lang === "sql") {
      sqlBlocks.push(node.value)
    }
  })

  return sqlBlocks
}
