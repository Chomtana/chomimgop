const through = require("through2");
const gm = require("gm").subClass({ imageMagick: true });
const { exec } = require("child_process");

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
  return through.obj(function chomimgop(file, enc, cb) {
    var filepath = file.path;

    //this is the result file don't optimize it again
    if (filepath.match(/^(.*)-(.*)w\.(.*)$/)) {
      cb();
      return;
    }

    function w(width) {
      var ext = fileext(filepath);
      var suffix = width ? "-" + width + "w" : "";

      if (!width) width = 1920;

      gm(filepath)
        .quality(60)
        .resize(width, null, ">")
        .write(changeext(namesuffix(filepath, suffix), "webp"), err => {
          if (err) {
            console.log(namesuffix(filepath, suffix) + " Error!");
            console.log(err);
          } else {
            console.log(namesuffix(filepath, suffix) + " Success!");
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
            } else {
              console.log(namesuffix(filepath, suffix) + " Success!");
            }
          });
      } else if (ext.toLowerCase() === "png") {
        exec(
          "pngquant " + filepath + " -f -o " + namesuffix(filepath, suffix),
          (err, stdout, stderr) => {
            if (err) {
              console.log("PNGQuant error", err);
              return;
            }

            // the *entire* stdout and stderr (buffered)
            if (stdout.trim() || stderr.trim()) {
              console.log(`PNGQuant stdout: ${stdout}`);
              console.log(`PNGQuant stderr: ${stderr}`);
            } else {
              console.log(namesuffix(filepath, suffix) + " Success!");
            }
          }
        );
      }
    }

    w();
    w(1920);
    w(1600);
    w(1280);
    w(768);
    w(480);
    w(360);
    w(240);
    w(196);

    cb();
  });
};
