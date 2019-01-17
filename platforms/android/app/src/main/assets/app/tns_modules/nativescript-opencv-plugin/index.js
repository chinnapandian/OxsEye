var application = require("application");
var context = application.android.context;
var opencv;
module.exports = {
    initOpenCV: function() {
        opencv = new com.maas.opencv4nativescript.OpenCVUtils(context);
        return opencv;
    },
    performPerspectiveTransformation:  function(imgURI, transformedFilePath) {
        var imgURI =    com.maas.opencv4nativescript.OpenCVUtils.performPerspectiveCorrection(imgURI,"A", transformedFilePath);
        return imgURI;
    },
    performPerspectiveTransformationForWrappedImage:  function(imgURI) {
        var wrappedImg =    com.maas.opencv4nativescript.OpenCVUtils.performPerspectiveCorrection(imgURI);
        return wrappedImg;
    },
    performAdaptiveThreshold: function(wrappedImg, fileName, thresholdBlockSize) {
        var imgURI = com.maas.opencv4nativescript.OpenCVUtils.performAdaptiveThreshold(wrappedImg, fileName, thresholdBlockSize);
        return imgURI;
    },
    getFileName: function(imgURI) {
        var fileName = com.maas.opencv4nativescript.OpenCVUtils.getFileName(imgURI);
        return fileName;
    },
    sendEmail: function(imgURI, imgURISrc) {
        var result = com.maas.opencv4nativescript.OpenCVUtils.sendEmail(imgURI, imgURISrc);
        return result;
    },
    createThumbnailImage: function(imgURI) {
        var result = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
        return result;
    }
};