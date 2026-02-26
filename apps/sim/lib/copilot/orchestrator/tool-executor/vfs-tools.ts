import { createLogger } from '@sim/logger'
import type { ExecutionContext, ToolCallResult } from '@/lib/copilot/orchestrator/types'
import {
  downloadWorkspaceFile,
  listWorkspaceFiles,
} from '@/lib/uploads/contexts/workspace/workspace-file-manager'
import { getOrMaterializeVFS } from '@/lib/copilot/vfs'

const logger = createLogger('VfsTools')

export async function executeVfsGrep(
  params: Record<string, unknown>,
  context: ExecutionContext
): Promise<ToolCallResult> {
  const pattern = params.pattern as string | undefined
  if (!pattern) {
    return { success: false, error: "Missing required parameter 'pattern'" }
  }

  const workspaceId = context.workspaceId
  if (!workspaceId) {
    return { success: false, error: 'No workspace context available' }
  }

  try {
    const vfs = await getOrMaterializeVFS(workspaceId, context.userId)
    const result = vfs.grep(pattern, params.path as string | undefined, {
      maxResults: (params.maxResults as number) ?? 50,
      outputMode: (params.output_mode as 'content' | 'files_with_matches' | 'count') ?? 'content',
      ignoreCase: (params.ignoreCase as boolean) ?? false,
      lineNumbers: (params.lineNumbers as boolean) ?? true,
      context: (params.context as number) ?? 0,
    })
    const outputMode = (params.output_mode as string) ?? 'content'
    const key =
      outputMode === 'files_with_matches' ? 'files' : outputMode === 'count' ? 'counts' : 'matches'
    const matchCount = Array.isArray(result)
      ? result.length
      : typeof result === 'object'
        ? Object.keys(result).length
        : 0
    logger.debug('vfs_grep result', { pattern, path: params.path, outputMode, matchCount })
    return { success: true, output: { [key]: result } }
  } catch (err) {
    logger.error('vfs_grep failed', {
      pattern,
      path: params.path,
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: false, error: err instanceof Error ? err.message : 'vfs_grep failed' }
  }
}

export async function executeVfsGlob(
  params: Record<string, unknown>,
  context: ExecutionContext
): Promise<ToolCallResult> {
  const pattern = params.pattern as string | undefined
  if (!pattern) {
    return { success: false, error: "Missing required parameter 'pattern'" }
  }

  const workspaceId = context.workspaceId
  if (!workspaceId) {
    return { success: false, error: 'No workspace context available' }
  }

  try {
    const vfs = await getOrMaterializeVFS(workspaceId, context.userId)
    const files = vfs.glob(pattern)
    logger.debug('vfs_glob result', { pattern, fileCount: files.length })
    return { success: true, output: { files } }
  } catch (err) {
    logger.error('vfs_glob failed', {
      pattern,
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: false, error: err instanceof Error ? err.message : 'vfs_glob failed' }
  }
}

export async function executeVfsRead(
  params: Record<string, unknown>,
  context: ExecutionContext
): Promise<ToolCallResult> {
  const path = params.path as string | undefined
  if (!path) {
    return { success: false, error: "Missing required parameter 'path'" }
  }

  const workspaceId = context.workspaceId
  if (!workspaceId) {
    return { success: false, error: 'No workspace context available' }
  }

  try {
    const vfs = await getOrMaterializeVFS(workspaceId, context.userId)
    const result = vfs.read(
      path,
      params.offset as number | undefined,
      params.limit as number | undefined
    )
    if (!result) {
      // Dynamic content fetch for workspace files: read("files/lit-rock.json")
      // resolves to the actual file content from storage.
      const fileContent = await tryReadWorkspaceFile(path, workspaceId)
      if (fileContent) {
        logger.debug('vfs_read resolved workspace file', { path, totalLines: fileContent.totalLines })
        return { success: true, output: fileContent }
      }

      const suggestions = vfs.suggestSimilar(path)
      logger.warn('vfs_read file not found', { path, suggestions })
      const hint =
        suggestions.length > 0
          ? ` Did you mean: ${suggestions.join(', ')}?`
          : ' Use glob to discover available paths.'
      return { success: false, error: `File not found: ${path}.${hint}` }
    }
    logger.debug('vfs_read result', { path, totalLines: result.totalLines })
    return { success: true, output: result }
  } catch (err) {
    logger.error('vfs_read failed', {
      path,
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: false, error: err instanceof Error ? err.message : 'vfs_read failed' }
  }
}

const MAX_FILE_READ_BYTES = 512 * 1024 // 512 KB

const TEXT_TYPES = new Set([
  'text/plain', 'text/csv', 'text/markdown', 'text/html', 'text/xml',
  'application/json', 'application/xml', 'application/javascript',
])

function isReadableType(contentType: string): boolean {
  return TEXT_TYPES.has(contentType) || contentType.startsWith('text/')
}

/**
 * Resolve a VFS path like "files/lit-rock.json" to actual workspace file content.
 * Matches by original filename against the workspace_files table.
 */
async function tryReadWorkspaceFile(
  path: string,
  workspaceId: string
): Promise<{ content: string; totalLines: number } | null> {
  // Match "files/{name}" or "files/{name}/content" patterns
  const match = path.match(/^files\/(.+?)(?:\/content)?$/)
  if (!match) return null
  const fileName = match[1]

  // Skip if it's a meta.json path (handled by normal VFS)
  if (fileName.endsWith('/meta.json') || path.endsWith('/meta.json')) return null

  try {
    const files = await listWorkspaceFiles(workspaceId)
    const record = files.find(
      (f) => f.name === fileName || f.name.normalize('NFC') === fileName.normalize('NFC')
    )
    if (!record) return null

    if (!isReadableType(record.type)) {
      return {
        content: `[Binary file: ${record.name} (${record.type}, ${record.size} bytes). Cannot display as text.]`,
        totalLines: 1,
      }
    }

    if (record.size > MAX_FILE_READ_BYTES) {
      return {
        content: `[File too large to display inline: ${record.name} (${record.size} bytes, limit ${MAX_FILE_READ_BYTES}). Use workspace_file read with fileId "${record.id}" to read it.]`,
        totalLines: 1,
      }
    }

    const buffer = await downloadWorkspaceFile(record)
    const content = buffer.toString('utf-8')
    return { content, totalLines: content.split('\n').length }
  } catch (err) {
    logger.warn('Failed to read workspace file content', {
      path,
      fileName,
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}

export async function executeVfsList(
  params: Record<string, unknown>,
  context: ExecutionContext
): Promise<ToolCallResult> {
  const path = params.path as string | undefined
  if (!path) {
    return { success: false, error: "Missing required parameter 'path'" }
  }

  const workspaceId = context.workspaceId
  if (!workspaceId) {
    return { success: false, error: 'No workspace context available' }
  }

  try {
    const vfs = await getOrMaterializeVFS(workspaceId, context.userId)
    const entries = vfs.list(path)
    logger.debug('vfs_list result', { path, entryCount: entries.length })
    return { success: true, output: { entries } }
  } catch (err) {
    logger.error('vfs_list failed', {
      path,
      error: err instanceof Error ? err.message : String(err),
    })
    return { success: false, error: err instanceof Error ? err.message : 'vfs_list failed' }
  }
}
