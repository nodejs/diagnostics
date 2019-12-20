# Using Heap Snapshot

You can take a Heap Snapshot from your running application and load it into
Chrome Developer Tools to inspect certain variables or check retainer size. You
can also compare multiple snapshots to see differences over time.

## How To

### Get the Heap Snapshot

The simplest way to get a Heap Snapshot is to connect a debugger to your process running locally and go to Profiling, choose to take a memory snapshot.

If you need a snapshot from a working process, like an application running on a server, you should implement getting it using:

```js
require('v8').writeHeapSnapshot()
```

Check [writeHeapSnapshot docs](https://nodejs.org/dist/latest-v12.x/docs/api/v8.html#v8_v8_writeheapsnapshot_filename) for file name options

You need to have a way to invoke it without stopping the process, so calling it in a http handler or as a reaction to a signal from the operating system is advised.  
Be careful not to expose the http endpoint triggering a snapshot. It should not be possible for anybody else to access it.

For versions of Node.js before v11.13.0 you can use the  [heapdump package](https://www.npmjs.com/package/heapdump)

### How to find a memory leak with Heap Snapshots

To find a memory leak one compares two snapshots. It's important to make sure the snapshots diff doesn't contain unnecessary information. Following steps should produce a clean diff between snapshots.

1. Let the process load all sources and finish bootstrapping. It should take a few seconds at most. 
1. Start using the functionality you suspect of leaking memory. It's likely it makes some initial allocations that are not the leaking ones.
1. Take one heap snapshot.
1. Continue using the functionality for a while, preferably without running anything else in between.
1. Take another heap snapshot. The difference between the two should mostly contain what was leaking.
1. Open Chromium/Chrome dev tools and go to *Memory* tab
1. Load the older snapshot file first, newer one second ![Screenshot: Load button in tools]
(TODO) 
1. Select the newer snapshot and switch mode in a dropdown at the top from *Summary* to *Comparison*.
1. Look for large positive deltas and explore the references that caused them in the bottom panel.


Practice capturing heap snapshots and finding memory leaks with [a heap snapshot exercise](https://github.com/naugtur/node-example-heapdump)
