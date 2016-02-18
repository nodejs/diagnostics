'use strict';

const asyncWrap = process.binding('async_wrap');

asyncWrap.setupHooks(init, before, after, destroy);
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
function before(uid) {
  // A callback is about to be called, update the `currentUid` such that
  // it is correct for when another handle is initialized or `getStack` is
  // called.
  currentUid = uid;
}
function after(uid) {
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
