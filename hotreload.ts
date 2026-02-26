import * as fs from 'fs';
import { type ChildProcessWithoutNullStreams, spawn, spawnSync } from 'child_process';

const watcher = fs.watch('./src/', {
    persistent: true,
    recursive: true
});

let childProcess: ChildProcessWithoutNullStreams | null = null;

const restart = () => {
    if (childProcess)
        childProcess.kill();
    
    spawnSync('pnpm', [ 'run', 'build' ]);
    childProcess = spawn('pnpm', [ 'run', 'start' ]);

    childProcess.stdout.on('data', data => console.log(data.toString()));
};

watcher.on('change', () => {
    console.log('File changed. Recompiling');
    restart();
});

restart();