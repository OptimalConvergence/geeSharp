var mse = require("users/aazuspan/geeSharpening:qualityAlgorithms/MSE");
var utils = require("users/aazuspan/geeSharpening:utils");

// Calculating peak signal noise ratio (PSNR) in dB (Hagag et al 2013). Larger
// values mean there is less distortion from the reference image to the assessment image.
// Unlike MSE, PSNR is not relative to image intensity.
exports.calculate = function (referenceImage, assessmentImage, perBand) {
  // Default to returning image average
  if (utils.isMissing(perBand)) {
    perBand = false;
  }

  var maxVal = referenceImage.reduceRegion({ reducer: ee.Reducer.max() });
  var bandMSEs = mse.calculate(referenceImage, assessmentImage, true);

  // Zip the gfs and MSEk values to get a list of lists
  var bandVals = maxVal.values().zip(bandMSEs);

  // Map over each band list
  var x = bandVals.map(function (band) {
    var gfs = ee.Number(ee.List(band).get(0));
    var MSEk = ee.Number(ee.List(band).get(1));

    return gfs.divide(MSEk.sqrt());
  });

  // Take the log10 of all band values
  var xLog = ee.Array(
    x.map(function (y) {
      return ee.Number(y).log10();
    })
  );

  var psnr = xLog.multiply(20).toList();

  // If not per band, average all bands
  if (perBand === false) {
    psnr = ee.Number(psnr.reduce(ee.Reducer.mean()));
  }

  return psnr;
};
