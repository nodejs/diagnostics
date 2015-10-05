Node.js tracing - AsyncWrap
================================================================================

AsyncWrap is two things. One is a
[class abstraction](https://github.com/nodejs/node/blob/master/src/async-wrap.h)
there provides node internal facilities for handling async things, such as
calling a callback.
The other part is a an API for setting up hooks, that allow one to get
structural tracing information about the life of handle objects. In the context
of tracing the latter is usually what is meant.

_The reasoning for the current naming confusion, is that the API part implements
the hooks through the AsyncWrap class. But there is nothing inherently correct
in doing that, for example if v8 provided those facilities the AsyncWrap class
would not need be involved in the AsyncWrap API._

For the remaining description the API part is what is meant by AsyncWrap.

## Handle objects

AsyncWrap emits events (hooks) that informs the consumer about the life of all handle
objects in node. Thus in order to understand AsyncWrap one must first understand
handle objects.

The API that node exposes is mostly defined in JavaScript files. However
ECMAScript does not define any API for creating a TCP socket, reading a file
etc.. That logic is implemented in C++ using libuv and the v8 API. The JavaScript in
nodecore interacts with this C++ layer using the handle objects.

For example to create and connect a TCP socket:

```javascript
const TCP = process.binding('tcp_wrap').TCP;
const TCPConnectWrap = process.binding('tcp_wrap').TCPConnectWrap;

const req = new TCPConnectWrap();
req.oncomplete = oncomplete;
req.address = address;
req.port = port;

const socket = new TCP();
socket.onread = onread;
socket.connect(req, address, port);
```

This example uses two handle objects. The first one (`TCPConnectWrap`) is for
connecting the socket, the second one (`TCP`) is for maintaining the connection.

`TCPConnectWrap` gets its information by setting properties on the handle
object, like `address` and `port`. Those properties are read by the C++ layer,
but can also be inspected from the AsyncWrap hooks. When the handle is create
using `new TCPConnectWrap()` the `init` hook is called.

A `oncomplete` property is also set, this is the callback for when the connection is made or failed. Just before calling `oncomplete` the `before` hook
is called, just after the `after` hook is called.

The `TCP` handle works exactly the same way, except that the information
is passed as arguments to a method `.connect` and the `onread` function
is called multiply times, thus it behaves like an event. This also means that
the `before` and `after` hooks are called multiply times.

Thus one should expect the hooks be called in the following order:

```javascript
init // TCPConnectWrap
init // TCP
=== tick ===
before // TCPConnectWrap
after // TCPConnectWrap
=== tick ===
before // TCP
after // TCP
=== tick ===
before // TCP
after // TCP
=== tick ===
...
```

_tick_ indicates there is at least one tick between the text above and the text below.

## The API

At the moment there don't exist a high level API for AsyncWrap. It is simply exposed through `process.binding`:

```javascript
const asyncWrap = process.binding('async_wrap');
```

_Be warned that this API is not an official API and can change at any time, even if it's just patch
update._

To assign the hooks call:

```javascript
asyncWrap.setupHooks(init, before, after);
function init(provider) { /* consumer code */ }
function before() { /* consumer code */ }
function after() { /* consumer code */ }
```

Note that calling `asyncWrap.setupHooks` again, will overwrite the previous
hooks.

#### Enable and disable

Because there is a small performance penalty in just calling a noop function,
AsyncWrap is not enabled by default. To enable AsyncWrap call:

```javascript
asyncWrap.enable();
```

Note that handle objects created before AsyncWrap is enabled will never
be tracked, even after `.enable()` is called. Similarly when AsyncWrap is
disabled, the handle objects there are already being tracked will continue
to be tracked. Finally there are some cases where handle objects have a parent.
For example a TCP server creates TCP sockets, thus the socket handles have the
server handle as a parent. In this case AsyncWrap should be enabled before
the server handle is created, for the TCP sockets to be tracked.

Disabling AsyncWrap can be done with:

```javascript
asyncWrap.disable();
```

#### The hooks

Currently there are 3 hooks: `init`, `before` and `after`. The function
signatures are quite similar. In all cases the `this` variable is the handle
object. Users may read properties from this object such as `port` and `address` in the `TCPConnectWrap` case, or set user specific properties.

Finally the `init` has an extra argument called `provider`, this is an
integer that refer to names defined in an `async.Providers` object map.

## example

A classic use case for AsyncWrap is to create a long-stack-trace tool.

```javascript
const asyncWrap = process.binding('async_wrap');

asyncWrap.setupHooks(init, before, after);
asyncWrap.enable();

// global state variable, that contains the current stack trace
let currentStack = '';

function init(provider) {
  // When a handle is created, collect the stack trace such that we later
  // can see what involved the handle constructor.
  const localStack = (new Error()).stack.split('\n').slice(1).join('\n');
  // Compute the full stack and store it as a property on the handle object,˛
  // such that it can be fetched later in either `before` or `after`.
  this._full_init_stack = localStack + '\n' + currentStack;
}
function before() {
  // A callback is about to be called, update the `currentStack` such that
  // it is correct for when another handle is initialized or `getStack` is called.
  currentStack = this._full_init_stack;
}
function after() {
  // At the time of writing there are some odd cases where there is no handle
  // context, this line prevents that from resulting in wrong stack trace. But
  // the stack trace will be shorter compared to what ideally should happen.
  currentStack = '';
}

function getStack(message) {
  const localStack = new Error(message);
  return localStack.stack + '\n' + currentStack;
}
module.exports = getStack;
```

Please note that this example is way simpler, than what is required from a
complete long-stack-trace implementation.

## Things you might not expect

* `console.log` is async and thus invokes AsyncWrap, thus using `console.log`
inside one of the hooks, creates an infinite recursion. Use `fs.syncWrite(1, msg)`
or `process._rawDebug(msg)` instead.

* `process.nextTick` never creates a handle object. You will have to money patch
this.

* Timer functions (like `setTimeout`) shares a single Timer handle, thus you
will usually have to money patch those functions.

## Resources

* An intro to AsyncWrap by Trevor Norris: http://blog.trevnorris.com/2015/02/asyncwrap-tutorial-introduction.html (outdated)
* Slides from a local talk Andreas Madsen did on AsyncWrap:
https://github.com/AndreasMadsen/talk-async-wrap (outdated)
* There was also some discussion in [issue #21](https://github.com/nodejs/tracing-wg/issues/21#issuecomment-142727693).
* Complete (hopefully) long-stack-trace module that uses AsyncWrap: https://github.com/AndreasMadsen/trace
* Visualization tool for AsyncWrap wrap: https://github.com/AndreasMadsen/dprof

----

If you have more info to provide, please send us a pull request!
