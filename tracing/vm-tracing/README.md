## VM Native Tracing  
- See [v8-tracing.md](./v8-tracing.md) for technical details and crude implementation.

- All trace events are streamed through the same native component, which can in turn publish as appropriate to its subscribers.
    - Ideally should be possible to subscribe and receive events in JavaScript too.
- Requires implementation in Node.js, could learn from Chromium's implementation.
- For maximum utility, we should add trace events to Node's operations, especially async ones.
- Possible to handle other trace sources, such as OS (LTTng, ETW) alongside V8 trace source, since they all are event streams.

## Resources  
- [google/trace-viewer](https://github.com/google/trace-viewer) - `chrome://tracing` UI.
- [chromium/src/base/trace_event/](https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/)
- [Chromium Speed-Infra](https://www.chromium.org/developers/speed-infra)
- [Chromium Telemetry](https://catapult.gsrc.io/telemetry)
- [Trace Platform Explainer](https://docs.google.com/a/chromium.org/document/d/1l0N1B4L4D94andL1BY39Rs_yXU8ktJBrKbt9EvOb-Oc/edit)
- [Implementations for V8, D8, Chromium](https://docs.google.com/a/chromium.org/document/d/1_4LAnInOB8tM_DLjptWiszRwa4qwiSsDzMkO4tU-Qes/edit#)
- [Trace Event Format](https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit)

### Background  

@natduca in [nodejs/node#671_comment](https://github.com/nodejs/node/issues/671#issuecomment-73191538):

I thought I'd provide some notes on the direction we're taking in chrome and indirectly v8 around tracing & stack sampling. Since we both intersect at v8 and do run into some of the same "guhh i need a tracing api but its gotta be low overhead," I hope there's some useful context!

All our performance tooling in chrome is moving to be trace-based. Just recently (chrome 42 maybe?) we moved devtools to use tracing for its timeline and flamechart-style js profiling. And, we've for a long time had chrome://tracing built around trace data. The rough philosophy we use for tracing is described in https://docs.google.com/a/chromium.org/document/d/1l0N1B4L4D94andL1BY39Rs_yXU8ktJBrKbt9EvOb-Oc/edit

When we chromies say tracing, we mean a stream of events with timestamps. Beyond that, we've tried to embrace the notion that there is no One True Format To Rule Them All, but rather that the common clock ties everything together. As long as you can get a stream of traces from a few places, and have them share clocks or have clock alignment records, then the rest is a matter of postprocessing. Our UI (github.com/google/trace-viewer) for instance for chrome://tracing just merges kernel traces and userland traces after the fact.

This is what allows us to have traces that contain OS/platform level data from dtrace/lttng/perf and also userland event streams. For instance, if you're on a chromebook, you can get a trace that has our userland trace data but also stuff from the kernel. Or, on android, similarly, using https://github.com/johnmccutchan/adb_trace. In both cases, we leave the OS-specific tracing to the OS, and then let the UI or tools then figure out how to pull our event stream and the OS' stream themselves.

So, for most "day to day" tracing discussions, we solve all our stuff with c++ instrumentation. (Note, we consider sampling (e.g. interrupting every 1ms to get a stack trace) to be a userland activity.)

Our userland tracing api is called "trace_event". This is a two layer thing, and actually resembles some of the ideas thrown around on the hangout I think: we have a header file with basic tracing macros, then this header can be configured to call into an implementation via a narrow set of tracing control apis. https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/&q=trace_event&sq=package:chromium&type=cs ... though there are a few hundred trace apis that our code uses, it boils down to a half dozen c++ apis that one must implement in order to receive and process the events.

This api is low enough overhead that we have thousands of trace events per second compiled into our shipping chrome builds, in our hottest chrome codepaths. We're pretty happy with the overhead: when its off, the overhead is just a check of a global char* for truthiness, as in, a few instructions [depending on architecture etc]. When its on, each tracepoint takes about 20-50us to buffer on a lowend android phone, which has been enough to keep us happy. On real machines with power, I'm pretty sure the overhead is way way lower. Shrug.

In chrome, the actual trace api implementation is the trace_event_impl.cc, but in other libraries like Blink, Skia or V8, we copy the trace_event.h header file over and then apply a small tweak to it that causes it to trampoline back over to chrome via a local singleton. Then when we boot up one of those libraries in chrome, we set that singleton to point at chrome's tracing implementation. A key property of our architecture is that when a tracepoint is off, you don't have to hop from v8 to chrome in order to discover the trace isn't needed. I suspect this could let us trace things that are internal to v8 like promises without as much scary overhead discussions as we'd have if we were calling through an isolate-specific callback.

This is all a bit wordy, I realize. It may be easier to read in code how we're hooking v8 up to chrome tracing... We are literally in the middle of connecting v8 to this tracing system. There are codereviews linked from that doc for context.

https://docs.google.com/a/chromium.org/document/d/1_4LAnInOB8tM_DLjptWiszRwa4qwiSsDzMkO4tU-Qes/edit#

Importantly, this isn't just being done for us to get v8 issue trace events for when its doing internal work, say compiling or doing a majorgc. We're also going to send sampling data stream plus code creation/relocation events through the trace interface, so that when we start tracing, we can get both timestampped "begin/end" events AND sampling events.

One final technical note: I know one of the hot topics in all this is encoding the relationships between async information. In chrome's trace ecosystem, we've tried to solve this with flow events, which represent "arrows" between individual synchronous events on a thread, represented with regular begin/end events. More info on our trace data model --- which our trace_event.h file exists to generate --- is here: https://docs.google.com/document/d/1CvAClvFfyA5R-PhYUmn5OOQtYMH4h6I0nSsKchNAySU/edit

Anyway, thats a lotta words. Hope it makes sense! This was all designed with client use cases heavily in mind, so I totally buy that this is all whacko and crazy when viewed through a server-side lens. This having been said, feel free to shout though with questions, I'm always around to chat.

----

@ofrobots in [nodejs/tracing-wg#21_comment](https://github.com/nodejs/tracing-wg/issues/21#issuecomment-143891637):

Here are the main components, as per my understanding:

* trace-event.h and trace-event-common.h. These define the low-level C macros that provide a low-overhead mechanism to insert traces into C++ code. @fmeawad is working on getting these files committed into V8 under [this change-list](https://codereview.chromium.org/988893003/).

* As per the current CL, there a few methods that are [getting added to v8-platform.h](https://codereview.chromium.org/988893003/patch/280001/290003). An embedder needs to provide an implementation of these. Chromium provides the implementation of these in [trace_log.h](https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/trace_log.h&sq=package:chromium&type=cs) and [trace_log.cc](https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/trace_log.cc&sq=package:chromium&type=cs).

* To implement these functions, an embedder needs a buffer that gathers the traces. The buffer also is responsible to periodically & asynchronously flushing the contents to whatever 'sink' the traces need to go to. The Chrome implementation of the buffer is in [trace_buffer.h](https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/trace_buffer.h&sq=package:chromium&type=cs) and [trace_buffer.cc](https://code.google.com/p/chromium/codesearch#chromium/src/base/trace_event/trace_buffer.cc&sq=package:chromium&type=cs).

* To implement the above in Node.js, I think we probably need a separate thread handling the flushing of the trace-buffer to keep it off the main thread. Checking if a particular trace is enabled needs to be extremely cheap, and putting something into the trace-buffer synchronously needs to be cheap.

Basically this trace-event buffer becomes the 'single pipe' through all trace-events gathered by different parts of the software stack.

Once the above linked CL lands, traces being gathered in V8 will show up there. Node.js can start putting its own traces into the same pipe. I would imagine we would also need an API in Node.js to be exposed to JavaScript to allow JS code to start sending the trace events.

