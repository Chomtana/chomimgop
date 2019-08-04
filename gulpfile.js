const chomimgoppipe = require("./chomimgop")
const { src, dest, parallel, serial, watch } = require('gulp');
const gulpsrc = require('./gulpsrc.json')

function chomimgop() {
    return src(gulpsrc).pipe(chomimgoppipe).pipe(dest('.'));
}

function chomimgopwatch() {
    return watch(gulpsrc, chomimgop)
}

exports.op = chomimgop;
exports.watch = chomimgopwatch;
exports.default = chomimgopwatch;
