export const SUBAGENT_TOOL_NAMES = [
  'debug',
  'edit',
  'build',
  'plan',
  'test',
  'deploy',
  'auth',
  'research',
  'knowledge',
  'custom_tool',
  'tour',
  'info',
  'workflow',
  'evaluate',
  'superagent',
  'discovery',
] as const

export const SUBAGENT_TOOL_SET = new Set<string>(SUBAGENT_TOOL_NAMES)

/**
 * Respond tools are internal to the copilot's subagent system.
 * They're used by subagents to signal completion and should NOT be executed by the sim side.
 * The copilot backend handles these internally.
 */
export const RESPOND_TOOL_NAMES = [
  'plan_respond',
  'edit_respond',
  'build_respond',
  'debug_respond',
  'info_respond',
  'research_respond',
  'deploy_respond',
  'superagent_respond',
  'discovery_respond',
  'tour_respond',
  'auth_respond',
  'workflow_respond',
  'knowledge_respond',
  'custom_tool_respond',
  'test_respond',
] as const

export const RESPOND_TOOL_SET = new Set<string>(RESPOND_TOOL_NAMES)
