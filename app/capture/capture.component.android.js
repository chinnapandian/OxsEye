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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEU7QUFDNUUsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFFNUQsaUZBQXlFO0FBQ3pFLCtEQUEyRDtBQUMzRCxvRkFBNEU7QUFFNUUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxtREFBcUQ7QUFDckQsMENBQTRDO0FBQzVDLGlEQUFtRDtBQUVuRCwwREFBNEQ7QUFFNUQ7O0dBRUc7QUFPSCxJQUFhLGdCQUFnQjtJQXVDekI7Ozs7Ozs7O09BUUc7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUN0QyxpREFBaUQ7UUFDekMsTUFBb0IsRUFDcEIsTUFBUztRQVBULFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBRTlCLFdBQU0sR0FBTixNQUFNLENBQWM7UUFDcEIsV0FBTSxHQUFOLE1BQU0sQ0FBRztRQXpDckIsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFjMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO1FBMkJoRCx5QkFBeUI7SUFDN0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILG1DQUFRLEdBQVI7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFD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SSxDQUFDLEtBQUssQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQTltQkQsSUE4bUJDO0FBOW1CWSxnQkFBZ0I7SUFONUIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLENBQUM7cUNBa0RvQixhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSxzQ0FBYyxzQkFFdEIsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQXhEWixnQkFBZ0IsQ0E4bUI1QjtBQTltQlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBOZ1pvbmUsIE9uSW5pdCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tICdAbnN0dWRpby9uYXRpdmVzY3JpcHQtY2FtZXJhLXBsdXMnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dPcHRpb25zLCBNb2RhbERpYWxvZ1NlcnZpY2UgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgSW1hZ2VBc3NldCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2UtYXNzZXQnO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBDYXB0dXJlIGNvbXBvbmVudCBjbGFzcywgd2hpY2ggaXMgYmVpbmcgdXNlZCB0byBjYXB0dXJlIGltYWdlIGZyb20gY2FtZXJhLlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWNhcHR1cmUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vY2FwdHVyZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhcHR1cmUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBDYXB0dXJlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQ2FtZXJhIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHByaXZhdGUgY2FtOiBhbnk7XG4gICAgLyoqIEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeUJ0bjogYW55O1xuICAgIC8qKiBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY0J0bjogYW55O1xuICAgIC8qKiBBdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c0J0bjogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGdhbGxlcnlQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgVGFrZSBwaWN0dXJlIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIHRha2VQaWNQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgYXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBhdXRvZm9jdXNQYXJhbXM6IGFueTtcbiAgICAvKiogRW1wdHkgc3RyaW5nIHZhcmlhYmxlICovXG4gICAgcHJpdmF0ZSBlbXB0eTogYW55ID0gbnVsbDtcbiAgICAvLyAvKiogTG9jYWxpemF0aW9uICovXG4gICAgLy8gcHJpdmF0ZSBsb2NhbGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNhdmUgYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSBzYXZlQnRuTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIG1hbnVhbCBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIG1hbnVhbEJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciBwZXJmb3JtIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciByZXRha2UgYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSByZXRha2VCdG5MYWJsZTogYW55O1xuXG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gY2hlY2sgdGhlIGNhbWVyYSBpcyB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDYW1lcmFWaXNpYmxlOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHNvdXJjZSAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogSW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAvKiogT3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBVUkkgKi9cbiAgICBwdWJsaWMgaW1nVVJJOiBhbnk7XG4gICAgLyoqIE9wZW5DViBpbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwdWJsaWMgb3BlbmN2SW5zdGFuY2U6IGFueTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBDYXB0dXJlQ29tcG9uZW50LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB6b25lIEFuZ3VsYXIgem9uZSB0byBydW4gYSB0YXNrIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBtb2RhbFNlcnZpY2UgU2VydmljZSBtb2RhbFxuICAgICAqIEBwYXJhbSB2aWV3Q29udGFpbmVyUmVmIFZpZXcgY29udGFpbmVyIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlclxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5kaWNhdGlvblxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgLy8gcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0aW9uUmVmOiBDaGFuZ2VEZXRlY3RvclJlZlxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyLFxuICAgICAgICBwcml2YXRlIGxvY2FsZTogTCxcbiAgICApIHtcbiAgICAgICAgLy8gdGhpcy5sb2NhbGUgPSBuZXcgTCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBpbml0aWFsaXplcyBPcGVuQ1YgbW9kdWxlIGFuZCBidXR0b25zIGxpa2VcbiAgICAgKiB0YWtlUGljdHVyZSwgZ2FsbGVyeSBhbmQgYXV0b0ZvY3VzIGJ1dHRvbnMgaW4gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgT3BlbkNWLi4uJyk7XG4gICAgICAgIHRoaXMub3BlbmN2SW5zdGFuY2UgPSBvcGVuY3YuaW5pdE9wZW5DVigpO1xuICAgICAgICB0aGlzLmlzQ2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIGNhbWVyYSBpcyBsb2FkZWQsIHdoZXJlIGFsbCB0aGUgbmVjY2Vzc2FyeSB0aGluZ3MgbGlrZVxuICAgICAqIGRpc3BsYXlpbmcgYnV0dG9ucyh0YWtlUGljdHVyZSwgZ2FsbGVyeSwgZmxhc2gsIGNhbWVyYSAmIGF1dG9Gb2N1cykgb24gY2FtZXJhIHZpZXdcbiAgICAgKiBhcmUgdGFrZW4gY2FyZSBhbmQgYWxzbyBpbml0aWFsaXplcyBjYW1lcmEgaW5zdGFuY2UuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgQ2FtZXJhUGx1cyBpbnN0YW5jZSByZWZlcnJlbmNlLlxuICAgICAqL1xuICAgIGNhbUxvYWRlZChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gdGhpcy5zYXZlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NhdmUnKTtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxCdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIC8vIHRoaXMucmV0YWtlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3JldGFrZScpO1xuICAgICAgICAvLyB0aGlzLnBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgncGVyZm9ybScpO1xuXG4gICAgICAgIHRoaXMuY2FtID0gYXJncy5vYmplY3QgYXMgQ2FtZXJhUGx1cztcbiAgICAgICAgY29uc3QgZmxhc2hNb2RlID0gdGhpcy5jYW0uZ2V0Rmxhc2hNb2RlKCk7XG5cbiAgICAgICAgLy8gVHVybiBmbGFzaCBvbiBhdCBzdGFydHVwXG4gICAgICAgIGlmIChmbGFzaE1vZGUgPT09ICdvbicpIHtcbiAgICAgICAgICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2IgPSBuZXcgYW5kcm9pZC5oYXJkd2FyZS5DYW1lcmEuQXV0b0ZvY3VzTW92ZUNhbGxiYWNrKFxuXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX3RoaXM6IHRoaXMsXG4gICAgICAgICAgICAgICAgb25BdXRvRm9jdXNNb3Zpbmcoc3RhcnQ6IGFueSwgY2FtZXJhOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0ZSA9IHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLmFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyZWVuIGNvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgwLjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2V0RHVyYXRpb24oMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZCBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZjAwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5jYW0uY2FtZXJhKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS5jYW1lcmEuc2V0QXV0b0ZvY3VzTW92ZUNhbGxiYWNrKGNiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJncy5kYXRhKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VQaWNCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeUJ0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uc2hvd1RvZ2dsZUljb24gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uX2luaXRGbGFzaEJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLl9pbml0VG9nZ2xlQ2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBURVNUIFRIRSBJQ09OUyBTSE9XSU5HL0hJRElOR1xuICAgICAgICAvLyB0aGlzLmNhbS5zaG93Q2FwdHVyZUljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dHYWxsZXJ5SWNvbiA9IGZhbHNlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd1RvZ2dsZUljb24gPSBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaW5pdGlhbGl6ZXMgY2FtZXJhIGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgICovXG4gICAgaW5pdENhbWVyYUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGFrZVBpY0J0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLnRha2VQaWNCdG4sIHRoaXMudGFrZVBpY1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGdhbGxlcnkgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC4gQW5kIGFsc28gc2V0c1xuICAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAgKi9cbiAgICBpbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5nYWxsZXJ5QnRuKTtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuZ2FsbGVyeUJ0biwgdGhpcy5nYWxsZXJ5UGFyYW1zKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaW5pdGlhbGl6ZXMgYXV0b0ZvY3VzIGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgICovXG4gICAgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5hdXRvZm9jdXNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5hdXRvZm9jdXNCdG4sIHRoaXMuYXV0b2ZvY3VzUGFyYW1zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0YWtlIHBpY3R1cmUgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGFrZVBpY0J0biwgJ2ljX2NhbWVyYScpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlVHJhbnNwYXJlbnRDaXJjbGVEcmF3YWJsZSgpO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZmZmZmYnKTsgLy8gd2hpdGUgY29sb3JcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ2xpY2soYXJnczogYW55KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGFrZVBpY0Zyb21DYW0oX3RoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBpbWFnZSBidXR0b24uIEFjdHVhbGx5IGl0IGNyZWF0ZXMgaW1hZ2UgYnV0dG9uIGFuZCBzZXR0aW5nXG4gICAgICogaXQncyBwcm9wZXJ0aWVzIGxpa2UgaW1hZ2UgaWNvbiwgc2hhcGUgYW5kIGNvbG9yIGFsb25nIHdpdGggY2xpY2sgZXZlbnQgbGlzdGVuZXIgaW4gaXQuXG4gICAgICovXG4gICAgY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4gPSB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmF1dG9mb2N1c0J0biwgJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuICAgICAgICAvLyB0aGlzLmF1dG9mb2N1c0J0bi5zZXRJbWFnZVJlc291cmNlKG9wZW5HYWxsZXJ5RHJhd2FibGUpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgaW1hZ2UgYnV0dG9uIHdpdGggaGVscCBJbWFnZVZpZXcgd2lkZ2V0IGFuZCBzZXR0aW5nc1xuICAgICAqIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIGhlaWdodCwgd2lkdGgsIGNvbG9yICYgc2NhbGVUeXBlLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNTgpO1xuICAgICAgICBidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpOyAvLyBHcmVlbiBjb2xvclxuICAgICAgICBidG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGdhbGxlcnkgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhY3R1YWwgaWNvbiBpbWFnZSB1c2luZyBpY29uIG5hbWUgZnJvbSBjb250ZXh0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpY29uTmFtZSBJY29uIE5hbWVcbiAgICAgKi9cbiAgICBnZXRJbWFnZURyYXdhYmxlKGljb25OYW1lOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBkcmF3YWJsZUlkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0XG4gICAgICAgICAgICAuZ2V0UmVzb3VyY2VzKClcbiAgICAgICAgICAgIC5nZXRJZGVudGlmaWVyKGljb25OYW1lLCAnZHJhd2FibGUnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG4gICAgICAgIHJldHVybiBkcmF3YWJsZUlkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRyYW5zcGFyZW50IGNpcmNsZSBzaGFwZSB3aXRoIGhlbHAgb2YgR3JhZGllbnREcmF3YWJsZSBvYmplY3RcbiAgICAgKiBhbmQgc2V0cyBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBjb2xvciwgcmFkaXVzIGFuZCBhbHBoYS5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIHNoYXBlIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTogYW55IHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5HcmFkaWVudERyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldENvbG9yKDB4OTkwMDAwMDApO1xuICAgICAgICBzaGFwZS5zZXRDb3JuZXJSYWRpdXMoOTYpO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgxNTApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBzaGFwZSB1c2luZyBTaGFwZURyYXdhYmxlIG9iamVjdCBhbmRcbiAgICAgKiBzZXRzIGFscGhhLlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgc2hhcGUgb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTogYW55IHtcblxuICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBhbmRyb2lkLmdyYXBoaWNzLmRyYXdhYmxlLlNoYXBlRHJhd2FibGUoKTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIG9mIEltYWdlQnV0dG9uIHdpZGdldFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIG1heEhlaWdodCAmIG1heHdpZHRoLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoNTgpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaG90byBjYXB0dXJlZCBldmVudCBmaXJlcyB3aGVuIGEgcGljdHVyZSBpcyB0YWtlbiBmcm9tIGNhbWVyYSwgd2hpY2ggYWN0dWFsbHlcbiAgICAgKiBsb2FkcyB0aGUgY2FwdHVyZWQgaW1hZ2UgZnJvbSBJbWFnZUFzc2V0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIEltYWdlIGNhcHR1cmVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwaG90b0NhcHR1cmVkRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQSE9UTyBDQVBUVVJFRCBFVkVOVCEhIScpO1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShhcmdzLmRhdGEgYXMgSW1hZ2VBc3NldCk7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIFRoaXMgaXMgYmVlbiBjYWxsZWQgd2hlbiB0b2dnbGUgdGhlIGNhbWVyYSBidXR0b24uXG4gICAgLy8gICogQHBhcmFtIGFyZ3MgQ2FtZXJhIHRvZ2dsZSBldmVudCBkYXRhXG4gICAgLy8gICovXG4gICAgLy8gdG9nZ2xlQ2FtZXJhRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdjYW1lcmEgdG9nZ2xlZCcpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIHRvZ2dsZSB0aGUgZmxhc2ggaWNvbiBvbiBjYW1lcmEuIFRoaXMgYWN0dWFsbHlcbiAgICAgKiBmbGFzaCBvZmYgd2hlbiBpdCBhbHJlYWR5IGlzIG9uIG9yIHZpY2UtdmVyc2EuXG4gICAgICovXG4gICAgdG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW0udG9nZ2xlRmxhc2goKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGRpc3BsYXkgZmxhc2ggaWNvbiBiYXNlZCBvbiBpdCdzIHByb3BlcnR5IHZhbHVlIHRydWUvZmFsc2UuXG4gICAgICovXG4gICAgdG9nZ2xlU2hvd2luZ0ZsYXNoSWNvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuY2FtLnNob3dGbGFzaEljb259YCk7XG4gICAgICAgIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSAhdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHN3aXRjaCBmcm9udC9iYWNrIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVUaGVDYW1lcmEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUNhbWVyYSgpO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBPcGVuIGNhbWVyYSBsaWJyYXJ5LlxuICAgIC8vICAqL1xuICAgIC8vIG9wZW5DYW1QbHVzTGlicmFyeSgpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy5jYW0uY2hvb3NlRnJvbUxpYnJhcnkoKTtcbiAgICAvLyB9XG4gICAgLyoqXG4gICAgICogVGFrZXMgcGljdHVyZSBmcm9tIGNhbWVyYSB3aGVuIHVzZXIgcHJlc3MgdGhlIHRha2VQaWN0dXJlIGJ1dHRvbiBvbiBjYW1lcmEgdmlldy5cbiAgICAgKiBUaGVuIGl0IHNldHMgdGhlIGNhcHR1cmVkIGltYWdlIFVSSSBpbnRvIGltYWdlU291cmNlIHRvIGJlIGRpc3BsYXllZCBpbiBmcm9udC1lbmQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHRoaXNQYXJhbSBDb250YWlucyBjYW1lcmFwbHVzIGluc3RhbmNlXG4gICAgICovXG4gICAgdGFrZVBpY0Zyb21DYW0odGhpc1BhcmFtOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpc1BhcmFtLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpc1BhcmFtLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSXQgdGFrZXMgdG8gaW1hZ2UgZ2FsbGVyeSB2aWV3IHdoZW4gdXNlciBjbGlja3Mgb24gZ2FsbGVyeSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2cgd2luZG93IGFmdGVyIHRha2luZyBwaWN0dXJlLiBUaGlzIGlzIG1vZGFsIHdpbmRvdyBhbG9uZyB3aXRoXG4gICAgICogcmV1aXJlZCBvcHRpb25zIGxpa2UgY2FwdHVyZSBpbWFnZSBVUkksIHRyYW5zZm9ybWVkIGltYWdlIFVSSSwgcmVjdGFuZ2xlIHBvaW50cyBhbmQgZXRjLlxuICAgICAqIFRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGRlbGV0aW5nIHRoZSBjYXB0dXJlZCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gcmV0YWtlICh1c2luZyBSZXRha2UgYnV0dG9uKVxuICAgICAqIHBpY3R1cmUgYW5kLCBjcmVhdGVzIHRodW1ibmFpbCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gc2F2ZSB0aGUgY2FwdHVyZWQgaW1hZ2UgYW5kXG4gICAgICogc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpY29uIGJ1dHRvbiBpbiBjYW1lcmEgdmlldy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZnVsbFNjcmVlbiBPcHRpb24gdG8gc2hvdyBmdWxsc2NyZWVuIGRpYWxvZyBvciBub3RcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVjUG9pbnRzU3RyIFJlY3RhbmdsZSBwb2ludHMgaW4gc3RyaW5nXG4gICAgICovXG4gICAgc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyhmdWxsU2NyZWVuOiBib29sZWFuLCBmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgcmVjUG9pbnRzU3RyKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZTogaW1nVVJJLFxuICAgICAgICAgICAgICAgIGltYWdlU291cmNlT3JnOiBmaWxlUGF0aE9yZyxcbiAgICAgICAgICAgICAgICBpc0F1dG9Db3JyZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgICAgIHJlY3RhbmdsZVBvaW50czogcmVjUG9pbnRzU3RyLFxuICAgICAgICAgICAgICAgIC8vIHNhdmVCdG5MYWJsZTogdGhpcy5zYXZlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gbWFudWFsQnRuTGFibGU6IHRoaXMubWFudWFsQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gcmV0YWtlQnRuTGFibGU6IHRoaXMucmV0YWtlQnRuTGFibGUsXG4gICAgICAgICAgICAgICAgLy8gcGVyZm9ybUJ0bkxhYmxlOiB0aGlzLnBlcmZvcm1CdG5MYWJsZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiBmdWxsU2NyZWVuLFxuICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKERpYWxvZ0NvbnRlbnQsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoZGlhbG9nUmVzdWx0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGlhbG9nUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBkaWxvZ1Jlc3VsdFRlbXAgPSBkaWFsb2dSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChkaWFsb2dSZXN1bHQuaW5kZXhPZignX1RFTVAnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGlsb2dSZXN1bHRUZW1wID0gZGlsb2dSZXN1bHRUZW1wLnJlcGxhY2UoJ19URU1QJyArIGksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHR9XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm1lZEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGRpYWxvZ1Jlc3VsdCwgJ0FkZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdGaWxlT3JnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU9yZy5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVUkkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZG8gOiB0byBiZSByZW1vdmVkIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVcmlDb250b3VyUGF0aCA9IGltZ1VSSS5zdWJzdHJpbmcoMCwgaW1nVVJJLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJQ29udG91ckZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdVUklDb250b3VyRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUNvbnRvdXJGaWxlLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyAtIEVuZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgaW1nVVJJLCAnUmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NvdWxkX25vdF9kZWxldGVfdGhlX2NhcHR1cmVfaW1hZ2UnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpbWFnZSBidXR0b24uXG4gICAgICogXG4gICAgICogQHBhcmFtIGltZ1VSSVBhcmFtIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgVVJJXG4gICAgICovXG4gICAgc2V0VHJhbnNmb3JtZWRJbWFnZShpbWdVUklQYXJhbTogYW55KSB7XG4gICAgICAgIGlmIChpbWdVUklQYXJhbSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9zZXR0aW5nX2ltYWdlX2luX3ByZXZpZXdfYXJlYScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgdGFrZVBpY3R1cmUgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gSE9SSVpPTlRBTF9DRU5URVJcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgYXV0b0ZvY3VzIGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmhlaWdodCA9ICczMDAnO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQ0VOVEVSXG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmFkZFJ1bGUoMTMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGltYWdlIHJlc291cmNlIHRvIGdpdmVuIGltYWdlIGJ1dHRvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYnRuIEJ1dHRvbiBpbWFnZSBpbnN0YW5jZSByZWZlcnJlbmNlXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gbmFtZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SW1hZ2VSZXNvdXJjZShidG46IGFueSwgaWNvbk5hbWU6IGFueSkge1xuICAgICAgICBjb25zdCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTtcbiAgICAgICAgYnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciBnYWxsZXJ5IGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVJbWFnZUdhbGxlcnJ5UGFyYW1zKCkge1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0xFRlRcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoOSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZnJlc2hlcyB0aGUgY2FwdHVyZWQgaW1hZ2VzIGluIG1lZGlhIHN0b3JlIG1lYW5pbmcgdGhhdCB0aGUgbmV3IGNhcHR1cmVkIGltYWdlIHdpbGwgYmVcbiAgICAgKiBhdmFpbGFibGUgdG8gcHVibGljIGFjY2Vzcy4gVGhhdCBjYW4gYmUgZG9uZSBieSBTZW5kQnJvYWRjYXN0SW1hZ2UgbWV0aG9kLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIEltYWdlIGZpbGUgVVJJXG4gICAgICogQHBhcmFtIGFjdGlvbiBBY3Rpb25zICdBZGQnLydSZW1vdmUnXG4gICAgICovXG4gICAgcHJpdmF0ZSByZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmc6IHN0cmluZywgaW1nVVJJOiBzdHJpbmcsIGFjdGlvbjogc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoZmlsZVBhdGhPcmcpO1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB0aGlzIHRodW1ibmFpbCBpbWFnZSB3aWxsIGJlIGF2YWlsYWJsZSBvbmx5IGluICdBZGQnIGNhc2UuXG4gICAgICAgICAgICBpZiAoYWN0aW9uID09PSAnQWRkJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGltZ1VSSS5yZXBsYWNlKCdQVF9JTUcnLCAndGh1bWJfUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRodW1uYWlsT3JnUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NvdWxkX25vdF9zeW5jX3RoZV9jYXB0dXJlZF9pbWFnZV9maWxlJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGh1bWJuYWlsIGltYWdlIGZvciB0aGUgY2FwdHVyZWQgdHJhbnNmb3JtZWQgaW1hZ2UgYW5kIHNldHMgaXQgaW4gZ2FsbGVyeSBidXR0b24uXG4gICAgICogXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRodW1iTmFpbEltYWdlKGltZ1VSSTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEltYWdlUGF0aCA9IG9wZW5jdi5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdmFyIHRodW1ibmFpbEltYWdlUGF0aCA9IGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuICAgICAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKCdmaWxlOi8vJyArIHRodW1ibmFpbEltYWdlUGF0aCk7XG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VVUkkodXJpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfY3JlYXRpbmdfdGh1bWJuYWlsX2ltYWdlJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogUGVyZm9ybSBhZGFwdGl2ZSB0aHJlc2hvbGQuXG4gICAgLy8gICogQHBhcmFtIHRocmVzaG9sZFZhbHVlIFRocmVzaG9sZCB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcbiAgICAvLyAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSB1c2luZyBPcGVuQ1YgQVBJIGFuZFxuICAgICAqIHJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbG9uZyB3aXRoIHJlY3RhbmdsZSBwb2ludHMgYXMgc3RyaW5nIHdoaWNoIHdpbGwgYmUgdXNlZCB0b1xuICAgICAqIGRyYXcgY2lyY2xlIHBvaW50cy4gQWZ0ZXIgdGhhdCBpdCBzaG93cyB1cCB0aGUgZGlhbG9nIG1vZGFsIHdpbmRvdyB3aXRoIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aDogYW55KTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbWdVUklUZW1wID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoLCAnJyk7XG4gICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVRlbXAuc3Vic3RyaW5nKDAsIGltZ1VSSVRlbXAuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzU3RyID0gaW1nVVJJVGVtcC5zdWJzdHJpbmcoaW1nVVJJVGVtcC5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJLCByZWN0YW5nbGVQb2ludHNTdHIpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX3BlcmZvcm1pbmdfcGVyc3BlY3RpdmVfdHJhbnNmb3JtYXRpb24nKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHBlcmZvcm0gcHJlc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSBcbiAgICAgKiBhbmQgc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGluIHRoaXMuaW1nVVJJIHZhcmlhYmxlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbWFnZUFzc2V0IEltYWdlQXNzZXQgb2JqZWN0IGluc3RhbmNlIHJlZmVycmVuY2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRJbWFnZShpbWFnZUFzc2V0OiBJbWFnZUFzc2V0KTogdm9pZCB7XG4gICAgICAgIGlmIChpbWFnZUFzc2V0KSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UuZnJvbUFzc2V0KGltYWdlQXNzZXQpLnRoZW4oXG4gICAgICAgICAgICAgICAgKGltZ1NyYykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcCA9IChpbWFnZUFzc2V0LmlvcykgPyBpbWFnZUFzc2V0LmlvcyA6IGltYWdlQXNzZXQuYW5kcm9pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcC5pbmRleE9mKCcucG5nJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdpbWFnZV9zb3VyY2VfaXNfYmFkJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBnZXR0aW5nIGltYWdlIHNvdXJjZSBmcm9tIGFzc2V0LiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3JfZ2V0dGluZ19pbWFnZV9zb3VyY2VfZnJvbV9hc3NldCcpLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdJbWFnZSBBc3NldCB3YXMgbnVsbC4gJyArIG1vZHVsZS5maWxlbmFtZSk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2ltYWdlX2Fzc2V0X3dhc19udWxsJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=