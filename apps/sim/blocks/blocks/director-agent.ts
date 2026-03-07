import { DirectorAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const DirectorAgentBlock: BlockConfig = {
  type: 'director_agent',
  name: 'Director',
  description: 'Department Director — task decomposition & team management',
  longDescription:
    'Receives tasks from CEO, decomposes them into actionable items, assigns to Engineers, reviews output, and reports back to CEO. Does not execute tasks directly.',
  category: 'blocks',
  bgColor: '#8B5CF6',
  icon: DirectorAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Director role definition and behavior guidelines...',
    },
    {
      id: 'directive',
      title: 'Task Directive',
      type: 'long-input',
      placeholder: 'Task to decompose and delegate...',
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
      id: 'department',
      title: 'Department',
      type: 'dropdown',
      options: [
        { label: 'Engineering', id: 'engineering' },
        { label: 'Research', id: 'research' },
        { label: 'Quality', id: 'quality' },
      ],
      defaultValue: 'engineering',
    },
    {
      id: 'teamSize',
      title: 'Team Size',
      type: 'short-input',
      placeholder: 'Number of Engineers to manage (e.g., 3)',
    },
    {
      id: 'delegationMode',
      title: 'Delegation Mode',
      type: 'dropdown',
      options: [
        { label: 'Sequential', id: 'sequential' },
        { label: 'Parallel', id: 'parallel' },
        { label: 'Round Robin', id: 'round_robin' },
      ],
      defaultValue: 'parallel',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'director',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Task from CEO or upstream' },
    context: { type: 'json', description: 'Context from upstream blocks' },
  },
  outputs: {
    tasks: { type: 'json', description: 'Decomposed task assignments for Engineers' },
    reviewReport: { type: 'string', description: 'Review report for CEO' },
    status: { type: 'string', description: 'Director agent status' },
  },
}
