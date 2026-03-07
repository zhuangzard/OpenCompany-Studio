import { HRAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const HRAgentBlock: BlockConfig = {
  type: 'hr_agent',
  name: 'HR',
  description: 'Human Resources — agent behavior monitoring & intervention',
  longDescription:
    'Independent monitoring layer outside the business hierarchy. Observes all agent communications, detects SOP violations, provides coaching via memory injection, and escalates serious issues. Does not participate in project execution.',
  category: 'blocks',
  bgColor: '#F43F5E',
  icon: HRAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'HR monitoring guidelines and intervention rules...',
    },
    {
      id: 'monitoringScope',
      title: 'Monitoring Scope',
      type: 'checkbox-list',
      options: [
        { label: 'SOP Violations', id: 'sop' },
        { label: 'Communication Patterns', id: 'comms' },
        { label: 'Performance Metrics', id: 'performance' },
        { label: 'Resource Usage', id: 'resources' },
        { label: 'Behavior Anomalies', id: 'anomalies' },
      ],
    },
    {
      id: 'interventionLevel',
      title: 'Intervention Level',
      type: 'dropdown',
      options: [
        { label: 'Observe Only', id: 'observe' },
        { label: 'Coach (Memory Injection)', id: 'coach' },
        { label: 'Enforce (Can Pause Agents)', id: 'enforce' },
      ],
      defaultValue: 'coach',
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
        agentRole: 'hr',
      }),
    },
  },
  inputs: {
    messages: { type: 'json', description: 'Message bus feed to monitor' },
    context: { type: 'json', description: 'Context from upstream blocks' },
  },
  outputs: {
    behaviorReport: { type: 'json', description: 'Agent behavior assessment' },
    warnings: { type: 'json', description: 'SOP violations and warnings' },
    interventions: { type: 'json', description: 'Memory injections and actions taken' },
    status: { type: 'string', description: 'HR agent status' },
  },
}
