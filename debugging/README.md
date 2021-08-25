## Debugging API
- [Chrome Remote Debugging Protocol](https://chromedevtools.github.io/debugger-protocol-viewer/v8/) (alias V8 Inspector)
- [V8 Debugging Protocol](https://github.com/v8/v8/wiki/Debugging-Protocol/a4990503824b4e37d1d5f6d95800534c52262710) (deprecated in favor of V8 Inspector)

Depending on the Node version you are using, you can use either one of the above API : 

#### Node >= 8

Starting from Node 8, the core provide the `inspector` module that allow to communicate with V8 via the [CrDP protocol](https://chromedevtools.github.io/debugger-protocol-viewer/v8/).
You can find the latest node documentation [here](https://github.com/nodejs/node/blob/master/doc/api/inspector.md)
A guide made by the node foundation is also available [here](https://nodejs.org/en/docs/guides/debugging-getting-started/)


#### Node >= 6.3.0 && Node < 8

Node 6.3.0 has seen the new V8 Inspector [implemented](https://github.com/nodejs/node/pull/6792) but only via the `--inspect` and `--inspect-brk` flag. You can find more information in the node documentation [here](https://nodejs.org/docs/latest-v6.x/api/debugger.html#debugger_v8_inspector_integration_for_node_js)

Note that the old V8 Debugging Protocol was available and used as the main debugger protocol as this time (except for the new flags of course), see below for more informations

#### Node < 6.3.0

Node relied on V8's internal Debug API and associated commands and events. This Debug API was published at [v8/include/v8-debug.h](https://github.com/v8/v8/blob/5.4-lkgr/include/v8-debug.h) and in code in [here](https://github.com/v8/v8/blob/5.4-lkgr/src/debug/debug.js#L2333).
Note that this API has been deprecated then later removed, so the links above are in the **V8 5.4 branch**.

## Debugging Tools  
Name | Sponsor | Protocol available | State |
-----|--------|------|------|
[Node CLI Debugger][] | Node Foundation | Both | Up to date
[Chrome DevTools][] | Google | V8 inspector | Up to date
[Visual Studio Code][] | Microsoft | Both | Up to date
[JetBrains WebStorm][] | JetBrains | Both | Up to date
[node-inspector][] | StrongLoop | V8 Debugging Protocol | Deprecated
[Theseus][] | Adobe Research | V8 Debugging Protocol | Not Maintained

[node-inspector]: https://github.com/node-inspector/node-inspector 
[JetBrains WebStorm]: https://www.jetbrains.com/help/webstorm/2016.1/running-and-debugging-node-js.html
[Visual Studio Code]: https://github.com/Microsoft/vscode
[Node CLI Debugger]: https://nodejs.org/api/debugger.html
[Chrome DevTools]: https://github.com/ChromeDevTools/devtools-frontend
[Theseus]: https://github.com/adobe-research/theseus


## Blackbox

Blackbox is a popular term that allows debugging user-land code without touching in their internals.

For futher reference in nodejs debugging follow [these instructions](https://nodejs.org/en/docs/guides/debugging-getting-started/).

### Enabling Blackbox through UI

See the [ignore-script section](https://developer.chrome.com/docs/devtools/javascript/reference/#ignore-list) at Google Chrome reference

### Enabling Blackbox through CLI

Let's create a file called `example-blackbox.js` to simulate a blackbox usage

```js
module.exports = {
  doSomethingAsync: async () => {
    debugger
    console.log('Async done')
  }
}
```

Then we have our `index.js` file

```js
const { doSomethingAsync } = require('./example-blackbox')
async function main() {
  await doSomethingAsync()
  console.log('Done!')
}

main()
```

Start debugging using CLI:

```console
node inspect index.js
```

and enable the blackbox by calling [`Debugger.setBlackBoxPatterns`](https://chromedevtools.github.io/devtools-protocol/tot/Debugger/#method-setBlackboxPatterns) and passing the ignore regex, in our case a simple `example-blackbox.js`:

```console
debug> Debugger.setBlackboxPatterns({ patterns: ['example-blackbox.js'] })
```

Afterall, perform a `continue` and see the script be running without stopping into `example-blackbox.js` function.

```console
debug> c
< Async done
<
< Done!
<
< Waiting for the debugger to disconnect...
```

### Additional information

The `blackbox` term was replaced by `ignore-list` at Google Chrome Dev Tools in latest versions.
