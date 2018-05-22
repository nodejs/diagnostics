this doc needs editing!

# JavaScript Asynchronous Context

## Overview
This document defines a model for "JavaScript Asynchronous Context".  This model includes terminology & definitions, programmatic "types" that result from these definitions, and relations between these types.  These utlimately form an API that expose the model, and allow us to reason about and solve common JavaScript "async code execution" problems.

We frame the problem in two parts.  First is a directed acyclic graph we call the "Async Call Graph" that accurately models the relationships of asynchronous code execution.  With a well-defined, common problems can be defined in terms of traversals over this graph.

## Principles
We strive to adhere to some basic principles in this document.  We believe that adhereing to these principles will ensure simplicity and help guide the model.

1.  Definitions should flow from well-understood, well-defined constructs in synchronous programming.
2.  Definitions should be independent of the host environment (e.g., Node.js, the browser).
3.  Constructs should enhance JavaScript programmers' understanding of async code flow & async boundaries.
4.  Model should allow for simplified reasoning about async code execution.
5.  Resulting Data Structures and APIs and should support solving common "async understanding" use cases (e.g., long stack traces, continuation local storage, visualizations, async error propogation, user-space queueing...).
6.  It should be straightforward to implement this model at any API layer (i.e., VM, host or "monkey-patched").

## A Simple Example
We'll start with a simple example that is not controversial:

```javascript
function x(s) { ... }
function myLoggingAPI(s) { x(s); }

function f1() {
    let i = 0;
    let interval = setInterval(function f2() {
        if ( i < 2) {
            myLoggingAPI(`i is ${i}`);
            ++i;
        } else {
            clearInterval(interval);
        }
    }, 1000);
}

f1();
```

Most JS programmers should have an intuitive understanding of what happens when the code above is executed.  We'll build off of this example going forward.  Implicit in this example is an undefined concept of "async context".  We'll build stronger definitions later on, but for now, we'll use "async context" to refer to JS programmers' colloquial understanding of asynchonrous function calls.

There are three interesting constructs in the above example:
  - First, the function `f2` is a function created in one "async context" and passed through an API.  When `f2` is invoked later, it is a "logical continuation" of the "context" in which it was created.
  - Second, the function `setInterval` takes a function as a parameter, and invokes that function later during program execution.  Note that when this parameter is invoked, the call to `setInterval` has completed - i.e., `setInterval` is not on the stack when `f2` is invoked.
  - Third, `f2` is invoked precisely twice.  These two invocations are distinct.

Let's give these three concepts some names and some initial definitions:

   - A **Continuation** is a JavaScript function that retains a link to the "async context" in which it is created.  Upon invocation, it will establish a new "async context", and will provide a "logical continuation" of the "async context" in which it was created.  In the example above, `f2` is a **Continuation**.
   - A **Continuation Point** - is a function that accepts a **Continuation** as a parameter.  This logically represents an async boundary; functions passed to a **Continuation Point** are invoked at some later point in time.  In our example above, `setInterval` is a **Continuation Point**.
  -  A **Continuation Invocation** is a specific invocation of a `continuation`; more precisely, a **Continuation Invocation** is the *period of time* where a `continuation` frame is on the stack.  As soon as the continuation frame pops off the stack, then that **Continuation Invocation** is completed. Note that a `continuation` instance can have more than one **Continuation Invocation** instances associated with it.  In our code sample above, there are precisely two **Continuation Invocation** instances associated with the `continuation` f2.

## A lower-level view

At runtime we can view the example above as two distinct call stacks at specific points in program execution.  These look something like this:

```
---------------------------
|   setInterval()         |
---------------------------
|   function f1()         |
---------------------------
|    ...host code...      |
---------------------------
|    ...host code...      |
---------------------------
|    host function A()    |
---------------------------
```

and

```
---------------------------
| function x()            |
---------------------------
| function myLoggingAPI() |
---------------------------
|    function f2()        |
---------------------------
|    ...host code...      |
---------------------------
|    host function B()     |
---------------------------
```

Since we previously made a distinction between a regular JavaScript function and a `continuation`, let's make the same distinction in our pictures of the callstacks:

```
---------------------------
|   setInterval()         |
---------------------------
|   function f1()         |
---------------------------
|    ...host code...      |
---------------------------
|    ...host code...      |
===================================
|    Host Continuation A()        |
===================================
```

and

