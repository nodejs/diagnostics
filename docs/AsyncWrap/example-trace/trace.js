'use strict';

const asyncWrap = process.binding('async_wrap');

asyncWrap.setupHooks(init, before, after);
asyncWrap.enable();

// global state variable, that contains the current stack trace
let currentStack = '';

function init(provider, uid, parent) {
  // When a handle is created, collect the stack trace such that we later
  // can see what involved the handle constructor.
  const localStack = (new Error()).stack.split('\n').slice(1).join('\n');

  // Compute the full stack and store it as a property on the handle object,
  // such that it can be fetched later.
  const extraStack = parent ? parent._full_init_stack : currentStack;
  this._full_init_stack = localStack + '\n' + extraStack;
}
function before() {
  // A callback is about to be called, update the `currentStack` such that
  // it is correct for when another handle is initialized or `getStack` is
  // called.
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
