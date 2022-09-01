# Using `llnode` for post-mortem debugging

You probably already experienced bugs that only happen in production. You'd like to reproduce it and step through instructions, but it will imply stopping your Node.js process and certainly degrade the user experience.

The purpose of this guide is to help you to find route causes
of your application crashes in production.

Before jumping into the code, let's clarify a few core concepts
that will helps you to go thoroughly through this tutorial.

## Concepts

### What is post-mortem debugging?
### What is a core dump?
### What is `lldb`?

## Explore your first core dump

### Setup

Open your favorite editor and copy-paste this piece of code.

```js
// script.js

const log = {
  info: (message) => console.log("Info: " + message),
  error: (message) => console.log("Error: " + message)
}

log.debug("This should crash");
```

### Create a code dump
### Use lldb
### Something is missing in the frames

## Reveal invisible frames with `llnode`

This is not ideal for dealing with these blank lines.
Let's see how `llnode` can help us.

### Install `llnode` plugin
### Explore missing traces (`v8 bt`)

## Beyond the backtrace

Revealing Javascript frames is not the only capacity of `llnode`.

### Inspect framces (`v8 i`)
### Explore objects (`v8 findjsobjects` / `v8 findjsinstances`)
### Find object references (`v8 findrefs`)
