# Tracing garbage collection

There's a lot to learn about how the garbage collector works, but if you learn one thing it's that when GC is running, your code is not.

You may want to know how often and how long the garbage collection is running.

## Runnig with garbage collection traces
You can see traces for garbage collection in console output of your process using the `--trace_gc` flag.

```
node --trace_gc app.js
```

You might want to avoid getting traces from the entire lifetime of your process running on a server. In that case, set the flag from within the process.

Here's how to print GC events to stdout for one minute.
```js
const v8 = require('v8');
v8.setFlagsFromString('--trace_gc');
setTimeout(() => { v8.setFlagsFromString('--notrace_gc'); }, 60e3);
```

## Examining a trace

Obtained traces of garbage collection looks like the following lines.

```
[19278:0x5408db0]  44 ms: Scavenge 2.3 (3.0) -> 1.9 (4.0) MB, 1.2 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure

[23521:0x10268b000]  120 ms: Mark-sweep 100.7 (122.7) -> 100.6 (122.7) MB, 0.15 / 0.0 ms  (average mu = 0.132, current mu = 0.137) deserialize GC in old space requested
```

This is how to interpret the trace data:

```
[PID: isolate] < time taken since GC started in ms> : < type/phase of GC > <heap used before GC call in MB> ( < allocated heap before GC call in MB > ) -> < heap used after GC in MB> ( < allocated heap after GC in MB>) <time spent in GC in ms> [ < reason for GC >]
```
