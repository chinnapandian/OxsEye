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
        logger, locale) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
        this.logger = logger;
        this.locale = locale;
        /** Empty string variable */
        this.empty = null;
        /** Transformed Image source */
        this.imageSource = new image_source_1.ImageSource();
        // this.locale = new L();
    }
    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    CaptureComponent.prototype.ngOnInit = function () {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
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
        // this.saveBtnLable = this.locale.transform('save');
        // this.manualBtnLable = this.locale.transform('manual');
        // this.retakeBtnLable = this.locale.transform('retake');
        // this.performBtnLable = this.locale.transform('perform');
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
                    Toast.makeText(_this.locale.transform('could_not_delete_the_capture_image') + error, 'long').show();
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
                Toast.makeText(this.locale.transform('error_while_setting_image_in_preview_area') + error, 'long').show();
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
            Toast.makeText(this.locale.transform('could_not_sync_the_captured_image_file') + error, 'long').show();
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
            Toast.makeText(this.locale.transform('error_while_creating_thumbnail_image') + error, 'long').show();
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
            Toast.makeText(this.locale.transform('error_while_performing_perspective_transformation'), 'long').show();
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
                    Toast.makeText(_this.locale.transform('image_source_is_bad'), 'long').show();
                }
            }, function (error) {
                _this.imageSource = _this.empty;
                _this.logger.error('Error getting image source from asset. ' + module.filename
                    + _this.logger.ERROR_MSG_SEPARATOR + error);
                Toast.makeText(_this.locale.transform('error_getting_image_source_from_asset'), 'long').show();
            });
        }
        else {
            this.logger.error('Image Asset was null. ' + module.filename);
            Toast.makeText(this.locale.transform('image_asset_was_null'), 'long').show();
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
        activityloader_common_1.ActivityLoader, typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object, angular_1.L])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEU7QUFDNUUsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFFNUQsaUZBQXlFO0FBQ3pFLCtEQUEyRDtBQUMzRCxvRkFBNEU7QUFFNUUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxtREFBcUQ7QUFDckQsMENBQTRDO0FBQzVDLGlEQUFtRDtBQUVuRCwwREFBNEQ7QUFFNUQ7O0dBRUc7QUFPSCxJQUFhLGdCQUFnQjtJQXVDekI7Ozs7Ozs7O09BUUc7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUN0QyxpREFBaUQ7UUFDekMsTUFBb0IsRUFDcEIsTUFBUztRQVBULFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBRTlCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFDcEIsV0FBTSxHQUFOLE1BQU0sQ0FBRztRQXpDckIsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFjMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO1FBMkJoRCx5QkFBeUI7SUFDN0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1DQUFRLEdBQVI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFD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SSxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQTltQkQsSUE4bUJDO0FBOW1CWSxnQkFBZ0I7SUFONUIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLENBQUM7cUNBa0RvQixhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSxzQ0FBYyxzQkFFdEIsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQXhEWixnQkFBZ0IsQ0E4bUI1QjtBQTltQlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBOZ1pvbmUsIE9uSW5pdCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tICdAbnN0dWRpby9uYXRpdmVzY3JpcHQtY2FtZXJhLXBsdXMnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dPcHRpb25zLCBNb2RhbERpYWxvZ1NlcnZpY2UgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgSW1hZ2VBc3NldCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2UtYXNzZXQnO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBDYXB0dXJlIGNvbXBvbmVudCBjbGFzcywgd2hpY2ggaXMgYmVpbmcgdXNlZCB0byBjYXB0dXJlIGltYWdlIGZyb20gY2FtZXJhLlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWNhcHR1cmUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vY2FwdHVyZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhcHR1cmUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBDYXB0dXJlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQ2FtZXJhIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHByaXZhdGUgY2FtOiBhbnk7XG4gICAgLyoqIEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeUJ0bjogYW55O1xuICAgIC8qKiBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY0J0bjogYW55O1xuICAgIC8qKiBBdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c0J0bjogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGdhbGxlcnlQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgVGFrZSBwaWN0dXJlIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIHRha2VQaWNQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgYXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBhdXRvZm9jdXNQYXJhbXM6IGFueTtcbiAgICAvKiogRW1wdHkgc3RyaW5nIHZhcmlhYmxlICovXG4gICAgcHJpdmF0ZSBlbXB0eTogYW55ID0gbnVsbDtcbiAgICAvLyAvKiogTG9jYWxpemF0aW9uICovXG4gICAgLy8gcHJpdmF0ZSBsb2NhbGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNhdmUgYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSBzYXZlQnRuTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIG1hbnVhbCBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIG1hbnVhbEJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciBwZXJmb3JtIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciByZXRha2UgYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSByZXRha2VCdG5MYWJsZTogYW55O1xuXG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gY2hlY2sgdGhlIGNhbWVyYSBpcyB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDYW1lcmFWaXNpYmxlOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHNvdXJjZSAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogSW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAvKiogT3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBVUkkgKi9cbiAgICBwdWJsaWMgaW1nVVJJOiBhbnk7XG4gICAgLyoqIE9wZW5DViBpbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwdWJsaWMgb3BlbmN2SW5zdGFuY2U6IGFueTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBDYXB0dXJlQ29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHpvbmUgQW5ndWxhciB6b25lIHRvIHJ1biBhIHRhc2sgYXN5bmNocm9ub3VzbHkuXG4gICAgICogQHBhcmFtIG1vZGFsU2VydmljZSBTZXJ2aWNlIG1vZGFsXG4gICAgICogQHBhcmFtIHZpZXdDb250YWluZXJSZWYgVmlldyBjb250YWluZXIgcmVmZXJyZW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIEFjdGl2aXR5IGxvYWRlciBpbmRpY2F0aW9uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgICAgICBwcml2YXRlIG1vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyLFxuICAgICAgICAvLyBwcml2YXRlIF9jaGFuZ2VEZXRlY3Rpb25SZWY6IENoYW5nZURldGVjdG9yUmVmXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgIHByaXZhdGUgbG9jYWxlOiBMLFxuICAgICkge1xuICAgICAgICAvLyB0aGlzLmxvY2FsZSA9IG5ldyBMKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIGluaXRpYWxpemVzIE9wZW5DViBtb2R1bGUgYW5kIGJ1dHRvbnMgbGlrZVxuICAgICAqIHRha2VQaWN0dXJlLCBnYWxsZXJ5IGFuZCBhdXRvRm9jdXMgYnV0dG9ucyBpbiBjYW1lcmEgdmlldy5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBPcGVuQ1YuLi4nKTtcbiAgICAgICAgdGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG4gICAgICAgIHRoaXMuaXNDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gY2FtZXJhIGlzIGxvYWRlZCwgd2hlcmUgYWxsIHRoZSBuZWNjZXNzYXJ5IHRoaW5ncyBsaWtlXG4gICAgICogZGlzcGxheWluZyBidXR0b25zKHRha2VQaWN0dXJlLCBnYWxsZXJ5LCBmbGFzaCwgY2FtZXJhICYgYXV0b0ZvY3VzKSBvbiBjYW1lcmEgdmlld1xuICAgICAqIGFyZSB0YWtlbiBjYXJlIGFuZCBhbHNvIGluaXRpYWxpemVzIGNhbWVyYSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIENhbWVyYVBsdXMgaW5zdGFuY2UgcmVmZXJyZW5jZS5cbiAgICAgKi9cbiAgICBjYW1Mb2FkZWQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIHRoaXMuc2F2ZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzYXZlJyk7XG4gICAgICAgIC8vIHRoaXMubWFudWFsQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICAvLyB0aGlzLnJldGFrZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZXRha2UnKTtcbiAgICAgICAgLy8gdGhpcy5wZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcblxuICAgICAgICB0aGlzLmNhbSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuY2FtLmdldEZsYXNoTW9kZSgpO1xuXG4gICAgICAgIC8vIFR1cm4gZmxhc2ggb24gYXQgc3RhcnR1cFxuICAgICAgICBpZiAoZmxhc2hNb2RlID09PSAnb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNiID0gbmV3IGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLkF1dG9Gb2N1c01vdmVDYWxsYmFjayhcblxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF90aGlzOiB0aGlzLFxuICAgICAgICAgICAgICAgIG9uQXV0b0ZvY3VzTW92aW5nKHN0YXJ0OiBhbnksIGNhbWVyYTogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGUgPSB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5hbmltYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHcmVlbiBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyMwMDgwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDAuNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNldER1cmF0aW9uKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWQgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmYwMDAwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuY2FtLmNhbWVyYSkge1xuICAgICAgICAgICAgdGhpcy5jYW0uY2FtZXJhLnNldEF1dG9Gb2N1c01vdmVDYWxsYmFjayhjYik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmNhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlUGljQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLl9pbml0Rmxhc2hCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbS5faW5pdFRvZ2dsZUNhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVEVTVCBUSEUgSUNPTlMgU0hPV0lORy9ISURJTkdcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0NhcHR1cmVJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93R2FsbGVyeUljb24gPSBmYWxzZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGNhbWVyYSBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgICogaXQgcmVtb3ZlcyBhbiBleGlzdGluZyBvbmUgaWYgZXhpc3RzIGFuZCBhZGRzIGl0LlxuICAgICAqL1xuICAgIGluaXRDYW1lcmFCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLnRha2VQaWNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50YWtlUGljQnRuLCB0aGlzLnRha2VQaWNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBnYWxsZXJ5IGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuIEFuZCBhbHNvIHNldHNcbiAgICAgKiB0aGUgaW1hZ2UgaWNvbiBmb3IgaXQuXG4gICAgICovXG4gICAgaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuZ2FsbGVyeUJ0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmdhbGxlcnlCdG4sIHRoaXMuZ2FsbGVyeVBhcmFtcyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGF1dG9Gb2N1cyBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgICogaXQgcmVtb3ZlcyBhbiBleGlzdGluZyBvbmUgaWYgZXhpc3RzIGFuZCBhZGRzIGl0LlxuICAgICAqL1xuICAgIGluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuKTtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuLCB0aGlzLmF1dG9mb2N1c1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGFrZSBwaWN0dXJlIGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLnRha2VQaWNCdG4sICdpY19jYW1lcmEnKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmZmZmZmJyk7IC8vIHdoaXRlIGNvbG9yXG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRha2VQaWNGcm9tQ2FtKF90aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgaW1hZ2UgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5hdXRvZm9jdXNCdG4sICdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcbiAgICAgICAgLy8gdGhpcy5hdXRvZm9jdXNCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbiB3aXRoIGhlbHAgSW1hZ2VWaWV3IHdpZGdldCBhbmQgc2V0dGluZ3NcbiAgICAgKiBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBwYWRkaW5nLCBoZWlnaHQsIHdpZHRoLCBjb2xvciAmIHNjYWxlVHlwZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNTgpO1xuICAgICAgICBidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpOyAvLyBHcmVlbiBjb2xvclxuICAgICAgICBidG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGdhbGxlcnkgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhY3R1YWwgaWNvbiBpbWFnZSB1c2luZyBpY29uIG5hbWUgZnJvbSBjb250ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gTmFtZVxuICAgICAqL1xuICAgIGdldEltYWdlRHJhd2FibGUoaWNvbk5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHRcbiAgICAgICAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoaWNvbk5hbWUsICdkcmF3YWJsZScsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIGRyYXdhYmxlSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdHJhbnNwYXJlbnQgY2lyY2xlIHNoYXBlIHdpdGggaGVscCBvZiBHcmFkaWVudERyYXdhYmxlIG9iamVjdFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIGNvbG9yLCByYWRpdXMgYW5kIGFscGhhLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDk2KTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMTUwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgc2hhcGUgdXNpbmcgU2hhcGVEcmF3YWJsZSBvYmplY3QgYW5kXG4gICAgICogc2V0cyBhbHBoYS5cbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIHNoYXBlIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk6IGFueSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5TaGFwZURyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgaW1hZ2UgYnV0dG9uIHdpdGggaGVscCBvZiBJbWFnZUJ1dHRvbiB3aWRnZXRcbiAgICAgKiBhbmQgc2V0cyBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBwYWRkaW5nLCBtYXhIZWlnaHQgJiBtYXh3aWR0aC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoNTgpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaG90byBjYXB0dXJlZCBldmVudCBmaXJlcyB3aGVuIGEgcGljdHVyZSBpcyB0YWtlbiBmcm9tIGNhbWVyYSwgd2hpY2ggYWN0dWFsbHlcbiAgICAgKiBsb2FkcyB0aGUgY2FwdHVyZWQgaW1hZ2UgZnJvbSBJbWFnZUFzc2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgSW1hZ2UgY2FwdHVyZWQgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIHBob3RvQ2FwdHVyZWRFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BIT1RPIENBUFRVUkVEIEVWRU5UISEhJyk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKGFyZ3MuZGF0YSBhcyBJbWFnZUFzc2V0KTtcbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogVGhpcyBpcyBiZWVuIGNhbGxlZCB3aGVuIHRvZ2dsZSB0aGUgY2FtZXJhIGJ1dHRvbi5cbiAgICAvLyAgKiBAcGFyYW0gYXJncyBDYW1lcmEgdG9nZ2xlIGV2ZW50IGRhdGFcbiAgICAvLyAgKi9cbiAgICAvLyB0b2dnbGVDYW1lcmFFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coJ2NhbWVyYSB0b2dnbGVkJyk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gdG9nZ2xlIHRoZSBmbGFzaCBpY29uIG9uIGNhbWVyYS4gVGhpcyBhY3R1YWxseVxuICAgICAqIGZsYXNoIG9mZiB3aGVuIGl0IGFscmVhZHkgaXMgb24gb3IgdmljZS12ZXJzYS5cbiAgICAgKi9cbiAgICB0b2dnbGVGbGFzaE9uQ2FtKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gZGlzcGxheSBmbGFzaCBpY29uIGJhc2VkIG9uIGl0J3MgcHJvcGVydHkgdmFsdWUgdHJ1ZS9mYWxzZS5cbiAgICAgKi9cbiAgICB0b2dnbGVTaG93aW5nRmxhc2hJY29uKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc2hvd0ZsYXNoSWNvbiA9ICR7dGhpcy5jYW0uc2hvd0ZsYXNoSWNvbn1gKTtcbiAgICAgICAgdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9ICF0aGlzLmNhbS5zaG93Rmxhc2hJY29uO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gc3dpdGNoIGZyb250L2JhY2sgY2FtZXJhLlxuICAgICAqL1xuICAgIHRvZ2dsZVRoZUNhbWVyYSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW0udG9nZ2xlQ2FtZXJhKCk7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIE9wZW4gY2FtZXJhIGxpYnJhcnkuXG4gICAgLy8gICovXG4gICAgLy8gb3BlbkNhbVBsdXNMaWJyYXJ5KCk6IHZvaWQge1xuICAgIC8vICAgICB0aGlzLmNhbS5jaG9vc2VGcm9tTGlicmFyeSgpO1xuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBUYWtlcyBwaWN0dXJlIGZyb20gY2FtZXJhIHdoZW4gdXNlciBwcmVzcyB0aGUgdGFrZVBpY3R1cmUgYnV0dG9uIG9uIGNhbWVyYSB2aWV3LlxuICAgICAqIFRoZW4gaXQgc2V0cyB0aGUgY2FwdHVyZWQgaW1hZ2UgVVJJIGludG8gaW1hZ2VTb3VyY2UgdG8gYmUgZGlzcGxheWVkIGluIGZyb250LWVuZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0aGlzUGFyYW0gQ29udGFpbnMgY2FtZXJhcGx1cyBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRha2VQaWNGcm9tQ2FtKHRoaXNQYXJhbTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXNQYXJhbS5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXNQYXJhbS5jYW0udGFrZVBpY3R1cmUoeyBzYXZlVG9HYWxsZXJ5OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEl0IHRha2VzIHRvIGltYWdlIGdhbGxlcnkgdmlldyB3aGVuIHVzZXIgY2xpY2tzIG9uIGdhbGxlcnkgYnV0dG9uIG9uIGNhbWVyYSB2aWV3LlxuICAgICAqL1xuICAgIGdvSW1hZ2VHYWxsZXJ5KCkge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ2ltYWdlZ2FsbGVyeSddKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvd3MgdGhlIGNhcHR1cmVkIHBpY3R1cmUgZGlhbG9nIHdpbmRvdyBhZnRlciB0YWtpbmcgcGljdHVyZS4gVGhpcyBpcyBtb2RhbCB3aW5kb3cgYWxvbmcgd2l0aFxuICAgICAqIHJldWlyZWQgb3B0aW9ucyBsaWtlIGNhcHR1cmUgaW1hZ2UgVVJJLCB0cmFuc2Zvcm1lZCBpbWFnZSBVUkksIHJlY3RhbmdsZSBwb2ludHMgYW5kIGV0Yy5cbiAgICAgKiBUaGlzIGFsc28gdGFrZXMgY2FyZSBvZiBkZWxldGluZyB0aGUgY2FwdHVyZWQgaW1hZ2Ugd2hlbiB1c2VyIHdhbnRzIHRvIHJldGFrZSAodXNpbmcgUmV0YWtlIGJ1dHRvbilcbiAgICAgKiBwaWN0dXJlIGFuZCwgY3JlYXRlcyB0aHVtYm5haWwgaW1hZ2Ugd2hlbiB1c2VyIHdhbnRzIHRvIHNhdmUgdGhlIGNhcHR1cmVkIGltYWdlIGFuZFxuICAgICAqIHNldHMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGluIGdhbGxlcnkgaWNvbiBidXR0b24gaW4gY2FtZXJhIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZnVsbFNjcmVlbiBPcHRpb24gdG8gc2hvdyBmdWxsc2NyZWVuIGRpYWxvZyBvciBub3RcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVjUG9pbnRzU3RyIFJlY3RhbmdsZSBwb2ludHMgaW4gc3RyaW5nXG4gICAgICovXG4gICAgc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyhmdWxsU2NyZWVuOiBib29sZWFuLCBmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgcmVjUG9pbnRzU3RyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZTogaW1nVVJJLFxuICAgICAgICAgICAgICAgIGltYWdlU291cmNlT3JnOiBmaWxlUGF0aE9yZyxcbiAgICAgICAgICAgICAgICBpc0F1dG9Db3JyZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY3RhbmdsZVBvaW50czogcmVjUG9pbnRzU3RyLFxuICAgICAgICAgICAgICAgIC8vIHNhdmVCdG5MYWJsZTogdGhpcy5zYXZlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gbWFudWFsQnRuTGFibGU6IHRoaXMubWFudWFsQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gcmV0YWtlQnRuTGFibGU6IHRoaXMucmV0YWtlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gcGVyZm9ybUJ0bkxhYmxlOiB0aGlzLnBlcmZvcm1CdG5MYWJsZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiBmdWxsU2NyZWVuLFxuICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKERpYWxvZ0NvbnRlbnQsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoZGlhbG9nUmVzdWx0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGlhbG9nUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBkaWxvZ1Jlc3VsdFRlbXAgPSBkaWFsb2dSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChkaWFsb2dSZXN1bHQuaW5kZXhPZignX1RFTVAnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGlsb2dSZXN1bHRUZW1wID0gZGlsb2dSZXN1bHRUZW1wLnJlcGxhY2UoJ19URU1QJyArIGksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHR9XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm1lZEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGRpYWxvZ1Jlc3VsdCwgJ0FkZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdGaWxlT3JnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU9yZy5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVUkkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZG8gOiB0byBiZSByZW1vdmVkIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVcmlDb250b3VyUGF0aCA9IGltZ1VSSS5zdWJzdHJpbmcoMCwgaW1nVVJJLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJQ29udG91ckZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdVUklDb250b3VyRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUNvbnRvdXJGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyAtIEVuZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgaW1nVVJJLCAnUmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NvdWxkX25vdF9kZWxldGVfdGhlX2NhcHR1cmVfaW1hZ2UnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpbWFnZSBidXR0b24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1lZEltYWdlKGltZ1VSSVBhcmFtOiBhbnkpIHtcbiAgICAgICAgaWYgKGltZ1VSSVBhcmFtKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWdVUkkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX3NldHRpbmdfaW1hZ2VfaW5fcHJldmlld19hcmVhJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciB0YWtlUGljdHVyZSBidXR0b25cbiAgICAgKiBhbmQgc2V0cyBpdCdzIHBhcmFtcyBsaWtlIGhlaWdodCwgd2lkdGgsIG1hcmdpbiAmIHJ1bGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGFrZVBpY3R1cmVQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLndpZHRoID0gJzEwMCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5oZWlnaHQgPSAnMTAwJztcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTIpO1xuICAgICAgICAvLyBIT1JJWk9OVEFMX0NFTlRFUlxuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuYWRkUnVsZSgxMSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciBhdXRvRm9jdXMgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMud2lkdGggPSAnMzAwJztcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMuaGVpZ2h0ID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9DRU5URVJcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMuYWRkUnVsZSgxMyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgaW1hZ2UgcmVzb3VyY2UgdG8gZ2l2ZW4gaW1hZ2UgYnV0dG9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ0biBCdXR0b24gaW1hZ2UgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqIEBwYXJhbSBpY29uTmFtZSBJY29uIG5hbWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldEltYWdlUmVzb3VyY2UoYnRuOiBhbnksIGljb25OYW1lOiBhbnkpIHtcbiAgICAgICAgY29uc3Qgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZShpY29uTmFtZSk7XG4gICAgICAgIGJ0bi5zZXRJbWFnZVJlc291cmNlKG9wZW5HYWxsZXJ5RHJhd2FibGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgZ2FsbGVyeSBidXR0b25cbiAgICAgKiBhbmQgc2V0cyBpdCdzIHBhcmFtcyBsaWtlIGhlaWdodCwgd2lkdGgsIG1hcmdpbiAmIHJ1bGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMud2lkdGggPSAnMTAwJztcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmhlaWdodCA9ICcxMDAnO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuYWRkUnVsZSgxMik7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9MRUZUXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoZXMgdGhlIGNhcHR1cmVkIGltYWdlcyBpbiBtZWRpYSBzdG9yZSBtZWFuaW5nIHRoYXQgdGhlIG5ldyBjYXB0dXJlZCBpbWFnZSB3aWxsIGJlXG4gICAgICogYXZhaWxhYmxlIHRvIHB1YmxpYyBhY2Nlc3MuIFRoYXQgY2FuIGJlIGRvbmUgYnkgU2VuZEJyb2FkY2FzdEltYWdlIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIEltYWdlIGZpbGUgVVJJXG4gICAgICogQHBhcmFtIGFjdGlvbiBBY3Rpb25zICdBZGQnLydSZW1vdmUnXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmc6IHN0cmluZywgaW1nVVJJOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVBhdGhPcmcpO1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB0aGlzIHRodW1ibmFpbCBpbWFnZSB3aWxsIGJlIGF2YWlsYWJsZSBvbmx5IGluICdBZGQnIGNhc2UuXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnQWRkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltZ1VSSS5yZXBsYWNlKCdQVF9JTUcnLCAndGh1bWJfUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRodW1uYWlsT3JnUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NvdWxkX25vdF9zeW5jX3RoZV9jYXB0dXJlZF9pbWFnZV9maWxlJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGh1bWJuYWlsIGltYWdlIGZvciB0aGUgY2FwdHVyZWQgdHJhbnNmb3JtZWQgaW1hZ2UgYW5kIHNldHMgaXQgaW4gZ2FsbGVyeSBidXR0b24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGh1bWJOYWlsSW1hZ2UoaW1nVVJJOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsSW1hZ2VQYXRoID0gb3BlbmN2LmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB2YXIgdGh1bWJuYWlsSW1hZ2VQYXRoID0gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShkc3RJbWdVUkkpO1xuXG4gICAgICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoJ2ZpbGU6Ly8nICsgdGh1bWJuYWlsSW1hZ2VQYXRoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRJbWFnZVVSSSh1cmkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9jcmVhdGluZ190aHVtYm5haWxfaW1hZ2UnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiBQZXJmb3JtIGFkYXB0aXZlIHRocmVzaG9sZC5cbiAgICAvLyAgKiBAcGFyYW0gdGhyZXNob2xkVmFsdWUgVGhyZXNob2xkIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhyZXNob2xkVmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1nRW1wdHkgPSB0aGlzLmltZ1VSSSArICc/dHM9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIC8vICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nRW1wdHk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1nVVJJID0gb3BlbmN2LnBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aGlzLndyYXBwZWRJbWFnZSwgdGhpcy5maWxlTmFtZSwgdGhyZXNob2xkVmFsdWUpO1xuICAgIC8vICAgICAgICAgLy8gdGhpcy5faXNJbWFnZUJ0blZpc2libGUgPSB0cnVlO1xuICAgIC8vICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBwZXJmb3JtcyBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBmb3IgdGhlIGNhcHR1cmVkIGltYWdlIHVzaW5nIE9wZW5DViBBUEkgYW5kXG4gICAgICogcmV0dXJucyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGFsb25nIHdpdGggcmVjdGFuZ2xlIHBvaW50cyBhcyBzdHJpbmcgd2hpY2ggd2lsbCBiZSB1c2VkIHRvXG4gICAgICogZHJhdyBjaXJjbGUgcG9pbnRzLiBBZnRlciB0aGF0IGl0IHNob3dzIHVwIHRoZSBkaWFsb2cgbW9kYWwgd2luZG93IHdpdGggdGhlIHRyYW5zZm9ybWVkIGltYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIENhcHR1cmVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGg6IGFueSk6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaW1nVVJJVGVtcCA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aCwgJycpO1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklUZW1wLnN1YnN0cmluZygwLCBpbWdVUklUZW1wLmluZGV4T2YoJ1JQVFNUUicpKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50c1N0ciA9IGltZ1VSSVRlbXAuc3Vic3RyaW5nKGltZ1VSSVRlbXAuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKHRydWUsIGZpbGVQYXRoLCB0aGlzLmltZ1VSSSwgcmVjdGFuZ2xlUG9pbnRzU3RyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9wZXJmb3JtaW5nX3BlcnNwZWN0aXZlX3RyYW5zZm9ybWF0aW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBwZXJmb3JtIHByZXNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIGZvciB0aGUgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiBhbmQgc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGluIHRoaXMuaW1nVVJJIHZhcmlhYmxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgSW1hZ2VBc3NldCBvYmplY3QgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQXNzZXQ6IEltYWdlQXNzZXQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGltYWdlQXNzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoaW1hZ2VBc3NldCkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2ltYWdlX3NvdXJjZV9pc19iYWQnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl9nZXR0aW5nX2ltYWdlX3NvdXJjZV9mcm9tX2Fzc2V0JyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ltYWdlIEFzc2V0IHdhcyBudWxsLiAnICsgbW9kdWxlLmZpbGVuYW1lKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnaW1hZ2VfYXNzZXRfd2FzX251bGwnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==