const through = require("through2");
const gm = require("gm").subClass({ imageMagick: true });
const { exec } = require("child_process");
const os = require("os")
const fs = require("fs")

var force_reop = false;

function namesuffix(file, suffix) {
  return (
    file.substr(0, file.lastIndexOf(".")) +
    suffix +
    file.substr(file.lastIndexOf("."))
  );
}

function changeext(file, ext) {
  file = file.substr(0, file.lastIndexOf(".")) + "." + ext;
  return file;
}

function fileext(file) {
  return file.substr(file.lastIndexOf(".") + 1);
}

exports.default = function chomimgop() {
  return through.obj(async function chomimgop(file, enc, cb) {
    var filepath = file.path;

    //this is the result file don't optimize it again
    if (filepath.match(/^(.*)-(.*)w\.(.*)$/)) {
      cb();
      return;
    }
	
	//if this file is optimized don't optimize it again
	if (fs.existsSync( changeext(filepath, "webp") )) {
	  cb(); return;
	}

    function w(width) {
      return new Promise((resolve, reject) => {
        var ext = fileext(filepath);
        var suffix = width ? "-" + width + "w" : "";

        if (!width) width = 1920;

        let webp_ok = false;
        let base_ok = false;

        gm(filepath)
          .quality(60)
          .resize(width, null, ">")
          .write(changeext(namesuffix(filepath, suffix), "webp"), err => {
            if (err) {
              console.log(changeext(namesuffix(filepath, suffix), "webp") + " Error!");
              console.log(err);
              reject(err);
            } else {
              console.log(changeext(namesuffix(filepath, suffix), "webp") + " Success!");

              webp_ok = true;
              if (webp_ok && base_ok) resolve();
            }
          });

        if (ext.toLowerCase() === "jpg" || ext.toLowerCase() === "jpeg") {
          gm(filepath)
            .quality(60)
            .resize(width, null, ">")
            .strip()
            .samplingFactor(4, 2)
            .interlace("JPEG")
            .colorspace("RGB")
            .write(namesuffix(filepath, suffix), err => {
              if (err) {
                console.log(namesuffix(filepath, suffix) + " Error!");
                console.log(err);
                reject(err);
              } else {
                console.log(namesuffix(filepath, suffix) + " Success!");

                base_ok = true;
                if (webp_ok && base_ok) resolve();
              }
            });
        } else if (ext.toLowerCase() === "png") {
          exec(
            "pngquant " + filepath + " -f -o " + namesuffix(filepath, suffix),
            (err, stdout, stderr) => {
              if (err) {
                console.log("PNGQuant error", err);
                reject(err);
                return;
              }

              // the *entire* stdout and stderr (buffered)
              if (stdout.trim() || stderr.trim()) {
                console.log(`PNGQuant stdout: ${stdout}`);
                console.log(`PNGQuant stderr: ${stderr}`);
                if (stderr) reject(stderr); else reject(stdout);
              } else {
                console.log(namesuffix(filepath, suffix) + " Success!");
                
                base_ok = true;
                if (webp_ok && base_ok) resolve();
              }
            }
          );
        }
      });
    }

    await w();
    await w(1920);
    await w(1600);
    await w(1280);
    await w(768);
    await w(480);
    await w(360);
    await w(240);
    await w(196);

    cb();
  });
};
