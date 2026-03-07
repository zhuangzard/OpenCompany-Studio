import { ReviewerAgentIcon } from '@/components/icons'
import type { BlockConfig } from '@/blocks/types'

export const ReviewerAgentBlock: BlockConfig = {
  type: 'reviewer_agent',
  name: 'Reviewer',
  description: 'Quality Reviewer — output review & quality assurance',
  longDescription:
    'Reviews Engineer output and provides pass/fail verdicts with detailed feedback. Read-only role: never modifies code or executes tasks. Reports to Director.',
  category: 'blocks',
  bgColor: '#10B981',
  icon: ReviewerAgentIcon,
  subBlocks: [
    {
      id: 'systemPrompt',
      title: 'System Prompt',
      type: 'long-input',
      placeholder: 'Review criteria and quality standards...',
    },
    {
      id: 'directive',
      title: 'Review Target',
      type: 'long-input',
      placeholder: 'What to review...',
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
      id: 'reviewCriteria',
      title: 'Review Criteria',
      type: 'checkbox-list',
      options: [
        { label: 'Code Quality', id: 'code_quality' },
        { label: 'Test Coverage', id: 'test_coverage' },
        { label: 'Security', id: 'security' },
        { label: 'Performance', id: 'performance' },
        { label: 'Documentation', id: 'documentation' },
      ],
    },
    {
      id: 'passThreshold',
      title: 'Pass Threshold',
      type: 'dropdown',
      options: [
        { label: 'Strict (all criteria)', id: 'strict' },
        { label: 'Standard (80%+)', id: 'standard' },
        { label: 'Lenient (60%+)', id: 'lenient' },
      ],
      defaultValue: 'standard',
    },
  ],
  tools: {
    access: ['opencompany_agent_execute'],
    config: {
      tool: () => 'opencompany_agent_execute',
      params: (params: Record<string, unknown>) => ({
        ...params,
        agentRole: 'reviewer',
      }),
    },
  },
  inputs: {
    directive: { type: 'string', description: 'Review target description' },
    context: { type: 'json', description: 'Code or output to review' },
  },
  outputs: {
    verdict: { type: 'string', description: 'Pass or Fail' },
    feedback: { type: 'string', description: 'Detailed review feedback' },
    score: { type: 'json', description: 'Per-criteria scores' },
    status: { type: 'string', description: 'Reviewer agent status' },
  },
}
