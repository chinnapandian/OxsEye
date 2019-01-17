import { Component, OnDestroy, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { File } from "tns-core-modules/file-system";
import { Observable, PropertyChangeData } from "tns-core-modules/data/observable";
import { RouterExtensions } from "nativescript-angular/router";
import { EventData } from "tns-core-modules/data/observable";
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { Page } from "tns-core-modules/ui/page";
import { View } from "ui/core/view";
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from "ui/gestures";
import { ObservableArray } from "data/observable-array";
import { ActivatedRoute} from "@angular/router";
import { TransformedImageProvider } from '../providers/transformedimage.provider';
import { ImageSource } from 'tns-core-modules/image-source';
import * as application from "tns-core-modules/application";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as Toast from 'nativescript-toast';
import * as Permissions from "nativescript-permissions";

let item: View;
let prevDeltaX: number;
let prevDeltaY: number;
let startScale = 1;

@Component({
    selector: "ns-imageslide",
    moduleId: module.id,
    styleUrls: ['./imageslide.component.css'],
    templateUrl: "./imageslide.component.html",
})

export class ImageSlideComponent implements OnInit, OnDestroy {
    public imageFileList: Array<any>;
    public direction: number;
    public imageSource: ImageSource;
    public imgNext: number;
    public isBusy: boolean;
    public isBack: boolean;
    public isSharing: boolean;
    public isDeleting: boolean;

    public imgURI: string;
    public imgIndex: number;
    public lastname: string;

    constructor(private zone: NgZone,
        private page: Page,
        private routerExtensions: RouterExtensions,
        private route: ActivatedRoute,
        private transformedImageProvider: TransformedImageProvider) {
        this.route.queryParams.subscribe(params => {
            this.imgURI = params["imgURI"];
            this.imgIndex = params["imgIndex"];
            console.log(this.imgURI + ' ' + this.imgIndex);
        });
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {

        this.imgNext = this.imgIndex;
        this.isBusy = false;
        this.isBack = false;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
    }
    goBack() {
       // this.isBusy = true;
        this.routerExtensions.back();
    }

    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            const newOriginX = args.getFocusX() - item.translateX;
            const newOriginY = args.getFocusY() - item.translateY;

            const oldOriginX = item.originX * item.getMeasuredWidth();
            const oldOriginY = item.originY * item.getMeasuredHeight();

            item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
            item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);

            item.originX = newOriginX / item.getMeasuredWidth();
            item.originY = newOriginY / item.getMeasuredHeight();

            startScale = item.scaleX;
        }

        else if (args.scale && args.scale !== 1) {
            let newScale = startScale * args.scale;
            newScale = Math.min(8, newScale);
            newScale = Math.max(0.125, newScale);

            item.scaleX = newScale;
            item.scaleY = newScale;
        }
    }
    onPan(args: PanGestureEventData) {
        if (args.state === 1) {
            prevDeltaX = 0;
            prevDeltaY = 0;
        }
        else if (args.state === 2) {
            item.translateX += args.deltaX - prevDeltaX;
            item.translateY += args.deltaY - prevDeltaY;

            prevDeltaX = args.deltaX;
            prevDeltaY = args.deltaY;
        }
    }
    onDoubleTap(args: GestureEventData) {
        item.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeIn",
            duration: 10
        }).then(function () {
        });
    }
    pageLoaded(args) {
        if (this.imageFileList.length > 0)
            this.imageSource = this.imageFileList[this.imgIndex].filePath;
        const page = args.object;
        item = page.getViewById("imgSlideId");

        item.translateX = 0;
        item.translateY = 0;
        item.scaleX = 1;
        item.scaleY = 1;
    }
    onSwipe(args: SwipeGestureEventData) {

        this.direction = args.direction;
        if (args.direction == 2 || !this.direction) {
            this.imgNext++;
            if (this.imgNext <= 0 || this.imgNext >= this.imageFileList.length)
                this.imgNext = 0;

        } else if (args.direction == 1) {
            this.imgNext--;
            if (this.imgNext < 0 || this.imgNext >= this.imageFileList.length)
                this.imgNext = (this.imageFileList.length - 1);

        }
        this.imgIndex = this.imgNext;
        if (this.imageFileList.length > 0)
            this.imageSource = this.imageFileList[this.imgNext].filePath;
        else {
            this.imageSource = null;
            this.isDeleting = false;
            this.isSharing = false;
            Toast.makeText("No image available.").show();
        }
        this.onDoubleTap(args);
    }

    private getOriginalImage(transformedImage: string): any {
        let imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', ".");

        let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.replace('_transformed.png', '.jpg');
        let newFile = new java.io.File(imagePath, imgFileNameOrg);
        let uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    }
    onShare() {
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.INTERNET], "Needed for sharing files").then(() => {

            try {
                var uris = new java.util.ArrayList<android.net.Uri>();
                var filesToBeAttached = '';
                let imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', ".");
                let imgFileNameOrg = this.imageFileList[this.imgNext].fileName;
                imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                let newFile = new java.io.File(imagePath, imgFileNameOrg);
                let uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
                application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                uris.add(uri);
                uris.add(this.getOriginalImage(imgFileNameOrg));

                filesToBeAttached = filesToBeAttached.concat(',' + this.imageFileList[this.imgNext].filePath);
                if (uris.size() > 0) {
                    let intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("text/plain");
                    let message = "File(s) to be shared : " + filesToBeAttached + ".";
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "File(s) to be shared...");

                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, "Send mail..."));
                }
            } catch (e) {
                Toast.makeText("Error while sending mail." + e).show();
                console.log("is exception raises during sending mail " + e);
            }
        }).catch(() => {
            Toast.makeText("Error in giving permission.").show();
            console.log("Permission is not granted (sadface)");
        });


    }

    onDelete(args) {
        dialogs.confirm({
            title: "Delete",
            message: "Deleting selected item(s)...",
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        }).then(result => {
            if (result) {
                if (this.imageFileList.length > 0) {
                    let file: File = File.fromPath(this.imageFileList[this.imgNext].filePath);
                    file.remove()
                        .then((res) => {
                            let thumbnailFile: File = File.fromPath(this.imageFileList[this.imgNext].thumbnailPath);
                            thumbnailFile.remove()
                                .then((res) => {
                                    this.imageFileList.splice(this.imgNext, 1);
                                    Toast.makeText("Selected image deleted.").show();
                                    this.onSwipe(args);
                                }).catch((err) => {
                                    console.log('Error while deleting thumbnail image. ' + err.stack);
                                });
                        }).catch((err) => {
                            console.log('Error while deleting original image. ' + err.stack);
                        });
                } else {
                    this.imageSource = null;
                    this.isDeleting = false;
                    this.isSharing = false;
                    Toast.makeText("No image available.").show();
                }
            }
        });
    }
}

