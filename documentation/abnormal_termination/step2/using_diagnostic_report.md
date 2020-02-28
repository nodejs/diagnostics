# Using Diagnostic Report

Formerly known as node-report. The report is intended for development, test and
production use, to capture and preserve information for problem determination.
It includes JavaScript and native stack traces, heap statistics, platform
information, resource usage etc. Diagnostic Report can be useful to discover
configuration and component version issues with in your process.

## How To

//TODO, raw notes from deep dive:

1. Open the generated report (either from file or from console)
2. Take a look to allocation section in the report
3. Look for the old_space
    - used is high
    - available is very low
4. Look javascriptStack to see the victim of the memory leak which can be the allocation pattern and source to find what causes it (JavaScript stack trace won’t always point to the right frame, can be confusing)
5. -> see memory related user journeys to identify exact cause

## Useful Links

_ https://nodejs.org/api/report.html
- https://medium.com/the-node-js-collection/easily-identify-problems-in-node-js-application
