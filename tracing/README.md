## Tracing  
- [AsyncHooks](https://nodejs.org/api/async_hooks.html) - Most native objects are represented indirectly by the [AsyncWrap class](https://github.com/nodejs/node/blob/master/src/async_wrap.h), so hooks have been added to that class to trace lifecycle (init/destroy) and callback activity (pre/post) related to these objects.

- [OS Tracing](./os-tracing/README.md) - LTTng (Linux), SystemTap (Linux), DTrace (OSX), ETW (Windows)

- [VM Tracing](./vm-tracing/README.md) - Tracing native to JS VMs, such as V8's TRACE_EVENT.

