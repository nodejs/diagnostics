## Debugging API and Protocol

### Inspector Protocol

Support for Chrome's [Inspector Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/) (aka Chrome Debugging Protocol) in Node.js is under evaluation as per these issues:

- [[#2546](https://github.com/nodejs/node/issues/2546)]
- [[#6792](https://github.com/nodejs/node/pull/6792)]
- [[#7072](https://github.com/nodejs/node/issues/7072)]

#### Resources

More background is available here. Please add to this list through PRs.

- [Protocol Docs](https://chromedevtools.github.com.io/debugger-protocol-viewer/)
- [Google's Help Docs](https://developer.chrome.com/devtools/docs/debugger-protocol)
- [RemoteDebug.org's list of specs](http://remotedebug.org/specifications/)
- The [cyrus-and/chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface) library provides a JS proxy for CrDP.

#### Tools and Compatibility

The following tools support the following domains from the Inspector Protocol:

Domain // Tool  | CLI | Chrome DevTools | Firefox DevTools | VS Code | WebStorm
----------------|-----|-----------------|------------------|---------|---------
Console | | x | | | 
Debugger | | x | | x | 
FileSystem | | x | | | 
HeapProfiler | | x | | | 
Inspector | | x | | | 
Network | | x | | | 
Profiler | | x | | | 
Runtime | | x | | | 
Tracing | | x | | | 
Worker | | x | | | 

And the following runtimes support the following domains:

Domain // Runtime | V8 | SpiderMonkey | Chakra | Duktape
------------------|----|--------------|--------|--------
Console | | | | 
Debugger | x | | | 
FileSystem | | | | 
HeapProfiler | x | | | 
Inspector | | | | 
Network | | | | 
Profiler | x | | | 
Runtime | x | | | 
Tracing | | | | 
Worker | | | | 

[Console]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Console/
[Debugger]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Debugger/
[FileSystem]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/FileSystem/
[HeapProfiler]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/HeapProfiler/
[Insepctor]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Inspector/
[Network]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Network/
[Profiler]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Profiler/
[Runtime]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Runtime/
[Tracing]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Tracing/
[Worker]: https://chromedevtools.github.io/debugger-protocol-viewer/1-1/Worker/

### Legacy V8 Protocol

Node.js also still supports V8's original, now deprecated [Debugging Protocol](https://github.com/v8/v8/wiki/Debugging-Protocol) and API. The API is in [v8/include/v8-debug.h](https://github.com/v8/v8/blob/master/include/v8-debug.h), and the message protocol is documented in prose in [the V8 wiki](https://github.com/v8/v8/wiki/Debugging-Protocol) and in code in [v8/src/debug/debug.js#L2341-2372](https://github.com/v8/v8/blob/master/src/debug/debug.js#L2341-L2372). 

Node also provides an agent [node/src/debug-agent.h](https://github.com/blob/master/src/debug-agent.h) which relays requests, responses, and events through a TCP socket, and a command-line debugger [node/lib/_debugger.js](https://github.com/blob/master/lib/_debugger.js).

## Node Tools

The following tools provide development-time diagnostics capabilities. Please add to this list through PRs.

- [CLI Debugger][]
- [node-inspector][]
- [JetBrains WebStorm][]
- [Visual Studio Code][]
- [Chrome DevTools][]
- [Theseus][]

[CLI Debugger]: https://nodejs.org/api/debugger.html
[node-inspector]: https://github.com/node-inspector/node-inspector 
[JetBrains WebStorm]: https://www.jetbrains.com/help/webstorm/2016.1/running-and-debugging-node-js.html
[Visual Studio Code]: https://github.com/Microsoft/vscode
[Chrome DevTools]: https://github.com/ChromeDevTools/devtools-frontend
[Theseus]: https://github.com/adobe-research/theseus

