# Tracing garbage collection

In this guide you'll go through the fundamentals of garbage collection's traces.

By the end of this guide you'll be able to:
* Enable traces in your Node.js program
* Interpret traces
* Find memory leak source

There's probably a lot of stuff to learn about how the garbage collector works, but if you learn one thing it's that when GC is running, your code is not.

You may want to know how often and how long the garbage collection is running.

## Setup

For the proposal of this guide, we will use a simple web server empowered with [Fastify](https://www.fastify.io/).

1. Create a new project

```bash
npm init -y
```

2. Install dependencies

```bash
npm i fastify
```

3. Create a simple server (server.js)

```js
import Fastify from 'fastify';

const server = Fastify();
const entries = new Set();

server.get('/write', () => {
  const date = new Date().toString();
  // don't do this at home
  entries.add({
    date,
    arch: os.arch(),
    platform: os.platform(),
    cpus: os.cpus()
  });
  return true;
});

server.get('/read', () => {
  return { count: entries.size() };
});

server.listen(9999, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
```

> Even if the leak is evident here, in the context of a real-world application finding the source of a leak could be cumbersome.

## Runnig with garbage collection traces
You can see traces for garbage collection in console output of your process using the `--trace_gc` flag.

```
node --trace_gc server.js
```

It should output something like:

``` bash
[13973:0x110008000]       44 ms: Scavenge 2.4 (3.2) -> 2.0 (4.2) MB, 0.5 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[13973:0x110008000]       75 ms: Scavenge 2.7 (4.7) -> 2.4 (5.4) MB, 0.9 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[13973:0x110008000]      151 ms: Scavenge 3.9 (5.7) -> 3.4 (8.5) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[13973:0x110008000]      181 ms: Scavenge 5.3 (8.5) -> 4.3 (8.7) MB, 0.5 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[13973:0x110008000]      245 ms: Scavenge 6.8 (9.8) -> 5.9 (10.5) MB, 0.6 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
[13973:0x110008000]      271 ms: Scavenge 7.5 (10.5) -> 6.4 (15.8) MB, 0.9 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
server listening on http://127.0.0.1:9999
```

Hard to read? Maybe we should pass in review a few concepts and explain the outputs of the `--trace-gc` flag.

### Examining a trace with `--trace_gc`

The `--trace-gc` flag outputs all garbage collection events in the console. First, let me describe the composition of each line. We'll use the following line as a model:

```bash
[13973:0x110008000]       44 ms: Scavenge 2.4 (3.2) -> 2.0 (4.2) MB, 0.5 / 0.0 ms  (average mu = 1.000, current mu = 1.000) allocation failure
```

| Token value                                                 | Interpretation                     |
|-------------------------------------------------------------|------------------------------------|
| 13973                                                       | PID of the running process         |
| 0x110008000                                                 | Isolate (JS heap instance)         |
| 44 ms                                                       | Time since the process start in ms |
| Scavenge                                                    | Type / Phase of GC                 |
| 2.4                                                         | Heap used before GC in MB          |
| (3.2)                                                       | Total heap before GC in MB         |
| 2.0                                                         | Heap used after GC in MB           |
| (4.2)                                                       | Total heap after GC in MB          |
| 0.5 / 0.0 ms (average mu = 1.000, current mu = 1.000)       | Time spent in GC in ms             |
| allocation failure                                          | Reason for GC                      |

We'll only focus on two events here:
* Scavenge
* Mark-sweep

The heap is divided into "spaces." Amongst these, we have a space called the "new" space and another one called the "old" space.

> 👉 In reality, the heap is a bit different, but for the purpose of this article, we'll stick to a simpler version. If you want more details, I encourage you to look at this [talk of Peter Marshall](https://v8.dev/blog/trash-talk) about Orinoco.

### Scavenge

Scavenge is the name of an algorithm that will perform garbage collection into new space.
The new space is where objects are created. The new space is designed to be small and fast for garbage collection.

Let's imagine a Scavenge scenario:

* we allocated `A`, `B`, `C` & `D`.
  ```bash
  | A | B | C | D | <unallocated> |
  ```
* we want to allocate `E`
* not enough space, the memory is exhausted
* then, a (garbage) collection is triggered
* dead objects are collected
* living object will stay
* assuming `B` and `D` were dead
  ```bash
  | A | C | <unallocated> |
  ```
* now we can allocate `E`
  ```bash
  | A | C | E | <unallocated> |
  ```

Objects that are not garbage collected after two Scavenge operations will be promoted to old space.

> 👉 Full [Scavenge scenario](https://github.com/thlorenz/v8-perf/blob/master/gc.md#sample-scavenge-scenario).

### Mark-sweep

Mark-sweep is used to collect objects from old space. The old space is where objects that survived the new space are living.

This algorithm is composed of two phases:
* **Mark**: Will mark still alive objects as black and others as white.
* **Sweep**: Scans for white objects and converts them to free spaces.

> 👉 In fact, the Mark and Sweep steps are a bit more elaborate. Please read this [document](https://github.com/thlorenz/v8-perf/blob/master/gc.md#marking-state) for more details.
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Animation_of_the_Naive_Mark_and_Sweep_Garbage_Collector_Algorithm.gif" /

## `--trace-gc` in action

### Memory leak

Now we can come back to the output of the `--trace-gc` flag and see how we could interpret the output.

* First, install (`autocannon`)[https://www.npmjs.com/package/autocannon]:
```bash
npm i -g autocannon
```

* Then, restart the server:
```bash
node --trace-gc server.js
```

* Open a new terminal and run the following command:
```bash
autocannon http://localhost:9999/write
```

Now, if you come back quickly to the previous terminal window: you will see that there are a lot of `Mark-sweep` events in the console. We also see that the amount of memory collected after the event is insignificant.

Now that we are experts in garbage collection! What could we deduce?

We probably have a memory leak! But how could we point to the correct object in the code? (Reminder: it is pretty apparent in this example, but what about a real-world application?)

But how could we spot the context?

### How to get the context of bad allocations

We previously observes that the old space is continously increasing. The following steps will help you to know wich part of the code is reponsible.

  1. Review the trace data and figure out how much is the total heap before and after the gc.
  2. Use the [`--max-old-space-size`](https://nodejs.org/api/cli.html#--max-old-space-sizesize-in-megabytes) to reduce the total the old space size.
  3. Run the program, until you hit the out of memory.
  4. The produced log shows the failing context.
  6. If it hits OOM, increment the heap size by ~10% or so and repeat few times. If the same pattern is observed, it is indicative of a memory leak.
  7. If there is no OOM, then freeze the heap size to that value - A packed heap reduces memory footprint and compation latency.

TODO(tony-go): add a snippet example

### Slowness

How to assert whether too many gcs are happening or too many gcs are causing an overhead?

  1. Review the trace data, specifically around time between consecutive gcs.
  2. Review the trace data, specifically around time spent in gc.
  3. If the time between two gc is less than the time spent in gc, the application is severely starving.
  4. If the time between two gcs and the time spent in gc are very high, probably the application can use a smaller heap.
  5. If the time between two gcs are much greater than the time spent in gc, application is relatively healthy.

## Bonnus: Trace garbage collection programaticaly

### Using `v8` module

You might want to avoid getting traces from the entire lifetime of your process running on a server. In that case, set the flag from within the process. The `v8` module exposes an API to set flags on the fly.

```js
/// at the top of the 'server.js' file, please add:
import v8 from 'v8';

// then on the body, add:

server.get('/enable-gc-traces', () => {
  v8.setFlagsFromString('--trace_gc');
});

server.get('/disable-gc-traces', (
  v8.setFlagsFromString('--notrace_gc');
});
```

### Using performance hooks

For Node.js v8.5.0 or later, you can use [performance hooks](https://nodejs.org/api/perf_hooks.html) to trace garbage collection.

```js
const { PerformanceObserver } = require('perf_hooks');

// Create a performance observer
const obs = new PerformanceObserver((list) => {
  const entry = list.getEntries()[0]
  /*
  The entry would be an instance of PerformanceEntry containing
  metrics of garbage collection.
  For example:
  PerformanceEntry {
    name: 'gc',
    entryType: 'gc',
    name: 'gc',
    duration: 1.315709,
    kind: 1
  }
  */
});

// Subscribe notifications of GCs
obs.observe({ entryTypes: ['gc'] });

// Stop subscription
obs.disconnect();
```

You can get GC statistics as [PerformanceEntry](https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceentry) from the callback in [PerformanceObserver](https://nodejs.org/api/perf_hooks.html#perf_hooks_class_performanceobserver).

For example:

```js
PerformanceEntry {
  name: 'gc',
  entryType: 'gc',
  startTime: 2820.567669,
  duration: 1.315709,
  kind: 1
}
```

| Property   | Interpretation |
|------------|----------------|
| name       | The name of the performance entry.                                                           |
| entryType  | The type of the performance entry.                                                           |
| startTime  | The high resolution millisecond timestamp marking the starting time of the Performance Entry.|
| duration   | The total number of milliseconds elapsed for this entry.                                     |
| kind       | The type of garbage collection operation that occurred.                                      |
| flags      | The high resolution millisecond timestamp marking the starting time of the Performance Entry.|

For more information, you can refer to [the documentation about performance hooks](https://nodejs.org/api/perf_hooks.html).

