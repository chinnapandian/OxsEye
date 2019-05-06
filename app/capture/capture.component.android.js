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
var router_1 = require("@angular/router");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var image_source_1 = require("tns-core-modules/image-source");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var dialog_component_1 = require("../dialog/dialog.component");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var angular_1 = require("nativescript-i18n/angular");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
var application = require("tns-core-modules/application");
/**
 * Capture component class, which is being used to capture image from camera.
 */
var CaptureComponent = (function () {
    /**
     * Constructor for CaptureComponent.
     *
     * @param zone Angular zone to run a task asynchronously.
     * @param modalService Service modal
     * @param viewContainerRef View container referrence
     * @param router Router
     * @param activityLoader Activity loader indication
     */
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader, 
        // private _changeDetectionRef: ChangeDetectorRef
        logger) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
        this.logger = logger;
        /** Empty string variable */
        this.empty = null;
        /** Transformed Image source */
        this.imageSource = new image_source_1.ImageSource();
        this.locale = new angular_1.L();
    }
    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    CaptureComponent.prototype.ngOnInit = function () {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        // this._isImageBtnVisible = false;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createAutoFocusImage();
    };
    /**
     * This method is called when camera is loaded, where all the neccessary things like
     * displaying buttons(takePicture, gallery, flash, camera & autoFocus) on camera view
     * are taken care and also initializes camera instance.
     *
     * @param args CameraPlus instance referrence.
     */
    CaptureComponent.prototype.camLoaded = function (args) {
        this.saveBtnLable = this.locale.transform('save');
        this.manualBtnLable = this.locale.transform('manual');
        this.retakeBtnLable = this.locale.transform('retake');
        this.performBtnLable = this.locale.transform('perform');
        this.cam = args.object;
        var flashMode = this.cam.getFlashMode();
        // Turn flash on at startup
        if (flashMode === 'on') {
            this.cam.toggleFlash();
        }
        var cb = new android.hardware.Camera.AutoFocusMoveCallback({
            _this: this,
            onAutoFocusMoving: function (start, camera) {
                var animate = this._this.autofocusBtn.animate();
                if (!start) {
                    animate.scaleX(1);
                    animate.scaleY(1);
                    // Green color
                    var color = android.graphics.Color.parseColor('#008000');
                    this._this.autofocusBtn.setColorFilter(color);
                }
                else {
                    animate.scaleX(0.50);
                    animate.scaleY(0.50);
                    animate.setDuration(100);
                    // Red color
                    var color = android.graphics.Color.parseColor('#ff0000');
                    this._this.autofocusBtn.setColorFilter(color);
                    animate.start();
                }
            },
        });
        if (this.cam.camera) {
            this.cam.camera.setAutoFocusMoveCallback(cb);
        }
        if (args.data) {
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
        // this.cam.showCaptureIcon = true;
        // this.cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    /**
     * This method initializes camera button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    CaptureComponent.prototype.initCameraButton = function () {
        this.cam.nativeView.removeView(this.takePicBtn);
        this.cam.nativeView.addView(this.takePicBtn, this.takePicParams);
    };
    /**
     * This method initializes gallery button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this.cam.nativeView.removeView(this.galleryBtn);
        this.cam.nativeView.addView(this.galleryBtn, this.galleryParams);
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
    };
    /**
     * This method initializes autoFocus button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this.cam.nativeView.removeView(this.autofocusBtn);
        this.cam.nativeView.addView(this.autofocusBtn, this.autofocusParams);
    };
    /**
     * Creates take picture button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this.takePicBtn = this.createImageButton();
        this.setImageResource(this.takePicBtn, 'ic_camera');
        var shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor('#ffffff'); // white color
        this.takePicBtn.setColorFilter(color);
        this.takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.takePicFromCam(_this);
            },
        }));
        this.createTakePictureParams();
    };
    /**
     * Creates auto focus image button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createAutoFocusImage = function () {
        var _this = this;
        this.autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this.autofocusBtn, 'ic_auto_focus_black');
        // let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        // this.autofocusBtn.setImageResource(openGalleryDrawable);
        var shape = this.createAutofocusShape();
        this.autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
    };
    /**
     * Creates auto focus image button with help ImageView widget and settings
     * it's attributes like padding, height, width, color & scaleType.
     *
     * @returns Returns button object
     */
    CaptureComponent.prototype.createAutoFocusImageButton = function () {
        var btn = new android.widget.ImageView(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(158);
        btn.setMaxWidth(158);
        btn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
        var color = android.graphics.Color.parseColor('#008000'); // Green color
        btn.setColorFilter(color);
        return btn;
    };
    /**
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createImageGalleryButton = function () {
        var _this = this;
        this.galleryBtn = this.createImageButton();
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);
        var galleryBtnId = application.android.context.getResources()
            .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());
        this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this.galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createTransparentCircleDrawable();
        this.galleryBtn.setBackgroundDrawable(shape);
        this.galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.goImageGallery();
            },
        }));
        this.createImageGallerryParams();
    };
    /**
     * Gets actual icon image using icon name from context.
     *
     * @param iconName Icon Name
     */
    CaptureComponent.prototype.getImageDrawable = function (iconName) {
        var drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    };
    /**
     * Creates transparent circle shape with help of GradientDrawable object
     * and sets it's attributes like color, radius and alpha.
     *
     * @returns Returns shape object
     */
    CaptureComponent.prototype.createTransparentCircleDrawable = function () {
        var shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000);
        shape.setCornerRadius(96);
        shape.setAlpha(150);
        return shape;
    };
    /**
     * Creates auto focus shape using ShapeDrawable object and
     * sets alpha.
     * @returns Returns shape object
     */
    CaptureComponent.prototype.createAutofocusShape = function () {
        var shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    };
    /**
     * Creates image button with help of ImageButton widget
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns button object
     */
    CaptureComponent.prototype.createImageButton = function () {
        var btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(58);
        btn.setMaxWidth(58);
        return btn;
    };
    /**
     * Photo captured event fires when a picture is taken from camera, which actually
     * loads the captured image from ImageAsset.
     *
     * @param args Image captured event data
     */
    CaptureComponent.prototype.photoCapturedEvent = function (args) {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(args.data);
    };
    // /**
    //  * This is been called when toggle the camera button.
    //  * @param args Camera toggle event data
    //  */
    // toggleCameraEvent(args: any): void {
    //     console.log('camera toggled');
    // }
    /**
     * This method is called when toggle the flash icon on camera. This actually
     * flash off when it already is on or vice-versa.
     */
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        this.cam.toggleFlash();
    };
    /**
     * Method to display flash icon based on it's property value true/false.
     */
    CaptureComponent.prototype.toggleShowingFlashIcon = function () {
        console.log("showFlashIcon = " + this.cam.showFlashIcon);
        this.cam.showFlashIcon = !this.cam.showFlashIcon;
    };
    /**
     * Method to switch front/back camera.
     */
    CaptureComponent.prototype.toggleTheCamera = function () {
        this.cam.toggleCamera();
    };
    // /**
    //  * Open camera library.
    //  */
    // openCamPlusLibrary(): void {
    //     this.cam.chooseFromLibrary();
    // }
    /**
     * Takes picture from camera when user press the takePicture button on camera view.
     * Then it sets the captured image URI into imageSource to be displayed in front-end.
     *
     * @param thisParam Contains cameraplus instance
     */
    CaptureComponent.prototype.takePicFromCam = function (thisParam) {
        thisParam.activityLoader.show();
        thisParam.cam.takePicture({ saveToGallery: true });
        this.imgURI = '';
        this.imageSource = this.imgURI;
    };
    /**
     * It takes to image gallery view when user clicks on gallery button on camera view.
     */
    CaptureComponent.prototype.goImageGallery = function () {
        this.router.navigate(['imagegallery']);
    };
    /**
     * Shows the captured picture dialog window after taking picture. This is modal window along with
     * reuired options like capture image URI, transformed image URI, rectangle points and etc.
     * This also takes care of deleting the captured image when user wants to retake (using Retake button)
     * picture and, creates thumbnail image when user wants to save the captured image and
     * sets the transformed image in gallery icon button in camera view.
     *
     * @param fullScreen Option to show fullscreen dialog or not
     * @param filePathOrg Captured image file path
     * @param imgURI Transformed image file path
     * @param recPointsStr Rectangle points in string
     */
    CaptureComponent.prototype.showCapturedPictureDialog = function (fullScreen, filePathOrg, imgURI, recPointsStr) {
        var _this = this;
        var options = {
            context: {
                imageSource: imgURI,
                imageSourceOrg: filePathOrg,
                isAutoCorrection: true,
                rectanglePoints: recPointsStr,
                saveBtnLable: this.saveBtnLable,
                manualBtnLable: this.manualBtnLable,
                retakeBtnLable: this.retakeBtnLable,
                performBtnLable: this.performBtnLable,
            },
            fullscreen: fullScreen,
            viewContainerRef: this.viewContainerRef,
        };
        this.activityLoader.hide();
        this.modalService.showModal(dialog_component_1.DialogContent, options)
            .then(function (dialogResult) {
            if (dialogResult) {
                // let dilogResultTemp = dialogResult;
                // if (dialogResult.indexOf('_TEMP') > 0) {
                // 	for (let i = 0; i < 4; i++) {
                // 		dilogResultTemp = dilogResultTemp.replace('_TEMP' + i, '');
                // 	}
                // }
                _this.setTransformedImage(dialogResult);
                _this.createThumbNailImage(dialogResult);
                _this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, 'Add');
            }
            else {
                try {
                    var imgFileOrg = fs.File.fromPath(filePathOrg);
                    if (imgFileOrg) {
                        imgFileOrg.removeSync();
                    }
                    var imgURIFile = fs.File.fromPath(imgURI);
                    if (imgURIFile) {
                        imgURIFile.removeSync();
                    }
                    // Todo : to be removed later
                    var imgUriContourPath = imgURI.substring(0, imgURI.indexOf('_transformed')) + '_contour.jpg';
                    var imgURIContourFile = fs.File.fromPath(imgUriContourPath);
                    if (imgURIContourFile) {
                        imgURIContourFile.removeSync();
                        transformedimage_provider_1.SendBroadcastImage(imgUriContourPath);
                    }
                    // Todo - End
                    _this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
                }
                catch (error) {
                    Toast.makeText('Could not delete the capture image.' + error, 'long').show();
                    _this.logger.error(module.filename + ': ' + error);
                }
            }
        });
    };
    /**
     * Sets the transformed image in gallery image button.
     *
     * @param imgURIParam Transformed image file URI
     */
    CaptureComponent.prototype.setTransformedImage = function (imgURIParam) {
        if (imgURIParam) {
            try {
                // this._isImageBtnVisible = true;
                this.imgURI = imgURIParam;
                this.imageSource = imgURIParam;
                transformedimage_provider_1.SendBroadcastImage(this.imgURI);
            }
            catch (error) {
                Toast.makeText('Error while setting image in preview area' + error, 'long').show();
                this.logger.error(module.filename + ': ' + error);
            }
        }
    };
    /**
     * Creates layout params using LayoutParams widget for takePicture button
     * and sets it's params like height, width, margin & rules.
     */
    CaptureComponent.prototype.createTakePictureParams = function () {
        this.takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.takePicParams.width = '100';
        this.takePicParams.height = '100';
        this.takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.takePicParams.addRule(12);
        // HORIZONTAL_CENTER
        this.takePicParams.addRule(11);
    };
    /**
     * Creates layout params using LayoutParams widget for autoFocus button
     * and sets it's params like height, width, margin & rules.
     */
    CaptureComponent.prototype.createAutoFocusImageParams = function () {
        this.autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.autofocusParams.width = '300';
        this.autofocusParams.height = '300';
        this.autofocusParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_CENTER
        this.autofocusParams.addRule(13);
    };
    /**
     * Sets image resource to given image button.
     *
     * @param btn Button image instance referrence
     * @param iconName Icon name
     */
    CaptureComponent.prototype.setImageResource = function (btn, iconName) {
        var openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    };
    /**
     * Creates layout params using LayoutParams widget for gallery button
     * and sets it's params like height, width, margin & rules.
     */
    CaptureComponent.prototype.createImageGallerryParams = function () {
        this.galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.galleryParams.width = '100';
        this.galleryParams.height = '100';
        this.galleryParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.galleryParams.addRule(12);
        // ALIGN_PARENT_LEFT
        this.galleryParams.addRule(9);
    };
    /**
     * Refreshes the captured images in media store meaning that the new captured image will be
     * available to public access. That can be done by SendBroadcastImage method.
     *
     * @param filePathOrg Captured Image file path
     * @param imgURI Transformed Image file URI
     * @param action Actions 'Add'/'Remove'
     */
    CaptureComponent.prototype.refreshCapturedImagesinMediaStore = function (filePathOrg, imgURI, action) {
        try {
            transformedimage_provider_1.SendBroadcastImage(filePathOrg);
            transformedimage_provider_1.SendBroadcastImage(imgURI);
            // this thumbnail image will be available only in 'Add' case.
            if (action === 'Add') {
                var thumnailOrgPath = imgURI.replace('PT_IMG', 'thumb_PT_IMG');
                transformedimage_provider_1.SendBroadcastImage(thumnailOrgPath);
            }
        }
        catch (error) {
            Toast.makeText('Could not sync the captured image file. ' + error, 'long').show();
            this.logger.error(module.filename + ': ' + error);
        }
    };
    /**
     * Creates thumbnail image for the captured transformed image and sets it in gallery button.
     *
     * @param imgURI Transformed image file path
     */
    CaptureComponent.prototype.createThumbNailImage = function (imgURI) {
        try {
            var thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);
            var uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            this.galleryBtn.setImageURI(uri);
        }
        catch (error) {
            Toast.makeText('Error while creating thumbnail image. ' + error, 'long').show();
            this.logger.error(module.filename + ': ' + error);
        }
    };
    // /**
    //  * Perform adaptive threshold.
    //  * @param thresholdValue Threshold value
    //  */
    // private performAdaptiveThreshold(thresholdValue: any): void {
    //     this.zone.run(() => {
    //         this.imgEmpty = this.imgURI + '?ts=' + new Date().getTime();
    //         this.imageSource = this.imgEmpty;
    //     });
    //     this.zone.run(() => {
    //         this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, thresholdValue);
    //         // this._isImageBtnVisible = true;
    //         this.imageSource = this.imgURI;
    //     });
    // }
    /**
     * This method performs perspective transformation for the captured image using OpenCV API and
     * returns the transformed image URI along with rectangle points as string which will be used to
     * draw circle points. After that it shows up the dialog modal window with the transformed image.
     *
     * @param filePath Captured image file path
     */
    CaptureComponent.prototype.performPerspectiveTransformation = function (filePath) {
        try {
            var imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            var rectanglePointsStr = imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
        }
        catch (error) {
            this.activityLoader.hide();
            Toast.makeText('Error while performing perspective transformation process. Please retake picture', 'long').show();
        }
    };
    /**
     * Method to perform prespective transformation for the captured image
     * and sets the transformed image URI in this.imgURI variable.
     *
     * @param imageAsset ImageAsset object instance referrence
     */
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
                    _this.imageSource = _this.empty;
                    Toast.makeText('Image source is bad.', 'long').show();
                }
            }, function (error) {
                _this.imageSource = _this.empty;
                _this.logger.error('Error getting image source from asset. ' + module.filename
                    + _this.logger.ERROR_MSG_SEPARATOR + error);
                Toast.makeText('Error getting image source from asset.', 'long').show();
            });
        }
        else {
            this.logger.error('Image Asset was null. ' + module.filename);
            Toast.makeText('Image Asset was null', 'long').show();
            this.imageSource = this.empty;
        }
    };
    return CaptureComponent;
}());
CaptureComponent = __decorate([
    core_1.Component({
        selector: 'ns-capture',
        moduleId: module.id,
        styleUrls: ['./capture.component.css'],
        templateUrl: './capture.component.html',
    }),
    __metadata("design:paramtypes", [core_1.NgZone,
        modal_dialog_1.ModalDialogService,
        core_1.ViewContainerRef,
        router_1.Router,
        activityloader_common_1.ActivityLoader,
        oxseyelogger_1.OxsEyeLogger])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEU7QUFDNUUsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFFNUQsaUZBQXlFO0FBQ3pFLCtEQUEyRDtBQUMzRCxvRkFBNEU7QUFFNUUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxtREFBcUQ7QUFDckQsMENBQTRDO0FBQzVDLGlEQUFtRDtBQUVuRCwwREFBNEQ7QUFFNUQ7O0dBRUc7QUFPSCxJQUFhLGdCQUFnQjtJQXVDekI7Ozs7Ozs7O09BUUc7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUN0QyxpREFBaUQ7UUFDekMsTUFBb0I7UUFOcEIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFFOUIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQXhDaEMsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFjMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO1FBMEJoRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBQyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1DQUFRLEdBQVI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVB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QUFLLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQTltQkQsSUE4bUJDO0FBOW1CWSxnQkFBZ0I7SUFONUIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLENBQUM7cUNBa0RvQixhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSxzQ0FBYztRQUV0QiwyQkFBWTtHQXZEdkIsZ0JBQWdCLENBOG1CNUI7QUE5bUJZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgTmdab25lLCBPbkluaXQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nT3B0aW9ucywgTW9kYWxEaWFsb2dTZXJ2aWNlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IEltYWdlQXNzZXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLWFzc2V0JztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogQ2FwdHVyZSBjb21wb25lbnQgY2xhc3MsIHdoaWNoIGlzIGJlaW5nIHVzZWQgdG8gY2FwdHVyZSBpbWFnZSBmcm9tIGNhbWVyYS5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1jYXB0dXJlJyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYXB0dXJlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2FwdHVyZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIENhbWVyYSBpbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwcml2YXRlIGNhbTogYW55O1xuICAgIC8qKiBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGdhbGxlcnlCdG46IGFueTtcbiAgICAvKiogVGFrZSBwaWN0dXJlIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIHRha2VQaWNCdG46IGFueTtcbiAgICAvKiogQXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBhdXRvZm9jdXNCdG46IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgR2FsbGVyeSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBnYWxsZXJ5UGFyYW1zOiBhbnk7XG4gICAgLyoqIFBhcmFtYXRlcnMgdXNlZCB0byBkaXNwbGF5IFRha2UgcGljdHVyZSBidXR0b24uICovXG4gICAgcHJpdmF0ZSB0YWtlUGljUGFyYW1zOiBhbnk7XG4gICAgLyoqIFBhcmFtYXRlcnMgdXNlZCB0byBkaXNwbGF5IGF1dG8gZm9jdXMgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgYXV0b2ZvY3VzUGFyYW1zOiBhbnk7XG4gICAgLyoqIEVtcHR5IHN0cmluZyB2YXJpYWJsZSAqL1xuICAgIHByaXZhdGUgZW1wdHk6IGFueSA9IG51bGw7XG4gICAgLyoqIExvY2FsaXphdGlvbiAqL1xuICAgIHByaXZhdGUgbG9jYWxlOiBhbnk7XG4gICAgLyoqIExhYmxlIGZvciBzYXZlIGJ1dHRvbiAqL1xuICAgIHByaXZhdGUgc2F2ZUJ0bkxhYmxlOiBhbnk7XG4gICAgLyoqIExhYmxlIGZvciBtYW51YWwgYnV0dG9uICovXG4gICAgcHJpdmF0ZSBtYW51YWxCdG5MYWJsZTogYW55O1xuICAgIC8qKiBMYWJsZSBmb3IgcGVyZm9ybSBidXR0b24gKi9cbiAgICBwcml2YXRlIHBlcmZvcm1CdG5MYWJsZTogYW55O1xuICAgIC8qKiBMYWJsZSBmb3IgcmV0YWtlIGJ1dHRvbiAqL1xuICAgIHByaXZhdGUgcmV0YWtlQnRuTGFibGU6IGFueTtcblxuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIGNoZWNrIHRoZSBjYW1lcmEgaXMgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2FtZXJhVmlzaWJsZTogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzb3VyY2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgLyoqIE9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgVVJJICovXG4gICAgcHVibGljIGltZ1VSSTogYW55O1xuICAgIC8qKiBPcGVuQ1YgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHVibGljIG9wZW5jdkluc3RhbmNlOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgQ2FwdHVyZUNvbXBvbmVudC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gem9uZSBBbmd1bGFyIHpvbmUgdG8gcnVuIGEgdGFzayBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAcGFyYW0gbW9kYWxTZXJ2aWNlIFNlcnZpY2UgbW9kYWxcbiAgICAgKiBAcGFyYW0gdmlld0NvbnRhaW5lclJlZiBWaWV3IGNvbnRhaW5lciByZWZlcnJlbmNlXG4gICAgICogQHBhcmFtIHJvdXRlciBSb3V0ZXJcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHkgbG9hZGVyIGluZGljYXRpb25cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgbW9kYWxTZXJ2aWNlOiBNb2RhbERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIC8vIHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICApIHtcbiAgICAgICAgdGhpcy5sb2NhbGUgPSBuZXcgTCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBpbml0aWFsaXplcyBPcGVuQ1YgbW9kdWxlIGFuZCBidXR0b25zIGxpa2VcbiAgICAgKiB0YWtlUGljdHVyZSwgZ2FsbGVyeSBhbmQgYXV0b0ZvY3VzIGJ1dHRvbnMgaW4gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgT3BlbkNWLi4uJyk7XG4gICAgICAgIHRoaXMub3BlbmN2SW5zdGFuY2UgPSBvcGVuY3YuaW5pdE9wZW5DVigpO1xuICAgICAgICB0aGlzLmlzQ2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGNhbWVyYSBpcyBsb2FkZWQsIHdoZXJlIGFsbCB0aGUgbmVjY2Vzc2FyeSB0aGluZ3MgbGlrZVxuICAgICAqIGRpc3BsYXlpbmcgYnV0dG9ucyh0YWtlUGljdHVyZSwgZ2FsbGVyeSwgZmxhc2gsIGNhbWVyYSAmIGF1dG9Gb2N1cykgb24gY2FtZXJhIHZpZXdcbiAgICAgKiBhcmUgdGFrZW4gY2FyZSBhbmQgYWxzbyBpbml0aWFsaXplcyBjYW1lcmEgaW5zdGFuY2UuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgQ2FtZXJhUGx1cyBpbnN0YW5jZSByZWZlcnJlbmNlLlxuICAgICAqL1xuICAgIGNhbUxvYWRlZChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5zYXZlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NhdmUnKTtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucmV0YWtlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3JldGFrZScpO1xuICAgICAgICB0aGlzLnBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgncGVyZm9ybScpO1xuXG4gICAgICAgIHRoaXMuY2FtID0gYXJncy5vYmplY3QgYXMgQ2FtZXJhUGx1cztcbiAgICAgICAgY29uc3QgZmxhc2hNb2RlID0gdGhpcy5jYW0uZ2V0Rmxhc2hNb2RlKCk7XG5cbiAgICAgICAgLy8gVHVybiBmbGFzaCBvbiBhdCBzdGFydHVwXG4gICAgICAgIGlmIChmbGFzaE1vZGUgPT09ICdvbicpIHtcbiAgICAgICAgICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2IgPSBuZXcgYW5kcm9pZC5oYXJkd2FyZS5DYW1lcmEuQXV0b0ZvY3VzTW92ZUNhbGxiYWNrKFxuXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX3RoaXM6IHRoaXMsXG4gICAgICAgICAgICAgICAgb25BdXRvRm9jdXNNb3Zpbmcoc3RhcnQ6IGFueSwgY2FtZXJhOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0ZSA9IHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLmFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyZWVuIGNvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgwLjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2V0RHVyYXRpb24oMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZCBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZjAwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5jYW0uY2FtZXJhKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS5jYW1lcmEuc2V0QXV0b0ZvY3VzTW92ZUNhbGxiYWNrKGNiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJncy5kYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VQaWNCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeUJ0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uc2hvd1RvZ2dsZUljb24gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uX2luaXRGbGFzaEJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLl9pbml0VG9nZ2xlQ2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBURVNUIFRIRSBJQ09OUyBTSE9XSU5HL0hJRElOR1xuICAgICAgICAvLyB0aGlzLmNhbS5zaG93Q2FwdHVyZUljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dHYWxsZXJ5SWNvbiA9IGZhbHNlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd1RvZ2dsZUljb24gPSBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaW5pdGlhbGl6ZXMgY2FtZXJhIGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgICovXG4gICAgaW5pdENhbWVyYUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGFrZVBpY0J0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLnRha2VQaWNCdG4sIHRoaXMudGFrZVBpY1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGdhbGxlcnkgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC4gQW5kIGFsc28gc2V0c1xuICAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAgKi9cbiAgICBpbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5nYWxsZXJ5QnRuKTtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuZ2FsbGVyeUJ0biwgdGhpcy5nYWxsZXJ5UGFyYW1zKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaW5pdGlhbGl6ZXMgYXV0b0ZvY3VzIGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgICovXG4gICAgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5hdXRvZm9jdXNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5hdXRvZm9jdXNCdG4sIHRoaXMuYXV0b2ZvY3VzUGFyYW1zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0YWtlIHBpY3R1cmUgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGFrZVBpY0J0biwgJ2ljX2NhbWVyYScpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlVHJhbnNwYXJlbnRDaXJjbGVEcmF3YWJsZSgpO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZmZmZmYnKTsgLy8gd2hpdGUgY29sb3JcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ2xpY2soYXJnczogYW55KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGFrZVBpY0Zyb21DYW0oX3RoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBpbWFnZSBidXR0b24uIEFjdHVhbGx5IGl0IGNyZWF0ZXMgaW1hZ2UgYnV0dG9uIGFuZCBzZXR0aW5nXG4gICAgICogaXQncyBwcm9wZXJ0aWVzIGxpa2UgaW1hZ2UgaWNvbiwgc2hhcGUgYW5kIGNvbG9yIGFsb25nIHdpdGggY2xpY2sgZXZlbnQgbGlzdGVuZXIgaW4gaXQuXG4gICAgICovXG4gICAgY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4gPSB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmF1dG9mb2N1c0J0biwgJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuICAgICAgICAvLyB0aGlzLmF1dG9mb2N1c0J0bi5zZXRJbWFnZVJlc291cmNlKG9wZW5HYWxsZXJ5RHJhd2FibGUpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgaW1hZ2UgYnV0dG9uIHdpdGggaGVscCBJbWFnZVZpZXcgd2lkZ2V0IGFuZCBzZXR0aW5nc1xuICAgICAqIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIGhlaWdodCwgd2lkdGgsIGNvbG9yICYgc2NhbGVUeXBlLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNTgpO1xuICAgICAgICBidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpOyAvLyBHcmVlbiBjb2xvclxuICAgICAgICBidG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGdhbGxlcnkgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhY3R1YWwgaWNvbiBpbWFnZSB1c2luZyBpY29uIG5hbWUgZnJvbSBjb250ZXh0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpY29uTmFtZSBJY29uIE5hbWVcbiAgICAgKi9cbiAgICBnZXRJbWFnZURyYXdhYmxlKGljb25OYW1lOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBkcmF3YWJsZUlkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0XG4gICAgICAgICAgICAuZ2V0UmVzb3VyY2VzKClcbiAgICAgICAgICAgIC5nZXRJZGVudGlmaWVyKGljb25OYW1lLCAnZHJhd2FibGUnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG4gICAgICAgIHJldHVybiBkcmF3YWJsZUlkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRyYW5zcGFyZW50IGNpcmNsZSBzaGFwZSB3aXRoIGhlbHAgb2YgR3JhZGllbnREcmF3YWJsZSBvYmplY3RcbiAgICAgKiBhbmQgc2V0cyBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBjb2xvciwgcmFkaXVzIGFuZCBhbHBoYS5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIHNoYXBlIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTogYW55IHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5HcmFkaWVudERyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldENvbG9yKDB4OTkwMDAwMDApO1xuICAgICAgICBzaGFwZS5zZXRDb3JuZXJSYWRpdXMoOTYpO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgxNTApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBzaGFwZSB1c2luZyBTaGFwZURyYXdhYmxlIG9iamVjdCBhbmRcbiAgICAgKiBzZXRzIGFscGhhLlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgc2hhcGUgb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTogYW55IHtcblxuICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBhbmRyb2lkLmdyYXBoaWNzLmRyYXdhYmxlLlNoYXBlRHJhd2FibGUoKTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIG9mIEltYWdlQnV0dG9uIHdpZGdldFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIG1heEhlaWdodCAmIG1heHdpZHRoLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoNTgpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaG90byBjYXB0dXJlZCBldmVudCBmaXJlcyB3aGVuIGEgcGljdHVyZSBpcyB0YWtlbiBmcm9tIGNhbWVyYSwgd2hpY2ggYWN0dWFsbHlcbiAgICAgKiBsb2FkcyB0aGUgY2FwdHVyZWQgaW1hZ2UgZnJvbSBJbWFnZUFzc2V0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIEltYWdlIGNhcHR1cmVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwaG90b0NhcHR1cmVkRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQSE9UTyBDQVBUVVJFRCBFVkVOVCEhIScpO1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShhcmdzLmRhdGEgYXMgSW1hZ2VBc3NldCk7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIFRoaXMgaXMgYmVlbiBjYWxsZWQgd2hlbiB0b2dnbGUgdGhlIGNhbWVyYSBidXR0b24uXG4gICAgLy8gICogQHBhcmFtIGFyZ3MgQ2FtZXJhIHRvZ2dsZSBldmVudCBkYXRhXG4gICAgLy8gICovXG4gICAgLy8gdG9nZ2xlQ2FtZXJhRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdjYW1lcmEgdG9nZ2xlZCcpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIHRvZ2dsZSB0aGUgZmxhc2ggaWNvbiBvbiBjYW1lcmEuIFRoaXMgYWN0dWFsbHlcbiAgICAgKiBmbGFzaCBvZmYgd2hlbiBpdCBhbHJlYWR5IGlzIG9uIG9yIHZpY2UtdmVyc2EuXG4gICAgICovXG4gICAgdG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW0udG9nZ2xlRmxhc2goKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGRpc3BsYXkgZmxhc2ggaWNvbiBiYXNlZCBvbiBpdCdzIHByb3BlcnR5IHZhbHVlIHRydWUvZmFsc2UuXG4gICAgICovXG4gICAgdG9nZ2xlU2hvd2luZ0ZsYXNoSWNvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuY2FtLnNob3dGbGFzaEljb259YCk7XG4gICAgICAgIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSAhdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHN3aXRjaCBmcm9udC9iYWNrIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVUaGVDYW1lcmEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUNhbWVyYSgpO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBPcGVuIGNhbWVyYSBsaWJyYXJ5LlxuICAgIC8vICAqL1xuICAgIC8vIG9wZW5DYW1QbHVzTGlicmFyeSgpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy5jYW0uY2hvb3NlRnJvbUxpYnJhcnkoKTtcbiAgICAvLyB9XG4gICAgLyoqXG4gICAgICogVGFrZXMgcGljdHVyZSBmcm9tIGNhbWVyYSB3aGVuIHVzZXIgcHJlc3MgdGhlIHRha2VQaWN0dXJlIGJ1dHRvbiBvbiBjYW1lcmEgdmlldy5cbiAgICAgKiBUaGVuIGl0IHNldHMgdGhlIGNhcHR1cmVkIGltYWdlIFVSSSBpbnRvIGltYWdlU291cmNlIHRvIGJlIGRpc3BsYXllZCBpbiBmcm9udC1lbmQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRoaXNQYXJhbSBDb250YWlucyBjYW1lcmFwbHVzIGluc3RhbmNlXG4gICAgICovXG4gICAgdGFrZVBpY0Zyb21DYW0odGhpc1BhcmFtOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpc1BhcmFtLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpc1BhcmFtLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSXQgdGFrZXMgdG8gaW1hZ2UgZ2FsbGVyeSB2aWV3IHdoZW4gdXNlciBjbGlja3Mgb24gZ2FsbGVyeSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2cgd2luZG93IGFmdGVyIHRha2luZyBwaWN0dXJlLiBUaGlzIGlzIG1vZGFsIHdpbmRvdyBhbG9uZyB3aXRoXG4gICAgICogcmV1aXJlZCBvcHRpb25zIGxpa2UgY2FwdHVyZSBpbWFnZSBVUkksIHRyYW5zZm9ybWVkIGltYWdlIFVSSSwgcmVjdGFuZ2xlIHBvaW50cyBhbmQgZXRjLlxuICAgICAqIFRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGRlbGV0aW5nIHRoZSBjYXB0dXJlZCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gcmV0YWtlICh1c2luZyBSZXRha2UgYnV0dG9uKVxuICAgICAqIHBpY3R1cmUgYW5kLCBjcmVhdGVzIHRodW1ibmFpbCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gc2F2ZSB0aGUgY2FwdHVyZWQgaW1hZ2UgYW5kXG4gICAgICogc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpY29uIGJ1dHRvbiBpbiBjYW1lcmEgdmlldy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZnVsbFNjcmVlbiBPcHRpb24gdG8gc2hvdyBmdWxsc2NyZWVuIGRpYWxvZyBvciBub3RcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVjUG9pbnRzU3RyIFJlY3RhbmdsZSBwb2ludHMgaW4gc3RyaW5nXG4gICAgICovXG4gICAgc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyhmdWxsU2NyZWVuOiBib29sZWFuLCBmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgcmVjUG9pbnRzU3RyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZTogaW1nVVJJLFxuICAgICAgICAgICAgICAgIGltYWdlU291cmNlT3JnOiBmaWxlUGF0aE9yZyxcbiAgICAgICAgICAgICAgICBpc0F1dG9Db3JyZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY3RhbmdsZVBvaW50czogcmVjUG9pbnRzU3RyLFxuICAgICAgICAgICAgICAgIHNhdmVCdG5MYWJsZTogdGhpcy5zYXZlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgbWFudWFsQnRuTGFibGU6IHRoaXMubWFudWFsQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgcmV0YWtlQnRuTGFibGU6IHRoaXMucmV0YWtlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgcGVyZm9ybUJ0bkxhYmxlOiB0aGlzLnBlcmZvcm1CdG5MYWJsZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiBmdWxsU2NyZWVuLFxuICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKERpYWxvZ0NvbnRlbnQsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoZGlhbG9nUmVzdWx0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGlhbG9nUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBkaWxvZ1Jlc3VsdFRlbXAgPSBkaWFsb2dSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChkaWFsb2dSZXN1bHQuaW5kZXhPZignX1RFTVAnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGlsb2dSZXN1bHRUZW1wID0gZGlsb2dSZXN1bHRUZW1wLnJlcGxhY2UoJ19URU1QJyArIGksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHR9XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm1lZEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGRpYWxvZ1Jlc3VsdCwgJ0FkZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdGaWxlT3JnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU9yZy5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVUkkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZG8gOiB0byBiZSByZW1vdmVkIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVcmlDb250b3VyUGF0aCA9IGltZ1VSSS5zdWJzdHJpbmcoMCwgaW1nVVJJLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJQ29udG91ckZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdVUklDb250b3VyRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUNvbnRvdXJGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyAtIEVuZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgaW1nVVJJLCAnUmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnQ291bGQgbm90IGRlbGV0ZSB0aGUgY2FwdHVyZSBpbWFnZS4nICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBpbiBnYWxsZXJ5IGltYWdlIGJ1dHRvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1lZEltYWdlKGltZ1VSSVBhcmFtOiBhbnkpIHtcbiAgICAgICAgaWYgKGltZ1VSSVBhcmFtKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWdVUkkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2V0dGluZyBpbWFnZSBpbiBwcmV2aWV3IGFyZWEnICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgdGFrZVBpY3R1cmUgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gSE9SSVpPTlRBTF9DRU5URVJcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgYXV0b0ZvY3VzIGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmhlaWdodCA9ICczMDAnO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQ0VOVEVSXG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmFkZFJ1bGUoMTMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGltYWdlIHJlc291cmNlIHRvIGdpdmVuIGltYWdlIGJ1dHRvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYnRuIEJ1dHRvbiBpbWFnZSBpbnN0YW5jZSByZWZlcnJlbmNlXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gbmFtZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SW1hZ2VSZXNvdXJjZShidG46IGFueSwgaWNvbk5hbWU6IGFueSkge1xuICAgICAgICBjb25zdCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTtcbiAgICAgICAgYnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciBnYWxsZXJ5IGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVJbWFnZUdhbGxlcnJ5UGFyYW1zKCkge1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0xFRlRcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoOSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZnJlc2hlcyB0aGUgY2FwdHVyZWQgaW1hZ2VzIGluIG1lZGlhIHN0b3JlIG1lYW5pbmcgdGhhdCB0aGUgbmV3IGNhcHR1cmVkIGltYWdlIHdpbGwgYmVcbiAgICAgKiBhdmFpbGFibGUgdG8gcHVibGljIGFjY2Vzcy4gVGhhdCBjYW4gYmUgZG9uZSBieSBTZW5kQnJvYWRjYXN0SW1hZ2UgbWV0aG9kLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIEltYWdlIGZpbGUgVVJJXG4gICAgICogQHBhcmFtIGFjdGlvbiBBY3Rpb25zICdBZGQnLydSZW1vdmUnXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmc6IHN0cmluZywgaW1nVVJJOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVBhdGhPcmcpO1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB0aGlzIHRodW1ibmFpbCBpbWFnZSB3aWxsIGJlIGF2YWlsYWJsZSBvbmx5IGluICdBZGQnIGNhc2UuXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnQWRkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltZ1VSSS5yZXBsYWNlKCdQVF9JTUcnLCAndGh1bWJfUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRodW1uYWlsT3JnUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnQ291bGQgbm90IHN5bmMgdGhlIGNhcHR1cmVkIGltYWdlIGZpbGUuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGh1bWJuYWlsIGltYWdlIGZvciB0aGUgY2FwdHVyZWQgdHJhbnNmb3JtZWQgaW1hZ2UgYW5kIHNldHMgaXQgaW4gZ2FsbGVyeSBidXR0b24uXG4gICAgICogXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRodW1iTmFpbEltYWdlKGltZ1VSSTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEltYWdlUGF0aCA9IG9wZW5jdi5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdmFyIHRodW1ibmFpbEltYWdlUGF0aCA9IGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuICAgICAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKCdmaWxlOi8vJyArIHRodW1ibmFpbEltYWdlUGF0aCk7XG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VVUkkodXJpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBjcmVhdGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogUGVyZm9ybSBhZGFwdGl2ZSB0aHJlc2hvbGQuXG4gICAgLy8gICogQHBhcmFtIHRocmVzaG9sZFZhbHVlIFRocmVzaG9sZCB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcbiAgICAvLyAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSB1c2luZyBPcGVuQ1YgQVBJIGFuZFxuICAgICAqIHJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbG9uZyB3aXRoIHJlY3RhbmdsZSBwb2ludHMgYXMgc3RyaW5nIHdoaWNoIHdpbGwgYmUgdXNlZCB0b1xuICAgICAqIGRyYXcgY2lyY2xlIHBvaW50cy4gQWZ0ZXIgdGhhdCBpdCBzaG93cyB1cCB0aGUgZGlhbG9nIG1vZGFsIHdpbmRvdyB3aXRoIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aDogYW55KTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbWdVUklUZW1wID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoLCAnJyk7XG4gICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVRlbXAuc3Vic3RyaW5nKDAsIGltZ1VSSVRlbXAuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzU3RyID0gaW1nVVJJVGVtcC5zdWJzdHJpbmcoaW1nVVJJVGVtcC5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJLCByZWN0YW5nbGVQb2ludHNTdHIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgcGVyZm9ybWluZyBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBwcm9jZXNzLiBQbGVhc2UgcmV0YWtlIHBpY3R1cmUnLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gcGVyZm9ybSBwcmVzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBmb3IgdGhlIGNhcHR1cmVkIGltYWdlIFxuICAgICAqIGFuZCBzZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgaW4gdGhpcy5pbWdVUkkgdmFyaWFibGUuXG4gICAgICogXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgSW1hZ2VBc3NldCBvYmplY3QgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQXNzZXQ6IEltYWdlQXNzZXQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGltYWdlQXNzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoaW1hZ2VBc3NldCkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnSW1hZ2Ugc291cmNlIGlzIGJhZC4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldC4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldC4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdJbWFnZSBBc3NldCB3YXMgbnVsbC4gJyArIG1vZHVsZS5maWxlbmFtZSk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19