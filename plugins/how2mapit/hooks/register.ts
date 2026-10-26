// The How2MapIt mod for Claude Code (bundle design 2026-10-26, D7): a reminder before a task, and one offer to record
// work no process covered. claude.ai chat and Cowork do not run mods; there the skill carries both.
import type { Register } from 'claude-code'
import { OFFER_REASON, Tracker, how2Tool, isOffer, promptContext, searchCoverage } from './logic'

export const register: Register = (on) => {
  // Module variables outlive /clear, /resume and /branch (session.start does not fire again), so session.end resets.
  let tracker = new Tracker()
  // Nobody can answer an offer in `claude -p`; true unless session.start says otherwise.
  let interactive = true

  on('session.start', async ($, e, next) => {
    interactive = e.isInteractive !== false
    return next(e)
  })

  on('session.end', async ($, e, next) => {
    tracker = new Tracker()
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    // Only what the person typed gets the reminder, here or through the Remote Control bridge: not a slash command, a
    // hidden prompt, a background task's notification, or a plugin's prompt (this mod's own offer turn included).
    const typed = e.origin.kind === 'composer' || e.origin.kind === 'bridge'
    if (e.command || e.isMeta || !typed) return next(e)
    const line = promptContext(e.text)
    return line ? next({ ...e, context: [...(e.context ?? []), line] }) : next(e)
  })

  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    if (how2Tool(e.tool) !== 'search') {
      // Work is a call that ran and changed something: a refused, failed or read-only call (ls, git status) is not.
      if (!result.deny && !result.isError && !result.isReadOnly) tracker.call(e.tool)
      return result
    }
    tracker.search(result.deny || result.isError ? 'error' : searchCoverage(result.text ?? ''))
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const out = await next(e)
    // The main conversation's answered turns only.
    if (e.agentId || e.reason !== 'answer') return out
    if (isOffer(e.answer)) tracker.offered()
    if (interactive && tracker.shouldOffer()) {
      tracker.offered()
      // Not awaited (the documented pattern): the queued turn starts once this one has ended, and the call resolves
      // only then. A prompt the person drops resolves { drop }; the offer may then be asked for again.
      void $.prompt
        .submit({ text: OFFER_REASON })
        .then((r) => { if (r.drop) tracker.offerDropped() })
        .catch(() => tracker.offerDropped())
    }
    return out
  })
}
