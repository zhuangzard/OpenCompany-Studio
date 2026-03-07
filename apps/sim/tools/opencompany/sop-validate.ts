import type { ToolConfig, ToolResponse } from '@/tools/types'
import type { OpenCompanySOPValidateParams } from '@/tools/opencompany/types'

export const opencompanySOPValidateTool: ToolConfig<
  OpenCompanySOPValidateParams,
  ToolResponse
> = {
  id: 'opencompany_sop_validate',
  name: 'OpenCompany SOP Validate',
  description:
    'Validate a message against OpenCompany Standard Operating Procedures and hierarchy rules.',
  version: '1.0.0',

  params: {
    message: {
      type: 'object',
      required: true,
      description: 'Message content to validate',
    },
    sender: {
      type: 'string',
      required: true,
      description: 'Sender agent role',
    },
    receiver: {
      type: 'string',
      required: true,
      description: 'Receiver agent role',
    },
    rules: {
      type: 'string',
      required: false,
      description: 'Comma-separated list of active SOP rule IDs',
    },
    action: {
      type: 'string',
      required: false,
      description: 'Violation action: block_alert, allow_warn, or block_escalate',
    },
  },

  request: {
    url: () => {
      const baseUrl = process.env.OPENCOMPANY_API_URL || 'http://localhost:3001'
      return `${baseUrl}/api/sop/validate`
    },
    method: 'POST',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    body: (params: OpenCompanySOPValidateParams) => ({
      message: params.message,
      sender: params.sender,
      receiver: params.receiver,
      rules: params.rules,
      action: params.action,
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
    allowed: {
      type: 'boolean',
      description: 'Whether the message passes SOP check',
    },
    violation: {
      type: 'json',
      description: 'Violation details if blocked',
      optional: true,
    },
  },
}
