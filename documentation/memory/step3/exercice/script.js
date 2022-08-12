// node.js dependecies
import os from 'os';
import { createHmac } from 'crypto';
import fs from 'fs/promises';

// constants
let len = 1_000_000;
const entries = new Set();
// fix: const fileName = `entries-${Date.now()}`;

async function addEntry () {
  const secret = 'abcdefg';
  const hash = createHmac('sha256', secret)
    .update('I love cupcakes')
    .digest('hex');

  const entry = {
    timestamp: Date.now(),
    memory: os.freemem(),
    totalMemory: os.totalmem(),
    uptime: os.uptime(),
    hash
  };

  entries.add(entry);
  // fix: await fs.appendFile(fileName, JSON.stringify(entry));
}

function summary () {
  console.log(`Total: ${entries.size} entries`);
  // fix: console.log('end');
}

// execution
(async () => {
  await fs.writeFile(fileName, "start");
  while (len > 0) {
    await addEntry();
    process.stdout.write(`~~> ${len} entries to record\r`);
    len--;
  };

  setImmediate(summary);
})();

