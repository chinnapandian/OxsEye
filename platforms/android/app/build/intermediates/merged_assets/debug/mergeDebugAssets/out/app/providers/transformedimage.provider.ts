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
    public constructor() {
        this.imageList = [];
    }
}
export function SendBroadcastImage(imgURI) {
    let imageFile = new java.io.File(imgURI);
    let contentUri = android.net.Uri.fromFile(imageFile);
    let mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
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
        } catch(e) {
            console.log('Error while showing lodingindicator. ' + e);
        }
    }
    public hide() {
        this.loader.hide();
    }
}
