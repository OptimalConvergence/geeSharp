# geeSharpening
Pan-sharpen multispectral imagery in GEE with one line of code:
```
var panSharpened = sharpening.PCA.sharpen(img.select(["B4", "B3", "B2",]), img.select(["B8"]);
```
 ![Example image](https://raw.githubusercontent.com/aazuspan/geeSharpening/main/sharpening_example.png)

Generate image quality metrics to validate sharpening results:
```
var imgPSNR = quality.PSNR.calculate(originalImage, panSharpened);
```

## Installation
- Visit https://code.earthengine.google.com/?accept_repo=users/aazuspan/geeSharpening. This will link the library to your GEE account, allowing you to import functions.
- Import sharpening functions by including `var sharpening = require("users/aazuspan/geeSharpening:sharpening");` in your script.
- Import image quality functions by including `var quality = require("users/aazuspan/geeSharpening:quality");` in your script.

## Usage
### Pan-sharpening
- Pan-sharpening can be used to sharpen the spatial resolution of spectral bands using a higher resolution image.
- To sharpen an image, call the appropriate sharpening function
  - `sharpening.PCA.sharpen(input, pan)`
  - `sharpening.GS.sharpen(input, pan)`
  - `sharpening.brovey.sharpen(input, pan, weights?)`
  - `sharpening.IHS.sharpen(input, pan)`
  - `sharpening.HPFA.sharpen(input, pan, kernelWidth?)`
  - `sharpening.simpleMean.sharpen(input, pan)`
- Pass the appropriate arguments for your imagery. See source code documentation for more info about each function's parameters.

#### Example
```
// Load the sharpening functions
var sharpening = require('users/aazuspan/geeSharpening:sharpening');

// Select an example Landsat 8 TOA image to sharpen
var inputImg = ee.Image("LANDSAT/LC08/C01/T1_TOA/LC08_047027_20160819");

// Select the 30 m spectral bands to sharpen
var inputBands = inputImg.select(["B4", "B3", "B2"]);

// Select the 15 m panchromatic band
var panBand = inputImg.select(["B8"]);

// Pan-sharpen using PCA
var sharpenedImg = sharpening.PCA.sharpen(inputBands, panBand);
```

### Image quality assessment
- Image quality metrics measure the distortion between a reference image and an image that has been modified, such as a pan-sharpened or compressed image. 
- To generate image quality metrics, call the appropriate quality calculation function using the original image (reference) and the modified image (assess).
  - `quality.MSE.calculate(reference, assess)`
  - `quality.PSNR.calculate(reference, assess)`

#### Example
```
// Load the image quality functions
var quality = require('users/aazuspan/geeSharpening:quality');

// Calculate peak signal-noise ratio between an image and a pan-sharpened image.
var pcaPSNR = quality.PSNR.calculate(originalImg, sharpenedImg);
```
  
## Disclaimer
- There is no guarantee of accuracy in this library. I would strongly recommend validating results against an established tool such as GDAL or SAGA GIS.
- Functions are designed for and tested with Landsat 8 TOA data. They should be usable with other data sources, but may require modification.
- Most sharpening functions will accept input images with any number of bands. However, algorithm accuracy may depend on spectral overlap between input bands and the panchromatic band. Make sure that the sharpening algorithm you select is compatible with your input imagery. 

## Contributing
- Pull requests and issues are welcome!

## References
* Gangkofner, U. G., Pradhan, P. S., & Holcomb, D. W. (2007). Optimizing the High-Pass Filter Addition Technique for Image Fusion. Photogrammetric Engineering & Remote Sensing, 73(9), 1107–1118. doi:10.14358/pers.73.9.1107
* Hagag, A., Amin, M., & Abd El-Samie, F. E. (2013). Multispectral image compression with band ordering and wavelet transforms. Signal, Image and Video Processing, 9(4), 769–778. doi:10.1007/s11760-013-0516-4 
* Hallabia, H., Kallel, A., & Ben Hamida, A. (2014). Image pansharpening: Comparison of methods based on multiresolution analysis and component substitution. 2014 1st International Conference on Advanced Technologies for Signal and Image Processing (ATSIP). doi:10.1109/atsip.2014.6834602
* Zhou Wang, & Bovik, A. C. (2002). A universal image quality index. IEEE Signal Processing Letters, 9(3), 81–84. doi:10.1109/97.995823 
