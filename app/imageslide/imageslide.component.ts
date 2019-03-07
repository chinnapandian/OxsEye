import { Component, OnDestroy, OnInit, ViewChild, ElementRef, NgZone } from "@angular/core";
import { File } from "tns-core-modules/file-system";
import { RouterExtensions } from "nativescript-angular/router";
import { EventData } from "tns-core-modules/data/observable";
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { Page } from "tns-core-modules/ui/page";
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from "ui/gestures";
import { ActivatedRoute } from "@angular/router";
import { TransformedImageProvider, SendBroadcastImage } from '../providers/transformedimage.provider';
import { ImageSource } from 'tns-core-modules/image-source';
import { Image } from "ui/image";
import * as application from "tns-core-modules/application";
import * as dialogs from "tns-core-modules/ui/dialogs";
import * as Toast from 'nativescript-toast';
import * as Permissions from "nativescript-permissions";
import {AnimationCurve} from "tns-core-modules/ui/enums";

declare var android;

@Component({
    selector: "ns-imageslide",
    moduleId: module.id,
    styleUrls: ['./imageslide.component.css'],
    templateUrl: "./imageslide.component.html",
})

export class ImageSlideComponent implements OnInit, OnDestroy {

    public imageSource: ImageSource;
    public isSharing: boolean;
    public isDeleting: boolean;
    @ViewChild("imgSlideId") _dragImage: ElementRef;
    private _imgURI: string;
    private _imgIndex: number;
    private _dragImageItem: Image;
    private _prevDeltaX: number;
    private _prevDeltaY: number;
    private _imageFileList: Array<any>;
    private _imgNext: number;
    private _isBusy: boolean;
    private _naviBarHeight: number;
    private _startScale = 1;
    private _newScale = 1;
    private _isPinchSelected = false;
    private _oldOriginX = 0;
    private _oldOriginY = 0;
    private _newOriginX = 0;
    private _newOriginY = 0;
    private _oldTranslateX = 0;
    private _oldTranslateY = 0;

