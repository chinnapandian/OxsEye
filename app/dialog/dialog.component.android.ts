import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { View } from 'ui/core/view';
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from 'ui/gestures';
import { TransformedImage } from '../providers/transformedimage.common';
import { ActivityLoader } from '../activityloader/activityloader.common';
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';
import { Page } from 'tns-core-modules/ui/page';
import { File, path } from 'tns-core-modules/file-system';
import { setTimeout } from 'tns-core-modules/timer';
import { Image } from 'ui/image';
import * as opencv from 'nativescript-opencv-plugin';
import * as Toast from 'nativescript-toast';
import * as platform from 'platform';
import * as application from 'tns-core-modules/application';
import * as Permissions from 'nativescript-permissions';
import * as orientation from 'nativescript-orientation';
import * as buttons from 'ui/button';
import * as formattedStringModule from 'text/formatted-string';

/**
 * Dialog content class.
 */
@Component({
    selector: 'modal-content',
    moduleId: module.id,
    styleUrls: ['./dialog.component.css'],
    templateUrl: './dialog.component.html',
})
export class DialogContent {
    /** Transformed Image source. */
    public imageSource: any;
    /** Original Image source. */
    public imageSourceOrg: any;
    /** Contains true/false to perform transformation automatically or not. */
    public isAutoCorrection = false;
    /** Contains button label name either 'Manual'/ 'Perform' */
    public manualBtnText: string;
    /** Contains list of four points of the images. */
    private _points: any;
    /** Indicates the number of points. */
    private _pointsCounter: number;
    /** Stores previous original Image source. */
    private _imageSourceOrgOld: any;
    /** Stores previous transformed image source. */
    private _imageSourceOld: any;
    /** Contains transformed image actual size. */
    private _imageActualSize: any;
    /** List of circle buttons */
    private _circleBtnList: any;
    /** Stores transformed image referrence. */
    private _imgView: any;
    /** Image grid id. */
    private _imgGridId: any;
    /** Transformed Image previous deltaX. */
    private _prevDeltaX: number;
    /** Transformed Image previous deltaY. */
    private _prevDeltaY: number;
    /** Transformed Image starting scale. */
    private _startScale = 1;
    /** Transformed Image center pointX. */
    private _centerPointX: any;
    /** Transformed Image center pointY. */
    private _centerPointY: any;
    /** Transformed Image new scale while moving around. */
    private _newScale = 1;
    /** Stores old TranslateX value of transformed Image. */
    private _oldTranslateX = 0;
    /** Stores old translateY value of transformed Image. */
    private _oldTranslateY = 0;
    /** Boolean value to indicate whether the image got default screen location or not. */
    private _isGotDefaultLocation = false;
    /** Stores transformed image's screen location. */
    private _defaultScreenLocation: any;
    /** Stores rectangle points to be used in the OpenCV API call. */
    private _rectanglePoints: any;
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;

    // private _points = new ObservableArray();

