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
var timer_1 = require("tns-core-modules/timer");
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
        var _this = this;
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
        timer_1.setTimeout(function () {
            _this.transformedImageProvider.deleteFile(_this.imageSourceOld);
        }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.removeCircles();
        // // this.pointsCounter = 0;
        // this.transformedImageProvider.DeleteFiles();
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWFsb2cuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEwQztBQUMxQyxrRUFBc0U7QUFDdEUsZ0RBQW9EO0FBR3BELG9GQUFzRztBQUV0Ryx1REFBc0Q7QUFDdEQscURBQThDO0FBRTlDLHNEQUF3RDtBQUN4RCwwQ0FBNEM7QUFDNUMsb0RBQXNEO0FBQ3RELDhFQUFnRjtBQUNoRixvREFBc0Q7QUFFdEQsd0RBQXdEO0FBRXhELDhCQUE4QjtBQUM5QixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUM7QUFDOUIsK0JBQStCO0FBQy9CLElBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQztBQUVoQzs7R0FFRztBQU9ILElBQWEsYUFBYTtJQWlEdEIscUNBQXFDO0lBQ3JDLHNDQUFzQztJQUN0QyxpQ0FBaUM7SUFDakMsa0RBQWtEO0lBRWxELDBDQUEwQztJQUUxQzs7Ozs7T0FLRztJQUNILHVCQUFvQixNQUF5QixFQUN6Qix3QkFBa0QsRUFDbEQsTUFBb0IsRUFDcEIsTUFBUztRQUhULFdBQU0sR0FBTixNQUFNLENBQW1CO1FBQ3pCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixXQUFNLEdBQU4sTUFBTSxDQUFHO1FBNUQ3QiwwRUFBMEU7UUFDbkUscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBdUJoQyx3Q0FBd0M7UUFDaEMsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUt2Qix1REFBdUQ7UUFDL0MsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNyQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsd0RBQXdEO1FBQ2hELGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLHNGQUFzRjtRQUM5RSx5QkFBb0IsR0FBRyxLQUFLLENBQUM7UUFLckMsZ0VB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S0FDekMsQ0FBQztxQ0ErRDhCLGdDQUFpQixzQkFDQyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQWpFcEIsYUFBYSxDQWtnQnpCO0FBbGdCWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dQYXJhbXMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGltZXInO1xuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuaW1wb3J0ICogYXMgb3JpZW50YXRpb24gZnJvbSAnbmF0aXZlc2NyaXB0LW9yaWVudGF0aW9uJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3BsYXRmb3JtJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlZFN0cmluZ01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RleHQvZm9ybWF0dGVkLXN0cmluZyc7XG5pbXBvcnQgKiBhcyBidXR0b25zIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvYnV0dG9uJztcblxuLy8gaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcblxuLyoqIExhYmxlIGZvciAnTWFudWFsJyB0ZXh0ICovXG5jb25zdCBMQUJMRV9NQU5VQUwgPSAnTWFudWFsJztcbi8qKiBMYWJsZSBmb3IgJ1BlcmZvcm0nIHRleHQgKi9cbmNvbnN0IExBQkxFX1BFUkZPUk0gPSAnUGVyZm9ybSc7XG5cbi8qKlxuICogRGlhbG9nIGNvbnRlbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbW9kYWwtY29udGVudCcsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9kaWFsb2cuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50IHtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRydWUvZmFsc2UgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBhdXRvbWF0aWNhbGx5IG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBidXR0b24gbGFiZWwgbmFtZSBlaXRoZXIgJ01hbnVhbCcvICdQZXJmb3JtJyAqL1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgZm91ciBwb2ludHMgb2YgdGhlIGltYWdlcy4gKi9cbiAgICBwcml2YXRlIHBvaW50czogYW55O1xuICAgIC8qKiBJbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwb2ludHMuICovXG4gICAgcHJpdmF0ZSBwb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyBvcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9yZ09sZDogYW55O1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgdHJhbnNmb3JtZWQgaW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2VPbGQ6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJhbnNmb3JtZWQgaW1hZ2UgYWN0dWFsIHNpemUuICovXG4gICAgcHJpdmF0ZSBpbWFnZUFjdHVhbFNpemU6IGFueTtcbiAgICAvKiogTGlzdCBvZiBjaXJjbGUgYnV0dG9ucyAqL1xuICAgIHByaXZhdGUgY2lyY2xlQnRuTGlzdDogYW55O1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIGltZ1ZpZXc6IGFueTtcbiAgICAvKiogSW1hZ2UgZ3JpZCBpZC4gKi9cbiAgICBwcml2YXRlIGltZ0dyaWRJZDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVguICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWS4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc3RhcnRpbmcgc2NhbGUuICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WC4gKi9cbiAgICBwcml2YXRlIGNlbnRlclBvaW50WDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRZLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRZOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIG5ldyBzY2FsZSB3aGlsZSBtb3ZpbmcgYXJvdW5kLiAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBTdG9yZXMgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogU3RvcmVzIG9sZCB0cmFuc2xhdGVZIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdC4gKi9cbiAgICBwcml2YXRlIGlzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSdzIHNjcmVlbiBsb2NhdGlvbi4gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIC8qKiBTdG9yZXMgcmVjdGFuZ2xlIHBvaW50cyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQ1YgQVBJIGNhbGwuICovXG4gICAgcHJpdmF0ZSByZWN0YW5nbGVQb2ludHM6IGFueTtcbiAgICAvKiogVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlICovXG4gICAgcHJpdmF0ZSBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAvKiogTGFibGUgZm9yIE1hbnVhL1BlcmZvcm0gYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSBtYW51YWxQZXJmb3JtQnRuTGFibGU6IGFueTtcbiAgICAvLyBwcml2YXRlIF9kcmFnSW1hZ2VJdGVtOiBJbWFnZTtcbiAgICAvLyBAVmlld0NoaWxkKCdpbWdWaWV3SWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgLy8gcHJpdmF0ZSBwb2ludHMgPSBuZXcgT2JzZXJ2YWJsZUFycmF5KCk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgRGlhbG9nQ29udGVudCBjbGFzcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGFyYW1zIGNvbnRhaW5zIGNhcHR1cmVkIGltYWdlIGZpbGUgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHRyYW5zZm9ybWVkIGltYWdlIHByb3ZpZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGxvY2FsZTogTCkge1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSBMQUJMRV9NQU5VQUw7XG4gICAgICAgIC8vIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdtYW51YWwnKTtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSA8SW1hZ2U+dGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsb3NlIG1ldGhvZCwgd2hpY2ggY2xvc2UgdGhlIGRpYWxvZyB3aW5kb3cgb3BlbmVkIGFmdGVyIGNhcHR1cmVkIGltYWdlIGZyb20gY2FtZXJhLlxuICAgICAqIEFuZCByZXR1cm5zIGJhY2sgdG8gdGhlIHBsYWNlIHdoZXJlIHRoZSBkaWFsb2cgd2luZG93IGdvdCB0cmlnZ2VyZWQsIGFsb25nIHdpdGggXG4gICAgICogdGhlIHBhcmFtZXRlciAncmVzdWx0J1xuICAgICAqIEBwYXJhbSByZXN1bHQgV2hpY2ggaXMgbm90aGluZyBidXQgZW1wdHkgc3RyaW5nIG9yIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBzdHJpbmdcbiAgICAgKi9cbiAgICBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1pbmcgbWFudWFsIHRyYW5zZm9ybWF0aW9uXG4gICAgICogdGhpcyBpcyBiZWVuIHVzZWQgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBtYW51YWxseSwgd2hlcmUgdGhlIHJlY3RhbmdsZVxuICAgICAqIHBvaW50cyB3aWxsIGJlIGNob29zZW4gYnkgdXNlciBpbiB0aGUgY2FwdHVyZWQgaW1hZ2UgZGlzcGxheWluZyBpbiB0aGUgZGlhbG9nIHdpbmRvdy5cbiAgICAgKiBJbiB0aGUgZGlhbG9nIHdpbmRvdywgdGhlcmUgYXJlIGZvdXIgY2lyY2xlcyBhcmUgYmVpbmcgdXNlZCB0byBzZWxlY3QgcG9pbnRzLlxuICAgICAqIEJhc2VkIG9uIHRoZSBzZWxlY3RlZCBwb2ludHMsIHRoZSB0cmFuc2Zvcm1hdGlvbiB3aWxsIGJlIHBlcmZvcm1lZCBoZXJlLlxuICAgICAqL1xuICAgIHBlcmZvcm1NYW51YWxDb3JyZWN0aW9uKCkge1xuICAgICAgICBsZXQgcG9pbnRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWU7XG4gICAgICAgIC8vIGNvbnN0IGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgICAgICAvLyB0aGlzLnBvaW50c1swXS55ID0gK3RoaXMucG9pbnRzWzBdLnkgLSBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzFdLnkgPSArdGhpcy5wb2ludHNbMV0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMl0ueSA9ICt0aGlzLnBvaW50c1syXS55ICsgY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1szXS55ID0gK3RoaXMucG9pbnRzWzNdLnkgKyBjaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgY29uc3QgcG9pbnQwWSA9ICgrdGhpcy5wb2ludHNbMF0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcG9pbnQxWSA9ICgrdGhpcy5wb2ludHNbMV0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzID0gdGhpcy5wb2ludHNbMF0ueCArICctJyArICgocG9pbnQwWSA8IDApID8gMCA6IHBvaW50MFkpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzFdLnggKyAnLScgKyAoKHBvaW50MVkgPCAwKSA/IDAgOiBwb2ludDFZKSArICcjJ1xuICAgICAgICAgICAgKyB0aGlzLnBvaW50c1syXS54ICsgJy0nICsgKCt0aGlzLnBvaW50c1syXS55ICsgdGhpcy5jaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzNdLnggKyAnLScgKyAoK3RoaXMucG9pbnRzWzNdLnkgKyB0aGlzLmNpcmNsZVJhZGl1cyk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPbGQgPSB0aGlzLmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gT3BlbkNWV3JhcHBlci5wZXJmb3JtUGVyc3BlY3RpdmVDb3JyZWN0aW9uTWFudWFsKHRoaXMuaW1hZ2VTb3VyY2VPcmcsIHJlY3RhbmdsZVBvaW50cyxcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0KTtcbiAgICAgICAgY29uc29sZS5sb2coJ01hbnVhbCBQVCA6JywgdGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltYWdlU291cmNlKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5kZWxldGVGaWxlKHRoaXMuaW1hZ2VTb3VyY2VPbGQpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZyA9IHRoaXMuaW1hZ2VTb3VyY2VPcmdPbGQ7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9IExBQkxFX01BTlVBTDtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZXMoKTtcbiAgICAgICAgLy8gLy8gdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgLy8gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuRGVsZXRlRmlsZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyByZWN0YW5nbGUgcG9pbnRzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBldmVudCBHZXN0dXJlIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICAvLyBnZXRQb2ludHMoZXZlbnQ6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAvLyAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgPT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAvLyAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgLy8gICAgICAgICAgICAgY29uc3Qgc2NhbGU6IG51bWJlciA9IHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLnNjYWxlO1xuXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUgPSB0aGlzLmltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgIC8vICAgICAgICAgICAgIGNvbnN0IHBvaW50WCA9IGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC8gc2NhbGU7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcG9pbnRZID0gZXZlbnQuYW5kcm9pZC5nZXRZKCkgLyBzY2FsZTtcblxuICAgIC8vICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFBvaW50ID0geyB4OiBwb2ludFgsIHk6IHBvaW50WSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuXG4gICAgLy8gICAgICAgICAgICAgaWYgKHRoaXMucG9pbnRzLmxlbmd0aCA+PSA0KSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2Ugc2VsZWN0IG9ubHkgZm91ciBwb2ludHMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQodGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpKTtcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgY2FsbGluZyBnZXRQb2ludHMoKS4gJyArIGVycm9yKTtcbiAgICAvLyAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG4gICAgLyoqXG4gICAgICogU2hvdyBvcmlnaW5hbCBpbWFnZSwgaXMgYmVpbmcgdXNlZCB0byBzaG93IG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlXG4gICAgICogd2hlbiB0aGUgJ01hbnVhbCcgYnV0dG9uIGlzIGJlZW4gcHJlc3NlZCwgdGhpcyBpcyB3aGVyZSB1c2VyIGNhbiBzZWxlY3QgZGVzaXJlZCBwb2ludHNcbiAgICAgKiBhbmQgcGVyZm9ybSBtYW51YWwgdHJhbnNmb3JtYXRpb24uIEl0IGlzIGFsc28gaW50aWFsaXppbmcgY2lyY2xlIHBvaW50cyB0byBiZSBkaXNwbGF5ZWRcbiAgICAgKiBpbiB0aGUgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgc2hvd09yaWdpbmFsSW1hZ2UoKSB7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKCk7XG4gICAgICAgIGlmICh0aGlzLmNpcmNsZUJ0bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgncmVjdGFuZ2xlX3BvaW50c19pbmZvJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9IExBQkxFX1BFUkZPUk07XG4gICAgICAgIC8vIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdwZXJmb3JtJyk7XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwaW5jaCBtZXRob2QsIGlzIGJlaW5nIGNhbGxlZCB3aGlsZSBwaW5jaCBldmVudCBmaXJlZCBvbiBpbWFnZSxcbiAgICAgKiB3aGVyZSB0aGUgbmV3IHNjYWxlLCB3aWR0aCAmIGhlaWdodCBvZiB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaGF2ZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiB0byB6b29tLWluL291dC5cbiAgICAgKiBAcGFyYW0gYXJncyBQaW5jaEdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5ZID0gYXJncy5nZXRGb2N1c1koKSAtIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuXG4gICAgICAgICAgICAvLyBsZXQgb2xkT3JpZ2luWCA9IHRoaXMuaW1nVmlldy5vcmlnaW5YICogdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTY2FsZSA9IHRoaXMuaW1nVmlldy5zY2FsZVg7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1pbig4LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgdGhpcy5uZXdTY2FsZSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWSA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcud2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5oZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhbkdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5YO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLmltZ1ZpZXcub3JpZ2luWTtcblxuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEb3VibGUgdGFwIG1ldGhvZCBmaXJlcyBvbiB3aGVuIHVzZXIgdGFwcyB0d28gdGltZXMgb24gdHJhbnNmb3JtZWQgaW1hZ2UuIFxuICAgICAqIEFjdHVhbGx5IGl0IGJyaW5ncyB0aGUgaW1hZ2UgdG8gaXQncyBvcmlnaW5hbCBwb3NpdGlvbnMgYW5kIGFsc28gYWRkcyBcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKCkge1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gZGlhbG9nIHdpbmRvdyBpcyBsb2FkZWQsXG4gICAgICogd2hlcmUgYWxsIHRoZSBuZWNlc3NhcnkgdmFsdWVzIGZvciB0aGUgaW1hZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB3aW5kb3dcbiAgICAgKiBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQsIGxpa2UgdHJhbnNmb3JtZWRJbWFnZVNvdXJjZSwgb3JpZ2luYWxJbWFnZVNvdXJjZSAmXG4gICAgICogcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQYWdlIGxvYWRlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzOiB7IG9iamVjdDogYW55OyB9KSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZ09sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmc7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRoaXMucGFyYW1zLmNvbnRleHQuaXNBdXRvQ29ycmVjdGlvbjtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIGNvbnN0IHJlY1BvaW50c1N0clRlbXAgPSB0aGlzLnBhcmFtcy5jb250ZXh0LnJlY3RhbmdsZVBvaW50cztcblxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cyA9IHJlY1BvaW50c1N0clRlbXAuc3BsaXQoJyMnKTtcbiAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMuc2hpZnQoKTsgLy8gcmVtb3ZlIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMucG9wKCk7IC8vIHJlbW92ZSBsYXN0IGVsZW1lbnRcbiAgICAgICAgY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLmltZ1ZpZXcgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWdWaWV3SWQnKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWdHcmlkSWQnKTtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLmltZ1ZpZXcuc2NhbGVZID0gMTtcbiAgICAgICAgb3JpZW50YXRpb24uc2V0T3JpZW50YXRpb24oJ3BvcnRyYWl0Jyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBjaXJjbGVzIG1ldGhvZCBhZGRzIGNpcmNsZSBwb2ludHMgYnRuIGluIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkQ2lyY2xlcygpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LmZvckVhY2goKGJ0bjogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZChidG4pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGNpcmNsZXMgcmVtb3ZlcyBjaXJjbGUgcG9pbnRzIGJ0biBmcm9tIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlQ2lyY2xlcygpIHtcbiAgICAgICAgY29uc3QgaW1nRWxlbWVudCA9IHRoaXMuaW1nR3JpZElkLmdldENoaWxkQXQoMCk7XG4gICAgICAgIHRoaXMuaW1nR3JpZElkLnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGltZ0VsZW1lbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGNpcmNsZSBwb2ludHMgYmFzZWQgb24gdGhlIHJlY2VpZXZlZCByZWN0YW5nbGUgcG9pbnRzIGFuZFxuICAgICAqIGltYWdlJ3Mgd2lkdGggJiBoZWlnaHQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbml0UG9pbnRzKCkge1xuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QgPSBbXTtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVuc2l0eSBvZiB5b3VyIHNjcmVlbiwgc28gd2UgY2FuIGRpdmlkZSB0aGUgbWVhc3VyZWQgd2lkdGgvaGVpZ2h0IGJ5IGl0LlxuICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUgPSB0aGlzLmltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgICAgICB0aGlzLmNlbnRlclBvaW50WCA9ICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyAyKSAvIHNjYWxlO1xuICAgICAgICB0aGlzLmNlbnRlclBvaW50WSA9ICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gMikgLyBzY2FsZTtcblxuICAgICAgICBsZXQgYWN0dWFsUG9pbnQgPSB7fTtcbiAgICAgICAgaWYgKHRoaXMucmVjdGFuZ2xlUG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGxldCBwb2ludEluZGV4ID0gMTtcbiAgICAgICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRzID0gcG9pbnQuc3BsaXQoJyUnKTtcbiAgICAgICAgICAgICAgICBsZXQgYm90dG9tQ2lyY2xlUmFkaXVzID0gdGhpcy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlggPSAwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludERpZmZZID0gMDtcbiAgICAgICAgICAgICAgICAvLyBpZiAocG9pbnRJbmRleCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDMpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IDEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBpZiAocG9pbnRJbmRleCsrID4gMikgeyAvLyBGb3IgY2hlY2tpbmcgYm90dG9uIHBvaW50c1xuICAgICAgICAgICAgICAgICAgICBib3R0b21DaXJjbGVSYWRpdXMgPSBib3R0b21DaXJjbGVSYWRpdXMgKiAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgdG9wTGVmdC54ID0gdG9wTGVmdC54IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wTGVmdC55ID0gdG9wTGVmdC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wUmlnaHQueCA9IHRvcFJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC55ID0gdG9wUmlnaHQueSAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVJpZ2h0LnggPSBib3R0b21SaWdodC54ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueSA9IGJvdHRvbVJpZ2h0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnggPSBib3R0b21MZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnkgPSBib3R0b21MZWZ0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgYWN0dWFsUG9pbnQgPSB7IHg6ICgrcG9pbnRzWzBdICsgcG9pbnREaWZmWCkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpLFxuICAgICAgICAgICAgICAgIC8vIHk6ICgoK3BvaW50c1sxXStwb2ludERpZmZZKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKVxuICAgICAgICAgICAgICAgIC8vICsgY2lyY2xlUmFkaXVzLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6ICgrcG9pbnRzWzBdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgICAgIHk6ICgoK3BvaW50c1sxXSkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIHNjYWxlKSkgKyBib3R0b21DaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IDAsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiAwLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcblxuICAgICAgICAgICAgLy8gICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGNpcmNsZSBwb2ludHMgYnV0dG9uIG9uIG9yaWdpbmFsIGltYWdlIHZpZXdcbiAgICAgKiBiYXNlZCBvbiB0aGUgcG9pbnRzIHJlY2VpZXZlZCB2aWEgYWN0dWFsUG9pbnQgYW5kIGFsc28gdGFrZXNcbiAgICAgKiBjYXJlIG9mIGJvdW5kYXJ5IGNoZWNraW5nIHdoaWxlIGRpcGxheWluZyBpdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYWN0dWFsUG9pbnQgQ29udGFpbnMgY2lyY2xlIHBvaW50cyh4LHkpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQ6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVggPSAodGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoO1xuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWSA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMucG9pbnRzQ291bnRlcisrO1xuICAgICAgICBjaXJjbGVCdG4uZm9ybWF0dGVkVGV4dCA9IGZvcm1hdHRlZFN0cmluZztcbiAgICAgICAgY2lyY2xlQnRuLm9uKCdwYW4nLCAoYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PT0gY2lyY2xlQnRuLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnggPSBjaXJjbGVCdG4udHJhbnNsYXRlWCAtIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC55ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVkgLSBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludC54ICsgYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnQueSArIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWCAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKiAtMSkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WSAqIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LnB1c2goY2lyY2xlQnRuKTtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChhY3R1YWxQb2ludCk7XG4gICAgICAgIHJldHVybiBjaXJjbGVCdG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0aGUgaW1hZ2UgdGhhdCBpdCBpcyB3aXRoaW4gdGhlIGltYWdlIHZpZXcgYm91bmRhcnkgb3Igbm90LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVYIEltYWdlIHRyYW5zbGF0ZVhcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWSBJbWFnZSB0cmFuc2xhdGVZXG4gICAgICovXG4gICAgcHJpdmF0ZSBjaGVja0JvdW5kYXJ5KHRyYW5zbGF0ZVg6IGFueSwgdHJhbnNsYXRlWTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgcG9pbnRBZGp1c3RtZW50ID0gNTsgLy8gTmVlZCB0byBhZGp1c3QgdGhlIGNlbnRlciBwb2ludCB2YWx1ZSB0byBjaGVjayB0aGUgYm91bmRhcnlcbiAgICAgICAgaWYgKHRyYW5zbGF0ZVggPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICB0cmFuc2xhdGVZIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVggKiAtMSkgPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWSAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=