```
---------------------------
| function x()            |
---------------------------
| function myLoggingAPI() |
===================================
|    continuation f2()            |
===================================
|    ...host code...      |
---------------------------
|    ...host code...      |
===================================
|   Host Continuation B()         |
===================================
```

Some notes about the pictures above:
  - We've introduced a "Root Continuation" as the bottom frame.  This  illustrates a basic assumption that all code is executing in the context of a `Continuation Invocation`.
  - Multiple `continuations` can be on the stack at the same time, which result in mulitple `Continuation Invocations`.

Here, we've updated our pictures of runtime callstacks, giving  labels to the `Continuation Invocation` instances:

```
---------------------------                    -----------
|   setInterval()         |                              |
---------------------------                              |
|   function f1()         |                              |
---------------------------                              \/
|    ...host code...      |                  Continuation Invocation ci1
---------------------------                              /\
|    ...host code...      |                              |
===================================                      |
|    Host Continuation A()        |                      |
===================================            -----------
```

and

```
---------------------------                    -----------
| function x()            |                              |
---------------------------                              \/
| function myLoggingAPI() |                  Continuation Invocation ci3
===================================                      /\
|    Continuation f2()            |                      |
===================================            -----------
|    ...host code...      |                              |
---------------------------                              \/
|    ...host code...      |                   Continuation Invocation ci2
===================================                      /\
|   Host Continuation B()         |                      |
===================================            -----------
```

## Continuation Invocation States
A `Continuation Invocation` can be in a number of states:
  - `pending` - A  `Continuation Invocation` instance has been created, but is not yet executing, nor is it ready to execute.
  - `cancelled` - A `Continuation Invocation` was abandoned.
  - `ready` - A `Continuation Invocation` is ready to execute, but is not yet executing
  - `executing` - `Continuation Invocation` is currently executing on the stack
  - `paused` - A `Continuation Invocation` has started execution, but is not currently on the stack.  E.g., for generator functions. // todo - is this necessary for async/await & generators.  what is tc39 terminology?
  - `completed` - A `Continuation Invocation` instance is completed.  However, the instance, during execution, may have called other `Continuation Points` and those `Continuation Invocations` are still pending execution.
  - `collectable` - A `Continuation Invocation` instance is completed and all child-spawned continuations are in the collectable state.

## Context and Current Context
For any given stack frame, we define it's  **Context** as the `Continuation Invocation` defined by the first `Continuation` below the given frame on the stack.  For example, in the previous diagram, the stack frame of `function x()` has a `Current Context` of `ci3`,
and the stack frame of  `... host code...` has a "`Current Context` of `ci2`.  We define the **Current Context** as the `Context` of the top frame on the stack.

## Link Context
We define the **Link Context** of a `Continuation` to be the `Current Context` when a `Continuation` is constructed.   In the example from above, the `continuation` `f2` has a `link context` pointing to `Continuation Invocation` `ci1`.  Generally, this is the `Current Context` when a `Continuation` is passed into a `Continuation Point`.

## Ready Context
We define the **Ready Context** to be the `Current Context` when a `Continuation Invocation` changes state from `pending` to `ready`.  This is useful for promises, where we want to understand the series of `Continuation Invocation` instances on a promise chain.  When a promise is resolved or rejected, the promise implementation must modify the state of `Continuation Invocations` associated with subsequent promises on the chain. Consider the following example:

```javascript
const p = new Promise((resolve, reject) => {
    setTimeout(function f1() {
       p.then(function f2() {
             myLoggingAPI('hello');
         });
     }, 1000);

     setTimeout(function f3() {
         resolve(true);
     }, 2000)
});
```

In this code example, we have:
  - `setTimeout` and `Promise.then` as our `continuation points`.
  - four `continuations` - `f1`, `f2` and `f3`, plus the "root continuation" that
    the initial code is executing in.
  - four `Continuation Invocations`.

For non-promise-based APIs, the `Ready Context` is the same as the `Link Context`.

In our example above, the `Continuation Invocation` associated with `continuation f2()` has as its `Ready Context`, a reference to the `Continuation Invocation` associated with `continuation f3()`.

// TODO:  add stacks w/ `continuation invocations` to illustrate `ready context`.

