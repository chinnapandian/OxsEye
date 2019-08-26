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
var angular_1 = require("nativescript-i18n/angular");
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
    function TransformedImageProvider(logger, locale) {
        this.logger = logger;
        this.locale = locale;
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
                Toast.makeText(_this.locale.transform('error_while_loading_gallery_images'), 'long').show();
                _this.logger.error('Error while loading gallery images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            activityLoader.hide();
            Toast.makeText(_this.locale.transform('error_while_giving_permission'), 'long').show();
            _this.logger.error('Error in giving permission. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Loads possible contour images
     */
    TransformedImageProvider.prototype.LoadPossibleContourImages = function (fileName) {
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
                var where = MediaStore.MediaColumns.DATA + ' like "%' + fileName + 'transformed%"';
                cursor = context.getContentResolver().query(uri, columns, where, null, null);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        var imageUri = cursor.getString(columnIndex) + '';
                        var name_2 = imageUri.substring(imageUri.lastIndexOf('transformed'));
                        // let image = { fileUri: imageUri, text: name };
                        //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                        //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                        _this.contourImageList.push(new transformedimage_common_1.TransformedImage(name_2, imageUri, imageUri, false));
                        //   }
                    }
                }
                //         activityLoader.hide();
            }
            catch (error) {
                //           activityLoader.hide();
                Toast.makeText('Error while loading contour images.', 'long').show();
                _this.logger.error('Error while loading contour images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            //   activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            _this.logger.error('Error in giving permission. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
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
                            Toast.makeText(_this.locale.transform('error_while_deleting_temporary_images')).show();
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
                Toast.makeText(_this.locale.transform('error_while_loading_temporary_images'), 'long').show();
                _this.logger.error('Error while loading temporary images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            //   activityLoader.hide();
            Toast.makeText(_this.locale.transform('error_while_giving_permission'), 'long').show();
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
            Toast.makeText(_this.locale.transform('error_while_deleting_temporary_files')).show();
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
            Toast.makeText(_this.locale.transform('error_while_renaming_temporary_file')).show();
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
    __metadata("design:paramtypes", [typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object, angular_1.L])
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFvRDtBQUVwRCxxREFBOEM7QUFDOUMsdURBQXNEO0FBQ3RELHFFQUE2RDtBQUU3RCwwREFBNEQ7QUFFNUQsMENBQTRDO0FBRTVDLHNEQUF3RDtBQUV4RDs7R0FFRztBQUVILElBQWEsd0JBQXdCO0lBUWpDOztPQUVHO0lBQ0gsa0NBQW9CLE1BQW9CLEVBQ3BCLE1BQVM7UUFEVCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsdUVBQW9DLEdBQXBDLFVBQXFDLGNBQXNCLEVBQUUsY0FBbUI7UUFBaEYsaUJBNENDO1FBM0NHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FDekIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7WUFDbEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFDbkQsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDL0MsS0FBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQztnQkFDRCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsSUFBTSxPQUFPLEdBQUcsQ0FB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YSxHQUFiLFVBQWMsT0FBWTtRQUN0QixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoSSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUNuSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNMLCtCQUFDO0FBQUQsQ0FBQyxBQXBQRCxJQW9QQztBQXBQWSx3QkFBd0I7SUFEcEMsaUJBQVUsRUFBRTt5REFZbUIsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQVpwQix3QkFBd0IsQ0FvUHBDO0FBcFBZLDREQUF3QjtBQXFQckM7Ozs7R0FJRztBQUNILDRCQUFtQyxNQUFNO0lBQ3JDLElBQU0sU0FBUyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZELElBQU0sZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsK0NBQStDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDaEgsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFMRCxnREFLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwcm92aWRlciBjbGFzcyBjb250YWlucyBjb21tb24gZnVuY3Rpb25hbHl0aWVzIHJlbGF0ZWQgdG8gY2FwdHVyZWQgaW1hZ2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIge1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGltYWdlICovXG4gICAgcHVibGljIGltYWdlTGlzdDogYW55O1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGNvbnRvdXIgaW1hZ2VzIGNhcHR1cmVkIHdoaWxlIHBlcmZvcm1pbmcgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQ3VycmVudGx5IHRoaXMgaXMgbm90IGJlZW4gdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udG91ckltYWdlTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvYWRzIGFsbCB0aGUgdGh1bWJuYWlsIGltYWdlcyBvZiB0cmFuc2Zvcm1lZCBpbWFnZSBieSBjb250ZW50IHJlc29sdmVyIGluIG9yZGVyIHdoYXRcbiAgICAgKiBpdCdzIHBhcmFtZXRlciBoYXMgYW5kIHBvcHVsYXRlcyB0aGUgaW1hZ2UgbGlzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzYyBPcmRlcmJ5IHZhbHVlICdBc2MnLydEZXNjJ1xuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eUxvYWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzYzogc3RyaW5nLCBhY3Rpdml0eUxvYWRlcjogYW55KSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSwgTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIldGh1bWJfUFRfSU1HJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBvcmRlckJ5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ3RodW1iX1BUX0lNRycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfbG9hZGluZ19nYWxsZXJ5X2ltYWdlcycpLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgZ2FsbGVyeSBpbWFnZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgcG9zc2libGUgY29udG91ciBpbWFnZXNcbiAgICAgKi9cbiAgICBMb2FkUG9zc2libGVDb250b3VySW1hZ2VzKGZpbGVOYW1lOiBhbnkpIHtcblxuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBNZWRpYVN0b3JlID0gYW5kcm9pZC5wcm92aWRlci5NZWRpYVN0b3JlO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQV07XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgbGV0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7IC8vTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuX0lEO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJScrIGZpbGVOYW1lICsgJ3RyYW5zZm9ybWVkJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ3RyYW5zZm9ybWVkJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsZXQgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhbGwgdGhlIHRlbXBvcmFyeSBmaWxlcyB1c2VkIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24uIEFjdHVhbGx5IGl0IGNyZWF0ZXNcbiAgICAgKiBzb21lIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lIHdoZW4gaXQgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gdXNpbmcgT3BlbkNWIEFQSS5cbiAgICAgKi9cbiAgICBEZWxldGVGaWxlcygpIHtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVfVEVNUCVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZVVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ190ZW1wb3JhcnlfaW1hZ2VzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfbG9hZGluZ190ZW1wb3JhcnlfaW1hZ2VzJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyB0ZW1wb3JhcnkgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2l2aW5nX3Blcm1pc3Npb24nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZSBmaWxlIGZyb20gdGhlIGRpc2suXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBkZWxldGVGaWxlKGZpbGVVUkk6IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ190ZW1wb3JhcnlfZmlsZXMnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbmFtZXMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGZpbGUgbmFtZSB0byBnaXZlbiBuYW1lLiBUaGlzIGlzIGJlZW4gdXNlZCB3aGlsZSBwZXJmb3JtaW5nXG4gICAgICogbWFudWFsIHRyYW5zZm9ybWF0aW9uIHVzaW5nIE9wZW5DViBBUEkuIEFzIGl0IGNyZWF0ZXMgdGVtcG9yYXJ5IGZpbGVzIGJlaGluZCB0aGUgc2NlbmUsXG4gICAgICogaXQgbmVlZHMgdG8gYmUgcmVuYW1lZCB0byByZWZyZXNoIHRoZSBmaW5hbCBpbWFnZSBpbiB0aGUgdmlldy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlVVJJIEltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSByZW5hbWVGaWxldG8gRmlsZW5hbWUgdG8gYmUgcmVuYW1lZCB0by5cbiAgICAgKi9cbiAgICByZW5hbWVGaWxlKGZpbGVVUkk6IHN0cmluZywgcmVuYW1lRmlsZXRvOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW5hbWUocmVuYW1lRmlsZXRvKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlVVJJKTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UocmVuYW1lRmlsZXRvKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfcmVuYW1pbmdfdGVtcG9yYXJ5X2ZpbGUnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSByZW5hbWluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2l0aCByZWN0YW5nbGUuIEJ1dCB0aGlzIHdpbGwgbm90IGJlIHVzZWQgd2hlbiBpdCBnb2VzIHRvIHByb2R1Y3Rpb24uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2UgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZS4gVGhpcyB3aWxsIGFsc28gYmUgbm90IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsXG4gICAgICAgIC8vICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgICAgICAvLyAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vIHJldHVybiB1cmk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgVVJJIGZvciB0aGUgY2FwdHVyZWQvdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBuZXdGaWxlIEZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIFVSSSBSZXR1cm5zIHRoZSBVUkkgb2YgZ2l2ZW4gZmlsZSBuYW1lXG4gICAgICovXG4gICAgZ2V0VVJJRm9yRmlsZShuZXdGaWxlOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICByZXR1cm4gdXJpO1xuICAgIH1cbn1cbi8qKlxuICogQnJvYWRjYXN0IGltYWdlIHRvIGFjY2VzcyBwdWJsaWNseSwgc28gdGhhdCBpdCB3aWxsIGJlIGF2YWlsYWJsZSB0byBhbnkgYXBwLlxuICpcbiAqIEBwYXJhbSBpbWdVUkkgSW1hZ2UgZmlsZSBVUklcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpIHtcbiAgICBjb25zdCBpbWFnZUZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltZ1VSSSk7XG4gICAgY29uc3QgY29udGVudFVyaSA9IGFuZHJvaWQubmV0LlVyaS5mcm9tRmlsZShpbWFnZUZpbGUpO1xuICAgIGNvbnN0IG1lZGlhU2NhbkludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KCdhbmRyb2lkLmludGVudC5hY3Rpb24uTUVESUFfU0NBTk5FUl9TQ0FOX0ZJTEUnLCBjb250ZW50VXJpKTtcbiAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuc2VuZEJyb2FkY2FzdChtZWRpYVNjYW5JbnRlbnQpO1xufVxuIl19