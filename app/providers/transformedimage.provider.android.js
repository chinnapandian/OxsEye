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
var transformedimage_common_1 = require("./transformedimage.common");
var application = require("tns-core-modules/application");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
/**
 * TransformedImageProvider class.
 */
var TransformedImageProvider = (function () {
    /**
     * Constructor for TransformedImageProvider
     */
    function TransformedImageProvider() {
        this.imageList = [];
        this.contourImageList = [];
    }
    /**
     * Load thumbnail images by content resolver.
     * @param orderByAscDesc
     * @param activityLoader
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
                console.log('getGalleryPhotos=>', JSON.stringify(error));
            }
        }).catch(function () {
            activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    /**
     * Load possible contour images
     */
    TransformedImageProvider.prototype.LoadPossibleContourImages = function () {
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
                var where = MediaStore.MediaColumns.DATA + ' like "%contourImage%"';
                cursor = context.getContentResolver().query(uri, columns, where, null, null);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        var imageUri = cursor.getString(columnIndex) + '';
                        var name_2 = imageUri.substring(imageUri.lastIndexOf('contourImage'));
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
                console.log('getcontourImages=>', JSON.stringify(error));
            }
        }).catch(function () {
            //   activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    /**
     * Delete all temporary files used to perform transformation.
     */
    TransformedImageProvider.prototype.DeleteFiles = function () {
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
                        }).catch(function (err) {
                            Toast.makeText('Error while deleting temporary images').show();
                            console.log(err.stack);
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
                console.log('Temporary files =>', JSON.stringify(error));
            }
        }).catch(function () {
            //   activityLoader.hide();
            Toast.makeText('Error in giving permission.', 'long').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    /**
     * Delete a selected image file from the disk.
     * @param fileURI
     */
    TransformedImageProvider.prototype.deleteFile = function (fileURI) {
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.remove()
            .then(function () {
            SendBroadcastImage(fileURI);
        }).catch(function (err) {
            Toast.makeText('deleteFile: Error while deleting temporary files').show();
            console.log(err.stack);
        });
    };
    /**
     * Rename a fila name to given name.
     * @param fileURI
     * @param renameFileto
     */
    TransformedImageProvider.prototype.renameFile = function (fileURI, renameFileto) {
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(function () {
            SendBroadcastImage(fileURI);
            SendBroadcastImage(renameFileto);
        }).catch(function (err) {
            Toast.makeText('renameFile: Error while renaming temporary file').show();
            console.log(err.stack);
        });
    };
    /**
     * Get original image
     * @param transformedImage
     */
    TransformedImageProvider.prototype.getOriginalImageWithRectangle = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
        var imgFileNameOrg = transformedImage.substring(0, transformedImage.indexOf('_transformed')) + '_contour.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    };
    /**
     * Get original image
     * @param transformedImage
     */
    TransformedImageProvider.prototype.getOriginalImage = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
        var imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    };
    /**
     * Get URI for file.
     * @param newFile
     * @returns URI
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
    __metadata("design:paramtypes", [])
], TransformedImageProvider);
exports.TransformedImageProvider = TransformedImageProvider;
/**
 * Broadcast image to access publicly, so that it will be available to any app.
 * @param imgURI
 */
function SendBroadcastImage(imgURI) {
    var imageFile = new java.io.File(imgURI);
    var contentUri = android.net.Uri.fromFile(imageFile);
    var mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
exports.SendBroadcastImage = SendBroadcastImage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUEwRDtBQUMxRCxxRUFBNkQ7QUFDN0QsMERBQTREO0FBRTVELDBDQUE0QztBQUM1QyxzREFBd0Q7QUFFeEQ7O0dBRUc7QUFFSCxJQUFhLHdCQUF3QjtJQVFqQzs7T0FFRztJQUNIO1FBQ0ksSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILHVFQUFvQyxHQUFwQyxVQUFxQyxjQUFzQixFQUFFLGNBQW1CO1FBQWhGLGlCQTRDQztRQTNDRyxXQUFXLENBQUMsaUJBQWlCLENBQ3pCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMscUJBQXFCO1lBQ2xELE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHNCQUFzQixDQUFDLEVBQ25ELDBCQUEwQixDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdCLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO1lBQy9DLEtBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1lBQ3BCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUNsQixJQUFJLENBQUM7Z0JBQ0QsSUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7Z0JBQzVDLElBQU0sT0FBTyxHQUFHLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDbkYsSUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFlBQVks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QUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxnREFBYSxHQUFiLFVBQWMsT0FBWTtRQUN0QixJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNoSSxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUNuSSxNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUVMLCtCQUFDO0FBQUQsQ0FBQyxBQXpPRCxJQXlPQztBQXpPWSx3QkFBd0I7SUFEcEMsaUJBQVUsRUFBRTs7R0FDQSx3QkFBd0IsQ0F5T3BDO0FBek9ZLDREQUF3QjtBQTBPckM7OztHQUdHO0FBQ0gsNEJBQW1DLE1BQU07SUFDckMsSUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdkQsSUFBTSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQywrQ0FBK0MsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNoSCxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUxELGdEQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmlsZSwgcGF0aCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4vdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG4vKipcbiAqIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBjbGFzcy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VMaXN0OiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgY29udG91ciBpbWFnZXMgY2FwdHVyZWQgd2hpbGUgcGVyZm9ybWluZyB0cmFuc2Zvcm1hdGlvbi4gXG4gICAgICogQ3VycmVudGx5IHRoaXMgaXMgbm90IGJlZW4gdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udG91ckltYWdlTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICB0aGlzLmNvbnRvdXJJbWFnZUxpc3QgPSBbXTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCB0aHVtYm5haWwgaW1hZ2VzIGJ5IGNvbnRlbnQgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjIFxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBcbiAgICAgKi9cbiAgICBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2M6IHN0cmluZywgYWN0aXZpdHlMb2FkZXI6IGFueSkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEsIE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERURdO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5FWFRFUk5BTF9DT05URU5UX1VSSTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2hlcmUgPSBNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBICsgJyBsaWtlIFwiJXRodW1iX1BUX0lNRyVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgb3JkZXJCeSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gaW1hZ2VVcmkuc3Vic3RyaW5nKGltYWdlVXJpLmxhc3RJbmRleE9mKCd0aHVtYl9QVF9JTUcnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGltYWdlID0geyBmaWxlVXJpOiBpbWFnZVVyaSwgdGV4dDogbmFtZSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICBpZiAoaW1hZ2VVcmkuaW5kZXhPZignUFRfSU1HJykgPiAwICYmIGltYWdlVXJpLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBpbWFnZVVyaS5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyBnYWxsZXJ5IGltYWdlcy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldEdhbGxlcnlQaG90b3M9PicsIEpTT04uc3RyaW5naWZ5KGVycm9yKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Blcm1pc3Npb24gaXMgbm90IGdyYW50ZWQgKHNhZGZhY2UpJyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCBwb3NzaWJsZSBjb250b3VyIGltYWdlc1xuICAgICAqL1xuICAgIExvYWRQb3NzaWJsZUNvbnRvdXJJbWFnZXMoKSB7XG5cbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVjb250b3VySW1hZ2UlXCInO1xuICAgICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGltYWdlVXJpLnN1YnN0cmluZyhpbWFnZVVyaS5sYXN0SW5kZXhPZignY29udG91ckltYWdlJykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsZXQgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdnZXRjb250b3VySW1hZ2VzPT4nLCBKU09OLnN0cmluZ2lmeShlcnJvcikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSknKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgYWxsIHRlbXBvcmFyeSBmaWxlcyB1c2VkIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24uXG4gICAgICovXG4gICAgRGVsZXRlRmlsZXMoKSB7XG5cbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVfVEVNUCVcIic7XG4gICAgICAgICAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCB3aGVyZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoY3Vyc29yLm1vdmVUb05leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gY3Vyc29yLmdldENvbHVtbkluZGV4KE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5JbmRleCkgKyAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2VVcmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZVVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgaW1hZ2VzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyB0ZW1wb3JhcnkgaW1hZ2VzLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGVtcG9yYXJ5IGZpbGVzID0+JywgSlNPTi5zdHJpbmdpZnkoZXJyb3IpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1Blcm1pc3Npb24gaXMgbm90IGdyYW50ZWQgKHNhZGZhY2UpJyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlIGEgc2VsZWN0ZWQgaW1hZ2UgZmlsZSBmcm9tIHRoZSBkaXNrLlxuICAgICAqIEBwYXJhbSBmaWxlVVJJIFxuICAgICAqL1xuICAgIGRlbGV0ZUZpbGUoZmlsZVVSSTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVVSSSk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ2RlbGV0ZUZpbGU6IEVycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcycpLnNob3coKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbmFtZSBhIGZpbGEgbmFtZSB0byBnaXZlbiBuYW1lLlxuICAgICAqIEBwYXJhbSBmaWxlVVJJIFxuICAgICAqIEBwYXJhbSByZW5hbWVGaWxldG8gXG4gICAgICovXG4gICAgcmVuYW1lRmlsZShmaWxlVVJJOiBzdHJpbmcsIHJlbmFtZUZpbGV0bzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVuYW1lKHJlbmFtZUZpbGV0bylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVVSSSk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHJlbmFtZUZpbGV0byk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ3JlbmFtZUZpbGU6IEVycm9yIHdoaWxlIHJlbmFtaW5nIHRlbXBvcmFyeSBmaWxlJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVyci5zdGFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBcbiAgICAgKi9cbiAgICBnZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAvLyByZXR1cm4gdXJpO1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldCBvcmlnaW5hbCBpbWFnZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFxuICAgICAqL1xuICAgIGdldE9yaWdpbmFsSW1hZ2UodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNL0NBTUVSQScsICcuJyk7XG5cbiAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vIHJldHVybiB1cmk7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0IFVSSSBmb3IgZmlsZS5cbiAgICAgKiBAcGFyYW0gbmV3RmlsZSBcbiAgICAgKiBAcmV0dXJucyBVUklcbiAgICAgKi9cbiAgICBnZXRVUklGb3JGaWxlKG5ld0ZpbGU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIHJldHVybiB1cmk7XG4gICAgfVxuXG59XG4vKipcbiAqIEJyb2FkY2FzdCBpbWFnZSB0byBhY2Nlc3MgcHVibGljbHksIHNvIHRoYXQgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gYW55IGFwcC5cbiAqIEBwYXJhbSBpbWdVUkkgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKSB7XG4gICAgY29uc3QgaW1hZ2VGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWdVUkkpO1xuICAgIGNvbnN0IGNvbnRlbnRVcmkgPSBhbmRyb2lkLm5ldC5VcmkuZnJvbUZpbGUoaW1hZ2VGaWxlKTtcbiAgICBjb25zdCBtZWRpYVNjYW5JbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudCgnYW5kcm9pZC5pbnRlbnQuYWN0aW9uLk1FRElBX1NDQU5ORVJfU0NBTl9GSUxFJywgY29udGVudFVyaSk7XG4gICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LnNlbmRCcm9hZGNhc3QobWVkaWFTY2FuSW50ZW50KTtcbn1cblxuXG4iXX0=