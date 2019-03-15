import { Injectable } from '@angular/core';
import { File, path } from 'tns-core-modules/file-system';
import { TransformedImage } from './transformedimage.common';
import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import * as Toast from 'nativescript-toast';
import * as Permissions from 'nativescript-permissions';

/**
 * TransformedImageProvider class.
 */
@Injectable()
export class TransformedImageProvider {
    private _imageList: any;
    private _contourImageList: any;

    /**
     * Constructor for TransformedImageProvider
     */
    constructor() {
        this._imageList = [];
        this._contourImageList = [];
    }
    /**
     * Load thumbnail images by content resolver.
     * @param orderByAscDesc 
     * @param activityLoader 
     */
    loadThumbnailImagesByContentResolver(orderByAscDesc: string, activityLoader: any) {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files').then(() => {
                const MediaStore = android.provider.MediaStore;
                this._imageList = [];
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
                            this._imageList.push(new TransformedImage(
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

        this._contourImageList = [];
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
                            this._contourImageList.push(new TransformedImage(
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

        this._contourImageList = [];
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
     * @param fileURI 
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
     * @param fileURI 
     * @param renameFileto 
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

}
/**
 * Broadcast image to access publicly, so that it will be available to any app.
 * @param imgURI 
 */
export function SendBroadcastImage(imgURI) {
    const imageFile = new java.io.File(imgURI);
    const contentUri = android.net.Uri.fromFile(imageFile);
    const mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}


