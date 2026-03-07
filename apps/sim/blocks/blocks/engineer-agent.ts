import { EngineerAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const EngineerAgentBlock: BlockConfig = {
  type: 'engineer_agent',
  name: 'Engineer',
  description: 'Software Engineer — code execution & task implementation',
  longDescription:
    'Executes specific tasks assigned by Director: writes code, runs experiments, performs data analysis. Reports results back to Director. Cannot communicate directly with CEO.',
  category: 'blocks',
  bgColor: '#3B82F6',
  icon: EngineerAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Engineer role definition and behavior guidelines...',
    },
    {
      id: 'directive',
      title: 'Task',
      type: 'long-input',
      placeholder: 'Specific task to execute...',
    },
    {
      id: 'model',
      title: 'LLM Model',
      type: 'dropdown',
      options: [
        { label: 'Claude Sonnet 4.6', id: 'claude-sonnet-4-6' },
        { label: 'Claude Haiku 4.5', id: 'claude-haiku-4-5-20251001' },
        { label: 'GPT-4o mini', id: 'gpt-4o-mini' },
      ],
      defaultValue: 'claude-sonnet-4-6',
    },
    {
      id: 'skills',
      title: 'Skills',
      type: 'checkbox-list',
      options: [
        { label: 'Code Writing', id: 'code_write' },
        { label: 'Code Review', id: 'code_review' },
        { label: 'Testing', id: 'testing' },
        { label: 'Data Analysis', id: 'data_analysis' },
        { label: 'Browser Automation', id: 'browser' },
      ],
    },
    {
      id: 'codeLanguage',
      title: 'Primary Language',
      type: 'dropdown',
      options: [
        { label: 'TypeScript', id: 'typescript' },
        { label: 'Python', id: 'python' },
        { label: 'Go', id: 'go' },
        { label: 'Rust', id: 'rust' },
      ],
      defaultValue: 'typescript',
    },
    {
      id: 'sandboxMode',
      title: 'Sandbox',
      type: 'dropdown',
      options: [
        { label: 'Docker Container', id: 'docker' },
        { label: 'Local Process', id: 'local' },
        { label: 'None', id: 'none' },
      ],
      defaultValue: 'docker',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'engineer',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Task from Director' },
    context: { type: 'json', description: 'Context from upstream blocks' },
  },
  outputs: {
    code: { type: 'string', description: 'Generated code output' },
    testResults: { type: 'json', description: 'Test execution results' },
    artifacts: { type: 'json', description: 'Generated files and artifacts' },
    status: { type: 'string', description: 'Engineer agent status' },
  },
}
