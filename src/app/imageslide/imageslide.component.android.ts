import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { File } from 'tns-core-modules/file-system';
import { ImageSource } from 'tns-core-modules/image-source';
import { Page } from 'tns-core-modules/ui/page';

import { GestureEventData, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
import { Image } from 'tns-core-modules/ui/image';

import { RouterExtensions } from 'nativescript-angular/router';

import { localize } from 'nativescript-localize';
// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import { ImageSwipe, PageChangeEventData } from 'nativescript-image-swipe';

// import { EventData, Observable } from 'data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';

import { EventData, Observable } from 'tns-core-modules/data/observable';

import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

/** global variable declaration to avoid compilation error */
declare var android: any;
/** global variable declaration to avoid compilation error */
declare var java: any;

/** View model variable for observable instance */
let viewModel: Observable;
/** View model variable for observable array */
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
    // public imageSource: ImageSource;
    /**  To indicate the sharing menu is visible or not */
    public isSharing: boolean;
    /** To indicate the deleting menu is visible or not */
    public isDeleting: boolean;
    /** Child element referrence */
    // @ViewChild('imgSlideId', { static: true }) _dragImage: ElementRef;

    /** To indicate the select image is been deleted or not */
    private isDeleted: boolean;
    /** Image URI */
    private imgURI: string;
    /** Image index being used to get an image for the given index */
    private imgIndex: number;
    /** Image referrence from _dragImage */
    // private dragImageItem: any;
    /** Contains previous deltaX value */
    // private prevDeltaX: number;
    /** Contains previous deltaY value */
    // private prevDeltaY: number;
    /** Contains list of image file path information */
    private imageFileList: any[];
    /** Contains image next index value */
    // private imgNext: number;
    /** Contains initial scale value */
    // private startScale = 1;
    /** Contains new scale value while moving the image */
    // private newScale = 1;
    /** To indicate whether pinch is trigger or not */
    // private isPinchSelected = false;
    /** To store old TranslateX value of image */
    // private oldTranslateX = 0;
    /** To store old TranslateY value of image */
    // private oldTranslateY = 0;
    /** Indicates whether the image got default screen location or not */
    // private isGotDefaultLocation = false;
    /** Contains image default screen location */
    // private defaultScreenLocation: any;
    /** Image url list with obserable array */
    public imageUrlList = new ObservableArray();
    /** The pagenumber for the selected image */
    // public pageNumber = 0;
    currentPagerIndex = 5;
    latestReceivedIndex = 0;

    @ViewChild('pager', { static: true }) pager: ElementRef;

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

    loaded(index: number) {
        console.log('view loaded..', index);
    }
    onIndexChanged($event) {
        // debugObj($event);
        this.latestReceivedIndex = $event.value;
        // this.currentPagerIndex = $event.value;
        this.imgIndex = $event.value;

        // if (($event.value + 2) % 3 === 0) {
        //     let newItems = this.imageFileList;
        //     const items = [
        //         {
        //             title: 'Slide ' + (newItems.length + 1),
        //             image: `https://robohash.org/${newItems.length + 1}.png`
        //         },
        //         {
        //             title: 'Slide ' + (newItems.length + 2),
        //             image: `https://robohash.org/${newItems.length + 2}.png`
        //         },
        //         {
        //             title: 'Slide ' + (newItems.length + 3),
        //             image: `https://robohash.org/${newItems.length + 3}.png`
        //         }
        //     ];
        //     this.imageFileList.push(...items);
        //     // this.numItems = this.imageFileList.length;
        // }
    }


    onFinalImageSet(event) {
        console.log("onFinalImageSet:.. ", event);
    }

    onFailure(event) {
        console.log("onFailure: ", event);
    }

    onScaleChanged(event) {
        console.log("onScaleChanged: ", event.object.zoomScale);
    }

    /**
     * Initializes page properties like menus ('delete'/'share') and the image
     * properties like translateX/translateY/scaleX/scaleY.
     */
    ngOnInit(): void {
        // this.imgNext = this.imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.isDeleted = false;
        // this.imageSource = new ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
        // this.dragImageItem = this._dragImage.nativeElement as ImageSwipe;
        // this.dragImageItem.translateX = 0;
        // this.dragImageItem.translateY = 0;
        // this.dragImageItem.scaleX = 1;
        // this.dragImageItem.scaleY = 1;

        // this.imageSource = this.imageFileList[this.imgIndex].filePath;
        // this.pageNumber = this.imgIndex;
        this.currentPagerIndex = this.imgIndex;
        this.imageFileList.forEach((img) => {
            const imageFile = new java.io.File(img.filePath);
            // console.log('URL: ' + img.filePath);
            // this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
            this.imageUrlList.push({ imageUrl: imageFile.toURL().toString(), fileName: img.fileName });
            // this.imageUrlList.push({ imageUrl: img.filePath, fileName: img.fileName });
        });
        // viewModel = new Observable();
        // viewModel.set('imageUrlList', this.imageUrlList);
        // viewModel.set('pageNumber', this.imgIndex);
        // this.page.bindingContext = viewModel;
    }

    //  loadedImage($event) {
    //         console.log(`loaded image ${$event}`);
    //     }

    // /**
    //  * It is a callback method and invoked by ImageSwipe element
    //  * when the image is changed in view and sets the pagenumber.
    //  *
    //  * @param args event data of ImageSwipe element
    //  */
    // public pageChanged(e: PageChangeEventData) {
    //     if (this.imgNext.valueOf() == e.page && e.page == 0 && this.isDeleted) {
    //         this.pageNumber = 1;
    //         viewModel.set('pageNumber', 1);
    //         this.isDeleted = false;
    //     }
    //     this.imgNext = e.page;
    // }
    /**
     * Goes back to previous page when the back button is pressed.
     */
    goBack() {
        this.routerExtensions.back();
    }

    // /**
    //  * On pinch method, is being called while pinch event fired on image,
    //  * where the new scale, width & height of the transformed image have been calculated
    //  * to zoom-in/out.
    //  *
    //  * @param args PinchGestureEventData
    //  */
    // onPinch(args: PinchGestureEventData) {

    //     if (args.state == 1) {
    //         this.startScale = this.dragImageItem.scaleX;
    //         this.isPinchSelected = true;

    //     } else if (args.scale && args.scale !== 1) {
    //         this.newScale = this.startScale * args.scale;
    //         this.newScale = Math.min(5, this.newScale);
    //         this.newScale = Math.max(0.125, this.newScale);
    //         this.dragImageItem.scaleX = this.newScale;
    //         this.dragImageItem.scaleY = this.newScale;

    //         this.dragImageItem.width = this.dragImageItem.getMeasuredWidth() * this.newScale;
    //         this.dragImageItem.height = this.dragImageItem.getMeasuredHeight() * this.newScale;
    //     }
    // }
    // /**
    //  * On pan/move method, which moves image when user press & drag with a finger around
    //  * the image area. Here the image's tralateX/translateY values are been calculated
    //  * based on the image's scale, width & height. And also it takes care of image boundary
    //  * checking.
    //  *
    //  * @param args PanGestureEventData
    //  */
    // onPan(args: PanGestureEventData) {
    //     const screenLocation = this.dragImageItem.getLocationOnScreen();
    //     let centerPointX = (this.dragImageItem.getMeasuredWidth() / 4) * (this.newScale);
    //     let centerPointY = (this.dragImageItem.getMeasuredHeight() / 4) * (this.newScale);
    //     const imageViewWidth = this.dragImageItem.getMeasuredWidth() * this.dragImageItem.originX;
    //     const imageViewHeight = this.dragImageItem.getMeasuredHeight() * this.dragImageItem.originY;

    //     if (args.state === 1) {
    //         this.prevDeltaX = 0;
    //         this.prevDeltaY = 0;
    //     } else if (args.state === 2) {
    //         centerPointX = (centerPointX * 2);
    //         centerPointY = (centerPointY * 2);

    //         if (this.newScale < 15) {
    //             if (!this.isGotDefaultLocation) {
    //                 this.defaultScreenLocation = screenLocation;
    //                 this.isGotDefaultLocation = true;
    //             }
    //             if (this.newScale > 1) {
    //                 if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
    //                     && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)
    //                 ) {
    //                     this.dragImageItem.translateX += args.deltaX - this.prevDeltaX;
    //                     this.oldTranslateX = this.dragImageItem.translateX;
    //                 } else {
    //                     if (this.oldTranslateX > 0) {
    //                         this.oldTranslateX--;
    //                     } else {
    //                         this.oldTranslateX++;
    //                     }
    //                     this.dragImageItem.translateX = this.oldTranslateX;
    //                 }
    //                 if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
    //                     && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)
    //                 ) {
    //                     this.dragImageItem.translateY += args.deltaY - this.prevDeltaY;
    //                     this.oldTranslateY = this.dragImageItem.translateY;
    //                 } else {
    //                     if (this.oldTranslateY > 0) {
    //                         this.oldTranslateY--;
    //                     } else {
    //                         this.oldTranslateY++;
    //                     }
    //                     this.dragImageItem.translateY = this.oldTranslateY;
    //                 }
    //             }
    //         }
    //         if (this.newScale >= 15) {
    //             const translateXTemp = this.dragImageItem.translateX + args.deltaX - this.prevDeltaX;
    //             const translateYTemp = this.dragImageItem.translateY + args.deltaY - this.prevDeltaY;
    //             if (this.oldTranslateX < translateXTemp) {
    //                 this.dragImageItem.translateX = this.oldTranslateX;
    //             } else {
    //                 this.dragImageItem.translateX = translateXTemp;
    //             }
    //             if (this.oldTranslateY < translateYTemp) {
    //                 this.dragImageItem.translateY = this.oldTranslateY;
    //             } else {
    //                 this.dragImageItem.translateY = translateYTemp;
    //             }
    //         }

    //         this.prevDeltaX = args.deltaX;
    //         this.prevDeltaY = args.deltaY;

    //     } else if (args.state === 3) {
    //         this.isPinchSelected = false;
    //     }
    // }
    // /**
    //  * Double tap method fires on when user taps two times on transformed image.
    //  * Actually it brings the image to it's original positions and also adds
    //  * circle points if it is original image.
    //  *
    //  * @param args GestureEventData
    //  */
    // onDoubleTap(args: any) {
    //     this.dragImageItem.animate({
    //         translate: { x: 0, y: 0 },
    //         scale: { x: 1, y: 1 },
    //         curve: 'easeOut',
    //         duration: 300,
    //     });
    //     this.newScale = 1;
    //     this.oldTranslateY = 0;
    //     this.oldTranslateX = 0;
    // }
    // /**
    //  * Page loaded method which is been called when imageslide page is loaded,
    //  * where it sets the selected image in the source for display.
    //  *
    //  * @param args any object
    //  */
    // pageLoaded(args: any) {
    //     this.oldTranslateY = 0;
    //     this.oldTranslateX = 0;
    // }
    // /**
    //  * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
    //  * it checks that the swipe is right direct or left direction, based on that it pulls the image from
    //  * the image list and display it in view. After that, it sets the image in default position by calling
    //  * onDoubleTap method.
    //  *
    //  * @param args SwipeGestureEventData
    //  */
    // onSwipe(args: SwipeGestureEventData) {
    //     if (args.direction === 2 || !args.direction) {
    //         this.imgNext++;
    //         if (this.imgNext <= 0 || this.imgNext >= this.imageFileList.length) {
    //             this.imgNext = 0;
    //         }

    //     } else if (args.direction === 1) {
    //         this.imgNext--;
    //         if (this.imgNext < 0 || this.imgNext >= this.imageFileList.length) {
    //             this.imgNext = (this.imageFileList.length - 1);
    //         }
    //     }
    //     this.imgIndex = this.imgNext;
    //     if (this.imageFileList.length > 0) {
    //         this.imageSource = this.imageFileList[this.imgNext].filePath;
    //     } else {
    //         this.imageSource = null;
    //         this.isDeleting = false;
    //         this.isSharing = false;
    //         Toast.makeText(localize('no_image_available')).show();
    //     }
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
                    let imgFileNameOrg = this.imageFileList[this.imgIndex].fileName;
                    imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                    const newFile = new java.io.File(imagePath, imgFileNameOrg);
                    const uri = this.transformedImageProvider.getURIForFile(newFile);
                    uris.add(uri);
                    uris.add(this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                    // uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                    // let logFileName = imgFileNameOrg.replace('thumb_PT_IMG', 'LogcatPT_IMG');
                    if (this.transformedImageProvider.isLogEnabled) {
                        let logFileName = 'Logcat' + imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.txt';
                        const logFilePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/oelog', '.');
                        const logFile = new java.io.File(logFilePath, logFileName);
                        const logFileUri = this.transformedImageProvider.getURIForFile(logFile);
                        uris.add(logFileUri);
                    }

                    filesToBeAttached = filesToBeAttached.concat(',' + this.imageFileList[this.imgIndex].filePath);
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
                        application.android.foregroundActivity.startActivity(
                            android.content.Intent.createChooser(intent, 'Share image(s)...'));
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
                    // this.dragImageItem.translateX = 0;
                    // this.dragImageItem.translateY = 0;
                    // this.dragImageItem.scaleX = 1;
                    // this.dragImageItem.scaleY = 1;
                    const file: File = File.fromPath(this.imageFileList[this.imgIndex].filePath);
                    file.remove()
                        .then(() => {
                            const thumbnailFile: File = File.fromPath(this.imageFileList[this.imgIndex].thumbnailPath);
                            thumbnailFile.remove()
                                .then(() => {
                                    SendBroadcastImage(this.imageFileList[this.imgIndex].thumbnailPath);
                                    this.imageFileList.splice(this.imgIndex, 1);
                                    this.imageUrlList.splice(this.imgIndex, 1);
                                    const imgClone: any = this.imageUrlList.slice(0, this.imageUrlList.length);
                                    // const slicedImages = this.imageUrlList.slice(0, this.imgNext);
                                    // console.log(''+ this.imageUrlList);
                                    console.log('' + this.imgIndex);
                                    // console.log(''+ this.imageUrlList.length);
                                    // const slicedImages0 = this.imageUrlList.slice(this.imgNext + 1, this.imageUrlList.length-1);
                                    console.log('' + this.imageUrlList);
                                    const imgNextOld = this.imgIndex;
                                    // slicedImages.concat(slicedImages0);
                                    this.imageUrlList.splice(0, this.imageUrlList.length);
                                    this.imageUrlList = imgClone;
                                    // viewModel.set('imageUrlList', this.imageUrlList);
                                    // this.page.bindingContext = viewModel;
                                    // slicedImages.forEach((img) => {
                                    //     this.imageUrlList.push(img);
                                    // });
                                    // slicedImages0.forEach((img) => {
                                    //     this.imageUrlList.push(img);
                                    // });
                                    this.isDeleted = true;
                                    Toast.makeText(localize('selected_image_deleted')).show();
                                    if (this.imageFileList.length > 0) {
                                        if ((this.imageFileList.length) <= this.imgIndex.valueOf()) {
                                            // this.imgNext = 0;
                                        } else {
                                            // if (imgNextOld.valueOf() == 0) {
                                            //     this.pageNumber = 1;
                                            //     viewModel.set('pageNumber', 1);
                                            // } else {
                                            //     this.pageNumber = this.imgNext;
                                            //     viewModel.set('pageNumber', this.imgNext);
                                            // }
                                        }
                                        // this.imageSource = this.imageFileList[this.imgIndex].filePath;
                                        // viewModel.set('imageUrlList', this.imageUrlList);
                                        // this.page.bindingContext = viewModel;
                                    } else {
                                        // this.imageUrlList = this.imageUrlList;
                                        // viewModel.set('imageUrlList', this.imageUrlList);
                                        // this.page.bindingContext = viewModel;
                                        // this.imageSource = null;
                                        this.isDeleting = false;
                                        this.isSharing = false;
                                        Toast.makeText(localize('no_image_available')).show();
                                    }
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
                    // this.imageSource = null;
                    this.isDeleting = false;
                    this.isSharing = false;
                    Toast.makeText(localize('no_image_available')).show();
                }
            }
        });
    }
}

// function debugObj(obj: any) {
//     for (const key of Object.keys(obj)) {
//         console.log(`${key} = ${obj[key]}`);
//     }
// }