## Crisper Definitions

  - **Continuation Point** - a function that accepts a `Continuation` as a parameter.  This logically represents an async boundary; functions passed to a `Continuation Point` are invoked at some later point in time.

  - **Continuation** -  a function that, when invoked, creates a new `Continuation Invocation` instance, and maintains references to other related `Continuation Invocation` instances. Using TypeScript for descriptive purposes, a `Continuation` has the following shape:

    ```TypeScript
    /**
     * maker interface for a generic function type
     */
     interface IFunction {
        (...args: any[]): any
    }

    interface Continuation extends IFunction{
        linkingContext: ContinuationInvocation;
    }
    ```

  - **Continuation Invocation** - a specific invocation of a `Continuation`. A `Continuation Invocation` has the following shape in TypeScript:

    ```TypeScript
    interface ContinuationInvocation {
        invocationID:  number;
        continuation: Continuation;
        readyContext: ContinuationInvocation;
    }
    ```

  - **Async Call Graph** - A directed acyclic graph comprised of `Continuations` and `Continuation Invocations` instances as nodes, and the `linkingContext` and `readyContext` references as edges. // TODO draw some pictures of the DAG

## Where are the Continuation Points?
The `Continuation Points` are defined by convention by the host environment.  The host needs logic to determine if a given argument is a function or a continuation, and if not yet a continuation, needs to "continuify" the parameter.  The host is also responsible for "pinning" any `Continuation` instances to prevent premature garbage collection.

## A User-Space API
Here is a user-space API that provides runtime access to the concepts defined above.  At any given time, there is a "current" `Continuation Invocation`, precisely defined as the `Continatuation Invocation` associated with the `Continuation` nearest to the top of the stack.  (Note: there can be more than one `Continuation` on the stack at any given time, for example, in "user space queueing" examples).

```typescript
    interface ContinuationInvocation {
        invocationID:  number;
        continuation: Continuation
        readyContext: ContinuationInvocation;
        static GetCurrent() : ContinuationInvocation;
    }

    interface Continuation {
        linkingContext: ContinuationInvocation;
    }
```

## An Event Stream
For some post-mortem analysis scenarios, an event stream of async context events is useful.  Such an event stream can be used to define the graph.  The event stream is comprised of the following events:

  - **invocationCreated** - emitted when a `Continuation Invocation` instance is created.
  - **executeBegin** - emitted when a  `Continuation Invocation` instance transitions to the `executing` state.
  - **executeEnd** - emitted when a  `Continuation Invocation` instance transitions to the `completed` state.
  - **link** - emitted when a new `Continuation` instance is created.
  - **ready** - emitted when a `Continuation Invocation` instance transitions to the `ready` state.

The events above are JSON events and their schema is illustrated in the following example:

```json
{"event":"invocationCreated","invocationID":1, "continuationId":0}
{"event":"executeBegin","invocationID":1}
{"event":"link","continuationID":1}
{"event":"invocationCreated", "invocationID":2, "continuationId":3}
{"event":"ready","invocationId":2}
{"event":"executeEnd", "invocationID":1}
```

// TODO: can this be simplified to support  state-change events on the continuation invocation
// TODO: add better examples here.

## Advanced Examples

### Javascript Generators
Javascript Generators are functions that support "yield" and "resume" operations. When a Generator "yields", its next instruction will be saved and control will return to the calling function.  When a Generator "resumes", the generator will start executiong at the previously saved instruction pointer.

#### A simple generator

Consider the following example:

```javascript
function* idMaker() {
    var index = 0;
    while (true) {
        console.log(new Error().stack);
        yield index++;
    }
}


function f() {
    var gen = idMaker();

    function log1() {
        console.log(gen.next().value); // point 0
    }

    function log2() {
        console.log(gen.next().value); // point 1
    }

    Promise.resolve(true)
        .then(function then1() {
            log1();
        }).then(function then2() {
            log2();
        });
}

f();
```

This example will result in the following stack frame when f() is invoked:

```
---------------------------                   -----------
| Promise.then()          |                              |
---------------------------                              \/
| function f()            |                  Continuation Invocation ci1
---------------------------                              |
|    ...host code...      |                              |
---------------------------                              |
|    ...host code...      |                              |
===================================                      |
|   Host Continuation A()         |                      |
===================================            -----------
```

And the example will result in the following stack frames at points `// point 0` and `//point 1` respectively:

