"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var timer_1 = require("tns-core-modules/timer");
var core_1 = require("@angular/core");
var file_system_1 = require("tns-core-modules/file-system");
// @ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
var transformedimage_common_1 = require("./transformedimage.common");
var application = require("tns-core-modules/application");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
var nativescript_localize_1 = require("nativescript-localize");
/**
 * This is a provider class contains common functionalyties related to captured image.
 */
var TransformedImageProvider = /** @class */ (function () {
    /**
     * Constructor for TransformedImageProvider
     */
    function TransformedImageProvider(logger) {
        this.logger = logger;
        /** To have total images count */
        this.imagesCount = 0;
        /** Used to have threshold value for setting up camera light */
        this.cameraLightThresholdValue = 0;
        /** Used to set time out value for camera light */
        this.cameraLightTimeOutValue = 0;
        /** To have adaptive threshold value for perspective transformation */
        this.adaptiveThresholdValue = 0;
        /** Boolean value to check that is contour image is required to share or not */
        this.isContourRequired = true;
        /** Boolean value to check the log is enabled or not */
        this.isLogEnabled = false;
        /** To have contour size to get the contours which has size more than this value */
        this.contourSize = 0;
        this.today = '';
        this.imageList = [];
        this.contourImageList = [];
        this.isImageCountOnly = false;
        this.settingsData = {
            "cameraLight": {
                "thresholdValue": 100
            },
            "perspectiveTransformation": {
                "thresholdValue": 41
            }
        };
        // this.saveSettings();
        this.loadSettings();
        this.dtFormatter = new java.text.SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        // const todayDt = new Date();
        // this.today = (todayDt.getDate() + '-' + ((todayDt.getMonth() + 1)) + '-' + todayDt.getFullYear());
        // + ' ' +this.todayDate.getHours() + ':' + this.todayDate.getMinutes()+ ':' + this.todayDate.getSeconds());
    }
    TransformedImageProvider.prototype.loadSettings = function () {
        var appFolder = file_system_1.knownFolders.currentApp();
        var jsonFile = appFolder.getFile("config/settings.json");
        var content = jsonFile.readTextSync();
        console.log('loadsettings....', content);
        if (!content || content == "") {
            this.saveSettings();
        }
        else {
            var localSettingsData = JSON.parse(content);
            this.settingsData = localSettingsData;
        }
        this.cameraLightThresholdValue = this.settingsData.cameraLight.thresholdValue;
        this.adaptiveThresholdValue = this.settingsData.perspectiveTransformation.thresholdValue;
    };
    TransformedImageProvider.prototype.saveSettings = function () {
        var appFolder = file_system_1.knownFolders.currentApp();
        var jsonFile = appFolder.getFile("config/settings.json");
        var content = JSON.stringify(this.settingsData);
        jsonFile.writeText(content)
            .then(function () {
            console.log('Success saved file ' + jsonFile);
        }, function (error) {
            //Silent error
            console.log(error, 'error');
            console.log('ERROR saved file ' + jsonFile, 'error');
        });
    };
    /**
     * Populates list with retrived images from storage and being used to display in gallery view.
     * It populates only the thumbnail images.
     *
     * @param cursor is a data cursor.
     * @param mediaStore is a android device provider (android.provider.MediaStore)
     */
    TransformedImageProvider.prototype.populateImageList = function (cursor, mediaStore) {
        this.today = '01-01-2000'; // dummy date to store banner for first record.
        while (cursor.moveToNext()) {
            var columnIndex = cursor.getColumnIndex(mediaStore.MediaColumns.DATA);
            var imageUri = cursor.getString(columnIndex) + '';
            var columnIndex0 = cursor.getColumnIndex(mediaStore.MediaColumns.DATE_MODIFIED);
            var imageDate = new java.util.Date(cursor.getLong(columnIndex0) * 1000);
            var imageDateStr = this.dtFormatter.format(imageDate);
            imageDateStr = imageDateStr.substring(0, imageDateStr.lastIndexOf(' '));
            var displayStyle = 'image';
            if (imageDateStr !== this.today) {
                displayStyle = 'banner';
                this.today = imageDateStr;
            }
            var name_1 = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
            var thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
            this.imageList.push(new transformedimage_common_1.TransformedImage(name_1, thumnailOrgPath, imageUri, false, imageDateStr, displayStyle));
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
                var columns = [mediaStore.MediaColumns.DATA, mediaStore.MediaColumns.DATE_ADDED, mediaStore.MediaColumns.DATE_MODIFIED];
                var orderBy = mediaStore.MediaColumns.DATE_MODIFIED + orderByAscDesc;
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
                Toast.makeText(nativescript_localize_1.localize('error_while_loading_gallery_images'), 'long').show();
                _this.logger.error('Error while loading gallery images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            activityLoader.hide();
            Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission'), 'long').show();
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
    };
    Object.defineProperty(TransformedImageProvider.prototype, "contourList", {
        /**
         * Accessor to return only contour image list.
         */
        get: function () {
            return this.contourImageList;
        },
        enumerable: true,
        configurable: true
    });
    /**
    * Loads possible contour images
    */
    TransformedImageProvider.prototype.LoadPossibleContourImages = function (fileName) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.contourImageList = [];
            Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
                var MediaStore = android.provider.MediaStore;
                var cursor = null;
                try {
                    var context = application.android.context;
                    var contentResolver_1 = context.getContentResolver();
                    var columns_1 = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
                    //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                    var uri_1 = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                    var where_1 = MediaStore.MediaColumns.DATA + ' like "%' + fileName + 'transformed%"';
                    timer_1.setTimeout(function () {
                        cursor = contentResolver_1.query(uri_1, columns_1, where_1, null, null);
                        if (cursor && cursor.getCount() > 0) {
                            while (cursor.moveToNext()) {
                                var columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                                var imageUri = cursor.getString(columnIndex) + '';
                                var name_2 = imageUri.substring(imageUri.lastIndexOf('transformed'));
                                var columnIndex0 = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_ADDED);
                                var imageDate = new java.util.Date(cursor.getLong(columnIndex0) * 1000);
                                var imageDateStr = _this.dtFormatter.format(imageDate);
                                imageDateStr = imageDateStr.substring(0, imageDateStr.lastIndexOf(' '));
                                // let image = { fileUri: imageUri, text: name };
                                //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                                //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                                _this.contourImageList.push(new transformedimage_common_1.TransformedImage(name_2, imageUri, imageUri, false, imageDateStr, 'image'));
                                //   }
                            }
                        }
                        console.log('contour list : ', _this.contourImageList);
                        resolve(_this.contourImageList);
                    }, 100);
                    //         activityLoader.hide();
                }
                catch (error) {
                    //           activityLoader.hide();
                    Toast.makeText('Error while loading contour images.', 'long').show();
                    _this.logger.error('Error while loading contour images.. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
                    reject();
                }
            }).catch(function (error) {
                //   activityLoader.hide();
                Toast.makeText('Error in giving permission.', 'long').show();
                _this.logger.error('Error in giving permission. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
                reject();
            });
        });
    };
    TransformedImageProvider.prototype.LoadPossibleContourImagesByFileSystem = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files')
                .then(function () {
                var logPath = '';
                try {
                    logPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
                }
                catch (error) {
                    Toast.makeText(nativescript_localize_1.localize('error_while_getting_path') + error.toString()).show();
                    _this.logger.error('Error while getting path. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
                }
                var folders = file_system_1.Folder.fromPath(logPath);
                folders.getEntities()
                    .then(function (entities) {
                    // entities is array with the document's files and folders.
                    entities.forEach(function (entity) {
                        if (entity.name.startsWith('PT_IMG') && entity.name.endsWith('.png')) {
                            var imageUri = entity.name;
                            var name_3 = imageUri.substring(imageUri.lastIndexOf('transformed'));
                            // let image = { fileUri: imageUri, text: name };
                            //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                            //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                            _this.contourImageList.push(new transformedimage_common_1.TransformedImage(name_3, imageUri, imageUri, false, '01-01-2000', 'image'));
                        }
                    });
                    // Toast.makeText(localize('log_files_deleted_done')).show();
                }).catch(function (error) {
                    // Failed to obtain folder's contents.
                    Toast.makeText(nativescript_localize_1.localize('Error while loading contour images by file system') + error, 'long').show();
                    _this.logger.error('Error while loading images by file system ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
                });
                // this.activityLoader.hide();
            }).catch(function (error) {
                Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission') + error, 'long').show();
                _this.logger.error('Error in giving permission... ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
        });
    };
    /**
     * Deletes all the log files from storage.
     */
    TransformedImageProvider.prototype.deleteLogFiles = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files')
            .then(function () {
            var logPath = '';
            try {
                logPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM/oelog';
            }
            catch (error) {
                Toast.makeText(nativescript_localize_1.localize('error_while_getting_path') + error.toString()).show();
                _this.logger.error('Error while getting path. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
            var folders = file_system_1.Folder.fromPath(logPath);
            folders.getEntities()
                .then(function (entities) {
                // entities is array with the document's files and folders.
                entities.forEach(function (entity) {
                    if (entity.name.startsWith('LogcatPT_IMG') && entity.name.endsWith('.txt')) {
                        var tempFile = file_system_1.File.fromPath(entity.path);
                        tempFile.remove()
                            .then(function () {
                            SendBroadcastImage(entity.path);
                        }).catch(function (error) {
                            Toast.makeText(nativescript_localize_1.localize('error_while_deleting_log_files')).show();
                            _this.logger.error('Error while deleting log files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }
                });
                Toast.makeText(nativescript_localize_1.localize('log_files_deleted_done')).show();
            }).catch(function (error) {
                // Failed to obtain folder's contents.
                Toast.makeText(nativescript_localize_1.localize('error_while_loading_images') + error, 'long').show();
                _this.logger.error('Error while loading images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
            // this.activityLoader.hide();
        }).catch(function (error) {
            Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission') + error, 'long').show();
            _this.logger.error('Error in giving permission... ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
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
                            Toast.makeText(nativescript_localize_1.localize('error_while_deleting_temporary_images')).show();
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
                Toast.makeText(nativescript_localize_1.localize('error_while_loading_temporary_images'), 'long').show();
                _this.logger.error('Error while loading temporary images. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            //   activityLoader.hide();
            Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission'), 'long').show();
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
            Toast.makeText(nativescript_localize_1.localize('error_while_deleting_temporary_files')).show();
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
            Toast.makeText(nativescript_localize_1.localize('error_while_renaming_temporary_file')).show();
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
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        var uri = androidx.core.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    };
    /**
     * Temporary method, not used.
     * @param dataToShare data to be shared
     */
    TransformedImageProvider.prototype.shareData = function (dataToShare) {
    };
    var _a;
    TransformedImageProvider = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" ? _a : Object])
    ], TransformedImageProvider);
    return TransformedImageProvider;
}());
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
