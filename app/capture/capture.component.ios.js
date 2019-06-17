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
var file_system_1 = require("tns-core-modules/file-system");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var dialog_component_1 = require("../dialog/dialog.component");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var angular_1 = require("nativescript-i18n/angular");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var color_1 = require("tns-core-modules/color");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
var application = require("tns-core-modules/application");
// import * as buttonModule from "tns-core-modules/ui/button";
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
        /** Indicates whether flash is on/off */
        this.flashEnabled = false;
        this.locale = new angular_1.L();
    }
    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    CaptureComponent.prototype.ngOnInit = function () {
        console.log('Initializing OpenCV...');
        console.log(OpenCVWrapper.openCVVersionString());
        // console.log('OpenCVWrapper.getOpenCVMat' + OpenCVWrapper.getOpenCVMat());
        //         let alert = UIAlertController(title: "My Alert", message: "This is an alert.", preferredStyle: .alert) 
        // alert.addAction(UIAlertAction(title: NSLocalizedString("OK", comment: "Default action"), style: .default, handler: { _ in 
        // NSLog("The \"OK\" alert occured.")
        // }));
        // console.log(OpenCVWrapper.getOpenCVMat());
        //  this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this.createButtons();
        // this.createTakePictureButton();
        // this.createImageGalleryButton();
        // this.createAutoFocusImage();
    };
    CaptureComponent.prototype.createButtons = function () {
        var width = this.cam.width;
        var height = this.cam.height;
        this.createTakePictureButton(width, height);
        this.createImageGalleryButton(height);
        this.createFlashButton(width, height);
        this.createSwitchCameraButton(width, height);
    };
    /**
     * This method is called when camera is loaded, where all the neccessary things like
     * displaying buttons(takePicture, gallery, flash, camera & autoFocus) on camera view
     * are taken care and also initializes camera instance.
     *
     * @param args CameraPlus instance referrence.
     */
    CaptureComponent.prototype.camLoaded = function (args) {
        console.log('camLoaded..');
        this.saveBtnLable = this.locale.transform('save');
        this.manualBtnLable = this.locale.transform('manual');
        this.retakeBtnLable = this.locale.transform('retake');
        this.performBtnLable = this.locale.transform('perform');
        this.cam = args.object;
        var flashMode = this.cam.getFlashMode();
        // To refresh camera view after navigated from image gallery.
        this.cam._swifty.viewDidAppear(true);
        // Turn flash on at startup
        if (flashMode === 'on') {
            this.cam.toggleFlash();
        }
        // let testStr = OpenCVWrapper.performPerspectiveCorrectionManual('/var/mobile/Containers/Data/Application/B2A61C6B-EE7E-4EE8-8735-E510781340E2/Library/Application Support/LiveSync/app/capturedimages/IMG_1559892332017.jpg', 'StringPoints', 'Size');
        // console.log('Method testing ....', testStr);
        // Todo: const cb = new android.hardware.Camera.AutoFocusMoveCallback(
        //     {
        //         _this: this,
        //         onAutoFocusMoving(start: any, camera: any) {
        //             const animate = this._this.autofocusBtn.animate();
        //             if (!start) {
        //                 animate.scaleX(1);
        //                 animate.scaleY(1);
        //                 // Green color
        //                 const color = android.graphics.Color.parseColor('#008000');
        //                 this._this.autofocusBtn.setColorFilter(color);
        //             } else {
        //                 animate.scaleX(0.50);
        //                 animate.scaleY(0.50);
        //                 animate.setDuration(100);
        //                 // Red color
        //                 const color = android.graphics.Color.parseColor('#ff0000');
        //                 this._this.autofocusBtn.setColorFilter(color);
        //                 animate.start();
        //             }
        //         },
        //     });
        // if (this.cam.camera) {
        //     this.cam.camera.setAutoFocusMoveCallback(cb);
        // }
        // if (args.data) {
        //     this.cam.showFlashIcon = true;
        //     this.cam.showToggleIcon = true;
        //     try {
        //         this.initImageGalleryButton();
        //         this.initCameraButton();
        //         this.initAutoFocusImageButton();
        //     } catch (e) {
        //         this.takePicBtn = null;
        //         this.galleryBtn = null;
        //         this.autofocusBtn = null;
        //         this.takePicParams = null;
        //         this.galleryParams = null;
        //         this.autofocusParams = null;
        //         this.cam.showToggleIcon = true;
        //         this.createTakePictureButton();
        //         this.createImageGalleryButton();
        //         this.createAutoFocusImage();
        //         this.initImageGalleryButton();
        //         this.initCameraButton();
        //         this.initAutoFocusImageButton();
        //         this.cam._initFlashButton();
        //         this.cam._initToggleCameraButton();
        //     }
        // }
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
    CaptureComponent.prototype.createTakePictureButton = function (width, height) {
        var _this = this;
        var picOutline = createImageButton(_this, CGRectMake(width - 69, height - 80, 50, 50), null, null, null, createIcon('picOutline', null, null), null);
        picOutline.transform = CGAffineTransformMakeScale(1.5, 1.5);
        this.cam.ios.addSubview(picOutline); //snapPicture
        var takePicBtn = createImageButton(_this, CGRectMake(width - 70, height - 80.7, 50, 50), null, 'snapPicture', null, createIcon('takePic', null, null), null);
        this.cam.ios.addSubview(takePicBtn);
        this.cam._swifty._owner.get().confirmPhotos = false;
        // this.cam._swifty.snapPicture =  function (options) {
        //     alert('snapPicture....');
        // };
    };
    /**
     * Creates flash button in the camera view
     *
     * @param width width of the camera view
     */
    CaptureComponent.prototype.createFlashButton = function (width, height) {
        this.cam._swifty._flashBtnHandler = flashBtnHandler;
        this.cam._swifty._flashBtnHandler();
    };
    /**
     * Creates switch camera button in the camera view
     *
     * @param width width of the camera view
     */
    CaptureComponent.prototype.createSwitchCameraButton = function (width, height) {
        var switchCameraBtn = createImageButton(this, CGRectMake(width - 85, 80, 100, 50), null, 'switchCam', null, createIcon('toggle', CGSizeMake(65, 50), null), null);
        switchCameraBtn.transform = CGAffineTransformMakeScale(0.75, 0.75);
        this.cam.nativeView.addSubview(switchCameraBtn);
    };
    /**
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createImageGalleryButton = function (height) {
        var _this = this;
        // this.cam._swifty.openGallery = openGallery;
        this.cam._swifty.chooseFromLibrary = goImageGallery;
        // this.cam._swifty.openGallery();
        this.galleryBtn = createImageButton(_this, CGRectMake(20, height - 80, 50, 50), null, 'openGallery', null, createIcon('gallery', null, null), null);
        this.galleryBtn.transform = CGAffineTransformMakeScale(0.75, 0.75);
        this.cam.ios.addSubview(_this.galleryBtn);
        // let x =  this.cam._swifty;
        // var z = Object.getPrototypeOf(x);
        // z.prototype.openGallery1 = function () {
        //     console.log('Gallery testing...');
        // }
    };
    CaptureComponent.prototype.chooseFromLibrary = function () {
        alert('chooseFromLibrary');
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
    // createImageButton(): any {
    //     const btn = new android.widget.ImageButton(application.android.context);
    //     btn.setPadding(34, 34, 34, 34);
    //     btn.setMaxHeight(58);
    //     btn.setMaxWidth(58);
    //     return btn;
    // }
    /**
     * Photo captured event fires when a picture is taken from camera, which actually
     * loads the captured image from ImageAsset.
     *
     * @param capturedData Image captured event data
     */
    CaptureComponent.prototype.photoCapturedEvent = function (capturedData) {
        console.log('PHOTO CAPTURED EVENT!!!');
        // this.opencvInstance = opencv.initOpenCV();
        console.log(OpenCVWrapper.openCVVersionString());
        // OpenCVWrapper.performTransformation();
        // let lcv =  cv;
        // let opencv1 = new OpenCvCameraPreview();
        // opencv1.initNativeView();
        // opencv1.onLoaded();
        // opencv1.startCamera();
        // opencv1.initNativeView();
        this.loadImage(capturedData);
    };
    /**
     * This is been called when toggle the camera button.
     * @param args Camera toggle event data
     */
    CaptureComponent.prototype.toggleCameraEvent = function (args) {
        console.log('camera toggled');
        // const width = this.cam.width;
        // const height = this.cam.height;
        // this.createFlashButton(width, height);
        // this.cam._swifty._owner.get().showFlashIcon = true;
    };
    /**
     * This method is called when toggle the flash icon on camera. This actually
     * flash off when it already is on or vice-versa.
     */
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        alert("Clicked Flash");
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
    CaptureComponent.prototype.imagesGalleryEvent = function (args) {
        this.router.navigate(['imagegallery']);
    };
    /**
     * It takes to image gallery view when user clicks on gallery button on camera view.
     */
    // goImageGallery() {
    //     console.log('calling gallery....');
    //     return new Promise(function (resolve, reject) {
    //     this._owner.get().sendEvent('imageGalleryEvent');
    //     resolve();
    //     });
    //     // this.router.navigate(['imagegallery']);
    // }
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
                // this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, 'Add');
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
                        // SendBroadcastImage(imgUriContourPath);
                    }
                    // Todo - End
                    // this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
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
                // SendBroadcastImage(this.imgURI);
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
            // Todo: const thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            var thumbnailImagePath = OpenCVWrapper.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);
            // const uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            // thumbnailImagePath = thumbnailImagePath.toString().substring(7);
            var buttonImage = UIImage.imageNamed(thumbnailImagePath);
            this.galleryBtn.setImageForState(buttonImage, 0 /* Normal */);
            this.galleryBtn.setImageForState(buttonImage, 1 /* Highlighted */);
            this.galleryBtn.setImageForState(buttonImage, 4 /* Selected */);
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
            var ptImgPngUri = '';
            // let opencvInstance = OpenCVWrapper.new();
            ptImgPngUri = OpenCVWrapper.performTransformation(filePath);
            console.log('Transformed Image URI: ', ptImgPngUri);
            // const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = ptImgPngUri.substring(0, ptImgPngUri.indexOf('RPTSTR'));
            var rectanglePointsStr = ptImgPngUri.substring(ptImgPngUri.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
            // this.showCapturedPictureDialog(true, filePath, ptImgPngUri, '');
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
    CaptureComponent.prototype.loadImage = function (capturedData) {
        var _this = this;
        var cameraPlus = capturedData.object;
        var imageAsset = capturedData.data;
        // imageAsset.
        if (capturedData.data) {
            // let _uriRequestOptions = PHImageRequestOptions.alloc().init();
            //                             _uriRequestOptions.synchronous = true;
            //                             PHImageManager.defaultManager().requestImageDataForAssetOptionsResultHandler(imageAsset, _uriRequestOptions, function (data, uti, orientation, info) {
            //                                     let uri = info.objectForKey("PHImageFileURLKey");
            //                                     let newUri = uri.toString();
            //                                     let fileName = newUri.replace(/^.*[\\\/]/, '');
            //                                     // t.copyImageFiles(rawData, fileName);
            //                             });
            this.imageSource = new image_source_1.ImageSource();
            this.imageSource.fromAsset(capturedData.data).then(function (imgSrc) {
                if (imgSrc) {
                    _this.zone.run(function () {
                        // const img: ImageSource = <ImageSource>fromFile(imgSrc);
                        // const folder: Folder = <Folder>knownFolders.currentApp();
                        var folder = fs.path.join(fs.knownFolders.documents().path);
                        // let folders0 = fs.Folder.fromPath(folder0);
                        // const folderDest = knownFolders.documents();
                        var fileName = 'capturedimages/IMG_' + Date.now() + '.jpg';
                        var pathDest = file_system_1.path.join(folder, fileName);
                        var saved = imgSrc.saveToFile(pathDest, "jpg");
                        if (saved) {
                            // UIImageWriteToSavedPhotosAlbum(capturedData.data.nativeImage, null, null, null);
                            // imgSrc.saveToAlbum(this.imageSource, false, false, function () {
                            //     alert('The photo was saved!');
                            // });
                            console.log('Org File Path: ' + pathDest);
                            // const fp = (cameraPlus.ios) ? cameraPlus.ios : cameraPlus.android;
                            // this.imageSourceOrg = fp;
                            _this.imgURI = '';
                            _this.imgURI = pathDest;
                            // if (fp.indexOf('.png') > 0) {
                            //     this.imgURI = fp;
                            _this.imageSource = _this.imgURI;
                            // } else {
                            //     this.imgURI = '';
                            _this.performPerspectiveTransformation(pathDest);
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
        activityloader_common_1.ActivityLoader, typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
var goImageGallery = function (_this) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this._owner.get().sendEvent('imagesGalleryEvent');
        resolve();
    });
    //    this._owner.get().sendEvent('imagesSelectedEvent', this);
};
var openGallery = function () {
    console.log("testing....gallery....");
    alert("openGallery...");
};
var chooseFromLibrary1 = function () {
    alert('chooseFromLibrary1');
};
var snapPicture = function () {
    alert('snapPicture');
};
/** Overide method to display flash button on camera view.
 * This is actually same as it's parent except the button location (x,y)
 */
var flashBtnHandler = function () {
    if (this._flashBtn)
        this._flashBtn.removeFromSuperview();
    if (this.flashEnabled) {
        this._flashBtn = createImageButton(this, CGRectMake(20, 80, 50, 50), null, 'toggleFlash', null, createIcon('flash', null, null), null);
    }
    else {
        this._flashBtn = createImageButton(this, CGRectMake(20, 80, 50, 50), null, 'toggleFlash', null, createIcon('flashOff', null, null), null);
    }
    this._flashBtn.transform = CGAffineTransformMakeScale(0.75, 0.75);
    this.view.addSubview(this._flashBtn);
};
/**
 * Creates icon for the given types (flashOn, flashOff, toggle, pictureOutLine, takePicture, Gallery)
 *
 * @param type type of icon to be created
 * @param size size of the icon
 * @param color color of the icon
 */
var createIcon = function (type, size, color) {
    switch (type) {
        case 'flash':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawFlash(color);
            break;
        case 'flashOff':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawFlashOff(color);
            break;
        case 'toggle':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawToggle(color);
            break;
        case 'picOutline':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawPicOutline(color);
            break;
        case 'takePic':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawCircle(color);
            break;
        case 'gallery':
            UIGraphicsBeginImageContextWithOptions(size || CGSizeMake(50, 50), false, 0);
            drawGallery(color);
            break;
    }
    var img = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return img;
};
/**
 * Draws flashOn icon using UIBezierPath for the flashON button.
 *
 * @param color color of the flashOff icon
 */
var drawFlash = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(23.17, 0.58));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(11.19, 13.65), CGPointMake(22.79, 0.97), CGPointMake(17.38, 6.83));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0, 26.66), CGPointMake(3.2, 22.41), CGPointMake(-0.07, 26.24));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(6.91, 27.44), CGPointMake(0.1, 27.26), CGPointMake(0.34, 27.29));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(13.61, 28.15), CGPointMake(13.34, 27.58), CGPointMake(13.71, 27.61));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(10.61, 37.07), CGPointMake(13.54, 28.45), CGPointMake(12.18, 32.46));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(7.83, 45.92), CGPointMake(9.02, 41.64), CGPointMake(7.76, 45.62));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(8.85, 46.43), CGPointMake(7.89, 46.25), CGPointMake(8.27, 46.43));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.54, 33.48), CGPointMake(9.59, 46.43), CGPointMake(11.36, 44.63));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(33.2, 19.87), CGPointMake(30.18, 23.97), CGPointMake(33.27, 20.35));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(26.57, 19.12), CGPointMake(33.1, 19.21), CGPointMake(33, 19.21));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(20, 18.67), CGPointMake(21.71, 19.06), CGPointMake(20, 18.94));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(22.76, 9.88), CGPointMake(20, 18.49), CGPointMake(21.23, 14.52));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(25.38, 0.73), CGPointMake(24.26, 5.21), CGPointMake(25.45, 1.12));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(23.17, 0.58), CGPointMake(25.24, -0.17), CGPointMake(24.05, -0.26));
    bezierPath.miterLimit = 4;
    bezierPath.closePath();
    iconColor.setFill();
    bezierPath.fill();
};
/**
 * Draws flashOff icon using UIBezierPath for the flashOff button.
 *
 * @param color color of the flashOff icon
 */
