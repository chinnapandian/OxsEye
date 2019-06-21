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
var angular_1 = require("nativescript-i18n/angular");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var color_1 = require("tns-core-modules/color");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
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
     * @param logger Oxs Eye logger instance
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
        this.isCameraVisible = true;
        this.createButtons();
    };
    /**
     * Method to create buttons (take picutre, gallery, flash and switchCamera) on camera view.
     */
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
        // TEST THE ICONS SHOWING/HIDING
        // this.cam.showCaptureIcon = true;
        // this.cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    /**
     * Creates take picture button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    CaptureComponent.prototype.createTakePictureButton = function (width, height) {
        var _this = this;
        var picOutline = createImageButton(_this, CGRectMake(width - 69, height - 80, 50, 50), null, null, null, createIcon('picOutline', null, null), null);
        picOutline.transform = CGAffineTransformMakeScale(1.5, 1.5);
        this.cam.ios.addSubview(picOutline);
        var takePicBtn = createImageButton(_this, CGRectMake(width - 70, height - 80.7, 50, 50), null, 'snapPicture', null, createIcon('takePic', null, null), null);
        this.cam.ios.addSubview(takePicBtn);
        this.cam._swifty._owner.get().confirmPhotos = false;
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
        this.cam._swifty.chooseFromLibrary = goImageGallery;
        this.galleryBtn = createImageButton(_this, CGRectMake(20, height - 80, 50, 50), null, 'openGallery', null, createIcon('gallery', null, null), null);
        this.galleryBtn.transform = CGAffineTransformMakeScale(0.75, 0.75);
        this.cam.ios.addSubview(_this.galleryBtn);
    };
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
    CaptureComponent.prototype.imagesGalleryEvent = function (args) {
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
     * Creates thumbnail image for the captured transformed image and sets it in gallery button.
     *
     * @param imgURI Transformed image file path
     */
    CaptureComponent.prototype.createThumbNailImage = function (imgURI) {
        try {
            var thumbnailImagePath = OpenCVWrapper.createThumbnailImage(imgURI);
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
        if (capturedData.data) {
            this.imageSource = new image_source_1.ImageSource();
            this.imageSource.fromAsset(capturedData.data).then(function (imgSrc) {
                if (imgSrc) {
                    _this.zone.run(function () {
                        var folder = fs.path.join(fs.knownFolders.documents().path);
                        var fileName = 'capturedimages/IMG_' + Date.now() + '.jpg';
                        var pathDest = file_system_1.path.join(folder, fileName);
                        var saved = imgSrc.saveToFile(pathDest, 'jpg');
                        if (saved) {
                            // UIImageWriteToSavedPhotosAlbum(capturedData.data.nativeImage, null, null, null);
                            // imgSrc.saveToAlbum(this.imageSource, false, false, function () {
                            //     alert('The photo was saved!');
                            // });
                            console.log('Org File Path: ' + pathDest);
                            _this.imgURI = '';
                            _this.imgURI = pathDest;
                            _this.imageSource = _this.imgURI;
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
/**
 * Function to trigger image gallery event method to go to image gallery page.
 *
 */
var goImageGallery = function () {
    var _this = this;
    return new Promise(function (resolve, reject) {
        _this._owner.get().sendEvent('imagesGalleryEvent');
        resolve();
    });
};
/** Overide method to display flash button on camera view.
 * This is actually same as it's parent except the button location (x,y)
 */
var flashBtnHandler = function () {
    if (this._flashBtn) {
        this._flashBtn.removeFromSuperview();
    }
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
            align === 'right' ? 2 : 1;
    }
    if (eventName) {
        btn.addTargetActionForControlEvents(target, eventName, 64);
    }
    return btn;
};
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2FwdHVyZS5jb21wb25lbnQuaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTRFO0FBQzVFLDBDQUF5QztBQUV6QyxrRUFBMkY7QUFFM0YsOERBQXNFO0FBRXRFLDREQUEwRTtBQUUxRSxpRkFBeUU7QUFDekUsK0RBQTJEO0FBRTNELHFEQUE4QztBQUM5Qyx1REFBc0Q7QUFFdEQsZ0RBQStDO0FBRy9DLDBDQUE0QztBQUM1QyxpREFBbUQ7QUFJbkQ7O0dBRUc7QUFRSCxJQUFhLGdCQUFnQjtJQTRDekI7Ozs7Ozs7OztPQVNHO0lBQ0gsMEJBQ1ksSUFBWSxFQUNaLFlBQWdDLEVBQ2hDLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2QsY0FBOEI7UUFDdEMsaURBQWlEO1FBQ3pDLE1BQW9CO1FBTnBCLFNBQUksR0FBSixJQUFJLENBQVE7UUFDWixpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsbUJBQWMsR0FBZCxjQUFjLENBQWdCO1FBRTlCLFdBQU0sR0FBTixNQUFNLENBQWM7UUE5Q2hDLDRCQUE0QjtRQUNwQixVQUFLLEdBQVEsSUFBSSxDQUFDO1FBYzFCLCtCQUErQjtRQUN4QixnQkFBVyxHQUFnQixJQUFJLDBCQUFXLEVBQUUsQ0FBQztRQVVwRCx3Q0FBd0M7UUFDaEMsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFxQnpCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxXQUFDLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsbUNBQVEsR0FBUjtRQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixJQUFJLENB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SyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNqRCxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNoSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDMUIsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEIsQ0FBQyxDQUFDO0FBQ0Y7Ozs7R0FJRztBQUNILElBQU0sWUFBWSxHQUFHLFVBQUMsS0FBVTtJQUM1QixJQUFNLFNBQVMsR0FBRyxJQUFJLGFBQUssQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2pELElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QyxVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNoRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNwSSxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM3SCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM1SCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDMUIsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDbEIsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzlDLFdBQVcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZJLFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RELFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFdBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2xJLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN4QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUNGOzs7O0dBSUc7QUFDSCxJQUFNLFVBQVUsR0FBSSxVQUFDLEtBQVU7SUFDM0IsSUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNqRCxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDOUgsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0gsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEksVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2hELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ2pJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9ILFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hJLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM5QyxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuRCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNyRCxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNyRCxXQUFXLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0RCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMzQixXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDeEIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNuQixJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDOUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDcEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDM0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBQ0Y7Ozs7R0FJRztBQUNILElBQU0sY0FBYyxHQUFHLFVBQUMsS0FBVTtJQUM5QixJQUFNLFNBQVMsR0FBRyxJQUFJLGFBQUssQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDO0lBQ2pELElBQU0sVUFBVSxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM3QyxVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqRCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNqSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNqSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM1SCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvSCxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNySSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoSSxVQUFVLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25JLFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQy9ILFVBQVUsQ0FBQyx5Q0FBeUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pJLFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3RCLENBQUMsQ0FBQztBQUNGOzs7O0dBSUc7QUFFSCxJQUFNLFVBQVUsR0FBRyxVQUFDLEtBQUs7SUFDckIsSUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNqRCxJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDOUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDaEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0gsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3JJLFdBQVcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLFdBQVcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN4QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3ZCLENBQUMsQ0FBQztBQUNGOzs7O0dBSUc7QUFDSCxJQUFNLFdBQVcsR0FBSSxVQUFDLEtBQUs7SUFDdkIsSUFBTSxTQUFTLEdBQUcsSUFBSSxhQUFLLENBQUMsS0FBSyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNqRCxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDN0MsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDL0gsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDM0gsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDckksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDN0gsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkksVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDakQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5SCxVQUFVLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkIsVUFBVSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDaEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUgsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsVUFBVSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbkQsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3ZCLFVBQVUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3BELFVBQVUsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUN2QixTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEIsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xCLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUM5QyxXQUFXLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNsRCxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN2SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxXQUFXLENBQUMseUNBQXlDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN0SSxXQUFXLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUMzQixXQUFXLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDeEIsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ3BCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNuQixJQUFNLFdBQVcsR0FBRyxZQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDOUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdkksV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEQsV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDcEksV0FBVyxDQUFDLHlDQUF5QyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEksV0FBVyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDM0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxDQUFDO0lBQ3hCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNwQixXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdkIsQ0FBQyxDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDSCxJQUFNLGlCQUFpQixHQUFHLFVBQUMsTUFBVyxFQUFFLEtBQVUsRUFBRSxLQUFVLEVBQUUsU0FBYyxFQUFFLEtBQVUsRUFBRSxHQUFRLEVBQUUsV0FBZ0I7SUFDbEgsSUFBSSxHQUFHLENBQUM7SUFDUixFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ1IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osR0FBRyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsQyxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0IsR0FBRyxDQUFDLHFCQUFxQixDQUFDLElBQUksYUFBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3QixFQUFFLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ2QsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3QixHQUFHLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLENBQUM7SUFDTCxDQUFDO0lBQ0QsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLEdBQUcsQ0FBQywwQkFBMEI7WUFDMUIsS0FBSyxLQUFLLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ1osR0FBRyxDQUFDLCtCQUErQixDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLENBQUM7QUFDZixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE5nWm9uZSwgT25Jbml0LCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgQ2FtZXJhUGx1cyB9IGZyb20gJ0Buc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1cyc7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ09wdGlvbnMsIE1vZGFsRGlhbG9nU2VydmljZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQgeyBJbWFnZUFzc2V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1hc3NldCc7XG5pbXBvcnQgeyBmcm9tRmlsZSwgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5cbmltcG9ydCB7IEZvbGRlciwga25vd25Gb2xkZXJzLCBwYXRoIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG5pbXBvcnQgeyBDb2xvciB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvY29sb3InO1xuXG5pbXBvcnQgKiBhcyBvcGVuY3YgZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1wbHVnaW4nO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcblxuLyoqXG4gKiBDYXB0dXJlIGNvbXBvbmVudCBjbGFzcywgd2hpY2ggaXMgYmVpbmcgdXNlZCB0byBjYXB0dXJlIGltYWdlIGZyb20gY2FtZXJhLlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWNhcHR1cmUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vY2FwdHVyZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhcHR1cmUuY29tcG9uZW50Lmh0bWwnLFxufSlcblxuZXhwb3J0IGNsYXNzIENhcHR1cmVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIC8qKiBDYW1lcmEgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHJpdmF0ZSBjYW06IENhbWVyYVBsdXM7XG4gICAgLyoqIEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeUJ0bjogYW55O1xuICAgIC8qKiBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY0J0bjogYW55O1xuICAgIC8qKiBBdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c0J0bjogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGdhbGxlcnlQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgVGFrZSBwaWN0dXJlIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIHRha2VQaWNQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgYXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBhdXRvZm9jdXNQYXJhbXM6IGFueTtcbiAgICAvKiogRW1wdHkgc3RyaW5nIHZhcmlhYmxlICovXG4gICAgcHJpdmF0ZSBlbXB0eTogYW55ID0gbnVsbDtcbiAgICAvKiogTG9jYWxpemF0aW9uICovXG4gICAgcHJpdmF0ZSBsb2NhbGU6IGFueTtcbiAgICAvKiogTGFibGUgZm9yIHNhdmUgYnV0dG9uICovXG4gICAgcHJpdmF0ZSBzYXZlQnRuTGFibGU6IGFueTtcbiAgICAvKiogTGFibGUgZm9yIG1hbnVhbCBidXR0b24gKi9cbiAgICBwcml2YXRlIG1hbnVhbEJ0bkxhYmxlOiBhbnk7XG4gICAgLyoqIExhYmxlIGZvciBwZXJmb3JtIGJ1dHRvbiAqL1xuICAgIHByaXZhdGUgcGVyZm9ybUJ0bkxhYmxlOiBhbnk7XG4gICAgLyoqIExhYmxlIGZvciByZXRha2UgYnV0dG9uICovXG4gICAgcHJpdmF0ZSByZXRha2VCdG5MYWJsZTogYW55O1xuXG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gY2hlY2sgdGhlIGNhbWVyYSBpcyB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDYW1lcmFWaXNpYmxlOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHNvdXJjZSAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogSW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAvKiogT3JpZ2luYWwgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZU9yZzogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBVUkkgKi9cbiAgICBwdWJsaWMgaW1nVVJJOiBhbnk7XG4gICAgLyoqIE9wZW5DViBpbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwdWJsaWMgb3BlbmN2SW5zdGFuY2U6IGFueTtcblxuICAgIC8qKiBGbGFzaCBidXR0b24gdmFyaWFibGUgKi9cbiAgICBwcml2YXRlIGZsYXNoQnRuOiBhbnk7XG4gICAgLyoqIEluZGljYXRlcyB3aGV0aGVyIGZsYXNoIGlzIG9uL29mZiAqL1xuICAgIHByaXZhdGUgZmxhc2hFbmFibGVkID0gZmFsc2U7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgQ2FwdHVyZUNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB6b25lIEFuZ3VsYXIgem9uZSB0byBydW4gYSB0YXNrIGFzeW5jaHJvbm91c2x5LlxuICAgICAqIEBwYXJhbSBtb2RhbFNlcnZpY2UgU2VydmljZSBtb2RhbFxuICAgICAqIEBwYXJhbSB2aWV3Q29udGFpbmVyUmVmIFZpZXcgY29udGFpbmVyIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlclxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5kaWNhdGlvblxuICAgICAqIEBwYXJhbSBsb2dnZXIgT3hzIEV5ZSBsb2dnZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgbW9kYWxTZXJ2aWNlOiBNb2RhbERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIC8vIHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICApIHtcbiAgICAgICAgdGhpcy5sb2NhbGUgPSBuZXcgTCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXphdGlvbiBtZXRob2QgaW5pdGlhbGl6ZXMgT3BlbkNWIG1vZHVsZSBhbmQgYnV0dG9ucyBsaWtlXG4gICAgICogdGFrZVBpY3R1cmUsIGdhbGxlcnkgYW5kIGF1dG9Gb2N1cyBidXR0b25zIGluIGNhbWVyYSB2aWV3LlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIE9wZW5DVi4uLicpO1xuICAgICAgICB0aGlzLmlzQ2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuY3JlYXRlQnV0dG9ucygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gY3JlYXRlIGJ1dHRvbnMgKHRha2UgcGljdXRyZSwgZ2FsbGVyeSwgZmxhc2ggYW5kIHN3aXRjaENhbWVyYSkgb24gY2FtZXJhIHZpZXcuXG4gICAgICovXG4gICAgY3JlYXRlQnV0dG9ucygpIHtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLmNhbS53aWR0aDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jYW0uaGVpZ2h0O1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbihoZWlnaHQpO1xuICAgICAgICB0aGlzLmNyZWF0ZUZsYXNoQnV0dG9uKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB0aGlzLmNyZWF0ZVN3aXRjaENhbWVyYUJ1dHRvbih3aWR0aCwgaGVpZ2h0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgaXMgY2FsbGVkIHdoZW4gY2FtZXJhIGlzIGxvYWRlZCwgd2hlcmUgYWxsIHRoZSBuZWNjZXNzYXJ5IHRoaW5ncyBsaWtlXG4gICAgICogZGlzcGxheWluZyBidXR0b25zKHRha2VQaWN0dXJlLCBnYWxsZXJ5LCBmbGFzaCwgY2FtZXJhICYgYXV0b0ZvY3VzKSBvbiBjYW1lcmEgdmlld1xuICAgICAqIGFyZSB0YWtlbiBjYXJlIGFuZCBhbHNvIGluaXRpYWxpemVzIGNhbWVyYSBpbnN0YW5jZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIENhbWVyYVBsdXMgaW5zdGFuY2UgcmVmZXJyZW5jZS5cbiAgICAgKi9cbiAgICBjYW1Mb2FkZWQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1Mb2FkZWQuLicpO1xuXG4gICAgICAgIHRoaXMuc2F2ZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzYXZlJyk7XG4gICAgICAgIHRoaXMubWFudWFsQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ21hbnVhbCcpO1xuICAgICAgICB0aGlzLnJldGFrZUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdyZXRha2UnKTtcbiAgICAgICAgdGhpcy5wZXJmb3JtQnRuTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3BlcmZvcm0nKTtcblxuICAgICAgICB0aGlzLmNhbSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuY2FtLmdldEZsYXNoTW9kZSgpO1xuXG4gICAgICAgIC8vIFRvIHJlZnJlc2ggY2FtZXJhIHZpZXcgYWZ0ZXIgbmF2aWdhdGVkIGZyb20gaW1hZ2UgZ2FsbGVyeS5cbiAgICAgICAgdGhpcy5jYW0uX3N3aWZ0eS52aWV3RGlkQXBwZWFyKHRydWUpO1xuXG4gICAgICAgIC8vIFR1cm4gZmxhc2ggb24gYXQgc3RhcnR1cFxuICAgICAgICBpZiAoZmxhc2hNb2RlID09PSAnb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRFU1QgVEhFIElDT05TIFNIT1dJTkcvSElESU5HXG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dDYXB0dXJlSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93VG9nZ2xlSWNvbiA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHRha2UgcGljdHVyZSBidXR0b24uIEFjdHVhbGx5IGl0IGNyZWF0ZXMgaW1hZ2UgYnV0dG9uIGFuZCBzZXR0aW5nXG4gICAgICogaXQncyBwcm9wZXJ0aWVzIGxpa2UgaW1hZ2UgaWNvbiwgc2hhcGUgYW5kIGNvbG9yIGFsb25nIHdpdGggY2xpY2sgZXZlbnQgbGlzdGVuZXIgaW4gaXQuXG4gICAgICovXG4gICAgY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24od2lkdGg6IGFueSwgaGVpZ2h0OiBhbnkpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICBjb25zdCBwaWNPdXRsaW5lID0gY3JlYXRlSW1hZ2VCdXR0b24oX3RoaXMsIENHUmVjdE1ha2Uod2lkdGggLSA2OSwgaGVpZ2h0IC0gODAsIDUwLCA1MCksIG51bGxcbiAgICAgICAgICAgICwgbnVsbCwgbnVsbCwgY3JlYXRlSWNvbigncGljT3V0bGluZScsIG51bGwsIG51bGwpLCBudWxsKTtcbiAgICAgICAgcGljT3V0bGluZS50cmFuc2Zvcm0gPSBDR0FmZmluZVRyYW5zZm9ybU1ha2VTY2FsZSgxLjUsIDEuNSk7XG4gICAgICAgIHRoaXMuY2FtLmlvcy5hZGRTdWJ2aWV3KHBpY091dGxpbmUpO1xuICAgICAgICBjb25zdCB0YWtlUGljQnRuID0gY3JlYXRlSW1hZ2VCdXR0b24oX3RoaXMsIENHUmVjdE1ha2Uod2lkdGggLSA3MCwgaGVpZ2h0IC0gODAuNywgNTAsIDUwKSwgbnVsbCxcbiAgICAgICAgICAgICdzbmFwUGljdHVyZScsIG51bGwsIGNyZWF0ZUljb24oJ3Rha2VQaWMnLCBudWxsLCBudWxsKSwgbnVsbCk7XG4gICAgICAgIHRoaXMuY2FtLmlvcy5hZGRTdWJ2aWV3KHRha2VQaWNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5fc3dpZnR5Ll9vd25lci5nZXQoKS5jb25maXJtUGhvdG9zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBmbGFzaCBidXR0b24gaW4gdGhlIGNhbWVyYSB2aWV3XG4gICAgICpcbiAgICAgKiBAcGFyYW0gd2lkdGggd2lkdGggb2YgdGhlIGNhbWVyYSB2aWV3XG4gICAgICovXG4gICAgY3JlYXRlRmxhc2hCdXR0b24od2lkdGg6IGFueSwgaGVpZ2h0OiBhbnkpIHtcbiAgICAgICAgdGhpcy5jYW0uX3N3aWZ0eS5fZmxhc2hCdG5IYW5kbGVyID0gZmxhc2hCdG5IYW5kbGVyO1xuICAgICAgICB0aGlzLmNhbS5fc3dpZnR5Ll9mbGFzaEJ0bkhhbmRsZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIHN3aXRjaCBjYW1lcmEgYnV0dG9uIGluIHRoZSBjYW1lcmEgdmlld1xuICAgICAqXG4gICAgICogQHBhcmFtIHdpZHRoIHdpZHRoIG9mIHRoZSBjYW1lcmEgdmlld1xuICAgICAqL1xuICAgIGNyZWF0ZVN3aXRjaENhbWVyYUJ1dHRvbih3aWR0aDogYW55LCBoZWlnaHQ6IGFueSkge1xuICAgICAgICBjb25zdCBzd2l0Y2hDYW1lcmFCdG4gPSBjcmVhdGVJbWFnZUJ1dHRvbih0aGlzLCBDR1JlY3RNYWtlKHdpZHRoIC0gODUsIDgwLCAxMDAsIDUwKSwgbnVsbCxcbiAgICAgICAgICAgICdzd2l0Y2hDYW0nLCBudWxsLCBjcmVhdGVJY29uKCd0b2dnbGUnLCBDR1NpemVNYWtlKDY1LCA1MCksIG51bGwpLCBudWxsKTtcbiAgICAgICAgc3dpdGNoQ2FtZXJhQnRuLnRyYW5zZm9ybSA9IENHQWZmaW5lVHJhbnNmb3JtTWFrZVNjYWxlKDAuNzUsIDAuNzUpO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFN1YnZpZXcoc3dpdGNoQ2FtZXJhQnRuKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGltYWdlIGdhbGxlcnkgYnV0dG9uLiBBY3R1YWxseSBpdCBjcmVhdGVzIGltYWdlIGJ1dHRvbiBhbmQgc2V0dGluZ1xuICAgICAqIGl0J3MgcHJvcGVydGllcyBsaWtlIGltYWdlIGljb24sIHNoYXBlIGFuZCBjb2xvciBhbG9uZyB3aXRoIGNsaWNrIGV2ZW50IGxpc3RlbmVyIGluIGl0LlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbihoZWlnaHQ6IGFueSkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuY2FtLl9zd2lmdHkuY2hvb3NlRnJvbUxpYnJhcnkgPSBnb0ltYWdlR2FsbGVyeTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuID0gY3JlYXRlSW1hZ2VCdXR0b24oX3RoaXMsIENHUmVjdE1ha2UoMjAsIGhlaWdodCAtIDgwLCA1MCwgNTApLCBudWxsLFxuICAgICAgICAgICAgJ29wZW5HYWxsZXJ5JywgbnVsbCwgY3JlYXRlSWNvbignZ2FsbGVyeScsIG51bGwsIG51bGwpLCBudWxsKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnRyYW5zZm9ybSA9IENHQWZmaW5lVHJhbnNmb3JtTWFrZVNjYWxlKDAuNzUsIDAuNzUpO1xuXG4gICAgICAgIHRoaXMuY2FtLmlvcy5hZGRTdWJ2aWV3KF90aGlzLmdhbGxlcnlCdG4pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFBob3RvIGNhcHR1cmVkIGV2ZW50IGZpcmVzIHdoZW4gYSBwaWN0dXJlIGlzIHRha2VuIGZyb20gY2FtZXJhLCB3aGljaCBhY3R1YWxseVxuICAgICAqIGxvYWRzIHRoZSBjYXB0dXJlZCBpbWFnZSBmcm9tIEltYWdlQXNzZXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2FwdHVyZWREYXRhIEltYWdlIGNhcHR1cmVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwaG90b0NhcHR1cmVkRXZlbnQoY2FwdHVyZWREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BIT1RPIENBUFRVUkVEIEVWRU5UISEhJyk7XG4gICAgICAgIC8vIHRoaXMub3BlbmN2SW5zdGFuY2UgPSBvcGVuY3YuaW5pdE9wZW5DVigpO1xuICAgICAgICBjb25zb2xlLmxvZyhPcGVuQ1ZXcmFwcGVyLm9wZW5DVlZlcnNpb25TdHJpbmcoKSk7XG4gICAgICAgIC8vIE9wZW5DVldyYXBwZXIucGVyZm9ybVRyYW5zZm9ybWF0aW9uKCk7XG4gICAgICAgIC8vIGxldCBsY3YgPSAgY3Y7XG4gICAgICAgIC8vIGxldCBvcGVuY3YxID0gbmV3IE9wZW5DdkNhbWVyYVByZXZpZXcoKTtcbiAgICAgICAgLy8gb3BlbmN2MS5pbml0TmF0aXZlVmlldygpO1xuICAgICAgICAvLyBvcGVuY3YxLm9uTG9hZGVkKCk7XG4gICAgICAgIC8vIG9wZW5jdjEuc3RhcnRDYW1lcmEoKTtcbiAgICAgICAgLy8gb3BlbmN2MS5pbml0TmF0aXZlVmlldygpO1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShjYXB0dXJlZERhdGEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGJlZW4gY2FsbGVkIHdoZW4gdG9nZ2xlIHRoZSBjYW1lcmEgYnV0dG9uLlxuICAgICAqIEBwYXJhbSBhcmdzIENhbWVyYSB0b2dnbGUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIHRvZ2dsZUNhbWVyYUV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnY2FtZXJhIHRvZ2dsZWQnKTtcbiAgICAgICAgLy8gY29uc3Qgd2lkdGggPSB0aGlzLmNhbS53aWR0aDtcbiAgICAgICAgLy8gY29uc3QgaGVpZ2h0ID0gdGhpcy5jYW0uaGVpZ2h0O1xuICAgICAgICAvLyB0aGlzLmNyZWF0ZUZsYXNoQnV0dG9uKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAvLyB0aGlzLmNhbS5fc3dpZnR5Ll9vd25lci5nZXQoKS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBpcyBjYWxsZWQgd2hlbiB0b2dnbGUgdGhlIGZsYXNoIGljb24gb24gY2FtZXJhLiBUaGlzIGFjdHVhbGx5XG4gICAgICogZmxhc2ggb2ZmIHdoZW4gaXQgYWxyZWFkeSBpcyBvbiBvciB2aWNlLXZlcnNhLlxuICAgICAqL1xuICAgIHRvZ2dsZUZsYXNoT25DYW0oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGRpc3BsYXkgZmxhc2ggaWNvbiBiYXNlZCBvbiBpdCdzIHByb3BlcnR5IHZhbHVlIHRydWUvZmFsc2UuXG4gICAgICovXG4gICAgdG9nZ2xlU2hvd2luZ0ZsYXNoSWNvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuY2FtLnNob3dGbGFzaEljb259YCk7XG4gICAgICAgIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSAhdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHN3aXRjaCBmcm9udC9iYWNrIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVUaGVDYW1lcmEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUNhbWVyYSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRha2VzIHBpY3R1cmUgZnJvbSBjYW1lcmEgd2hlbiB1c2VyIHByZXNzIHRoZSB0YWtlUGljdHVyZSBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gICAgICogVGhlbiBpdCBzZXRzIHRoZSBjYXB0dXJlZCBpbWFnZSBVUkkgaW50byBpbWFnZVNvdXJjZSB0byBiZSBkaXNwbGF5ZWQgaW4gZnJvbnQtZW5kLlxuICAgICAqXG4gICAgICogQHBhcmFtIHRoaXNQYXJhbSBDb250YWlucyBjYW1lcmFwbHVzIGluc3RhbmNlXG4gICAgICovXG4gICAgdGFrZVBpY0Zyb21DYW0odGhpc1BhcmFtOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpc1BhcmFtLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpc1BhcmFtLmNhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJdCB0YWtlcyB0byBpbWFnZSBnYWxsZXJ5IHZpZXcgd2hlbiB1c2VyIGNsaWNrcyBvbiBnYWxsZXJ5IGJ1dHRvbiBvbiBjYW1lcmEgdmlldy5cbiAgICAgKi9cbiAgICBpbWFnZXNHYWxsZXJ5RXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNob3dzIHRoZSBjYXB0dXJlZCBwaWN0dXJlIGRpYWxvZyB3aW5kb3cgYWZ0ZXIgdGFraW5nIHBpY3R1cmUuIFRoaXMgaXMgbW9kYWwgd2luZG93IGFsb25nIHdpdGhcbiAgICAgKiByZXVpcmVkIG9wdGlvbnMgbGlrZSBjYXB0dXJlIGltYWdlIFVSSSwgdHJhbnNmb3JtZWQgaW1hZ2UgVVJJLCByZWN0YW5nbGUgcG9pbnRzIGFuZCBldGMuXG4gICAgICogVGhpcyBhbHNvIHRha2VzIGNhcmUgb2YgZGVsZXRpbmcgdGhlIGNhcHR1cmVkIGltYWdlIHdoZW4gdXNlciB3YW50cyB0byByZXRha2UgKHVzaW5nIFJldGFrZSBidXR0b24pXG4gICAgICogcGljdHVyZSBhbmQsIGNyZWF0ZXMgdGh1bWJuYWlsIGltYWdlIHdoZW4gdXNlciB3YW50cyB0byBzYXZlIHRoZSBjYXB0dXJlZCBpbWFnZSBhbmRcbiAgICAgKiBzZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBpbiBnYWxsZXJ5IGljb24gYnV0dG9uIGluIGNhbWVyYSB2aWV3LlxuICAgICAqXG4gICAgICogQHBhcmFtIGZ1bGxTY3JlZW4gT3B0aW9uIHRvIHNob3cgZnVsbHNjcmVlbiBkaWFsb2cgb3Igbm90XG4gICAgICogQHBhcmFtIGZpbGVQYXRoT3JnIENhcHR1cmVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIHJlY1BvaW50c1N0ciBSZWN0YW5nbGUgcG9pbnRzIGluIHN0cmluZ1xuICAgICAqL1xuICAgIHNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2coZnVsbFNjcmVlbjogYm9vbGVhbiwgZmlsZVBhdGhPcmc6IHN0cmluZywgaW1nVVJJOiBzdHJpbmcsIHJlY1BvaW50c1N0cikge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBNb2RhbERpYWxvZ09wdGlvbnMgPSB7XG4gICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2U6IGltZ1VSSSxcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZU9yZzogZmlsZVBhdGhPcmcsXG4gICAgICAgICAgICAgICAgaXNBdXRvQ29ycmVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZWN0YW5nbGVQb2ludHM6IHJlY1BvaW50c1N0cixcbiAgICAgICAgICAgICAgICBzYXZlQnRuTGFibGU6IHRoaXMuc2F2ZUJ0bkxhYmxlLFxuICAgICAgICAgICAgICAgIG1hbnVhbEJ0bkxhYmxlOiB0aGlzLm1hbnVhbEJ0bkxhYmxlLFxuICAgICAgICAgICAgICAgIHJldGFrZUJ0bkxhYmxlOiB0aGlzLnJldGFrZUJ0bkxhYmxlLFxuICAgICAgICAgICAgICAgIHBlcmZvcm1CdG5MYWJsZTogdGhpcy5wZXJmb3JtQnRuTGFibGUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbHNjcmVlbjogZnVsbFNjcmVlbixcbiAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWY6IHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgIHRoaXMubW9kYWxTZXJ2aWNlLnNob3dNb2RhbChEaWFsb2dDb250ZW50LCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGRpYWxvZ1Jlc3VsdDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRpYWxvZ1Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgZGlsb2dSZXN1bHRUZW1wID0gZGlhbG9nUmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGlhbG9nUmVzdWx0LmluZGV4T2YoJ19URU1QJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0Zm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRpbG9nUmVzdWx0VGVtcCA9IGRpbG9nUmVzdWx0VGVtcC5yZXBsYWNlKCdfVEVNUCcgKyBpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0fVxuICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtZWRJbWFnZShkaWFsb2dSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRodW1iTmFpbEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBkaWFsb2dSZXN1bHQsICdBZGQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nRmlsZU9yZzogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoZmlsZVBhdGhPcmcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nRmlsZU9yZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVPcmcucmVtb3ZlU3luYygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVVJJKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdVUklGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nVVJJRmlsZS5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2RvIDogdG8gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVXJpQ29udG91clBhdGggPSBpbWdVUkkuc3Vic3RyaW5nKDAsIGltZ1VSSS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUNvbnRvdXJGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVcmlDb250b3VyUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nVVJJQ29udG91ckZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklDb250b3VyRmlsZS5yZW1vdmVTeW5jKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZG8gLSBFbmRcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGltZ1VSSSwgJ1JlbW92ZScpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0NvdWxkIG5vdCBkZWxldGUgdGhlIGNhcHR1cmUgaW1hZ2UuJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaW4gZ2FsbGVyeSBpbWFnZSBidXR0b24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1lZEltYWdlKGltZ1VSSVBhcmFtOiBhbnkpIHtcbiAgICAgICAgaWYgKGltZ1VSSVBhcmFtKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICAvLyBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWdVUkkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2V0dGluZyBpbWFnZSBpbiBwcmV2aWV3IGFyZWEnICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyB0aHVtYm5haWwgaW1hZ2UgZm9yIHRoZSBjYXB0dXJlZCB0cmFuc2Zvcm1lZCBpbWFnZSBhbmQgc2V0cyBpdCBpbiBnYWxsZXJ5IGJ1dHRvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVUaHVtYk5haWxJbWFnZShpbWdVUkk6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0aHVtYm5haWxJbWFnZVBhdGggPSBPcGVuQ1ZXcmFwcGVyLmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICBjb25zdCBidXR0b25JbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZCh0aHVtYm5haWxJbWFnZVBhdGgpO1xuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlRm9yU3RhdGUoYnV0dG9uSW1hZ2UsIFVJQ29udHJvbFN0YXRlLk5vcm1hbCk7XG4gICAgICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VGb3JTdGF0ZShidXR0b25JbWFnZSwgVUlDb250cm9sU3RhdGUuSGlnaGxpZ2h0ZWQpO1xuICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEltYWdlRm9yU3RhdGUoYnV0dG9uSW1hZ2UsIFVJQ29udHJvbFN0YXRlLlNlbGVjdGVkKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBjcmVhdGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihtb2R1bGUuZmlsZW5hbWUgKyAnOiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgcGVyZm9ybXMgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZSB1c2luZyBPcGVuQ1YgQVBJIGFuZFxuICAgICAqIHJldHVybnMgdGhlIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbG9uZyB3aXRoIHJlY3RhbmdsZSBwb2ludHMgYXMgc3RyaW5nIHdoaWNoIHdpbGwgYmUgdXNlZCB0b1xuICAgICAqIGRyYXcgY2lyY2xlIHBvaW50cy4gQWZ0ZXIgdGhhdCBpdCBzaG93cyB1cCB0aGUgZGlhbG9nIG1vZGFsIHdpbmRvdyB3aXRoIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxldCBwdEltZ1BuZ1VyaSA9ICcnO1xuICAgICAgICAgICAgLy8gbGV0IG9wZW5jdkluc3RhbmNlID0gT3BlbkNWV3JhcHBlci5uZXcoKTtcbiAgICAgICAgICAgIHB0SW1nUG5nVXJpID0gT3BlbkNWV3JhcHBlci5wZXJmb3JtVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RyYW5zZm9ybWVkIEltYWdlIFVSSTogJywgcHRJbWdQbmdVcmkpO1xuXG4gICAgICAgICAgICAvLyBjb25zdCBpbWdVUklUZW1wID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoLCAnJyk7XG4gICAgICAgICAgICB0aGlzLmltZ1VSSSA9IHB0SW1nUG5nVXJpLnN1YnN0cmluZygwLCBwdEltZ1BuZ1VyaS5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHNTdHIgPSBwdEltZ1BuZ1VyaS5zdWJzdHJpbmcocHRJbWdQbmdVcmkuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKHRydWUsIGZpbGVQYXRoLCB0aGlzLmltZ1VSSSwgcmVjdGFuZ2xlUG9pbnRzU3RyKTtcbiAgICAgICAgICAgIC8vIHRoaXMuc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyh0cnVlLCBmaWxlUGF0aCwgcHRJbWdQbmdVcmksICcnKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHBlcmZvcm1pbmcgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gcHJvY2Vzcy4gUGxlYXNlIHJldGFrZSBwaWN0dXJlJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHBlcmZvcm0gcHJlc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gZm9yIHRoZSBjYXB0dXJlZCBpbWFnZVxuICAgICAqIGFuZCBzZXRzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgaW4gdGhpcy5pbWdVUkkgdmFyaWFibGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1hZ2VBc3NldCBJbWFnZUFzc2V0IG9iamVjdCBpbnN0YW5jZSByZWZlcnJlbmNlXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2UoY2FwdHVyZWREYXRhOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgY2FtZXJhUGx1cyA9IGNhcHR1cmVkRGF0YS5vYmplY3QgYXMgQ2FtZXJhUGx1cztcbiAgICAgICAgY29uc3QgaW1hZ2VBc3NldDogUEhBc3NldCA9IGNhcHR1cmVkRGF0YS5kYXRhO1xuXG4gICAgICAgIGlmIChjYXB0dXJlZERhdGEuZGF0YSkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuXG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlLmZyb21Bc3NldChjYXB0dXJlZERhdGEuZGF0YSkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlciA9IGZzLnBhdGguam9pbihmcy5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkucGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZU5hbWUgPSAnY2FwdHVyZWRpbWFnZXMvSU1HXycgKyBEYXRlLm5vdygpICsgJy5qcGcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhdGhEZXN0ID0gcGF0aC5qb2luKGZvbGRlciwgZmlsZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNhdmVkOiBib29sZWFuID0gaW1nU3JjLnNhdmVUb0ZpbGUocGF0aERlc3QsICdqcGcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2F2ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVUlJbWFnZVdyaXRlVG9TYXZlZFBob3Rvc0FsYnVtKGNhcHR1cmVkRGF0YS5kYXRhLm5hdGl2ZUltYWdlLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW1nU3JjLnNhdmVUb0FsYnVtKHRoaXMuaW1hZ2VTb3VyY2UsIGZhbHNlLCBmYWxzZSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgYWxlcnQoJ1RoZSBwaG90byB3YXMgc2F2ZWQhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnT3JnIEZpbGUgUGF0aDogJyArIHBhdGhEZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBwYXRoRGVzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKHBhdGhEZXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0ltYWdlIHNvdXJjZSBpcyBiYWQuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignSW1hZ2UgQXNzZXQgd2FzIG51bGwuICcgKyBtb2R1bGUuZmlsZW5hbWUpO1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0ltYWdlIEFzc2V0IHdhcyBudWxsJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogRnVuY3Rpb24gdG8gdHJpZ2dlciBpbWFnZSBnYWxsZXJ5IGV2ZW50IG1ldGhvZCB0byBnbyB0byBpbWFnZSBnYWxsZXJ5IHBhZ2UuXG4gKlxuICovXG5jb25zdCBnb0ltYWdlR2FsbGVyeSA9IGZ1bmN0aW9uKCk6IGFueSB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIF90aGlzLl9vd25lci5nZXQoKS5zZW5kRXZlbnQoJ2ltYWdlc0dhbGxlcnlFdmVudCcpO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgfSk7XG59O1xuXG4vKiogT3ZlcmlkZSBtZXRob2QgdG8gZGlzcGxheSBmbGFzaCBidXR0b24gb24gY2FtZXJhIHZpZXcuXG4gKiBUaGlzIGlzIGFjdHVhbGx5IHNhbWUgYXMgaXQncyBwYXJlbnQgZXhjZXB0IHRoZSBidXR0b24gbG9jYXRpb24gKHgseSlcbiAqL1xuY29uc3QgZmxhc2hCdG5IYW5kbGVyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2ZsYXNoQnRuKSB7XG4gICAgICAgIHRoaXMuX2ZsYXNoQnRuLnJlbW92ZUZyb21TdXBlcnZpZXcoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuZmxhc2hFbmFibGVkKSB7XG4gICAgICAgIHRoaXMuX2ZsYXNoQnRuID0gY3JlYXRlSW1hZ2VCdXR0b24odGhpcywgQ0dSZWN0TWFrZSgyMCwgODAsIDUwLCA1MCksIG51bGwsXG4gICAgICAgICAgICAndG9nZ2xlRmxhc2gnLCBudWxsLCBjcmVhdGVJY29uKCdmbGFzaCcsIG51bGwsIG51bGwpLCBudWxsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9mbGFzaEJ0biA9IGNyZWF0ZUltYWdlQnV0dG9uKHRoaXMsIENHUmVjdE1ha2UoMjAsIDgwLCA1MCwgNTApLCBudWxsLFxuICAgICAgICAgICAgJ3RvZ2dsZUZsYXNoJywgbnVsbCwgY3JlYXRlSWNvbignZmxhc2hPZmYnLCBudWxsLCBudWxsKSwgbnVsbCk7XG4gICAgfVxuICAgIHRoaXMuX2ZsYXNoQnRuLnRyYW5zZm9ybSA9IENHQWZmaW5lVHJhbnNmb3JtTWFrZVNjYWxlKDAuNzUsIDAuNzUpO1xuICAgIHRoaXMudmlldy5hZGRTdWJ2aWV3KHRoaXMuX2ZsYXNoQnRuKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBpY29uIGZvciB0aGUgZ2l2ZW4gdHlwZXMgKGZsYXNoT24sIGZsYXNoT2ZmLCB0b2dnbGUsIHBpY3R1cmVPdXRMaW5lLCB0YWtlUGljdHVyZSwgR2FsbGVyeSlcbiAqXG4gKiBAcGFyYW0gdHlwZSB0eXBlIG9mIGljb24gdG8gYmUgY3JlYXRlZFxuICogQHBhcmFtIHNpemUgc2l6ZSBvZiB0aGUgaWNvblxuICogQHBhcmFtIGNvbG9yIGNvbG9yIG9mIHRoZSBpY29uXG4gKi9cbmNvbnN0IGNyZWF0ZUljb24gPSAodHlwZSwgc2l6ZSwgY29sb3IpOiBhbnkgPT4ge1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlICdmbGFzaCc6XG4gICAgICAgICAgICBVSUdyYXBoaWNzQmVnaW5JbWFnZUNvbnRleHRXaXRoT3B0aW9ucyhzaXplIHx8IENHU2l6ZU1ha2UoNTAsIDUwKSwgZmFsc2UsIDApO1xuICAgICAgICAgICAgZHJhd0ZsYXNoKGNvbG9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmbGFzaE9mZic6XG4gICAgICAgICAgICBVSUdyYXBoaWNzQmVnaW5JbWFnZUNvbnRleHRXaXRoT3B0aW9ucyhzaXplIHx8IENHU2l6ZU1ha2UoNTAsIDUwKSwgZmFsc2UsIDApO1xuICAgICAgICAgICAgZHJhd0ZsYXNoT2ZmKGNvbG9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0b2dnbGUnOlxuICAgICAgICAgICAgVUlHcmFwaGljc0JlZ2luSW1hZ2VDb250ZXh0V2l0aE9wdGlvbnMoc2l6ZSB8fCBDR1NpemVNYWtlKDUwLCA1MCksIGZhbHNlLCAwKTtcbiAgICAgICAgICAgIGRyYXdUb2dnbGUoY29sb3IpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BpY091dGxpbmUnOlxuICAgICAgICAgICAgVUlHcmFwaGljc0JlZ2luSW1hZ2VDb250ZXh0V2l0aE9wdGlvbnMoc2l6ZSB8fCBDR1NpemVNYWtlKDUwLCA1MCksIGZhbHNlLCAwKTtcbiAgICAgICAgICAgIGRyYXdQaWNPdXRsaW5lKGNvbG9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YWtlUGljJzpcbiAgICAgICAgICAgIFVJR3JhcGhpY3NCZWdpbkltYWdlQ29udGV4dFdpdGhPcHRpb25zKHNpemUgfHwgQ0dTaXplTWFrZSg1MCwgNTApLCBmYWxzZSwgMCk7XG4gICAgICAgICAgICBkcmF3Q2lyY2xlKGNvbG9yKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdnYWxsZXJ5JzpcbiAgICAgICAgICAgIFVJR3JhcGhpY3NCZWdpbkltYWdlQ29udGV4dFdpdGhPcHRpb25zKHNpemUgfHwgQ0dTaXplTWFrZSg1MCwgNTApLCBmYWxzZSwgMCk7XG4gICAgICAgICAgICBkcmF3R2FsbGVyeShjb2xvcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICB9XG4gICAgY29uc3QgaW1nID0gVUlHcmFwaGljc0dldEltYWdlRnJvbUN1cnJlbnRJbWFnZUNvbnRleHQoKTtcbiAgICBVSUdyYXBoaWNzRW5kSW1hZ2VDb250ZXh0KCk7XG4gICAgcmV0dXJuIGltZztcbn07XG4vKipcbiAqIERyYXdzIGZsYXNoT24gaWNvbiB1c2luZyBVSUJlemllclBhdGggZm9yIHRoZSBmbGFzaE9OIGJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0gY29sb3IgY29sb3Igb2YgdGhlIGZsYXNoT2ZmIGljb25cbiAqL1xuY29uc3QgZHJhd0ZsYXNoID0gKGNvbG9yOiBhbnkpID0+IHtcbiAgICBjb25zdCBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgY29uc3QgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgyMy4xNywgMC41OCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTEuMTksIDEzLjY1KSwgQ0dQb2ludE1ha2UoMjIuNzksIDAuOTcpLCBDR1BvaW50TWFrZSgxNy4zOCwgNi44MykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMCwgMjYuNjYpLCBDR1BvaW50TWFrZSgzLjIsIDIyLjQxKSwgQ0dQb2ludE1ha2UoLTAuMDcsIDI2LjI0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjkxLCAyNy40NCksIENHUG9pbnRNYWtlKDAuMSwgMjcuMjYpLCBDR1BvaW50TWFrZSgwLjM0LCAyNy4yOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTMuNjEsIDI4LjE1KSwgQ0dQb2ludE1ha2UoMTMuMzQsIDI3LjU4KSwgQ0dQb2ludE1ha2UoMTMuNzEsIDI3LjYxKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMC42MSwgMzcuMDcpLCBDR1BvaW50TWFrZSgxMy41NCwgMjguNDUpLCBDR1BvaW50TWFrZSgxMi4xOCwgMzIuNDYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDcuODMsIDQ1LjkyKSwgQ0dQb2ludE1ha2UoOS4wMiwgNDEuNjQpLCBDR1BvaW50TWFrZSg3Ljc2LCA0NS42MikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoOC44NSwgNDYuNDMpLCBDR1BvaW50TWFrZSg3Ljg5LCA0Ni4yNSksIENHUG9pbnRNYWtlKDguMjcsIDQ2LjQzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMS41NCwgMzMuNDgpLCBDR1BvaW50TWFrZSg5LjU5LCA0Ni40MyksIENHUG9pbnRNYWtlKDExLjM2LCA0NC42MykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzMuMiwgMTkuODcpLCBDR1BvaW50TWFrZSgzMC4xOCwgMjMuOTcpLCBDR1BvaW50TWFrZSgzMy4yNywgMjAuMzUpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI2LjU3LCAxOS4xMiksIENHUG9pbnRNYWtlKDMzLjEsIDE5LjIxKSwgQ0dQb2ludE1ha2UoMzMsIDE5LjIxKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMCwgMTguNjcpLCBDR1BvaW50TWFrZSgyMS43MSwgMTkuMDYpLCBDR1BvaW50TWFrZSgyMCwgMTguOTQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIyLjc2LCA5Ljg4KSwgQ0dQb2ludE1ha2UoMjAsIDE4LjQ5KSwgQ0dQb2ludE1ha2UoMjEuMjMsIDE0LjUyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNS4zOCwgMC43MyksIENHUG9pbnRNYWtlKDI0LjI2LCA1LjIxKSwgQ0dQb2ludE1ha2UoMjUuNDUsIDEuMTIpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIzLjE3LCAwLjU4KSwgQ0dQb2ludE1ha2UoMjUuMjQsIC0wLjE3KSwgQ0dQb2ludE1ha2UoMjQuMDUsIC0wLjI2KSk7XG4gICAgYmV6aWVyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyUGF0aC5maWxsKCk7XG59O1xuLyoqXG4gKiBEcmF3cyBmbGFzaE9mZiBpY29uIHVzaW5nIFVJQmV6aWVyUGF0aCBmb3IgdGhlIGZsYXNoT2ZmIGJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0gY29sb3IgY29sb3Igb2YgdGhlIGZsYXNoT2ZmIGljb25cbiAqL1xuY29uc3QgZHJhd0ZsYXNoT2ZmID0gKGNvbG9yOiBhbnkpID0+IHtcbiAgICBjb25zdCBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgY29uc3QgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgyMS4xMywgNC41KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNS4xLCAxMi4yOCksIENHUG9pbnRNYWtlKDE5LjE4LCA3LjAxKSwgQ0dQb2ludE1ha2UoMTYuNDUsIDEwLjUxKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxMi42NiwgMTUuNDUpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDcuMDksIDkuNjQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAuOCwgMy45KSwgQ0dQb2ludE1ha2UoMi41LCA0LjgyKSwgQ0dQb2ludE1ha2UoMS40MSwgMy44NCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMCwgNC43MyksIENHUG9pbnRNYWtlKDAuMjksIDMuOTYpLCBDR1BvaW50TWFrZSgwLjA2LCA0LjIpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE3LjgzLCAyNC4xMyksIENHUG9pbnRNYWtlKC0wLjA2LCA1LjM2KSwgQ0dQb2ludE1ha2UoMi43LCA4LjM5KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzNi40NCwgNDIuNjkpLCBDR1BvaW50TWFrZSgzMi44NywgMzkuODEpLCBDR1BvaW50TWFrZSgzNS44NiwgNDIuNzgpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDM3LjIxLCA0MS44OCksIENHUG9pbnRNYWtlKDM2Ljg5LCA0Mi42MyksIENHUG9pbnRNYWtlKDM3LjE1LCA0Mi4zNikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzEuNjQsIDM1LjI0KSwgQ0dQb2ludE1ha2UoMzcuMywgNDEuMjgpLCBDR1BvaW50TWFrZSgzNi4yOSwgNDAuMTEpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI1Ljk4LCAyOS4zMSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjkuMzQsIDI0Ljk0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzMi42MiwgMTkuOTEpLCBDR1BvaW50TWFrZSgzMS43NiwgMjEuODMpLCBDR1BvaW50TWFrZSgzMi42NywgMjAuMzkpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI3LjAyLCAxOS4xNiksIENHUG9pbnRNYWtlKDMyLjUzLCAxOS4yNSksIENHUG9pbnRNYWtlKDMyLjQ0LCAxOS4yNSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuNDgsIDE4LjcxKSwgQ0dQb2ludE1ha2UoMjIuOTEsIDE5LjEpLCBDR1BvaW50TWFrZSgyMS40OCwgMTguOTgpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDIzLjgsIDkuOTEpLCBDR1BvaW50TWFrZSgyMS40OCwgMTguNTMpLCBDR1BvaW50TWFrZSgyMi41MSwgMTQuNTUpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI2LjAxLCAwLjc1KSwgQ0dQb2ludE1ha2UoMjUuMDcsIDUuMjQpLCBDR1BvaW50TWFrZSgyNi4wNywgMS4xNCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjUuMywgMC4wMSksIENHUG9pbnRNYWtlKDI1Ljk2LCAwLjM0KSwgQ0dQb2ludE1ha2UoMjUuNywgMC4wNykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuMTMsIDQuNSksIENHUG9pbnRNYWtlKDI0LjgxLCAtMC4wOCksIENHUG9pbnRNYWtlKDIzLjk3LCAwLjg0KSk7XG4gICAgYmV6aWVyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyUGF0aC5maWxsKCk7XG4gICAgY29uc3QgYmV6aWVyMlBhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllcjJQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDcuMTgsIDIyLjYpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0LjU5LCAyNi43KSwgQ0dQb2ludE1ha2UoNS40MywgMjQuOTEpLCBDR1BvaW50TWFrZSg0LjU0LCAyNi4zMikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEwLjQyLCAyNy40OCksIENHUG9pbnRNYWtlKDQuNjgsIDI3LjMpLCBDR1BvaW50TWFrZSg0LjkxLCAyNy4zMykpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE2LjA4LCAyOC4yKSwgQ0dQb2ludE1ha2UoMTUuODUsIDI3LjYzKSwgQ0dQb2ludE1ha2UoMTYuMTcsIDI3LjY2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTMuNTUsIDM3LjEyKSwgQ0dQb2ludE1ha2UoMTYuMDIsIDI4LjUpLCBDR1BvaW50TWFrZSgxNC44NywgMzIuNTEpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMS4yLCA0NS45OCksIENHUG9pbnRNYWtlKDEyLjIsIDQxLjcpLCBDR1BvaW50TWFrZSgxMS4xNCwgNDUuNjgpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMi4wNiwgNDYuNDkpLCBDR1BvaW50TWFrZSgxMS4yNiwgNDYuMzEpLCBDR1BvaW50TWFrZSgxMS41NywgNDYuNDkpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxOC4wNiwgMzkuNjcpLCBDR1BvaW50TWFrZSgxMi42OSwgNDYuNDkpLCBDR1BvaW50TWFrZSgxMy42MSwgNDUuNDcpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyMy4yOSwgMzIuODEpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxNi43MSwgMjUuOTYpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg5Ljk5LCAxOS4xKSwgQ0dQb2ludE1ha2UoMTMuMDksIDIyLjE5KSwgQ0dQb2ludE1ha2UoMTAuMDgsIDE5LjEpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg3LjE4LCAyMi42KSwgQ0dQb2ludE1ha2UoOS45MSwgMTkuMSksIENHUG9pbnRNYWtlKDguNjQsIDIwLjY5KSk7XG4gICAgYmV6aWVyMlBhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyMlBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXIyUGF0aC5maWxsKCk7XG59O1xuLyoqXG4gKiBEcmF3cyB0aGUgdG9nZ2xlIGljb24gdXNpbmcgVUlCZXppZXJQYXRoIGZvciBzd2l0Y2ggY2FtZXJhIGJ1dHRvblxuICpcbiAqIEBwYXJhbSBjb2xvciBjb2xvciBvZiB0b2dnbGUgaWNvblxuICovXG5jb25zdCBkcmF3VG9nZ2xlID0gIChjb2xvcjogYW55KSA9PiB7XG4gICAgY29uc3QgaWNvbkNvbG9yID0gbmV3IENvbG9yKGNvbG9yIHx8ICcjZmZmJykuaW9zO1xuICAgIGNvbnN0IGJlemllclBhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTcuOTEsIDMuMDMpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE0LjY5LCA2LjIpLCBDR1BvaW50TWFrZSgxNi4xMSwgNS43MiksIENHUG9pbnRNYWtlKDE1LjcsIDYuMSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTMuNDEsIDUuNTEpLCBDR1BvaW50TWFrZSgxMy43NSwgNi4zMSksIENHUG9pbnRNYWtlKDEzLjUyLCA2LjE3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg5LjEsIDQuNiksIENHUG9pbnRNYWtlKDEzLjMsIDQuNzQpLCBDR1BvaW50TWFrZSgxMy4xNSwgNC43KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ljg3LCA0LjUpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQuODcsIDUuNCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMy4zNywgNi4yNyksIENHUG9pbnRNYWtlKDQuODcsIDYuMiksIENHUG9pbnRNYWtlKDQuNzIsIDYuMjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAuOTQsIDcuMTQpLCBDR1BvaW50TWFrZSgyLjI1LCA2LjI3KSwgQ0dQb2ludE1ha2UoMS42MSwgNi41MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMCwgNy45OCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMCwgMjYuNTkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDAsIDQ1LjIpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDAuOTcsIDQ2LjA0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxLjk1LCA0Ni44OCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzEuODgsIDQ2Ljg4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2MS44MSwgNDYuODgpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYyLjgzLCA0NS45KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2My44OCwgNDQuOTYpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYzLjg4LCAyNi41MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNjMuODgsIDguMDkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYyLjk4LCA3LjE4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2Mi4wOCwgNi4yNykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNTUuMDMsIDYuMjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ4LjAzLCA2LjI3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0NS44OSwgMy4xNCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDMuNzYsIDApKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDMxLjg0LCAwKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxOS45MywgMCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTcuOTEsIDMuMDMpKTtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDQuOTIsIDQuNikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDYuOTQsIDcuNjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDU0LjEzLCA3LjY3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2MS43NCwgOC4wOSksIENHUG9pbnRNYWtlKDU5LjE5LCA3LjY3KSwgQ0dQb2ludE1ha2UoNjEuNDQsIDcuODEpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDYxLjc0LCA0NC44OSksIENHUG9pbnRNYWtlKDYyLjM4LCA4LjY4KSwgQ0dQb2ludE1ha2UoNjIuMzgsIDQ0LjMpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEuOTUsIDQ0Ljg5KSwgQ0dQb2ludE1ha2UoNjEuMSwgNDUuNDgpLCBDR1BvaW50TWFrZSgyLjU4LCA0NS40OCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMS41LCAyNi42MyksIENHUG9pbnRNYWtlKDEuNjEsIDQ0LjU3KSwgQ0dQb2ludE1ha2UoMS41LCA0MC4wNCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMi4xLCA4LjIyKSwgQ0dQb2ludE1ha2UoMS41LCAxMC44NCksIENHUG9pbnRNYWtlKDEuNTcsIDguNzEpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDkuNzQsIDcuNjcpLCBDR1BvaW50TWFrZSgyLjU4LCA3Ljc3KSwgQ0dQb2ludE1ha2UoMy44MiwgNy42NykpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTYuNzgsIDcuNjcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDE3LjY1LCA2LjM0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxOS43NCwgMy4yMSksIENHUG9pbnRNYWtlKDE4LjEzLCA1LjY1KSwgQ0dQb2ludE1ha2UoMTkuMDcsIDQuMjIpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDIxLjAyLCAxLjM5KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzMS45NiwgMS40NikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDIuODYsIDEuNTcpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ0LjkyLCA0LjYpKTtcbiAgICBiZXppZXJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXJQYXRoLmZpbGwoKTtcbiAgICBjb25zdCBiZXppZXIyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyMlBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjguMjgsIDExLjI2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuNzcsIDE0LjQzKSwgQ0dQb2ludE1ha2UoMjYuMTEsIDExLjc4KSwgQ0dQb2ludE1ha2UoMjIuODUsIDEzLjM4KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuMDIsIDE1LjE2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjIuMSwgMTYuMzgpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyMy4xOSwgMTcuNikpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI0LjI0LCAxNi42OSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjg0LCAxNC4xMSksIENHUG9pbnRNYWtlKDI2LjQxLCAxNC43OCksIENHUG9pbnRNYWtlKDI4LjQsIDE0LjExKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzYuNzksIDE0Ljk1KSwgQ0dQb2ludE1ha2UoMzQuNDMsIDE0LjExKSwgQ0dQb2ludE1ha2UoMzUuMzcsIDE0LjI5KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDIuNTYsIDIwLjMyKSwgQ0dQb2ludE1ha2UoMzkuMjIsIDE2LjAzKSwgQ0dQb2ludE1ha2UoNDEuNDcsIDE4LjE2KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDEuMjEsIDIzLjM1KSwgQ0dQb2ludE1ha2UoNDMuOTQsIDIzLjE0KSwgQ0dQb2ludE1ha2UoNDMuODcsIDIzLjM1KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzguOTYsIDIzLjUyKSwgQ0dQb2ludE1ha2UoMzkuOTcsIDIzLjM1KSwgQ0dQb2ludE1ha2UoMzguOTYsIDIzLjQyKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDUuMzMsIDMwLjg0KSwgQ0dQb2ludE1ha2UoMzguOTYsIDIzLjg3KSwgQ0dQb2ludE1ha2UoNDUuMDMsIDMwLjg0KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNTEuNywgMjMuNTYpLCBDR1BvaW50TWFrZSg0NS42NywgMzAuODQpLCBDR1BvaW50TWFrZSg1MS43LCAyMy45NCkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ5LjMsIDIzLjM1KSwgQ0dQb2ludE1ha2UoNTEuNywgMjMuNDUpLCBDR1BvaW50TWFrZSg1MC42MSwgMjMuMzUpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ni45LCAyMy4zNSkpO1xuICAgIGJlemllcjJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ2LjY0LCAyMS45NikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDM4LjAzLCAxMi4xNiksIENHUG9pbnRNYWtlKDQ1LjkzLCAxOC4wOSksIENHUG9pbnRNYWtlKDQyLjQxLCAxNC4wNSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI4LjI4LCAxMS4yNiksIENHUG9pbnRNYWtlKDM1LjE4LCAxMC45MSksIENHUG9pbnRNYWtlKDMxLjI0LCAxMC41NikpO1xuICAgIGJlemllcjJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllcjJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyMlBhdGguZmlsbCgpO1xuICAgIGNvbnN0IGJlemllcjNQYXRoID0gVUlCZXppZXJQYXRoLmJlemllclBhdGgoKTtcbiAgICBiZXppZXIzUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxNS4xNCwgMjAuOTEpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMi4wNiwgMjQuNzQpLCBDR1BvaW50TWFrZSgxMy41MiwgMjIuODMpLCBDR1BvaW50TWFrZSgxMi4xNCwgMjQuNTQpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNC4zNSwgMjUuMDkpLCBDR1BvaW50TWFrZSgxMS45OSwgMjQuOTUpLCBDR1BvaW50TWFrZSgxMi44OSwgMjUuMDkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxNi43NSwgMjUuMDkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxNi45NywgMjcuMDgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMS4zNSwgMzQuOTkpLCBDR1BvaW50TWFrZSgxNy4yNywgMjkuNzYpLCBDR1BvaW50TWFrZSgxOS4wMywgMzMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0MS44MSwgMzUuNDEpLCBDR1BvaW50TWFrZSgyNy4yNCwgNDAuMTEpLCBDR1BvaW50TWFrZSgzNi4xMSwgNDAuMjkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My40NiwgMzMuOTgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Mi40MSwgMzIuODMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0MS4zNiwgMzEuNjgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0MC4wMSwgMzIuODYpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzMS44NCwgMzUuNzIpLCBDR1BvaW50TWFrZSgzNy41OCwgMzQuOTkpLCBDR1BvaW50TWFrZSgzNS40OCwgMzUuNzIpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNi44MiwgMzQuODkpLCBDR1BvaW50TWFrZSgyOS4yMiwgMzUuNzIpLCBDR1BvaW50TWFrZSgyOC4zMiwgMzUuNTgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMC4zMSwgMjYuOTEpLCBDR1BvaW50TWFrZSgyMy4zNCwgMzMuMjgpLCBDR1BvaW50TWFrZSgyMS4wMiwgMzAuNDMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxOS45NywgMjUuMDkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyMi4zNywgMjUuMDkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyNC41OCwgMjQuNTcpLCBDR1BvaW50TWFrZSgyNC4zOSwgMjUuMDkpLCBDR1BvaW50TWFrZSgyNC43NiwgMjQuOTkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxOC4zNiwgMTcuNDMpLCBDR1BvaW50TWFrZSgyNC4yOCwgMjMuODQpLCBDR1BvaW50TWFrZSgxOC42OSwgMTcuNDMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNS4xNCwgMjAuOTEpLCBDR1BvaW50TWFrZSgxOC4yMSwgMTcuNDMpLCBDR1BvaW50TWFrZSgxNi43OCwgMTguOTkpKTtcbiAgICBiZXppZXIzUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXIzUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllcjNQYXRoLmZpbGwoKTtcbn07XG4vKipcbiAqIERyYXdzIHBpY3R1cmUgb3V0bGluZSBpY29uIHVzaW5nIFVJQmV6aWVyUGF0aCBmb3IgdGFraW5nIHBpY3R1cmUgYnV0dG9uXG4gKlxuICogQHBhcmFtIGNvbG9yIENvbG9yIG9mIHRoZSBwaWN0dXJlIG91dGxpbmVcbiAqL1xuY29uc3QgZHJhd1BpY091dGxpbmUgPSAoY29sb3I6IGFueSkgPT4ge1xuICAgIGNvbnN0IGljb25Db2xvciA9IG5ldyBDb2xvcihjb2xvciB8fCAnI2ZmZicpLmlvcztcbiAgICBjb25zdCBiZXppZXJQYXRoID0gVUlCZXppZXJQYXRoLmJlemllclBhdGgoKTtcbiAgICBiZXppZXJQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDE3LjEzLCAwLjYzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjEzLCA3LjIxKSwgQ0dQb2ludE1ha2UoMTIuODIsIDEuNzcpLCBDR1BvaW50TWFrZSg5LjMxLCAzLjg3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLjkxLCAxNS44NSksIENHUG9pbnRNYWtlKDMuNywgOS43OSksIENHUG9pbnRNYWtlKDIuMTEsIDEyLjQ0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLCAyMy4yMSksIENHUG9pbnRNYWtlKDAuMSwgMTguMjcpLCBDR1BvaW50TWFrZSgwLCAxOC44NikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMC45MSwgMzAuNTgpLCBDR1BvaW50TWFrZSgwLCAyNy41NyksIENHUG9pbnRNYWtlKDAuMSwgMjguMTkpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE0LjAyLCA0NC43NSksIENHUG9pbnRNYWtlKDMuMTEsIDM2LjkzKSwgQ0dQb2ludE1ha2UoOC4wMSwgNDIuMikpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMzEuNzMsIDQ0Ljc1KSwgQ0dQb2ludE1ha2UoMTkuMzcsIDQ3LjA1KSwgQ0dQb2ludE1ha2UoMjYuMzgsIDQ3LjA1KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0NC44NCwgMzAuNTgpLCBDR1BvaW50TWFrZSgzNy43NCwgNDIuMiksIENHUG9pbnRNYWtlKDQyLjY0LCAzNi45MykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDUuNzUsIDIzLjIxKSwgQ0dQb2ludE1ha2UoNDUuNjUsIDI4LjE5KSwgQ0dQb2ludE1ha2UoNDUuNzUsIDI3LjU3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0NC44NCwgMTUuODUpLCBDR1BvaW50TWFrZSg0NS43NSwgMTguODYpLCBDR1BvaW50TWFrZSg0NS42NSwgMTguMjQpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI4LCAwLjQ2KSwgQ0dQb2ludE1ha2UoNDIuMTUsIDguMTIpLCBDR1BvaW50TWFrZSgzNS44MiwgMi4zMykpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTcuMTMsIDAuNjMpLCBDR1BvaW50TWFrZSgyNS4xNSwgLTAuMjIpLCBDR1BvaW50TWFrZSgyMC4wMiwgLTAuMTMpKTtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjcuMzksIDQuMzkpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQyLjAyLCAyMy4yMSksIENHUG9pbnRNYWtlKDM1LjgyLCA2LjQyKSwgQ0dQb2ludE1ha2UoNDIuMDIsIDE0LjM4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzMS43NywgNDAuMzMpLCBDR1BvaW50TWFrZSg0Mi4wMiwgMzAuMzUpLCBDR1BvaW50TWFrZSgzOCwgMzcuMDYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDkuMzgsIDM2LjgpLCBDR1BvaW50TWFrZSgyNC4yMSwgNDQuMjYpLCBDR1BvaW50TWFrZSgxNS40OCwgNDIuOTIpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDUuODcsIDE0LjI4KSwgQ0dQb2ludE1ha2UoMy4zNywgMzAuODQpLCBDR1BvaW50TWFrZSgyLjAxLCAyMi4wNCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTguMiwgNC40MiksIENHUG9pbnRNYWtlKDguMTQsIDkuNzYpLCBDR1BvaW50TWFrZSgxMy4zLCA1LjYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI3LjM5LCA0LjM5KSwgQ0dQb2ludE1ha2UoMjAuNzMsIDMuOCksIENHUG9pbnRNYWtlKDI0LjgyLCAzLjgpKTtcbiAgICBiZXppZXJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXJQYXRoLmZpbGwoKTtcbn07XG4vKipcbiAqIERyYXdzIGNpcmNsZSBpY29uIHVzaW5nIFVJQmV6aWVyUGF0aFxuICpcbiAqIEBwYXJhbSBjb2xvciBjb2xvciBvZiB0aGUgY2lyY2xlIGljb25cbiAqL1xuXG5jb25zdCBkcmF3Q2lyY2xlID0gKGNvbG9yKSA9PiB7XG4gICAgY29uc3QgaWNvbkNvbG9yID0gbmV3IENvbG9yKGNvbG9yIHx8ICcjZmZmJykuaW9zO1xuICAgIGNvbnN0IGJlemllcjJQYXRoID0gVUlCZXppZXJQYXRoLmJlemllclBhdGgoKTtcbiAgICBiZXppZXIyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxNy44OCwgMC41MSkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDAsIDIzLjA4KSwgQ0dQb2ludE1ha2UoNy40NywgMy4wOSksIENHUG9pbnRNYWtlKDAuMDQsIDEyLjQ5KSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMTcuODMsIDQ1LjI1KSwgQ0dQb2ludE1ha2UoMCwgMzMuMzkpLCBDR1BvaW50TWFrZSg3LjQ3LCA0Mi42NikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQwLjA4LCAzOS4xMyksIENHUG9pbnRNYWtlKDI1LjgxLCA0Ny4yMiksIENHUG9pbnRNYWtlKDM0LjIsIDQ0LjkyKSk7XG4gICAgYmV6aWVyMlBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDcsIDIyLjg0KSwgQ0dQb2ludE1ha2UoNDQuOSwgMzQuNDEpLCBDR1BvaW50TWFrZSg0NywgMjkuNCkpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDMxLjYsIDEuMjkpLCBDR1BvaW50TWFrZSg0NywgMTMuMDMpLCBDR1BvaW50TWFrZSg0MS4wOCwgNC44MikpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE3Ljg4LCAwLjUxKSwgQ0dQb2ludE1ha2UoMjcuOTksIC0wLjA3KSwgQ0dQb2ludE1ha2UoMjEuNjUsIC0wLjQpKTtcbiAgICBiZXppZXIyUGF0aC5taXRlckxpbWl0ID0gNDtcbiAgICBiZXppZXIyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBpY29uQ29sb3Iuc2V0RmlsbCgpO1xuICAgIGJlemllcjJQYXRoLmZpbGwoKTtcbn07XG4vKipcbiAqIERyYXdzIGdhbGxlcnkgaWNvbiB1c2luZyBVSUJlemllclBhdGhcbiAqXG4gKiBAcGFyYW0gY29sb3IgY29sb3Igb2YgdGhlIGdhbGxlcnkgaWNvblxuICovXG5jb25zdCBkcmF3R2FsbGVyeSA9ICAoY29sb3IpID0+IHtcbiAgICBjb25zdCBpY29uQ29sb3IgPSBuZXcgQ29sb3IoY29sb3IgfHwgJyNmZmYnKS5pb3M7XG4gICAgY29uc3QgYmV6aWVyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyUGF0aC5tb3ZlVG9Qb2ludChDR1BvaW50TWFrZSgxLjQyLCAwLjEzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgwLjExLCAxLjQ2KSwgQ0dQb2ludE1ha2UoMC45LCAwLjMxKSwgQ0dQb2ludE1ha2UoMC4yNSwgMC45OCkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMCwgMTcuMjgpLCBDR1BvaW50TWFrZSgwLjAzLCAxLjcyKSwgQ0dQb2ludE1ha2UoMCwgNi42MSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMCwgMzIuNzMpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDAuMjgsIDMzLjI0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxLjA0LCAzNC4wNCksIENHUG9pbnRNYWtlKDAuNDgsIDMzLjYxKSwgQ0dQb2ludE1ha2UoMC42OCwgMzMuODMpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDEuNTIsIDM0LjMzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzLjg0LCAzNC4zNikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNi4xNSwgMzQuMzkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYuMTUsIDM2LjU0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjgsIDM5LjY2KSwgQ0dQb2ludE1ha2UoNi4xNSwgMzguOTMpLCBDR1BvaW50TWFrZSg2LjE4LCAzOS4wOSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjguMDUsIDQwLjMpLCBDR1BvaW50TWFrZSg3LjUzLCA0MC4zNSksIENHUG9pbnRNYWtlKDUuOTgsIDQwLjMpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDQ4LjM4LCA0MC4xOSksIENHUG9pbnRNYWtlKDQyLjgyLCA0MC4zKSwgQ0dQb2ludE1ha2UoNDguMDUsIDQwLjI3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0OS44OSwgMzguODIpLCBDR1BvaW50TWFrZSg0OC45OCwgNDAuMDQpLCBDR1BvaW50TWFrZSg0OS43NCwgMzkuMzYpKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDUwLCAyMyksIENHUG9pbnRNYWtlKDQ5Ljk3LCAzOC41NSksIENHUG9pbnRNYWtlKDUwLCAzMy44OCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNTAsIDcuNTQpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ5LjcyLCA3LjA0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg0OC45NiwgNi4yMyksIENHUG9pbnRNYWtlKDQ5LjUyLCA2LjY2KSwgQ0dQb2ludE1ha2UoNDkuMzIsIDYuNDQpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQ4LjQ4LCA1Ljk1KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Ni4xNywgNS45MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDMuODYsIDUuODkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQzLjgzLCAzLjYyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My44LCAxLjM0KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My41MywgMC45NSkpO1xuICAgIGJlemllclBhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoNDIuNzksIDAuMjkpLCBDR1BvaW50TWFrZSg0My4zOCwgMC43NCksIENHUG9pbnRNYWtlKDQzLjA1LCAwLjQzKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0Mi4zMSwgMC4wMikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjIuMDcsIDApKTtcbiAgICBiZXppZXJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDEuNDIsIDAuMTMpLCBDR1BvaW50TWFrZSg0LjM5LCAtMC4wMSksIENHUG9pbnRNYWtlKDEuNzksIDApKTtcbiAgICBiZXppZXJQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGJlemllclBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzkuNzgsIDQuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMzkuNzgsIDUuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjMuODMsIDUuOSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNy44OCwgNS45KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg3LjMzLCA2LjE2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSg2LjUsIDYuODQpLCBDR1BvaW50TWFrZSg2Ljk4LCA2LjM0KSwgQ0dQb2ludE1ha2UoNi43LCA2LjU3KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2LjIsIDcuMjYpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDYuMTcsIDE4Ljg2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg2LjE1LCAzMC40NikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNS4xMSwgMzAuNDYpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDQuMDcsIDMwLjQ2KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0LjA3LCAxNy4xOCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNC4wNywgMy44OSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMjEuOTIsIDMuODkpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDM5Ljc4LCAzLjg5KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzOS43OCwgNC45KSk7XG4gICAgYmV6aWVyUGF0aC5jbG9zZVBhdGgoKTtcbiAgICBiZXppZXJQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDQ1LjkzLCAyMy4xKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0NS45MywgMzYuMzgpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI4LjA4LCAzNi4zOCkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTAuMjIsIDM2LjM4KSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxMC4yMiwgMjMuMSkpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTAuMjIsIDkuODIpKTtcbiAgICBiZXppZXJQYXRoLmFkZExpbmVUb1BvaW50KENHUG9pbnRNYWtlKDI4LjA4LCA5LjgyKSk7XG4gICAgYmV6aWVyUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0NS45MywgOS44MikpO1xuICAgIGJlemllclBhdGguYWRkTGluZVRvUG9pbnQoQ0dQb2ludE1ha2UoNDUuOTMsIDIzLjEpKTtcbiAgICBiZXppZXJQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllclBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXJQYXRoLmZpbGwoKTtcbiAgICBjb25zdCBiZXppZXIyUGF0aCA9IFVJQmV6aWVyUGF0aC5iZXppZXJQYXRoKCk7XG4gICAgYmV6aWVyMlBhdGgubW92ZVRvUG9pbnQoQ0dQb2ludE1ha2UoMTcuOCwgMTIuMzgpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNS40MiwgMTUuOTIpLCBDR1BvaW50TWFrZSgxNi4yNywgMTIuODkpLCBDR1BvaW50TWFrZSgxNS4yNiwgMTQuMzgpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxNy41NCwgMTguNzgpLCBDR1BvaW50TWFrZSgxNS41NCwgMTcuMTYpLCBDR1BvaW50TWFrZSgxNi4zNCwgMTguMjUpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxOC45NSwgMTkuMDQpLCBDR1BvaW50TWFrZSgxOC4wMiwgMTguOTkpLCBDR1BvaW50TWFrZSgxOC4yNCwgMTkuMDQpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMC4zNiwgMTguNzgpLCBDR1BvaW50TWFrZSgxOS42NSwgMTkuMDQpLCBDR1BvaW50TWFrZSgxOS44OCwgMTguOTkpKTtcbiAgICBiZXppZXIyUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMC45OSwgMTIuODMpLCBDR1BvaW50TWFrZSgyMi45LCAxNy42NCksIENHUG9pbnRNYWtlKDIzLjI1LCAxNC4zMykpO1xuICAgIGJlemllcjJQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDE3LjgsIDEyLjM4KSwgQ0dQb2ludE1ha2UoMjAuMDUsIDEyLjIxKSwgQ0dQb2ludE1ha2UoMTguODQsIDEyLjAzKSk7XG4gICAgYmV6aWVyMlBhdGgubWl0ZXJMaW1pdCA9IDQ7XG4gICAgYmV6aWVyMlBhdGguY2xvc2VQYXRoKCk7XG4gICAgaWNvbkNvbG9yLnNldEZpbGwoKTtcbiAgICBiZXppZXIyUGF0aC5maWxsKCk7XG4gICAgY29uc3QgYmV6aWVyM1BhdGggPSBVSUJlemllclBhdGguYmV6aWVyUGF0aCgpO1xuICAgIGJlemllcjNQYXRoLm1vdmVUb1BvaW50KENHUG9pbnRNYWtlKDMzLjc1LCAxNy40OSkpO1xuICAgIGJlemllcjNQYXRoLmFkZEN1cnZlVG9Qb2ludENvbnRyb2xQb2ludDFDb250cm9sUG9pbnQyKENHUG9pbnRNYWtlKDI5Ljg3LCAyMi4yNCksIENHUG9pbnRNYWtlKDMzLjYzLCAxNy41NiksIENHUG9pbnRNYWtlKDMxLjg4LCAxOS43KSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjUuOTQsIDI3LjAxKSwgQ0dQb2ludE1ha2UoMjcuNTgsIDI1LjE1KSwgQ0dQb2ludE1ha2UoMjYuMTIsIDI2LjkyKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjMuMzUsIDI0LjgzKSwgQ0dQb2ludE1ha2UoMjUuMzYsIDI3LjI5KSwgQ0dQb2ludE1ha2UoMjUuMTksIDI3LjEzKSk7XG4gICAgYmV6aWVyM1BhdGguYWRkQ3VydmVUb1BvaW50Q29udHJvbFBvaW50MUNvbnRyb2xQb2ludDIoQ0dQb2ludE1ha2UoMjEuNTIsIDIyLjYxKSwgQ0dQb2ludE1ha2UoMjIuNDIsIDIzLjY2KSwgQ0dQb2ludE1ha2UoMjEuNiwgMjIuNjYpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgyMC40MiwgMjIuNzgpLCBDR1BvaW50TWFrZSgyMS4yMiwgMjIuNDMpLCBDR1BvaW50TWFrZSgyMC42OCwgMjIuNTIpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgxMi42MiwgMzMuNTQpLCBDR1BvaW50TWFrZSgyMC4yMiwgMjIuOTkpLCBDR1BvaW50TWFrZSgxNS4wMSwgMzAuMTcpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgxMi4yOSwgMzMuOTkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgyOC4wOCwgMzMuOTkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My44NSwgMzMuOTkpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My44NSwgMzEuNTgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSg0My44NCwgMjkuMTcpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRMaW5lVG9Qb2ludChDR1BvaW50TWFrZSgzOS40MiwgMjMuNTMpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzNC43MSwgMTcuNjIpLCBDR1BvaW50TWFrZSgzNywgMjAuNDIpLCBDR1BvaW50TWFrZSgzNC44OCwgMTcuNzgpKTtcbiAgICBiZXppZXIzUGF0aC5hZGRDdXJ2ZVRvUG9pbnRDb250cm9sUG9pbnQxQ29udHJvbFBvaW50MihDR1BvaW50TWFrZSgzMy43NSwgMTcuNDkpLCBDR1BvaW50TWFrZSgzNC4zOSwgMTcuMzUpLCBDR1BvaW50TWFrZSgzNC4xMSwgMTcuMykpO1xuICAgIGJlemllcjNQYXRoLm1pdGVyTGltaXQgPSA0O1xuICAgIGJlemllcjNQYXRoLmNsb3NlUGF0aCgpO1xuICAgIGljb25Db2xvci5zZXRGaWxsKCk7XG4gICAgYmV6aWVyM1BhdGguZmlsbCgpO1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGltYWdlIGJ1dHRvbiB3aXRoIGhlbHAgb2YgVUlCdXR0b24gd2lkZ2V0XG4gKiBhbmQgc2V0cyBpdCdzIGF0dHJpYnV0ZXMgbGlrZSBjb2xvciwgc3RhdGUsIHNpemUgYW5kIGFjdGlvbiBldmVudC5cbiAqXG4gKiBAcmV0dXJucyBSZXR1cm5zIGJ1dHRvbiBvYmplY3RcbiAqL1xuY29uc3QgY3JlYXRlSW1hZ2VCdXR0b24gPSAodGFyZ2V0OiBhbnksIGZyYW1lOiBhbnksIGxhYmVsOiBhbnksIGV2ZW50TmFtZTogYW55LCBhbGlnbjogYW55LCBpbWc6IGFueSwgaW1nU2VsZWN0ZWQ6IGFueSk6IGFueSA9PiB7XG4gICAgbGV0IGJ0bjtcbiAgICBpZiAoZnJhbWUpIHtcbiAgICAgICAgYnRuID0gVUlCdXR0b24uYWxsb2MoKS5pbml0V2l0aEZyYW1lKGZyYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBidG4gPSBVSUJ1dHRvbi5hbGxvYygpLmluaXQoKTtcbiAgICB9XG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICAgIGJ0bi5zZXRUaXRsZUZvclN0YXRlKGxhYmVsLCAwKTtcbiAgICAgICAgYnRuLnNldFRpdGxlQ29sb3JGb3JTdGF0ZShuZXcgQ29sb3IoJyNmZmYnKS5pb3MsIDApO1xuICAgICAgICBidG4udGl0bGVMYWJlbC5mb250ID0gVUlGb250LnN5c3RlbUZvbnRPZlNpemUoMTkpO1xuICAgIH0gZWxzZSBpZiAoaW1nKSB7XG4gICAgICAgIGJ0bi5zZXRJbWFnZUZvclN0YXRlKGltZywgMCk7XG4gICAgICAgIGlmIChpbWdTZWxlY3RlZCkge1xuICAgICAgICAgICAgYnRuLnNldEltYWdlRm9yU3RhdGUoaW1nLCAxKTtcbiAgICAgICAgICAgIGJ0bi5zZXRJbWFnZUZvclN0YXRlKGltZywgNCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsaWduKSB7XG4gICAgICAgIGJ0bi5jb250ZW50SG9yaXpvbnRhbEFsaWdubWVudCA9XG4gICAgICAgICAgICBhbGlnbiA9PT0gJ3JpZ2h0JyA/IDIgOiAxO1xuICAgIH1cbiAgICBpZiAoZXZlbnROYW1lKSB7XG4gICAgICAgIGJ0bi5hZGRUYXJnZXRBY3Rpb25Gb3JDb250cm9sRXZlbnRzKHRhcmdldCwgZXZlbnROYW1lLCA2NCk7XG4gICAgfVxuICAgIHJldHVybiBidG47XG59O1xuIl19