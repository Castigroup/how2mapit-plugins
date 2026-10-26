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

## Use it

Ask Claude to do a piece of work as usual. Claude says which How2MapIt process applies, or that none does, and follows
it. At the end of work no process covered, answer the offer with yes or no.

## Using it in claude.ai

Chat runs no reminders of its own. For the same habit there, add this to your profile preferences or a project's
instructions:

> Before a task, search How2MapIt with the task in my words and follow the process found. When the work is done and no
> process covered it, offer to record it as a personal process, and record it only if I say yes.

## Data

The plugin sends nothing itself. The How2MapIt connector sends your searches, and the processes you choose to record, to
How2MapIt at `api.how2mapit.com`, signed in as you, in the company you chose when you connected. In Claude Code the
reminder and the offer read your session's tool calls on your machine and keep nothing.