    /**
     * Constructor for DialogContent class.
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    constructor(private params: ModalDialogParams,
        private transformedImageProvider: TransformedImageProvider) {
        this.manualBtnText = 'Manual';
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }
    /**
     * Close
     * @param result 
     */
    close(result: string) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    }
    /**
     * Perform manual correction.
     * @param btnText 
     */
    performManualCorrection(btnText: string) {
        let pointsCount = 0;
        this._points.forEach((point: any) => {
            if (point) {
                pointsCount++;
            }
        });

        //To get accurate position, need to adjust the radius value;
        let circleRadius = 17;
        // this._points[0].y = +this._points[0].y - circleRadius;
        // this._points[1].y = +this._points[1].y - circleRadius;
        // this._points[2].y = +this._points[2].y + circleRadius;
        // this._points[3].y = +this._points[3].y + circleRadius;

        if (pointsCount !== 4) {
            alert('Please select only four _points.');
        } else {
            const rectanglePoints = this._points[0].x + '-' + (+this._points[0].y - circleRadius) + '#'
                + this._points[1].x + '-' + (+this._points[1].y - circleRadius) + '#'
                + this._points[2].x + '-' + (+this._points[2].y + circleRadius) + '#'
                + this._points[3].x + '-' + (+this._points[3].y + circleRadius);
            console.log(rectanglePoints);
            console.log(this.imageSourceOrg);
            console.log(this._imageActualSize.width + '-' + this._imageActualSize.height);
            this._imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints,
                this._imageActualSize.width + '-' + this._imageActualSize.height);
            SendBroadcastImage(this.imageSource);
            setTimeout(() => {
                this.transformedImageProvider.deleteFile(this._imageSourceOld);
            }, 1000);
            this.imageSourceOrg = this._imageSourceOrgOld;
            this.isAutoCorrection = true;
            this.manualBtnText = 'Manual';
            this.removeCircles();
            // this._pointsCounter = 0;
            this.transformedImageProvider.DeleteFiles();
        }
    }
    /**
     * Gets rectangle points.
     * @param event 
     */
    getPoints(event: GestureEventData) {
        try {
            if (this.manualBtnText === 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                const scale: number = platform.screen.mainScreen.scale;

                this._imageActualSize = this._imgView.getActualSize();
                const pointX = event.android.getX() / scale;
                const pointY = event.android.getY() / scale;

                const actualPoint = { x: pointX, y: pointY, id: this._pointsCounter };

                if (this._points.length >= 4) {
                    Toast.makeText('Please select only four _points.', 'long').show();
                } else {
                    this._imgGridId.addChild(this.createCircle(actualPoint));
                }
            }
        } catch (e) {
            alert(e);
        }
    }
    /**
     * Show original image.
     */
    showOriginalImage() {

        this.onDoubleTap(null);
        if (this._circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText('Please move around the four red circle(s) on image if needed and click "Perform" button.', 'long').show();
        }
        this.isAutoCorrection = false;
        this.manualBtnText = 'Perform';
        this._pointsCounter = 0;
        this.addCircles();
    }
    /**
     * On event pinch
     * @param args 
     */
    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            // let newOriginX = args.getFocusX() - this._imgView.translateX;
            // let newOriginY = args.getFocusY() - this._imgView.translateY;

            // let oldOriginX = this._imgView.originX * this._imgView.getMeasuredWidth();
            // let oldOriginY = this._imgView.originY * this._imgView.getMeasuredHeight();
            this._startScale = this._imgView.scaleX;
        } else if (args.scale && args.scale !== 1) {
            this._newScale = this._startScale * args.scale;
            this._newScale = Math.min(8, this._newScale);
            this._newScale = Math.max(0.125, this._newScale);

            this._imgView.scaleX = this._newScale;
            this._imgView.scaleY = this._newScale;
            this._imgView.width = this._imgView.getMeasuredWidth() * this._newScale;
            this._imgView.height = this._imgView.getMeasuredHeight() * this._newScale;
        }
    }
    /**
     * On event pan/move
     * @param args 
     */
    onPan(args: PanGestureEventData) {
        const screenLocation = this._imgView.getLocationOnScreen();
        if (this.manualBtnText !== 'Perform') {
            let centerPointX = (this._imgView.getMeasuredWidth() / 4) * (this._newScale);
            let centerPointY = (this._imgView.getMeasuredHeight() / 4) * (this._newScale);
            const imageViewWidth = this._imgView.getMeasuredWidth() * this._imgView.originX;
            const imageViewHeight = this._imgView.getMeasuredHeight() * this._imgView.originY;

            if (args.state === 1) {
                this._prevDeltaX = 0;
                this._prevDeltaY = 0;
            } else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);

                // let screenLocation = this._imgView.getLocationOnScreen();
                if (!this._isGotDefaultLocation) {
                    this._defaultScreenLocation = screenLocation;
                    this._isGotDefaultLocation = true;
                }
                if (this._newScale > 1) {
                    if ((screenLocation.x - this._defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this._defaultScreenLocation.x)
                    ) {
                        this._imgView.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._imgView.translateX;
                    } else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        } else {
                            this._oldTranslateX++;
                        }
                        this._imgView.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - this._defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this._defaultScreenLocation.y)
                    ) {
                        this._imgView.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._imgView.translateY;
                    } else {
                        if (this._oldTranslateY > 0) {
                            this._oldTranslateY--;
                        } else {
                            this._oldTranslateY++;
                        }
                        this._imgView.translateY = this._oldTranslateY;
                    }
                }
                this._prevDeltaX = args.deltaX;
                this._prevDeltaY = args.deltaY;
            }
        }
    }
    /**
     * On event double tap.
     * @param args 
     */
    onDoubleTap(args: any) {
        if (this.manualBtnText !== 'Perform') {
            this._imgView.animate({
                translate: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
                curve: 'easeOut',
                duration: 10,
            });
            this._newScale = 1;
            this._oldTranslateY = 0;
            this._oldTranslateX = 0;
        } else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    }
    /**
     * On event page loaded.
     * @param args 
     */
    pageLoaded(args: { object: any; }) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this._imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this._imageSourceOld = this.params.context.imageSource;
        let recPointsStrTemp = this.params.context.rectanglePoints;

        this._rectanglePoints = recPointsStrTemp.split('#');
        this._rectanglePoints.shift(); // remove first element
        this._rectanglePoints.pop(); // remove last element
        const page = args.object;
        this._imgView = page.getViewById('imgViewId');
        this._imgGridId = page.getViewById('imgGridId');
        this._imgView.translateX = 0;
        this._imgView.translateY = 0;
        this._imgView.scaleX = 1;
        this._imgView.scaleY = 1;
        orientation.setOrientation('portrait');
    }
    /**
     * Add circles.
     */
    private addCircles() {
        this._circleBtnList.forEach((btn: any) => {
            this._imgGridId.addChild(btn);
        });
    }
    /**
     * Remove circles.
     */
    private removeCircles() {
        const imgElement = this._imgGridId.getChildAt(0);
        this._imgGridId.removeChildren();
        this._imgGridId.addChild(imgElement);
    }
    /**
     * Initialize points
     */
    private initPoints() {
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        const scale: number = platform.screen.mainScreen.scale;

        this._imageActualSize = this._imgView.getActualSize();
        this._centerPointX = (this._imgGridId.getMeasuredWidth() / 2) / scale;
        this._centerPointY = (this._imgGridId.getMeasuredHeight() / 2) / scale;

        if (this._rectanglePoints.length > 0) {
            let pointIndex = 1;
            this._rectanglePoints.forEach((point) => {
                let points = point.split('%');
                let circleRadius = 17;
                if (pointIndex++ > 2) { // For checking botton points
                    circleRadius = circleRadius * -1;
                }
                let actualPoint = { x: +points[0] * (this._imgGridId.getMeasuredWidth() / scale), y: (+points[1] * (this._imgGridId.getMeasuredHeight() / scale)) + circleRadius, id: this._pointsCounter };
                this.createCircle(actualPoint);
            });
        }
        // else {


        //     let actualPoint = { x: this._centerPointX - 75, y: this._centerPointY - 75, id: this._pointsCounter };
        //     this.createCircle(actualPoint);
        //     actualPoint = { x: this._centerPointX + 75, y: this._centerPointY - 75, id: this._pointsCounter };
        //     this.createCircle(actualPoint);
        //     actualPoint = { x: this._centerPointX - 75, y: this._centerPointY + 75, id: this._pointsCounter };
        //     this.createCircle(actualPoint);
        //     actualPoint = { x: this._centerPointX + 75, y: this._centerPointY + 75, id: this._pointsCounter };
        //     this.createCircle(actualPoint);
        // }
    }
    /**
     * Create circles.
     * @param actualPoint 
     */
    private createCircle(actualPoint: any): any {
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        const actualPointDeltaX = (this._imageActualSize.width / 2) - this._imageActualSize.width;
        const actualPointDeltaY = (this._imageActualSize.height / 2) - this._imageActualSize.height;

        const formattedString = new formattedStringModule.FormattedString();
        const iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add('fa');
        iconSpan.cssClasses.add('circle-plus');
        iconSpan.text = String.fromCharCode(0xf067);

        formattedString.spans.push(iconSpan);
        const circleBtn: any = new buttons.Button();
        circleBtn.cssClasses.add('circle');

        circleBtn.id = this._pointsCounter++;
        circleBtn.formattedText = formattedString;
        circleBtn.on('pan', (args: PanGestureEventData) => {
            if (args.state === 1) {
                this._prevDeltaX = 0;
                this._prevDeltaY = 0;
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
                    circleBtn.translateX += args.deltaX - this._prevDeltaX;
                    circleBtn.translateY += args.deltaY - this._prevDeltaY;

                    this._points.forEach((point: any) => {
                        if (point) {
                            if (point.id === circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    });
                    this._prevDeltaX = args.deltaX;
                    this._prevDeltaY = args.deltaY;
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
            circleBtn.translateX > this._centerPointX) {
            circleBtn.translateX = this._centerPointX;
        }
        if (circleBtn.translateX < 0 &&
            (circleBtn.translateX * -1) > this._centerPointX) {
            circleBtn.translateX = this._centerPointX * -1;
        }
        if (circleBtn.translateY > 0 &&
            circleBtn.translateY > this._centerPointY) {
            circleBtn.translateY = this._centerPointY;
        }
        if (circleBtn.translateY < 0 &&
            (circleBtn.translateY * -1) > this._centerPointY) {
            circleBtn.translateY = this._centerPointY * -1;
        }

        this._circleBtnList.push(circleBtn);
        this._points.push(actualPoint);
        return circleBtn;
    }
    /**
     * Check screen boundary.
     * @param translateX 
     * @param translateY 
     */
    private checkBoundary(translateX: any, translateY: any): any {
        const pointAdjustment = 5; // Need to adjust the center point value to check the boundary
        if (translateX < (this._centerPointX - pointAdjustment) &&
            translateY < (this._centerPointY - pointAdjustment) &&
            (translateX * -1) < (this._centerPointX - pointAdjustment) &&
            (translateY * -1) < (this._centerPointY - pointAdjustment)) {
            return true;
        } else {
            return false;
        }
    }

}
