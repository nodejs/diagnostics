# Node.js Diagnostics WorkGroup Meeting 2025-05-29

## Links

- **Recording**: https://www.youtube.com/watch?v=tMdpERC43Ro
- **GitHub Issue**: https://github.com/nodejs/diagnostics/issues/660
- **Minutes Google Doc**: https://docs.google.com/document/d/1C7PD2Y2CyAxkGq9zX3BERK_3Ea5W-lTczEJDfX4vbyY/edit?tab=t.0

## Present

- Diagnostics team: @nodejs/diagnostics

- Abhijeet Prasad (@AbhiPrasad)
- Tim Fish (@timfish)
- James Sumners (@jsumners-nr)

## Agenda

### orchestrion-js

- We can merge in https://github.com/DataDog/orchestrion-js/pull/12, but we need to publish it to NPM
  - Create a temporary org to publish this
  - Tim to publish on npm under a namespace
    - For bundlers we can create an SWC plugin - Sentry to own this
    - For loaders, we can rely on New Relic help

### import-in-the-middle

- [Abhi] https://github.com/nodejs/import-in-the-middle/pull/197
  - Invalid export names fix
  - Abhi to redo PR and adjust things

## Upcoming Meetings

- **Node.js Project Calendar**: <https://nodejs.org/calendar>

Click `+GoogleCalendar` at the bottom right to add to your own Google calendar.
