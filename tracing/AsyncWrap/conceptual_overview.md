## Concepts

async\_hooks provides a mechanism to store context at the time of registration of a task (callback) and to restore context prior to execution of that task. This makes it possible to provide a consistent logical context across otherwise disjointed tasks.

When a task (callback) is registered, a context ID is assigned and provided as a parameter to "init" hooks. Before the task (callback) is invoked the same context ID is provided to "before" hooks. "init" hooks execute immediately in the registering context and therefore can save off aspects of it; "before" hooks execute in the task invocation context and therefore can restore saved aspects of the registering context prior to that task's execution.

"after" hooks are called immediately after execution of the task and receive the context ID to allow context cleanup. "destroy" hooks are called on destruction of the context to allow resource cleanup.

As implied by the previous paragraph, async\_hooks itself only manages a context ID, not actual context. It is up to a hook author to associate data with this ID in an init hook, for example in a persistent map of context IDs to context objects.

## Terms

**async\_id** is a unique ID assigned to every context. An incrementing integer; 1 represents the root context.

**trigger\_id** is the async\_id of the parent context of the context identified by async\_id.

**registering context** is the context where a task is scheduled, for example where `nextTick` is called.

**invocation context** is the context where a task is invoked.

## Implementations

The above concepts apply to all implementations of async\_hooks; but the implementation is different for different task scheduling mechanisms.

The implementation of async\_hooks integrated in Node.js core focuses mostly on tasks and callbacks associated with UV resources. It also includes an implementation for `process.nextTick` and a JS API for use by library authors. An implementation for use with Promises which utilizes PromiseHook is also in progress.

### UV Resources

For UV resources (handles and requests), async\_hooks provides a mechanism to track a context ID across the lifetime of the UV resource. When the UV resource is constructed a context ID is created and "init" hooks called; when callbacks associated with the resource are executed this same context ID is passed to "before" hooks. Construction and destruction of the UV resource are taken to be adequate proxies for construction and destruction of a logical context.

### JS Libraries

An early form of an "Embedder API" is available in the `async\_hooks` JS module which allows a library author to create a new context (i.e. async\_id) independently of a UV resource. It is up to the library author to call `emitInit` to create the new context at the time of task registration, and to wrap the callback with `emitBefore` and `emitAfter` for execution at the time invocation. The library author can also call emitDestroy when the original context is no longer needed.

Some builtin modules are instrumented with this pattern:

* lib/internal/process/next\_tick.js
* lib/timers.js

#### process.nextTick

process.nextTick accepts a context ID as its first parameter; this becomes the parent context ID ("trigger\_id") for `before` hooks, which are executed prior to invocation of the actual nextTick callback. The current context ID ("async\_id") for the nextTick callback itself is set when the tick callback is registered.

### Promises

Derives from AsyncWrap to provide context-tracking hooks for Promises. See [PR][] in review.

[PR]: https://github.com/nodejs/node/pull/13000

---

## AsyncHook Sets

```js
const async\_hooks = require('async\_hooks');
var myHook = async\_hooks.createHook({ init, before, after, destroy });
myHook.enable();
```

Users can determine the context ID and take actions on the current context through hooks in hook sets. A hook set is a tuple of { init, before, after, destroy } functions which allow the user to inspect and modify the execution context at various points throughout its lifetime.

  * init: called as a new context is being created. Receives new context ID (async\_id) and parent context ID (trigger_id).
  * before: called before an async task is invoked. Receives context and parent context IDs (async\_id and trigger_id).
  * after: called after an async task is invoked. Receives context ID (async\_id).
  * destroy: called when the context is destroyed.

---

## process.binding('async_wrap')

* async\_hook\_fields - global count of hooks of each type
* async\_uid\_fields - global list of current and next IDs

