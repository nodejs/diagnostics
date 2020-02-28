
# Abnormal Termination

In this document you can learn about how to debug process crashes or unexpected process exits.

- [Abnormal Termination](#abnormal-termination)
  - [Introduction](#introduction)
  - [Common Symptoms](#common-symptoms)
    - [Process silently exits](#process-silently-exits)
    - [Process exits with Native Stack Trace](#process-exits-with-native-stack-trace)
    - [Process exits with JavaScript Stack Trace](#process-exits-with-javascript-stack-trace)
      - [Sufficient Message and Stack Trace](#sufficient-message-and-stack-trace)
      - [Insufficient Message and Stack Trace](#insufficient-message-and-stack-trace)
  - [Advanced debugging](#advanced-debugging)

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
  2. The process received a termination signal
  3. The process reached the end of the JavaScript execution and there are no async handlers attached

To find out if the process exited because of a `process.exit()` call, follow [Using Exit Stack Traces](step1/using_exit_stack_traces.md). If that doesn't work, check if a process is exiting due to a termination signal by following `PLACEHOLDER FOR GUIDE` or if it's exiting because it doesn't have anything else to execute by following `PLACEHOLDER FOR GUIDE`.

### Process exits with Native Stack Trace

Some Node.js application uses native modules to re-use existing components or
performance optimize specific areas. A common example for native modules are
database drivers. In the case our native module has an issue it can crash the
Node.js application which will generate a native stack trace.

You can find the most common scenarios for native crashes here:

1. Native module crashes due bug
2. Native module crashes due memory leak (native memory leak)
3. Bugs in Node.js runtime and dependencies, for example:
   - Accessing garbage collected data
   - Accessing NULL pointer
   - Attempting to process invalid file descriptors
   - Use native API compiled on linux using glibc on Alpine which uses Musl
   - V8 checks, when input data checking to v8 APIs is missing can lead to a crash
   - Call v8 APIs without HandleScope
   - Call v8 APIs from wrong Thread

Check out the following guides to root cause the issue:

- [Using Diagnostic Report](step2/using_diagnostic_report.md)
- [Using Valgrind](step4/using_valgrind.md)

### Process exits with JavaScript Stack Trace

In this scenario our application exists with a JavaScript stack trace.
We differentiate two bug use-cases here; when the error message and stack trace
provides enough information to root cause the issue and when it doesn't.

#### Sufficient Message and Stack Trace

In this case the stack trace and error message has enough information to root
cause the issue. This use case doesn't require to use diagnostics tools.

#### Insufficient Message and Stack Trace

In this case the error message or the stack trace doesn't contain enough
information to root cause the issue, for example:

1. Third party library uses general error messages
2. Stack trace frame limit cuts important frames
3. Error is tampered by error handling pipeline, for example:
   - Error is rethrown (tampered stack trace)
   - Error is wrapped (tampered message)

Check out the following guides to root cause the issue:

- [Using Diagnostic Report](step2/using_diagnostic_report.md)
- [Using Core Dumps With lldb](step3/using_lldb.md)

## Advanced debugging

If the symptoms above don't cover your issue, using more advanced tools can be a good option. Post-mortem debugging is a technique which allows developers to gather insights
and find bugs in production processes after those issues happened — even if the
application crashes or goes into an infinite loop. This is a common technique
for static languages such as C++ and fortunately, Node.js has support for it.

- [Using Diagnostic Report](step2/using_diagnostic_report.md)
- [Using Core Dumps With lldb](step3/using_lldb.md)
