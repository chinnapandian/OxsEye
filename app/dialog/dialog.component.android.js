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
var DialogContent = (function () {
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
    // private _points = new ObservableArray();
    /**
     * Constructor for DialogContent class.
     * @param params
     * @param transformedImageProvider
     */
    function DialogContent(params, transformedImageProvider) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this.isAutoCorrection = false;
        this._startScale = 1;
        this._newScale = 1;
        this._oldTranslateX = 0;
        this._oldTranslateY = 0;
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
        if (pointsCount !== 4) {
            alert('Please select only four _points.');
        }
        else {
            var rectanglePoints = this._points[0].x + '-' + this._points[0].y + '#'
                + this._points[1].x + '-' + this._points[1].y + '#'
                + this._points[2].x + '-' + this._points[2].y + '#'
                + this._points[3].x + '-' + this._points[3].y;
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
            this.initPoints();
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
        this.imageSourceOldToThumbnail = this.params.context.imageSource;
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
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        var scale = platform.screen.mainScreen.scale;
        this._imageActualSize = this._imgView.getActualSize();
        this._centerPointX = (this._imgGridId.getMeasuredWidth() / 2) / scale;
        this._centerPointY = (this._imgGridId.getMeasuredHeight() / 2) / scale;
        var actualPoint = { x: this._centerPointX - 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX - 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
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
                        circleBtn.translateX += +5;
                    }
                    else {
                        circleBtn.translateX += -5;
                    }
                    if (circleBtn.translateY < 0) {
                        circleBtn.translateY += +5;
                    }
                    else {
                        circleBtn.translateY += -5;
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
        var actualPointInScreenX = actualPoint.x + actualPointDeltaX;
        var actualPointInScreenY = actualPoint.y + actualPointDeltaY;
        circleBtn.translateX = actualPointInScreenX;
        circleBtn.translateY = actualPointInScreenY;
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
        if (translateX < (this._centerPointX - 10) &&
            translateY < (this._centerPointY - 10) &&
            (translateX * -1) < (this._centerPointX - 10) &&
            (translateY * -1) < (this._centerPointY - 10)) {
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
    })
    /**
     * Dialog content class.
     */
    ,
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object])
], DialogContent);
exports.DialogContent = DialogContent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWlFO0FBQ2pFLGtFQUFzRTtBQUt0RSxvRkFBc0c7QUFHdEcsZ0RBQW9EO0FBRXBELG1EQUFxRDtBQUNyRCwwQ0FBNEM7QUFDNUMsbUNBQXFDO0FBR3JDLHNEQUF3RDtBQUN4RCxtQ0FBcUM7QUFDckMsNkRBQStEO0FBWS9ELElBQWEsYUFBYTtJQTBCdEIsaUNBQWlDO0lBQ2pDLGtEQUFrRDtJQUVsRCwyQ0FBMkM7SUFFM0M7Ozs7T0FJRztJQUNILHVCQUFvQixNQUF5QixFQUNqQyx3QkFBa0Q7UUFEMUMsV0FBTSxHQUFOLE1BQU0sQ0FBbUI7UUFDakMsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWpDdkQscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBY3hCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBR2hCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUNuQixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUNuQiwwQkFBcUIsR0FBRyxLQUFLLENBQUM7UUFjbEMsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsOERBQThEO0lBQ2xFLENBQUM7SUFDRDs7O09BR0c7SUFDSCw2QkFBSyxHQUFMLFVBQU0sTUFBYztRQUNoQixXQUFXLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNEOzs7T0FHRztJQUNILCtDQUF1QixHQUF2QixVQUF3QixPQUFlO1FBQXZDLGlCQThCQztRQTdCRyxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFVO1lBQzVCLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1IsV0FBVyxFQUFFLENBQUM7WUFDbEIsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLENBQUMsV0FBVyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUc7a0JBQ25FLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHO2tCQUNqRCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRztrQkFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRWxELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLGVBQWUsRUFDN0YsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXRFLDhDQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNyQyxrQkFBVSxDQUFDO2dCQUNQLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsS0FBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ25FLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNULElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDO1lBQzlDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUM7WUFDOUIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JCLDJCQUEyQjtZQUMzQixJQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDaEQsQ0FBQztJQUNMLENBQUM7SUFDRDs7O09BR0c7SUFDSCxpQ0FBUyxHQUFULFVBQVUsS0FBdUI7UUFDN0IsSUFBSSxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyx3RkFBd0Y7Z0JBQ3hGLElBQU0sS0FBSyxHQUFXLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztnQkFFdkQsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RELElBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDO2dCQUM1QyxJQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFFNUMsSUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFFdEUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDdEUsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQzdELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDYixDQUFDO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0gseUNBQWlCLEdBQWpCO1FBRUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNsQixLQUFLLENBQUMsUUFBUSxDQUFDLDBGQUEwRixFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlILENBQUM7UUFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQzlCLElBQUksQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO1FBQy9CLElBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUN0QixDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsK0JBQU8sR0FBUCxVQUFRLElBQTJCO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQixnRUFBZ0U7WUFDaEUsZ0VBQWdFO1lBRWhFLDZFQUE2RTtZQUM3RSw4RUFBOEU7WUFDOUUsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUM1QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQy9DLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBRWpELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN0QyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUN4RSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM5RSxDQUFDO0lBQ0wsQ0FBQztJQUNEOzs7T0FHRztJQUNILDZCQUFLLEdBQUwsVUFBTSxJQUF5QjtRQUMzQixJQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzdFLElBQUksWUFBWSxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzlFLElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQztZQUNoRixJQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFFbEYsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztnQkFDckIsSUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLFlBQVksR0FBRyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbEMsWUFBWSxHQUFHLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVsQyw0REFBNEQ7Z0JBQzVELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLGNBQWMsQ0FBQztvQkFDN0MsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQzsyQkFDcEQsQ0FBQyxZQUFZLEdBQUcsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQ2xHLENBQUMsQ0FBQyxDQUFDO3dCQUNDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzt3QkFDM0QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDbkQsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQzFCLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQzt3QkFDMUIsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQzFCLENBQUM7d0JBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztvQkFDbkQsQ0FBQztvQkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7MkJBQ3BELENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUNuRyxDQUFDLENBQUMsQ0FBQzt3QkFDQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7d0JBQzNELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ25ELENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7d0JBQzFCLENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBQ0osSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO3dCQUMxQixDQUFDO3dCQUNELElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7b0JBQ25ELENBQUM7Z0JBQ0wsQ0FBQztnQkFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFDRDs7O09BR0c7SUFDSCxtQ0FBVyxHQUFYLFVBQVksSUFBUztRQUNqQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7Z0JBQ2xCLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDekIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNyQixLQUFLLEVBQUUsU0FBUztnQkFDaEIsUUFBUSxFQUFFLEVBQUU7YUFDZixDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3JCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN0QixDQUFDO0lBQ0wsQ0FBQztJQUNEOzs7T0FHRztJQUNILGtDQUFVLEdBQVYsVUFBVyxJQUFzQjtRQUM3QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUNuRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQztRQUN6RCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQzdELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztRQUM3RCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQztRQUN2RCxJQUFJLENBQUMseUJBQXlCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBRWpFLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDekIsV0FBVyxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ0Q7O09BRUc7SUFDSyxrQ0FBVSxHQUFsQjtRQUFBLGlCQUlDO1FBSEcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsVUFBQyxHQUFRO1lBQ2pDLEtBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNEOztPQUVHO0lBQ0sscUNBQWEsR0FBckI7UUFDSSxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDRDs7T0FFRztJQUNLLGtDQUFVLEdBQWxCO1FBQ0ksSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsd0ZBQXdGO1FBQ3hGLElBQU0sS0FBSyxHQUFXLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUV2RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN0RCxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUN0RSxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUV2RSxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0RyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQy9CLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUNsRyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDRDs7O09BR0c7SUFDSyxvQ0FBWSxHQUFwQixVQUFxQixXQUFnQjtRQUFyQyxpQkFzRUM7UUFyRUcseURBQXlEO1FBQ3pELDBEQUEwRDtRQUMxRCx1RkFBdUY7UUFDdkYsWUFBWTtRQUNaLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7UUFDMUYsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQztRQUU1RixJQUFNLGVBQWUsR0FBRyxJQUFJLHFCQUFxQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3BFLElBQU0sUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDbEQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTVDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLElBQU0sU0FBUyxHQUFRLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQzVDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLFNBQVMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsZUFBZSxDQUFDO1FBQzFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFVBQUMsSUFBeUI7WUFDMUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixLQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztnQkFDckIsS0FBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqRSxTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO29CQUM1QixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUNoQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMvQixDQUFDO29CQUNELEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsU0FBUyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixTQUFTLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMvQixDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDMUIsRUFBRSxDQUFDLENBQUMsS0FBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pFLFNBQVMsQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFJLENBQUMsV0FBVyxDQUFDO29CQUN2RCxTQUFTLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSSxDQUFDLFdBQVcsQ0FBQztvQkFFdkQsS0FBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFVO3dCQUM1QixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDOzRCQUNSLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0NBQzVCLEtBQUssQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztnQ0FDbkQsS0FBSyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDOzRCQUN2RCxDQUFDO3dCQUNMLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO29CQUMvQixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ25DLENBQUM7WUFDTCxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCx5REFBeUQ7UUFDekQsMERBQTBEO1FBQzFELHVGQUF1RjtRQUN2RixZQUFZO1FBQ1osSUFBTSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1FBQy9ELElBQU0sb0JBQW9CLEdBQUcsV0FBVyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsQ0FBQztRQUMvRCxTQUFTLENBQUMsVUFBVSxHQUFHLG9CQUFvQixDQUFDO1FBQzVDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsb0JBQW9CLENBQUM7UUFDNUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0IsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNLLHFDQUFhLEdBQXJCLFVBQXNCLFVBQWUsRUFBRSxVQUFlO1FBQ2xELEVBQUUsQ0FBQyxDQUFDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLFVBQVUsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQ3RDLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztZQUM3QyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ2pCLENBQUM7SUFDTCxDQUFDO0lBRUwsb0JBQUM7QUFBRCxDQUFDLEFBNVhELElBNFhDO0FBNVhZLGFBQWE7SUFWekIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQztRQUNyQyxXQUFXLEVBQUUseUJBQXlCO0tBQ3pDLENBQUM7SUFFRjs7T0FFRzs7cUNBcUM2QixnQ0FBaUIsc0JBQ1Asb0RBQXdCLG9CQUF4QixvREFBd0I7R0FyQ3JELGFBQWEsQ0E0WHpCO0FBNVhZLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nUGFyYW1zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IFZpZXcgfSBmcm9tICd1aS9jb3JlL3ZpZXcnO1xuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuaW1wb3J0IHsgRmlsZSwgcGF0aCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgc2V0VGltZW91dCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdGltZXInO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICd1aS9pbWFnZSc7XG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIHBsYXRmb3JtIGZyb20gJ3BsYXRmb3JtJztcbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIG9yaWVudGF0aW9uIGZyb20gJ25hdGl2ZXNjcmlwdC1vcmllbnRhdGlvbic7XG5pbXBvcnQgKiBhcyBidXR0b25zIGZyb20gJ3VpL2J1dHRvbic7XG5pbXBvcnQgKiBhcyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUgZnJvbSAndGV4dC9mb3JtYXR0ZWQtc3RyaW5nJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdtb2RhbC1jb250ZW50JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2RpYWxvZy5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RpYWxvZy5jb21wb25lbnQuaHRtbCcsXG59KVxuXG4vKipcbiAqIERpYWxvZyBjb250ZW50IGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29udGVudCB7XG4gICAgcHVibGljIGltYWdlU291cmNlOiBhbnk7XG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgcHVibGljIGNvbnRvdXJMaXN0OiBhbnk7XG4gICAgcHVibGljIGlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPbGRUb1RodW1ibmFpbDogYW55O1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG5cbiAgICBwcml2YXRlIF9wb2ludHM6IGFueTtcbiAgICBwcml2YXRlIF9wb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaW1hZ2VTb3VyY2VPcmdPbGQ6IGFueTtcbiAgICBwcml2YXRlIF9pbWFnZVNvdXJjZU9sZDogYW55O1xuICAgIHByaXZhdGUgX2ltYWdlQWN0dWFsU2l6ZTogYW55O1xuICAgIHByaXZhdGUgX2NpcmNsZUJ0bkxpc3Q6IGFueTtcbiAgICBwcml2YXRlIF9pbWdWaWV3OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW1nR3JpZElkOiBhbnk7XG4gICAgcHJpdmF0ZSBfcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3ByZXZEZWx0YVk6IG51bWJlcjtcbiAgICBwcml2YXRlIF9zdGFydFNjYWxlID0gMTtcbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFg6IGFueTtcbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFk6IGFueTtcbiAgICBwcml2YXRlIF9uZXdTY2FsZSA9IDE7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgcHJpdmF0ZSBfaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZWZhdWx0U2NyZWVuTG9jYXRpb246IGFueTtcbiAgICAvLyBwcml2YXRlIF9kcmFnSW1hZ2VJdGVtOiBJbWFnZTtcbiAgICAvLyBAVmlld0NoaWxkKCdpbWdWaWV3SWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgLy8gcHJpdmF0ZSBfcG9pbnRzID0gbmV3IE9ic2VydmFibGVBcnJheSgpO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIERpYWxvZ0NvbnRlbnQgY2xhc3MuXG4gICAgICogQHBhcmFtIHBhcmFtcyBcbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyYW1zOiBNb2RhbERpYWxvZ1BhcmFtcyxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcikge1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnTWFudWFsJztcbiAgICAgICAgdGhpcy5fcG9pbnRzID0gW107XG4gICAgICAgIHRoaXMuX3BvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLl9jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSA8SW1hZ2U+dGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsb3NlXG4gICAgICogQHBhcmFtIHJlc3VsdCBcbiAgICAgKi9cbiAgICBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gbWFudWFsIGNvcnJlY3Rpb24uXG4gICAgICogQHBhcmFtIGJ0blRleHQgXG4gICAgICovXG4gICAgcGVyZm9ybU1hbnVhbENvcnJlY3Rpb24oYnRuVGV4dDogc3RyaW5nKSB7XG4gICAgICAgIGxldCBwb2ludHNDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuX3BvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHBvaW50c0NvdW50ICE9PSA0KSB7XG4gICAgICAgICAgICBhbGVydCgnUGxlYXNlIHNlbGVjdCBvbmx5IGZvdXIgX3BvaW50cy4nKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50cyA9IHRoaXMuX3BvaW50c1swXS54ICsgJy0nICsgdGhpcy5fcG9pbnRzWzBdLnkgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1sxXS54ICsgJy0nICsgdGhpcy5fcG9pbnRzWzFdLnkgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1syXS54ICsgJy0nICsgdGhpcy5fcG9pbnRzWzJdLnkgKyAnIydcbiAgICAgICAgICAgICAgICArIHRoaXMuX3BvaW50c1szXS54ICsgJy0nICsgdGhpcy5fcG9pbnRzWzNdLnk7XG5cbiAgICAgICAgICAgIHRoaXMuX2ltYWdlU291cmNlT2xkID0gdGhpcy5pbWFnZVNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlQ29ycmVjdGlvbk1hbnVhbCh0aGlzLmltYWdlU291cmNlT3JnLCByZWN0YW5nbGVQb2ludHMsXG4gICAgICAgICAgICAgICAgdGhpcy5faW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCk7XG5cbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltYWdlU291cmNlKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmRlbGV0ZUZpbGUodGhpcy5faW1hZ2VTb3VyY2VPbGQpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5faW1hZ2VTb3VyY2VPcmdPbGQ7XG4gICAgICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ01hbnVhbCc7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZXMoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuX3BvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuRGVsZXRlRmlsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHJlY3RhbmdsZSBwb2ludHMuXG4gICAgICogQHBhcmFtIGV2ZW50IFxuICAgICAqL1xuICAgIGdldFBvaW50cyhldmVudDogR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCA9PT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVuc2l0eSBvZiB5b3VyIHNjcmVlbiwgc28gd2UgY2FuIGRpdmlkZSB0aGUgbWVhc3VyZWQgd2lkdGgvaGVpZ2h0IGJ5IGl0LlxuICAgICAgICAgICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZSA9IHRoaXMuX2ltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50WCA9IGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC8gc2NhbGU7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRZID0gZXZlbnQuYW5kcm9pZC5nZXRZKCkgLyBzY2FsZTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFBvaW50ID0geyB4OiBwb2ludFgsIHk6IHBvaW50WSwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wb2ludHMubGVuZ3RoID49IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1BsZWFzZSBzZWxlY3Qgb25seSBmb3VyIF9wb2ludHMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhbGVydChlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIHNob3dPcmlnaW5hbEltYWdlKCkge1xuXG4gICAgICAgIHRoaXMub25Eb3VibGVUYXAobnVsbCk7XG4gICAgICAgIGlmICh0aGlzLl9jaXJjbGVCdG5MaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbml0UG9pbnRzKCk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnUGxlYXNlIG1vdmUgYXJvdW5kIHRoZSBmb3VyIHJlZCBjaXJjbGUocykgb24gaW1hZ2UgaWYgbmVlZGVkIGFuZCBjbGljayBcIlBlcmZvcm1cIiBidXR0b24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9ICdQZXJmb3JtJztcbiAgICAgICAgdGhpcy5fcG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBldmVudCBwaW5jaFxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVk7XG5cbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5YID0gdGhpcy5faW1nVmlldy5vcmlnaW5YICogdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCk7XG4gICAgICAgICAgICAvLyBsZXQgb2xkT3JpZ2luWSA9IHRoaXMuX2ltZ1ZpZXcub3JpZ2luWSAqIHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0U2NhbGUgPSB0aGlzLl9pbWdWaWV3LnNjYWxlWDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gdGhpcy5fc3RhcnRTY2FsZSAqIGFyZ3Muc2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IE1hdGgubWluKDgsIHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gTWF0aC5tYXgoMC4xMjUsIHRoaXMuX25ld1NjYWxlKTtcblxuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5zY2FsZVggPSB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcuc2NhbGVZID0gdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LndpZHRoID0gdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcuaGVpZ2h0ID0gdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgcGFuL21vdmVcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5faW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09ICdQZXJmb3JtJykge1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WCA9ICh0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpIC8gNCkgKiAodGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuX2ltZ1ZpZXcub3JpZ2luWDtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX2ltZ1ZpZXcub3JpZ2luWTtcblxuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzR290RGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9uZXdTY2FsZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5fcHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWCA9IHRoaXMuX29sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFkgLSBpbWFnZVZpZXdIZWlnaHQpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gdGhpcy5faW1nVmlldy50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVkgPSB0aGlzLl9vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgZG91YmxlIHRhcC5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgICAgIGN1cnZlOiAnZWFzZU91dCcsXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDEwLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IDE7XG4gICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbml0UG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZXMoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIGV2ZW50IHBhZ2UgbG9hZGVkLlxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIHBhZ2VMb2FkZWQoYXJnczogeyBvYmplY3Q6IGFueTsgfSkge1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZyA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmc7XG4gICAgICAgIHRoaXMuX2ltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLl9pbWFnZVNvdXJjZU9sZCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPbGRUb1RodW1ibmFpbCA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG5cbiAgICAgICAgY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLl9pbWdWaWV3ID0gcGFnZS5nZXRWaWV3QnlJZCgnaW1nVmlld0lkJyk7XG4gICAgICAgIHRoaXMuX2ltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcuc2NhbGVZID0gMTtcbiAgICAgICAgb3JpZW50YXRpb24uc2V0T3JpZW50YXRpb24oJ3BvcnRyYWl0Jyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBjaXJjbGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkQ2lyY2xlcygpIHtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdC5mb3JFYWNoKChidG46IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZUNpcmNsZXMoKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSB0aGlzLl9pbWdHcmlkSWQuZ2V0Q2hpbGRBdCgwKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkLnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuX2ltZ0dyaWRJZC5hZGRDaGlsZChpbWdFbGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwb2ludHNcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMuX3BvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLl9pbWFnZUFjdHVhbFNpemUgPSB0aGlzLl9pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAgICAgdGhpcy5fY2VudGVyUG9pbnRYID0gKHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyAyKSAvIHNjYWxlO1xuICAgICAgICB0aGlzLl9jZW50ZXJQb2ludFkgPSAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLl9jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5fY2VudGVyUG9pbnRZIC0gNzUsIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuX2NlbnRlclBvaW50WCAtIDc1LCB5OiB0aGlzLl9jZW50ZXJQb2ludFkgKyA3NSwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSBhY3R1YWxQb2ludCBcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludDogYW55KTogYW55IHtcbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWCA9ICh0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aDtcbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVkgPSAodGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCAvIDIpIC0gdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMuX3BvaW50c0NvdW50ZXIrKztcbiAgICAgICAgY2lyY2xlQnRuLmZvcm1hdHRlZFRleHQgPSBmb3JtYXR0ZWRTdHJpbmc7XG4gICAgICAgIGNpcmNsZUJ0bi5vbigncGFuJywgKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICs1O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gKzU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5fcHJldkRlbHRhWTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wb2ludHMuZm9yRWFjaCgocG9pbnQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBvaW50LmlkID09PSBjaXJjbGVCdG4uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueCA9IGNpcmNsZUJ0bi50cmFuc2xhdGVYIC0gYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnkgPSBjaXJjbGVCdG4udHJhbnNsYXRlWSAtIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMykge1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBTaW5jZSB0aGUgc2VsZWN0ZWQgcG9pbnQgYnkgdXNlciBpcyBhbHdheXMgcG9pbnRpbmcgdG9cbiAgICAgICAgLy8gY2VudGVyIG9mIHRoZSBpbWFnZSAod2hpY2ggaXMgKDAsMCkpLCBzbyBuZWVkIHRvIHNlbGVjdFxuICAgICAgICAvLyB0b3AtbGVmdCwgdG9wLXJpZ2h0ICYgYm90dG9tLWxlZnQsIGZvciB3aGljaCB0aGUgYWN0dWFsUG9pbnREZWx0YVgvYWN0dWFsUG9pbnREZWx0YVlcbiAgICAgICAgLy8gYXJlIHVzZWQuXG4gICAgICAgIGNvbnN0IGFjdHVhbFBvaW50SW5TY3JlZW5YID0gYWN0dWFsUG9pbnQueCArIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICBjb25zdCBhY3R1YWxQb2ludEluU2NyZWVuWSA9IGFjdHVhbFBvaW50LnkgKyBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludEluU2NyZWVuWDtcbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSBhY3R1YWxQb2ludEluU2NyZWVuWTtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdC5wdXNoKGNpcmNsZUJ0bik7XG4gICAgICAgIHRoaXMuX3BvaW50cy5wdXNoKGFjdHVhbFBvaW50KTtcbiAgICAgICAgcmV0dXJuIGNpcmNsZUJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2sgc2NyZWVuIGJvdW5kYXJ5LlxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVYIFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVZIFxuICAgICAqL1xuICAgIHByaXZhdGUgY2hlY2tCb3VuZGFyeSh0cmFuc2xhdGVYOiBhbnksIHRyYW5zbGF0ZVk6IGFueSk6IGFueSB7XG4gICAgICAgIGlmICh0cmFuc2xhdGVYIDwgKHRoaXMuX2NlbnRlclBvaW50WCAtIDEwKSAmJlxuICAgICAgICAgICAgdHJhbnNsYXRlWSA8ICh0aGlzLl9jZW50ZXJQb2ludFkgLSAxMCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVYICogLTEpIDwgKHRoaXMuX2NlbnRlclBvaW50WCAtIDEwKSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVkgKiAtMSkgPCAodGhpcy5fY2VudGVyUG9pbnRZIC0gMTApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19