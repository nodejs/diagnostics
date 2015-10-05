'use strict';

const fs = require('fs');
const getStack = require('./example-trace.js');

fs.open(__filename, 'r', function (err, fd) {
  if (err) throw err;

  fs.close(fd, function (err) {
    if (err) throw err;

    console.log(getStack('trace'));
  });
})
