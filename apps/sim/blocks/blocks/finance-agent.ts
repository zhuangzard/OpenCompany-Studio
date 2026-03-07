import { FinanceAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const FinanceAgentBlock: BlockConfig = {
  type: 'finance_agent',
  name: 'Finance',
  description: 'Finance Department — budget control & cost monitoring',
  longDescription:
    'Monitors token consumption, enforces budget limits, generates cost reports. Implements progressive degradation when budgets are exceeded (warn -> downgrade model -> throttle -> freeze).',
  category: 'blocks',
  bgColor: '#14B8A6',
  icon: FinanceAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Budget control policies and escalation rules...',
    },
    {
      id: 'budgetScope',
      title: 'Budget Scope',
      type: 'dropdown',
      options: [
        { label: 'Company-wide', id: 'company' },
        { label: 'Department', id: 'department' },
        { label: 'Project', id: 'project' },
      ],
      defaultValue: 'company',
    },
    {
      id: 'alertThresholds',
      title: 'Alert Thresholds',
      type: 'short-input',
      placeholder: 'e.g., 70,80,90,100 (percent)',
    },
    {
      id: 'model',
      title: 'LLM Model',
      type: 'dropdown',
      options: [
        { label: 'Claude Haiku 4.5', id: 'claude-haiku-4-5-20251001' },
        { label: 'Claude Sonnet 4.6', id: 'claude-sonnet-4-6' },
      ],
      defaultValue: 'claude-haiku-4-5-20251001',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'finance',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Budget query or control directive' },
    context: { type: 'json', description: 'Token usage data from upstream' },
  },
  outputs: {
    budgetReport: { type: 'json', description: 'Budget status and breakdown' },
    alerts: { type: 'json', description: 'Budget threshold alerts' },
    status: { type: 'string', description: 'Finance agent status' },
  },
}
