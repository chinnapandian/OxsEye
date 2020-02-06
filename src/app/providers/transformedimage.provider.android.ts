import { setTimeout } from 'tns-core-modules/timer';
import { Injectable } from '@angular/core';
import { File, Folder, knownFolders } from 'tns-core-modules/file-system';

// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';
import { TransformedImage } from './transformedimage.common';

import * as application from 'tns-core-modules/application';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

import { localize } from 'nativescript-localize';

import { ObservableArray } from 'tns-core-modules/data/observable-array';

/** global variable declaration to avoid compilation error */
declare var android: any;
/** global variable declaration to avoid compilation error */
declare var androidx: any;
/** global variable declaration to avoid compilation error */
declare var java: any;

/**
 * This is a provider class contains common functionalyties related to captured image.
 */
@Injectable()
export class TransformedImageProvider {
    /** Contains list of image */
    public imageList: any;
    /** Contains list of contour images captured while performing transformation.
     * Currently this is not been used.
     */
    public contourImageList: any;
    /** To have total images count */
    public imagesCount = 0;

    /** A boolean variable to get only images count or not */
    private isImageCountOnly: any;
    /** Used to have threshold value for setting up camera light */
    public cameraLightThresholdValue = 0;
    /** Used to set time out value for camera light */
    public cameraLightTimeOutValue = 0;
    /** To have adaptive threshold value for perspective transformation */
    public adaptiveThresholdValue = 0;
    /** Boolean value to check that is contour image is required to share or not */
    public isContourRequired = true;
    /** Boolean value to check the log is enabled or not */
    public isLogEnabled = false;
    /** To have contour size to get the contours which has size more than this value */
    public contourSize = 0;
    /** Contains settings data */
    public settingsData: any;
    /** Date formatter */
    public dtFormatter: any;

    private today = '';

