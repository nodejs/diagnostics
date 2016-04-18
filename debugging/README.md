## Debugging API
- [Chrome Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/)
- [V8 Debugging Protocol](https://github.com/v8/v8/wiki/Debugging-Protocol)

Node currently relies on V8's internal Debug API and associated commands and events. The Debug API is published at [v8/include/v8-debug.h](https://github.com/v8/v8/blob/master/include/v8-debug.h), and the message protocol is documented in prose in [the V8 wiki](https://github.com/v8/v8/wiki/Debugging-Protocol) and in code in [v8/src/debug/debug.js#L2341-2372](https://github.com/v8/v8/blob/master/src/debug/debug.js#L2341-L2372). 

Node also provides an agent [node/src/debug-agent.h](https://github.com/blob/master/src/debug-agent.h) which relays requests, responses, and events through a TCP socket, and a command-line debugger [node/lib/_debugger.js](https://github.com/blob/master/lib/_debugger.js).

The Chrome/V8 team has deprecated the internal V8 API and command set and proposed replacing it with a subset of the Chrome Debugging Protocol (CrDP), see https://github.com/nodejs/node/issues/2546. CrDP is documented at [https://chromedevtools.github.io/debugger-protocol-viewer/]() and the backing GitHub repo.

The [cyrus-and/chrome-remote-interface](https://github.com/cyrus-and/chrome-remote-interface) library provides a JS proxy for CrDP.

## Step Debugging Tools  
Name | Sponsor
-----|--------
[node-inspector][] | StrongLoop
[JetBrains WebStorm][] | JetBrains
[Visual Studio Code][] | Microsoft
[Node CLI Debugger][] | Node Foundation
[Chrome DevTools][] | Google
[Theseus][] | Adobe Research

[node-inspector]: https://github.com/node-inspector/node-inspector 
[JetBrains WebStorm]: https://www.jetbrains.com/help/webstorm/2016.1/running-and-debugging-node-js.html
[Visual Studio Code]: https://github.com/Microsoft/vscode
[Node CLI Debugger]: https://nodejs.org/api/debugger.html
[Chrome DevTools]: https://github.com/ChromeDevTools/devtools-frontend
[Theseus]: https://github.com/adobe-research/theseus

