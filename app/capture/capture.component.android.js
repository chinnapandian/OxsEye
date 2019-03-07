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
var CaptureComponent = (function () {
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader
        //	private _changeDetectionRef: ChangeDetectorRef
    ) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
    }
    // @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
    // private drawer: RadSideDrawer;
    // ngAfterViewInit() {
    // 	this.drawer = this.drawerComponent.sideDrawer;
    // 	this._changeDetectionRef.detectChanges();
    // 	// this.sideDrawerTransition = new PushTransition();
    // 	// this._changeDetectionRef.detectChanges();
    // }
    // public onAutomaticChecked(args) {
    // 	this._isAutomaticChecked = (<Switch>args.object).checked;
    // }
    // get sideDrawerTransition(): DrawerTransitionBase {
    //     return this._sideDrawerTransition;
    // }
    // set sideDrawerTransition(value: DrawerTransitionBase) {
    //     this._sideDrawerTransition = value;
    // }
    // get mainContentText() {
    // 	return this._mainContentText;
    // }
    // set mainContentText(value: string) {
    // 	this._mainContentText = value;
    // }
    // public openDrawer() {
    // 	this.drawer.showDrawer();
    // }
    // public onCloseDrawerTap() {
    // 	this.drawer.closeDrawer();
    // }
    CaptureComponent.prototype.ngOnInit = function () {
        // this.mainContentText = "SideDrawer for NativeScript can be easily setup in the HTML definition of your _page by defining tkDrawerContent and tkMainContent. The component has a default transition and position and also exposes notifications related to changes in its state. Swipe from left to open side drawer.";
        console.log("Initializing OpenCV...");
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this._isImageBtnVisible = false;
        this.isBusy = false;
        this._isAutomaticChecked = true;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createAutoFocusImage();
    };
    CaptureComponent.prototype.ngOnDestroy = function () {
        console.log('Destroy called...');
    };
    CaptureComponent.prototype.camLoaded = function (e) {
        console.log('***** _cam loaded *****');
        this.isBusy = false;
        this._cam = e.object;
        var flashMode = this._cam.getFlashMode();
        // Turn flash on at startup
        if (flashMode == 'off') {
            this._cam.toggleFlash();
        }
        var cb = new android.hardware.Camera.AutoFocusMoveCallback({
            _this: this,
            onAutoFocusMoving: function (start, camera) {
                var animate = this._this._autofocusBtn.animate();
                if (!start) {
                    animate.scaleX(1);
                    animate.scaleY(1);
                    var color = android.graphics.Color.parseColor("#008000"); //Green color           
                    this._this._autofocusBtn.setColorFilter(color);
                }
                else {
                    animate.scaleX(0.50);
                    animate.scaleY(0.50);
                    animate.setDuration(100);
                    var color = android.graphics.Color.parseColor("#ff0000"); // Red color
                    this._this._autofocusBtn.setColorFilter(color);
                    animate.start();
                }
            }
        });
        if (this._cam.camera) {
            this._cam.camera.setAutoFocusMoveCallback(cb);
        }
        if (e.data) {
            this._cam.showFlashIcon = true;
            this._cam.showToggleIcon = true;
            try {
                this.initImageGalleryButton();
                this.initCameraButton();
                this.initAutoFocusImageButton();
            }
            catch (e) {
                this._takePicBtn = null;
                this._galleryBtn = null;
                this._autofocusBtn = null;
                this._takePicParams = null;
                this._galleryParams = null;
                this._autofocusParams = null;
                this._cam.showToggleIcon = true;
                this.createTakePictureButton();
                this.createImageGalleryButton();
                this.createAutoFocusImage();
                this.initImageGalleryButton();
                this.initCameraButton();
                this.initAutoFocusImageButton();
                this._cam._initFlashButton();
                this._cam._initToggleCameraButton();
            }
        }
        // TEST THE ICONS SHOWING/HIDING
        //this._cam.showCaptureIcon = true;
        //this._cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    CaptureComponent.prototype.initCameraButton = function () {
        this._cam.nativeView.removeView(this._takePicBtn);
        this._cam.nativeView.addView(this._takePicBtn, this._takePicParams);
    };
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this._cam.nativeView.removeView(this._galleryBtn);
        this._cam.nativeView.addView(this._galleryBtn, this._galleryParams);
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
    };
    ;
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this._cam.nativeView.removeView(this._autofocusBtn);
        this._cam.nativeView.addView(this._autofocusBtn, this._autofocusParams);
    };
    ;
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this._takePicBtn = this.createImageButton();
        this.setImageResource(this._takePicBtn, 'ic_camera');
        // let takePicDrawable = this.getImageDrawable('ic_camera');
        // this._takePicBtn.setImageResource(takePicDrawable);
        var shape = this.createTransparentCircleDrawable();
        this._takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor("#ffffff"); // white color
        this._takePicBtn.setColorFilter(color);
        // this._takePicBtn.setScaleX(0.50);
        // this._takePicBtn.setScaleY(0.50);
        this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.takePicFromCam(_this);
            }
        }));
        this.createTakePictureParams();
    };
    CaptureComponent.prototype.createAutoFocusImage = function () {
        var _this = this;
        this._autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this._autofocusBtn, 'ic_auto_focus_black');
        // let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        // this._autofocusBtn.setImageResource(openGalleryDrawable);
        var shape = this.createAutofocusShape();
        this._autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
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
        this._galleryBtn = this.createImageButton();
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this._galleryBtn.setImageResource(openGalleryDrawable);
        var galleryBtnId = application.android.context.getResources().getIdentifier("gallery_btn", "id", application.android.context.getPackageName());
        this._galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this._galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createTransparentCircleDrawable();
        this._galleryBtn.setBackgroundDrawable(shape);
        this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.goImageGallery();
            }
        }));
        this.createImageGallerryParams();
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
            this._cam.record();
        }
        catch (err) {
            console.log(err);
        }
    };
    CaptureComponent.prototype.stopRecordingDemoVideo = function () {
        try {
            console.log("*** stop recording ***");
            this._cam.stop();
            console.log("*** after this._cam.stop() ***");
        }
        catch (err) {
            console.log(err);
        }
    };
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        this._cam.toggleFlash();
    };
    CaptureComponent.prototype.toggleShowingFlashIcon = function () {
        console.log("showFlashIcon = " + this._cam.showFlashIcon);
        this._cam.showFlashIcon = !this._cam.showFlashIcon;
    };
    CaptureComponent.prototype.toggleTheCamera = function () {
        this._cam.toggleCamera();
    };
    CaptureComponent.prototype.openCamPlusLibrary = function () {
        this._cam.chooseFromLibrary();
    };
    CaptureComponent.prototype.takePicFromCam = function (_this) {
        _this.isBusy = true;
        _this.activityLoader.show();
        _this._cam.takePicture({ saveToGallery: true });
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
                imageSourceOrg: filePathOrg,
                isAutoCorrection: true //this._isAutomaticChecked
            },
            fullscreen: fullscreen,
            viewContainerRef: this.viewContainerRef
        };
        this.activityLoader.hide();
        this.modalService.showModal(dialog_component_1.DialogContent, options)
            .then(function (dialogResult) {
            if (dialogResult) {
                // let dilogResultTemp = dialogResult;
                // if (dialogResult.indexOf("_TEMP") > 0) {
                // 	for (let i = 0; i < 4; i++) {
                // 		dilogResultTemp = dilogResultTemp.replace("_TEMP" + i, "");
                // 	}
                // }
                _this.setTransformedImage(dialogResult);
                _this.createThumbNailImage(dialogResult);
                _this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, "Add");
            }
            else {
                try {
                    var imgFileOrg = fs.File.fromPath(filePathOrg);
                    if (imgFileOrg)
                        imgFileOrg.remove();
                    var imgURIFile = fs.File.fromPath(imgURI);
                    if (imgURIFile)
                        imgURIFile.remove();
                    _this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, "Remove");
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
                this._isImageBtnVisible = true;
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
            _this._isImageBtnVisible = false;
            _this.performAdaptiveThreshold(thresholdValue, sargs);
        });
    };
    CaptureComponent.prototype.onPageLoaded = function (args) {
        this._page = args.object;
    };
    CaptureComponent.prototype.createTakePictureParams = function () {
        this._takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this._cam.insetButtons === true) {
        // var layoutHeight = this._cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        // this._takePicParams.setMargins(8, 8, 8, yMargin);
        // }
        // else {
        this._takePicParams.width = "100";
        this._takePicParams.height = "100";
        this._takePicParams.setMargins(8, 8, 8, 8);
        // }
        this._takePicParams.addRule(12); //ALIGN_PARENT_BOTTOM
        this._takePicParams.addRule(11); //HORIZONTAL_CENTER
    };
    CaptureComponent.prototype.createAutoFocusImageParams = function () {
        this._autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this.insetButtons === true) {
        // var layoutWidth = this._cam._nativeView.getWidth();
        // console.log("layoutWidth = " + layoutWidth);
        // var xMargin = layoutWidth * 0.1;
        // var layoutHeight = this._cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        this._autofocusParams.width = "300";
        this._autofocusParams.height = "300";
        //_galleryParams.setMargins(xMargin, 18, 18, yMargin);
        this._autofocusParams.setMargins(8, 8, 8, 8);
        // }
        this._autofocusParams.addRule(13); //ALIGN_PARENT_CENTER
    };
    CaptureComponent.prototype.setImageResource = function (btn, iconName) {
        var openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    };
    CaptureComponent.prototype.createImageGallerryParams = function () {
        this._galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        // if (this.insetButtons === true) {
        // var layoutWidth = this._cam._nativeView.getWidth();
        // console.log("layoutWidth = " + layoutWidth);
        // var xMargin = layoutWidth * 0.1;
        // var layoutHeight = this._cam._nativeView.getHeight();
        // console.log("layoutHeight = " + layoutHeight);
        // var yMargin = layoutHeight * 0.1;
        this._galleryParams.width = "100";
        this._galleryParams.height = "100";
        // this._galleryParams.setMargins(xMargin, 8, 8, yMargin);
        this._galleryParams.setMargins(8, 8, 8, 8);
        // }
        // else {
        //     _galleryParams.setMargins(8, 8, 8, 8);
        // }
        this._galleryParams.addRule(12); //ALIGN_PARENT_BOTTOM
        this._galleryParams.addRule(9); //ALIGN_PARENT_LEFT
    };
    CaptureComponent.prototype.refreshCapturedImagesinMediaStore = function (filePathOrg, imgURI, action) {
        try {
            transformedimage_provider_1.SendBroadcastImage(filePathOrg);
            transformedimage_provider_1.SendBroadcastImage(imgURI);
            if (action == "Add") {
                var thumnailOrgPath = imgURI.replace('PT_IMG', 'thumb_PT_IMG');
                transformedimage_provider_1.SendBroadcastImage(thumnailOrgPath);
            }
        }
        catch (e) {
            alert('Could not sync the file ');
        }
    };
    CaptureComponent.prototype.createThumbNailImage = function (imgURI) {
        try {
            var thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            //com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);
            var uri = android.net.Uri.parse("file://" + thumbnailImagePath);
            this._galleryBtn.setImageURI(uri);
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
            _this._isImageBtnVisible = true;
            _this.imageSource = _this.imgURI;
        });
    };
    CaptureComponent.prototype.performPerspectiveTransformation = function (filePath) {
        try {
            // this.wrappedImage = opencv.performPerspectiveTransformationForWrappedImage(filePath);
            // this.fileName = opencv.getFileName(filePath);
            // this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, 41);
            // let contourPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
            // try {
            // 	for (let i = 0; i < 10; i++) {
            // 		let contourImgFile: fs.File = fs.File.fromPath(contourPath + "/contourImage0" + i + ".jpg");
            // 		if (contourImgFile)
            // 			contourImgFile.remove();
            // 	}
            // } catch (e) {
            // 	alert('Couldnot delete contour image file');
            // }
            this.imgURI = opencv.performPerspectiveTransformation(filePath, '');
            // if (!this.imgURI) {
            // 	Toast.makeText("No rectangles were found. Please take correct picture.", "long").show();
            // }
            this.isBusy = false;
            // for (let i = 0; i < 10; i++) {
            // 	SendBroadcastImage(contourPath + "/contourImage0" + i + ".jpg");
            // }
            this.showCapturedPictureDialog(true, filePath, this.imgURI);
        }
        catch (err) {
            console.log(err);
            this.isBusy = false;
            alert('Error while performing perspective transformation process. Please retake picture');
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
        transformedimage_provider_1.ActivityLoader
        //	private _changeDetectionRef: ChangeDetectorRef
    ])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBOEc7QUFJOUcsOERBQTREO0FBRzVELG1EQUFxRDtBQUNyRCwwQ0FBNEM7QUFPNUMsa0VBQTJGO0FBQzNGLCtEQUEyRDtBQUczRCxvRkFBNEY7QUFDNUYsMENBQXlDO0FBRXpDLDBEQUE0RDtBQUM1RCxnQ0FBa0M7QUFlbEMsSUFBYSxnQkFBZ0I7SUE0QjVCLDBCQUNTLElBQVksRUFDWixZQUFnQyxFQUNoQyxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLGNBQThCO1FBQ3RDLGlEQUFpRDs7UUFMekMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7SUFHdkMsQ0FBQztJQUdELHFGQUFxRjtJQUNyRixpQ0FBaUM7SUFFakMsc0JBQXNCO0lBQ3RCLGtEQUFrRDtJQUNsRCw2Q0FBNkM7SUFDN0Msd0RBQXdEO0lBQ3hELGdEQUFnRDtJQUNoRCxJQUFJO0lBQ0osb0NBQW9DO0lBQ3BDLDZEQUE2RDtJQUM3RCxJQUFJO0lBRUoscURBQXFEO0lBQ3JELHlDQUF5QztJQUN6QyxJQUFJO0lBRUosMERBQTBEO0lBQzFELDBDQUEwQztJQUMxQyxJQUFJO0lBRUosMEJBQTBCO0lBQzFCLGlDQUFpQztJQUNqQyxJQUFJO0lBRUosdUNBQXVDO0lBQ3ZDLGtDQUFrQztJQUNsQyxJQUFJO0lBRUosd0JBQXdCO0lBQ3hCLDZCQUE2QjtJQUM3QixJQUFJO0lBRUosOEJBQThCO0lBQzlCLDhCQUE4QjtJQUM5QixJQUFJO0lBSUosbUNBQVEsR0FBUjtRQUNDLHlUQUF5VDtR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QUEwQjtLQUN2QyxDQUFDO3FDQStCYyxhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSwwQ0FBYztRQUN0QyxpREFBaUQ7O0dBbEN0QyxnQkFBZ0IsQ0Eya0I1QjtBQTNrQlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBFbGVtZW50UmVmLCBOZ1pvbmUsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tICdAbnN0dWRpby9uYXRpdmVzY3JpcHQtY2FtZXJhLXBsdXMnO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBJbWFnZUFzc2V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1hc3NldCc7XG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvaW1hZ2UnO1xuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgeyBTbGlkZXIgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9zbGlkZXJcIjtcbmltcG9ydCB7IE9ic2VydmFibGUsIFByb3BlcnR5Q2hhbmdlRGF0YSB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZVwiO1xuaW1wb3J0IHsgU3RhY2tMYXlvdXQgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9sYXlvdXRzL3N0YWNrLWxheW91dFwiO1xuaW1wb3J0IHsgR3JpZExheW91dCB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2xheW91dHMvZ3JpZC1sYXlvdXRcIjtcbmltcG9ydCB7IFZpZXcgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9jb3JlL3ZpZXdcIjtcbmltcG9ydCB7IFJvdGF0aW9uR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzXCI7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ1NlcnZpY2UsIE1vZGFsRGlhbG9nT3B0aW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2dcIjtcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tIFwiLi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnRcIjtcbmltcG9ydCB7IEltYWdlR2FsbGVyeUNvbXBvbmVudCB9IGZyb20gXCIuLi9pbWFnZWdhbGxlcnkvaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudFwiO1xuaW1wb3J0IHsga25vd25Gb2xkZXJzLCBGaWxlLCBGb2xkZXIgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbVwiO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IFN3aXRjaCB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL3N3aXRjaFwiO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb25cIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmaWxlLXN5c3RlbVwiO1xuXG4vL2ltcG9ydCB7IEFmdGVyVmlld0luaXQsIENoYW5nZURldGVjdG9yUmVmIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbi8vaW1wb3J0IHsgUmFkU2lkZURyYXdlckNvbXBvbmVudCB9IGZyb20gXCJuYXRpdmVzY3JpcHQtdWktc2lkZWRyYXdlci9hbmd1bGFyXCI7XG4vL2ltcG9ydCB7IFJhZFNpZGVEcmF3ZXIsIERyYXdlclRyYW5zaXRpb25CYXNlLCBQdXNoVHJhbnNpdGlvbiB9IGZyb20gJ25hdGl2ZXNjcmlwdC11aS1zaWRlZHJhd2VyJztcblxuZGVjbGFyZSB2YXIgYW5kcm9pZDogYW55XG5cbkBDb21wb25lbnQoe1xuXHRzZWxlY3RvcjogXCJucy1jYXB0dXJlXCIsXG5cdG1vZHVsZUlkOiBtb2R1bGUuaWQsXG5cdHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuXHR0ZW1wbGF0ZVVybDogXCIuL2NhcHR1cmUuY29tcG9uZW50Lmh0bWxcIixcbn0pXG5cbmV4cG9ydCBjbGFzcyBDYXB0dXJlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xuXHRwcml2YXRlIF9jYW06IGFueTtcblx0cHJpdmF0ZSBfaXNJbWFnZUJ0blZpc2libGU6IGFueTtcblx0cHJpdmF0ZSBfdHJhbnNmb3JtZWRGaWxlUGF0aDogYW55O1xuXHRwcml2YXRlIF9wYWdlOiBhbnk7XG5cdHByaXZhdGUgX2dhbGxlcnlCdG46IGFueTtcblx0cHJpdmF0ZSBfdGFrZVBpY0J0bjogYW55O1xuXHRwcml2YXRlIF9hdXRvZm9jdXNCdG46IGFueTtcblx0cHJpdmF0ZSBfZ2FsbGVyeVBhcmFtczogYW55O1xuXHRwcml2YXRlIF90YWtlUGljUGFyYW1zOiBhbnk7XG5cdHByaXZhdGUgX2F1dG9mb2N1c1BhcmFtczogYW55O1xuXHQvLyBwcml2YXRlIF9tYWluQ29udGVudFRleHQ6IHN0cmluZztcblx0cHJpdmF0ZSBfaXNBdXRvbWF0aWNDaGVja2VkOiBib29sZWFuO1xuXHQvLyBwcml2YXRlIF9zaWRlRHJhd2VyVHJhbnNpdGlvbjogRHJhd2VyVHJhbnNpdGlvbkJhc2U7XG5cblx0cHVibGljIGlzQ2FtZXJhVmlzaWJsZTogYW55O1xuXHRwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlO1xuXHRwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcblxuXHRwdWJsaWMgaW1nVVJJOiBhbnk7XG5cdHB1YmxpYyB3cmFwcGVkSW1hZ2U6IGFueTtcblx0cHVibGljIGZpbGVOYW1lOiBhbnk7XG5cdHB1YmxpYyBvcGVuY3ZJbnN0YW5jZTogYW55O1xuXHRwdWJsaWMgaW1nRW1wdHk6IGFueTtcblx0cHVibGljIGlzQnVzeTogYW55O1xuXG5cdHB1YmxpYyBzY3JlZW5IZWlnaHQ6IGFueTtcblxuXHRjb25zdHJ1Y3Rvcihcblx0XHRwcml2YXRlIHpvbmU6IE5nWm9uZSxcblx0XHRwcml2YXRlIG1vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLFxuXHRcdHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcblx0XHRwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuXHRcdHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyXG5cdFx0Ly9cdHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcblx0KSB7XG5cdH1cblxuXG5cdC8vIEBWaWV3Q2hpbGQoUmFkU2lkZURyYXdlckNvbXBvbmVudCkgcHVibGljIGRyYXdlckNvbXBvbmVudDogUmFkU2lkZURyYXdlckNvbXBvbmVudDtcblx0Ly8gcHJpdmF0ZSBkcmF3ZXI6IFJhZFNpZGVEcmF3ZXI7XG5cblx0Ly8gbmdBZnRlclZpZXdJbml0KCkge1xuXHQvLyBcdHRoaXMuZHJhd2VyID0gdGhpcy5kcmF3ZXJDb21wb25lbnQuc2lkZURyYXdlcjtcblx0Ly8gXHR0aGlzLl9jaGFuZ2VEZXRlY3Rpb25SZWYuZGV0ZWN0Q2hhbmdlcygpO1xuXHQvLyBcdC8vIHRoaXMuc2lkZURyYXdlclRyYW5zaXRpb24gPSBuZXcgUHVzaFRyYW5zaXRpb24oKTtcblx0Ly8gXHQvLyB0aGlzLl9jaGFuZ2VEZXRlY3Rpb25SZWYuZGV0ZWN0Q2hhbmdlcygpO1xuXHQvLyB9XG5cdC8vIHB1YmxpYyBvbkF1dG9tYXRpY0NoZWNrZWQoYXJncykge1xuXHQvLyBcdHRoaXMuX2lzQXV0b21hdGljQ2hlY2tlZCA9ICg8U3dpdGNoPmFyZ3Mub2JqZWN0KS5jaGVja2VkO1xuXHQvLyB9XG5cblx0Ly8gZ2V0IHNpZGVEcmF3ZXJUcmFuc2l0aW9uKCk6IERyYXdlclRyYW5zaXRpb25CYXNlIHtcblx0Ly8gICAgIHJldHVybiB0aGlzLl9zaWRlRHJhd2VyVHJhbnNpdGlvbjtcblx0Ly8gfVxuXG5cdC8vIHNldCBzaWRlRHJhd2VyVHJhbnNpdGlvbih2YWx1ZTogRHJhd2VyVHJhbnNpdGlvbkJhc2UpIHtcblx0Ly8gICAgIHRoaXMuX3NpZGVEcmF3ZXJUcmFuc2l0aW9uID0gdmFsdWU7XG5cdC8vIH1cblxuXHQvLyBnZXQgbWFpbkNvbnRlbnRUZXh0KCkge1xuXHQvLyBcdHJldHVybiB0aGlzLl9tYWluQ29udGVudFRleHQ7XG5cdC8vIH1cblxuXHQvLyBzZXQgbWFpbkNvbnRlbnRUZXh0KHZhbHVlOiBzdHJpbmcpIHtcblx0Ly8gXHR0aGlzLl9tYWluQ29udGVudFRleHQgPSB2YWx1ZTtcblx0Ly8gfVxuXG5cdC8vIHB1YmxpYyBvcGVuRHJhd2VyKCkge1xuXHQvLyBcdHRoaXMuZHJhd2VyLnNob3dEcmF3ZXIoKTtcblx0Ly8gfVxuXG5cdC8vIHB1YmxpYyBvbkNsb3NlRHJhd2VyVGFwKCkge1xuXHQvLyBcdHRoaXMuZHJhd2VyLmNsb3NlRHJhd2VyKCk7XG5cdC8vIH1cblxuXG5cblx0bmdPbkluaXQoKTogdm9pZCB7XG5cdFx0Ly8gdGhpcy5tYWluQ29udGVudFRleHQgPSBcIlNpZGVEcmF3ZXIgZm9yIE5hdGl2ZVNjcmlwdCBjYW4gYmUgZWFzaWx5IHNldHVwIGluIHRoZSBIVE1MIGRlZmluaXRpb24gb2YgeW91ciBfcGFnZSBieSBkZWZpbmluZyB0a0RyYXdlckNvbnRlbnQgYW5kIHRrTWFpbkNvbnRlbnQuIFRoZSBjb21wb25lbnQgaGFzIGEgZGVmYXVsdCB0cmFuc2l0aW9uIGFuZCBwb3NpdGlvbiBhbmQgYWxzbyBleHBvc2VzIG5vdGlmaWNhdGlvbnMgcmVsYXRlZCB0byBjaGFuZ2VzIGluIGl0cyBzdGF0ZS4gU3dpcGUgZnJvbSBsZWZ0IHRvIG9wZW4gc2lkZSBkcmF3ZXIuXCI7XG5cblx0XHRjb25zb2xlLmxvZyhcIkluaXRpYWxpemluZyBPcGVuQ1YuLi5cIik7XG5cdFx0dGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG5cblx0XHR0aGlzLmlzQ2FtZXJhVmlzaWJsZSA9IHRydWU7XG5cdFx0dGhpcy5faXNJbWFnZUJ0blZpc2libGUgPSBmYWxzZTtcblx0XHR0aGlzLmlzQnVzeSA9IGZhbHNlO1xuXHRcdHRoaXMuX2lzQXV0b21hdGljQ2hlY2tlZCA9IHRydWU7XG5cblx0XHR0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG5cdFx0dGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcblx0XHR0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG5cblx0fVxuXG5cdG5nT25EZXN0cm95KCkge1xuXHRcdGNvbnNvbGUubG9nKCdEZXN0cm95IGNhbGxlZC4uLicpO1xuXHR9XG5cblx0Y2FtTG9hZGVkKGU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKCcqKioqKiBfY2FtIGxvYWRlZCAqKioqKicpO1xuXHRcdHRoaXMuaXNCdXN5ID0gZmFsc2U7XG5cdFx0dGhpcy5fY2FtID0gZS5vYmplY3QgYXMgQ2FtZXJhUGx1cztcblxuXHRcdGxldCBmbGFzaE1vZGUgPSB0aGlzLl9jYW0uZ2V0Rmxhc2hNb2RlKCk7XG5cblx0XHQvLyBUdXJuIGZsYXNoIG9uIGF0IHN0YXJ0dXBcblx0XHRpZiAoZmxhc2hNb2RlID09ICdvZmYnKSB7XG5cdFx0XHR0aGlzLl9jYW0udG9nZ2xlRmxhc2goKTtcblx0XHR9XG5cdFx0bGV0IGNiID0gbmV3IGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLkF1dG9Gb2N1c01vdmVDYWxsYmFjayhcblxuXHRcdFx0e1xuXHRcdFx0XHRfdGhpczogdGhpcyxcblx0XHRcdFx0b25BdXRvRm9jdXNNb3Zpbmc6IGZ1bmN0aW9uIChzdGFydCwgY2FtZXJhKSB7XG5cdFx0XHRcdFx0bGV0IGFuaW1hdGUgPSB0aGlzLl90aGlzLl9hdXRvZm9jdXNCdG4uYW5pbWF0ZSgpO1xuXHRcdFx0XHRcdGlmICghc3RhcnQpIHtcblx0XHRcdFx0XHRcdGFuaW1hdGUuc2NhbGVYKDEpO1xuXHRcdFx0XHRcdFx0YW5pbWF0ZS5zY2FsZVkoMSk7XG5cdFx0XHRcdFx0XHRsZXQgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoXCIjMDA4MDAwXCIpOyAvL0dyZWVuIGNvbG9yICAgICAgICAgICBcblx0XHRcdFx0XHRcdHRoaXMuX3RoaXMuX2F1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFuaW1hdGUuc2NhbGVYKDAuNTApO1xuXHRcdFx0XHRcdFx0YW5pbWF0ZS5zY2FsZVkoMC41MCk7XG5cdFx0XHRcdFx0XHRhbmltYXRlLnNldER1cmF0aW9uKDEwMCk7XG5cblx0XHRcdFx0XHRcdGxldCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcihcIiNmZjAwMDBcIik7IC8vIFJlZCBjb2xvclxuXHRcdFx0XHRcdFx0dGhpcy5fdGhpcy5fYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblxuXHRcdFx0XHRcdFx0YW5pbWF0ZS5zdGFydCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0aWYgKHRoaXMuX2NhbS5jYW1lcmEpIHtcblx0XHRcdHRoaXMuX2NhbS5jYW1lcmEuc2V0QXV0b0ZvY3VzTW92ZUNhbGxiYWNrKGNiKTtcblx0XHR9XG5cdFx0aWYgKGUuZGF0YSkge1xuXG5cdFx0XHR0aGlzLl9jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG5cblx0XHRcdHRoaXMuX2NhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcblx0XHRcdFx0dGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdHRoaXMuX3Rha2VQaWNCdG4gPSBudWxsO1xuXHRcdFx0XHR0aGlzLl9nYWxsZXJ5QnRuID0gbnVsbDtcblx0XHRcdFx0dGhpcy5fYXV0b2ZvY3VzQnRuID0gbnVsbDtcblx0XHRcdFx0dGhpcy5fdGFrZVBpY1BhcmFtcyA9IG51bGw7XG5cdFx0XHRcdHRoaXMuX2dhbGxlcnlQYXJhbXMgPSBudWxsO1xuXHRcdFx0XHR0aGlzLl9hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuXHRcdFx0XHR0aGlzLl9jYW0uc2hvd1RvZ2dsZUljb24gPSB0cnVlO1xuXG5cdFx0XHRcdHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcblx0XHRcdFx0dGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcblx0XHRcdFx0dGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuXHRcdFx0XHR0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcblx0XHRcdFx0dGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuX2NhbS5faW5pdEZsYXNoQnV0dG9uKCk7XG5cdFx0XHRcdHRoaXMuX2NhbS5faW5pdFRvZ2dsZUNhbWVyYUJ1dHRvbigpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIFRFU1QgVEhFIElDT05TIFNIT1dJTkcvSElESU5HXG5cdFx0Ly90aGlzLl9jYW0uc2hvd0NhcHR1cmVJY29uID0gdHJ1ZTtcblx0XHQvL3RoaXMuX2NhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcblx0XHQvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG5cdFx0Ly8gdGhpcy5jYW1lcmFQbHVzLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG5cdH1cblx0aW5pdENhbWVyYUJ1dHRvbigpIHtcblx0XHR0aGlzLl9jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuX3Rha2VQaWNCdG4pO1xuXHRcdHRoaXMuX2NhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5fdGFrZVBpY0J0biwgdGhpcy5fdGFrZVBpY1BhcmFtcyk7XG5cdH1cblxuXHRpbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuXHRcdHRoaXMuX2NhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5fZ2FsbGVyeUJ0bik7XG5cdFx0dGhpcy5fY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLl9nYWxsZXJ5QnRuLCB0aGlzLl9nYWxsZXJ5UGFyYW1zKTtcblx0XHR0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5fZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcblx0fTtcblx0aW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuXHRcdHRoaXMuX2NhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5fYXV0b2ZvY3VzQnRuKTtcblx0XHR0aGlzLl9jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuX2F1dG9mb2N1c0J0biwgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zKTtcblx0fTtcblx0Y3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKSB7XG5cdFx0bGV0IF90aGlzID0gdGhpcztcblx0XHR0aGlzLl90YWtlUGljQnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuXHRcdHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLl90YWtlUGljQnRuLCAnaWNfY2FtZXJhJyk7XG5cdFx0Ly8gbGV0IHRha2VQaWNEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfY2FtZXJhJyk7XG5cdFx0Ly8gdGhpcy5fdGFrZVBpY0J0bi5zZXRJbWFnZVJlc291cmNlKHRha2VQaWNEcmF3YWJsZSk7XG5cdFx0bGV0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG5cdFx0dGhpcy5fdGFrZVBpY0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuXHRcdGxldCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcihcIiNmZmZmZmZcIik7IC8vIHdoaXRlIGNvbG9yXG5cdFx0dGhpcy5fdGFrZVBpY0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cdFx0Ly8gdGhpcy5fdGFrZVBpY0J0bi5zZXRTY2FsZVgoMC41MCk7XG5cdFx0Ly8gdGhpcy5fdGFrZVBpY0J0bi5zZXRTY2FsZVkoMC41MCk7XG5cdFx0dGhpcy5fdGFrZVBpY0J0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG5cdFx0XHRvbkNsaWNrOiBmdW5jdGlvbiAoYXJncykge1xuXHRcdFx0XHRfdGhpcy50YWtlUGljRnJvbUNhbShfdGhpcyk7XG5cblx0XHRcdH1cblx0XHR9KSk7XG5cdFx0dGhpcy5jcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpXG5cdH1cblxuXHRjcmVhdGVBdXRvRm9jdXNJbWFnZSgpIHtcblx0XHRsZXQgX3RoaXMgPSB0aGlzO1xuXHRcdHRoaXMuX2F1dG9mb2N1c0J0biA9IHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcblx0XHR0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5fYXV0b2ZvY3VzQnRuLCAnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuXG5cdFx0Ly8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcblx0XHQvLyB0aGlzLl9hdXRvZm9jdXNCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblx0XHRsZXQgc2hhcGUgPSB0aGlzLmNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk7XG5cdFx0dGhpcy5fYXV0b2ZvY3VzQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG5cdFx0dGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpO1xuXHR9XG5cblx0Y3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTogYW55IHtcblx0XHRsZXQgYnRuID0gbmV3IGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldyhhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuXHRcdGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcblx0XHRidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG5cdFx0YnRuLnNldE1heFdpZHRoKDE1OCk7XG5cdFx0YnRuLnNldFNjYWxlVHlwZShhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcuU2NhbGVUeXBlLkNFTlRFUl9DUk9QKTtcblx0XHRsZXQgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoXCIjMDA4MDAwXCIpOyAvLyBHcmVlbiBjb2xvclxuXHRcdGJ0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cdFx0cmV0dXJuIGJ0bjtcblx0fVxuXG5cdGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcblx0XHRsZXQgX3RoaXMgPSB0aGlzO1xuXHRcdHRoaXMuX2dhbGxlcnlCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG5cdFx0dGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuX2dhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cblx0XHQvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuXHRcdC8vIHRoaXMuX2dhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuXHRcdGxldCBnYWxsZXJ5QnRuSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UmVzb3VyY2VzKCkuZ2V0SWRlbnRpZmllcihcImdhbGxlcnlfYnRuXCIsIFwiaWRcIiwgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXG5cdFx0dGhpcy5fZ2FsbGVyeUJ0bi5zZXRUYWcoZ2FsbGVyeUJ0bklkLCAnZ2FsbGVyeS1idG4tdGFnJyk7XG5cdFx0dGhpcy5fZ2FsbGVyeUJ0bi5zZXRDb250ZW50RGVzY3JpcHRpb24oJ2dhbGxlcnktYnRuLWRlYycpO1xuXHRcdGxldCBzaGFwZSA9IHRoaXMuY3JlYXRlVHJhbnNwYXJlbnRDaXJjbGVEcmF3YWJsZSgpO1xuXHRcdHRoaXMuX2dhbGxlcnlCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcblx0XHR0aGlzLl9nYWxsZXJ5QnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcblx0XHRcdG9uQ2xpY2s6IGZ1bmN0aW9uIChhcmdzKSB7XG5cdFx0XHRcdF90aGlzLmdvSW1hZ2VHYWxsZXJ5KCk7XG5cdFx0XHR9XG5cdFx0fSkpO1xuXHRcdHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpO1xuXHR9XG5cblxuXHRnZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTogYW55IHtcblx0XHRsZXQgZHJhd2FibGVJZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dFxuXHRcdFx0LmdldFJlc291cmNlcygpXG5cdFx0XHQuZ2V0SWRlbnRpZmllcihpY29uTmFtZSwgJ2RyYXdhYmxlJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXHRcdHJldHVybiBkcmF3YWJsZUlkO1xuXHR9XG5cdGNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTogYW55IHtcblx0XHRsZXQgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5HcmFkaWVudERyYXdhYmxlKCk7XG5cdFx0c2hhcGUuc2V0Q29sb3IoMHg5OTAwMDAwMCk7XG5cdFx0c2hhcGUuc2V0Q29ybmVyUmFkaXVzKDk2KTtcblx0XHRzaGFwZS5zZXRBbHBoYSgxNTApO1xuXHRcdHJldHVybiBzaGFwZTtcblx0fVxuXHRjcmVhdGVBdXRvZm9jdXNTaGFwZSgpOiBhbnkge1xuXG5cdFx0bGV0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuU2hhcGVEcmF3YWJsZSgpO1xuXHRcdHNoYXBlLnNldEFscGhhKDApO1xuXHRcdHJldHVybiBzaGFwZTtcblxuXHR9XG5cdGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG5cdFx0bGV0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuXHRcdGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcblx0XHRidG4uc2V0TWF4SGVpZ2h0KDU4KTtcblx0XHRidG4uc2V0TWF4V2lkdGgoNTgpO1xuXHRcdHJldHVybiBidG47XG5cdH1cblxuXHRpbWFnZXNTZWxlY3RlZEV2ZW50KGU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKCdJTUFHRVMgU0VMRUNURUQgRVZFTlQhISEnKTtcblx0XHR0aGlzLmxvYWRJbWFnZSgoZS5kYXRhIGFzIEltYWdlQXNzZXRbXSlbMF0pO1xuXHR9XG5cblx0cGhvdG9DYXB0dXJlZEV2ZW50KGU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKCdQSE9UTyBDQVBUVVJFRCBFVkVOVCEhIScpO1xuXHRcdHRoaXMubG9hZEltYWdlKGUuZGF0YSBhcyBJbWFnZUFzc2V0KTtcblx0fVxuXG5cdHRvZ2dsZUNhbWVyYUV2ZW50KGU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnNvbGUubG9nKFwiY2FtZXJhIHRvZ2dsZWRcIik7XG5cdH1cblxuXHRyZWNvcmREZW1vVmlkZW8oKTogdm9pZCB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnNvbGUubG9nKGAqKiogc3RhcnQgcmVjb3JkaW5nICoqKmApO1xuXHRcdFx0dGhpcy5fY2FtLnJlY29yZCgpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc29sZS5sb2coZXJyKTtcblx0XHR9XG5cdH1cblxuXHRzdG9wUmVjb3JkaW5nRGVtb1ZpZGVvKCk6IHZvaWQge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zb2xlLmxvZyhgKioqIHN0b3AgcmVjb3JkaW5nICoqKmApO1xuXHRcdFx0dGhpcy5fY2FtLnN0b3AoKTtcblx0XHRcdGNvbnNvbGUubG9nKGAqKiogYWZ0ZXIgdGhpcy5fY2FtLnN0b3AoKSAqKipgKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0fVxuXHR9XG5cblx0dG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcblx0XHR0aGlzLl9jYW0udG9nZ2xlRmxhc2goKTtcblx0fVxuXG5cdHRvZ2dsZVNob3dpbmdGbGFzaEljb24oKTogdm9pZCB7XG5cdFx0Y29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuX2NhbS5zaG93Rmxhc2hJY29ufWApO1xuXHRcdHRoaXMuX2NhbS5zaG93Rmxhc2hJY29uID0gIXRoaXMuX2NhbS5zaG93Rmxhc2hJY29uO1xuXHR9XG5cblx0dG9nZ2xlVGhlQ2FtZXJhKCk6IHZvaWQge1xuXHRcdHRoaXMuX2NhbS50b2dnbGVDYW1lcmEoKTtcblx0fVxuXG5cdG9wZW5DYW1QbHVzTGlicmFyeSgpOiB2b2lkIHtcblx0XHR0aGlzLl9jYW0uY2hvb3NlRnJvbUxpYnJhcnkoKTtcblx0fVxuXG5cdHRha2VQaWNGcm9tQ2FtKF90aGlzKTogdm9pZCB7XG5cdFx0X3RoaXMuaXNCdXN5ID0gdHJ1ZTtcblx0XHRfdGhpcy5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG5cdFx0X3RoaXMuX2NhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG5cblxuXHRcdHRoaXMuaW1nVVJJID0gJyc7XG5cdFx0dGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG5cdH1cblxuXHRnb0ltYWdlR2FsbGVyeSgpIHtcblx0XHR0aGlzLnJvdXRlci5uYXZpZ2F0ZShbXCJpbWFnZWdhbGxlcnlcIl0pO1xuXHR9XG5cblx0c2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyhmdWxsc2NyZWVuOiBib29sZWFuLCBmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZykge1xuXHRcdGxldCBvcHRpb25zOiBNb2RhbERpYWxvZ09wdGlvbnMgPSB7XG5cdFx0XHRjb250ZXh0OiB7XG5cdFx0XHRcdGltYWdlU291cmNlOiBpbWdVUkksXG5cdFx0XHRcdGltYWdlU291cmNlT3JnOiBmaWxlUGF0aE9yZyxcblx0XHRcdFx0aXNBdXRvQ29ycmVjdGlvbjogdHJ1ZSAvL3RoaXMuX2lzQXV0b21hdGljQ2hlY2tlZFxuXHRcdFx0fSxcblx0XHRcdGZ1bGxzY3JlZW46IGZ1bGxzY3JlZW4sXG5cdFx0XHR2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZpZXdDb250YWluZXJSZWZcblx0XHR9O1xuXHRcdHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuXHRcdHRoaXMubW9kYWxTZXJ2aWNlLnNob3dNb2RhbChEaWFsb2dDb250ZW50LCBvcHRpb25zKVxuXHRcdFx0LnRoZW4oKGRpYWxvZ1Jlc3VsdDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGlmIChkaWFsb2dSZXN1bHQpIHtcblx0XHRcdFx0XHQvLyBsZXQgZGlsb2dSZXN1bHRUZW1wID0gZGlhbG9nUmVzdWx0O1xuXHRcdFx0XHRcdC8vIGlmIChkaWFsb2dSZXN1bHQuaW5kZXhPZihcIl9URU1QXCIpID4gMCkge1xuXHRcdFx0XHRcdC8vIFx0Zm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcblx0XHRcdFx0XHQvLyBcdFx0ZGlsb2dSZXN1bHRUZW1wID0gZGlsb2dSZXN1bHRUZW1wLnJlcGxhY2UoXCJfVEVNUFwiICsgaSwgXCJcIik7XG5cdFx0XHRcdFx0Ly8gXHR9XG5cdFx0XHRcdFx0Ly8gfVxuXHRcdFx0XHRcdHRoaXMuc2V0VHJhbnNmb3JtZWRJbWFnZShkaWFsb2dSZXN1bHQpO1xuXHRcdFx0XHRcdHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcblx0XHRcdFx0XHR0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgZGlhbG9nUmVzdWx0LCBcIkFkZFwiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0bGV0IGltZ0ZpbGVPcmc6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGZpbGVQYXRoT3JnKTtcblxuXHRcdFx0XHRcdFx0aWYgKGltZ0ZpbGVPcmcpXG5cdFx0XHRcdFx0XHRcdGltZ0ZpbGVPcmcucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRsZXQgaW1nVVJJRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVVJJKTtcblx0XHRcdFx0XHRcdGlmIChpbWdVUklGaWxlKVxuXHRcdFx0XHRcdFx0XHRpbWdVUklGaWxlLnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0dGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGltZ1VSSSwgXCJSZW1vdmVcIik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0YWxlcnQoJ0NvdWxkbm90IGRlbGV0ZSB0aGUgZmlsZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0fVxuXG5cdHNldFRyYW5zZm9ybWVkSW1hZ2UoaW1nVVJJUGFyYW0pIHtcblx0XHRpZiAoaW1nVVJJUGFyYW0pIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5pbWdVUkkgPSBpbWdVUklQYXJhbTtcblx0XHRcdFx0dGhpcy5pbWFnZVNvdXJjZSA9IGltZ1VSSVBhcmFtO1xuXHRcdFx0XHRTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWdVUkkpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRUb2FzdC5tYWtlVGV4dChcIkVycm9yIHdoaWxlIHNldHRpbmcgaW1hZ2UgaW4gcHJldmlldyBhcmVhXCIgKyBlLCBcImxvbmdcIikuc2hvdygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIGhhbmRsZSB2YWx1ZSBjaGFuZ2Vcblx0b25TbGlkZXJMb2FkZWQoYXJncyk6IHZvaWQge1xuXHRcdGNvbnN0IHNsaWRlckNvbXBvbmVudDogU2xpZGVyID0gPFNsaWRlcj5hcmdzLm9iamVjdDtcblx0XHRzbGlkZXJDb21wb25lbnQub24oXCJ2YWx1ZUNoYW5nZVwiLCAoc2FyZ3MpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKFwiU2xpZGVyVmFsdWU6IFwiICsgKDxTbGlkZXI+c2FyZ3Mub2JqZWN0KS52YWx1ZSk7XG5cdFx0XHR2YXIgdGhyZXNob2xkVmFsdWUgPSAoPFNsaWRlcj5zYXJncy5vYmplY3QpLnZhbHVlO1xuXHRcdFx0aWYgKHRocmVzaG9sZFZhbHVlICUgMiA9PSAwKSB7XG5cdFx0XHRcdHRocmVzaG9sZFZhbHVlKys7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IGZhbHNlO1xuXG5cdFx0XHR0aGlzLnBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aHJlc2hvbGRWYWx1ZSwgc2FyZ3MpO1xuXHRcdH0pO1xuXHR9XG5cdG9uUGFnZUxvYWRlZChhcmdzKSB7XG5cdFx0dGhpcy5fcGFnZSA9IDxQYWdlPmFyZ3Mub2JqZWN0O1xuXG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuXHRcdHRoaXMuX3Rha2VQaWNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG5cdFx0Ly8gaWYgKHRoaXMuX2NhbS5pbnNldEJ1dHRvbnMgPT09IHRydWUpIHtcblx0XHQvLyB2YXIgbGF5b3V0SGVpZ2h0ID0gdGhpcy5fY2FtLl9uYXRpdmVWaWV3LmdldEhlaWdodCgpO1xuXHRcdC8vIGNvbnNvbGUubG9nKFwibGF5b3V0SGVpZ2h0ID0gXCIgKyBsYXlvdXRIZWlnaHQpO1xuXHRcdC8vIHZhciB5TWFyZ2luID0gbGF5b3V0SGVpZ2h0ICogMC4xO1xuXHRcdC8vIHRoaXMuX3Rha2VQaWNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCB5TWFyZ2luKTtcblx0XHQvLyB9XG5cdFx0Ly8gZWxzZSB7XG5cdFx0dGhpcy5fdGFrZVBpY1BhcmFtcy53aWR0aCA9IFwiMTAwXCI7XG5cdFx0dGhpcy5fdGFrZVBpY1BhcmFtcy5oZWlnaHQgPSBcIjEwMFwiO1xuXHRcdHRoaXMuX3Rha2VQaWNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcblx0XHQvLyB9XG5cdFx0dGhpcy5fdGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTsgLy9BTElHTl9QQVJFTlRfQk9UVE9NXG5cdFx0dGhpcy5fdGFrZVBpY1BhcmFtcy5hZGRSdWxlKDExKTsgLy9IT1JJWk9OVEFMX0NFTlRFUlxuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcblx0XHR0aGlzLl9hdXRvZm9jdXNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG5cdFx0Ly8gaWYgKHRoaXMuaW5zZXRCdXR0b25zID09PSB0cnVlKSB7XG5cdFx0Ly8gdmFyIGxheW91dFdpZHRoID0gdGhpcy5fY2FtLl9uYXRpdmVWaWV3LmdldFdpZHRoKCk7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJsYXlvdXRXaWR0aCA9IFwiICsgbGF5b3V0V2lkdGgpO1xuXHRcdC8vIHZhciB4TWFyZ2luID0gbGF5b3V0V2lkdGggKiAwLjE7XG5cdFx0Ly8gdmFyIGxheW91dEhlaWdodCA9IHRoaXMuX2NhbS5fbmF0aXZlVmlldy5nZXRIZWlnaHQoKTtcblx0XHQvLyBjb25zb2xlLmxvZyhcImxheW91dEhlaWdodCA9IFwiICsgbGF5b3V0SGVpZ2h0KTtcblx0XHQvLyB2YXIgeU1hcmdpbiA9IGxheW91dEhlaWdodCAqIDAuMTtcblx0XHR0aGlzLl9hdXRvZm9jdXNQYXJhbXMud2lkdGggPSBcIjMwMFwiO1xuXHRcdHRoaXMuX2F1dG9mb2N1c1BhcmFtcy5oZWlnaHQgPSBcIjMwMFwiO1xuXHRcdC8vX2dhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyh4TWFyZ2luLCAxOCwgMTgsIHlNYXJnaW4pO1xuXHRcdHRoaXMuX2F1dG9mb2N1c1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuXHRcdC8vIH1cblx0XHR0aGlzLl9hdXRvZm9jdXNQYXJhbXMuYWRkUnVsZSgxMyk7IC8vQUxJR05fUEFSRU5UX0NFTlRFUlxuXHR9XG5cblx0cHJpdmF0ZSBzZXRJbWFnZVJlc291cmNlKGJ0biwgaWNvbk5hbWUpIHtcblx0XHRsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZShpY29uTmFtZSk7XG5cdFx0YnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cdH1cblxuXHRwcml2YXRlIGNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKSB7XG5cdFx0dGhpcy5fZ2FsbGVyeVBhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcblx0XHQvLyBpZiAodGhpcy5pbnNldEJ1dHRvbnMgPT09IHRydWUpIHtcblx0XHQvLyB2YXIgbGF5b3V0V2lkdGggPSB0aGlzLl9jYW0uX25hdGl2ZVZpZXcuZ2V0V2lkdGgoKTtcblx0XHQvLyBjb25zb2xlLmxvZyhcImxheW91dFdpZHRoID0gXCIgKyBsYXlvdXRXaWR0aCk7XG5cdFx0Ly8gdmFyIHhNYXJnaW4gPSBsYXlvdXRXaWR0aCAqIDAuMTtcblx0XHQvLyB2YXIgbGF5b3V0SGVpZ2h0ID0gdGhpcy5fY2FtLl9uYXRpdmVWaWV3LmdldEhlaWdodCgpO1xuXHRcdC8vIGNvbnNvbGUubG9nKFwibGF5b3V0SGVpZ2h0ID0gXCIgKyBsYXlvdXRIZWlnaHQpO1xuXHRcdC8vIHZhciB5TWFyZ2luID0gbGF5b3V0SGVpZ2h0ICogMC4xO1xuXHRcdHRoaXMuX2dhbGxlcnlQYXJhbXMud2lkdGggPSBcIjEwMFwiO1xuXHRcdHRoaXMuX2dhbGxlcnlQYXJhbXMuaGVpZ2h0ID0gXCIxMDBcIjtcblx0XHQvLyB0aGlzLl9nYWxsZXJ5UGFyYW1zLnNldE1hcmdpbnMoeE1hcmdpbiwgOCwgOCwgeU1hcmdpbik7XG5cdFx0dGhpcy5fZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuXHRcdC8vIH1cblx0XHQvLyBlbHNlIHtcblx0XHQvLyAgICAgX2dhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcblx0XHQvLyB9XG5cdFx0dGhpcy5fZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDEyKTsgLy9BTElHTl9QQVJFTlRfQk9UVE9NXG5cdFx0dGhpcy5fZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDkpOyAvL0FMSUdOX1BBUkVOVF9MRUZUXG5cdH1cblxuXHRwcml2YXRlIHJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpIHtcblx0XHR0cnkge1xuXHRcdFx0U2VuZEJyb2FkY2FzdEltYWdlKGZpbGVQYXRoT3JnKTtcblx0XHRcdFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpO1xuXHRcdFx0aWYgKGFjdGlvbiA9PSBcIkFkZFwiKSB7IC8vIHRoaXMgdGh1bWJuYWlsIGltYWdlIHdpbGwgYmUgYXZhaWxhYmxlIG9ubHkgaW4gJ0FkZCcgY2FzZS5cblx0XHRcdFx0bGV0IHRodW1uYWlsT3JnUGF0aCA9IGltZ1VSSS5yZXBsYWNlKCdQVF9JTUcnLCAndGh1bWJfUFRfSU1HJyk7XG5cdFx0XHRcdFNlbmRCcm9hZGNhc3RJbWFnZSh0aHVtbmFpbE9yZ1BhdGgpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGFsZXJ0KCdDb3VsZCBub3Qgc3luYyB0aGUgZmlsZSAnKTtcblx0XHR9XG5cdH1cblx0cHJpdmF0ZSBjcmVhdGVUaHVtYk5haWxJbWFnZShpbWdVUkk6IHN0cmluZyk6IGFueSB7XG5cdFx0dHJ5IHtcblx0XHRcdGxldCB0aHVtYm5haWxJbWFnZVBhdGggPSBvcGVuY3YuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcblx0XHRcdC8vIHZhciB0aHVtYm5haWxJbWFnZVBhdGggPSBjb20ubWFhcy5vcGVuY3Y0bmF0aXZlc2NyaXB0Lk9wZW5DVlV0aWxzLmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG5cdFx0XHQvL2NvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuXHRcdFx0bGV0IHVyaSA9IGFuZHJvaWQubmV0LlVyaS5wYXJzZShcImZpbGU6Ly9cIiArIHRodW1ibmFpbEltYWdlUGF0aCk7XG5cdFx0XHR0aGlzLl9nYWxsZXJ5QnRuLnNldEltYWdlVVJJKHVyaSk7XG5cdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0Y29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIGNyZWF0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIGUpO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlLCBzYXJncyk6IHZvaWQge1xuXHRcdHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuXHRcdFx0dGhpcy5pbWdFbXB0eSA9IHRoaXMuaW1nVVJJICsgXCI/dHM9XCIgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuXHRcdH0pO1xuXHRcdHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuXHRcdFx0dGhpcy5pbWdVUkkgPSBvcGVuY3YucGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRoaXMud3JhcHBlZEltYWdlLCB0aGlzLmZpbGVOYW1lLCB0aHJlc2hvbGRWYWx1ZSk7XG5cdFx0XHR0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG5cdFx0XHR0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG5cdFx0fSk7XG5cdH1cblx0cHJpdmF0ZSBwZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aCk6IHZvaWQge1xuXHRcdHRyeSB7XG5cdFx0XHQvLyB0aGlzLndyYXBwZWRJbWFnZSA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbkZvcldyYXBwZWRJbWFnZShmaWxlUGF0aCk7XG5cdFx0XHQvLyB0aGlzLmZpbGVOYW1lID0gb3BlbmN2LmdldEZpbGVOYW1lKGZpbGVQYXRoKTtcblx0XHRcdC8vIHRoaXMuaW1nVVJJID0gb3BlbmN2LnBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aGlzLndyYXBwZWRJbWFnZSwgdGhpcy5maWxlTmFtZSwgNDEpO1xuXG5cdFx0XHQvLyBsZXQgY29udG91clBhdGggPSBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpLmdldEFic29sdXRlUGF0aCgpO1xuXHRcdFx0Ly8gdHJ5IHtcblxuXHRcdFx0Ly8gXHRmb3IgKGxldCBpID0gMDsgaSA8IDEwOyBpKyspIHtcblx0XHRcdC8vIFx0XHRsZXQgY29udG91ckltZ0ZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGNvbnRvdXJQYXRoICsgXCIvY29udG91ckltYWdlMFwiICsgaSArIFwiLmpwZ1wiKTtcblx0XHRcdC8vIFx0XHRpZiAoY29udG91ckltZ0ZpbGUpXG5cdFx0XHQvLyBcdFx0XHRjb250b3VySW1nRmlsZS5yZW1vdmUoKTtcblx0XHRcdC8vIFx0fVxuXHRcdFx0Ly8gfSBjYXRjaCAoZSkge1xuXHRcdFx0Ly8gXHRhbGVydCgnQ291bGRub3QgZGVsZXRlIGNvbnRvdXIgaW1hZ2UgZmlsZScpO1xuXHRcdFx0Ly8gfVxuXHRcdFx0dGhpcy5pbWdVUkkgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgsICcnKTtcblxuXHRcdFx0Ly8gaWYgKCF0aGlzLmltZ1VSSSkge1xuXHRcdFx0Ly8gXHRUb2FzdC5tYWtlVGV4dChcIk5vIHJlY3RhbmdsZXMgd2VyZSBmb3VuZC4gUGxlYXNlIHRha2UgY29ycmVjdCBwaWN0dXJlLlwiLCBcImxvbmdcIikuc2hvdygpO1xuXHRcdFx0Ly8gfVxuXHRcdFx0dGhpcy5pc0J1c3kgPSBmYWxzZTtcblxuXHRcdFx0Ly8gZm9yIChsZXQgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHQvLyBcdFNlbmRCcm9hZGNhc3RJbWFnZShjb250b3VyUGF0aCArIFwiL2NvbnRvdXJJbWFnZTBcIiArIGkgKyBcIi5qcGdcIik7XG5cdFx0XHQvLyB9XG5cdFx0XHR0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0XHR0aGlzLmlzQnVzeSA9IGZhbHNlO1xuXHRcdFx0YWxlcnQoJ0Vycm9yIHdoaWxlIHBlcmZvcm1pbmcgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gcHJvY2Vzcy4gUGxlYXNlIHJldGFrZSBwaWN0dXJlJyk7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSBsb2FkSW1hZ2UoaW1hZ2VBc3NldDogSW1hZ2VBc3NldCk6IHZvaWQge1xuXHRcdGlmIChpbWFnZUFzc2V0KSB7XG5cdFx0XHR0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG5cblx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UuZnJvbUFzc2V0KGltYWdlQXNzZXQpLnRoZW4oXG5cdFx0XHRcdChpbWdTcmMpID0+IHtcblx0XHRcdFx0XHRpZiAoaW1nU3JjKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnpvbmUucnVuKCgpID0+IHtcblx0XHRcdFx0XHRcdFx0dmFyIGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmltZ1VSSSA9ICcnO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChmcC5pbmRleE9mKCcucG5nJykgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5pbWdVUkkgPSBmcDtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5pbWdVUkkgPSAnJztcblxuXHRcdFx0XHRcdFx0XHRcdHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLmltYWdlU291cmNlID0gbnVsbDtcblx0XHRcdFx0XHRcdGFsZXJ0KCdJbWFnZSBzb3VyY2UgaXMgYmFkLicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0KGVycikgPT4ge1xuXHRcdFx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoZXJyKTtcblx0XHRcdFx0XHRhbGVydCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldCcpO1xuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUubG9nKCdJbWFnZSBBc3NldCB3YXMgbnVsbCcpXG5cdFx0XHRhbGVydCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnKTtcblx0XHRcdHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuXHRcdH1cblx0fVxufVxuIl19