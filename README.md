# Diagnostics Working Group
The goal of this WG is to ensure Node provides a set of comprehensive, documented, extensible diagnostic protocols, formats, and APIs to enable tool vendors to provide reliable diagnostic tools for Node.

Work is divided into several domains:
- [Tracing](./tracing)
- [Profiling](./profiling)
- [Heap and Memory Analysis](./heap-memory)
- [Step Debugging](./debugging)

Background, reference documentation, samples, and discussion for each domain is contained within its folder.

Work needed includes:
- Collect, understand, and document existing diagnostic capabilities and entry-points throughout Node, V8, and other components.
- Collect and document projects and products providing diagnostics for Node with brief description of their technical architecture and sponsoring organizations.
- Identify opportunities and gaps, then propose and implement solutions.

### Current Initiatives

| Initiative           | Champion                                         | Stakeholders                            | Links                                            |
|----------------------|--------------------------------------------------|----------------------------------------------|--------------------------------------------------|
| Diagnostic Channel   | [@qard](https://github.com/qard)                 |                                              | https://github.com/nodejs/diagnostics/issues/180 |
| Async Hooks          | [@ofrobots](https://github.com/ofrobots)         |                                              | https://github.com/nodejs/diagnostics/issues/124 |
| Async Context        | [@mike-kaufman](https://github.com/mike-kaufman) | [@kjin](https://github.com/kjin)             | https://github.com/nodejs/diagnostics/issues/107 |
| Node-report in core  | [@mhdawson](https://github.com/mhdawson)         | [@richardlau](https://github.com/richardlau) | coming soon |
| Support tiers        | [@mhdawson](https://github.com/mhdawson)         |                                              | https://github.com/nodejs/diagnostics/issues/157 |
| CPU Profiling        | [@mmarchini](https://github.com/mmarchini)       |                                              | https://github.com/nodejs/diagnostics/issues/148 |
| Post-mortem WG merge | [@mmarchini](https://github.com/mmarchini)       |                                              | https://github.com/nodejs/post-mortem/issues/48 |

#### Need volunteers for

| Initiative            | Champion      | Links                                            |
|-----------------------|---------------|--------------------------------------------------|
| Trace Events          |               | https://github.com/nodejs/diagnostics/issues/84  |
| Performance Profiles  |               | https://github.com/nodejs/diagnostics/issues/161 |
| Time-travel debugging |               | https://github.com/nodejs/diagnostics/issues/164 |
| Platform neutrality   |               |                                                  |

### Logistics
- Monthly Meetings
- Biannual F2F

See the [foundation calendar]{https://calendar.google.com/calendar/embed?src=nodejs.org_nr77ama8p7d7f9ajrpnu506c98%40group.calendar.google.com} for meeting times.

### Members

<!-- ncu-team-sync.team(nodejs/diagnostics) -->

- [@AndreasMadsen](https://github.com/AndreasMadsen) - Andreas Madsen
- [@BridgeAR](https://github.com/BridgeAR) - Ruben Bridgewater
- [@cjihrig](https://github.com/cjihrig) - Colin Ihrig
- [@danielkhan](https://github.com/danielkhan) - Daniel Khan
- [@Flarna](https://github.com/Flarna) - Gerhard Stöbich
- [@hashseed](https://github.com/hashseed) - Yang Guo
- [@hekike](https://github.com/hekike) - Peter Marton
- [@Hollerberg](https://github.com/Hollerberg) - Gernot Reisinger
- [@jasnell](https://github.com/jasnell) - James M Snell
- [@jkrems](https://github.com/jkrems) - Jan Olaf Krems
- [@joyeecheung](https://github.com/joyeecheung) - Joyee Cheung
- [@kjin](https://github.com/kjin) - Kelvin Jin
- [@mcollina](https://github.com/mcollina) - Matteo Collina
- [@mhdawson](https://github.com/mhdawson) - Michael Dawson
- [@mike-kaufman](https://github.com/mike-kaufman) - Mike Kaufman
- [@mmarchini](https://github.com/mmarchini) - Matheus Marchini
- [@naugtur](https://github.com/naugtur) - Zbyszek Tenerowicz
- [@ofrobots](https://github.com/ofrobots) - Ali Ijaz Sheikh
- [@othiym23](https://github.com/othiym23) - Forrest L Norvell
- [@Qard](https://github.com/Qard) - Stephen Belanger
- [@sam-github](https://github.com/sam-github) - Sam Roberts
- [@watson](https://github.com/watson) - Thomas Watson
- [@yunong](https://github.com/yunong) - Yunong Xiao


<!-- ncu-team-sync end -->

#### Emeritus

- [@bnoordhuis](https://github.com/bnoordhuis) - Ben Noordhuis
- [@brycebaril](https://github.com/brycebaril) - Bryce Baril
- [@dberesford](https://github.com/dberesford) - Damian Beresford
- [@Fishrock123](https://github.com/Fishrock123) - Jeremiah Senkpiel
- [@piscisaureus](https://github.com/piscisaureus) - Bert Belder
- [@pmuellr](https://github.com/pmuellr) - Patrick Mueller
- [@rmg](https://github.com/rmg) - Ryan Graham
- [@thekemkid](https://github.com/thekemkid) - Glen Keane
- [@thlorenz](https://github.com/thlorenz) - Thorsten Lorenz
- [@trevnorris](https://github.com/trevnorris) - Trevor Norris
