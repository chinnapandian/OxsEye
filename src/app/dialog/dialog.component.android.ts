import { Component, OnInit, OnDestroy } from '@angular/core';
import { File, Folder } from 'tns-core-modules/file-system';
import { setTimeout } from 'tns-core-modules/timer';

import { ModalDialogParams } from 'nativescript-angular/modal-dialog';

import { GestureEventData, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import { TransformedImage } from '../providers/transformedimage.common';

// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';

import { localize } from 'nativescript-localize';

import { ImageSwipe, PageChangeEventData } from 'nativescript-image-swipe';

import { Page } from 'tns-core-modules/ui/page';

import { ObservableArray } from 'tns-core-modules/data/observable-array';

import { EventData, Observable } from 'tns-core-modules/data/observable';

import { CheckBox } from '@nstudio/nativescript-checkbox';

import { Slider } from "tns-core-modules/ui/slider";

import * as Toast from 'nativescript-toast';
import * as platform from 'tns-core-modules/platform';
import * as formattedStringModule from 'tns-core-modules/text/formatted-string';
import * as buttons from 'tns-core-modules/ui/button';
import * as dialogs from 'tns-core-modules/ui/dialogs';

/** global variable declaration to avoid compilation error */
declare var android: any;
/** global variable declaration to avoid compilation error */
declare var java: any;
declare var org: any;

/** Lable for 'Manual' text */
const LABLE_MANUAL = 'Manual';
/** Lable for 'Perform' text */
const LABLE_PERFORM = 'Perform';
/** View model variable for observable instance */
let viewModel: Observable;




/**
 * Dialog content class.
 */
@Component({
    selector: 'modal-content',
    moduleId: module.id,
    styleUrls: ['./dialog.component.css'],
    templateUrl: './dialog.component.html',
})

export class DialogContent implements OnInit, OnDestroy {
    /** Transformed Image source. */
    public imageSource: any;
    /** Original Image source. */
    public imageSourceOrg: any;
    /** Contains true/false to perform transformation automatically or not. */
    public isAutoCorrection = false;
    /** Contains button label name either 'Manual'/ 'Perform' */
    public manualBtnText: string;
    /** Contains list of four points of the images. */
    private points: any;
    /** Indicates the number of points. */
    private pointsCounter: number;
    /** Stores previous original Image source. */
    private imageSourceOrgOld: any;
    /** Stores previous transformed image source. */
    private imageSourceOld: any;
    /** Contains transformed image actual size. */
    private imageActualSize: any;
    /** List of circle buttons */
    private circleBtnList: any;
    /** Stores transformed image referrence. */
    private imgView: any;
    /** Image grid id. */
    private imgGridId: any;
    /** Transformed Image previous deltaX. */
    private prevDeltaX: number;
    /** Transformed Image previous deltaY. */
    private prevDeltaY: number;
    /** Transformed Image starting scale. */
    private startScale = 1;
    /** Transformed Image center pointX. */
    private centerPointX: any;
    /** Transformed Image center pointY. */
    private centerPointY: any;
    /** Transformed Image new scale while moving around. */
    private newScale = 1;
    /** Stores old TranslateX value of transformed Image. */
    private oldTranslateX = 0;
    /** Stores old translateY value of transformed Image. */
    private oldTranslateY = 0;
    /** Boolean value to indicate whether the image got default screen location or not. */
    private isGotDefaultLocation = false;
    /** Stores transformed image's screen location. */
    private defaultScreenLocation: any;
    /** Stores rectangle points to be used in the OpenCV API call. */
    private rectanglePoints: any;
    /** To get accurate position, need to adjust the radius value */
    private circleRadius = 17;
    /** Index value of the transformed image */
    private imgNext = 0;
    /** Boolean value to make the deleting menu visible or not. */
    public isDeleting: boolean;
    /** To check check mark visible or not */
    private isCheckMarkVisible = false;
    /** To check cross mark visible or not */
    private isCrossMarkVisible = false;
    /** contains image URL list */
    private imageUrlList0 = new ObservableArray();
    /** Sets pagenumber for selected image, which is one of the attributes of ImageSwipe element */
    private pageNumber = 3;
    /** To indicate that the image is selected or not in the imagelist */
    private isSelected: boolean;
    /** Contains image list */
    private imageList: any;
    /** Adaptive threshold value */
    private adaptiveThresholdValue = 41;
    /** OpenCV camera view */
    // private ocvCameraView: any;
    currentPagerIndex = 0;
    // latestReceivedIndex = 0;

    // @ViewChild('pager', { static: true }) pager: ElementRef;

    private mScaleDetector: any;
    /**
     * Constructor for DialogContent class.
     *
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     * @param logger OxsEye logger instance
     * @param page Page instance
     */
    constructor(
        private params: ModalDialogParams,
        private transformedImageProvider: TransformedImageProvider,
        private logger: OxsEyeLogger,
        private page: Page,
    ) {
        this.manualBtnText = LABLE_MANUAL;
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
    }


    loaded(index: number) {
        console.log('view loaded..', index);
    }
    onIndexChanged($event) {
        // debugObj($event);
        // this.latestReceivedIndex = $event.value;
        // this.currentPagerIndex = $event.value;
        // this.imgIndex = $event.value;

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

    /** It is a callback method which is been invoked by angular,
     * where all initializations are happening like  loading the capture image(s) in perspective form and
     * setting them in image view.
     */
    ngOnInit(): void {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        const recPointsStrTemp = this.params.context.rectanglePoints;
        // this.ocvCameraView = this.params.context.ocvCamera;
        this.imgNext = 0;
        // const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'));
        // this.transformedImageProvider.LoadPossibleContourImages(fileName);
        this.pageNumber = this.imgNext;
        // viewModel = new Observable();
        // viewModel.set('imageUrlList0', this.imageUrlList0);
        // viewModel.set('pageNumber', this.imgNext);

        // this.page.bindingContext = viewModel;
        this.isSelected = false;
        this.isCheckMarkVisible = false;
        this.isCrossMarkVisible = true;
    }
    ngOnDestroy(): void {
        console.log('ngOnDestroy called....');
        // this.imgView.refresh();
        // viewModel = null;
        this.imageUrlList0 = null;
        this.page.bindingContext = null;
        this.imageSource = null;
        this.imageSourceOrg = null;
        this.imageSourceOrgOld = null;
        this.isAutoCorrection = null;
        this.imageSourceOld = null;
        this.rectanglePoints = null;
        const page = null;
        // this.imgView = null;
        this.imgGridId = null;
        this.imageList = null;
    }

    // private onSliderLoaded(argsloaded) {
    //     let sliderComponent: Slider = <Slider>argsloaded.object;
    //     sliderComponent.on("valueChange", function (args) {
    //         let slider = <Slider>args.object;
    //         this.adaptiveThresholdValue = slider.value;
    //         console.log(`Slider new value ${slider.value}`);
    //     });
    // }

    // private minusThresholdValue() {
    //     this.adaptiveThresholdValue -= 2;
    //     this.imageSource = this.ocvCameraView.performAdaptiveThresholdUsingWarppedImage(this.imageSourceOrg, this.imageSource, this.adaptiveThresholdValue);
    //     console.log('minusThresholdValue....');
    // }
    // private plusThresholdValue() {
    //     this.adaptiveThresholdValue += 2;
    //     let imageSourceNew = this.ocvCameraView.performAdaptiveThresholdUsingWarppedImage(this.imageSourceOrg, this.imageSourceOld, this.adaptiveThresholdValue);
    //     const ptSrc = org.opencv.imgcodecs.Imgcodecs.imread(imageSourceNew);
    //     imageSourceNew = imageSourceNew.replace('.png', this.adaptiveThresholdValue + '.png');
    //     org.opencv.imgcodecs.Imgcodecs.imwrite(imageSourceNew, ptSrc);
    //     this.imageSource = imageSourceNew;
    //     this.imageUrlList0.splice(0, this.imageUrlList0.length);
    //     const imageFile = new java.io.File(imageSourceNew);
    //     this.imageUrlList0.push({ imageUrl: imageFile.toURL().toString() });
    //     this.imgView.refresh();
    //     viewModel.set('imageUrlList0', this.imageUrlList0);
    //     viewModel.set('pageNumber', this.imgNext);
    //     this.page.bindingContext = viewModel;
    //     this.imgView.refresh();
    //     console.log('plusThresholdValue....');
    // }
//     /**
//      * It is a callback method and invoked by ImageSwipe element
//      * when the image is changed in view and sets the pagenumber.
//      *
//      * @param args event data of ImageSwipe element
//      */
//     public pageChanged(args: PageChangeEventData) {
//         this.imgNext = args.page;
//         this.pageNumber = this.imgNext;
//         this.isSelected = this.imageList[this.imgNext].isSelected;
//         viewModel.set('imageUrlList0', this.imageUrlList0);
//         viewModel.set('pageNumber', this.imgNext);
//         this.page.bindingContext = viewModel;
//         const imgSwipe: any = args.object;
//         // const checkBox = imgSwipe.parent.getViewById('checkbox-delete') as CheckBox;
//         // checkBox.checked = this.imageList[this.imgNext].isSelected;
//         this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
//         this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, imgSwipe.parent.parent);
//     }

    /**
     * Close method, which close the dialog window opened after captured image from camera.
     * And returns back to the place where the dialog window got triggered, along with
     * the parameter 'result'
     * @param result Which is nothing but empty string or transformed image URI string
     */
    close(result: string) {
        // orientation.enableRotation();
        this.params.closeCallback(result);
    }
//     /**
//      * Performing manual transformation
//      * this is been used to perform transformation manually, where the rectangle
//      * points will be choosen by user in the captured image displaying in the dialog window.
//      * In the dialog window, there are four circles are being used to select points.
//      * Based on the selected points, the transformation will be performed here.
//      */
//     performManualCorrection() {
//         let pointsCount = 0;
//         this.points.forEach((point: any) => {
//             if (point) {
//                 pointsCount++;
//             }
//         });

//         const point0Y = (+this.points[0].y - this.circleRadius);
//         const point1Y = (+this.points[1].y - this.circleRadius);
//         const rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
//             + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
//             + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
//             + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
//         this.imageSourceOld = this.imageSource;
//         // this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints,
//         //     this.imageActualSize.width + '-' + this.imageActualSize.height);
//         SendBroadcastImage(this.imageSource);
//         setTimeout(() => {
//             this.transformedImageProvider.deleteFile(this.imageSourceOld);
//         }, 1000);
//         this.imageSourceOrg = this.imageSourceOrgOld;
//         this.isAutoCorrection = true;
//         this.manualBtnText = LABLE_MANUAL;
//         // this.manualPerformBtnLable = localize('manual');
//         this.removeCircles();
//         this.transformedImageProvider.DeleteFiles();
//     }
    /** Accessor to get image list and used in the UI */
    get imageList0(): any {
        return this.transformedImageProvider.contourList;
    }
    // /** Accessor to get image URL list and used in the UI */
    // get imageUrlList0(): any {
    //     return this.imageUrlList;
    // }
//     /**
//      * Show original image, is being used to show original captured image
//      * when the 'Manual' button is been pressed, this is where user can select desired points
//      * and perform manual transformation. It is also intializing circle points to be displayed
//      * in the original image.
//      */
//     showOriginalImage() {
//         this.isAutoCorrection = false;
//         this.onDoubleTap();
//         if (this.circleBtnList.length === 0) {
//             this.initPoints();
//             Toast.makeText(localize('rectangle_points_info'), 'long').show();
//         }
//         this.manualBtnText = LABLE_PERFORM;
//         // this.manualPerformBtnLable = localize('perform');
//         this.pointsCounter = 0;
//         this.addCircles();
//     }
//     /**
//      * On pan/move method, which moves image when user press & drag with a finger around
//      * the image area. Here the image's tralateX/translateY values are been calculated
//      * based on the image's scale, width & height. And also it takes care of image boundary
//      * checking.
//      *
//      * @param args PanGesture event data
//      */
//     onPan(args: PanGestureEventData) {
//         const screenLocation = this.imgView.getLocationOnScreen();
//         if (this.manualBtnText !== LABLE_PERFORM) {
//             let centerPointX = (this.imgView.getMeasuredWidth() / 4) * (this.newScale);
//             let centerPointY = (this.imgView.getMeasuredHeight() / 4) * (this.newScale);
//             const imageViewWidth = this.imgView.getMeasuredWidth() * this.imgView.originX;
//             const imageViewHeight = this.imgView.getMeasuredHeight() * this.imgView.originY;

//             if (args.state === 1) {
//                 this.prevDeltaX = 0;
//                 this.prevDeltaY = 0;
//             } else if (args.state === 2) {
//                 centerPointX = (centerPointX * 2);
//                 centerPointY = (centerPointY * 2);

//                 if (!this.isGotDefaultLocation) {
//                     this.defaultScreenLocation = screenLocation;
//                     this.isGotDefaultLocation = true;
//                 }
//                 if (this.newScale > 1) {
//                     if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
//                         && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)
//                     ) {
//                         this.imgView.translateX += args.deltaX - this.prevDeltaX;
//                         this.oldTranslateX = this.imgView.translateX;
//                     } else {
//                         if (this.oldTranslateX > 0) {
//                             this.oldTranslateX--;
//                         } else {
//                             this.oldTranslateX++;
//                         }
//                         this.imgView.translateX = this.oldTranslateX;
//                     }
//                     if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
//                         && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)
//                     ) {
//                         this.imgView.translateY += args.deltaY - this.prevDeltaY;
//                         this.oldTranslateY = this.imgView.translateY;
//                     } else {
//                         if (this.oldTranslateY > 0) {
//                             this.oldTranslateY--;
//                         } else {
//                             this.oldTranslateY++;
//                         }
//                         this.imgView.translateY = this.oldTranslateY;
//                     }
//                 }
//                 this.prevDeltaX = args.deltaX;
//                 this.prevDeltaY = args.deltaY;
//             }
//         }
//     }
//     /**
//      * Double tap method fires on when user taps two times on transformed image.
//      * Actually it brings the image to it's original positions and also adds
//      * circle points if it is original image.
//      */
//     onDoubleTap() {
//         this.imgView.animate({
//             translate: { x: 0, y: 0 },
//             scale: { x: 1, y: 1 },
//             curve: 'easeOut',
//             duration: 10,
//         });
//         this.newScale = 1;
//         this.oldTranslateY = 0;
//         this.oldTranslateX = 0;
//     }
    /**
     * Checks whether the checkBox is been selected or not. If it is selected,
     * the delete/share menus are visible, otherwise they are not visible.
     * And also sets the same value in the image list.
     *
     * @param event Checkbox event data
     * @param imagePath transformed image file path
     * @param index image index in the list
     */
    isChecked(event) {
        this.imageList[this.pageNumber].isSelected = !this.imageList[this.pageNumber].isSelected;
        this.isCheckMarkVisible = this.imageList[this.pageNumber].isSelected;
        this.isCrossMarkVisible = !this.isCheckMarkVisible;
    }

    // navigatingTo() {
    //     console.log('navigatingTo called...');
    // }
    /**
     * Page loaded method which is been called when dialog window is loaded,
     * where all the necessary values for the image to be displayed in the window
     * have been initialized, like transformedImageSource, originalImageSource &
     * rectangle points.
     *
     * @param args Page loaded event data
     */
    pageLoaded(args: { object: any; }) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        const recPointsStrTemp = this.params.context.rectanglePoints;

        this.rectanglePoints = recPointsStrTemp.split('#');
        this.rectanglePoints.shift();
        this.rectanglePoints.pop();
        const page = args.object;
        // this.imgView = page.getViewById('imgViewId');
        this.imgGridId = page.getViewById('imgGridId');
        // this.imgView.translateX = 0;
        // this.imgView.translateY = 0;
        // this.imgView.scaleX = 1;
        // this.imgView.scaleY = 1;
        // // this.imgView.rotate = 90;
        // // orientation.setOrientation('portrait');
        this.imgNext = 0;
        // const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'));
        // this.transformedImageProvider.LoadPossibleContourImages(fileName);
        // setTimeout(() => {
        console.log('pageLoaded called....');
        this.imageList = this.transformedImageProvider.contourList;
        this.imageUrlList0.splice(0, this.imageUrlList0.length);
        this.imageList.forEach((img) => {
            const imageFile = new java.io.File(img.filePath);
            this.imageUrlList0.push({ imageUrl: imageFile.toURL().toString() });
        });
        console.log('pageLoaded called...1....');
        // viewModel.set('imageUrlList0', this.imageUrlList0);
        // viewModel.set('pageNumber', this.imgNext);
        // this.page.bindingContext = viewModel;
        // const selectedImgGrid = page.getViewById('img-grid-0');
        // if (selectedImgGrid) {
        //     selectedImgGrid.backgroundColor = 'Black';
        // }
        // }, 100);
        this.isDeleting = false;
    }
//     /**
//      * Deletes the selected image(s) when user clicks the 'delete' button in menu.
//      * This will show up a dialog window for confirmation for the selected image(s)
//      * to be deleted. If user says 'Ok', then those image(s) will be removed from the
//      * device, otherwise can be cancelled.
//      */
//     private onDelete(event: any) {
//         dialogs.confirm({
//             title: localize('delete'),
//             message: localize('deleting_selected_item'),
//             okButtonText: localize('ok'),
//             cancelButtonText: localize('cancel'),
//         }).then((result) => {
//             if (result) {
//                 this.isDeleting = false;
//                 this.imageList.forEach((image) => {
//                     if (image.filePath == this.imageSource) {
//                         const file: File = File.fromPath(image.filePath);
//                         file.remove()
//                             .then(() => {
//                                 SendBroadcastImage(image.filePath);
//                                 const imgIdx = this.imageList.indexOf(image);
//                                 this.imgNext = imgIdx;
//                                 // this.nextImage();
//                                 this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
//                                 // this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, event.view.page);
//                                 if (imgIdx >= 0) {
//                                     this.imageList.splice(imgIdx, 1);
//                                     Toast.makeText(localize('selected_images_deleted')).show();
//                                 }
//                                 if (this.imageList.length == 0) {
//                                     this.imageSource = '';
//                                     this.isDeleting = false;
//                                 }

//                             }).catch((error) => {
//                                 Toast.makeText(localize('error_while_deleting_images')).show();
//                                 this.logger.error('Error while deleting images. ' + module.filename
//                                     + this.logger.ERROR_MSG_SEPARATOR + error);
//                             });
//                     }

//                 });
//             }
//         });
//     }
//     /**
//      * Add circles method adds circle points btn in original image.
//      */
//     private addCircles() {
//         this.circleBtnList.forEach((btn: any) => {
//             this.imgGridId.addChild(btn);
//         });
//     }
//     /**
//      * Remove circles removes circle points btn from original image.
//      */
//     private removeCircles() {
//         const imgElement = this.imgGridId.getChildAt(0);
//         this.imgGridId.removeChildren();
//         this.imgGridId.addChild(imgElement);
//     }

//     /**
//      * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
//      * it checks that the swipe is right direct or left direction, based on that it pulls the image from
//      * the image list and display it in view. After that, it sets the image in default position by calling
//      * onDoubleTap method.
//      *
//      * @param args SwipeGestureEventData
//      */
//     onSwipe(args: SwipeGestureEventData) {
//         if (args.direction === 2 || !args.direction) {
//             this.nextImage();
//         } else if (args.direction === 1) {
//             this.previousImage();
//         }
//         this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
//         this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, args.view.page);
//     }
//     /**
//      * Method to move to previous image
//      */
//     private previousImage() {
//         this.imgNext--;
//         if (this.imgNext < 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
//             this.imgNext = (this.transformedImageProvider.contourImageList.length - 1);
//         }
//     }
//     /**
//      * Method to move to next image.
//      */
//     private nextImage() {
//         this.imgNext++;
//         if (this.imgNext <= 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
//             this.imgNext = 0;
//         }

//     }
//     /**
//      * Select the image tapped by user and makes it with selected sign in black color.
//      * @param imgURIPath  the image URI path
//      * @param index  the index of the selected image
//      * @param event the event handler object
//      */
//     private selectImage(imgURIPath: any, index: any, event: any) {
//         this.imageSource = imgURIPath;
//         this.setImageSelected(index, event.view.parent.parent._childrenCount, event.view.parent.parent);
//     }
//     /**
//      * Sets the selected image in black border to indicate that is been selected in view.
//      *
//      * @param index index of the image
//      * @param noOfImages number of images
//      * @param eventPage event data object
//      */
//     private setImageSelected(index: any, noOfImages: any, eventPage: any) {
//         for (let i = 0; i < noOfImages; i++) {
//             const selectedImgGrid = eventPage.getViewById('img-grid-' + i);
//             selectedImgGrid.backgroundColor = 'gray';
//             if (i === index) {
//                 selectedImgGrid.backgroundColor = 'Black';
//                 this.imgNext = index;
//                 this.pageNumber = this.imgNext;
//                 // const checkBox = eventPage.getViewById('checkbox-delete') as CheckBox;
//                 // checkBox.checked = this.imageList[this.imgNext].isSelected;
//                 this.isCheckMarkVisible = this.imageList[this.imgNext].isSelected;
//                 this.isCrossMarkVisible = !this.imageList[this.imgNext].isSelected;
//             }
//         }
//     }
//     /**
//      * Initialize circle points based on the receieved rectangle points and
//      * image's width & height.
//      */
//     private initPoints() {
//         this.points = [];
//         this.pointsCounter = 0;
//         this.circleBtnList = [];
//         // This is the density of your screen, so we can divide the measured width/height by it.
//         const scale: number = platform.screen.mainScreen.scale;

//         this.imageActualSize = this.imgView.getActualSize();
//         this.centerPointX = (this.imgGridId.getMeasuredWidth() / 2) / scale;
//         this.centerPointY = (this.imgGridId.getMeasuredHeight() / 2) / scale;

//         let actualPoint = {};
//         if (this.rectanglePoints.length > 0) {
//             let pointIndex = 1;
//             this.rectanglePoints.forEach((point) => {
//                 const points = point.split('%');
//                 let bottomCircleRadius = this.circleRadius;
//                 if (pointIndex++ > 2) { // For checking bottom points
//                     bottomCircleRadius = bottomCircleRadius * -1;
//                 }
//                 actualPoint = {
//                     x: (+points[0]) * (this.imgGridId.getMeasuredWidth() / scale),
//                     y: ((+points[1]) * (this.imgGridId.getMeasuredHeight() / scale)) + bottomCircleRadius, id: this.pointsCounter,
//                 };
//                 this.createCircle(actualPoint);
//             });
//         } else {

//             actualPoint = { x: 0, y: 0, id: this.pointsCounter };
//             this.createCircle(actualPoint);
//             actualPoint = { x: this.imageActualSize.width, y: 0, id: this.pointsCounter };
//             this.createCircle(actualPoint);
//             actualPoint = { x: this.imageActualSize.width, y: this.imageActualSize.height, id: this.pointsCounter };
//             this.createCircle(actualPoint);
//             actualPoint = { x: 0, y: this.imageActualSize.height, id: this.pointsCounter };
//             this.createCircle(actualPoint);
//         }
//     }
//     /**
//      * This method creates circle points button on original image view
//      * based on the points receieved via actualPoint and also takes
//      * care of boundary checking while diplaying it.
//      *
//      * @param actualPoint Contains circle points(x,y)
//      */
//     private createCircle(actualPoint: any): any {
//         // Since the selected point by user is always pointing to
//         // center of the image (which is (0,0)), so need to select
//         // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
//         // are used.
//         const actualPointDeltaX = (this.imageActualSize.width / 2) - this.imageActualSize.width;
//         const actualPointDeltaY = (this.imageActualSize.height / 2) - this.imageActualSize.height;

//         const formattedString = new formattedStringModule.FormattedString();
//         const iconSpan = new formattedStringModule.Span();
//         iconSpan.cssClasses.add('fa');
//         iconSpan.cssClasses.add('circle-plus');
//         iconSpan.text = String.fromCharCode(0xf067);

//         formattedString.spans.push(iconSpan);
//         const circleBtn: any = new buttons.Button();
//         circleBtn.cssClasses.add('circle');

//         circleBtn.id = this.pointsCounter++;
//         circleBtn.formattedText = formattedString;
//         circleBtn.on('pan', (args: PanGestureEventData) => {
//             if (args.state === 1) {
//                 this.prevDeltaX = 0;
//                 this.prevDeltaY = 0;
//                 if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
//                     circleBtn.translateX += -15;
//                     circleBtn.translateY += -30;
//                 } else {
//                     if (circleBtn.translateX < 0) {
//                         circleBtn.translateX += +10;
//                     } else {
//                         circleBtn.translateX += -10;
//                     }
//                     if (circleBtn.translateY < 0) {
//                         circleBtn.translateY += +10;
//                     } else {
//                         circleBtn.translateY += -10;
//                     }
//                 }
//             } else if (args.state === 2) {
//                 if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
//                     circleBtn.translateX += args.deltaX - this.prevDeltaX;
//                     circleBtn.translateY += args.deltaY - this.prevDeltaY;

//                     this.points.forEach((point: any) => {
//                         if (point) {
//                             if (point.id === circleBtn.id) {
//                                 point.x = circleBtn.translateX - actualPointDeltaX;
//                                 point.y = circleBtn.translateY - actualPointDeltaY;
//                             }
//                         }
//                     });
//                     this.prevDeltaX = args.deltaX;
//                     this.prevDeltaY = args.deltaY;
//                 }
//             } else if (args.state === 3) {
//             }
//         });

//         // Since the selected point by user is always pointing to
//         // center of the image (which is (0,0)), so need to select
//         // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
//         // are used.
//         circleBtn.translateX = actualPoint.x + actualPointDeltaX;
//         circleBtn.translateY = actualPoint.y + actualPointDeltaY;
//         if (circleBtn.translateX > 0 &&
//             circleBtn.translateX > this.centerPointX) {
//             circleBtn.translateX = this.centerPointX;
//         }
//         if (circleBtn.translateX < 0 &&
//             (circleBtn.translateX * -1) > this.centerPointX) {
//             circleBtn.translateX = this.centerPointX * -1;
//         }
//         if (circleBtn.translateY > 0 &&
//             circleBtn.translateY > this.centerPointY) {
//             circleBtn.translateY = this.centerPointY;
//         }
//         if (circleBtn.translateY < 0 &&
//             (circleBtn.translateY * -1) > this.centerPointY) {
//             circleBtn.translateY = this.centerPointY * -1;
//         }

//         this.circleBtnList.push(circleBtn);
//         this.points.push(actualPoint);
//         return circleBtn;
//     }
//     /**
//      * Checks the image that it is within the image view boundary or not.
//      *
//      * @param translateX Image translateX
//      * @param translateY Image translateY
//      */
//     private checkBoundary(translateX: any, translateY: any): any {
//         const pointAdjustment = 5; // Need to adjust the center point value to check the boundary
//         if (translateX < (this.centerPointX - pointAdjustment) &&
//             translateY < (this.centerPointY - pointAdjustment) &&
//             (translateX * -1) < (this.centerPointX - pointAdjustment) &&
//             (translateY * -1) < (this.centerPointY - pointAdjustment)) {
//             return true;
//         } else {
//             return false;
//         }
//     }

}

