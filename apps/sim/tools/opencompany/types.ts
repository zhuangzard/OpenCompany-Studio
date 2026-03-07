import type { ToolResponse } from '@/tools/types'

export interface OpenCompanyAgentExecuteParams {
  agentRole: string
  systemPrompt?: string
  directive?: string
  model?: string
  context?: Record<string, unknown>
  [key: string]: unknown
}

export interface OpenCompanySOPValidateParams {
  message: Record<string, unknown>
  sender: string
  receiver: string
  rules?: string[]
  action?: string
}

export type OpenCompanyAgentExecuteResponse = ToolResponse
export type OpenCompanySOPValidateResponse = ToolResponse