    constructor(private zone: NgZone,
        private page: Page,
        private routerExtensions: RouterExtensions,
        private route: ActivatedRoute,
        private transformedImageProvider: TransformedImageProvider) {
        this.route.queryParams.subscribe(params => {
            this._imgURI = params["imgURI"];
            this._imgIndex = params["imgIndex"];
        });
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {

        this._imgNext = this._imgIndex;
        this._isBusy = false;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new ImageSource();
        this._imageFileList = this.transformedImageProvider.imageList;
        this._dragImageItem = <Image>this._dragImage.nativeElement;
        this._dragImageItem.translateX = 0;
        this._dragImageItem.translateY = 0;
        this._dragImageItem.scaleX = 1;
        this._dragImageItem.scaleY = 1
        this._naviBarHeight = 0;
    }
    goBack() {
        this.routerExtensions.back();
    }

    onPinch(args: PinchGestureEventData) {

        if (args.state === 1) {
            this._newOriginX = args.getFocusX() - this._dragImageItem.translateX;
            this._newOriginY = args.getFocusY() - this._dragImageItem.translateY;
            this._oldOriginX = this._dragImageItem.originX * this._dragImageItem.getMeasuredWidth();
            this._oldOriginY = this._dragImageItem.originY * this._dragImageItem.getMeasuredHeight();
            this._startScale = this._dragImageItem.scaleX;
            this._isPinchSelected = true;

        } else if (args.scale && args.scale !== 1) {
            this._newScale = this._startScale * args.scale;
            this._newScale = Math.min(15, this._newScale);
            this._newScale = Math.max(0.1, this._newScale);
            this._dragImageItem.scaleX = this._newScale;
            this._dragImageItem.scaleY = this._newScale;

            this._dragImageItem.width = this._dragImageItem.getMeasuredWidth() * this._newScale;
            this._dragImageItem.height = this._dragImageItem.getMeasuredHeight() * this._newScale;
        }
    }

    onPan(args: PanGestureEventData) {
        let screenLocation = this._dragImageItem.getLocationOnScreen();
        let centerPointX = (this._dragImageItem.getMeasuredWidth() / 4) * (this._newScale);
        let centerPointY = (this._dragImageItem.getMeasuredHeight() / 4) * (this._newScale);
        let imageViewWidth = this._dragImageItem.getMeasuredWidth() * this._dragImageItem.originX;
        let imageViewHeight = this._dragImageItem.getMeasuredHeight() * this._dragImageItem.originY;


        if (args.state === 1) {
            this._prevDeltaX = 0;
            this._prevDeltaY = 0;
        }
        else if (args.state === 2) {
        
            centerPointX = (centerPointX * 2);
            centerPointY = (centerPointY * 2);

            let screenLocation = this._dragImageItem.getLocationOnScreen();

            if (this._newScale < 15) {
                if (this._newScale > 1) {
                    if (screenLocation.x <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x)
                    ) {
                        this._dragImageItem.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._dragImageItem.translateX;
                    }
                    else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        } else {
                            this._oldTranslateX++;
                        }
                        this._dragImageItem.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - this._naviBarHeight) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y)
                    ) {
                        this._dragImageItem.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._dragImageItem.translateY;
                    }
                    else {
                        if (this._oldTranslateY > 0) {
                            this._oldTranslateY--;
                        } else {
                            this._oldTranslateY++;
                        }
                        this._dragImageItem.translateY = this._oldTranslateY;
                    }
                }
            }
            if (this._newScale >= 15) {
                let translateXTemp = this._dragImageItem.translateX + args.deltaX - this._prevDeltaX;
                let translateYTemp = this._dragImageItem.translateY + args.deltaY - this._prevDeltaY;
                if (this._oldTranslateX < translateXTemp) {
                    this._dragImageItem.translateX = this._oldTranslateX;
                } else {
                    this._dragImageItem.translateX = translateXTemp;
                }
                if (this._oldTranslateY < translateYTemp) {
                    this._dragImageItem.translateY = this._oldTranslateY;
                } else {
                    this._dragImageItem.translateY = translateYTemp;
                }
            }

            this._prevDeltaX = args.deltaX;
            this._prevDeltaY = args.deltaY;

        } else if (args.state === 3) // up
        {
            this._isPinchSelected = false;
        }
    }
    onDoubleTap(args: GestureEventData) {
        this._dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeIn",
            duration: 10
        }).then(function () {
        });
        this._newScale = 1;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    }
    pageLoaded(args) {
        if (this._imageFileList.length > 0)
            this.imageSource = this._imageFileList[this._imgIndex].filePath;
        // const page = args.object;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
        // this._dragImageItem = page.getViewById("imgSlideId");

        // this._dragImageItem.translateX = 0;
        // this._dragImageItem.translateY = 0;
        // this._dragImageItem.scaleX = 1;
        // this._dragImageItem.scaleY = 1;
    }
    onSwipe(args: SwipeGestureEventData) {
        if (this._dragImageItem.scaleX == 1 && this._dragImageItem.scaleY == 1) {

            if (args.direction == 2 || !args.direction) {
                this._imgNext++;
                if (this._imgNext <= 0 || this._imgNext >= this._imageFileList.length)
                    this._imgNext = 0;

            } else if (args.direction == 1) {
                this._imgNext--;
                if (this._imgNext < 0 || this._imgNext >= this._imageFileList.length)
                    this._imgNext = (this._imageFileList.length - 1);

            }
            this._imgIndex = this._imgNext;
            if (this._imageFileList.length > 0)
                this.imageSource = this._imageFileList[this._imgNext].filePath;
            else {
                this.imageSource = null;
                this.isDeleting = false;
                this.isSharing = false;
                Toast.makeText("No image available.").show();
            }
            this.onDoubleTap(args);
        }
    }

    private getOriginalImage(transformedImage: string): any {
        let imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', ".");

        let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
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
                let imgFileNameOrg = this._imageFileList[this._imgNext].fileName;
                imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                let newFile = new java.io.File(imagePath, imgFileNameOrg);
                let uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
                application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                uris.add(uri);
                uris.add(this.getOriginalImage(imgFileNameOrg));

                filesToBeAttached = filesToBeAttached.concat(',' + this._imageFileList[this._imgNext].filePath);
                if (uris.size() > 0) {
                    let intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("image/jpeg");
                    let message = "Perspective correction pictures : " + filesToBeAttached + ".";
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "Perspective correction pictures...");

                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
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
                if (this._imageFileList.length > 0) {
                    this._dragImageItem.translateX = 0;
                    this._dragImageItem.translateY = 0;
                    this._dragImageItem.scaleX = 1;
                    this._dragImageItem.scaleY = 1;
                    let file: File = File.fromPath(this._imageFileList[this._imgNext].filePath);
                    file.remove()
                        .then((res) => {
                            let thumbnailFile: File = File.fromPath(this._imageFileList[this._imgNext].thumbnailPath);
                            thumbnailFile.remove()
                                .then((res) => {
                                    SendBroadcastImage(this._imageFileList[this._imgNext].thumbnailPath);
                                    this._imageFileList.splice(this._imgNext, 1);
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

