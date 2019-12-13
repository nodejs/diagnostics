# Using Heap Profiler

## Heap Profiler

Heap Profiler is similar to the Sampling Heap Profiler, except it will track every allocation. It has
higher overhead than the Sampling Heap Profiler so it’s not recommended to use in production.

### How To

// TODO

## Sampling Heap Profiler

Sampling Heap Profiler tracks memory allocation pattern and reserved space over time. As it’s
sampling based it has a low enough overhead to use it in production systems.

### How To

// TODO

## Useful Links

- https://developers.google.com/web/tools/chrome-devtools/memory-problems/allocation-profiler
_ https://github.com/v8/sampling-heap-profiler