Node.js tracing - platform specific tracing
================================================================================

Need a general statement of direction of if and how platform-specific tracing
factors into Node.js, especially given [v8-tracing](../v8-tracing/README.md).

Popular platform specific tracing stories:

* [DTrace](http://dtrace.org/blogs/about/) (illumos / Solaris / Mac / other)

  Some blog posts on DTrace and Node.js are available on the
  [DTrace blog](http://dtrace.org/blogs/blog/category/node-js/)

* [LTTng](http://lttng.org/) (Linux)

  Some info on using LTTng with Node.js are available in the presentations
  [Tracing Node on Linux with LTTNG](http://nearform.github.io/tracing-node-lttng-nodejsdublin/)

* [ETW](https://msdn.microsoft.com/en-us/library/windows/desktop/aa363668.aspx)
  (Windows)

  Some information was provided by Bill Ticehurst (@billti) in
  [issue #10](https://github.com/nodejs/tracing-wg/issues/10#issuecomment-137145822)
  about how he integrated ETW into Node.js for Windows


----

If you have more info to provide, please send us a pull request!
