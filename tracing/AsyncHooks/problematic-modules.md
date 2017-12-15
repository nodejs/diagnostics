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