var drawFlashOff = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(21.13, 4.5));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(15.1, 12.28), CGPointMake(19.18, 7.01), CGPointMake(16.45, 10.51));
    bezierPath.addLineToPoint(CGPointMake(12.66, 15.45));
    bezierPath.addLineToPoint(CGPointMake(7.09, 9.64));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0.8, 3.9), CGPointMake(2.5, 4.82), CGPointMake(1.41, 3.84));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0, 4.73), CGPointMake(0.29, 3.96), CGPointMake(0.06, 4.2));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.83, 24.13), CGPointMake(-0.06, 5.36), CGPointMake(2.7, 8.39));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(36.44, 42.69), CGPointMake(32.87, 39.81), CGPointMake(35.86, 42.78));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(37.21, 41.88), CGPointMake(36.89, 42.63), CGPointMake(37.15, 42.36));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.64, 35.24), CGPointMake(37.3, 41.28), CGPointMake(36.29, 40.11));
    bezierPath.addLineToPoint(CGPointMake(25.98, 29.31));
    bezierPath.addLineToPoint(CGPointMake(29.34, 24.94));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(32.62, 19.91), CGPointMake(31.76, 21.83), CGPointMake(32.67, 20.39));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(27.02, 19.16), CGPointMake(32.53, 19.25), CGPointMake(32.44, 19.25));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.48, 18.71), CGPointMake(22.91, 19.1), CGPointMake(21.48, 18.98));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(23.8, 9.91), CGPointMake(21.48, 18.53), CGPointMake(22.51, 14.55));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(26.01, 0.75), CGPointMake(25.07, 5.24), CGPointMake(26.07, 1.14));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(25.3, 0.01), CGPointMake(25.96, 0.34), CGPointMake(25.7, 0.07));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.13, 4.5), CGPointMake(24.81, -0.08), CGPointMake(23.97, 0.84));
    bezierPath.miterLimit = 4;
    bezierPath.closePath();
    iconColor.setFill();
    bezierPath.fill();
    var bezier2Path = UIBezierPath.bezierPath();
    bezier2Path.moveToPoint(CGPointMake(7.18, 22.6));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(4.59, 26.7), CGPointMake(5.43, 24.91), CGPointMake(4.54, 26.32));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(10.42, 27.48), CGPointMake(4.68, 27.3), CGPointMake(4.91, 27.33));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(16.08, 28.2), CGPointMake(15.85, 27.63), CGPointMake(16.17, 27.66));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(13.55, 37.12), CGPointMake(16.02, 28.5), CGPointMake(14.87, 32.51));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(11.2, 45.98), CGPointMake(12.2, 41.7), CGPointMake(11.14, 45.68));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(12.06, 46.49), CGPointMake(11.26, 46.31), CGPointMake(11.57, 46.49));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(18.06, 39.67), CGPointMake(12.69, 46.49), CGPointMake(13.61, 45.47));
    bezier2Path.addLineToPoint(CGPointMake(23.29, 32.81));
    bezier2Path.addLineToPoint(CGPointMake(16.71, 25.96));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(9.99, 19.1), CGPointMake(13.09, 22.19), CGPointMake(10.08, 19.1));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(7.18, 22.6), CGPointMake(9.91, 19.1), CGPointMake(8.64, 20.69));
    bezier2Path.miterLimit = 4;
    bezier2Path.closePath();
    iconColor.setFill();
    bezier2Path.fill();
};
/**
 * Draws the toggle icon using UIBezierPath for switch camera button
 *
 * @param color color of toggle icon
 */
var drawToggle = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(17.91, 3.03));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(14.69, 6.2), CGPointMake(16.11, 5.72), CGPointMake(15.7, 6.1));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(13.41, 5.51), CGPointMake(13.75, 6.31), CGPointMake(13.52, 6.17));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(9.1, 4.6), CGPointMake(13.3, 4.74), CGPointMake(13.15, 4.7));
    bezierPath.addLineToPoint(CGPointMake(4.87, 4.5));
    bezierPath.addLineToPoint(CGPointMake(4.87, 5.4));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(3.37, 6.27), CGPointMake(4.87, 6.2), CGPointMake(4.72, 6.27));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0.94, 7.14), CGPointMake(2.25, 6.27), CGPointMake(1.61, 6.52));
    bezierPath.addLineToPoint(CGPointMake(0, 7.98));
    bezierPath.addLineToPoint(CGPointMake(0, 26.59));
    bezierPath.addLineToPoint(CGPointMake(0, 45.2));
    bezierPath.addLineToPoint(CGPointMake(0.97, 46.04));
    bezierPath.addLineToPoint(CGPointMake(1.95, 46.88));
    bezierPath.addLineToPoint(CGPointMake(31.88, 46.88));
    bezierPath.addLineToPoint(CGPointMake(61.81, 46.88));
    bezierPath.addLineToPoint(CGPointMake(62.83, 45.9));
    bezierPath.addLineToPoint(CGPointMake(63.88, 44.96));
    bezierPath.addLineToPoint(CGPointMake(63.88, 26.52));
    bezierPath.addLineToPoint(CGPointMake(63.88, 8.09));
    bezierPath.addLineToPoint(CGPointMake(62.98, 7.18));
    bezierPath.addLineToPoint(CGPointMake(62.08, 6.27));
    bezierPath.addLineToPoint(CGPointMake(55.03, 6.27));
    bezierPath.addLineToPoint(CGPointMake(48.03, 6.27));
    bezierPath.addLineToPoint(CGPointMake(45.89, 3.14));
    bezierPath.addLineToPoint(CGPointMake(43.76, 0));
    bezierPath.addLineToPoint(CGPointMake(31.84, 0));
    bezierPath.addLineToPoint(CGPointMake(19.93, 0));
    bezierPath.addLineToPoint(CGPointMake(17.91, 3.03));
    bezierPath.closePath();
    bezierPath.moveToPoint(CGPointMake(44.92, 4.6));
    bezierPath.addLineToPoint(CGPointMake(46.94, 7.67));
    bezierPath.addLineToPoint(CGPointMake(54.13, 7.67));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(61.74, 8.09), CGPointMake(59.19, 7.67), CGPointMake(61.44, 7.81));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(61.74, 44.89), CGPointMake(62.38, 8.68), CGPointMake(62.38, 44.3));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(1.95, 44.89), CGPointMake(61.1, 45.48), CGPointMake(2.58, 45.48));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(1.5, 26.63), CGPointMake(1.61, 44.57), CGPointMake(1.5, 40.04));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(2.1, 8.22), CGPointMake(1.5, 10.84), CGPointMake(1.57, 8.71));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(9.74, 7.67), CGPointMake(2.58, 7.77), CGPointMake(3.82, 7.67));
    bezierPath.addLineToPoint(CGPointMake(16.78, 7.67));
    bezierPath.addLineToPoint(CGPointMake(17.65, 6.34));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(19.74, 3.21), CGPointMake(18.13, 5.65), CGPointMake(19.07, 4.22));
    bezierPath.addLineToPoint(CGPointMake(21.02, 1.39));
    bezierPath.addLineToPoint(CGPointMake(31.96, 1.46));
    bezierPath.addLineToPoint(CGPointMake(42.86, 1.57));
    bezierPath.addLineToPoint(CGPointMake(44.92, 4.6));
    bezierPath.miterLimit = 4;
    bezierPath.closePath();
    iconColor.setFill();
    bezierPath.fill();
    var bezier2Path = UIBezierPath.bezierPath();
    bezier2Path.moveToPoint(CGPointMake(28.28, 11.26));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.77, 14.43), CGPointMake(26.11, 11.78), CGPointMake(22.85, 13.38));
    bezier2Path.addLineToPoint(CGPointMake(21.02, 15.16));
    bezier2Path.addLineToPoint(CGPointMake(22.1, 16.38));
    bezier2Path.addLineToPoint(CGPointMake(23.19, 17.6));
    bezier2Path.addLineToPoint(CGPointMake(24.24, 16.69));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.84, 14.11), CGPointMake(26.41, 14.78), CGPointMake(28.4, 14.11));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(36.79, 14.95), CGPointMake(34.43, 14.11), CGPointMake(35.37, 14.29));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(42.56, 20.32), CGPointMake(39.22, 16.03), CGPointMake(41.47, 18.16));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(41.21, 23.35), CGPointMake(43.94, 23.14), CGPointMake(43.87, 23.35));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(38.96, 23.52), CGPointMake(39.97, 23.35), CGPointMake(38.96, 23.42));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(45.33, 30.84), CGPointMake(38.96, 23.87), CGPointMake(45.03, 30.84));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(51.7, 23.56), CGPointMake(45.67, 30.84), CGPointMake(51.7, 23.94));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(49.3, 23.35), CGPointMake(51.7, 23.45), CGPointMake(50.61, 23.35));
    bezier2Path.addLineToPoint(CGPointMake(46.9, 23.35));
    bezier2Path.addLineToPoint(CGPointMake(46.64, 21.96));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(38.03, 12.16), CGPointMake(45.93, 18.09), CGPointMake(42.41, 14.05));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(28.28, 11.26), CGPointMake(35.18, 10.91), CGPointMake(31.24, 10.56));
    bezier2Path.miterLimit = 4;
    bezier2Path.closePath();
    iconColor.setFill();
    bezier2Path.fill();
    var bezier3Path = UIBezierPath.bezierPath();
    bezier3Path.moveToPoint(CGPointMake(15.14, 20.91));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(12.06, 24.74), CGPointMake(13.52, 22.83), CGPointMake(12.14, 24.54));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(14.35, 25.09), CGPointMake(11.99, 24.95), CGPointMake(12.89, 25.09));
    bezier3Path.addLineToPoint(CGPointMake(16.75, 25.09));
    bezier3Path.addLineToPoint(CGPointMake(16.97, 27.08));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.35, 34.99), CGPointMake(17.27, 29.76), CGPointMake(19.03, 33));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(41.81, 35.41), CGPointMake(27.24, 40.11), CGPointMake(36.11, 40.29));
    bezier3Path.addLineToPoint(CGPointMake(43.46, 33.98));
    bezier3Path.addLineToPoint(CGPointMake(42.41, 32.83));
    bezier3Path.addLineToPoint(CGPointMake(41.36, 31.68));
    bezier3Path.addLineToPoint(CGPointMake(40.01, 32.86));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.84, 35.72), CGPointMake(37.58, 34.99), CGPointMake(35.48, 35.72));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(26.82, 34.89), CGPointMake(29.22, 35.72), CGPointMake(28.32, 35.58));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(20.31, 26.91), CGPointMake(23.34, 33.28), CGPointMake(21.02, 30.43));
    bezier3Path.addLineToPoint(CGPointMake(19.97, 25.09));
    bezier3Path.addLineToPoint(CGPointMake(22.37, 25.09));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(24.58, 24.57), CGPointMake(24.39, 25.09), CGPointMake(24.76, 24.99));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(18.36, 17.43), CGPointMake(24.28, 23.84), CGPointMake(18.69, 17.43));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(15.14, 20.91), CGPointMake(18.21, 17.43), CGPointMake(16.78, 18.99));
    bezier3Path.miterLimit = 4;
    bezier3Path.closePath();
    iconColor.setFill();
    bezier3Path.fill();
};
/**
 * Draws picture outline icon using UIBezierPath for taking picture button
 *
 * @param color Color of the picture outline
 */
var drawPicOutline = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(17.13, 0.63));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(6.13, 7.21), CGPointMake(12.82, 1.77), CGPointMake(9.31, 3.87));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0.91, 15.85), CGPointMake(3.7, 9.79), CGPointMake(2.11, 12.44));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0, 23.21), CGPointMake(0.1, 18.27), CGPointMake(0, 18.86));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0.91, 30.58), CGPointMake(0, 27.57), CGPointMake(0.1, 28.19));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(14.02, 44.75), CGPointMake(3.11, 36.93), CGPointMake(8.01, 42.2));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.73, 44.75), CGPointMake(19.37, 47.05), CGPointMake(26.38, 47.05));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(44.84, 30.58), CGPointMake(37.74, 42.2), CGPointMake(42.64, 36.93));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(45.75, 23.21), CGPointMake(45.65, 28.19), CGPointMake(45.75, 27.57));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(44.84, 15.85), CGPointMake(45.75, 18.86), CGPointMake(45.65, 18.24));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(28, 0.46), CGPointMake(42.15, 8.12), CGPointMake(35.82, 2.33));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.13, 0.63), CGPointMake(25.15, -0.22), CGPointMake(20.02, -0.13));
    bezierPath.closePath();
    bezierPath.moveToPoint(CGPointMake(27.39, 4.39));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(42.02, 23.21), CGPointMake(35.82, 6.42), CGPointMake(42.02, 14.38));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.77, 40.33), CGPointMake(42.02, 30.35), CGPointMake(38, 37.06));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(9.38, 36.8), CGPointMake(24.21, 44.26), CGPointMake(15.48, 42.92));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(5.87, 14.28), CGPointMake(3.37, 30.84), CGPointMake(2.01, 22.04));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(18.2, 4.42), CGPointMake(8.14, 9.76), CGPointMake(13.3, 5.6));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(27.39, 4.39), CGPointMake(20.73, 3.8), CGPointMake(24.82, 3.8));
    bezierPath.miterLimit = 4;
    bezierPath.closePath();
    iconColor.setFill();
    bezierPath.fill();
};
/**
 * Draws circle icon using UIBezierPath
 *
 * @param color color of the circle icon
 */
var drawCircle = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezier2Path = UIBezierPath.bezierPath();
    bezier2Path.moveToPoint(CGPointMake(17.88, 0.51));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0, 23.08), CGPointMake(7.47, 3.09), CGPointMake(0.04, 12.49));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.83, 45.25), CGPointMake(0, 33.39), CGPointMake(7.47, 42.66));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(40.08, 39.13), CGPointMake(25.81, 47.22), CGPointMake(34.2, 44.92));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(47, 22.84), CGPointMake(44.9, 34.41), CGPointMake(47, 29.4));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(31.6, 1.29), CGPointMake(47, 13.03), CGPointMake(41.08, 4.82));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.88, 0.51), CGPointMake(27.99, -0.07), CGPointMake(21.65, -0.4));
    bezier2Path.miterLimit = 4;
    bezier2Path.closePath();
    iconColor.setFill();
    bezier2Path.fill();
};
/**
 * Draws gallery icon using UIBezierPath
 *
 * @param color color of the gallery icon
 */