```
---------------------------                   -----------
| function idMaker()      |                              |
---------------------------                              |
| function idMaker.next() |                              |
---------------------------                              \/
| function log1()         |                  Continuation Invocation ci3
===================================                      /\
|    Continuation then1()         |                      |
===================================            -----------
|    ...host code...      |                              |
---------------------------                              \/
|    ...host code...      |                   Continuation Invocation ci2
===================================                      /\
|   Host Continuation B()         |                      |
===================================            -----------
```

and

```
---------------------------                   -----------
| function idMaker()      |                              |
---------------------------                              |
| function idMaker.next() |                              |
---------------------------                              \/
| function log2()         |                  Continuation Invocation ci5
===================================                      /\
|    Continuation then2()         |                      |
===================================            -----------
|    ...host code...      |                              |
---------------------------                              \/
|    ...host code...      |                   Continuation Invocation ci4
===================================                      /\
|   Host Continuation B()         |                      |
===================================            -----------
```

Note the following:
  - `then1` and `then2` are `Continuations`.
  - `then1` and `then2` have the same `linking context` of `ci1`.
  -  when invoked, `then1` and `then2` are distinct `continuation invocations`, yet they remain visitiable via their `linking context` edges in the DAG.
  - `continuation invocation` `ci5` has its `ready context` value of `ci4`.

#### Using Continuations for generator functions
It should be theoretically possible to define a generator function as a `Continuation`. In such a situation, each resume of the of the generator function will resume the same context. This follows from previous definitions.

### Javascript Async Functions
Similiar to Generators, async functions can "yield" and "resume" their execution, however async functions involve implicit Promise construction, both when an async function is invoked, and when the await keyword is used inside an async function.

To illustrate behavior when async/await syntax is used, we'll take a simple example and then deconstruct it to it's promise-based code.  From the promise-based code, it should be more clear as to what the `Current Context` values are at various points in time.

This simple example with async/await:

```javascript
async function g() {
    return 'g() was called';  // point 1
}

async function f() {
    console.log('f() before g()');  // point 0
    let r = await g();
    console.log(`f() after g(), result is "${r}"`);  // point 2
}

f();
```

Turns into this de-sugar'd example.  Note that we tried to honor explicit spec language, notably in sections [25.7.5.1 (AsyncFunctionStart)](https://tc39.github.io/ecma262/#sec-async-functions-abstract-operations-async-function-start) and  [6.2.3.1 (Await)](https://tc39.github.io/ecma262/#await).

```javascript
function g() {
    return Promise.resolve('g() was called');  // point 1
}

function f() {
    return new Promise((resolve1, reject1) => {

        console.log('f() before g()');  // point 0

        // call the async function
        var result = g();

        // create a new promise, resolving w/ return value from the async function
        var p1 = new Promise((resolve2, reject2) => {
            resolve2(result);
        });

        // call then on the new promise, where onResolved will resume execution after
        p1.then(
            function onResolvedP1(r) {
                // steps fulfiled
                console.log(`f() after g(), result is "${r}"`);  // point 2
            },
            function onRejectedP1() {
                // steps rejected
            });

        resolve1(p1);
    });
}

f();
```

Let's look at the callstacks that occur, first for the points labeled `// point 0` and `// point 1,` and then for the point labeled `// point 2`:

```
-----------------------------                   -----------
|  new Promise() // point-0 |                              |
-----------------------------                              |
|  function g()             |                              |
-----------------------------                              |
|  new Promise() // point-0 |                              |
-----------------------------                              \/
| function f()              |                  Continuation Invocation ci1
-----------------------------                              |
|    ...host code...        |                              |
-----------------------------                              |
|    ...host code...        |                              |
===================================                        |
|   Host Continuation A()         |                        |
===================================            -------------
```

```
===================================            -------------
|                                 |                         |
|                                 |                         \/
| Continuation onResolvedP1()     |           Continuation Invocation ci3
|                                 |                         /\
|                                 |                         |
===================================            --------------
|    ...host code...      |                                 |
---------------------------                                \/
|    ...host code...      |                   Continuation Invocation ci2
===================================                        /\
|   Host Continuation B()         |                        |
===================================            -------------
```

Note the following:
  - `onResolvedP1` and `onRejectedP1` are `Continuations`.
  - `p1.then` is called in continuation c1, thus `onResolvedP1` and `onRejectedP1` have a linking context value of `ci1`.
  -  when invoked, `then1` and `then2` are distinct `continuation invocations`, yet they remain visitable via their `linking context` edges in the DAG.

### Async Generators
TBD

