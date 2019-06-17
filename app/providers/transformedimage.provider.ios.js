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
                    while (cursor.moveToNext()) {
                        var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        var imageUri = cursor.getString(columnIndex) + '';
                        var tempFile = file_system_1.File.fromPath(imageUri);
                        tempFile.remove()
                            .then(function () {
                            // SendBroadcastImage(imageUri);
                        }).catch(function (error) {
                            Toast.makeText('Error while deleting temporary images').show();
                            _this.logger.error('Error while deleting temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
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
            // SendBroadcastImage(fileURI);
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
            // SendBroadcastImage(fileURI);
            // SendBroadcastImage(renameFileto);
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
    __metadata("design:paramtypes", [typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object])
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
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyLmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUMzQyw0REFBb0Q7QUFFcEQsdURBQXNEO0FBQ3RELHFFQUE2RDtBQUU3RCwwREFBNEQ7QUFFNUQsMENBQTRDO0FBRTVDLHNEQUF3RDtBQUV4RDs7R0FFRztBQUVILElBQWEsd0JBQXdCO0lBUWpDOztPQUVHO0lBQ0gsa0NBQW9CLE1BQW9CO1FBQXBCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFDcEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsdUVBQW9DLEdBQXBDLFVBQXFDLGNBQXNCLEVBQUUsY0FBbUI7UUFBaEYsaUJBNENDO1FBM0NHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FDekIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7WUFDbEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFDbkQsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDL0MsS0FBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQztnQkFDRCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsSUFBTSxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDLFVBQVUs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QUMsTUFBTSxDQUFDLCtDQUErQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2hILFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBTEQsZ0RBS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5cbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4vdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcblxuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgcHJvdmlkZXIgY2xhc3MgY29udGFpbnMgY29tbW9uIGZ1bmN0aW9uYWx5dGllcyByZWxhdGVkIHRvIGNhcHR1cmVkIGltYWdlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBpbWFnZSAqL1xuICAgIHB1YmxpYyBpbWFnZUxpc3Q6IGFueTtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBjb250b3VyIGltYWdlcyBjYXB0dXJlZCB3aGlsZSBwZXJmb3JtaW5nIHRyYW5zZm9ybWF0aW9uLlxuICAgICAqIEN1cnJlbnRseSB0aGlzIGlzIG5vdCBiZWVuIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRvdXJJbWFnZUxpc3Q6IGFueTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhbGwgdGhlIHRodW1ibmFpbCBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2UgYnkgY29udGVudCByZXNvbHZlciBpbiBvcmRlciB3aGF0XG4gICAgICogaXQncyBwYXJhbWV0ZXIgaGFzIGFuZCBwb3B1bGF0ZXMgdGhlIGltYWdlIGxpc3QuXG4gICAgICogXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjIE9yZGVyYnkgdmFsdWUgJ0FzYycvJ0Rlc2MnXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIEFjdGl2aXR5TG9hZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgbG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjOiBzdHJpbmcsIGFjdGl2aXR5TG9hZGVyOiBhbnkpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBNZWRpYVN0b3JlID0gYW5kcm9pZC5wcm92aWRlci5NZWRpYVN0b3JlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBLCBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEXTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3JkZXJCeSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERUQgKyBvcmRlckJ5QXNjRGVzYztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiV0aHVtYl9QVF9JTUclXCInO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG9yZGVyQnkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGltYWdlVXJpLnN1YnN0cmluZyhpbWFnZVVyaS5sYXN0SW5kZXhPZigndGh1bWJfUFRfSU1HJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1uYWlsT3JnUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgZ2FsbGVyeSBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGdhbGxlcnkgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVE9ETzogdGhpcyBpcyBub3QgYmVlbiB1c2VkIG5vdy4gYnV0IGlmIG5lZWRlZCBsYXRlciB1bmNvbW1lbnQgYW5kIHVzZSBpdC5cbiAgICAgKiBMb2FkcyBwb3NzaWJsZSBjb250b3VyIGltYWdlc1xuICAgICAqL1xuICAgIC8vIExvYWRQb3NzaWJsZUNvbnRvdXJJbWFnZXMoKSB7XG5cbiAgICAvLyAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgLy8gICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgIC8vICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgLy8gICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgLy8gICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAvLyAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAvLyAgICAgICAgICAgICB0cnkge1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVjb250b3VySW1hZ2UlXCInO1xuICAgIC8vICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGltYWdlVXJpLnN1YnN0cmluZyhpbWFnZVVyaS5sYXN0SW5kZXhPZignY29udG91ckltYWdlJykpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsZXQgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAvLyAgICAgICAgICAgICB9XG5cbiAgICAvLyAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIC8vICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgIC8vICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhbGwgdGhlIHRlbXBvcmFyeSBmaWxlcyB1c2VkIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24uIEFjdHVhbGx5IGl0IGNyZWF0ZXNcbiAgICAgKiBzb21lIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lIHdoZW4gaXQgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gdXNpbmcgT3BlbkNWIEFQSS5cbiAgICAgKi9cbiAgICBEZWxldGVGaWxlcygpIHtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVfVEVNUCVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZVVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBpbWFnZXMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyB0ZW1wb3JhcnkgaW1hZ2VzLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyB0ZW1wb3JhcnkgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlIGZpbGUgZnJvbSB0aGUgZGlzay5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBkZWxldGVGaWxlKGZpbGVVUkk6IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIG5hbWUgdG8gZ2l2ZW4gbmFtZS4gVGhpcyBpcyBiZWVuIHVzZWQgd2hpbGUgcGVyZm9ybWluZ1xuICAgICAqIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLiBBcyBpdCBjcmVhdGVzIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lLFxuICAgICAqIGl0IG5lZWRzIHRvIGJlIHJlbmFtZWQgdG8gcmVmcmVzaCB0aGUgZmluYWwgaW1hZ2UgaW4gdGhlIHZpZXcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIHJlbmFtZUZpbGV0byBGaWxlbmFtZSB0byBiZSByZW5hbWVkIHRvLlxuICAgICAqL1xuICAgIHJlbmFtZUZpbGUoZmlsZVVSSTogc3RyaW5nLCByZW5hbWVGaWxldG86IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbmFtZShyZW5hbWVGaWxldG8pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShyZW5hbWVGaWxldG8pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHJlbmFtaW5nIHRlbXBvcmFyeSBmaWxlJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSByZW5hbWluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2l0aCByZWN0YW5nbGUuIEJ1dCB0aGlzIHdpbGwgbm90IGJlIHVzZWQgd2hlbiBpdCBnb2VzIHRvIHByb2R1Y3Rpb24uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2UgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZS4gVGhpcyB3aWxsIGFsc28gYmUgbm90IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsXG4gICAgICAgIC8vICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgICAgICAvLyAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vIHJldHVybiB1cmk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgVVJJIGZvciB0aGUgY2FwdHVyZWQvdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gbmV3RmlsZSBGaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyBVUkkgUmV0dXJucyB0aGUgVVJJIG9mIGdpdmVuIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIGdldFVSSUZvckZpbGUobmV3RmlsZTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG59XG4vKipcbiAqIEJyb2FkY2FzdCBpbWFnZSB0byBhY2Nlc3MgcHVibGljbHksIHNvIHRoYXQgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gYW55IGFwcC5cbiAqIFxuICogQHBhcmFtIGltZ1VSSSBJbWFnZSBmaWxlIFVSSVxuICovXG5leHBvcnQgZnVuY3Rpb24gU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSkge1xuICAgIGNvbnN0IGltYWdlRmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1nVVJJKTtcbiAgICBjb25zdCBjb250ZW50VXJpID0gYW5kcm9pZC5uZXQuVXJpLmZyb21GaWxlKGltYWdlRmlsZSk7XG4gICAgY29uc3QgbWVkaWFTY2FuSW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoJ2FuZHJvaWQuaW50ZW50LmFjdGlvbi5NRURJQV9TQ0FOTkVSX1NDQU5fRklMRScsIGNvbnRlbnRVcmkpO1xuICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5zZW5kQnJvYWRjYXN0KG1lZGlhU2NhbkludGVudCk7XG59XG4iXX0=