# Using Diagnostic Report

Formerly known as node-report. The report is intended for development, test and
production use, to capture and preserve information for problem determination.
It includes JavaScript and native stack traces, heap statistics, platform
information, resource usage etc. Diagnostic Report can be useful to discover
configuration and component version issues with in your process.

## How To

1. Open the generated report (either from file or from console)

  Report can be generated using the following cli flags: `node --report-on-fatal-error <app.js>`.
  Report can be generated using the following programatic configuration:
  ```js
  process.report...
  ```

2. Open the generated report which is in the format `report.20200410.114639.4623.0.001.json`. 

3. Look at `javascriptStack` to see what is the cause of abnormal termination. Are there evidence of it being caused by programatic errors? If yes, examine the source as pointed in the call frame and attempt to figure out what went wrong.

4.  If programatic error is ruled out, then examine  `javascriptStack` to see if there is evidence of memory leak / exhaustion. If so, the stack will show the victim of the memory leak which can be the allocation pattern and /or the actual source. Note that `javaScriptStack` will not always point to the right frame.

The `javascriptHeap` will give the details of memory allocation. It is split into 6 regions:
     * read_only_space
     * new_space
     * old_space
     * code_space
     * map_space
     * large_object_space

5. Inpsect each spaces. For each space,
  ```js
  "old_space": {
      "memorySize": 5332910528,
      "committedMemory": 5332846624,
      "capacity": 5332901608,
      "used": 5332770856,
      "available": 130752
  },
  ```
 * used is high : Out of allocated  memory 5332910528 bytes, 5332770856 bytes are used.
 * available is very low : 130752 bytes.

6. The cause may be because of any of the following 2 reasons

  a. Process runs out of memory
    Symptoms
      * Continuously increasing memory usage is observed (can be fast or slow, over days or even weeks).
      * Eventually the process crashes and restarted by the process manager.
      * The process maybe running slower than before and the restarts make certain requests to fail (load balancer responds with 502).
    
    Side Effects
      * Process restarts due to the memory exhaustion and request are dropped on the floor.
      * Increased GC activity leads to higher CPU usage and slower response time.
      * Increased memory swapping slows down the process.
      * May not have enough available memory to get a Heap Snapshot.

    Debugging
      To debug a memory issue we need to be able to see how much space our specific type of objects take, and what variables retain them to get garbage collected. For the effective debugging we also need to know the allocation pattern of our variables over time.

  b. Process utilises memory inefficiently
    Symptoms
      * The application uses an unexpected amount of memory (out of proportion with the application's designed consumption).
      * Observe elevated garbage collector activity.

    Side Effects
      * An elevated number of page faults.
      * Higher GC activity and CPU usage.

    Debugging
      To debug a memory issue we need to be able to see how much space our specific type of objects
 take, and what variables retain them to get garbage collected. For the effective debugging we also
 need to know the allocation pattern of our variables over time.

## Useful Links

_ https://nodejs.org/api/report.html
- https://medium.com/the-node-js-collection/easily-identify-problems-in-node-js-applications-with-diagnostic-report-dc82370d8029
