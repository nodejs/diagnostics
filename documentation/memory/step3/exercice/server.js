// node.js dependencies
import v8 from 'v8';
import os from 'os';

// third-party dependencies
import Fastify from 'fastify';

// constants
const server = Fastify();
const entries = new Set();

server.get('/write', () => {
  const date = new Date().toString();
  // don't do this at home
  entries.add({
    date,
    arch: os.arch(),
    platform: os.platform(),
    cpus: os.cpus()
  });
 
  return true;
});

server.get('/read', () => {
  return { count: entries.size };
});

/**
 *
 * Diagnostic helpers endpoints
 *
 */

server.get('/enable-gc-traces', () => {
  v8.setFlagsFromString('--trace_gc');
  return true;
});

server.get('/disable-gc-traces', () => {
  v8.setFlagsFromString('--notrace_gc');
  return true;
});


server.listen(9999, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`server listening on ${address}`);
});
