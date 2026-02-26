"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var child_process_1 = require("child_process");
var watcher = fs.watch('./src/', {
    persistent: true,
    recursive: true
});
var childProcess = null;
var restart = function () {
    if (childProcess)
        childProcess.kill();
    (0, child_process_1.spawnSync)('pnpm', ['run', 'build']);
    childProcess = (0, child_process_1.spawn)('pnpm', ['run', 'start']);
    childProcess.stdout.on('data', function (data) { return console.log(data.toString()); });
};
watcher.on('change', function () {
    console.log('File changed. Recompiling');
    restart();
});
restart();
