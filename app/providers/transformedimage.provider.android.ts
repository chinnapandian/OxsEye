import { Injectable } from '@angular/core';
import { File } from 'tns-core-modules/file-system';

import { TransformedImage } from './transformedimage.common';

import * as application from 'tns-core-modules/application';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

/**
 * TransformedImageProvider class.
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
    constructor() {
        this.imageList = [];
        this.contourImageList = [];
    }
    /**
     * Load thumbnail images by content resolver.
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
                    Toast.makeText('Error while loading gallery images.', 'long').show();
                    console.log('getGalleryPhotos=>', JSON.stringify(error));
                }
            }).catch(() => {
                activityLoader.hide();
                Toast.makeText('Error in giving permission.', 'long').show();
                console.log('Permission is not granted (sadface)');
            });
    }
    /**
     * Load possible contour images
     */
    LoadPossibleContourImages() {

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
                    const where = MediaStore.MediaColumns.DATA + ' like "%contourImage%"';
                    cursor = context.getContentResolver().query(uri, columns, where, null, null);
                    if (cursor && cursor.getCount() > 0) {
                        while (cursor.moveToNext()) {
                            const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                            const imageUri = cursor.getString(columnIndex) + '';
                            const name = imageUri.substring(imageUri.lastIndexOf('contourImage'));
                            // let image = { fileUri: imageUri, text: name };
                            //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
                            //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                            this.contourImageList.push(new TransformedImage(
                                name,
                                imageUri,
                                imageUri,
                                false,
                            ));

                            //   }
                        }
                    }
                    //         activityLoader.hide();
                } catch (error) {
                    //           activityLoader.hide();
                    Toast.makeText('Error while loading contour images.', 'long').show();
                    console.log('getcontourImages=>', JSON.stringify(error));
                }

            }).catch(() => {
                //   activityLoader.hide();
                Toast.makeText('Error in giving permission.', 'long').show();
                console.log('Permission is not granted (sadface)');
            });
    }
    /**
     * Delete all temporary files used to perform transformation.
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
                                }).catch((err) => {
                                    Toast.makeText('Error while deleting temporary images').show();
                                    console.log(err.stack);
                                });
                        }
                    }
                } catch (error) {
                    //           activityLoader.hide();
                    Toast.makeText('Error while loading temporary images.', 'long').show();
                    console.log('Temporary files =>', JSON.stringify(error));
                }

            }).catch(() => {
                //   activityLoader.hide();
                Toast.makeText('Error in giving permission.', 'long').show();
                console.log('Permission is not granted (sadface)');
            });
    }
    /**
     * Delete a selected image file from the disk.
     * @param fileURI Image file path
     */
    deleteFile(fileURI: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.remove()
            .then(() => {
                SendBroadcastImage(fileURI);
            }).catch((err) => {
                Toast.makeText('deleteFile: Error while deleting temporary files').show();
                console.log(err.stack);
            });
    }
    /**
     * Rename a fila name to given name.
     * @param fileURI Image file path
     * @param renameFileto Filename to be renamed to.
     */
    renameFile(fileURI: string, renameFileto: string) {
        const tempFile: File = File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(() => {
                SendBroadcastImage(fileURI);
                SendBroadcastImage(renameFileto);
            }).catch((err) => {
                Toast.makeText('renameFile: Error while renaming temporary file').show();
                console.log(err.stack);
            });
    }

    /**
     * Get original image
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
     * Get original image
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
     * Get URI for file.
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
 * @param imgURI Image file URI
 */
export function SendBroadcastImage(imgURI) {
    const imageFile = new java.io.File(imgURI);
    const contentUri = android.net.Uri.fromFile(imageFile);
    const mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
