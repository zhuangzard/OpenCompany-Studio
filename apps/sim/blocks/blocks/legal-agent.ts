import { LegalAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const LegalAgentBlock: BlockConfig = {
  type: 'legal_agent',
  name: 'Legal',
  description: 'Legal & Compliance — cross-department approval & rule enforcement',
  longDescription:
    'Reviews cross-department communications and resource requests for compliance. Mandatory checkpoint for inter-department approvals. Ensures all operations follow governance rules.',
  category: 'blocks',
  bgColor: '#A855F7',
  icon: LegalAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Compliance rules and approval criteria...',
    },
    {
      id: 'directive',
      title: 'Review Request',
      type: 'long-input',
      placeholder: 'Cross-department request to review...',
    },
    {
      id: 'complianceRules',
      title: 'Compliance Rules',
      type: 'checkbox-list',
      options: [
        { label: 'Data Privacy', id: 'privacy' },
        { label: 'Budget Approval', id: 'budget' },
        { label: 'Cross-dept Communication', id: 'cross_dept' },
        { label: 'Resource Sharing', id: 'resources' },
        { label: 'External API Access', id: 'external_api' },
      ],
    },
    {
      id: 'model',
      title: 'LLM Model',
      type: 'dropdown',
      options: [
        { label: 'Claude Sonnet 4.6', id: 'claude-sonnet-4-6' },
        { label: 'Claude Opus 4.6', id: 'claude-opus-4-6' },
      ],
      defaultValue: 'claude-sonnet-4-6',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'legal',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Compliance review request' },
    context: { type: 'json', description: 'Request details from upstream' },
  },
  outputs: {
    legalOpinion: { type: 'string', description: 'Legal opinion and reasoning' },
    approvals: { type: 'json', description: 'Approval decisions' },
    status: { type: 'string', description: 'Legal agent status' },
  },
}
