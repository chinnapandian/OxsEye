import { Injectable } from '@angular/core';
import { knownFolders, Folder, File, path } from "tns-core-modules/file-system";
import * as application from "tns-core-modules/application";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as Toast from 'nativescript-toast';
import * as Permissions from "nativescript-permissions";
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;



@Injectable()
export class TransformedImageProvider {
    public imageList: any;
    public contourImageList: any;
    public constructor() {
        this.imageList = [];
        this.contourImageList = [];
    }

    public loadThumbnailImagesByContentResolver(orderByAscDesc: string, activityLoader: any) {
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
            let MediaStore = android.provider.MediaStore;
            this.imageList = [];
            let cursor = null;
            try {
                var context = application.android.context;
                let columns = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
                let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                let uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                let where = MediaStore.MediaColumns.DATA + " like '%thumb_PT_IMG%'";
                cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        let column_index = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        let imageUri = cursor.getString(column_index) + '';
                        let name = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
                        // let image = { fileUri: imageUri, text: name };
                        //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith(".png")) {
                        let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                        this.imageList.push(new TransformedImage(
                            name,
                            thumnailOrgPath,
                            imageUri,
                            false
                        ));

                        //   }
                    }
                }
                activityLoader.hide();
            } catch (error) {
                activityLoader.hide();
                Toast.makeText("Error while loading gallery images.", "long").show();
                console.log('getGalleryPhotos=>', JSON.stringify(error));
            }
        }).catch(() => {
            activityLoader.hide();
            Toast.makeText("Error in giving permission.", "long").show();
            console.log("Permission is not granted (sadface)");
        });
    }

    public LoadPossibleContourImages() {

        this.contourImageList = [];
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
            let MediaStore = android.provider.MediaStore;
            let cursor = null;
            try {
                var context = application.android.context;
                let columns = [MediaStore.MediaColumns.DATA];
                //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                let uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                let where = MediaStore.MediaColumns.DATA + " like '%contourImage%'";
                cursor = context.getContentResolver().query(uri, columns, where, null, null);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        let column_index = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        let imageUri = cursor.getString(column_index) + '';
                        let name = imageUri.substring(imageUri.lastIndexOf('contourImage'));
                        // let image = { fileUri: imageUri, text: name };
                        //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith(".png")) {
                        //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
                        this.contourImageList.push(new TransformedImage(
                            name,
                            imageUri,
                            imageUri,
                            false
                        ));

                        //   }
                    }
                }
                //         activityLoader.hide();
            } catch (error) {
                //           activityLoader.hide();
                Toast.makeText("Error while loading contour images.", "long").show();
                console.log('getcontourImages=>', JSON.stringify(error));
            }

        }).catch(() => {
            //   activityLoader.hide();
            Toast.makeText("Error in giving permission.", "long").show();
            console.log("Permission is not granted (sadface)");
        });
    }

    public DeleteFiles() {

        this.contourImageList = [];
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
            let MediaStore = android.provider.MediaStore;
            let cursor = null;
            try {
                var context = application.android.context;
                let columns = [MediaStore.MediaColumns.DATA];
                //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
                let uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
                let where = MediaStore.MediaColumns.DATA + " like '%_TEMP%'";
                cursor = context.getContentResolver().query(uri, columns, where, null, null);
                if (cursor && cursor.getCount() > 0) {
                    while (cursor.moveToNext()) {
                        let column_index = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                        let imageUri = cursor.getString(column_index) + '';
                        let tempFile: File = File.fromPath(imageUri);
                        tempFile.remove()
                            .then((res) => {
                                SendBroadcastImage(imageUri);
                            }).catch((err) => {
                                Toast.makeText("Error while deleting temporary images").show();
                                console.log(err.stack);
                            });
                    }
                }
            } catch (error) {
                //           activityLoader.hide();
                Toast.makeText("Error while loading temporary images.", "long").show();
                console.log('Temporary files =>', JSON.stringify(error));
            }

        }).catch(() => {
            //   activityLoader.hide();
            Toast.makeText("Error in giving permission.", "long").show();
            console.log("Permission is not granted (sadface)");
        });
    }

    public deleteFile(fileURI: string) {
        let tempFile: File = File.fromPath(fileURI);
        tempFile.remove()
            .then((res) => {
                SendBroadcastImage(fileURI);
            }).catch((err) => {
                Toast.makeText("deleteFile: Error while deleting temporary files").show();
                console.log(err.stack);
            });
    }

    public renameFile(fileURI: string, renameFileto: string) {

        // Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
            // let MediaStore = android.provider.MediaStore;
            // let cursor = null;
            let tempFile: File = File.fromPath(fileURI);
            // let tempFileTo: File = File.fromPath(renameFileto);
            tempFile.rename(renameFileto)
                .then((res) => {
                    SendBroadcastImage(fileURI);
                    SendBroadcastImage(renameFileto);
                }).catch((err) => {
                    Toast.makeText("renameFile: Error while renaming temporary file").show();
                    console.log(err.stack);
                });
        // }).catch(() => {
        //     //   activityLoader.hide();
        //     Toast.makeText("Error in giving permission.", "long").show();
        //     console.log("Permission is not granted (sadface)");
        // });
    }

}
export function SendBroadcastImage(imgURI) {
    let imageFile = new java.io.File(imgURI);
    let contentUri = android.net.Uri.fromFile(imageFile);
    let mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
export class TransformedImage {
    constructor(public fileName: string, public filePath: string, public thumbnailPath: string, public isSelected: boolean) { }
}
export class ActivityLoader {

    //var enums = require("ui/enums");
    private loader = new LoadingIndicator();
    // optional options
    // android and ios have some platform specific options
    private getOptions(): any {
        let options = {
            message: 'Loading...',
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: true,
                cancelListener: function (dialog) { console.log("Loading cancelled") },
                max: 100,
                progressNumberFormat: "%1d/%2d",
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1
            },
            ios: {
                details: "Additional detail note!",
                margin: 10,
                dimBackground: true,
                color: "#4B9ED6", // color of indicator and labels
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: "yellow",
                hideBezel: true // default false, can hide the surrounding bezel
                //view: UIView // Target view to show on top of (Defaults to entire window)
                //  mode: // see iOS specific options below
            }
        };
        return options;
    }
    public show() {
        try {
            this.loader.show(this.getOptions());
        } catch (e) {
            console.log('Error while showing lodingindicator. ' + e);
        }
    }
    public hide() {
        this.loader.hide();
    }
}
