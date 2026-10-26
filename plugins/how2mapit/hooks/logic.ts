// The decisions behind the How2MapIt mod (bundle design 2026-10-26, D7), kept pure so the tests drive them directly.

// The How2MapIt server's tools, under any install's name: the claude.ai connector (mcp__claude_ai_How2__search), a server
// added with `claude mcp add` (mcp__how2__search) or this plugin's own (mcp__plugin_how2mapit_how2mapit__search).
// A connector named with a space ("How2 MapIt") arrives as How2_MapIt.
const HOW2_TOOL = /^mcp__(?:.*_)?how2(?:_?mapit)?__(\w+)$/i
const RECORDING = new Set(['create_personal_process', 'edit_personal_process', 'create_draft_process', 'edit_process'])
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit'])
const SHELL_TOOLS = new Set(['Bash', 'PowerShell'])
// A write on another server: one of these words as a whole _-separated part of the tool name (never "postgres", "get_updates").
const OTHER_WRITE = /^mcp__.*__(?:\w+_)?(create|send|update|edit|write|delete|move|upload|post|reply|forward)(?:_\w+)?$/i

/** The line the skill and OFFER_REASON ask an offer to end with; how the mod knows an offer was made. */
export const OFFER_LINE = 'How2: record as a personal process?'
const OFFERED = /How2: record as a personal process\?/i

/** Whether an answer carries the offer line (any case, anywhere in the text). */
export function isOffer(answer: string): boolean {
  return OFFERED.test(answer)
}

export const PROMPT_CONTEXT =
  'How2MapIt (how2mapit plugin): if this message asks for work to be done, not a question or small talk, then before ' +
  "starting: call the How2MapIt search tool with the task in the person's words (if your tools are deferred, search " +
  'them for "how2 search" first), and say in one line which process applies (How2: <title>) or How2: no process. Then ' +
  'follow the how2mapit:how2-work skill. Skip this for follow-ups to work already searched in this conversation.'

export const OFFER_REASON =
  'How2: the latest How2MapIt search found no process for this work, and work was done since. Following the ' +
  'how2mapit:how2-work skill: if the work is complete and repeatable, offer once to record it as a personal process: ' +
  `one short message with a generic title and the activities as a numbered list, ending with the line "${OFFER_LINE}". ` +
  'Do not record it unless the person says yes. If the work is not finished, or was a one-off or trivial, reply in ' +
  'one short line that there is nothing to record.'

/** The How2MapIt tool a name calls ("search", "create_personal_process", …), or null for any other tool. */
export function how2Tool(name: string): string | null {
  return HOW2_TOOL.exec(name)?.[1] ?? null
}

/** The context line for a typed prompt, or null (empty, or a slash command typed as text). Which origins get it is
 *  register.ts's call. */
export function promptContext(text: string | undefined): string | null {
  const p = (text ?? '').trim()
  if (p.length === 0 || p.startsWith('/')) return null
  return PROMPT_CONTEXT
}

/** What a How2MapIt search result says it covered: company, personal, none, unscored, or found (an older server).
 *  Author text cannot fake a value: it sits inside JSON strings, where its quotes are escaped. Only the JSON before
 *  the text block's excerpts is read. */
export function searchCoverage(text: string): string {
  const json = text.split('\n\nExcerpts')[0] ?? ''
  const m = /"coverage"\s*:\s*"(\w+)"/.exec(json)
  if (m?.[1]) return m[1]
  return /"results"\s*:\s*\[\s*\]/.test(json) ? 'none' : 'found'
}

/** The work since the latest How2MapIt search, for one conversation. Subagents' calls count: delegated work is work.
 *  Accepted trade-off (plan review 2026-10-26): a subagent's own How2MapIt search also starts a new window. */
export class Tracker {
  private coverage: string | null = null
  private edits = 0
  private shells = 0
  private writes = 0
  private recorded = false
  private offeredOnce = false
  private rearmed = false

  /** A How2MapIt search finished: a new window starts. "error" for a refused or failed search. */
  search(coverage: string): void {
    this.coverage = coverage
    this.edits = this.shells = this.writes = 0
    this.recorded = this.offeredOnce = this.rearmed = false
  }

  /** Any other tool call. */
  call(tool: string): void {
    const h = how2Tool(tool)
    if (h !== null) {
      if (RECORDING.has(h)) this.recorded = true
      return
    }
    if (EDIT_TOOLS.has(tool)) this.edits++
    else if (SHELL_TOOLS.has(tool)) this.shells++
    else if (OTHER_WRITE.test(tool)) this.writes++
  }

  /** An offer was made, by the skill on its own or after OFFER_REASON. */
  offered(): void {
    this.offeredOnce = true
  }

  /** The offer turn never ran (the person dropped it, or it was refused): it may be asked for once more in this
   *  window, never again, so a refusal that repeats (a settings hook, a usage limit) cannot queue an offer every turn. */
  offerDropped(): void {
    if (this.rearmed) return
    this.rearmed = true
    this.offeredOnce = false
  }

  /** Ask for the offer: the latest search found nothing, real work followed, nothing recorded, no offer yet. */
  shouldOffer(): boolean {
    if (this.coverage !== 'none' || this.recorded || this.offeredOnce) return false
    return this.edits > 0 || this.writes > 0 || this.shells >= 3
  }
}
