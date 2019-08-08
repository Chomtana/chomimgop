const chomimgoppipe = require("./chomimgop").default;
const { src, dest, parallel, serial, watch } = require("gulp");
const gulpsrc = require("./gulpsrc.json");

function chomimgop() {
  return src(gulpsrc)
    .pipe(chomimgoppipe())
}

function chomimgopwatch() {
  return watch(gulpsrc, chomimgop);
}

exports.op = chomimgop;
exports.watch = chomimgopwatch;
exports.default = chomimgop;
