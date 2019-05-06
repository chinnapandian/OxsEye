"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
/**
 * This is an injectable class contains image information like transformed image URI,
 * original captured image path, thumbnail image path and isSelected indication to
 * say this image is been selected or not.
 */
var TransformedImage = (function () {
    /**
     * Constructor for TransformedImage.
     * @param fileName file name
     * @param filePath file URI path
     * @param thumbnailPath thumbnail file URI path
     * @param isSelected Contains boolean value to indicate the image is been selected or not
     */
    function TransformedImage(fileName, filePath, thumbnailPath, isSelected) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
        this.isSelected = isSelected;
    }
    return TransformedImage;
}());
TransformedImage = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [String, String, String, Boolean])
], TransformedImage);
exports.TransformedImage = TransformedImage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLmNvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUUzQzs7OztHQUlHO0FBRUgsSUFBYSxnQkFBZ0I7SUFDekI7Ozs7OztPQU1HO0lBQ0gsMEJBQW1CLFFBQWdCLEVBQVMsUUFBZ0IsRUFBUyxhQUFxQixFQUFTLFVBQW1CO1FBQW5HLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsa0JBQWEsR0FBYixhQUFhLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFTO0lBQUksQ0FBQztJQUMvSCx1QkFBQztBQUFELENBQUMsQUFURCxJQVNDO0FBVFksZ0JBQWdCO0lBRDVCLGlCQUFVLEVBQUU7O0dBQ0EsZ0JBQWdCLENBUzVCO0FBVFksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIFRoaXMgaXMgYW4gaW5qZWN0YWJsZSBjbGFzcyBjb250YWlucyBpbWFnZSBpbmZvcm1hdGlvbiBsaWtlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSxcbiAqIG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlIHBhdGgsIHRodW1ibmFpbCBpbWFnZSBwYXRoIGFuZCBpc1NlbGVjdGVkIGluZGljYXRpb24gdG9cbiAqIHNheSB0aGlzIGltYWdlIGlzIGJlZW4gc2VsZWN0ZWQgb3Igbm90LlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtZWRJbWFnZSB7XG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2UuXG4gICAgICogQHBhcmFtIGZpbGVOYW1lIGZpbGUgbmFtZVxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCBmaWxlIFVSSSBwYXRoXG4gICAgICogQHBhcmFtIHRodW1ibmFpbFBhdGggdGh1bWJuYWlsIGZpbGUgVVJJIHBhdGhcbiAgICAgKiBAcGFyYW0gaXNTZWxlY3RlZCBDb250YWlucyBib29sZWFuIHZhbHVlIHRvIGluZGljYXRlIHRoZSBpbWFnZSBpcyBiZWVuIHNlbGVjdGVkIG9yIG5vdFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBmaWxlTmFtZTogc3RyaW5nLCBwdWJsaWMgZmlsZVBhdGg6IHN0cmluZywgcHVibGljIHRodW1ibmFpbFBhdGg6IHN0cmluZywgcHVibGljIGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHsgfVxufVxuIl19