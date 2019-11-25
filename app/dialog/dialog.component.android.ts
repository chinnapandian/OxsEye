import { Component, OnInit } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { setTimeout } from 'tns-core-modules/timer';
import { GestureEventData, PanGestureEventData, PinchGestureEventData, SwipeGestureEventData } from 'tns-core-modules/ui/gestures';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import { TransformedImage } from '../providers/transformedimage.common';
import { File, Folder } from 'tns-core-modules/file-system';
// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';
import { PageChangeEventData, ImageSwipe } from "nativescript-image-swipe";
import { Page } from 'tns-core-modules/ui/page';
import { CheckBox } from '@nstudio/nativescript-checkbox';

// import { L } from 'nativescript-i18n/angular';

// import * as orientation from 'nativescript-orientation';
import * as Toast from 'nativescript-toast';
import * as platform from 'tns-core-modules/platform';
import * as formattedStringModule from 'tns-core-modules/text/formatted-string';
import * as buttons from 'tns-core-modules/ui/button';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import { localize } from "nativescript-localize";
import { ObservableArray } from "tns-core-modules/data/observable-array";
import { EventData, Observable } from "tns-core-modules/data/observable";

declare var android: any;
declare var java: any;

// import * as opencv from 'nativescript-opencv-plugin';

/** Lable for 'Manual' text */
const LABLE_MANUAL = 'Manual';
/** Lable for 'Perform' text */
const LABLE_PERFORM = 'Perform';

let matrix = new android.graphics.Matrix();
let viewModel: Observable;
/**
 * Dialog content class.
 */
@Component({
    selector: 'modal-content',
    moduleId: module.id,
    styleUrls: ['./dialog.component.css'],
    templateUrl: './dialog.component.html',
})
export class DialogContent implements OnInit {
    /** Transformed Image source. */
    public imageSource: any;
    /** Original Image source. */
    public imageSourceOrg: any;
    /** Contains true/false to perform transformation automatically or not. */
    public isAutoCorrection = false;
    /** Contains button label name either 'Manual'/ 'Perform' */
    public manualBtnText: string;
    /** Contains list of four points of the images. */
    private points: any;
    /** Indicates the number of points. */
    private pointsCounter: number;
    /** Stores previous original Image source. */
    private imageSourceOrgOld: any;
    /** Stores previous transformed image source. */
    private imageSourceOld: any;
    /** Contains transformed image actual size. */
    private imageActualSize: any;
    /** List of circle buttons */
    private circleBtnList: any;
    /** Stores transformed image referrence. */
    private imgView: any;
    /** Image grid id. */
    private imgGridId: any;
    /** Transformed Image previous deltaX. */
    private prevDeltaX: number;
    /** Transformed Image previous deltaY. */
    private prevDeltaY: number;
    /** Transformed Image starting scale. */
    private startScale = 1;
    /** Transformed Image center pointX. */
    private centerPointX: any;
    /** Transformed Image center pointY. */
    private centerPointY: any;
    /** Transformed Image new scale while moving around. */
    private newScale = 1;
    /** Stores old TranslateX value of transformed Image. */
    private oldTranslateX = 0;
    /** Stores old translateY value of transformed Image. */
    private oldTranslateY = 0;
    /** Boolean value to indicate whether the image got default screen location or not. */
    private isGotDefaultLocation = false;
    /** Stores transformed image's screen location. */
    private defaultScreenLocation: any;
    /** Stores rectangle points to be used in the OpenCV API call. */
    private rectanglePoints: any;
    /** To get accurate position, need to adjust the radius value */
    private circleRadius = 17;
    /** Index value of the transformed image */
    private imgNext = 0;
    /** Boolean value to make the deleting menu visible or not. */
    public isDeleting: boolean;

    private isCheckMarkVisible = false;
    private isCrossMarkVisible = false;

    private imageUrlList = new ObservableArray();// any[] = [];
    private pageNumber: number = 3;
    private isSelected: boolean;
    private imageList: any;
    /** Lable for Manua/Perform button */
    // private manualPerformBtnLable: any;
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;

    // private points = new ObservableArray();

