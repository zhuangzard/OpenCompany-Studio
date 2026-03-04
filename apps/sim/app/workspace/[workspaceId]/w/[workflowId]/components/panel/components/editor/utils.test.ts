/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { sanitizeForParsing, validateJavaScript, validatePython } from './utils'

describe('sanitizeForParsing', () => {
  it('replaces <Block.output> references with valid identifiers', () => {
    const result = sanitizeForParsing('const x = <Block.output>')
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).toContain('__placeholder_')
  })

  it('replaces {{ENV_VAR}} with valid identifiers', () => {
    const result = sanitizeForParsing('const url = {{API_URL}}')
    expect(result).not.toContain('{{')
    expect(result).not.toContain('}}')
    expect(result).toContain('__placeholder_')
  })

  it('replaces nested path references like <Block.output[0].field>', () => {
    const result = sanitizeForParsing('const x = <Agent.response.choices[0].text>')
    expect(result).not.toContain('<Agent')
  })

  it('replaces loop/parallel context references', () => {
    const result = sanitizeForParsing('const item = <loop.currentItem>')
    expect(result).not.toContain('<loop')
  })

  it('replaces variable references', () => {
    const result = sanitizeForParsing('const v = <variable.myVar>')
    expect(result).not.toContain('<variable')
  })

  it('handles multiple references in one string', () => {
    const code = 'const a = <Block1.out>; const b = {{SECRET}}; const c = <Block2.value>'
    const result = sanitizeForParsing(code)
    expect(result).not.toContain('<Block1')
    expect(result).not.toContain('{{SECRET}}')
    expect(result).not.toContain('<Block2')
    expect(result.match(/__placeholder_/g)?.length).toBe(3)
  })

  it('does not replace regular JS comparison operators', () => {
    const code = 'if (a < b && c > d) {}'
    const result = sanitizeForParsing(code)
    expect(result).toBe(code)
  })

  it('does not replace HTML tags that are not references', () => {
    const code = 'const html = "<div>hello</div>"'
    const result = sanitizeForParsing(code)
    expect(result).toBe(code)
  })
})

describe('validateJavaScript', () => {
  it('returns null for valid JavaScript', () => {
    expect(validateJavaScript('const x = 1')).toBeNull()
    expect(validateJavaScript('function foo() { return 42 }')).toBeNull()
    expect(validateJavaScript('const arr = [1, 2, 3].map(x => x * 2)')).toBeNull()
  })

  it('returns null for valid async/await code', () => {
    expect(validateJavaScript('async function foo() { await bar() }')).toBeNull()
  })

  it('returns null for valid ES module syntax', () => {
    expect(validateJavaScript('import { foo } from "bar"')).toBeNull()
    expect(validateJavaScript('export default function() {}')).toBeNull()
  })

  it('detects missing closing brace', () => {
    const result = validateJavaScript('function foo() {')
    expect(result).not.toBeNull()
    expect(result).toContain('Syntax error')
  })

  it('detects missing closing paren', () => {
    const result = validateJavaScript('console.log("hello"')
    expect(result).not.toBeNull()
    expect(result).toContain('Syntax error')
  })

  it('detects unexpected token', () => {
    const result = validateJavaScript('const = 5')
    expect(result).not.toBeNull()
    expect(result).toContain('Syntax error')
  })

  it('includes line and column in error message', () => {
    const result = validateJavaScript('const x = 1\nconst = 5')
    expect(result).toMatch(/line \d+/)
    expect(result).toMatch(/col \d+/)
  })

  it('returns null for empty code', () => {
    expect(validateJavaScript('')).toBeNull()
  })

  it('does not error on sanitized references', () => {
    const code = sanitizeForParsing('const x = <Block.output> + {{ENV_VAR}}')
    expect(validateJavaScript(code)).toBeNull()
  })
})

describe('validatePython', () => {
  it('returns null for valid Python', () => {
    expect(validatePython('x = 1')).toBeNull()
    expect(validatePython('def foo():\n  return 42')).toBeNull()
    expect(validatePython('arr = [1, 2, 3]')).toBeNull()
  })

  it('returns null for Python with comments', () => {
    expect(validatePython('x = 1  # this is a comment')).toBeNull()
    expect(validatePython('# full line comment\nx = 1')).toBeNull()
  })

  it('returns null for Python with strings containing brackets', () => {
    expect(validatePython('x = "hello (world)"')).toBeNull()
    expect(validatePython("x = 'brackets [here] {too}'")).toBeNull()
  })

  it('returns null for triple-quoted strings', () => {
    expect(validatePython('x = """hello\nworld"""')).toBeNull()
    expect(validatePython("x = '''multi\nline\nstring'''")).toBeNull()
  })

  it('returns null for triple-quoted strings with brackets', () => {
    expect(validatePython('x = """has { and ( inside"""')).toBeNull()
  })

  it('detects unmatched opening paren', () => {
    const result = validatePython('foo(1, 2')
    expect(result).not.toBeNull()
    expect(result).toContain("'('")
  })

  it('detects unmatched closing paren', () => {
    const result = validatePython('foo)')
    expect(result).not.toBeNull()
    expect(result).toContain("')'")
  })

  it('detects unmatched bracket', () => {
    const result = validatePython('arr = [1, 2')
    expect(result).not.toBeNull()
    expect(result).toContain("'['")
  })

  it('detects unterminated string', () => {
    const result = validatePython('x = "hello')
    expect(result).not.toBeNull()
    expect(result).toContain('Unterminated string')
  })

  it('detects unterminated triple-quoted string', () => {
    const result = validatePython('x = """hello')
    expect(result).not.toBeNull()
    expect(result).toContain('Unterminated triple-quoted string')
  })

  it('includes line number in error', () => {
    const result = validatePython('x = 1\ny = (2')
    expect(result).toMatch(/line 2/)
  })

  it('handles escaped quotes in strings', () => {
    expect(validatePython('x = "hello \\"world\\""')).toBeNull()
    expect(validatePython("x = 'it\\'s fine'")).toBeNull()
  })

  it('handles brackets inside comments', () => {
    expect(validatePython('x = 1  # unmatched ( here')).toBeNull()
  })

  it('returns null for empty code', () => {
    expect(validatePython('')).toBeNull()
  })

  it('does not error on sanitized references', () => {
    const code = sanitizeForParsing('x = <Block.output> + {{ENV_VAR}}')
    expect(validatePython(code)).toBeNull()
  })
})
