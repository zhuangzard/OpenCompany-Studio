import { SOPGateIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const SOPGateBlock: BlockConfig = {
  type: 'sop_gate',
  name: 'SOP Gate',
  description: 'Communication rule checkpoint — validates hierarchy & SOP rules',
  longDescription:
    'Enforces Standard Operating Procedures by validating that messages follow the organizational hierarchy. Blocks unauthorized communications (e.g., Engineer directly contacting CEO) and logs violations.',
  category: 'blocks',
  bgColor: '#EF4444',
  icon: SOPGateIcon,
  subBlocks: [
    {
      id: 'rules',
      title: 'SOP Rules',
      type: 'checkbox-list',
      options: [
        { label: 'SOP-001: Engineer cannot skip Director to CEO', id: 'SOP-001' },
        { label: 'SOP-002: CEO does not write code', id: 'SOP-002' },
        { label: 'SOP-003: Director does not execute tasks', id: 'SOP-003' },
        { label: 'SOP-004: Reviewer is read-only', id: 'SOP-004' },
        { label: 'SOP-005: Cross-dept requires Legal approval', id: 'SOP-005' },
        { label: 'SOP-006: HR cannot issue business tasks', id: 'SOP-006' },
        { label: 'SOP-007: Finance cannot modify code', id: 'SOP-007' },
      ],
    },
    {
      id: 'action',
      title: 'On Violation',
      type: 'dropdown',
      options: [
        { label: 'Block + Alert HR', id: 'block_alert' },
        { label: 'Allow + Log Warning', id: 'allow_warn' },
        { label: 'Block + Escalate to CEO', id: 'block_escalate' },
      ],
      defaultValue: 'block_alert',
    },
  ],
  tools: {
    access: ['opencompany_sop_validate'],
    config: {
      tool: () => 'opencompany_sop_validate',
      params: (params: Record<string, unknown>) => params,
    },
  },
  inputs: {
    message: { type: 'json', description: 'Message content to validate' },
    sender: { type: 'string', description: 'Sender agent role' },
    receiver: { type: 'string', description: 'Receiver agent role' },
  },
  outputs: {
    allowed: { type: 'boolean', description: 'Whether the message passes SOP check' },
    violation: { type: 'json', description: 'Violation details if blocked' },
  },
}
