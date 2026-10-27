# How2MapIt for ChatGPT

Work from your company's How2MapIt processes in ChatGPT. Before a task, ChatGPT finds the agreed process and follows it
activity by activity. When work no process covers is done, ChatGPT offers to record it as one of your personal
processes, so next time follows the same way. Nothing is recorded without your yes.

## What it includes

- The How2MapIt connector (`https://api.how2mapit.com/mcp`); you sign in to How2MapIt when you install.
- The `how2-work` skill.

## Install

**Workspace (Business, Enterprise, Edu):** an admin imports the plugin from
`https://github.com/castigroup/how2mapit-plugins` under Admin > Plugins.

**Codex and the ChatGPT desktop app:**

    codex plugin marketplace add castigroup/how2mapit-plugins

Restart the desktop app, then install How2MapIt from the Plugins Directory.

## Use it

Ask ChatGPT to do a piece of work as usual, or type `@how2-work`. ChatGPT says which How2MapIt process applies, or that
none does, and follows it. At the end of work no process covered, answer the offer with yes or no.

## Data

The plugin sends nothing itself. The How2MapIt connector sends your searches, and the processes you choose to record, to
How2MapIt at `api.how2mapit.com`, signed in as you, in the company you chose when you connected.
