import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { File } from 'tns-core-modules/file-system';
import { ImageSource } from 'tns-core-modules/image-source';
import { Page } from 'tns-core-modules/ui/page';

import { GestureEventData, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
import { Image } from 'tns-core-modules/ui/image';

import { RouterExtensions } from 'nativescript-angular/router';

import { localize } from "nativescript-localize";
// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';
import { PageChangeEventData, ImageSwipe } from "nativescript-image-swipe";

// import { EventData, Observable } from "data/observable";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { EventData, Observable } from "tns-core-modules/data/observable";

import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

declare var android: any;
declare var java: any;
declare var org: any;
let viewModel: Observable;
const imageUrlList = new ObservableArray();

/**
 * ImageSlideComponent is used to show image in detail view, where user can zoom-in/out.
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
    @ViewChild('imgSlideId', { static: true }) _dragImage: ElementRef;

    private isDeleted: boolean;
    /** Image URI */
    private imgURI: string;
    /** Image index being used to get an image for the given index */
    private imgIndex: number;
    /** Image referrence from _dragImage */
    private dragImageItem: any;
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
    public imageUrlList = new ObservableArray();// any[] = [];
    public pageNumber: number = 3;

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
        private transformedImageProvider: TransformedImageProvider,
        private logger: OxsEyeLogger) {
        this.route.queryParams.subscribe((params) => {
            this.imgURI = params['imgURI'];
            this.imgIndex = params['imgIndex'];
        });
    }
    /**
     * Initializes page properties like menus ('delete'/'share') and the image
     * properties like translateX/translateY/scaleX/scaleY.
     */
    ngOnInit(): void {
        this.imgNext = this.imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.isDeleted = false;
        this.imageSource = new ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
        this.dragImageItem = this._dragImage.nativeElement as ImageSwipe;
        // this.dragImageItem = this._dragImage.nativeElement as Image;
        this.dragImageItem.translateX = 0;
        this.dragImageItem.translateY = 0;
        this.dragImageItem.scaleX = 1;
        this.dragImageItem.scaleY = 1;

        this.imageSource = this.imageFileList[this.imgIndex].filePath;
        this.pageNumber = this.imgIndex;
        // if (this.imageFileList.length > 0) {
        //     this.imageSource = this.imageFileList[this.imgIndex].filePath;
        //     const imageFile = new java.io.File(this.imageSource);
        //     this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
        // }

        this.imageFileList.forEach(img => {
            const imageFile = new java.io.File(img.filePath);
            this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
        });
        // this.imageUrlList.push(
        //     { imageUrl: "https://www.nationalgeographic.com/content/dam/photography/rights-exempt/best-of-photo-of-the-day/2017/animals/01_pod-best-animals.jpg" },
        //     { imageUrl: "https://news.nationalgeographic.com/content/dam/news/2016/02/24/01highanimals.jpg" },
        //     { imageUrl: "https://kids.nationalgeographic.com/content/dam/kids/photos/games/screen-shots/More%20Games/A-G/babyanimal_open.ngsversion.1429194155981.jpg" },
        //     { imageUrl: "https://kids.nationalgeographic.com/content/dam/kids/photos/animals/Mammals/H-P/koala-closeup-tree.adapt.945.1.jpg" }
        // );
        viewModel = new Observable();
        viewModel.set("imageUrlList", this.imageUrlList);
        viewModel.set("pageNumber", this.imgIndex);

        this.page.bindingContext = viewModel;
    }

    public pageChanged(e: PageChangeEventData) {
        console.log(`Page changed...  to ${e.page}.`);
        if (this.imgNext.valueOf() == e.page && e.page == 0 && this.isDeleted) {
            this.pageNumber = 1;
            viewModel.set("pageNumber", 1);
            this.isDeleted = false;
        }
        this.imgNext = e.page;
    }
    /**
     * Goes back to previous page when the back button is pressed.
     */
    goBack() {
        this.routerExtensions.back();
    }

    // These matrices will be used to scale points of the image
    matrix = new android.graphics.Matrix();
    savedMatrix = new android.graphics.Matrix();

    // The 3 states (events) which the user is trying to perform
    NONE = 0;
    DRAG = 1;
    ZOOM = 2;
    mode = this.NONE;

    // these PointF objects are used to record the point(s) the user is touching
    start = new android.graphics.PointF();
    mid = new android.graphics.PointF();
    oldDist = 1;

    onTouch(event: any) {
        //  ImageView view = (ImageView) v;
        let view = this.dragImageItem; //event.object as Image;
        view.android.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
        let scale;
        switch (event.android.getActionMasked()) {
            case android.view.MotionEvent.ACTION_DOWN:
                console.log('android.view.MotionEvent.ACTION_DOWN:.');
                this.savedMatrix.set(this.matrix);
                this.start.set(event.getX(), event.getY());
                this.mode = this.DRAG;


                // this._mode = MODE_DRAG;
                // this._startX = event.getX();
                // this._startY = event.getY();
                break;
            case android.view.MotionEvent.ACTION_MOVE:
                console.log('android.view.MotionEvent.ACTION_MOVE:.');
                if (this.mode == this.DRAG) {
                    this.matrix.set(this.savedMatrix);
                    this.matrix.postTranslate(event.getX() - this.start.x, event.getY() - this.start.y); // create the transformation in the matrix  of points
                }
                else if (this.mode == this.ZOOM) {
                    // pinch zooming
                    let newDist = this.spacing(event);
                    // Log.d(TAG, "newDist=" + newDist);
                    if (newDist > 5) {
                        this.matrix.set(this.savedMatrix);
                        scale = newDist / this.oldDist; // setting the scaling of the
                        // matrix...if scale > 1 means
                        // zoom in...if scale < 1 means
                        // zoom out
                        this.matrix.postScale(scale, scale, this.mid.x, this.mid.y);
                    }
                }
                // var scaleFactor = this.getScaleFactor();
                //   let scaleFactor =  Math.min(_this.getHeight() / _this._image.getHeight(), _this.getWidth() / _this._image.getWidth()));


                // var translateX = this._startX - event.getX();
                // var translateY = this._startY - event.getY();
                // var totalTranslateX = this.getTotalTranslateX();
                // var totalTranslateY = this.getTotalTranslateY();
                // var height = this.getHeight();
                // var width = this.getWidth();
                // var imageHeight = this._image.getHeight();
                // var imageWidth = this._image.getWidth();
                // var canScroll = false;
                // if (Math.max(0, (width - (imageWidth * scaleFactor)) / 2) !== 0) {
                //     translateX = 0;
                //     canScroll = true;
                // }
                // else if (totalTranslateX + translateX < 0) {
                //     translateX = -totalTranslateX;
                //     canScroll = true;
                // }
                // else if (totalTranslateX + translateX + width > imageWidth * scaleFactor) {
                //     translateX = (imageWidth * scaleFactor) - width - totalTranslateX;
                //     canScroll = true;
                // }
                // if (this._onCanScrollChangeListener) {
                //     this._onCanScrollChangeListener.onCanScrollChanged(canScroll);
                // }
                // if (Math.max(0, (height - (imageHeight * scaleFactor)) / 2) !== 0) {
                //     translateY = 0;
                // }
                // else if (totalTranslateY + translateY < 0) {
                //     translateY = -totalTranslateY;
                // }
                // else if (totalTranslateY + translateY + height > imageHeight * scaleFactor) {
                //     translateY = (imageHeight * scaleFactor) - height - totalTranslateY;
                // }
                // if (translateX !== 0 || translateY !== 0) {
                //     this._dragged = true;
                // }
                // this.setTranslateX(translateX);
                // this.setTranslateY(translateY);
                break;
            case android.view.MotionEvent.ACTION_POINTER_DOWN:
                console.log('android.view.MotionEvent.ACTION_POINTER_DOWN:.');

                this.oldDist = this.spacing(event);
                // Log.d(TAG, "oldDist=" + oldDist);
                // if (this.oldDist > 5) {
                this.savedMatrix.set(this.matrix);
                // this.midPoint(this.mid, event);
                let x = event.getX(0) + event.getX(1);
                let y = event.getY(0) + event.getY(1);
                this.mid.set(x / 2, y / 2);
                this.mode = this.ZOOM;
                // Log.d(TAG, "mode=ZOOM");
                // }
                // this._mode = MODE_ZOOM;
                break;
            case android.view.MotionEvent.ACTION_UP:
                console.log('android.view.MotionEvent.ACTION_UP:.');
                this.mode = this.NONE;

                // this._mode = MODE_NONE;
                // this._dragged = false;
                // this.setTotalTranslateX(this.getTotalTranslateX() + this.getTranslateX());
                // this.setTotalTranslateY(this.getTotalTranslateY() + this.getTranslateY());
                // this.setTranslateX(0);
                // this.setTranslateY(0);
                break;
            case android.view.MotionEvent.ACTION_POINTER_UP:
                console.log('android.view.MotionEvent.ACTION_POINTER_UP:.');
                // this._mode = MODE_DRAG;
                // this.setTotalTranslateX(this.getTotalTranslateX() + this.getTranslateX());
                // this.setTotalTranslateY(this.getTotalTranslateY() + this.getTranslateY());
                // this.setTranslateX(0);
                // this.setTranslateY(0);
                break;
        }
        view.android.setImageMatrix(this.matrix);
    }

    /*
     * --------------------------------------------------------------------------
     * Method: spacing Parameters: MotionEvent Returns: float Description:
     * checks the spacing between the two fingers on touch
     * ----------------------------------------------------
     */

    spacing(event: any) {
        let x = event.getX(0) - event.getX(1);
        let y = event.getY(0) - event.getY(1);
        return Math.sqrt(x * x + y * y);
    }

    /*
     * --------------------------------------------------------------------------
     * Method: midPoint Parameters: PointF object, MotionEvent Returns: void
     * Description: calculates the midpoint between the two fingers
     * ------------------------------------------------------------
     */

    // midPoint(point: any, event: any) {
    //     let x = event.getX(0) + event.getX(1);
    //     let y = event.getY(0) + event.getY(1);
    //     point.set(x / 2, y / 2);
    // }
    /**
     * On pinch method, is being called while pinch event fired on image,
     * where the new scale, width & height of the transformed image have been calculated
     * to zoom-in/out.
     *
     * @param args PinchGestureEventData
     */
    onPinch(args: PinchGestureEventData) {

        if (args.state === 1) {
            console.log('args.state == 1');
            this.startScale = this.dragImageItem.scaleX;
            this.isPinchSelected = true;

        } else if (args.scale && args.scale !== 1) {
            console.log('args.state !== 1');
            this.newScale = this.startScale * args.scale;
            // this.newScale = Math.min(5, this.newScale);
            this.newScale = Math.max(0.125, this.newScale);
            this.dragImageItem.scaleX = this.newScale;
            this.dragImageItem.scaleY = this.newScale;

            this.dragImageItem.width = this.dragImageItem.getMeasuredWidth() * this.newScale;
            this.dragImageItem.height = this.dragImageItem.getMeasuredHeight() * this.newScale;
        }

        //     let item = this.dragImageItem;
        //     if (args.state === 1) {
        //         this.isPinchSelected = true;
        //     const newOriginX = args.getFocusX() - item.translateX;
        //     const newOriginY = args.getFocusY() - item.translateY;

        //     const oldOriginX = item.originX * item.getMeasuredWidth();
        //     const oldOriginY = item.originY * item.getMeasuredHeight();

        //     item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
        //     item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);

        //     item.originX = newOriginX / item.getMeasuredWidth();
        //     item.originY = newOriginY / item.getMeasuredHeight();

        //     this.startScale = item.scaleX;
        // }

        // else if (args.scale && args.scale !== 1) {
        //     let newScale = this.startScale * args.scale;
        //     newScale = Math.min(8, newScale);
        //     newScale = Math.max(0.125, newScale);

        //     item.scaleX = newScale;
        //     item.scaleY = newScale;
        // }
    }
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGestureEventData
     */
    onPan(args: PanGestureEventData) {
        console.log('onPan....');
        //     let item = this.dragImageItem;
        //     if (args.state === 1) {
        //     this.prevDeltaX = 0;
        //     this.prevDeltaY = 0;
        // }
        // else if (args.state === 2) {
        //     item.translateX += args.deltaX - this.prevDeltaX;
        //     item.translateY += args.deltaY - this.prevDeltaY;

        //     this.prevDeltaX = args.deltaX;
        //     this.prevDeltaY = args.deltaY;
        // }
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
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     *
     * @param args GestureEventData
     */
    onDoubleTap(args: any) {
        console.log(`Page changed to.. ${args}.`);
        this.dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeOut',
            duration: 300,
        });
        // let imageSwipe: any = args.object as ImageSwipe;
        // imageSwipe.scaleX = 1;
        // imageSwipe.scaleY = 1;
        this.newScale = 1;
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    }
    /**
     * Page loaded method which is been called when imageslide page is loaded,
     * where it sets the selected image in the source for display.
     *
     * @param args any object
     */
    pageLoaded(args: any) {
        // if (this.imageFileList.length > 0) {
        //     this.imageSource = this.imageFileList[this.imgIndex].filePath;
        //     const imageFile = new java.io.File(this.imageSource);
        //     this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
        // }
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
        // this.dragImageItem.translateX = 0;
        // this.dragImageItem.translateY = 0;
        // this.dragImageItem.scaleX = 1;
        // this.dragImageItem.scaleY = 1;
    }
    /**
     * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
     * it checks that the swipe is right direct or left direction, based on that it pulls the image from
     * the image list and display it in view. After that, it sets the image in default position by calling
     * onDoubleTap method.
     *
     * @param args SwipeGestureEventData
     */
    onSwipe(args: SwipeGestureEventData) {
        // if (this.dragImageItem.scaleX === 1 && this.dragImageItem.scaleY === 1) {
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
            // this.imageUrlList.pop();
            // viewModel.set("imageUrlList", this.imageUrlList);
            // viewModel.set("pageNumber", this.imgIndex);
            // this.page.bindingContext = viewModel;
            // this.dragImageItem.refresh();
        }
        this.imgIndex = this.imgNext;
        if (this.imageFileList.length > 0) {
            this.imageSource = this.imageFileList[this.imgNext].filePath;
            // const imageFile = new java.io.File(this.imageSource);
            // this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
            // viewModel.set("imageUrlList", this.imageUrlList);
            // viewModel.set("pageNumber", this.imgIndex);
            // this.page.bindingContext = viewModel;
        } else {
            this.imageSource = null;
            this.isDeleting = false;
            this.isSharing = false;
            Toast.makeText(localize('no_image_available')).show();
        }
        // this.onDoubleTap(args);
        // }
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
     * Shares selected image(s) when user clicks the share button. The sharing can be done
     * via any one of the medias supported by android device by default. The list of supported
     * medias will be visible when the share button clicked.
     */
    onShare() {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERNET],
            'Needed for sharing files').then(() => {
                try {
                    const uris = new java.util.ArrayList();
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
                        intent.setType('*/*');
                        const message = 'Perspective correction pictures¬†:¬†' + filesToBeAttached + '.';
                        intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');

                        intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                        intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                        intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                        intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                        application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Share image(s)...'));
                    }
                } catch (error) {
                    Toast.makeText(localize('error_while_sending_mail') + error).show();
                    this.logger.error('Error while sending mail. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                }
            }).catch((error) => {
                Toast.makeText(localize('error_while_giving_permission') + error).show();
                this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Deletes the selected image(s) when user clicks the 'delete' button in menu.
     * This will show up a dialog window for confirmation for the selected image(s)
     * to be deleted. If user says 'Ok', then those image(s) will be removed from the
     * device, otherwise can be cancelled.
     *
     * @param args any boject
     */
    onDelete(args: any) {
        dialogs.confirm({
            title: localize('delete'),
            message: localize('deleting_selected_item'),
            okButtonText: localize('ok'),
            cancelButtonText: localize('cancel'),
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
                                    // this.imageUrlList.splice(this.imgNext, 1);
                                    let slicedImages = this.imageUrlList.slice(0, this.imgNext);
                                    let slicedImages0 = this.imageUrlList.slice(this.imgNext + 1, this.imageUrlList.length);
                                    const imgNextOld = this.imgNext;
                                    this.imageUrlList.splice(0, this.imageUrlList.length);
                                    viewModel.set("imageUrlList", this.imageUrlList);
                                    this.page.bindingContext = viewModel;
                                    slicedImages.forEach(img => {
                                        this.imageUrlList.push(img);
                                    });
                                    slicedImages0.forEach(img => {
                                        this.imageUrlList.push(img);
                                    });
                                    this.isDeleted = true;
                                    Toast.makeText(localize('selected_image_deleted')).show();
                                    if (this.imageFileList.length > 0) {
                                        if ((this.imageFileList.length) <= this.imgNext.valueOf()) {
                                            this.imgNext = 0;
                                            // this.pageNumber = this.imgNext;
                                            // viewModel.set("pageNumber", this.imgNext);
                                        } 
                                        else {
                                            if (imgNextOld.valueOf() == 0) {
                                                this.pageNumber = 1;
                                                viewModel.set("pageNumber", 1);
                                            } else {
                                                this.pageNumber = this.imgNext;
                                                viewModel.set("pageNumber", this.imgNext);
                                            }
                                        }
                                        this.imageSource = this.imageFileList[this.imgNext].filePath;

                                        // this.imageUrlList = this.imageUrlList;
                                        // this.imageUrlList.pop();
                                        viewModel.set("imageUrlList", this.imageUrlList);
                                        // this.pageNumber = this.imgNext;
                                        // viewModel.set("pageNumber", this.imgNext);
                                        this.page.bindingContext = viewModel;
                                    } else {
                                        this.imageUrlList = this.imageUrlList;
                                        viewModel.set("imageUrlList", this.imageUrlList);
                                        this.page.bindingContext = viewModel;
                                        this.imageSource = null;
                                        this.isDeleting = false;
                                        this.isSharing = false;
                                        Toast.makeText(localize('no_image_available')).show();
                                    }
                                    // this.onSwipe(args);
                                }).catch((error) => {
                                    Toast.makeText(localize('error_while_deleting_thumbnail_image')
                                        + error.stack, 'long').show();
                                    this.logger.error('Error while deleting thumbnail image.. ' + module.filename
                                        + this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                        }).catch((error) => {
                            Toast.makeText(localize('error_while_deleting_original_image') + error.stack, 'long').show();
                            this.logger.error('Error while deleting original image. ' + module.filename
                                + this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                } else {
                    this.imageSource = null;
                    this.isDeleting = false;
                    this.isSharing = false;
                    Toast.makeText(localize('no_image_available')).show();
                }
            }
        });
    }
}