var drawGallery = function (color) {
    var iconColor = new color_1.Color(color || '#fff').ios;
    var bezierPath = UIBezierPath.bezierPath();
    bezierPath.moveToPoint(CGPointMake(1.42, 0.13));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0.11, 1.46), CGPointMake(0.9, 0.31), CGPointMake(0.25, 0.98));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(0, 17.28), CGPointMake(0.03, 1.72), CGPointMake(0, 6.61));
    bezierPath.addLineToPoint(CGPointMake(0, 32.73));
    bezierPath.addLineToPoint(CGPointMake(0.28, 33.24));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(1.04, 34.04), CGPointMake(0.48, 33.61), CGPointMake(0.68, 33.83));
    bezierPath.addLineToPoint(CGPointMake(1.52, 34.33));
    bezierPath.addLineToPoint(CGPointMake(3.84, 34.36));
    bezierPath.addLineToPoint(CGPointMake(6.15, 34.39));
    bezierPath.addLineToPoint(CGPointMake(6.15, 36.54));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(6.8, 39.66), CGPointMake(6.15, 38.93), CGPointMake(6.18, 39.09));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(28.05, 40.3), CGPointMake(7.53, 40.35), CGPointMake(5.98, 40.3));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(48.38, 40.19), CGPointMake(42.82, 40.3), CGPointMake(48.05, 40.27));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(49.89, 38.82), CGPointMake(48.98, 40.04), CGPointMake(49.74, 39.36));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(50, 23), CGPointMake(49.97, 38.55), CGPointMake(50, 33.88));
    bezierPath.addLineToPoint(CGPointMake(50, 7.54));
    bezierPath.addLineToPoint(CGPointMake(49.72, 7.04));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(48.96, 6.23), CGPointMake(49.52, 6.66), CGPointMake(49.32, 6.44));
    bezierPath.addLineToPoint(CGPointMake(48.48, 5.95));
    bezierPath.addLineToPoint(CGPointMake(46.17, 5.92));
    bezierPath.addLineToPoint(CGPointMake(43.86, 5.89));
    bezierPath.addLineToPoint(CGPointMake(43.83, 3.62));
    bezierPath.addLineToPoint(CGPointMake(43.8, 1.34));
    bezierPath.addLineToPoint(CGPointMake(43.53, 0.95));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(42.79, 0.29), CGPointMake(43.38, 0.74), CGPointMake(43.05, 0.43));
    bezierPath.addLineToPoint(CGPointMake(42.31, 0.02));
    bezierPath.addLineToPoint(CGPointMake(22.07, 0));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(1.42, 0.13), CGPointMake(4.39, -0.01), CGPointMake(1.79, 0));
    bezierPath.closePath();
    bezierPath.moveToPoint(CGPointMake(39.78, 4.9));
    bezierPath.addLineToPoint(CGPointMake(39.78, 5.9));
    bezierPath.addLineToPoint(CGPointMake(23.83, 5.9));
    bezierPath.addLineToPoint(CGPointMake(7.88, 5.9));
    bezierPath.addLineToPoint(CGPointMake(7.33, 6.16));
    bezierPath.addCurveToPointControlPoint1ControlPoint2(CGPointMake(6.5, 6.84), CGPointMake(6.98, 6.34), CGPointMake(6.7, 6.57));
    bezierPath.addLineToPoint(CGPointMake(6.2, 7.26));
    bezierPath.addLineToPoint(CGPointMake(6.17, 18.86));
    bezierPath.addLineToPoint(CGPointMake(6.15, 30.46));
    bezierPath.addLineToPoint(CGPointMake(5.11, 30.46));
    bezierPath.addLineToPoint(CGPointMake(4.07, 30.46));
    bezierPath.addLineToPoint(CGPointMake(4.07, 17.18));
    bezierPath.addLineToPoint(CGPointMake(4.07, 3.89));
    bezierPath.addLineToPoint(CGPointMake(21.92, 3.89));
    bezierPath.addLineToPoint(CGPointMake(39.78, 3.89));
    bezierPath.addLineToPoint(CGPointMake(39.78, 4.9));
    bezierPath.closePath();
    bezierPath.moveToPoint(CGPointMake(45.93, 23.1));
    bezierPath.addLineToPoint(CGPointMake(45.93, 36.38));
    bezierPath.addLineToPoint(CGPointMake(28.08, 36.38));
    bezierPath.addLineToPoint(CGPointMake(10.22, 36.38));
    bezierPath.addLineToPoint(CGPointMake(10.22, 23.1));
    bezierPath.addLineToPoint(CGPointMake(10.22, 9.82));
    bezierPath.addLineToPoint(CGPointMake(28.08, 9.82));
    bezierPath.addLineToPoint(CGPointMake(45.93, 9.82));
    bezierPath.addLineToPoint(CGPointMake(45.93, 23.1));
    bezierPath.miterLimit = 4;
    bezierPath.closePath();
    iconColor.setFill();
    bezierPath.fill();
    var bezier2Path = UIBezierPath.bezierPath();
    bezier2Path.moveToPoint(CGPointMake(17.8, 12.38));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(15.42, 15.92), CGPointMake(16.27, 12.89), CGPointMake(15.26, 14.38));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.54, 18.78), CGPointMake(15.54, 17.16), CGPointMake(16.34, 18.25));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(18.95, 19.04), CGPointMake(18.02, 18.99), CGPointMake(18.24, 19.04));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(20.36, 18.78), CGPointMake(19.65, 19.04), CGPointMake(19.88, 18.99));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(20.99, 12.83), CGPointMake(22.9, 17.64), CGPointMake(23.25, 14.33));
    bezier2Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(17.8, 12.38), CGPointMake(20.05, 12.21), CGPointMake(18.84, 12.03));
    bezier2Path.miterLimit = 4;
    bezier2Path.closePath();
    iconColor.setFill();
    bezier2Path.fill();
    var bezier3Path = UIBezierPath.bezierPath();
    bezier3Path.moveToPoint(CGPointMake(33.75, 17.49));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(29.87, 22.24), CGPointMake(33.63, 17.56), CGPointMake(31.88, 19.7));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(25.94, 27.01), CGPointMake(27.58, 25.15), CGPointMake(26.12, 26.92));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(23.35, 24.83), CGPointMake(25.36, 27.29), CGPointMake(25.19, 27.13));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(21.52, 22.61), CGPointMake(22.42, 23.66), CGPointMake(21.6, 22.66));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(20.42, 22.78), CGPointMake(21.22, 22.43), CGPointMake(20.68, 22.52));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(12.62, 33.54), CGPointMake(20.22, 22.99), CGPointMake(15.01, 30.17));
    bezier3Path.addLineToPoint(CGPointMake(12.29, 33.99));
    bezier3Path.addLineToPoint(CGPointMake(28.08, 33.99));
    bezier3Path.addLineToPoint(CGPointMake(43.85, 33.99));
    bezier3Path.addLineToPoint(CGPointMake(43.85, 31.58));
    bezier3Path.addLineToPoint(CGPointMake(43.84, 29.17));
    bezier3Path.addLineToPoint(CGPointMake(39.42, 23.53));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(34.71, 17.62), CGPointMake(37, 20.42), CGPointMake(34.88, 17.78));
    bezier3Path.addCurveToPointControlPoint1ControlPoint2(CGPointMake(33.75, 17.49), CGPointMake(34.39, 17.35), CGPointMake(34.11, 17.3));
    bezier3Path.miterLimit = 4;
    bezier3Path.closePath();
    iconColor.setFill();
    bezier3Path.fill();
};
/**
 * Creates image button with help of UIButton widget
 * and sets it's attributes like color, state, size and action event.
 *
 * @returns Returns button object
 */
