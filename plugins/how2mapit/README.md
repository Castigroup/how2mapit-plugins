# How2MapIt

Work from your company's How2MapIt processes in Claude. Before a task, Claude finds the agreed process and follows it
activity by activity. When work no process covers is done, Claude offers to record it as one of your personal
processes, so next time follows the same way. Nothing is recorded without your yes.

## What it includes

| Part | claude.ai chat | Cowork | Claude Code 2.1.287+ |
|---|---|---|---|
| How2MapIt connector | Connect on the plugin's Connectors tab | Same | Connects with the plugin |
| `how2-work` skill | Yes | Yes | Yes |
| Reminder before a task, offer after the work | — | — | Yes |

## Install

From Claude's plugin directory: find How2MapIt and add it. The plugin uses the How2MapIt connector; sign in to
How2MapIt and choose your company when Claude asks.

From GitHub instead: in Claude Code, `/plugin install how2mapit --marketplace castigroup/how2mapit-plugins`; on
claude.ai, add the marketplace `https://github.com/castigroup/how2mapit-plugins` under Customize > Plugins, then install
How2MapIt.

## Use it

Ask Claude to do a piece of work as usual. Claude says which How2MapIt process applies, or that none does, and follows
it. At the end of work no process covered, answer the offer with yes or no.

## Using it in claude.ai

The skill works the same way: ask Claude for a piece of work and it searches How2MapIt first. Claude Code adds a
one-line reminder to each prompt; claude.ai chat has no such reminder.

## Data

The plugin sends nothing itself. The How2MapIt connector sends your searches, and the processes you choose to record, to
How2MapIt at `api.how2mapit.com`, signed in as you, in the company you chose when you connected, and returns the
processes you can open there.

In Claude Code the plugin also runs a small hooks module (`hooks/register.ts` and `hooks/logic.ts`, readable source),
on your machine:

- To each prompt you type (not empty, not a slash command) it adds one line reminding Claude to search How2MapIt
  before a task. It checks only whether the prompt is empty or starts with `/`.
- It reads the name of each tool call and whether it failed or changed something, and the `coverage` value of each
  How2MapIt search result, to count work done since the last search.
- It reads Claude's answers only to see whether they contain the line `How2MapIt: record as a personal process?`.
- After a turn in which work was done and the last search found no process, it asks Claude once to offer recording
  that work.

It keeps only those counts, in memory, resets them when the session ends, stores no text, and makes no network calls.

Privacy policy: https://how2mapit.com/privacy
