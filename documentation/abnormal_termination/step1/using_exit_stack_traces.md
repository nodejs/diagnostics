# Using Exit Stack Traces for Debugging

`--trace-exit` CLI option will print a stack trace on every proactive
`process.exit` invocation. It is convenient to confirm if the abnormal exit of
the process was initiated from an invocation of `process.exit` or something
other crashes.

> Caveat:
> `--trace-exit` CLI option is available since Node.js v13.5.0.

## How To

There are conditions that we used an third party library that we have trivial
knowledge of the implementation details. It is hard to determine where the exit
is trigger in which library in these conditions. On the first step we have to
determine if it is a proactive `process.exit` invocation and where it is to
prevent follow up not trivial work of detailed digging the exit reasons.

The simple step is to add an option `--trace-exit` on starting the Node.js
process. Since then, we can see a stacktrace on each call of `process.exit`.

```bash
 > node --trace-exit src/abnormal-exit.js
(node:26480) WARNING: Exited the environment with code 0
    at exit (internal/process/per_thread.js:168:13)
    at /node_modules/some-obscure-library:199:32 # this is the actual location.
    at Module._compile (internal/modules/cjs/loader.js:1139:30)
    at Module._extensions..js (internal/modules/cjs/loader.js:1159:10)
    at Module.load (internal/modules/cjs/loader.js:988:32)
    at Module._load (internal/modules/cjs/loader.js:896:14)
    at executeUserEntryPoint (internal/modules/run_main.js:71:12)
```

With the knowledge of where the calls of `process.exit` is, we can check around
the invocation to understand the reasons and prevent it from abnormal exits.

If the process doesn't output a stack trace on exit, we can come to a
conclusion that the process exited for other reasons, and we
can deploy strategy according to the [abnormal termination guides on common symptoms].

## Useful Links

- https://nodejs.org/docs/latest/api/cli.html#cli_trace_exit

[abnormal termination guides on common symptoms]: ../README.md#Common_Symptoms
