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
var opencv = require("nativescript-opencv-plugin");
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
        this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this.imageActualSize.width + '-' + this.imageActualSize.height);
        transformedimage_provider_1.SendBroadcastImage(this.imageSource);
        timer_1.setTimeout(function () {
            _this.transformedImageProvider.deleteFile(_this.imageSourceOld);
        }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.removeCircles();
        // this.pointsCounter = 0;
        this.transformedImageProvider.DeleteFiles();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTBDO0FBQzFDLGtFQUFzRTtBQUN0RSxnREFBb0Q7QUFHcEQsb0ZBQXNHO0FBRXRHLHVEQUFzRDtBQUN0RCxxREFBOEM7QUFFOUMsc0RBQXdEO0FBQ3hELDBDQUE0QztBQUM1QyxvREFBc0Q7QUFDdEQsOEVBQWdGO0FBQ2hGLG9EQUFzRDtBQUV0RCxtREFBcUQ7QUFFckQsOEJBQThCO0FBQzlCLElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM5QiwrQkFBK0I7QUFDL0IsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBRWhDOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBaUR0QixxQ0FBcUM7SUFDckMsc0NBQXNDO0lBQ3RDLGlDQUFpQztJQUNqQyxrREFBa0Q7SUFFbEQsMENBQTBDO0lBRTFDOzs7OztPQUtHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ3pCLHdCQUFrRCxFQUNsRCxNQUFvQixFQUNwQixNQUFTO1FBSFQsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFDekIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUE1RDdCLDBFQUEwRTtRQUNuRSxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUF1QmhDLHdDQUF3QztRQUNoQyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBS3ZCLHVEQUF1RDtRQUMvQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLHdEQUF3RDtRQUNoRCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsc0ZBQXNGO1FBQzlFLHlCQUFvQixHQUFHLEtBQUssQ0FBQztR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eUJBQXlCO0tBQ3pDLENBQUM7cUNBK0Q4QixnQ0FBaUIsc0JBQ0Msb0RBQXdCLG9CQUF4QixvREFBd0Isc0RBQzFDLDJCQUFZLG9CQUFaLDJCQUFZLGtDQUNaLFdBQUM7R0FqRXBCLGFBQWEsQ0FpZ0J6QjtBQWpnQlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nUGFyYW1zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RpbWVyJztcbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuXG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5cbmltcG9ydCAqIGFzIG9yaWVudGF0aW9uIGZyb20gJ25hdGl2ZXNjcmlwdC1vcmllbnRhdGlvbic7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuaW1wb3J0ICogYXMgcGxhdGZvcm0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9wbGF0Zm9ybSc7XG5pbXBvcnQgKiBhcyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy90ZXh0L2Zvcm1hdHRlZC1zdHJpbmcnO1xuaW1wb3J0ICogYXMgYnV0dG9ucyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2J1dHRvbic7XG5cbmltcG9ydCAqIGFzIG9wZW5jdiBmcm9tICduYXRpdmVzY3JpcHQtb3BlbmN2LXBsdWdpbic7XG5cbi8qKiBMYWJsZSBmb3IgJ01hbnVhbCcgdGV4dCAqL1xuY29uc3QgTEFCTEVfTUFOVUFMID0gJ01hbnVhbCc7XG4vKiogTGFibGUgZm9yICdQZXJmb3JtJyB0ZXh0ICovXG5jb25zdCBMQUJMRV9QRVJGT1JNID0gJ1BlcmZvcm0nO1xuXG4vKipcbiAqIERpYWxvZyBjb250ZW50IGNsYXNzLlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ21vZGFsLWNvbnRlbnQnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vZGlhbG9nLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29udGVudCB7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IGFueTtcbiAgICAvKiogT3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIC8qKiBDb250YWlucyB0cnVlL2ZhbHNlIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24gYXV0b21hdGljYWxseSBvciBub3QuICovXG4gICAgcHVibGljIGlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAvKiogQ29udGFpbnMgYnV0dG9uIGxhYmVsIG5hbWUgZWl0aGVyICdNYW51YWwnLyAnUGVyZm9ybScgKi9cbiAgICBwdWJsaWMgbWFudWFsQnRuVGV4dDogc3RyaW5nO1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGZvdXIgcG9pbnRzIG9mIHRoZSBpbWFnZXMuICovXG4gICAgcHJpdmF0ZSBwb2ludHM6IGFueTtcbiAgICAvKiogSW5kaWNhdGVzIHRoZSBudW1iZXIgb2YgcG9pbnRzLiAqL1xuICAgIHByaXZhdGUgcG9pbnRzQ291bnRlcjogbnVtYmVyO1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgb3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2VPcmdPbGQ6IGFueTtcbiAgICAvKiogU3RvcmVzIHByZXZpb3VzIHRyYW5zZm9ybWVkIGltYWdlIHNvdXJjZS4gKi9cbiAgICBwcml2YXRlIGltYWdlU291cmNlT2xkOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRyYW5zZm9ybWVkIGltYWdlIGFjdHVhbCBzaXplLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VBY3R1YWxTaXplOiBhbnk7XG4gICAgLyoqIExpc3Qgb2YgY2lyY2xlIGJ1dHRvbnMgKi9cbiAgICBwcml2YXRlIGNpcmNsZUJ0bkxpc3Q6IGFueTtcbiAgICAvKiogU3RvcmVzIHRyYW5zZm9ybWVkIGltYWdlIHJlZmVycmVuY2UuICovXG4gICAgcHJpdmF0ZSBpbWdWaWV3OiBhbnk7XG4gICAgLyoqIEltYWdlIGdyaWQgaWQuICovXG4gICAgcHJpdmF0ZSBpbWdHcmlkSWQ6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgcHJldmlvdXMgZGVsdGFYLiAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVkuICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHN0YXJ0aW5nIHNjYWxlLiAqL1xuICAgIHByaXZhdGUgc3RhcnRTY2FsZSA9IDE7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIGNlbnRlciBwb2ludFguICovXG4gICAgcHJpdmF0ZSBjZW50ZXJQb2ludFg6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WS4gKi9cbiAgICBwcml2YXRlIGNlbnRlclBvaW50WTogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBuZXcgc2NhbGUgd2hpbGUgbW92aW5nIGFyb3VuZC4gKi9cbiAgICBwcml2YXRlIG5ld1NjYWxlID0gMTtcbiAgICAvKiogU3RvcmVzIG9sZCBUcmFuc2xhdGVYIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgLyoqIFN0b3JlcyBvbGQgdHJhbnNsYXRlWSB2YWx1ZSBvZiB0cmFuc2Zvcm1lZCBJbWFnZS4gKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIGluZGljYXRlIHdoZXRoZXIgdGhlIGltYWdlIGdvdCBkZWZhdWx0IHNjcmVlbiBsb2NhdGlvbiBvciBub3QuICovXG4gICAgcHJpdmF0ZSBpc0dvdERlZmF1bHRMb2NhdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UncyBzY3JlZW4gbG9jYXRpb24uICovXG4gICAgcHJpdmF0ZSBkZWZhdWx0U2NyZWVuTG9jYXRpb246IGFueTtcbiAgICAvKiogU3RvcmVzIHJlY3RhbmdsZSBwb2ludHMgdG8gYmUgdXNlZCBpbiB0aGUgT3BlbkNWIEFQSSBjYWxsLiAqL1xuICAgIHByaXZhdGUgcmVjdGFuZ2xlUG9pbnRzOiBhbnk7XG4gICAgLyoqIFRvIGdldCBhY2N1cmF0ZSBwb3NpdGlvbiwgbmVlZCB0byBhZGp1c3QgdGhlIHJhZGl1cyB2YWx1ZSAqL1xuICAgIHByaXZhdGUgY2lyY2xlUmFkaXVzID0gMTc7XG4gICAgLyoqIExhYmxlIGZvciBNYW51YS9QZXJmb3JtIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgbWFudWFsUGVyZm9ybUJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gcHJpdmF0ZSBfZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgLy8gQFZpZXdDaGlsZCgnaW1nVmlld0lkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcblxuICAgIC8vIHByaXZhdGUgcG9pbnRzID0gbmV3IE9ic2VydmFibGVBcnJheSgpO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIERpYWxvZ0NvbnRlbnQgY2xhc3MuXG4gICAgICogXG4gICAgICogQHBhcmFtIHBhcmFtcyBjb250YWlucyBjYXB0dXJlZCBpbWFnZSBmaWxlIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB0cmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyYW1zOiBNb2RhbERpYWxvZ1BhcmFtcyxcbiAgICAgICAgICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfTUFOVUFMO1xuICAgICAgICAvLyB0aGlzLm1hbnVhbFBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtID0gPEltYWdlPnRoaXMuX2RyYWdJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbG9zZSBtZXRob2QsIHdoaWNoIGNsb3NlIHRoZSBkaWFsb2cgd2luZG93IG9wZW5lZCBhZnRlciBjYXB0dXJlZCBpbWFnZSBmcm9tIGNhbWVyYS5cbiAgICAgKiBBbmQgcmV0dXJucyBiYWNrIHRvIHRoZSBwbGFjZSB3aGVyZSB0aGUgZGlhbG9nIHdpbmRvdyBnb3QgdHJpZ2dlcmVkLCBhbG9uZyB3aXRoIFxuICAgICAqIHRoZSBwYXJhbWV0ZXIgJ3Jlc3VsdCdcbiAgICAgKiBAcGFyYW0gcmVzdWx0IFdoaWNoIGlzIG5vdGhpbmcgYnV0IGVtcHR5IHN0cmluZyBvciB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgc3RyaW5nXG4gICAgICovXG4gICAgY2xvc2UocmVzdWx0OiBzdHJpbmcpIHtcbiAgICAgICAgb3JpZW50YXRpb24uZW5hYmxlUm90YXRpb24oKTtcbiAgICAgICAgdGhpcy5wYXJhbXMuY2xvc2VDYWxsYmFjayhyZXN1bHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtaW5nIG1hbnVhbCB0cmFuc2Zvcm1hdGlvblxuICAgICAqIHRoaXMgaXMgYmVlbiB1c2VkIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24gbWFudWFsbHksIHdoZXJlIHRoZSByZWN0YW5nbGVcbiAgICAgKiBwb2ludHMgd2lsbCBiZSBjaG9vc2VuIGJ5IHVzZXIgaW4gdGhlIGNhcHR1cmVkIGltYWdlIGRpc3BsYXlpbmcgaW4gdGhlIGRpYWxvZyB3aW5kb3cuXG4gICAgICogSW4gdGhlIGRpYWxvZyB3aW5kb3csIHRoZXJlIGFyZSBmb3VyIGNpcmNsZXMgYXJlIGJlaW5nIHVzZWQgdG8gc2VsZWN0IHBvaW50cy5cbiAgICAgKiBCYXNlZCBvbiB0aGUgc2VsZWN0ZWQgcG9pbnRzLCB0aGUgdHJhbnNmb3JtYXRpb24gd2lsbCBiZSBwZXJmb3JtZWQgaGVyZS5cbiAgICAgKi9cbiAgICBwZXJmb3JtTWFudWFsQ29ycmVjdGlvbigpIHtcbiAgICAgICAgbGV0IHBvaW50c0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgcG9pbnRzQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlO1xuICAgICAgICAvLyBjb25zdCBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMF0ueSA9ICt0aGlzLnBvaW50c1swXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1sxXS55ID0gK3RoaXMucG9pbnRzWzFdLnkgLSBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzJdLnkgPSArdGhpcy5wb2ludHNbMl0ueSArIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbM10ueSA9ICt0aGlzLnBvaW50c1szXS55ICsgY2lyY2xlUmFkaXVzO1xuXG4gICAgICAgIGNvbnN0IHBvaW50MFkgPSAoK3RoaXMucG9pbnRzWzBdLnkgLSB0aGlzLmNpcmNsZVJhZGl1cyk7XG4gICAgICAgIGNvbnN0IHBvaW50MVkgPSAoK3RoaXMucG9pbnRzWzFdLnkgLSB0aGlzLmNpcmNsZVJhZGl1cyk7XG4gICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50cyA9IHRoaXMucG9pbnRzWzBdLnggKyAnLScgKyAoKHBvaW50MFkgPCAwKSA/IDAgOiBwb2ludDBZKSArICcjJ1xuICAgICAgICAgICAgKyB0aGlzLnBvaW50c1sxXS54ICsgJy0nICsgKChwb2ludDFZIDwgMCkgPyAwIDogcG9pbnQxWSkgKyAnIydcbiAgICAgICAgICAgICsgdGhpcy5wb2ludHNbMl0ueCArICctJyArICgrdGhpcy5wb2ludHNbMl0ueSArIHRoaXMuY2lyY2xlUmFkaXVzKSArICcjJ1xuICAgICAgICAgICAgKyB0aGlzLnBvaW50c1szXS54ICsgJy0nICsgKCt0aGlzLnBvaW50c1szXS55ICsgdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5pbWFnZVNvdXJjZTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVDb3JyZWN0aW9uTWFudWFsKHRoaXMuaW1hZ2VTb3VyY2VPcmcsIHJlY3RhbmdsZVBvaW50cyxcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0KTtcbiAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1hZ2VTb3VyY2UpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmRlbGV0ZUZpbGUodGhpcy5pbWFnZVNvdXJjZU9sZCk7XG4gICAgICAgIH0sIDEwMDApO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5pbWFnZVNvdXJjZU9yZ09sZDtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfTUFOVUFMO1xuICAgICAgICAvLyB0aGlzLm1hbnVhbFBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAvLyB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5EZWxldGVGaWxlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHJlY3RhbmdsZSBwb2ludHMuXG4gICAgICogXG4gICAgICogQHBhcmFtIGV2ZW50IEdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIC8vIGdldFBvaW50cyhldmVudDogR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgIC8vICAgICB0cnkge1xuICAgIC8vICAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCA9PT0gTEFCTEVfUEVSRk9STSkge1xuICAgIC8vICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAvLyAgICAgICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAvLyAgICAgICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRYKCkgLyBzY2FsZTtcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFkoKSAvIHNjYWxlO1xuXG4gICAgLy8gICAgICAgICAgICAgY29uc3QgYWN0dWFsUG9pbnQgPSB7IHg6IHBvaW50WCwgeTogcG9pbnRZLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG5cbiAgICAvLyAgICAgICAgICAgICBpZiAodGhpcy5wb2ludHMubGVuZ3RoID49IDQpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1BsZWFzZSBzZWxlY3Qgb25seSBmb3VyIHBvaW50cy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZCh0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCkpO1xuICAgIC8vICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBjYWxsaW5nIGdldFBvaW50cygpLiAnICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG9yaWdpbmFsIGltYWdlLCBpcyBiZWluZyB1c2VkIHRvIHNob3cgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiB3aGVuIHRoZSAnTWFudWFsJyBidXR0b24gaXMgYmVlbiBwcmVzc2VkLCB0aGlzIGlzIHdoZXJlIHVzZXIgY2FuIHNlbGVjdCBkZXNpcmVkIHBvaW50c1xuICAgICAqIGFuZCBwZXJmb3JtIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbi4gSXQgaXMgYWxzbyBpbnRpYWxpemluZyBjaXJjbGUgcG9pbnRzIHRvIGJlIGRpc3BsYXllZFxuICAgICAqIGluIHRoZSBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBzaG93T3JpZ2luYWxJbWFnZSgpIHtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Eb3VibGVUYXAoKTtcbiAgICAgICAgaWYgKHRoaXMuY2lyY2xlQnRuTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZWN0YW5nbGVfcG9pbnRzX2luZm8nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfUEVSRk9STTtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5YID0gYXJncy5nZXRGb2N1c1goKSAtIHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgLy8gbGV0IG5ld09yaWdpblkgPSBhcmdzLmdldEZvY3VzWSgpIC0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG5cbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5YID0gdGhpcy5pbWdWaWV3Lm9yaWdpblggKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgLy8gbGV0IG9sZE9yaWdpblkgPSB0aGlzLmltZ1ZpZXcub3JpZ2luWSAqIHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpO1xuICAgICAgICAgICAgdGhpcy5zdGFydFNjYWxlID0gdGhpcy5pbWdWaWV3LnNjYWxlWDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWluKDgsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLm5ld1NjYWxlKTtcblxuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuc2NhbGVZID0gdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy53aWR0aCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LmhlaWdodCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwYW4vbW92ZSBtZXRob2QsIHdoaWNoIG1vdmVzIGltYWdlIHdoZW4gdXNlciBwcmVzcyAmIGRyYWcgd2l0aCBhIGZpbmdlciBhcm91bmRcbiAgICAgKiB0aGUgaW1hZ2UgYXJlYS4gSGVyZSB0aGUgaW1hZ2UncyB0cmFsYXRlWC90cmFuc2xhdGVZIHZhbHVlcyBhcmUgYmVlbiBjYWxjdWxhdGVkXG4gICAgICogYmFzZWQgb24gdGhlIGltYWdlJ3Mgc2NhbGUsIHdpZHRoICYgaGVpZ2h0LiBBbmQgYWxzbyBpdCB0YWtlcyBjYXJlIG9mIGltYWdlIGJvdW5kYXJ5XG4gICAgICogY2hlY2tpbmcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuaW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5pbWdWaWV3Lm9yaWdpblg7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5ZO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS4gXG4gICAgICogQWN0dWFsbHkgaXQgYnJpbmdzIHRoZSBpbWFnZSB0byBpdCdzIG9yaWdpbmFsIHBvc2l0aW9ucyBhbmQgYWxzbyBhZGRzIFxuICAgICAqIGNpcmNsZSBwb2ludHMgaWYgaXQgaXMgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgICAgIHNjYWxlOiB7IHg6IDEsIHk6IDEgfSxcbiAgICAgICAgICAgICAgICBjdXJ2ZTogJ2Vhc2VPdXQnLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IDE7XG4gICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYWdlIGxvYWRlZCBtZXRob2Qgd2hpY2ggaXMgYmVlbiBjYWxsZWQgd2hlbiBkaWFsb2cgd2luZG93IGlzIGxvYWRlZCxcbiAgICAgKiB3aGVyZSBhbGwgdGhlIG5lY2Vzc2FyeSB2YWx1ZXMgZm9yIHRoZSBpbWFnZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHdpbmRvd1xuICAgICAqIGhhdmUgYmVlbiBpbml0aWFsaXplZCwgbGlrZSB0cmFuc2Zvcm1lZEltYWdlU291cmNlLCBvcmlnaW5hbEltYWdlU291cmNlICZcbiAgICAgKiByZWN0YW5nbGUgcG9pbnRzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgY29uc3QgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzID0gcmVjUG9pbnRzU3RyVGVtcC5zcGxpdCgnIycpO1xuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuaW1nVmlldyA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ1ZpZXdJZCcpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGNpcmNsZXMgbWV0aG9kIGFkZHMgY2lyY2xlIHBvaW50cyBidG4gaW4gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QuZm9yRWFjaCgoYnRuOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcyByZW1vdmVzIGNpcmNsZSBwb2ludHMgYnRuIGZyb20gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW1vdmVDaXJjbGVzKCkge1xuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gdGhpcy5pbWdHcmlkSWQuZ2V0Q2hpbGRBdCgwKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQoaW1nRWxlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgY2lyY2xlIHBvaW50cyBiYXNlZCBvbiB0aGUgcmVjZWlldmVkIHJlY3RhbmdsZSBwb2ludHMgYW5kXG4gICAgICogaW1hZ2UncyB3aWR0aCAmIGhlaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRZID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHt9O1xuICAgICAgICBpZiAodGhpcy5yZWN0YW5nbGVQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50SW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludHMgPSBwb2ludC5zcGxpdCgnJScpO1xuICAgICAgICAgICAgICAgIGxldCBib3R0b21DaXJjbGVSYWRpdXMgPSB0aGlzLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgICAgICAvLyBsZXQgcG9pbnREaWZmWCA9IDA7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlkgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGlmIChwb2ludEluZGV4ID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAxMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMykge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gNCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGlmIChwb2ludEluZGV4KysgPiAyKSB7IC8vIEZvciBjaGVja2luZyBib3R0b24gcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbUNpcmNsZVJhZGl1cyA9IGJvdHRvbUNpcmNsZVJhZGl1cyAqIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB0b3BMZWZ0LnggPSB0b3BMZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BMZWZ0LnkgPSB0b3BMZWZ0LnkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC54ID0gdG9wUmlnaHQueCArIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcFJpZ2h0LnkgPSB0b3BSaWdodC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueCA9IGJvdHRvbVJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21SaWdodC55ID0gYm90dG9tUmlnaHQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueCA9IGJvdHRvbUxlZnQueCAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueSA9IGJvdHRvbUxlZnQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBhY3R1YWxQb2ludCA9IHsgeDogKCtwb2ludHNbMF0gKyBwb2ludERpZmZYKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgLy8geTogKCgrcG9pbnRzWzFdK3BvaW50RGlmZlkpICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpXG4gICAgICAgICAgICAgICAgLy8gKyBjaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgICAgICBhY3R1YWxQb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKCtwb2ludHNbMF0pICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAgICAgeTogKCgrcG9pbnRzWzFdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKSArIGJvdHRvbUNpcmNsZVJhZGl1cywgaWQ6IHRoaXMucG9pbnRzQ291bnRlcixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogMCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiAwLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGgsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuXG4gICAgICAgICAgICAvLyAgICAgbGV0IGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgY2lyY2xlIHBvaW50cyBidXR0b24gb24gb3JpZ2luYWwgaW1hZ2Ugdmlld1xuICAgICAqIGJhc2VkIG9uIHRoZSBwb2ludHMgcmVjZWlldmVkIHZpYSBhY3R1YWxQb2ludCBhbmQgYWxzbyB0YWtlc1xuICAgICAqIGNhcmUgb2YgYm91bmRhcnkgY2hlY2tpbmcgd2hpbGUgZGlwbGF5aW5nIGl0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhY3R1YWxQb2ludCBDb250YWlucyBjaXJjbGUgcG9pbnRzKHgseSlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludDogYW55KTogYW55IHtcbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWCA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCAvIDIpIC0gdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGg7XG4gICAgICAgIGNvbnN0IGFjdHVhbFBvaW50RGVsdGFZID0gKHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCAvIDIpIC0gdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZFN0cmluZyA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuRm9ybWF0dGVkU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGljb25TcGFuID0gbmV3IGZvcm1hdHRlZFN0cmluZ01vZHVsZS5TcGFuKCk7XG4gICAgICAgIGljb25TcGFuLmNzc0NsYXNzZXMuYWRkKCdmYScpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnY2lyY2xlLXBsdXMnKTtcbiAgICAgICAgaWNvblNwYW4udGV4dCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhmMDY3KTtcblxuICAgICAgICBmb3JtYXR0ZWRTdHJpbmcuc3BhbnMucHVzaChpY29uU3Bhbik7XG4gICAgICAgIGNvbnN0IGNpcmNsZUJ0bjogYW55ID0gbmV3IGJ1dHRvbnMuQnV0dG9uKCk7XG4gICAgICAgIGNpcmNsZUJ0bi5jc3NDbGFzc2VzLmFkZCgnY2lyY2xlJyk7XG5cbiAgICAgICAgY2lyY2xlQnRuLmlkID0gdGhpcy5wb2ludHNDb3VudGVyKys7XG4gICAgICAgIGNpcmNsZUJ0bi5mb3JtYXR0ZWRUZXh0ID0gZm9ybWF0dGVkU3RyaW5nO1xuICAgICAgICBjaXJjbGVCdG4ub24oJ3BhbicsIChhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTE1O1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gKzEwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTEwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50LmlkID09PSBjaXJjbGVCdG4uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueCA9IGNpcmNsZUJ0bi50cmFuc2xhdGVYIC0gYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnkgPSBjaXJjbGVCdG4udHJhbnNsYXRlWSAtIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IGFjdHVhbFBvaW50LnggKyBhY3R1YWxQb2ludERlbHRhWDtcbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSBhY3R1YWxQb2ludC55ICsgYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA+IDAgJiZcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID4gdGhpcy5jZW50ZXJQb2ludFgpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gdGhpcy5jZW50ZXJQb2ludFg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCAmJlxuICAgICAgICAgICAgKGNpcmNsZUJ0bi50cmFuc2xhdGVYICogLTEpID4gdGhpcy5jZW50ZXJQb2ludFgpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gdGhpcy5jZW50ZXJQb2ludFggKiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA+IHRoaXMuY2VudGVyUG9pbnRZKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IHRoaXMuY2VudGVyUG9pbnRZO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWSAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRZKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IHRoaXMuY2VudGVyUG9pbnRZICogLTE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QucHVzaChjaXJjbGVCdG4pO1xuICAgICAgICB0aGlzLnBvaW50cy5wdXNoKGFjdHVhbFBvaW50KTtcbiAgICAgICAgcmV0dXJuIGNpcmNsZUJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHRoZSBpbWFnZSB0aGF0IGl0IGlzIHdpdGhpbiB0aGUgaW1hZ2UgdmlldyBib3VuZGFyeSBvciBub3QuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVggSW1hZ2UgdHJhbnNsYXRlWFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVZIEltYWdlIHRyYW5zbGF0ZVlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrQm91bmRhcnkodHJhbnNsYXRlWDogYW55LCB0cmFuc2xhdGVZOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBwb2ludEFkanVzdG1lbnQgPSA1OyAvLyBOZWVkIHRvIGFkanVzdCB0aGUgY2VudGVyIHBvaW50IHZhbHVlIHRvIGNoZWNrIHRoZSBib3VuZGFyeVxuICAgICAgICBpZiAodHJhbnNsYXRlWCA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgIHRyYW5zbGF0ZVkgPCAodGhpcy5jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWCAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVZICogLTEpIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==