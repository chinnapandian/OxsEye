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
 * TransformedImage injectable class
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLmNvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUUzQzs7R0FFRztBQUVILElBQWEsZ0JBQWdCO0lBQ3pCOzs7Ozs7T0FNRztJQUNILDBCQUFtQixRQUFnQixFQUFTLFFBQWdCLEVBQVMsYUFBcUIsRUFBUyxVQUFtQjtRQUFuRyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBUztJQUFJLENBQUM7SUFDL0gsdUJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLGdCQUFnQjtJQUQ1QixpQkFBVSxFQUFFOztHQUNBLGdCQUFnQixDQVM1QjtBQVRZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1lZEltYWdlIGluamVjdGFibGUgY2xhc3NcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybWVkSW1hZ2Uge1xuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBUcmFuc2Zvcm1lZEltYWdlLlxuICAgICAqIEBwYXJhbSBmaWxlTmFtZSBmaWxlIG5hbWVcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggZmlsZSBVUkkgcGF0aFxuICAgICAqIEBwYXJhbSB0aHVtYm5haWxQYXRoIHRodW1ibmFpbCBmaWxlIFVSSSBwYXRoXG4gICAgICogQHBhcmFtIGlzU2VsZWN0ZWQgQ29udGFpbnMgYm9vbGVhbiB2YWx1ZSB0byBpbmRpY2F0ZSB0aGUgaW1hZ2UgaXMgYmVlbiBzZWxlY3RlZCBvciBub3RcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZmlsZU5hbWU6IHN0cmluZywgcHVibGljIGZpbGVQYXRoOiBzdHJpbmcsIHB1YmxpYyB0aHVtYm5haWxQYXRoOiBzdHJpbmcsIHB1YmxpYyBpc1NlbGVjdGVkOiBib29sZWFuKSB7IH1cbn1cbiJdfQ==