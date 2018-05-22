
# JavaScript Asynchronous Context

## Overview
This document defines "JavaScript Asynchronous Context".

## Principles

1.  Definitions should flow from well-understood, well-defined constructs in synchronous programming.
2.  Definitions should be independent of the host environment (e.g., Node.js, the browser).
3.  Constructs should enhance JavaScript programmers' understanding of async code flow & async boundaries.
4.  Resulting Data Structures and APIs and should support solving common "async understanding" use cases (e.g., long stack traces, continuation local storage, visualizations, async error propogation, user-space queueing...)

## A Simple Example
We'll start with a simple example that is not controversial. Most JS programmers should have an intuitive understanding of where the async boundaries are in this code.  We'll build off of this example going forward.

```javascript
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
```

There are two interesting constructs in the above example:
  -  First, the function `f2` is a function created in one "async context" and passed through an API.  When `f2` is invoked later, it is a "logical continuation" of the "context" in which it was created.
  - Second, the function `setInterval` takes a function as a parameter, and invokes that function later during program execution, after `setInterval` has completed.

Let's give these two concepts some names and some loose definitions:

   -  A `Continuation` is a JavaScript function.  A `Continuation` retains a link to the "async context" in which it is created.  Upon invocation, it will "logically continue" the "async context" in which it was created.

   - A `Continuation Point` - is a function that accepts a `Continuation` as a parameter.  This logically represents an async boundary; functions passed to a `Continuation Point` are invoked at some later point in time.

## A lower-level view

At a lower-level, at runtime we can view the example above as two distinct call stacks, which at specific points in program execution look something like this:

```
---------------------------
|   setTimeout()          |
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

Since we previously made a distinction between a regular JavaScript function and a "continuation", let's make the same distinction in our pictures of the callstacks:

```
--------------------------- 
|   setTimeout()          | 
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


Lets more formally define an `Continuation Invocation` as a specific invocation of a `continuation`; more precisely, a `Continuation Invocation` is the *period of time* where a `continuation` frame is on the stack.  As soon as the continuation frame pops off the stack, then that `Continuation Invocation` is completed.

Note the following:
  -  a `continuation` instance can have more than one `Continuation Invocation` instance associated with it.  For example, given our initial code sample with the call to `setInterval`, there will be precisely two `Continuation Invocation` instances associated with the `continuation` f2. 
  -  in the pictures above, we've introduced a "Root Continuation" as the bottom frame.  This  illustrates a basic assumption that all code is executing in the context of a `Continuation Invocation`.  
  - Multiple continuations can be in the stack.  For any given stack frame, the `current context` is the first `Continuation Invocation` below the given frame on the stack.


We've updated our pictures of runtime callstacks with labels of the `Continuation Invocations`:

```
---------------------------                    -----------                            
|   setTimeout()          |                              |
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


## Link Context
We define the `Link Context` `link-c` of a `Continuation` `c` as a pointer from `c` to the `Continuation Invocation` instance where `c` was constructed.  In the example from above, the `continuation` `f2` has a `link context` pointing to `Continuation Invocation` `ci1`.

## Causal Context
Consider the following example:

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

We define the `Causal Context` (//TODO, `Ready Context`, `Resolve Context`???) for a promise as a reference from a `Continuation Invocation` associated with a Promise.then call, to the `Continuation Invocation` in which the preceding promise in the chain was resolved. 

For non-promise-based APIs, the `Causal Context` is the same as the `Link Context` (//TODO or should it be null/undefined?)

In our example above, the `Continuation Invocation` associated with `continuation f2()` has as its `Causal Context`, a reference to the `Continuation Invocation` associated with `continuation f3()`.  

## Crisper Definitions

   - A `Continuation Point` - is a function that accepts a `Continuation` as a parameter.  This logically represents an async boundary; functions passed to a `Continuation Point` are invoked at some later point in time.

  - A `Continuation` is function that, when invoked, defines an `Continuation Invocation`, and maintains references to other related `Continuation Invocation` instances. Using TypeScript for descriptive purposes, a `Continuation` has the following shape:

    ```TypeScript
    interface Continuation {
        linkingContext: ContinuationInvocation;
    }
    ```

  -  `Continuation Invocation` - a specific invocation of a `Continuation`. A `Continuation Invocation` has the following shape in TypeScript:

    ```TypeScript
    interface ContinuationInvocation {
        invocationID:  number;
        continuation: Continuation
        propertyBag: {};
        causalContext: ContinuationInvocation;
    }
    ```

### State of a Contiuation Invocation
A `Continuation Invocation` can be in a number of states:
  - `pending` - A record of a `Continuation Invocation` instance has been created, but is not yet executing, nor is it ready to execute.
  - `ready` - A `Continuation Invocation` is ready to execute, but is not yet executing
  - `executing` - `Continuation Invocation` is currently executing on the stack
  - `paused` - // todo - is this necessary for async/await & generators.  what is tc39 terminology?
  - `completed` - A `Continuation Invocation` instance is completed.  However, the instance, during execution, may have called other `Continuation Points` and those `Continuation Invocations` are still pending execution.
  - `collectable` - A `Continuation Invocation` instance is completed and all child-spawned continuations are in the collectable state.

## Where are the Continuation Points?
The `Continuation Points` are defined by convention by the host environment.  The host, as part of this exercise needs logic to determine if a given argument is a function or a continuation, and if not yet a continuation, needs to "continuify" the parameter.  The host is also responsible for "pinning" any `Continuation` instances to prevent premature garbage collection.

## A User-Space API
Here is a user-space API that provides runtime access to the concepts defined above.  At any given time, there is a "current" `Continuation Invocation`, precisely defined as the `Continatuation Invocation` associated with the `Continuation` nearest to the top of the stack.  (Note: there can be more than one `Continuation` on the stack at any given time, for example, in the "user space queueing" examples).

```typescript
    interface ContinuationInvocation {
        invocationID:  number;
        continuation: Continuation
        causalContext: ContinuationInvocation;
        static GetCurrent() : ContinuationInvocation;
    }

    interface Continuation {
        linkingContext: ContinuationInvocation;
    }
```

## An Event Stream
For post-mortem analysis, an event stream of async context events is useful.
// TODO: pull event stream description/definition form mike-kaufman/async-context-definition

## Applications

### Continuation Local Storage
```typescript
/**
 *  A simple Continuation Local Storage construction built by traversing
 *  the "linking context" to look for properties associated at each 
 *  node in the graph
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

    static get(key: string):any {
        let curr: ContinuationInvocation = ContinuationInvocation.GetCurrent();
        while (curr) {
            let props  = curr['CLS'];
            if (props && key in props) {
                return props[key];
            }
            curr = curr.continuation.linkingContext;
        }
    }
}
```

### Async Error Propogation
```typescript
/**
 *  simple error propagation across async boundaries
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


