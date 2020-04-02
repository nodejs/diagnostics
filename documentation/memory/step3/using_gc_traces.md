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

This is how to interpret the trace data (for the second line):

<table>
  <tr>
    <th>Token value</th>
    <th>Interpretation</th>
  </tr>
  <tr>
    <td>23521</td>
    <td>PID of the running process</td>
  </tr>
  <tr>
    <td>0x10268db0</td>
    <td>Isolate (JS heap instance)</td>
  </tr>
  <tr>
    <td>120</td>
    <td>Time since the process start in ms</td>
  </tr>
  <tr>
    <td>Mark-sweep</td>
    <td>Type / Phase of GC</td>
  </tr>
  <tr>
    <td>100.7</td>
    <td>Heap used before GC in MB</td>
  </tr>
  <tr>
    <td>122.7</td>
    <td>Total heap before GC in MB</td>
  </tr>
  <tr>
    <td>100.6</td>
    <td>Heap used after GC in MB</td>
  </tr>
  <tr>
    <td>122.7</td>
    <td>Total heap after GC in MB</td>
  </tr>
  <tr>
    <td>0.15 / 0.0 </td>
    <td>Time spent in GC in ms</td>
  </tr>
  <tr>
    <td>(average mu = 0.132, current mu = 0.137)</br>
        deserialize GC in old space requested</td>
    <td>Reason for GC</td>
  </tr>
</table>

## Examples of diagnosing memory issues with trace option:

A. How to get context of bad allocations using --trace-gc
  1. Suppose we observe that the old space is continously increasing.
  2. But due to heavy gc, the heap roof is not hit, but the process is slow.
  3. Review the trace data and figure out how much is the total heap before and after the gc.
  4. Reduce `--max-old-space-size` such that the total heap is closer to the limit.
  5. Allow the program to run, hit the out of memory.
  6. The produced log gives shows the failing context.

B. How to assert whether too many gc are happening or too many gc is causing an overhead
  1. Review the trace data, specifically around time between consecutive gcs.
  2. Review the trace data, specifically around time spent in gc.
  3. If the time between two gc is less than the time spent in gc, the application is sseverely starving.
  4. If the time between two gc and the time spent in gc are very high, probably the application can use a smaller heap
  5. If the time between two gc is much greater than the time spent in gc, application is relatively healthy

