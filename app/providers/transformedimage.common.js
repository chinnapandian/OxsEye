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
 * TransformedImage class
 */
var TransformedImage = (function () {
    /**
     * Constructor for TransformedImage.
     * @param fileName
     * @param filePath
     * @param thumbnailPath
     * @param isSelected
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5jb21tb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLmNvbW1vbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUUzQzs7R0FFRztBQUVILElBQWEsZ0JBQWdCO0lBQ3pCOzs7Ozs7T0FNRztJQUNILDBCQUFtQixRQUFnQixFQUFTLFFBQWdCLEVBQVMsYUFBcUIsRUFBUyxVQUFtQjtRQUFuRyxhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLGtCQUFhLEdBQWIsYUFBYSxDQUFRO1FBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBUztJQUFJLENBQUM7SUFDL0gsdUJBQUM7QUFBRCxDQUFDLEFBVEQsSUFTQztBQVRZLGdCQUFnQjtJQUQ1QixpQkFBVSxFQUFFOztHQUNBLGdCQUFnQixDQVM1QjtBQVRZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuLyoqXG4gKiBUcmFuc2Zvcm1lZEltYWdlIGNsYXNzXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1lZEltYWdlIHtcbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgVHJhbnNmb3JtZWRJbWFnZS5cbiAgICAgKiBAcGFyYW0gZmlsZU5hbWUgXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIFxuICAgICAqIEBwYXJhbSB0aHVtYm5haWxQYXRoIFxuICAgICAqIEBwYXJhbSBpc1NlbGVjdGVkIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBmaWxlTmFtZTogc3RyaW5nLCBwdWJsaWMgZmlsZVBhdGg6IHN0cmluZywgcHVibGljIHRodW1ibmFpbFBhdGg6IHN0cmluZywgcHVibGljIGlzU2VsZWN0ZWQ6IGJvb2xlYW4pIHsgfVxufVxuIl19