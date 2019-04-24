import { Component } from '@angular/core';
import { ModalDialogParams } from 'nativescript-angular/modal-dialog';
import { setTimeout } from 'tns-core-modules/timer';
import { GestureEventData, PanGestureEventData, PinchGestureEventData } from 'tns-core-modules/ui/gestures';

import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import * as orientation from 'nativescript-orientation';
import * as Toast from 'nativescript-toast';
import * as platform from 'tns-core-modules/platform';
import * as formattedStringModule from 'tns-core-modules/text/formatted-string';
import * as buttons from 'tns-core-modules/ui/button';

import * as opencv from 'nativescript-opencv-plugin';
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
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;

    // private points = new ObservableArray();

    /**
     * Constructor for DialogContent class.
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    constructor(private params: ModalDialogParams,
        private transformedImageProvider: TransformedImageProvider) {
        this.manualBtnText = 'Manual';
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }
    /**
     * Close
     * @param result Which is nothing but empty string or transformed image URI string
     */
    close(result: string) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    }
    /**
     * Performing manual transformation
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

        if (pointsCount !== 4) {
            alert('Please select only four points.');
        } else {
            const point0Y = (+this.points[0].y - this.circleRadius);
            const point1Y = (+this.points[1].y - this.circleRadius);
            const rectanglePoints = this.points[0].x + '-' + ((point0Y < 0)? 0 : point0Y) + '#'
                + this.points[1].x + '-' + ((point1Y < 0)? 0 : point1Y) + '#'
                + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
                + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
            console.log(rectanglePoints);
            console.log(this.imageSourceOrg);
            console.log(this.imageActualSize.width + '-' + this.imageActualSize.height);
            this.imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints,
                this.imageActualSize.width + '-' + this.imageActualSize.height);
            SendBroadcastImage(this.imageSource);
            setTimeout(() => {
                this.transformedImageProvider.deleteFile(this.imageSourceOld);
            }, 1000);
            this.imageSourceOrg = this.imageSourceOrgOld;
            this.isAutoCorrection = true;
            this.manualBtnText = 'Manual';
            this.removeCircles();
            // this.pointsCounter = 0;
            this.transformedImageProvider.DeleteFiles();
        }
    }
    /**
     * Gets rectangle points.
     * @param event Gesture event data
     */
    getPoints(event: GestureEventData) {
        try {
            if (this.manualBtnText === 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                const scale: number = platform.screen.mainScreen.scale;

                this.imageActualSize = this.imgView.getActualSize();
                const pointX = event.android.getX() / scale;
                const pointY = event.android.getY() / scale;

                const actualPoint = { x: pointX, y: pointY, id: this.pointsCounter };

                if (this.points.length >= 4) {
                    Toast.makeText('Please select only four points.', 'long').show();
                } else {
                    this.imgGridId.addChild(this.createCircle(actualPoint));
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

        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText('Please move around the four red circle(s) on image if needed and click "Perform" button.', 'long').show();
        }
        this.isAutoCorrection = false;
        this.manualBtnText = 'Perform';
        this.pointsCounter = 0;
        this.addCircles();
    }
    /**
     * On event pinch
     * @param args PinchGesture event data
     */
    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            // let newOriginX = args.getFocusX() - this.imgView.translateX;
            // let newOriginY = args.getFocusY() - this.imgView.translateY;

            // let oldOriginX = this.imgView.originX * this.imgView.getMeasuredWidth();
            // let oldOriginY = this.imgView.originY * this.imgView.getMeasuredHeight();
            this.startScale = this.imgView.scaleX;
        } else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(8, this.newScale);
            this.newScale = Math.max(0.125, this.newScale);

            this.imgView.scaleX = this.newScale;
            this.imgView.scaleY = this.newScale;
            this.imgView.width = this.imgView.getMeasuredWidth() * this.newScale;
            this.imgView.height = this.imgView.getMeasuredHeight() * this.newScale;
        }
    }
    /**
     * On event pan/move
     * @param args PanGesture event data
     */
    onPan(args: PanGestureEventData) {
        const screenLocation = this.imgView.getLocationOnScreen();
        if (this.manualBtnText !== 'Perform') {
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
                }
                this.prevDeltaX = args.deltaX;
                this.prevDeltaY = args.deltaY;
            }
        }
    }
    /**
     * Event fires on double tap
     */
    onDoubleTap() {
        if (this.manualBtnText !== 'Perform') {
            this.imgView.animate({
                translate: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
                curve: 'easeOut',
                duration: 10,
            });
            this.newScale = 1;
            this.oldTranslateY = 0;
            this.oldTranslateX = 0;
        } else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    }
    /**
     * On event page loaded.
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
        orientation.setOrientation('portrait');
    }
    /**
     * Add circles.
     */
    private addCircles() {
        this.circleBtnList.forEach((btn: any) => {
            this.imgGridId.addChild(btn);
        });
    }
    /**
     * Remove circles.
     */
    private removeCircles() {
        const imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
    }
    /**
     * Initialize points
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
            console.log('this.rectanglePoints: ' + JSON.stringify(this.rectanglePoints));
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
                console.log('actualPoint : ' + JSON.stringify(actualPoint));
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
     * Create circles.
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
     * Check screen boundary.
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
