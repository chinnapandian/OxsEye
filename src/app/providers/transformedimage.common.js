"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
/**
 * This is an injectable class contains image information like transformed image URI,
 * original captured image path, thumbnail image path and isSelected indication to
 * say this image is been selected or not.
 */
var TransformedImage = /** @class */ (function () {
    /**
     * Constructor for TransformedImage.
     * @param fileName file name
     * @param filePath file URI path
     * @param thumbnailPath thumbnail file URI path
     * @param isSelected Contains boolean value to indicate the image is been selected or not
     */
    function TransformedImage(fileName, filePath, thumbnailPath, isSelected, date, displayStyle) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
        this.isSelected = isSelected;
        this.date = date;
        this.displayStyle = displayStyle;
    }
    TransformedImage = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [String, String, String, Boolean, String, String])
    ], TransformedImage);
    return TransformedImage;
}());
exports.TransformedImage = TransformedImage;
