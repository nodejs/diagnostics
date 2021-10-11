# Using Heap Profiler

## Heap Profiler - Allocation Timeline

Heap Profiler is similar to the Sampling Heap Profiler, except it will track every allocation. It has
higher overhead than the Sampling Heap Profiler so it’s not recommended to use in production.

### How To

Start the application:

```console
node --inspect index.js
```

> `--inspect-brk` is an better choice for scripts.

Connect to the dev-tools instance and then:

- Select `memory` tab
- Select `Allocation instrumentation timeline`
- Start profiling

![image](https://user-images.githubusercontent.com/26234614/136712329-ac9fc581-af2b-4a94-8849-b959ebea0a59.png)

After it, the heap profiling is running, it is strongly recommended to run samples in order to identify memory issues, for this example, we will use `Apache Benchmark` to produce load in the application.

> In this example, we are assuming the heap profiling under web application.

```console
ab -n 1000 -c 5 http://localhost:3000
```

Hence, press stop button when the load expected is complete

![image](https://user-images.githubusercontent.com/26234614/136714198-867632e0-2417-4336-9e6c-828fcf5be6b7.png)

Then look at the snapshot data towards to memory allocation.

![image](https://user-images.githubusercontent.com/26234614/136846720-65bf7073-eddc-4afd-9753-e21ef75e0243.png)

Check the [usefull links](#usefull-links) section for futher information about memory terminology.

## Sampling Heap Profiler

Sampling Heap Profiler tracks memory allocation pattern and reserved space over time. As it’s
sampling based it has a low enough overhead to use it in production systems.

### How To

Start the application:

```console
node --inspect index.js
```

> `--inspect-brk` is an better choice for scripts.

Connect to the dev-tools instance and then:

- Select `memory` tab
- Select `Allocation sampling`
- Start profiling

![image](https://user-images.githubusercontent.com/26234614/136847038-1cb6dfd4-26d4-4e2a-8dd1-8d74c2151360.png)

Produce some load and stop the profiler. It will generate a summary with allocation based in the stacktrace, you can lookup to the functions with more heap allocations in a timespan, see the example below:

![image](https://user-images.githubusercontent.com/26234614/136849337-1dd4c46e-b479-48a8-a995-422bb3f17f56.png)

## Useful Links

- https://developer.chrome.com/docs/devtools/memory-problems/memory-101/
- https://github.com/v8/sampling-heap-profiler
- https://developer.chrome.com/docs/devtools/memory-problems/allocation-profiler/
