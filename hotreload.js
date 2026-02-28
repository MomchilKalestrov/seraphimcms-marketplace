//@ts-check
import * as fs from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';

const watcher = fs.watch('./src/', {
    persistent: true,
    recursive: true
});

/** @type { import('node:child_process').ChildProcessWithoutNullStreams | null } */
let childProcess = null;

const restart = () => {
    if (childProcess)
        childProcess.kill();
    
    spawnSync('pnpm', [ 'run', 'build' ], { stdio: 'inherit' });
    childProcess = spawn('pnpm', [ 'run', 'start' ]);

    childProcess.stdout.on('data', data => console.log(data.toString()));
    childProcess.stderr.on('data', data => console.error(data.toString()));
};

watcher.on('change', () => {
    console.log('File changed. Recompiling');
    restart();
});

restart();