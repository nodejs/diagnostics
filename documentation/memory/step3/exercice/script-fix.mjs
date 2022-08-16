import os from 'os';
import fs from 'fs/promises';

let len = 1_000_000;
const fileName = `entries-${Date.now()}`;

async function addEntry () {
  const entry = {
    timestamp: Date.now(),
    memory: os.freemem(),
    totalMemory: os.totalmem(),
    uptime: os.uptime(),
  };

  await fs.appendFile(fileName, JSON.stringify(entry) + '\n');
}

async function summary () {
  const stats = await fs.lstat(fileName);
  console.log(`File size: ${stats.size} bytes! \n`);
}

// execution
(async () => {
  await fs.writeFile(fileName, "----START---\n");
  while (len > 0) {
    await addEntry();
    process.stdout.write(`~~> ${len} entries to record\r`);
    len--;
  };

  await summary();
})();

