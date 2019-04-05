import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { File } from 'tns-core-modules/file-system';
import { RouterExtensions } from 'nativescript-angular/router';
import { EventData } from 'tns-core-modules/data/observable';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
import { Page } from 'tns-core-modules/ui/page';
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from 'ui/gestures';
import { ActivatedRoute } from '@angular/router';
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';
import { ImageSource } from 'tns-core-modules/image-source';
import { Image } from 'ui/image';
import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import * as Toast from 'nativescript-toast';
import * as Permissions from 'nativescript-permissions';

/**
 * ImageSlideComponent Component.
 */
@Component({
    selector: 'ns-imageslide',
    moduleId: module.id,
    styleUrls: ['./imageslide.component.css'],
    templateUrl: './imageslide.component.html',
})
export class ImageSlideComponent implements OnInit {
    /**  Used to store image source and also used in GUI */
    public imageSource: ImageSource;
    /**  To indicate the sharing menu is visible or not */
    public isSharing: boolean;
    /** To indicate the deleting menu is visible or not */
    public isDeleting: boolean;
    /** Child element referrence */
    @ViewChild('imgSlideId') _dragImage: ElementRef;
    /** Image URI */
    private _imgURI: string;
    /** Image index being used to get an image for the given index */
    private _imgIndex: number;
    /** Image referrence from _dragImage */
    private _dragImageItem: Image;
    /** Contains previous deltaX value */
    private _prevDeltaX: number;
    /** Contains previous deltaY value */
    private _prevDeltaY: number;
    /** Contains list of image file path information */
    private _imageFileList: any[];
    /** Contains image next index value */
    private _imgNext: number;
    /** Contains initial scale value */
    private _startScale = 1;
    /** Contains new scale value while moving the image */
    private _newScale = 1;
    /** To indicate whether pinch is trigger or not */
    private _isPinchSelected = false;
    /** To store old TranslateX value of image */
    private _oldTranslateX = 0;
     /** To store old TranslateY value of image */
    private _oldTranslateY = 0;
     /** Indicates whether the image got default screen location or not */
    private _isGotDefaultLocation = false;
     /** Contains image default screen location */
    private _defaultScreenLocation: any;
    
    /**
     * ImageSlideComponent constructor.
     * @param page Page
     * @param routerExtensions RouterExtensions
     * @param route ActivatedRoute
     * @param transformedImageProvider TransformedImageProvider
     */
    constructor(
        private page: Page,
        private routerExtensions: RouterExtensions,
        private route: ActivatedRoute,
        private transformedImageProvider: TransformedImageProvider) {
        this.route.queryParams.subscribe((params) => {
            this._imgURI = params['imgURI'];
            this._imgIndex = params['imgIndex'];
        });
    }
    /**
     * Angular initialization.
     */
    ngOnInit(): void {
        this._imgNext = this._imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new ImageSource();
        this._imageFileList = this.transformedImageProvider.imageList;
        this._dragImageItem = this._dragImage.nativeElement as Image;
        this._dragImageItem.translateX = 0;
        this._dragImageItem.translateY = 0;
        this._dragImageItem.scaleX = 1;
        this._dragImageItem.scaleY = 1;
    }
    /**
     * Go back to previous page
     */
    goBack() {
        this.routerExtensions.back();
    }
    /**
     * Triggers while pinch with two fingers.
     * @param args PinchGestureEventData
     */
    onPinch(args: PinchGestureEventData) {

        if (args.state === 1) {
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
    /**
     * Moves images while move with a finger.
     * @param args PanGestureEventData
     */
    onPan(args: PanGestureEventData) {
        const screenLocation = this._dragImageItem.getLocationOnScreen();
        let centerPointX = (this._dragImageItem.getMeasuredWidth() / 4) * (this._newScale);
        let centerPointY = (this._dragImageItem.getMeasuredHeight() / 4) * (this._newScale);
        const imageViewWidth = this._dragImageItem.getMeasuredWidth() * this._dragImageItem.originX;
        const imageViewHeight = this._dragImageItem.getMeasuredHeight() * this._dragImageItem.originY;

        if (args.state === 1) {
            this._prevDeltaX = 0;
            this._prevDeltaY = 0;
        } else if (args.state === 2) {
            centerPointX = (centerPointX * 2);
            centerPointY = (centerPointY * 2);
            // let screenLocation = this._dragImageItem.getLocationOnScreen();

            if (this._newScale < 15) {
                if (!this._isGotDefaultLocation) {
                    this._defaultScreenLocation = screenLocation;
                    this._isGotDefaultLocation = true;
                }
                if (this._newScale > 1) {
                    if ((screenLocation.x - this._defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this._defaultScreenLocation.x)
                    ) {
                        this._dragImageItem.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._dragImageItem.translateX;
                    } else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        } else {
                            this._oldTranslateX++;
                        }
                        this._dragImageItem.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - this._defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this._defaultScreenLocation.y)
                    ) {
                        this._dragImageItem.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._dragImageItem.translateY;
                    } else {
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
                const translateXTemp = this._dragImageItem.translateX + args.deltaX - this._prevDeltaX;
                const translateYTemp = this._dragImageItem.translateY + args.deltaY - this._prevDeltaY;
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

        } else if (args.state === 3) {
            this._isPinchSelected = false;
        }
    }
    /**
     * Resets image position while double tap with single fingure.
     * @param args GestureEventData
     */
    onDoubleTap(args: GestureEventData) {
        this._dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeIn',
            duration: 10,
        });
        this._newScale = 1;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    }
    /**
     * Sets the selected image in the image source while page loaded.
     * @param args any object
     */
    pageLoaded(args: any) {
        if (this._imageFileList.length > 0) {
            this.imageSource = this._imageFileList[this._imgIndex].filePath;
        }
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    }
    /**
     * Move image left/right while on swipe with fingure.
     * @param args SwipeGestureEventData
     */
    onSwipe(args: SwipeGestureEventData) {
        if (this._dragImageItem.scaleX === 1 && this._dragImageItem.scaleY === 1) {
            if (args.direction === 2 || !args.direction) {
                this._imgNext++;
                if (this._imgNext <= 0 || this._imgNext >= this._imageFileList.length) {
                    this._imgNext = 0;
                }

            } else if (args.direction === 1) {
                this._imgNext--;
                if (this._imgNext < 0 || this._imgNext >= this._imageFileList.length) {
                    this._imgNext = (this._imageFileList.length - 1);
                }

            }
            this._imgIndex = this._imgNext;
            if (this._imageFileList.length > 0) {
                this.imageSource = this._imageFileList[this._imgNext].filePath;
            } else {
                this.imageSource = null;
                this.isDeleting = false;
                this.isSharing = false;
                Toast.makeText('No image available.').show();
            }
            this.onDoubleTap(args);
        }
    }
    // /**
    //  * Gets original image.
    //  * @param transformedImage 
    //  * 
    //  * @returns image uri
    //  */
    // private getOriginalImage(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');

