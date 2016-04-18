## OS Tracing  

* [DTrace](http://dtrace.org/)  
  Available on IllumOS, Solaris, Mac
  
  - The [DTrace blog](http://dtrace.org/blogs/blog/category/node-js/) has some articles on using DTrace with Node.js

* [LTTng](http://lttng.org/)  
  Linux only.  

  - [Tracing Node on Linux with LTTNG](http://nearform.github.io/tracing-node-lttng-nodejsdublin/)
  - [thekemkid/magic-tracing](https://github.com/thekemkid/magic-tracing) is an example of a Node.js application which implements LTTng tracepoints. A demo is available [here](https://asciicinema.org/a/16785).

* [ETW](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363668.aspx)  
  Windows only.  

  - Some information was provided by Bill Ticehurst (@billti) in [issue #10](https://github.com/nodejs/tracing-wg/issues/10#issuecomment-137145822) about how he integrated ETW into Node.js for Windows

* [Perf](https://perf.wiki.kernel.org/)  
  Linux only.  

  - Can be enabled with `--perf_basic_prof` v8 run-time flag.

* [SystemTap](https://sourceware.org/systemtap/)  
  Linux only.

