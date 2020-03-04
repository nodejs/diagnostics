# Using Chrome DevTools

[Chrome DevTools][] are very useful on development. It allows us to step into
our programs and get our hands on every slice of our code and values of its
local variables.

It is worth to know that inspectors are built to be production safe,
*as long as properly used*. Attaching to a production instance using Chrome
DevTools is discouraged.

Tools that are compatible with [Chrome DevTools Protocol][] can be used with
Node.js either.

## Launch Node.js with Inspector Enabled

On most platforms, Node.js can be launched with inspector enabled to allow
Chrome DevTools Protocol compatible tools like Chrome DevTools, and VSCode
debugger to attach to the process and inspecting variables or step into the
running code. The behavior have to be explicitly enabled by command line
option `--inspect` or `--inspect-brk`.

`inspect-brk` can block the process from executing user codes until an
inspector has attached to the process.

Node.js process that launched with inspection options will emit messages
telling us to which port we can use inspector tools to connect.

```bash
> node --inspect-brk src/work.js
Debugger listening on ws://127.0.0.1:9229/e9fa2087-65c6-4c10-b292-19f5d26f19a4
For help, see: https://nodejs.org/en/docs/inspector
```

If there is Chrome available to be used, open a page with URL
`chrome://inspect`, and there will show all the processes available to be
inspected.

For more Chrome DevTools Protocol compatible debugging tools, please refer
to the [Debugging API][] document for more information.

## Attach to the Running Process

As mentioned above, Node.js process will not open inspector port for listening
inspector client connections. What if we didn't realize that we might need
live debugging at first until then the problem occurs to us?

We can send a signal `SIGUSR1` to the running process and then the inspector
will start listening for new debugger connections.

Since signal `SIGUSR1` isn't available on Windows platform, this method doesn't
work on Windows.

If say we have a Node.js process running without any prediction of later
debugging intent.

```bash
> node src/work.js
# the process is doing something we don't expect...
```

We can first find out it's process id by CLI tools like `ps` in UNIX and send a
signal to it by CLI tools like `kill`.

```bash
> ps
PID TTY           TIME CMD
100 ttys002    0:04.02 /bin/bash
101 ttys002    3:27.99 node src/work.js  # this is the Node.js process.
102 ttys003    0:04.02 /bin/bash
> kill -SIGUSR1 101 # the pid field from `ps` outputs.
```

With the signal `SIGUSR1` sent to the process, there will be output from the
original shell of the process, which tells us to which port we can use the debugger
to connect.

```bash
Debugger listening on ws://127.0.0.1:9229/e9fa2087-65c6-4c10-b292-19f5d26f19a4
For help, see: https://nodejs.org/en/docs/inspector
```

Then we can use Chrome DevTools to attach to the process with methods mention
on previous section.

## Useful Links

- https://nodejs.org/api/process.html#process_signal_events

[Debugging API]: ../../../debugging/README.md
[Chrome DevTools]: https://developers.google.com/web/tools/chrome-devtools
[Chrome DevTools Protocol]: https://chromedevtools.github.io/devtools-protocol/