    /**
     * Constructor for TransformedImageProvider
     */
    constructor(
        private logger: OxsEyeLogger,
    ) {
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

    public loadSettings() {
        let appFolder = knownFolders.currentApp();
        let jsonFile = appFolder.getFile("config/settings.json");
        const content = jsonFile.readTextSync();
        console.log('loadsettings...', content);
        if (!content || content == "") {
            this.saveSettings();
        } else {
            const localSettingsData = JSON.parse(content);
            this.settingsData = localSettingsData;
        }
        this.cameraLightThresholdValue = this.settingsData.cameraLight.thresholdValue;
        this.adaptiveThresholdValue = this.settingsData.perspectiveTransformation.thresholdValue;
    }
    public saveSettings() {
        let appFolder = knownFolders.currentApp();
        let jsonFile = appFolder.getFile("config/settings.json");
        const content = JSON.stringify(this.settingsData);
        jsonFile.writeText(content)
            .then(() => {
                console.log('Success saved file ' + jsonFile);
            }, (error) => {
                //Silent error
                console.log(error, 'error');
                console.log('ERROR saved file ' + jsonFile, 'error');
            });

    }
    /**
     * Populates list with retrived images from storage and being used to display in gallery view.
     * It populates only the thumbnail images.
     *
     * @param cursor is a data cursor.
     * @param mediaStore is a android device provider (android.provider.MediaStore)
     */
    private populateImageList(cursor: any, mediaStore: any) {
        this.today = '01-01-2000'; // dummy date to store banner for first record.
        while (cursor.moveToNext()) {
            const columnIndex = cursor.getColumnIndex(mediaStore.MediaColumns.DATA);
            const imageUri = cursor.getString(columnIndex) + '';
            const columnIndex0 = cursor.getColumnIndex(mediaStore.MediaColumns.DATE_MODIFIED);
            const imageDate = new java.util.Date(cursor.getLong(columnIndex0) * 1000);
            let imageDateStr = this.dtFormatter.format(imageDate);
            imageDateStr = imageDateStr.substring(0, imageDateStr.lastIndexOf(' '));
            let displayStyle = 'image';
            if (imageDateStr !== this.today) {
                displayStyle = 'banner';
                this.today = imageDateStr;
            }
            const name = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
            const thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
            this.imageList.push(new TransformedImage(
                name,
                thumnailOrgPath,
                imageUri,
                false,
                imageDateStr,
                displayStyle
            ));
        }
    }

    /**
     * Loads all the thumbnail images of transformed image by content resolver in order what
     * it's parameter has and populates the image list.
     *
     * @param orderByAscDesc Orderby value 'Asc'/'Desc'
     * @param activityLoader ActivityLoader instance
     */
    loadThumbnailImagesByContentResolver(orderByAscDesc: string, activityLoader: any, view: any) {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files').then(() => {
                const mediaStore = android.provider.MediaStore;
                this.imageList = [];
                let cursor = null;
                try {
                    const context = application.android.context;
                    const columns = [mediaStore.MediaColumns.DATA, mediaStore.MediaColumns.DATE_ADDED, mediaStore.MediaColumns.DATE_MODIFIED];
                    const orderBy = mediaStore.MediaColumns.DATE_MODIFIED + orderByAscDesc;
                    const uri = mediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                    const where = mediaStore.MediaColumns.DATA + ' like "%thumb_PT_IMG%"';
                    cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
                    if (cursor && cursor.getCount() > 0) {
                        if (this.isImageCountOnly) {
                            this.imagesCount = 0;
                            this.imagesCount = cursor.getCount();
                            if (view) {
                                view.setText(this.imagesCount + '');
                                view.setVisibility(android.view.View.VISIBLE);
                            }
                        } else {
                            this.populateImageList(cursor, mediaStore);
                        }
                        this.isImageCountOnly = false;
                    } else {
                        if (view) {
                            view.setText('0');
                            view.setVisibility(android.view.View.INVISIBLE);
                        }
                        this.imagesCount = 0;
                        this.imageList = [];
                        this.isImageCountOnly = false;
                    }
                    activityLoader.hide();
                } catch (error) {
                    activityLoader.hide();
                    Toast.makeText(localize('error_while_loading_gallery_images'), 'long').show();
                    this.logger.error('Error while loading gallery images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                }
            }).catch((error) => {
                activityLoader.hide();
                Toast.makeText(localize('error_while_giving_permission'), 'long').show();
                this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Gets count of transformed image by content resolver in order what
     * it's parameter has and returns the image list count.
     *
     * @param orderByAscDesc Orderby value 'Asc'/'Desc'
     * @param activityLoader ActivityLoader instance
     *
     * @returns captured images count
     */
    getThumbnailImagesCountByContentResolver(orderByAscDesc: string, activityLoader: any, view: any) {
        this.isImageCountOnly = true;
        this.loadThumbnailImagesByContentResolver(orderByAscDesc, activityLoader, view);
    }
    /**
     * Accessor to return only contour image list.
     */
    get contourList(): any {
        return this.contourImageList;
    }

    /**
    * Loads possible contour images
    */
    LoadPossibleContourImages(fileName: any): any {
        return new Promise((resolve, reject) => {
            this.contourImageList = [];
            Permissions.requestPermission(
                [android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
                'Needed for sharing files').then(() => {
                    const MediaStore = android.provider.MediaStore;
                    let cursor = null;
                    try {
                        const context = application.android.context;
                        const contentResolver = context.getContentResolver();
                        const columns = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
                        //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                        const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                        const where = MediaStore.MediaColumns.DATA + ' like "%' + fileName + 'transformed%"';
                        setTimeout(() => {
                            cursor = contentResolver.query(uri, columns, where, null, null);
                            if (cursor && cursor.getCount() > 0) {
                                while (cursor.moveToNext()) {
                                    const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                                    const imageUri = cursor.getString(columnIndex) + '';
                                    const name = imageUri.substring(imageUri.lastIndexOf('transformed'));
                                    const columnIndex0 = cursor.getColumnIndex(MediaStore.MediaColumns.DATE_ADDED);
                                    const imageDate = new java.util.Date(cursor.getLong(columnIndex0) * 1000);
                                    let imageDateStr = this.dtFormatter.format(imageDate);
                                    imageDateStr = imageDateStr.substring(0, imageDateStr.lastIndexOf(' '));
                                    // let image = { fileUri: imageUri, text: name };
                                    //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                                    //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                                    this.contourImageList.push(new TransformedImage(
                                        name,
                                        imageUri,
                                        imageUri,
                                        false,
                                        imageDateStr,
                                        'image'
                                    ));

                                    //   }
                                }
                            }
                            console.log('contour list : ', this.contourImageList);
                            resolve(this.contourImageList);
                        }, 100);
                        //         activityLoader.hide();
                    } catch (error) {
                        //           activityLoader.hide();
                        Toast.makeText('Error while loading contour images.', 'long').show();
                        this.logger.error('Error while loading contour images.. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                        reject();
                    }

                }).catch((error) => {
                    //   activityLoader.hide();
                    Toast.makeText('Error in giving permission.', 'long').show();
                    this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                    reject();
                });
        });
    }
    LoadPossibleContourImagesByFileSystem(): any {
        return new Promise((resolve, reject) => {
            Permissions.requestPermission(
                [android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
                'Needed for sharing files')
                .then(() => {
                    let logPath = '';
                    try {
                        logPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
                    } catch (error) {
                        Toast.makeText(localize('error_while_getting_path') + error.toString()).show();
                        this.logger.error('Error while getting path. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                    }
                    const folders: Folder = Folder.fromPath(logPath);
                    folders.getEntities()
                        .then((entities) => {
                            // entities is array with the document's files and folders.
                            entities.forEach((entity) => {
                                if (entity.name.startsWith('PT_IMG') && entity.name.endsWith('.png')) {
                                    const imageUri = entity.name;
                                    const name = imageUri.substring(imageUri.lastIndexOf('transformed'));
                                    // let image = { fileUri: imageUri, text: name };
                                    //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                                    //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                                    this.contourImageList.push(new TransformedImage(
                                        name,
                                        imageUri,
                                        imageUri,
                                        false,
                                        '01-01-2000',
                                        'image'
                                    ));
                                }
                            });
                            // Toast.makeText(localize('log_files_deleted_done')).show();
                        }).catch((error) => {
                            // Failed to obtain folder's contents.
                            Toast.makeText(localize('Error while loading contour images by file system') + error, 'long').show();
                            this.logger.error('Error while loading images by file system ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    // this.activityLoader.hide();
                }).catch((error) => {
                    Toast.makeText(localize('error_while_giving_permission') + error, 'long').show();
                    this.logger.error('Error in giving permission... ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                });
        });
    }
    /**
     * Deletes all the log files from storage.
     */
    deleteLogFiles() {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files')
            .then(() => {
                let logPath = '';
                try {
                    logPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM/oelog';
                } catch (error) {
                    Toast.makeText(localize('error_while_getting_path') + error.toString()).show();
                    this.logger.error('Error while getting path. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                }
                const folders: Folder = Folder.fromPath(logPath);
                folders.getEntities()
                    .then((entities) => {
                        // entities is array with the document's files and folders.
                        entities.forEach((entity) => {
                            if (entity.name.startsWith('LogcatPT_IMG') && entity.name.endsWith('.txt')) {
                                const tempFile: File = File.fromPath(entity.path);
                                tempFile.remove()
                                    .then(() => {
                                        SendBroadcastImage(entity.path);
                                    }).catch((error) => {
                                        Toast.makeText(localize('error_while_deleting_log_files')).show();
                                        this.logger.error('Error while deleting log files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                                    });
                            }
                        });
                        Toast.makeText(localize('log_files_deleted_done')).show();
                    }).catch((error) => {
                        // Failed to obtain folder's contents.
                        Toast.makeText(localize('error_while_loading_images') + error, 'long').show();
                        this.logger.error('Error while loading images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                // this.activityLoader.hide();
            }).catch((error) => {
                Toast.makeText(localize('error_while_giving_permission') + error, 'long').show();
                this.logger.error('Error in giving permission... ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Deletes all the temporary files used to perform transformation. Actually it creates
     * some temporary files behind the scene when it performs perspective transformation using OpenCV API.
     */
    DeleteFiles() {
        this.contourImageList = [];
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files').then(() => {
                const MediaStore = android.provider.MediaStore;
                let cursor = null;
                try {
                    const context = application.android.context;
                    const columns = [MediaStore.MediaColumns.DATA];
                    //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                    const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                    const where = MediaStore.MediaColumns.DATA + ' like "%_TEMP%"';
                    cursor = context.getContentResolver().query(uri, columns, where, null, null);
                    if (cursor && cursor.getCount() > 0) {
                        while (cursor.moveToNext()) {
                            const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                            const imageUri = cursor.getString(columnIndex) + '';
                            const tempFile: File = File.fromPath(imageUri);
                            tempFile.remove()
                                .then(() => {
                                    SendBroadcastImage(imageUri);
                                }).catch((error) => {
                                    Toast.makeText(localize('error_while_deleting_temporary_images')).show();
                                    this.logger.error('Error while deleting temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                        }
                    }
                } catch (error) {
                    //           activityLoader.hide();
                    Toast.makeText(localize('error_while_loading_temporary_images'), 'long').show();
                    this.logger.error('Error while loading temporary images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                }

            }).catch((error) => {
                //   activityLoader.hide();
                Toast.makeText(localize('error_while_giving_permission'), 'long').show();
                this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Deletes the selected image file from the disk.
     *
     * @param fileURI Image file path
     */
    deleteFile(fileURI: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.remove()
            .then(() => {
                SendBroadcastImage(fileURI);
            }).catch((error) => {
                Toast.makeText(localize('error_while_deleting_temporary_files')).show();
                this.logger.error('Error while deleting temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Renames the transformed image file name to given name. This is been used while performing
     * manual transformation using OpenCV API. As it creates temporary files behind the scene,
     * it needs to be renamed to refresh the final image in the view.
     *
     * @param fileURI Image file path
     * @param renameFileto Filename to be renamed to.
     */
    renameFile(fileURI: string, renameFileto: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(() => {
                SendBroadcastImage(fileURI);
                SendBroadcastImage(renameFileto);
            }).catch((error) => {
                Toast.makeText(localize('error_while_renaming_temporary_file')).show();
                this.logger.error('Error while renaming temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }

    /**
     * Gets the original image with rectangle. But this will not be used when it goes to production.
     * @param transformedImage Transformed image file path
     */
    getOriginalImageWithRectangle(transformedImage: string): any {
        const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');

        const imgFileNameOrg = transformedImage.substring(0, transformedImage.indexOf('_transformed')) + '_contour.jpg';
        const newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider',
        //  uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    }

    /**
     * Gets the original captured image. This will also be not used in production.
     * @param transformedImage Transformed image file path
     */
    getOriginalImage(transformedImage: string): any {
        const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');

        let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        const newFile = new java.io.File(imagePath, imgFileNameOrg);
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context,
        //  'oxs.eye.fileprovider', newFile);
        // application.android.context.grantUriPermission('oxs.eye.fileprovider',
        //  uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        // return uri;
        return this.getURIForFile(newFile);
    }

    /**
     * Gets the URI for the captured/transformed image file.
     *
     * @param newFile File name
     * @returns URI Returns the URI of given file name
     */
    getURIForFile(newFile: any): any {
        // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        const uri = androidx.core.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    }

    /**
     * Temporary method, not used.
     * @param dataToShare data to be shared
     */
    shareData(dataToShare: any) {
    }
}
/**
 * Broadcast image to access publicly, so that it will be available to any app.
 *
 * @param imgURI Image file URI
 */
export function SendBroadcastImage(imgURI) {
    const imageFile = new java.io.File(imgURI);
    const contentUri = android.net.Uri.fromFile(imageFile);
    const mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
