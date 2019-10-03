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
// @ts-ignore
var dialog_component_1 = require("../dialog/dialog.component");
// @ts-ignore
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var angular_1 = require("nativescript-i18n/angular");
// @ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
var application = require("tns-core-modules/application");
var application_1 = require("tns-core-modules/application");
var platform_1 = require("tns-core-modules/platform");
var angular_2 = require("nativescript-ui-sidedrawer/angular");
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
     *
     * @param transformedImageProvider Transformed image provider instance
     */
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader, changeDetectionRef, logger, locale, transformedImageProvider) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
        this.changeDetectionRef = changeDetectionRef;
        this.logger = logger;
        this.locale = locale;
        this.transformedImageProvider = transformedImageProvider;
        /** Empty string variable */
        this.empty = null;
        /** Transformed Image source */
        this.imageSource = new image_source_1.ImageSource();
        /** Poisition to place slider component */
        // private screenHeight = 0;
        /** Canny threshold value     */
        this.thresholdValue = 0;
        this.imagesCount = 0;
        this.isFirstTime = false;
        this.oneMilliSecond = 1000;
        this.isFirstTime = true;
    }
    CaptureComponent.prototype.ngAfterViewInit = function () {
        console.log(' ngAfterViewInit..: ');
        this.drawer = this.drawerComponent.sideDrawer;
        // this.drawer = <RadSideDrawer>application.getRootView();
        this.changeDetectionRef.detectChanges();
        // this.sideDrawerTransition = new PushTransition();
        // this.sideDrawerTransition = new SlideInOnTopTransition();
        // this._changeDetectionRef.detectChanges();
    };
    CaptureComponent.prototype.rectangleAvailable = function (args) {
        console.log(' rectangleAvailable..: ', args.object.checked);
        if (this.cam) {
            var contourSwitch = args.object;
            this.cam.ocvCameraView.isContourRequired = contourSwitch.checked;
            this.transformedImageProvider.isContourRequired = contourSwitch.checked;
            if (!contourSwitch.checked) {
                this.cam.ocvCameraView.sortedRecPointsList.clear();
            }
        }
    };
    // get sideDrawerTransition(): DrawerTransitionBase {
    //     console.log("GET sideDrawerTransition.....");
    //     return this.sideDrawerTransition;
    // }
    // set sideDrawerTransition(value: DrawerTransitionBase) {
    //      console.log("SET sideDrawerTransition.....");
    //     this.sideDrawerTransition = value;
    // }
    // get mainContentText() {
    //     console.log("mainContentText.....");
    //     return this.mainContentText;
    // }
    // set mainContentText(value: string) {
    //     console.log("SET mainContentText.....");
    //     this.mainContentText = value;
    // }
    CaptureComponent.prototype.toggleDrawer = function () {
        this.drawer.toggleDrawerState();
    };
    CaptureComponent.prototype.submitCameraLightThresholdValue = function (textVal) {
        console.log("submitCameraLightThresholdValue :" + textVal);
        // this.cam.ocvCameraView.mFlashThreshold = textVal;
        this.transformedImageProvider.cameraLightThresholdValue = textVal;
    };
    CaptureComponent.prototype.submitCameraLightTimeOutValue = function (textVal) {
        console.log("submitCameraLightTimeOutValue :" + textVal);
        // this.cam.ocvCameraView.mFlashTimeOut = (textVal * this.oneMilliSecond).toString();
        this.transformedImageProvider.cameraLightTimeOutValue = textVal;
    };
    CaptureComponent.prototype.submitAdaptiveThresholdValue = function (textVal) {
        console.log("submitAdaptiveThresholdValue :" + textVal);
        // this.cam.ocvCameraView.adaptiveThreshold = textVal;
        this.transformedImageProvider.adaptiveThreshold = textVal;
    };
    // openDrawer() {
    //     this.drawer.showDrawer();
    // }
    // onCloseDrawerTap() {
    //     this.drawer.closeDrawer();
    // }
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
        this.createThresholdImageButtonMinus();
        this.createThresholdImageButtonPlus();
        this.createAutoFocusImage();
        // if (this.transformedImageProvider.imageList.length > 0) {
        this.createBadgeView();
        // }
        this.createMenuButton();
        // this.imagesCount = this.transformedImageProvider.getThumbnailImagesCountByContentResolver('DESC', this.activityLoader);
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
        // let plusPercentageWidth = 0.85;
        // let plusPercentageHeight = 0.67;
        // let minusPercentageWidth = 0.85;
        // let minusPercentageHeight = 0.75;
        // var rotation = application.android.foregroundActivity
        //     .getWindowManager()
        //     .getDefaultDisplay()
        //     .getRotation();
        // if (rotation == 1) {
        //     plusPercentageWidth = 0.85;
        //     plusPercentageHeight = 0.56;
        //     minusPercentageWidth = 0.85;
        //     minusPercentageHeight = 0.70;
        // }
        this.initThresholdButtonPlus();
        this.initThresholdButtonMinus();
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
            // this.isContourRequiredOld = this.isContourRequired;
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
        // // Turn flash off at startup
        // if (flashMode === 'on') {
        //     this.cam.toggleFlash();
        // }
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
            console.log('camLoaded called..');
            this.cam.camera.setAutoFocusMoveCallback(cb);
            if (this.isFirstTime) {
                this.transformedImageProvider.cameraLightThresholdValue = this.cam.ocvCameraView.mFlashThreshold;
                this.transformedImageProvider.cameraLightTimeOutValue = (this.cam.ocvCameraView.mFlashTimeOut / this.oneMilliSecond);
                this.transformedImageProvider.adaptiveThresholdValue = this.cam.ocvCameraView.adaptiveThreshold;
                this.transformedImageProvider.isContourRequired = this.cam.ocvCameraView.isContourRequired;
                this.isFirstTime = false;
            }
            else {
                this.cam.ocvCameraView.mFlashThreshold = this.transformedImageProvider.cameraLightThresholdValue;
                this.cam.ocvCameraView.mFlashTimeOut = this.transformedImageProvider.cameraLightTimeOutValue * this.oneMilliSecond;
                this.cam.ocvCameraView.adaptiveThreshold = this.transformedImageProvider.adaptiveThresholdValue;
                this.cam.ocvCameraView.isContourRequired = this.transformedImageProvider.isContourRequired;
            }
            // this.setCameraLightOnOff(this.cam.camera);
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
                this.initBadgeView();
                this.initMenuButton();
                this.transformedImageProvider.getThumbnailImagesCountByContentResolver(' DESC', this.activityLoader, this.badgeView);
                // if (this.transformedImageProvider.imageList.length == 0) {
                //     this.cam._nativeView.removeView(this.badgeView);
                // }
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
                // this.cam._initFlashButton();
                // this.cam._initToggleCameraButton();
            }
            this.cam._takePicBtn = this.takePicBtn;
        }
        this.setSliderPoistion();
        // TEST THE ICONS SHOWING/HIDING
        // this.cam.showCaptureIcon = true;
        // this.cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    // /**
    //  * Turn camera light on/off.
    //  * @param cameraParam  Camera object
    //  */
    // setCameraLightOnOff(cameraParam: any) {
    //     const hasFlash = application.android.context.getPackageManager()
    //         .hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA_FLASH);
    //     if (hasFlash) {
    //         const uiModeManager =
    //             application.android.context.getSystemService(android.content.Context.UI_MODE_SERVICE);
    //         switch (uiModeManager.getNightMode()) {
    //             case android.app.UiModeManager.MODE_NIGHT_YES:
    //                 Toast.makeText('android.content.res.Configuration.UI_MODE_NIGHT_YES', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_YES');
    //                 break;
    //             case android.app.UiModeManager.MODE_NIGHT_AUTO:
    //                 Toast.makeText('android.content.res.Configuration.UI_MODE_NIGHT_AUTO', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_AUTO');
    //                 break;
    //             case android.app.UiModeManager.MODE_NIGHT_NO:
    //                 Toast.makeText('android.content.res.Configuration.UI_MODE_NIGHT_NO', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_NO');
    //                 break;
    //             default:
    //                 Toast.makeText('android.content.res.Configuration.DEFAULT', 'long').show();
    //                 console.log('android.content.res.Configuration.DEFAULT');
    //                 break;
    //         }
    //         const nightModeFlags =
    //             application.android.context.getResources().getConfiguration().uiMode &
    //             android.content.res.Configuration.UI_MODE_NIGHT_MASK;
    //         const params = cameraParam.getParameters();
    //         switch (nightModeFlags) {
    //             case android.content.res.Configuration.UI_MODE_NIGHT_YES:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_YES', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_YES');
    //                 params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_TORCH); //FLASH_MODE_TORCH);
    //                 cameraParam.setParameters(params);
    //                 break;
    //             case android.content.res.Configuration.UI_MODE_NIGHT_NO:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_NO', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_NO');
    //                 params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_OFF);
    //                 cameraParam.setParameters(params);
    //                 break;
    //             case android.content.res.Configuration.UI_MODE_NIGHT_UNDEFINED:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_UNDEFINED', 'long').show();
    //                 console.log('android.content.res.Configuration.UI_MODE_NIGHT_UNDEFINED');
    //                 params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_OFF);
    //                 cameraParam.setParameters(params);
    //                 break;
    //         }
    //     }
    // }
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
    /**
    * This method initializes plus threshold button in camera view, actually
    * it removes an existing one if exists and adds it. And also sets
    * the image icon for it.
    */
    CaptureComponent.prototype.initThresholdButtonPlus = function () {
        console.log('initThresholdButtonPlus called...');
        this.cam._nativeView.removeView(this.thresholdBtnPlus);
        // const btnY = screen.mainScreen.heightPixels * percentageHeight;
        // const btnX = screen.mainScreen.widthPixels * percentageWidth;//widthDIPs;// * 0.75;
        // this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnPlus, this.thresholdBtnPlusParams);
    };
    /**
     * This method initializes minus threshold button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    CaptureComponent.prototype.initThresholdButtonMinus = function () {
        console.log('initThresholdButtonMinus called...');
        this.cam._nativeView.removeView(this.thresholdBtnMinus);
        // const btnY = screen.mainScreen.heightPixels * percentageHeight;
        // const btnX = screen.mainScreen.widthPixels * percentageWidth;//widthDIPs;// * 0.75;
        // this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnMinus, this.thresholdBtnMinusParams);
        // this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
        // this.cam._nativeView.bringChildToFront(this.thresholdBtnMinus);
    };
    /**
     * This method initializes menu button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    CaptureComponent.prototype.initMenuButton = function () {
        this.cam._nativeView.removeView(this.menuBtn);
        this.cam._nativeView.addView(this.menuBtn, this.menuParams);
        // this.setImageResource(this.menuBtn, 'ic_photo_library_white');
        // this.cam._nativeView.bringChildToFront(this.galleryBtn);
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
    * Creates menu button. Actually it creates side drawer menun and setting
    * it's properties like image icon, shape and color along with click event listener in it.
    */
    CaptureComponent.prototype.createMenuButton = function () {
        var _this = this;
        this.menuBtn = this.createImageButton();
        this.menuBtn.setId('gb12');
        this.setImageResource(this.menuBtn, 'ic_menu_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);
        // const galleryBtnId = application.android.context.getResources()
        //     .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());
        // this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        // this.galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createTransparentCircleDrawable();
        this.menuBtn.setBackgroundDrawable(shape);
        this.menuBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.toggleDrawer();
            },
        }));
        this.createMenuParams();
    };
    CaptureComponent.prototype.createMenuParams = function () {
        this.menuParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.menuParams.width = '100';
        this.menuParams.height = '100';
        this.menuParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.menuParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
        // ALIGN_PARENT_RIGHT
        this.menuParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
    };
    /**
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createImageGalleryButton = function () {
        var _this = this;
        this.galleryBtn = this.createImageButton();
        this.galleryBtn.setId('gb12');
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
        this.setImageResource(this.thresholdBtnPlus, 'ic_add_circle_white');
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
        this.thresholdBtnPlusParams.height = '115';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = (screen.mainScreen.heightDIPs * screen.mainScreen.scale) * 0.66;
        // const btnX = (screen.mainScreen.widthDIPs * screen.mainScreen.scale) * 0.85;//widthDIPs;// * 0.75;
        // // const btnY = screen.mainScreen.heightPixels * 0.66;
        // const btnX = screen.mainScreen.widthPixels * 0.85;//widthDIPs;// * 0.75;
        // this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        this.thresholdBtnPlusParams.setMargins(8, 8, 8, 110);
        // // ALIGN_PARENT_BOTTOM
        // this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_ABOVE, this.thresholdBtnMinus.getId());
        // // ALIGN_PARENT_RIGHT
        // this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, this.thresholdBtnMinus.getId());
        // // ALIGN_PARENT_BOTTOM
        this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM); //, this.thresholdBtnMinus.getId());
        // ALIGN_PARENT_RIGHT
        this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT); //, this.thresholdBtnMinus.getId());
    };
    CaptureComponent.prototype.createThresholdImageButtonMinus = function () {
        var _this = this;
        this.thresholdBtnMinus = this.createImageButton();
        this.thresholdBtnMinus.setId('minus123');
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
        this.thresholdBtnMinusParams.height = '115';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = (screen.mainScreen.heightDIPs * screen.mainScreen.scale) * 0.74;
        // const btnX = (screen.mainScreen.widthDIPs * screen.mainScreen.scale) * 0.85;//widthDIPs;// * 0.75;
        // const btnY = screen.mainScreen.heightPixels * 0.74;
        // const btnX = screen.mainScreen.widthPixels * 0.85;//widthDIPs;// * 0.75;
        // this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        this.thresholdBtnMinusParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.thresholdBtnMinusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        // ALIGN_PARENT_RIGHT
        this.thresholdBtnMinusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);
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
    * This method initializes badge view to show captured image(s), actually
    * it removes an existing one if exists and adds it.
    */
    CaptureComponent.prototype.initBadgeView = function () {
        this.cam._nativeView.removeView(this.badgeView);
        this.cam._nativeView.addView(this.badgeView, this.badgeViewParams);
        // this.badgeView.setText(this.transformedImageProvider.imagesCount + '');
    };
    /**
     * Creates text view to show captured image count
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns TextView object
     */
    CaptureComponent.prototype.createBadgeView = function () {
        this.badgeView = new android.widget.TextView(application.android.context);
        this.badgeView.setPadding(1, 2, 1, 1);
        // this.badgeView.setMaxHeight(50);
        // this.badgeView.setMaxWidth(50);
        this.badgeView.setBackgroundColor(0xff00ff00); //0xffff0000);
        this.badgeView.setText(this.transformedImageProvider.imagesCount + '');
        this.badgeView.setTextColor(0xFFFFFFFF);
        this.badgeView.setTextAlignment(0x00000004); //center
        // this.setImageResource(this.badgeView, 'ic_photo_library_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);
        // const galleryBtnId = application.android.context.getResources()
        //     .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());
        // this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        // this.galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createBadgeViewCircleDrawable();
        this.badgeView.setBackgroundDrawable(shape);
        // this.badgeView.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        // this.galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
        //     onClick(args: any) {
        //         _this.goImageGallery();
        //     },
        // }));
        this.createBadgeViewParams();
        // return textView;
    };
    /**
     * Creates badge view circle shape with help of GradientDrawable object
     * and sets it's attributes like color, radius and alpha.
     *
     * @returns Returns shape object
     */
    CaptureComponent.prototype.createBadgeViewCircleDrawable = function () {
        var shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0xffff0000);
        shape.setCornerRadius(50);
        shape.setAlpha(150);
        return shape;
    };
    CaptureComponent.prototype.createBadgeViewParams = function () {
        this.badgeViewParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.badgeViewParams.width = '50';
        this.badgeViewParams.height = '50';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        var btnY = (platform_1.screen.mainScreen.heightDIPs * platform_1.screen.mainScreen.scale) * 0.76;
        var btnX = (platform_1.screen.mainScreen.widthDIPs * platform_1.screen.mainScreen.scale) * 0.07; //widthDIPs;// * 0.75;
        // const btnY = screen.mainScreen.heightPixels * 0.76;
        // const btnX = screen.mainScreen.widthPixels * 0.07;//widthDIPs;// * 0.75;
        // this.badgeViewParams.setMargins(btnX, btnY, 18, 18);
        this.badgeViewParams.setMargins(60, 1, 1, 60);
        // ALIGN_PARENT_BOTTOM
        this.badgeViewParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM); //, this.galleryBtn.getId());
        // ALIGN_PARENT_RIGHT
        this.badgeViewParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT); //, this.galleryBtn.getId());
        // this.badgeViewParams.setMargins(18, 58, 18, 50);
        // // ALIGN_PARENT_BOTTOM
        // this.badgeViewParams.addRule(android.widget.RelativeLayout.ABOVE, this.galleryBtn.getId());
        // // ALIGN_PARENT_RIGHT
        // this.badgeViewParams.addRule(android.widget.RelativeLayout.ALIGN_RIGHT, this.galleryBtn.getId());
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
        // this.cam.toggleFlash();
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
        if (!this.transformedImageProvider.isContourRequired) {
            thisParam.cam.ocvCameraView.sortedRecPointsList.clear();
        }
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
                // if (!this.imgURIList.isEmpty()) {
                if (dialogResult.length > 0) {
                    _this.setTransformedImage(_this.imgURI);
                    // for (let i = 0; i < this.imgURIList.size(); i++) {
                    dialogResult.forEach(function (transformedImg) {
                        // const imgURITemp = transformedImg.filePath;
                        _this.createThumbNailImage(transformedImg.filePath);
                        _this.refreshCapturedImagesinMediaStore(filePathOrg, transformedImg.filePath, 'Add');
                    });
                    // const imgURITemp = this.imgURIList.get(i);
                    // this.createThumbNailImage(imgURITemp);
                    // this.refreshCapturedImagesinMediaStore(filePathOrg, imgURITemp, 'Add');
                    // }
                    _this.badgeView.setVisibility(android.view.View.VISIBLE);
                    _this.transformedImageProvider.imagesCount += dialogResult.length;
                    var badgeView_1 = _this.badgeView;
                    var imgCount_1 = _this.transformedImageProvider.imagesCount;
                    setTimeout(function () {
                        badgeView_1.setText(imgCount_1 + '');
                    }, 100);
                }
                _this.cam.camera.startPreview();
                // this.setCameraLightOnOff(this.cam.camera);
            }
            else {
                try {
                    var imgFileOrg = fs.File.fromPath(filePathOrg);
                    if (imgFileOrg) {
                        imgFileOrg.removeSync();
                    }
                    // if (!this.imgURIList.isEmpty()) {
                    if (dialogResult.length > 0) {
                        // for (let i = 0; i < this.imgURIList.size(); i++) {
                        dialogResult.forEach(function (transformedImg) {
                            // const imgURITemp = this.imgURIList.get(i);
                            var imgURIFile = fs.File.fromPath(transformedImg.filePath);
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
                            _this.refreshCapturedImagesinMediaStore(filePathOrg, transformedImg.filePath, 'Remove');
                        });
                    }
                    _this.cam.camera.startPreview();
                    // this.setCameraLightOnOff(this.cam.camera);
                }
                catch (error) {
                    Toast.makeText(_this.locale.transform('could_not_delete_the_capture_image') + error, 'long').show();
                    _this.logger.error(module.filename + ': ' + error);
                    _this.cam.camera.startPreview();
                    // this.setCameraLightOnOff(this.cam.camera);
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
        this.galleryParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        // ALIGN_PARENT_LEFT
        this.galleryParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
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
            if (!this.imgURIList.isEmpty() && this.transformedImageProvider.isContourRequired) {
                this.imgURI = this.imgURIList.get(0);
                for (var i = 0; i < this.imgURIList.size(); i++) {
                    transformedimage_provider_1.SendBroadcastImage(this.imgURIList.get(i));
                }
                this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
            }
            else if (this.imgURIList.isEmpty() && !this.transformedImageProvider.isContourRequired) {
                var srcImg = org.opencv.imgcodecs.Imgcodecs.imread(filePath, org.opencv.core.CvType.CV_8UC1);
                this.imgURI = this.cam.ocvCameraView.performAdaptiveThreshold(filePath, srcImg, srcImg, this.transformedImageProvider.adaptiveThresholdValue);
                transformedimage_provider_1.SendBroadcastImage(this.imgURI);
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
__decorate([
    core_1.ViewChild(angular_2.RadSideDrawerComponent),
    __metadata("design:type", angular_2.RadSideDrawerComponent)
], CaptureComponent.prototype, "drawerComponent", void 0);
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
        core_1.ChangeDetectorRef, typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object, angular_1.L, typeof (_b = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _b || Object])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBMEc7QUFDMUcsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFFNUQsaUZBQXlFO0FBQ3pFLGFBQWE7QUFDYiwrREFBMkQ7QUFDM0QsYUFBYTtBQUNiLG9GQUFzRztBQUV0RyxxREFBOEM7QUFDOUMsYUFBYTtBQUNiLHVEQUFzRDtBQUV0RCxtREFBcUQ7QUFDckQsMENBQTRDO0FBQzVDLGlEQUFtRDtBQUVuRCwwREFBNEQ7QUFHNUQsNERBQXVHO0FBQ3ZHLHNEQUE4RDtBQUk5RCw4REFBNEU7QUFHM0U7O0VBRUU7QUFPSCxJQUFhLGdCQUFnQjtJQWtFekI7Ozs7Ozs7Ozs7T0FVRztJQUNILDBCQUNZLElBQVksRUFDWixZQUFnQyxFQUNoQyxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLGNBQThCLEVBQzlCLGtCQUFxQyxFQUNyQyxNQUFvQixFQUNwQixNQUFTLEVBQ1Qsd0JBQWtEO1FBUmxELFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBQzlCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBbUI7UUFDckMsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixXQUFNLEdBQU4sTUFBTSxDQUFHO1FBQ1QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQS9EOUQsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFjMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO1FBT3BELDBDQUEwQztR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O0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQXZzQ0QsSUF1c0NDO0FBNW1Dc0M7SUFBbEMsZ0JBQVMsQ0FBQyxnQ0FBc0IsQ0FBQzs4QkFBeUIsZ0NBQXNCO3lEQUFDO0FBM0Z6RSxnQkFBZ0I7SUFONUIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLENBQUM7cUNBK0VvQixhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSxzQ0FBYztRQUNWLHdCQUFpQixzQkFDN0IsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQyxzQkFDaUIsb0RBQXdCLG9CQUF4QixvREFBd0I7R0F0RnJELGdCQUFnQixDQXVzQzVCO0FBdnNDWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE5nWm9uZSwgT25Jbml0LCBWaWV3Q29udGFpbmVyUmVmLCBDaGFuZ2VEZXRlY3RvclJlZiwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgQ2FtZXJhUGx1cyB9IGZyb20gJ0Buc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1cyc7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ09wdGlvbnMsIE1vZGFsRGlhbG9nU2VydmljZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQgeyBJbWFnZUFzc2V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1hc3NldCc7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcblxuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgRGlhbG9nQ29udGVudCB9IGZyb20gJy4uL2RpYWxvZy9kaWFsb2cuY29tcG9uZW50Jztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG5pbXBvcnQgeyBBbmRyb2lkQXBwbGljYXRpb24sIEFuZHJvaWRBY3Rpdml0eUJhY2tQcmVzc2VkRXZlbnREYXRhIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb25cIjtcbmltcG9ydCB7IGlzQW5kcm9pZCwgc2NyZWVuIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvcGxhdGZvcm1cIjtcbmltcG9ydCB7IFNsaWRlciB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL3NsaWRlclwiO1xuaW1wb3J0IHsgTGFiZWwgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9sYWJlbFwiO1xuaW1wb3J0IHsgRHJhd2VyVHJhbnNpdGlvbkJhc2UsIFJhZFNpZGVEcmF3ZXIsIFNsaWRlSW5PblRvcFRyYW5zaXRpb24gfSBmcm9tIFwibmF0aXZlc2NyaXB0LXVpLXNpZGVkcmF3ZXJcIjtcbmltcG9ydCB7IFJhZFNpZGVEcmF3ZXJDb21wb25lbnQgfSBmcm9tIFwibmF0aXZlc2NyaXB0LXVpLXNpZGVkcmF3ZXIvYW5ndWxhclwiO1xuaW1wb3J0IHsgU3dpdGNoIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvc3dpdGNoXCI7XG5cbiAvKipcbiAqIENhcHR1cmUgY29tcG9uZW50IGNsYXNzLCB3aGljaCBpcyBiZWluZyB1c2VkIHRvIGNhcHR1cmUgaW1hZ2UgZnJvbSBjYW1lcmEuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtY2FwdHVyZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9jYXB0dXJlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2FwdHVyZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIENhcHR1cmVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIC8qKiBDYW1lcmEgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHJpdmF0ZSBjYW06IGFueTtcbiAgICAvKiogR2FsbGVyeSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBnYWxsZXJ5QnRuOiBhbnk7XG4gICAgLyoqIFRha2UgcGljdHVyZSBidXR0b24uICovXG4gICAgcHJpdmF0ZSB0YWtlUGljQnRuOiBhbnk7XG4gICAgLyoqIEF1dG8gZm9jdXMgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgYXV0b2ZvY3VzQnRuOiBhbnk7XG4gICAgLyoqIFBhcmFtYXRlcnMgdXNlZCB0byBkaXNwbGF5IEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeVBhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY1BhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBhdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c1BhcmFtczogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuUGx1czogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuUGx1c1BhcmFtczogYW55O1xuICAgIHByaXZhdGUgdGhyZXNob2xkQnRuTWludXM6IGFueTtcbiAgICBwcml2YXRlIHRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zOiBhbnk7XG4gICAgcHJpdmF0ZSBiYWRnZVZpZXdQYXJhbXM6IGFueTtcbiAgICBwcml2YXRlIGJhZGdlVmlldzogYW55O1xuICAgIHByaXZhdGUgbWVudUJ0bjogYW55O1xuICAgIHByaXZhdGUgbWVudVBhcmFtczogYW55O1xuICAgIC8qKiBFbXB0eSBzdHJpbmcgdmFyaWFibGUgKi9cbiAgICBwcml2YXRlIGVtcHR5OiBhbnkgPSBudWxsO1xuICAgIC8vIC8qKiBMb2NhbGl6YXRpb24gKi9cbiAgICAvLyBwcml2YXRlIGxvY2FsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3Igc2F2ZSBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIHNhdmVCdG5MYWJsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3IgbWFudWFsIGJ1dHRvbiAqL1xuICAgIC8vIHByaXZhdGUgbWFudWFsQnRuTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHBlcmZvcm0gYnV0dG9uICovXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtQnRuTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHJldGFrZSBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIHJldGFrZUJ0bkxhYmxlOiBhbnk7XG5cbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBjaGVjayB0aGUgY2FtZXJhIGlzIHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0NhbWVyYVZpc2libGU6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIFVSSSAqL1xuICAgIHB1YmxpYyBpbWdVUkk6IGFueTtcbiAgICAvKiogT3BlbkNWIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHB1YmxpYyBvcGVuY3ZJbnN0YW5jZTogYW55O1xuICAgIC8qKiBQb2lzaXRpb24gdG8gcGxhY2Ugc2xpZGVyIGNvbXBvbmVudCAqL1xuICAgIC8vIHByaXZhdGUgc2NyZWVuSGVpZ2h0ID0gMDtcbiAgICAvKiogQ2FubnkgdGhyZXNob2xkIHZhbHVlICAgICAqL1xuICAgIHByaXZhdGUgdGhyZXNob2xkVmFsdWUgPSAwO1xuICAgIC8qKiBUaHJlc2hvbGQgdmFsdWUgbGFibGUgaGVpZ2h0ICovXG4gICAgLy8gcHJpdmF0ZSBsYWJlbEhlaWdodCA9IDA7XG4gICAgLyoqIFRvIG1ha2UgbGFiZWwgdmlzaWJsZSBvciBub3QgKi9cbiAgICAvLyBwcml2YXRlIGlzTGFiZWxWaXNpYmxlOiBib29sZWFuO1xuXG4gICAgLyoqIFRyYW5zZm9ybWVkIGltYWdlIGxpc3QgKi9cbiAgICBwcml2YXRlIGltZ1VSSUxpc3Q6IGFueTtcblxuICAgIHByaXZhdGUgaW1hZ2VzQ291bnQgPSAwO1xuXG4gICAgcHJpdmF0ZSBkcmF3ZXI6IFJhZFNpZGVEcmF3ZXI7XG5cbiAgICBwcml2YXRlIGlzRmlyc3RUaW1lID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBvbmVNaWxsaVNlY29uZCA9IDEwMDA7XG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgQ2FwdHVyZUNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lIEFuZ3VsYXIgem9uZSB0byBydW4gYSB0YXNrIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBtb2RhbFNlcnZpY2UgU2VydmljZSBtb2RhbFxuICAgICAqIEBwYXJhbSB2aWV3Q29udGFpbmVyUmVmIFZpZXcgY29udGFpbmVyIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlclxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5kaWNhdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgcHJpdmF0ZSBjaGFuZ2VEZXRlY3Rpb25SZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyLFxuICAgICAgICBwcml2YXRlIGxvY2FsZTogTCxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICApIHtcbiAgICAgICAgdGhpcy5pc0ZpcnN0VGltZSA9IHRydWU7XG4gICAgfVxuXG4gICAgQFZpZXdDaGlsZChSYWRTaWRlRHJhd2VyQ29tcG9uZW50KSBwdWJsaWMgZHJhd2VyQ29tcG9uZW50OiBSYWRTaWRlRHJhd2VyQ29tcG9uZW50O1xuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnIG5nQWZ0ZXJWaWV3SW5pdC4uOiAnKTtcbiAgICAgICAgdGhpcy5kcmF3ZXIgPSB0aGlzLmRyYXdlckNvbXBvbmVudC5zaWRlRHJhd2VyO1xuICAgICAgICAvLyB0aGlzLmRyYXdlciA9IDxSYWRTaWRlRHJhd2VyPmFwcGxpY2F0aW9uLmdldFJvb3RWaWV3KCk7XG4gICAgICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgLy8gdGhpcy5zaWRlRHJhd2VyVHJhbnNpdGlvbiA9IG5ldyBQdXNoVHJhbnNpdGlvbigpO1xuICAgICAgICAvLyB0aGlzLnNpZGVEcmF3ZXJUcmFuc2l0aW9uID0gbmV3IFNsaWRlSW5PblRvcFRyYW5zaXRpb24oKTtcbiAgICAgICAgLy8gdGhpcy5fY2hhbmdlRGV0ZWN0aW9uUmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICB9XG4gICAgcmVjdGFuZ2xlQXZhaWxhYmxlKGFyZ3MpIHtcbiAgICAgICAgY29uc29sZS5sb2coJyByZWN0YW5nbGVBdmFpbGFibGUuLjogJywgKGFyZ3Mub2JqZWN0IGFzIFN3aXRjaCkuY2hlY2tlZCk7XG4gICAgICAgIGlmICh0aGlzLmNhbSkge1xuICAgICAgICAgICAgY29uc3QgY29udG91clN3aXRjaCA9IGFyZ3Mub2JqZWN0IGFzIFN3aXRjaDtcbiAgICAgICAgICAgIHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcuaXNDb250b3VyUmVxdWlyZWQgPSBjb250b3VyU3dpdGNoLmNoZWNrZWQ7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pc0NvbnRvdXJSZXF1aXJlZCA9IGNvbnRvdXJTd2l0Y2guY2hlY2tlZDtcbiAgICAgICAgICAgIGlmICghY29udG91clN3aXRjaC5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5zb3J0ZWRSZWNQb2ludHNMaXN0LmNsZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gZ2V0IHNpZGVEcmF3ZXJUcmFuc2l0aW9uKCk6IERyYXdlclRyYW5zaXRpb25CYXNlIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJHRVQgc2lkZURyYXdlclRyYW5zaXRpb24uLi4uLlwiKTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMuc2lkZURyYXdlclRyYW5zaXRpb247XG4gICAgLy8gfVxuICAgIC8vIHNldCBzaWRlRHJhd2VyVHJhbnNpdGlvbih2YWx1ZTogRHJhd2VyVHJhbnNpdGlvbkJhc2UpIHtcbiAgICAvLyAgICAgIGNvbnNvbGUubG9nKFwiU0VUIHNpZGVEcmF3ZXJUcmFuc2l0aW9uLi4uLi5cIik7XG4gICAgLy8gICAgIHRoaXMuc2lkZURyYXdlclRyYW5zaXRpb24gPSB2YWx1ZTtcbiAgICAvLyB9XG4gICAgLy8gZ2V0IG1haW5Db250ZW50VGV4dCgpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJtYWluQ29udGVudFRleHQuLi4uLlwiKTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMubWFpbkNvbnRlbnRUZXh0O1xuICAgIC8vIH1cbiAgICAvLyBzZXQgbWFpbkNvbnRlbnRUZXh0KHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyAgICAgY29uc29sZS5sb2coXCJTRVQgbWFpbkNvbnRlbnRUZXh0Li4uLi5cIik7XG4gICAgLy8gICAgIHRoaXMubWFpbkNvbnRlbnRUZXh0ID0gdmFsdWU7XG4gICAgLy8gfVxuICAgIHRvZ2dsZURyYXdlcigpIHtcbiAgICAgICAgdGhpcy5kcmF3ZXIudG9nZ2xlRHJhd2VyU3RhdGUoKTtcbiAgICB9XG4gICAgc3VibWl0Q2FtZXJhTGlnaHRUaHJlc2hvbGRWYWx1ZSh0ZXh0VmFsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VibWl0Q2FtZXJhTGlnaHRUaHJlc2hvbGRWYWx1ZSA6XCIgKyB0ZXh0VmFsKTtcbiAgICAgICAgLy8gdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5tRmxhc2hUaHJlc2hvbGQgPSB0ZXh0VmFsO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jYW1lcmFMaWdodFRocmVzaG9sZFZhbHVlID0gdGV4dFZhbDtcbiAgICB9XG4gICAgc3VibWl0Q2FtZXJhTGlnaHRUaW1lT3V0VmFsdWUodGV4dFZhbCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInN1Ym1pdENhbWVyYUxpZ2h0VGltZU91dFZhbHVlIDpcIiArIHRleHRWYWwpO1xuICAgICAgICAvLyB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3Lm1GbGFzaFRpbWVPdXQgPSAodGV4dFZhbCAqIHRoaXMub25lTWlsbGlTZWNvbmQpLnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmNhbWVyYUxpZ2h0VGltZU91dFZhbHVlID0gdGV4dFZhbDtcbiAgICB9XG4gICAgc3VibWl0QWRhcHRpdmVUaHJlc2hvbGRWYWx1ZSh0ZXh0VmFsKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic3VibWl0QWRhcHRpdmVUaHJlc2hvbGRWYWx1ZSA6XCIgKyB0ZXh0VmFsKTtcbiAgICAgICAgLy8gdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5hZGFwdGl2ZVRocmVzaG9sZCA9IHRleHRWYWw7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmFkYXB0aXZlVGhyZXNob2xkID0gdGV4dFZhbDtcbiAgICB9XG4gICAgLy8gb3BlbkRyYXdlcigpIHtcbiAgICAvLyAgICAgdGhpcy5kcmF3ZXIuc2hvd0RyYXdlcigpO1xuICAgIC8vIH1cbiAgICAvLyBvbkNsb3NlRHJhd2VyVGFwKCkge1xuICAgIC8vICAgICB0aGlzLmRyYXdlci5jbG9zZURyYXdlcigpO1xuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXphdGlvbiBtZXRob2QgaW5pdGlhbGl6ZXMgT3BlbkNWIG1vZHVsZSBhbmQgYnV0dG9ucyBsaWtlXG4gICAgICogdGFrZVBpY3R1cmUsIGdhbGxlcnkgYW5kIGF1dG9Gb2N1cyBidXR0b25zIGluIGNhbWVyYSB2aWV3LlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIE9wZW5DVi4uLicpO1xuICAgICAgICB0aGlzLm9wZW5jdkluc3RhbmNlID0gb3BlbmN2LmluaXRPcGVuQ1YoKTtcbiAgICAgICAgdGhpcy5pc0NhbWVyYVZpc2libGUgPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmlzTGFiZWxWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUaHJlc2hvbGRJbWFnZUJ1dHRvbk1pbnVzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlVGhyZXNob2xkSW1hZ2VCdXR0b25QbHVzKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcbiAgICAgICAgLy8gaWYgKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMuY3JlYXRlQmFkZ2VWaWV3KCk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgdGhpcy5jcmVhdGVNZW51QnV0dG9uKCk7XG4gICAgICAgIC8vIHRoaXMuaW1hZ2VzQ291bnQgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRUaHVtYm5haWxJbWFnZXNDb3VudEJ5Q29udGVudFJlc29sdmVyKCdERVNDJywgdGhpcy5hY3Rpdml0eUxvYWRlcik7XG5cbiAgICAgICAgaWYgKCFpc0FuZHJvaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLm9uKEFuZHJvaWRBcHBsaWNhdGlvbi5hY3Rpdml0eUJhY2tQcmVzc2VkRXZlbnQsIChkYXRhOiBBbmRyb2lkQWN0aXZpdHlCYWNrUHJlc3NlZEV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucm91dGVyLmlzQWN0aXZlKFwiL2NhcHR1cmVcIiwgZmFsc2UpKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5jYW5jZWwgPSB0cnVlOyAvLyBwcmV2ZW50cyBkZWZhdWx0IGJhY2sgYnV0dG9uIGJlaGF2aW9yXG4gICAgICAgICAgICAgICAgZGF0YS5hY3Rpdml0eS5tb3ZlVGFza1RvQmFjayh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9XG4gICAgc2V0U2xpZGVyUG9pc3Rpb24oKSB7XG4gICAgICAgIHRoaXMudGhyZXNob2xkVmFsdWUgPSA1MDtcbiAgICAgICAgLy8gbGV0IHBsdXNQZXJjZW50YWdlV2lkdGggPSAwLjg1O1xuICAgICAgICAvLyBsZXQgcGx1c1BlcmNlbnRhZ2VIZWlnaHQgPSAwLjY3O1xuICAgICAgICAvLyBsZXQgbWludXNQZXJjZW50YWdlV2lkdGggPSAwLjg1O1xuICAgICAgICAvLyBsZXQgbWludXNQZXJjZW50YWdlSGVpZ2h0ID0gMC43NTtcbiAgICAgICAgLy8gdmFyIHJvdGF0aW9uID0gYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHlcbiAgICAgICAgLy8gICAgIC5nZXRXaW5kb3dNYW5hZ2VyKClcbiAgICAgICAgLy8gICAgIC5nZXREZWZhdWx0RGlzcGxheSgpXG4gICAgICAgIC8vICAgICAuZ2V0Um90YXRpb24oKTtcblxuICAgICAgICAvLyBpZiAocm90YXRpb24gPT0gMSkge1xuICAgICAgICAvLyAgICAgcGx1c1BlcmNlbnRhZ2VXaWR0aCA9IDAuODU7XG4gICAgICAgIC8vICAgICBwbHVzUGVyY2VudGFnZUhlaWdodCA9IDAuNTY7XG4gICAgICAgIC8vICAgICBtaW51c1BlcmNlbnRhZ2VXaWR0aCA9IDAuODU7XG4gICAgICAgIC8vICAgICBtaW51c1BlcmNlbnRhZ2VIZWlnaHQgPSAwLjcwO1xuICAgICAgICAvLyB9XG4gICAgICAgIHRoaXMuaW5pdFRocmVzaG9sZEJ1dHRvblBsdXMoKTtcbiAgICAgICAgdGhpcy5pbml0VGhyZXNob2xkQnV0dG9uTWludXMoKTtcbiAgICAgICAgLy8gdGhpcy5zY3JlZW5IZWlnaHQgPSAoc2NyZWVuLm1haW5TY3JlZW4uaGVpZ2h0RElQcyAqIHBlcmNlbnRhZ2UpO1xuICAgICAgICAvLyB0aGlzLmxhYmVsSGVpZ2h0ID0gcGx1c1BlcmNlbnRhZ2VIZWlnaHQ7Ly8gKiAwLjY1O1xuICAgIH1cbiAgICBvblVubG9hZGVkKGFyZ3M6IGFueSkge1xuICAgICAgICBsZXQgY2FtZXJhUGx1czogYW55ID0gYXJncy5vYmplY3QgYXMgQ2FtZXJhUGx1cztcbiAgICAgICAgaWYgKGNhbWVyYVBsdXMpIHtcbiAgICAgICAgICAgIGlmIChjYW1lcmFQbHVzLm9jdkNhbWVyYVZpZXcpIHtcbiAgICAgICAgICAgICAgICBjYW1lcmFQbHVzLm9jdkNhbWVyYVZpZXcuZGlzYWJsZVZpZXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbWVyYVBsdXMuX25hdGl2ZVZpZXcucmVtb3ZlVmlldyhjYW1lcmFQbHVzLm9jdkNhbWVyYVZpZXcpO1xuICAgICAgICAgICAgLy8gdGhpcy5pc0NvbnRvdXJSZXF1aXJlZE9sZCA9IHRoaXMuaXNDb250b3VyUmVxdWlyZWQ7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ29uVW5sb2FkZWQgY2FsbGVkJyk7XG4gICAgfVxuICAgIG9uQ2FubnlUaHJlc2hvbGRWYWx1ZUNoYW5nZSh0aHJlc2hvbGQ6IGFueSwgc291bmQ6IGFueSkge1xuICAgICAgICBsZXQgYXVkaW9NYW5hZ2VyID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFN5c3RlbVNlcnZpY2UoYW5kcm9pZC5jb250ZW50LkNvbnRleHQuQVVESU9fU0VSVklDRSk7XG4gICAgICAgIGF1ZGlvTWFuYWdlci5wbGF5U291bmRFZmZlY3Qoc291bmQsIDAuNSk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdvbkNhbm55VGhyZXNob2xkVmFsdWVDaGFuZ2UgY2FsbGVkJywgdGhyZXNob2xkKTtcbiAgICAgICAgdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5jYW5ueVRocmVzaG9sZCA9IHRocmVzaG9sZDtcbiAgICAgICAgY29uc3QgbGFiZWwgPSA8TGFiZWw+dGhpcy5jYW0ucGFnZS5nZXRWaWV3QnlJZChcInRocmVzaG9sZExhYmVsSWRcIik7XG4gICAgICAgIGxhYmVsLnRleHQgPSB0aHJlc2hvbGQ7XG4gICAgICAgIGxhYmVsLnRleHRXcmFwID0gdHJ1ZTtcbiAgICAgICAgbGFiZWwudGV4dEFsaWdubWVudCA9IFwiY2VudGVyXCI7XG4gICAgICAgIGxhYmVsLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3LmNhbm55VGhyZXNob2xkOiAnLCB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3LmNhbm55VGhyZXNob2xkKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsYWJlbC52aXNpYmlsaXR5ID0gJ2NvbGxhcHNlJztcbiAgICAgICAgfSwgMjAwKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gY2FtZXJhIGlzIGxvYWRlZCwgd2hlcmUgYWxsIHRoZSBuZWNjZXNzYXJ5IHRoaW5ncyBsaWtlXG4gICAgICogZGlzcGxheWluZyBidXR0b25zKHRha2VQaWN0dXJlLCBnYWxsZXJ5LCBmbGFzaCwgY2FtZXJhICYgYXV0b0ZvY3VzKSBvbiBjYW1lcmEgdmlld1xuICAgICAqIGFyZSB0YWtlbiBjYXJlIGFuZCBhbHNvIGluaXRpYWxpemVzIGNhbWVyYSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIENhbWVyYVBsdXMgaW5zdGFuY2UgcmVmZXJyZW5jZS5cbiAgICAgKi9cbiAgICBjYW1Mb2FkZWQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIC8vIHRoaXMuc2F2ZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzYXZlJyk7XG4gICAgICAgIC8vIHRoaXMubWFudWFsQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICAvLyB0aGlzLnJldGFrZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZXRha2UnKTtcbiAgICAgICAgLy8gdGhpcy5wZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcblxuICAgICAgICB0aGlzLmNhbSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuY2FtLmdldEZsYXNoTW9kZSgpO1xuICAgICAgICAvLyBpZighdGhpcy5jYW0ubmF0aXZlVmlldyB8fCB0aGlzLmNhbS5uYXRpdmVWaWV3ID09IG51bGwpIHtcbiAgICAgICAgLy8gICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZUFsbFZpZXdzKCk7IC8vID0gdGhpcy5jYW0uX25hdGl2ZVZpZXc7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyAvLyBUdXJuIGZsYXNoIG9mZiBhdCBzdGFydHVwXG4gICAgICAgIC8vIGlmIChmbGFzaE1vZGUgPT09ICdvbicpIHtcbiAgICAgICAgLy8gICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgY29uc3QgY2IgPSBuZXcgYW5kcm9pZC5oYXJkd2FyZS5DYW1lcmEuQXV0b0ZvY3VzTW92ZUNhbGxiYWNrKFxuXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgX3RoaXM6IHRoaXMsXG4gICAgICAgICAgICAgICAgb25BdXRvRm9jdXNNb3Zpbmcoc3RhcnQ6IGFueSwgY2FtZXJhOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYW5pbWF0ZSA9IHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLmFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyZWVuIGNvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGhpcy5hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgwLjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2V0RHVyYXRpb24oMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZCBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZjAwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBpZiAodGhpcy5jYW0uY2FtZXJhKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnY2FtTG9hZGVkIGNhbGxlZC4uJyk7XG4gICAgICAgICAgICB0aGlzLmNhbS5jYW1lcmEuc2V0QXV0b0ZvY3VzTW92ZUNhbGxiYWNrKGNiKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzRmlyc3RUaW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY2FtZXJhTGlnaHRUaHJlc2hvbGRWYWx1ZSA9IHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcubUZsYXNoVGhyZXNob2xkO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmNhbWVyYUxpZ2h0VGltZU91dFZhbHVlID0gKHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcubUZsYXNoVGltZU91dCAvIHRoaXMub25lTWlsbGlTZWNvbmQpO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmFkYXB0aXZlVGhyZXNob2xkVmFsdWUgPSB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3LmFkYXB0aXZlVGhyZXNob2xkO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmlzQ29udG91clJlcXVpcmVkID0gdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5pc0NvbnRvdXJSZXF1aXJlZDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRmlyc3RUaW1lID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcubUZsYXNoVGhyZXNob2xkID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY2FtZXJhTGlnaHRUaHJlc2hvbGRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3Lm1GbGFzaFRpbWVPdXQgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jYW1lcmFMaWdodFRpbWVPdXRWYWx1ZSAqIHRoaXMub25lTWlsbGlTZWNvbmQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5hZGFwdGl2ZVRocmVzaG9sZCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmFkYXB0aXZlVGhyZXNob2xkVmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy5pc0NvbnRvdXJSZXF1aXJlZCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmlzQ29udG91clJlcXVpcmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdGhpcy5zZXRDYW1lcmFMaWdodE9uT2ZmKHRoaXMuY2FtLmNhbWVyYSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jYW0uc2hvd1RvZ2dsZUljb24gPSBmYWxzZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5pbml0VGhyZXNob2xkQnV0dG9uUGx1cygpO1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuaW5pdFRocmVzaG9sZEJ1dHRvbk1pbnVzKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRCYWRnZVZpZXcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRNZW51QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VGh1bWJuYWlsSW1hZ2VzQ291bnRCeUNvbnRlbnRSZXNvbHZlcignIERFU0MnLCB0aGlzLmFjdGl2aXR5TG9hZGVyLCB0aGlzLmJhZGdlVmlldyk7XG4gICAgICAgICAgICAgICAgLy8gaWYgKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuYmFkZ2VWaWV3KTtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlUGljQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcblxuICAgICAgICAgICAgICAgIC8vIHRoaXMuY2FtLl9pbml0Rmxhc2hCdXR0b24oKTtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLmNhbS5faW5pdFRvZ2dsZUNhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYW0uX3Rha2VQaWNCdG4gPSB0aGlzLnRha2VQaWNCdG47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFNsaWRlclBvaXN0aW9uKCk7XG4gICAgICAgIC8vIFRFU1QgVEhFIElDT05TIFNIT1dJTkcvSElESU5HXG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dDYXB0dXJlSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93VG9nZ2xlSWNvbiA9IGZhbHNlO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBUdXJuIGNhbWVyYSBsaWdodCBvbi9vZmYuXG4gICAgLy8gICogQHBhcmFtIGNhbWVyYVBhcmFtICBDYW1lcmEgb2JqZWN0XG4gICAgLy8gICovXG4gICAgLy8gc2V0Q2FtZXJhTGlnaHRPbk9mZihjYW1lcmFQYXJhbTogYW55KSB7XG4gICAgLy8gICAgIGNvbnN0IGhhc0ZsYXNoID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VNYW5hZ2VyKClcbiAgICAvLyAgICAgICAgIC5oYXNTeXN0ZW1GZWF0dXJlKGFuZHJvaWQuY29udGVudC5wbS5QYWNrYWdlTWFuYWdlci5GRUFUVVJFX0NBTUVSQV9GTEFTSCk7XG4gICAgLy8gICAgIGlmIChoYXNGbGFzaCkge1xuICAgIC8vICAgICAgICAgY29uc3QgdWlNb2RlTWFuYWdlciA9XG4gICAgLy8gICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFN5c3RlbVNlcnZpY2UoYW5kcm9pZC5jb250ZW50LkNvbnRleHQuVUlfTU9ERV9TRVJWSUNFKTtcbiAgICAvLyAgICAgICAgIHN3aXRjaCAodWlNb2RlTWFuYWdlci5nZXROaWdodE1vZGUoKSkge1xuICAgIC8vICAgICAgICAgICAgIGNhc2UgYW5kcm9pZC5hcHAuVWlNb2RlTWFuYWdlci5NT0RFX05JR0hUX1lFUzpcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ2FuZHJvaWQuY29udGVudC5yZXMuQ29uZmlndXJhdGlvbi5VSV9NT0RFX05JR0hUX1lFUycsICdsb25nJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYW5kcm9pZC5jb250ZW50LnJlcy5Db25maWd1cmF0aW9uLlVJX01PREVfTklHSFRfWUVTJyk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICAgICAgIGNhc2UgYW5kcm9pZC5hcHAuVWlNb2RlTWFuYWdlci5NT0RFX05JR0hUX0FVVE86XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9BVVRPJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9BVVRPJyk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICAgICAgIGNhc2UgYW5kcm9pZC5hcHAuVWlNb2RlTWFuYWdlci5NT0RFX05JR0hUX05POlxuICAgIC8vICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnYW5kcm9pZC5jb250ZW50LnJlcy5Db25maWd1cmF0aW9uLlVJX01PREVfTklHSFRfTk8nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FuZHJvaWQuY29udGVudC5yZXMuQ29uZmlndXJhdGlvbi5VSV9NT0RFX05JR0hUX05PJyk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uREVGQVVMVCcsICdsb25nJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnYW5kcm9pZC5jb250ZW50LnJlcy5Db25maWd1cmF0aW9uLkRFRkFVTFQnKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgICBjb25zdCBuaWdodE1vZGVGbGFncyA9XG4gICAgLy8gICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpLmdldENvbmZpZ3VyYXRpb24oKS51aU1vZGUgJlxuICAgIC8vICAgICAgICAgICAgIGFuZHJvaWQuY29udGVudC5yZXMuQ29uZmlndXJhdGlvbi5VSV9NT0RFX05JR0hUX01BU0s7XG4gICAgLy8gICAgICAgICBjb25zdCBwYXJhbXMgPSBjYW1lcmFQYXJhbS5nZXRQYXJhbWV0ZXJzKCk7XG4gICAgLy8gICAgICAgICBzd2l0Y2ggKG5pZ2h0TW9kZUZsYWdzKSB7XG4gICAgLy8gICAgICAgICAgICAgY2FzZSBhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9ZRVM6XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uLjEuVUlfTU9ERV9OSUdIVF9ZRVMnLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2FuZHJvaWQuY29udGVudC5yZXMuQ29uZmlndXJhdGlvbi5VSV9NT0RFX05JR0hUX1lFUycpO1xuICAgIC8vICAgICAgICAgICAgICAgICBwYXJhbXMuc2V0Rmxhc2hNb2RlKGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLlBhcmFtZXRlcnMuRkxBU0hfTU9ERV9UT1JDSCk7IC8vRkxBU0hfTU9ERV9UT1JDSCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNhbWVyYVBhcmFtLnNldFBhcmFtZXRlcnMocGFyYW1zKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgLy8gICAgICAgICAgICAgY2FzZSBhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9OTzpcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ2FuZHJvaWQuY29udGVudC5yZXMuQ29uZmlndXJhdGlvbi4uMS5VSV9NT0RFX05JR0hUX05PJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9OTycpO1xuICAgIC8vICAgICAgICAgICAgICAgICBwYXJhbXMuc2V0Rmxhc2hNb2RlKGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLlBhcmFtZXRlcnMuRkxBU0hfTU9ERV9PRkYpO1xuICAgIC8vICAgICAgICAgICAgICAgICBjYW1lcmFQYXJhbS5zZXRQYXJhbWV0ZXJzKHBhcmFtcyk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgIC8vICAgICAgICAgICAgIGNhc2UgYW5kcm9pZC5jb250ZW50LnJlcy5Db25maWd1cmF0aW9uLlVJX01PREVfTklHSFRfVU5ERUZJTkVEOlxuICAgIC8vICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnYW5kcm9pZC5jb250ZW50LnJlcy5Db25maWd1cmF0aW9uLi4xLlVJX01PREVfTklHSFRfVU5ERUZJTkVEJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdhbmRyb2lkLmNvbnRlbnQucmVzLkNvbmZpZ3VyYXRpb24uVUlfTU9ERV9OSUdIVF9VTkRFRklORUQnKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgcGFyYW1zLnNldEZsYXNoTW9kZShhbmRyb2lkLmhhcmR3YXJlLkNhbWVyYS5QYXJhbWV0ZXJzLkZMQVNIX01PREVfT0ZGKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgY2FtZXJhUGFyYW0uc2V0UGFyYW1ldGVycyhwYXJhbXMpO1xuICAgIC8vICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgfVxuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBjYW1lcmEgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC5cbiAgICAgKi9cbiAgICBpbml0Q2FtZXJhQnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGFrZVBpY0J0bik7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50YWtlUGljQnRuLCB0aGlzLnRha2VQaWNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBnYWxsZXJ5IGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuIEFuZCBhbHNvIHNldHNcbiAgICAgKiB0aGUgaW1hZ2UgaWNvbiBmb3IgaXQuXG4gICAgICovXG4gICAgaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLmdhbGxlcnlCdG4pO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuZ2FsbGVyeUJ0biwgMCwgdGhpcy5nYWxsZXJ5UGFyYW1zKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcuYnJpbmdDaGlsZFRvRnJvbnQodGhpcy5nYWxsZXJ5QnRuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBwbHVzIHRocmVzaG9sZCBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuIEFuZCBhbHNvIHNldHNcbiAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAqL1xuICAgIGluaXRUaHJlc2hvbGRCdXR0b25QbHVzKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnaW5pdFRocmVzaG9sZEJ1dHRvblBsdXMgY2FsbGVkLi4uJyk7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy50aHJlc2hvbGRCdG5QbHVzKTtcbiAgICAgICAgLy8gY29uc3QgYnRuWSA9IHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodFBpeGVscyAqIHBlcmNlbnRhZ2VIZWlnaHQ7XG4gICAgICAgIC8vIGNvbnN0IGJ0blggPSBzY3JlZW4ubWFpblNjcmVlbi53aWR0aFBpeGVscyAqIHBlcmNlbnRhZ2VXaWR0aDsvL3dpZHRoRElQczsvLyAqIDAuNzU7XG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy5zZXRNYXJnaW5zKGJ0blgsIGJ0blksIDE4LCAxOCk7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50aHJlc2hvbGRCdG5QbHVzLCB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBtaW51cyB0aHJlc2hvbGQgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC4gQW5kIGFsc28gc2V0c1xuICAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAgKi9cbiAgICBpbml0VGhyZXNob2xkQnV0dG9uTWludXMoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdpbml0VGhyZXNob2xkQnV0dG9uTWludXMgY2FsbGVkLi4uJyk7XG4gICAgICAgIHRoaXMuY2FtLl9uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy50aHJlc2hvbGRCdG5NaW51cyk7XG4gICAgICAgIC8vIGNvbnN0IGJ0blkgPSBzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRQaXhlbHMgKiBwZXJjZW50YWdlSGVpZ2h0O1xuICAgICAgICAvLyBjb25zdCBidG5YID0gc2NyZWVuLm1haW5TY3JlZW4ud2lkdGhQaXhlbHMgKiBwZXJjZW50YWdlV2lkdGg7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zLnNldE1hcmdpbnMoYnRuWCwgYnRuWSwgMTgsIDE4KTtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLCB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zKTtcbiAgICAgICAgLy8gdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGhyZXNob2xkQnRuTWludXMsICdpY19taW51c19jaXJjbGVfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5jYW0uX25hdGl2ZVZpZXcuYnJpbmdDaGlsZFRvRnJvbnQodGhpcy50aHJlc2hvbGRCdG5NaW51cyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIG1lbnUgYnV0dG9uIGluIGNhbWVyYSB2aWV3LCBhY3R1YWxseVxuICAgICAqIGl0IHJlbW92ZXMgYW4gZXhpc3Rpbmcgb25lIGlmIGV4aXN0cyBhbmQgYWRkcyBpdC4gQW5kIGFsc28gc2V0c1xuICAgICAqIHRoZSBpbWFnZSBpY29uIGZvciBpdC5cbiAgICAgKi9cbiAgICBpbml0TWVudUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLm1lbnVCdG4pO1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5hZGRWaWV3KHRoaXMubWVudUJ0biwgdGhpcy5tZW51UGFyYW1zKTtcbiAgICAgICAgLy8gdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMubWVudUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5jYW0uX25hdGl2ZVZpZXcuYnJpbmdDaGlsZFRvRnJvbnQodGhpcy5nYWxsZXJ5QnRuKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaW5pdGlhbGl6ZXMgYXV0b0ZvY3VzIGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgICovXG4gICAgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuKTtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmF1dG9mb2N1c0J0biwgdGhpcy5hdXRvZm9jdXNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRha2UgcGljdHVyZSBidXR0b24uIEFjdHVhbGx5IGl0IGNyZWF0ZXMgaW1hZ2UgYnV0dG9uIGFuZCBzZXR0aW5nXG4gICAgICogaXQncyBwcm9wZXJ0aWVzIGxpa2UgaW1hZ2UgaWNvbiwgc2hhcGUgYW5kIGNvbG9yIGFsb25nIHdpdGggY2xpY2sgZXZlbnQgbGlzdGVuZXIgaW4gaXQuXG4gICAgICovXG4gICAgY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50YWtlUGljQnRuID0gdGhpcy5jcmVhdGVUYWtlUGljQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLnRha2VQaWNCdG4sICdpY19jYW1lcmFfYWx0X3doaXRlJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMudGFrZVBpY0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignI2ZmZmZmZicpOyAvLyB3aGl0ZSBjb2xvclxuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50YWtlUGljRnJvbUNhbShfdGhpcyk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvRm9jdXNJbWFnZSgpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c0J0biA9IHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuYXV0b2ZvY3VzQnRuLCAnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuXG4gICAgICAgIC8vIGxldCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKCdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG4gICAgICAgIC8vIHRoaXMuYXV0b2ZvY3VzQnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVBdXRvZm9jdXNTaGFwZSgpO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIEltYWdlVmlldyB3aWRnZXQgYW5kIHNldHRpbmdzXG4gICAgICogaXQncyBhdHRyaWJ1dGVzIGxpa2UgcGFkZGluZywgaGVpZ2h0LCB3aWR0aCwgY29sb3IgJiBzY2FsZVR5cGUuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGJ1dHRvbiBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3KGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCk7XG4gICAgICAgIGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcbiAgICAgICAgYnRuLnNldE1heEhlaWdodCgxNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoMTU4KTtcbiAgICAgICAgYnRuLnNldFNjYWxlVHlwZShhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcuU2NhbGVUeXBlLkNFTlRFUl9DUk9QKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyMwMDgwMDAnKTsgLy8gR3JlZW4gY29sb3JcbiAgICAgICAgYnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgKiBDcmVhdGVzIG1lbnUgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIHNpZGUgZHJhd2VyIG1lbnVuIGFuZCBzZXR0aW5nXG4gICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAqL1xuICAgIGNyZWF0ZU1lbnVCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5tZW51QnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLm1lbnVCdG4uc2V0SWQoJ2diMTInKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMubWVudUJ0biwgJ2ljX21lbnVfd2hpdGUnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuICAgICAgICAvLyBjb25zdCBnYWxsZXJ5QnRuSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UmVzb3VyY2VzKClcbiAgICAgICAgLy8gICAgIC5nZXRJZGVudGlmaWVyKCdnYWxsZXJ5X2J0bicsICdpZCcsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcblxuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0VGFnKGdhbGxlcnlCdG5JZCwgJ2dhbGxlcnktYnRuLXRhZycpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0Q29udGVudERlc2NyaXB0aW9uKCdnYWxsZXJ5LWJ0bi1kZWMnKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy5tZW51QnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMubWVudUJ0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRvZ2dsZURyYXdlcigpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZU1lbnVQYXJhbXMoKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBjcmVhdGVNZW51UGFyYW1zKCkge1xuICAgICAgICB0aGlzLm1lbnVQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMubWVudVBhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLm1lbnVQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMubWVudVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMubWVudVBhcmFtcy5hZGRSdWxlKGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkFMSUdOX1BBUkVOVF9UT1ApO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfUklHSFRcbiAgICAgICAgdGhpcy5tZW51UGFyYW1zLmFkZFJ1bGUoYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuQUxJR05fUEFSRU5UX0xFRlQpO1xuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgaW1hZ2UgZ2FsbGVyeSBidXR0b24uIEFjdHVhbGx5IGl0IGNyZWF0ZXMgaW1hZ2UgYnV0dG9uIGFuZCBzZXR0aW5nXG4gICAgICogaXQncyBwcm9wZXJ0aWVzIGxpa2UgaW1hZ2UgaWNvbiwgc2hhcGUgYW5kIGNvbG9yIGFsb25nIHdpdGggY2xpY2sgZXZlbnQgbGlzdGVuZXIgaW4gaXQuXG4gICAgICovXG4gICAgY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldElkKCdnYjEyJyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBjcmVhdGVUaHJlc2hvbGRJbWFnZUJ1dHRvblBsdXMoKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0UGFkZGluZygzNCwgNSwgMzQsIDM0KTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMudGhyZXNob2xkQnRuUGx1cywgJ2ljX2FkZF9jaXJjbGVfd2hpdGUnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuICAgICAgICBjb25zdCBnYWxsZXJ5QnRuUGx1c0lkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcigndGhyZXNob2xkX2J0bl9wbHVzJywgJ2lkJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRUYWcoZ2FsbGVyeUJ0blBsdXNJZCwgJ3RocmVzaG9sZC1idG4tcGx1cy10YWcnKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzLnNldENvbnRlbnREZXNjcmlwdGlvbigndGhyZXNob2xkLWJ0bi1wbHVzLWRlYycpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlQ2lyY2xlRHJhd2FibGVGb3JUaHJlc2hvbGRCdG4oKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVIpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayh2aWV3OiBhbnkpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnb25DbGljayBjYWxsZWQuLi4uJyk7XG4gICAgICAgICAgICAgICAgLy8gYXJncy5wbGF5U291bmRFZmZlY3QoYW5kcm9pZC52aWV3LlNvdW5kRWZmZWN0Q29uc3RhbnRzLkNMSUNLKTtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAgICAgICAgIF90aGlzLm9uQ2FubnlUaHJlc2hvbGRWYWx1ZUNoYW5nZShfdGhpcy50aHJlc2hvbGRWYWx1ZSwgYW5kcm9pZC52aWV3LlNvdW5kRWZmZWN0Q29uc3RhbnRzLk5BVklHQVRJT05fVVApO1xuXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1cy5zZXRPblRvdWNoTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uVG91Y2hMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvblRvdWNoKHZpZXc6IGFueSwgbW90aW9uRXZlbnQ6IGFueSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdvblRvdWNoIGNhbGxlZC4uLi4nLCBtb3Rpb25FdmVudC5nZXRBY3Rpb25NYXNrZWQoKSk7XG4gICAgICAgIC8vICAgICAgICAgdmlldy5zZXRQcmVzc2VkKHRydWUpO1xuICAgICAgICAvLyAgICAgICAgIHZpZXcucGVyZm9ybUNsaWNrKCk7XG4gICAgICAgIC8vICAgICAgICAgdmlldy5zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICAgICAgLy8gICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSkpO1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25Mb25nQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25Mb25nQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvbkxvbmdDbGljayh2aWV3OiBhbnkpIHtcbiAgICAgICAgLy8gICAgICAgICBjb25zb2xlLmxvZygnb25Mb25nQ2xpY2tlZCBjYWxsZWQnKTtcbiAgICAgICAgLy8gICAgICAgICAvLyB2aWV3LnNldFByZXNzZWQodHJ1ZSk7XG4gICAgICAgIC8vICAgICAgICAgLy8gdmlldy5zZXRQcmVzc2VkKGZhbHNlKTtcbiAgICAgICAgLy8gICAgICAgICAvLyBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAvLyAgICAgICAgIC8vICBfdGhpcy5vbkNhbm55VGhyZXNob2xkVmFsdWVDaGFuZ2UoX3RoaXMudGhyZXNob2xkVmFsdWUpO1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfSkpO1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXMuc2V0T25LZXlMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25LZXlMaXN0ZW5lcih7XG4gICAgICAgIC8vICAgICBvbktleSh2aWV3OiBhbnksIGtleUNvZGU6IGFueSwga2V5RXZlbnQ6IGFueSkge1xuICAgICAgICAvLyAgICAgICAgIGNvbnNvbGUubG9nKCdvbktleSBjYWxsZWQnKTtcbiAgICAgICAgLy8gICAgICAgICAvLyBfdGhpcy50aHJlc2hvbGRWYWx1ZSsrO1xuICAgICAgICAvLyAgICAgICAgIC8vICBfdGhpcy5vbkNhbm55VGhyZXNob2xkVmFsdWVDaGFuZ2UoX3RoaXMudGhyZXNob2xkVmFsdWUpO1xuICAgICAgICAvLyAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRocmVzaG9sZEJ0blBsdXNQYXJhbXMoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVRocmVzaG9sZEJ0blBsdXNQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLndpZHRoID0gJzcwJztcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLmhlaWdodCA9ICcxMTUnO1xuICAgICAgICAvLyAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnggPSAnNTAwJztcbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnkgPSAnNTAwJztcbiAgICAgICAgLy8gY29uc3QgYnRuWSA9IChzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRESVBzICogc2NyZWVuLm1haW5TY3JlZW4uc2NhbGUpICogMC42NjtcbiAgICAgICAgLy8gY29uc3QgYnRuWCA9IChzY3JlZW4ubWFpblNjcmVlbi53aWR0aERJUHMgKiBzY3JlZW4ubWFpblNjcmVlbi5zY2FsZSkgKiAwLjg1Oy8vd2lkdGhESVBzOy8vICogMC43NTtcbiAgICAgICAgLy8gLy8gY29uc3QgYnRuWSA9IHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodFBpeGVscyAqIDAuNjY7XG4gICAgICAgIC8vIGNvbnN0IGJ0blggPSBzY3JlZW4ubWFpblNjcmVlbi53aWR0aFBpeGVscyAqIDAuODU7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuc2V0TWFyZ2lucyhidG5YLCBidG5ZLCAxOCwgMTgpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCAxMTApO1xuICAgICAgICAvLyAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuUGx1c1BhcmFtcy5hZGRSdWxlKGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkFMSUdOX0FCT1ZFLCB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLmdldElkKCkpO1xuICAgICAgICAvLyAvLyBBTElHTl9QQVJFTlRfUklHSFRcbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLmFkZFJ1bGUoYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuQUxJR05fUklHSFQsIHRoaXMudGhyZXNob2xkQnRuTWludXMuZ2V0SWQoKSk7XG5cbiAgICAgICAgLy8gLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BTElHTl9QQVJFTlRfQk9UVE9NKTsgLy8sIHRoaXMudGhyZXNob2xkQnRuTWludXMuZ2V0SWQoKSk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9SSUdIVFxuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BTElHTl9QQVJFTlRfUklHSFQpOy8vLCB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLmdldElkKCkpO1xuXG4gICAgfVxuICAgIHByaXZhdGUgY3JlYXRlVGhyZXNob2xkSW1hZ2VCdXR0b25NaW51cygpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLnNldElkKCdtaW51czEyMycpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgNSk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLCAnaWNfbWludXNfY2lyY2xlX3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgLy8gY29uc3QgZ2FsbGVyeUJ0blBsdXNJZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAvLyAgICAgLmdldElkZW50aWZpZXIoJ3RocmVzaG9sZF9idG5fbWludXMnLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzLnNldFRhZyhnYWxsZXJ5QnRuUGx1c0lkLCAndGhyZXNob2xkLWJ0bi1wbHVzLXRhZycpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLnNldENvbnRlbnREZXNjcmlwdGlvbigndGhyZXNob2xkLWJ0bi1wbHVzLWRlYycpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlQ2lyY2xlRHJhd2FibGVGb3JUaHJlc2hvbGRCdG4oKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51cy5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzLnNldFNjYWxlVHlwZShhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcuU2NhbGVUeXBlLkNFTlRFUik7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXMuc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgICAgICAgICBfdGhpcy50aHJlc2hvbGRWYWx1ZS0tO1xuICAgICAgICAgICAgICAgIF90aGlzLm9uQ2FubnlUaHJlc2hvbGRWYWx1ZUNoYW5nZShfdGhpcy50aHJlc2hvbGRWYWx1ZSwgYW5kcm9pZC52aWV3LlNvdW5kRWZmZWN0Q29uc3RhbnRzLk5BVklHQVRJT05fRE9XTik7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuY3JlYXRlVGhyZXNob2xkQnRuTWludXNQYXJhbXMoKTtcbiAgICB9XG4gICAgcHJpdmF0ZSBjcmVhdGVUaHJlc2hvbGRCdG5NaW51c1BhcmFtcygpIHtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy50aHJlc2hvbGRCdG5NaW51c1BhcmFtcy53aWR0aCA9ICc3MCc7XG4gICAgICAgIHRoaXMudGhyZXNob2xkQnRuTWludXNQYXJhbXMuaGVpZ2h0ID0gJzExNSc7XG4gICAgICAgIC8vICB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMueCA9ICc1MDAnO1xuICAgICAgICAvLyB0aGlzLnRocmVzaG9sZEJ0blBsdXNQYXJhbXMueSA9ICc1MDAnO1xuICAgICAgICAvLyBjb25zdCBidG5ZID0gKHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodERJUHMgKiBzY3JlZW4ubWFpblNjcmVlbi5zY2FsZSkgKiAwLjc0O1xuICAgICAgICAvLyBjb25zdCBidG5YID0gKHNjcmVlbi5tYWluU2NyZWVuLndpZHRoRElQcyAqIHNjcmVlbi5tYWluU2NyZWVuLnNjYWxlKSAqIDAuODU7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICAvLyBjb25zdCBidG5ZID0gc2NyZWVuLm1haW5TY3JlZW4uaGVpZ2h0UGl4ZWxzICogMC43NDtcbiAgICAgICAgLy8gY29uc3QgYnRuWCA9IHNjcmVlbi5tYWluU2NyZWVuLndpZHRoUGl4ZWxzICogMC44NTsvL3dpZHRoRElQczsvLyAqIDAuNzU7XG4gICAgICAgIC8vIHRoaXMudGhyZXNob2xkQnRuTWludXNQYXJhbXMuc2V0TWFyZ2lucyhidG5YLCBidG5ZLCAxOCwgMTgpO1xuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG5cbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zLmFkZFJ1bGUoYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuQUxJR05fUEFSRU5UX0JPVFRPTSk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9SSUdIVFxuICAgICAgICB0aGlzLnRocmVzaG9sZEJ0bk1pbnVzUGFyYW1zLmFkZFJ1bGUoYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuQUxJR05fUEFSRU5UX1JJR0hUKTtcblxuICAgIH1cbiAgICBwcml2YXRlIGNyZWF0ZUNpcmNsZURyYXdhYmxlRm9yVGhyZXNob2xkQnRuKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTsvLygweEZGRkZGRkZGKTsgLy8oMHg5OTAwMDAwMCk7XG4gICAgICAgIHNoYXBlLnNldENvcm5lclJhZGl1cygxMCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDEwMCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyBhY3R1YWwgaWNvbiBpbWFnZSB1c2luZyBpY29uIG5hbWUgZnJvbSBjb250ZXh0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gTmFtZVxuICAgICAqL1xuICAgIGdldEltYWdlRHJhd2FibGUoaWNvbk5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHRcbiAgICAgICAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoaWNvbk5hbWUsICdkcmF3YWJsZScsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIGRyYXdhYmxlSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdHJhbnNwYXJlbnQgY2lyY2xlIHNoYXBlIHdpdGggaGVscCBvZiBHcmFkaWVudERyYXdhYmxlIG9iamVjdFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIGNvbG9yLCByYWRpdXMgYW5kIGFscGhhLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDEwMCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDE1MCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIHNoYXBlIHVzaW5nIFNoYXBlRHJhd2FibGUgb2JqZWN0IGFuZFxuICAgICAqIHNldHMgYWxwaGEuXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvZm9jdXNTaGFwZSgpOiBhbnkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuU2hhcGVEcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGJ1dHRvbiB3aXRoIGhlbHAgb2YgSW1hZ2VCdXR0b24gd2lkZ2V0XG4gICAgICogYW5kIHNldHMgaXQncyBhdHRyaWJ1dGVzIGxpa2UgcGFkZGluZywgbWF4SGVpZ2h0ICYgbWF4d2lkdGguXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGJ1dHRvbiBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZUJ1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VCdXR0b24oYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDU4KTtcbiAgICAgICAgYnRuLnNldE1heFdpZHRoKDU4KTtcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIG9mIEltYWdlQnV0dG9uIHdpZGdldFxuICAgICAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIHBhZGRpbmcsIG1heEhlaWdodCAmIG1heHdpZHRoLlxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBidXR0b24gb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlVGFrZVBpY0J1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VCdXR0b24oYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMTQsIDE0LCAxNCwgMTQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE3OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNzgpO1xuXG4gICAgICAgIHJldHVybiBidG47XG4gICAgfVxuXG4gICAgLyoqXG4gICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBiYWRnZSB2aWV3IHRvIHNob3cgY2FwdHVyZWQgaW1hZ2UocyksIGFjdHVhbGx5XG4gICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuXG4gICAgKi9cbiAgICBpbml0QmFkZ2VWaWV3KCkge1xuICAgICAgICB0aGlzLmNhbS5fbmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuYmFkZ2VWaWV3KTtcbiAgICAgICAgdGhpcy5jYW0uX25hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmJhZGdlVmlldywgdGhpcy5iYWRnZVZpZXdQYXJhbXMpO1xuICAgICAgICAvLyB0aGlzLmJhZGdlVmlldy5zZXRUZXh0KHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlc0NvdW50ICsgJycpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRleHQgdmlldyB0byBzaG93IGNhcHR1cmVkIGltYWdlIGNvdW50XG4gICAgICogYW5kIHNldHMgaXQncyBhdHRyaWJ1dGVzIGxpa2UgcGFkZGluZywgbWF4SGVpZ2h0ICYgbWF4d2lkdGguXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIFRleHRWaWV3IG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUJhZGdlVmlldygpIHtcbiAgICAgICAgdGhpcy5iYWRnZVZpZXcgPSBuZXcgYW5kcm9pZC53aWRnZXQuVGV4dFZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgdGhpcy5iYWRnZVZpZXcuc2V0UGFkZGluZygxLCAyLCAxLCAxKTtcbiAgICAgICAgLy8gdGhpcy5iYWRnZVZpZXcuc2V0TWF4SGVpZ2h0KDUwKTtcbiAgICAgICAgLy8gdGhpcy5iYWRnZVZpZXcuc2V0TWF4V2lkdGgoNTApO1xuICAgICAgICB0aGlzLmJhZGdlVmlldy5zZXRCYWNrZ3JvdW5kQ29sb3IoMHhmZjAwZmYwMCk7IC8vMHhmZmZmMDAwMCk7XG4gICAgICAgIHRoaXMuYmFkZ2VWaWV3LnNldFRleHQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VzQ291bnQgKyAnJyk7XG4gICAgICAgIHRoaXMuYmFkZ2VWaWV3LnNldFRleHRDb2xvcigweEZGRkZGRkZGKTtcbiAgICAgICAgdGhpcy5iYWRnZVZpZXcuc2V0VGV4dEFsaWdubWVudCgweDAwMDAwMDA0KSAvL2NlbnRlclxuICAgICAgICAvLyB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5iYWRnZVZpZXcsICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgLy8gY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgIC8vICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldFRhZyhnYWxsZXJ5QnRuSWQsICdnYWxsZXJ5LWJ0bi10YWcnKTtcbiAgICAgICAgLy8gdGhpcy5nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVCYWRnZVZpZXdDaXJjbGVEcmF3YWJsZSgpO1xuICAgICAgICB0aGlzLmJhZGdlVmlldy5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICAvLyB0aGlzLmJhZGdlVmlldy5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVIpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0T25DbGlja0xpc3RlbmVyKG5ldyBhbmRyb2lkLnZpZXcuVmlldy5PbkNsaWNrTGlzdGVuZXIoe1xuICAgICAgICAvLyAgICAgb25DbGljayhhcmdzOiBhbnkpIHtcbiAgICAgICAgLy8gICAgICAgICBfdGhpcy5nb0ltYWdlR2FsbGVyeSgpO1xuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfSkpO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlQmFkZ2VWaWV3UGFyYW1zKCk7XG4gICAgICAgIC8vIHJldHVybiB0ZXh0VmlldztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBiYWRnZSB2aWV3IGNpcmNsZSBzaGFwZSB3aXRoIGhlbHAgb2YgR3JhZGllbnREcmF3YWJsZSBvYmplY3RcbiAgICAgKiBhbmQgc2V0cyBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBjb2xvciwgcmFkaXVzIGFuZCBhbHBoYS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgc2hhcGUgb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlQmFkZ2VWaWV3Q2lyY2xlRHJhd2FibGUoKTogYW55IHtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5HcmFkaWVudERyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldENvbG9yKDB4ZmZmZjAwMDApO1xuICAgICAgICBzaGFwZS5zZXRDb3JuZXJSYWRpdXMoNTApO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgxNTApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuICAgIHByaXZhdGUgY3JlYXRlQmFkZ2VWaWV3UGFyYW1zKCkge1xuICAgICAgICB0aGlzLmJhZGdlVmlld1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5iYWRnZVZpZXdQYXJhbXMud2lkdGggPSAnNTAnO1xuICAgICAgICB0aGlzLmJhZGdlVmlld1BhcmFtcy5oZWlnaHQgPSAnNTAnO1xuICAgICAgICAvLyAgdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnggPSAnNTAwJztcbiAgICAgICAgLy8gdGhpcy50aHJlc2hvbGRCdG5QbHVzUGFyYW1zLnkgPSAnNTAwJztcbiAgICAgICAgY29uc3QgYnRuWSA9IChzY3JlZW4ubWFpblNjcmVlbi5oZWlnaHRESVBzICogc2NyZWVuLm1haW5TY3JlZW4uc2NhbGUpICogMC43NjtcbiAgICAgICAgY29uc3QgYnRuWCA9IChzY3JlZW4ubWFpblNjcmVlbi53aWR0aERJUHMgKiBzY3JlZW4ubWFpblNjcmVlbi5zY2FsZSkgKiAwLjA3Oy8vd2lkdGhESVBzOy8vICogMC43NTtcbiAgICAgICAgLy8gY29uc3QgYnRuWSA9IHNjcmVlbi5tYWluU2NyZWVuLmhlaWdodFBpeGVscyAqIDAuNzY7XG4gICAgICAgIC8vIGNvbnN0IGJ0blggPSBzY3JlZW4ubWFpblNjcmVlbi53aWR0aFBpeGVscyAqIDAuMDc7Ly93aWR0aERJUHM7Ly8gKiAwLjc1O1xuICAgICAgICAvLyB0aGlzLmJhZGdlVmlld1BhcmFtcy5zZXRNYXJnaW5zKGJ0blgsIGJ0blksIDE4LCAxOCk7XG5cbiAgICAgICAgdGhpcy5iYWRnZVZpZXdQYXJhbXMuc2V0TWFyZ2lucyg2MCwgMSwgMSwgNjApO1xuXG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy5iYWRnZVZpZXdQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BTElHTl9QQVJFTlRfQk9UVE9NKTsvLywgdGhpcy5nYWxsZXJ5QnRuLmdldElkKCkpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfUklHSFRcbiAgICAgICAgdGhpcy5iYWRnZVZpZXdQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BTElHTl9QQVJFTlRfTEVGVCk7IC8vLCB0aGlzLmdhbGxlcnlCdG4uZ2V0SWQoKSk7XG5cbiAgICAgICAgLy8gdGhpcy5iYWRnZVZpZXdQYXJhbXMuc2V0TWFyZ2lucygxOCwgNTgsIDE4LCA1MCk7XG4gICAgICAgIC8vIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgLy8gdGhpcy5iYWRnZVZpZXdQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BQk9WRSwgdGhpcy5nYWxsZXJ5QnRuLmdldElkKCkpO1xuICAgICAgICAvLyAvLyBBTElHTl9QQVJFTlRfUklHSFRcbiAgICAgICAgLy8gdGhpcy5iYWRnZVZpZXdQYXJhbXMuYWRkUnVsZShhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5BTElHTl9SSUdIVCwgdGhpcy5nYWxsZXJ5QnRuLmdldElkKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQaG90byBjYXB0dXJlZCBldmVudCBmaXJlcyB3aGVuIGEgcGljdHVyZSBpcyB0YWtlbiBmcm9tIGNhbWVyYSwgd2hpY2ggYWN0dWFsbHlcbiAgICAgKiBsb2FkcyB0aGUgY2FwdHVyZWQgaW1hZ2UgZnJvbSBJbWFnZUFzc2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgSW1hZ2UgY2FwdHVyZWQgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIHBob3RvQ2FwdHVyZWRFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BIT1RPIENBUFRVUkVEIEVWRU5UISEhJyk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKGFyZ3MuZGF0YSBhcyBJbWFnZUFzc2V0KTtcbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogVGhpcyBpcyBiZWVuIGNhbGxlZCB3aGVuIHRvZ2dsZSB0aGUgY2FtZXJhIGJ1dHRvbi5cbiAgICAvLyAgKiBAcGFyYW0gYXJncyBDYW1lcmEgdG9nZ2xlIGV2ZW50IGRhdGFcbiAgICAvLyAgKi9cbiAgICB0b2dnbGVDYW1lcmFFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2NhbWVyYSB0b2dnbGVkJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gdG9nZ2xlIHRoZSBmbGFzaCBpY29uIG9uIGNhbWVyYS4gVGhpcyBhY3R1YWxseVxuICAgICAqIGZsYXNoIG9mZiB3aGVuIGl0IGFscmVhZHkgaXMgb24gb3IgdmljZS12ZXJzYS5cbiAgICAgKi9cbiAgICB0b2dnbGVGbGFzaE9uQ2FtKCk6IHZvaWQge1xuICAgICAgICAvLyB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gZGlzcGxheSBmbGFzaCBpY29uIGJhc2VkIG9uIGl0J3MgcHJvcGVydHkgdmFsdWUgdHJ1ZS9mYWxzZS5cbiAgICAgKi9cbiAgICB0b2dnbGVTaG93aW5nRmxhc2hJY29uKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc2hvd0ZsYXNoSWNvbiA9ICR7dGhpcy5jYW0uc2hvd0ZsYXNoSWNvbn1gKTtcbiAgICAgICAgdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9ICF0aGlzLmNhbS5zaG93Rmxhc2hJY29uO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gc3dpdGNoIGZyb250L2JhY2sgY2FtZXJhLlxuICAgICAqL1xuICAgIHRvZ2dsZVRoZUNhbWVyYSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW0udG9nZ2xlQ2FtZXJhKCk7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIE9wZW4gY2FtZXJhIGxpYnJhcnkuXG4gICAgLy8gICovXG4gICAgLy8gb3BlbkNhbVBsdXNMaWJyYXJ5KCk6IHZvaWQge1xuICAgIC8vICAgICB0aGlzLmNhbS5jaG9vc2VGcm9tTGlicmFyeSgpO1xuICAgIC8vIH1cbiAgICAvKipcbiAgICAgKiBUYWtlcyBwaWN0dXJlIGZyb20gY2FtZXJhIHdoZW4gdXNlciBwcmVzcyB0aGUgdGFrZVBpY3R1cmUgYnV0dG9uIG9uIGNhbWVyYSB2aWV3LlxuICAgICAqIFRoZW4gaXQgc2V0cyB0aGUgY2FwdHVyZWQgaW1hZ2UgVVJJIGludG8gaW1hZ2VTb3VyY2UgdG8gYmUgZGlzcGxheWVkIGluIGZyb250LWVuZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB0aGlzUGFyYW0gQ29udGFpbnMgY2FtZXJhcGx1cyBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRha2VQaWNGcm9tQ2FtKHRoaXNQYXJhbTogYW55KTogdm9pZCB7XG4gICAgICAgIGlmICghdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaXNDb250b3VyUmVxdWlyZWQpIHtcbiAgICAgICAgICAgIHRoaXNQYXJhbS5jYW0ub2N2Q2FtZXJhVmlldy5zb3J0ZWRSZWNQb2ludHNMaXN0LmNsZWFyKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpc1BhcmFtLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpc1BhcmFtLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSXQgdGFrZXMgdG8gaW1hZ2UgZ2FsbGVyeSB2aWV3IHdoZW4gdXNlciBjbGlja3Mgb24gZ2FsbGVyeSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93cyB0aGUgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2cgd2luZG93IGFmdGVyIHRha2luZyBwaWN0dXJlLiBUaGlzIGlzIG1vZGFsIHdpbmRvdyBhbG9uZyB3aXRoXG4gICAgICogcmV1aXJlZCBvcHRpb25zIGxpa2UgY2FwdHVyZSBpbWFnZSBVUkksIHRyYW5zZm9ybWVkIGltYWdlIFVSSSwgcmVjdGFuZ2xlIHBvaW50cyBhbmQgZXRjLlxuICAgICAqIFRoaXMgYWxzbyB0YWtlcyBjYXJlIG9mIGRlbGV0aW5nIHRoZSBjYXB0dXJlZCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gcmV0YWtlICh1c2luZyBSZXRha2UgYnV0dG9uKVxuICAgICAqIHBpY3R1cmUgYW5kLCBjcmVhdGVzIHRodW1ibmFpbCBpbWFnZSB3aGVuIHVzZXIgd2FudHMgdG8gc2F2ZSB0aGUgY2FwdHVyZWQgaW1hZ2UgYW5kXG4gICAgICogc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpY29uIGJ1dHRvbiBpbiBjYW1lcmEgdmlldy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmdWxsU2NyZWVuIE9wdGlvbiB0byBzaG93IGZ1bGxzY3JlZW4gZGlhbG9nIG9yIG5vdFxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSByZWNQb2ludHNTdHIgUmVjdGFuZ2xlIHBvaW50cyBpbiBzdHJpbmdcbiAgICAgKi9cbiAgICBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxTY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCByZWNQb2ludHNTdHIpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xuICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgIGltYWdlU291cmNlOiBpbWdVUkksXG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2VPcmc6IGZpbGVQYXRoT3JnLFxuICAgICAgICAgICAgICAgIGlzQXV0b0NvcnJlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgcmVjdGFuZ2xlUG9pbnRzOiByZWNQb2ludHNTdHIsXG4gICAgICAgICAgICAgICAgLy8gc2F2ZUJ0bkxhYmxlOiB0aGlzLnNhdmVCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyBtYW51YWxCdG5MYWJsZTogdGhpcy5tYW51YWxCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyByZXRha2VCdG5MYWJsZTogdGhpcy5yZXRha2VCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtQnRuTGFibGU6IHRoaXMucGVyZm9ybUJ0bkxhYmxlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IGZ1bGxTY3JlZW4sXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLm1vZGFsU2VydmljZS5zaG93TW9kYWwoRGlhbG9nQ29udGVudCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChkaWFsb2dSZXN1bHQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaWFsb2dSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGRpbG9nUmVzdWx0VGVtcCA9IGRpYWxvZ1Jlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGRpYWxvZ1Jlc3VsdC5pbmRleE9mKCdfVEVNUCcpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkaWxvZ1Jlc3VsdFRlbXAgPSBkaWxvZ1Jlc3VsdFRlbXAucmVwbGFjZSgnX1RFTVAnICsgaSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAvLyBcdH1cbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoIXRoaXMuaW1nVVJJTGlzdC5pc0VtcHR5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpYWxvZ1Jlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRyYW5zZm9ybWVkSW1hZ2UodGhpcy5pbWdVUkkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltZ1VSSUxpc3Quc2l6ZSgpOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZ1Jlc3VsdC5mb3JFYWNoKHRyYW5zZm9ybWVkSW1nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBpbWdVUklUZW1wID0gdHJhbnNmb3JtZWRJbWcuZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUaHVtYk5haWxJbWFnZSh0cmFuc2Zvcm1lZEltZy5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIHRyYW5zZm9ybWVkSW1nLmZpbGVQYXRoLCAnQWRkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGltZ1VSSVRlbXAgPSB0aGlzLmltZ1VSSUxpc3QuZ2V0KGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5jcmVhdGVUaHVtYk5haWxJbWFnZShpbWdVUklUZW1wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBpbWdVUklUZW1wLCAnQWRkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJhZGdlVmlldy5zZXRWaXNpYmlsaXR5KGFuZHJvaWQudmlldy5WaWV3LlZJU0lCTEUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VzQ291bnQgKz0gZGlhbG9nUmVzdWx0Lmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhZGdlVmlldyA9IHRoaXMuYmFkZ2VWaWV3O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nQ291bnQgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZXNDb3VudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhZGdlVmlldy5zZXRUZXh0KGltZ0NvdW50ICsgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbS5jYW1lcmEuc3RhcnRQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2V0Q2FtZXJhTGlnaHRPbk9mZih0aGlzLmNhbS5jYW1lcmEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nRmlsZU9yZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVPcmcucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKCF0aGlzLmltZ1VSSUxpc3QuaXNFbXB0eSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlhbG9nUmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1nVVJJTGlzdC5zaXplKCk7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpYWxvZ1Jlc3VsdC5mb3JFYWNoKHRyYW5zZm9ybWVkSW1nID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgaW1nVVJJVGVtcCA9IHRoaXMuaW1nVVJJTGlzdC5nZXQoaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKHRyYW5zZm9ybWVkSW1nLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUZpbGUucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC8vIFRvZG8gOiB0byBiZSByZW1vdmVkIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGltZ1VyaUNvbnRvdXJQYXRoID0gaW1nVVJJLnN1YnN0cmluZygwLCBpbWdVUkkuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGltZ1VSSUNvbnRvdXJGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVcmlDb250b3VyUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChpbWdVUklDb250b3VyRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgaW1nVVJJQ29udG91ckZpbGUucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAvLyBUb2RvIC0gRW5kXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIHRyYW5zZm9ybWVkSW1nLmZpbGVQYXRoLCAnUmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbS5jYW1lcmEuc3RhcnRQcmV2aWV3KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnNldENhbWVyYUxpZ2h0T25PZmYodGhpcy5jYW0uY2FtZXJhKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnY291bGRfbm90X2RlbGV0ZV90aGVfY2FwdHVyZV9pbWFnZScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zdGFydFByZXZpZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuc2V0Q2FtZXJhTGlnaHRPbk9mZih0aGlzLmNhbS5jYW1lcmEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGluIGdhbGxlcnkgaW1hZ2UgYnV0dG9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltZ1VSSVBhcmFtIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgVVJJXG4gICAgICovXG4gICAgc2V0VHJhbnNmb3JtZWRJbWFnZShpbWdVUklQYXJhbTogYW55KSB7XG4gICAgICAgIGlmIChpbWdVUklQYXJhbSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9zZXR0aW5nX2ltYWdlX2luX3ByZXZpZXdfYXJlYScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgdGFrZVBpY3R1cmUgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy53aWR0aCA9ICcxNTAnO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuaGVpZ2h0ID0gJzE1MCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gQ0VOVEVSX0hPUklaT05UQUxcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGxheW91dCBwYXJhbXMgdXNpbmcgTGF5b3V0UGFyYW1zIHdpZGdldCBmb3IgYXV0b0ZvY3VzIGJ1dHRvblxuICAgICAqIGFuZCBzZXRzIGl0J3MgcGFyYW1zIGxpa2UgaGVpZ2h0LCB3aWR0aCwgbWFyZ2luICYgcnVsZXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmhlaWdodCA9ICczMDAnO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQ0VOVEVSXG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmFkZFJ1bGUoMTMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGltYWdlIHJlc291cmNlIHRvIGdpdmVuIGltYWdlIGJ1dHRvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBidG4gQnV0dG9uIGltYWdlIGluc3RhbmNlIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgSWNvbiBuYW1lXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJbWFnZVJlc291cmNlKGJ0bjogYW55LCBpY29uTmFtZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoaWNvbk5hbWUpO1xuICAgICAgICBidG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBsYXlvdXQgcGFyYW1zIHVzaW5nIExheW91dFBhcmFtcyB3aWRnZXQgZm9yIGdhbGxlcnkgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLndpZHRoID0gJzEwMCc7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5oZWlnaHQgPSAnMTAwJztcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuQUxJR05fUEFSRU5UX0JPVFRPTSk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9MRUZUXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkFMSUdOX1BBUkVOVF9MRUZUKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVmcmVzaGVzIHRoZSBjYXB0dXJlZCBpbWFnZXMgaW4gbWVkaWEgc3RvcmUgbWVhbmluZyB0aGF0IHRoZSBuZXcgY2FwdHVyZWQgaW1hZ2Ugd2lsbCBiZVxuICAgICAqIGF2YWlsYWJsZSB0byBwdWJsaWMgYWNjZXNzLiBUaGF0IGNhbiBiZSBkb25lIGJ5IFNlbmRCcm9hZGNhc3RJbWFnZSBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgQ2FwdHVyZWQgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBJbWFnZSBmaWxlIFVSSVxuICAgICAqIEBwYXJhbSBhY3Rpb24gQWN0aW9ucyAnQWRkJy8nUmVtb3ZlJ1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVQYXRoT3JnKTtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdGhpcyB0aHVtYm5haWwgaW1hZ2Ugd2lsbCBiZSBhdmFpbGFibGUgb25seSBpbiAnQWRkJyBjYXNlLlxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ0FkZCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBpbWdVUkkucmVwbGFjZSgnUFRfSU1HJywgJ3RodW1iX1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aHVtbmFpbE9yZ1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdjb3VsZF9ub3Rfc3luY190aGVfY2FwdHVyZWRfaW1hZ2VfZmlsZScpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRodW1ibmFpbCBpbWFnZSBmb3IgdGhlIGNhcHR1cmVkIHRyYW5zZm9ybWVkIGltYWdlIGFuZCBzZXRzIGl0IGluIGdhbGxlcnkgYnV0dG9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRodW1iTmFpbEltYWdlKGltZ1VSSTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEltYWdlUGF0aCA9IG9wZW5jdi5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdmFyIHRodW1ibmFpbEltYWdlUGF0aCA9IGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuICAgICAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKCdmaWxlOi8vJyArIHRodW1ibmFpbEltYWdlUGF0aCk7XG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VVUkkodXJpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfY3JlYXRpbmdfdGh1bWJuYWlsX2ltYWdlJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogUGVyZm9ybSBhZGFwdGl2ZSB0aHJlc2hvbGQuXG4gICAgLy8gICogQHBhcmFtIHRocmVzaG9sZFZhbHVlIFRocmVzaG9sZCB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcbiAgICAvLyAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSB1c2luZyBPcGVuQ1YgQVBJIGFuZFxuICAgICAqIHJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbG9uZyB3aXRoIHJlY3RhbmdsZSBwb2ludHMgYXMgc3RyaW5nIHdoaWNoIHdpbGwgYmUgdXNlZCB0b1xuICAgICAqIGRyYXcgY2lyY2xlIHBvaW50cy4gQWZ0ZXIgdGhhdCBpdCBzaG93cyB1cCB0aGUgZGlhbG9nIG1vZGFsIHdpbmRvdyB3aXRoIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGNvbnN0IGltZ1VSSVRlbXAgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgsICcnKTtcbiAgICAgICAgICAgIC8vIHRoaXMuaW1nVVJJID0gaW1nVVJJVGVtcC5zdWJzdHJpbmcoMCwgaW1nVVJJVGVtcC5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHNTdHIgPSAnUlBUU1RSJzsgLy9pbWdVUklUZW1wLnN1YnN0cmluZyhpbWdVUklUZW1wLmluZGV4T2YoJ1JQVFNUUicpKTtcbiAgICAgICAgICAgIC8vIHRoaXMuaW1nVVJJID0gdGhpcy5jYW0ub2N2Q2FtZXJhVmlldy50cmFuc2Zvcm0oZmlsZVBhdGgpO1xuXG4gICAgICAgICAgICB0aGlzLmltZ1VSSUxpc3QgPSB0aGlzLmNhbS5vY3ZDYW1lcmFWaWV3LnRyYW5zZm9ybU1vcmUoZmlsZVBhdGgpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmltZ1VSSUxpc3QuaXNFbXB0eSgpICYmIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmlzQ29udG91clJlcXVpcmVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSB0aGlzLmltZ1VSSUxpc3QuZ2V0KDApO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWdVUklMaXN0LnNpemUoKTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltZ1VSSUxpc3QuZ2V0KGkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKHRydWUsIGZpbGVQYXRoLCB0aGlzLmltZ1VSSSwgcmVjdGFuZ2xlUG9pbnRzU3RyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5pbWdVUklMaXN0LmlzRW1wdHkoKSAmJiAhdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaXNDb250b3VyUmVxdWlyZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3JjSW1nID0gb3JnLm9wZW5jdi5pbWdjb2RlY3MuSW1nY29kZWNzLmltcmVhZChmaWxlUGF0aCwgb3JnLm9wZW5jdi5jb3JlLkN2VHlwZS5DVl84VUMxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IHRoaXMuY2FtLm9jdkNhbWVyYVZpZXcucGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKGZpbGVQYXRoLCBzcmNJbWcsIHNyY0ltZywgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuYWRhcHRpdmVUaHJlc2hvbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJLCByZWN0YW5nbGVQb2ludHNTdHIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ25vX2ltYWdlX2NhcHR1cmVkJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FtLmNhbWVyYS5zdGFydFByZXZpZXcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9wZXJmb3JtaW5nX3BlcnNwZWN0aXZlX3RyYW5zZm9ybWF0aW9uJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBwZXJmb3JtIHByZXNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIGZvciB0aGUgY2FwdHVyZWQgaW1hZ2VcbiAgICAgKiBhbmQgc2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGluIHRoaXMuaW1nVVJJIHZhcmlhYmxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgSW1hZ2VBc3NldCBvYmplY3QgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQXNzZXQ6IEltYWdlQXNzZXQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGltYWdlQXNzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoaW1hZ2VBc3NldCkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2ltYWdlX3NvdXJjZV9pc19iYWQnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl9nZXR0aW5nX2ltYWdlX3NvdXJjZV9mcm9tX2Fzc2V0JyksICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ltYWdlIEFzc2V0IHdhcyBudWxsLiAnICsgbW9kdWxlLmZpbGVuYW1lKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnaW1hZ2VfYXNzZXRfd2FzX251bGwnKSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==