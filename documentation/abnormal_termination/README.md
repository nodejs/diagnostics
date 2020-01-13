
# Abnormal Termination

In this document you can learn about how to debug process crashes or unexpected process exits.

- [Abnormal Termination](#abnormal-termination)
  - [Introduction](#introduction)
  - [Common Symptoms](#common-symptoms)
    - [Process silently exits](#process-silently-exits)
  - [Debugging](#debugging)

## Introduction

In certain scenarios, our application can throw an uncaught exception and make
the process to exit. In some situations, the stack trace generated during the
crash provides enough information to understand and fix the issue, but it’s not
always the case. It can be especially challenging to understand our application
behaviour that leads to an exception when either our stack trace is different
from the original stack-trace or we need more information like the internal
state of the application to make conclusions. The process of debugging a crashed
process called post-mortem debugging.

## Common Symptoms

### Process silently exits

```console
$ node index.js
$ # process exited
```

There are three reasons for a process to exit silently: 

  1. The process was finished by using `process.exit()`
  2. The process received a  termination signal
  3. The process reached the end of the JavaScript execution and there are no async handlers attached

To find out if the process exited because of a `process.exit()` call, follow [Using Exit Stack Traces](step1/using_exit_stack_traces.md). If that doesn't work, check if a process is exiting due to a termination signal by following `PLACEHOLDER FOR GUIDE` or if it's exiting because it doesn't have anything else to execute by following `PLACEHOLDER FOR GUIDE`.

### Process exits with Native Stack Trace

TBD

### Process exits with unmeaningful Stack Trace

TBD

## Advanced debugging

If the symptoms above don't cover your issue, using more advanced tools can be a good option. Post-mortem debugging is a technique which allows developers to gather insights
and find bugs in production processes after those issues happened — even if the
application crashes or goes into an infinite loop. This is a common technique
for static languages such as C++ and fortunately, Node.js has support for it.

- [Using Diagnostic Report](step2/using_diagnostic_report.md)
- [Using Core Dumps With lldb](step3/using_lldb.md)
