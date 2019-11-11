
# Abnormal Termination

In this document you can learn about how to debug process crashes.

- [Abnormal Termination](#abnormal-termination)
  - [The process exits without a useful stack trace](#the-process-exits-without-a-useful-stack-trace)
    - [Symptoms](#symptoms)
    - [Debugging](#debugging)

## The process exits without a useful stack trace

### Symptoms

In certain scenarios, our application can throw an uncaught exception and make
the process to exit. In some situations, the stack trace generated during the
crash provides enough information to understand and fix the issue, but it’s not
always the case. It can be especially challenging to understand our application
behaviour that leads to an exception when either our stack trace is different
from the original stack-trace or we need more information like the internal
state of the application to make conclusions. The process of debugging a crashed
process called post-mortem debugging.

### Debugging

Post-mortem debugging is a technique which allows developers to gather insights
and find bugs in production processes after those issues happened — even if the
application crashes or goes into an infinite loop. This is a common technique
for static languages such as C++ and fortunately, Node.js has support for it.

- [Using Exit Stack Traces](step1/using_exit_stack_traces.md)
- [Using Diagnostic Report](step2/using_diagnostic_report.md)
- [Using Core Dumps With lldb](step3/using_lldb.md)