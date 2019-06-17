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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFvRDtBQUVwRCxxREFBOEM7QUFDOUMsdURBQXNEO0FBQ3RELHFFQUE2RDtBQUU3RCwwREFBNEQ7QUFFNUQsMENBQTRDO0FBRTVDLHNEQUF3RDtBQUV4RDs7R0FFRztBQUVILElBQWEsd0JBQXdCO0lBUWpDOztPQUVHO0lBQ0gsa0NBQW9CLE1BQW9CLEVBQ3BCLE1BQVM7UUFEVCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7Ozs7OztPQU1HO0lBQ0gsdUVBQW9DLEdBQXBDLFVBQXFDLGNBQXNCLEVBQUUsY0FBbUI7UUFBaEYsaUJBNENDO1FBM0NHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FDekIsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7WUFDbEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFDbkQsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDN0IsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDL0MsS0FBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDcEIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLElBQUksQ0FBQztnQkFDRCxJQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztnQkFDNUMsSUFBTSxPQUFPLEdBQUcsQ0FB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O1FBQ25JLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBclBELElBcVBDO0FBclBZLHdCQUF3QjtJQURwQyxpQkFBVSxFQUFFO3lEQVltQiwyQkFBWSxvQkFBWiwyQkFBWSxrQ0FDWixXQUFDO0dBWnBCLHdCQUF3QixDQXFQcEM7QUFyUFksNERBQXdCO0FBc1ByQzs7OztHQUlHO0FBQ0gsNEJBQW1DLE1BQU07SUFDckMsSUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsSUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQywrQ0FBK0MsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoSCxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUxELGdEQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuL3RyYW5zZm9ybWVkaW1hZ2UuY29tbW9uJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5cbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbi8qKlxuICogVGhpcyBpcyBhIHByb3ZpZGVyIGNsYXNzIGNvbnRhaW5zIGNvbW1vbiBmdW5jdGlvbmFseXRpZXMgcmVsYXRlZCB0byBjYXB0dXJlZCBpbWFnZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VMaXN0OiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgY29udG91ciBpbWFnZXMgY2FwdHVyZWQgd2hpbGUgcGVyZm9ybWluZyB0cmFuc2Zvcm1hdGlvbi5cbiAgICAgKiBDdXJyZW50bHkgdGhpcyBpcyBub3QgYmVlbiB1c2VkLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb250b3VySW1hZ2VMaXN0OiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGxvY2FsZTogTCkge1xuICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgYWxsIHRoZSB0aHVtYm5haWwgaW1hZ2VzIG9mIHRyYW5zZm9ybWVkIGltYWdlIGJ5IGNvbnRlbnQgcmVzb2x2ZXIgaW4gb3JkZXIgd2hhdFxuICAgICAqIGl0J3MgcGFyYW1ldGVyIGhhcyBhbmQgcG9wdWxhdGVzIHRoZSBpbWFnZSBsaXN0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzYyBPcmRlcmJ5IHZhbHVlICdBc2MnLydEZXNjJ1xuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eUxvYWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzYzogc3RyaW5nLCBhY3Rpdml0eUxvYWRlcjogYW55KSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGxldCBjdXJzb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSwgTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRF07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyQnkgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRFX0FEREVEICsgb3JkZXJCeUFzY0Rlc2M7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIldGh1bWJfUFRfSU1HJVwiJztcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yID0gY29udGV4dC5nZXRDb250ZW50UmVzb2x2ZXIoKS5xdWVyeSh1cmksIGNvbHVtbnMsIHdoZXJlLCBudWxsLCBvcmRlckJ5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1cnNvciAmJiBjdXJzb3IuZ2V0Q291bnQoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlIChjdXJzb3IubW92ZVRvTmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1uSW5kZXggPSBjdXJzb3IuZ2V0Q29sdW1uSW5kZXgoTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VVcmkgPSBjdXJzb3IuZ2V0U3RyaW5nKGNvbHVtbkluZGV4KSArICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBpbWFnZVVyaS5zdWJzdHJpbmcoaW1hZ2VVcmkubGFzdEluZGV4T2YoJ3RodW1iX1BUX0lNRycpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltYWdlVXJpLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfbG9hZGluZ19nYWxsZXJ5X2ltYWdlcycpLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgZ2FsbGVyeSBpbWFnZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVE9ETzogdGhpcyBpcyBub3QgYmVlbiB1c2VkIG5vdy4gYnV0IGlmIG5lZWRlZCBsYXRlciB1bmNvbW1lbnQgYW5kIHVzZSBpdC5cbiAgICAgKiBMb2FkcyBwb3NzaWJsZSBjb250b3VyIGltYWdlc1xuICAgICAqL1xuICAgIC8vIExvYWRQb3NzaWJsZUNvbnRvdXJJbWFnZXMoKSB7XG5cbiAgICAvLyAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgLy8gICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgIC8vICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgLy8gICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgLy8gICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAvLyAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAvLyAgICAgICAgICAgICB0cnkge1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVjb250b3VySW1hZ2UlXCInO1xuICAgIC8vICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGltYWdlVXJpLnN1YnN0cmluZyhpbWFnZVVyaS5sYXN0SW5kZXhPZignY29udG91ckltYWdlJykpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsZXQgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAvLyAgICAgICAgICAgICB9XG5cbiAgICAvLyAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIC8vICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgIC8vICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhbGwgdGhlIHRlbXBvcmFyeSBmaWxlcyB1c2VkIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24uIEFjdHVhbGx5IGl0IGNyZWF0ZXNcbiAgICAgKiBzb21lIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lIHdoZW4gaXQgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gdXNpbmcgT3BlbkNWIEFQSS5cbiAgICAgKi9cbiAgICBEZWxldGVGaWxlcygpIHtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVfVEVNUCVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZVVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ190ZW1wb3JhcnlfaW1hZ2VzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfbG9hZGluZ190ZW1wb3JhcnlfaW1hZ2VzJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyB0ZW1wb3JhcnkgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2l2aW5nX3Blcm1pc3Npb24nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZSBmaWxlIGZyb20gdGhlIGRpc2suXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZGVsZXRlRmlsZShmaWxlVVJJOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlVVJJKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGVtcG9yYXJ5X2ZpbGVzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIG5hbWUgdG8gZ2l2ZW4gbmFtZS4gVGhpcyBpcyBiZWVuIHVzZWQgd2hpbGUgcGVyZm9ybWluZ1xuICAgICAqIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLiBBcyBpdCBjcmVhdGVzIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lLFxuICAgICAqIGl0IG5lZWRzIHRvIGJlIHJlbmFtZWQgdG8gcmVmcmVzaCB0aGUgZmluYWwgaW1hZ2UgaW4gdGhlIHZpZXcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIHJlbmFtZUZpbGV0byBGaWxlbmFtZSB0byBiZSByZW5hbWVkIHRvLlxuICAgICAqL1xuICAgIHJlbmFtZUZpbGUoZmlsZVVSSTogc3RyaW5nLCByZW5hbWVGaWxldG86IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbmFtZShyZW5hbWVGaWxldG8pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShyZW5hbWVGaWxldG8pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9yZW5hbWluZ190ZW1wb3JhcnlfZmlsZScpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHJlbmFtaW5nIHRlbXBvcmFyeSBmaWxlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBvcmlnaW5hbCBpbWFnZSB3aXRoIHJlY3RhbmdsZS4gQnV0IHRoaXMgd2lsbCBub3QgYmUgdXNlZCB3aGVuIGl0IGdvZXMgdG8gcHJvZHVjdGlvbi5cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuXG4gICAgICAgIGNvbnN0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5zdWJzdHJpbmcoMCwgdHJhbnNmb3JtZWRJbWFnZS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAgICAgLy8gIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAvLyByZXR1cm4gdXJpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlLiBUaGlzIHdpbGwgYWxzbyBiZSBub3QgdXNlZCBpbiBwcm9kdWN0aW9uLlxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIGdldE9yaWdpbmFsSW1hZ2UodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNL0NBTUVSQScsICcuJyk7XG5cbiAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCxcbiAgICAgICAgLy8gICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBVUkkgZm9yIHRoZSBjYXB0dXJlZC90cmFuc2Zvcm1lZCBpbWFnZSBmaWxlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBuZXdGaWxlIEZpbGUgbmFtZVxuICAgICAqIEByZXR1cm5zIFVSSSBSZXR1cm5zIHRoZSBVUkkgb2YgZ2l2ZW4gZmlsZSBuYW1lXG4gICAgICovXG4gICAgZ2V0VVJJRm9yRmlsZShuZXdGaWxlOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICByZXR1cm4gdXJpO1xuICAgIH1cbn1cbi8qKlxuICogQnJvYWRjYXN0IGltYWdlIHRvIGFjY2VzcyBwdWJsaWNseSwgc28gdGhhdCBpdCB3aWxsIGJlIGF2YWlsYWJsZSB0byBhbnkgYXBwLlxuICogXG4gKiBAcGFyYW0gaW1nVVJJIEltYWdlIGZpbGUgVVJJXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKSB7XG4gICAgY29uc3QgaW1hZ2VGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWdVUkkpO1xuICAgIGNvbnN0IGNvbnRlbnRVcmkgPSBhbmRyb2lkLm5ldC5VcmkuZnJvbUZpbGUoaW1hZ2VGaWxlKTtcbiAgICBjb25zdCBtZWRpYVNjYW5JbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudCgnYW5kcm9pZC5pbnRlbnQuYWN0aW9uLk1FRElBX1NDQU5ORVJfU0NBTl9GSUxFJywgY29udGVudFVyaSk7XG4gICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LnNlbmRCcm9hZGNhc3QobWVkaWFTY2FuSW50ZW50KTtcbn1cbiJdfQ==