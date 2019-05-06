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
     * @TODO for testing
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
     * @TODO for testing.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFvRDtBQUVwRCx1REFBc0Q7QUFDdEQscUVBQTZEO0FBRTdELDBEQUE0RDtBQUU1RCwwQ0FBNEM7QUFFNUMsc0RBQXdEO0FBRXhEOztHQUVHO0FBRUgsSUFBYSx3QkFBd0I7SUFRakM7O09BRUc7SUFDSCxrQ0FBb0IsTUFBb0I7UUFBcEIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFDRDs7Ozs7O09BTUc7SUFDSCx1RUFBb0MsR0FBcEMsVUFBcUMsY0FBc0IsRUFBRSxjQUFtQjtRQUFoRixpQkE0Q0M7UUEzQ0csV0FBVyxDQUFDLGlCQUFpQixDQUN6QixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQjtZQUNsRCxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUNuRCwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM3QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztZQUMvQyxLQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNwQixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDO2dCQUNELElBQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO2dCQUM1QyxJQUFNLE9BQU8sR0FBRyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENB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QUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsSUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQywrQ0FBK0MsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoSCxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUxELGdEQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuL3RyYW5zZm9ybWVkaW1hZ2UuY29tbW9uJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5cbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbi8qKlxuICogVGhpcyBpcyBhIHByb3ZpZGVyIGNsYXNzIGNvbnRhaW5zIGNvbW1vbiBmdW5jdGlvbmFseXRpZXMgcmVsYXRlZCB0byBjYXB0dXJlZCBpbWFnZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VMaXN0OiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgY29udG91ciBpbWFnZXMgY2FwdHVyZWQgd2hpbGUgcGVyZm9ybWluZyB0cmFuc2Zvcm1hdGlvbi5cbiAgICAgKiBDdXJyZW50bHkgdGhpcyBpcyBub3QgYmVlbiB1c2VkLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb250b3VySW1hZ2VMaXN0OiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgYWxsIHRoZSB0aHVtYm5haWwgaW1hZ2VzIG9mIHRyYW5zZm9ybWVkIGltYWdlIGJ5IGNvbnRlbnQgcmVzb2x2ZXIgaW4gb3JkZXIgd2hhdFxuICAgICAqIGl0J3MgcGFyYW1ldGVyIGhhcyBhbmQgcG9wdWxhdGVzIHRoZSBpbWFnZSBsaXN0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzYyBPcmRlcmJ5IHZhbHVlICdBc2MnLydEZXNjJ1xuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eUxvYWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzYzogc3RyaW5nLCBhY3Rpdml0eUxvYWRlcjogYW55KSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSwgTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIldGh1bWJfUFRfSU1HJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBvcmRlckJ5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ3RodW1iX1BUX0lNRycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGdhbGxlcnkgaW1hZ2VzLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyBnYWxsZXJ5IGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRPRE86IHRoaXMgaXMgbm90IGJlZW4gdXNlZCBub3cuIGJ1dCBpZiBuZWVkZWQgbGF0ZXIgdW5jb21tZW50IGFuZCB1c2UgaXQuXG4gICAgICogTG9hZHMgcG9zc2libGUgY29udG91ciBpbWFnZXNcbiAgICAgKi9cbiAgICAvLyBMb2FkUG9zc2libGVDb250b3VySW1hZ2VzKCkge1xuXG4gICAgLy8gICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgIC8vICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAvLyAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgIC8vICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgIC8vICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgLy8gICAgICAgICAgICAgbGV0IGN1cnNvciA9IG51bGw7XG4gICAgLy8gICAgICAgICAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dDtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBXTtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICBsZXQgb3JkZXJCeSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERUQgKyBvcmRlckJ5QXNjRGVzYzsgLy9NZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5fSUQ7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIlY29udG91ckltYWdlJVwiJztcbiAgICAvLyAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBudWxsKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ2NvbnRvdXJJbWFnZScpKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGV0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIC8vICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgIC8vICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLicsICdsb25nJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyBjb250b3VyIGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgLy8gICAgICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAvLyAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYWxsIHRoZSB0ZW1wb3JhcnkgZmlsZXMgdXNlZCB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uLiBBY3R1YWxseSBpdCBjcmVhdGVzXG4gICAgICogc29tZSB0ZW1wb3JhcnkgZmlsZXMgYmVoaW5kIHRoZSBzY2VuZSB3aGVuIGl0IHBlcmZvcm1zIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIHVzaW5nIE9wZW5DViBBUEkuXG4gICAgICovXG4gICAgRGVsZXRlRmlsZXMoKSB7XG4gICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICBsZXQgb3JkZXJCeSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERUQgKyBvcmRlckJ5QXNjRGVzYzsgLy9NZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5fSUQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIlX1RFTVAlXCInO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlVXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgaW1hZ2VzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgdGVtcG9yYXJ5IGltYWdlcy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgdGVtcG9yYXJ5IGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZSBmaWxlIGZyb20gdGhlIGRpc2suXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZGVsZXRlRmlsZShmaWxlVVJJOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlVVJJKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVuYW1lcyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBuYW1lIHRvIGdpdmVuIG5hbWUuIFRoaXMgaXMgYmVlbiB1c2VkIHdoaWxlIHBlcmZvcm1pbmdcbiAgICAgKiBtYW51YWwgdHJhbnNmb3JtYXRpb24gdXNpbmcgT3BlbkNWIEFQSS4gQXMgaXQgY3JlYXRlcyB0ZW1wb3JhcnkgZmlsZXMgYmVoaW5kIHRoZSBzY2VuZSxcbiAgICAgKiBpdCBuZWVkcyB0byBiZSByZW5hbWVkIHRvIHJlZnJlc2ggdGhlIGZpbmFsIGltYWdlIGluIHRoZSB2aWV3LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBmaWxlVVJJIEltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSByZW5hbWVGaWxldG8gRmlsZW5hbWUgdG8gYmUgcmVuYW1lZCB0by5cbiAgICAgKi9cbiAgICByZW5hbWVGaWxlKGZpbGVVUkk6IHN0cmluZywgcmVuYW1lRmlsZXRvOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW5hbWUocmVuYW1lRmlsZXRvKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlVVJJKTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UocmVuYW1lRmlsZXRvKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSByZW5hbWluZyB0ZW1wb3JhcnkgZmlsZScpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcmVuYW1pbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBUT0RPIGZvciB0ZXN0aW5nXG4gICAgICogR2V0cyB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2l0aCByZWN0YW5nbGUuIEJ1dCB0aGlzIHdpbGwgbm90IGJlIHVzZWQgd2hlbiBpdCBnb2VzIHRvIHByb2R1Y3Rpb24uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2UgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAVE9ETyBmb3IgdGVzdGluZy5cbiAgICAgKiBHZXRzIHRoZSBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZS4gVGhpcyB3aWxsIGFsc28gYmUgbm90IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsXG4gICAgICAgIC8vICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgICAgICAvLyAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vIHJldHVybiB1cmk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgVVJJIGZvciB0aGUgY2FwdHVyZWQvdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbmV3RmlsZSBGaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyBVUkkgUmV0dXJucyB0aGUgVVJJIG9mIGdpdmVuIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIGdldFVSSUZvckZpbGUobmV3RmlsZTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG59XG4vKipcbiAqIEJyb2FkY2FzdCBpbWFnZSB0byBhY2Nlc3MgcHVibGljbHksIHNvIHRoYXQgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gYW55IGFwcC5cbiAqIFxuICogQHBhcmFtIGltZ1VSSSBJbWFnZSBmaWxlIFVSSVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSkge1xuICAgIGNvbnN0IGltYWdlRmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1nVVJJKTtcbiAgICBjb25zdCBjb250ZW50VXJpID0gYW5kcm9pZC5uZXQuVXJpLmZyb21GaWxlKGltYWdlRmlsZSk7XG4gICAgY29uc3QgbWVkaWFTY2FuSW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoJ2FuZHJvaWQuaW50ZW50LmFjdGlvbi5NRURJQV9TQ0FOTkVSX1NDQU5fRklMRScsIGNvbnRlbnRVcmkpO1xuICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5zZW5kQnJvYWRjYXN0KG1lZGlhU2NhbkludGVudCk7XG59XG4iXX0=