## Applications
Most applications can be thought of traversal of a specific path of edges through the `Async Call Graph`.  We give some trivial examples below.

### Continuation Local Storage
```typescript
/**
*  A simple Continuation Local Storage construction that utilizes the
*  Async Call Graph.  For setting values, we set a property at the current
*  ContinuationInvocation.  For getting values, we follow the "linking context"
*  path from the current "Continuation Invocation" to the
 *  root of the graph.  At each node, we check for the presence of the key we're looking for.
*/
class ContinuationLocalStorage {
    static set(key: string, value: any) {
        let curr: ContinuationInvocation = ContinuationInvocation.GetCurrent();
        let props  = curr['CLS'];
        if (!props) {
             props = {};
             curr['CLS'] = props;
        }
        props[key] = value;
    }

    static get(key: string): any {
        let curr: ContinuationInvocation = ContinuationInvocation.GetCurrent();
        while (curr) {
            let props  = curr['CLS'];
            if (props && key in props) {
                return props[key];
            }
            curr = curr.continuation.linkingContext;
        }
        return undefined;
    }
}
```

### Async Error Propogation
```typescript
/**
*  simple error propagation across async boundaries, following the "linking context"
*/
class AsyncErrorPropogationStrategy {
    static AsyncThrow(err: Error) {
        let curr: ContinuationInvocation = ContinuationInvocation.GetCurrent();
        while (curr) {
          let handler  = curr['AsyncErrorHandler'];
          if (handler) {
              handler(t);
              return;
          }
          curr = curr.continuation.linkingContext;
    }
}
```

### Long Call Stacks
A Long Call Stacks is a list of call stacks.  The entries in the list are captured at various times deemed interesting by the host environment.  Given that the Continuation implementation will be aware of when various events occur (e.g., `Continuation` instance construction), the implementation will be aware of when stacks need captured, and will expose APIs to toggle stack capture on & off.

### Step-Into Async
A debugger wants to perform a "step-into" action across an async boundary. Consider the following code:

```javascript
processHttpRequest(req, res) {
    // currently debugger is paused on doSomethingAsync below
    doSomethingAsync(function c() {
        console.log('I want to break here');
    });
}
```

A trivial approach is for the IDE to simply set a breakpoint inside the continuation.  However, that breakpoint may hit for a different http request than the one currently under inspection.  To address this, the debugger client, when responding to a "step into async" gesture, will execute the followign code

```typescript
const location = ...; // location of where to set the conditional breakpoint
const currentContext = debugger.Evaluate(`ContinuationInvocation.GetCurrent()`);
const condition =  `ContinuationInvocation.GetCurrent().continuation.linkingContext.invocationID == ${currentContext.invocationID}`;
debugger.setConditionalBreakpoint(location, condition);
debugger.continue();
```

### Step-back Async
A "step-back" debugger wants to step backwards across an async boundary.  Consider the following code:

```javascript
processHttpRequest(req, res) {
    doSomethingAsync(function c() {
        // currently debugger is paused on console.log below
        console.log('');
    });
}
```

A trivial approach is for the IDE to simply set a breakpoint outside of the scope of the current continuation.  However, that breakpoint may hit for a different http request than the one currently under inspection.  To address this, the debugger client, when responding to a "step back async" gesture, will execute the followign code

```typescript
const location = ...; // location of where to set the conditional breakpoint
const currentContext = debugger.Evaluate(`ContinuationInvocation.GetCurrent()`);
const condition =  `ContinuationInvocation.GetCurrent().invocationID == ${currentContext.continuation.linkingContext.invocationID}`;
debugger.setConditionalBreakpoint(location, condition);
debugger.reverseContinue();
```

## Integration into the ECMAScript Specification

We believe this model fits nicely into the existing ecma-script specificaiton with minimal modifications.  Waving hands, this amounts to:

1.  Expand the definition of the `Execution Context` to account for a `Continuation Context` subclass, which has internal slots indicating the current ID, `ready-context` ID, and the `Continuation` which invoked it.   This directly maps to our `Continuation Invocation` concept.
1.  Expand the spec to include a definitions and abstract operations for a `Continuation` as we've described here.  A `Continuation`, when invoked, will establish a new `Continuation Context`.
1.  Expand the spec's defiinitions of `PromiseReactionJob` to account for setting the approiate `ready-context` on teh resulting `Continuation Context`.