    //     let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
    //     imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     return uri;
    // }

    /**
     * Shares image(s) while on share.
     */
    onShare() {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERNET],
            'Needed for sharing files').then(() => {
                try {
                    const uris = new java.util.ArrayList<android.net.Uri>();
                    let filesToBeAttached = '';
                    const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
                    let imgFileNameOrg = this._imageFileList[this._imgNext].fileName;
                    imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                    const newFile = new java.io.File(imagePath, imgFileNameOrg);
                    // const uri = android.support.v4.content.FileProvider.getUriForFile(
                    //     application.android.context, 'oxs.eye.fileprovider', newFile);
                    // application.android.context.grantUriPermission(
                    //     'oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    const uri = this.transformedImageProvider.getURIForFile(newFile);
                    uris.add(uri);
                    uris.add(this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                    uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));

                    filesToBeAttached = filesToBeAttached.concat(',' + this._imageFileList[this._imgNext].filePath);
                    if (uris.size() > 0) {
                        const intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                        intent.setType('image/jpeg');
                        const message = 'Perspective correction pictures : ' + filesToBeAttached + '.';
                        intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');

                        intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                        intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                        intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Send mail...'));
                    }
                } catch (e) {
                    Toast.makeText('Error while sending mail.' + e).show();
                    console.log('is exception raises during sending mail ' + e);
                }
            }).catch(() => {
                Toast.makeText('Error in giving permission.').show();
                console.log('Permission is not granted (sadface)');
            });
    }
    /**
     * Delete selected image.
     * @param args any boject
     */
    onDelete(args: any) {
        dialogs.confirm({
            title: 'Delete',
            message: 'Deleting selected item(s)...',
            okButtonText: 'Ok',
            cancelButtonText: 'Cancel',
        }).then((result) => {
            if (result) {
                if (this._imageFileList.length > 0) {
                    this._dragImageItem.translateX = 0;
                    this._dragImageItem.translateY = 0;
                    this._dragImageItem.scaleX = 1;
                    this._dragImageItem.scaleY = 1;
                    const file: File = File.fromPath(this._imageFileList[this._imgNext].filePath);
                    file.remove()
                        .then(() => {
                            const thumbnailFile: File = File.fromPath(this._imageFileList[this._imgNext].thumbnailPath);
                            thumbnailFile.remove()
                                .then(() => {
                                    SendBroadcastImage(this._imageFileList[this._imgNext].thumbnailPath);
                                    this._imageFileList.splice(this._imgNext, 1);
                                    Toast.makeText('Selected image deleted.').show();
                                    if (this._imageFileList.length > 0) {
                                        if (this._imageFileList.length == this._imgNext.valueOf()) {
                                            this._imgNext = 0;
                                        }
                                        this.imageSource = this._imageFileList[this._imgNext].filePath;
                                    } else {
                                        this.imageSource = null;
                                        this.isDeleting = false;
                                        this.isSharing = false;
                                        Toast.makeText('No image available.').show();
                                    }
                                    // this.onSwipe(args);
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
                    Toast.makeText('No image available.').show();
                }
            }
        });
    }
}
