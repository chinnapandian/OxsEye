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
var application_1 = require("tns-core-modules/application");
var platform_1 = require("tns-core-modules/platform");
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
        /** Poisition to place slider component */
        // private screenHeight = 0;
        /** Canny threshold value     */
        this.thresholdValue = 0;
    }
    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    CaptureComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        // this.isLabelVisible = false;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createThresholdImageButtonPlus();
        this.createThresholdImageButtonMinus();
        this.createAutoFocusImage();
        if (!platform_1.isAndroid) {
            return;
        }
        application.android.on(application_1.AndroidApplication.activityBackPressedEvent, function (data) {
            if (_this.router.isActive("/capture", false)) {
                data.cancel = true; // prevents default back button behavior
                data.activity.moveTaskToBack(true);
            }
        });
    };
    CaptureComponent.prototype.setSliderPoistion = function () {
        this.thresholdValue = 50;
        var plusPercentageWidth = 0.85;
        var plusPercentageHeight = 0.67;
        var minusPercentageWidth = 0.85;
        var minusPercentageHeight = 0.75;
        var rotation = application.android.foregroundActivity
            .getWindowManager()
            .getDefaultDisplay()
            .getRotation();
        if (rotation == 1) {
            plusPercentageWidth = 0.85;
            plusPercentageHeight = 0.56;
            minusPercentageWidth = 0.85;
            minusPercentageHeight = 0.70;
        }
        this.initThresholdButtonPlus(plusPercentageWidth, plusPercentageHeight);
        this.initThresholdButtonMinus(minusPercentageWidth, minusPercentageHeight);
        // this.screenHeight = (screen.mainScreen.heightDIPs * percentage);
        // this.labelHeight = plusPercentageHeight;// * 0.65;
    };
    CaptureComponent.prototype.onUnloaded = function (args) {
        var cameraPlus = args.object;
        if (cameraPlus) {
            if (cameraPlus.ocvCameraView) {
                cameraPlus.ocvCameraView.disableView();
            }
            cameraPlus._nativeView.removeView(cameraPlus.ocvCameraView);
        }
        console.log('onUnloaded called');
    };
    CaptureComponent.prototype.onCannyThresholdValueChange = function (threshold, sound) {
        var audioManager = application.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        audioManager.playSoundEffect(sound, 0.5);
        console.log('onCannyThresholdValueChange called', threshold);
        this.cam.ocvCameraView.cannyThreshold = threshold;
        var label = this.cam.page.getViewById("thresholdLabelId");
        label.text = threshold;
        label.textWrap = true;
        label.textAlignment = "center";
        label.visibility = 'visible';
        console.log('this.cam.ocvCameraView.cannyThreshold: ', this.cam.ocvCameraView.cannyThreshold);
        setTimeout(function () {
            label.visibility = 'collapse';
        }, 200);
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
        // if(!this.cam.nativeView || this.cam.nativeView == null) {
        //     this.cam._nativeView.removeAllViews(); // = this.cam._nativeView;
        // }
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
            this.cam.showFlashIcon = false;
            this.cam.showToggleIcon = false;
            try {
                this.initImageGalleryButton();
                this.initCameraButton();
                // this.initThresholdButtonPlus();
                // this.initThresholdButtonMinus();
                this.initAutoFocusImageButton();
                this.cam._takePicBtn = this.takePicBtn;
            }
            catch (e) {
                this.takePicBtn = null;
                this.galleryBtn = null;
                this.autofocusBtn = null;
                this.takePicParams = null;
                this.galleryParams = null;
                this.autofocusParams = null;
                this.cam.showToggleIcon = false;
                this.createTakePictureButton();
                this.createImageGalleryButton();
                this.createAutoFocusImage();
                this.initImageGalleryButton();
                this.initCameraButton();
                this.initAutoFocusImageButton();
                this.cam._takePicBtn = this.takePicBtn;
                // this.cam._initFlashButton();
                // this.cam._initToggleCameraButton();
            }
        }
        this.setSliderPoistion();
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
        this.cam._nativeView.removeView(this.takePicBtn);
        this.cam._nativeView.addView(this.takePicBtn, this.takePicParams);
    };
    /**
     * This method initializes gallery button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this.cam._nativeView.removeView(this.galleryBtn);
        this.cam._nativeView.addView(this.galleryBtn, 0, this.galleryParams);
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
        this.cam._nativeView.bringChildToFront(this.galleryBtn);
    };
    CaptureComponent.prototype.initThresholdButtonPlus = function (percentageWidth, percentageHeight) {
        console.log('initThresholdButtonPlus called...');
        this.cam._nativeView.removeView(this.thresholdBtnPlus);
        var btnY = platform_1.screen.mainScreen.heightPixels * percentageHeight;
        var btnX = platform_1.screen.mainScreen.widthPixels * percentageWidth; //widthDIPs;// * 0.75;
        this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnPlus, this.thresholdBtnPlusParams);
    };
    CaptureComponent.prototype.initThresholdButtonMinus = function (percentageWidth, percentageHeight) {
        console.log('initThresholdButtonMinus called...');
        this.cam._nativeView.removeView(this.thresholdBtnMinus);
        var btnY = platform_1.screen.mainScreen.heightPixels * percentageHeight;
        var btnX = platform_1.screen.mainScreen.widthPixels * percentageWidth; //widthDIPs;// * 0.75;
        this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnMinus, this.thresholdBtnMinusParams);
        // this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
        // this.cam._nativeView.bringChildToFront(this.thresholdBtnMinus);
    };
    /**
     * This method initializes autoFocus button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this.cam._nativeView.removeView(this.autofocusBtn);
        this.cam._nativeView.addView(this.autofocusBtn, this.autofocusParams);
    };
    /**
     * Creates take picture button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this.takePicBtn = this.createTakePicButton();
        this.setImageResource(this.takePicBtn, 'ic_camera_alt_white');
        var shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor('#ffffff'); // white color
        this.takePicBtn.setColorFilter(color);
        this.takePicBtn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
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
    CaptureComponent.prototype.createThresholdImageButtonPlus = function () {
        var _this = this;
        this.thresholdBtnPlus = this.createImageButton();
        this.thresholdBtnPlus.setPadding(34, 5, 34, 34);
        this.setImageResource(this.thresholdBtnPlus, 'ic_add_circle_white_3x');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);
        var galleryBtnPlusId = application.android.context.getResources()
            .getIdentifier('threshold_btn_plus', 'id', application.android.context.getPackageName());
        this.thresholdBtnPlus.setTag(galleryBtnPlusId, 'threshold-btn-plus-tag');
        this.thresholdBtnPlus.setContentDescription('threshold-btn-plus-dec');
        var shape = this.createCircleDrawableForThresholdBtn();
        this.thresholdBtnPlus.setBackgroundDrawable(shape);
        this.thresholdBtnPlus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        this.thresholdBtnPlus.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (view) {
                console.log('onClick called....');
                // args.playSoundEffect(android.view.SoundEffectConstants.CLICK);
                _this.thresholdValue++;
                _this.onCannyThresholdValueChange(_this.thresholdValue, android.view.SoundEffectConstants.NAVIGATION_UP);
            },
        }));
        // this.thresholdBtnPlus.setOnTouchListener(new android.view.View.OnTouchListener({
        //     onTouch(view: any, motionEvent: any) {
        //         console.log('onTouch called....', motionEvent.getActionMasked());
        //         view.setPressed(true);
        //         view.performClick();
        //         view.setPressed(false);
        //         return true;
        //     }
        // }));
        // this.thresholdBtnPlus.setOnLongClickListener(new android.view.View.OnLongClickListener({
        //     onLongClick(view: any) {
        //         console.log('onLongClicked called');
        //         // view.setPressed(true);
        //         // view.setPressed(false);
        //         // _this.thresholdValue++;
        //         //  _this.onCannyThresholdValueChange(_this.thresholdValue);
        //         return true;
        //     },
        // }));
        // this.thresholdBtnPlus.setOnKeyListener(new android.view.View.OnKeyListener({
        //     onKey(view: any, keyCode: any, keyEvent: any) {
        //         console.log('onKey called');
        //         // _this.thresholdValue++;
        //         //  _this.onCannyThresholdValueChange(_this.thresholdValue);
        //         return true;
        //     },
        // }));
        this.createThresholdBtnPlusParams();
    };
    CaptureComponent.prototype.createThresholdBtnPlusParams = function () {
        this.thresholdBtnPlusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.thresholdBtnPlusParams.width = '70';
        this.thresholdBtnPlusParams.height = '105';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = screen.mainScreen.heightDIPs * 0.78;
        // const btnX = screen.mainScreen.widthDIPs;//widthDIPs;// * 0.75;
        var btnY = platform_1.screen.mainScreen.heightPixels * 0.66;
        var btnX = platform_1.screen.mainScreen.widthPixels * 0.85; //widthDIPs;// * 0.75;
        this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        // // ALIGN_PARENT_BOTTOM
        // this.thresholdBtnPlusParams.addRule(12);
        // // ALIGN_PARENT_RIGHT
        // this.thresholdBtnPlusParams.addRule(11);
    };
    CaptureComponent.prototype.createThresholdImageButtonMinus = function () {
        var _this = this;
        this.thresholdBtnMinus = this.createImageButton();
        this.thresholdBtnMinus.setPadding(34, 34, 34, 5);
        this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);
        // const galleryBtnPlusId = application.android.context.getResources()
        //     .getIdentifier('threshold_btn_minus', 'id', application.android.context.getPackageName());
        // this.thresholdBtnPlus.setTag(galleryBtnPlusId, 'threshold-btn-plus-tag');
        this.thresholdBtnMinus.setContentDescription('threshold-btn-plus-dec');
        var shape = this.createCircleDrawableForThresholdBtn();
        this.thresholdBtnMinus.setBackgroundDrawable(shape);
        this.thresholdBtnMinus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        this.thresholdBtnMinus.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.thresholdValue--;
                _this.onCannyThresholdValueChange(_this.thresholdValue, android.view.SoundEffectConstants.NAVIGATION_DOWN);
            },
        }));
        this.createThresholdBtnMinusParams();
    };
    CaptureComponent.prototype.createThresholdBtnMinusParams = function () {
        this.thresholdBtnMinusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.thresholdBtnMinusParams.width = '70';
        this.thresholdBtnMinusParams.height = '105';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = screen.mainScreen.heightDIPs * 0.78;
        // const btnX = screen.mainScreen.widthDIPs;//widthDIPs;// * 0.75;
        var btnY = platform_1.screen.mainScreen.heightPixels * 0.74;
        var btnX = platform_1.screen.mainScreen.widthPixels * 0.85; //widthDIPs;// * 0.75;
        this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        // // ALIGN_PARENT_BOTTOM
        // this.thresholdBtnPlusParams.addRule(12);
        // // ALIGN_PARENT_RIGHT
        // this.thresholdBtnPlusParams.addRule(11);
    };
    CaptureComponent.prototype.createCircleDrawableForThresholdBtn = function () {
        var shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000); //(0xFFFFFFFF); //(0x99000000);
        shape.setCornerRadius(10);
        shape.setAlpha(100);
        return shape;
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
        shape.setCornerRadius(100);
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
     * Creates image button with help of ImageButton widget
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns button object
     */
    CaptureComponent.prototype.createTakePicButton = function () {
        var btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(14, 14, 14, 14);
        btn.setMaxHeight(178);
        btn.setMaxWidth(178);
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
    CaptureComponent.prototype.toggleCameraEvent = function (args) {
        console.log('camera toggled');
    };
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
                if (!_this.imgURIList.isEmpty()) {
                    _this.setTransformedImage(dialogResult);
                    for (var i = 0; i < _this.imgURIList.size(); i++) {
                        var imgURITemp = _this.imgURIList.get(i);
                        _this.createThumbNailImage(imgURITemp);
                        _this.refreshCapturedImagesinMediaStore(filePathOrg, imgURITemp, 'Add');
                    }
                }
                _this.cam.camera.startPreview();
            }
            else {
                try {
                    var imgFileOrg = fs.File.fromPath(filePathOrg);
                    if (imgFileOrg) {
                        imgFileOrg.removeSync();
                    }
                    if (!_this.imgURIList.isEmpty()) {
                        for (var i = 0; i < _this.imgURIList.size(); i++) {
                            var imgURITemp = _this.imgURIList.get(i);
                            var imgURIFile = fs.File.fromPath(imgURITemp);
                            if (imgURIFile) {
                                imgURIFile.removeSync();
                            }
                            // // Todo : to be removed later
                            // const imgUriContourPath = imgURI.substring(0, imgURI.indexOf('_transformed')) + '_contour.jpg';
                            // const imgURIContourFile: fs.File = fs.File.fromPath(imgUriContourPath);
                            // if (imgURIContourFile) {
                            //     imgURIContourFile.removeSync();
                            //     SendBroadcastImage(imgUriContourPath);
                            // }
                            // // Todo - End
                            _this.refreshCapturedImagesinMediaStore(filePathOrg, imgURITemp, 'Remove');
                        }
                    }
                    _this.cam.camera.startPreview();
                }
                catch (error) {
                    Toast.makeText(_this.locale.transform('could_not_delete_the_capture_image') + error, 'long').show();
                    _this.logger.error(module.filename + ': ' + error);
                    _this.cam.camera.startPreview();
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
        this.takePicParams.width = '150';
        this.takePicParams.height = '150';
        this.takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.takePicParams.addRule(12);
        // CENTER_HORIZONTAL
        this.takePicParams.addRule(14);
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
            // const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            // this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            var rectanglePointsStr = 'RPTSTR'; //imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            // this.imgURI = this.cam.ocvCameraView.transform(filePath);
            this.imgURIList = this.cam.ocvCameraView.transformMore(filePath);
            if (!this.imgURIList.isEmpty()) {
                this.imgURI = this.imgURIList.get(0);
                for (var i = 0; i < this.imgURIList.size(); i++) {
                    transformedimage_provider_1.SendBroadcastImage(this.imgURIList.get(i));
                }
                this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
            }
            else {
                this.activityLoader.hide();
                Toast.makeText(this.locale.transform('no_image_captured'), 'long').show();
                this.cam.camera.startPreview();
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBNEU7QUFDNUUsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFFNUQsaUZBQXlFO0FBQ3pFLCtEQUEyRDtBQUMzRCxvRkFBNEU7QUFFNUUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxtREFBcUQ7QUFDckQsMENBQTRDO0FBQzVDLGlEQUFtRDtBQUVuRCwwREFBNEQ7QUFHNUQsNERBQXVHO0FBQ3ZHLHNEQUE4RDtBQUk5RDs7R0FFRztBQU9ILElBQWEsZ0JBQWdCO0lBc0R6Qjs7Ozs7Ozs7T0FRRztJQUNILDBCQUNZLElBQVksRUFDWixZQUFnQyxFQUNoQyxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLGNBQThCO1FBQ3RDLGlEQUFpRDtRQUN6QyxNQUFvQixFQUNwQixNQUFTO1FBUFQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFFOUIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixXQUFNLEdBQU4sTUFBTSxDQUFHO1FBcERyQiw0QkFBNEI7UUFDcEIsVUFBSyxHQUFRLElBQUksQ0FBQztRQWMxQiwrQkFBK0I7UUFDeEIsZ0JBQVcsR0FBZ0IsSUFBSSwwQkFBVyxFQUFFLENBQUM7UUFPcEQsMENBQTBDO1FBQzFDLDRCQUE0QjtRQUM1QixnQ0FBZ0M7UUFDeEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7SUE0QjNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxtQ0FBUSxHQUFSO1FBQUEsaUJBb0JDO1FBbkJHLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsY0FBYyxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QiwrQkFBK0I7UUFDL0IsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDaEMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7UUFDdEMsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsQ0FBQyxvQkFBUyxDQUFDLENBQUMsQ0FBQztZQUNiLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxXQUFXLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxnQ0FBa0IsQ0FBQyx3QkFBd0IsRUFBRSxVQUFDLElBQXlDO1lBQzFHLEVBQUUsQ0FBQyxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsd0NBQXdDO2dCQUM1RCxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2QyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDO0lBQ0QsNENBQWlCLEdBQWpCO1FBQ0ksSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDekIsSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7UUFDL0IsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDaEMsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7UUFDaEMsSUFBSSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7UUFDakMsSUFBSSxRQUFRLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0I7YUFDaEQsZ0JBQWdCLEVBQUU7YUFDbEIsaUJBQWlCLEVBQUU7YUFDbkIsV0FBVyxFQUFFLENBQUM7UUFFbkIsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEIsbUJBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLG9CQUFvQixHQUFHLElBQUksQ0FBQztZQUM1QixvQkFBb0IsR0FBRyxJQUFJLENBQUM7WUFDNUIscUJBQXFCLEdBQUcsSUFBSSxDQUFDO1FBQ2pDLENBQUM7UUFDRCxJQUFJLENBQUMsdUJBQXVCLENBQUMsbUJBQW1CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztRQUN4RSxJQUFJLENBQUMsd0JBQXdCLENBQUMsb0JBQW9CLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUMzRSxtRUFBbUU7UUFDbkUscURBQXFEO0lBQ3pELENBQUM7SUFDRCxxQ0FBVSxHQUFWLFVBQVcsSUFBUztRQUNoQixJQUFJLFVBQVUsR0FBUSxJQUFJLENBQUMsTUFBb0IsQ0FBQztRQUNoRCxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFVBQVUsQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDM0MsQ0FBQztZQUNELFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxzREFBMkIsR0FBM0IsVUFBNEIsU0FBYyxFQUFFLEtBQVU7UUFDbEQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkcsWUFBWSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQ0FBb0MsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDO1FBQ2xELElBQU0sS0FBSyxHQUFVLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ25FLEtBQUssQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO1FBQy9CLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMseUNBQXlDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUYsVUFBVSxDQUFDO1lBQ1AsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7UUFDbEMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ1osQ0FBQztJQUNEOzs7Ozs7T0FNRztJQUNILG9DQUFTLEdBQVQsVUFBVSxJQUFTO1FBQ2YscURBQXFEO1FBQ3JELHlEQUF5RDtRQUN6RCx5REFBeUQ7UUFDekQsMkRBQTJEO1FBRTNELElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLE1BQW9CLENBQUM7UUFDckMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUMxQyw0REFBNEQ7UUFDNUQsd0VBQXdFO1FBQ3hFLElBQUk7UUFDSiwyQkFBMkI7UUFDM0IsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDckIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBQ0QsSUFBTSxFQUFFLEdBQUcsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FFeEQ7WUFDSSxLQUFLLEVBQUUsSUFBSTtZQUNYLGlCQUFpQixZQUFDLEtBQVUsRUFBRSxNQUFXO2dCQUNyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztnQkFDbEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNULE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLGNBQWM7b0JBQ2QsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO29CQUMzRCxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2xELENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckIsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDekIsWUFBWTtvQkFDWixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7b0JBQzNELElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFFOUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNwQixDQUFDO1lBQ0wsQ0FBQztTQUNKLENBQUMsQ0FBQztRQUNQLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQ2hDLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3hCLGtDQUFrQztnQkFDbEMsbUNBQW1DO2dCQUNuQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUMzQyxDQUFDO1lBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDVCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztnQkFDMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO2dCQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyxLQUFLLENBQUM7Z0JBRWhDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2dCQUM5QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7Z0JBQ3ZDLCtCQUErQjtnQkFDL0Isc0NBQXNDO1lBQzFDLENBQUM7UUFDTCxDQUFDO1FBRUQsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDekIsZ0NBQWdDO1FBQ2hDLG1DQUFtQztRQUNuQyxpQ0FBaUM7UUFDakMsMkNBQTJDO1FBQzNDLDBDQUEwQztJQUM5QyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsMkNBQWdCLEdBQWhCO1FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNEOzs7O09BSUc7SUFDSCxpREFBc0IsR0FBdEI7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUNELGtEQUF1QixHQUF2QixVQUF3QixlQUFlLEVBQUUsZ0JBQWdCO1FBQ3JELE9BQU8sQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdkQsSUFBTSxJQUFJLEdBQUcsaUJBQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLGdCQUFnQixDQUFDO1FBQy9ELElBQU0sSUFBSSxHQUFHLGlCQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUMsQ0FBQSxzQkFBc0I7UUFDbkYsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFDRCxtREFBd0IsR0FBeEIsVUFBeUIsZUFBZSxFQUFFLGdCQUFnQjtRQUN0RCxPQUFPLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3hELElBQU0sSUFBSSxHQUFHLGlCQUFNLENBQUMsVUFBVSxDQUFDLFlBQVksR0FBRyxnQkFBZ0IsQ0FBQztRQUMvRCxJQUFNLElBQUksR0FBRyxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLENBQUEsc0JBQXNCO1FBQ25GLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUNuRiwwRUFBMEU7UUFDMUUsa0VBQWtFO0lBQ3RFLENBQUM7SUFDRDs7O09BR0c7SUFDSCxtREFBd0IsR0FBeEI7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMxRSxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsa0RBQXVCLEdBQXZCO1FBQ0ksSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUM5RCxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsK0JBQStCLEVBQUUsQ0FBQztRQUNyRCxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdDLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWM7UUFDMUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzdFLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7WUFDckUsT0FBTyxZQUFDLElBQVM7Z0JBQ2IsS0FBSyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNoQyxDQUFDO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsK0NBQW9CLEdBQXBCO1FBQ0ksSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDdEQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQztRQUVoRSwwRUFBMEU7UUFDMUUsMkRBQTJEO1FBQzNELElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxZQUFZLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0gscURBQTBCLEdBQTFCO1FBQ0ksSUFBTSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3RFLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2pFLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGNBQWM7UUFDMUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNEOzs7T0FHRztJQUNILG1EQUF3QixHQUF4QjtRQUNJLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQztRQUNuQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFFakUsNkVBQTZFO1FBQzdFLHlEQUF5RDtRQUV6RCxJQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUU7YUFDMUQsYUFBYSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUV0RixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDekQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLCtCQUErQixFQUFFLENBQUM7UUFDckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3JFLE9BQU8sWUFBQyxJQUFTO2dCQUNiLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUMzQixDQUFDO1NBQ0osQ0FBQyxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBQ08seURBQThCLEdBQXRDO1FBQ0ksSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUNqRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztRQUV2RSw2RUFBNkU7UUFDN0UseURBQXlEO1FBRXpELElBQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxFQUFFO2FBQzlELGFBQWEsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUU3RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDekUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdEUsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUMzRSxPQUFPLFlBQUMsSUFBUztnQkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQ2xDLGlFQUFpRTtnQkFDakUsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUN2QixLQUFLLENBQUMsMkJBQTJCLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1lBRTdHLENBQUM7U0FDSixDQUFDLENBQUMsQ0FBQztRQUNKLG1GQUFtRjtRQUNuRiw2Q0FBNkM7UUFDN0MsNEVBQTRFO1FBQzVFLGlDQUFpQztRQUNqQywrQkFBK0I7UUFDL0Isa0NBQWtDO1FBQ2xDLHVCQUF1QjtRQUN2QixRQUFRO1FBQ1IsT0FBTztRQUNQLDJGQUEyRjtRQUMzRiwrQkFBK0I7UUFDL0IsK0NBQStDO1FBQy9DLG9DQUFvQztRQUNwQyxxQ0FBcUM7UUFDckMscUNBQXFDO1FBQ3JDLHVFQUF1RTtRQUN2RSx1QkFBdUI7UUFDdkIsU0FBUztRQUNULE9BQU87UUFDUCwrRUFBK0U7UUFDL0Usc0RBQXNEO1FBQ3RELHVDQUF1QztRQUN2QyxxQ0FBcUM7UUFDckMsdUVBQXVFO1FBQ3ZFLHVCQUF1QjtRQUN2QixTQUFTO1FBQ1QsT0FBTztRQUNQLElBQUksQ0FBQyw0QkFBNEIsRUFBRSxDQUFDO0lBQ3hDLENBQUM7SUFFTyx1REFBNEIsR0FBcEM7UUFDSSxJQUFJLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRixJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN6QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUMzQywwQ0FBMEM7UUFDMUMseUNBQXlDO1FBQ3pDLG9EQUFvRDtRQUNwRCxrRUFBa0U7UUFDbEUsSUFBTSxJQUFJLEdBQUcsaUJBQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUNuRCxJQUFNLElBQUksR0FBRyxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUEsc0JBQXNCO1FBQ3hFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0QseUJBQXlCO1FBQ3pCLDJDQUEyQztRQUMzQyx3QkFBd0I7UUFDeEIsMkNBQTJDO0lBQy9DLENBQUM7SUFDTywwREFBK0IsR0FBdkM7UUFDSSxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBRXZFLDZFQUE2RTtRQUM3RSx5REFBeUQ7UUFFekQsc0VBQXNFO1FBQ3RFLGlHQUFpRztRQUVqRyw0RUFBNEU7UUFDNUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDdkUsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLG1DQUFtQyxFQUFFLENBQUM7UUFDekQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9FLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztZQUM1RSxPQUFPLFlBQUMsSUFBUztnQkFDYixLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQ3ZCLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDL0csQ0FBQztTQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDekMsQ0FBQztJQUNPLHdEQUE2QixHQUFyQztRQUNJLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQzFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQzVDLDBDQUEwQztRQUMxQyx5Q0FBeUM7UUFDekMsb0RBQW9EO1FBQ3BELGtFQUFrRTtRQUNsRSxJQUFNLElBQUksR0FBRyxpQkFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1FBQ25ELElBQU0sSUFBSSxHQUFHLGlCQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsQ0FBQSxzQkFBc0I7UUFDeEUsSUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1RCx5QkFBeUI7UUFDekIsMkNBQTJDO1FBQzNDLHdCQUF3QjtRQUN4QiwyQ0FBMkM7SUFDL0MsQ0FBQztJQUNPLDhEQUFtQyxHQUEzQztRQUNJLElBQU0sS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUMvRCxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUEsK0JBQStCO1FBQzFELEtBQUssQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDRDs7OztPQUlHO0lBQ0gsMkNBQWdCLEdBQWhCLFVBQWlCLFFBQWE7UUFDMUIsSUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPO2FBQ3pDLFlBQVksRUFBRTthQUNkLGFBQWEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7UUFDdkYsTUFBTSxDQUFDLFVBQVUsQ0FBQztJQUN0QixDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSCwwREFBK0IsR0FBL0I7UUFDSSxJQUFNLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDL0QsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQixLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzNCLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILCtDQUFvQixHQUFwQjtRQUVJLElBQU0sS0FBSyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDNUQsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNILDRDQUFpQixHQUFqQjtRQUNJLElBQU0sR0FBRyxHQUFHLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4RSxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNwQixNQUFNLENBQUMsR0FBRyxDQUFDO0lBQ2YsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0gsOENBQW1CLEdBQW5CO1FBQ0ksSUFBTSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3hFLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDL0IsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0QixHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDZixDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSCw2Q0FBa0IsR0FBbEIsVUFBbUIsSUFBUztRQUN4QixPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBa0IsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRCxNQUFNO0lBQ04sd0RBQXdEO0lBQ3hELDBDQUEwQztJQUMxQyxNQUFNO0lBQ04sNENBQWlCLEdBQWpCLFVBQWtCLElBQVM7UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQ0FBZ0IsR0FBaEI7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFDRDs7T0FFRztJQUNILGlEQUFzQixHQUF0QjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQW1CLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBZSxDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUNyRCxDQUFDO0lBQ0Q7O09BRUc7SUFDSCwwQ0FBZSxHQUFmO1FBQ0ksSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBQ0QsTUFBTTtJQUNOLDBCQUEwQjtJQUMxQixNQUFNO0lBQ04sK0JBQStCO0lBQy9CLG9DQUFvQztJQUNwQyxJQUFJO0lBQ0o7Ozs7O09BS0c7SUFDSCx5Q0FBYyxHQUFkLFVBQWUsU0FBYztRQUN6QixTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2hDLFNBQVMsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFDRDs7T0FFRztJQUNILHlDQUFjLEdBQWQ7UUFDSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUNEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsb0RBQXlCLEdBQXpCLFVBQTBCLFVBQW1CLEVBQUUsV0FBbUIsRUFBRSxNQUFjLEVBQUUsWUFBWTtRQUFoRyxpQkFtRUM7UUFsRUcsSUFBTSxPQUFPLEdBQXVCO1lBQ2hDLE9BQU8sRUFBRTtnQkFDTCxXQUFXLEVBQUUsTUFBTTtnQkFDbkIsY0FBYyxFQUFFLFdBQVc7Z0JBQzNCLGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGVBQWUsRUFBRSxZQUFZO2FBS2hDO1lBQ0QsVUFBVSxFQUFFLFVBQVU7WUFDdEIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQjtTQUMxQyxDQUFDO1FBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxnQ0FBYSxFQUFFLE9BQU8sQ0FBQzthQUM5QyxJQUFJLENBQUMsVUFBQyxZQUFvQjtZQUN2QixFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO2dCQUNmLHNDQUFzQztnQkFDdEMsMkNBQTJDO2dCQUMzQyxpQ0FBaUM7Z0JBQ2pDLGdFQUFnRTtnQkFDaEUsS0FBSztnQkFDTCxJQUFJO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDdkMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzlDLElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxLQUFJLENBQUMsb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ3RDLEtBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMzRSxDQUFDO2dCQUNMLENBQUM7Z0JBQ0QsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDbkMsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLElBQUksQ0FBQztvQkFDRCxJQUFNLFVBQVUsR0FBWSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztvQkFDMUQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQzt3QkFDYixVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7b0JBQzVCLENBQUM7b0JBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQzt3QkFDN0IsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQzlDLElBQU0sVUFBVSxHQUFHLEtBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUMxQyxJQUFNLFVBQVUsR0FBWSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQzs0QkFDekQsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztnQ0FDYixVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7NEJBQzVCLENBQUM7NEJBQ0QsZ0NBQWdDOzRCQUNoQyxrR0FBa0c7NEJBQ2xHLDBFQUEwRTs0QkFDMUUsMkJBQTJCOzRCQUMzQixzQ0FBc0M7NEJBQ3RDLDZDQUE2Qzs0QkFDN0MsSUFBSTs0QkFDSixnQkFBZ0I7NEJBRWhCLEtBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUM5RSxDQUFDO29CQUNMLENBQUM7b0JBQ0QsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ25DLENBQUM7Z0JBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDYixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLG9DQUFvQyxDQUFDLEdBQUcsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNuRyxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQztvQkFDbEQsS0FBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQ25DLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNILDhDQUFtQixHQUFuQixVQUFvQixXQUFnQjtRQUNoQyxFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDO2dCQUNELGtDQUFrQztnQkFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxXQUFXLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO2dCQUMvQiw4Q0FBa0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywyQ0FBMkMsQ0FBQyxHQUFHLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDMUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDdEQsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0ssa0RBQXVCLEdBQS9CO1FBQ0ksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUMsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0sscURBQTBCLEdBQWxDO1FBQ0ksSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDNUMsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRDs7Ozs7T0FLRztJQUNLLDJDQUFnQixHQUF4QixVQUF5QixHQUFRLEVBQUUsUUFBYTtRQUM1QyxJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM1RCxHQUFHLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0ssb0RBQXlCLEdBQWpDO1FBQ0ksSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDbEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUMsc0JBQXNCO1FBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQy9CLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNLLDREQUFpQyxHQUF6QyxVQUEwQyxXQUFtQixFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQ3pGLElBQUksQ0FBQztZQUNELDhDQUFrQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ2hDLDhDQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNCLDZEQUE2RDtZQUM3RCxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7Z0JBQ2pFLDhDQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDTCxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNiLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsd0NBQXdDLENBQUMsR0FBRyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEQsQ0FBQztJQUNMLENBQUM7SUFDRDs7OztPQUlHO0lBQ0ssK0NBQW9CLEdBQTVCLFVBQTZCLE1BQWM7UUFDdkMsSUFBSSxDQUFDO1lBQ0QsSUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0Qsa0dBQWtHO1lBQ2xHLDRFQUE0RTtZQUU1RSxJQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGtCQUFrQixDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHNDQUFzQyxDQUFDLEdBQUcsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3JHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQ3RELENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTTtJQUNOLGlDQUFpQztJQUNqQywyQ0FBMkM7SUFDM0MsTUFBTTtJQUNOLGdFQUFnRTtJQUNoRSw0QkFBNEI7SUFDNUIsdUVBQXVFO0lBQ3ZFLDRDQUE0QztJQUM1QyxVQUFVO0lBQ1YsNEJBQTRCO0lBQzVCLDJHQUEyRztJQUMzRyw2Q0FBNkM7SUFDN0MsMENBQTBDO0lBQzFDLFVBQVU7SUFDVixJQUFJO0lBRUo7Ozs7OztPQU1HO0lBQ0ssMkRBQWdDLEdBQXhDLFVBQXlDLFFBQWE7UUFDbEQsSUFBSSxDQUFDO1lBQ0QsNEVBQTRFO1lBQzVFLHVFQUF1RTtZQUN2RSxJQUFNLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxDQUFDLHFEQUFxRDtZQUMxRiw0REFBNEQ7WUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDakUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQzlDLDhDQUFrQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3BGLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUMzQixLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ25DLENBQUM7UUFDTCxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxtREFBbUQsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlHLENBQUM7SUFDTCxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSyxvQ0FBUyxHQUFqQixVQUFrQixVQUFzQjtRQUF4QyxpQkFxQ0M7UUFwQ0csRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSwwQkFBVyxFQUFFLENBQUM7WUFFckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUN2QyxVQUFDLE1BQU07Z0JBQ0gsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDVCxLQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzt3QkFDVixJQUFNLEVBQUUsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsR0FBRyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7d0JBQ2xFLEtBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO3dCQUN6QixLQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzt3QkFFakIsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN6QixLQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs0QkFDakIsS0FBSSxDQUFDLFdBQVcsR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDO3dCQUNuQyxDQUFDO3dCQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNKLEtBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDOzRCQUNqQixLQUFJLENBQUMsZ0NBQWdDLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzlDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxLQUFLLENBQUM7b0JBQzlCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEYsQ0FBQztZQUNMLENBQUMsRUFDRCxVQUFDLEtBQUs7Z0JBQ0YsS0FBSSxDQUFDLFdBQVcsR0FBRyxLQUFJLENBQUMsS0FBSyxDQUFDO2dCQUM5QixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsR0FBRyxNQUFNLENBQUMsUUFBUTtzQkFDdkUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsQ0FBQztnQkFDL0MsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx1Q0FBdUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2xHLENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzlELEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsc0JBQXNCLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3RSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDTCx1QkFBQztBQUFELENBQUMsQUFoM0JELElBZzNCQztBQWgzQlksZ0JBQWdCO0lBTjVCLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsWUFBWTtRQUN0QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMseUJBQXlCLENBQUM7UUFDdEMsV0FBVyxFQUFFLDBCQUEwQjtLQUMxQyxDQUFDO3FDQWlFb0IsYUFBTTtRQUNFLGlDQUFrQjtRQUNkLHVCQUFnQjtRQUMxQixlQUFNO1FBQ0Usc0NBQWMsc0JBRXRCLDJCQUFZLG9CQUFaLDJCQUFZLGtDQUNaLFdBQUM7R0F2RVosZ0JBQWdCLENBZzNCNUI7QUFoM0JZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgTmdab25lLCBPbkluaXQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nT3B0aW9ucywgTW9kYWxEaWFsb2dTZXJ2aWNlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IEltYWdlQXNzZXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLWFzc2V0JztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG5pbXBvcnQgeyBBbmRyb2lkQXBwbGljYXRpb24sIEFuZHJvaWRBY3Rpdml0eUJhY2tQcmVzc2VkRXZlbnREYXRhIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb25cIjtcbmltcG9ydCB7IGlzQW5kcm9pZCwgc2NyZWVuIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvcGxhdGZvcm1cIjtcbmltcG9ydCB7IFNsaWRlciB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL3NsaWRlclwiO1xuaW1wb3J0IHsgTGFiZWwgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9sYWJlbFwiO1xuXG4vKipcbiAqIENhcHR1cmUgY29tcG9uZW50IGNsYXNzLCB3aGljaCBpcyBiZWluZyB1c2VkIHRvIGNhcHR1cmUgaW1hZ2UgZnJvbSBjYW1lcmEuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtY2FwdHVyZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9jYXB0dXJlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2FwdHVyZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIENhcHR1cmVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIC8qKiBDYW1lcmEgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHJpdmF0ZSBjYW06IGFueTtcbiAgICAvKiogR2FsbGVyeSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBnYWxsZXJ5QnRuOiBhbnk7XG4gICAgLyoqIFRha2UgcGljdHVyZSBidXR0b24uICovXG4gICAgcHJpdmF0ZSB0YWtlUGljQnRuOiBhbnk7XG4gICAgLyoqIEF1dG8gZm9jdXMgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgYXV0b2ZvY3VzQnRuOiBhbnk7XG4gICAgLyoqIFBhcmFtYXRlcnMgdXNlZCB0byBkaXNwbGF5IEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeVBhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY1BhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBhdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c1BhcmFtczogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuUGx1czogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuUGx1c1BhcmFtczogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuTWludXM6IGFueTtcbiAgICBwcml2YXRlIHRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zOiBhbnk7XG4gICAgLyoqIEVtcHR5IHN0cmluZyB2YXJpYWJsZSAqL1xuICAgIHByaXZhdGUgZW1wdHk6IGFueSA9IG51bGw7XG4gICAgLy8gLyoqIExvY2FsaXphdGlvbiAqL1xuICAgIC8vIHByaXZhdGUgbG9jYWxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciBzYXZlIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgc2F2ZUJ0bkxhYmxlOiBhbnk7XG4gICAgLy8gLyoqIExhYmxlIGZvciBtYW51YWwgYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSBtYW51YWxCdG5MYWJsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3IgcGVyZm9ybSBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIHBlcmZvcm1CdG5MYWJsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3IgcmV0YWtlIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgcmV0YWtlQnRuTGFibGU6IGFueTtcblxuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIGNoZWNrIHRoZSBjYW1lcmEgaXMgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2FtZXJhVmlzaWJsZTogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzb3VyY2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgLyoqIE9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgVVJJICovXG4gICAgcHVibGljIGltZ1VSSTogYW55O1xuICAgIC8qKiBPcGVuQ1YgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHVibGljIG9wZW5jdkluc3RhbmNlOiBhbnk7XG4gICAgLyoqIFBvaXNpdGlvbiB0byBwbGFjZSBzbGlkZXIgY29tcG9uZW50ICovXG4gICAgLy8gcHJpdmF0ZSBzY3JlZW5IZWlnaHQgPSAwO1xuICAgIC8qKiBDYW5ueSB0aHJlc2hvbGQgdmFsdWUgICAgICovXG4gICAgcHJpdmF0ZSB0aHJlc2hvbGRWYWx1ZSA9IDA7XG4gICAgLyoqIFRocmVzaG9sZCB2YWx1ZSBsYWJsZSBoZWlnaHQgKi9cbiAgICAvLyBwcml2YXRlIGxhYmVsSGVpZ2h0ID0gMDtcbiAgICAvKiogVG8gbWFrZSBsYWJlbCB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIC8vIHByaXZhdGUgaXNMYWJlbFZpc2libGU6IGJvb2xlYW47XG5cbiAgICAvKiogVHJhbnNmb3JtZWQgaW1hZ2UgbGlzdCAqL1xuICAgIHByaXZhdGUgaW1nVVJJTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIENhcHR1cmVDb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gem9uZSBBbmd1bGFyIHpvbmUgdG8gcnVuIGEgdGFzayBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAcGFyYW0gbW9kYWxTZXJ2aWNlIFNlcnZpY2UgbW9kYWxcbiAgICAgKiBAcGFyYW0gdmlld0NvbnRhaW5lclJlZiBWaWV3IGNvbnRhaW5lciByZWZlcnJlbmNlXG4gICAgICogQHBhcmFtIHJvdXRlciBSb3V0ZXJcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHkgbG9hZGVyIGluZGljYXRpb25cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgbW9kYWxTZXJ2aWNlOiBNb2RhbERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIC8vIHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwsXG4gICAgKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIGluaXRpYWxpemVzIE9wZW5DViBtb2R1bGUgYW5kIGJ1dHRvbnMgbGlrZVxuICAgICAqIHRha2VQaWN0dXJlLCBnYWxsZXJ5IGFuZCBhdXRvRm9jdXMgYnV0dG9ucyBpbiBjYW1lcmEgdmlldy5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBPcGVuQ1YuLi4nKTtcbiAgICAgICAgdGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG4gICAgICAgIHRoaXMuaXNDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5pc0xhYmVsVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlVGhyZXNob2xkSW1hZ2VCdXR0b25QbHVzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlVGhyZXNob2xkSW1hZ2VCdXR0b25NaW51cygpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgICAgIGlmICghaXNBbmRyb2lkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5vbihBbmRyb2lkQXBwbGljYXRpb24uYWN0aXZpdHlCYWNrUHJlc3NlZEV2ZW50LCAoZGF0YTogQW5kcm9pZEFjdGl2aXR5QmFja1ByZXNzZWRFdmVudERhdGEpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvdXRlci5pc0FjdGl2ZShcIi9jYXB0dXJlXCIsIGZhbHNlKSkge1xuICAgICAgICAgICAgICAgIGRhdGEuY2FuY2VsID0gdHJ1ZTsgLy8gcHJldmVudHMgZGVmYXVsdCBiYWNrIGJ1dHRvbiBiZWhhdmlvclxuICAgICAgICAgICAgICAgIGRhdGEuYWN0aXZpdHkubW92ZVRhc2tUb0JhY2sodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfVxuICAgIHNldFNsaWRlclBvaXN0aW9uKCkge1xuICAgICAgICB0aGlzLnRocmVzaG9sZFZhbHVlID0gNTA7XG4gICAgICAgIGxldCBwbHVzUGVyY2VudGFnZVdpZHRoID0gMC44NTtcbiAgICAgICAgbGV0IHBsdXNQZXJjZW50YWdlSGVpZ2h0ID0gMC42NztcbiAgICAgICAgbGV0IG1pbnVzUGVyY2VudGFnZVdpZHRoID0gMC44NTtcbiAgICAgICAgbGV0IG1pbnVzUGVyY2VudGFnZUhlaWdodCA9IDAuNzU7XG4gICAgICAgIHZhciByb3RhdGlvbiA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5XG4gICAgICAgICAgICAuZ2V0V2luZG93TWFuYWdlcigpXG4gICAgICAgICAgICAuZ2V0RGVmYXVsdERpc3BsYXkoKVxuICAgICAgICAgICAgLmdldFJvdGF0aW9uKCk7XG5cbiAgICAgICAgaWYgKHJvdGF0aW9uID09IDEpIHtcbiAgICAgICAgICAgIHBsdXNQZXJjZW50YWdlV2lkdGggPSAwLjg1O1xuICAgICAgICAgICAgcGx1c1BlcmNlbnRhZ2VIZWlnaHQgPSAwLjU2O1xuICAgICAgICAgICAgbWludXNQZXJjZW50YWdlV2lkdGggPSAwLjg1O1xuICAgICAgICAgICAgbWludXNQZXJjZW50YWdlSGVpZ2h0ID0gMC43MDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluaXRUaHJlc2hvbGRCdXR0b25QbHVzKHBsdXNQZXJjZW50YWdlV2lkdGgsIHBsdXNQZXJjZW50YWdlSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5pbml0VGhyZXNob2xkQnV0dG9uTWludXMobWludXNQZXJjZW50YWdlV2lkdGgsIG1pbnVzUGVyY2VudGFnZUhlaWdodCk7XG4gICAgICAgIC8vIHRoaXMuc2NyZWVuSGVpZ2h0ID0gKHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodERJUHMgKiBwZXJjZW50YWdlKTtcbiAgICAgICAgLy8gdGhpcy5sYWJlbEhlaWdodCA9IHBsdXNQZXJjZW50YWdlSGVpZ2h0Oy8vICogMC42NTtcbiAgICB9XG4gICAgb25VbmxvYWRlZChhcmdzOiBhbnkpIHtcbiAgICAgICAgbGV0IGNhbWVyYVBsdXM6IGFueSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGlmIChjYW1lcmFQbHVzKSB7XG4gICAgICAgICAgICBpZiAoY2FtZXJhUGx1cy5vY3ZDYW1lcmFWaWV3KSB7XG4gICAgICAgICAgICAgICAgY2FtZXJhUGx1cy5vY3ZDYW1lcmFWaWV3LmRpc2FibGVWaWV3KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYW1lcmFQbHVzLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcoY2FtZXJhUGx1cy5vY3ZDYW1lcmFWaWV3KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZygnb25VbmxvYWRlZCBjYWxsZWQnKTtcbiAgICB9XG4gICAgb25DYW5ueVRocmVzaG9sZFZhbHVlQ2hhbmdlKHRocmVzaG9sZDogYW55LCBzb3VuZDogYW55KSB7XG4gICAgICAgIGxldCBhdWRpb01hbmFnZXIgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0U3lzdGVtU2VydmljZShhbmRyb2lkLmNvbnRlbnQuQ29udGV4dC5BVURJT19TRVJWSUNFKTtcbiAgICAgICAgYXVkaW9NYW5hZ2VyLnBsYXlTb3VuZEVmZmVjdChzb3VuZCwgMC41KTtcbiAgICAgICAgY29uc29sZS5sb2coJ29uQ2FubnlUaHJlc2hvbGRWYWx1ZUNoYW5nZSBjYWxsZWQnLCB0aHJlc2hvbGQpO1xuICAgICAgICB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3LmNhbm55VGhyZXNob2xkID0gdGhyZXNob2xkO1xuICAgICAgICBjb25zdCBsYWJlbCA9IDxMYWJlbD50aGlzLmNhbS5wYWdlLmdldFZpZXdCeUlkKFwidGhyZXNob2xkTGFiZWxJZFwiKTtcbiAgICAgICAgbGFiZWwudGV4dCA9IHRocmVzaG9sZDtcbiAgICAgICAgbGFiZWwudGV4dFdyYXAgPSB0cnVlO1xuICAgICAgICBsYWJlbC50ZXh0QWxpZ25tZW50ID0gXCJjZW50ZXJcIjtcbiAgICAgICAgbGFiZWwudmlzaWJpbGl0eSA9ICd2aXNpYmxlJztcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMuY2FtLm9jdkNhbWVyYVZpZXcuY2FubnlUaHJlc2hvbGQ6ICcsIHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcuY2FubnlUaHJlc2hvbGQpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxhYmVsLnZpc2liaWxpdHkgPSAnY29sbGFwc2UnO1xuICAgICAgICB9LCAyMDApO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBjYW1lcmEgaXMgbG9hZGVkLCB3aGVyZSBhbGwgdGhlIG5lY2Nlc3NhcnkgdGhpbmdzIGxpa2VcbiAgICAgKiBkaXNwbGF5aW5nIGJ1dHRvbnModGFrZVBpY3R1cmUsIGdhbGxlcnksIGZsYXNoLCBjYW1lcmEgJiBhdXRvRm9jdXMpIG9uIGNhbWVyYSB2aWV3XG4gICAgICogYXJlIHRha2VuIGNhcmUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgY2FtZXJhIGluc3RhbmNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgQ2FtZXJhUGx1cyBpbnN0YW5jZSByZWZlcnJlbmNlLlxuICAgICAqL1xuICAgIGNhbUxvYWRlZChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgLy8gdGhpcy5zYXZlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NhdmUnKTtcbiAgICAgICAgLy8gdGhpcy5tYW51YWxCdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIC8vIHRoaXMucmV0YWtlQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3JldGFrZScpO1xuICAgICAgICAvLyB0aGlzLnBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgncGVyZm9ybScpO1xuXG4gICAgICAgIHRoaXMuY2FtID0gYXJncy5vYmplY3QgYXMgQ2FtZXJhUGx1cztcbiAgICAgICAgY29uc3QgZmxhc2hNb2RlID0gdGhpcy5jYW0uZ2V0Rmxhc2hNb2RlKCk7XG4gICAgICAgIC8vIGlmKCF0aGlzLmNhbS5uYXRpdmVWaWV3IHx8IHRoaXMuY2FtLm5hdGl2ZVZpZXcgPT0gbnVsbCkge1xuICAgICAgICAvLyAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcucmVtb3ZlQWxsVmlld3MoKTsgLy8gPSB0aGlzLmNhbS5fbmF0aXZlVmlldztcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBUdXJuIGZsYXNoIG9uIGF0IHN0YXJ0dXBcbiAgICAgICAgaWYgKGZsYXNoTW9kZSA9PT0gJ29uJykge1xuICAgICAgICAgICAgdGhpcy5jYW0udG9nZ2xlRmxhc2goKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYiA9IG5ldyBhbmRyb2lkLmhhcmR3YXJlLkNhbWVyYS5BdXRvRm9jdXNNb3ZlQ2FsbGJhY2soXG5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfdGhpczogdGhpcyxcbiAgICAgICAgICAgICAgICBvbkF1dG9Gb2N1c01vdmluZyhzdGFydDogYW55LCBjYW1lcmE6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmltYXRlID0gdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVZKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3JlZW4gY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjMDA4MDAwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWCgwLjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVZKDAuNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zZXREdXJhdGlvbigxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVkIGNvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignI2ZmMDAwMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLmNhbS5jYW1lcmEpIHtcbiAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zZXRBdXRvRm9jdXNNb3ZlQ2FsbGJhY2soY2IpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcmdzLmRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuaW5pdFRocmVzaG9sZEJ1dHRvblBsdXMoKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmluaXRUaHJlc2hvbGRCdXR0b25NaW51cygpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uX3Rha2VQaWNCdG4gPSB0aGlzLnRha2VQaWNCdG47XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlUGljQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbS5fdGFrZVBpY0J0biA9IHRoaXMudGFrZVBpY0J0bjtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbS5faW5pdEZsYXNoQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5jYW0uX2luaXRUb2dnbGVDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U2xpZGVyUG9pc3Rpb24oKTtcbiAgICAgICAgLy8gVEVTVCBUSEUgSUNPTlMgU0hPV0lORy9ISURJTkdcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0NhcHR1cmVJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93R2FsbGVyeUljb24gPSBmYWxzZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGNhbWVyYSBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgICogaXQgcmVtb3ZlcyBhbiBleGlzdGluZyBvbmUgaWYgZXhpc3RzIGFuZCBhZGRzIGl0LlxuICAgICAqL1xuICAgIGluaXRDYW1lcmFCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy50YWtlUGljQnRuKTtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLnRha2VQaWNCdG4sIHRoaXMudGFrZVBpY1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGdhbGxlcnkgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC4gQW5kIGFsc28gc2V0c1xuICAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAgKi9cbiAgICBpbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuZ2FsbGVyeUJ0bik7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5nYWxsZXJ5QnRuLCAwLCB0aGlzLmdhbGxlcnlQYXJhbXMpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5nYWxsZXJ5QnRuLCAnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5icmluZ0NoaWxkVG9Gcm9udCh0aGlzLmdhbGxlcnlCdG4pO1xuICAgIH1cbiAgICBpbml0VGhyZXNob2xkQnV0dG9uUGx1cyhwZXJjZW50YWdlV2lkdGgsIHBlcmNlbnRhZ2VIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2luaXRUaHJlc2hvbGRCdXR0b25QbHVzIGNhbGxlZC4uLicpO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGhyZXNob2xkQnRuUGx1cyk7XG4gICAgICAgIGNvbnN0IGJ0blkgPSBzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRQaXhlbHMgKiBwZXJjZW50YWdlSGVpZ2h0O1xuICAgICAgICBjb25zdCBidG5YID0gc2NyZWVuLm1haW5TY3JlZW4ud2lkdGhQaXhlbHMgKiBwZXJjZW50YWdlV2lkdGg7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuc2V0TWFyZ2lucyhidG5YLCBidG5ZLCAxOCwgMTgpO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5hZGRWaWV3KHRoaXMudGhyZXNob2xkQnRuUGx1cywgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zKTtcbiAgICB9XG4gICAgaW5pdFRocmVzaG9sZEJ1dHRvbk1pbnVzKHBlcmNlbnRhZ2VXaWR0aCwgcGVyY2VudGFnZUhlaWdodCkge1xuICAgICAgICBjb25zb2xlLmxvZygnaW5pdFRocmVzaG9sZEJ1dHRvbk1pbnVzIGNhbGxlZC4uLicpO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGhyZXNob2xkQnRuTWludXMpO1xuICAgICAgICBjb25zdCBidG5ZID0gc2NyZWVuLm1haW5TY3JlZW4uaGVpZ2h0UGl4ZWxzICogcGVyY2VudGFnZUhlaWdodDtcbiAgICAgICAgY29uc3QgYnRuWCA9IHNjcmVlbi5tYWluU2NyZWVuLndpZHRoUGl4ZWxzICogcGVyY2VudGFnZVdpZHRoOy8vd2lkdGhESVBzOy8vICogMC43NTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcy5zZXRNYXJnaW5zKGJ0blgsIGJ0blksIDE4LCAxOCk7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50aHJlc2hvbGRCdG5NaW51cywgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcyk7XG4gICAgICAgIC8vIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLCAnaWNfbWludXNfY2lyY2xlX3doaXRlJyk7XG4gICAgICAgIC8vIHRoaXMuY2FtLl9uYXRpdmVWaWV3LmJyaW5nQ2hpbGRUb0Zyb250KHRoaXMudGhyZXNob2xkQnRuTWludXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBhdXRvRm9jdXMgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC5cbiAgICAgKi9cbiAgICBpbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5hdXRvZm9jdXNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuLCB0aGlzLmF1dG9mb2N1c1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGFrZSBwaWN0dXJlIGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4gPSB0aGlzLmNyZWF0ZVRha2VQaWNCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGFrZVBpY0J0biwgJ2ljX2NhbWVyYV9hbHRfd2hpdGUnKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmZmZmZmJyk7IC8vIHdoaXRlIGNvbG9yXG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVJfQ1JPUCk7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRha2VQaWNGcm9tQ2FtKF90aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgaW1hZ2UgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5hdXRvZm9jdXNCdG4sICdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcbiAgICAgICAgLy8gdGhpcy5hdXRvZm9jdXNCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbiB3aXRoIGhlbHAgSW1hZ2VWaWV3IHdpZGdldCBhbmQgc2V0dGluZ3NcbiAgICAgKiBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBwYWRkaW5nLCBoZWlnaHQsIHdpZHRoLCBjb2xvciAmIHNjYWxlVHlwZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNTgpO1xuICAgICAgICBidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpOyAvLyBHcmVlbiBjb2xvclxuICAgICAgICBidG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGdhbGxlcnkgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBjcmVhdGVUaHJlc2hvbGRJbWFnZUJ1dHRvblBsdXMoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0UGFkZGluZygzNCwgNSwgMzQsIDM0KTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGhyZXNob2xkQnRuUGx1cywgJ2ljX2FkZF9jaXJjbGVfd2hpdGVfM3gnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuICAgICAgICBjb25zdCBnYWxsZXJ5QnRuUGx1c0lkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcigndGhyZXNob2xkX2J0bl9wbHVzJywgJ2lkJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRUYWcoZ2FsbGVyeUJ0blBsdXNJZCwgJ3RocmVzaG9sZC1idG4tcGx1cy10YWcnKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzLnNldENvbnRlbnREZXNjcmlwdGlvbigndGhyZXNob2xkLWJ0bi1wbHVzLWRlYycpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlQ2lyY2xlRHJhd2FibGVGb3JUaHJlc2hvbGRCdG4oKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVIpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayh2aWV3OiBhbnkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25DbGljayBjYWxsZWQuLi4uJyk7XG4gICAgICAgICAgICAgICAgLy8gYXJncy5wbGF5U291bmRFZmZlY3QoYW5kcm9pZC52aWV3LlNvdW5kRWZmZWN0Q29uc3RhbnRzLkNMSUNLKTtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAgICAgICAgIF90aGlzLm9uQ2FubnlUaHJlc2hvbGRWYWx1ZUNoYW5nZShfdGhpcy50aHJlc2hvbGRWYWx1ZSwgYW5kcm9pZC52aWV3LlNvdW5kRWZmZWN0Q29uc3RhbnRzLk5BVklHQVRJT05fVVApO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRPblRvdWNoTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uVG91Y2hMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvblRvdWNoKHZpZXc6IGFueSwgbW90aW9uRXZlbnQ6IGFueSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdvblRvdWNoIGNhbGxlZC4uLi4nLCBtb3Rpb25FdmVudC5nZXRBY3Rpb25NYXNrZWQoKSk7XG4gICAgICAgIC8vICAgICAgICAgdmlldy5zZXRQcmVzc2VkKHRydWUpO1xuICAgICAgICAvLyAgICAgICAgIHZpZXcucGVyZm9ybUNsaWNrKCk7XG4gICAgICAgIC8vICAgICAgICAgdmlldy5zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSkpO1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25Mb25nQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25Mb25nQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvbkxvbmdDbGljayh2aWV3OiBhbnkpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZygnb25Mb25nQ2xpY2tlZCBjYWxsZWQnKTtcbiAgICAgICAgLy8gICAgICAgICAvLyB2aWV3LnNldFByZXNzZWQodHJ1ZSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gdmlldy5zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICAgICAgLy8gICAgICAgICAvLyBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAvLyAgICAgICAgIC8vICBfdGhpcy5vbkNhbm55VGhyZXNob2xkVmFsdWVDaGFuZ2UoX3RoaXMudGhyZXNob2xkVmFsdWUpO1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfSkpO1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25LZXlMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25LZXlMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvbktleSh2aWV3OiBhbnksIGtleUNvZGU6IGFueSwga2V5RXZlbnQ6IGFueSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdvbktleSBjYWxsZWQnKTtcbiAgICAgICAgLy8gICAgICAgICAvLyBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAvLyAgICAgICAgIC8vICBfdGhpcy5vbkNhbm55VGhyZXNob2xkVmFsdWVDaGFuZ2UoX3RoaXMudGhyZXNob2xkVmFsdWUpO1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRocmVzaG9sZEJ0blBsdXNQYXJhbXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRocmVzaG9sZEJ0blBsdXNQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLndpZHRoID0gJzcwJztcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLmhlaWdodCA9ICcxMDUnO1xuICAgICAgICAvLyAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnggPSAnNTAwJztcbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnkgPSAnNTAwJztcbiAgICAgICAgLy8gY29uc3QgYnRuWSA9IHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodERJUHMgKiAwLjc4O1xuICAgICAgICAvLyBjb25zdCBidG5YID0gc2NyZWVuLm1haW5TY3JlZW4ud2lkdGhESVBzOy8vd2lkdGhESVBzOy8vICogMC43NTtcbiAgICAgICAgY29uc3QgYnRuWSA9IHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodFBpeGVscyAqIDAuNjY7XG4gICAgICAgIGNvbnN0IGJ0blggPSBzY3JlZW4ubWFpblNjcmVlbi53aWR0aFBpeGVscyAqIDAuODU7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuc2V0TWFyZ2lucyhidG5YLCBidG5ZLCAxOCwgMTgpO1xuICAgICAgICAvLyAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gLy8gQUxJR05fUEFSRU5UX1JJR0hUXG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy5hZGRSdWxlKDExKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBjcmVhdGVUaHJlc2hvbGRJbWFnZUJ1dHRvbk1pbnVzKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXMgPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXMuc2V0UGFkZGluZygzNCwgMzQsIDM0LCA1KTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGhyZXNob2xkQnRuTWludXMsICdpY19taW51c19jaXJjbGVfd2hpdGUnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuICAgICAgICAvLyBjb25zdCBnYWxsZXJ5QnRuUGx1c0lkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgIC8vICAgICAuZ2V0SWRlbnRpZmllcigndGhyZXNob2xkX2J0bl9taW51cycsICdpZCcsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcblxuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0VGFnKGdhbGxlcnlCdG5QbHVzSWQsICd0aHJlc2hvbGQtYnRuLXBsdXMtdGFnJyk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXMuc2V0Q29udGVudERlc2NyaXB0aW9uKCd0aHJlc2hvbGQtYnRuLXBsdXMtZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVDaXJjbGVEcmF3YWJsZUZvclRocmVzaG9sZEJ0bigpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXMuc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51cy5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRocmVzaG9sZFZhbHVlLS07XG4gICAgICAgICAgICAgICAgX3RoaXMub25DYW5ueVRocmVzaG9sZFZhbHVlQ2hhbmdlKF90aGlzLnRocmVzaG9sZFZhbHVlLCBhbmRyb2lkLnZpZXcuU291bmRFZmZlY3RDb25zdGFudHMuTkFWSUdBVElPTl9ET1dOKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUaHJlc2hvbGRCdG5NaW51c1BhcmFtcygpO1xuICAgIH1cbiAgICBwcml2YXRlIGNyZWF0ZVRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zLndpZHRoID0gJzcwJztcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcy5oZWlnaHQgPSAnMTA1JztcbiAgICAgICAgLy8gIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy54ID0gJzUwMCc7XG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy55ID0gJzUwMCc7XG4gICAgICAgIC8vIGNvbnN0IGJ0blkgPSBzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRESVBzICogMC43ODtcbiAgICAgICAgLy8gY29uc3QgYnRuWCA9IHNjcmVlbi5tYWluU2NyZWVuLndpZHRoRElQczsvL3dpZHRoRElQczsvLyAqIDAuNzU7XG4gICAgICAgIGNvbnN0IGJ0blkgPSBzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRQaXhlbHMgKiAwLjc0O1xuICAgICAgICBjb25zdCBidG5YID0gc2NyZWVuLm1haW5TY3JlZW4ud2lkdGhQaXhlbHMgKiAwLjg1Oy8vd2lkdGhESVBzOy8vICogMC43NTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcy5zZXRNYXJnaW5zKGJ0blgsIGJ0blksIDE4LCAxOCk7XG4gICAgICAgIC8vIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLmFkZFJ1bGUoMTIpO1xuICAgICAgICAvLyAvLyBBTElHTl9QQVJFTlRfUklHSFRcbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLmFkZFJ1bGUoMTEpO1xuICAgIH1cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZURyYXdhYmxlRm9yVGhyZXNob2xkQnRuKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTsvLygweEZGRkZGRkZGKTsgLy8oMHg5OTAwMDAwMCk7XG4gICAgICAgIHNoYXBlLnNldENvcm5lclJhZGl1cygxMCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDEwMCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhY3R1YWwgaWNvbiBpbWFnZSB1c2luZyBpY29uIG5hbWUgZnJvbSBjb250ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gTmFtZVxuICAgICAqL1xuICAgIGdldEltYWdlRHJhd2FibGUoaWNvbk5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHRcbiAgICAgICAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoaWNvbk5hbWUsICdkcmF3YWJsZScsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIGRyYXdhYmxlSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdHJhbnNwYXJlbnQgY2lyY2xlIHNoYXBlIHdpdGggaGVscCBvZiBHcmFkaWVudERyYXdhYmxlIG9iamVjdFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIGNvbG9yLCByYWRpdXMgYW5kIGFscGhhLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDEwMCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDE1MCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIHNoYXBlIHVzaW5nIFNoYXBlRHJhd2FibGUgb2JqZWN0IGFuZFxuICAgICAqIHNldHMgYWxwaGEuXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvZm9jdXNTaGFwZSgpOiBhbnkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuU2hhcGVEcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGJ1dHRvbiB3aXRoIGhlbHAgb2YgSW1hZ2VCdXR0b24gd2lkZ2V0XG4gICAgICogYW5kIHNldHMgaXQncyBhdHRyaWJ1dGVzIGxpa2UgcGFkZGluZywgbWF4SGVpZ2h0ICYgbWF4d2lkdGguXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGJ1dHRvbiBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZUJ1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VCdXR0b24oYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDU4KTtcbiAgICAgICAgYnRuLnNldE1heFdpZHRoKDU4KTtcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIG9mIEltYWdlQnV0dG9uIHdpZGdldFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIG1heEhlaWdodCAmIG1heHdpZHRoLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBidXR0b24gb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlVGFrZVBpY0J1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VCdXR0b24oYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMTQsIDE0LCAxNCwgMTQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE3OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNzgpO1xuXG4gICAgICAgIHJldHVybiBidG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBob3RvIGNhcHR1cmVkIGV2ZW50IGZpcmVzIHdoZW4gYSBwaWN0dXJlIGlzIHRha2VuIGZyb20gY2FtZXJhLCB3aGljaCBhY3R1YWxseVxuICAgICAqIGxvYWRzIHRoZSBjYXB0dXJlZCBpbWFnZSBmcm9tIEltYWdlQXNzZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBJbWFnZSBjYXB0dXJlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgcGhvdG9DYXB0dXJlZEV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnUEhPVE8gQ0FQVFVSRUQgRVZFTlQhISEnKTtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2UoYXJncy5kYXRhIGFzIEltYWdlQXNzZXQpO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBUaGlzIGlzIGJlZW4gY2FsbGVkIHdoZW4gdG9nZ2xlIHRoZSBjYW1lcmEgYnV0dG9uLlxuICAgIC8vICAqIEBwYXJhbSBhcmdzIENhbWVyYSB0b2dnbGUgZXZlbnQgZGF0YVxuICAgIC8vICAqL1xuICAgIHRvZ2dsZUNhbWVyYUV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnY2FtZXJhIHRvZ2dsZWQnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0b2dnbGUgdGhlIGZsYXNoIGljb24gb24gY2FtZXJhLiBUaGlzIGFjdHVhbGx5XG4gICAgICogZmxhc2ggb2ZmIHdoZW4gaXQgYWxyZWFkeSBpcyBvbiBvciB2aWNlLXZlcnNhLlxuICAgICAqL1xuICAgIHRvZ2dsZUZsYXNoT25DYW0oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBkaXNwbGF5IGZsYXNoIGljb24gYmFzZWQgb24gaXQncyBwcm9wZXJ0eSB2YWx1ZSB0cnVlL2ZhbHNlLlxuICAgICAqL1xuICAgIHRvZ2dsZVNob3dpbmdGbGFzaEljb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzaG93Rmxhc2hJY29uID0gJHt0aGlzLmNhbS5zaG93Rmxhc2hJY29ufWApO1xuICAgICAgICB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gIXRoaXMuY2FtLnNob3dGbGFzaEljb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzd2l0Y2ggZnJvbnQvYmFjayBjYW1lcmEuXG4gICAgICovXG4gICAgdG9nZ2xlVGhlQ2FtZXJhKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbS50b2dnbGVDYW1lcmEoKTtcbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogT3BlbiBjYW1lcmEgbGlicmFyeS5cbiAgICAvLyAgKi9cbiAgICAvLyBvcGVuQ2FtUGx1c0xpYnJhcnkoKTogdm9pZCB7XG4gICAgLy8gICAgIHRoaXMuY2FtLmNob29zZUZyb21MaWJyYXJ5KCk7XG4gICAgLy8gfVxuICAgIC8qKlxuICAgICAqIFRha2VzIHBpY3R1cmUgZnJvbSBjYW1lcmEgd2hlbiB1c2VyIHByZXNzIHRoZSB0YWtlUGljdHVyZSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICogVGhlbiBpdCBzZXRzIHRoZSBjYXB0dXJlZCBpbWFnZSBVUkkgaW50byBpbWFnZVNvdXJjZSB0byBiZSBkaXNwbGF5ZWQgaW4gZnJvbnQtZW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRoaXNQYXJhbSBDb250YWlucyBjYW1lcmFwbHVzIGluc3RhbmNlXG4gICAgICovXG4gICAgdGFrZVBpY0Zyb21DYW0odGhpc1BhcmFtOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpc1BhcmFtLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpc1BhcmFtLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSXQgdGFrZXMgdG8gaW1hZ2UgZ2FsbGVyeSB2aWV3IHdoZW4gdXNlciBjbGlja3Mgb24gZ2FsbGVyeSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2cgd2luZG93IGFmdGVyIHRha2luZyBwaWN0dXJlLiBUaGlzIGlzIG1vZGFsIHdpbmRvdyBhbG9uZyB3aXRoXG4gICAgICogcmV1aXJlZCBvcHRpb25zIGxpa2UgY2FwdHVyZSBpbWFnZSBVUkksIHRyYW5zZm9ybWVkIGltYWdlIFVSSSwgcmVjdGFuZ2xlIHBvaW50cyBhbmQgZXRjLlxuICAgICAqIFRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGRlbGV0aW5nIHRoZSBjYXB0dXJlZCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gcmV0YWtlICh1c2luZyBSZXRha2UgYnV0dG9uKVxuICAgICAqIHBpY3R1cmUgYW5kLCBjcmVhdGVzIHRodW1ibmFpbCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gc2F2ZSB0aGUgY2FwdHVyZWQgaW1hZ2UgYW5kXG4gICAgICogc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpY29uIGJ1dHRvbiBpbiBjYW1lcmEgdmlldy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmdWxsU2NyZWVuIE9wdGlvbiB0byBzaG93IGZ1bGxzY3JlZW4gZGlhbG9nIG9yIG5vdFxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSByZWNQb2ludHNTdHIgUmVjdGFuZ2xlIHBvaW50cyBpbiBzdHJpbmdcbiAgICAgKi9cbiAgICBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxTY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCByZWNQb2ludHNTdHIpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xuICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgIGltYWdlU291cmNlOiBpbWdVUkksXG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2VPcmc6IGZpbGVQYXRoT3JnLFxuICAgICAgICAgICAgICAgIGlzQXV0b0NvcnJlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgcmVjdGFuZ2xlUG9pbnRzOiByZWNQb2ludHNTdHIsXG4gICAgICAgICAgICAgICAgLy8gc2F2ZUJ0bkxhYmxlOiB0aGlzLnNhdmVCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyBtYW51YWxCdG5MYWJsZTogdGhpcy5tYW51YWxCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyByZXRha2VCdG5MYWJsZTogdGhpcy5yZXRha2VCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtQnRuTGFibGU6IHRoaXMucGVyZm9ybUJ0bkxhYmxlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IGZ1bGxTY3JlZW4sXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLm1vZGFsU2VydmljZS5zaG93TW9kYWwoRGlhbG9nQ29udGVudCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChkaWFsb2dSZXN1bHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaWFsb2dSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGRpbG9nUmVzdWx0VGVtcCA9IGRpYWxvZ1Jlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGRpYWxvZ1Jlc3VsdC5pbmRleE9mKCdfVEVNUCcpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkaWxvZ1Jlc3VsdFRlbXAgPSBkaWxvZ1Jlc3VsdFRlbXAucmVwbGFjZSgnX1RFTVAnICsgaSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAvLyBcdH1cbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaW1nVVJJTGlzdC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtZWRJbWFnZShkaWFsb2dSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltZ1VSSUxpc3Quc2l6ZSgpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklUZW1wID0gdGhpcy5pbWdVUklMaXN0LmdldChpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRodW1iTmFpbEltYWdlKGltZ1VSSVRlbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBpbWdVUklUZW1wLCAnQWRkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYW0uY2FtZXJhLnN0YXJ0UHJldmlldygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nRmlsZU9yZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVPcmcucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmltZ1VSSUxpc3QuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltZ1VSSUxpc3Quc2l6ZSgpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJVGVtcCA9IHRoaXMuaW1nVVJJTGlzdC5nZXQoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VSSVRlbXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nVVJJRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nVVJJRmlsZS5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLy8gVG9kbyA6IHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgaW1nVXJpQ29udG91clBhdGggPSBpbWdVUkkuc3Vic3RyaW5nKDAsIGltZ1VSSS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgaW1nVVJJQ29udG91ckZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGltZ1VSSUNvbnRvdXJGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBpbWdVUklDb250b3VyRmlsZS5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC8vIFRvZG8gLSBFbmRcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgaW1nVVJJVGVtcCwgJ1JlbW92ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zdGFydFByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnY291bGRfbm90X2RlbGV0ZV90aGVfY2FwdHVyZV9pbWFnZScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zdGFydFByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBpbiBnYWxsZXJ5IGltYWdlIGJ1dHRvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbWdVUklQYXJhbSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIFVSSVxuICAgICAqL1xuICAgIHNldFRyYW5zZm9ybWVkSW1hZ2UoaW1nVVJJUGFyYW06IGFueSkge1xuICAgICAgICBpZiAoaW1nVVJJUGFyYW0pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faXNJbWFnZUJ0blZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltZ1VSSSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfc2V0dGluZ19pbWFnZV9pbl9wcmV2aWV3X2FyZWEnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBsYXlvdXQgcGFyYW1zIHVzaW5nIExheW91dFBhcmFtcyB3aWRnZXQgZm9yIHRha2VQaWN0dXJlIGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMud2lkdGggPSAnMTUwJztcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmhlaWdodCA9ICcxNTAnO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuYWRkUnVsZSgxMik7XG4gICAgICAgIC8vIENFTlRFUl9IT1JJWk9OVEFMXG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDE0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBsYXlvdXQgcGFyYW1zIHVzaW5nIExheW91dFBhcmFtcyB3aWRnZXQgZm9yIGF1dG9Gb2N1cyBidXR0b25cbiAgICAgKiBhbmQgc2V0cyBpdCdzIHBhcmFtcyBsaWtlIGhlaWdodCwgd2lkdGgsIG1hcmdpbiAmIHJ1bGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy53aWR0aCA9ICczMDAnO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5oZWlnaHQgPSAnMzAwJztcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0NFTlRFUlxuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5hZGRSdWxlKDEzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBpbWFnZSByZXNvdXJjZSB0byBnaXZlbiBpbWFnZSBidXR0b24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnRuIEJ1dHRvbiBpbWFnZSBpbnN0YW5jZSByZWZlcnJlbmNlXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gbmFtZVxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SW1hZ2VSZXNvdXJjZShidG46IGFueSwgaWNvbk5hbWU6IGFueSkge1xuICAgICAgICBjb25zdCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTtcbiAgICAgICAgYnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciBnYWxsZXJ5IGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVJbWFnZUdhbGxlcnJ5UGFyYW1zKCkge1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0xFRlRcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoOSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlZnJlc2hlcyB0aGUgY2FwdHVyZWQgaW1hZ2VzIGluIG1lZGlhIHN0b3JlIG1lYW5pbmcgdGhhdCB0aGUgbmV3IGNhcHR1cmVkIGltYWdlIHdpbGwgYmVcbiAgICAgKiBhdmFpbGFibGUgdG8gcHVibGljIGFjY2Vzcy4gVGhhdCBjYW4gYmUgZG9uZSBieSBTZW5kQnJvYWRjYXN0SW1hZ2UgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGVQYXRoT3JnIENhcHR1cmVkIEltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgSW1hZ2UgZmlsZSBVUklcbiAgICAgKiBAcGFyYW0gYWN0aW9uIEFjdGlvbnMgJ0FkZCcvJ1JlbW92ZSdcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlUGF0aE9yZyk7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIHRoaXMgdGh1bWJuYWlsIGltYWdlIHdpbGwgYmUgYXZhaWxhYmxlIG9ubHkgaW4gJ0FkZCcgY2FzZS5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdBZGQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gaW1nVVJJLnJlcGxhY2UoJ1BUX0lNRycsICd0aHVtYl9QVF9JTUcnKTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGh1bW5haWxPcmdQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnY291bGRfbm90X3N5bmNfdGhlX2NhcHR1cmVkX2ltYWdlX2ZpbGUnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aHVtYm5haWwgaW1hZ2UgZm9yIHRoZSBjYXB0dXJlZCB0cmFuc2Zvcm1lZCBpbWFnZSBhbmQgc2V0cyBpdCBpbiBnYWxsZXJ5IGJ1dHRvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVUaHVtYk5haWxJbWFnZShpbWdVUkk6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0aHVtYm5haWxJbWFnZVBhdGggPSBvcGVuY3YuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIHZhciB0aHVtYm5haWxJbWFnZVBhdGggPSBjb20ubWFhcy5vcGVuY3Y0bmF0aXZlc2NyaXB0Lk9wZW5DVlV0aWxzLmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyBjb20ubWFhcy5vcGVuY3Y0bmF0aXZlc2NyaXB0Lk9wZW5DVlV0aWxzLmNyZWF0ZVRodW1ibmFpbEltYWdlKGRzdEltZ1VSSSk7XG5cbiAgICAgICAgICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQubmV0LlVyaS5wYXJzZSgnZmlsZTovLycgKyB0aHVtYm5haWxJbWFnZVBhdGgpO1xuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlVVJJKHVyaSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2NyZWF0aW5nX3RodW1ibmFpbF9pbWFnZScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIFBlcmZvcm0gYWRhcHRpdmUgdGhyZXNob2xkLlxuICAgIC8vICAqIEBwYXJhbSB0aHJlc2hvbGRWYWx1ZSBUaHJlc2hvbGQgdmFsdWVcbiAgICAvLyAgKi9cbiAgICAvLyBwcml2YXRlIHBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aHJlc2hvbGRWYWx1ZTogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgdGhpcy5pbWdFbXB0eSA9IHRoaXMuaW1nVVJJICsgJz90cz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgLy8gICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdFbXB0eTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgdGhpcy5pbWdVUkkgPSBvcGVuY3YucGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRoaXMud3JhcHBlZEltYWdlLCB0aGlzLmZpbGVOYW1lLCB0aHJlc2hvbGRWYWx1ZSk7XG4gICAgLy8gICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgLy8gICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHBlcmZvcm1zIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIGZvciB0aGUgY2FwdHVyZWQgaW1hZ2UgdXNpbmcgT3BlbkNWIEFQSSBhbmRcbiAgICAgKiByZXR1cm5zIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgYWxvbmcgd2l0aCByZWN0YW5nbGUgcG9pbnRzIGFzIHN0cmluZyB3aGljaCB3aWxsIGJlIHVzZWQgdG9cbiAgICAgKiBkcmF3IGNpcmNsZSBwb2ludHMuIEFmdGVyIHRoYXQgaXQgc2hvd3MgdXAgdGhlIGRpYWxvZyBtb2RhbCB3aW5kb3cgd2l0aCB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aDogYW55KTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBjb25zdCBpbWdVUklUZW1wID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoLCAnJyk7XG4gICAgICAgICAgICAvLyB0aGlzLmltZ1VSSSA9IGltZ1VSSVRlbXAuc3Vic3RyaW5nKDAsIGltZ1VSSVRlbXAuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzU3RyID0gJ1JQVFNUUic7IC8vaW1nVVJJVGVtcC5zdWJzdHJpbmcoaW1nVVJJVGVtcC5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICAvLyB0aGlzLmltZ1VSSSA9IHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcudHJhbnNmb3JtKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIHRoaXMuaW1nVVJJTGlzdCA9IHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcudHJhbnNmb3JtTW9yZShmaWxlUGF0aCk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaW1nVVJJTGlzdC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IHRoaXMuaW1nVVJJTGlzdC5nZXQoMCk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltZ1VSSUxpc3Quc2l6ZSgpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJTGlzdC5nZXQoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJLCByZWN0YW5nbGVQb2ludHNTdHIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ25vX2ltYWdlX2NhcHR1cmVkJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zdGFydFByZXZpZXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9wZXJmb3JtaW5nX3BlcnNwZWN0aXZlX3RyYW5zZm9ybWF0aW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBwZXJmb3JtIHByZXNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIGZvciB0aGUgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiBhbmQgc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGluIHRoaXMuaW1nVVJJIHZhcmlhYmxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgSW1hZ2VBc3NldCBvYmplY3QgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQXNzZXQ6IEltYWdlQXNzZXQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGltYWdlQXNzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoaW1hZ2VBc3NldCkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2ltYWdlX3NvdXJjZV9pc19iYWQnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl9nZXR0aW5nX2ltYWdlX3NvdXJjZV9mcm9tX2Fzc2V0JyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ltYWdlIEFzc2V0IHdhcyBudWxsLiAnICsgbW9kdWxlLmZpbGVuYW1lKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnaW1hZ2VfYXNzZXRfd2FzX251bGwnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==