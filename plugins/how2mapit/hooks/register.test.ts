// The mod's hooks, raised as the engine raises them (plan Task 6). Not run yet: `claude plugin test` is the user's call.
// Every stand-in is registered before the first `$` call, which loads the plugin. Each offer test opens its window with
// a search, so it holds whatever the kit keeps of the plugin between tests.
import type { On, PromptSubmitInput, PromptSubmitResult, RenderSurface, ToolCallResult } from 'claude-code'
import { expect, mock, test } from 'claude-code/testing'
import type { Engine, MockClock } from 'claude-code/testing'
import { OFFER_LINE, OFFER_REASON, PROMPT_CONTEXT } from './logic'

const NONE = '{"company":"C","results":[],"coverage":"none"}'

type Setup = {
  /** The surfaces the session draws on; `['terminal']` when not given. */
  surfaces?: readonly RenderSurface[]
  /** How the engine answers a plugin's prompt; entered when not given. */
  pluginPrompt?: (e: PromptSubmitInput) => PromptSubmitResult
  /** How the engine answers a tool other than the How2MapIt search; `{ result: {} }` when not given. */
  tool?: (name: string) => ToolCallResult
}

/** The engine beneath the plugin: every prompt that reached the bottom, and the clock to settle. */
function engine(on: On, s: Setup = {}): { seen: PromptSubmitInput[]; clock: MockClock } {
  const seen: PromptSubmitInput[] = []
  on('prompt.submit', ($, e) => {
    seen.push(e)
    if (e.origin.kind === 'plugin' && s.pluginPrompt) return s.pluginPrompt(e)
    return { text: e.text, context: e.context }
  })
  on('tool.call', ($, e) =>
    e.tool === 'mcp__how2__search' ? { result: {}, text: NONE } : (s.tool ?? (() => ({ result: {} })))(e.tool),
  )
  on('turn.complete', () => ({ text: '' }))
  on('session.surfaces', () => ({ value: s.surfaces ?? ['terminal'] }))
  on('session.end', ($, e) => ({ sessionId: e.sessionId }))
  const clock = mock.clock(on)
  return { seen, clock }
}

const typed = ($: Engine, text: string, kind: 'composer' | 'bridge' | 'sdk' = 'composer') =>
  $.prompt.submit({ text, wait: false, origin: { kind } })
const search = ($: Engine) => $.tool.call({ tool: 'mcp__how2__search', query: 'pay a supplier' })
const edit = ($: Engine) => $.tool.call({ tool: 'Edit', file_path: 'a', old_string: 'x', new_string: 'y' })
const bash = ($: Engine) => $.tool.call({ tool: 'Bash', command: 'ls' })
const answered = ($: Engine, answer = 'done', agentId?: string) =>
  $.turn.complete({ turnId: 't1', answer, durationMs: 1, isAborted: false, reason: 'answer', ...(agentId ? { agentId } : {}) })
const offers = (seen: readonly PromptSubmitInput[]) => seen.filter((p) => p.origin.kind === 'plugin')

// prompt.submit: the reminder

test('a typed prompt reaches the engine with the reminder', async ($, on) => {
  const { seen } = engine(on)
  await typed($, 'Pay the Acme invoice')
  expect(seen).toHaveLength(1)
  expect(seen[0]?.context).toContain(PROMPT_CONTEXT)
})

test('a prompt through Remote Control or an SDK host gets the reminder', async ($, on) => {
  const { seen } = engine(on)
  await typed($, 'Pay the Acme invoice', 'bridge')
  await typed($, 'Pay the Acme invoice', 'sdk')
  expect(seen).toHaveLength(2)
  expect(seen[0]?.context).toContain(PROMPT_CONTEXT)
  expect(seen[1]?.context).toContain(PROMPT_CONTEXT)
})

test('a slash command gets no reminder', async ($, on) => {
  const { seen } = engine(on)
  await $.prompt.submit({ text: '/mcp', wait: false, origin: { kind: 'composer' }, command: { name: 'mcp', args: '' } })
  expect(seen).toHaveLength(1)
  expect(seen[0]?.context ?? []).not.toContain(PROMPT_CONTEXT)
})

test("another plugin's prompt gets no reminder", async ($, on) => {
  const { seen } = engine(on)
  await $.prompt.submit({ text: 'Pay the Acme invoice', wait: false, origin: { kind: 'plugin', name: 'x' } })
  expect(seen).toHaveLength(1)
  expect(seen[0]?.context ?? []).not.toContain(PROMPT_CONTEXT)
})

// turn.complete: the offer

test('a none search, an Edit, then an answered turn: one offer, once', async ($, on) => {
  const { seen, clock } = engine(on)
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(1)
  expect(offers(seen)[0]?.text).toBe(OFFER_REASON)

  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(1)
})

test("a subagent's turn asks for no offer", async ($, on) => {
  const { seen, clock } = engine(on)
  await search($)
  await edit($)
  await answered($, 'done', 'a1')
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('an aborted turn asks for no offer', async ($, on) => {
  const { seen, clock } = engine(on)
  await search($)
  await edit($)
  await $.turn.complete({ turnId: 't1', answer: '', durationMs: 1, isAborted: true, reason: 'aborted' })
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('an answer that already made the offer (lower case) asks for none', async ($, on) => {
  const { seen, clock } = engine(on)
  await search($)
  await edit($)
  await answered($, `1. Pay the invoice\n\n${OFFER_LINE.toLowerCase()}`)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('session.end closes the open window', async ($, on) => {
  const { seen, clock } = engine(on)
  await search($)
  await $.session.end({ reason: 'clear', sessionId: 's1', resume: { id: 's1' } })
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('a session drawn on no surface gets no offer', async ($, on) => {
  const { seen, clock } = engine(on, { surfaces: [] })
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('a session drawn on the terminal gets the offer', async ($, on) => {
  const { seen, clock } = engine(on, { surfaces: ['terminal'] })
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(1)
})

// Batch A review (2026-10-26): work is a call that ran and changed something.

test('a denied Edit is not work', async ($, on) => {
  const { seen, clock } = engine(on, { tool: () => ({ deny: 'no' }) })
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('an Edit that errored is not work', async ($, on) => {
  const { seen, clock } = engine(on, { tool: () => ({ result: {}, isError: true }) })
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('read-only shell calls are not work', async ($, on) => {
  const { seen, clock } = engine(on, { tool: () => ({ result: {}, isReadOnly: true }) })
  await search($)
  // Three, the count that would offer if they were work.
  await bash($)
  await bash($)
  await bash($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(0)
})

test('a dropped offer is asked for once more in the window, never again', async ($, on) => {
  const { seen, clock } = engine(on, { pluginPrompt: () => ({ drop: 'refused' }) })
  await search($)
  await edit($)
  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(1)

  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(2)

  await answered($)
  await clock.settle()
  expect(offers(seen)).toHaveLength(2)
})
