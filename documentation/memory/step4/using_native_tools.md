# Investigation Native memory leaks

While JavaScript is is a garbage collected language, memory is also allocated natively 
in C/C++ code. These allocations may occur in the Node.js source code, addons or
in the Node.js dependencies (for example V8).  

[Valgrind](https://valgrind.org/) is a tool that can be used to instrument an
application such that you get reports on memory usage, including potential memory
leaks once the application terminates. Valgrind support Linux as well as some variants
including MacOSX.

We recommend using Valgrind to investigate native memory leaks and more
detailed information on how to use it with Node.js is available in
[investigating_native_memory_lea(k](https://github.com/nodejs/node/blob/master/doc/guides/investigating_native_memory_leak.md)

