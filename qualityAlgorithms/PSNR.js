var mse = require("users/aazuspan/geeSharpening:qualityAlgorithms/MSE");

// Calculating peak signal noise ratio (PSNR) in dB (Hagag et al 2013). Larger
// values mean there is less distortion from the reference image to the assessment image.
// Unlike MSE, PSNR is not relative to image intensity.
exports.calculate = function (referenceImage, assessmentImage) {
  var maxVal = referenceImage.reduceRegion({ reducer: ee.Reducer.max() });
  var bandMSEs = mse.calculateBandMSE(referenceImage, assessmentImage);

  // Zip the gfs and MSEk values to get a list of lists
  var bandVals = maxVal.values().zip(bandMSEs.values());

  // Map over each band list
  var x = bandVals.map(function (band) {
    var gfs = ee.Number(ee.List(band).get(0));
    var MSEk = ee.Number(ee.List(band).get(1));

    return gfs.divide(MSEk.sqrt());
  });

  // Take the log10 of all band values
  var xLog = x.map(function (y) {
    return ee.Number(y).log10();
  });

  // Sum the band values
  var xSum = xLog.reduce(ee.Reducer.sum());

  // 20 / number of bands
  var coeff = ee.Number(20).divide(referenceImage.bandNames().length());

  var psnr = coeff.multiply(xSum);

  return psnr;
};