# How2MapIt reminders

An add-on to the [How2MapIt](../how2mapit) plugin for Claude Code 2.1.287 or later. It installs How2MapIt with it.

With How2MapIt alone, Claude searches your company's processes when the request matches the `how2-work` skill. This
add-on makes that a habit in Claude Code: a one-line reminder before each task, and one offer to record work that no
process covered once it is done. Nothing is recorded without your yes.

## Install

    claude plugin install how2mapit-reminders --marketplace castigroup/how2mapit-plugins

## What it runs, and what it reads

A small hooks module (`hooks/register.ts` and `hooks/logic.ts`, readable source), on your machine, in Claude Code only:

- To each prompt you type (not empty, not a slash command) it adds one line reminding Claude to search How2MapIt
  before a task. It checks only whether the prompt is empty or starts with `/`.
- It reads the name of each tool call and whether it failed or changed something, and the `coverage` value of each
  How2MapIt search result, to count work done since the last search.
- It reads Claude's answers only to see whether they contain the line `How2MapIt: record as a personal process?`.
- After a turn in which work was done and the last search found no process, it asks Claude once to offer recording
  that work.

It keeps only those counts, in memory, resets them when the session ends, stores no text, and makes no network calls.
If any of it fails, your prompt and tool calls go on unchanged.

Privacy policy: https://how2mapit.com/privacy
