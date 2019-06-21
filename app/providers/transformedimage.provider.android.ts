import { Injectable } from '@angular/core';
import { File } from 'tns-core-modules/file-system';

import { L } from 'nativescript-i18n/angular';
import { OxsEyeLogger } from '../logger/oxseyelogger';
import { TransformedImage } from './transformedimage.common';

import * as application from 'tns-core-modules/application';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

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

    /**
     * Constructor for TransformedImageProvider
     */
    constructor(private logger: OxsEyeLogger,
                private locale: L) {
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
    loadThumbnailImagesByContentResolver(orderByAscDesc: string, activityLoader: any) {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files').then(() => {
                const MediaStore = android.provider.MediaStore;
                this.imageList = [];
                let cursor = null;
                try {
                    const context = application.android.context;
                    const columns = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
                    const orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc;
                    const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                    const where = MediaStore.MediaColumns.DATA + ' like "%thumb_PT_IMG%"';
                    cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
                    if (cursor && cursor.getCount() > 0) {
                        while (cursor.moveToNext()) {
                            const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                            const imageUri = cursor.getString(columnIndex) + '';
                            const name = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
                            // let image = { fileUri: imageUri, text: name };
                            //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                            const thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                            this.imageList.push(new TransformedImage(
                                name,
                                thumnailOrgPath,
                                imageUri,
                                false,
                            ));

                            //   }
                        }
                    }
                    activityLoader.hide();
                } catch (error) {
                    activityLoader.hide();
                    Toast.makeText(this.locale.transform('error_while_loading_gallery_images'), 'long').show();
                    this.logger.error('Error while loading gallery images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                }
            }).catch((error) => {
                activityLoader.hide();
                Toast.makeText(this.locale.transform('error_while_giving_permission'), 'long').show();
                this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
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
                                    Toast.makeText(this.locale.transform('error_while_deleting_temporary_images')).show();
                                    this.logger.error('Error while deleting temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                        }
                    }
                } catch (error) {
                    //           activityLoader.hide();
                    Toast.makeText(this.locale.transform('error_while_loading_temporary_images'), 'long').show();
                    this.logger.error('Error while loading temporary images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
                }

            }).catch((error) => {
                //   activityLoader.hide();
                Toast.makeText(this.locale.transform('error_while_giving_permission'), 'long').show();
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
                Toast.makeText(this.locale.transform('error_while_deleting_temporary_files')).show();
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
                Toast.makeText(this.locale.transform('error_while_renaming_temporary_file')).show();
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
        const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
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
