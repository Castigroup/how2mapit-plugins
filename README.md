# How2MapIt plugins for Claude and ChatGPT

| Plugin | For | What |
|---|---|---|
| [How2MapIt](plugins/how2mapit) | Claude | Work from your How2MapIt processes; record new ones as you work |
| [How2MapIt](chatgpt/how2mapit) | ChatGPT | The same, for ChatGPT |

## Install in Claude

**claude.ai and Cowork:** Customize > Plugins > Add > Add marketplace, enter
`https://github.com/castigroup/how2mapit-plugins`, then install How2MapIt. Connect How2MapIt on the plugin's
Connectors tab.

**Organisation (Team, Enterprise):** an Owner adds the marketplace under Organization settings > Plugins and sets
How2MapIt to Installed by default. It then reaches Claude Code too.

**Claude Code:**

    claude plugin install how2mapit --marketplace castigroup/how2mapit-plugins

## Install in ChatGPT

**Workspace (Business, Enterprise, Edu):** an admin imports the plugin from
`https://github.com/castigroup/how2mapit-plugins` under Admin > Plugins.

**Codex and the ChatGPT desktop app:**

    codex plugin marketplace add castigroup/how2mapit-plugins

## Requirements

- A How2MapIt account (Power user licence or higher to record personal processes).
- Claude Code 2.1.287 or later for the reminder and the offer; claude.ai, Cowork and ChatGPT need nothing extra.
