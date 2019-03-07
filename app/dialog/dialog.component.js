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
var Toast = require("nativescript-toast");
var platform = require("platform");
var opencv = require("nativescript-opencv-plugin");
var timer_1 = require("tns-core-modules/timer");
var orientation = require('nativescript-orientation');
var buttons = require("ui/button");
var formattedStringModule = require("text/formatted-string");
var DialogContent = (function () {
    // private _dragImageItem: Image;
    // @ViewChild("imgViewId") _dragImage: ElementRef;
    // private _points = new ObservableArray();
    function DialogContent(params, transformedImageProvider) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this._startScale = 1;
        this._newScale = 1;
        this._oldTranslateX = 0;
        this._oldTranslateY = 0;
        this.manualBtnText = 'Manual';
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    DialogContent.prototype.performManualCorrection = function (btnText) {
        var _this = this;
        // if (btnText == 'Manual') {
        //     this.isAutoCorrection = false;
        //     this.manualBtnText = 'Perform';
        // }
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
            // let rectanglePoints = this._points.getItem(0).x + '-' + this._points.getItem(0).y + '#'
            //     + this._points.getItem(1).x + '-' + this._points.getItem(1).y + '#'
            //     + this._points.getItem(2).x + '-' + this._points.getItem(2).y + '#'
            //     + this._points.getItem(3).x + '-' + this._points.getItem(3).y;
            var rectanglePoints = this._points[0].x + '-' + this._points[0].y + '#'
                + this._points[1].x + '-' + this._points[1].y + '#'
                + this._points[2].x + '-' + this._points[2].y + '#'
                + this._points[3].x + '-' + this._points[3].y;
            console.log(rectanglePoints);
            this._imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this._imageActualSize.width + '-' + this._imageActualSize.height);
            transformedimage_provider_1.SendBroadcastImage(this.imageSource);
            timer_1.setTimeout(function () {
                _this.transformedImageProvider.deleteFile(_this._imageSourceOld);
                // let fileNameTo = this._imageSourceOld.substring(this._imageSourceOld.lastIndexOf('PT_IMG'));
                // fileNameTo =  fileNameTo.replace('_transformed','_transformed'+this._pointsCounter);
                // let filePath = this._imageSourceOld.substring(0,this._imageSourceOld.lastIndexOf('PT_IMG'));
                // this.transformedImageProvider.renameFile(this.imageSource, fileNameTo);
                // this.imageSource = filePath + fileNameTo;
            }, 1000);
            this.imageSourceOrg = this._imageSourceOrgOld;
            this.isAutoCorrection = true;
            this.manualBtnText = 'Manual';
            // this._points = [];
            // let imgElement = this._imgGridId.getChildAt(0);
            // this._imgGridId.removeChildren();
            // this._imgGridId.addChild(imgElement);
            this.removeCircles();
            // this._pointsCounter = 0;
            this.transformedImageProvider.DeleteFiles();
        }
    };
    DialogContent.prototype.getPoints = function (event) {
        try {
            if (this.manualBtnText == 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                var scale = platform.screen.mainScreen.scale;
                // if (event.action === 'down') {
                // this is the point that the user just clicked on, expressed as x/y
                // values between 0 and 1.
                // let point = {
                //     y: event.getY() / (event.view.getMeasuredHeight() / scale),
                //     x: event.getX() / (event.view.getMeasuredWidth() / scale)
                // };
                this._imageActualSize = this._imgView.getActualSize();
                console.log(' actualSize : ' + JSON.stringify(this._imageActualSize));
                // let pointX = event.android.getRawX();
                // let pointY = event.android.getRawY();
                var pointX = event.android.getX() / scale;
                var pointY = event.android.getY() / scale;
                // let pointX = (event.android.getX() /event.view.getMeasuredWidth()) * this._imageActualSize.width;// scale;
                // let pointY = (event.android.getY() /event.view.getMeasuredHeight()) * this._imageActualSize.height;// / scale;
                console.log(' event.android.getX() : ' + event.android.getX());
                console.log(' event.android.getY() : ' + event.android.getY());
                console.log(' event.view.getMeasuredWidth() : ' + event.view.getMeasuredWidth());
                console.log(' event.view.getMeasuredHeight() : ' + event.view.getMeasuredHeight());
                console.log('this._imgGridId.width :' + this._imgGridId.getMeasuredWidth());
                console.log('this._imgGridId.height :' + this._imgGridId.getMeasuredHeight());
                var actualPoint = { x: pointX, y: pointY, id: this._pointsCounter };
                console.log(' actualPoint : ' + JSON.stringify(actualPoint));
                if (this._points.length >= 4) {
                    Toast.makeText("Please select only four _points.", "long").show();
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
    DialogContent.prototype.showOriginalImage = function () {
        this.onDoubleTap(null);
        if (this._circleBtnList.length == 0) {
            this.initPoints();
            Toast.makeText("Please move around the four red circle(s) on image if needed and click 'Perform' button.", "long").show();
        }
        // this.imageSource = this._imageSourceOld;
        this.isAutoCorrection = false;
        this.manualBtnText = 'Perform';
        this._pointsCounter = 0;
        this.addCircles();
        // this._circleBtnList.forEach(btn => {
        //     this._imgGridId.addChild(btn);
        // });
    };
    Object.defineProperty(DialogContent.prototype, "imageList", {
        get: function () {
            console.log("imageList:" + JSON.stringify(this.transformedImageProvider.contourImageList));
            return this.transformedImageProvider.contourImageList;
            // return this.contourList;
        },
        enumerable: true,
        configurable: true
    });
    DialogContent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            var newOriginX = args.getFocusX() - this._imgView.translateX;
            var newOriginY = args.getFocusY() - this._imgView.translateY;
            var oldOriginX = this._imgView.originX * this._imgView.getMeasuredWidth();
            var oldOriginY = this._imgView.originY * this._imgView.getMeasuredHeight();
            // this._imgView.translateX += (oldOriginX - newOriginX) * (1 - this._imgView.scaleX);
            // this._imgView.translateY += (oldOriginY - newOriginY) * (1 - this._imgView.scaleY);
            // this._imgView.originX = newOriginX / this._imgView.getMeasuredWidth();
            // this._imgView.originY = newOriginY / this._imgView.getMeasuredHeight();
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
    DialogContent.prototype.onPan = function (args) {
        if (this.manualBtnText !== 'Perform') {
            var screenLocation = this._imgView.getLocationOnScreen();
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
                var screenLocation_1 = this._imgView.getLocationOnScreen();
                console.log("screenLocation : " + JSON.stringify(screenLocation_1));
                console.log("centerPointX: " + centerPointX);
                console.log("centerPointY: " + centerPointY);
                console.log("imageViewWidth: " + imageViewWidth);
                console.log("imageViewHeight: " + imageViewHeight);
                console.log("getMeasuredWidth: " + this._imgView.getMeasuredWidth());
                console.log("getMeasuredHeight: " + this._imgView.getMeasuredHeight());
                if (this._newScale > 1) {
                    if ((screenLocation_1.x - 21) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation_1.x - 21)) {
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
                    if ((screenLocation_1.y - 41.5) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation_1.y - 41.5)) {
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
                // this._imgView.translateX += args.deltaX - this._prevDeltaX;
                // this._imgView.translateY += args.deltaY - this._prevDeltaY;
                this._prevDeltaX = args.deltaX;
                this._prevDeltaY = args.deltaY;
            }
        }
    };
    DialogContent.prototype.onDoubleTap = function (args) {
        if (this.manualBtnText !== 'Perform') {
            this._imgView.animate({
                translate: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
                curve: "easeOut",
                duration: 10
            }).then(function () {
                //    updateStatus();
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
    DialogContent.prototype.pageLoaded = function (args) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this._imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this._imageSourceOld = this.params.context.imageSource;
        this.imageSourceOldToThumbnail = this.params.context.imageSource;
        // if (!this.isAutoCorrection) {
        //     this.showOriginalImage();
        // }
        var page = args.object;
        this._imgView = page.getViewById("imgViewId");
        this._imgGridId = page.getViewById("imgGridId");
        var screenLocation = this._imgView.getLocationOnScreen();
        console.log(" screenLocation - strat " + JSON.stringify(screenLocation));
        this._imgView.on("isLoadingChange", function (args) {
            //    let _this = this;
            console.log(args.value);
            var screenLocation = args.object.getLocationOnScreen();
            console.log(" screenLocation - strat " + JSON.stringify(screenLocation));
        });
        //Chinna testing
        //         let imgBtn = this.createAutofocusShape(null);
        // this._imgGridId.addChild(imgBtn);
        //Chinna testing - end
        // this.initPoints();
        // for (var i = 0; i < count; i++) {
        //     views[i] = new buttons.Button();
        //     views[i].addCss("button {width: 20; height: 20;  border-radius: 10; border-width: 1;  border-color: green; background-color: red;}");
        //     this._imgView.addChild(views[i]);
        //     var v = views[i];
        //     var x = 1 * Math.cos(piFract * i) * W;
        //     var y = 1 * Math.sin(piFract * i) * H;
        //     v.animate({
        //         translate: { x: x, y: y },
        //         //    duration: duration,
        //         iterations: 1,
        //         curve: v.ios ? UIViewAnimationCurve.UIViewAnimationCurveLinear : new android.view.animation.LinearInterpolator
        //     });
        // }
        // for (var i = 0; i < count; i++) {
        //     setTimeout(this.createStarter(i), delay * (i + 1));
        // }
        this._imgView.translateX = 0;
        this._imgView.translateY = 0;
        this._imgView.scaleX = 1;
        this._imgView.scaleY = 1;
        //orientation.disableRotation();
        orientation.setOrientation("portrait");
        // this.transformedImageProvider.LoadPossibleContourImages();
        // if (application.android) {
        //     application.on("launch", function () {
        //         fresco.initialize();
        //     });
        // }
        console.log("pageLoaded:" + JSON.stringify(this.transformedImageProvider.contourImageList));
    };
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this._circleBtnList.forEach(function (btn) {
            _this._imgGridId.addChild(btn);
        });
    };
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this._imgGridId.getChildAt(0);
        this._imgGridId.removeChildren();
        this._imgGridId.addChild(imgElement);
    };
    DialogContent.prototype.initPoints = function () {
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        var scale = platform.screen.mainScreen.scale;
        this._imageActualSize = this._imgView.getActualSize();
        // console.log(' event.android.getX() : ' + event.android.getX());
        //     console.log(' event.android.getY() : ' + event.android.getY());
        //     console.log(' event.view.getMeasuredWidth() : ' + event.view.getMeasuredWidth());
        //     console.log(' event.view.getMeasuredHeight() : ' + event.view.getMeasuredHeight());
        //     console.log('this._imgGridId.width :'+ this._imgGridId.getMeasuredWidth());
        //     console.log('this._imgGridId.height :'+ this._imgGridId.getMeasuredHeight());
        console.log(' scale: ' + scale);
        this._centerPointX = (this._imgGridId.getMeasuredWidth() / 2) / scale;
        this._centerPointY = (this._imgGridId.getMeasuredHeight() / 2) / scale;
        console.log(' centerPointX: ' + this._centerPointX);
        console.log(' centerPointY: ' + this._centerPointY);
        // let pointX = event.android.getRawX();
        // let pointY = event.android.getRawY();
        // let pointX = event.android.getX() / scale;
        // let pointY = event.android.getY() / scale;
        // let pointX = (event.android.getX() /event.view.getMeasuredWidth()) * this._imageActualSize.width;// scale;
        // let pointY = (event.android.getY() /event.view.getMeasuredHeight()) * this._imageActualSize.height;// / scale;
        var actualPoint = { x: this._centerPointX - 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX - 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
    };
    DialogContent.prototype.createCircle = function (actualPoint) {
        var _this = this;
        //Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used. 
        var actualPointDeltaX = (this._imageActualSize.width / 2) - this._imageActualSize.width;
        var actualPointDeltaY = (this._imageActualSize.height / 2) - this._imageActualSize.height;
        var formattedString = new formattedStringModule.FormattedString();
        var iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add("fa");
        iconSpan.cssClasses.add("circle-plus");
        iconSpan.text = String.fromCharCode(0xf067); // 0x000a is unicode line-feed
        formattedString.spans.push(iconSpan);
        // formattedString.spans.push(textSpan);
        var circleBtn = new buttons.Button();
        circleBtn.cssClasses.add("circle");
        circleBtn.id = this._pointsCounter++;
        circleBtn.formattedText = formattedString;
        // this._imgGridId.addChild(circleBtn);
        circleBtn.on("pan", function (args) {
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
                            if (point.id == circleBtn.id) {
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
        //Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used. 
        var actualPointInScreenX = actualPoint.x + actualPointDeltaX;
        var actualPointInScreenY = actualPoint.y + actualPointDeltaY;
        circleBtn.translateX = actualPointInScreenX;
        circleBtn.translateY = actualPointInScreenY;
        this._circleBtnList.push(circleBtn);
        // this.params.context.imageSourceOrg = opencv.drawShape(this.imageSourceOrg, pointX + '-' + pointY, this._imageActualSize.width + '-' + this._imageActualSize.height, this._pointsCounter++);
        // // this.params.context.imageSourceOrg = opencv.drawShape(this.imageSourceOrg, pointX + '-' + pointY, '1-1', this._pointsCounter++);
        // this.imageSourceOrg = this.params.context.imageSourceOrg;
        // SendBroadcastImage(this.imageSourceOrg);
        this._points.push(actualPoint);
        return circleBtn;
    };
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
        selector: "modal-content",
        moduleId: module.id,
        styleUrls: ["./dialog.component.css"],
        templateUrl: "./dialog.component.html"
    })
    //            <ScrollView orientation="horizontal" height="20%" visibility="{{ isAutoCorrection ? 'collapse' : 'visible' }}">
    //     <WrapLayout orientation="horizontal" horizontalAlignment="center" verticalAlignment="center" backgroundColor="lightgray">
    //         <ng-template ngFor let-i="index" let-image [ngForOf]="imageList">
    //             <GridLayout  class="bg-primary p-5 m-5 bordered img-rounded" width="90%" height="90%" horizontalAlignment="center" verticalAlignment="center" backgroundColor="Black">
    //                 <Image src="{{ image.thumbnailPath }}"  loadMode="async" stretch="aspectFill" (doubleTap)="goImageSlide(image.filePath,i, $event)" class="img-height img-gallery-image"></Image> 
    //             </GridLayout>
    //         </ng-template>
    //     </WrapLayout>
    // </ScrollView>
    ,
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams,
        transformedimage_provider_1.TransformedImageProvider])
], DialogContent);
exports.DialogContent = DialogContent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpYWxvZy5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBaUU7QUFDakUsa0VBQXNFO0FBSXRFLG9GQUF3STtBQUV4SSwwQ0FBNEM7QUFDNUMsbUNBQXFDO0FBQ3JDLG1EQUFxRDtBQUtyRCxnREFBb0Q7QUFLcEQsSUFBSSxXQUFXLEdBQUcsT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDdEQsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ25DLElBQUkscUJBQXFCLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUM7QUFxQjdELElBQWEsYUFBYTtJQXdCdEIsaUNBQWlDO0lBQ2pDLGtEQUFrRDtJQUVsRCwyQ0FBMkM7SUFFM0MsdUJBQW9CLE1BQXlCLEVBQ2pDLHdCQUFrRDtRQUQxQyxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUNqQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBWnRELGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBR2hCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUNuQixtQkFBYyxHQUFHLENBQUMsQ0FBQztRQVF2QixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUM5QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN6Qiw4REFBOEQ7SUFHbEUsQ0FBQztJQUVELDZCQUFLLEdBQUwsVUFBTSxNQUFjO1FBQ2hCLFdBQVcsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUM3QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN0QyxDQUFD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LElBQUksQ0FBQyxDQUFDO1lBQ0osTUFBTSxDQUFDLEtBQUssQ0FBQztRQUNqQixDQUFDO0lBQ0wsQ0FBQztJQUVMLG9CQUFDO0FBQUQsQ0FBQyxBQTlkRCxJQThkQztBQTlkWSxhQUFhO0lBbEJ6QixnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLHdCQUF3QixDQUFDO1FBQ3JDLFdBQVcsRUFBRSx5QkFBeUI7S0FDekMsQ0FBQztJQUVGLDZIQUE2SDtJQUM3SCxnSUFBZ0k7SUFDaEksNEVBQTRFO0lBQzVFLHFMQUFxTDtJQUNyTCxvTUFBb007SUFDcE0sNEJBQTRCO0lBQzVCLHlCQUF5QjtJQUN6QixvQkFBb0I7SUFDcEIsZ0JBQWdCOztxQ0FnQ2dCLGdDQUFpQjtRQUNQLG9EQUF3QjtHQTlCckQsYUFBYSxDQThkekI7QUE5ZFksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiB9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1BhcmFtcyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2dcIjtcbmltcG9ydCB7IFZpZXcgfSBmcm9tIFwidWkvY29yZS92aWV3XCI7XG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEsIFRvdWNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gXCJ1aS9nZXN0dXJlc1wiO1xuaW1wb3J0IHsgU3dpcGVHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXNcIjtcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciwgQWN0aXZpdHlMb2FkZXIsIFRyYW5zZm9ybWVkSW1hZ2UsIFNlbmRCcm9hZGNhc3RJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbmltcG9ydCB7IE9ic2VydmFibGVBcnJheSwgQ2hhbmdlZERhdGEgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUtYXJyYXlcIjtcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICdwbGF0Zm9ybSc7XG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0IHsgZnJvbU9iamVjdCB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZVwiO1xuaW1wb3J0IHsgQmluZGluZ09wdGlvbnMgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9jb3JlL2JpbmRhYmxlXCI7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvcGFnZVwiO1xuaW1wb3J0IHsgRmlsZSwgcGF0aCB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtXCI7XG5pbXBvcnQgeyBzZXRUaW1lb3V0IH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdGltZXJcIjtcbmltcG9ydCB7IEltYWdlIH0gZnJvbSBcInVpL2ltYWdlXCI7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSBcIm5hdGl2ZXNjcmlwdC1wZXJtaXNzaW9uc1wiO1xuXG52YXIgb3JpZW50YXRpb24gPSByZXF1aXJlKCduYXRpdmVzY3JpcHQtb3JpZW50YXRpb24nKTtcbnZhciBidXR0b25zID0gcmVxdWlyZShcInVpL2J1dHRvblwiKTtcbnZhciBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUgPSByZXF1aXJlKFwidGV4dC9mb3JtYXR0ZWQtc3RyaW5nXCIpO1xuZGVjbGFyZSB2YXIgYW5kcm9pZDtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6IFwibW9kYWwtY29udGVudFwiLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbXCIuL2RpYWxvZy5jb21wb25lbnQuY3NzXCJdLFxuICAgIHRlbXBsYXRlVXJsOiBcIi4vZGlhbG9nLmNvbXBvbmVudC5odG1sXCJcbn0pXG5cbi8vICAgICAgICAgICAgPFNjcm9sbFZpZXcgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCIgaGVpZ2h0PVwiMjAlXCIgdmlzaWJpbGl0eT1cInt7IGlzQXV0b0NvcnJlY3Rpb24gPyAnY29sbGFwc2UnIDogJ3Zpc2libGUnIH19XCI+XG4vLyAgICAgPFdyYXBMYXlvdXQgb3JpZW50YXRpb249XCJob3Jpem9udGFsXCIgaG9yaXpvbnRhbEFsaWdubWVudD1cImNlbnRlclwiIHZlcnRpY2FsQWxpZ25tZW50PVwiY2VudGVyXCIgYmFja2dyb3VuZENvbG9yPVwibGlnaHRncmF5XCI+XG4vLyAgICAgICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtaT1cImluZGV4XCIgbGV0LWltYWdlIFtuZ0Zvck9mXT1cImltYWdlTGlzdFwiPlxuLy8gICAgICAgICAgICAgPEdyaWRMYXlvdXQgIGNsYXNzPVwiYmctcHJpbWFyeSBwLTUgbS01IGJvcmRlcmVkIGltZy1yb3VuZGVkXCIgd2lkdGg9XCI5MCVcIiBoZWlnaHQ9XCI5MCVcIiBob3Jpem9udGFsQWxpZ25tZW50PVwiY2VudGVyXCIgdmVydGljYWxBbGlnbm1lbnQ9XCJjZW50ZXJcIiBiYWNrZ3JvdW5kQ29sb3I9XCJCbGFja1wiPlxuLy8gICAgICAgICAgICAgICAgIDxJbWFnZSBzcmM9XCJ7eyBpbWFnZS50aHVtYm5haWxQYXRoIH19XCIgIGxvYWRNb2RlPVwiYXN5bmNcIiBzdHJldGNoPVwiYXNwZWN0RmlsbFwiIChkb3VibGVUYXApPVwiZ29JbWFnZVNsaWRlKGltYWdlLmZpbGVQYXRoLGksICRldmVudClcIiBjbGFzcz1cImltZy1oZWlnaHQgaW1nLWdhbGxlcnktaW1hZ2VcIj48L0ltYWdlPiBcbi8vICAgICAgICAgICAgIDwvR3JpZExheW91dD5cbi8vICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cbi8vICAgICA8L1dyYXBMYXlvdXQ+XG4vLyA8L1Njcm9sbFZpZXc+XG5cblxuZXhwb3J0IGNsYXNzIERpYWxvZ0NvbnRlbnQge1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIHB1YmxpYyBjb250b3VyTGlzdDogYW55O1xuICAgIHB1YmxpYyBpc0F1dG9Db3JyZWN0aW9uOiBib29sZWFuO1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9sZFRvVGh1bWJuYWlsOiBhbnlcbiAgICBwdWJsaWMgbWFudWFsQnRuVGV4dDogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSBfcG9pbnRzOiBhbnk7XG4gICAgcHJpdmF0ZSBfcG9pbnRzQ291bnRlcjogbnVtYmVyO1xuICAgIHByaXZhdGUgX2ltYWdlU291cmNlT3JnT2xkOiBhbnk7XG4gICAgcHJpdmF0ZSBfaW1hZ2VTb3VyY2VPbGQ6IGFueVxuICAgIHByaXZhdGUgX2ltYWdlQWN0dWFsU2l6ZTogYW55O1xuICAgIHByaXZhdGUgX2NpcmNsZUJ0bkxpc3Q6IGFueTtcbiAgICBwcml2YXRlIF9pbWdWaWV3OiBhbnk7XG4gICAgcHJpdmF0ZSBfaW1nR3JpZElkOiBhbnk7XG4gICAgcHJpdmF0ZSBfcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3ByZXZEZWx0YVk6IG51bWJlcjtcbiAgICBwcml2YXRlIF9zdGFydFNjYWxlID0gMTtcbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFg6IGFueTtcbiAgICBwcml2YXRlIF9jZW50ZXJQb2ludFk6IGFueTtcbiAgICBwcml2YXRlIF9uZXdTY2FsZSA9IDE7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLy8gcHJpdmF0ZSBfZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgLy8gQFZpZXdDaGlsZChcImltZ1ZpZXdJZFwiKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuXG4gICAgLy8gcHJpdmF0ZSBfcG9pbnRzID0gbmV3IE9ic2VydmFibGVBcnJheSgpO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBwYXJhbXM6IE1vZGFsRGlhbG9nUGFyYW1zLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9ICdNYW51YWwnO1xuICAgICAgICB0aGlzLl9wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5fcG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuX2NpcmNsZUJ0bkxpc3QgPSBbXTtcbiAgICAgICAgLy8gdGhpcy5fZHJhZ0ltYWdlSXRlbSA9IDxJbWFnZT50aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudDtcblxuXG4gICAgfVxuXG4gICAgY2xvc2UocmVzdWx0OiBzdHJpbmcpIHtcbiAgICAgICAgb3JpZW50YXRpb24uZW5hYmxlUm90YXRpb24oKTtcbiAgICAgICAgdGhpcy5wYXJhbXMuY2xvc2VDYWxsYmFjayhyZXN1bHQpO1xuICAgIH1cblxuICAgIHBlcmZvcm1NYW51YWxDb3JyZWN0aW9uKGJ0blRleHQ6IHN0cmluZykge1xuICAgICAgICAvLyBpZiAoYnRuVGV4dCA9PSAnTWFudWFsJykge1xuICAgICAgICAvLyAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gZmFsc2U7XG4gICAgICAgIC8vICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnUGVyZm9ybSc7XG4gICAgICAgIC8vIH1cbiAgICAgICAgbGV0IHBvaW50c0NvdW50ID0gMDtcbiAgICAgICAgdGhpcy5fcG9pbnRzLmZvckVhY2goKHBvaW50KSA9PiB7XG4gICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICBpZiAocG9pbnRzQ291bnQgIT09IDQpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdQbGVhc2Ugc2VsZWN0IG9ubHkgZm91ciBfcG9pbnRzLicpO1xuICAgICAgICB9IGVsc2Uge1xuXG4gICAgICAgICAgICAvLyBsZXQgcmVjdGFuZ2xlUG9pbnRzID0gdGhpcy5fcG9pbnRzLmdldEl0ZW0oMCkueCArICctJyArIHRoaXMuX3BvaW50cy5nZXRJdGVtKDApLnkgKyAnIydcbiAgICAgICAgICAgIC8vICAgICArIHRoaXMuX3BvaW50cy5nZXRJdGVtKDEpLnggKyAnLScgKyB0aGlzLl9wb2ludHMuZ2V0SXRlbSgxKS55ICsgJyMnXG4gICAgICAgICAgICAvLyAgICAgKyB0aGlzLl9wb2ludHMuZ2V0SXRlbSgyKS54ICsgJy0nICsgdGhpcy5fcG9pbnRzLmdldEl0ZW0oMikueSArICcjJ1xuICAgICAgICAgICAgLy8gICAgICsgdGhpcy5fcG9pbnRzLmdldEl0ZW0oMykueCArICctJyArIHRoaXMuX3BvaW50cy5nZXRJdGVtKDMpLnk7XG4gICAgICAgICAgICBsZXQgcmVjdGFuZ2xlUG9pbnRzID0gdGhpcy5fcG9pbnRzWzBdLnggKyAnLScgKyB0aGlzLl9wb2ludHNbMF0ueSArICcjJ1xuICAgICAgICAgICAgICAgICsgdGhpcy5fcG9pbnRzWzFdLnggKyAnLScgKyB0aGlzLl9wb2ludHNbMV0ueSArICcjJ1xuICAgICAgICAgICAgICAgICsgdGhpcy5fcG9pbnRzWzJdLnggKyAnLScgKyB0aGlzLl9wb2ludHNbMl0ueSArICcjJ1xuICAgICAgICAgICAgICAgICsgdGhpcy5fcG9pbnRzWzNdLnggKyAnLScgKyB0aGlzLl9wb2ludHNbM10ueTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2cocmVjdGFuZ2xlUG9pbnRzKTtcbiAgICAgICAgICAgIHRoaXMuX2ltYWdlU291cmNlT2xkID0gdGhpcy5pbWFnZVNvdXJjZTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlQ29ycmVjdGlvbk1hbnVhbCh0aGlzLmltYWdlU291cmNlT3JnLCByZWN0YW5nbGVQb2ludHMsIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aCArICctJyArIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuXG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5kZWxldGVGaWxlKHRoaXMuX2ltYWdlU291cmNlT2xkKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgZmlsZU5hbWVUbyA9IHRoaXMuX2ltYWdlU291cmNlT2xkLnN1YnN0cmluZyh0aGlzLl9pbWFnZVNvdXJjZU9sZC5sYXN0SW5kZXhPZignUFRfSU1HJykpO1xuICAgICAgICAgICAgICAgIC8vIGZpbGVOYW1lVG8gPSAgZmlsZU5hbWVUby5yZXBsYWNlKCdfdHJhbnNmb3JtZWQnLCdfdHJhbnNmb3JtZWQnK3RoaXMuX3BvaW50c0NvdW50ZXIpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBmaWxlUGF0aCA9IHRoaXMuX2ltYWdlU291cmNlT2xkLnN1YnN0cmluZygwLHRoaXMuX2ltYWdlU291cmNlT2xkLmxhc3RJbmRleE9mKCdQVF9JTUcnKSk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIucmVuYW1lRmlsZSh0aGlzLmltYWdlU291cmNlLCBmaWxlTmFtZVRvKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmltYWdlU291cmNlID0gZmlsZVBhdGggKyBmaWxlTmFtZVRvO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5faW1hZ2VTb3VyY2VPcmdPbGQ7XG4gICAgICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gJ01hbnVhbCc7XG4gICAgICAgICAgICAvLyB0aGlzLl9wb2ludHMgPSBbXTtcbiAgICAgICAgICAgIC8vIGxldCBpbWdFbGVtZW50ID0gdGhpcy5faW1nR3JpZElkLmdldENoaWxkQXQoMCk7XG4gICAgICAgICAgICAvLyB0aGlzLl9pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgICAgIC8vIHRoaXMuX2ltZ0dyaWRJZC5hZGRDaGlsZChpbWdFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuXG4gICAgICAgICAgICAvLyB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkRlbGV0ZUZpbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRQb2ludHMoZXZlbnQ6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgPT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgZGVuc2l0eSBvZiB5b3VyIHNjcmVlbiwgc28gd2UgY2FuIGRpdmlkZSB0aGUgbWVhc3VyZWQgd2lkdGgvaGVpZ2h0IGJ5IGl0LlxuICAgICAgICAgICAgICAgIGxldCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG4gICAgICAgICAgICAgICAgLy8gaWYgKGV2ZW50LmFjdGlvbiA9PT0gJ2Rvd24nKSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcyBpcyB0aGUgcG9pbnQgdGhhdCB0aGUgdXNlciBqdXN0IGNsaWNrZWQgb24sIGV4cHJlc3NlZCBhcyB4L3lcbiAgICAgICAgICAgICAgICAvLyB2YWx1ZXMgYmV0d2VlbiAwIGFuZCAxLlxuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludCA9IHtcbiAgICAgICAgICAgICAgICAvLyAgICAgeTogZXZlbnQuZ2V0WSgpIC8gKGV2ZW50LnZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAvLyAgICAgeDogZXZlbnQuZ2V0WCgpIC8gKGV2ZW50LnZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpXG4gICAgICAgICAgICAgICAgLy8gfTtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbWFnZUFjdHVhbFNpemUgPSB0aGlzLl9pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIGFjdHVhbFNpemUgOiAnICsgSlNPTi5zdHJpbmdpZnkodGhpcy5faW1hZ2VBY3R1YWxTaXplKSk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50WCA9IGV2ZW50LmFuZHJvaWQuZ2V0UmF3WCgpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFJhd1koKTtcbiAgICAgICAgICAgICAgICBsZXQgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRYKCkgLyBzY2FsZTtcbiAgICAgICAgICAgICAgICBsZXQgcG9pbnRZID0gZXZlbnQuYW5kcm9pZC5nZXRZKCkgLyBzY2FsZTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgcG9pbnRYID0gKGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC9ldmVudC52aWV3LmdldE1lYXN1cmVkV2lkdGgoKSkgKiB0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGg7Ly8gc2NhbGU7XG4gICAgICAgICAgICAgICAgLy8gbGV0IHBvaW50WSA9IChldmVudC5hbmRyb2lkLmdldFkoKSAvZXZlbnQudmlldy5nZXRNZWFzdXJlZEhlaWdodCgpKSAqIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQ7Ly8gLyBzY2FsZTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIGV2ZW50LmFuZHJvaWQuZ2V0WCgpIDogJyArIGV2ZW50LmFuZHJvaWQuZ2V0WCgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIGV2ZW50LmFuZHJvaWQuZ2V0WSgpIDogJyArIGV2ZW50LmFuZHJvaWQuZ2V0WSgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIGV2ZW50LnZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpIDogJyArIGV2ZW50LnZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnIGV2ZW50LnZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSA6ICcgKyBldmVudC52aWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzLl9pbWdHcmlkSWQud2lkdGggOicgKyB0aGlzLl9pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcy5faW1nR3JpZElkLmhlaWdodCA6JyArIHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpKTtcblxuICAgICAgICAgICAgICAgIGxldCBhY3R1YWxQb2ludCA9IHsgeDogcG9pbnRYLCB5OiBwb2ludFksIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJyBhY3R1YWxQb2ludCA6ICcgKyBKU09OLnN0cmluZ2lmeShhY3R1YWxQb2ludCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3BvaW50cy5sZW5ndGggPj0gNCkge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dChcIlBsZWFzZSBzZWxlY3Qgb25seSBmb3VyIF9wb2ludHMuXCIsIFwibG9uZ1wiKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhbGVydChlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNob3dPcmlnaW5hbEltYWdlKCkge1xuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKG51bGwpO1xuICAgICAgICBpZiAodGhpcy5fY2lyY2xlQnRuTGlzdC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbml0UG9pbnRzKCk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dChcIlBsZWFzZSBtb3ZlIGFyb3VuZCB0aGUgZm91ciByZWQgY2lyY2xlKHMpIG9uIGltYWdlIGlmIG5lZWRlZCBhbmQgY2xpY2sgJ1BlcmZvcm0nIGJ1dHRvbi5cIiwgXCJsb25nXCIpLnNob3coKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGlzLmltYWdlU291cmNlID0gdGhpcy5faW1hZ2VTb3VyY2VPbGQ7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSAnUGVyZm9ybSc7XG4gICAgICAgIHRoaXMuX3BvaW50c0NvdW50ZXIgPSAwO1xuICAgICAgICB0aGlzLmFkZENpcmNsZXMoKTtcbiAgICAgICAgLy8gdGhpcy5fY2lyY2xlQnRuTGlzdC5mb3JFYWNoKGJ0biA9PiB7XG4gICAgICAgIC8vICAgICB0aGlzLl9pbWdHcmlkSWQuYWRkQ2hpbGQoYnRuKTtcbiAgICAgICAgLy8gfSk7XG5cbiAgICB9XG4gICAgZ2V0IGltYWdlTGlzdCgpOiBBcnJheTxUcmFuc2Zvcm1lZEltYWdlPiB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW1hZ2VMaXN0OlwiICsgSlNPTi5zdHJpbmdpZnkodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY29udG91ckltYWdlTGlzdCkpO1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY29udG91ckltYWdlTGlzdDtcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuY29udG91ckxpc3Q7XG4gICAgfVxuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICBsZXQgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVk7XG5cbiAgICAgICAgICAgIGxldCBvbGRPcmlnaW5YID0gdGhpcy5faW1nVmlldy5vcmlnaW5YICogdGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCk7XG4gICAgICAgICAgICBsZXQgb2xkT3JpZ2luWSA9IHRoaXMuX2ltZ1ZpZXcub3JpZ2luWSAqIHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcblxuICAgICAgICAgICAgLy8gdGhpcy5faW1nVmlldy50cmFuc2xhdGVYICs9IChvbGRPcmlnaW5YIC0gbmV3T3JpZ2luWCkgKiAoMSAtIHRoaXMuX2ltZ1ZpZXcuc2NhbGVYKTtcbiAgICAgICAgICAgIC8vIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSArPSAob2xkT3JpZ2luWSAtIG5ld09yaWdpblkpICogKDEgLSB0aGlzLl9pbWdWaWV3LnNjYWxlWSk7XG5cbiAgICAgICAgICAgIC8vIHRoaXMuX2ltZ1ZpZXcub3JpZ2luWCA9IG5ld09yaWdpblggLyB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIC8vIHRoaXMuX2ltZ1ZpZXcub3JpZ2luWSA9IG5ld09yaWdpblkgLyB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCk7XG5cbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0U2NhbGUgPSB0aGlzLl9pbWdWaWV3LnNjYWxlWDtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSB0aGlzLl9zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gTWF0aC5taW4oOCwgdGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgdGhpcy5fbmV3U2NhbGUpO1xuXG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWCA9IHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5zY2FsZVkgPSB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcud2lkdGggPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5faW1nVmlldy5oZWlnaHQgPSB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09ICdQZXJmb3JtJykge1xuXG4gICAgICAgICAgICBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5faW1nVmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICBsZXQgY2VudGVyUG9pbnRZID0gKHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIGxldCBpbWFnZVZpZXdXaWR0aCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5faW1nVmlldy5vcmlnaW5YO1xuICAgICAgICAgICAgbGV0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX2ltZ1ZpZXcub3JpZ2luWTtcblxuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9pbWdWaWV3LmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcInNjcmVlbkxvY2F0aW9uIDogXCIgKyBKU09OLnN0cmluZ2lmeShzY3JlZW5Mb2NhdGlvbikpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2VudGVyUG9pbnRYOiBcIiArIGNlbnRlclBvaW50WCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJjZW50ZXJQb2ludFk6IFwiICsgY2VudGVyUG9pbnRZKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImltYWdlVmlld1dpZHRoOiBcIiArIGltYWdlVmlld1dpZHRoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImltYWdlVmlld0hlaWdodDogXCIgKyBpbWFnZVZpZXdIZWlnaHQpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZ2V0TWVhc3VyZWRXaWR0aDogXCIgKyB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJnZXRNZWFzdXJlZEhlaWdodDogXCIgKyB0aGlzLl9pbWdWaWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX25ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLTIxKSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIDIxKVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYID0gdGhpcy5faW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggPSB0aGlzLl9vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueSAtIDQxLjUpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFkgLSBpbWFnZVZpZXdIZWlnaHQpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueSAtIDQxLjUpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5fcHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVkgPSB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSA9IHRoaXMuX29sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pbWdWaWV3LnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLl9wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2ltZ1ZpZXcudHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIG9uRG91YmxlVGFwKGFyZ3M6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMubWFudWFsQnRuVGV4dCAhPT0gJ1BlcmZvcm0nKSB7XG4gICAgICAgICAgICB0aGlzLl9pbWdWaWV3LmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgICAgIGN1cnZlOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTBcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vICAgIHVwZGF0ZVN0YXR1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IDE7XG4gICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pbml0UG9pbnRzKCk7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZXMoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGFnZUxvYWRlZChhcmdzKSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5faW1hZ2VTb3VyY2VPcmdPbGQgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0aGlzLnBhcmFtcy5jb250ZXh0LmlzQXV0b0NvcnJlY3Rpb247XG4gICAgICAgIHRoaXMuX2ltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9sZFRvVGh1bWJuYWlsID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgLy8gaWYgKCF0aGlzLmlzQXV0b0NvcnJlY3Rpb24pIHtcbiAgICAgICAgLy8gICAgIHRoaXMuc2hvd09yaWdpbmFsSW1hZ2UoKTtcbiAgICAgICAgLy8gfVxuICAgICAgICBsZXQgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLl9pbWdWaWV3ID0gcGFnZS5nZXRWaWV3QnlJZChcImltZ1ZpZXdJZFwiKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkID0gcGFnZS5nZXRWaWV3QnlJZChcImltZ0dyaWRJZFwiKTtcbiAgIGxldCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuX2ltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgY29uc29sZS5sb2coXCIgc2NyZWVuTG9jYXRpb24gLSBzdHJhdCBcIiArIEpTT04uc3RyaW5naWZ5KHNjcmVlbkxvY2F0aW9uKSk7XG4gICB0aGlzLl9pbWdWaWV3Lm9uKFwiaXNMb2FkaW5nQ2hhbmdlXCIsIGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgLy8gICAgbGV0IF90aGlzID0gdGhpcztcbiAgICAgY29uc29sZS5sb2coYXJncy52YWx1ZSk7XG4gICAgICBsZXQgc2NyZWVuTG9jYXRpb24gPSBhcmdzLm9iamVjdC5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICBjb25zb2xlLmxvZyhcIiBzY3JlZW5Mb2NhdGlvbiAtIHN0cmF0IFwiICsgSlNPTi5zdHJpbmdpZnkoc2NyZWVuTG9jYXRpb24pKTtcbn0pO1xuICAgICAgICAvL0NoaW5uYSB0ZXN0aW5nXG5cbiAgICAgICAgLy8gICAgICAgICBsZXQgaW1nQnRuID0gdGhpcy5jcmVhdGVBdXRvZm9jdXNTaGFwZShudWxsKTtcbiAgICAgICAgLy8gdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGltZ0J0bik7XG4gICAgICAgIC8vQ2hpbm5hIHRlc3RpbmcgLSBlbmRcblxuXG4gICAgICAgIC8vIHRoaXMuaW5pdFBvaW50cygpO1xuXG4gICAgICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgICAvLyAgICAgdmlld3NbaV0gPSBuZXcgYnV0dG9ucy5CdXR0b24oKTtcbiAgICAgICAgLy8gICAgIHZpZXdzW2ldLmFkZENzcyhcImJ1dHRvbiB7d2lkdGg6IDIwOyBoZWlnaHQ6IDIwOyAgYm9yZGVyLXJhZGl1czogMTA7IGJvcmRlci13aWR0aDogMTsgIGJvcmRlci1jb2xvcjogZ3JlZW47IGJhY2tncm91bmQtY29sb3I6IHJlZDt9XCIpO1xuICAgICAgICAvLyAgICAgdGhpcy5faW1nVmlldy5hZGRDaGlsZCh2aWV3c1tpXSk7XG4gICAgICAgIC8vICAgICB2YXIgdiA9IHZpZXdzW2ldO1xuICAgICAgICAvLyAgICAgdmFyIHggPSAxICogTWF0aC5jb3MocGlGcmFjdCAqIGkpICogVztcbiAgICAgICAgLy8gICAgIHZhciB5ID0gMSAqIE1hdGguc2luKHBpRnJhY3QgKiBpKSAqIEg7XG5cbiAgICAgICAgLy8gICAgIHYuYW5pbWF0ZSh7XG4gICAgICAgIC8vICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IHgsIHk6IHkgfSxcbiAgICAgICAgLy8gICAgICAgICAvLyAgICBkdXJhdGlvbjogZHVyYXRpb24sXG4gICAgICAgIC8vICAgICAgICAgaXRlcmF0aW9uczogMSxcbiAgICAgICAgLy8gICAgICAgICBjdXJ2ZTogdi5pb3MgPyBVSVZpZXdBbmltYXRpb25DdXJ2ZS5VSVZpZXdBbmltYXRpb25DdXJ2ZUxpbmVhciA6IG5ldyBhbmRyb2lkLnZpZXcuYW5pbWF0aW9uLkxpbmVhckludGVycG9sYXRvclxuICAgICAgICAvLyAgICAgfSk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgICAgLy8gICAgIHNldFRpbWVvdXQodGhpcy5jcmVhdGVTdGFydGVyKGkpLCBkZWxheSAqIChpICsgMSkpO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdGhpcy5faW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5faW1nVmlldy5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLl9pbWdWaWV3LnNjYWxlWSA9IDE7XG4gICAgICAgIC8vb3JpZW50YXRpb24uZGlzYWJsZVJvdGF0aW9uKCk7XG4gICAgICAgIG9yaWVudGF0aW9uLnNldE9yaWVudGF0aW9uKFwicG9ydHJhaXRcIik7XG4gICAgICAgIC8vIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkxvYWRQb3NzaWJsZUNvbnRvdXJJbWFnZXMoKTtcblxuICAgICAgICAvLyBpZiAoYXBwbGljYXRpb24uYW5kcm9pZCkge1xuICAgICAgICAvLyAgICAgYXBwbGljYXRpb24ub24oXCJsYXVuY2hcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyAgICAgICAgIGZyZXNjby5pbml0aWFsaXplKCk7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgICBjb25zb2xlLmxvZyhcInBhZ2VMb2FkZWQ6XCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jb250b3VySW1hZ2VMaXN0KSk7XG5cbiAgICB9XG4gICAgcHJpdmF0ZSBhZGRDaXJjbGVzKCkge1xuICAgICAgICB0aGlzLl9jaXJjbGVCdG5MaXN0LmZvckVhY2goYnRuID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2ltZ0dyaWRJZC5hZGRDaGlsZChidG4pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcHJpdmF0ZSByZW1vdmVDaXJjbGVzKCkge1xuICAgICAgICBsZXQgaW1nRWxlbWVudCA9IHRoaXMuX2ltZ0dyaWRJZC5nZXRDaGlsZEF0KDApO1xuICAgICAgICB0aGlzLl9pbWdHcmlkSWQucmVtb3ZlQ2hpbGRyZW4oKTtcbiAgICAgICAgdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGltZ0VsZW1lbnQpO1xuICAgIH1cbiAgICBwcml2YXRlIGluaXRQb2ludHMoKSB7XG4gICAgICAgIHRoaXMuX3BvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLl9wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5fY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgICAgIGxldCBzY2FsZTogbnVtYmVyID0gcGxhdGZvcm0uc2NyZWVuLm1haW5TY3JlZW4uc2NhbGU7XG5cbiAgICAgICAgdGhpcy5faW1hZ2VBY3R1YWxTaXplID0gdGhpcy5faW1nVmlldy5nZXRBY3R1YWxTaXplKCk7XG5cbiAgICAgICAgLy8gY29uc29sZS5sb2coJyBldmVudC5hbmRyb2lkLmdldFgoKSA6ICcgKyBldmVudC5hbmRyb2lkLmdldFgoKSk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnIGV2ZW50LmFuZHJvaWQuZ2V0WSgpIDogJyArIGV2ZW50LmFuZHJvaWQuZ2V0WSgpKTtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCcgZXZlbnQudmlldy5nZXRNZWFzdXJlZFdpZHRoKCkgOiAnICsgZXZlbnQudmlldy5nZXRNZWFzdXJlZFdpZHRoKCkpO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJyBldmVudC52aWV3LmdldE1lYXN1cmVkSGVpZ2h0KCkgOiAnICsgZXZlbnQudmlldy5nZXRNZWFzdXJlZEhlaWdodCgpKTtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCd0aGlzLl9pbWdHcmlkSWQud2lkdGggOicrIHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZFdpZHRoKCkpO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coJ3RoaXMuX2ltZ0dyaWRJZC5oZWlnaHQgOicrIHRoaXMuX2ltZ0dyaWRJZC5nZXRNZWFzdXJlZEhlaWdodCgpKTtcbiAgICAgICAgY29uc29sZS5sb2coJyBzY2FsZTogJyArIHNjYWxlKTtcblxuICAgICAgICB0aGlzLl9jZW50ZXJQb2ludFggPSAodGhpcy5faW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIHRoaXMuX2NlbnRlclBvaW50WSA9ICh0aGlzLl9pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDIpIC8gc2NhbGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCcgY2VudGVyUG9pbnRYOiAnICsgdGhpcy5fY2VudGVyUG9pbnRYKTtcbiAgICAgICAgY29uc29sZS5sb2coJyBjZW50ZXJQb2ludFk6ICcgKyB0aGlzLl9jZW50ZXJQb2ludFkpO1xuICAgICAgICAvLyBsZXQgcG9pbnRYID0gZXZlbnQuYW5kcm9pZC5nZXRSYXdYKCk7XG4gICAgICAgIC8vIGxldCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFJhd1koKTtcbiAgICAgICAgLy8gbGV0IHBvaW50WCA9IGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC8gc2NhbGU7XG4gICAgICAgIC8vIGxldCBwb2ludFkgPSBldmVudC5hbmRyb2lkLmdldFkoKSAvIHNjYWxlO1xuICAgICAgICAvLyBsZXQgcG9pbnRYID0gKGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC9ldmVudC52aWV3LmdldE1lYXN1cmVkV2lkdGgoKSkgKiB0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGg7Ly8gc2NhbGU7XG4gICAgICAgIC8vIGxldCBwb2ludFkgPSAoZXZlbnQuYW5kcm9pZC5nZXRZKCkgL2V2ZW50LnZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSkgKiB0aGlzLl9pbWFnZUFjdHVhbFNpemUuaGVpZ2h0Oy8vIC8gc2NhbGU7XG5cbiAgICAgICAgbGV0IGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLl9jZW50ZXJQb2ludFggLSA3NSwgeTogdGhpcy5fY2VudGVyUG9pbnRZIC0gNzUsIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuX2NlbnRlclBvaW50WCArIDc1LCB5OiB0aGlzLl9jZW50ZXJQb2ludFkgLSA3NSwgaWQ6IHRoaXMuX3BvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5fY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuX2NlbnRlclBvaW50WSArIDc1LCBpZDogdGhpcy5fcG9pbnRzQ291bnRlciB9O1xuICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLl9jZW50ZXJQb2ludFggKyA3NSwgeTogdGhpcy5fY2VudGVyUG9pbnRZICsgNzUsIGlkOiB0aGlzLl9wb2ludHNDb3VudGVyIH07XG4gICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcblxuICAgIH1cblxuICAgIHByaXZhdGUgY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50OiBhbnkpOiBhbnkge1xuICAgICAgICAvL1NpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC4gXG4gICAgICAgIGxldCBhY3R1YWxQb2ludERlbHRhWCA9ICh0aGlzLl9pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS53aWR0aDtcbiAgICAgICAgbGV0IGFjdHVhbFBvaW50RGVsdGFZID0gKHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuX2ltYWdlQWN0dWFsU2l6ZS5oZWlnaHQ7XG5cbiAgICAgICAgbGV0IGZvcm1hdHRlZFN0cmluZyA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuRm9ybWF0dGVkU3RyaW5nKCk7XG4gICAgICAgIGxldCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZChcImZhXCIpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZChcImNpcmNsZS1wbHVzXCIpO1xuICAgICAgICBpY29uU3Bhbi50ZXh0ID0gU3RyaW5nLmZyb21DaGFyQ29kZSgweGYwNjcpOyAvLyAweDAwMGEgaXMgdW5pY29kZSBsaW5lLWZlZWRcblxuICAgICAgICBmb3JtYXR0ZWRTdHJpbmcuc3BhbnMucHVzaChpY29uU3Bhbik7XG4gICAgICAgIC8vIGZvcm1hdHRlZFN0cmluZy5zcGFucy5wdXNoKHRleHRTcGFuKTtcbiAgICAgICAgbGV0IGNpcmNsZUJ0biA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoXCJjaXJjbGVcIik7XG5cbiAgICAgICAgY2lyY2xlQnRuLmlkID0gdGhpcy5fcG9pbnRzQ291bnRlcisrO1xuICAgICAgICBjaXJjbGVCdG4uZm9ybWF0dGVkVGV4dCA9IGZvcm1hdHRlZFN0cmluZztcbiAgICAgICAgLy8gdGhpcy5faW1nR3JpZElkLmFkZENoaWxkKGNpcmNsZUJ0bik7XG4gICAgICAgIGNpcmNsZUJ0bi5vbihcInBhblwiLCAoYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gLTE1O1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVYIDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gKzU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSAtNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArNTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IC01O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQm91bmRhcnkoY2lyY2xlQnRuLnRyYW5zbGF0ZVgsIGNpcmNsZUJ0bi50cmFuc2xhdGVZKSkge1xuICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5fcHJldkRlbHRhWTtcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wb2ludHMuZm9yRWFjaCgocG9pbnQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PSBjaXJjbGVCdG4uaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnQueCA9IGNpcmNsZUJ0bi50cmFuc2xhdGVYIC0gYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnkgPSBjaXJjbGVCdG4udHJhbnNsYXRlWSAtIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vU2luY2UgdGhlIHNlbGVjdGVkIHBvaW50IGJ5IHVzZXIgaXMgYWx3YXlzIHBvaW50aW5nIHRvXG4gICAgICAgIC8vIGNlbnRlciBvZiB0aGUgaW1hZ2UgKHdoaWNoIGlzICgwLDApKSwgc28gbmVlZCB0byBzZWxlY3RcbiAgICAgICAgLy8gdG9wLWxlZnQsIHRvcC1yaWdodCAmIGJvdHRvbS1sZWZ0LCBmb3Igd2hpY2ggdGhlIGFjdHVhbFBvaW50RGVsdGFYL2FjdHVhbFBvaW50RGVsdGFZXG4gICAgICAgIC8vIGFyZSB1c2VkLiBcbiAgICAgICAgbGV0IGFjdHVhbFBvaW50SW5TY3JlZW5YID0gYWN0dWFsUG9pbnQueCArIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICBsZXQgYWN0dWFsUG9pbnRJblNjcmVlblkgPSBhY3R1YWxQb2ludC55ICsgYWN0dWFsUG9pbnREZWx0YVk7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYID0gYWN0dWFsUG9pbnRJblNjcmVlblg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnRJblNjcmVlblk7XG4gICAgICAgIHRoaXMuX2NpcmNsZUJ0bkxpc3QucHVzaChjaXJjbGVCdG4pO1xuXG4gICAgICAgIC8vIHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmcgPSBvcGVuY3YuZHJhd1NoYXBlKHRoaXMuaW1hZ2VTb3VyY2VPcmcsIHBvaW50WCArICctJyArIHBvaW50WSwgdGhpcy5faW1hZ2VBY3R1YWxTaXplLndpZHRoICsgJy0nICsgdGhpcy5faW1hZ2VBY3R1YWxTaXplLmhlaWdodCwgdGhpcy5fcG9pbnRzQ291bnRlcisrKTtcbiAgICAgICAgLy8gLy8gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZyA9IG9wZW5jdi5kcmF3U2hhcGUodGhpcy5pbWFnZVNvdXJjZU9yZywgcG9pbnRYICsgJy0nICsgcG9pbnRZLCAnMS0xJywgdGhpcy5fcG9pbnRzQ291bnRlcisrKTtcbiAgICAgICAgLy8gdGhpcy5pbWFnZVNvdXJjZU9yZyA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2VPcmc7XG4gICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltYWdlU291cmNlT3JnKTtcbiAgICAgICAgdGhpcy5fcG9pbnRzLnB1c2goYWN0dWFsUG9pbnQpO1xuICAgICAgICByZXR1cm4gY2lyY2xlQnRuO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2hlY2tCb3VuZGFyeSh0cmFuc2xhdGVYOiBhbnksIHRyYW5zbGF0ZVk6IGFueSk6IGFueSB7XG4gICAgICAgIGlmICh0cmFuc2xhdGVYIDwgKHRoaXMuX2NlbnRlclBvaW50WCAtIDEwKSAmJlxuICAgICAgICAgICAgdHJhbnNsYXRlWSA8ICh0aGlzLl9jZW50ZXJQb2ludFkgLSAxMCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVYICogLTEpIDwgKHRoaXMuX2NlbnRlclBvaW50WCAtIDEwKSAmJlxuICAgICAgICAgICAgKHRyYW5zbGF0ZVkgKiAtMSkgPCAodGhpcy5fY2VudGVyUG9pbnRZIC0gMTApKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19