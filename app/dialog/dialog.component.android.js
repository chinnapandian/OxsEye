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
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
    // private points = new ObservableArray();
    /**
     * Constructor for DialogContent class.
     *
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    function DialogContent(params, transformedImageProvider, logger) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
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
        this.manualPerformBtnLable = this.params.context.manualBtnLable;
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
        this.manualPerformBtnLable = this.params.context.manualBtnLable;
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
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText('Please move around the four red circle(s) on image if needed and click "Perform" button.', 'long').show();
        }
        this.isAutoCorrection = false;
        this.manualBtnText = LABLE_PERFORM;
        this.manualPerformBtnLable = this.params.context.performBtnLable;
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
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, oxseyelogger_1.OxsEyeLogger])
], DialogContent);
exports.DialogContent = DialogContent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTBDO0FBQzFDLGtFQUFzRTtBQUN0RSxnREFBb0Q7QUFHcEQsb0ZBQXNHO0FBRXRHLHVEQUFzRDtBQUV0RCxzREFBd0Q7QUFDeEQsMENBQTRDO0FBQzVDLG9EQUFzRDtBQUN0RCw4RUFBZ0Y7QUFDaEYsb0RBQXNEO0FBRXRELG1EQUFxRDtBQUVyRCw4QkFBOEI7QUFDOUIsSUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBQzlCLCtCQUErQjtBQUMvQixJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7QUFFaEM7O0dBRUc7QUFPSCxJQUFhLGFBQWE7SUFtRHRCLGlDQUFpQztJQUNqQyxrREFBa0Q7SUFFbEQsMENBQTBDO0lBRTFDOzs7OztPQUtHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ3pCLHdCQUFrRCxFQUNsRCxNQUFvQjtRQUZwQixXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUN6Qiw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELFdBQU0sR0FBTixNQUFNLENBQWM7UUEzRHhDLDBFQUEwRTtRQUNuRSxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUF1QmhDLHdDQUF3QztRQUNoQyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBS3ZCLHVEQUF1RDtRQUMvQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLHdEQUF3RDtRQUNoRCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsc0ZBQXNGO1FBQzlFLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUtyQyxnRUFBZ0U7UUFDeEQsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFpQnRCLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFD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LEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsd0JBQXdCLENBQUM7UUFDckMsV0FBVyxFQUFFLHlCQUF5QjtLQUN6QyxDQUFDO3FDQStEOEIsZ0NBQWlCLHNCQUNDLG9EQUF3QixvQkFBeEIsb0RBQXdCLGtDQUMxQywyQkFBWTtHQWhFL0IsYUFBYSxDQWdnQnpCO0FBaGdCWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dQYXJhbXMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGltZXInO1xuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0ICogYXMgb3JpZW50YXRpb24gZnJvbSAnbmF0aXZlc2NyaXB0LW9yaWVudGF0aW9uJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3BsYXRmb3JtJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlZFN0cmluZ01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RleHQvZm9ybWF0dGVkLXN0cmluZyc7XG5pbXBvcnQgKiBhcyBidXR0b25zIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvYnV0dG9uJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcblxuLyoqIExhYmxlIGZvciAnTWFudWFsJyB0ZXh0ICovXG5jb25zdCBMQUJMRV9NQU5VQUwgPSAnTWFudWFsJztcbi8qKiBMYWJsZSBmb3IgJ1BlcmZvcm0nIHRleHQgKi9cbmNvbnN0IExBQkxFX1BFUkZPUk0gPSAnUGVyZm9ybSc7XG5cbi8qKlxuICogRGlhbG9nIGNvbnRlbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbW9kYWwtY29udGVudCcsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9kaWFsb2cuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50IHtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRydWUvZmFsc2UgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBhdXRvbWF0aWNhbGx5IG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBidXR0b24gbGFiZWwgbmFtZSBlaXRoZXIgJ01hbnVhbCcvICdQZXJmb3JtJyAqL1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgZm91ciBwb2ludHMgb2YgdGhlIGltYWdlcy4gKi9cbiAgICBwcml2YXRlIHBvaW50czogYW55O1xuICAgIC8qKiBJbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwb2ludHMuICovXG4gICAgcHJpdmF0ZSBwb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyBvcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9yZ09sZDogYW55O1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgdHJhbnNmb3JtZWQgaW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2VPbGQ6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJhbnNmb3JtZWQgaW1hZ2UgYWN0dWFsIHNpemUuICovXG4gICAgcHJpdmF0ZSBpbWFnZUFjdHVhbFNpemU6IGFueTtcbiAgICAvKiogTGlzdCBvZiBjaXJjbGUgYnV0dG9ucyAqL1xuICAgIHByaXZhdGUgY2lyY2xlQnRuTGlzdDogYW55O1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIGltZ1ZpZXc6IGFueTtcbiAgICAvKiogSW1hZ2UgZ3JpZCBpZC4gKi9cbiAgICBwcml2YXRlIGltZ0dyaWRJZDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVguICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWS4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc3RhcnRpbmcgc2NhbGUuICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WC4gKi9cbiAgICBwcml2YXRlIGNlbnRlclBvaW50WDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRZLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRZOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIG5ldyBzY2FsZSB3aGlsZSBtb3ZpbmcgYXJvdW5kLiAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBTdG9yZXMgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogU3RvcmVzIG9sZCB0cmFuc2xhdGVZIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdC4gKi9cbiAgICBwcml2YXRlIGlzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSdzIHNjcmVlbiBsb2NhdGlvbi4gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIC8qKiBTdG9yZXMgcmVjdGFuZ2xlIHBvaW50cyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQ1YgQVBJIGNhbGwuICovXG4gICAgcHJpdmF0ZSByZWN0YW5nbGVQb2ludHM6IGFueTtcbiAgICAvKiogVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlICovXG4gICAgcHJpdmF0ZSBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAvKiogTGFibGUgZm9yIE1hbnVhL1BlcmZvcm0gYnV0dG9uICovXG4gICAgcHJpdmF0ZSBtYW51YWxQZXJmb3JtQnRuTGFibGU6IGFueTtcbiAgICAvLyBwcml2YXRlIF9kcmFnSW1hZ2VJdGVtOiBJbWFnZTtcbiAgICAvLyBAVmlld0NoaWxkKCdpbWdWaWV3SWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgLy8gcHJpdmF0ZSBwb2ludHMgPSBuZXcgT2JzZXJ2YWJsZUFycmF5KCk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgRGlhbG9nQ29udGVudCBjbGFzcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcGFyYW1zIGNvbnRhaW5zIGNhcHR1cmVkIGltYWdlIGZpbGUgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHRyYW5zZm9ybWVkIGltYWdlIHByb3ZpZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSBMQUJMRV9NQU5VQUw7XG4gICAgICAgIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5wYXJhbXMuY29udGV4dC5tYW51YWxCdG5MYWJsZTtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSA8SW1hZ2U+dGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsb3NlIG1ldGhvZCwgd2hpY2ggY2xvc2UgdGhlIGRpYWxvZyB3aW5kb3cgb3BlbmVkIGFmdGVyIGNhcHR1cmVkIGltYWdlIGZyb20gY2FtZXJhLlxuICAgICAqIEFuZCByZXR1cm5zIGJhY2sgdG8gdGhlIHBsYWNlIHdoZXJlIHRoZSBkaWFsb2cgd2luZG93IGdvdCB0cmlnZ2VyZWQsIGFsb25nIHdpdGggXG4gICAgICogdGhlIHBhcmFtZXRlciAncmVzdWx0J1xuICAgICAqIEBwYXJhbSByZXN1bHQgV2hpY2ggaXMgbm90aGluZyBidXQgZW1wdHkgc3RyaW5nIG9yIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBzdHJpbmdcbiAgICAgKi9cbiAgICBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1pbmcgbWFudWFsIHRyYW5zZm9ybWF0aW9uXG4gICAgICogdGhpcyBpcyBiZWVuIHVzZWQgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBtYW51YWxseSwgd2hlcmUgdGhlIHJlY3RhbmdsZVxuICAgICAqIHBvaW50cyB3aWxsIGJlIGNob29zZW4gYnkgdXNlciBpbiB0aGUgY2FwdHVyZWQgaW1hZ2UgZGlzcGxheWluZyBpbiB0aGUgZGlhbG9nIHdpbmRvdy5cbiAgICAgKiBJbiB0aGUgZGlhbG9nIHdpbmRvdywgdGhlcmUgYXJlIGZvdXIgY2lyY2xlcyBhcmUgYmVpbmcgdXNlZCB0byBzZWxlY3QgcG9pbnRzLlxuICAgICAqIEJhc2VkIG9uIHRoZSBzZWxlY3RlZCBwb2ludHMsIHRoZSB0cmFuc2Zvcm1hdGlvbiB3aWxsIGJlIHBlcmZvcm1lZCBoZXJlLlxuICAgICAqL1xuICAgIHBlcmZvcm1NYW51YWxDb3JyZWN0aW9uKCkge1xuICAgICAgICBsZXQgcG9pbnRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWU7XG4gICAgICAgIC8vIGNvbnN0IGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgICAgICAvLyB0aGlzLnBvaW50c1swXS55ID0gK3RoaXMucG9pbnRzWzBdLnkgLSBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzFdLnkgPSArdGhpcy5wb2ludHNbMV0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMl0ueSA9ICt0aGlzLnBvaW50c1syXS55ICsgY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1szXS55ID0gK3RoaXMucG9pbnRzWzNdLnkgKyBjaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgY29uc3QgcG9pbnQwWSA9ICgrdGhpcy5wb2ludHNbMF0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcG9pbnQxWSA9ICgrdGhpcy5wb2ludHNbMV0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzID0gdGhpcy5wb2ludHNbMF0ueCArICctJyArICgocG9pbnQwWSA8IDApID8gMCA6IHBvaW50MFkpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzFdLnggKyAnLScgKyAoKHBvaW50MVkgPCAwKSA/IDAgOiBwb2ludDFZKSArICcjJ1xuICAgICAgICAgICAgKyB0aGlzLnBvaW50c1syXS54ICsgJy0nICsgKCt0aGlzLnBvaW50c1syXS55ICsgdGhpcy5jaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzNdLnggKyAnLScgKyAoK3RoaXMucG9pbnRzWzNdLnkgKyB0aGlzLmNpcmNsZVJhZGl1cyk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPbGQgPSB0aGlzLmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZUNvcnJlY3Rpb25NYW51YWwodGhpcy5pbWFnZVNvdXJjZU9yZywgcmVjdGFuZ2xlUG9pbnRzLFxuICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggKyAnLScgKyB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZGVsZXRlRmlsZSh0aGlzLmltYWdlU291cmNlT2xkKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLmltYWdlU291cmNlT3JnT2xkO1xuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0cnVlO1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSBMQUJMRV9NQU5VQUw7XG4gICAgICAgIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5wYXJhbXMuY29udGV4dC5tYW51YWxCdG5MYWJsZTtcbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkRlbGV0ZUZpbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZXZlbnQgR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgLy8gZ2V0UG9pbnRzKGV2ZW50OiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgLy8gICAgIHRyeSB7XG4gICAgLy8gICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ID09PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgLy8gICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVuc2l0eSBvZiB5b3VyIHNjcmVlbiwgc28gd2UgY2FuIGRpdmlkZSB0aGUgbWVhc3VyZWQgd2lkdGgvaGVpZ2h0IGJ5IGl0LlxuICAgIC8vICAgICAgICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgIC8vICAgICAgICAgICAgIHRoaXMuaW1hZ2VBY3R1YWxTaXplID0gdGhpcy5pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAvLyAgICAgICAgICAgICBjb25zdCBwb2ludFggPSBldmVudC5hbmRyb2lkLmdldFgoKSAvIHNjYWxlO1xuICAgIC8vICAgICAgICAgICAgIGNvbnN0IHBvaW50WSA9IGV2ZW50LmFuZHJvaWQuZ2V0WSgpIC8gc2NhbGU7XG5cbiAgICAvLyAgICAgICAgICAgICBjb25zdCBhY3R1YWxQb2ludCA9IHsgeDogcG9pbnRYLCB5OiBwb2ludFksIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcblxuICAgIC8vICAgICAgICAgICAgIGlmICh0aGlzLnBvaW50cy5sZW5ndGggPj0gNCkge1xuICAgIC8vICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnUGxlYXNlIHNlbGVjdCBvbmx5IGZvdXIgcG9pbnRzLicsICdsb25nJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KSk7XG4gICAgLy8gICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGNhbGxpbmcgZ2V0UG9pbnRzKCkuICcgKyBlcnJvcik7XG4gICAgLy8gICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgIC8vICAgICB9XG4gICAgLy8gfVxuICAgIC8qKlxuICAgICAqIFNob3cgb3JpZ2luYWwgaW1hZ2UsIGlzIGJlaW5nIHVzZWQgdG8gc2hvdyBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZVxuICAgICAqIHdoZW4gdGhlICdNYW51YWwnIGJ1dHRvbiBpcyBiZWVuIHByZXNzZWQsIHRoaXMgaXMgd2hlcmUgdXNlciBjYW4gc2VsZWN0IGRlc2lyZWQgcG9pbnRzXG4gICAgICogYW5kIHBlcmZvcm0gbWFudWFsIHRyYW5zZm9ybWF0aW9uLiBJdCBpcyBhbHNvIGludGlhbGl6aW5nIGNpcmNsZSBwb2ludHMgdG8gYmUgZGlzcGxheWVkXG4gICAgICogaW4gdGhlIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHNob3dPcmlnaW5hbEltYWdlKCkge1xuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKCk7XG4gICAgICAgIGlmICh0aGlzLmNpcmNsZUJ0bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2UgbW92ZSBhcm91bmQgdGhlIGZvdXIgcmVkIGNpcmNsZShzKSBvbiBpbWFnZSBpZiBuZWVkZWQgYW5kIGNsaWNrIFwiUGVyZm9ybVwiIGJ1dHRvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfUEVSRk9STTtcbiAgICAgICAgdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLnBhcmFtcy5jb250ZXh0LnBlcmZvcm1CdG5MYWJsZTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5YID0gYXJncy5nZXRGb2N1c1goKSAtIHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgLy8gbGV0IG5ld09yaWdpblkgPSBhcmdzLmdldEZvY3VzWSgpIC0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG5cbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5YID0gdGhpcy5pbWdWaWV3Lm9yaWdpblggKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgLy8gbGV0IG9sZE9yaWdpblkgPSB0aGlzLmltZ1ZpZXcub3JpZ2luWSAqIHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpO1xuICAgICAgICAgICAgdGhpcy5zdGFydFNjYWxlID0gdGhpcy5pbWdWaWV3LnNjYWxlWDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWluKDgsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLm5ld1NjYWxlKTtcblxuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuc2NhbGVZID0gdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy53aWR0aCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LmhlaWdodCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwYW4vbW92ZSBtZXRob2QsIHdoaWNoIG1vdmVzIGltYWdlIHdoZW4gdXNlciBwcmVzcyAmIGRyYWcgd2l0aCBhIGZpbmdlciBhcm91bmRcbiAgICAgKiB0aGUgaW1hZ2UgYXJlYS4gSGVyZSB0aGUgaW1hZ2UncyB0cmFsYXRlWC90cmFuc2xhdGVZIHZhbHVlcyBhcmUgYmVlbiBjYWxjdWxhdGVkXG4gICAgICogYmFzZWQgb24gdGhlIGltYWdlJ3Mgc2NhbGUsIHdpZHRoICYgaGVpZ2h0LiBBbmQgYWxzbyBpdCB0YWtlcyBjYXJlIG9mIGltYWdlIGJvdW5kYXJ5XG4gICAgICogY2hlY2tpbmcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuaW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5pbWdWaWV3Lm9yaWdpblg7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5ZO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS4gXG4gICAgICogQWN0dWFsbHkgaXQgYnJpbmdzIHRoZSBpbWFnZSB0byBpdCdzIG9yaWdpbmFsIHBvc2l0aW9ucyBhbmQgYWxzbyBhZGRzIFxuICAgICAqIGNpcmNsZSBwb2ludHMgaWYgaXQgaXMgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgICAgIHNjYWxlOiB7IHg6IDEsIHk6IDEgfSxcbiAgICAgICAgICAgICAgICBjdXJ2ZTogJ2Vhc2VPdXQnLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IDE7XG4gICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYWdlIGxvYWRlZCBtZXRob2Qgd2hpY2ggaXMgYmVlbiBjYWxsZWQgd2hlbiBkaWFsb2cgd2luZG93IGlzIGxvYWRlZCxcbiAgICAgKiB3aGVyZSBhbGwgdGhlIG5lY2Vzc2FyeSB2YWx1ZXMgZm9yIHRoZSBpbWFnZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHdpbmRvd1xuICAgICAqIGhhdmUgYmVlbiBpbml0aWFsaXplZCwgbGlrZSB0cmFuc2Zvcm1lZEltYWdlU291cmNlLCBvcmlnaW5hbEltYWdlU291cmNlICZcbiAgICAgKiByZWN0YW5nbGUgcG9pbnRzLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgY29uc3QgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzID0gcmVjUG9pbnRzU3RyVGVtcC5zcGxpdCgnIycpO1xuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuaW1nVmlldyA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ1ZpZXdJZCcpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGNpcmNsZXMgbWV0aG9kIGFkZHMgY2lyY2xlIHBvaW50cyBidG4gaW4gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QuZm9yRWFjaCgoYnRuOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcyByZW1vdmVzIGNpcmNsZSBwb2ludHMgYnRuIGZyb20gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW1vdmVDaXJjbGVzKCkge1xuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gdGhpcy5pbWdHcmlkSWQuZ2V0Q2hpbGRBdCgwKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQoaW1nRWxlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgY2lyY2xlIHBvaW50cyBiYXNlZCBvbiB0aGUgcmVjZWlldmVkIHJlY3RhbmdsZSBwb2ludHMgYW5kXG4gICAgICogaW1hZ2UncyB3aWR0aCAmIGhlaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRZID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHt9O1xuICAgICAgICBpZiAodGhpcy5yZWN0YW5nbGVQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50SW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludHMgPSBwb2ludC5zcGxpdCgnJScpO1xuICAgICAgICAgICAgICAgIGxldCBib3R0b21DaXJjbGVSYWRpdXMgPSB0aGlzLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgICAgICAvLyBsZXQgcG9pbnREaWZmWCA9IDA7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlkgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGlmIChwb2ludEluZGV4ID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAxMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMykge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gNCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGlmIChwb2ludEluZGV4KysgPiAyKSB7IC8vIEZvciBjaGVja2luZyBib3R0b24gcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbUNpcmNsZVJhZGl1cyA9IGJvdHRvbUNpcmNsZVJhZGl1cyAqIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB0b3BMZWZ0LnggPSB0b3BMZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BMZWZ0LnkgPSB0b3BMZWZ0LnkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC54ID0gdG9wUmlnaHQueCArIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcFJpZ2h0LnkgPSB0b3BSaWdodC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueCA9IGJvdHRvbVJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21SaWdodC55ID0gYm90dG9tUmlnaHQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueCA9IGJvdHRvbUxlZnQueCAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueSA9IGJvdHRvbUxlZnQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBhY3R1YWxQb2ludCA9IHsgeDogKCtwb2ludHNbMF0gKyBwb2ludERpZmZYKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgLy8geTogKCgrcG9pbnRzWzFdK3BvaW50RGlmZlkpICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpXG4gICAgICAgICAgICAgICAgLy8gKyBjaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgICAgICBhY3R1YWxQb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKCtwb2ludHNbMF0pICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAgICAgeTogKCgrcG9pbnRzWzFdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKSArIGJvdHRvbUNpcmNsZVJhZGl1cywgaWQ6IHRoaXMucG9pbnRzQ291bnRlcixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogMCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiAwLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGgsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuXG4gICAgICAgICAgICAvLyAgICAgbGV0IGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgY2lyY2xlIHBvaW50cyBidXR0b24gb24gb3JpZ2luYWwgaW1hZ2Ugdmlld1xuICAgICAqIGJhc2VkIG9uIHRoZSBwb2ludHMgcmVjZWlldmVkIHZpYSBhY3R1YWxQb2ludCBhbmQgYWxzbyB0YWtlc1xuICAgICAqIGNhcmUgb2YgYm91bmRhcnkgY2hlY2tpbmcgd2hpbGUgZGlwbGF5aW5nIGl0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhY3R1YWxQb2ludCBDb250YWlucyBjaXJjbGUgcG9pbnRzKHgseSlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludDogYW55KTogYW55IHtcbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWCA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCAvIDIpIC0gdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGg7XG4gICAgICAgIGNvbnN0IGFjdHVhbFBvaW50RGVsdGFZID0gKHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCAvIDIpIC0gdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0O1xuXG4gICAgICAgIGNvbnN0IGZvcm1hdHRlZFN0cmluZyA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuRm9ybWF0dGVkU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGljb25TcGFuID0gbmV3IGZvcm1hdHRlZFN0cmluZ01vZHVsZS5TcGFuKCk7XG4gICAgICAgIGljb25TcGFuLmNzc0NsYXNzZXMuYWRkKCdmYScpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnY2lyY2xlLXBsdXMnKTtcbiAgICAgICAgaWNvblNwYW4udGV4dCA9IFN0cmluZy5mcm9tQ2hhckNvZGUoMHhmMDY3KTtcblxuICAgICAgICBmb3JtYXR0ZWRTdHJpbmcuc3BhbnMucHVzaChpY29uU3Bhbik7XG4gICAgICAgIGNvbnN0IGNpcmNsZUJ0bjogYW55ID0gbmV3IGJ1dHRvbnMuQnV0dG9uKCk7XG4gICAgICAgIGNpcmNsZUJ0bi5jc3NDbGFzc2VzLmFkZCgnY2lyY2xlJyk7XG5cbiAgICAgICAgY2lyY2xlQnRuLmlkID0gdGhpcy5wb2ludHNDb3VudGVyKys7XG4gICAgICAgIGNpcmNsZUJ0bi5mb3JtYXR0ZWRUZXh0ID0gZm9ybWF0dGVkU3RyaW5nO1xuICAgICAgICBjaXJjbGVCdG4ub24oJ3BhbicsIChhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTE1O1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gKzEwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTEwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50LmlkID09PSBjaXJjbGVCdG4uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueCA9IGNpcmNsZUJ0bi50cmFuc2xhdGVYIC0gYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnkgPSBjaXJjbGVCdG4udHJhbnNsYXRlWSAtIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IGFjdHVhbFBvaW50LnggKyBhY3R1YWxQb2ludERlbHRhWDtcbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSBhY3R1YWxQb2ludC55ICsgYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA+IDAgJiZcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID4gdGhpcy5jZW50ZXJQb2ludFgpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gdGhpcy5jZW50ZXJQb2ludFg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCAmJlxuICAgICAgICAgICAgKGNpcmNsZUJ0bi50cmFuc2xhdGVYICogLTEpID4gdGhpcy5jZW50ZXJQb2ludFgpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gdGhpcy5jZW50ZXJQb2ludFggKiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA+IHRoaXMuY2VudGVyUG9pbnRZKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IHRoaXMuY2VudGVyUG9pbnRZO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWSAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRZKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IHRoaXMuY2VudGVyUG9pbnRZICogLTE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QucHVzaChjaXJjbGVCdG4pO1xuICAgICAgICB0aGlzLnBvaW50cy5wdXNoKGFjdHVhbFBvaW50KTtcbiAgICAgICAgcmV0dXJuIGNpcmNsZUJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHRoZSBpbWFnZSB0aGF0IGl0IGlzIHdpdGhpbiB0aGUgaW1hZ2UgdmlldyBib3VuZGFyeSBvciBub3QuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVggSW1hZ2UgdHJhbnNsYXRlWFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVZIEltYWdlIHRyYW5zbGF0ZVlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrQm91bmRhcnkodHJhbnNsYXRlWDogYW55LCB0cmFuc2xhdGVZOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBwb2ludEFkanVzdG1lbnQgPSA1OyAvLyBOZWVkIHRvIGFkanVzdCB0aGUgY2VudGVyIHBvaW50IHZhbHVlIHRvIGNoZWNrIHRoZSBib3VuZGFyeVxuICAgICAgICBpZiAodHJhbnNsYXRlWCA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgIHRyYW5zbGF0ZVkgPCAodGhpcy5jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWCAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVZICogLTEpIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==