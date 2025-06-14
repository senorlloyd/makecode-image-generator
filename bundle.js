(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
$(function() {
  // var
  var width, height, img;

  // color palette in makecode editor
  const makeCodeColors = {
    1: "#ffffff",
    2: "#fc262d",
    3: "#fd95c4",
    4: "#fd8140",
    5: "#fef438",
    6: "#2d9ca2",
    7: "#7cda5b",
    8: "#0843aa",
    9: "#8bf2fe",
    a: "#8d36c1",
    b: "#a3849e",
    c: "#5b416b",
    d: "#e4cdc5",
    e: "#90463f",
    f: "#000000"
  };

  var nearestColor = require("nearest-color").from(makeCodeColors);

  // dom
  var $canvas = $("#image");
  var ctx = $canvas[0].getContext("2d");
  var $upload = $("#image-upload");
  var $size = $("#pixel-size");
  var $output = $("#output");
  var $decResolution = $("#dec-resolution");
  var $incResolution = $("#inc-resolution");
  var $transCheck = $("#transparent-check");
  var $options = $("#options");

  const defaultPixelSize = 20;
  let pixelSize = defaultPixelSize; // initial resolution for 32x32
  let maxPixelSize = 30;
  let minPixelSize = 1;
  const defaultSize = 640; // for a 640x640 images
  let transparencyOn = false;

  // helpers
  const getClosestColor = function(color) {
    const closestColor = nearestColor(color);
    return closestColor;
  };

  const rgbToHex = function(rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  };

  const fullColorHex = function(r, g, b) {
    const red = rgbToHex(r);
    const green = rgbToHex(g);
    const blue = rgbToHex(b);
    return red + green + blue;
  };

  const getAverageRGB = function(imgData) {
    let red = 0;
    let green = 0;
    let blue = 0;
    let total = 0;

    for (let i = 0; i < imgData.length; i += 4) {
      if (imgData[i + 3] !== 0) {
        red += imgData[i + 0];
        green += imgData[i + 1];
        blue += imgData[i + 2];
        total++;
      }
    }

    var avgRed = Math.floor(red / total);
    var avgGreen = Math.floor(green / total);
    var avgBlue = Math.floor(blue / total);

    // get hex value
    return fullColorHex(avgRed, avgGreen, avgBlue);
  };

  var pixelatize = function(size) {
    const pixelData = [];
    for (var y = 0; y < height; y += size) {
      for (var x = 0; x < width; x += size) {
        var pixels = ctx.getImageData(x, y, size, size);
        var averageRGB = getAverageRGB(pixels.data);
        let makecodeColorValue;

        if (averageRGB.indexOf("NaN") >= 0) {
          makecodeColorValue = "transparent";
          pixelData.push(".");
        } else {
          // convert to the closest makecode color
          var makecodeColor = getClosestColor(averageRGB);
          makecodeColorValue = makecodeColor.value;
          let makecodeColorName = makecodeColor.name;

          if (transparencyOn && makecodeColorName == 1) {
            makecodeColorValue = "transparent";
            pixelData.push(".");
          } else {
            pixelData.push(makecodeColor.name);
          }
        }

        ctx.fillStyle = makecodeColorValue;
        ctx.fillRect(x, y, size, size);
      }
      pixelData.push("\n");
    }

    // generate makecode code
    const codeToString = `${pixelData}`.replace(/,/g, " "); // need to replace commas with spaces
    let code = `let mySprite = sprites.create(img \n \`${codeToString}\`, SpriteKind.Player)`;
    const codeContainer = document.getElementById("code");
    codeContainer.innerHTML = code;
    // generate the clipboard button
    const clipboardBtn = document.getElementById("clipboard-btn");
    new ClipboardJS("#clipboard-btn");

    // reveal the UI
    $(".hidden").removeClass("hidden");

    codeContainer.style.display = "inline-block";
  };

  // events
  $upload.change(function(e) {
    // reset to default pixel size
    pixelSize = defaultPixelSize;
    // clear the canvas
    ctx.clearRect(0, 0, width, height);
    img = new Image();
    img.onload = function() {
      // should resize to 640x640
      const imgWidth = img.width;
      const imgHeight = img.height;

      width = defaultSize;
      height = Math.round((defaultSize * imgHeight) / imgWidth);
      // console.log('width ', width, ' height', height);
      $canvas.attr("width", width);
      $canvas.attr("height", height);
      ctx.drawImage(img, 0, 0, width, height);
      pixelatize(pixelSize);
      $(".hidden").removeClass("hidden");
    };

    img.src = URL.createObjectURL(e.target.files[0]);
  });

  $decResolution.click(function(e) {
    if (pixelSize < maxPixelSize) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      pixelSize++;
      pixelatize(pixelSize);
    }
  });

  $incResolution.click(function(e) {
    if (pixelSize > minPixelSize) {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      pixelSize--;
      pixelatize(pixelSize);
    }
  });

  $transCheck.change(function(e) {
    if ($(this).is(":checked")) {
      transparencyOn = true;
    } else {
      // turn all transparent to white
      transparencyOn = false;
    }
    // rerun the pixelizer
    pixelatize(pixelSize);
  });

  $size.change(function(e) {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    pixelatize(parseInt($(this).val()));
  });
});

},{"nearest-color":2}],2:[function(require,module,exports){
(function(context) {

  /**
   * Defines an available color.
   *
   * @typedef {Object} ColorSpec
   * @property {string=} name A name for the color, e.g., 'red'
   * @property {string} source The hex-based color string, e.g., '#FF0'
   * @property {RGB} rgb The {@link RGB} color values
   */

  /**
   * Describes a matched color.
   *
   * @typedef {Object} ColorMatch
   * @property {string} name The name of the matched color, e.g., 'red'
   * @property {string} value The hex-based color string, e.g., '#FF0'
   * @property {RGB} rgb The {@link RGB} color values.
   */

  /**
   * Provides the RGB breakdown of a color.
   *
   * @typedef {Object} RGB
   * @property {number} r The red component, from 0 to 255
   * @property {number} g The green component, from 0 to 255
   * @property {number} b The blue component, from 0 to 255
   */

  /**
   * Gets the nearest color, from the given list of {@link ColorSpec} objects
   * (which defaults to {@link nearestColor.DEFAULT_COLORS}).
   *
   * Probably you wouldn't call this method directly. Instead you'd get a custom
   * color matcher by calling {@link nearestColor.from}.
   *
   * @public
   * @param {RGB|string} needle Either an {@link RGB} color or a hex-based
   *     string representing one, e.g., '#FF0'
   * @param {Array.<ColorSpec>=} colors An optional list of available colors
   *     (defaults to {@link nearestColor.DEFAULT_COLORS})
   * @return {ColorMatch|string} If the colors in the provided list had names,
   *     then a {@link ColorMatch} object with the name and (hex) value of the
   *     nearest color from the list. Otherwise, simply the hex value.
   *
   * @example
   * nearestColor({ r: 200, g: 50, b: 50 }); // => '#f00'
   * nearestColor('#f11');                   // => '#f00'
   * nearestColor('#f88');                   // => '#f80'
   * nearestColor('#ffe');                   // => '#ff0'
   * nearestColor('#efe');                   // => '#ff0'
   * nearestColor('#abc');                   // => '#808'
   * nearestColor('red');                    // => '#f00'
   * nearestColor('foo');                    // => throws
   */
  function nearestColor(needle, colors) {
    needle = parseColor(needle);

    if (!needle) {
      return null;
    }

    var distanceSq,
        minDistanceSq = Infinity,
        rgb,
        value;

    colors || (colors = nearestColor.DEFAULT_COLORS);

    for (var i = 0; i < colors.length; ++i) {
      rgb = colors[i].rgb;

      distanceSq = (
        Math.pow(needle.r - rgb.r, 2) +
        Math.pow(needle.g - rgb.g, 2) +
        Math.pow(needle.b - rgb.b, 2)
      );

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        value = colors[i];
      }
    }

    if (value.name) {
      return {
        name: value.name,
        value: value.source,
        rgb: value.rgb,
        distance: Math.sqrt(minDistanceSq)
      };
    }

    return value.source;
  }

  /**
   * Provides a matcher to find the nearest color based on the provided list of
   * available colors.
   *
   * @public
   * @param {Array.<string>|Object} availableColors An array of hex-based color
   *     strings, or an object mapping color *names* to hex values.
   * @return {function(string):ColorMatch|string} A function with the same
   *     behavior as {@link nearestColor}, but with the list of colors
   *     predefined.
   *
   * @example
   * var colors = {
   *   'maroon': '#800',
   *   'light yellow': { r: 255, g: 255, b: 51 },
   *   'pale blue': '#def',
   *   'white': 'fff'
   * };
   *
   * var bgColors = [
   *   '#eee',
   *   '#444'
   * ];
   *
   * var invalidColors = {
   *   'invalid': 'foo'
   * };
   *
   * var getColor = nearestColor.from(colors);
   * var getBGColor = getColor.from(bgColors);
   * var getAnyColor = nearestColor.from(colors).or(bgColors);
   *
   * getColor('ffe');
   * // => { name: 'white', value: 'fff', rgb: { r: 255, g: 255, b: 255 }, distance: 17}
   *
   * getColor('#f00');
   * // => { name: 'maroon', value: '#800', rgb: { r: 136, g: 0, b: 0 }, distance: 119}
   *
   * getColor('#ff0');
   * // => { name: 'light yellow', value: '#ffff33', rgb: { r: 255, g: 255, b: 51 }, distance: 51}
   *
   * getBGColor('#fff'); // => '#eee'
   * getBGColor('#000'); // => '#444'
   *
   * getAnyColor('#f00');
   * // => { name: 'maroon', value: '#800', rgb: { r: 136, g: 0, b: 0 }, distance: 119}
   *
   * getAnyColor('#888'); // => '#444'
   *
   * nearestColor.from(invalidColors); // => throws
   */
  nearestColor.from = function from(availableColors) {
    var colors = mapColors(availableColors),
        nearestColorBase = nearestColor;

    var matcher = function nearestColor(hex) {
      return nearestColorBase(hex, colors);
    };

    // Keep the 'from' method, to support changing the list of available colors
    // multiple times without needing to keep a reference to the original
    // nearestColor function.
    matcher.from = from;

    // Also provide a way to combine multiple color lists.
    matcher.or = function or(alternateColors) {
      var extendedColors = colors.concat(mapColors(alternateColors));
      return nearestColor.from(extendedColors);
    };

    return matcher;
  };

  /**
   * Given either an array or object of colors, returns an array of
   * {@link ColorSpec} objects (with {@link RGB} values).
   *
   * @private
   * @param {Array.<string>|Object} colors An array of hex-based color strings, or
   *     an object mapping color *names* to hex values.
   * @return {Array.<ColorSpec>} An array of {@link ColorSpec} objects
   *     representing the same colors passed in.
   */
  function mapColors(colors) {
    if (colors instanceof Array) {
      return colors.map(function(color) {
        return createColorSpec(color);
      });
    }

    return Object.keys(colors).map(function(name) {
      return createColorSpec(colors[name], name);
    });
  };

  /**
   * Parses a color from a string.
   *
   * @private
   * @param {RGB|string} source
   * @return {RGB}
   *
   * @example
   * parseColor({ r: 3, g: 22, b: 111 }); // => { r: 3, g: 22, b: 111 }
   * parseColor('#f00');                  // => { r: 255, g: 0, b: 0 }
   * parseColor('#04fbc8');               // => { r: 4, g: 251, b: 200 }
   * parseColor('#FF0');                  // => { r: 255, g: 255, b: 0 }
   * parseColor('rgb(3, 10, 100)');       // => { r: 3, g: 10, b: 100 }
   * parseColor('rgb(50%, 0%, 50%)');     // => { r: 128, g: 0, b: 128 }
   * parseColor('aqua');                  // => { r: 0, g: 255, b: 255 }
   * parseColor('fff');                   // => { r: 255, g: 255, b: 255 }
   * parseColor('foo');                   // => throws
   */
  function parseColor(source) {
    var red, green, blue;

    if (typeof source === 'object') {
      return source;
    }

    if (source in nearestColor.STANDARD_COLORS) {
      return parseColor(nearestColor.STANDARD_COLORS[source]);
    }

    var hexMatch = source.match(/^#?((?:[0-9a-f]{3}){1,2})$/i);
    if (hexMatch) {
      hexMatch = hexMatch[1];

      if (hexMatch.length === 3) {
        hexMatch = [
          hexMatch.charAt(0) + hexMatch.charAt(0),
          hexMatch.charAt(1) + hexMatch.charAt(1),
          hexMatch.charAt(2) + hexMatch.charAt(2)
        ];

      } else {
        hexMatch = [
          hexMatch.substring(0, 2),
          hexMatch.substring(2, 4),
          hexMatch.substring(4, 6)
        ];
      }

      red = parseInt(hexMatch[0], 16);
      green = parseInt(hexMatch[1], 16);
      blue = parseInt(hexMatch[2], 16);

      return { r: red, g: green, b: blue };
    }

    var rgbMatch = source.match(/^rgb\(\s*(\d{1,3}%?),\s*(\d{1,3}%?),\s*(\d{1,3}%?)\s*\)$/i);
    if (rgbMatch) {
      red = parseComponentValue(rgbMatch[1]);
      green = parseComponentValue(rgbMatch[2]);
      blue = parseComponentValue(rgbMatch[3]);

      return { r: red, g: green, b: blue };
    }

    throw Error('"' + source + '" is not a valid color');
  }

  /**
   * Creates a {@link ColorSpec} from either a string or an {@link RGB}.
   *
   * @private
   * @param {string|RGB} input
   * @param {string=} name
   * @return {ColorSpec}
   *
   * @example
   * createColorSpec('#800'); // => {
   *   source: '#800',
   *   rgb: { r: 136, g: 0, b: 0 }
   * }
   *
   * createColorSpec('#800', 'maroon'); // => {
   *   name: 'maroon',
   *   source: '#800',
   *   rgb: { r: 136, g: 0, b: 0 }
   * }
   */
  function createColorSpec(input, name) {
    var color = {};

    if (name) {
      color.name = name;
    }

    if (typeof input === 'string') {
      color.source = input;
      color.rgb = parseColor(input);

    } else if (typeof input === 'object') {
      // This is for if/when we're concatenating lists of colors.
      if (input.source) {
        return createColorSpec(input.source, input.name);
      }

      color.rgb = input;
      color.source = rgbToHex(input);
    }

    return color;
  }

  /**
   * Parses a value between 0-255 from a string.
   *
   * @private
   * @param {string} string
   * @return {number}
   *
   * @example
   * parseComponentValue('100');  // => 100
   * parseComponentValue('100%'); // => 255
   * parseComponentValue('50%');  // => 128
   */
  function parseComponentValue(string) {
    if (string.charAt(string.length - 1) === '%') {
      return Math.round(parseInt(string, 10) * 255 / 100);
    }

    return Number(string);
  }

  /**
   * Converts an {@link RGB} color to its hex representation.
   *
   * @private
   * @param {RGB} rgb
   * @return {string}
   *
   * @example
   * rgbToHex({ r: 255, g: 128, b: 0 }); // => '#ff8000'
   */
  function rgbToHex(rgb) {
    return '#' + leadingZero(rgb.r.toString(16)) +
      leadingZero(rgb.g.toString(16)) + leadingZero(rgb.b.toString(16));
  }

  /**
   * Puts a 0 in front of a numeric string if it's only one digit. Otherwise
   * nothing (just returns the value passed in).
   *
   * @private
   * @param {string} value
   * @return
   *
   * @example
   * leadingZero('1');  // => '01'
   * leadingZero('12'); // => '12'
   */
  function leadingZero(value) {
    if (value.length === 1) {
      value = '0' + value;
    }
    return value;
  }

  /**
   * A map from the names of standard CSS colors to their hex values.
   */
  nearestColor.STANDARD_COLORS = {
    aqua: '#0ff',
    black: '#000',
    blue: '#00f',
    fuchsia: '#f0f',
    gray: '#808080',
    green: '#008000',
    lime: '#0f0',
    maroon: '#800000',
    navy: '#000080',
    olive: '#808000',
    orange: '#ffa500',
    purple: '#800080',
    red: '#f00',
    silver: '#c0c0c0',
    teal: '#008080',
    white: '#fff',
    yellow: '#ff0'
  };

  /**
   * Default colors. Comprises the colors of the rainbow (good ol' ROY G. BIV).
   * This list will be used for calls to {@nearestColor} that don't specify a list
   * of available colors to match.
   */
  nearestColor.DEFAULT_COLORS = mapColors([
    '#f00', // r
    '#f80', // o
    '#ff0', // y
    '#0f0', // g
    '#00f', // b
    '#008', // i
    '#808'  // v
  ]);

  nearestColor.VERSION = '0.4.4';

  if (typeof module === 'object' && module && module.exports) {
    module.exports = nearestColor;
  } else {
    context.nearestColor = nearestColor;
  }

}(this));

},{}]},{},[1]);
