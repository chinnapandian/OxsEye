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
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
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
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.removeCircles();
    };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWFsb2cuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEwQztBQUMxQyxrRUFBc0U7QUFJdEUsb0ZBQXNHO0FBRXRHLHVEQUFzRDtBQUV0RCxxREFBOEM7QUFFOUMsc0RBQXdEO0FBQ3hELDBDQUE0QztBQUM1QyxvREFBc0Q7QUFDdEQsOEVBQWdGO0FBQ2hGLG9EQUFzRDtBQUV0RCx3REFBd0Q7QUFFeEQsOEJBQThCO0FBQzlCLElBQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM5QiwrQkFBK0I7QUFDL0IsSUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBRWhDOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBaUR0QixpQ0FBaUM7SUFDakMsa0RBQWtEO0lBRWxEOzs7OztPQUtHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ3pCLHdCQUFrRCxFQUNsRCxNQUFvQixFQUNwQixNQUFTO1FBSFQsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFDekIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUF4RDdCLDBFQUEwRTtRQUNuRSxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUF1QmhDLHdDQUF3QztRQUNoQyxlQUFVLEdBQUcsQ0FBQyxDQUFDO1FBS3ZCLHVEQUF1RDtRQUMvQyxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLHdEQUF3RDtRQUNoRCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsc0ZBQXNGO1FBQzlFLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUtyQyxnRUFBZ0U7UUFDeEQsaUJBQVksR0FBRyxFQUFFLENBQUM7UUFjdEIsSUFBSSxDQUFDLGFBQWEs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LENBQUM7WUFDbEQsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDO1lBQ3pELENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1RCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFTCxvQkFBQztBQUFELENBQUMsQUE3ZEQsSUE2ZEM7QUE3ZFksYUFBYTtJQU56QixnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixDQUFDO1FBQ3JDLFdBQVcsRUFBRSx5QkFBeUI7S0FDekMsQ0FBQztxQ0EyRDhCLGdDQUFpQixzQkFDQyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQTdEcEIsYUFBYSxDQTZkekI7QUE3ZFksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nUGFyYW1zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RpbWVyJztcbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuXG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuaW1wb3J0ICogYXMgb3JpZW50YXRpb24gZnJvbSAnbmF0aXZlc2NyaXB0LW9yaWVudGF0aW9uJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3BsYXRmb3JtJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlZFN0cmluZ01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RleHQvZm9ybWF0dGVkLXN0cmluZyc7XG5pbXBvcnQgKiBhcyBidXR0b25zIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvYnV0dG9uJztcblxuLy8gaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcblxuLyoqIExhYmxlIGZvciAnTWFudWFsJyB0ZXh0ICovXG5jb25zdCBMQUJMRV9NQU5VQUwgPSAnTWFudWFsJztcbi8qKiBMYWJsZSBmb3IgJ1BlcmZvcm0nIHRleHQgKi9cbmNvbnN0IExBQkxFX1BFUkZPUk0gPSAnUGVyZm9ybSc7XG5cbi8qKlxuICogRGlhbG9nIGNvbnRlbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbW9kYWwtY29udGVudCcsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9kaWFsb2cuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50IHtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRydWUvZmFsc2UgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBhdXRvbWF0aWNhbGx5IG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBidXR0b24gbGFiZWwgbmFtZSBlaXRoZXIgJ01hbnVhbCcvICdQZXJmb3JtJyAqL1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgZm91ciBwb2ludHMgb2YgdGhlIGltYWdlcy4gKi9cbiAgICBwcml2YXRlIHBvaW50czogYW55O1xuICAgIC8qKiBJbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwb2ludHMuICovXG4gICAgcHJpdmF0ZSBwb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyBvcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9yZ09sZDogYW55O1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgdHJhbnNmb3JtZWQgaW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2VPbGQ6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJhbnNmb3JtZWQgaW1hZ2UgYWN0dWFsIHNpemUuICovXG4gICAgcHJpdmF0ZSBpbWFnZUFjdHVhbFNpemU6IGFueTtcbiAgICAvKiogTGlzdCBvZiBjaXJjbGUgYnV0dG9ucyAqL1xuICAgIHByaXZhdGUgY2lyY2xlQnRuTGlzdDogYW55O1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIGltZ1ZpZXc6IGFueTtcbiAgICAvKiogSW1hZ2UgZ3JpZCBpZC4gKi9cbiAgICBwcml2YXRlIGltZ0dyaWRJZDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVguICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWS4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc3RhcnRpbmcgc2NhbGUuICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WC4gKi9cbiAgICBwcml2YXRlIGNlbnRlclBvaW50WDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRZLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRZOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIG5ldyBzY2FsZSB3aGlsZSBtb3ZpbmcgYXJvdW5kLiAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBTdG9yZXMgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogU3RvcmVzIG9sZCB0cmFuc2xhdGVZIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdC4gKi9cbiAgICBwcml2YXRlIGlzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSdzIHNjcmVlbiBsb2NhdGlvbi4gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIC8qKiBTdG9yZXMgcmVjdGFuZ2xlIHBvaW50cyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQ1YgQVBJIGNhbGwuICovXG4gICAgcHJpdmF0ZSByZWN0YW5nbGVQb2ludHM6IGFueTtcbiAgICAvKiogVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlICovXG4gICAgcHJpdmF0ZSBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAvLyBwcml2YXRlIF9kcmFnSW1hZ2VJdGVtOiBJbWFnZTtcbiAgICAvLyBAVmlld0NoaWxkKCdpbWdWaWV3SWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIERpYWxvZ0NvbnRlbnQgY2xhc3MuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcGFyYW1zIGNvbnRhaW5zIGNhcHR1cmVkIGltYWdlIGZpbGUgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHRyYW5zZm9ybWVkIGltYWdlIHByb3ZpZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zLFxuICAgICAgICAgICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgICAgICAgICBwcml2YXRlIGxvY2FsZTogTCkge1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSBMQUJMRV9NQU5VQUw7XG4gICAgICAgIC8vIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdtYW51YWwnKTtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSA8SW1hZ2U+dGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsb3NlIG1ldGhvZCwgd2hpY2ggY2xvc2UgdGhlIGRpYWxvZyB3aW5kb3cgb3BlbmVkIGFmdGVyIGNhcHR1cmVkIGltYWdlIGZyb20gY2FtZXJhLlxuICAgICAqIEFuZCByZXR1cm5zIGJhY2sgdG8gdGhlIHBsYWNlIHdoZXJlIHRoZSBkaWFsb2cgd2luZG93IGdvdCB0cmlnZ2VyZWQsIGFsb25nIHdpdGhcbiAgICAgKiB0aGUgcGFyYW1ldGVyICdyZXN1bHQnXG4gICAgICogQHBhcmFtIHJlc3VsdCBXaGljaCBpcyBub3RoaW5nIGJ1dCBlbXB0eSBzdHJpbmcgb3IgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIHN0cmluZ1xuICAgICAqL1xuICAgIGNsb3NlKHJlc3VsdDogc3RyaW5nKSB7XG4gICAgICAgIG9yaWVudGF0aW9uLmVuYWJsZVJvdGF0aW9uKCk7XG4gICAgICAgIHRoaXMucGFyYW1zLmNsb3NlQ2FsbGJhY2socmVzdWx0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyZm9ybWluZyBtYW51YWwgdHJhbnNmb3JtYXRpb25cbiAgICAgKiB0aGlzIGlzIGJlZW4gdXNlZCB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uIG1hbnVhbGx5LCB3aGVyZSB0aGUgcmVjdGFuZ2xlXG4gICAgICogcG9pbnRzIHdpbGwgYmUgY2hvb3NlbiBieSB1c2VyIGluIHRoZSBjYXB0dXJlZCBpbWFnZSBkaXNwbGF5aW5nIGluIHRoZSBkaWFsb2cgd2luZG93LlxuICAgICAqIEluIHRoZSBkaWFsb2cgd2luZG93LCB0aGVyZSBhcmUgZm91ciBjaXJjbGVzIGFyZSBiZWluZyB1c2VkIHRvIHNlbGVjdCBwb2ludHMuXG4gICAgICogQmFzZWQgb24gdGhlIHNlbGVjdGVkIHBvaW50cywgdGhlIHRyYW5zZm9ybWF0aW9uIHdpbGwgYmUgcGVyZm9ybWVkIGhlcmUuXG4gICAgICovXG4gICAgcGVyZm9ybU1hbnVhbENvcnJlY3Rpb24oKSB7XG4gICAgICAgIGxldCBwb2ludHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgIHBvaW50c0NvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRvIGdldCBhY2N1cmF0ZSBwb3NpdGlvbiwgbmVlZCB0byBhZGp1c3QgdGhlIHJhZGl1cyB2YWx1ZTtcbiAgICAgICAgLy8gY29uc3QgY2lyY2xlUmFkaXVzID0gMTc7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzBdLnkgPSArdGhpcy5wb2ludHNbMF0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMV0ueSA9ICt0aGlzLnBvaW50c1sxXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1syXS55ID0gK3RoaXMucG9pbnRzWzJdLnkgKyBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzNdLnkgPSArdGhpcy5wb2ludHNbM10ueSArIGNpcmNsZVJhZGl1cztcblxuICAgICAgICBjb25zdCBwb2ludDBZID0gKCt0aGlzLnBvaW50c1swXS55IC0gdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICBjb25zdCBwb2ludDFZID0gKCt0aGlzLnBvaW50c1sxXS55IC0gdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHMgPSB0aGlzLnBvaW50c1swXS54ICsgJy0nICsgKChwb2ludDBZIDwgMCkgPyAwIDogcG9pbnQwWSkgKyAnIydcbiAgICAgICAgICAgICsgdGhpcy5wb2ludHNbMV0ueCArICctJyArICgocG9pbnQxWSA8IDApID8gMCA6IHBvaW50MVkpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzJdLnggKyAnLScgKyAoK3RoaXMucG9pbnRzWzJdLnkgKyB0aGlzLmNpcmNsZVJhZGl1cykgKyAnIydcbiAgICAgICAgICAgICsgdGhpcy5wb2ludHNbM10ueCArICctJyArICgrdGhpcy5wb2ludHNbM10ueSArIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9sZCA9IHRoaXMuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBPcGVuQ1ZXcmFwcGVyLnBlcmZvcm1QZXJzcGVjdGl2ZUNvcnJlY3Rpb25NYW51YWwodGhpcy5pbWFnZVNvdXJjZU9yZywgcmVjdGFuZ2xlUG9pbnRzLFxuICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggKyAnLScgKyB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5pbWFnZVNvdXJjZU9yZ09sZDtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfTUFOVUFMO1xuICAgICAgICAvLyB0aGlzLm1hbnVhbFBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG9yaWdpbmFsIGltYWdlLCBpcyBiZWluZyB1c2VkIHRvIHNob3cgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiB3aGVuIHRoZSAnTWFudWFsJyBidXR0b24gaXMgYmVlbiBwcmVzc2VkLCB0aGlzIGlzIHdoZXJlIHVzZXIgY2FuIHNlbGVjdCBkZXNpcmVkIHBvaW50c1xuICAgICAqIGFuZCBwZXJmb3JtIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbi4gSXQgaXMgYWxzbyBpbnRpYWxpemluZyBjaXJjbGUgcG9pbnRzIHRvIGJlIGRpc3BsYXllZFxuICAgICAqIGluIHRoZSBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBzaG93T3JpZ2luYWxJbWFnZSgpIHtcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMub25Eb3VibGVUYXAoKTtcbiAgICAgICAgaWYgKHRoaXMuY2lyY2xlQnRuTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZWN0YW5nbGVfcG9pbnRzX2luZm8nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfUEVSRk9STTtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxQZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gTEFCTEVfUEVSRk9STSkge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWTtcblxuICAgICAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5YID0gdGhpcy5pbWdWaWV3Lm9yaWdpblggKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0U2NhbGUgPSB0aGlzLmltZ1ZpZXcuc2NhbGVYO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gTWF0aC5taW4oOCwgdGhpcy5uZXdTY2FsZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLm5ld1NjYWxlKTtcblxuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy53aWR0aCA9IHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy5oZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuaW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5pbWdWaWV3Lm9yaWdpblg7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5ZO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBBY3R1YWxseSBpdCBicmluZ3MgdGhlIGltYWdlIHRvIGl0J3Mgb3JpZ2luYWwgcG9zaXRpb25zIGFuZCBhbHNvIGFkZHNcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKCkge1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gZGlhbG9nIHdpbmRvdyBpcyBsb2FkZWQsXG4gICAgICogd2hlcmUgYWxsIHRoZSBuZWNlc3NhcnkgdmFsdWVzIGZvciB0aGUgaW1hZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB3aW5kb3dcbiAgICAgKiBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQsIGxpa2UgdHJhbnNmb3JtZWRJbWFnZVNvdXJjZSwgb3JpZ2luYWxJbWFnZVNvdXJjZSAmXG4gICAgICogcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgY29uc3QgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzID0gcmVjUG9pbnRzU3RyVGVtcC5zcGxpdCgnIycpO1xuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuaW1nVmlldyA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ1ZpZXdJZCcpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGNpcmNsZXMgbWV0aG9kIGFkZHMgY2lyY2xlIHBvaW50cyBidG4gaW4gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QuZm9yRWFjaCgoYnRuOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcyByZW1vdmVzIGNpcmNsZSBwb2ludHMgYnRuIGZyb20gb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW1vdmVDaXJjbGVzKCkge1xuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gdGhpcy5pbWdHcmlkSWQuZ2V0Q2hpbGRBdCgwKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQoaW1nRWxlbWVudCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgY2lyY2xlIHBvaW50cyBiYXNlZCBvbiB0aGUgcmVjZWlldmVkIHJlY3RhbmdsZSBwb2ludHMgYW5kXG4gICAgICogaW1hZ2UncyB3aWR0aCAmIGhlaWdodC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRZID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHt9O1xuICAgICAgICBpZiAodGhpcy5yZWN0YW5nbGVQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50SW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5yZWN0YW5nbGVQb2ludHMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludHMgPSBwb2ludC5zcGxpdCgnJScpO1xuICAgICAgICAgICAgICAgIGxldCBib3R0b21DaXJjbGVSYWRpdXMgPSB0aGlzLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgICAgICAvLyBsZXQgcG9pbnREaWZmWCA9IDA7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlkgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGlmIChwb2ludEluZGV4ID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAxMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMykge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gNCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGlmIChwb2ludEluZGV4KysgPiAyKSB7IC8vIEZvciBjaGVja2luZyBib3R0b24gcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbUNpcmNsZVJhZGl1cyA9IGJvdHRvbUNpcmNsZVJhZGl1cyAqIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB0b3BMZWZ0LnggPSB0b3BMZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BMZWZ0LnkgPSB0b3BMZWZ0LnkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC54ID0gdG9wUmlnaHQueCArIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcFJpZ2h0LnkgPSB0b3BSaWdodC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueCA9IGJvdHRvbVJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21SaWdodC55ID0gYm90dG9tUmlnaHQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueCA9IGJvdHRvbUxlZnQueCAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueSA9IGJvdHRvbUxlZnQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBhY3R1YWxQb2ludCA9IHsgeDogKCtwb2ludHNbMF0gKyBwb2ludERpZmZYKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgLy8geTogKCgrcG9pbnRzWzFdK3BvaW50RGlmZlkpICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpXG4gICAgICAgICAgICAgICAgLy8gKyBjaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgICAgICBhY3R1YWxQb2ludCA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKCtwb2ludHNbMF0pICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAgICAgeTogKCgrcG9pbnRzWzFdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKSArIGJvdHRvbUNpcmNsZVJhZGl1cywgaWQ6IHRoaXMucG9pbnRzQ291bnRlcixcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogMCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiAwLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGgsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuXG4gICAgICAgICAgICAvLyAgICAgbGV0IGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmNlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLmNlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgY2lyY2xlIHBvaW50cyBidXR0b24gb24gb3JpZ2luYWwgaW1hZ2Ugdmlld1xuICAgICAqIGJhc2VkIG9uIHRoZSBwb2ludHMgcmVjZWlldmVkIHZpYSBhY3R1YWxQb2ludCBhbmQgYWxzbyB0YWtlc1xuICAgICAqIGNhcmUgb2YgYm91bmRhcnkgY2hlY2tpbmcgd2hpbGUgZGlwbGF5aW5nIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFjdHVhbFBvaW50IENvbnRhaW5zIGNpcmNsZSBwb2ludHMoeCx5KVxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50OiBhbnkpOiBhbnkge1xuICAgICAgICAvLyBTaW5jZSB0aGUgc2VsZWN0ZWQgcG9pbnQgYnkgdXNlciBpcyBhbHdheXMgcG9pbnRpbmcgdG9cbiAgICAgICAgLy8gY2VudGVyIG9mIHRoZSBpbWFnZSAod2hpY2ggaXMgKDAsMCkpLCBzbyBuZWVkIHRvIHNlbGVjdFxuICAgICAgICAvLyB0b3AtbGVmdCwgdG9wLXJpZ2h0ICYgYm90dG9tLWxlZnQsIGZvciB3aGljaCB0aGUgYWN0dWFsUG9pbnREZWx0YVgvYWN0dWFsUG9pbnREZWx0YVlcbiAgICAgICAgLy8gYXJlIHVzZWQuXG4gICAgICAgIGNvbnN0IGFjdHVhbFBvaW50RGVsdGFYID0gKHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoIC8gMikgLSB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aDtcbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVkgPSAodGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0IC8gMikgLSB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gbmV3IGZvcm1hdHRlZFN0cmluZ01vZHVsZS5Gb3JtYXR0ZWRTdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaWNvblNwYW4gPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLlNwYW4oKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2ZhJyk7XG4gICAgICAgIGljb25TcGFuLmNzc0NsYXNzZXMuYWRkKCdjaXJjbGUtcGx1cycpO1xuICAgICAgICBpY29uU3Bhbi50ZXh0ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNjcpO1xuXG4gICAgICAgIGZvcm1hdHRlZFN0cmluZy5zcGFucy5wdXNoKGljb25TcGFuKTtcbiAgICAgICAgY29uc3QgY2lyY2xlQnRuOiBhbnkgPSBuZXcgYnV0dG9ucy5CdXR0b24oKTtcbiAgICAgICAgY2lyY2xlQnRuLmNzc0NsYXNzZXMuYWRkKCdjaXJjbGUnKTtcblxuICAgICAgICBjaXJjbGVCdG4uaWQgPSB0aGlzLnBvaW50c0NvdW50ZXIrKztcbiAgICAgICAgY2lyY2xlQnRuLmZvcm1hdHRlZFRleHQgPSBmb3JtYXR0ZWRTdHJpbmc7XG4gICAgICAgIGNpcmNsZUJ0bi5vbigncGFuJywgKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSAtMTU7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IC0zMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gKzEwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTEwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnQuaWQgPT09IGNpcmNsZUJ0bi5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC54ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVggLSBhY3R1YWxQb2ludERlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueSA9IGNpcmNsZUJ0bi50cmFuc2xhdGVZIC0gYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMykge1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTaW5jZSB0aGUgc2VsZWN0ZWQgcG9pbnQgYnkgdXNlciBpcyBhbHdheXMgcG9pbnRpbmcgdG9cbiAgICAgICAgLy8gY2VudGVyIG9mIHRoZSBpbWFnZSAod2hpY2ggaXMgKDAsMCkpLCBzbyBuZWVkIHRvIHNlbGVjdFxuICAgICAgICAvLyB0b3AtbGVmdCwgdG9wLXJpZ2h0ICYgYm90dG9tLWxlZnQsIGZvciB3aGljaCB0aGUgYWN0dWFsUG9pbnREZWx0YVgvYWN0dWFsUG9pbnREZWx0YVlcbiAgICAgICAgLy8gYXJlIHVzZWQuXG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gYWN0dWFsUG9pbnQueCArIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IGFjdHVhbFBvaW50LnkgKyBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiB0aGlzLmNlbnRlclBvaW50WCkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSB0aGlzLmNlbnRlclBvaW50WDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggKiAtMSkgPiB0aGlzLmNlbnRlclBvaW50WCkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSB0aGlzLmNlbnRlclBvaW50WCAqIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA+IDAgJiZcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gdGhpcy5jZW50ZXJQb2ludFkpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gdGhpcy5jZW50ZXJQb2ludFk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZIDwgMCAmJlxuICAgICAgICAgICAgKGNpcmNsZUJ0bi50cmFuc2xhdGVZICogLTEpID4gdGhpcy5jZW50ZXJQb2ludFkpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gdGhpcy5jZW50ZXJQb2ludFkgKiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdC5wdXNoKGNpcmNsZUJ0bik7XG4gICAgICAgIHRoaXMucG9pbnRzLnB1c2goYWN0dWFsUG9pbnQpO1xuICAgICAgICByZXR1cm4gY2lyY2xlQnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3MgdGhlIGltYWdlIHRoYXQgaXQgaXMgd2l0aGluIHRoZSBpbWFnZSB2aWV3IGJvdW5kYXJ5IG9yIG5vdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVYIEltYWdlIHRyYW5zbGF0ZVhcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWSBJbWFnZSB0cmFuc2xhdGVZXG4gICAgICovXG4gICAgcHJpdmF0ZSBjaGVja0JvdW5kYXJ5KHRyYW5zbGF0ZVg6IGFueSwgdHJhbnNsYXRlWTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgcG9pbnRBZGp1c3RtZW50ID0gNTsgLy8gTmVlZCB0byBhZGp1c3QgdGhlIGNlbnRlciBwb2ludCB2YWx1ZSB0byBjaGVjayB0aGUgYm91bmRhcnlcbiAgICAgICAgaWYgKHRyYW5zbGF0ZVggPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICB0cmFuc2xhdGVZIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVggKiAtMSkgPCAodGhpcy5jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWSAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=