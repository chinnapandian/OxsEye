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
            this._rectanglePoints.forEach(function (point) {
                var points = point.split('%');
                var circleRadius = 17;
                if (pointIndex_1++ > 2) {
                    circleRadius = circleRadius * -1;
                }
                var actualPoint = { x: +points[0] * (_this._imgGridId.getMeasuredWidth() / scale), y: (+points[1] * (_this._imgGridId.getMeasuredHeight() / scale)) + circleRadius, id: _this._pointsCounter };
                _this.createCircle(actualPoint);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWlFO0FBQ2pFLGtFQUFzRTtBQUt0RSxvRkFBc0c7QUFHdEcsZ0RBQW9EO0FBRXBELG1EQUFxRDtBQUNyRCwwQ0FBNEM7QUFDNUMsbUNBQXFDO0FBR3JDLHNEQUF3RDtBQUN4RCxtQ0FBcUM7QUFDckMsNkRBQStEO0FBRS9EOztHQUVHO0FBT0gsSUFBYSxhQUFhO0lBK0N0QixpQ0FBaUM7SUFDakMsa0RBQWtEO0lBRWxELDJDQUEyQztJQUUzQzs7OztPQUlHO0lBQ0gsdUJBQW9CLE1BQXlCLEVBQ2pDLHdCQUFrRDtRQUQxQyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUNqQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBckQ5RCwwRUFBMEU7UUFDbkUscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBdUJoQyx3Q0FBd0M7UUFDaEMsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFLeEIsdURBQXVEO1FBQy9DLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDdEIsd0RBQXdEO1FBQ2hELG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLHdEQUF3RDtRQUNoRCxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUMzQixzRkFBc0Y7UUFDOUUsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBaUJsQyxJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6Qiw4REFBOEQ7SUFDbEUsQ0FBQztJQUNEOzs7T0FHRztJQUNILDZCQUFLLEdBQUwsVUFBTSxNQUFjO1FBQ2hCLFdB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QUFDLENBQUMsQ0FBQztZQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDakIsQ0FBQztJQUNMLENBQUM7SUFFTCxvQkFBQztBQUFELENBQUMsQUE3YkQsSUE2YkM7QUE3YlksYUFBYTtJQU56QixnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixDQUFDO1FBQ3JDLFdBQVcsRUFBRSx5QkFBeUI7S0FDekMsQ0FBQztxQ0EwRDhCLGdDQUFpQixzQkFDUCxvREFBd0Isb0JBQXhCLG9EQUF3QjtHQTFEckQsYUFBYSxDQTZiekI7QUE3Ylksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dQYXJhbXMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgVmlldyB9IGZyb20gJ3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd1aS9nZXN0dXJlcyc7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UuY29tbW9uJztcbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5pbXBvcnQgeyBGaWxlLCBwYXRoIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy90aW1lcic7XG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJ3VpL2ltYWdlJztcbmltcG9ydCAqIGFzIG9wZW5jdiBmcm9tICduYXRpdmVzY3JpcHQtb3BlbmN2LXBsdWdpbic7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuaW1wb3J0ICogYXMgcGxhdGZvcm0gZnJvbSAncGxhdGZvcm0nO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgb3JpZW50YXRpb24gZnJvbSAnbmF0aXZlc2NyaXB0LW9yaWVudGF0aW9uJztcbmltcG9ydCAqIGFzIGJ1dHRvbnMgZnJvbSAndWkvYnV0dG9uJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlZFN0cmluZ01vZHVsZSBmcm9tICd0ZXh0L2Zvcm1hdHRlZC1zdHJpbmcnO1xuXG4vKipcbiAqIERpYWxvZyBjb250ZW50IGNsYXNzLlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ21vZGFsLWNvbnRlbnQnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vZGlhbG9nLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vZGlhbG9nLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nQ29udGVudCB7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IGFueTtcbiAgICAvKiogT3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIC8qKiBDb250YWlucyB0cnVlL2ZhbHNlIHRvIHBlcmZvcm0gdHJhbnNmb3JtYXRpb24gYXV0b21hdGljYWxseSBvciBub3QuICovXG4gICAgcHVibGljIGlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAvKiogQ29udGFpbnMgYnV0dG9uIGxhYmVsIG5hbWUgZWl0aGVyICdNYW51YWwnLyAnUGVyZm9ybScgKi9cbiAgICBwdWJsaWMgbWFudWFsQnRuVGV4dDogc3RyaW5nO1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGZvdXIgcG9pbnRzIG9mIHRoZSBpbWFnZXMuICovXG4gICAgcHJpdmF0ZSBfcG9pbnRzOiBhbnk7XG4gICAgLyoqIEluZGljYXRlcyB0aGUgbnVtYmVyIG9mIHBvaW50cy4gKi9cbiAgICBwcml2YXRlIF9wb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyBvcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBfaW1hZ2VTb3VyY2VPcmdPbGQ6IGFueTtcbiAgICAvKiogU3RvcmVzIHByZXZpb3VzIHRyYW5zZm9ybWVkIGltYWdlIHNvdXJjZS4gKi9cbiAgICBwcml2YXRlIF9pbWFnZVNvdXJjZU9sZDogYW55O1xuICAgIC8qKiBDb250YWlucyB0cmFuc2Zvcm1lZCBpbWFnZSBhY3R1YWwgc2l6ZS4gKi9cbiAgICBwcml2YXRlIF9pbWFnZUFjdHVhbFNpemU6IGFueTtcbiAgICAvKiogTGlzdCBvZiBjaXJjbGUgYnV0dG9ucyAqL1xuICAgIHByaXZhdGUgX2NpcmNsZUJ0bkxpc3Q6IGFueTtcbiAgICAvKiogU3RvcmVzIHRyYW5zZm9ybWVkIGltYWdlIHJlZmVycmVuY2UuICovXG4gICAgcHJpdmF0ZSBfaW1nVmlldzogYW55O1xuICAgIC8qKiBJbWFnZSBncmlkIGlkLiAqL1xuICAgIHByaXZhdGUgX2ltZ0dyaWRJZDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVguICovXG4gICAgcHJpdmF0ZSBfcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVkuICovXG4gICAgcHJpdmF0ZSBfcHJldkRlbHRhWTogbnVtYmVyO1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzdGFydGluZyBzY2FsZS4gKi9cbiAgICBwcml2YXRlIF9zdGFydFNjYWxlID0gMTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WC4gKi9cbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFg6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WS4gKi9cbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFk6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgbmV3IHNjYWxlIHdoaWxlIG1vdmluZyBhcm91bmQuICovXG4gICAgcHJpdmF0ZSBfbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBTdG9yZXMgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgLyoqIFN0b3JlcyBvbGQgdHJhbnNsYXRlWSB2YWx1ZSBvZiB0cmFuc2Zvcm1lZCBJbWFnZS4gKi9cbiAgICBwcml2YXRlIF9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBpbmRpY2F0ZSB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90LiAqL1xuICAgIHByaXZhdGUgX2lzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSdzIHNjcmVlbiBsb2NhdGlvbi4gKi9cbiAgICBwcml2YXRlIF9kZWZhdWx0U2NyZWVuTG9jYXRpb246IGFueTtcbiAgICAvKiogU3RvcmVzIHJlY3RhbmdsZSBwb2ludHMgdG8gYmUgdXNlZCBpbiB0aGUgT3BlbkNWIEFQSSBjYWxsLiAqL1xuICAgIHByaXZhdGUgX3JlY3RhbmdsZVBvaW50czogYW55O1xuICAgIC8vIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8vIEBWaWV3Q2hpbGQoJ2ltZ1ZpZXdJZCcpIF9kcmFnSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICAvLyBwcml2YXRlIF9wb2ludHMgPSBuZXcgT2JzZXJ2YWJsZUFycmF5KCk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgRGlhbG9nQ29udGVudCBjbGFzcy5cbiAgICAgKiBAcGFyYW0gcGFyYW1zIGNvbnRhaW5zIGNhcHR1cmVkIGltYWdlIGZpbGUgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIHRyYW5zZm9ybWVkIGltYWdlIHByb3ZpZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9ICdNYW51YWwnO1xuICAgICAgICB0aGlzLl9wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5fcG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuX2NpcmNsZUJ0bkxpc3QgPSBbXTtcbiAgICAgICAgLy8gdGhpcy5fZHJhZ0ltYWdlSXRlbSA9IDxJbWFnZT50aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2xvc2VcbiAgICAgKiBAcGFyYW0gcmVzdWx0IFxuICAgICAqL1xuICAgIGNsb3NlKHJlc3VsdDogc3RyaW5nKSB7XG4gICAgICAgIG9yaWVudGF0aW9uLmVuYWJsZVJvdGF0aW9uKCk7XG4gICAgICAgIHRoaXMucGFyYW1zLmNsb3NlQ2FsbGJhY2socmVzdWx0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGVyZm9ybSBtYW51YWwgY29ycmVjdGlvbi5cbiAgICAgKiBAcGFyYW0gYnRuVGV4dCBcbiAgICAgKi9cbiAgICBwZXJmb3JtTWFudWFsQ29ycmVjdGlvbihidG5UZXh0OiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IHBvaW50c0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5fcG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgIHBvaW50c0NvdW50Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlO1xuICAgICAgICBsZXQgY2lyY2xlUmFkaXVzID0gMTc7XG4gICAgICAgIC8vIHRoaXMuX3BvaW50c1swXS55ID0gK3RoaXMuX3BvaW50c1swXS55IC0gY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLl9wb2ludHNbMV0ueSA9ICt0aGlzLl9wb2ludHNbMV0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5fcG9pbnRzWzJdLnkgPSArdGhpcy5fcG9pbnRzWzJdLnkgKyBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMuX3BvaW50c1szXS55ID0gK3RoaXMuX3BvaW50c1szXS55ICsgY2lyY2xlUmFkaXVzO1xuXG4gICAgICAgIGlmIChwb2ludHNDb3VudCAhPT0gNCkge1xuICAgICAgICAgICAgYWxlcnQoJ1BsZWFzZSBzZWxlY3Qgb25seSBmb3VyIF9wb2ludHMuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHMgPSB0aGlzLl9wb2ludHNbMF0ueCArICctJyArICgrdGhpcy5fcG9pbnRzWzBdLnkgLSBjaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICAgICAgKyB0aGlzLl9wb2ludHNbMV0ueCArICctJyArICgrdGhpcy5fcG9pbnRzWzFdLnkgLSBjaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICAgICAgKyB0aGlzLl9wb2ludHNbMl0ueCArICctJyArICgrdGhpcy5fcG9pbnRzWzJdLnkgKyBjaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICAgICAgKyB0aGlzLl9wb2ludHNbM10ueCArICctJyArICgrdGhpcy5fcG9pbnRzWzNdLnkgKyBjaXJjbGVSYWRpdXMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVjdGFuZ2xlUG9pbnRzKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuaW1hZ2VTb3VyY2VPcmcpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5faW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLl9pbWFnZVNvdXJjZU9sZCA9IHRoaXMuaW1hZ2VTb3VyY2U7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZUNvcnJlY3Rpb25NYW51YWwodGhpcy5pbWFnZVNvdXJjZU9yZywgcmVjdGFuZ2xlUG9pbnRzLFxuICAgICAgICAgICAgICAgIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aCArICctJyArIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1hZ2VTb3VyY2UpO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZGVsZXRlRmlsZSh0aGlzLl9pbWFnZVNvdXJjZU9sZCk7XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLl9pbWFnZVNvdXJjZU9yZ09sZDtcbiAgICAgICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnTWFudWFsJztcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgLy8gdGhpcy5fcG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5EZWxldGVGaWxlcygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKiBAcGFyYW0gZXZlbnQgXG4gICAgICovXG4gICAgZ2V0UG9pbnRzKGV2ZW50OiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ID09PSAnUGVyZm9ybScpIHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgICAgICAgICAgY29uc3Qgc2NhbGU6IG51bWJlciA9IHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLnNjYWxlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5faW1hZ2VBY3R1YWxTaXplID0gdGhpcy5faW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRYKCkgLyBzY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zdCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFkoKSAvIHNjYWxlO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgYWN0dWFsUG9pbnQgPSB7IHg6IHBvaW50WCwgeTogcG9pbnRZLCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BvaW50cy5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnUGxlYXNlIHNlbGVjdCBvbmx5IGZvdXIgX3BvaW50cy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdHcmlkSWQuYWRkQ2hpbGQodGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGFsZXJ0KGUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgc2hvd09yaWdpbmFsSW1hZ2UoKSB7XG5cbiAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChudWxsKTtcbiAgICAgICAgaWYgKHRoaXMuX2NpcmNsZUJ0bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2UgbW92ZSBhcm91bmQgdGhlIGZvdXIgcmVkIGNpcmNsZShzKSBvbiBpbWFnZSBpZiBuZWVkZWQgYW5kIGNsaWNrIFwiUGVyZm9ybVwiIGJ1dHRvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ1BlcmZvcm0nO1xuICAgICAgICB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIGV2ZW50IHBpbmNoXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5YID0gYXJncy5nZXRGb2N1c1goKSAtIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5ZID0gYXJncy5nZXRGb2N1c1koKSAtIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWTtcblxuICAgICAgICAgICAgLy8gbGV0IG9sZE9yaWdpblggPSB0aGlzLl9pbWdWaWV3Lm9yaWdpblggKiB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5faW1nVmlldy5vcmlnaW5ZICogdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRTY2FsZSA9IHRoaXMuX2ltZ1ZpZXcuc2NhbGVYO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSB0aGlzLl9zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gTWF0aC5taW4oOCwgdGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgdGhpcy5fbmV3U2NhbGUpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWCA9IHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5zY2FsZVkgPSB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcud2lkdGggPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5oZWlnaHQgPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBldmVudCBwYW4vbW92ZVxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gNCkgKiAodGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdXaWR0aCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5faW1nVmlldy5vcmlnaW5YO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5faW1nVmlldy5vcmlnaW5ZO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgY2VudGVyUG9pbnRYID0gKGNlbnRlclBvaW50WCAqIDIpO1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WSA9IChjZW50ZXJQb2ludFkgKiAyKTtcblxuICAgICAgICAgICAgICAgIC8vIGxldCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5faXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uID0gc2NyZWVuTG9jYXRpb247XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX25ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24ueCkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WCAtIGltYWdlVmlld1dpZHRoKSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLl9wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbGRUcmFuc2xhdGVYID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVYID0gdGhpcy5fb2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5fcHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVkgPSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSA9IHRoaXMuX29sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBldmVudCBkb3VibGUgdGFwLlxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKGFyZ3M6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSAnUGVyZm9ybScpIHtcbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gMTtcbiAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gZXZlbnQgcGFnZSBsb2FkZWQuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzOiB7IG9iamVjdDogYW55OyB9KSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5faW1hZ2VTb3VyY2VPcmdPbGQgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0aGlzLnBhcmFtcy5jb250ZXh0LmlzQXV0b0NvcnJlY3Rpb247XG4gICAgICAgIHRoaXMuX2ltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgbGV0IHJlY1BvaW50c1N0clRlbXAgPSB0aGlzLnBhcmFtcy5jb250ZXh0LnJlY3RhbmdsZVBvaW50cztcblxuICAgICAgICB0aGlzLl9yZWN0YW5nbGVQb2ludHMgPSByZWNQb2ludHNTdHJUZW1wLnNwbGl0KCcjJyk7XG4gICAgICAgIHRoaXMuX3JlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLl9yZWN0YW5nbGVQb2ludHMucG9wKCk7IC8vIHJlbW92ZSBsYXN0IGVsZW1lbnRcbiAgICAgICAgY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLl9pbWdWaWV3ID0gcGFnZS5nZXRWaWV3QnlJZCgnaW1nVmlld0lkJyk7XG4gICAgICAgIHRoaXMuX2ltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuX2ltZ1ZpZXcuc2NhbGVZID0gMTtcbiAgICAgICAgb3JpZW50YXRpb24uc2V0T3JpZW50YXRpb24oJ3BvcnRyYWl0Jyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBjaXJjbGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgYWRkQ2lyY2xlcygpIHtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdC5mb3JFYWNoKChidG46IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW1vdmUgY2lyY2xlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZUNpcmNsZXMoKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSB0aGlzLl9pbWdHcmlkSWQuZ2V0Q2hpbGRBdCgwKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkLnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgIHRoaXMuX2ltZ0dyaWRJZC5hZGRDaGlsZChpbWdFbGVtZW50KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBwb2ludHNcbiAgICAgKi9cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMuX3BvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGNvbnN0IHNjYWxlOiBudW1iZXIgPSBwbGF0Zm9ybS5zY3JlZW4ubWFpblNjcmVlbi5zY2FsZTtcblxuICAgICAgICB0aGlzLl9pbWFnZUFjdHVhbFNpemUgPSB0aGlzLl9pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAgICAgdGhpcy5fY2VudGVyUG9pbnRYID0gKHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkgLyAyKSAvIHNjYWxlO1xuICAgICAgICB0aGlzLl9jZW50ZXJQb2ludFkgPSAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyAyKSAvIHNjYWxlO1xuXG4gICAgICAgIGlmICh0aGlzLl9yZWN0YW5nbGVQb2ludHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbGV0IHBvaW50SW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5fcmVjdGFuZ2xlUG9pbnRzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvaW50cyA9IHBvaW50LnNwbGl0KCclJyk7XG4gICAgICAgICAgICAgICAgbGV0IGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgICAgICAgICAgICAgIGlmIChwb2ludEluZGV4KysgPiAyKSB7IC8vIEZvciBjaGVja2luZyBib3R0b24gcG9pbnRzXG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZVJhZGl1cyA9IGNpcmNsZVJhZGl1cyAqIC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgYWN0dWFsUG9pbnQgPSB7IHg6ICtwb2ludHNbMF0gKiAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSwgeTogKCtwb2ludHNbMV0gKiAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpICsgY2lyY2xlUmFkaXVzLCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVsc2Uge1xuXG5cbiAgICAgICAgLy8gICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSAtIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAvLyAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuX2NlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLl9jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgLy8gICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgLy8gICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLl9jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5fY2VudGVyUG9pbnRZICsgNzUsIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgIC8vICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgIC8vICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICAvLyAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAvLyB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBjaXJjbGVzLlxuICAgICAqIEBwYXJhbSBhY3R1YWxQb2ludCBcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludDogYW55KTogYW55IHtcbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWCA9ICh0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aDtcbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVkgPSAodGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCAvIDIpIC0gdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMuX3BvaW50c0NvdW50ZXIrKztcbiAgICAgICAgY2lyY2xlQnRuLmZvcm1hdHRlZFRleHQgPSBmb3JtYXR0ZWRTdHJpbmc7XG4gICAgICAgIGNpcmNsZUJ0bi5vbigncGFuJywgKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpID0+IHtcbiAgICAgICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLl9wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PT0gY2lyY2xlQnRuLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnggPSBjaXJjbGVCdG4udHJhbnNsYXRlWCAtIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC55ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVkgLSBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLlxuICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IGFjdHVhbFBvaW50LnggKyBhY3R1YWxQb2ludERlbHRhWDtcbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSBhY3R1YWxQb2ludC55ICsgYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA+IDAgJiZcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID4gdGhpcy5fY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuX2NlbnRlclBvaW50WDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggKiAtMSkgPiB0aGlzLl9jZW50ZXJQb2ludFgpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gdGhpcy5fY2VudGVyUG9pbnRYICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiB0aGlzLl9jZW50ZXJQb2ludFkpIHtcbiAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gdGhpcy5fY2VudGVyUG9pbnRZO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWSA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWSAqIC0xKSA+IHRoaXMuX2NlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLl9jZW50ZXJQb2ludFkgKiAtMTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2NpcmNsZUJ0bkxpc3QucHVzaChjaXJjbGVCdG4pO1xuICAgICAgICB0aGlzLl9wb2ludHMucHVzaChhY3R1YWxQb2ludCk7XG4gICAgICAgIHJldHVybiBjaXJjbGVCdG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrIHNjcmVlbiBib3VuZGFyeS5cbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWCBcbiAgICAgKiBAcGFyYW0gdHJhbnNsYXRlWSBcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrQm91bmRhcnkodHJhbnNsYXRlWDogYW55LCB0cmFuc2xhdGVZOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBwb2ludEFkanVzdG1lbnQgPSA1OyAvLyBOZWVkIHRvIGFkanVzdCB0aGUgY2VudGVyIHBvaW50IHZhbHVlIHRvIGNoZWNrIHRoZSBib3VuZGFyeVxuICAgICAgICBpZiAodHJhbnNsYXRlWCA8ICh0aGlzLl9jZW50ZXJQb2ludFggLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICB0cmFuc2xhdGVZIDwgKHRoaXMuX2NlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVYICogLTEpIDwgKHRoaXMuX2NlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVZICogLTEpIDwgKHRoaXMuX2NlbnRlclBvaW50WSAtIHBvaW50QWRqdXN0bWVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=