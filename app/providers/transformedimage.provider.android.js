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
var file_system_1 = require("tns-core-modules/file-system");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var transformedimage_common_1 = require("./transformedimage.common");
var application = require("tns-core-modules/application");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
/**
 * This is a provider class contains common functionalyties related to captured image.
 */
var TransformedImageProvider = (function () {
    /**
     * Constructor for TransformedImageProvider
     */
    function TransformedImageProvider(logger) {
        this.logger = logger;
        this.imageList = [];
        this.contourImageList = [];
    }
    /**
     * Loads all the thumbnail images of transformed image by content resolver in order what
     * it's parameter has and populates the image list.
     *
     * @param orderByAscDesc Orderby value 'Asc'/'Desc'
     * @param activityLoader ActivityLoader instance
     */
    TransformedImageProvider.prototype.loadThumbnailImagesByContentResolver = function (orderByAscDesc, activityLoader) {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
            var MediaStore = android.provider.MediaStore;
            _this.imageList = [];
            var cursor = null;
            try {
                var context = application.android.context;
                var columns = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
                var orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc;
                var uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                var where = MediaStore.MediaColumns.DATA + ' like "%thumb_PT_IMG%"';
                cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        var imageUri = cursor.getString(columnIndex) + '';
                        var name_1 = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
                        // let image = { fileUri: imageUri, text: name };
                        //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                        var thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                        _this.imageList.push(new transformedimage_common_1.TransformedImage(name_1, thumnailOrgPath, imageUri, false));
                        //   }
                    }
                }
                activityLoader.hide();
            }
            catch (error) {
                activityLoader.hide();
                Toast.makeText('Error while loading gallery images.', 'long').show();
                _this.logger.error('Error while loading gallery images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            _this.logger.error('Error in giving permission. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * TODO: this is not been used now. but if needed later uncomment and use it.
     * Loads possible contour images
     */
    // LoadPossibleContourImages() {
    //     this.contourImageList = [];
    //     Permissions.requestPermission(
    //         [android.Manifest.permission.READ_EXTERNAL_STORAGE,
    //         android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
    //         'Needed for sharing files').then(() => {
    //             const MediaStore = android.provider.MediaStore;
    //             let cursor = null;
    //             try {
    //                 const context = application.android.context;
    //                 const columns = [MediaStore.MediaColumns.DATA];
    //                 //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
    //                 const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
    //                 const where = MediaStore.MediaColumns.DATA + ' like "%contourImage%"';
    //                 cursor = context.getContentResolver().query(uri, columns, where, null, null);
    //                 if (cursor && cursor.getCount() > 0) {
    //                     while (cursor.moveToNext()) {
    //                         const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
    //                         const imageUri = cursor.getString(columnIndex) + '';
    //                         const name = imageUri.substring(imageUri.lastIndexOf('contourImage'));
    //                         // let image = { fileUri: imageUri, text: name };
    //                         //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
    //                         //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
    //                         this.contourImageList.push(new TransformedImage(
    //                             name,
    //                             imageUri,
    //                             imageUri,
    //                             false,
    //                         ));
    //                         //   }
    //                     }
    //                 }
    //                 //         activityLoader.hide();
    //             } catch (error) {
    //                 //           activityLoader.hide();
    //                 Toast.makeText('Error while loading contour images.', 'long').show();
    //                 this.logger.error('Error while loading contour images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //             }
    //         }).catch((error) => {
    //             //   activityLoader.hide();
    //             Toast.makeText('Error in giving permission.', 'long').show();
    //             this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //         });
    // }
    /**
     * Deletes all the temporary files used to perform transformation. Actually it creates
     * some temporary files behind the scene when it performs perspective transformation using OpenCV API.
     */
    TransformedImageProvider.prototype.DeleteFiles = function () {
        var _this = this;
        this.contourImageList = [];
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
            var MediaStore = android.provider.MediaStore;
            var cursor = null;
            try {
                var context = application.android.context;
                var columns = [MediaStore.MediaColumns.DATA];
                //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                var uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                var where = MediaStore.MediaColumns.DATA + ' like "%_TEMP%"';
                cursor = context.getContentResolver().query(uri, columns, where, null, null);
                if (cursor && cursor.getCount() > 0) {
                    var _loop_1 = function () {
                        var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        var imageUri = cursor.getString(columnIndex) + '';
                        var tempFile = file_system_1.File.fromPath(imageUri);
                        tempFile.remove()
                            .then(function () {
                            SendBroadcastImage(imageUri);
                        }).catch(function (error) {
                            Toast.makeText('Error while deleting temporary images').show();
                            _this.logger.error('Error while deleting temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    };
                    while (cursor.moveToNext()) {
                        _loop_1();
                    }
                }
            }
            catch (error) {
                //           activityLoader.hide();
                Toast.makeText('Error while loading temporary images.', 'long').show();
                _this.logger.error('Error while loading temporary images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            //   activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            _this.logger.error('Error in giving permission. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Deletes the selected image file from the disk.
     *
     * @param fileURI Image file path
     */
    TransformedImageProvider.prototype.deleteFile = function (fileURI) {
        var _this = this;
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.remove()
            .then(function () {
            SendBroadcastImage(fileURI);
        }).catch(function (error) {
            Toast.makeText('Error while deleting temporary files').show();
            _this.logger.error('Error while deleting temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Renames the transformed image file name to given name. This is been used while performing
     * manual transformation using OpenCV API. As it creates temporary files behind the scene,
     * it needs to be renamed to refresh the final image in the view.
     *
     * @param fileURI Image file path
     * @param renameFileto Filename to be renamed to.
     */
    TransformedImageProvider.prototype.renameFile = function (fileURI, renameFileto) {
        var _this = this;
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(function () {
            SendBroadcastImage(fileURI);
            SendBroadcastImage(renameFileto);
        }).catch(function (error) {
            Toast.makeText('Error while renaming temporary file').show();
            _this.logger.error('Error while renaming temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Gets the original image with rectangle. But this will not be used when it goes to production.
     * @param transformedImage Transformed image file path
     */
    TransformedImageProvider.prototype.getOriginalImageWithRectangle = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
        var imgFileNameOrg = transformedImage.substring(0, transformedImage.indexOf('_transformed')) + '_contour.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider',
        //  uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    };
    /**
     * Gets the original captured image. This will also be not used in production.
     * @param transformedImage Transformed image file path
     */
    TransformedImageProvider.prototype.getOriginalImage = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
        var imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context,
        //  'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider',
        //  uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    };
    /**
     * Gets the URI for the captured/transformed image file.
     *
     * @param newFile File name
     * @returns URI Returns the URI of given file name
     */
    TransformedImageProvider.prototype.getURIForFile = function (newFile) {
        var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    };
    return TransformedImageProvider;
}());
TransformedImageProvider = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [oxseyelogger_1.OxsEyeLogger])
], TransformedImageProvider);
exports.TransformedImageProvider = TransformedImageProvider;
/**
 * Broadcast image to access publicly, so that it will be available to any app.
 *
 * @param imgURI Image file URI
 */
function SendBroadcastImage(imgURI) {
    var imageFile = new java.io.File(imgURI);
    var contentUri = android.net.Uri.fromFile(imageFile);
    var mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
exports.SendBroadcastImage = SendBroadcastImage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFvRDtBQUVwRCx1REFBc0Q7QUFDdEQscUVBQTZEO0FBRTdELDBEQUE0RDtBQUU1RCwwQ0FBNEM7QUFFNUMsc0RBQXdEO0FBRXhEOztHQUVHO0FBRUgsSUFBYSx3QkFBd0I7SUFRakM7O09BRUc7SUFDSCxrQ0FBb0IsTUFBb0I7UUFBcEIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFDSCx1RUFBb0MsR0FBcEMsVUFBcUMsY0FBc0IsRUFBRSxjQUFtQjtRQUFoRixpQkE0Q0M7UUEzQ0csV0FBVyxDQUFDLGlCQUFpQixDQUN6QixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQjtZQUNsRCxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUNuRCwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUMvQyxLQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDO2dCQUNELElBQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUM1QyxJQUFNLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENB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LENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELElBQU0sZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsK0NBQStDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDaEgsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFMRCxnREFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwcm92aWRlciBjbGFzcyBjb250YWlucyBjb21tb24gZnVuY3Rpb25hbHl0aWVzIHJlbGF0ZWQgdG8gY2FwdHVyZWQgaW1hZ2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIge1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGltYWdlICovXG4gICAgcHVibGljIGltYWdlTGlzdDogYW55O1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGNvbnRvdXIgaW1hZ2VzIGNhcHR1cmVkIHdoaWxlIHBlcmZvcm1pbmcgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQ3VycmVudGx5IHRoaXMgaXMgbm90IGJlZW4gdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udG91ckltYWdlTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIpIHtcbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvYWRzIGFsbCB0aGUgdGh1bWJuYWlsIGltYWdlcyBvZiB0cmFuc2Zvcm1lZCBpbWFnZSBieSBjb250ZW50IHJlc29sdmVyIGluIG9yZGVyIHdoYXRcbiAgICAgKiBpdCdzIHBhcmFtZXRlciBoYXMgYW5kIHBvcHVsYXRlcyB0aGUgaW1hZ2UgbGlzdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gb3JkZXJCeUFzY0Rlc2MgT3JkZXJieSB2YWx1ZSAnQXNjJy8nRGVzYydcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHlMb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2M6IHN0cmluZywgYWN0aXZpdHlMb2FkZXI6IGFueSkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEsIE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERURdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJXRodW1iX1BUX0lNRyVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgb3JkZXJCeSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gaW1hZ2VVcmkuc3Vic3RyaW5nKGltYWdlVXJpLmxhc3RJbmRleE9mKCd0aHVtYl9QVF9JTUcnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGltYWdlID0geyBmaWxlVXJpOiBpbWFnZVVyaSwgdGV4dDogbmFtZSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBpZiAoaW1hZ2VVcmkuaW5kZXhPZignUFRfSU1HJykgPiAwICYmIGltYWdlVXJpLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBpbWFnZVVyaS5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyBnYWxsZXJ5IGltYWdlcy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgZ2FsbGVyeSBpbWFnZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUT0RPOiB0aGlzIGlzIG5vdCBiZWVuIHVzZWQgbm93LiBidXQgaWYgbmVlZGVkIGxhdGVyIHVuY29tbWVudCBhbmQgdXNlIGl0LlxuICAgICAqIExvYWRzIHBvc3NpYmxlIGNvbnRvdXIgaW1hZ2VzXG4gICAgICovXG4gICAgLy8gTG9hZFBvc3NpYmxlQ29udG91ckltYWdlcygpIHtcblxuICAgIC8vICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICAvLyAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgLy8gICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAvLyAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAvLyAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBNZWRpYVN0b3JlID0gYW5kcm9pZC5wcm92aWRlci5NZWRpYVN0b3JlO1xuICAgIC8vICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgIC8vICAgICAgICAgICAgIHRyeSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQV07XG4gICAgLy8gICAgICAgICAgICAgICAgIC8vICAgICAgbGV0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7IC8vTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuX0lEO1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJWNvbnRvdXJJbWFnZSVcIic7XG4gICAgLy8gICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gaW1hZ2VVcmkuc3Vic3RyaW5nKGltYWdlVXJpLmxhc3RJbmRleE9mKCdjb250b3VySW1hZ2UnKSk7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGltYWdlID0geyBmaWxlVXJpOiBpbWFnZVVyaSwgdGV4dDogbmFtZSB9O1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBpZiAoaW1hZ2VVcmkuaW5kZXhPZignUFRfSU1HJykgPiAwICYmIGltYWdlVXJpLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIGxldCB0aHVtbmFpbE9yZ1BhdGggPSBpbWFnZVVyaS5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgIC8vICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyBjb250b3VyIGltYWdlcy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgICAgIH1cblxuICAgIC8vICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgLy8gICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgLy8gICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicsICdsb25nJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgLy8gICAgICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIGFsbCB0aGUgdGVtcG9yYXJ5IGZpbGVzIHVzZWQgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbi4gQWN0dWFsbHkgaXQgY3JlYXRlc1xuICAgICAqIHNvbWUgdGVtcG9yYXJ5IGZpbGVzIGJlaGluZCB0aGUgc2NlbmUgd2hlbiBpdCBwZXJmb3JtcyBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLlxuICAgICAqL1xuICAgIERlbGV0ZUZpbGVzKCkge1xuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBNZWRpYVN0b3JlID0gYW5kcm9pZC5wcm92aWRlci5NZWRpYVN0b3JlO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQV07XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgbGV0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7IC8vTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuX0lEO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJV9URU1QJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZVVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltYWdlVXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGltYWdlcycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIHRlbXBvcmFyeSBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIHRlbXBvcmFyeSBpbWFnZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2UgZmlsZSBmcm9tIHRoZSBkaXNrLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBmaWxlVVJJIEltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIGRlbGV0ZUZpbGUoZmlsZVVSSTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVVSSSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbmFtZXMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGZpbGUgbmFtZSB0byBnaXZlbiBuYW1lLiBUaGlzIGlzIGJlZW4gdXNlZCB3aGlsZSBwZXJmb3JtaW5nXG4gICAgICogbWFudWFsIHRyYW5zZm9ybWF0aW9uIHVzaW5nIE9wZW5DViBBUEkuIEFzIGl0IGNyZWF0ZXMgdGVtcG9yYXJ5IGZpbGVzIGJlaGluZCB0aGUgc2NlbmUsXG4gICAgICogaXQgbmVlZHMgdG8gYmUgcmVuYW1lZCB0byByZWZyZXNoIHRoZSBmaW5hbCBpbWFnZSBpbiB0aGUgdmlldy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVuYW1lRmlsZXRvIEZpbGVuYW1lIHRvIGJlIHJlbmFtZWQgdG8uXG4gICAgICovXG4gICAgcmVuYW1lRmlsZShmaWxlVVJJOiBzdHJpbmcsIHJlbmFtZUZpbGV0bzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVuYW1lKHJlbmFtZUZpbGV0bylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVVSSSk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHJlbmFtZUZpbGV0byk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgcmVuYW1pbmcgdGVtcG9yYXJ5IGZpbGUnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHJlbmFtaW5nIHRlbXBvcmFyeSBmaWxlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBvcmlnaW5hbCBpbWFnZSB3aXRoIHJlY3RhbmdsZS4gQnV0IHRoaXMgd2lsbCBub3QgYmUgdXNlZCB3aGVuIGl0IGdvZXMgdG8gcHJvZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuXG4gICAgICAgIGNvbnN0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5zdWJzdHJpbmcoMCwgdHJhbnNmb3JtZWRJbWFnZS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAgICAgLy8gIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAvLyByZXR1cm4gdXJpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlLiBUaGlzIHdpbGwgYWxzbyBiZSBub3QgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIGdldE9yaWdpbmFsSW1hZ2UodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNL0NBTUVSQScsICcuJyk7XG5cbiAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCxcbiAgICAgICAgLy8gICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBVUkkgZm9yIHRoZSBjYXB0dXJlZC90cmFuc2Zvcm1lZCBpbWFnZSBmaWxlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuZXdGaWxlIEZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIFVSSSBSZXR1cm5zIHRoZSBVUkkgb2YgZ2l2ZW4gZmlsZSBuYW1lXG4gICAgICovXG4gICAgZ2V0VVJJRm9yRmlsZShuZXdGaWxlOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICByZXR1cm4gdXJpO1xuICAgIH1cbn1cbi8qKlxuICogQnJvYWRjYXN0IGltYWdlIHRvIGFjY2VzcyBwdWJsaWNseSwgc28gdGhhdCBpdCB3aWxsIGJlIGF2YWlsYWJsZSB0byBhbnkgYXBwLlxuICogXG4gKiBAcGFyYW0gaW1nVVJJIEltYWdlIGZpbGUgVVJJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKSB7XG4gICAgY29uc3QgaW1hZ2VGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWdVUkkpO1xuICAgIGNvbnN0IGNvbnRlbnRVcmkgPSBhbmRyb2lkLm5ldC5VcmkuZnJvbUZpbGUoaW1hZ2VGaWxlKTtcbiAgICBjb25zdCBtZWRpYVNjYW5JbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudCgnYW5kcm9pZC5pbnRlbnQuYWN0aW9uLk1FRElBX1NDQU5ORVJfU0NBTl9GSUxFJywgY29udGVudFVyaSk7XG4gICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LnNlbmRCcm9hZGNhc3QobWVkaWFTY2FuSW50ZW50KTtcbn1cbiJdfQ==