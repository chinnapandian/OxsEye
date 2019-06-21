"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var angular_1 = require("nativescript-i18n/angular");
var orientation = require("nativescript-orientation");
var Toast = require("nativescript-toast");
var platform = require("tns-core-modules/platform");
var formattedStringModule = require("tns-core-modules/text/formatted-string");
var buttons = require("tns-core-modules/ui/button");
// import * as opencv from 'nativescript-opencv-plugin';
/** Lable for 'Manual' text */
var LABLE_MANUAL = 'Manual';
/** Lable for 'Perform' text */
var LABLE_PERFORM = 'Perform';
/**
 * Dialog content class.
 */
var DialogContent = (function () {
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
    function DialogContent(params, transformedImageProvider, logger, locale) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
        this.locale = locale;
        /** Contains true/false to perform transformation automatically or not. */
        this.isAutoCorrection = false;
        /** Transformed Image starting scale. */
        this.startScale = 1;
        /** Transformed Image new scale while moving around. */
        this.newScale = 1;
        /** Stores old TranslateX value of transformed Image. */
        this.oldTranslateX = 0;
        /** Stores old translateY value of transformed Image. */
        this.oldTranslateY = 0;
        /** Boolean value to indicate whether the image got default screen location or not. */
        this.isGotDefaultLocation = false;
        /** To get accurate position, need to adjust the radius value */
        this.circleRadius = 17;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }
    /**
     * Close method, which close the dialog window opened after captured image from camera.
     * And returns back to the place where the dialog window got triggered, along with
     * the parameter 'result'
     * @param result Which is nothing but empty string or transformed image URI string
     */
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    /**
     * Performing manual transformation
     * this is been used to perform transformation manually, where the rectangle
     * points will be choosen by user in the captured image displaying in the dialog window.
     * In the dialog window, there are four circles are being used to select points.
     * Based on the selected points, the transformation will be performed here.
     */
    DialogContent.prototype.performManualCorrection = function () {
        var pointsCount = 0;
        this.points.forEach(function (point) {
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
        var point0Y = (+this.points[0].y - this.circleRadius);
        var point1Y = (+this.points[1].y - this.circleRadius);
        var rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
            + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
            + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
            + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
        this.imageSourceOld = this.imageSource;
        this.imageSource = OpenCVWrapper.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this.imageActualSize.width + '-' + this.imageActualSize.height);
        console.log('Manual PT :', this.imageSource);
        // SendBroadcastImage(this.imageSource);
        // setTimeout(() => {
        //     this.transformedImageProvider.deleteFile(this.imageSourceOld);
        // }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.removeCircles();
        // // this.pointsCounter = 0;
        // this.transformedImageProvider.DeleteFiles();
    };
    // /**
    //  * Gets rectangle points.
    //  * 
    //  * @param event Gesture event data
    //  */
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
    /**
     * Show original image, is being used to show original captured image
     * when the 'Manual' button is been pressed, this is where user can select desired points
     * and perform manual transformation. It is also intializing circle points to be displayed
     * in the original image.
     */
    DialogContent.prototype.showOriginalImage = function () {
        this.isAutoCorrection = false;
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText(this.locale.transform('rectangle_points_info'), 'long').show();
        }
        this.manualBtnText = LABLE_PERFORM;
        // this.manualPerformBtnLable = this.locale.transform('perform');
        this.pointsCounter = 0;
        this.addCircles();
    };
    /**
     * On pinch method, is being called while pinch event fired on image,
     * where the new scale, width & height of the transformed image have been calculated
     * to zoom-in/out.
     * @param args PinchGesture event data
     */
    DialogContent.prototype.onPinch = function (args) {
        if (this.manualBtnText !== LABLE_PERFORM) {
            if (args.state === 1) {
                // let newOriginX = args.getFocusX() - this.imgView.translateX;
                // let newOriginY = args.getFocusY() - this.imgView.translateY;
                // let oldOriginX = this.imgView.originX * this.imgView.getMeasuredWidth();
                // let oldOriginY = this.imgView.originY * this.imgView.getMeasuredHeight();
                this.startScale = this.imgView.scaleX;
            }
            else if (args.scale && args.scale !== 1) {
                this.newScale = this.startScale * args.scale;
                this.newScale = Math.min(8, this.newScale);
                this.newScale = Math.max(0.125, this.newScale);
                this.imgView.scaleX = this.newScale;
                this.imgView.scaleY = this.newScale;
                this.imgView.width = this.imgView.getMeasuredWidth() * this.newScale;
                this.imgView.height = this.imgView.getMeasuredHeight() * this.newScale;
            }
        }
    };
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGesture event data
     */
    DialogContent.prototype.onPan = function (args) {
        var screenLocation = this.imgView.getLocationOnScreen();
        if (this.manualBtnText !== LABLE_PERFORM) {
            var centerPointX = (this.imgView.getMeasuredWidth() / 4) * (this.newScale);
            var centerPointY = (this.imgView.getMeasuredHeight() / 4) * (this.newScale);
            var imageViewWidth = this.imgView.getMeasuredWidth() * this.imgView.originX;
            var imageViewHeight = this.imgView.getMeasuredHeight() * this.imgView.originY;
            if (args.state === 1) {
                this.prevDeltaX = 0;
                this.prevDeltaY = 0;
            }
            else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);
                // let screenLocation = this.imgView.getLocationOnScreen();
                if (!this.isGotDefaultLocation) {
                    this.defaultScreenLocation = screenLocation;
                    this.isGotDefaultLocation = true;
                }
                if (this.newScale > 1) {
                    if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)) {
                        this.imgView.translateX += args.deltaX - this.prevDeltaX;
                        this.oldTranslateX = this.imgView.translateX;
                    }
                    else {
                        if (this.oldTranslateX > 0) {
                            this.oldTranslateX--;
                        }
                        else {
                            this.oldTranslateX++;
                        }
                        this.imgView.translateX = this.oldTranslateX;
                    }
                    if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)) {
                        this.imgView.translateY += args.deltaY - this.prevDeltaY;
                        this.oldTranslateY = this.imgView.translateY;
                    }
                    else {
                        if (this.oldTranslateY > 0) {
                            this.oldTranslateY--;
                        }
                        else {
                            this.oldTranslateY++;
                        }
                        this.imgView.translateY = this.oldTranslateY;
                    }
                }
                this.prevDeltaX = args.deltaX;
                this.prevDeltaY = args.deltaY;
            }
        }
    };
    /**
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     */
    DialogContent.prototype.onDoubleTap = function () {
        if (this.manualBtnText !== LABLE_PERFORM) {
            this.imgView.animate({
                translate: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
                curve: 'easeOut',
                duration: 10,
            });
            this.newScale = 1;
            this.oldTranslateY = 0;
            this.oldTranslateX = 0;
        }
        else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    };
    /**
     * Page loaded method which is been called when dialog window is loaded,
     * where all the necessary values for the image to be displayed in the window
     * have been initialized, like transformedImageSource, originalImageSource &
     * rectangle points.
     *
     * @param args Page loaded event data
     */
    DialogContent.prototype.pageLoaded = function (args) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        var recPointsStrTemp = this.params.context.rectanglePoints;
        this.rectanglePoints = recPointsStrTemp.split('#');
        this.rectanglePoints.shift(); // remove first element
        this.rectanglePoints.pop(); // remove last element
        var page = args.object;
        this.imgView = page.getViewById('imgViewId');
        this.imgGridId = page.getViewById('imgGridId');
        this.imgView.translateX = 0;
        this.imgView.translateY = 0;
        this.imgView.scaleX = 1;
        this.imgView.scaleY = 1;
        orientation.setOrientation('portrait');
    };
    /**
     * Add circles method adds circle points btn in original image.
     */
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this.circleBtnList.forEach(function (btn) {
            _this.imgGridId.addChild(btn);
        });
    };
    /**
     * Remove circles removes circle points btn from original image.
     */
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
    };
    /**
     * Initialize circle points based on the receieved rectangle points and
     * image's width & height.
     */
    DialogContent.prototype.initPoints = function () {
        var _this = this;
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        var scale = platform.screen.mainScreen.scale;
        this.imageActualSize = this.imgView.getActualSize();
        this.centerPointX = (this.imgGridId.getMeasuredWidth() / 2) / scale;
        this.centerPointY = (this.imgGridId.getMeasuredHeight() / 2) / scale;
        var actualPoint = {};
        if (this.rectanglePoints.length > 0) {
            var pointIndex_1 = 1;
            this.rectanglePoints.forEach(function (point) {
                var points = point.split('%');
                var bottomCircleRadius = _this.circleRadius;
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
                if (pointIndex_1++ > 2) {
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
                    x: (+points[0]) * (_this.imgGridId.getMeasuredWidth() / scale),
                    y: ((+points[1]) * (_this.imgGridId.getMeasuredHeight() / scale)) + bottomCircleRadius, id: _this.pointsCounter,
                };
                _this.createCircle(actualPoint);
            });
        }
        else {
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
    };
    /**
     * This method creates circle points button on original image view
     * based on the points receieved via actualPoint and also takes
     * care of boundary checking while diplaying it.
     *
     * @param actualPoint Contains circle points(x,y)
     */
    DialogContent.prototype.createCircle = function (actualPoint) {
        var _this = this;
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        var actualPointDeltaX = (this.imageActualSize.width / 2) - this.imageActualSize.width;
        var actualPointDeltaY = (this.imageActualSize.height / 2) - this.imageActualSize.height;
        var formattedString = new formattedStringModule.FormattedString();
        var iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add('fa');
        iconSpan.cssClasses.add('circle-plus');
        iconSpan.text = String.fromCharCode(0xf067);
        formattedString.spans.push(iconSpan);
        var circleBtn = new buttons.Button();
        circleBtn.cssClasses.add('circle');
        circleBtn.id = this.pointsCounter++;
        circleBtn.formattedText = formattedString;
        circleBtn.on('pan', function (args) {
            if (args.state === 1) {
                _this.prevDeltaX = 0;
                _this.prevDeltaY = 0;
                if (_this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += -15;
                    circleBtn.translateY += -30;
                }
                else {
                    if (circleBtn.translateX < 0) {
                        circleBtn.translateX += +10;
                    }
                    else {
                        circleBtn.translateX += -10;
                    }
                    if (circleBtn.translateY < 0) {
                        circleBtn.translateY += +10;
                    }
                    else {
                        circleBtn.translateY += -10;
                    }
                }
            }
            else if (args.state === 2) {
                if (_this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += args.deltaX - _this.prevDeltaX;
                    circleBtn.translateY += args.deltaY - _this.prevDeltaY;
                    _this.points.forEach(function (point) {
                        if (point) {
                            if (point.id === circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    });
                    _this.prevDeltaX = args.deltaX;
                    _this.prevDeltaY = args.deltaY;
                }
            }
            else if (args.state === 3) {
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
    };
    /**
     * Checks the image that it is within the image view boundary or not.
     *
     * @param translateX Image translateX
     * @param translateY Image translateY
     */
    DialogContent.prototype.checkBoundary = function (translateX, translateY) {
        var pointAdjustment = 5; // Need to adjust the center point value to check the boundary
        if (translateX < (this.centerPointX - pointAdjustment) &&
            translateY < (this.centerPointY - pointAdjustment) &&
            (translateX * -1) < (this.centerPointX - pointAdjustment) &&
            (translateY * -1) < (this.centerPointY - pointAdjustment)) {
            return true;
        }
        else {
            return false;
        }
    };
    return DialogContent;
}());
DialogContent = __decorate([
    core_1.Component({
        selector: 'modal-content',
        moduleId: module.id,
        styleUrls: ['./dialog.component.css'],
        templateUrl: './dialog.component.html',
    }),
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object, angular_1.L])
], DialogContent);
exports.DialogContent = DialogContent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWFsb2cuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEwQztBQUMxQyxrRUFBc0U7QUFJdEUsb0ZBQXNHO0FBRXRHLHVEQUFzRDtBQUN0RCxxREFBOEM7QUFFOUMsc0RBQXdEO0FBQ3hELDBDQUE0QztBQUM1QyxvREFBc0Q7QUFDdEQsOEVBQWdGO0FBQ2hGLG9EQUFzRDtBQUV0RCx3REFBd0Q7QUFFeEQsOEJBQThCO0FBQzlCLElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM5QiwrQkFBK0I7QUFDL0IsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBRWhDOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBaUR0QixxQ0FBcUM7SUFDckMsc0NBQXNDO0lBQ3RDLGlDQUFpQztJQUNqQyxrREFBa0Q7SUFFbEQsMENBQTBDO0lBRTFDOzs7OztPQUtHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ2pDLHdCQUFrRCxFQUNsRCxNQUFvQixFQUNwQixNQUFTO1FBSEQsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFDakMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUE1RHJCLDBFQUEwRTtRQUNuRSxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUF1QmhDLHdDQUF3QztRQUNoQyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBS3ZCLHVEQUF1RDtRQUMvQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLHdEQUF3RDtRQUNoRCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsc0ZBQXNGO1FBQzlFLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUtyQyxnRUFBZ0U7UUFDeEQsaUJB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QUFDO1FBQ3JDLFdBQVcsRUFBRSx5QkFBeUI7S0FDekMsQ0FBQztxQ0ErRDhCLGdDQUFpQixzQkFDUCxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQWpFWixhQUFhLENBb2dCekI7QUFwZ0JZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1BhcmFtcyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy90aW1lcic7XG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcblxuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuXG5pbXBvcnQgKiBhcyBvcmllbnRhdGlvbiBmcm9tICduYXRpdmVzY3JpcHQtb3JpZW50YXRpb24nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvcGxhdGZvcm0nO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVkU3RyaW5nTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGV4dC9mb3JtYXR0ZWQtc3RyaW5nJztcbmltcG9ydCAqIGFzIGJ1dHRvbnMgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9idXR0b24nO1xuXG4vLyBpbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuXG4vKiogTGFibGUgZm9yICdNYW51YWwnIHRleHQgKi9cbmNvbnN0IExBQkxFX01BTlVBTCA9ICdNYW51YWwnO1xuLyoqIExhYmxlIGZvciAnUGVyZm9ybScgdGV4dCAqL1xuY29uc3QgTEFCTEVfUEVSRk9STSA9ICdQZXJmb3JtJztcblxuLyoqXG4gKiBEaWFsb2cgY29udGVudCBjbGFzcy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdtb2RhbC1jb250ZW50JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2RpYWxvZy5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRlbnQge1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBhbnk7XG4gICAgLyoqIE9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJ1ZS9mYWxzZSB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uIGF1dG9tYXRpY2FsbHkgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgLyoqIENvbnRhaW5zIGJ1dHRvbiBsYWJlbCBuYW1lIGVpdGhlciAnTWFudWFsJy8gJ1BlcmZvcm0nICovXG4gICAgcHVibGljIG1hbnVhbEJ0blRleHQ6IHN0cmluZztcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBmb3VyIHBvaW50cyBvZiB0aGUgaW1hZ2VzLiAqL1xuICAgIHByaXZhdGUgcG9pbnRzOiBhbnk7XG4gICAgLyoqIEluZGljYXRlcyB0aGUgbnVtYmVyIG9mIHBvaW50cy4gKi9cbiAgICBwcml2YXRlIHBvaW50c0NvdW50ZXI6IG51bWJlcjtcbiAgICAvKiogU3RvcmVzIHByZXZpb3VzIG9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwcml2YXRlIGltYWdlU291cmNlT3JnT2xkOiBhbnk7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyB0cmFuc2Zvcm1lZCBpbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9sZDogYW55O1xuICAgIC8qKiBDb250YWlucyB0cmFuc2Zvcm1lZCBpbWFnZSBhY3R1YWwgc2l6ZS4gKi9cbiAgICBwcml2YXRlIGltYWdlQWN0dWFsU2l6ZTogYW55O1xuICAgIC8qKiBMaXN0IG9mIGNpcmNsZSBidXR0b25zICovXG4gICAgcHJpdmF0ZSBjaXJjbGVCdG5MaXN0OiBhbnk7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgaW1nVmlldzogYW55O1xuICAgIC8qKiBJbWFnZSBncmlkIGlkLiAqL1xuICAgIHByaXZhdGUgaW1nR3JpZElkOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWC4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVg6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgcHJldmlvdXMgZGVsdGFZLiAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWTogbnVtYmVyO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzdGFydGluZyBzY2FsZS4gKi9cbiAgICBwcml2YXRlIHN0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRYLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRYOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIGNlbnRlciBwb2ludFkuICovXG4gICAgcHJpdmF0ZSBjZW50ZXJQb2ludFk6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgbmV3IHNjYWxlIHdoaWxlIG1vdmluZyBhcm91bmQuICovXG4gICAgcHJpdmF0ZSBuZXdTY2FsZSA9IDE7XG4gICAgLyoqIFN0b3JlcyBvbGQgVHJhbnNsYXRlWCB2YWx1ZSBvZiB0cmFuc2Zvcm1lZCBJbWFnZS4gKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIC8qKiBTdG9yZXMgb2xkIHRyYW5zbGF0ZVkgdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVZID0gMDtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90LiAqL1xuICAgIHByaXZhdGUgaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogU3RvcmVzIHRyYW5zZm9ybWVkIGltYWdlJ3Mgc2NyZWVuIGxvY2F0aW9uLiAqL1xuICAgIHByaXZhdGUgZGVmYXVsdFNjcmVlbkxvY2F0aW9uOiBhbnk7XG4gICAgLyoqIFN0b3JlcyByZWN0YW5nbGUgcG9pbnRzIHRvIGJlIHVzZWQgaW4gdGhlIE9wZW5DViBBUEkgY2FsbC4gKi9cbiAgICBwcml2YXRlIHJlY3RhbmdsZVBvaW50czogYW55O1xuICAgIC8qKiBUbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWUgKi9cbiAgICBwcml2YXRlIGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgIC8qKiBMYWJsZSBmb3IgTWFudWEvUGVyZm9ybSBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIG1hbnVhbFBlcmZvcm1CdG5MYWJsZTogYW55O1xuICAgIC8vIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8vIEBWaWV3Q2hpbGQoJ2ltZ1ZpZXdJZCcpIF9kcmFnSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICAvLyBwcml2YXRlIHBvaW50cyA9IG5ldyBPYnNlcnZhYmxlQXJyYXkoKTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBEaWFsb2dDb250ZW50IGNsYXNzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBwYXJhbXMgY29udGFpbnMgY2FwdHVyZWQgaW1hZ2UgZmlsZSBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgdHJhbnNmb3JtZWQgaW1hZ2UgcHJvdmlkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmFtczogTW9kYWxEaWFsb2dQYXJhbXMsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgIHByaXZhdGUgbG9jYWxlOiBMKSB7XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9IExBQkxFX01BTlVBTDtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QgPSBbXTtcbiAgICAgICAgLy8gdGhpcy5fZHJhZ0ltYWdlSXRlbSA9IDxJbWFnZT50aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xvc2UgbWV0aG9kLCB3aGljaCBjbG9zZSB0aGUgZGlhbG9nIHdpbmRvdyBvcGVuZWQgYWZ0ZXIgY2FwdHVyZWQgaW1hZ2UgZnJvbSBjYW1lcmEuXG4gICAgICogQW5kIHJldHVybnMgYmFjayB0byB0aGUgcGxhY2Ugd2hlcmUgdGhlIGRpYWxvZyB3aW5kb3cgZ290IHRyaWdnZXJlZCwgYWxvbmcgd2l0aCBcbiAgICAgKiB0aGUgcGFyYW1ldGVyICdyZXN1bHQnXG4gICAgICogQHBhcmFtIHJlc3VsdCBXaGljaCBpcyBub3RoaW5nIGJ1dCBlbXB0eSBzdHJpbmcgb3IgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIHN0cmluZ1xuICAgICAqL1xuICAgIGNsb3NlKHJlc3VsdDogc3RyaW5nKSB7XG4gICAgICAgIG9yaWVudGF0aW9uLmVuYWJsZVJvdGF0aW9uKCk7XG4gICAgICAgIHRoaXMucGFyYW1zLmNsb3NlQ2FsbGJhY2socmVzdWx0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyZm9ybWluZyBtYW51YWwgdHJhbnNmb3JtYXRpb25cbiAgICAgKiB0aGlzIGlzIGJlZW4gdXNlZCB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uIG1hbnVhbGx5LCB3aGVyZSB0aGUgcmVjdGFuZ2xlXG4gICAgICogcG9pbnRzIHdpbGwgYmUgY2hvb3NlbiBieSB1c2VyIGluIHRoZSBjYXB0dXJlZCBpbWFnZSBkaXNwbGF5aW5nIGluIHRoZSBkaWFsb2cgd2luZG93LlxuICAgICAqIEluIHRoZSBkaWFsb2cgd2luZG93LCB0aGVyZSBhcmUgZm91ciBjaXJjbGVzIGFyZSBiZWluZyB1c2VkIHRvIHNlbGVjdCBwb2ludHMuXG4gICAgICogQmFzZWQgb24gdGhlIHNlbGVjdGVkIHBvaW50cywgdGhlIHRyYW5zZm9ybWF0aW9uIHdpbGwgYmUgcGVyZm9ybWVkIGhlcmUuXG4gICAgICovXG4gICAgcGVyZm9ybU1hbnVhbENvcnJlY3Rpb24oKSB7XG4gICAgICAgIGxldCBwb2ludHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgIHBvaW50c0NvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRvIGdldCBhY2N1cmF0ZSBwb3NpdGlvbiwgbmVlZCB0byBhZGp1c3QgdGhlIHJhZGl1cyB2YWx1ZTtcbiAgICAgICAgLy8gY29uc3QgY2lyY2xlUmFkaXVzID0gMTc7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzBdLnkgPSArdGhpcy5wb2ludHNbMF0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMV0ueSA9ICt0aGlzLnBvaW50c1sxXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1syXS55ID0gK3RoaXMucG9pbnRzWzJdLnkgKyBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzNdLnkgPSArdGhpcy5wb2ludHNbM10ueSArIGNpcmNsZVJhZGl1cztcblxuICAgICAgICBjb25zdCBwb2ludDBZID0gKCt0aGlzLnBvaW50c1swXS55IC0gdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICBjb25zdCBwb2ludDFZID0gKCt0aGlzLnBvaW50c1sxXS55IC0gdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHMgPSB0aGlzLnBvaW50c1swXS54ICsgJy0nICsgKChwb2ludDBZIDwgMCkgPyAwIDogcG9pbnQwWSkgKyAnIydcbiAgICAgICAgICAgICsgdGhpcy5wb2ludHNbMV0ueCArICctJyArICgocG9pbnQxWSA8IDApID8gMCA6IHBvaW50MVkpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzJdLnggKyAnLScgKyAoK3RoaXMucG9pbnRzWzJdLnkgKyB0aGlzLmNpcmNsZVJhZGl1cykgKyAnIydcbiAgICAgICAgICAgICsgdGhpcy5wb2ludHNbM10ueCArICctJyArICgrdGhpcy5wb2ludHNbM10ueSArIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9sZCA9IHRoaXMuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBPcGVuQ1ZXcmFwcGVyLnBlcmZvcm1QZXJzcGVjdGl2ZUNvcnJlY3Rpb25NYW51YWwodGhpcy5pbWFnZVNvdXJjZU9yZywgcmVjdGFuZ2xlUG9pbnRzLFxuICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggKyAnLScgKyB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuICAgICAgICBjb25zb2xlLmxvZygnTWFudWFsIFBUIDonLCB0aGlzLmltYWdlU291cmNlKTtcbiAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1hZ2VTb3VyY2UpO1xuICAgICAgICAvLyBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmRlbGV0ZUZpbGUodGhpcy5pbWFnZVNvdXJjZU9sZCk7XG4gICAgICAgIC8vIH0sIDEwMDApO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5pbWFnZVNvdXJjZU9yZ09sZDtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfTUFOVUFMO1xuICAgICAgICAvLyB0aGlzLm1hbnVhbFBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAvLyAvLyB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICAvLyB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5EZWxldGVGaWxlcygpO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIHJlY3RhbmdsZSBwb2ludHMuXG4gICAgLy8gICogXG4gICAgLy8gICogQHBhcmFtIGV2ZW50IEdlc3R1cmUgZXZlbnQgZGF0YVxuICAgIC8vICAqL1xuICAgIC8vIGdldFBvaW50cyhldmVudDogR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgIC8vICAgICB0cnkge1xuICAgIC8vICAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCA9PT0gTEFCTEVfUEVSRk9STSkge1xuICAgIC8vICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAvLyAgICAgICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAvLyAgICAgICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRYKCkgLyBzY2FsZTtcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFkoKSAvIHNjYWxlO1xuXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgYWN0dWFsUG9pbnQgPSB7IHg6IHBvaW50WCwgeTogcG9pbnRZLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG5cbiAgICAvLyAgICAgICAgICAgICBpZiAodGhpcy5wb2ludHMubGVuZ3RoID49IDQpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1BsZWFzZSBzZWxlY3Qgb25seSBmb3VyIHBvaW50cy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZCh0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCkpO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBjYWxsaW5nIGdldFBvaW50cygpLiAnICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG9yaWdpbmFsIGltYWdlLCBpcyBiZWluZyB1c2VkIHRvIHNob3cgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiB3aGVuIHRoZSAnTWFudWFsJyBidXR0b24gaXMgYmVlbiBwcmVzc2VkLCB0aGlzIGlzIHdoZXJlIHVzZXIgY2FuIHNlbGVjdCBkZXNpcmVkIHBvaW50c1xuICAgICAqIGFuZCBwZXJmb3JtIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbi4gSXQgaXMgYWxzbyBpbnRpYWxpemluZyBjaXJjbGUgcG9pbnRzIHRvIGJlIGRpc3BsYXllZFxuICAgICAqIGluIHRoZSBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBzaG93T3JpZ2luYWxJbWFnZSgpIHtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Eb3VibGVUYXAoKTtcbiAgICAgICAgaWYgKHRoaXMuY2lyY2xlQnRuTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZWN0YW5nbGVfcG9pbnRzX2luZm8nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfUEVSRk9STTtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gTEFCTEVfUEVSRk9STSkge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWTtcblxuICAgICAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5YID0gdGhpcy5pbWdWaWV3Lm9yaWdpblggKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2NhbGUgPSB0aGlzLmltZ1ZpZXcuc2NhbGVYO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gTWF0aC5taW4oOCwgdGhpcy5uZXdTY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLm5ld1NjYWxlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy53aWR0aCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5oZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhbkdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5YO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLmltZ1ZpZXcub3JpZ2luWTtcblxuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEb3VibGUgdGFwIG1ldGhvZCBmaXJlcyBvbiB3aGVuIHVzZXIgdGFwcyB0d28gdGltZXMgb24gdHJhbnNmb3JtZWQgaW1hZ2UuIFxuICAgICAqIEFjdHVhbGx5IGl0IGJyaW5ncyB0aGUgaW1hZ2UgdG8gaXQncyBvcmlnaW5hbCBwb3NpdGlvbnMgYW5kIGFsc28gYWRkcyBcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKCkge1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gZGlhbG9nIHdpbmRvdyBpcyBsb2FkZWQsXG4gICAgICogd2hlcmUgYWxsIHRoZSBuZWNlc3NhcnkgdmFsdWVzIGZvciB0aGUgaW1hZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB3aW5kb3dcbiAgICAgKiBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQsIGxpa2UgdHJhbnNmb3JtZWRJbWFnZVNvdXJjZSwgb3JpZ2luYWxJbWFnZVNvdXJjZSAmXG4gICAgICogcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQYWdlIGxvYWRlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzOiB7IG9iamVjdDogYW55OyB9KSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZ09sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmc7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRoaXMucGFyYW1zLmNvbnRleHQuaXNBdXRvQ29ycmVjdGlvbjtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIGNvbnN0IHJlY1BvaW50c1N0clRlbXAgPSB0aGlzLnBhcmFtcy5jb250ZXh0LnJlY3RhbmdsZVBvaW50cztcblxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cyA9IHJlY1BvaW50c1N0clRlbXAuc3BsaXQoJyMnKTtcbiAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMuc2hpZnQoKTsgLy8gcmVtb3ZlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMucG9wKCk7IC8vIHJlbW92ZSBsYXN0IGVsZW1lbnRcbiAgICAgICAgY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLmltZ1ZpZXcgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWdWaWV3SWQnKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWdHcmlkSWQnKTtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLmltZ1ZpZXcuc2NhbGVZID0gMTtcbiAgICAgICAgb3JpZW50YXRpb24uc2V0T3JpZW50YXRpb24oJ3BvcnRyYWl0Jyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBjaXJjbGVzIG1ldGhvZCBhZGRzIGNpcmNsZSBwb2ludHMgYnRuIGluIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkQ2lyY2xlcygpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LmZvckVhY2goKGJ0bjogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZChidG4pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNpcmNsZXMgcmVtb3ZlcyBjaXJjbGUgcG9pbnRzIGJ0biBmcm9tIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlQ2lyY2xlcygpIHtcbiAgICAgICAgY29uc3QgaW1nRWxlbWVudCA9IHRoaXMuaW1nR3JpZElkLmdldENoaWxkQXQoMCk7XG4gICAgICAgIHRoaXMuaW1nR3JpZElkLnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGltZ0VsZW1lbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGNpcmNsZSBwb2ludHMgYmFzZWQgb24gdGhlIHJlY2VpZXZlZCByZWN0YW5nbGUgcG9pbnRzIGFuZFxuICAgICAqIGltYWdlJ3Mgd2lkdGggJiBoZWlnaHQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbml0UG9pbnRzKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QgPSBbXTtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVuc2l0eSBvZiB5b3VyIHNjcmVlbiwgc28gd2UgY2FuIGRpdmlkZSB0aGUgbWVhc3VyZWQgd2lkdGgvaGVpZ2h0IGJ5IGl0LlxuICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUgPSB0aGlzLmltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgICAgICB0aGlzLmNlbnRlclBvaW50WCA9ICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyAyKSAvIHNjYWxlO1xuICAgICAgICB0aGlzLmNlbnRlclBvaW50WSA9ICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gMikgLyBzY2FsZTtcblxuICAgICAgICBsZXQgYWN0dWFsUG9pbnQgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMucmVjdGFuZ2xlUG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBwb2ludEluZGV4ID0gMTtcbiAgICAgICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRzID0gcG9pbnQuc3BsaXQoJyUnKTtcbiAgICAgICAgICAgICAgICBsZXQgYm90dG9tQ2lyY2xlUmFkaXVzID0gdGhpcy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlggPSAwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludERpZmZZID0gMDtcbiAgICAgICAgICAgICAgICAvLyBpZiAocG9pbnRJbmRleCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDMpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IDEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBpZiAocG9pbnRJbmRleCsrID4gMikgeyAvLyBGb3IgY2hlY2tpbmcgYm90dG9uIHBvaW50c1xuICAgICAgICAgICAgICAgICAgICBib3R0b21DaXJjbGVSYWRpdXMgPSBib3R0b21DaXJjbGVSYWRpdXMgKiAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgdG9wTGVmdC54ID0gdG9wTGVmdC54IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wTGVmdC55ID0gdG9wTGVmdC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wUmlnaHQueCA9IHRvcFJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC55ID0gdG9wUmlnaHQueSAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVJpZ2h0LnggPSBib3R0b21SaWdodC54ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueSA9IGJvdHRvbVJpZ2h0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnggPSBib3R0b21MZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnkgPSBib3R0b21MZWZ0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgYWN0dWFsUG9pbnQgPSB7IHg6ICgrcG9pbnRzWzBdICsgcG9pbnREaWZmWCkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpLFxuICAgICAgICAgICAgICAgIC8vIHk6ICgoK3BvaW50c1sxXStwb2ludERpZmZZKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKVxuICAgICAgICAgICAgICAgIC8vICsgY2lyY2xlUmFkaXVzLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6ICgrcG9pbnRzWzBdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgICAgIHk6ICgoK3BvaW50c1sxXSkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIHNjYWxlKSkgKyBib3R0b21DaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IDAsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiAwLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcblxuICAgICAgICAgICAgLy8gICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGNpcmNsZSBwb2ludHMgYnV0dG9uIG9uIG9yaWdpbmFsIGltYWdlIHZpZXdcbiAgICAgKiBiYXNlZCBvbiB0aGUgcG9pbnRzIHJlY2VpZXZlZCB2aWEgYWN0dWFsUG9pbnQgYW5kIGFsc28gdGFrZXNcbiAgICAgKiBjYXJlIG9mIGJvdW5kYXJ5IGNoZWNraW5nIHdoaWxlIGRpcGxheWluZyBpdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYWN0dWFsUG9pbnQgQ29udGFpbnMgY2lyY2xlIHBvaW50cyh4LHkpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQ6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVggPSAodGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoO1xuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWSA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMucG9pbnRzQ291bnRlcisrO1xuICAgICAgICBjaXJjbGVCdG4uZm9ybWF0dGVkVGV4dCA9IGZvcm1hdHRlZFN0cmluZztcbiAgICAgICAgY2lyY2xlQnRuLm9uKCdwYW4nLCAoYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PT0gY2lyY2xlQnRuLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnggPSBjaXJjbGVCdG4udHJhbnNsYXRlWCAtIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC55ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVkgLSBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludC54ICsgYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnQueSArIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWCAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKiAtMSkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WSAqIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LnB1c2goY2lyY2xlQnRuKTtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChhY3R1YWxQb2ludCk7XG4gICAgICAgIHJldHVybiBjaXJjbGVCdG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0aGUgaW1hZ2UgdGhhdCBpdCBpcyB3aXRoaW4gdGhlIGltYWdlIHZpZXcgYm91bmRhcnkgb3Igbm90LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVYIEltYWdlIHRyYW5zbGF0ZVhcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWSBJbWFnZSB0cmFuc2xhdGVZXG4gICAgICovXG4gICAgcHJpdmF0ZSBjaGVja0JvdW5kYXJ5KHRyYW5zbGF0ZVg6IGFueSwgdHJhbnNsYXRlWTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgcG9pbnRBZGp1c3RtZW50ID0gNTsgLy8gTmVlZCB0byBhZGp1c3QgdGhlIGNlbnRlciBwb2ludCB2YWx1ZSB0byBjaGVjayB0aGUgYm91bmRhcnlcbiAgICAgICAgaWYgKHRyYW5zbGF0ZVggPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICB0cmFuc2xhdGVZIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVggKiAtMSkgPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWSAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=