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
var image_source_1 = require("tns-core-modules/image-source");
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var dialog_component_1 = require("../dialog/dialog.component");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var router_1 = require("@angular/router");
var application = require("tns-core-modules/application");
var fs = require("file-system");
var RC_GALLERY = 9001;
var CaptureComponent = (function () {
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
    }
    CaptureComponent.prototype.ngOnInit = function () {
        console.log("Initializing OpenCV...");
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this.isImageBtnVisible = false;
        this.isBusy = false;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createAutoFocusImage();
    };
    CaptureComponent.prototype.ngOnDestroy = function () {
        console.log('Destroy called...');
    };
    CaptureComponent.prototype.camLoaded = function (e) {
        console.log('***** cam loaded *****');
        this.isBusy = false;
        this.cam = e.object;
        var flashMode = this.cam.getFlashMode();
        // Turn flash on at startup
        if (flashMode == 'off') {
            this.cam.toggleFlash();
        }
        var cb = new android.hardware.Camera.AutoFocusMoveCallback({
            _this: this,
            onAutoFocusMoving: function (start, camera) {
                var animate = this._this.autofocusBtn.animate();
                if (!start) {
                    animate.scaleX(1);
                    animate.scaleY(1);
                    var color = android.graphics.Color.parseColor("#008000"); //Green color           
                    this._this.autofocusBtn.setColorFilter(color);
                }
                else {
                    animate.scaleX(0.50);
                    animate.scaleY(0.50);
                    animate.setDuration(100);
                    var color = android.graphics.Color.parseColor("#ff0000"); // Red color
                    this._this.autofocusBtn.setColorFilter(color);
                    animate.start();
                }
            }
        });
        if (this.cam._camera) {
            this.cam._camera.setAutoFocusMoveCallback(cb);
        }
        if (e.data) {
            this.cam.showFlashIcon = true;
            this.cam.showToggleIcon = true;
            try {
                this.initImageGalleryButton();
                this.initCameraButton();
                this.initAutoFocusImageButton();
            }
            catch (e) {
                this.takePicBtn = null;
                this.galleryBtn = null;
                this.autofocusBtn = null;
                this.takePicParams = null;
                this.galleryParams = null;
                this.autofocusParams = null;
                this.cam.showToggleIcon = true;
                this.createTakePictureButton();
                this.createImageGalleryButton();
                this.createAutoFocusImage();
                this.initImageGalleryButton();
                this.initCameraButton();
                this.initAutoFocusImageButton();
                this.cam._initFlashButton();
                this.cam._initToggleCameraButton();
            }
        }
        // TEST THE ICONS SHOWING/HIDING
        //this.cam.showCaptureIcon = true;
        //this.cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    CaptureComponent.prototype.initCameraButton = function () {
        this.cam._nativeView.removeView(this.takePicBtn);
        this.cam._nativeView.addView(this.takePicBtn, this.takePicParams);
    };
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this.cam._nativeView.removeView(this.galleryBtn);
        this.cam._nativeView.addView(this.galleryBtn, this.galleryParams);
    };
    ;
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this.cam._nativeView.removeView(this.autofocusBtn);
        this.cam._nativeView.addView(this.autofocusBtn, this.autofocusParams);
    };
    ;
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this.takePicBtn = this.createImageButton();
        var takePicDrawable = this.getImageDrawable('ic_camera');
        this.takePicBtn.setImageResource(takePicDrawable);
        var shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor("#ffffff"); // white color
        this.takePicBtn.setColorFilter(color);
        // this.takePicBtn.setScaleX(0.50);
        // this.takePicBtn.setScaleY(0.50);
        this.takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.takePicFromCam(_this);
            }
        }));
        this.createTakePictureParams();
    };
    CaptureComponent.prototype.createTakePictureParams = function () {
        this.takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this.cam.insetButtons === true) {
        // var layoutHeight = this.cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        // this.takePicParams.setMargins(8, 8, 8, yMargin);
        // }
        // else {
        this.takePicParams.width = "100";
        this.takePicParams.height = "100";
        this.takePicParams.setMargins(8, 8, 8, 8);
        // }
        this.takePicParams.addRule(12); //ALIGN_PARENT_BOTTOM
        this.takePicParams.addRule(11); //HORIZONTAL_CENTER
    };
    CaptureComponent.prototype.createAutoFocusImage = function () {
        var _this = this;
        this.autofocusBtn = this.createAutoFocusImageButton();
        var openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        this.autofocusBtn.setImageResource(openGalleryDrawable);
        var shape = this.createAutofocusShape();
        this.autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
    };
    CaptureComponent.prototype.createAutoFocusImageParams = function () {
        this.autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this.insetButtons === true) {
        // var layoutWidth = this.cam._nativeView.getWidth();
        // console.log("layoutWidth = " + layoutWidth);
        // var xMargin = layoutWidth * 0.1;
        // var layoutHeight = this.cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        this.autofocusParams.width = "300";
        this.autofocusParams.height = "300";
        //galleryParams.setMargins(xMargin, 18, 18, yMargin);
        this.autofocusParams.setMargins(8, 8, 8, 8);
        // }
        this.autofocusParams.addRule(13); //ALIGN_PARENT_CENTER
    };
    CaptureComponent.prototype.createAutoFocusImageButton = function () {
        var btn = new android.widget.ImageView(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(158);
        btn.setMaxWidth(158);
        btn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
        var color = android.graphics.Color.parseColor("#008000"); // Green color
        btn.setColorFilter(color);
        return btn;
    };
    CaptureComponent.prototype.createImageGalleryButton = function () {
        var _this = this;
        this.galleryBtn = this.createImageButton();
        var openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        this.galleryBtn.setImageResource(openGalleryDrawable);
        var galleryBtnId = application.android.context.getResources().getIdentifier("gallery_btn", "id", application.android.context.getPackageName());
        this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this.galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createTransparentCircleDrawable();
        this.galleryBtn.setBackgroundDrawable(shape);
        this.galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.goImageGallery();
            }
        }));
        this.createImageGallerryParams();
    };
    CaptureComponent.prototype.createImageGallerryParams = function () {
        this.galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this.insetButtons === true) {
        // var layoutWidth = this.cam._nativeView.getWidth();
        // console.log("layoutWidth = " + layoutWidth);
        // var xMargin = layoutWidth * 0.1;
        // var layoutHeight = this.cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        this.galleryParams.width = "100";
        this.galleryParams.height = "100";
        // this.galleryParams.setMargins(xMargin, 8, 8, yMargin);
        this.galleryParams.setMargins(8, 8, 8, 8);
        // }
        // else {
        //     galleryParams.setMargins(8, 8, 8, 8);
        // }
        this.galleryParams.addRule(12); //ALIGN_PARENT_BOTTOM
        this.galleryParams.addRule(9); //ALIGN_PARENT_LEFT
    };
    CaptureComponent.prototype.getImageDrawable = function (iconName) {
        var drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    };
    CaptureComponent.prototype.createTransparentCircleDrawable = function () {
        var shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000);
        shape.setCornerRadius(96);
        shape.setAlpha(150);
        return shape;
    };
    CaptureComponent.prototype.createAutofocusShape = function () {
        var shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    };
    CaptureComponent.prototype.createImageButton = function () {
        var btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(58);
        btn.setMaxWidth(58);
        return btn;
    };
    CaptureComponent.prototype.imagesSelectedEvent = function (e) {
        console.log('IMAGES SELECTED EVENT!!!');
        this.loadImage(e.data[0]);
    };
    CaptureComponent.prototype.photoCapturedEvent = function (e) {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(e.data);
    };
    CaptureComponent.prototype.toggleCameraEvent = function (e) {
        console.log("camera toggled");
    };
    CaptureComponent.prototype.recordDemoVideo = function () {
        try {
            console.log("*** start recording ***");
            this.cam.record();
        }
        catch (err) {
            console.log(err);
        }
    };
    CaptureComponent.prototype.stopRecordingDemoVideo = function () {
        try {
            console.log("*** stop recording ***");
            this.cam.stop();
            console.log("*** after this.cam.stop() ***");
        }
        catch (err) {
            console.log(err);
        }
    };
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        this.cam.toggleFlash();
    };
    CaptureComponent.prototype.toggleShowingFlashIcon = function () {
        console.log("showFlashIcon = " + this.cam.showFlashIcon);
        this.cam.showFlashIcon = !this.cam.showFlashIcon;
    };
    CaptureComponent.prototype.toggleTheCamera = function () {
        this.cam.toggleCamera();
    };
    CaptureComponent.prototype.openCamPlusLibrary = function () {
        this.cam.chooseFromLibrary();
    };
    CaptureComponent.prototype.takePicFromCam = function (_this) {
        _this.isBusy = true;
        _this.activityLoader.show();
        _this.cam.takePicture({ saveToGallery: true });
        this.imgURI = '';
        this.imageSource = null;
    };
    CaptureComponent.prototype.goImageGallery = function () {
        this.router.navigate(["imagegallery"]);
    };
    CaptureComponent.prototype.showCapturedPictureDialog = function (fullscreen, filePathOrg, imgURI) {
        var _this = this;
        var options = {
            context: {
                imageSource: imgURI,
                imageSourceOrg: filePathOrg
            },
            fullscreen: fullscreen,
            viewContainerRef: this.viewContainerRef
        };
        this.activityLoader.hide();
        this.modalService.showModal(dialog_component_1.DialogContent, options)
            .then(function (dialogResult) {
            if (dialogResult) {
                _this.setTransformedImage(dialogResult);
                _this.createThumbNailImage(dialogResult);
            }
            else {
                try {
                    var imgFileOrg = fs.File.fromPath(filePathOrg);
                    if (imgFileOrg)
                        imgFileOrg.remove();
                    var imgURIFile = fs.File.fromPath(imgURI);
                    if (imgURIFile)
                        imgURIFile.remove();
                    transformedimage_provider_1.SendBroadcastImage(filePathOrg);
                    transformedimage_provider_1.SendBroadcastImage(imgURI);
                }
                catch (e) {
                    alert('Couldnot delete the file');
                }
            }
        });
    };
    CaptureComponent.prototype.setTransformedImage = function (imgURIParam) {
        if (imgURIParam) {
            try {
                this.isImageBtnVisible = true;
                this.imgURI = imgURIParam;
                this.imageSource = imgURIParam;
                transformedimage_provider_1.SendBroadcastImage(this.imgURI);
            }
            catch (e) {
                Toast.makeText("Error while setting image in preview area" + e, "long").show();
            }
        }
    };
    // handle value change
    CaptureComponent.prototype.onSliderLoaded = function (args) {
        var _this = this;
        var sliderComponent = args.object;
        sliderComponent.on("valueChange", function (sargs) {
            console.log("SliderValue: " + sargs.object.value);
            var thresholdValue = sargs.object.value;
            if (thresholdValue % 2 == 0) {
                thresholdValue++;
            }
            _this.isImageBtnVisible = false;
            _this.performAdaptiveThreshold(thresholdValue, sargs);
        });
    };
    CaptureComponent.prototype.onPageLoaded = function (args) {
        this.page = args.object;
    };
    CaptureComponent.prototype.createThumbNailImage = function (imgURI) {
        try {
            var thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            //com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);
            var uri = android.net.Uri.parse("file://" + thumbnailImagePath);
            this.galleryBtn.setImageURI(uri);
        }
        catch (e) {
            console.log('Error while creating thumbnail image. ' + e);
        }
    };
    CaptureComponent.prototype.performAdaptiveThreshold = function (thresholdValue, sargs) {
        var _this = this;
        this.zone.run(function () {
            _this.imgEmpty = _this.imgURI + "?ts=" + new Date().getTime();
            _this.imageSource = _this.imgEmpty;
        });
        this.zone.run(function () {
            _this.imgURI = opencv.performAdaptiveThreshold(_this.wrappedImage, _this.fileName, thresholdValue);
            _this.isImageBtnVisible = true;
            _this.imageSource = _this.imgURI;
        });
    };
    CaptureComponent.prototype.performPerspectiveTransformation = function (filePath) {
        try {
            // this.wrappedImage = opencv.performPerspectiveTransformationForWrappedImage(filePath);
            // this.fileName = opencv.getFileName(filePath);
            // this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, 41);
            this.imgURI = opencv.performPerspectiveTransformation(filePath, '');
            if (!this.imgURI) {
                Toast.makeText("No rectangles were found. Please take correct picture.", "long").show();
            }
            this.isBusy = false;
            this.showCapturedPictureDialog(true, filePath, this.imgURI);
        }
        catch (err) {
            console.log(err);
            alert('Error while calling performPerspectiveTransformation.');
        }
    };
    CaptureComponent.prototype.loadImage = function (imageAsset) {
        var _this = this;
        if (imageAsset) {
            this.imageSource = new image_source_1.ImageSource();
            this.imageSource.fromAsset(imageAsset).then(function (imgSrc) {
                if (imgSrc) {
                    _this.zone.run(function () {
                        var fp = (imageAsset.ios) ? imageAsset.ios : imageAsset.android;
                        _this.imageSourceOrg = fp;
                        _this.imgURI = '';
                        if (fp.indexOf('.png') > 0) {
                            _this.imgURI = fp;
                            _this.imageSource = _this.imgURI;
                        }
                        else {
                            _this.imgURI = '';
                            _this.performPerspectiveTransformation(fp);
                        }
                    });
                }
                else {
                    _this.imageSource = null;
                    alert('Image source is bad.');
                }
            }, function (err) {
                _this.imageSource = null;
                console.error(err);
                alert('Error getting image source from asset');
            });
        }
        else {
            console.log('Image Asset was null');
            alert('Image Asset was null');
            this.imageSource = null;
        }
    };
    return CaptureComponent;
}());
CaptureComponent = __decorate([
    core_1.Component({
        selector: "ns-capture",
        moduleId: module.id,
        styleUrls: ['./capture.component.css'],
        templateUrl: "./capture.component.html",
    }),
    __metadata("design:paramtypes", [core_1.NgZone,
        modal_dialog_1.ModalDialogService,
        core_1.ViewContainerRef,
        router_1.Router,
        transformedimage_provider_1.ActivityLoader])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXB0dXJlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUE4RztBQUk5Ryw4REFBNEQ7QUFHNUQsbURBQXFEO0FBQ3JELDBDQUE0QztBQU81QyxrRUFBMkY7QUFDM0YsK0RBQTJEO0FBRzNELG9GQUE0RjtBQUM1RiwwQ0FBeUM7QUFDekMsMERBQTREO0FBQzVELGdDQUFrQztBQUVsQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUE7QUFTckIsSUFBYSxnQkFBZ0I7SUF5QjVCLDBCQUNTLElBQVksRUFDWixZQUFnQyxFQUNoQyxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLGNBQThCO1FBSjlCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBRXZDLENBQUM7SUFFRCxtQ0FBUSxHQUFSO1FBQ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFFcEIsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7SUFFN0IsQ0FBQztJQUVELHNDQUFXLEdBQVg7UUFDQyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFD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LENBQUMsQ0FBQztvQkFDUCxLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDeEIsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7Z0JBQy9CLENBQUM7WUFDRixDQUFDLEVBQ0QsVUFBQyxHQUFHO2dCQUNILEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO2dCQUN4QixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQ0QsQ0FBQTtRQUNGLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNQLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQTtZQUNuQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO0lBQ0YsQ0FBQztJQUNGLHVCQUFDO0FBQUQsQ0FBQyxBQXJlRCxJQXFlQztBQXJlWSxnQkFBZ0I7SUFONUIsZ0JBQVMsQ0FBQztRQUNWLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQ3ZDLENBQUM7cUNBMkJjLGFBQU07UUFDRSxpQ0FBa0I7UUFDZCx1QkFBZ0I7UUFDMUIsZUFBTTtRQUNFLDBDQUFjO0dBOUIzQixnQkFBZ0IsQ0FxZTVCO0FBcmVZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgTmdab25lLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuaW1wb3J0IHsgSW1hZ2VBc3NldCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2UtYXNzZXQnO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ltYWdlJztcbmltcG9ydCAqIGFzIG9wZW5jdiBmcm9tICduYXRpdmVzY3JpcHQtb3BlbmN2LXBsdWdpbic7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuaW1wb3J0IHsgU2xpZGVyIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvc2xpZGVyXCI7XG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBQcm9wZXJ0eUNoYW5nZURhdGEgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGVcIjtcbmltcG9ydCB7IFN0YWNrTGF5b3V0IH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvbGF5b3V0cy9zdGFjay1sYXlvdXRcIjtcbmltcG9ydCB7IEdyaWRMYXlvdXQgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9sYXlvdXRzL2dyaWQtbGF5b3V0XCI7XG5pbXBvcnQgeyBWaWV3IH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvY29yZS92aWV3XCI7XG5pbXBvcnQgeyBSb3RhdGlvbkdlc3R1cmVFdmVudERhdGEgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlc1wiO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dTZXJ2aWNlLCBNb2RhbERpYWxvZ09wdGlvbnMgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nXCI7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSBcIi4uL2RpYWxvZy9kaWFsb2cuY29tcG9uZW50XCI7XG5pbXBvcnQgeyBJbWFnZUdhbGxlcnlDb21wb25lbnQgfSBmcm9tIFwiLi4vaW1hZ2VnYWxsZXJ5L2ltYWdlZ2FsbGVyeS5jb21wb25lbnRcIjtcbmltcG9ydCB7IGtub3duRm9sZGVycywgRmlsZSwgRm9sZGVyIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW1cIjtcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tIFwiQGFuZ3VsYXIvcm91dGVyXCI7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZpbGUtc3lzdGVtXCI7XG5cbmxldCBSQ19HQUxMRVJZID0gOTAwMVxuZGVjbGFyZSB2YXIgYW5kcm9pZDogYW55XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogXCJucy1jYXB0dXJlXCIsXG5cdG1vZHVsZUlkOiBtb2R1bGUuaWQsXG5cdHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuXHR0ZW1wbGF0ZVVybDogXCIuL2NhcHR1cmUuY29tcG9uZW50Lmh0bWxcIixcbn0pXG5leHBvcnQgY2xhc3MgQ2FwdHVyZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcblx0cHJpdmF0ZSBjYW06IENhbWVyYVBsdXM7XG5cdHByaXZhdGUgaXNDYW1lcmFWaXNpYmxlOiBhbnk7XG5cdHByaXZhdGUgaXNJbWFnZUJ0blZpc2libGU6IGFueTtcblx0cHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcblx0cHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG5cblx0cHVibGljIGltZ1VSSTogYW55O1xuXHRwdWJsaWMgd3JhcHBlZEltYWdlOiBhbnk7XG5cdHB1YmxpYyBmaWxlTmFtZTogYW55O1xuXHRwdWJsaWMgb3BlbmN2SW5zdGFuY2U6IGFueTtcblx0cHVibGljIGltZ0VtcHR5OiBhbnk7XG5cdHB1YmxpYyBpc0J1c3k6IGFueTtcblxuXHRwdWJsaWMgc2NyZWVuSGVpZ2h0OiBhbnk7XG5cblx0cHJpdmF0ZSB0cmFuc2Zvcm1lZEZpbGVQYXRoOiBhbnk7XG5cdHByaXZhdGUgcGFnZTogYW55O1xuXHRwcml2YXRlIGdhbGxlcnlCdG46IGFueTtcblx0cHJpdmF0ZSB0YWtlUGljQnRuOiBhbnk7XG5cdHByaXZhdGUgYXV0b2ZvY3VzQnRuOiBhbnk7XG5cdHByaXZhdGUgZ2FsbGVyeVBhcmFtczogYW55O1xuXHRwcml2YXRlIHRha2VQaWNQYXJhbXM6IGFueTtcblx0cHJpdmF0ZSBhdXRvZm9jdXNQYXJhbXM6IGFueTtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHpvbmU6IE5nWm9uZSxcblx0XHRwcml2YXRlIG1vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLFxuXHRcdHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcblx0XHRwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuXHRcdHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyXG5cdCkge1xuXHR9XG5cblx0bmdPbkluaXQoKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coXCJJbml0aWFsaXppbmcgT3BlbkNWLi4uXCIpO1xuXHRcdHRoaXMub3BlbmN2SW5zdGFuY2UgPSBvcGVuY3YuaW5pdE9wZW5DVigpO1xuXG5cdFx0dGhpcy5pc0NhbWVyYVZpc2libGUgPSB0cnVlO1xuXHRcdHRoaXMuaXNJbWFnZUJ0blZpc2libGUgPSBmYWxzZTtcblx0XHR0aGlzLmlzQnVzeSA9IGZhbHNlO1xuXG5cdFx0dGhpcy5jcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpO1xuXHRcdHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG5cdFx0dGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuXG5cdH1cblxuXHRuZ09uRGVzdHJveSgpIHtcblx0XHRjb25zb2xlLmxvZygnRGVzdHJveSBjYWxsZWQuLi4nKTtcblx0fVxuXG5cdHB1YmxpYyBjYW1Mb2FkZWQoZTogYW55KTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coJyoqKioqIGNhbSBsb2FkZWQgKioqKionKTtcblx0XHR0aGlzLmlzQnVzeSA9IGZhbHNlO1xuXHRcdHRoaXMuY2FtID0gZS5vYmplY3QgYXMgQ2FtZXJhUGx1cztcblxuXHRcdGxldCBmbGFzaE1vZGUgPSB0aGlzLmNhbS5nZXRGbGFzaE1vZGUoKTtcblxuXHRcdC8vIFR1cm4gZmxhc2ggb24gYXQgc3RhcnR1cFxuXHRcdGlmIChmbGFzaE1vZGUgPT0gJ29mZicpIHtcblx0XHRcdHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG5cdFx0fVxuXHRcdGxldCBjYiA9IG5ldyBhbmRyb2lkLmhhcmR3YXJlLkNhbWVyYS5BdXRvRm9jdXNNb3ZlQ2FsbGJhY2soXG5cblx0XHRcdHtcblx0XHRcdFx0X3RoaXM6IHRoaXMsXG5cdFx0XHRcdG9uQXV0b0ZvY3VzTW92aW5nOiBmdW5jdGlvbiAoc3RhcnQsIGNhbWVyYSkge1xuXHRcdFx0XHRcdGxldCBhbmltYXRlID0gdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uYW5pbWF0ZSgpO1xuXHRcdFx0XHRcdGlmICghc3RhcnQpIHtcblx0XHRcdFx0XHRcdGFuaW1hdGUuc2NhbGVYKDEpO1xuXHRcdFx0XHRcdFx0YW5pbWF0ZS5zY2FsZVkoMSk7XG5cdFx0XHRcdFx0XHRsZXQgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoXCIjMDA4MDAwXCIpOyAvL0dyZWVuIGNvbG9yICAgICAgICAgICBcblx0XHRcdFx0XHRcdHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YW5pbWF0ZS5zY2FsZVgoMC41MCk7XG5cdFx0XHRcdFx0XHRhbmltYXRlLnNjYWxlWSgwLjUwKTtcblx0XHRcdFx0XHRcdGFuaW1hdGUuc2V0RHVyYXRpb24oMTAwKTtcblxuXHRcdFx0XHRcdFx0bGV0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKFwiI2ZmMDAwMFwiKTsgLy8gUmVkIGNvbG9yXG5cdFx0XHRcdFx0XHR0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cblx0XHRcdFx0XHRcdGFuaW1hdGUuc3RhcnQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdGlmICh0aGlzLmNhbS5fY2FtZXJhKSB7XG5cdFx0XHR0aGlzLmNhbS5fY2FtZXJhLnNldEF1dG9Gb2N1c01vdmVDYWxsYmFjayhjYik7XG5cdFx0fVxuXHRcdGlmIChlLmRhdGEpIHtcblxuXHRcdFx0dGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG5cblx0XHRcdHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuXHRcdFx0XHR0aGlzLmluaXRDYW1lcmFCdXR0b24oKTtcblx0XHRcdFx0dGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0dGhpcy50YWtlUGljQnRuID0gbnVsbDtcblx0XHRcdFx0dGhpcy5nYWxsZXJ5QnRuID0gbnVsbDtcblx0XHRcdFx0dGhpcy5hdXRvZm9jdXNCdG4gPSBudWxsO1xuXHRcdFx0XHR0aGlzLnRha2VQaWNQYXJhbXMgPSBudWxsO1xuXHRcdFx0XHR0aGlzLmdhbGxlcnlQYXJhbXMgPSBudWxsO1xuXHRcdFx0XHR0aGlzLmF1dG9mb2N1c1BhcmFtcyA9IG51bGw7XG5cdFx0XHRcdHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcblxuXHRcdFx0XHR0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcblx0XHRcdFx0dGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuXHRcdFx0XHR0aGlzLmluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuXHRcdFx0XHR0aGlzLmNhbS5faW5pdEZsYXNoQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuY2FtLl9pbml0VG9nZ2xlQ2FtZXJhQnV0dG9uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gVEVTVCBUSEUgSUNPTlMgU0hPV0lORy9ISURJTkdcblx0XHQvL3RoaXMuY2FtLnNob3dDYXB0dXJlSWNvbiA9IHRydWU7XG5cdFx0Ly90aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcblx0XHQvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG5cdFx0Ly8gdGhpcy5jYW1lcmFQbHVzLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG5cdH1cblx0cHVibGljIGluaXRDYW1lcmFCdXR0b24oKSB7XG5cdFx0dGhpcy5jYW0uX25hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLnRha2VQaWNCdG4pO1xuXHRcdHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50YWtlUGljQnRuLCB0aGlzLnRha2VQaWNQYXJhbXMpO1xuXHR9XG5cblx0cHVibGljIGluaXRJbWFnZUdhbGxlcnlCdXR0b24oKSB7XG5cdFx0dGhpcy5jYW0uX25hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLmdhbGxlcnlCdG4pO1xuXHRcdHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5nYWxsZXJ5QnRuLCB0aGlzLmdhbGxlcnlQYXJhbXMpO1xuXHR9O1xuXHRwdWJsaWMgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuXHRcdHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5hdXRvZm9jdXNCdG4pO1xuXHRcdHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5hdXRvZm9jdXNCdG4sIHRoaXMuYXV0b2ZvY3VzUGFyYW1zKTtcblx0fTtcblx0cHVibGljIGNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCkge1xuXHRcdGxldCBfdGhpcyA9IHRoaXM7XG5cdFx0dGhpcy50YWtlUGljQnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuXHRcdGxldCB0YWtlUGljRHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2NhbWVyYScpO1xuXHRcdHRoaXMudGFrZVBpY0J0bi5zZXRJbWFnZVJlc291cmNlKHRha2VQaWNEcmF3YWJsZSk7XG5cdFx0bGV0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG5cdFx0dGhpcy50YWtlUGljQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG5cdFx0bGV0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKFwiI2ZmZmZmZlwiKTsgLy8gd2hpdGUgY29sb3Jcblx0XHR0aGlzLnRha2VQaWNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuXHRcdC8vIHRoaXMudGFrZVBpY0J0bi5zZXRTY2FsZVgoMC41MCk7XG5cdFx0Ly8gdGhpcy50YWtlUGljQnRuLnNldFNjYWxlWSgwLjUwKTtcblx0XHR0aGlzLnRha2VQaWNCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuXHRcdFx0b25DbGljazogZnVuY3Rpb24gKGFyZ3MpIHtcblx0XHRcdFx0X3RoaXMudGFrZVBpY0Zyb21DYW0oX3RoaXMpO1xuXG5cdFx0XHR9XG5cdFx0fSkpO1xuXHRcdHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVQYXJhbXMoKVxuXHR9XG5cdHByaXZhdGUgY3JlYXRlVGFrZVBpY3R1cmVQYXJhbXMoKSB7XG5cdFx0dGhpcy50YWtlUGljUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuXHRcdC8vIGlmICh0aGlzLmNhbS5pbnNldEJ1dHRvbnMgPT09IHRydWUpIHtcblx0XHQvLyB2YXIgbGF5b3V0SGVpZ2h0ID0gdGhpcy5jYW0uX25hdGl2ZVZpZXcuZ2V0SGVpZ2h0KCk7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJsYXlvdXRIZWlnaHQgPSBcIiArIGxheW91dEhlaWdodCk7XG5cdFx0Ly8gdmFyIHlNYXJnaW4gPSBsYXlvdXRIZWlnaHQgKiAwLjE7XG5cdFx0Ly8gdGhpcy50YWtlUGljUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgeU1hcmdpbik7XG5cdFx0Ly8gfVxuXHRcdC8vIGVsc2Uge1xuXHRcdHRoaXMudGFrZVBpY1BhcmFtcy53aWR0aCA9IFwiMTAwXCI7XG5cdFx0dGhpcy50YWtlUGljUGFyYW1zLmhlaWdodCA9IFwiMTAwXCI7XG5cdFx0dGhpcy50YWtlUGljUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG5cdFx0Ly8gfVxuXHRcdHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTsgLy9BTElHTl9QQVJFTlRfQk9UVE9NXG5cdFx0dGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTEpOyAvL0hPUklaT05UQUxfQ0VOVEVSXG5cdH1cblx0cHVibGljIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCkge1xuXHRcdGxldCBfdGhpcyA9IHRoaXM7XG5cdFx0dGhpcy5hdXRvZm9jdXNCdG4gPSB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG5cdFx0bGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcblx0XHR0aGlzLmF1dG9mb2N1c0J0bi5zZXRJbWFnZVJlc291cmNlKG9wZW5HYWxsZXJ5RHJhd2FibGUpO1xuXHRcdGxldCBzaGFwZSA9IHRoaXMuY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTtcblx0XHR0aGlzLmF1dG9mb2N1c0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuXHRcdHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKTtcblx0fVxuXHRwcml2YXRlIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCkge1xuXHRcdHRoaXMuYXV0b2ZvY3VzUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuXHRcdC8vIGlmICh0aGlzLmluc2V0QnV0dG9ucyA9PT0gdHJ1ZSkge1xuXHRcdC8vIHZhciBsYXlvdXRXaWR0aCA9IHRoaXMuY2FtLl9uYXRpdmVWaWV3LmdldFdpZHRoKCk7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJsYXlvdXRXaWR0aCA9IFwiICsgbGF5b3V0V2lkdGgpO1xuXHRcdC8vIHZhciB4TWFyZ2luID0gbGF5b3V0V2lkdGggKiAwLjE7XG5cdFx0Ly8gdmFyIGxheW91dEhlaWdodCA9IHRoaXMuY2FtLl9uYXRpdmVWaWV3LmdldEhlaWdodCgpO1xuXHRcdC8vIGNvbnNvbGUubG9nKFwibGF5b3V0SGVpZ2h0ID0gXCIgKyBsYXlvdXRIZWlnaHQpO1xuXHRcdC8vIHZhciB5TWFyZ2luID0gbGF5b3V0SGVpZ2h0ICogMC4xO1xuXHRcdHRoaXMuYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gXCIzMDBcIjtcblx0XHR0aGlzLmF1dG9mb2N1c1BhcmFtcy5oZWlnaHQgPSBcIjMwMFwiO1xuXHRcdC8vZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKHhNYXJnaW4sIDE4LCAxOCwgeU1hcmdpbik7XG5cdFx0dGhpcy5hdXRvZm9jdXNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcblx0XHQvLyB9XG5cdFx0dGhpcy5hdXRvZm9jdXNQYXJhbXMuYWRkUnVsZSgxMyk7IC8vQUxJR05fUEFSRU5UX0NFTlRFUlxuXHR9XG5cdHB1YmxpYyBjcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpOiBhbnkge1xuXHRcdGxldCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3KGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCk7XG5cdFx0YnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuXHRcdGJ0bi5zZXRNYXhIZWlnaHQoMTU4KTtcblx0XHRidG4uc2V0TWF4V2lkdGgoMTU4KTtcblx0XHRidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuXHRcdGxldCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcihcIiMwMDgwMDBcIik7IC8vIEdyZWVuIGNvbG9yXG5cdFx0YnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblx0XHRyZXR1cm4gYnRuO1xuXHR9XG5cblx0cHVibGljIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcblx0XHRsZXQgX3RoaXMgPSB0aGlzO1xuXHRcdHRoaXMuZ2FsbGVyeUJ0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcblxuXHRcdGxldCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKCdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cdFx0dGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cblx0XHRsZXQgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpLmdldElkZW50aWZpZXIoXCJnYWxsZXJ5X2J0blwiLCBcImlkXCIsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcblxuXHRcdHRoaXMuZ2FsbGVyeUJ0bi5zZXRUYWcoZ2FsbGVyeUJ0bklkLCAnZ2FsbGVyeS1idG4tdGFnJyk7XG5cdFx0dGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG5cdFx0bGV0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG5cdFx0dGhpcy5nYWxsZXJ5QnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG5cdFx0dGhpcy5nYWxsZXJ5QnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0XHRcdF90aGlzLmdvSW1hZ2VHYWxsZXJ5KCk7XG5cdFx0XHR9XG5cdFx0fSkpO1xuXHRcdHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpO1xuXHR9XG5cdHByaXZhdGUgY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpIHtcblx0XHR0aGlzLmdhbGxlcnlQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG5cdFx0Ly8gaWYgKHRoaXMuaW5zZXRCdXR0b25zID09PSB0cnVlKSB7XG5cdFx0Ly8gdmFyIGxheW91dFdpZHRoID0gdGhpcy5jYW0uX25hdGl2ZVZpZXcuZ2V0V2lkdGgoKTtcblx0XHQvLyBjb25zb2xlLmxvZyhcImxheW91dFdpZHRoID0gXCIgKyBsYXlvdXRXaWR0aCk7XG5cdFx0Ly8gdmFyIHhNYXJnaW4gPSBsYXlvdXRXaWR0aCAqIDAuMTtcblx0XHQvLyB2YXIgbGF5b3V0SGVpZ2h0ID0gdGhpcy5jYW0uX25hdGl2ZVZpZXcuZ2V0SGVpZ2h0KCk7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJsYXlvdXRIZWlnaHQgPSBcIiArIGxheW91dEhlaWdodCk7XG5cdFx0Ly8gdmFyIHlNYXJnaW4gPSBsYXlvdXRIZWlnaHQgKiAwLjE7XG5cdFx0dGhpcy5nYWxsZXJ5UGFyYW1zLndpZHRoID0gXCIxMDBcIjtcblx0XHR0aGlzLmdhbGxlcnlQYXJhbXMuaGVpZ2h0ID0gXCIxMDBcIjtcblx0XHQvLyB0aGlzLmdhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyh4TWFyZ2luLCA4LCA4LCB5TWFyZ2luKTtcblx0XHR0aGlzLmdhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcblx0XHQvLyB9XG5cdFx0Ly8gZWxzZSB7XG5cdFx0Ly8gICAgIGdhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcblx0XHQvLyB9XG5cdFx0dGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoMTIpOyAvL0FMSUdOX1BBUkVOVF9CT1RUT01cblx0XHR0aGlzLmdhbGxlcnlQYXJhbXMuYWRkUnVsZSg5KTsgLy9BTElHTl9QQVJFTlRfTEVGVFxuXHR9XG5cdHB1YmxpYyBnZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTogYW55IHtcblx0XHRsZXQgZHJhd2FibGVJZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dFxuXHRcdFx0LmdldFJlc291cmNlcygpXG5cdFx0XHQuZ2V0SWRlbnRpZmllcihpY29uTmFtZSwgJ2RyYXdhYmxlJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXHRcdHJldHVybiBkcmF3YWJsZUlkO1xuXHR9XG5cdHB1YmxpYyBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG5cdFx0bGV0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuXHRcdHNoYXBlLnNldENvbG9yKDB4OTkwMDAwMDApO1xuXHRcdHNoYXBlLnNldENvcm5lclJhZGl1cyg5Nik7XG5cdFx0c2hhcGUuc2V0QWxwaGEoMTUwKTtcblx0XHRyZXR1cm4gc2hhcGU7XG5cdH1cblx0cHVibGljIGNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk6IGFueSB7XG5cblx0XHRsZXQgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5TaGFwZURyYXdhYmxlKCk7XG5cdFx0c2hhcGUuc2V0QWxwaGEoMCk7XG5cdFx0cmV0dXJuIHNoYXBlO1xuXG5cdH1cblx0cHVibGljIGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG5cdFx0bGV0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuXHRcdGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcblx0XHRidG4uc2V0TWF4SGVpZ2h0KDU4KTtcblx0XHRidG4uc2V0TWF4V2lkdGgoNTgpO1xuXHRcdHJldHVybiBidG47XG5cdH1cblxuXHRwdWJsaWMgaW1hZ2VzU2VsZWN0ZWRFdmVudChlOiBhbnkpOiB2b2lkIHtcblx0XHRjb25zb2xlLmxvZygnSU1BR0VTIFNFTEVDVEVEIEVWRU5UISEhJyk7XG5cdFx0dGhpcy5sb2FkSW1hZ2UoKGUuZGF0YSBhcyBJbWFnZUFzc2V0W10pWzBdKTtcblx0fVxuXG5cdHB1YmxpYyBwaG90b0NhcHR1cmVkRXZlbnQoZTogYW55KTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coJ1BIT1RPIENBUFRVUkVEIEVWRU5UISEhJyk7XG5cdFx0dGhpcy5sb2FkSW1hZ2UoZS5kYXRhIGFzIEltYWdlQXNzZXQpO1xuXHR9XG5cblx0cHVibGljIHRvZ2dsZUNhbWVyYUV2ZW50KGU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKFwiY2FtZXJhIHRvZ2dsZWRcIik7XG5cdH1cblxuXHRwdWJsaWMgcmVjb3JkRGVtb1ZpZGVvKCk6IHZvaWQge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgKioqIHN0YXJ0IHJlY29yZGluZyAqKipgKTtcblx0XHRcdHRoaXMuY2FtLnJlY29yZCgpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgc3RvcFJlY29yZGluZ0RlbW9WaWRlbygpOiB2b2lkIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc29sZS5sb2coYCoqKiBzdG9wIHJlY29yZGluZyAqKipgKTtcblx0XHRcdHRoaXMuY2FtLnN0b3AoKTtcblx0XHRcdGNvbnNvbGUubG9nKGAqKiogYWZ0ZXIgdGhpcy5jYW0uc3RvcCgpICoqKmApO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9XG5cdH1cblxuXHRwdWJsaWMgdG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcblx0XHR0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuXHR9XG5cblx0cHVibGljIHRvZ2dsZVNob3dpbmdGbGFzaEljb24oKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuY2FtLnNob3dGbGFzaEljb259YCk7XG5cdFx0dGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9ICF0aGlzLmNhbS5zaG93Rmxhc2hJY29uO1xuXHR9XG5cblx0cHVibGljIHRvZ2dsZVRoZUNhbWVyYSgpOiB2b2lkIHtcblx0XHR0aGlzLmNhbS50b2dnbGVDYW1lcmEoKTtcblx0fVxuXG5cdHB1YmxpYyBvcGVuQ2FtUGx1c0xpYnJhcnkoKTogdm9pZCB7XG5cdFx0dGhpcy5jYW0uY2hvb3NlRnJvbUxpYnJhcnkoKTtcblx0fVxuXG5cdHB1YmxpYyB0YWtlUGljRnJvbUNhbShfdGhpcyk6IHZvaWQge1xuXHRcdF90aGlzLmlzQnVzeSA9IHRydWU7XG5cdFx0X3RoaXMuYWN0aXZpdHlMb2FkZXIuc2hvdygpO1xuXHRcdF90aGlzLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG5cblxuXHRcdHRoaXMuaW1nVVJJID0gJyc7XG5cdFx0dGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG5cdH1cblxuXHRwdWJsaWMgZ29JbWFnZUdhbGxlcnkoKSB7XG5cdFx0dGhpcy5yb3V0ZXIubmF2aWdhdGUoW1wiaW1hZ2VnYWxsZXJ5XCJdKTtcblx0fVxuXG5cdHB1YmxpYyBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxzY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nKSB7XG5cdFx0bGV0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcblx0XHRcdGNvbnRleHQ6IHtcblx0XHRcdFx0aW1hZ2VTb3VyY2U6IGltZ1VSSSxcblx0XHRcdFx0aW1hZ2VTb3VyY2VPcmc6IGZpbGVQYXRoT3JnXG5cdFx0XHR9LFxuXHRcdFx0ZnVsbHNjcmVlbjogZnVsbHNjcmVlbixcblx0XHRcdHZpZXdDb250YWluZXJSZWY6IHRoaXMudmlld0NvbnRhaW5lclJlZlxuXHRcdH07XG5cdFx0dGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG5cdFx0dGhpcy5tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKERpYWxvZ0NvbnRlbnQsIG9wdGlvbnMpXG5cdFx0XHQudGhlbigoZGlhbG9nUmVzdWx0OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKGRpYWxvZ1Jlc3VsdCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0VHJhbnNmb3JtZWRJbWFnZShkaWFsb2dSZXN1bHQpO1xuXHRcdFx0XHRcdHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0bGV0IGltZ0ZpbGVPcmc6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGZpbGVQYXRoT3JnKTtcblxuXHRcdFx0XHRcdFx0aWYgKGltZ0ZpbGVPcmcpXG5cdFx0XHRcdFx0XHRcdGltZ0ZpbGVPcmcucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRsZXQgaW1nVVJJRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVVJJKTtcblx0XHRcdFx0XHRcdGlmIChpbWdVUklGaWxlKVxuXHRcdFx0XHRcdFx0XHRpbWdVUklGaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0U2VuZEJyb2FkY2FzdEltYWdlKGZpbGVQYXRoT3JnKTtcblx0XHRcdFx0XHRcdFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdGFsZXJ0KCdDb3VsZG5vdCBkZWxldGUgdGhlIGZpbGUnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdH1cblxuXHRwdWJsaWMgc2V0VHJhbnNmb3JtZWRJbWFnZShpbWdVUklQYXJhbSkge1xuXHRcdGlmIChpbWdVUklQYXJhbSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG5cdFx0XHRcdHRoaXMuaW1nVVJJID0gaW1nVVJJUGFyYW07XG5cdFx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXJhbTtcblx0XHRcdFx0U2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0VG9hc3QubWFrZVRleHQoXCJFcnJvciB3aGlsZSBzZXR0aW5nIGltYWdlIGluIHByZXZpZXcgYXJlYVwiICsgZSwgXCJsb25nXCIpLnNob3coKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBoYW5kbGUgdmFsdWUgY2hhbmdlXG5cdHB1YmxpYyBvblNsaWRlckxvYWRlZChhcmdzKTogdm9pZCB7XG5cdFx0Y29uc3Qgc2xpZGVyQ29tcG9uZW50OiBTbGlkZXIgPSA8U2xpZGVyPmFyZ3Mub2JqZWN0O1xuXHRcdHNsaWRlckNvbXBvbmVudC5vbihcInZhbHVlQ2hhbmdlXCIsIChzYXJncykgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coXCJTbGlkZXJWYWx1ZTogXCIgKyAoPFNsaWRlcj5zYXJncy5vYmplY3QpLnZhbHVlKTtcblx0XHRcdHZhciB0aHJlc2hvbGRWYWx1ZSA9ICg8U2xpZGVyPnNhcmdzLm9iamVjdCkudmFsdWU7XG5cdFx0XHRpZiAodGhyZXNob2xkVmFsdWUgJSAyID09IDApIHtcblx0XHRcdFx0dGhyZXNob2xkVmFsdWUrKztcblx0XHRcdH1cblx0XHRcdHRoaXMuaXNJbWFnZUJ0blZpc2libGUgPSBmYWxzZTtcblxuXHRcdFx0dGhpcy5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhyZXNob2xkVmFsdWUsIHNhcmdzKTtcblx0XHR9KTtcblx0fVxuXHRvblBhZ2VMb2FkZWQoYXJncykge1xuXHRcdHRoaXMucGFnZSA9IDxQYWdlPmFyZ3Mub2JqZWN0O1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVUaHVtYk5haWxJbWFnZShpbWdVUkk6IHN0cmluZyk6IGFueSB7XG5cdFx0dHJ5IHtcblx0XHRcdGxldCB0aHVtYm5haWxJbWFnZVBhdGggPSBvcGVuY3YuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcblx0XHRcdC8vIHZhciB0aHVtYm5haWxJbWFnZVBhdGggPSBjb20ubWFhcy5vcGVuY3Y0bmF0aXZlc2NyaXB0Lk9wZW5DVlV0aWxzLmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG5cdFx0XHQvL2NvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuXHRcdFx0bGV0IHVyaSA9IGFuZHJvaWQubmV0LlVyaS5wYXJzZShcImZpbGU6Ly9cIiArIHRodW1ibmFpbEltYWdlUGF0aCk7XG5cdFx0XHR0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VVUkkodXJpKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZSk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBwZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhyZXNob2xkVmFsdWUsIHNhcmdzKTogdm9pZCB7XG5cdFx0dGhpcy56b25lLnJ1bigoKSA9PiB7XG5cdFx0XHR0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyBcIj90cz1cIiArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXHRcdFx0dGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nRW1wdHk7XG5cdFx0fSk7XG5cdFx0dGhpcy56b25lLnJ1bigoKSA9PiB7XG5cdFx0XHR0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcblx0XHRcdHRoaXMuaXNJbWFnZUJ0blZpc2libGUgPSB0cnVlO1xuXHRcdFx0dGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuXHRcdH0pO1xuXHR9XG5cdHByaXZhdGUgcGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgpOiB2b2lkIHtcblx0XHR0cnkge1xuXHRcdFx0Ly8gdGhpcy53cmFwcGVkSW1hZ2UgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb25Gb3JXcmFwcGVkSW1hZ2UoZmlsZVBhdGgpO1xuXHRcdFx0Ly8gdGhpcy5maWxlTmFtZSA9IG9wZW5jdi5nZXRGaWxlTmFtZShmaWxlUGF0aCk7XG5cdFx0XHQvLyB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIDQxKTtcblx0XHRcdHRoaXMuaW1nVVJJID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoLCAnJyk7XG5cdFx0XHRpZiAoIXRoaXMuaW1nVVJJKSB7XG5cdFx0XHRcdFRvYXN0Lm1ha2VUZXh0KFwiTm8gcmVjdGFuZ2xlcyB3ZXJlIGZvdW5kLiBQbGVhc2UgdGFrZSBjb3JyZWN0IHBpY3R1cmUuXCIsIFwibG9uZ1wiKS5zaG93KCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmlzQnVzeSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5zaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKHRydWUsIGZpbGVQYXRoLCB0aGlzLmltZ1VSSSk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhlcnIpO1xuXHRcdFx0YWxlcnQoJ0Vycm9yIHdoaWxlIGNhbGxpbmcgcGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24uJyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBsb2FkSW1hZ2UoaW1hZ2VBc3NldDogSW1hZ2VBc3NldCk6IHZvaWQge1xuXHRcdGlmIChpbWFnZUFzc2V0KSB7XG5cdFx0XHR0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG5cblx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UuZnJvbUFzc2V0KGltYWdlQXNzZXQpLnRoZW4oXG5cdFx0XHRcdChpbWdTcmMpID0+IHtcblx0XHRcdFx0XHRpZiAoaW1nU3JjKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnpvbmUucnVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0dmFyIGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmltZ1VSSSA9ICcnO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChmcC5pbmRleE9mKCcucG5nJykgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5pbWdVUkkgPSBmcDtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5pbWdVUkkgPSAnJztcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLmltYWdlU291cmNlID0gbnVsbDtcblx0XHRcdFx0XHRcdGFsZXJ0KCdJbWFnZSBzb3VyY2UgaXMgYmFkLicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0KGVycikgPT4ge1xuXHRcdFx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRcdFx0XHRhbGVydCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldCcpO1xuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdJbWFnZSBBc3NldCB3YXMgbnVsbCcpXG5cdFx0XHRhbGVydCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnKTtcblx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuXHRcdH1cblx0fVxufSJdfQ==