    /**
     * Constructor for DialogContent class.
     *
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    constructor(private params: ModalDialogParams,
        private transformedImageProvider: TransformedImageProvider,
        private logger: OxsEyeLogger,
        private page: Page
        // private locale: L
    ) {
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = localize('manual');
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }

    ngOnInit(): void {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        const recPointsStrTemp = this.params.context.rectanglePoints;
        this.imgNext = 0;
        const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'))
        this.transformedImageProvider.LoadPossibleContourImages(fileName);
        // this.imageList = this.transformedImageProvider.contourList;
        // this.imageUrlList.splice(0, this.imageUrlList.length);
        // this.transformedImageProvider.contourImageList.forEach(img => {
        //     const imageFile = new java.io.File(img.filePath);
        //     this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
        // });
        this.pageNumber = this.imgNext;
        viewModel = new Observable();
        viewModel.set("imageUrlList", this.imageUrlList);
        viewModel.set("pageNumber", this.imgNext);

        this.page.bindingContext = viewModel;
        this.isSelected = false;
        this.isCheckMarkVisible = false;
        this.isCrossMarkVisible = true;
    }

    public pageChanged(args: PageChangeEventData) {
        console.log(`Page changed.....  to ${args.page}.`);
        this.imgNext = args.page;
        this.pageNumber = this.imgNext;
        this.isSelected = this.imageList[this.imgNext].isSelected;
        viewModel.set("imageUrlList", this.imageUrlList);
        viewModel.set("pageNumber", this.imgNext);
        // viewModel.set("isSelected", this.isSelected);
        this.page.bindingContext = viewModel;
        const imgSwipe: any = args.object;
        // const checkBox = imgSwipe.parent.getViewById('checkbox-delete') as CheckBox;
        // checkBox.checked = this.imageList[this.imgNext].isSelected;
        this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
        this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, imgSwipe.parent.parent);
    }

    /**
     * Close method, which close the dialog window opened after captured image from camera.
     * And returns back to the place where the dialog window got triggered, along with
     * the parameter 'result'
     * @param result Which is nothing but empty string or transformed image URI string
     */
    close(result: string) {
        // orientation.enableRotation();chinna
        this.params.closeCallback(result);
    }
    /**
     * Performing manual transformation
     * this is been used to perform transformation manually, where the rectangle
     * points will be choosen by user in the captured image displaying in the dialog window.
     * In the dialog window, there are four circles are being used to select points.
     * Based on the selected points, the transformation will be performed here.
     */
    performManualCorrection() {
        let pointsCount = 0;
        this.points.forEach((point: any) => {
            if (point) {
                pointsCount++;
            }
        });

        // To get accurate position, need to adjust the radius value;
        // const circleRadius = 17;
        // this.points[0].y = +this.points[0].y - circleRadius;
        // this.points[1].y = +this.points[1].y - circleRadius;
        // this.points[2].y = +this.points[2].y + circleRadius;
        // this.points[3].y = +this.points[3].y + circleRadius;

        const point0Y = (+this.points[0].y - this.circleRadius);
        const point1Y = (+this.points[1].y - this.circleRadius);
        const rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
            + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
            + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
            + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
        this.imageSourceOld = this.imageSource;
        // this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints,
        //     this.imageActualSize.width + '-' + this.imageActualSize.height);
        SendBroadcastImage(this.imageSource);
        setTimeout(() => {
            this.transformedImageProvider.deleteFile(this.imageSourceOld);
        }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = localize('manual');
        this.removeCircles();
        // this.pointsCounter = 0;
        this.transformedImageProvider.DeleteFiles();
    }
    /**
     * Gets rectangle points.
     *
     * @param event Gesture event data
     */
    // getPoints(event: GestureEventData) {
    //     try {
    //         if (this.manualBtnText === LABLE_PERFORM) {
    //             // This is the density of your screen, so we can divide the measured width/height by it.
    //             const scale: number = platform.screen.mainScreen.scale;

    //             this.imageActualSize = this.imgView.getActualSize();
    //             const pointX = event.android.getX() / scale;
    //             const pointY = event.android.getY() / scale;

    //             const actualPoint = { x: pointX, y: pointY, id: this.pointsCounter };

    //             if (this.points.length >= 4) {
    //                 Toast.makeText('Please select only four points.', 'long').show();
    //             } else {
    //                 this.imgGridId.addChild(this.createCircle(actualPoint));
    //             }
    //         }
    //     } catch (error) {
    //         Toast.makeText('Error calling getPoints(). ' + error);
    //         this.logger.error(module.filename + ': ' + error);
    //     }
    // }

    get imageList0(): Array<TransformedImage> {
        console.log("imageList:" + JSON.stringify(this.transformedImageProvider.contourImageList));
        return this.transformedImageProvider.contourImageList;
        // return this.contourList;
    }
    get imageUrlList0(): any {
        return this.imageUrlList;
    }
    /**
     * Show original image, is being used to show original captured image
     * when the 'Manual' button is been pressed, this is where user can select desired points
     * and perform manual transformation. It is also intializing circle points to be displayed
     * in the original image.
     */
    showOriginalImage() {
        this.isAutoCorrection = false;
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText(localize('rectangle_points_info'), 'long').show();
        }
        this.manualBtnText = LABLE_PERFORM;
        // this.manualPerformBtnLable = localize('perform');
        this.pointsCounter = 0;
        this.addCircles();
    }
    /**
     * On pinch method, is being called while pinch event fired on image,
     * where the new scale, width & height of the transformed image have been calculated
     * to zoom-in/out.
     * @param args PinchGesture event data
     */
    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            // let newOriginX = args.getFocusX() - this.imgView.translateX;
            // let newOriginY = args.getFocusY() - this.imgView.translateY;

