# How2MapIt

Work from your company's How2MapIt processes in Claude. Before a task, Claude finds the agreed process and follows it
activity by activity. When work no process covers is done, Claude offers to record it as one of your personal
processes, so next time follows the same way. Nothing is recorded without your yes.

## What it includes

| Part | claude.ai chat | Cowork | Claude Code |
|---|---|---|---|
| How2MapIt connector | Connect on the plugin's Connectors tab | Same | Connects with the plugin |
| `how2-work` skill | Yes | Yes | Yes |

The plugin has no code that runs on your machine: it is one skill and the connector.

For Claude Code there is an optional add-on, [How2MapIt reminders](../how2mapit-reminders), from this repository's
marketplace. It adds a one-line reminder to each prompt and asks Claude to offer recording work no process covered.

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

The skill works the same way: ask Claude for a piece of work and it searches How2MapIt first.

## Data

The plugin sends nothing itself. The How2MapIt connector sends your searches, and the processes you choose to record, to
How2MapIt at `api.how2mapit.com`, signed in as you, in the company you chose when you connected, and returns the
processes you can open there.

Privacy policy: https://how2mapit.com/privacy
