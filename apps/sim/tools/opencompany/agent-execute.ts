import type { ToolConfig, ToolResponse } from '@/tools/types'
import type { OpenCompanyAgentExecuteParams } from '@/tools/opencompany/types'

export const opencompanyAgentExecuteTool: ToolConfig<
  OpenCompanyAgentExecuteParams,
  ToolResponse
> = {
  id: 'opencompany_agent_execute',
  name: 'OpenCompany Agent Execute',
  description: 'Execute an OpenCompany agent with the specified role and directive.',
  version: '1.0.0',

  params: {
    agentRole: {
      type: 'string',
      required: true,
      description: 'Agent role (ceo, director, engineer, hr, research, reviewer, finance, legal)',
    },
    systemPrompt: {
      type: 'string',
      required: false,
      description: 'System prompt defining agent behavior',
    },
    directive: {
      type: 'string',
      required: false,
      description: 'Task directive for the agent',
    },
    model: {
      type: 'string',
      required: false,
      description: 'LLM model to use for agent execution',
    },
    context: {
      type: 'object',
      required: false,
      description: 'Context data from upstream blocks',
    },
  },

  request: {
    url: () => {
      const baseUrl = process.env.OPENCOMPANY_API_URL || 'http://localhost:3001'
      return `${baseUrl}/api/agent/execute`
    },
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: OpenCompanyAgentExecuteParams) => ({
      agentRole: params.agentRole,
      systemPrompt: params.systemPrompt,
      directive: params.directive,
      model: params.model,
      context: params.context,
    }),
  },

  transformResponse: async (response: Response) => {
    const data = await response.json()
    return {
      success: true,
      output: data,
    }
  },

  outputs: {
    result: {
      type: 'json',
      description: 'Agent execution result',
    },
    status: {
      type: 'string',
      description: 'Agent execution status',
    },
  },
}
