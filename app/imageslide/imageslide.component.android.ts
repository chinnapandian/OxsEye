import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { File } from 'tns-core-modules/file-system';
import { ImageSource } from 'tns-core-modules/image-source';
import { SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
import { Page } from 'tns-core-modules/ui/page';

import { GestureEventData, PanGestureEventData, PinchGestureEventData } from 'ui/gestures';
import { Image } from 'ui/image';

import { RouterExtensions } from 'nativescript-angular/router';

import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

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
    private imgURI: string;
    /** Image index being used to get an image for the given index */
    private imgIndex: number;
    /** Image referrence from _dragImage */
    private dragImageItem: Image;
    /** Contains previous deltaX value */
    private prevDeltaX: number;
    /** Contains previous deltaY value */
    private prevDeltaY: number;
    /** Contains list of image file path information */
    private imageFileList: any[];
    /** Contains image next index value */
    private imgNext: number;
    /** Contains initial scale value */
    private startScale = 1;
    /** Contains new scale value while moving the image */
    private newScale = 1;
    /** To indicate whether pinch is trigger or not */
    private isPinchSelected = false;
    /** To store old TranslateX value of image */
    private oldTranslateX = 0;
     /** To store old TranslateY value of image */
    private oldTranslateY = 0;
     /** Indicates whether the image got default screen location or not */
    private isGotDefaultLocation = false;
     /** Contains image default screen location */
    private defaultScreenLocation: any;

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
            this.imgURI = params['imgURI'];
            this.imgIndex = params['imgIndex'];
        });
    }
    /**
     * Angular initialization.
     */
    ngOnInit(): void {
        this.imgNext = this.imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
        this.dragImageItem = this._dragImage.nativeElement as Image;
        this.dragImageItem.translateX = 0;
        this.dragImageItem.translateY = 0;
        this.dragImageItem.scaleX = 1;
        this.dragImageItem.scaleY = 1;
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
            this.startScale = this.dragImageItem.scaleX;
            this.isPinchSelected = true;

        } else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(15, this.newScale);
            this.newScale = Math.max(0.1, this.newScale);
            this.dragImageItem.scaleX = this.newScale;
            this.dragImageItem.scaleY = this.newScale;

            this.dragImageItem.width = this.dragImageItem.getMeasuredWidth() * this.newScale;
            this.dragImageItem.height = this.dragImageItem.getMeasuredHeight() * this.newScale;
        }
    }
    /**
     * Moves images while move with a finger.
     * @param args PanGestureEventData
     */
    onPan(args: PanGestureEventData) {
        const screenLocation = this.dragImageItem.getLocationOnScreen();
        let centerPointX = (this.dragImageItem.getMeasuredWidth() / 4) * (this.newScale);
        let centerPointY = (this.dragImageItem.getMeasuredHeight() / 4) * (this.newScale);
        const imageViewWidth = this.dragImageItem.getMeasuredWidth() * this.dragImageItem.originX;
        const imageViewHeight = this.dragImageItem.getMeasuredHeight() * this.dragImageItem.originY;

        if (args.state === 1) {
            this.prevDeltaX = 0;
            this.prevDeltaY = 0;
        } else if (args.state === 2) {
            centerPointX = (centerPointX * 2);
            centerPointY = (centerPointY * 2);
            // let screenLocation = this.dragImageItem.getLocationOnScreen();

            if (this.newScale < 15) {
                if (!this.isGotDefaultLocation) {
                    this.defaultScreenLocation = screenLocation;
                    this.isGotDefaultLocation = true;
                }
                if (this.newScale > 1) {
                    if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)
                    ) {
                        this.dragImageItem.translateX += args.deltaX - this.prevDeltaX;
                        this.oldTranslateX = this.dragImageItem.translateX;
                    } else {
                        if (this.oldTranslateX > 0) {
                            this.oldTranslateX--;
                        } else {
                            this.oldTranslateX++;
                        }
                        this.dragImageItem.translateX = this.oldTranslateX;
                    }
                    if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)
                    ) {
                        this.dragImageItem.translateY += args.deltaY - this.prevDeltaY;
                        this.oldTranslateY = this.dragImageItem.translateY;
                    } else {
                        if (this.oldTranslateY > 0) {
                            this.oldTranslateY--;
                        } else {
                            this.oldTranslateY++;
                        }
                        this.dragImageItem.translateY = this.oldTranslateY;
                    }
                }
            }
            if (this.newScale >= 15) {
                const translateXTemp = this.dragImageItem.translateX + args.deltaX - this.prevDeltaX;
                const translateYTemp = this.dragImageItem.translateY + args.deltaY - this.prevDeltaY;
                if (this.oldTranslateX < translateXTemp) {
                    this.dragImageItem.translateX = this.oldTranslateX;
                } else {
                    this.dragImageItem.translateX = translateXTemp;
                }
                if (this.oldTranslateY < translateYTemp) {
                    this.dragImageItem.translateY = this.oldTranslateY;
                } else {
                    this.dragImageItem.translateY = translateYTemp;
                }
            }

            this.prevDeltaX = args.deltaX;
            this.prevDeltaY = args.deltaY;

        } else if (args.state === 3) {
            this.isPinchSelected = false;
        }
    }
    /**
     * Resets image position while double tap with single fingure.
     * @param args GestureEventData
     */
    onDoubleTap(args: GestureEventData) {
        this.dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeIn',
            duration: 10,
        });
        this.newScale = 1;
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    }
    /**
     * Sets the selected image in the image source while page loaded.
     * @param args any object
     */
    pageLoaded(args: any) {
        if (this.imageFileList.length > 0) {
            this.imageSource = this.imageFileList[this.imgIndex].filePath;
        }
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    }
    /**
     * Move image left/right while on swipe with fingure.
     * @param args SwipeGestureEventData
     */
    onSwipe(args: SwipeGestureEventData) {
        if (this.dragImageItem.scaleX === 1 && this.dragImageItem.scaleY === 1) {
            if (args.direction === 2 || !args.direction) {
                this.imgNext++;
                if (this.imgNext <= 0 || this.imgNext >= this.imageFileList.length) {
                    this.imgNext = 0;
                }

            } else if (args.direction === 1) {
                this.imgNext--;
                if (this.imgNext < 0 || this.imgNext >= this.imageFileList.length) {
                    this.imgNext = (this.imageFileList.length - 1);
                }

            }
            this.imgIndex = this.imgNext;
            if (this.imageFileList.length > 0) {
                this.imageSource = this.imageFileList[this.imgNext].filePath;
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
    //  * @returns image uri
    //  */
    // private getOriginalImage(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
    //     let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
    //     imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider',
    //     uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
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
                    let imgFileNameOrg = this.imageFileList[this.imgNext].fileName;
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

                    filesToBeAttached = filesToBeAttached.concat(',' + this.imageFileList[this.imgNext].filePath);
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
                if (this.imageFileList.length > 0) {
                    this.dragImageItem.translateX = 0;
                    this.dragImageItem.translateY = 0;
                    this.dragImageItem.scaleX = 1;
                    this.dragImageItem.scaleY = 1;
                    const file: File = File.fromPath(this.imageFileList[this.imgNext].filePath);
                    file.remove()
                        .then(() => {
                            const thumbnailFile: File = File.fromPath(this.imageFileList[this.imgNext].thumbnailPath);
                            thumbnailFile.remove()
                                .then(() => {
                                    SendBroadcastImage(this.imageFileList[this.imgNext].thumbnailPath);
                                    this.imageFileList.splice(this.imgNext, 1);
                                    Toast.makeText('Selected image deleted.').show();
                                    if (this.imageFileList.length > 0) {
                                        if (this.imageFileList.length === this.imgNext.valueOf()) {
                                            this.imgNext = 0;
                                        }
                                        this.imageSource = this.imageFileList[this.imgNext].filePath;
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
