import { getConfig } from './config.js';
import { checkIPChange } from './ip-checker.js';
import { updateAndCommit } from './git-updater.js';
import type { RunMode } from './types.js';

async function performIPCheck(): Promise<void> {
  const config = getConfig();

  console.log(`[${new Date().toISOString()}] Checking IP address...`);

  try {
    const result = await checkIPChange(config);

    if (result.changed) {
      console.log(`IP changed: ${result.previousIp ?? 'unknown'} -> ${result.ip}`);
      await updateAndCommit(config, result.ip);
    } else {
      console.log(`IP unchanged: ${result.ip}`);
    }
  } catch (error) {
    console.error(`Error during IP check: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function runOnce(): Promise<void> {
  console.log('Running in ONCE mode - single execution');
  await performIPCheck();
  console.log('Execution completed');
}

async function runDaemon(): Promise<void> {
  const config = getConfig();
  const intervalMs = config.pollIntervalMinutes * 60 * 1000;

  console.log(`Running in DAEMON mode - polling every ${config.pollIntervalMinutes} minutes`);
  console.log('Press Ctrl+C to stop');

  await performIPCheck();

  setInterval(async () => {
    try {
      await performIPCheck();
    } catch (error) {
      console.error('Error in daemon loop, continuing...');
    }
  }, intervalMs);
}

async function main(): Promise<void> {
  const mode = (process.argv[2] as RunMode) ?? 'once';

  if (mode !== 'daemon' && mode !== 'once') {
    console.error(`Invalid mode: ${mode}. Use 'daemon' or 'once'`);
    process.exit(1);
  }

  try {
    if (mode === 'daemon') {
      await runDaemon();
    } else {
      await runOnce();
    }
  } catch (error) {
    console.error(`Fatal error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
