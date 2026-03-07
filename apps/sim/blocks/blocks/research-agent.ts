import { ResearchAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const ResearchAgentBlock: BlockConfig = {
  type: 'research_agent',
  name: 'Research',
  description: 'Research Specialist — information retrieval & analysis',
  longDescription:
    'Public service agent callable by any role. Performs information retrieval, paper searches, data queries, and delivers structured research summaries. No direct reporting relationship.',
  category: 'blocks',
  bgColor: '#06B6D4',
  icon: ResearchAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Research methodology and output format guidelines...',
    },
    {
      id: 'directive',
      title: 'Research Query',
      type: 'long-input',
      placeholder: 'What to research...',
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
    {
      id: 'searchDomains',
      title: 'Search Domains',
      type: 'checkbox-list',
      options: [
        { label: 'Web Search', id: 'web' },
        { label: 'Academic Papers', id: 'academic' },
        { label: 'Code Repositories', id: 'code' },
        { label: 'Documentation', id: 'docs' },
      ],
    },
    {
      id: 'maxSources',
      title: 'Max Sources',
      type: 'short-input',
      placeholder: 'Maximum number of sources (e.g., 10)',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'research',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Research query' },
    context: { type: 'json', description: 'Context from upstream blocks' },
  },
  outputs: {
    findings: { type: 'json', description: 'Research findings' },
    citations: { type: 'json', description: 'Source citations' },
    summary: { type: 'string', description: 'Research summary' },
    status: { type: 'string', description: 'Research agent status' },
  },
}
