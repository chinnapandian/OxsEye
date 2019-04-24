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
var timer_1 = require("tns-core-modules/timer");
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var platform = require("platform");
var orientation = require("nativescript-orientation");
var buttons = require("ui/button");
var formattedStringModule = require("text/formatted-string");
/**
 * Dialog content class.
 */
var DialogContent = (function () {
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
    // private _points = new ObservableArray();
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
        this._startScale = 1;
        /** Transformed Image new scale while moving around. */
        this._newScale = 1;
        /** Stores old TranslateX value of transformed Image. */
        this._oldTranslateX = 0;
        /** Stores old translateY value of transformed Image. */
        this._oldTranslateY = 0;
        /** Boolean value to indicate whether the image got default screen location or not. */
        this._isGotDefaultLocation = false;
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
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    /**
     * Perform manual correction.
     * @param btnText
     */
    DialogContent.prototype.performManualCorrection = function (btnText) {
        var _this = this;
        var pointsCount = 0;
        this._points.forEach(function (point) {
            if (point) {
                pointsCount++;
            }
        });
        //To get accurate position, need to adjust the radius value;
        var circleRadius = 17;
        // this._points[0].y = +this._points[0].y - circleRadius;
        // this._points[1].y = +this._points[1].y - circleRadius;
        // this._points[2].y = +this._points[2].y + circleRadius;
        // this._points[3].y = +this._points[3].y + circleRadius;
        if (pointsCount !== 4) {
            alert('Please select only four _points.');
        }
        else {
            var rectanglePoints = this._points[0].x + '-' + (+this._points[0].y - circleRadius) + '#'
                + this._points[1].x + '-' + (+this._points[1].y - circleRadius) + '#'
                + this._points[2].x + '-' + (+this._points[2].y + circleRadius) + '#'
                + this._points[3].x + '-' + (+this._points[3].y + circleRadius);
            console.log(rectanglePoints);
            console.log(this.imageSourceOrg);
            console.log(this._imageActualSize.width + '-' + this._imageActualSize.height);
            this._imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this._imageActualSize.width + '-' + this._imageActualSize.height);
            transformedimage_provider_1.SendBroadcastImage(this.imageSource);
            timer_1.setTimeout(function () {
                _this.transformedImageProvider.deleteFile(_this._imageSourceOld);
            }, 1000);
            this.imageSourceOrg = this._imageSourceOrgOld;
            this.isAutoCorrection = true;
            this.manualBtnText = 'Manual';
            this.removeCircles();
            // this._pointsCounter = 0;
            this.transformedImageProvider.DeleteFiles();
        }
    };
    /**
     * Gets rectangle points.
     * @param event
     */
    DialogContent.prototype.getPoints = function (event) {
        try {
            if (this.manualBtnText === 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                var scale = platform.screen.mainScreen.scale;
                this._imageActualSize = this._imgView.getActualSize();
                var pointX = event.android.getX() / scale;
                var pointY = event.android.getY() / scale;
                var actualPoint = { x: pointX, y: pointY, id: this._pointsCounter };
                if (this._points.length >= 4) {
                    Toast.makeText('Please select only four _points.', 'long').show();
                }
                else {
                    this._imgGridId.addChild(this.createCircle(actualPoint));
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
        this.onDoubleTap(null);
        if (this._circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText('Please move around the four red circle(s) on image if needed and click "Perform" button.', 'long').show();
        }
        this.isAutoCorrection = false;
        this.manualBtnText = 'Perform';
        this._pointsCounter = 0;
        this.addCircles();
    };
    /**
     * On event pinch
     * @param args
     */
    DialogContent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            // let newOriginX = args.getFocusX() - this._imgView.translateX;
            // let newOriginY = args.getFocusY() - this._imgView.translateY;
            // let oldOriginX = this._imgView.originX * this._imgView.getMeasuredWidth();
            // let oldOriginY = this._imgView.originY * this._imgView.getMeasuredHeight();
            this._startScale = this._imgView.scaleX;
        }
        else if (args.scale && args.scale !== 1) {
            this._newScale = this._startScale * args.scale;
            this._newScale = Math.min(8, this._newScale);
            this._newScale = Math.max(0.125, this._newScale);
            this._imgView.scaleX = this._newScale;
            this._imgView.scaleY = this._newScale;
            this._imgView.width = this._imgView.getMeasuredWidth() * this._newScale;
            this._imgView.height = this._imgView.getMeasuredHeight() * this._newScale;
        }
    };
    /**
     * On event pan/move
     * @param args
     */
    DialogContent.prototype.onPan = function (args) {
        var screenLocation = this._imgView.getLocationOnScreen();
        if (this.manualBtnText !== 'Perform') {
            var centerPointX = (this._imgView.getMeasuredWidth() / 4) * (this._newScale);
            var centerPointY = (this._imgView.getMeasuredHeight() / 4) * (this._newScale);
            var imageViewWidth = this._imgView.getMeasuredWidth() * this._imgView.originX;
            var imageViewHeight = this._imgView.getMeasuredHeight() * this._imgView.originY;
            if (args.state === 1) {
                this._prevDeltaX = 0;
                this._prevDeltaY = 0;
            }
            else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);
                // let screenLocation = this._imgView.getLocationOnScreen();
                if (!this._isGotDefaultLocation) {
                    this._defaultScreenLocation = screenLocation;
                    this._isGotDefaultLocation = true;
                }
                if (this._newScale > 1) {
                    if ((screenLocation.x - this._defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this._defaultScreenLocation.x)) {
                        this._imgView.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._imgView.translateX;
                    }
                    else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        }
                        else {
                            this._oldTranslateX++;
                        }
                        this._imgView.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - this._defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this._defaultScreenLocation.y)) {
                        this._imgView.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._imgView.translateY;
                    }
                    else {
                        if (this._oldTranslateY > 0) {
                            this._oldTranslateY--;
                        }
                        else {
                            this._oldTranslateY++;
                        }
                        this._imgView.translateY = this._oldTranslateY;
                    }
                }
                this._prevDeltaX = args.deltaX;
                this._prevDeltaY = args.deltaY;
            }
        }
    };
    /**
     * On event double tap.
     * @param args
     */
    DialogContent.prototype.onDoubleTap = function (args) {
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
        }
        else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    };
    /**
     * On event page loaded.
     * @param args
     */
    DialogContent.prototype.pageLoaded = function (args) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this._imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this._imageSourceOld = this.params.context.imageSource;
        var recPointsStrTemp = this.params.context.rectanglePoints;
        this._rectanglePoints = recPointsStrTemp.split('#');
        this._rectanglePoints.shift(); // remove first element
        this._rectanglePoints.pop(); // remove last element
        var page = args.object;
        this._imgView = page.getViewById('imgViewId');
        this._imgGridId = page.getViewById('imgGridId');
        this._imgView.translateX = 0;
        this._imgView.translateY = 0;
        this._imgView.scaleX = 1;
        this._imgView.scaleY = 1;
        orientation.setOrientation('portrait');
    };
    /**
     * Add circles.
     */
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this._circleBtnList.forEach(function (btn) {
            _this._imgGridId.addChild(btn);
        });
    };
    /**
     * Remove circles.
     */
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this._imgGridId.getChildAt(0);
        this._imgGridId.removeChildren();
        this._imgGridId.addChild(imgElement);
    };
    /**
     * Initialize points
     */
    DialogContent.prototype.initPoints = function () {
        var _this = this;
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        var scale = platform.screen.mainScreen.scale;
        this._imageActualSize = this._imgView.getActualSize();
        this._centerPointX = (this._imgGridId.getMeasuredWidth() / 2) / scale;
        this._centerPointY = (this._imgGridId.getMeasuredHeight() / 2) / scale;
        if (this._rectanglePoints.length > 0) {
            var pointIndex_1 = 1;
            console.log("this._rectanglePoints: " + JSON.stringify(this._rectanglePoints));
            this._rectanglePoints.forEach(function (point) {
                var points = point.split('%');
                var circleRadius = 17;
                var pointDiffX = 0;
                var pointDiffY = 0;
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
                    circleRadius = circleRadius * -1;
                }
                //                 topLeft.x = topLeft.x - 10;
                // topLeft.y = topLeft.y - 10;
                // topRight.x = topRight.x + 10;
                // topRight.y = topRight.y - 10;
                // bottomRight.x = bottomRight.x + 10;
                // bottomRight.y = bottomRight.y + 10;
                // bottomLeft.x = bottomLeft.x - 10;
                // bottomLeft.y = bottomLeft.y + 10;
                // let actualPoint = { x: (+points[0] + pointDiffX) * (this._imgGridId.getMeasuredWidth() / scale), 
                //     y: ((+points[1]+pointDiffY) * (this._imgGridId.getMeasuredHeight() / scale)) + circleRadius, id: this._pointsCounter };
                var actualPoint = {
                    x: (+points[0] + pointDiffX) * (_this._imgGridId.getMeasuredWidth() / scale),
                    y: ((+points[1] + pointDiffY) * (_this._imgGridId.getMeasuredHeight() / scale)) + circleRadius, id: _this._pointsCounter
                };
                console.log("actualPoint : " + JSON.stringify(actualPoint));
                _this.createCircle(actualPoint);
            });
        }
        else {
            var actualPoint = { x: 0, y: 0, id: this._pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this._imageActualSize.width, y: 0, id: this._pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this._imageActualSize.width, y: this._imageActualSize.height, id: this._pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: 0, y: this._imageActualSize.height, id: this._pointsCounter };
            this.createCircle(actualPoint);
            //     let actualPoint = { x: this._centerPointX - 75, y: this._centerPointY - 75, id: this._pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this._centerPointX + 75, y: this._centerPointY - 75, id: this._pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this._centerPointX - 75, y: this._centerPointY + 75, id: this._pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this._centerPointX + 75, y: this._centerPointY + 75, id: this._pointsCounter };
            //     this.createCircle(actualPoint);
        }
    };
    /**
     * Create circles.
     * @param actualPoint
     */
    DialogContent.prototype.createCircle = function (actualPoint) {
        var _this = this;
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        var actualPointDeltaX = (this._imageActualSize.width / 2) - this._imageActualSize.width;
        var actualPointDeltaY = (this._imageActualSize.height / 2) - this._imageActualSize.height;
        var formattedString = new formattedStringModule.FormattedString();
        var iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add('fa');
        iconSpan.cssClasses.add('circle-plus');
        iconSpan.text = String.fromCharCode(0xf067);
        formattedString.spans.push(iconSpan);
        var circleBtn = new buttons.Button();
        circleBtn.cssClasses.add('circle');
        circleBtn.id = this._pointsCounter++;
        circleBtn.formattedText = formattedString;
        circleBtn.on('pan', function (args) {
            if (args.state === 1) {
                _this._prevDeltaX = 0;
                _this._prevDeltaY = 0;
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
                    circleBtn.translateX += args.deltaX - _this._prevDeltaX;
                    circleBtn.translateY += args.deltaY - _this._prevDeltaY;
                    _this._points.forEach(function (point) {
                        if (point) {
                            if (point.id === circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    });
                    _this._prevDeltaX = args.deltaX;
                    _this._prevDeltaY = args.deltaY;
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
    };
    /**
     * Check screen boundary.
     * @param translateX
     * @param translateY
     */
    DialogContent.prototype.checkBoundary = function (translateX, translateY) {
        var pointAdjustment = 5; // Need to adjust the center point value to check the boundary
        if (translateX < (this._centerPointX - pointAdjustment) &&
            translateY < (this._centerPointY - pointAdjustment) &&
            (translateX * -1) < (this._centerPointX - pointAdjustment) &&
            (translateY * -1) < (this._centerPointY - pointAdjustment)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWlFO0FBQ2pFLGtFQUFzRTtBQUt0RSxvRkFBc0c7QUFHdEcsZ0RBQW9EO0FBRXBELG1EQUFxRDtBQUNyRCwwQ0FBNEM7QUFDNUMsbUNBQXFDO0FBR3JDLHNEQUF3RDtBQUN4RCxtQ0FBcUM7QUFDckMsNkRBQStEO0FBRS9EOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBK0N0QixpQ0FBaUM7SUFDakMsa0RBQWtEO0lBRWxELDJDQUEyQztJQUUzQzs7OztPQUlHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ2pDLHdCQUFrRDtRQUQxQyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUNqQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBckQ5RCwwRUFBMEU7UUFDbkUscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBdUJoQyx3Q0FBd0M7UUFDaEMsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFLeEIsdURBQXVEO1FBQy9DLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDdEIsd0RBQXdEO1FBQ2hELG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLHdEQUF3RDtRQUNoRCxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUMzQixzRkFBc0Y7UUFDOUUsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBaUJsQyxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6Qiw4REFBOEQ7SUFDbEUsQ0FBQztJQUNEOzs7T0FHRztJQUNILDZCQUFLLEdBQUwsVUFBTSxNQUFjO1FBQ2hCLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsK0NBQXVCLEdBQXZCLFVBQXdCLE9BQWU7UUFBdkMsaUJBdUNDO1FBdENHLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztRQUNwQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQVU7WUFDNUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDUixXQUFXLEVBQUUsQ0FBQztZQUNsQixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCw0REFBNEQ7UUFDNUQsSUFBSSxZQUFZLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLHlEQUF5RDtRQUN6RCx5REFBeUQ7UUFDekQseURBQXlEO1FBQ3pELHlEQUF5RDtRQUV6RCxFQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxHQUFHLEdBQUc7a0JBQ3JGLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLEdBQUcsR0FBRztrQkFDbkUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsR0FBRyxHQUFHO2tCQUNuRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDO1lBQ3BFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDakMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUUsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLGtDQUFrQyxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsZUFBZSxFQUM3RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdEUsOENBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3JDLGtCQUFVLENBQUM7Z0JBQ1AsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDbkUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ1QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7WUFDOUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztZQUM3QixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztZQUM5QixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsMkJBQTJCO1lBQzNCLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNoRCxDQUFDO0lBQ0wsQ0FBQztJQUNEOzs7T0FHRztJQUNILGlDQUFTLEdBQVQsVUFBVSxLQUF1QjtRQUM3QixJQUFJLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLHdGQUF3RjtnQkFDeEYsSUFBTSxLQUFLLEdBQVcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO2dCQUV2RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEQsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUM7Z0JBQzVDLElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUU1QyxJQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUV0RSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixLQUFLLENBQUMsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN0RSxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDN0QsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7SUFDTCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCx5Q0FBaUIsR0FBakI7UUFFSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLEtBQUssQ0FBQyxRQUFRLENBQUMsMEZBQTBGLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDOUgsQ0FBQztRQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFDRDs7O09BR0c7SUFDSCwrQkFBTyxHQUFQLFVBQVEsSUFBMkI7UUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25CLGdFQUFnRTtZQUNoRSxnRUFBZ0U7WUFFaEUsNkVBQTZFO1lBQzdFLDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzVDLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDL0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzlFLENBQUM7SUFDTCxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsNkJBQUssR0FBTCxVQUFNLElBQXlCO1FBQzNCLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMzRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0UsSUFBSSxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUUsSUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2hGLElBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUVsRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO2dCQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUN6QixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsWUFBWSxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNsQyxZQUFZLEdBQUcsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBRWxDLDREQUE0RDtnQkFDNUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDO29CQUM5QixJQUFJLENBQUMsc0JBQXNCLEdBQUcsY0FBYyxDQUFDO29CQUM3QyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO2dCQUN0QyxDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDOzJCQUNwRCxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FDbEcsQ0FBQyxDQUFDLENBQUM7d0JBQ0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO3dCQUMzRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO29CQUNuRCxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDMUIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUMxQixDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDMUIsQ0FBQzt3QkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO29CQUNuRCxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzsyQkFDcEQsQ0FBQyxZQUFZLEdBQUcsZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQ25HLENBQUMsQ0FBQyxDQUFDO3dCQUNDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzt3QkFDM0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDbkQsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzFCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDMUIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQzFCLENBQUM7d0JBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDbkQsQ0FBQztnQkFDTCxDQUFDO2dCQUNELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNEOzs7T0FHRztJQUNILG1DQUFXLEdBQVgsVUFBWSxJQUFTO1FBQ2pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztnQkFDbEIsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUN6QixLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7Z0JBQ3JCLEtBQUssRUFBRSxTQUFTO2dCQUNoQixRQUFRLEVBQUUsRUFBRTthQUNmLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLHFCQUFxQjtZQUNyQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3RCLENBQUM7SUFDTCxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsa0NBQVUsR0FBVixVQUFXLElBQXNCO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQ3pELElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUM7UUFDN0QsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBQzdELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3ZELElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDO1FBRTNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsdUJBQXVCO1FBQ3RELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLHNCQUFzQjtRQUNuRCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ3pCLFdBQVcsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNEOztPQUVHO0lBQ0ssa0NBQVUsR0FBbEI7UUFBQSxpQkFJQztRQUhHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQUMsR0FBUTtZQUNqQyxLQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7T0FFRztJQUNLLHFDQUFhLEdBQXJCO1FBQ0ksSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNqQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ0Q7O09BRUc7SUFDSyxrQ0FBVSxHQUFsQjtRQUFBLGlCQXlFQztRQXhFRyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6Qix3RkFBd0Y7UUFDeEYsSUFBTSxLQUFLLEdBQVcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDO1FBRXZELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3RELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRXZFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLFlBQVUsR0FBRyxDQUFDLENBQUM7WUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7WUFDL0UsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7Z0JBQ2hDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzlCLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLHlCQUF5QjtnQkFDekIsd0JBQXdCO2dCQUN4Qix1QkFBdUI7Z0JBQ3ZCLGdDQUFnQztnQkFDaEMsdUJBQXVCO2dCQUN2Qix3QkFBd0I7Z0JBQ3hCLGdDQUFnQztnQkFDaEMsdUJBQXVCO2dCQUN2Qix1QkFBdUI7Z0JBQ3ZCLGdDQUFnQztnQkFDaEMsd0JBQXdCO2dCQUN4Qix1QkFBdUI7Z0JBQ3ZCLElBQUk7Z0JBQ0osRUFBRSxDQUFDLENBQUMsWUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkIsWUFBWSxHQUFHLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDckMsQ0FBQztnQkFFRCw4Q0FBOEM7Z0JBQzlDLDhCQUE4QjtnQkFDOUIsZ0NBQWdDO2dCQUNoQyxnQ0FBZ0M7Z0JBQ2hDLHNDQUFzQztnQkFDdEMsc0NBQXNDO2dCQUN0QyxvQ0FBb0M7Z0JBQ3BDLG9DQUFvQztnQkFDcEMsb0dBQW9HO2dCQUNwRyw4SEFBOEg7Z0JBQzlILElBQUksV0FBVyxHQUFHO29CQUNkLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEtBQUssQ0FBQztvQkFDM0UsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLFlBQVksRUFBRSxFQUFFLEVBQUUsS0FBSSxDQUFDLGNBQWM7aUJBQ3pILENBQUM7Z0JBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELEtBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFFSixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQzFELElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0IsV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ2hGLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDL0IsV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQy9CLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUNqRixJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRS9CLDZHQUE2RztZQUM3RyxzQ0FBc0M7WUFDdEMseUdBQXlHO1lBQ3pHLHNDQUFzQztZQUN0Qyx5R0FBeUc7WUFDekcsc0NBQXNDO1lBQ3RDLHlHQUF5RztZQUN6RyxzQ0FBc0M7UUFDMUMsQ0FBQztJQUNMLENBQUM7SUFDRDs7O09BR0c7SUFDSyxvQ0FBWSxHQUFwQixVQUFxQixXQUFnQjtRQUFyQyxpQkFxRkM7UUFwRkcseURBQXlEO1FBQ3pELDBEQUEwRDtRQUMxRCx1RkFBdUY7UUFDdkYsWUFBWTtRQUNaLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7UUFDMUYsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUU1RixJQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BFLElBQU0sUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLElBQU0sU0FBUyxHQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLFNBQVMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO1FBQzFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBeUI7WUFDMUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixLQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztnQkFDckIsS0FBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM1QixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNoQyxDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDaEMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUNoQyxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLFNBQVMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFJLENBQUMsV0FBVyxDQUFDO29CQUN2RCxTQUFTLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQztvQkFFdkQsS0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFVO3dCQUM1QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUNSLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzVCLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztnQ0FDbkQsS0FBSyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDOzRCQUN2RCxDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUMvQixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCx5REFBeUQ7UUFDekQsMERBQTBEO1FBQzFELHVGQUF1RjtRQUN2RixZQUFZO1FBQ1osU0FBUyxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1FBQ3pELFNBQVMsQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztRQUN6RCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLENBQUM7WUFDeEIsU0FBUyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM1QyxTQUFTLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDOUMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQztZQUN4QixDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNuRCxTQUFTLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQztZQUN4QixTQUFTLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzVDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUM5QyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDO1lBQ3hCLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ25ELFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBRUQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNLLHFDQUFhLEdBQXJCLFVBQXNCLFVBQWUsRUFBRSxVQUFlO1FBQ2xELElBQU0sZUFBZSxHQUFHLENBQUMsQ0FBQyxDQUFDLDhEQUE4RDtRQUN6RixFQUFFLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztZQUNuRCxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLGVBQWUsQ0FBQztZQUNuRCxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxlQUFlLENBQUM7WUFDMUQsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQW5lRCxJQW1lQztBQW5lWSxhQUFhO0lBTnpCLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsd0JBQXdCLENBQUM7UUFDckMsV0FBVyxFQUFFLHlCQUF5QjtLQUN6QyxDQUFDO3FDQTBEOEIsZ0NBQWlCLHNCQUNQLG9EQUF3QixvQkFBeEIsb0RBQXdCO0dBMURyRCxhQUFhLENBbWV6QjtBQW5lWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1BhcmFtcyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQgeyBWaWV3IH0gZnJvbSAndWkvY29yZS92aWV3JztcbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcbmltcG9ydCB7IEZpbGUsIHBhdGggfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RpbWVyJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAndWkvaW1hZ2UnO1xuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICdwbGF0Zm9ybSc7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5pbXBvcnQgKiBhcyBvcmllbnRhdGlvbiBmcm9tICduYXRpdmVzY3JpcHQtb3JpZW50YXRpb24nO1xuaW1wb3J0ICogYXMgYnV0dG9ucyBmcm9tICd1aS9idXR0b24nO1xuaW1wb3J0ICogYXMgZm9ybWF0dGVkU3RyaW5nTW9kdWxlIGZyb20gJ3RleHQvZm9ybWF0dGVkLXN0cmluZyc7XG5cbi8qKlxuICogRGlhbG9nIGNvbnRlbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbW9kYWwtY29udGVudCcsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9kaWFsb2cuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50IHtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRydWUvZmFsc2UgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBhdXRvbWF0aWNhbGx5IG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBidXR0b24gbGFiZWwgbmFtZSBlaXRoZXIgJ01hbnVhbCcvICdQZXJmb3JtJyAqL1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgZm91ciBwb2ludHMgb2YgdGhlIGltYWdlcy4gKi9cbiAgICBwcml2YXRlIF9wb2ludHM6IGFueTtcbiAgICAvKiogSW5kaWNhdGVzIHRoZSBudW1iZXIgb2YgcG9pbnRzLiAqL1xuICAgIHByaXZhdGUgX3BvaW50c0NvdW50ZXI6IG51bWJlcjtcbiAgICAvKiogU3RvcmVzIHByZXZpb3VzIG9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwcml2YXRlIF9pbWFnZVNvdXJjZU9yZ09sZDogYW55O1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgdHJhbnNmb3JtZWQgaW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgX2ltYWdlU291cmNlT2xkOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRyYW5zZm9ybWVkIGltYWdlIGFjdHVhbCBzaXplLiAqL1xuICAgIHByaXZhdGUgX2ltYWdlQWN0dWFsU2l6ZTogYW55O1xuICAgIC8qKiBMaXN0IG9mIGNpcmNsZSBidXR0b25zICovXG4gICAgcHJpdmF0ZSBfY2lyY2xlQnRuTGlzdDogYW55O1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIF9pbWdWaWV3OiBhbnk7XG4gICAgLyoqIEltYWdlIGdyaWQgaWQuICovXG4gICAgcHJpdmF0ZSBfaW1nR3JpZElkOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWC4gKi9cbiAgICBwcml2YXRlIF9wcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWS4gKi9cbiAgICBwcml2YXRlIF9wcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHN0YXJ0aW5nIHNjYWxlLiAqL1xuICAgIHByaXZhdGUgX3N0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRYLiAqL1xuICAgIHByaXZhdGUgX2NlbnRlclBvaW50WDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRZLiAqL1xuICAgIHByaXZhdGUgX2NlbnRlclBvaW50WTogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBuZXcgc2NhbGUgd2hpbGUgbW92aW5nIGFyb3VuZC4gKi9cbiAgICBwcml2YXRlIF9uZXdTY2FsZSA9IDE7XG4gICAgLyoqIFN0b3JlcyBvbGQgVHJhbnNsYXRlWCB2YWx1ZSBvZiB0cmFuc2Zvcm1lZCBJbWFnZS4gKi9cbiAgICBwcml2YXRlIF9vbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogU3RvcmVzIG9sZCB0cmFuc2xhdGVZIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgX29sZFRyYW5zbGF0ZVkgPSAwO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIGluZGljYXRlIHdoZXRoZXIgdGhlIGltYWdlIGdvdCBkZWZhdWx0IHNjcmVlbiBsb2NhdGlvbiBvciBub3QuICovXG4gICAgcHJpdmF0ZSBfaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogU3RvcmVzIHRyYW5zZm9ybWVkIGltYWdlJ3Mgc2NyZWVuIGxvY2F0aW9uLiAqL1xuICAgIHByaXZhdGUgX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIC8qKiBTdG9yZXMgcmVjdGFuZ2xlIHBvaW50cyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQ1YgQVBJIGNhbGwuICovXG4gICAgcHJpdmF0ZSBfcmVjdGFuZ2xlUG9pbnRzOiBhbnk7XG4gICAgLy8gcHJpdmF0ZSBfZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgLy8gQFZpZXdDaGlsZCgnaW1nVmlld0lkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcblxuICAgIC8vIHByaXZhdGUgX3BvaW50cyA9IG5ldyBPYnNlcnZhYmxlQXJyYXkoKTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBEaWFsb2dDb250ZW50IGNsYXNzLlxuICAgICAqIEBwYXJhbSBwYXJhbXMgY29udGFpbnMgY2FwdHVyZWQgaW1hZ2UgZmlsZSBpbmZvcm1hdGlvblxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgdHJhbnNmb3JtZWQgaW1hZ2UgcHJvdmlkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHBhcmFtczogTW9kYWxEaWFsb2dQYXJhbXMsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ01hbnVhbCc7XG4gICAgICAgIHRoaXMuX3BvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtID0gPEltYWdlPnRoaXMuX2RyYWdJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbG9zZVxuICAgICAqIEBwYXJhbSByZXN1bHQgXG4gICAgICovXG4gICAgY2xvc2UocmVzdWx0OiBzdHJpbmcpIHtcbiAgICAgICAgb3JpZW50YXRpb24uZW5hYmxlUm90YXRpb24oKTtcbiAgICAgICAgdGhpcy5wYXJhbXMuY2xvc2VDYWxsYmFjayhyZXN1bHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIG1hbnVhbCBjb3JyZWN0aW9uLlxuICAgICAqIEBwYXJhbSBidG5UZXh0IFxuICAgICAqL1xuICAgIHBlcmZvcm1NYW51YWxDb3JyZWN0aW9uKGJ0blRleHQ6IHN0cmluZykge1xuICAgICAgICBsZXQgcG9pbnRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLl9wb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgcG9pbnRzQ291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9UbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWU7XG4gICAgICAgIGxldCBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAgICAgLy8gdGhpcy5fcG9pbnRzWzBdLnkgPSArdGhpcy5fcG9pbnRzWzBdLnkgLSBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMuX3BvaW50c1sxXS55ID0gK3RoaXMuX3BvaW50c1sxXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLl9wb2ludHNbMl0ueSA9ICt0aGlzLl9wb2ludHNbMl0ueSArIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5fcG9pbnRzWzNdLnkgPSArdGhpcy5fcG9pbnRzWzNdLnkgKyBjaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgaWYgKHBvaW50c0NvdW50ICE9PSA0KSB7XG4gICAgICAgICAgICBhbGVydCgnUGxlYXNlIHNlbGVjdCBvbmx5IGZvdXIgX3BvaW50cy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50cyA9IHRoaXMuX3BvaW50c1swXS54ICsgJy0nICsgKCt0aGlzLl9wb2ludHNbMF0ueSAtIGNpcmNsZVJhZGl1cykgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1sxXS54ICsgJy0nICsgKCt0aGlzLl9wb2ludHNbMV0ueSAtIGNpcmNsZVJhZGl1cykgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1syXS54ICsgJy0nICsgKCt0aGlzLl9wb2ludHNbMl0ueSArIGNpcmNsZVJhZGl1cykgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1szXS54ICsgJy0nICsgKCt0aGlzLl9wb2ludHNbM10ueSArIGNpcmNsZVJhZGl1cyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZWN0YW5nbGVQb2ludHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5pbWFnZVNvdXJjZU9yZyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGggKyAnLScgKyB0aGlzLl9pbWFnZUFjdHVhbFNpemUuaGVpZ2h0KTtcbiAgICAgICAgICAgIHRoaXMuX2ltYWdlU291cmNlT2xkID0gdGhpcy5pbWFnZVNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlQ29ycmVjdGlvbk1hbnVhbCh0aGlzLmltYWdlU291cmNlT3JnLCByZWN0YW5nbGVQb2ludHMsXG4gICAgICAgICAgICAgICAgdGhpcy5faW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCk7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5kZWxldGVGaWxlKHRoaXMuX2ltYWdlU291cmNlT2xkKTtcbiAgICAgICAgICAgIH0sIDEwMDApO1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZyA9IHRoaXMuX2ltYWdlU291cmNlT3JnT2xkO1xuICAgICAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9ICdNYW51YWwnO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgICAgICAvLyB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkRlbGV0ZUZpbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyByZWN0YW5nbGUgcG9pbnRzLlxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKi9cbiAgICBnZXRQb2ludHMoZXZlbnQ6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgPT09ICdQZXJmb3JtJykge1xuICAgICAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAgICAgICAgICAgICBjb25zdCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9pbWFnZUFjdHVhbFNpemUgPSB0aGlzLl9pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludFggPSBldmVudC5hbmRyb2lkLmdldFgoKSAvIHNjYWxlO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50WSA9IGV2ZW50LmFuZHJvaWQuZ2V0WSgpIC8gc2NhbGU7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBhY3R1YWxQb2ludCA9IHsgeDogcG9pbnRYLCB5OiBwb2ludFksIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcG9pbnRzLmxlbmd0aCA+PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2Ugc2VsZWN0IG9ubHkgZm91ciBfcG9pbnRzLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ0dyaWRJZC5hZGRDaGlsZCh0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYWxlcnQoZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBzaG93T3JpZ2luYWxJbWFnZSgpIHtcblxuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKG51bGwpO1xuICAgICAgICBpZiAodGhpcy5fY2lyY2xlQnRuTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1BsZWFzZSBtb3ZlIGFyb3VuZCB0aGUgZm91ciByZWQgY2lyY2xlKHMpIG9uIGltYWdlIGlmIG5lZWRlZCBhbmQgY2xpY2sgXCJQZXJmb3JtXCIgYnV0dG9uLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnUGVyZm9ybSc7XG4gICAgICAgIHRoaXMuX3BvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgcGluY2hcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvblBpbmNoKGFyZ3M6IFBpbmNoR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgLy8gbGV0IG5ld09yaWdpblggPSBhcmdzLmdldEZvY3VzWCgpIC0gdGhpcy5faW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgLy8gbGV0IG5ld09yaWdpblkgPSBhcmdzLmdldEZvY3VzWSgpIC0gdGhpcy5faW1nVmlldy50cmFuc2xhdGVZO1xuXG4gICAgICAgICAgICAvLyBsZXQgb2xkT3JpZ2luWCA9IHRoaXMuX2ltZ1ZpZXcub3JpZ2luWCAqIHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgLy8gbGV0IG9sZE9yaWdpblkgPSB0aGlzLl9pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFNjYWxlID0gdGhpcy5faW1nVmlldy5zY2FsZVg7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IHRoaXMuX3N0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSBNYXRoLm1pbig4LCB0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLl9uZXdTY2FsZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcuc2NhbGVYID0gdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWSA9IHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy53aWR0aCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LmhlaWdodCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX25ld1NjYWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIGV2ZW50IHBhbi9tb3ZlXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSAnUGVyZm9ybScpIHtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRZID0gKHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLl9pbWdWaWV3Lm9yaWdpblg7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLl9pbWdWaWV3Lm9yaWdpblk7XG5cbiAgICAgICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5faW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNHb3REZWZhdWx0TG9jYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYID0gdGhpcy5faW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggPSB0aGlzLl9vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLl9wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSA9IHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVZID0gdGhpcy5fb2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIGV2ZW50IGRvdWJsZSB0YXAuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoYXJnczogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09ICdQZXJmb3JtJykge1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgICAgIHNjYWxlOiB7IHg6IDEsIHk6IDEgfSxcbiAgICAgICAgICAgICAgICBjdXJ2ZTogJ2Vhc2VPdXQnLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAxMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoaXMuaW5pdFBvaW50cygpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBldmVudCBwYWdlIGxvYWRlZC5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLl9pbWFnZVNvdXJjZU9yZ09sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmc7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRoaXMucGFyYW1zLmNvbnRleHQuaXNBdXRvQ29ycmVjdGlvbjtcbiAgICAgICAgdGhpcy5faW1hZ2VTb3VyY2VPbGQgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICBsZXQgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMuX3JlY3RhbmdsZVBvaW50cyA9IHJlY1BvaW50c1N0clRlbXAuc3BsaXQoJyMnKTtcbiAgICAgICAgdGhpcy5fcmVjdGFuZ2xlUG9pbnRzLnNoaWZ0KCk7IC8vIHJlbW92ZSBmaXJzdCBlbGVtZW50XG4gICAgICAgIHRoaXMuX3JlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWdWaWV3SWQnKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkID0gcGFnZS5nZXRWaWV3QnlJZCgnaW1nR3JpZElkJyk7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcuc2NhbGVYID0gMTtcbiAgICAgICAgdGhpcy5faW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICBvcmllbnRhdGlvbi5zZXRPcmllbnRhdGlvbigncG9ydHJhaXQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIGNpcmNsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLl9jaXJjbGVCdG5MaXN0LmZvckVhY2goKGJ0bjogYW55KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9pbWdHcmlkSWQuYWRkQ2hpbGQoYnRuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjaXJjbGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgcmVtb3ZlQ2lyY2xlcygpIHtcbiAgICAgICAgY29uc3QgaW1nRWxlbWVudCA9IHRoaXMuX2ltZ0dyaWRJZC5nZXRDaGlsZEF0KDApO1xuICAgICAgICB0aGlzLl9pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGltZ0VsZW1lbnQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHBvaW50c1xuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdFBvaW50cygpIHtcbiAgICAgICAgdGhpcy5fcG9pbnRzID0gW107XG4gICAgICAgIHRoaXMuX3BvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLl9jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAgICAgY29uc3Qgc2NhbGU6IG51bWJlciA9IHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLnNjYWxlO1xuXG4gICAgICAgIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuX2ltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgICAgICB0aGlzLl9jZW50ZXJQb2ludFggPSAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuX2NlbnRlclBvaW50WSA9ICh0aGlzLl9pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDIpIC8gc2NhbGU7XG5cbiAgICAgICAgaWYgKHRoaXMuX3JlY3RhbmdsZVBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgcG9pbnRJbmRleCA9IDE7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcInRoaXMuX3JlY3RhbmdsZVBvaW50czogXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLl9yZWN0YW5nbGVQb2ludHMpKTtcbiAgICAgICAgICAgIHRoaXMuX3JlY3RhbmdsZVBvaW50cy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb2ludHMgPSBwb2ludC5zcGxpdCgnJScpO1xuICAgICAgICAgICAgICAgIGxldCBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAgICAgICAgICAgICBsZXQgcG9pbnREaWZmWCA9IDA7XG4gICAgICAgICAgICAgICAgbGV0IHBvaW50RGlmZlkgPSAwO1xuICAgICAgICAgICAgICAgIC8vIGlmIChwb2ludEluZGV4ID09IDEpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAxMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IC0xMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gMykge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9IGVsc2UgaWYgKHBvaW50SW5kZXggPT0gNCkge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgIGlmIChwb2ludEluZGV4KysgPiAyKSB7IC8vIEZvciBjaGVja2luZyBib3R0b24gcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZVJhZGl1cyA9IGNpcmNsZVJhZGl1cyAqIC0xO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICB0b3BMZWZ0LnggPSB0b3BMZWZ0LnggLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BMZWZ0LnkgPSB0b3BMZWZ0LnkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyB0b3BSaWdodC54ID0gdG9wUmlnaHQueCArIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcFJpZ2h0LnkgPSB0b3BSaWdodC55IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tUmlnaHQueCA9IGJvdHRvbVJpZ2h0LnggKyAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21SaWdodC55ID0gYm90dG9tUmlnaHQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueCA9IGJvdHRvbUxlZnQueCAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbUxlZnQueSA9IGJvdHRvbUxlZnQueSArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGxldCBhY3R1YWxQb2ludCA9IHsgeDogKCtwb2ludHNbMF0gKyBwb2ludERpZmZYKSAqICh0aGlzLl9pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpLCBcbiAgICAgICAgICAgICAgICAvLyAgICAgeTogKCgrcG9pbnRzWzFdK3BvaW50RGlmZlkpICogKHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpIC8gc2NhbGUpKSArIGNpcmNsZVJhZGl1cywgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgICAgICBsZXQgYWN0dWFsUG9pbnQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6ICgrcG9pbnRzWzBdICsgcG9pbnREaWZmWCkgKiAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAgICAgeTogKCgrcG9pbnRzWzFdICsgcG9pbnREaWZmWSkgKiAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpICsgY2lyY2xlUmFkaXVzLCBpZDogdGhpcy5fcG9pbnRzQ291bnRlclxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJhY3R1YWxQb2ludCA6IFwiICsgSlNPTi5zdHJpbmdpZnkoYWN0dWFsUG9pbnQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbGV0IGFjdHVhbFBvaW50ID0geyB4OiAwLCB5OiAwLCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aCwgeTogMCwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGgsIHk6IHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQsIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogMCwgeTogdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcblxuICAgICAgICAgICAgLy8gICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgY2lyY2xlcy5cbiAgICAgKiBAcGFyYW0gYWN0dWFsUG9pbnQgXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQ6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVggPSAodGhpcy5faW1hZ2VBY3R1YWxTaXplLndpZHRoIC8gMikgLSB0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGg7XG4gICAgICAgIGNvbnN0IGFjdHVhbFBvaW50RGVsdGFZID0gKHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgY29uc3QgZm9ybWF0dGVkU3RyaW5nID0gbmV3IGZvcm1hdHRlZFN0cmluZ01vZHVsZS5Gb3JtYXR0ZWRTdHJpbmcoKTtcbiAgICAgICAgY29uc3QgaWNvblNwYW4gPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLlNwYW4oKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2ZhJyk7XG4gICAgICAgIGljb25TcGFuLmNzc0NsYXNzZXMuYWRkKCdjaXJjbGUtcGx1cycpO1xuICAgICAgICBpY29uU3Bhbi50ZXh0ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNjcpO1xuXG4gICAgICAgIGZvcm1hdHRlZFN0cmluZy5zcGFucy5wdXNoKGljb25TcGFuKTtcbiAgICAgICAgY29uc3QgY2lyY2xlQnRuOiBhbnkgPSBuZXcgYnV0dG9ucy5CdXR0b24oKTtcbiAgICAgICAgY2lyY2xlQnRuLmNzc0NsYXNzZXMuYWRkKCdjaXJjbGUnKTtcblxuICAgICAgICBjaXJjbGVCdG4uaWQgPSB0aGlzLl9wb2ludHNDb3VudGVyKys7XG4gICAgICAgIGNpcmNsZUJ0bi5mb3JtYXR0ZWRUZXh0ID0gZm9ybWF0dGVkU3RyaW5nO1xuICAgICAgICBjaXJjbGVCdG4ub24oJ3BhbicsIChhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSAwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSAtMTU7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IC0zMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gKzEwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTEwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5fcHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLl9wcmV2RGVsdGFZO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3BvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocG9pbnQuaWQgPT09IGNpcmNsZUJ0bi5pZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC54ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVggLSBhY3R1YWxQb2ludERlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueSA9IGNpcmNsZUJ0bi50cmFuc2xhdGVZIC0gYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludC54ICsgYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnQueSArIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA+IHRoaXMuX2NlbnRlclBvaW50WCkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSB0aGlzLl9jZW50ZXJQb2ludFg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCAmJlxuICAgICAgICAgICAgKGNpcmNsZUJ0bi50cmFuc2xhdGVYICogLTEpID4gdGhpcy5fY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuX2NlbnRlclBvaW50WCAqIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA+IDAgJiZcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gdGhpcy5fY2VudGVyUG9pbnRZKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSA9IHRoaXMuX2NlbnRlclBvaW50WTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKiAtMSkgPiB0aGlzLl9jZW50ZXJQb2ludFkpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gdGhpcy5fY2VudGVyUG9pbnRZICogLTE7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9jaXJjbGVCdG5MaXN0LnB1c2goY2lyY2xlQnRuKTtcbiAgICAgICAgdGhpcy5fcG9pbnRzLnB1c2goYWN0dWFsUG9pbnQpO1xuICAgICAgICByZXR1cm4gY2lyY2xlQnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVjayBzY3JlZW4gYm91bmRhcnkuXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVggXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVkgXG4gICAgICovXG4gICAgcHJpdmF0ZSBjaGVja0JvdW5kYXJ5KHRyYW5zbGF0ZVg6IGFueSwgdHJhbnNsYXRlWTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgcG9pbnRBZGp1c3RtZW50ID0gNTsgLy8gTmVlZCB0byBhZGp1c3QgdGhlIGNlbnRlciBwb2ludCB2YWx1ZSB0byBjaGVjayB0aGUgYm91bmRhcnlcbiAgICAgICAgaWYgKHRyYW5zbGF0ZVggPCAodGhpcy5fY2VudGVyUG9pbnRYIC0gcG9pbnRBZGp1c3RtZW50KSAmJlxuICAgICAgICAgICAgdHJhbnNsYXRlWSA8ICh0aGlzLl9jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWCAqIC0xKSA8ICh0aGlzLl9jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWSAqIC0xKSA8ICh0aGlzLl9jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19