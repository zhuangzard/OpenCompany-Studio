'use client'

import { useCallback, useState } from 'react'
import { createLogger } from '@sim/logger'
import { Columns, Plus, Rows3 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import {
  Badge,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
} from '@/components/emcn'
import { Table as TableIcon } from '@/components/emcn/icons'
import { Skeleton } from '@/components/ui'
import type { TableDefinition } from '@/lib/table'
import {
  ResourceContent,
  ResourceEmptyState,
  ResourceHeader,
  ResourceIconBadge,
  ResourceLayout,
  ResourceSearch,
  ResourceToolbar,
} from '@/app/workspace/[workspaceId]/components/resource-layout'
import { useUserPermissionsContext } from '@/app/workspace/[workspaceId]/providers/workspace-permissions-provider'
import { SchemaModal } from '@/app/workspace/[workspaceId]/tables/[tableId]/components'
import { CreateModal, TablesListContextMenu } from '@/app/workspace/[workspaceId]/tables/components'
import { TableContextMenu } from '@/app/workspace/[workspaceId]/tables/components/table-context-menu'
import { formatAbsoluteDate, formatRelativeTime } from '@/app/workspace/[workspaceId]/tables/utils'
import { useContextMenu } from '@/app/workspace/[workspaceId]/w/components/sidebar/hooks'
import { useDeleteTable, useTablesList } from '@/hooks/queries/tables'
import { useDebounce } from '@/hooks/use-debounce'

const logger = createLogger('Tables')

export function Tables() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string
  const userPermissions = useUserPermissionsContext()

  const { data: tables = [], isLoading, error } = useTablesList(workspaceId)
  const deleteTable = useDeleteTable(workspaceId)

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSchemaModalOpen, setIsSchemaModalOpen] = useState(false)
  const [activeTable, setActiveTable] = useState<TableDefinition | null>(null)

  const {
    isOpen: isListContextMenuOpen,
    position: listContextMenuPosition,
    menuRef: listMenuRef,
    handleContextMenu: handleListContextMenu,
    closeMenu: closeListContextMenu,
  } = useContextMenu()

  const {
    isOpen: isRowContextMenuOpen,
    position: rowContextMenuPosition,
    menuRef: rowMenuRef,
    handleContextMenu: handleRowContextMenu,
    closeMenu: closeRowContextMenu,
  } = useContextMenu()

  const handleContentContextMenu = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      const isOnRow = target.closest('[data-table-row]')
      const isOnInteractive = target.closest('button, input, a, [role="button"]')

      if (!isOnRow && !isOnInteractive) {
        handleListContextMenu(e)
      }
    },
    [handleListContextMenu]
  )

  const handleTableRowContextMenu = useCallback(
    (e: React.MouseEvent, table: TableDefinition) => {
      setActiveTable(table)
      handleRowContextMenu(e)
    },
    [handleRowContextMenu]
  )

  const handleDelete = async () => {
    if (!activeTable) return
    try {
      await deleteTable.mutateAsync(activeTable.id)
      setIsDeleteDialogOpen(false)
      setActiveTable(null)
    } catch (err) {
      logger.error('Failed to delete table:', err)
    }
  }

  const navigateToTable = useCallback(
    (tableId: string) => {
      router.push(`/workspace/${workspaceId}/tables/${tableId}`)
    },
    [router, workspaceId]
  )

  const filteredTables = tables.filter((table) => {
    if (!debouncedSearchQuery) return true
    const query = debouncedSearchQuery.toLowerCase()
    return (
      table.name.toLowerCase().includes(query) || table.description?.toLowerCase().includes(query)
    )
  })

  return (
    <>
      <ResourceLayout onContextMenu={handleContentContextMenu}>
        <ResourceHeader
          icon={
            <ResourceIconBadge
              icon={TableIcon}
              borderClassName='border-[#3B82F6] dark:border-[#1E40AF]'
              bgClassName='bg-[#EFF6FF] dark:bg-[#1E3A5F]'
              iconClassName='text-[#3B82F6] dark:text-[#60A5FA]'
            />
          }
          title='Tables'
          action={
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={userPermissions.canEdit !== true}
                  variant='tertiary'
                  className='h-8 rounded-md'
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' />
                  Create Table
                </Button>
              </Tooltip.Trigger>
              {userPermissions.canEdit !== true && (
                <Tooltip.Content>Write permission required to create tables</Tooltip.Content>
              )}
            </Tooltip.Root>
          }
        />

        <ResourceToolbar>
          <ResourceSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder='Search tables...'
          />
        </ResourceToolbar>

        <ResourceContent>
          {isLoading ? (
            <TablesListSkeleton />
          ) : error ? (
            <ResourceEmptyState
              title='Error loading tables'
              description={error instanceof Error ? error.message : 'An error occurred'}
            />
          ) : filteredTables.length === 0 ? (
            <ResourceEmptyState
              title={searchQuery ? 'No tables found' : 'No tables yet'}
              description={
                searchQuery
                  ? 'Try a different search term'
                  : 'Create your first table to store structured data for your workflows'
              }
            />
          ) : (
            <Table className='table-fixed text-[13px]'>
              <TableHeader>
                <TableRow className='hover:bg-transparent'>
                  <TableHead className='w-[40%] text-[var(--text-tertiary)]'>Name</TableHead>
                  <TableHead className='w-[15%] text-[var(--text-tertiary)]'>Columns</TableHead>
                  <TableHead className='w-[15%] text-[var(--text-tertiary)]'>Rows</TableHead>
                  <TableHead className='w-[18%] text-[var(--text-tertiary)]'>Updated</TableHead>
                  <TableHead className='w-[12%] text-[var(--text-tertiary)]'>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.map((table) => (
                  <TableRow
                    key={table.id}
                    data-table-row
                    className='cursor-pointer hover:bg-[var(--surface-2)]'
                    onClick={() => {
                      if (!isRowContextMenuOpen) navigateToTable(table.id)
                    }}
                    onContextMenu={(e) => handleTableRowContextMenu(e, table)}
                  >
                    <TableCell>
                      <div className='flex min-w-0 items-center gap-2.5'>
                        <div className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[#3B82F6] dark:text-[#60A5FA]'>
                          <TableIcon className='h-3.5 w-3.5' />
                        </div>
                        <div className='min-w-0 flex-1'>
                          <span className='block truncate font-medium text-[14px] text-[var(--text-primary)]'>
                            {table.name}
                          </span>
                          {table.description && (
                            <span className='block truncate text-[12px] text-[var(--text-muted)]'>
                              {table.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                        <Columns className='h-3 w-3' />
                        {table.schema.columns.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='flex items-center gap-1.5 text-[var(--text-muted)]'>
                        <Rows3 className='h-3 w-3' />
                        {table.rowCount}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <span className='text-[var(--text-muted)]'>
                            {formatRelativeTime(table.updatedAt)}
                          </span>
                        </Tooltip.Trigger>
                        <Tooltip.Content>{formatAbsoluteDate(table.updatedAt)}</Tooltip.Content>
                      </Tooltip.Root>
                    </TableCell>
                    <TableCell>
                      <Badge className='rounded text-[11px]'>tb-{table.id.slice(0, 8)}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ResourceContent>
      </ResourceLayout>

      <TablesListContextMenu
        isOpen={isListContextMenuOpen}
        position={listContextMenuPosition}
        menuRef={listMenuRef}
        onClose={closeListContextMenu}
        onCreateTable={() => setIsCreateModalOpen(true)}
        disableCreate={userPermissions.canEdit !== true}
      />

      <TableContextMenu
        isOpen={isRowContextMenuOpen}
        position={rowContextMenuPosition}
        menuRef={rowMenuRef}
        onClose={closeRowContextMenu}
        onViewSchema={() => {
          setIsSchemaModalOpen(true)
        }}
        onCopyId={() => {
          if (activeTable) navigator.clipboard.writeText(activeTable.id)
        }}
        onDelete={() => {
          setIsDeleteDialogOpen(true)
        }}
        disableDelete={userPermissions.canEdit !== true}
      />

      <Modal open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ModalContent className='w-[400px]'>
          <ModalHeader>Delete Table</ModalHeader>
          <ModalBody>
            <p className='text-[12px] text-[var(--text-secondary)]'>
              Are you sure you want to delete{' '}
              <span className='font-medium text-[var(--text-primary)]'>{activeTable?.name}</span>?
              This will permanently delete all {activeTable?.rowCount} rows.{' '}
              <span className='text-[var(--text-error)]'>This action cannot be undone.</span>
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='default'
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setActiveTable(null)
              }}
              disabled={deleteTable.isPending}
            >
              Cancel
            </Button>
            <Button variant='default' onClick={handleDelete} disabled={deleteTable.isPending}>
              {deleteTable.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {activeTable && (
        <SchemaModal
          isOpen={isSchemaModalOpen}
          onClose={() => {
            setIsSchemaModalOpen(false)
            setActiveTable(null)
          }}
          columns={activeTable.schema.columns}
          tableName={activeTable.name}
        />
      )}

      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  )
}

function TablesListSkeleton() {
  return (
    <Table className='table-fixed text-[13px]'>
      <TableHeader>
        <TableRow className='hover:bg-transparent'>
          <TableHead className='w-[40%]'>
            <Skeleton className='h-3 w-10' />
          </TableHead>
          <TableHead className='w-[15%]'>
            <Skeleton className='h-3 w-14' />
          </TableHead>
          <TableHead className='w-[15%]'>
            <Skeleton className='h-3 w-8' />
          </TableHead>
          <TableHead className='w-[18%]'>
            <Skeleton className='h-3 w-14' />
          </TableHead>
          <TableHead className='w-[12%]'>
            <Skeleton className='h-3 w-6' />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }, (_, i) => (
          <TableRow key={i} className='hover:bg-transparent'>
            <TableCell>
              <div className='flex min-w-0 items-center gap-2.5'>
                <Skeleton className='h-5 w-5 rounded' />
                <div className='flex flex-col gap-1'>
                  <Skeleton className='h-3.5 w-32' />
                  <Skeleton className='h-3 w-48' />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className='h-3 w-8' />
            </TableCell>
            <TableCell>
              <Skeleton className='h-3 w-8' />
            </TableCell>
            <TableCell>
              <Skeleton className='h-3 w-14' />
            </TableCell>
            <TableCell>
              <Skeleton className='h-5 w-16 rounded' />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
