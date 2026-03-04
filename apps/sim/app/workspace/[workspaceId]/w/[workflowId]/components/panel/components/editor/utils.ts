import { parse } from 'acorn'

/**
 * Matches Sim block references: `<word.path>`, `<word.path[0].nested>`, `<loop.index>`, etc.
 * Must contain a dot (.) to distinguish from HTML tags or comparison operators.
 */
const REFERENCE_PATTERN = /<[a-zA-Z]\w*(?:\.\w+(?:\[\d+\])?)+>/g

/**
 * Matches Sim env-var placeholders: `{{WORD}}`, `{{MY_VAR}}`.
 * Only allows word characters (no spaces, special chars).
 */
const ENV_VAR_PATTERN = /\{\{\w+\}\}/g

/**
 * Restores the cursor position in a textarea after a dropdown insertion.
 * Schedules a macrotask (via setTimeout) that runs after React's controlled-component commit
 * so that the cursor position sticks.
 *
 * @param textarea - The textarea element to restore cursor in (may be null)
 * @param newCursorPosition - The exact position to place the cursor at
 */
export function restoreCursorAfterInsertion(
  textarea: HTMLTextAreaElement | null,
  newCursorPosition: number
): void {
  setTimeout(() => {
    if (textarea) {
      textarea.focus()
      textarea.selectionStart = newCursorPosition
      textarea.selectionEnd = newCursorPosition
    }
  }, 0)
}

/**
 * Replaces `<Block.output>` references and `{{ENV_VAR}}` placeholders with
 * valid JS/Python identifiers so the code can be parsed without false errors.
 */
export function sanitizeForParsing(code: string): string {
  let counter = 0
  let sanitized = code.replace(ENV_VAR_PATTERN, () => `__placeholder_${counter++}__`)
  sanitized = sanitized.replace(REFERENCE_PATTERN, () => `__placeholder_${counter++}__`)
  return sanitized
}

/**
 * Validates JavaScript code for syntax errors using acorn.
 * @returns Error message string, or null if valid.
 */
export function validateJavaScript(code: string): string | null {
  try {
    parse(code, { ecmaVersion: 'latest', sourceType: 'module' })
    return null
  } catch (e: unknown) {
    if (e instanceof SyntaxError) {
      const msg = e.message
      const match = msg.match(/\((\d+):(\d+)\)/)
      if (match) {
        return `Syntax error at line ${match[1]}, col ${match[2]}: ${msg.replace(/\s*\(\d+:\d+\)/, '')}`
      }
      return `Syntax error: ${msg}`
    }
    return null
  }
}

/**
 * Validates Python code for common syntax errors: unmatched brackets/parens,
 * unterminated strings (single-line and triple-quoted).
 * Processes the entire code string as a stream to correctly handle
 * multiline triple-quoted strings.
 *
 * @returns Error message string, or null if no issues detected.
 */
export function validatePython(code: string): string | null {
  const stack: { char: string; line: number }[] = []
  const openers: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  const closers = new Set([')', ']', '}'])
  const openChars = new Set(['(', '[', '{'])

  let line = 1
  let i = 0

  while (i < code.length) {
    const ch = code[i]

    if (ch === '\n') {
      line++
      i++
      continue
    }

    if (ch === '#') {
      const newline = code.indexOf('\n', i)
      i = newline === -1 ? code.length : newline
      continue
    }

    if (ch === '"' || ch === "'") {
      const tripleQuote = ch.repeat(3)
      if (code.slice(i, i + 3) === tripleQuote) {
        const startLine = line
        const endIdx = code.indexOf(tripleQuote, i + 3)
        if (endIdx === -1) {
          return `Unterminated triple-quoted string starting at line ${startLine}`
        }
        for (let k = i; k < endIdx + 3; k++) {
          if (code[k] === '\n') line++
        }
        i = endIdx + 3
        continue
      }

      const startLine = line
      i++
      while (i < code.length && code[i] !== ch && code[i] !== '\n') {
        if (code[i] === '\\') i++
        i++
      }
      if (i >= code.length || code[i] === '\n') {
        return `Unterminated string at line ${startLine}`
      }
      i++
      continue
    }

    if (openChars.has(ch)) {
      stack.push({ char: ch, line })
    } else if (closers.has(ch)) {
      if (stack.length === 0 || stack[stack.length - 1].char !== openers[ch]) {
        return `Unmatched '${ch}' at line ${line}`
      }
      stack.pop()
    }
    i++
  }

  if (stack.length > 0) {
    const unmatched = stack[stack.length - 1]
    return `Unmatched '${unmatched.char}' opened at line ${unmatched.line}`
  }

  return null
}
