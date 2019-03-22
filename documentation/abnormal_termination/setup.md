
# Node.js application crash diagnostics: Best Practices series #1

This is the first of a series of best practices and useful tips if you
are using Node.js in large scale production systems.

## Introduction

Typical prodcution systems do not enjoy the benefits of development
and staging systems in many aspects:

 - they are isolated from public internet
 - they are not loaded with development and debug tools
 - they are configured with the most robust and secure
   configurations possible at the OS level
 - they operate with tight performance goals and
   constraints which means they cannot use many tools
   that slow dows the process significantly
 - in certain deployment scenarios (such as Cloud) those
   operate in a head-less mode [ no ssh ]
 - in certain deployment scenarios (such as Cloud) those
   operate in a state-less mode [ no persistent disk]

The net effect of these constraints is that your production systems
need to be manually `prepared` in advance to enable crash dianostic
data generation on the first failure itself, without loosing vital data.
The rest of the document illustrates this preparation steps.

The key artifacts for exploring Node.js application crashes in production are:
 - core dump (a.k.a system dump, core file)
 - diagnostic report (originally known as node report)

Reference: [Diagnostic Report](https://nodejs.org/dist/latest-v12.x/docs/api/report.html)

## Common issues

While the said key artifacts are expected to be generated on abnormal
program conditions such as crash, (diagnostic report is still
experimental so requires explicit command line flags to switch it ON)
there are a number of issues that affects the automatic and complete
generation of these artifacts. Most common such issues are:
 - Insufficient disk space for writing core dump data
 - Insufficient privilege to the core dump generator function
 - Insufficient resource limits set on the user
 - In case of diagnostic report, absence of report and symtpom flag

## Recommended Best Practice

This section provides specific recommendations for
how to configure your systems in advance in order to be
ready to investigate crashes.

### Available  disk space
Ensure that there is enough disk space available for the core file
to be written:

 - Maximum of 4GB for a 32 bit process.
 - Much larger  for  64 bit process (common case). To know the precise
   requirement, measure the peak-load memory usage of your application.
   Add a 10% to that to accommodate core metadata. If you are using
   common monitoring tools, one of the graph should reveal the peak
   memory. If not, you can measure it directly in the system.

In Linux variants, you can use `top -p <pid>` to see the instantaneous
memory usage of the process:

```
$ top -p 106916

   PID    USER    PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
106916 user       20   0  600404  54500  15572 R 109.7  0.0  81098:54 node
```

In Darwin, the flag is `-pid`.

In AIX, the command is `topas`.

In freebsd, the command is `top`. In both AIX and freebsd, there is no
flag to show per-process details.

In Windows, you could use the task
manager window and view the process attributes visually.

Insufficient file system space will result in truncated core files,
and can severely hamper the ability to diagnose the problem.

Figure out how much free space is available in the file system:

`df -k` can be used invariably across UNIX platforms.

In Windows, Windows explorer when pointed to a disk partition,
provides a view of the available space in that partition.

By default, core file is generated on a crash event, and is
written to the current working directory - the location from
where the node process was started, in most of the UNIX variants.

In Darwin, it appears in /cores location.

By default, core files from node processes on Linux are named as
`core` or `core.<pid>`, where <pid> is node process id.

By default, core files from node processes on AIX and Darwin are
named ‘core’.

By default, core files from node processes on freebsd are named
‘%N.core’. where `%N` is the name of the crashed process.

However, Superuser (root) can control and change these defaults.

In Linux, `sysctl kernel.core_pattern` shows corrent core file pattern.

Modify pattern using `sysctl -w kernel.core_pattern=pattern` as root.

In AIX, `lscore` shows the current core file pattern.

A best practice is to remove old core files on regular intervals.

This makes sure that the space in the system is used efficiently,
and no application spefific data is persisted inadvertently.

A best practice is to name core file with the name, process ID and
the creation timestamp of the failed process.

This makes it easy to relate the binary dump with crash specific context.

### Configuring to ensure core generation

Enable full core dump generation using `chdev -l sys0 -a fullcore=true`

Modify the current pattern using `chcore -p on -n on -l /path/to/coredumps`

In Darwin and freebsd, `sysctl kern.corefile` shows the corrent core file pattern.

Modify the current pattern using `sysctl -w kern.corefile=newpattern` as root.

To obtain full core files, set the following ulimit options, across UNIX variants:

`ulimit -c unlimited` - turn on core file generation capability with unlimited size

`ulimit -d unlimited` - set the user data limit to unlimited

`ulimit -f unlimited` - set the file limit to unlimited

The current ulimit settings can be displayed using:

`ulimit -a`

However, these are the `soft` limits and are enforced per user, per
shell environment. Please note that these values are themselves
practically constrained by the system-wide `hard` limit set by the
system administrator. System administrators (with superuser privileges)
may display, set or change the hard limits by adding the -H flag to
the standard set of ulimit commands.

For example with:
`ulimit -c -H`

104857600

we cannot increase the core file size to 200 MB. So

`ulimit -c 209715200`

will fail with reason:

`ulimit: core size: cannot modify limit: Invalid argument`

So if you hard limit settings are constraining your application's
requirement, relax those specific settings through administrator
account.

## Additional information

### Manual dump generation

Under certain circumstances where you want to collect a core
manually follow these steps:

In linux, use `gcore [-a] [-o filename] pid` where  `-a`
specifies to dump everything.

In AIX, use `gencore [pid] [filename]`

In freebsd and Darwin, use `gcore [-s] [executable] pid`

In Windows, you can use `Task manager` window, right click on the
node process and select `create dump` option.

Special note on Ubuntu systems with `Yama hardened kernel`

Yama security policy inhibits a second process from collecting dump,
practically rendering `gcore` unusable.

Workaround this by enabling `ptrace` capability to gdb.
Execute the below as root:

`setcap cap_sys_ptrace=+ep `which gdb``


These steps make sure that when your Node.js application crashes in
production a valid, full core dump is generated at a known location that
can be loaded into debuggers that understand Node.js internals, and
diagnose the issue. Next article in this series will focus on that part.