var createImageButton = function (target, frame, label, eventName, align, img, imgSelected) {
    var btn;
    if (frame) {
        btn = UIButton.alloc().initWithFrame(frame);
    }
    else {
        btn = UIButton.alloc().init();
    }
    if (label) {
        btn.setTitleForState(label, 0);
        btn.setTitleColorForState(new color_1.Color('#fff').ios, 0);
        btn.titleLabel.font = UIFont.systemFontOfSize(19);
    }
    else if (img) {
        btn.setImageForState(img, 0);
        if (imgSelected) {
            btn.setImageForState(img, 1);
            btn.setImageForState(img, 4);
        }
    }
    if (align) {
        btn.contentHorizontalAlignment =
            align == 'right' ? 2 : 1;
    }
    if (eventName) {
        btn.addTargetActionForControlEvents(target, eventName, 64);
    }
    return btn;
};
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FwdHVyZS5jb21wb25lbnQuaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTRFO0FBQzVFLDBDQUF5QztBQUV6QyxrRUFBMkY7QUFFM0YsOERBQXNFO0FBQ3RFLDREQUEwRTtBQUUxRSxpRkFBeUU7QUFDekUsK0RBQTJEO0FBQzNELG9GQUE0RTtBQUU1RSxxREFBOEM7QUFDOUMsdURBQXNEO0FBRXRELGdEQUErQztBQUsvQywwQ0FBNEM7QUFDNUMsaURBQW1EO0FBR25ELDBEQUE0RDtBQUM1RCw4REFBOEQ7QUFFOUQ7O0dBRUc7QUFRSCxJQUFhLGdCQUFnQjtJQTRDekI7Ozs7Ozs7O09BUUc7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUN0QyxpREFBaUQ7UUFDekMsTUFBb0I7UUFOcEIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFFOUIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQTdDaEMsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFjMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO1FBVXBELHdDQUF3QztRQUNoQyxpQkFBWSxHQUFZLEtBQUssQ0FBQztRQW9CbEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLFdBQUMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFHRDs7O09BR0c7SUFDSCxtQ0FBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8s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QUFHLENBQUM7SUFDL0MsSUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDaEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDaEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQztBQUNGOzs7O0dBSUc7QUFDSCxJQUFJLFlBQVksR0FBRyxVQUFVLEtBQVU7SUFDbkMsSUFBSSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUMvQyxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDM0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEksVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0gsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDNUgsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNsSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLElBQUksV0FBVyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM1QyxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuSSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwSSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwSSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwSSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsSSxXQUFXLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMzQixXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDeEIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN2QixDQUFDLENBQUM7QUFDRjs7OztHQUlHO0FBQ0gsSUFBSSxVQUFVLEdBQUcsVUFBVSxLQUFVO0lBQ2pDLElBQUksU0FBUyxHQUFHLElBQUksYUFBSyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDL0MsSUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzlILFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9ILFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hJLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNqSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMvSCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoSSxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNuRCxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMxQixVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDNUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDM0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzVDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN4QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUNGOzs7O0dBSUc7QUFDSCxJQUFJLGNBQWMsR0FBRyxVQUFVLEtBQVU7SUFDckMsSUFBSSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUMvQyxJQUFJLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDM0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUgsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDL0gsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwSSxVQUFVLENBQUMseUNBQXlD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U0FBUyxHQUFHLElBQUksYUFBSyxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFDL0MsSUFBSSxVQUFVLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9ILFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNILFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdILFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUgsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2xELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlILFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNwRCxVQUFVLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMxQixVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsQixJQUFJLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDNUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDM0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbkIsSUFBSSxXQUFXLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzVDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN4QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsSUFBSSxpQkFBaUIsR0FBRyxVQUFVLE1BQVcsRUFBRSxLQUFVLEVBQUUsS0FBVSxFQUFFLFNBQWMsRUFBRSxLQUFVLEVBQUUsR0FBUSxFQUFFLFdBQWdCO0lBRXpILElBQUksR0FBRyxDQUFDO0lBQ1IsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFDRCxJQUFJLENBQUMsQ0FBQztRQUNGLEdBQUcsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbEMsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDUixHQUFHLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLGFBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEQsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNYLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0IsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNkLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQyxDQUFDO0lBQ0wsQ0FBQztJQUNELEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDUixHQUFHLENBQUMsMEJBQTBCO1lBQzFCLEtBQUssSUFBSSxPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNaLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFDRCxNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBOZ1pvbmUsIE9uSW5pdCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tICdAbnN0dWRpby9uYXRpdmVzY3JpcHQtY2FtZXJhLXBsdXMnO1xuaW1wb3J0IHsgTW9kYWxEaWFsb2dPcHRpb25zLCBNb2RhbERpYWxvZ1NlcnZpY2UgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9tb2RhbC1kaWFsb2cnO1xuaW1wb3J0IHsgSW1hZ2VBc3NldCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2UtYXNzZXQnO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UsIGZyb21GaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuaW1wb3J0IHsgRm9sZGVyLCBwYXRoLCBrbm93bkZvbGRlcnMgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbVwiO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgQ29sb3IgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2NvbG9yJztcbi8vIGltcG9ydCB7IE9wZW5DdkNhbWVyYVByZXZpZXcgfSBmcm9tICduYXRpdmVzY3JpcHQtb3BlbmN2Jztcbi8vIGltcG9ydCAqIGFzIGN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YnO1xuXG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuLy8gaW1wb3J0ICogYXMgYnV0dG9uTW9kdWxlIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2J1dHRvblwiO1xuXG4vKipcbiAqIENhcHR1cmUgY29tcG9uZW50IGNsYXNzLCB3aGljaCBpcyBiZWluZyB1c2VkIHRvIGNhcHR1cmUgaW1hZ2UgZnJvbSBjYW1lcmEuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtY2FwdHVyZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9jYXB0dXJlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2FwdHVyZS5jb21wb25lbnQuaHRtbCcsXG59KVxuXG5leHBvcnQgY2xhc3MgQ2FwdHVyZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIENhbWVyYSBpbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwcml2YXRlIGNhbTogQ2FtZXJhUGx1cztcbiAgICAvKiogR2FsbGVyeSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBnYWxsZXJ5QnRuOiBhbnk7XG4gICAgLyoqIFRha2UgcGljdHVyZSBidXR0b24uICovXG4gICAgcHJpdmF0ZSB0YWtlUGljQnRuOiBhbnk7XG4gICAgLyoqIEF1dG8gZm9jdXMgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgYXV0b2ZvY3VzQnRuOiBhbnk7XG4gICAgLyoqIFBhcmFtYXRlcnMgdXNlZCB0byBkaXNwbGF5IEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeVBhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY1BhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBhdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c1BhcmFtczogYW55O1xuICAgIC8qKiBFbXB0eSBzdHJpbmcgdmFyaWFibGUgKi9cbiAgICBwcml2YXRlIGVtcHR5OiBhbnkgPSBudWxsO1xuICAgIC8qKiBMb2NhbGl6YXRpb24gKi9cbiAgICBwcml2YXRlIGxvY2FsZTogYW55O1xuICAgIC8qKiBMYWJsZSBmb3Igc2F2ZSBidXR0b24gKi9cbiAgICBwcml2YXRlIHNhdmVCdG5MYWJsZTogYW55O1xuICAgIC8qKiBMYWJsZSBmb3IgbWFudWFsIGJ1dHRvbiAqL1xuICAgIHByaXZhdGUgbWFudWFsQnRuTGFibGU6IGFueTtcbiAgICAvKiogTGFibGUgZm9yIHBlcmZvcm0gYnV0dG9uICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtQnRuTGFibGU6IGFueTtcbiAgICAvKiogTGFibGUgZm9yIHJldGFrZSBidXR0b24gKi9cbiAgICBwcml2YXRlIHJldGFrZUJ0bkxhYmxlOiBhbnk7XG5cbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBjaGVjayB0aGUgY2FtZXJhIGlzIHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0NhbWVyYVZpc2libGU6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIFVSSSAqL1xuICAgIHB1YmxpYyBpbWdVUkk6IGFueTtcbiAgICAvKiogT3BlbkNWIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHB1YmxpYyBvcGVuY3ZJbnN0YW5jZTogYW55O1xuXG4gICAgLyoqIEZsYXNoIGJ1dHRvbiB2YXJpYWJsZSAqL1xuICAgIHByaXZhdGUgZmxhc2hCdG46IGFueTtcbiAgICAvKiogSW5kaWNhdGVzIHdoZXRoZXIgZmxhc2ggaXMgb24vb2ZmICovXG4gICAgcHJpdmF0ZSBmbGFzaEVuYWJsZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBDYXB0dXJlQ29tcG9uZW50LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB6b25lIEFuZ3VsYXIgem9uZSB0byBydW4gYSB0YXNrIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBtb2RhbFNlcnZpY2UgU2VydmljZSBtb2RhbFxuICAgICAqIEBwYXJhbSB2aWV3Q29udGFpbmVyUmVmIFZpZXcgY29udGFpbmVyIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlclxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5kaWNhdGlvblxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgLy8gcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0aW9uUmVmOiBDaGFuZ2VEZXRlY3RvclJlZlxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyLFxuICAgICkge1xuICAgICAgICB0aGlzLmxvY2FsZSA9IG5ldyBMKCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXphdGlvbiBtZXRob2QgaW5pdGlhbGl6ZXMgT3BlbkNWIG1vZHVsZSBhbmQgYnV0dG9ucyBsaWtlXG4gICAgICogdGFrZVBpY3R1cmUsIGdhbGxlcnkgYW5kIGF1dG9Gb2N1cyBidXR0b25zIGluIGNhbWVyYSB2aWV3LlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIE9wZW5DVi4uLicpO1xuICAgICAgICBjb25zb2xlLmxvZyhPcGVuQ1ZXcmFwcGVyLm9wZW5DVlZlcnNpb25TdHJpbmcoKSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdPcGVuQ1ZXcmFwcGVyLmdldE9wZW5DVk1hdCcgKyBPcGVuQ1ZXcmFwcGVyLmdldE9wZW5DVk1hdCgpKTtcbiAgICAgICAgLy8gICAgICAgICBsZXQgYWxlcnQgPSBVSUFsZXJ0Q29udHJvbGxlcih0aXRsZTogXCJNeSBBbGVydFwiLCBtZXNzYWdlOiBcIlRoaXMgaXMgYW4gYWxlcnQuXCIsIHByZWZlcnJlZFN0eWxlOiAuYWxlcnQpIFxuICAgICAgICAvLyBhbGVydC5hZGRBY3Rpb24oVUlBbGVydEFjdGlvbih0aXRsZTogTlNMb2NhbGl6ZWRTdHJpbmcoXCJPS1wiLCBjb21tZW50OiBcIkRlZmF1bHQgYWN0aW9uXCIpLCBzdHlsZTogLmRlZmF1bHQsIGhhbmRsZXI6IHsgXyBpbiBcbiAgICAgICAgLy8gTlNMb2coXCJUaGUgXFxcIk9LXFxcIiBhbGVydCBvY2N1cmVkLlwiKVxuICAgICAgICAvLyB9KSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKE9wZW5DVldyYXBwZXIuZ2V0T3BlbkNWTWF0KCkpO1xuICAgICAgICAvLyAgdGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG4gICAgICAgIHRoaXMuaXNDYW1lcmFWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5jcmVhdGVCdXR0b25zKCk7XG4gICAgICAgIC8vIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgLy8gdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgLy8gdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgIH1cbiAgICBjcmVhdGVCdXR0b25zKCkge1xuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMuY2FtLndpZHRoO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbS5oZWlnaHQ7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24od2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKGhlaWdodCk7XG4gICAgICAgIHRoaXMuY3JlYXRlRmxhc2hCdXR0b24od2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHRoaXMuY3JlYXRlU3dpdGNoQ2FtZXJhQnV0dG9uKHdpZHRoLCBoZWlnaHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiBjYW1lcmEgaXMgbG9hZGVkLCB3aGVyZSBhbGwgdGhlIG5lY2Nlc3NhcnkgdGhpbmdzIGxpa2VcbiAgICAgKiBkaXNwbGF5aW5nIGJ1dHRvbnModGFrZVBpY3R1cmUsIGdhbGxlcnksIGZsYXNoLCBjYW1lcmEgJiBhdXRvRm9jdXMpIG9uIGNhbWVyYSB2aWV3XG4gICAgICogYXJlIHRha2VuIGNhcmUgYW5kIGFsc28gaW5pdGlhbGl6ZXMgY2FtZXJhIGluc3RhbmNlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIENhbWVyYVBsdXMgaW5zdGFuY2UgcmVmZXJyZW5jZS5cbiAgICAgKi9cbiAgICBjYW1Mb2FkZWQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1Mb2FkZWQuLicpO1xuXG4gICAgICAgIHRoaXMuc2F2ZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzYXZlJyk7XG4gICAgICAgIHRoaXMubWFudWFsQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICB0aGlzLnJldGFrZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZXRha2UnKTtcbiAgICAgICAgdGhpcy5wZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcblxuICAgICAgICB0aGlzLmNhbSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuY2FtLmdldEZsYXNoTW9kZSgpO1xuXG4gICAgICAgIC8vIFRvIHJlZnJlc2ggY2FtZXJhIHZpZXcgYWZ0ZXIgbmF2aWdhdGVkIGZyb20gaW1hZ2UgZ2FsbGVyeS5cbiAgICAgICAgdGhpcy5jYW0uX3N3aWZ0eS52aWV3RGlkQXBwZWFyKHRydWUpO1xuXG4gICAgICAgIC8vIFR1cm4gZmxhc2ggb24gYXQgc3RhcnR1cFxuICAgICAgICBpZiAoZmxhc2hNb2RlID09PSAnb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGxldCB0ZXN0U3RyID0gT3BlbkNWV3JhcHBlci5wZXJmb3JtUGVyc3BlY3RpdmVDb3JyZWN0aW9uTWFudWFsKCcvdmFyL21vYmlsZS9Db250YWluZXJzL0RhdGEvQXBwbGljYXRpb24vQjJBNjFDNkItRUU3RS00RUU4LTg3MzUtRTUxMDc4MTM0MEUyL0xpYnJhcnkvQXBwbGljYXRpb24gU3VwcG9ydC9MaXZlU3luYy9hcHAvY2FwdHVyZWRpbWFnZXMvSU1HXzE1NTk4OTIzMzIwMTcuanBnJywgJ1N0cmluZ1BvaW50cycsICdTaXplJyk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdNZXRob2QgdGVzdGluZyAuLi4uJywgdGVzdFN0cik7XG4gICAgICAgIC8vIFRvZG86IGNvbnN0IGNiID0gbmV3IGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLkF1dG9Gb2N1c01vdmVDYWxsYmFjayhcblxuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICAgIF90aGlzOiB0aGlzLFxuICAgICAgICAvLyAgICAgICAgIG9uQXV0b0ZvY3VzTW92aW5nKHN0YXJ0OiBhbnksIGNhbWVyYTogYW55KSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGUgPSB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5hbmltYXRlKCk7XG4gICAgICAgIC8vICAgICAgICAgICAgIGlmICghc3RhcnQpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDEpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAvLyBHcmVlbiBjb2xvclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyMwMDgwMDAnKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDAuNTApO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMC41MCk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBhbmltYXRlLnNldER1cmF0aW9uKDEwMCk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAvLyBSZWQgY29sb3JcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmYwMDAwJyk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGFuaW1hdGUuc3RhcnQoKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgIH0sXG4gICAgICAgIC8vICAgICB9KTtcbiAgICAgICAgLy8gaWYgKHRoaXMuY2FtLmNhbWVyYSkge1xuICAgICAgICAvLyAgICAgdGhpcy5jYW0uY2FtZXJhLnNldEF1dG9Gb2N1c01vdmVDYWxsYmFjayhjYik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gaWYgKGFyZ3MuZGF0YSkge1xuICAgICAgICAvLyAgICAgdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG4gICAgICAgIC8vICAgICB0aGlzLmNhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG4gICAgICAgIC8vICAgICB0cnkge1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgIC8vICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vICAgICAgICAgdGhpcy50YWtlUGljQnRuID0gbnVsbDtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSBudWxsO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gbnVsbDtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBudWxsO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG51bGw7XG4gICAgICAgIC8vICAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcblxuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmluaXRDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMuY2FtLl9pbml0Rmxhc2hCdXR0b24oKTtcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmNhbS5faW5pdFRvZ2dsZUNhbWVyYUJ1dHRvbigpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gVEVTVCBUSEUgSUNPTlMgU0hPV0lORy9ISURJTkdcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0NhcHR1cmVJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93R2FsbGVyeUljb24gPSBmYWxzZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dUb2dnbGVJY29uID0gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGNhbWVyYSBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgICogaXQgcmVtb3ZlcyBhbiBleGlzdGluZyBvbmUgaWYgZXhpc3RzIGFuZCBhZGRzIGl0LlxuICAgICAqL1xuICAgIGluaXRDYW1lcmFCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLnRha2VQaWNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy50YWtlUGljQnRuLCB0aGlzLnRha2VQaWNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpbml0aWFsaXplcyBnYWxsZXJ5IGJ1dHRvbiBpbiBjYW1lcmEgdmlldywgYWN0dWFsbHlcbiAgICAgKiBpdCByZW1vdmVzIGFuIGV4aXN0aW5nIG9uZSBpZiBleGlzdHMgYW5kIGFkZHMgaXQuIEFuZCBhbHNvIHNldHNcbiAgICAgKiB0aGUgaW1hZ2UgaWNvbiBmb3IgaXQuXG4gICAgICovXG4gICAgaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuZ2FsbGVyeUJ0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmdhbGxlcnlCdG4sIHRoaXMuZ2FsbGVyeVBhcmFtcyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGluaXRpYWxpemVzIGF1dG9Gb2N1cyBidXR0b24gaW4gY2FtZXJhIHZpZXcsIGFjdHVhbGx5XG4gICAgICogaXQgcmVtb3ZlcyBhbiBleGlzdGluZyBvbmUgaWYgZXhpc3RzIGFuZCBhZGRzIGl0LlxuICAgICAqL1xuICAgIGluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuKTtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuYXV0b2ZvY3VzQnRuLCB0aGlzLmF1dG9mb2N1c1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGFrZSBwaWN0dXJlIGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVUYWtlUGljdHVyZUJ1dHRvbih3aWR0aDogYW55LCBoZWlnaHQ6IGFueSkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGxldCBwaWNPdXRsaW5lID0gY3JlYXRlSW1hZ2VCdXR0b24oX3RoaXMsIENHUmVjdE1ha2Uod2lkdGggLSA2OSwgaGVpZ2h0IC0gODAsIDUwLCA1MCksIG51bGxcbiAgICAgICAgICAgICwgbnVsbCwgbnVsbCwgY3JlYXRlSWNvbigncGljT3V0bGluZScsIG51bGwsIG51bGwpLCBudWxsXG4gICAgICAgICk7XG4gICAgICAgIHBpY091dGxpbmUudHJhbnNmb3JtID0gQ0dBZmZpbmVUcmFuc2Zvcm1NYWtlU2NhbGUoMS41LCAxLjUpO1xuICAgICAgICB0aGlzLmNhbS5pb3MuYWRkU3VidmlldyhwaWNPdXRsaW5lKTsgLy9zbmFwUGljdHVyZVxuICAgICAgICB2YXIgdGFrZVBpY0J0biA9IGNyZWF0ZUltYWdlQnV0dG9uKF90aGlzLCBDR1JlY3RNYWtlKHdpZHRoIC0gNzAsIGhlaWdodCAtIDgwLjcsIDUwLCA1MCksIG51bGwsICdzbmFwUGljdHVyZScsIG51bGwsIGNyZWF0ZUljb24oJ3Rha2VQaWMnLCBudWxsLCBudWxsKSwgbnVsbCk7XG4gICAgICAgIHRoaXMuY2FtLmlvcy5hZGRTdWJ2aWV3KHRha2VQaWNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5fc3dpZnR5Ll9vd25lci5nZXQoKS5jb25maXJtUGhvdG9zID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMuY2FtLl9zd2lmdHkuc25hcFBpY3R1cmUgPSAgZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICAgICAgLy8gICAgIGFsZXJ0KCdzbmFwUGljdHVyZS4uLi4nKTtcbiAgICAgICAgLy8gfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGZsYXNoIGJ1dHRvbiBpbiB0aGUgY2FtZXJhIHZpZXdcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gd2lkdGggd2lkdGggb2YgdGhlIGNhbWVyYSB2aWV3XG4gICAgICovXG4gICAgY3JlYXRlRmxhc2hCdXR0b24od2lkdGg6IGFueSwgaGVpZ2h0OiBhbnkpIHtcbiAgICAgICAgdGhpcy5jYW0uX3N3aWZ0eS5fZmxhc2hCdG5IYW5kbGVyID0gZmxhc2hCdG5IYW5kbGVyO1xuICAgICAgICB0aGlzLmNhbS5fc3dpZnR5Ll9mbGFzaEJ0bkhhbmRsZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHN3aXRjaCBjYW1lcmEgYnV0dG9uIGluIHRoZSBjYW1lcmEgdmlld1xuICAgICAqIFxuICAgICAqIEBwYXJhbSB3aWR0aCB3aWR0aCBvZiB0aGUgY2FtZXJhIHZpZXdcbiAgICAgKi9cbiAgICBjcmVhdGVTd2l0Y2hDYW1lcmFCdXR0b24od2lkdGg6IGFueSwgaGVpZ2h0OiBhbnkpIHtcbiAgICAgICAgdmFyIHN3aXRjaENhbWVyYUJ0biA9IGNyZWF0ZUltYWdlQnV0dG9uKHRoaXMsIENHUmVjdE1ha2Uod2lkdGggLSA4NSwgODAsIDEwMCwgNTApLCBudWxsLCAnc3dpdGNoQ2FtJywgbnVsbCwgY3JlYXRlSWNvbigndG9nZ2xlJywgQ0dTaXplTWFrZSg2NSwgNTApLCBudWxsKSwgbnVsbCk7XG4gICAgICAgIHN3aXRjaENhbWVyYUJ0bi50cmFuc2Zvcm0gPSBDR0FmZmluZVRyYW5zZm9ybU1ha2VTY2FsZSgwLjc1LCAwLjc1KTtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5hZGRTdWJ2aWV3KHN3aXRjaENhbWVyYUJ0bik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBpbWFnZSBnYWxsZXJ5IGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oaGVpZ2h0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICAvLyB0aGlzLmNhbS5fc3dpZnR5Lm9wZW5HYWxsZXJ5ID0gb3BlbkdhbGxlcnk7XG4gICAgICAgIHRoaXMuY2FtLl9zd2lmdHkuY2hvb3NlRnJvbUxpYnJhcnkgPSBnb0ltYWdlR2FsbGVyeTtcbiAgICAgICAgLy8gdGhpcy5jYW0uX3N3aWZ0eS5vcGVuR2FsbGVyeSgpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4gPSBjcmVhdGVJbWFnZUJ1dHRvbihfdGhpcywgQ0dSZWN0TWFrZSgyMCwgaGVpZ2h0IC0gODAsIDUwLCA1MCksIG51bGwsICdvcGVuR2FsbGVyeScsIG51bGwsIGNyZWF0ZUljb24oJ2dhbGxlcnknLCBudWxsLCBudWxsKSwgbnVsbCk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi50cmFuc2Zvcm0gPSBDR0FmZmluZVRyYW5zZm9ybU1ha2VTY2FsZSgwLjc1LCAwLjc1KTtcblxuICAgICAgICB0aGlzLmNhbS5pb3MuYWRkU3VidmlldyhfdGhpcy5nYWxsZXJ5QnRuKTtcbiAgICAgICAgLy8gbGV0IHggPSAgdGhpcy5jYW0uX3N3aWZ0eTtcbiAgICAgICAgLy8gdmFyIHogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoeCk7XG4gICAgICAgIC8vIHoucHJvdG90eXBlLm9wZW5HYWxsZXJ5MSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdHYWxsZXJ5IHRlc3RpbmcuLi4nKTtcbiAgICAgICAgLy8gfVxuXG4gICAgfVxuICAgIGNob29zZUZyb21MaWJyYXJ5KCkge1xuICAgICAgICBhbGVydCgnY2hvb3NlRnJvbUxpYnJhcnknKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbi4gQWN0dWFsbHkgaXQgY3JlYXRlcyBpbWFnZSBidXR0b24gYW5kIHNldHRpbmdcbiAgICAgKiBpdCdzIHByb3BlcnRpZXMgbGlrZSBpbWFnZSBpY29uLCBzaGFwZSBhbmQgY29sb3IgYWxvbmcgd2l0aCBjbGljayBldmVudCBsaXN0ZW5lciBpbiBpdC5cbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvRm9jdXNJbWFnZSgpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c0J0biA9IHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuYXV0b2ZvY3VzQnRuLCAnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuXG4gICAgICAgIC8vIGxldCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKCdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG4gICAgICAgIC8vIHRoaXMuYXV0b2ZvY3VzQnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVBdXRvZm9jdXNTaGFwZSgpO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYXV0byBmb2N1cyBpbWFnZSBidXR0b24gd2l0aCBoZWxwIEltYWdlVmlldyB3aWRnZXQgYW5kIHNldHRpbmdzXG4gICAgICogaXQncyBhdHRyaWJ1dGVzIGxpa2UgcGFkZGluZywgaGVpZ2h0LCB3aWR0aCwgY29sb3IgJiBzY2FsZVR5cGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgUmV0dXJucyBidXR0b24gb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTogYW55IHtcbiAgICAgICAgY29uc3QgYnRuID0gbmV3IGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldyhhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoMTU4KTtcbiAgICAgICAgYnRuLnNldE1heFdpZHRoKDE1OCk7XG4gICAgICAgIGJ0bi5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVJfQ1JPUCk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjMDA4MDAwJyk7IC8vIEdyZWVuIGNvbG9yXG4gICAgICAgIGJ0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgIHJldHVybiBidG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgYWN0dWFsIGljb24gaW1hZ2UgdXNpbmcgaWNvbiBuYW1lIGZyb20gY29udGV4dC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgSWNvbiBOYW1lXG4gICAgICovXG4gICAgZ2V0SW1hZ2VEcmF3YWJsZShpY29uTmFtZTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgZHJhd2FibGVJZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dFxuICAgICAgICAgICAgLmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcihpY29uTmFtZSwgJ2RyYXdhYmxlJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuICAgICAgICByZXR1cm4gZHJhd2FibGVJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0cmFuc3BhcmVudCBjaXJjbGUgc2hhcGUgd2l0aCBoZWxwIG9mIEdyYWRpZW50RHJhd2FibGUgb2JqZWN0XG4gICAgICogYW5kIHNldHMgaXQncyBhdHRyaWJ1dGVzIGxpa2UgY29sb3IsIHJhZGl1cyBhbmQgYWxwaGEuXG4gICAgICogXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDk2KTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMTUwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGF1dG8gZm9jdXMgc2hhcGUgdXNpbmcgU2hhcGVEcmF3YWJsZSBvYmplY3QgYW5kXG4gICAgICogc2V0cyBhbHBoYS5cbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIHNoYXBlIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk6IGFueSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5TaGFwZURyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlSW1hZ2VCdXR0b24oKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgYnRuID0gbmV3IGFuZHJvaWQud2lkZ2V0LkltYWdlQnV0dG9uKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCk7XG4gICAgLy8gICAgIGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcbiAgICAvLyAgICAgYnRuLnNldE1heEhlaWdodCg1OCk7XG4gICAgLy8gICAgIGJ0bi5zZXRNYXhXaWR0aCg1OCk7XG4gICAgLy8gICAgIHJldHVybiBidG47XG4gICAgLy8gfVxuXG5cbiAgICAvKipcbiAgICAgKiBQaG90byBjYXB0dXJlZCBldmVudCBmaXJlcyB3aGVuIGEgcGljdHVyZSBpcyB0YWtlbiBmcm9tIGNhbWVyYSwgd2hpY2ggYWN0dWFsbHlcbiAgICAgKiBsb2FkcyB0aGUgY2FwdHVyZWQgaW1hZ2UgZnJvbSBJbWFnZUFzc2V0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBjYXB0dXJlZERhdGEgSW1hZ2UgY2FwdHVyZWQgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIHBob3RvQ2FwdHVyZWRFdmVudChjYXB0dXJlZERhdGE6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnUEhPVE8gQ0FQVFVSRUQgRVZFTlQhISEnKTtcbiAgICAgICAgLy8gdGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKE9wZW5DVldyYXBwZXIub3BlbkNWVmVyc2lvblN0cmluZygpKTtcbiAgICAgICAgLy8gT3BlbkNWV3JhcHBlci5wZXJmb3JtVHJhbnNmb3JtYXRpb24oKTtcbiAgICAgICAgLy8gbGV0IGxjdiA9ICBjdjtcbiAgICAgICAgLy8gbGV0IG9wZW5jdjEgPSBuZXcgT3BlbkN2Q2FtZXJhUHJldmlldygpO1xuICAgICAgICAvLyBvcGVuY3YxLmluaXROYXRpdmVWaWV3KCk7XG4gICAgICAgIC8vIG9wZW5jdjEub25Mb2FkZWQoKTtcbiAgICAgICAgLy8gb3BlbmN2MS5zdGFydENhbWVyYSgpO1xuICAgICAgICAvLyBvcGVuY3YxLmluaXROYXRpdmVWaWV3KCk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKGNhcHR1cmVkRGF0YSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgYmVlbiBjYWxsZWQgd2hlbiB0b2dnbGUgdGhlIGNhbWVyYSBidXR0b24uXG4gICAgICogQHBhcmFtIGFyZ3MgQ2FtZXJhIHRvZ2dsZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgdG9nZ2xlQ2FtZXJhRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmEgdG9nZ2xlZCcpO1xuICAgICAgICAvLyBjb25zdCB3aWR0aCA9IHRoaXMuY2FtLndpZHRoO1xuICAgICAgICAvLyBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbS5oZWlnaHQ7XG4gICAgICAgIC8vIHRoaXMuY3JlYXRlRmxhc2hCdXR0b24od2lkdGgsIGhlaWdodCk7XG4gICAgICAgIC8vIHRoaXMuY2FtLl9zd2lmdHkuX293bmVyLmdldCgpLnNob3dGbGFzaEljb24gPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCB3aGVuIHRvZ2dsZSB0aGUgZmxhc2ggaWNvbiBvbiBjYW1lcmEuIFRoaXMgYWN0dWFsbHlcbiAgICAgKiBmbGFzaCBvZmYgd2hlbiBpdCBhbHJlYWR5IGlzIG9uIG9yIHZpY2UtdmVyc2EuXG4gICAgICovXG4gICAgdG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcbiAgICAgICAgYWxlcnQoXCJDbGlja2VkIEZsYXNoXCIpO1xuICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBkaXNwbGF5IGZsYXNoIGljb24gYmFzZWQgb24gaXQncyBwcm9wZXJ0eSB2YWx1ZSB0cnVlL2ZhbHNlLlxuICAgICAqL1xuICAgIHRvZ2dsZVNob3dpbmdGbGFzaEljb24oKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzaG93Rmxhc2hJY29uID0gJHt0aGlzLmNhbS5zaG93Rmxhc2hJY29ufWApO1xuICAgICAgICB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gIXRoaXMuY2FtLnNob3dGbGFzaEljb247XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzd2l0Y2ggZnJvbnQvYmFjayBjYW1lcmEuXG4gICAgICovXG4gICAgdG9nZ2xlVGhlQ2FtZXJhKCk6IHZvaWQge1xuICAgICAgICB0aGlzLmNhbS50b2dnbGVDYW1lcmEoKTtcbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogT3BlbiBjYW1lcmEgbGlicmFyeS5cbiAgICAvLyAgKi9cbiAgICAvLyBvcGVuQ2FtUGx1c0xpYnJhcnkoKTogdm9pZCB7XG4gICAgLy8gICAgIHRoaXMuY2FtLmNob29zZUZyb21MaWJyYXJ5KCk7XG4gICAgLy8gfVxuICAgIC8qKlxuICAgICAqIFRha2VzIHBpY3R1cmUgZnJvbSBjYW1lcmEgd2hlbiB1c2VyIHByZXNzIHRoZSB0YWtlUGljdHVyZSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICogVGhlbiBpdCBzZXRzIHRoZSBjYXB0dXJlZCBpbWFnZSBVUkkgaW50byBpbWFnZVNvdXJjZSB0byBiZSBkaXNwbGF5ZWQgaW4gZnJvbnQtZW5kLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB0aGlzUGFyYW0gQ29udGFpbnMgY2FtZXJhcGx1cyBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRha2VQaWNGcm9tQ2FtKHRoaXNQYXJhbTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXNQYXJhbS5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXNQYXJhbS5jYW0udGFrZVBpY3R1cmUoeyBzYXZlVG9HYWxsZXJ5OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgfVxuXG4gICAgaW1hZ2VzR2FsbGVyeUV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ2ltYWdlZ2FsbGVyeSddKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSXQgdGFrZXMgdG8gaW1hZ2UgZ2FsbGVyeSB2aWV3IHdoZW4gdXNlciBjbGlja3Mgb24gZ2FsbGVyeSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgLy8gZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKCdjYWxsaW5nIGdhbGxlcnkuLi4uJyk7XG4gICAgLy8gICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgLy8gICAgIHRoaXMuX293bmVyLmdldCgpLnNlbmRFdmVudCgnaW1hZ2VHYWxsZXJ5RXZlbnQnKTtcbiAgICAvLyAgICAgcmVzb2x2ZSgpO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgLy8gdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydpbWFnZWdhbGxlcnknXSk7XG4gICAgLy8gfVxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBjYXB0dXJlZCBwaWN0dXJlIGRpYWxvZyB3aW5kb3cgYWZ0ZXIgdGFraW5nIHBpY3R1cmUuIFRoaXMgaXMgbW9kYWwgd2luZG93IGFsb25nIHdpdGhcbiAgICAgKiByZXVpcmVkIG9wdGlvbnMgbGlrZSBjYXB0dXJlIGltYWdlIFVSSSwgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJLCByZWN0YW5nbGUgcG9pbnRzIGFuZCBldGMuXG4gICAgICogVGhpcyBhbHNvIHRha2VzIGNhcmUgb2YgZGVsZXRpbmcgdGhlIGNhcHR1cmVkIGltYWdlIHdoZW4gdXNlciB3YW50cyB0byByZXRha2UgKHVzaW5nIFJldGFrZSBidXR0b24pXG4gICAgICogcGljdHVyZSBhbmQsIGNyZWF0ZXMgdGh1bWJuYWlsIGltYWdlIHdoZW4gdXNlciB3YW50cyB0byBzYXZlIHRoZSBjYXB0dXJlZCBpbWFnZSBhbmRcbiAgICAgKiBzZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBpbiBnYWxsZXJ5IGljb24gYnV0dG9uIGluIGNhbWVyYSB2aWV3LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBmdWxsU2NyZWVuIE9wdGlvbiB0byBzaG93IGZ1bGxzY3JlZW4gZGlhbG9nIG9yIG5vdFxuICAgICAqIEBwYXJhbSBmaWxlUGF0aE9yZyBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSByZWNQb2ludHNTdHIgUmVjdGFuZ2xlIHBvaW50cyBpbiBzdHJpbmdcbiAgICAgKi9cbiAgICBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxTY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCByZWNQb2ludHNTdHIpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xuICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgIGltYWdlU291cmNlOiBpbWdVUkksXG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2VPcmc6IGZpbGVQYXRoT3JnLFxuICAgICAgICAgICAgICAgIGlzQXV0b0NvcnJlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgcmVjdGFuZ2xlUG9pbnRzOiByZWNQb2ludHNTdHIsXG4gICAgICAgICAgICAgICAgc2F2ZUJ0bkxhYmxlOiB0aGlzLnNhdmVCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICBtYW51YWxCdG5MYWJsZTogdGhpcy5tYW51YWxCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICByZXRha2VCdG5MYWJsZTogdGhpcy5yZXRha2VCdG5MYWJsZSxcbiAgICAgICAgICAgICAgICBwZXJmb3JtQnRuTGFibGU6IHRoaXMucGVyZm9ybUJ0bkxhYmxlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IGZ1bGxTY3JlZW4sXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLm1vZGFsU2VydmljZS5zaG93TW9kYWwoRGlhbG9nQ29udGVudCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChkaWFsb2dSZXN1bHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaWFsb2dSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGRpbG9nUmVzdWx0VGVtcCA9IGRpYWxvZ1Jlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGRpYWxvZ1Jlc3VsdC5pbmRleE9mKCdfVEVNUCcpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkaWxvZ1Jlc3VsdFRlbXAgPSBkaWxvZ1Jlc3VsdFRlbXAucmVwbGFjZSgnX1RFTVAnICsgaSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAvLyBcdH1cbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRyYW5zZm9ybWVkSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUaHVtYk5haWxJbWFnZShkaWFsb2dSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgZGlhbG9nUmVzdWx0LCAnQWRkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0ZpbGVPcmc6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGZpbGVQYXRoT3JnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ0ZpbGVPcmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdGaWxlT3JnLnJlbW92ZVN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VSSSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nVVJJRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUZpbGUucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyA6IHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VyaUNvbnRvdXJQYXRoID0gaW1nVVJJLnN1YnN0cmluZygwLCBpbWdVUkkuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklDb250b3VyRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUNvbnRvdXJGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nVVJJQ29udG91ckZpbGUucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVcmlDb250b3VyUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2RvIC0gRW5kXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBpbWdVUkksICdSZW1vdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdDb3VsZCBub3QgZGVsZXRlIHRoZSBjYXB0dXJlIGltYWdlLicgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGluIGdhbGxlcnkgaW1hZ2UgYnV0dG9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbWdVUklQYXJhbSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIFVSSVxuICAgICAqL1xuICAgIHNldFRyYW5zZm9ybWVkSW1hZ2UoaW1nVVJJUGFyYW06IGFueSkge1xuICAgICAgICBpZiAoaW1nVVJJUGFyYW0pIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5faXNJbWFnZUJ0blZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltZ1VSSSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBzZXR0aW5nIGltYWdlIGluIHByZXZpZXcgYXJlYScgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IobW9kdWxlLmZpbGVuYW1lICsgJzogJyArIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciB0YWtlUGljdHVyZSBidXR0b25cbiAgICAgKiBhbmQgc2V0cyBpdCdzIHBhcmFtcyBsaWtlIGhlaWdodCwgd2lkdGgsIG1hcmdpbiAmIHJ1bGVzLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGFrZVBpY3R1cmVQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLndpZHRoID0gJzEwMCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5oZWlnaHQgPSAnMTAwJztcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTIpO1xuICAgICAgICAvLyBIT1JJWk9OVEFMX0NFTlRFUlxuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuYWRkUnVsZSgxMSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgbGF5b3V0IHBhcmFtcyB1c2luZyBMYXlvdXRQYXJhbXMgd2lkZ2V0IGZvciBhdXRvRm9jdXMgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMud2lkdGggPSAnMzAwJztcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMuaGVpZ2h0ID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9DRU5URVJcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMuYWRkUnVsZSgxMyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgaW1hZ2UgcmVzb3VyY2UgdG8gZ2l2ZW4gaW1hZ2UgYnV0dG9uLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBidG4gQnV0dG9uIGltYWdlIGluc3RhbmNlIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgSWNvbiBuYW1lXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJbWFnZVJlc291cmNlKGJ0bjogYW55LCBpY29uTmFtZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoaWNvbk5hbWUpO1xuICAgICAgICBidG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBsYXlvdXQgcGFyYW1zIHVzaW5nIExheW91dFBhcmFtcyB3aWRnZXQgZm9yIGdhbGxlcnkgYnV0dG9uXG4gICAgICogYW5kIHNldHMgaXQncyBwYXJhbXMgbGlrZSBoZWlnaHQsIHdpZHRoLCBtYXJnaW4gJiBydWxlcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLndpZHRoID0gJzEwMCc7XG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5oZWlnaHQgPSAnMTAwJztcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmFkZFJ1bGUoMTIpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfTEVGVFxuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuYWRkUnVsZSg5KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVmcmVzaGVzIHRoZSBjYXB0dXJlZCBpbWFnZXMgaW4gbWVkaWEgc3RvcmUgbWVhbmluZyB0aGF0IHRoZSBuZXcgY2FwdHVyZWQgaW1hZ2Ugd2lsbCBiZVxuICAgICAqIGF2YWlsYWJsZSB0byBwdWJsaWMgYWNjZXNzLiBUaGF0IGNhbiBiZSBkb25lIGJ5IFNlbmRCcm9hZGNhc3RJbWFnZSBtZXRob2QuXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVQYXRoT3JnIENhcHR1cmVkIEltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgSW1hZ2UgZmlsZSBVUklcbiAgICAgKiBAcGFyYW0gYWN0aW9uIEFjdGlvbnMgJ0FkZCcvJ1JlbW92ZSdcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlUGF0aE9yZyk7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIHRoaXMgdGh1bWJuYWlsIGltYWdlIHdpbGwgYmUgYXZhaWxhYmxlIG9ubHkgaW4gJ0FkZCcgY2FzZS5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdBZGQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gaW1nVVJJLnJlcGxhY2UoJ1BUX0lNRycsICd0aHVtYl9QVF9JTUcnKTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGh1bW5haWxPcmdQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdDb3VsZCBub3Qgc3luYyB0aGUgY2FwdHVyZWQgaW1hZ2UgZmlsZS4gJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aHVtYm5haWwgaW1hZ2UgZm9yIHRoZSBjYXB0dXJlZCB0cmFuc2Zvcm1lZCBpbWFnZSBhbmQgc2V0cyBpdCBpbiBnYWxsZXJ5IGJ1dHRvbi5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGh1bWJOYWlsSW1hZ2UoaW1nVVJJOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gVG9kbzogY29uc3QgdGh1bWJuYWlsSW1hZ2VQYXRoID0gb3BlbmN2LmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICBsZXQgdGh1bWJuYWlsSW1hZ2VQYXRoID0gT3BlbkNWV3JhcHBlci5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShkc3RJbWdVUkkpO1xuXG4gICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoJ2ZpbGU6Ly8nICsgdGh1bWJuYWlsSW1hZ2VQYXRoKTtcbiAgICAgICAgICAgIC8vIHRodW1ibmFpbEltYWdlUGF0aCA9IHRodW1ibmFpbEltYWdlUGF0aC50b1N0cmluZygpLnN1YnN0cmluZyg3KTtcbiAgICAgICAgICAgIGxldCBidXR0b25JbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZCh0aHVtYm5haWxJbWFnZVBhdGgpO1xuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlRm9yU3RhdGUoYnV0dG9uSW1hZ2UsIFVJQ29udHJvbFN0YXRlLk5vcm1hbCk7XG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VGb3JTdGF0ZShidXR0b25JbWFnZSwgVUlDb250cm9sU3RhdGUuSGlnaGxpZ2h0ZWQpO1xuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlRm9yU3RhdGUoYnV0dG9uSW1hZ2UsIFVJQ29udHJvbFN0YXRlLlNlbGVjdGVkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBjcmVhdGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogUGVyZm9ybSBhZGFwdGl2ZSB0aHJlc2hvbGQuXG4gICAgLy8gICogQHBhcmFtIHRocmVzaG9sZFZhbHVlIFRocmVzaG9sZCB2YWx1ZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuICAgIC8vICAgICB9KTtcbiAgICAvLyAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgLy8gICAgICAgICB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcbiAgICAvLyAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSB1c2luZyBPcGVuQ1YgQVBJIGFuZFxuICAgICAqIHJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbG9uZyB3aXRoIHJlY3RhbmdsZSBwb2ludHMgYXMgc3RyaW5nIHdoaWNoIHdpbGwgYmUgdXNlZCB0b1xuICAgICAqIGRyYXcgY2lyY2xlIHBvaW50cy4gQWZ0ZXIgdGhhdCBpdCBzaG93cyB1cCB0aGUgZGlhbG9nIG1vZGFsIHdpbmRvdyB3aXRoIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGggQ2FwdHVyZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aDogYW55KTogdm9pZCB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgcHRJbWdQbmdVcmkgPSAnJztcbiAgICAgICAgICAgIC8vIGxldCBvcGVuY3ZJbnN0YW5jZSA9IE9wZW5DVldyYXBwZXIubmV3KCk7XG4gICAgICAgICAgICBwdEltZ1BuZ1VyaSA9IE9wZW5DVldyYXBwZXIucGVyZm9ybVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdUcmFuc2Zvcm1lZCBJbWFnZSBVUkk6ICcsIHB0SW1nUG5nVXJpKTtcblxuICAgICAgICAgICAgLy8gY29uc3QgaW1nVVJJVGVtcCA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aCwgJycpO1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBwdEltZ1BuZ1VyaS5zdWJzdHJpbmcoMCwgcHRJbWdQbmdVcmkuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzU3RyID0gcHRJbWdQbmdVcmkuc3Vic3RyaW5nKHB0SW1nUG5nVXJpLmluZGV4T2YoJ1JQVFNUUicpKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyh0cnVlLCBmaWxlUGF0aCwgdGhpcy5pbWdVUkksIHJlY3RhbmdsZVBvaW50c1N0cik7XG4gICAgICAgICAgICAvLyB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHB0SW1nUG5nVXJpLCAnJyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBwZXJmb3JtaW5nIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIHByb2Nlc3MuIFBsZWFzZSByZXRha2UgcGljdHVyZScsICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBwZXJmb3JtIHByZXNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIGZvciB0aGUgY2FwdHVyZWQgaW1hZ2UgXG4gICAgICogYW5kIHNldHMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBpbiB0aGlzLmltZ1VSSSB2YXJpYWJsZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaW1hZ2VBc3NldCBJbWFnZUFzc2V0IG9iamVjdCBpbnN0YW5jZSByZWZlcnJlbmNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2UoY2FwdHVyZWREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgbGV0IGNhbWVyYVBsdXMgPSBjYXB0dXJlZERhdGEub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGxldCBpbWFnZUFzc2V0OiBQSEFzc2V0ID0gY2FwdHVyZWREYXRhLmRhdGE7XG4gICAgICAgIC8vIGltYWdlQXNzZXQuXG4gICAgICAgIGlmIChjYXB0dXJlZERhdGEuZGF0YSkge1xuXG4gICAgICAgICAgICAvLyBsZXQgX3VyaVJlcXVlc3RPcHRpb25zID0gUEhJbWFnZVJlcXVlc3RPcHRpb25zLmFsbG9jKCkuaW5pdCgpO1xuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF91cmlSZXF1ZXN0T3B0aW9ucy5zeW5jaHJvbm91cyA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBQSEltYWdlTWFuYWdlci5kZWZhdWx0TWFuYWdlcigpLnJlcXVlc3RJbWFnZURhdGFGb3JBc3NldE9wdGlvbnNSZXN1bHRIYW5kbGVyKGltYWdlQXNzZXQsIF91cmlSZXF1ZXN0T3B0aW9ucywgZnVuY3Rpb24gKGRhdGEsIHV0aSwgb3JpZW50YXRpb24sIGluZm8pIHtcblxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHVyaSA9IGluZm8ub2JqZWN0Rm9yS2V5KFwiUEhJbWFnZUZpbGVVUkxLZXlcIik7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3VXJpID0gdXJpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZU5hbWUgPSBuZXdVcmkucmVwbGFjZSgvXi4qW1xcXFxcXC9dLywgJycpO1xuXG4gICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0LmNvcHlJbWFnZUZpbGVzKHJhd0RhdGEsIGZpbGVOYW1lKTtcblxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoY2FwdHVyZWREYXRhLmRhdGEpLnRoZW4oXG4gICAgICAgICAgICAgICAgKGltZ1NyYykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGltZzogSW1hZ2VTb3VyY2UgPSA8SW1hZ2VTb3VyY2U+ZnJvbUZpbGUoaW1nU3JjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCBmb2xkZXI6IEZvbGRlciA9IDxGb2xkZXI+a25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZm9sZGVyID0gZnMucGF0aC5qb2luKGZzLmtub3duRm9sZGVycy5kb2N1bWVudHMoKS5wYXRoKTtcbiAgICAgICAgLy8gbGV0IGZvbGRlcnMwID0gZnMuRm9sZGVyLmZyb21QYXRoKGZvbGRlcjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGZvbGRlckRlc3QgPSBrbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSAnY2FwdHVyZWRpbWFnZXMvSU1HXycgKyBEYXRlLm5vdygpICsgJy5qcGcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhEZXN0ID0gcGF0aC5qb2luKGZvbGRlciwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVkOiBib29sZWFuID0gaW1nU3JjLnNhdmVUb0ZpbGUocGF0aERlc3QsIFwianBnXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzYXZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBVSUltYWdlV3JpdGVUb1NhdmVkUGhvdG9zQWxidW0oY2FwdHVyZWREYXRhLmRhdGEubmF0aXZlSW1hZ2UsIG51bGwsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbWdTcmMuc2F2ZVRvQWxidW0odGhpcy5pbWFnZVNvdXJjZSwgZmFsc2UsIGZhbHNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBhbGVydCgnVGhlIHBob3RvIHdhcyBzYXZlZCEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdPcmcgRmlsZSBQYXRoOiAnICsgcGF0aERlc3QpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IGZwID0gKGNhbWVyYVBsdXMuaW9zKSA/IGNhbWVyYVBsdXMuaW9zIDogY2FtZXJhUGx1cy5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLmltYWdlU291cmNlT3JnID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gcGF0aERlc3Q7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuaW1nVVJJID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24ocGF0aERlc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnSW1hZ2Ugc291cmNlIGlzIGJhZC4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldC4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldC4nLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdJbWFnZSBBc3NldCB3YXMgbnVsbC4gJyArIG1vZHVsZS5maWxlbmFtZSk7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICB9XG4gICAgfVxufVxudmFyIGdvSW1hZ2VHYWxsZXJ5ID0gZnVuY3Rpb24gKF90aGlzOiBhbnkpOiBhbnkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgX3RoaXMuX293bmVyLmdldCgpLnNlbmRFdmVudCgnaW1hZ2VzR2FsbGVyeUV2ZW50Jyk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICB9KTtcbiAgICAvLyAgICB0aGlzLl9vd25lci5nZXQoKS5zZW5kRXZlbnQoJ2ltYWdlc1NlbGVjdGVkRXZlbnQnLCB0aGlzKTtcbn07XG5cbnZhciBvcGVuR2FsbGVyeSA9IGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZyhcInRlc3RpbmcuLi4uZ2FsbGVyeS4uLi5cIik7XG4gICAgYWxlcnQoXCJvcGVuR2FsbGVyeS4uLlwiKTtcblxufTtcbnZhciBjaG9vc2VGcm9tTGlicmFyeTEgPSBmdW5jdGlvbiAoKSB7XG4gICAgYWxlcnQoJ2Nob29zZUZyb21MaWJyYXJ5MScpO1xufVxudmFyIHNuYXBQaWN0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgIGFsZXJ0KCdzbmFwUGljdHVyZScpO1xufVxuXG4vKiogT3ZlcmlkZSBtZXRob2QgdG8gZGlzcGxheSBmbGFzaCBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gKiBUaGlzIGlzIGFjdHVhbGx5IHNhbWUgYXMgaXQncyBwYXJlbnQgZXhjZXB0IHRoZSBidXR0b24gbG9jYXRpb24gKHgseSlcbiAqL1xudmFyIGZsYXNoQnRuSGFuZGxlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fZmxhc2hCdG4pXG4gICAgICAgIHRoaXMuX2ZsYXNoQnRuLnJlbW92ZUZyb21TdXBlcnZpZXcoKTtcbiAgICBpZiAodGhpcy5mbGFzaEVuYWJsZWQpIHtcbiAgICAgICAgdGhpcy5fZmxhc2hCdG4gPSBjcmVhdGVJbWFnZUJ1dHRvbih0aGlzLCBDR1JlY3RNYWtlKDIwLCA4MCwgNTAsIDUwKSwgbnVsbCwgJ3RvZ2dsZUZsYXNoJywgbnVsbCwgY3JlYXRlSWNvbignZmxhc2gnLCBudWxsLCBudWxsKSwgbnVsbCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLl9mbGFzaEJ0biA9IGNyZWF0ZUltYWdlQnV0dG9uKHRoaXMsIENHUmVjdE1ha2UoMjAsIDgwLCA1MCwgNTApLCBudWxsLCAndG9nZ2xlRmxhc2gnLCBudWxsLCBjcmVhdGVJY29uKCdmbGFzaE9mZicsIG51bGwsIG51bGwpLCBudWxsKTtcbiAgICB9XG4gICAgdGhpcy5fZmxhc2hCdG4udHJhbnNmb3JtID0gQ0dBZmZpbmVUcmFuc2Zvcm1NYWtlU2NhbGUoMC43NSwgMC43NSk7XG4gICAgdGhpcy52aWV3LmFkZFN1YnZpZXcodGhpcy5fZmxhc2hCdG4pO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGljb24gZm9yIHRoZSBnaXZlbiB0eXBlcyAoZmxhc2hPbiwgZmxhc2hPZmYsIHRvZ2dsZSwgcGljdHVyZU91dExpbmUsIHRha2VQaWN0dXJlLCBHYWxsZXJ5KVxuICogXG4gKiBAcGFyYW0gdHlwZSB0eXBlIG9mIGljb24gdG8gYmUgY3JlYXRlZFxuICogQHBhcmFtIHNpemUgc2l6ZSBvZiB0aGUgaWNvblxuICogQHBhcmFtIGNvbG9yIGNvbG9yIG9mIHRoZSBpY29uXG4gKi9cbnZhciBjcmVhdGVJY29uID0gZnVuY3Rpb24gKHR5cGUsIHNpemUsIGNvbG9yKTogYW55IHtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAnZmxhc2gnOlxuICAgICAgICAgICAgVUlHcmFwaGljc0JlZ2luSW1hZ2VDb250ZXh0V2l0aE9wdGlvbnMoc2l6ZSB8fCBDR1NpemVNYWtlKDUwLCA1MCksIGZhbHNlLCAwKTtcbiAgICAgICAgICAgIGRyYXdGbGFzaChjb2xvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmxhc2hPZmYnOlxuICAgICAgICAgICAgVUlHcmFwaGljc0JlZ2luSW1hZ2VDb250ZXh0V2l0aE9wdGlvbnMoc2l6ZSB8fCBDR1NpemVNYWtlKDUwLCA1MCksIGZhbHNlLCAwKTtcbiAgICAgICAgICAgIGRyYXdGbGFzaE9mZihjb2xvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndG9nZ2xlJzpcbiAgICAgICAgICAgIFVJR3JhcGhpY3NCZWdpbkltYWdlQ29udGV4dFdpdGhPcHRpb25zKHNpemUgfHwgQ0dTaXplTWFrZSg1MCwgNTApLCBmYWxzZSwgMCk7XG4gICAgICAgICAgICBkcmF3VG9nZ2xlKGNvbG9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwaWNPdXRsaW5lJzpcbiAgICAgICAgICAgIFVJR3JhcGhpY3NCZWdpbkltYWdlQ29udGV4dFdpdGhPcHRpb25zKHNpemUgfHwgQ0dTaXplTWFrZSg1MCwgNTApLCBmYWxzZSwgMCk7XG4gICAgICAgICAgICBkcmF3UGljT3V0bGluZShjb2xvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGFrZVBpYyc6XG4gICAgICAgICAgICBVSUdyYXBoaWNzQmVnaW5JbWFnZUNvbnRleHRXaXRoT3B0aW9ucyhzaXplIHx8IENHU2l6ZU1ha2UoNTAsIDUwKSwgZmFsc2UsIDApO1xuICAgICAgICAgICAgZHJhd0NpcmNsZShjb2xvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZ2FsbGVyeSc6XG4gICAgICAgICAgICBVSUdyYXBoaWNzQmVnaW5JbWFnZUNvbnRleHRXaXRoT3B0aW9ucyhzaXplIHx8IENHU2l6ZU1ha2UoNTAsIDUwKSwgZmFsc2UsIDApO1xuICAgICAgICAgICAgZHJhd0dhbGxlcnkoY29sb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxuICAgIHZhciBpbWcgPSBVSUdyYXBoaWNzR2V0SW1hZ2VGcm9tQ3VycmVudEltYWdlQ29udGV4dCgpO1xuICAgIFVJR3JhcGhpY3NFbmRJbWFnZUNvbnRleHQoKTtcbiAgICByZXR1cm4gaW1nO1xufTtcbi8qKlxuICogRHJhd3MgZmxhc2hPbiBpY29uIHVzaW5nIFVJQmV6aWVyUGF0aCBmb3IgdGhlIGZsYXNoT04gYnV0dG9uLlxuICogXG4gKiBAcGFyYW0gY29sb3IgY29sb3Igb2YgdGhlIGZsYXNoT2ZmIGljb25cbiAqL1xudmFyIGRyYXdGbGFzaCA9IGZ1bmN0aW9uIChjb2xvcjogYW55KSB7XG4gICAgdmFyIGljb25Db2xvciA9IG5ldyBDb2xvcihjb2xvciB8fCAnI2ZmZicpLmlvcztcbiAgICB2YXIgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgyMy4xNywgMC41OCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTEuMTksIDEzLjY1KSwgQ0dQb2ludE1ha2UoMjIuNzksIDAuOTcpLCBDR1BvaW50TWFrZSgxNy4zOCwgNi44MykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMCwgMjYuNjYpLCBDR1BvaW50TWFrZSgzLjIsIDIyLjQxKSwgQ0dQb2ludE1ha2UoLTAuMDcsIDI2LjI0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjkxLCAyNy40NCksIENHUG9pbnRNYWtlKDAuMSwgMjcuMjYpLCBDR1BvaW50TWFrZSgwLjM0LCAyNy4yOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTMuNjEsIDI4LjE1KSwgQ0dQb2ludE1ha2UoMTMuMzQsIDI3LjU4KSwgQ0dQb2ludE1ha2UoMTMuNzEsIDI3LjYxKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMC42MSwgMzcuMDcpLCBDR1BvaW50TWFrZSgxMy41NCwgMjguNDUpLCBDR1BvaW50TWFrZSgxMi4xOCwgMzIuNDYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDcuODMsIDQ1LjkyKSwgQ0dQb2ludE1ha2UoOS4wMiwgNDEuNjQpLCBDR1BvaW50TWFrZSg3Ljc2LCA0NS42MikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoOC44NSwgNDYuNDMpLCBDR1BvaW50TWFrZSg3Ljg5LCA0Ni4yNSksIENHUG9pbnRNYWtlKDguMjcsIDQ2LjQzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMS41NCwgMzMuNDgpLCBDR1BvaW50TWFrZSg5LjU5LCA0Ni40MyksIENHUG9pbnRNYWtlKDExLjM2LCA0NC42MykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzMuMiwgMTkuODcpLCBDR1BvaW50TWFrZSgzMC4xOCwgMjMuOTcpLCBDR1BvaW50TWFrZSgzMy4yNywgMjAuMzUpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI2LjU3LCAxOS4xMiksIENHUG9pbnRNYWtlKDMzLjEsIDE5LjIxKSwgQ0dQb2ludE1ha2UoMzMsIDE5LjIxKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMCwgMTguNjcpLCBDR1BvaW50TWFrZSgyMS43MSwgMTkuMDYpLCBDR1BvaW50TWFrZSgyMCwgMTguOTQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIyLjc2LCA5Ljg4KSwgQ0dQb2ludE1ha2UoMjAsIDE4LjQ5KSwgQ0dQb2ludE1ha2UoMjEuMjMsIDE0LjUyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNS4zOCwgMC43MyksIENHUG9pbnRNYWtlKDI0LjI2LCA1LjIxKSwgQ0dQb2ludE1ha2UoMjUuNDUsIDEuMTIpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIzLjE3LCAwLjU4KSwgQ0dQb2ludE1ha2UoMjUuMjQsIC0wLjE3KSwgQ0dQb2ludE1ha2UoMjQuMDUsIC0wLjI2KSk7XG4gICAgYmV6aWVyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyUGF0aC5maWxsKCk7XG59O1xuLyoqXG4gKiBEcmF3cyBmbGFzaE9mZiBpY29uIHVzaW5nIFVJQmV6aWVyUGF0aCBmb3IgdGhlIGZsYXNoT2ZmIGJ1dHRvbi5cbiAqIFxuICogQHBhcmFtIGNvbG9yIGNvbG9yIG9mIHRoZSBmbGFzaE9mZiBpY29uXG4gKi9cbnZhciBkcmF3Rmxhc2hPZmYgPSBmdW5jdGlvbiAoY29sb3I6IGFueSkge1xuICAgIHZhciBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgdmFyIGJlemllclBhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuMTMsIDQuNSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTUuMSwgMTIuMjgpLCBDR1BvaW50TWFrZSgxOS4xOCwgNy4wMSksIENHUG9pbnRNYWtlKDE2LjQ1LCAxMC41MSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTIuNjYsIDE1LjQ1KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg3LjA5LCA5LjY0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLjgsIDMuOSksIENHUG9pbnRNYWtlKDIuNSwgNC44MiksIENHUG9pbnRNYWtlKDEuNDEsIDMuODQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAsIDQuNzMpLCBDR1BvaW50TWFrZSgwLjI5LCAzLjk2KSwgQ0dQb2ludE1ha2UoMC4wNiwgNC4yKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNy44MywgMjQuMTMpLCBDR1BvaW50TWFrZSgtMC4wNiwgNS4zNiksIENHUG9pbnRNYWtlKDIuNywgOC4zOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzYuNDQsIDQyLjY5KSwgQ0dQb2ludE1ha2UoMzIuODcsIDM5LjgxKSwgQ0dQb2ludE1ha2UoMzUuODYsIDQyLjc4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzNy4yMSwgNDEuODgpLCBDR1BvaW50TWFrZSgzNi44OSwgNDIuNjMpLCBDR1BvaW50TWFrZSgzNy4xNSwgNDIuMzYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjY0LCAzNS4yNCksIENHUG9pbnRNYWtlKDM3LjMsIDQxLjI4KSwgQ0dQb2ludE1ha2UoMzYuMjksIDQwLjExKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyNS45OCwgMjkuMzEpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI5LjM0LCAyNC45NCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzIuNjIsIDE5LjkxKSwgQ0dQb2ludE1ha2UoMzEuNzYsIDIxLjgzKSwgQ0dQb2ludE1ha2UoMzIuNjcsIDIwLjM5KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNy4wMiwgMTkuMTYpLCBDR1BvaW50TWFrZSgzMi41MywgMTkuMjUpLCBDR1BvaW50TWFrZSgzMi40NCwgMTkuMjUpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIxLjQ4LCAxOC43MSksIENHUG9pbnRNYWtlKDIyLjkxLCAxOS4xKSwgQ0dQb2ludE1ha2UoMjEuNDgsIDE4Ljk4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMy44LCA5LjkxKSwgQ0dQb2ludE1ha2UoMjEuNDgsIDE4LjUzKSwgQ0dQb2ludE1ha2UoMjIuNTEsIDE0LjU1KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNi4wMSwgMC43NSksIENHUG9pbnRNYWtlKDI1LjA3LCA1LjI0KSwgQ0dQb2ludE1ha2UoMjYuMDcsIDEuMTQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI1LjMsIDAuMDEpLCBDR1BvaW50TWFrZSgyNS45NiwgMC4zNCksIENHUG9pbnRNYWtlKDI1LjcsIDAuMDcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIxLjEzLCA0LjUpLCBDR1BvaW50TWFrZSgyNC44MSwgLTAuMDgpLCBDR1BvaW50TWFrZSgyMy45NywgMC44NCkpO1xuICAgIGJlemllclBhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllclBhdGguZmlsbCgpO1xuICAgIHZhciBiZXppZXIyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyMlBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoNy4xOCwgMjIuNikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQuNTksIDI2LjcpLCBDR1BvaW50TWFrZSg1LjQzLCAyNC45MSksIENHUG9pbnRNYWtlKDQuNTQsIDI2LjMyKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTAuNDIsIDI3LjQ4KSwgQ0dQb2ludE1ha2UoNC42OCwgMjcuMyksIENHUG9pbnRNYWtlKDQuOTEsIDI3LjMzKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTYuMDgsIDI4LjIpLCBDR1BvaW50TWFrZSgxNS44NSwgMjcuNjMpLCBDR1BvaW50TWFrZSgxNi4xNywgMjcuNjYpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMy41NSwgMzcuMTIpLCBDR1BvaW50TWFrZSgxNi4wMiwgMjguNSksIENHUG9pbnRNYWtlKDE0Ljg3LCAzMi41MSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDExLjIsIDQ1Ljk4KSwgQ0dQb2ludE1ha2UoMTIuMiwgNDEuNyksIENHUG9pbnRNYWtlKDExLjE0LCA0NS42OCkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEyLjA2LCA0Ni40OSksIENHUG9pbnRNYWtlKDExLjI2LCA0Ni4zMSksIENHUG9pbnRNYWtlKDExLjU3LCA0Ni40OSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE4LjA2LCAzOS42NyksIENHUG9pbnRNYWtlKDEyLjY5LCA0Ni40OSksIENHUG9pbnRNYWtlKDEzLjYxLCA0NS40NykpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDIzLjI5LCAzMi44MSkpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDE2LjcxLCAyNS45NikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDkuOTksIDE5LjEpLCBDR1BvaW50TWFrZSgxMy4wOSwgMjIuMTkpLCBDR1BvaW50TWFrZSgxMC4wOCwgMTkuMSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDcuMTgsIDIyLjYpLCBDR1BvaW50TWFrZSg5LjkxLCAxOS4xKSwgQ0dQb2ludE1ha2UoOC42NCwgMjAuNjkpKTtcbiAgICBiZXppZXIyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXIyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllcjJQYXRoLmZpbGwoKTtcbn07XG4vKipcbiAqIERyYXdzIHRoZSB0b2dnbGUgaWNvbiB1c2luZyBVSUJlemllclBhdGggZm9yIHN3aXRjaCBjYW1lcmEgYnV0dG9uXG4gKiBcbiAqIEBwYXJhbSBjb2xvciBjb2xvciBvZiB0b2dnbGUgaWNvblxuICovXG52YXIgZHJhd1RvZ2dsZSA9IGZ1bmN0aW9uIChjb2xvcjogYW55KSB7XG4gICAgdmFyIGljb25Db2xvciA9IG5ldyBDb2xvcihjb2xvciB8fCAnI2ZmZicpLmlvcztcbiAgICB2YXIgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxNy45MSwgMy4wMykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTQuNjksIDYuMiksIENHUG9pbnRNYWtlKDE2LjExLCA1LjcyKSwgQ0dQb2ludE1ha2UoMTUuNywgNi4xKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMy40MSwgNS41MSksIENHUG9pbnRNYWtlKDEzLjc1LCA2LjMxKSwgQ0dQb2ludE1ha2UoMTMuNTIsIDYuMTcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDkuMSwgNC42KSwgQ0dQb2ludE1ha2UoMTMuMywgNC43NCksIENHUG9pbnRNYWtlKDEzLjE1LCA0LjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQuODcsIDQuNSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNC44NywgNS40KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzLjM3LCA2LjI3KSwgQ0dQb2ludE1ha2UoNC44NywgNi4yKSwgQ0dQb2ludE1ha2UoNC43MiwgNi4yNykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMC45NCwgNy4xNCksIENHUG9pbnRNYWtlKDIuMjUsIDYuMjcpLCBDR1BvaW50TWFrZSgxLjYxLCA2LjUyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgwLCA3Ljk4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgwLCAyNi41OSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMCwgNDUuMikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMC45NywgNDYuMDQpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDEuOTUsIDQ2Ljg4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzMS44OCwgNDYuODgpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYxLjgxLCA0Ni44OCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNjIuODMsIDQ1LjkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYzLjg4LCA0NC45NikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNjMuODgsIDI2LjUyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2My44OCwgOC4wOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNjIuOTgsIDcuMTgpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYyLjA4LCA2LjI3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg1NS4wMywgNi4yNykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDguMDMsIDYuMjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ1Ljg5LCAzLjE0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My43NiwgMCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzEuODQsIDApKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDE5LjkzLCAwKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxNy45MSwgMy4wMykpO1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSg0NC45MiwgNC42KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ni45NCwgNy42NykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNTQuMTMsIDcuNjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDYxLjc0LCA4LjA5KSwgQ0dQb2ludE1ha2UoNTkuMTksIDcuNjcpLCBDR1BvaW50TWFrZSg2MS40NCwgNy44MSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNjEuNzQsIDQ0Ljg5KSwgQ0dQb2ludE1ha2UoNjIuMzgsIDguNjgpLCBDR1BvaW50TWFrZSg2Mi4zOCwgNDQuMykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMS45NSwgNDQuODkpLCBDR1BvaW50TWFrZSg2MS4xLCA0NS40OCksIENHUG9pbnRNYWtlKDIuNTgsIDQ1LjQ4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxLjUsIDI2LjYzKSwgQ0dQb2ludE1ha2UoMS42MSwgNDQuNTcpLCBDR1BvaW50TWFrZSgxLjUsIDQwLjA0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyLjEsIDguMjIpLCBDR1BvaW50TWFrZSgxLjUsIDEwLjg0KSwgQ0dQb2ludE1ha2UoMS41NywgOC43MSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoOS43NCwgNy42NyksIENHUG9pbnRNYWtlKDIuNTgsIDcuNzcpLCBDR1BvaW50TWFrZSgzLjgyLCA3LjY3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxNi43OCwgNy42NykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTcuNjUsIDYuMzQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE5Ljc0LCAzLjIxKSwgQ0dQb2ludE1ha2UoMTguMTMsIDUuNjUpLCBDR1BvaW50TWFrZSgxOS4wNywgNC4yMikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuMDIsIDEuMzkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDMxLjk2LCAxLjQ2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Mi44NiwgMS41NykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDQuOTIsIDQuNikpO1xuICAgIGJlemllclBhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllclBhdGguZmlsbCgpO1xuICAgIHZhciBiZXppZXIyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyMlBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjguMjgsIDExLjI2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuNzcsIDE0LjQzKSwgQ0dQb2ludE1ha2UoMjYuMTEsIDExLjc4KSwgQ0dQb2ludE1ha2UoMjIuODUsIDEzLjM4KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuMDIsIDE1LjE2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjIuMSwgMTYuMzgpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyMy4xOSwgMTcuNikpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI0LjI0LCAxNi42OSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjg0LCAxNC4xMSksIENHUG9pbnRNYWtlKDI2LjQxLCAxNC43OCksIENHUG9pbnRNYWtlKDI4LjQsIDE0LjExKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzYuNzksIDE0Ljk1KSwgQ0dQb2ludE1ha2UoMzQuNDMsIDE0LjExKSwgQ0dQb2ludE1ha2UoMzUuMzcsIDE0LjI5KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDIuNTYsIDIwLjMyKSwgQ0dQb2ludE1ha2UoMzkuMjIsIDE2LjAzKSwgQ0dQb2ludE1ha2UoNDEuNDcsIDE4LjE2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDEuMjEsIDIzLjM1KSwgQ0dQb2ludE1ha2UoNDMuOTQsIDIzLjE0KSwgQ0dQb2ludE1ha2UoNDMuODcsIDIzLjM1KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzguOTYsIDIzLjUyKSwgQ0dQb2ludE1ha2UoMzkuOTcsIDIzLjM1KSwgQ0dQb2ludE1ha2UoMzguOTYsIDIzLjQyKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDUuMzMsIDMwLjg0KSwgQ0dQb2ludE1ha2UoMzguOTYsIDIzLjg3KSwgQ0dQb2ludE1ha2UoNDUuMDMsIDMwLjg0KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNTEuNywgMjMuNTYpLCBDR1BvaW50TWFrZSg0NS42NywgMzAuODQpLCBDR1BvaW50TWFrZSg1MS43LCAyMy45NCkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ5LjMsIDIzLjM1KSwgQ0dQb2ludE1ha2UoNTEuNywgMjMuNDUpLCBDR1BvaW50TWFrZSg1MC42MSwgMjMuMzUpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ni45LCAyMy4zNSkpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ2LjY0LCAyMS45NikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDM4LjAzLCAxMi4xNiksIENHUG9pbnRNYWtlKDQ1LjkzLCAxOC4wOSksIENHUG9pbnRNYWtlKDQyLjQxLCAxNC4wNSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI4LjI4LCAxMS4yNiksIENHUG9pbnRNYWtlKDM1LjE4LCAxMC45MSksIENHUG9pbnRNYWtlKDMxLjI0LCAxMC41NikpO1xuICAgIGJlemllcjJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllcjJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyMlBhdGguZmlsbCgpO1xuICAgIHZhciBiZXppZXIzUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyM1BhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTUuMTQsIDIwLjkxKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTIuMDYsIDI0Ljc0KSwgQ0dQb2ludE1ha2UoMTMuNTIsIDIyLjgzKSwgQ0dQb2ludE1ha2UoMTIuMTQsIDI0LjU0KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTQuMzUsIDI1LjA5KSwgQ0dQb2ludE1ha2UoMTEuOTksIDI0Ljk1KSwgQ0dQb2ludE1ha2UoMTIuODksIDI1LjA5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTYuNzUsIDI1LjA5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTYuOTcsIDI3LjA4KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuMzUsIDM0Ljk5KSwgQ0dQb2ludE1ha2UoMTcuMjcsIDI5Ljc2KSwgQ0dQb2ludE1ha2UoMTkuMDMsIDMzKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDEuODEsIDM1LjQxKSwgQ0dQb2ludE1ha2UoMjcuMjQsIDQwLjExKSwgQ0dQb2ludE1ha2UoMzYuMTEsIDQwLjI5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDMuNDYsIDMzLjk4KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDIuNDEsIDMyLjgzKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDEuMzYsIDMxLjY4KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDAuMDEsIDMyLjg2KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzEuODQsIDM1LjcyKSwgQ0dQb2ludE1ha2UoMzcuNTgsIDM0Ljk5KSwgQ0dQb2ludE1ha2UoMzUuNDgsIDM1LjcyKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjYuODIsIDM0Ljg5KSwgQ0dQb2ludE1ha2UoMjkuMjIsIDM1LjcyKSwgQ0dQb2ludE1ha2UoMjguMzIsIDM1LjU4KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjAuMzEsIDI2LjkxKSwgQ0dQb2ludE1ha2UoMjMuMzQsIDMzLjI4KSwgQ0dQb2ludE1ha2UoMjEuMDIsIDMwLjQzKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTkuOTcsIDI1LjA5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjIuMzcsIDI1LjA5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjQuNTgsIDI0LjU3KSwgQ0dQb2ludE1ha2UoMjQuMzksIDI1LjA5KSwgQ0dQb2ludE1ha2UoMjQuNzYsIDI0Ljk5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTguMzYsIDE3LjQzKSwgQ0dQb2ludE1ha2UoMjQuMjgsIDIzLjg0KSwgQ0dQb2ludE1ha2UoMTguNjksIDE3LjQzKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTUuMTQsIDIwLjkxKSwgQ0dQb2ludE1ha2UoMTguMjEsIDE3LjQzKSwgQ0dQb2ludE1ha2UoMTYuNzgsIDE4Ljk5KSk7XG4gICAgYmV6aWVyM1BhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyM1BhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXIzUGF0aC5maWxsKCk7XG59O1xuLyoqXG4gKiBEcmF3cyBwaWN0dXJlIG91dGxpbmUgaWNvbiB1c2luZyBVSUJlemllclBhdGggZm9yIHRha2luZyBwaWN0dXJlIGJ1dHRvblxuICogXG4gKiBAcGFyYW0gY29sb3IgQ29sb3Igb2YgdGhlIHBpY3R1cmUgb3V0bGluZVxuICovXG52YXIgZHJhd1BpY091dGxpbmUgPSBmdW5jdGlvbiAoY29sb3I6IGFueSkge1xuICAgIHZhciBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgdmFyIGJlemllclBhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTcuMTMsIDAuNjMpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDYuMTMsIDcuMjEpLCBDR1BvaW50TWFrZSgxMi44MiwgMS43NyksIENHUG9pbnRNYWtlKDkuMzEsIDMuODcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAuOTEsIDE1Ljg1KSwgQ0dQb2ludE1ha2UoMy43LCA5Ljc5KSwgQ0dQb2ludE1ha2UoMi4xMSwgMTIuNDQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAsIDIzLjIxKSwgQ0dQb2ludE1ha2UoMC4xLCAxOC4yNyksIENHUG9pbnRNYWtlKDAsIDE4Ljg2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLjkxLCAzMC41OCksIENHUG9pbnRNYWtlKDAsIDI3LjU3KSwgQ0dQb2ludE1ha2UoMC4xLCAyOC4xOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTQuMDIsIDQ0Ljc1KSwgQ0dQb2ludE1ha2UoMy4xMSwgMzYuOTMpLCBDR1BvaW50TWFrZSg4LjAxLCA0Mi4yKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzMS43MywgNDQuNzUpLCBDR1BvaW50TWFrZSgxOS4zNywgNDcuMDUpLCBDR1BvaW50TWFrZSgyNi4zOCwgNDcuMDUpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ0Ljg0LCAzMC41OCksIENHUG9pbnRNYWtlKDM3Ljc0LCA0Mi4yKSwgQ0dQb2ludE1ha2UoNDIuNjQsIDM2LjkzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0NS43NSwgMjMuMjEpLCBDR1BvaW50TWFrZSg0NS42NSwgMjguMTkpLCBDR1BvaW50TWFrZSg0NS43NSwgMjcuNTcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ0Ljg0LCAxNS44NSksIENHUG9pbnRNYWtlKDQ1Ljc1LCAxOC44NiksIENHUG9pbnRNYWtlKDQ1LjY1LCAxOC4yNCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjgsIDAuNDYpLCBDR1BvaW50TWFrZSg0Mi4xNSwgOC4xMiksIENHUG9pbnRNYWtlKDM1LjgyLCAyLjMzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNy4xMywgMC42MyksIENHUG9pbnRNYWtlKDI1LjE1LCAtMC4yMiksIENHUG9pbnRNYWtlKDIwLjAyLCAtMC4xMykpO1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgyNy4zOSwgNC4zOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDIuMDIsIDIzLjIxKSwgQ0dQb2ludE1ha2UoMzUuODIsIDYuNDIpLCBDR1BvaW50TWFrZSg0Mi4wMiwgMTQuMzgpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjc3LCA0MC4zMyksIENHUG9pbnRNYWtlKDQyLjAyLCAzMC4zNSksIENHUG9pbnRNYWtlKDM4LCAzNy4wNikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoOS4zOCwgMzYuOCksIENHUG9pbnRNYWtlKDI0LjIxLCA0NC4yNiksIENHUG9pbnRNYWtlKDE1LjQ4LCA0Mi45MikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNS44NywgMTQuMjgpLCBDR1BvaW50TWFrZSgzLjM3LCAzMC44NCksIENHUG9pbnRNYWtlKDIuMDEsIDIyLjA0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxOC4yLCA0LjQyKSwgQ0dQb2ludE1ha2UoOC4xNCwgOS43NiksIENHUG9pbnRNYWtlKDEzLjMsIDUuNikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjcuMzksIDQuMzkpLCBDR1BvaW50TWFrZSgyMC43MywgMy44KSwgQ0dQb2ludE1ha2UoMjQuODIsIDMuOCkpO1xuICAgIGJlemllclBhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllclBhdGguZmlsbCgpO1xufTtcbi8qKlxuICogRHJhd3MgY2lyY2xlIGljb24gdXNpbmcgVUlCZXppZXJQYXRoXG4gKiBcbiAqIEBwYXJhbSBjb2xvciBjb2xvciBvZiB0aGUgY2lyY2xlIGljb25cbiAqL1xuXG52YXIgZHJhd0NpcmNsZSA9IGZ1bmN0aW9uIChjb2xvcikge1xuICAgIHZhciBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgdmFyIGJlemllcjJQYXRoID0gVUlCZXppZXJQYXRoLmJlemllclBhdGgoKTtcbiAgICBiZXppZXIyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxNy44OCwgMC41MSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAsIDIzLjA4KSwgQ0dQb2ludE1ha2UoNy40NywgMy4wOSksIENHUG9pbnRNYWtlKDAuMDQsIDEyLjQ5KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTcuODMsIDQ1LjI1KSwgQ0dQb2ludE1ha2UoMCwgMzMuMzkpLCBDR1BvaW50TWFrZSg3LjQ3LCA0Mi42NikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQwLjA4LCAzOS4xMyksIENHUG9pbnRNYWtlKDI1LjgxLCA0Ny4yMiksIENHUG9pbnRNYWtlKDM0LjIsIDQ0LjkyKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDcsIDIyLjg0KSwgQ0dQb2ludE1ha2UoNDQuOSwgMzQuNDEpLCBDR1BvaW50TWFrZSg0NywgMjkuNCkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjYsIDEuMjkpLCBDR1BvaW50TWFrZSg0NywgMTMuMDMpLCBDR1BvaW50TWFrZSg0MS4wOCwgNC44MikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE3Ljg4LCAwLjUxKSwgQ0dQb2ludE1ha2UoMjcuOTksIC0wLjA3KSwgQ0dQb2ludE1ha2UoMjEuNjUsIC0wLjQpKTtcbiAgICBiZXppZXIyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXIyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllcjJQYXRoLmZpbGwoKTtcbn07XG4vKipcbiAqIERyYXdzIGdhbGxlcnkgaWNvbiB1c2luZyBVSUJlemllclBhdGhcbiAqIFxuICogQHBhcmFtIGNvbG9yIGNvbG9yIG9mIHRoZSBnYWxsZXJ5IGljb25cbiAqL1xudmFyIGRyYXdHYWxsZXJ5ID0gZnVuY3Rpb24gKGNvbG9yKSB7XG4gICAgdmFyIGljb25Db2xvciA9IG5ldyBDb2xvcihjb2xvciB8fCAnI2ZmZicpLmlvcztcbiAgICB2YXIgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxLjQyLCAwLjEzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLjExLCAxLjQ2KSwgQ0dQb2ludE1ha2UoMC45LCAwLjMxKSwgQ0dQb2ludE1ha2UoMC4yNSwgMC45OCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMCwgMTcuMjgpLCBDR1BvaW50TWFrZSgwLjAzLCAxLjcyKSwgQ0dQb2ludE1ha2UoMCwgNi42MSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMCwgMzIuNzMpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDAuMjgsIDMzLjI0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxLjA0LCAzNC4wNCksIENHUG9pbnRNYWtlKDAuNDgsIDMzLjYxKSwgQ0dQb2ludE1ha2UoMC42OCwgMzMuODMpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDEuNTIsIDM0LjMzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzLjg0LCAzNC4zNikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNi4xNSwgMzQuMzkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYuMTUsIDM2LjU0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjgsIDM5LjY2KSwgQ0dQb2ludE1ha2UoNi4xNSwgMzguOTMpLCBDR1BvaW50TWFrZSg2LjE4LCAzOS4wOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjguMDUsIDQwLjMpLCBDR1BvaW50TWFrZSg3LjUzLCA0MC4zNSksIENHUG9pbnRNYWtlKDUuOTgsIDQwLjMpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ4LjM4LCA0MC4xOSksIENHUG9pbnRNYWtlKDQyLjgyLCA0MC4zKSwgQ0dQb2ludE1ha2UoNDguMDUsIDQwLjI3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0OS44OSwgMzguODIpLCBDR1BvaW50TWFrZSg0OC45OCwgNDAuMDQpLCBDR1BvaW50TWFrZSg0OS43NCwgMzkuMzYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDUwLCAyMyksIENHUG9pbnRNYWtlKDQ5Ljk3LCAzOC41NSksIENHUG9pbnRNYWtlKDUwLCAzMy44OCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNTAsIDcuNTQpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ5LjcyLCA3LjA0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0OC45NiwgNi4yMyksIENHUG9pbnRNYWtlKDQ5LjUyLCA2LjY2KSwgQ0dQb2ludE1ha2UoNDkuMzIsIDYuNDQpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ4LjQ4LCA1Ljk1KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ni4xNywgNS45MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDMuODYsIDUuODkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQzLjgzLCAzLjYyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My44LCAxLjM0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My41MywgMC45NSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDIuNzksIDAuMjkpLCBDR1BvaW50TWFrZSg0My4zOCwgMC43NCksIENHUG9pbnRNYWtlKDQzLjA1LCAwLjQzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Mi4zMSwgMC4wMikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjIuMDcsIDApKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEuNDIsIDAuMTMpLCBDR1BvaW50TWFrZSg0LjM5LCAtMC4wMSksIENHUG9pbnRNYWtlKDEuNzksIDApKTtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzkuNzgsIDQuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzkuNzgsIDUuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjMuODMsIDUuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNy44OCwgNS45KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg3LjMzLCA2LjE2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjUsIDYuODQpLCBDR1BvaW50TWFrZSg2Ljk4LCA2LjM0KSwgQ0dQb2ludE1ha2UoNi43LCA2LjU3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2LjIsIDcuMjYpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYuMTcsIDE4Ljg2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2LjE1LCAzMC40NikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNS4xMSwgMzAuNDYpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQuMDcsIDMwLjQ2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0LjA3LCAxNy4xOCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNC4wNywgMy44OSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuOTIsIDMuODkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDM5Ljc4LCAzLjg5KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzOS43OCwgNC45KSk7XG4gICAgYmV6aWVyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBiZXppZXJQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDQ1LjkzLCAyMy4xKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0NS45MywgMzYuMzgpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI4LjA4LCAzNi4zOCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTAuMjIsIDM2LjM4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxMC4yMiwgMjMuMSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTAuMjIsIDkuODIpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI4LjA4LCA5LjgyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0NS45MywgOS44MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDUuOTMsIDIzLjEpKTtcbiAgICBiZXppZXJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXJQYXRoLmZpbGwoKTtcbiAgICB2YXIgYmV6aWVyMlBhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllcjJQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDE3LjgsIDEyLjM4KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTUuNDIsIDE1LjkyKSwgQ0dQb2ludE1ha2UoMTYuMjcsIDEyLjg5KSwgQ0dQb2ludE1ha2UoMTUuMjYsIDE0LjM4KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTcuNTQsIDE4Ljc4KSwgQ0dQb2ludE1ha2UoMTUuNTQsIDE3LjE2KSwgQ0dQb2ludE1ha2UoMTYuMzQsIDE4LjI1KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTguOTUsIDE5LjA0KSwgQ0dQb2ludE1ha2UoMTguMDIsIDE4Ljk5KSwgQ0dQb2ludE1ha2UoMTguMjQsIDE5LjA0KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjAuMzYsIDE4Ljc4KSwgQ0dQb2ludE1ha2UoMTkuNjUsIDE5LjA0KSwgQ0dQb2ludE1ha2UoMTkuODgsIDE4Ljk5KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjAuOTksIDEyLjgzKSwgQ0dQb2ludE1ha2UoMjIuOSwgMTcuNjQpLCBDR1BvaW50TWFrZSgyMy4yNSwgMTQuMzMpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNy44LCAxMi4zOCksIENHUG9pbnRNYWtlKDIwLjA1LCAxMi4yMSksIENHUG9pbnRNYWtlKDE4Ljg0LCAxMi4wMykpO1xuICAgIGJlemllcjJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllcjJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyMlBhdGguZmlsbCgpO1xuICAgIHZhciBiZXppZXIzUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyM1BhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzMuNzUsIDE3LjQ5KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjkuODcsIDIyLjI0KSwgQ0dQb2ludE1ha2UoMzMuNjMsIDE3LjU2KSwgQ0dQb2ludE1ha2UoMzEuODgsIDE5LjcpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNS45NCwgMjcuMDEpLCBDR1BvaW50TWFrZSgyNy41OCwgMjUuMTUpLCBDR1BvaW50TWFrZSgyNi4xMiwgMjYuOTIpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMy4zNSwgMjQuODMpLCBDR1BvaW50TWFrZSgyNS4zNiwgMjcuMjkpLCBDR1BvaW50TWFrZSgyNS4xOSwgMjcuMTMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMS41MiwgMjIuNjEpLCBDR1BvaW50TWFrZSgyMi40MiwgMjMuNjYpLCBDR1BvaW50TWFrZSgyMS42LCAyMi42NikpO1xuICAgIGJlemllcjNQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIwLjQyLCAyMi43OCksIENHUG9pbnRNYWtlKDIxLjIyLCAyMi40MyksIENHUG9pbnRNYWtlKDIwLjY4LCAyMi41MikpO1xuICAgIGJlemllcjNQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEyLjYyLCAzMy41NCksIENHUG9pbnRNYWtlKDIwLjIyLCAyMi45OSksIENHUG9pbnRNYWtlKDE1LjAxLCAzMC4xNykpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDEyLjI5LCAzMy45OSkpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI4LjA4LCAzMy45OSkpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQzLjg1LCAzMy45OSkpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQzLjg1LCAzMS41OCkpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQzLjg0LCAyOS4xNykpO1xuICAgIGJlemllcjNQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDM5LjQyLCAyMy41MykpO1xuICAgIGJlemllcjNQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDM0LjcxLCAxNy42MiksIENHUG9pbnRNYWtlKDM3LCAyMC40MiksIENHUG9pbnRNYWtlKDM0Ljg4LCAxNy43OCkpO1xuICAgIGJlemllcjNQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMzLjc1LCAxNy40OSksIENHUG9pbnRNYWtlKDM0LjM5LCAxNy4zNSksIENHUG9pbnRNYWtlKDM0LjExLCAxNy4zKSk7XG4gICAgYmV6aWVyM1BhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyM1BhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXIzUGF0aC5maWxsKCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgaW1hZ2UgYnV0dG9uIHdpdGggaGVscCBvZiBVSUJ1dHRvbiB3aWRnZXRcbiAqIGFuZCBzZXRzIGl0J3MgYXR0cmlidXRlcyBsaWtlIGNvbG9yLCBzdGF0ZSwgc2l6ZSBhbmQgYWN0aW9uIGV2ZW50LlxuICogXG4gKiBAcmV0dXJucyBSZXR1cm5zIGJ1dHRvbiBvYmplY3RcbiAqL1xudmFyIGNyZWF0ZUltYWdlQnV0dG9uID0gZnVuY3Rpb24gKHRhcmdldDogYW55LCBmcmFtZTogYW55LCBsYWJlbDogYW55LCBldmVudE5hbWU6IGFueSwgYWxpZ246IGFueSwgaW1nOiBhbnksIGltZ1NlbGVjdGVkOiBhbnlcbik6IGFueSB7XG4gICAgdmFyIGJ0bjtcbiAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgYnRuID0gVUlCdXR0b24uYWxsb2MoKS5pbml0V2l0aEZyYW1lKGZyYW1lKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGJ0biA9IFVJQnV0dG9uLmFsbG9jKCkuaW5pdCgpO1xuICAgIH1cbiAgICBpZiAobGFiZWwpIHtcbiAgICAgICAgYnRuLnNldFRpdGxlRm9yU3RhdGUobGFiZWwsIDApO1xuICAgICAgICBidG4uc2V0VGl0bGVDb2xvckZvclN0YXRlKG5ldyBDb2xvcignI2ZmZicpLmlvcywgMCk7XG4gICAgICAgIGJ0bi50aXRsZUxhYmVsLmZvbnQgPSBVSUZvbnQuc3lzdGVtRm9udE9mU2l6ZSgxOSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGltZykge1xuICAgICAgICBidG4uc2V0SW1hZ2VGb3JTdGF0ZShpbWcsIDApO1xuICAgICAgICBpZiAoaW1nU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgIGJ0bi5zZXRJbWFnZUZvclN0YXRlKGltZywgMSk7XG4gICAgICAgICAgICBidG4uc2V0SW1hZ2VGb3JTdGF0ZShpbWcsIDQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGlnbikge1xuICAgICAgICBidG4uY29udGVudEhvcml6b250YWxBbGlnbm1lbnQgPVxuICAgICAgICAgICAgYWxpZ24gPT0gJ3JpZ2h0JyA/IDIgOiAxO1xuICAgIH1cbiAgICBpZiAoZXZlbnROYW1lKSB7XG4gICAgICAgIGJ0bi5hZGRUYXJnZXRBY3Rpb25Gb3JDb250cm9sRXZlbnRzKHRhcmdldCwgZXZlbnROYW1lLCA2NCk7XG4gICAgfVxuICAgIHJldHVybiBidG47XG59O1xuIl19