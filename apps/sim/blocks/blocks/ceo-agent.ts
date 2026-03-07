import { CEOAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const CEOAgentBlock: BlockConfig = {
  type: 'ceo_agent',
  name: 'CEO',
  description: 'Chief Executive Officer — strategic planning & oversight',
  longDescription:
    'The highest decision maker in the virtual company. Receives directives from the User, creates strategic plans, assigns tasks to Directors, reviews reports. Never writes code directly.',
  category: 'blocks',
  bgColor: '#F59E0B',
  icon: CEOAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'CEO role definition and behavior guidelines (from CLAUDE.md)...',
    },
    {
      id: 'directive',
      title: 'Strategic Directive',
      type: 'long-input',
      placeholder: 'Enter strategic directive or project goal...',
    },
    {
      id: 'model',
      title: 'LLM Model',
      type: 'dropdown',
      options: [
        { label: 'Claude Opus 4.6', id: 'claude-opus-4-6' },
        { label: 'Claude Sonnet 4.6', id: 'claude-sonnet-4-6' },
        { label: 'GPT-4o', id: 'gpt-4o' },
      ],
      defaultValue: 'claude-opus-4-6',
    },
    {
      id: 'tokenBudget',
      title: 'Token Budget',
      type: 'short-input',
      placeholder: 'e.g., 50000',
    },
    {
      id: 'reportFrequency',
      title: 'Report Frequency',
      type: 'dropdown',
      options: [
        { label: 'Every 15 min', id: '15m' },
        { label: 'Every 30 min', id: '30m' },
        { label: 'Every hour', id: '1h' },
        { label: 'Milestones only', id: 'milestone' },
      ],
      defaultValue: '30m',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'ceo',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Strategic directive from User' },
    context: { type: 'json', description: 'Context from upstream blocks' },
  },
  outputs: {
    plan: { type: 'json', description: 'Strategic plan / task decomposition' },
    tasks: { type: 'json', description: 'Task assignments for Directors' },
    status: { type: 'string', description: 'CEO agent status' },
    report: { type: 'string', description: 'Executive summary' },
  },
}
