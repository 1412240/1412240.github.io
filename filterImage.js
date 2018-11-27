Filters = {};

Filters.sobel = function (pixels, args) {
  // make image to grayscale
  var d = pixels.data;
  for (var i = 0; i < d.length; i += 4) {
    var r = d[i];
    var g = d[i + 1];
    var b = d[i + 2];
    // CIE luminance for the RGB
    // The human eye is bad at seeing red and blue, so we de-emphasize them.
    var v = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    d[i] = d[i + 1] = d[i + 2] = v
  }
  var grayscale = pixels;
  var vertical = Filters.convoluteFloat32(grayscale,
    [-1, 0, 1,
    -2, 0, 2,
    -1, 0, 1]);
  var horizontal = Filters.convoluteFloat32(grayscale,
    [-1, -2, -1,
      0, 0, 0,
      1, 2, 1]);

  var final_image = Filters.createImageData(vertical.width, vertical.height);

  for (var i = 0; i < final_image.data.length; i += 4) {
    // make the vertical gradient red
    var v = Math.abs(vertical.data[i]);
    final_image.data[i] = v;
    // make the horizontal gradient green
    var h = Math.abs(horizontal.data[i]);
    final_image.data[i + 1] = h;
    // and mix in some blue for aesthetics
    final_image.data[i + 2] = (v + h) / 4;
    final_image.data[i + 3] = 255; // opaque alpha
  }
  return final_image
};

// if (!window.Float32Array)
//   Float32Array = Array;

Filters.convoluteFloat32 = function (pixels, weights, opaque) {
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side / 2);

  var src = pixels.data;
  var sw = pixels.width;
  var sh = pixels.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w, height: h, data: new Float32Array(w * h * 4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y * w + x) * 4;
      var r = 0, g = 0, b = 0, a = 0;
      for (var cy = 0; cy < side; cy++) {
        for (var cx = 0; cx < side; cx++) {
          var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy * sw + scx) * 4;
          var wt = weights[cy * side + cx];
          r += src[srcOff] * wt;
          g += src[srcOff + 1] * wt;
          b += src[srcOff + 2] * wt;
          a += src[srcOff + 3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff + 1] = g;
      dst[dstOff + 2] = b;
      dst[dstOff + 3] = a + alphaFac * (255 - a);
    }
  }
  return output;
};

Filters.tmpCanvas = document.createElement('canvas');
Filters.tmpCtx = Filters.tmpCanvas.getContext('2d');

Filters.createImageData = function (w, h) {
  return this.tmpCtx.createImageData(w, h);
};



