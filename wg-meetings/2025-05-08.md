# Node.js Diagnostics WorkGroup Meeting 2025-05-08

## Links

- **Recording**: https://www.youtube.com/watch?v=-YlbGck3e_o
- **GitHub Issue**: https://github.com/nodejs/diagnostics/issues/658
- **Minutes Google Doc**: https://docs.google.com/document/d/16D1es466CuG4K7dSkH5yQCtZjwGKeF2vCgLQaceIjeM/edit?tab=t.0

## Present

- Diagnostics team: @nodejs/diagnostics

* Abhijeet Prasad (@AbhiPrasad)
* Tim Fish (@timfish)
* James Sumners

## Agenda

### nodejs/node

- Port/Duplicate async_hooks tests to use AsyncLocalStore #55712
  - No participants present, so we skipped this one.

### nodejs/import-in-the-middle

- Support for --experimental-strip-types [#186](https://github.com/nodejs/import-in-the-middle/issues/186)
  - https://github.com/nodejs/loaders/issues/208
  - When do experimental-strip-types run?
  - Does --experimental-strip-types interfere with other loader hooks?
  - Can we escalate to Marco + Node folks working on experimental strip types?
  - Tim Fish to open an issue with Node about this
- Behavior is different from `require-in-the-middle` [#185](https://github.com/nodejs/import-in-the-middle/issues/185)
  - Conditionally was introduced with https://github.com/nodejs/import-in-the-middle/commit/c9c56497f0f1af2a9c3d5b39144907c9081fd871
  - Should import-in-the-middle work like require-in-the-middle here?
    - OpenTelemetry assumes they do
  - Let’s gate behind a flag to test this out, we can move it out of a flag afterwards
- fix: Skip wrapping CJS modules which result in invalid identifiers [#115](https://github.com/nodejs/import-in-the-middle/pull/115)
  - Let’s merge this

## Q&A, Other

- Tim will open an issue about the node-import core implementation to ask why it doesn’t use the watchdog thread the original used
- https://github.com/DataDog/orchestrion-js has some PRs opened by Tim, feel free to go check them out. There are also some open issues that are open to any feedback/thoughts.
- Mainly looking at API design and getting the module in a state where it can be published

## Upcoming Meetings

- **Node.js Project Calendar**: <https://nodejs.org/calendar>

Click `+GoogleCalendar` at the bottom right to add to your own Google calendar.
