var mse = require("users/aazuspan/geeSharp:qualityAlgorithms/MSE.js");
var utils = require("users/aazuspan/geeSharp:utils.js");

// Dimensionless Global Relative Error of Synthesis (ERGAS) measures spectral distortion
// relative to the sharpening ratio. This compensates for the fact that larger increases in
// spatial resolution will typically result in greater spectral distortion. Values near to
// zero indiciate low distortion.

/**
 * Calculate dimensionless global relative error of synthsis (ERGAS) between a
 * reference image and a modified image. Values near 0 represent low error
 * between images.
 * @param {ee.Image} referenceImage An unmodified image.
 * @param {ee.Image} assessmentImage A version of the reference image that has
 *  been modified, such as through compression or pan-sharpening. ERGAS will be
 *  calculated between this image and the reference image.
 * @param {boolean, default false} perBand If true, ERGAS will be calculated
 *  band-wise and returned as a list. If false, the average ERGAS of all bands
 *  will be calculated and returned as a number.
 * @param {ee.Geometry, default null} geometry The region to calculate ERGAS
 *  for.
 * @param {ee.Number, default null} scale The scale, in projection units, to
 *  calculate ERGAS at.
 * @param {ee.Number, default 1000000000000} maxPixels The maximum number of
 *  pixels to sample.
 * @return {ee.Number | ee.List} Band average or per-band ERGAS for the image,
 *  depending on perBand.
 */
exports.calculate = function (
  referenceImage,
  assessmentImage,
  perBand,
  geometry,
  scale,
  maxPixels
) {
  // Default to returning image average
  if (utils.isMissing(perBand)) {
    perBand = false;
  }

  if (utils.isMissing(maxPixels)) {
    maxPixels = 1e12;
  }

  var mseBands = ee.Array(
    mse.calculate(
      referenceImage,
      assessmentImage,
      true,
      geometry,
      scale,
      maxPixels
    )
  );

  // Calculate the mean of each band
  var xbar = ee.Array(
    referenceImage
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: geometry,
        scale: scale,
        maxPixels: maxPixels,
      })
      .values()
  );

  var bandVals = mseBands.divide(xbar.pow(2)).sqrt();

  var h = assessmentImage.projection().nominalScale();
  var l = referenceImage.projection().nominalScale();

  var coeff = h.divide(l).multiply(100);

  var ergas = bandVals.multiply(coeff).toList();

  // If not per band, average all bands
  if (perBand === false) {
    ergas = ee.Number(ergas.reduce(ee.Reducer.mean()));
  }

  return ergas;
};
