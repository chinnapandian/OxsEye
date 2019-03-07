import { Component, ViewChild, ElementRef } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular/modal-dialog";
import { View } from "ui/core/view";
import { GestureEventData, PanGestureEventData, PinchGestureEventData, TouchGestureEventData } from "ui/gestures";
import { SwipeGestureEventData } from "tns-core-modules/ui/gestures";
import { TransformedImageProvider, ActivityLoader, TransformedImage, SendBroadcastImage } from '../providers/transformedimage.provider';
import { ObservableArray, ChangedData } from "tns-core-modules/data/observable-array";
import * as Toast from 'nativescript-toast';
import * as platform from 'platform';
import * as opencv from 'nativescript-opencv-plugin';
import { fromObject } from "tns-core-modules/data/observable";
import { BindingOptions } from "tns-core-modules/ui/core/bindable";
import { Page } from "tns-core-modules/ui/page";
import { File, path } from "tns-core-modules/file-system";
import { setTimeout } from "tns-core-modules/timer";
import { Image } from "ui/image";
import * as application from "tns-core-modules/application";
import * as Permissions from "nativescript-permissions";

var orientation = require('nativescript-orientation');
var buttons = require("ui/button");
var formattedStringModule = require("text/formatted-string");
declare var android;

@Component({
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


export class DialogContent {
    public imageSource: any;
    public imageSourceOrg: any;
    public contourList: any;
    public isAutoCorrection: boolean;
    public imageSourceOldToThumbnail: any
    public manualBtnText: string;

    private _points: any;
    private _pointsCounter: number;
    private _imageSourceOrgOld: any;
    private _imageSourceOld: any
    private _imageActualSize: any;
    private _circleBtnList: any;
    private _imgView: any;
    private _imgGridId: any;
    private _prevDeltaX: number;
    private _prevDeltaY: number;
    private _startScale = 1;
    private _centerPointX: any;
    private _centerPointY: any;
    private _newScale = 1;
    private _oldTranslateX = 0;
    private _oldTranslateY = 0;
    // private _dragImageItem: Image;
    // @ViewChild("imgViewId") _dragImage: ElementRef;

    // private _points = new ObservableArray();

    constructor(private params: ModalDialogParams,
        private transformedImageProvider: TransformedImageProvider) {
        this.manualBtnText = 'Manual';
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;


    }

    close(result: string) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    }

    performManualCorrection(btnText: string) {
        // if (btnText == 'Manual') {
        //     this.isAutoCorrection = false;
        //     this.manualBtnText = 'Perform';
        // }
        let pointsCount = 0;
        this._points.forEach((point) => {
            if (point) {
                pointsCount++;
            }
        })
        if (pointsCount !== 4) {
            alert('Please select only four _points.');
        } else {

            // let rectanglePoints = this._points.getItem(0).x + '-' + this._points.getItem(0).y + '#'
            //     + this._points.getItem(1).x + '-' + this._points.getItem(1).y + '#'
            //     + this._points.getItem(2).x + '-' + this._points.getItem(2).y + '#'
            //     + this._points.getItem(3).x + '-' + this._points.getItem(3).y;
            let rectanglePoints = this._points[0].x + '-' + this._points[0].y + '#'
                + this._points[1].x + '-' + this._points[1].y + '#'
                + this._points[2].x + '-' + this._points[2].y + '#'
                + this._points[3].x + '-' + this._points[3].y;

            console.log(rectanglePoints);
            this._imageSourceOld = this.imageSource;
            this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this._imageActualSize.width + '-' + this._imageActualSize.height);

            SendBroadcastImage(this.imageSource);
            setTimeout(() => {
                this.transformedImageProvider.deleteFile(this._imageSourceOld);
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
    }

    getPoints(event: GestureEventData) {
        try {
            if (this.manualBtnText == 'Perform') {
                // This is the density of your screen, so we can divide the measured width/height by it.
                let scale: number = platform.screen.mainScreen.scale;
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
                let pointX = event.android.getX() / scale;
                let pointY = event.android.getY() / scale;
                // let pointX = (event.android.getX() /event.view.getMeasuredWidth()) * this._imageActualSize.width;// scale;
                // let pointY = (event.android.getY() /event.view.getMeasuredHeight()) * this._imageActualSize.height;// / scale;
                console.log(' event.android.getX() : ' + event.android.getX());
                console.log(' event.android.getY() : ' + event.android.getY());
                console.log(' event.view.getMeasuredWidth() : ' + event.view.getMeasuredWidth());
                console.log(' event.view.getMeasuredHeight() : ' + event.view.getMeasuredHeight());
                console.log('this._imgGridId.width :' + this._imgGridId.getMeasuredWidth());
                console.log('this._imgGridId.height :' + this._imgGridId.getMeasuredHeight());

                let actualPoint = { x: pointX, y: pointY, id: this._pointsCounter };
                console.log(' actualPoint : ' + JSON.stringify(actualPoint));

                if (this._points.length >= 4) {
                    Toast.makeText("Please select only four _points.", "long").show();
                } else {
                    this._imgGridId.addChild(this.createCircle(actualPoint));
                }
            }
        } catch (e) {
            alert(e);
        }
    }

    showOriginalImage() {
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

    }
    get imageList(): Array<TransformedImage> {
        console.log("imageList:" + JSON.stringify(this.transformedImageProvider.contourImageList));
        return this.transformedImageProvider.contourImageList;
        // return this.contourList;
    }
    onPinch(args: PinchGestureEventData) {
        if (args.state === 1) {
            let newOriginX = args.getFocusX() - this._imgView.translateX;
            let newOriginY = args.getFocusY() - this._imgView.translateY;

            let oldOriginX = this._imgView.originX * this._imgView.getMeasuredWidth();
            let oldOriginY = this._imgView.originY * this._imgView.getMeasuredHeight();

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
    }
    onPan(args: PanGestureEventData) {
        if (this.manualBtnText !== 'Perform') {

            let screenLocation = this._imgView.getLocationOnScreen();
            let centerPointX = (this._imgView.getMeasuredWidth() / 4) * (this._newScale);
            let centerPointY = (this._imgView.getMeasuredHeight() / 4) * (this._newScale);
            let imageViewWidth = this._imgView.getMeasuredWidth() * this._imgView.originX;
            let imageViewHeight = this._imgView.getMeasuredHeight() * this._imgView.originY;


            if (args.state === 1) {
                this._prevDeltaX = 0;
                this._prevDeltaY = 0;
            }
            else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);

                let screenLocation = this._imgView.getLocationOnScreen();
                console.log("screenLocation : " + JSON.stringify(screenLocation));
                console.log("centerPointX: " + centerPointX);
                console.log("centerPointY: " + centerPointY);
                console.log("imageViewWidth: " + imageViewWidth);
                console.log("imageViewHeight: " + imageViewHeight);
                console.log("getMeasuredWidth: " + this._imgView.getMeasuredWidth());
                console.log("getMeasuredHeight: " + this._imgView.getMeasuredHeight());

                if (this._newScale > 1) {
                    if ((screenLocation.x -21) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - 21)
                    ) {
                        this._imgView.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._imgView.translateX;
                    }
                    else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        } else {
                            this._oldTranslateX++;
                        }
                        this._imgView.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - 41.5) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - 41.5)
                    ) {
                        this._imgView.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._imgView.translateY;
                    }
                    else {
                        if (this._oldTranslateY > 0) {
                            this._oldTranslateY--;
                        } else {
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
    }
    onDoubleTap(args: GestureEventData) {
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
        } else {
            this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    }

    pageLoaded(args) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this._imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this._imageSourceOld = this.params.context.imageSource;
        this.imageSourceOldToThumbnail = this.params.context.imageSource;
        // if (!this.isAutoCorrection) {
        //     this.showOriginalImage();
        // }
        let page = args.object;
        this._imgView = page.getViewById("imgViewId");
        this._imgGridId = page.getViewById("imgGridId");
   let screenLocation = this._imgView.getLocationOnScreen();
   console.log(" screenLocation - strat " + JSON.stringify(screenLocation));
   this._imgView.on("isLoadingChange", function (args) {
    //    let _this = this;
     console.log(args.value);
      let screenLocation = args.object.getLocationOnScreen();
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

    }
    private addCircles() {
        this._circleBtnList.forEach(btn => {
            this._imgGridId.addChild(btn);
        });
    }
    private removeCircles() {
        let imgElement = this._imgGridId.getChildAt(0);
        this._imgGridId.removeChildren();
        this._imgGridId.addChild(imgElement);
    }
    private initPoints() {
        this._points = [];
        this._pointsCounter = 0;
        this._circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        let scale: number = platform.screen.mainScreen.scale;

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

        let actualPoint = { x: this._centerPointX - 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY - 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX - 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);
        actualPoint = { x: this._centerPointX + 75, y: this._centerPointY + 75, id: this._pointsCounter };
        this.createCircle(actualPoint);

    }

    private createCircle(actualPoint: any): any {
        //Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used. 
        let actualPointDeltaX = (this._imageActualSize.width / 2) - this._imageActualSize.width;
        let actualPointDeltaY = (this._imageActualSize.height / 2) - this._imageActualSize.height;

        let formattedString = new formattedStringModule.FormattedString();
        let iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add("fa");
        iconSpan.cssClasses.add("circle-plus");
        iconSpan.text = String.fromCharCode(0xf067); // 0x000a is unicode line-feed

        formattedString.spans.push(iconSpan);
        // formattedString.spans.push(textSpan);
        let circleBtn = new buttons.Button();
        circleBtn.cssClasses.add("circle");

        circleBtn.id = this._pointsCounter++;
        circleBtn.formattedText = formattedString;
        // this._imgGridId.addChild(circleBtn);
        circleBtn.on("pan", (args: PanGestureEventData) => {
            if (args.state === 1) {
                this._prevDeltaX = 0;
                this._prevDeltaY = 0;
                if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += -15;
                    circleBtn.translateY += -30;
                } else {
                    if (circleBtn.translateX < 0) {
                        circleBtn.translateX += +5;
                    } else {
                        circleBtn.translateX += -5;
                    }
                    if (circleBtn.translateY < 0) {
                        circleBtn.translateY += +5;
                    } else {
                        circleBtn.translateY += -5;
                    }
                }
            }
            else if (args.state === 2) {
                if (this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += args.deltaX - this._prevDeltaX;
                    circleBtn.translateY += args.deltaY - this._prevDeltaY;

                    this._points.forEach((point) => {
                        if (point) {
                            if (point.id == circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    })
                    this._prevDeltaX = args.deltaX;
                    this._prevDeltaY = args.deltaY;
                }
            } else if (args.state === 3) {
            }
        });

        //Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used. 
        let actualPointInScreenX = actualPoint.x + actualPointDeltaX;
        let actualPointInScreenY = actualPoint.y + actualPointDeltaY;
        circleBtn.translateX = actualPointInScreenX;
        circleBtn.translateY = actualPointInScreenY;
        this._circleBtnList.push(circleBtn);

        // this.params.context.imageSourceOrg = opencv.drawShape(this.imageSourceOrg, pointX + '-' + pointY, this._imageActualSize.width + '-' + this._imageActualSize.height, this._pointsCounter++);
        // // this.params.context.imageSourceOrg = opencv.drawShape(this.imageSourceOrg, pointX + '-' + pointY, '1-1', this._pointsCounter++);
        // this.imageSourceOrg = this.params.context.imageSourceOrg;
        // SendBroadcastImage(this.imageSourceOrg);
        this._points.push(actualPoint);
        return circleBtn;
    }

    private checkBoundary(translateX: any, translateY: any): any {
        if (translateX < (this._centerPointX - 10) &&
            translateY < (this._centerPointY - 10) &&
            (translateX * -1) < (this._centerPointX - 10) &&
            (translateY * -1) < (this._centerPointY - 10)) {
            return true;
        } else {
            return false;
        }
    }

}
