# Using SigInt Traces for Call Stacks

`--trace-sigint` CLI option will print a message and stack traces on `SIGINT`.
It can be convenient to find out what's the process doing when using shells
launched the Node.js processes.

The behavior of the process on `SIGINT` is not changed with `--trace-sigint`,
i.e. if there is no `SIGINT` listener the process will exit after the prints.
Also, the `--trace-sigint` option will not take effect if there are active
`SIGINT` listeners.

> Caveat:
> `--trace-sigint` CLI option is available since Node.js v13.9.0.

## How To

It is very common that we find a Node.js process hanging there while all
necessary jobs are done, and there is no outputs from the process. In the case
we probaly need an inspector to step into the running process and trying to
figure out what is the process doing right now. With `--trace-sigint` CLI we
can get a stack trace when the process is interrupted via `SIGINT` (for
example, when the process is interrupted with CTRL-C).

Following are examples showing how `--trace-sigint` behaves on different cases
of hanging processes.

Busy JavaScript evaluation:
```bash
> cat src/work.js
let counter = 0;
while (true) {
  // emulating some works...
  counter += 1;
}
> export NODE_OPTIONS=--trace-sigint # Equal to node --trace-sigint src/work.js
> node src/work.js
^C # Send a SIGINT to the process by pressing ctrl-C.
KEYBOARD_INTERRUPT: Script execution was interrupted by `SIGINT`
    at /workspace/src/work.js:2:1
    at Module._compile (internal/modules/cjs/loader.js:1206:30)
    at Module._extensions..js (internal/modules/cjs/loader.js:1226:10)
    at Module.load (internal/modules/cjs/loader.js:1055:32)
    at Module._load (internal/modules/cjs/loader.js:950:14)
    at executeUserEntryPoint (internal/modules/run_main.js:71:12)
    at internal/main/run_main_module.js:17:47
```

Idle looping:
```bash
> cat src/work.js
setInterval(() => {}, 1000);
> export NODE_OPTIONS=--trace-sigint # Equal to node --trace-sigint src/work.js
> node src/work.js
^C # Send a SIGINT to the process by pressing ctrl-C.
KEYBOARD_INTERRUPT: Script execution was interrupted by `SIGINT`
```

Since there is no JavaScript running during idle looping, the trace will
not contain any JavaScript stack traces but a message indicating the process
has been terminated by a `SIGINT`.

## Useful Links

- https://nodejs.org/docs/latest/api/cli.html#cli_trace_sigint
