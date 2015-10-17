'use strict';

const fs = require('fs');
const net = require('net');
const getStack = require('./example-trace.js');

Error.stackTraceLimit = Infinity;

const server = net.createServer(function (socket) {

  fs.open(__filename, 'r', function (err, fd) {
    if (err) throw err;

    fs.close(fd, function (err) {
      if (err) throw err;

      console.log(getStack('trace'));
      socket.end('hallo world');
    });
  })
});

server.listen(0, 'localhost', function () {
  const addr = server.address();
  const socket = net.connect(addr.port, addr.address, function () {
    socket.once('readable', function () {
      socket.read();
      socket.once('readable', server.close.bind(server));
    });
  });
});
