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