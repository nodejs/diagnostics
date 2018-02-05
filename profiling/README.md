## Profiling for Node  
- CPU Profiling
  - V8 CPU Profiler: [v8/include/v8-profiler.h](https://github.com/v8/v8/blob/master/include/v8-profiler.h)
    - Accessible globally through `--prof` runtime flag, basic processing and display through `--prof-processor` runtime flag
  - Intel vTune profiler. Accessible through `--enable-vtune-profiling` compile-time flag.

- Heap Profiling
  - V8 Heap Profiler: [v8/include/v8-profiler.h](https://github.com/v8/v8/blob/master/include/v8-profiler.h)
    - Heap memory usage stats are available through built-in 'v8' module.

Name | Sponsor
-----|--------
[v8-profiler][] | StrongLoop
[Chrome DevTools][] | Google

[v8-profiler]: https://github.com/node-inspector/v8-profiler
[Chrome DevTools]: https://github.com/ChromeDevTools/devtools-frontend

### Stack Analysis  
- [0x](https://github.com/davidmarkclements/0x)
- [StackVis](https://github.com/joyent/node-stackvis)

## Docs  
[guides/simple-profiling](https://nodejs.org/en/docs/guides/simple-profiling/)
[paulirish/automated-chrome-profiling](https://github.com/paulirish/automated-chrome-profiling)

