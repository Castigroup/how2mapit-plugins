# How2MapIt plugins for Claude

| Plugin | What |
|---|---|
| [How2MapIt](plugins/how2mapit) | Work from your How2MapIt processes; record new ones as you work |

## Install

**claude.ai and Cowork:** Customize > Plugins > Add > Add marketplace, enter
`https://github.com/castigroup/how2mapit-plugins`, then install How2MapIt. Connect How2MapIt on the plugin's
Connectors tab.

**Organisation (Team, Enterprise):** an Owner adds the marketplace under Organization settings > Plugins and sets
How2MapIt to Installed by default. It then reaches Claude Code too.

**Claude Code:**

    claude plugin install how2mapit --marketplace castigroup/how2mapit-plugins

## Requirements

- A How2MapIt account (Power user licence or higher to record personal processes).
- Claude Code 2.1.287 or later for the reminder and the offer; claude.ai and Cowork need nothing extra.
