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
var orientation = require("nativescript-orientation");
var Toast = require("nativescript-toast");
var platform = require("tns-core-modules/platform");
var formattedStringModule = require("tns-core-modules/text/formatted-string");
var buttons = require("tns-core-modules/ui/button");
var opencv = require("nativescript-opencv-plugin");
/**
 * Dialog content class.
 */
var DialogContent = (function () {
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
    // private points = new ObservableArray();
    /**
     * Constructor for DialogContent class.
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    function DialogContent(params, transformedImageProvider) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
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
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    /**
     * Performing manual transformation
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
        if (pointsCount !== 4) {
            alert('Please select only four points.');
        }
        else {
            var point0Y = (+this.points[0].y - this.circleRadius);
            var point1Y = (+this.points[1].y - this.circleRadius);
            var rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
                + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
                + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
                + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
            console.log(rectanglePoints);
            console.log(this.imageSourceOrg);
            console.log(this.imageActualSize.width + '-' + this.imageActualSize.height);
            this.imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this.imageActualSize.width + '-' + this.imageActualSize.height);
            transformedimage_provider_1.SendBroadcastImage(this.imageSource);
            timer_1.setTimeout(function () {
                _this.transformedImageProvider.deleteFile(_this.imageSourceOld);
            }, 1000);
            this.imageSourceOrg = this.imageSourceOrgOld;
            this.isAutoCorrection = true;
            this.manualBtnText = 'Manual';
            this.removeCircles();
            // this.pointsCounter = 0;
            this.transformedImageProvider.DeleteFiles();
        }
    };
    /**
     * Gets rectangle points.
     * @param event Gesture event data
     */
    DialogContent.prototype.getPoints = function (event) {
        try {
            if (this.manualBtnText === 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                var scale = platform.screen.mainScreen.scale;
                this.imageActualSize = this.imgView.getActualSize();
                var pointX = event.android.getX() / scale;
                var pointY = event.android.getY() / scale;
                var actualPoint = { x: pointX, y: pointY, id: this.pointsCounter };
                if (this.points.length >= 4) {
                    Toast.makeText('Please select only four points.', 'long').show();
                }
                else {
                    this.imgGridId.addChild(this.createCircle(actualPoint));
                }
            }
        }
        catch (e) {
            alert(e);
        }
    };
    /**
     * Show original image.
     */
    DialogContent.prototype.showOriginalImage = function () {
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText('Please move around the four red circle(s) on image if needed and click "Perform" button.', 'long').show();
        }
        this.isAutoCorrection = false;
        this.manualBtnText = 'Perform';
        this.pointsCounter = 0;
        this.addCircles();
    };
    /**
     * On event pinch
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
     * On event pan/move
     * @param args PanGesture event data
     */
    DialogContent.prototype.onPan = function (args) {
        var screenLocation = this.imgView.getLocationOnScreen();
        if (this.manualBtnText !== 'Perform') {
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
     * Event fires on double tap
     */
    DialogContent.prototype.onDoubleTap = function () {
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
        }
        else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    };
    /**
     * On event page loaded.
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
     * Add circles.
     */
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this.circleBtnList.forEach(function (btn) {
            _this.imgGridId.addChild(btn);
        });
    };
    /**
     * Remove circles.
     */
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
    };
    /**
     * Initialize points
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
            console.log('this.rectanglePoints: ' + JSON.stringify(this.rectanglePoints));
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
                console.log('actualPoint : ' + JSON.stringify(actualPoint));
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
     * Create circles.
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
     * Check screen boundary.
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
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object])
], DialogContent);
exports.DialogContent = DialogContent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTBDO0FBQzFDLGtFQUFzRTtBQUN0RSxnREFBb0Q7QUFHcEQsb0ZBQXNHO0FBRXRHLHNEQUF3RDtBQUN4RCwwQ0FBNEM7QUFDNUMsb0RBQXNEO0FBQ3RELDhFQUFnRjtBQUNoRixvREFBc0Q7QUFFdEQsbURBQXFEO0FBQ3JEOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBaUR0QixpQ0FBaUM7SUFDakMsa0RBQWtEO0lBRWxELDBDQUEwQztJQUUxQzs7OztPQUlHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ2pDLHdCQUFrRDtRQUQxQyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUNqQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBdkQ5RCwwRUFBMEU7UUFDbkUscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBdUJoQyx3Q0FBd0M7UUFDaEMsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUt2Qix1REFBdUQ7UUFDL0MsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNyQix3REFBd0Q7UUFDaEQsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIsd0RBQXdEO1FBQ2hELGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLHNGQUFzRjtRQUM5RSx5QkFBb0IsR0FBRyxLQUFLLENBQUM7UUFLckMsZ0VBQWdFO1FBQ3hELGlCQUFZLEdBQUcsRUFBRSxDQUFDO1FBYXRCLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3hCLDhEQUE4RDtJQUNsRSxDQUFDO0lBQ0Q7OztP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IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dQYXJhbXMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGltZXInO1xuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKiBhcyBvcmllbnRhdGlvbiBmcm9tICduYXRpdmVzY3JpcHQtb3JpZW50YXRpb24nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvcGxhdGZvcm0nO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVkU3RyaW5nTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGV4dC9mb3JtYXR0ZWQtc3RyaW5nJztcbmltcG9ydCAqIGFzIGJ1dHRvbnMgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9idXR0b24nO1xuXG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuLyoqXG4gKiBEaWFsb2cgY29udGVudCBjbGFzcy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdtb2RhbC1jb250ZW50JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2RpYWxvZy5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRlbnQge1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBhbnk7XG4gICAgLyoqIE9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJ1ZS9mYWxzZSB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uIGF1dG9tYXRpY2FsbHkgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgLyoqIENvbnRhaW5zIGJ1dHRvbiBsYWJlbCBuYW1lIGVpdGhlciAnTWFudWFsJy8gJ1BlcmZvcm0nICovXG4gICAgcHVibGljIG1hbnVhbEJ0blRleHQ6IHN0cmluZztcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBmb3VyIHBvaW50cyBvZiB0aGUgaW1hZ2VzLiAqL1xuICAgIHByaXZhdGUgcG9pbnRzOiBhbnk7XG4gICAgLyoqIEluZGljYXRlcyB0aGUgbnVtYmVyIG9mIHBvaW50cy4gKi9cbiAgICBwcml2YXRlIHBvaW50c0NvdW50ZXI6IG51bWJlcjtcbiAgICAvKiogU3RvcmVzIHByZXZpb3VzIG9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwcml2YXRlIGltYWdlU291cmNlT3JnT2xkOiBhbnk7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyB0cmFuc2Zvcm1lZCBpbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9sZDogYW55O1xuICAgIC8qKiBDb250YWlucyB0cmFuc2Zvcm1lZCBpbWFnZSBhY3R1YWwgc2l6ZS4gKi9cbiAgICBwcml2YXRlIGltYWdlQWN0dWFsU2l6ZTogYW55O1xuICAgIC8qKiBMaXN0IG9mIGNpcmNsZSBidXR0b25zICovXG4gICAgcHJpdmF0ZSBjaXJjbGVCdG5MaXN0OiBhbnk7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgaW1nVmlldzogYW55O1xuICAgIC8qKiBJbWFnZSBncmlkIGlkLiAqL1xuICAgIHByaXZhdGUgaW1nR3JpZElkOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWC4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVg6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgcHJldmlvdXMgZGVsdGFZLiAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWTogbnVtYmVyO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzdGFydGluZyBzY2FsZS4gKi9cbiAgICBwcml2YXRlIHN0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRYLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRYOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIGNlbnRlciBwb2ludFkuICovXG4gICAgcHJpdmF0ZSBjZW50ZXJQb2ludFk6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgbmV3IHNjYWxlIHdoaWxlIG1vdmluZyBhcm91bmQuICovXG4gICAgcHJpdmF0ZSBuZXdTY2FsZSA9IDE7XG4gICAgLyoqIFN0b3JlcyBvbGQgVHJhbnNsYXRlWCB2YWx1ZSBvZiB0cmFuc2Zvcm1lZCBJbWFnZS4gKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIC8qKiBTdG9yZXMgb2xkIHRyYW5zbGF0ZVkgdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVZID0gMDtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90LiAqL1xuICAgIHByaXZhdGUgaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogU3RvcmVzIHRyYW5zZm9ybWVkIGltYWdlJ3Mgc2NyZWVuIGxvY2F0aW9uLiAqL1xuICAgIHByaXZhdGUgZGVmYXVsdFNjcmVlbkxvY2F0aW9uOiBhbnk7XG4gICAgLyoqIFN0b3JlcyByZWN0YW5nbGUgcG9pbnRzIHRvIGJlIHVzZWQgaW4gdGhlIE9wZW5DViBBUEkgY2FsbC4gKi9cbiAgICBwcml2YXRlIHJlY3RhbmdsZVBvaW50czogYW55O1xuICAgIC8qKiBUbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWUgKi9cbiAgICBwcml2YXRlIGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgIC8vIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8vIEBWaWV3Q2hpbGQoJ2ltZ1ZpZXdJZCcpIF9kcmFnSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICAvLyBwcml2YXRlIHBvaW50cyA9IG5ldyBPYnNlcnZhYmxlQXJyYXkoKTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBEaWFsb2dDb250ZW50IGNsYXNzLlxuICAgICAqIEBwYXJhbSBwYXJhbXMgY29udGFpbnMgY2FwdHVyZWQgaW1hZ2UgZmlsZSBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgdHJhbnNmb3JtZWQgaW1hZ2UgcHJvdmlkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmFtczogTW9kYWxEaWFsb2dQYXJhbXMsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ01hbnVhbCc7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtID0gPEltYWdlPnRoaXMuX2RyYWdJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbG9zZVxuICAgICAqIEBwYXJhbSByZXN1bHQgV2hpY2ggaXMgbm90aGluZyBidXQgZW1wdHkgc3RyaW5nIG9yIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBzdHJpbmdcbiAgICAgKi9cbiAgICBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1pbmcgbWFudWFsIHRyYW5zZm9ybWF0aW9uXG4gICAgICovXG4gICAgcGVyZm9ybU1hbnVhbENvcnJlY3Rpb24oKSB7XG4gICAgICAgIGxldCBwb2ludHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgIHBvaW50c0NvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFRvIGdldCBhY2N1cmF0ZSBwb3NpdGlvbiwgbmVlZCB0byBhZGp1c3QgdGhlIHJhZGl1cyB2YWx1ZTtcbiAgICAgICAgLy8gY29uc3QgY2lyY2xlUmFkaXVzID0gMTc7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzBdLnkgPSArdGhpcy5wb2ludHNbMF0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMV0ueSA9ICt0aGlzLnBvaW50c1sxXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1syXS55ID0gK3RoaXMucG9pbnRzWzJdLnkgKyBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzNdLnkgPSArdGhpcy5wb2ludHNbM10ueSArIGNpcmNsZVJhZGl1cztcblxuICAgICAgICBpZiAocG9pbnRzQ291bnQgIT09IDQpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2Ugc2VsZWN0IG9ubHkgZm91ciBwb2ludHMuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBwb2ludDBZID0gKCt0aGlzLnBvaW50c1swXS55IC0gdGhpcy5jaXJjbGVSYWRpdXMpO1xuICAgICAgICAgICAgY29uc3QgcG9pbnQxWSA9ICgrdGhpcy5wb2ludHNbMV0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50cyA9IHRoaXMucG9pbnRzWzBdLnggKyAnLScgKyAoKHBvaW50MFkgPCAwKT8gMCA6IHBvaW50MFkpICsgJyMnXG4gICAgICAgICAgICAgICAgKyB0aGlzLnBvaW50c1sxXS54ICsgJy0nICsgKChwb2ludDFZIDwgMCk/IDAgOiBwb2ludDFZKSArICcjJ1xuICAgICAgICAgICAgICAgICsgdGhpcy5wb2ludHNbMl0ueCArICctJyArICgrdGhpcy5wb2ludHNbMl0ueSArIHRoaXMuY2lyY2xlUmFkaXVzKSArICcjJ1xuICAgICAgICAgICAgICAgICsgdGhpcy5wb2ludHNbM10ueCArICctJyArICgrdGhpcy5wb2ludHNbM10ueSArIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlY3RhbmdsZVBvaW50cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmltYWdlU291cmNlT3JnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPbGQgPSB0aGlzLmltYWdlU291cmNlO1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVDb3JyZWN0aW9uTWFudWFsKHRoaXMuaW1hZ2VTb3VyY2VPcmcsIHJlY3RhbmdsZVBvaW50cyxcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCArICctJyArIHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodCk7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5kZWxldGVGaWxlKHRoaXMuaW1hZ2VTb3VyY2VPbGQpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5pbWFnZVNvdXJjZU9yZ09sZDtcbiAgICAgICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnTWFudWFsJztcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgLy8gdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkRlbGV0ZUZpbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyByZWN0YW5nbGUgcG9pbnRzLlxuICAgICAqIEBwYXJhbSBldmVudCBHZXN0dXJlIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBnZXRQb2ludHMoZXZlbnQ6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgPT09ICdQZXJmb3JtJykge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRYKCkgLyBzY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFkoKSAvIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsUG9pbnQgPSB7IHg6IHBvaW50WCwgeTogcG9pbnRZLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5wb2ludHMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1BsZWFzZSBzZWxlY3Qgb25seSBmb3VyIHBvaW50cy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZCh0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYWxlcnQoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBzaG93T3JpZ2luYWxJbWFnZSgpIHtcblxuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKCk7XG4gICAgICAgIGlmICh0aGlzLmNpcmNsZUJ0bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2UgbW92ZSBhcm91bmQgdGhlIGZvdXIgcmVkIGNpcmNsZShzKSBvbiBpbWFnZSBpZiBuZWVkZWQgYW5kIGNsaWNrIFwiUGVyZm9ybVwiIGJ1dHRvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ1BlcmZvcm0nO1xuICAgICAgICB0aGlzLnBvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgcGluY2hcbiAgICAgKiBAcGFyYW0gYXJncyBQaW5jaEdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5ZID0gYXJncy5nZXRGb2N1c1koKSAtIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuXG4gICAgICAgICAgICAvLyBsZXQgb2xkT3JpZ2luWCA9IHRoaXMuaW1nVmlldy5vcmlnaW5YICogdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTY2FsZSA9IHRoaXMuaW1nVmlldy5zY2FsZVg7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1pbig4LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgdGhpcy5uZXdTY2FsZSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWSA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcud2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5oZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgcGFuL21vdmVcbiAgICAgKiBAcGFyYW0gYXJncyBQYW5HZXN0dXJlIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5YO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLmltZ1ZpZXcub3JpZ2luWTtcblxuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBFdmVudCBmaXJlcyBvbiBkb3VibGUgdGFwXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoKSB7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09ICdQZXJmb3JtJykge1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgICAgIGN1cnZlOiAnZWFzZU91dCcsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gMTtcbiAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gdGhpcy5pbml0UG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZXMoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIGV2ZW50IHBhZ2UgbG9hZGVkLlxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgY29uc3QgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzID0gcmVjUG9pbnRzU3RyVGVtcC5zcGxpdCgnIycpO1xuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuaW1nVmlldyA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ1ZpZXdJZCcpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGNpcmNsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLmNpcmNsZUJ0bkxpc3QuZm9yRWFjaCgoYnRuOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZUNpcmNsZXMoKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSB0aGlzLmltZ0dyaWRJZC5nZXRDaGlsZEF0KDApO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZC5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZChpbWdFbGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwb2ludHNcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLmltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuaW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRYID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuY2VudGVyUG9pbnRZID0gKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHt9O1xuICAgICAgICBpZiAodGhpcy5yZWN0YW5nbGVQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50SW5kZXggPSAxO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMucmVjdGFuZ2xlUG9pbnRzOiAnICsgSlNPTi5zdHJpbmdpZnkodGhpcy5yZWN0YW5nbGVQb2ludHMpKTtcbiAgICAgICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRzID0gcG9pbnQuc3BsaXQoJyUnKTtcbiAgICAgICAgICAgICAgICBsZXQgYm90dG9tQ2lyY2xlUmFkaXVzID0gdGhpcy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50RGlmZlggPSAwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludERpZmZZID0gMDtcbiAgICAgICAgICAgICAgICAvLyBpZiAocG9pbnRJbmRleCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMikge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDMpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IDEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDQpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICBpZiAocG9pbnRJbmRleCsrID4gMikgeyAvLyBGb3IgY2hlY2tpbmcgYm90dG9uIHBvaW50c1xuICAgICAgICAgICAgICAgICAgICBib3R0b21DaXJjbGVSYWRpdXMgPSBib3R0b21DaXJjbGVSYWRpdXMgKiAtMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgdG9wTGVmdC54ID0gdG9wTGVmdC54IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wTGVmdC55ID0gdG9wTGVmdC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wUmlnaHQueCA9IHRvcFJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC55ID0gdG9wUmlnaHQueSAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVJpZ2h0LnggPSBib3R0b21SaWdodC54ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueSA9IGJvdHRvbVJpZ2h0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnggPSBib3R0b21MZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21MZWZ0LnkgPSBib3R0b21MZWZ0LnkgKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgYWN0dWFsUG9pbnQgPSB7IHg6ICgrcG9pbnRzWzBdICsgcG9pbnREaWZmWCkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpLFxuICAgICAgICAgICAgICAgIC8vIHk6ICgoK3BvaW50c1sxXStwb2ludERpZmZZKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKVxuICAgICAgICAgICAgICAgIC8vICsgY2lyY2xlUmFkaXVzLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6ICgrcG9pbnRzWzBdKSAqICh0aGlzLmltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyBzY2FsZSksXG4gICAgICAgICAgICAgICAgICAgIHk6ICgoK3BvaW50c1sxXSkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIHNjYWxlKSkgKyBib3R0b21DaXJjbGVSYWRpdXMsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYWN0dWFsUG9pbnQgOiAnICsgSlNPTi5zdHJpbmdpZnkoYWN0dWFsUG9pbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IDAsIHk6IDAsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCwgeTogMCwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiAwLCB5OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcblxuICAgICAgICAgICAgLy8gICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY2lyY2xlcy5cbiAgICAgKiBAcGFyYW0gYWN0dWFsUG9pbnQgQ29udGFpbnMgY2lyY2xlIHBvaW50cyh4LHkpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQ6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVggPSAodGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoO1xuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWSA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMucG9pbnRzQ291bnRlcisrO1xuICAgICAgICBjaXJjbGVCdG4uZm9ybWF0dGVkVGV4dCA9IGZvcm1hdHRlZFN0cmluZztcbiAgICAgICAgY2lyY2xlQnRuLm9uKCdwYW4nLCAoYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PT0gY2lyY2xlQnRuLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnggPSBjaXJjbGVCdG4udHJhbnNsYXRlWCAtIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC55ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVkgLSBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludC54ICsgYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnQueSArIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWCAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKiAtMSkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WSAqIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LnB1c2goY2lyY2xlQnRuKTtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChhY3R1YWxQb2ludCk7XG4gICAgICAgIHJldHVybiBjaXJjbGVCdG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIHNjcmVlbiBib3VuZGFyeS5cbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWCBJbWFnZSB0cmFuc2xhdGVYXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVkgSW1hZ2UgdHJhbnNsYXRlWVxuICAgICAqL1xuICAgIHByaXZhdGUgY2hlY2tCb3VuZGFyeSh0cmFuc2xhdGVYOiBhbnksIHRyYW5zbGF0ZVk6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IHBvaW50QWRqdXN0bWVudCA9IDU7IC8vIE5lZWQgdG8gYWRqdXN0IHRoZSBjZW50ZXIgcG9pbnQgdmFsdWUgdG8gY2hlY2sgdGhlIGJvdW5kYXJ5XG4gICAgICAgIGlmICh0cmFuc2xhdGVYIDwgKHRoaXMuY2VudGVyUG9pbnRYIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgdHJhbnNsYXRlWSA8ICh0aGlzLmNlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVYICogLTEpIDwgKHRoaXMuY2VudGVyUG9pbnRYIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVkgKiAtMSkgPCAodGhpcy5jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19