            // let oldOriginX = this.imgView.originX * this.imgView.getMeasuredWidth();
            // let oldOriginY = this.imgView.originY * this.imgView.getMeasuredHeight();

            // this.imgView._androidView.setScaleType(android.widget.ImageView.ScaleType.MATRIX);
            // this.imgView._androidView.setImageMatrix(matrix);
            // this.imgView._androidView.invalidate();
            this.startScale = this.imgView.scaleX;
        } else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(5, this.newScale);
            this.newScale = Math.max(0.9, this.newScale);

            this.imgView.scaleX = this.newScale;
            this.imgView.scaleY = this.newScale;
            this.imgView.width = this.imgView.getMeasuredWidth() * this.newScale;
            this.imgView.height = this.imgView.getMeasuredHeight() * this.newScale;
            // matrix.setScale(this.newScale,this.newScale);
            matrix.postScale(this.newScale, this.newScale, this.imgView.getMeasuredWidth() / 2, this.imgView.getMeasuredHeight() / 2);
            // matrix.setTranslate(this.oldTranslateX, this.oldTranslateY);
            this.imgView._androidView.setImageMatrix(matrix);
            this.imgView._androidView.invalidate();
        }
    }
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGesture event data
     */
    onPan(args: PanGestureEventData) {
        const screenLocation = this.imgView.getLocationOnScreen();
        if (this.manualBtnText !== LABLE_PERFORM) {
            let centerPointX = (this.imgView.getMeasuredWidth() / 4) * (this.newScale);
            let centerPointY = (this.imgView.getMeasuredHeight() / 4) * (this.newScale);
            const imageViewWidth = this.imgView.getMeasuredWidth() * this.imgView.originX;
            const imageViewHeight = this.imgView.getMeasuredHeight() * this.imgView.originY;

            if (args.state === 1) {
                this.prevDeltaX = 0;
                this.prevDeltaY = 0;
            } else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);

                // let screenLocation = this.imgView.getLocationOnScreen();
                if (!this.isGotDefaultLocation) {
                    this.defaultScreenLocation = screenLocation;
                    this.isGotDefaultLocation = true;
                }
                if (this.newScale > 1) {
                    if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)
                    ) {
                        this.imgView.translateX += args.deltaX - this.prevDeltaX;
                        this.oldTranslateX = this.imgView.translateX;
                    } else {
                        if (this.oldTranslateX > 0) {
                            this.oldTranslateX--;
                        } else {
                            this.oldTranslateX++;
                        }
                        this.imgView.translateX = this.oldTranslateX;
                    }
                    if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)
                    ) {
                        this.imgView.translateY += args.deltaY - this.prevDeltaY;
                        this.oldTranslateY = this.imgView.translateY;
                    } else {
                        if (this.oldTranslateY > 0) {
                            this.oldTranslateY--;
                        } else {
                            this.oldTranslateY++;
                        }
                        this.imgView.translateY = this.oldTranslateY;
                    }
                    // matrix.postTranslate(this.oldTranslateX, this.oldTranslateY);
                    // this.imgView._androidView.setImageMatrix(matrix);
                    // this.imgView._androidView.invalidate();
                }
                this.prevDeltaX = args.deltaX;
                this.prevDeltaY = args.deltaY;
            }
        }
    }
    /**
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     */
    onDoubleTap() {
        // if (this.manualBtnText !== LABLE_PERFORM) {
        this.imgView.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeOut',
            duration: 10,
        });
        this.newScale = 1;
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
        // } else {
        //     // this.initPoints();
        //     this.removeCircles();
        //     this.addCircles();
        // }
    }
    /**
     * Checks whether the checkBox is been selected or not. If it is selected,
     * the delete/share menus are visible, otherwise they are not visible.
     * And also sets the same value in the image list.
     *
     * @param event Checkbox event data
     * @param imagePath transformed image file path
     * @param index image index in the list
     */
    isChecked(event) {
        this.imageList[this.pageNumber].isSelected = !this.imageList[this.pageNumber].isSelected;
        this.isCheckMarkVisible = this.imageList[this.pageNumber].isSelected;
        this.isCrossMarkVisible = !this.isCheckMarkVisible;
    }
    /**
     * Page loaded method which is been called when dialog window is loaded,
     * where all the necessary values for the image to be displayed in the window
     * have been initialized, like transformedImageSource, originalImageSource &
     * rectangle points.
     *
     * @param args Page loaded event data
     */
    pageLoaded(args: { object: any; }) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        const recPointsStrTemp = this.params.context.rectanglePoints;

        this.rectanglePoints = recPointsStrTemp.split('#');
        this.rectanglePoints.shift(); // remove first element
        this.rectanglePoints.pop(); // remove last element
        const page = args.object;
        this.imgView = page.getViewById('imgViewId');
        this.imgGridId = page.getViewById('imgGridId');
        this.imgView.translateX = 0;
        this.imgView.translateY = 0;
        this.imgView.scaleX = 1;
        this.imgView.scaleY = 1;
        // this.imgView.rotate = 90;
        // orientation.setOrientation('portrait');chinna
        this.imgNext = 0;
        const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'))
        this.transformedImageProvider.LoadPossibleContourImages(fileName);
        setTimeout(() => {
            this.imageList = this.transformedImageProvider.contourList;//contourImageList; //;
            this.imageUrlList.splice(0, this.imageUrlList.length);
            this.imageList.forEach(img => {
                const imageFile = new java.io.File(img.filePath);
                this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
            });
            viewModel.set("imageUrlList", this.imageUrlList);
            viewModel.set("pageNumber", this.imgNext);
            this.page.bindingContext = viewModel;
            const selectedImgGrid = page.getViewById('img-grid-0');
            selectedImgGrid.backgroundColor = 'Black';
        }, 300);
        this.isDeleting = false;
        //  setTimeout(() => {
        //    page.actionBarHidden = true;
        // }, 1000);
    }

    private enableDelete() {
        if (this.imageList.length > 0) {
            this.isDeleting = !this.isDeleting;
        }
    }
    /**
    * Deletes the selected image(s) when user clicks the 'delete' button in menu.
    * This will show up a dialog window for confirmation for the selected image(s)
    * to be deleted. If user says 'Ok', then those image(s) will be removed from the
    * device, otherwise can be cancelled.
    */
    private onDelete(event: any) {
        // if (this.selectedCount > 0) {
        dialogs.confirm({
            title: localize('delete'),
            message: localize('deleting_selected_item'),
            okButtonText: localize('ok'),
            cancelButtonText: localize('cancel'),
        }).then((result) => {
            if (result) {
                this.isDeleting = false;
                this.imageList.forEach((image) => {
                    if (image.filePath == this.imageSource) {
                        const file: File = File.fromPath(image.filePath);
                        file.remove()
                            .then(() => {
                                // const thumbnailFile: File = File.fromPath(image.thumbnailPath);
                                // thumbnailFile.remove()
                                //     .then(() => {
                                SendBroadcastImage(image.filePath);

                                // this.pageLoaded(event);
                                // }).catch((error) => {
                                //     Toast.makeText(localize('error_while_deleting_thumbnail_images') + error).show();
                                //     this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                //         + this.logger.ERROR_MSG_SEPARATOR + error);
                                // });
                                const imgIdx = this.imageList.indexOf(image);
                                this.imgNext = imgIdx;
                                this.nextImage();
                                // if (this.imgNext >= (this.transformedImageProvider.contourImageList.length - 1)) {
                                //     this.imgNext--;
                                // }
                                // if (this.imgNext >= 0) {
                                this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
                                this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, event.view.page);
                                // }
                                if (imgIdx >= 0) {
                                    this.imageList.splice(imgIdx, 1);
                                    Toast.makeText(localize('selected_images_deleted')).show();
                                }
                                if (this.imageList.length == 0) {
                                    this.imageSource = '';
                                    this.isDeleting = false;
                                }

                            }).catch((error) => {
                                Toast.makeText(localize('error_while_deleting_images')).show();
                                this.logger.error('Error while deleting images. ' + module.filename
                                    + this.logger.ERROR_MSG_SEPARATOR + error);
                            });
                    }

                });
            }
        });
        // }
    }
    /**
     * Add circles method adds circle points btn in original image.
     */
    private addCircles() {
        this.circleBtnList.forEach((btn: any) => {
            this.imgGridId.addChild(btn);
        });
    }
    /**
     * Remove circles removes circle points btn from original image.
     */
    private removeCircles() {
        const imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
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
            this.nextImage();
        } else if (args.direction === 1) {
            this.previousImage();
        }
        // // this.imgIndex = this.imgNext;
        // if (this.imageFileList.length > 0) {
        this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
        this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, args.view.page);
        // } else {
        //     this.imageSource = null;
        //     Toast.makeText(localize('no_image_available')).show();
        // }

        // this.onDoubleTap(args);
        // }
    }
    /**
     * Method to move to previous image
     */
    private previousImage() {
        this.imgNext--;
        if (this.imgNext < 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = (this.transformedImageProvider.contourImageList.length - 1);
        }
    }
    /**
     * Method to move to next image.
     */
    private nextImage() {
        this.imgNext++;
        if (this.imgNext <= 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = 0;
        }

    }
    /**
     * Select the image tapped by user and makes it with selected sign in black color.
     * @param imgURIPath  the image URI path
     * @param index  the index of the selected image
     * @param event the event handler object
     */
    private selectImage(imgURIPath: any, index: any, event: any) {
        this.imageSource = imgURIPath;
        this.setImageSelected(index, event.view.parent.parent._childrenCount, event.view.page);
    }

    private setImageSelected(index: any, noOfImages: any, eventPage: any) {
        for (let i = 0; i < noOfImages; i++) {
            const selectedImgGrid = eventPage.getViewById('img-grid-' + i);
            selectedImgGrid.backgroundColor = 'gray';
            if (i == index) {
                selectedImgGrid.backgroundColor = 'Black';
                this.imgNext = index;
                this.pageNumber = this.imgNext;
                // const checkBox = eventPage.getViewById('checkbox-delete') as CheckBox;
                // checkBox.checked = this.imageList[this.imgNext].isSelected;
                this.isCheckMarkVisible = this.imageList[this.imgNext].isSelected;
                this.isCrossMarkVisible = !this.imageList[this.imgNext].isSelected;
            }
        }
    }
    /**
     * Initialize circle points based on the receieved rectangle points and
     * image's width & height.
     */
    private initPoints() {
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        const scale: number = platform.screen.mainScreen.scale;

        this.imageActualSize = this.imgView.getActualSize();
        this.centerPointX = (this.imgGridId.getMeasuredWidth() / 2) / scale;
        this.centerPointY = (this.imgGridId.getMeasuredHeight() / 2) / scale;

        let actualPoint = {};
        if (this.rectanglePoints.length > 0) {
            let pointIndex = 1;
            this.rectanglePoints.forEach((point) => {
                const points = point.split('%');
                let bottomCircleRadius = this.circleRadius;
                // let pointDiffX = 0;
                // let pointDiffY = 0;
                // if (pointIndex == 1) {
                //     pointDiffX = -10;
                //     pointDiffY = 10;
                // } else if (pointIndex == 2) {
                //     pointDiffX = 10;
                //     pointDiffY = -10;
                // } else if (pointIndex == 3) {
                //     pointDiffX = 10;
                //     pointDiffY = 10;
                // } else if (pointIndex == 4) {
                //     pointDiffX = -10;
                //     pointDiffY = 10;
                // }
                if (pointIndex++ > 2) { // For checking botton points
                    bottomCircleRadius = bottomCircleRadius * -1;
                }

                //                 topLeft.x = topLeft.x - 10;
                // topLeft.y = topLeft.y - 10;
                // topRight.x = topRight.x + 10;
                // topRight.y = topRight.y - 10;
                // bottomRight.x = bottomRight.x + 10;
                // bottomRight.y = bottomRight.y + 10;
                // bottomLeft.x = bottomLeft.x - 10;
                // bottomLeft.y = bottomLeft.y + 10;
                // let actualPoint = { x: (+points[0] + pointDiffX) * (this.imgGridId.getMeasuredWidth() / scale),
                // y: ((+points[1]+pointDiffY) * (this.imgGridId.getMeasuredHeight() / scale))
                // + circleRadius, id: this.pointsCounter };
                actualPoint = {
                    x: (+points[0]) * (this.imgGridId.getMeasuredWidth() / scale),
                    y: ((+points[1]) * (this.imgGridId.getMeasuredHeight() / scale)) + bottomCircleRadius, id: this.pointsCounter,
                };
                this.createCircle(actualPoint);
            });
        } else {

            actualPoint = { x: 0, y: 0, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this.imageActualSize.width, y: 0, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this.imageActualSize.width, y: this.imageActualSize.height, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: 0, y: this.imageActualSize.height, id: this.pointsCounter };
            this.createCircle(actualPoint);

            //     let actualPoint = { x: this.centerPointX - 75, y: this.centerPointY - 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX + 75, y: this.centerPointY - 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX - 75, y: this.centerPointY + 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX + 75, y: this.centerPointY + 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
        }
    }
    /**
     * This method creates circle points button on original image view
     * based on the points receieved via actualPoint and also takes
     * care of boundary checking while diplaying it.
     *
     * @param actualPoint Contains circle points(x,y)
     */
    private createCircle(actualPoint: any): any {
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        const actualPointDeltaX = (this.imageActualSize.width / 2) - this.imageActualSize.width;
        const actualPointDeltaY = (this.imageActualSize.height / 2) - this.imageActualSize.height;

        const formattedString = new formattedStringModule.FormattedString();
        const iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add('fa');
        iconSpan.cssClasses.add('circle-plus');
        iconSpan.text = String.fromCharCode(0xf067);

        formattedString.spans.push(iconSpan);
        const circleBtn: any = new buttons.Button();
        circleBtn.cssClasses.add('circle');

        circleBtn.id = this.pointsCounter++;
        circleBtn.formattedText = formattedString;
        circleBtn.on('pan', (args: PanGestureEventData) => {
            if (args.state === 1) {
                this.prevDeltaX = 0;
                this.prevDeltaY = 0;
                if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += -15;
                    circleBtn.translateY += -30;
                } else {
                    if (circleBtn.translateX < 0) {
                        circleBtn.translateX += +10;
                    } else {
                        circleBtn.translateX += -10;
                    }
                    if (circleBtn.translateY < 0) {
                        circleBtn.translateY += +10;
                    } else {
                        circleBtn.translateY += -10;
                    }
                }
            } else if (args.state === 2) {
                if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += args.deltaX - this.prevDeltaX;
                    circleBtn.translateY += args.deltaY - this.prevDeltaY;

                    this.points.forEach((point: any) => {
                        if (point) {
                            if (point.id === circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    });
                    this.prevDeltaX = args.deltaX;
                    this.prevDeltaY = args.deltaY;
                }
            } else if (args.state === 3) {
            }
        });

        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        circleBtn.translateX = actualPoint.x + actualPointDeltaX;
        circleBtn.translateY = actualPoint.y + actualPointDeltaY;
        if (circleBtn.translateX > 0 &&
            circleBtn.translateX > this.centerPointX) {
            circleBtn.translateX = this.centerPointX;
        }
        if (circleBtn.translateX < 0 &&
            (circleBtn.translateX * -1) > this.centerPointX) {
            circleBtn.translateX = this.centerPointX * -1;
        }
        if (circleBtn.translateY > 0 &&
            circleBtn.translateY > this.centerPointY) {
            circleBtn.translateY = this.centerPointY;
        }
        if (circleBtn.translateY < 0 &&
            (circleBtn.translateY * -1) > this.centerPointY) {
            circleBtn.translateY = this.centerPointY * -1;
        }

        this.circleBtnList.push(circleBtn);
        this.points.push(actualPoint);
        return circleBtn;
    }
    /**
     * Checks the image that it is within the image view boundary or not.
     *
     * @param translateX Image translateX
     * @param translateY Image translateY
     */
    private checkBoundary(translateX: any, translateY: any): any {
        const pointAdjustment = 5; // Need to adjust the center point value to check the boundary
        if (translateX < (this.centerPointX - pointAdjustment) &&
            translateY < (this.centerPointY - pointAdjustment) &&
            (translateX * -1) < (this.centerPointX - pointAdjustment) &&
            (translateY * -1) < (this.centerPointY - pointAdjustment)) {
            return true;
        } else {
            return false;
        }
    }

}
