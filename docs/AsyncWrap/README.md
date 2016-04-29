Node.js tracing - AsyncWrap
================================================================================

AsyncWrap is two things. One is a
[class abstraction](https://github.com/nodejs/node/blob/master/src/async-wrap.h)
that provides an internal mechanism for handling asynchronous tasks, such as
calling a callback.
The other part is an API for setting up hooks and allows one to get
structural tracing information about the life of handle objects. In the context
of tracing the latter is usually what is meant.

_The reasoning for the current naming confusion is that the API part implements
the hooks through the AsyncWrap class, but this is not inherently necessary. For
example if v8 provided those facilities the AsyncWrap class would not need be
involved in the AsyncWrap API._

For the remaining description the API part is what is meant by AsyncWrap.

## Table of Content

* [Handle Objects](#handle-objects)
* [The API](#the-api)
* [Example](#example)
* [Things You Might Not Expect](#things-you-might-not-expect)
* [Resources](#resources)

## Handle Objects

AsyncWrap emits events (hooks) that inform the consumer about the life of all
handle objects in node. Thus in order to understand AsyncWrap one must first
understand handle objects.

Node's core API is mostly defined in JavaScript. However ECMAScript does not
define any API for creating a TCP socket, reading a file etc.. That logic is
implemented in C++ using libuv and the v8 API. The JavaScript in node core
interacts with this C++ layer using the handle objects.

For example in `net.connect(port, address)` that creates a TCP connection,
two handle objects (`TCPConnectWrap` and `TCP`) are created:

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

// later
socket.destroy();
```

The first handle object (`TCPConnectWrap`) is for connecting the socket, the
second one (`TCP`) is for maintaining the connection.

`TCPConnectWrap` gets its information by setting properties on the handle
object, like `address` and `port`. Those properties are read by the C++ layer,
but can also be inspected from the AsyncWrap hooks. When the handle is created
using `new TCPConnectWrap()` the `init` hook is called.

An `oncomplete` property is also set, this is the callback for when the
connection is made or failed. Just before calling `oncomplete` the `pre` hook
is called, just after the `post` hook is called.

The `TCP` handle works exactly the same way, except that the information
is passed as arguments to a method `.connect` and the `onread` function
is called multiple times, thus it behaves like an event. This also means that
the `pre` and `post` hooks are called multiple times.

At some later time the `socket.destroy()` is called, this will call the
`destroy` hook for the `socket` handle. Other handle objects aren't explicitly
destroyed, in that case the `destroy` hook is called when the handle object is
garbage collected by v8.

Thus one should expect the hooks be called in the following order:

```javascript
init // TCPConnectWrap
init // TCP
=== tick ===
pre // TCPConnectWrap
post // TCPConnectWrap
=== tick ===
pre // TCP
post // TCP
=== tick ===
pre // TCP
post // TCP
=== tick ===
...
=== tick ===
destroy // TCP
=== tick ===
destroy // TCPConnectWrap
```

_tick_ indicates there is at least one tick (as in `process.nextTick()`) between
the text above and the text below.

## The API

At the moment there is not a high level API for AsyncWrap. It is simply exposed
through `process.binding`:

```javascript
const asyncWrap = process.binding('async_wrap');
```

_Be warned that this API is not an official API and can change at any time, even
if it's just patch update._

To assign the hooks call:

```javascript
asyncWrap.setupHooks({init, pre, post, destroy});
function init(uid, provider, parentUid, parentHandle) { /* consumer code */ }
function pre(uid) { /* consumer code */ }
function post(uid, didThrow) { /* consumer code */ }
function destroy(uid) { /* consumer code */ }
```

Note that only the `init` function is required and that calling
`asyncWrap.setupHooks` again will overwrite the previous hooks.

#### Enable And Disable

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

#### The Hooks

Currently there are 4 hooks: `init`, `pre`, `post` `destroy`. The `this`
variable refers to the handle object, they all have a `uid` argument. `post`
provides information about the execution of the callback. Finally
`init` provides extra information about the creation of the handle object.

```javascript
function init(uid, provider, parentUid, parentHandle) { }
function pre(uid) { }
function post(uid, didThrow) { }
function destroy(uid) { }
```

##### this

In the `init`, `pre` and `post` cases the `this` variable is the handle object.
Users may read properties from this object such as `port` and `address` in the
`TCPConnectWrap` case.

In the `init` hook the handle object is not yet fully constructed, thus some
properties are not safe to read. This causes problems when doing
`util.inspect(this)` or similar.

In the `destroy` hook `this` is `null`, this is because the handle objects has
been deleted by the garbage collector and thus doesn't exists.

##### provider

This is an integer that refer to names defined in the `asyncWrap.Providers`
object map.

At the time of writing this is the current list:

```javascript
{ NONE: 0,
  CRYPTO: 1,
  FSEVENTWRAP: 2,
  FSREQWRAP: 3,
  GETADDRINFOREQWRAP: 4,
  GETNAMEINFOREQWRAP: 5,
  JSSTREAM: 6,
  PIPEWRAP: 7,
  PIPECONNECTWRAP: 8,
  PROCESSWRAP: 9,
  QUERYWRAP: 10,
  SHUTDOWNWRAP: 11,
  SIGNALWRAP: 12,
  STATWATCHER: 13,
  TCPWRAP: 14,
  TCPCONNECTWRAP: 15,
  TIMERWRAP: 16,
  TLSWRAP: 17,
  TTYWRAP: 18,
  UDPWRAP: 19,
  UDPSENDWRAP: 20,
  WRITEWRAP: 21,
  ZLIB: 22 }
```

##### uid

The `uid` is a unique integer that identifies each handle object. You can use
the `uid` to store information related to the handle object, by using it as
a key for a shared `Map` object.

As such the user could also store information on the `this` object, but this
may be unsafe since the user could accidentally overwrite an undocumented
property. The `this` object is also not available in the `destroy` hook, thus
the `uid` is generally the recommended choice.

##### parentUid

In some cases the handle was created from another handle object. In those
cases the `parentUid` argument is set to the uid of the creating handle object.
If there is no parent then it is just `null`.

The most common case is the TCP server. The TCP server itself is a `TCP` handle,
but when receiving new connection it creates another `TCP` handle that is
responsible for the new socket. It does this before emitting the `onconnection`
handle event, thus the asyncWrap hooks are called in the following order:

```javascript
init // TCP (socket)
pre // TCP (server)
post // TCP (server)
```

This means it is not possible to know in what handle context the new socket
handle was created using the `pre` and `post` hooks. However the
`parentUid` argument provides this information.

##### parentHandle

This is similar to parentUid but is the actual parent handle object.

##### didThrow

If the callback threw, but the process was allowed to continue due to either
`uncaughtException` or the `domain` module, then `didThrow` will be true.

## Example

A classic use case for AsyncWrap is to create a long-stack-trace tool.

```javascript
const asyncWrap = process.binding('async_wrap');

asyncWrap.setupHooks({init, pre, post, destroy});
asyncWrap.enable();

// global state variable, that contains the stack traces and the current uid
const stack = new Map();
stack.set(-1, '');

let currentUid = -1;

function init(uid, provider, parentUid, parentHandle) {
  // When a handle is created, collect the stack trace such that we later
  // can see what involved the handle constructor.
  const localStack = (new Error()).stack.split('\n').slice(1).join('\n');

  // Compute the full stack and store on the `Map` using the `uid` as key.
  const extraStack = stack.get(parentUid || currentUid);
  stack.set(uid, localStack + '\n' + extraStack);
}
function pre(uid) {
  // A callback is about to be called, update the `currentUid` such that
  // it is correct for when another handle is initialized or `getStack` is
  // called.
  currentUid = uid;
}
function post(uid, didThrow) {
  // At the time of writing there are some odd cases where there is no handle
  // context, this line prevents that from resulting in wrong stack trace. But
  // the stack trace will be shorter compared to what ideally should happen.
  currentUid = -1;
}

function destroy(uid) {
  // Once the handle is destroyed no other handle objects can be created with
  // this handle as its immediate context. Thus its associated stack can be
  // deleted.
  stack.delete(uid);
}

function getStack(message) {
  const localStack = new Error(message);
  return localStack.stack + '\n' + stack.get(currentUid);
}
module.exports = getStack;
```

Please note that this example is way simpler than what is required from a
complete long-stack-trace implementation.

## Things You Might Not Expect

* It is not obvious when a handle object is created. For example the TCP server
creates the `TCP` handle when `.listen` is called and it may perform an DNS
lookup before that.

* `console.log` is async and thus invokes AsyncWrap, thus using `console.log`
inside one of the hooks, creates an infinite recursion. Use `fs.syncWrite(1, msg)`
or `process._rawDebug(msg)` instead. The latter is a little nicer because it
uses `util.inspect`. On the other hand `fs.syncWrite` is a documented function.

* `process.nextTick` never creates a handle object. You will have to monkey patch
this.

* Timer functions (like `setTimeout`) shares a single `Timer` handle, thus you
will usually have to monkey patch those functions.

* Promises are also not tracked by AsyncWrap. The `Promise` constructor can also
be monkey patched, but unfortunately it is quite difficult. See
[async-listener](https://github.com/othiym23/async-listener/blob/14d01b2b82817fff9993f065587f9009f3d2126b/index.js#L257L407)
for how to do it.

## Resources

* Status overview of AsyncWrap: https://github.com/nodejs/tracing-wg/issues/29
* An intro to AsyncWrap by Trevor Norris: http://blog.trevnorris.com/2015/02/asyncwrap-tutorial-introduction.html (outdated)
* Slides from a local talk Andreas Madsen did on AsyncWrap:
https://github.com/AndreasMadsen/talk-async-wrap (outdated)
* Complete (hopefully) long-stack-trace module that uses AsyncWrap: https://github.com/AndreasMadsen/trace
* Visualization tool for AsyncWrap: https://github.com/AndreasMadsen/dprof

----

If you have more info to provide, please send us a pull request!
