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
    // private isContourRequiredOld = true;
    /**
     * Constructor for TransformedImageProvider
     */
    function TransformedImageProvider(logger, locale) {
        this.logger = logger;
        this.locale = locale;
        this.imagesCount = 0;
        this.cameraLightThresholdValue = 0;
        this.cameraLightTimeOutValue = 0;
        this.adaptiveThresholdValue = 0;
        this.isContourRequired = true;
        this.imageList = [];
        this.contourImageList = [];
        this.isImageCountOnly = false;
    }
    TransformedImageProvider.prototype.populateImageList = function (cursor, mediaStore) {
        while (cursor.moveToNext()) {
            var columnIndex = cursor.getColumnIndex(mediaStore.MediaColumns.DATA);
            var imageUri = cursor.getString(columnIndex) + '';
            var name_1 = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
            // let image = { fileUri: imageUri, text: name };
            //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
            var thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
            this.imageList.push(new transformedimage_common_1.TransformedImage(name_1, thumnailOrgPath, imageUri, false));
        }
    };
    /**
     * Loads all the thumbnail images of transformed image by content resolver in order what
     * it's parameter has and populates the image list.
     *
     * @param orderByAscDesc Orderby value 'Asc'/'Desc'
     * @param activityLoader ActivityLoader instance
     */
    TransformedImageProvider.prototype.loadThumbnailImagesByContentResolver = function (orderByAscDesc, activityLoader, view) {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
            var mediaStore = android.provider.MediaStore;
            _this.imageList = [];
            var cursor = null;
            try {
                var context = application.android.context;
                var columns = [mediaStore.MediaColumns.DATA, mediaStore.MediaColumns.DATE_ADDED];
                var orderBy = mediaStore.MediaColumns.DATE_ADDED + orderByAscDesc;
                var uri = mediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                var where = mediaStore.MediaColumns.DATA + ' like "%thumb_PT_IMG%"';
                cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
                if (cursor && cursor.getCount() > 0) {
                    if (_this.isImageCountOnly) {
                        _this.imagesCount = 0;
                        _this.imagesCount = cursor.getCount();
                        if (view) {
                            view.setText(_this.imagesCount + '');
                            view.setVisibility(android.view.View.VISIBLE);
                        }
                        console.log('Image count.. :' + _this.imagesCount);
                    }
                    else {
                        _this.populateImageList(cursor, mediaStore);
                    }
                    _this.isImageCountOnly = false;
                }
                else {
                    if (view) {
                        view.setText('0');
                        view.setVisibility(android.view.View.INVISIBLE);
                    }
                    _this.imagesCount = 0;
                    _this.imageList = [];
                    _this.isImageCountOnly = false;
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
     * Gets count of transformed image by content resolver in order what
     * it's parameter has and returns the image list count.
     *
     * @param orderByAscDesc Orderby value 'Asc'/'Desc'
     * @param activityLoader ActivityLoader instance
     *
     * @returns captured images count
     */
    TransformedImageProvider.prototype.getThumbnailImagesCountByContentResolver = function (orderByAscDesc, activityLoader, view) {
        this.isImageCountOnly = true;
        this.loadThumbnailImagesByContentResolver(orderByAscDesc, activityLoader, view);
        console.log('Image count..1 :' + this.imagesCount);
        // return this.imageCount;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFvRDtBQUVwRCxxREFBOEM7QUFDOUMsdURBQXNEO0FBQ3RELHFFQUE2RDtBQUU3RCwwREFBNEQ7QUFFNUQsMENBQTRDO0FBRTVDLHNEQUF3RDtBQUV4RDs7R0FFRztBQUVILElBQWEsd0JBQXdCO0lBaUJqQyx1Q0FBdUM7SUFFdkM7O09BRUc7SUFDSCxrQ0FBb0IsTUFBb0IsRUFDNUIsTUFBUztRQURELFdBQU0sR0FBTixNQUFNLENBQWM7UUFDNUIsV0FBTSxHQUFOLE1BQU0sQ0FBRztRQWZkLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBS2YsOEJBQXlCLEdBQUcsQ0FBQyxDQUFDO1FBQzlCLDRCQUF1QixHQUFHLENBQUMsQ0FBQztRQUM1QiwyQkFBc0IsR0FBRyxDQUFDLENBQUM7UUFDM0Isc0JBQWlCLEdBQUcsSUFBSSxDQUFDO1FBUTdCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEtBQUssQ0FBQztJQUNsQyxDQUFDO0lBQ08sb0RBQWlCLEdBQXpCLFVBQTBCLE1BQVcsRUFBRSxVQUFlO1FBQ2xELE9BQU8sTUFBTSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDekIsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hFLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3BELElBQU0sTUFBSSxHQUFH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QUNyQyxJQUFNLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzNDLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN2RCxJQUFNLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLCtDQUErQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ2hILFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBTEQsZ0RBS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4vdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcblxuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcblxuLyoqXG4gKiBUaGlzIGlzIGEgcHJvdmlkZXIgY2xhc3MgY29udGFpbnMgY29tbW9uIGZ1bmN0aW9uYWx5dGllcyByZWxhdGVkIHRvIGNhcHR1cmVkIGltYWdlLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBpbWFnZSAqL1xuICAgIHB1YmxpYyBpbWFnZUxpc3Q6IGFueTtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBjb250b3VyIGltYWdlcyBjYXB0dXJlZCB3aGlsZSBwZXJmb3JtaW5nIHRyYW5zZm9ybWF0aW9uLlxuICAgICAqIEN1cnJlbnRseSB0aGlzIGlzIG5vdCBiZWVuIHVzZWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRvdXJJbWFnZUxpc3Q6IGFueTtcblxuICAgIHB1YmxpYyBpbWFnZXNDb3VudCA9IDA7XG5cbiAgICBwcml2YXRlIGlzSW1hZ2VDb3VudE9ubHk6IGFueTtcblxuXG4gICAgcHJpdmF0ZSBjYW1lcmFMaWdodFRocmVzaG9sZFZhbHVlID0gMDtcbiAgICBwcml2YXRlIGNhbWVyYUxpZ2h0VGltZU91dFZhbHVlID0gMDtcbiAgICBwcml2YXRlIGFkYXB0aXZlVGhyZXNob2xkVmFsdWUgPSAwO1xuICAgIHByaXZhdGUgaXNDb250b3VyUmVxdWlyZWQgPSB0cnVlO1xuICAgIC8vIHByaXZhdGUgaXNDb250b3VyUmVxdWlyZWRPbGQgPSB0cnVlO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgIHByaXZhdGUgbG9jYWxlOiBMKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmlzSW1hZ2VDb3VudE9ubHkgPSBmYWxzZTtcbiAgICB9XG4gICAgcHJpdmF0ZSBwb3B1bGF0ZUltYWdlTGlzdChjdXJzb3I6IGFueSwgbWVkaWFTdG9yZTogYW55KSB7XG4gICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChtZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ3RodW1iX1BUX0lNRycpKTtcbiAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAgICAgICAgIC8vICBpZiAoaW1hZ2VVcmkuaW5kZXhPZignUFRfSU1HJykgPiAwICYmIGltYWdlVXJpLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhbGwgdGhlIHRodW1ibmFpbCBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2UgYnkgY29udGVudCByZXNvbHZlciBpbiBvcmRlciB3aGF0XG4gICAgICogaXQncyBwYXJhbWV0ZXIgaGFzIGFuZCBwb3B1bGF0ZXMgdGhlIGltYWdlIGxpc3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3JkZXJCeUFzY0Rlc2MgT3JkZXJieSB2YWx1ZSAnQXNjJy8nRGVzYydcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHlMb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2M6IHN0cmluZywgYWN0aXZpdHlMb2FkZXI6IGFueSwgdmlldzogYW55KSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbbWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSwgbWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyQnkgPSBtZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IG1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IG1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIldGh1bWJfUFRfSU1HJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBvcmRlckJ5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzSW1hZ2VDb3VudE9ubHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gY3Vyc29yLmdldENvdW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZpZXcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zZXRUZXh0KHRoaXMuaW1hZ2VzQ291bnQgKyAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zZXRWaXNpYmlsaXR5KGFuZHJvaWQudmlldy5WaWV3LlZJU0lCTEUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW1hZ2UgY291bnQuLiA6JyArIHRoaXMuaW1hZ2VzQ291bnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvcHVsYXRlSW1hZ2VMaXN0KGN1cnNvciwgbWVkaWFTdG9yZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW1hZ2VDb3VudE9ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2aWV3KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zZXRUZXh0KCcwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5zZXRWaXNpYmlsaXR5KGFuZHJvaWQudmlldy5WaWV3LklOVklTSUJMRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlc0NvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzSW1hZ2VDb3VudE9ubHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2xvYWRpbmdfZ2FsbGVyeV9pbWFnZXMnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGdhbGxlcnkgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9naXZpbmdfcGVybWlzc2lvbicpLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgY291bnQgb2YgdHJhbnNmb3JtZWQgaW1hZ2UgYnkgY29udGVudCByZXNvbHZlciBpbiBvcmRlciB3aGF0XG4gICAgICogaXQncyBwYXJhbWV0ZXIgaGFzIGFuZCByZXR1cm5zIHRoZSBpbWFnZSBsaXN0IGNvdW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjIE9yZGVyYnkgdmFsdWUgJ0FzYycvJ0Rlc2MnXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIEFjdGl2aXR5TG9hZGVyIGluc3RhbmNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBjYXB0dXJlZCBpbWFnZXMgY291bnRcbiAgICAgKi9cbiAgICBnZXRUaHVtYm5haWxJbWFnZXNDb3VudEJ5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjOiBzdHJpbmcsIGFjdGl2aXR5TG9hZGVyOiBhbnksIHZpZXc6IGFueSkge1xuICAgICAgICB0aGlzLmlzSW1hZ2VDb3VudE9ubHkgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzYywgYWN0aXZpdHlMb2FkZXIsIHZpZXcpO1xuICAgICAgICBjb25zb2xlLmxvZygnSW1hZ2UgY291bnQuLjEgOicgKyB0aGlzLmltYWdlc0NvdW50KTtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuaW1hZ2VDb3VudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgcG9zc2libGUgY29udG91ciBpbWFnZXNcbiAgICAgKi9cbiAgICBMb2FkUG9zc2libGVDb250b3VySW1hZ2VzKGZpbGVOYW1lOiBhbnkpIHtcblxuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBNZWRpYVN0b3JlID0gYW5kcm9pZC5wcm92aWRlci5NZWRpYVN0b3JlO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQV07XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgbGV0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7IC8vTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuX0lEO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJScgKyBmaWxlTmFtZSArICd0cmFuc2Zvcm1lZCVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gaW1hZ2VVcmkuc3Vic3RyaW5nKGltYWdlVXJpLmxhc3RJbmRleE9mKCd0cmFuc2Zvcm1lZCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgbGV0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyBjb250b3VyIGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYWxsIHRoZSB0ZW1wb3JhcnkgZmlsZXMgdXNlZCB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uLiBBY3R1YWxseSBpdCBjcmVhdGVzXG4gICAgICogc29tZSB0ZW1wb3JhcnkgZmlsZXMgYmVoaW5kIHRoZSBzY2VuZSB3aGVuIGl0IHBlcmZvcm1zIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIHVzaW5nIE9wZW5DViBBUEkuXG4gICAgICovXG4gICAgRGVsZXRlRmlsZXMoKSB7XG4gICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvciA9IG51bGw7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICBsZXQgb3JkZXJCeSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERUQgKyBvcmRlckJ5QXNjRGVzYzsgLy9NZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5fSUQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIlX1RFTVAlXCInO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlVXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGVtcG9yYXJ5X2ltYWdlcycpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2xvYWRpbmdfdGVtcG9yYXJ5X2ltYWdlcycpLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgdGVtcG9yYXJ5IGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2UgZmlsZSBmcm9tIHRoZSBkaXNrLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZGVsZXRlRmlsZShmaWxlVVJJOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlVVJJKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGVtcG9yYXJ5X2ZpbGVzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIG5hbWUgdG8gZ2l2ZW4gbmFtZS4gVGhpcyBpcyBiZWVuIHVzZWQgd2hpbGUgcGVyZm9ybWluZ1xuICAgICAqIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLiBBcyBpdCBjcmVhdGVzIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lLFxuICAgICAqIGl0IG5lZWRzIHRvIGJlIHJlbmFtZWQgdG8gcmVmcmVzaCB0aGUgZmluYWwgaW1hZ2UgaW4gdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVuYW1lRmlsZXRvIEZpbGVuYW1lIHRvIGJlIHJlbmFtZWQgdG8uXG4gICAgICovXG4gICAgcmVuYW1lRmlsZShmaWxlVVJJOiBzdHJpbmcsIHJlbmFtZUZpbGV0bzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVuYW1lKHJlbmFtZUZpbGV0bylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVVSSSk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHJlbmFtZUZpbGV0byk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX3JlbmFtaW5nX3RlbXBvcmFyeV9maWxlJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcmVuYW1pbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG9yaWdpbmFsIGltYWdlIHdpdGggcmVjdGFuZ2xlLiBCdXQgdGhpcyB3aWxsIG5vdCBiZSB1c2VkIHdoZW4gaXQgZ29lcyB0byBwcm9kdWN0aW9uLlxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIGdldE9yaWdpbmFsSW1hZ2VXaXRoUmVjdGFuZ2xlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTScsICcuJyk7XG5cbiAgICAgICAgY29uc3QgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnN1YnN0cmluZygwLCB0cmFuc2Zvcm1lZEltYWdlLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgICAgICAvLyAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vIHJldHVybiB1cmk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2UuIFRoaXMgd2lsbCBhbHNvIGJlIG5vdCB1c2VkIGluIHByb2R1Y3Rpb24uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2UgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcblxuICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LFxuICAgICAgICAvLyAgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAgICAgLy8gIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAvLyByZXR1cm4gdXJpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIFVSSSBmb3IgdGhlIGNhcHR1cmVkL3RyYW5zZm9ybWVkIGltYWdlIGZpbGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbmV3RmlsZSBGaWxlIG5hbWVcbiAgICAgKiBAcmV0dXJucyBVUkkgUmV0dXJucyB0aGUgVVJJIG9mIGdpdmVuIGZpbGUgbmFtZVxuICAgICAqL1xuICAgIGdldFVSSUZvckZpbGUobmV3RmlsZTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG59XG4vKipcbiAqIEJyb2FkY2FzdCBpbWFnZSB0byBhY2Nlc3MgcHVibGljbHksIHNvIHRoYXQgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gYW55IGFwcC5cbiAqXG4gKiBAcGFyYW0gaW1nVVJJIEltYWdlIGZpbGUgVVJJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKSB7XG4gICAgY29uc3QgaW1hZ2VGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWdVUkkpO1xuICAgIGNvbnN0IGNvbnRlbnRVcmkgPSBhbmRyb2lkLm5ldC5VcmkuZnJvbUZpbGUoaW1hZ2VGaWxlKTtcbiAgICBjb25zdCBtZWRpYVNjYW5JbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudCgnYW5kcm9pZC5pbnRlbnQuYWN0aW9uLk1FRElBX1NDQU5ORVJfU0NBTl9GSUxFJywgY29udGVudFVyaSk7XG4gICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LnNlbmRCcm9hZGNhc3QobWVkaWFTY2FuSW50ZW50KTtcbn1cbiJdfQ==