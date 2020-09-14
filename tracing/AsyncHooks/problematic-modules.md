# User-land modules breaking async continuity

This is a list of user-land Node modules that breaks async continuity.
The list is not meant to be complete, but feel free to make a PR if you
feel anything is missing.

Over time we'll hopefully work together with the module owners to
implement the [Async Hooks Embedder
API](https://nodejs.org/api/async_hooks.html#async_hooks_javascript_embedder_api)
so that these modules no longer needs to be monkey patched. But even if
the module do implement the Embedder API, we'll probably want to keep it
in this list as Async Hooks isn't yet backported to all currently
supported major Node.js versions.

Module | Embedder API | Note
-------|--------------|------
[bluebird](https://github.com/petkaantonov/bluebird) | [PR#1472](https://github.com/petkaantonov/bluebird/pull/1472) |
[generic-pool](https://github.com/coopernurse/node-pool) | No | Used by a lot of database modules like for instance "pg"
[mongoose](https://github.com/Automattic/mongoose/) | [#5929](https://github.com/Automattic/mongoose/issues/5929) | Most popular MongoDB ORM/ODM that implements its own user-land queueing.
[graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions/blob/26ed503566ecfab086e7530f0daf12b60ee3049c/src/pubsub-async-iterator.ts) | No | De-facto standard for working with GraphQL subscriptions. Custom queueing via an async iterator written in TypeScript and compiled down to ES5.
[ioredis](https://github.com/luin/ioredis) | No | The only commonly used redis client with support for sentinels
