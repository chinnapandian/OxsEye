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
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
var application = require("tns-core-modules/application");
/**
 * Capture component class
 */
var CaptureComponent = (function () {
    /**
     * Constructor for CaptureComponent.
     * @param zone Angular zone to run a task asynchronously.
     * @param modalService Service modal
     * @param viewContainerRef View container referrence
     * @param router Router
     * @param activityLoader Activity loader indication
     */
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
        /** Empty string variable */
        this.empty = null;
        /** Transformed Image source */
        this.imageSource = new image_source_1.ImageSource();
    }
    /**
     * Initialization method called while angular initialize.
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
     * Destroy method called while angular destroys.
     */
    CaptureComponent.prototype.ngOnDestroy = function () {
        console.log('Destroy called...');
    };
    /**
     * Method to check camera loaded or not along with some
     * camera settings initialization.
     * @param args CameraPlus instance referrence.
     */
    CaptureComponent.prototype.camLoaded = function (args) {
        console.log('***** cam loaded *****');
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
     * Initialize Camera Button.
     */
    CaptureComponent.prototype.initCameraButton = function () {
        this.cam.nativeView.removeView(this.takePicBtn);
        this.cam.nativeView.addView(this.takePicBtn, this.takePicParams);
    };
    /**
     * initialize image gallery button.
     */
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this.cam.nativeView.removeView(this.galleryBtn);
        this.cam.nativeView.addView(this.galleryBtn, this.galleryParams);
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
    };
    /**
     * initialize auto focus image button.
     */
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this.cam.nativeView.removeView(this.autofocusBtn);
        this.cam.nativeView.addView(this.autofocusBtn, this.autofocusParams);
    };
    /**
     * Create take picture button.
     */
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this.takePicBtn = this.createImageButton();
        this.setImageResource(this.takePicBtn, 'ic_camera');
        // let takePicDrawable = this.getImageDrawable('ic_camera');
        // this.takePicBtn.setImageResource(takePicDrawable);
        var shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor('#ffffff'); // white color
        this.takePicBtn.setColorFilter(color);
        // this.takePicBtn.setScaleX(0.50);
        // this.takePicBtn.setScaleY(0.50);
        this.takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.takePicFromCam(_this);
            },
        }));
        this.createTakePictureParams();
    };
    /**
     * Create auto focus image.
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
     * Create auto focus image button.
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
     * Create image gallery button.
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
     * Gets image drawable image id
     * @param iconName Icon Name
     */
    CaptureComponent.prototype.getImageDrawable = function (iconName) {
        var drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    };
    /**
     * Create transparent circle shape.
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
     * Create auto focus shape.
     * @returns Returns shape object
     */
    CaptureComponent.prototype.createAutofocusShape = function () {
        var shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    };
    /**
     * Create image button.
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
     * Image selected event.
     * @param args Image selected event data
     */
    CaptureComponent.prototype.imagesSelectedEvent = function (args) {
        console.log('IMAGES SELECTED EVENT!!!');
        this.loadImage(args.data[0]);
    };
    /**
     * Photo captured event.
     * @param args Image captured event data
     */
    CaptureComponent.prototype.photoCapturedEvent = function (args) {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(args.data);
    };
    /**
     * Toggle camera event.
     * @param args Camera toggle event data
     */
    CaptureComponent.prototype.toggleCameraEvent = function (args) {
        console.log('camera toggled');
    };
    /**
     * Toggle flash on camera.
     */
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        this.cam.toggleFlash();
    };
    /**
     * Toggle showing flash icon.
     */
    CaptureComponent.prototype.toggleShowingFlashIcon = function () {
        console.log("showFlashIcon = " + this.cam.showFlashIcon);
        this.cam.showFlashIcon = !this.cam.showFlashIcon;
    };
    /**
     * Toggle camera.
     */
    CaptureComponent.prototype.toggleTheCamera = function () {
        this.cam.toggleCamera();
    };
    /**
     * Open camera library.
     */
    CaptureComponent.prototype.openCamPlusLibrary = function () {
        this.cam.chooseFromLibrary();
    };
    /**
     * Take picture from camera.
     * @param thisParam Contains cameraplus instance
     */
    CaptureComponent.prototype.takePicFromCam = function (thisParam) {
        thisParam.activityLoader.show();
        thisParam.cam.takePicture({ saveToGallery: true });
        this.imgURI = '';
        this.imageSource = this.imgURI;
    };
    /**
     * Go to image gallery.
     */
    CaptureComponent.prototype.goImageGallery = function () {
        this.router.navigate(['imagegallery']);
    };
    /**
     * Show captured picture dialog
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
                        imgFileOrg.remove();
                    }
                    var imgURIFile = fs.File.fromPath(imgURI);
                    if (imgURIFile) {
                        imgURIFile.remove();
                    }
                    // Todo : to be removed later
                    var imgUriContourPath = imgURI.substring(0, imgURI.indexOf('_transformed')) + '_contour.jpg';
                    var imgURIContourFile = fs.File.fromPath(imgUriContourPath);
                    if (imgURIContourFile) {
                        imgURIContourFile.remove();
                        transformedimage_provider_1.SendBroadcastImage(imgUriContourPath);
                    }
                    // Todo - End
                    _this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
                }
                catch (e) {
                    alert('Couldnot delete the file');
                }
            }
        });
    };
    /**
     * Set transformed image.
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
            catch (e) {
                Toast.makeText('Error while setting image in preview area' + e, 'long').show();
            }
        }
    };
    /**
     * Create take picture params.
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
     * Create auto focus image params.
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
     * Sets image resource.
     * @param btn Button image instance referrence
     * @param iconName Icon name
     */
    CaptureComponent.prototype.setImageResource = function (btn, iconName) {
        var openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    };
    /**
     * Create image gallery params.
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
     * Refresh captured images in media store.
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
        catch (e) {
            alert('Could not sync the file ');
        }
    };
    /**
     * Create thumbnail image.
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
        catch (e) {
            console.log('Error while creating thumbnail image. ' + e);
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
     * Perform perspective transformation.
     * @param filePath Captured image file path
     */
    CaptureComponent.prototype.performPerspectiveTransformation = function (filePath) {
        try {
            var imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            var rectanglePointsStr = imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
        }
        catch (err) {
            console.log(err);
            this.activityLoader.hide();
            alert('Error while performing perspective transformation process. Please retake picture');
        }
    };
    /**
     * load images.
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
                    alert('Image source is bad.');
                }
            }, function (err) {
                _this.imageSource = _this.empty;
                console.error(err);
                alert('Error getting image source from asset');
            });
        }
        else {
            console.log('Image Asset was null');
            alert('Image Asset was null');
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
        activityloader_common_1.ActivityLoader])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBdUY7QUFDdkYsMENBQXlDO0FBRXpDLGtFQUEyRjtBQUUzRiw4REFBNEQ7QUFDNUQsaUZBQXlFO0FBQ3pFLCtEQUEyRDtBQUMzRCxvRkFBNEU7QUFFNUUsbURBQXFEO0FBQ3JELDBDQUE0QztBQUM1QyxpREFBbUQ7QUFFbkQsMERBQTREO0FBRTVEOztHQUVHO0FBT0gsSUFBYSxnQkFBZ0I7SUE0QnpCOzs7Ozs7O09BT0c7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUo5QixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osaUJBQVksR0FBWixZQUFZLENBQW9CO1FBQ2hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQTFCMUMsNEJBQTRCO1FBQ3BCLFVBQUssR0FBUSxJQUFJLENBQUM7UUFHMUIsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO0lBd0JwRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUs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LENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNwQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDbEMsQ0FBQztJQUNMLENBQUM7SUFDTCx1QkFBQztBQUFELENBQUMsQUE5akJELElBOGpCQztBQTlqQlksZ0JBQWdCO0lBTjVCLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsWUFBWTtRQUN0QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMseUJBQXlCLENBQUM7UUFDdEMsV0FBVyxFQUFFLDBCQUEwQjtLQUMxQyxDQUFDO3FDQXNDb0IsYUFBTTtRQUNFLGlDQUFrQjtRQUNkLHVCQUFnQjtRQUMxQixlQUFNO1FBQ0Usc0NBQWM7R0F6Q2pDLGdCQUFnQixDQThqQjVCO0FBOWpCWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE5nWm9uZSwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nT3B0aW9ucywgTW9kYWxEaWFsb2dTZXJ2aWNlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IEltYWdlQXNzZXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLWFzc2V0JztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgRGlhbG9nQ29udGVudCB9IGZyb20gJy4uL2RpYWxvZy9kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5cbi8qKlxuICogQ2FwdHVyZSBjb21wb25lbnQgY2xhc3NcbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1jYXB0dXJlJyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYXB0dXJlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2FwdHVyZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgICAvKiogQ2FtZXJhIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHByaXZhdGUgY2FtOiBhbnk7XG4gICAgLyoqIEdhbGxlcnkgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgZ2FsbGVyeUJ0bjogYW55O1xuICAgIC8qKiBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgdGFrZVBpY0J0bjogYW55O1xuICAgIC8qKiBBdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGF1dG9mb2N1c0J0bjogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIGdhbGxlcnlQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgVGFrZSBwaWN0dXJlIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIHRha2VQaWNQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgYXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBhdXRvZm9jdXNQYXJhbXM6IGFueTtcbiAgICAvKiogRW1wdHkgc3RyaW5nIHZhcmlhYmxlICovXG4gICAgcHJpdmF0ZSBlbXB0eTogYW55ID0gbnVsbDtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBjaGVjayB0aGUgY2FtZXJhIGlzIHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0NhbWVyYVZpc2libGU6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIFVSSSAqL1xuICAgIHB1YmxpYyBpbWdVUkk6IGFueTtcbiAgICAvKiogT3BlbkNWIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHB1YmxpYyBvcGVuY3ZJbnN0YW5jZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIENhcHR1cmVDb21wb25lbnQuXG4gICAgICogQHBhcmFtIHpvbmUgQW5ndWxhciB6b25lIHRvIHJ1biBhIHRhc2sgYXN5bmNocm9ub3VzbHkuXG4gICAgICogQHBhcmFtIG1vZGFsU2VydmljZSBTZXJ2aWNlIG1vZGFsXG4gICAgICogQHBhcmFtIHZpZXdDb250YWluZXJSZWYgVmlldyBjb250YWluZXIgcmVmZXJyZW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIEFjdGl2aXR5IGxvYWRlciBpbmRpY2F0aW9uXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgem9uZTogTmdab25lLFxuICAgICAgICBwcml2YXRlIG1vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyLFxuICAgICAgICAvLyBwcml2YXRlIF9jaGFuZ2VEZXRlY3Rpb25SZWY6IENoYW5nZURldGVjdG9yUmVmXG4gICAgKSB7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6YXRpb24gbWV0aG9kIGNhbGxlZCB3aGlsZSBhbmd1bGFyIGluaXRpYWxpemUuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJbml0aWFsaXppbmcgT3BlbkNWLi4uJyk7XG4gICAgICAgIHRoaXMub3BlbmN2SW5zdGFuY2UgPSBvcGVuY3YuaW5pdE9wZW5DVigpO1xuICAgICAgICB0aGlzLmlzQ2FtZXJhVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbWV0aG9kIGNhbGxlZCB3aGlsZSBhbmd1bGFyIGRlc3Ryb3lzLlxuICAgICAqL1xuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnRGVzdHJveSBjYWxsZWQuLi4nKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGNoZWNrIGNhbWVyYSBsb2FkZWQgb3Igbm90IGFsb25nIHdpdGggc29tZVxuICAgICAqIGNhbWVyYSBzZXR0aW5ncyBpbml0aWFsaXphdGlvbi5cbiAgICAgKiBAcGFyYW0gYXJncyBDYW1lcmFQbHVzIGluc3RhbmNlIHJlZmVycmVuY2UuXG4gICAgICovXG4gICAgY2FtTG9hZGVkKGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnKioqKiogY2FtIGxvYWRlZCAqKioqKicpO1xuICAgICAgICB0aGlzLmNhbSA9IGFyZ3Mub2JqZWN0IGFzIENhbWVyYVBsdXM7XG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuY2FtLmdldEZsYXNoTW9kZSgpO1xuXG4gICAgICAgIC8vIFR1cm4gZmxhc2ggb24gYXQgc3RhcnR1cFxuICAgICAgICBpZiAoZmxhc2hNb2RlID09PSAnb24nKSB7XG4gICAgICAgICAgICB0aGlzLmNhbS50b2dnbGVGbGFzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNiID0gbmV3IGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLkF1dG9Gb2N1c01vdmVDYWxsYmFjayhcblxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF90aGlzOiB0aGlzLFxuICAgICAgICAgICAgICAgIG9uQXV0b0ZvY3VzTW92aW5nKHN0YXJ0OiBhbnksIGNhbWVyYTogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGUgPSB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5hbmltYXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHcmVlbiBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyMwMDgwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDAuNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNldER1cmF0aW9uKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWQgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmYwMDAwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLmF1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuY2FtLmNhbWVyYSkge1xuICAgICAgICAgICAgdGhpcy5jYW0uY2FtZXJhLnNldEF1dG9Gb2N1c01vdmVDYWxsYmFjayhjYik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MuZGF0YSkge1xuXG4gICAgICAgICAgICB0aGlzLmNhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5jYW0uc2hvd1RvZ2dsZUljb24gPSB0cnVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudGFrZVBpY0J0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5nYWxsZXJ5QnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmF1dG9mb2N1c0J0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbS5faW5pdEZsYXNoQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYW0uX2luaXRUb2dnbGVDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRFU1QgVEhFIElDT05TIFNIT1dJTkcvSElESU5HXG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dDYXB0dXJlSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93VG9nZ2xlSWNvbiA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIENhbWVyYSBCdXR0b24uXG4gICAgICovXG4gICAgaW5pdENhbWVyYUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMudGFrZVBpY0J0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLnRha2VQaWNCdG4sIHRoaXMudGFrZVBpY1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemUgaW1hZ2UgZ2FsbGVyeSBidXR0b24uXG4gICAgICovXG4gICAgaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuZ2FsbGVyeUJ0bik7XG4gICAgICAgIHRoaXMuY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLmdhbGxlcnlCdG4sIHRoaXMuZ2FsbGVyeVBhcmFtcyk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLmdhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemUgYXV0byBmb2N1cyBpbWFnZSBidXR0b24uXG4gICAgICovXG4gICAgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5hdXRvZm9jdXNCdG4pO1xuICAgICAgICB0aGlzLmNhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5hdXRvZm9jdXNCdG4sIHRoaXMuYXV0b2ZvY3VzUGFyYW1zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRha2UgcGljdHVyZSBidXR0b24uXG4gICAgICovXG4gICAgY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy50YWtlUGljQnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy50YWtlUGljQnRuLCAnaWNfY2FtZXJhJyk7XG4gICAgICAgIC8vIGxldCB0YWtlUGljRHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2NhbWVyYScpO1xuICAgICAgICAvLyB0aGlzLnRha2VQaWNCdG4uc2V0SW1hZ2VSZXNvdXJjZSh0YWtlUGljRHJhd2FibGUpO1xuICAgICAgICBjb25zdCBzaGFwZSA9IHRoaXMuY3JlYXRlVHJhbnNwYXJlbnRDaXJjbGVEcmF3YWJsZSgpO1xuICAgICAgICB0aGlzLnRha2VQaWNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZmZmZmYnKTsgLy8gd2hpdGUgY29sb3JcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgLy8gdGhpcy50YWtlUGljQnRuLnNldFNjYWxlWCgwLjUwKTtcbiAgICAgICAgLy8gdGhpcy50YWtlUGljQnRuLnNldFNjYWxlWSgwLjUwKTtcbiAgICAgICAgdGhpcy50YWtlUGljQnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ2xpY2soYXJnczogYW55KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGFrZVBpY0Zyb21DYW0oX3RoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhdXRvIGZvY3VzIGltYWdlLlxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuID0gdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5hdXRvZm9jdXNCdG4sICdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcbiAgICAgICAgLy8gdGhpcy5hdXRvZm9jdXNCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzQnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGF1dG8gZm9jdXMgaW1hZ2UgYnV0dG9uLlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYnV0dG9uIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDE1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCgxNTgpO1xuICAgICAgICBidG4uc2V0U2NhbGVUeXBlKGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldy5TY2FsZVR5cGUuQ0VOVEVSX0NST1ApO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpOyAvLyBHcmVlbiBjb2xvclxuICAgICAgICBidG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgaW1hZ2UgZ2FsbGVyeSBidXR0b24uXG4gICAgICovXG4gICAgY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLmdhbGxlcnlCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcblxuICAgICAgICBjb25zdCBnYWxsZXJ5QnRuSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UmVzb3VyY2VzKClcbiAgICAgICAgICAgIC5nZXRJZGVudGlmaWVyKCdnYWxsZXJ5X2J0bicsICdpZCcsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcblxuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0VGFnKGdhbGxlcnlCdG5JZCwgJ2dhbGxlcnktYnRuLXRhZycpO1xuICAgICAgICB0aGlzLmdhbGxlcnlCdG4uc2V0Q29udGVudERlc2NyaXB0aW9uKCdnYWxsZXJ5LWJ0bi1kZWMnKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy5nYWxsZXJ5QnRuLnNldEJhY2tncm91bmREcmF3YWJsZShzaGFwZSk7XG4gICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmdvSW1hZ2VHYWxsZXJ5KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIGltYWdlIGRyYXdhYmxlIGltYWdlIGlkXG4gICAgICogQHBhcmFtIGljb25OYW1lIEljb24gTmFtZVxuICAgICAqL1xuICAgIGdldEltYWdlRHJhd2FibGUoaWNvbk5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHRcbiAgICAgICAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoaWNvbk5hbWUsICdkcmF3YWJsZScsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIGRyYXdhYmxlSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0cmFuc3BhcmVudCBjaXJjbGUgc2hhcGUuXG4gICAgICogQHJldHVybnMgUmV0dXJucyBzaGFwZSBvYmplY3RcbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDk2KTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMTUwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBzaGFwZS5cbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIHNoYXBlIG9iamVjdFxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk6IGFueSB7XG5cbiAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgYW5kcm9pZC5ncmFwaGljcy5kcmF3YWJsZS5TaGFwZURyYXdhYmxlKCk7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDApO1xuICAgICAgICByZXR1cm4gc2hhcGU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbWFnZSBidXR0b24uXG4gICAgICogQHJldHVybnMgUmV0dXJucyBidXR0b24gb2JqZWN0XG4gICAgICovXG4gICAgY3JlYXRlSW1hZ2VCdXR0b24oKTogYW55IHtcbiAgICAgICAgY29uc3QgYnRuID0gbmV3IGFuZHJvaWQud2lkZ2V0LkltYWdlQnV0dG9uKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCk7XG4gICAgICAgIGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcbiAgICAgICAgYnRuLnNldE1heEhlaWdodCg1OCk7XG4gICAgICAgIGJ0bi5zZXRNYXhXaWR0aCg1OCk7XG4gICAgICAgIHJldHVybiBidG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEltYWdlIHNlbGVjdGVkIGV2ZW50LlxuICAgICAqIEBwYXJhbSBhcmdzIEltYWdlIHNlbGVjdGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBpbWFnZXNTZWxlY3RlZEV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSU1BR0VTIFNFTEVDVEVEIEVWRU5UISEhJyk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKChhcmdzLmRhdGEgYXMgSW1hZ2VBc3NldFtdKVswXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBob3RvIGNhcHR1cmVkIGV2ZW50LlxuICAgICAqIEBwYXJhbSBhcmdzIEltYWdlIGNhcHR1cmVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwaG90b0NhcHR1cmVkRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQSE9UTyBDQVBUVVJFRCBFVkVOVCEhIScpO1xuICAgICAgICB0aGlzLmxvYWRJbWFnZShhcmdzLmRhdGEgYXMgSW1hZ2VBc3NldCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBjYW1lcmEgZXZlbnQuXG4gICAgICogQHBhcmFtIGFyZ3MgQ2FtZXJhIHRvZ2dsZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgdG9nZ2xlQ2FtZXJhRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjYW1lcmEgdG9nZ2xlZCcpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgZmxhc2ggb24gY2FtZXJhLlxuICAgICAqL1xuICAgIHRvZ2dsZUZsYXNoT25DYW0oKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBzaG93aW5nIGZsYXNoIGljb24uXG4gICAgICovXG4gICAgdG9nZ2xlU2hvd2luZ0ZsYXNoSWNvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuY2FtLnNob3dGbGFzaEljb259YCk7XG4gICAgICAgIHRoaXMuY2FtLnNob3dGbGFzaEljb24gPSAhdGhpcy5jYW0uc2hvd0ZsYXNoSWNvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVUaGVDYW1lcmEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuY2FtLnRvZ2dsZUNhbWVyYSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIGNhbWVyYSBsaWJyYXJ5LlxuICAgICAqL1xuICAgIG9wZW5DYW1QbHVzTGlicmFyeSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5jYW0uY2hvb3NlRnJvbUxpYnJhcnkoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGFrZSBwaWN0dXJlIGZyb20gY2FtZXJhLlxuICAgICAqIEBwYXJhbSB0aGlzUGFyYW0gQ29udGFpbnMgY2FtZXJhcGx1cyBpbnN0YW5jZVxuICAgICAqL1xuICAgIHRha2VQaWNGcm9tQ2FtKHRoaXNQYXJhbTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXNQYXJhbS5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXNQYXJhbS5jYW0udGFrZVBpY3R1cmUoeyBzYXZlVG9HYWxsZXJ5OiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvIHRvIGltYWdlIGdhbGxlcnkuXG4gICAgICovXG4gICAgZ29JbWFnZUdhbGxlcnkoKSB7XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VnYWxsZXJ5J10pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGNhcHR1cmVkIHBpY3R1cmUgZGlhbG9nXG4gICAgICogQHBhcmFtIGZ1bGxTY3JlZW4gT3B0aW9uIHRvIHNob3cgZnVsbHNjcmVlbiBkaWFsb2cgb3Igbm90XG4gICAgICogQHBhcmFtIGZpbGVQYXRoT3JnIENhcHR1cmVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBpbWdVUkkgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIHJlY1BvaW50c1N0ciBSZWN0YW5nbGUgcG9pbnRzIGluIHN0cmluZ1xuICAgICAqL1xuICAgIHNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2coZnVsbFNjcmVlbjogYm9vbGVhbiwgZmlsZVBhdGhPcmc6IHN0cmluZywgaW1nVVJJOiBzdHJpbmcsIHJlY1BvaW50c1N0cikge1xuICAgICAgICBjb25zdCBvcHRpb25zOiBNb2RhbERpYWxvZ09wdGlvbnMgPSB7XG4gICAgICAgICAgICBjb250ZXh0OiB7XG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2U6IGltZ1VSSSxcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZU9yZzogZmlsZVBhdGhPcmcsXG4gICAgICAgICAgICAgICAgaXNBdXRvQ29ycmVjdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgICAgICByZWN0YW5nbGVQb2ludHM6IHJlY1BvaW50c1N0cixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsc2NyZWVuOiBmdWxsU2NyZWVuLFxuICAgICAgICAgICAgdmlld0NvbnRhaW5lclJlZjogdGhpcy52aWV3Q29udGFpbmVyUmVmLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgdGhpcy5tb2RhbFNlcnZpY2Uuc2hvd01vZGFsKERpYWxvZ0NvbnRlbnQsIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoZGlhbG9nUmVzdWx0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZGlhbG9nUmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGxldCBkaWxvZ1Jlc3VsdFRlbXAgPSBkaWFsb2dSZXN1bHQ7XG4gICAgICAgICAgICAgICAgICAgIC8vIGlmIChkaWFsb2dSZXN1bHQuaW5kZXhPZignX1RFTVAnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdFx0ZGlsb2dSZXN1bHRUZW1wID0gZGlsb2dSZXN1bHRUZW1wLnJlcGxhY2UoJ19URU1QJyArIGksICcnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHR9XG4gICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUcmFuc2Zvcm1lZEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGh1bWJOYWlsSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGRpYWxvZ1Jlc3VsdCwgJ0FkZCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlT3JnOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChmaWxlUGF0aE9yZyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdGaWxlT3JnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU9yZy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUZpbGU6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGltZ1VSSSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nVVJJRmlsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ1VSSUZpbGUucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUb2RvIDogdG8gYmUgcmVtb3ZlZCBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVXJpQ29udG91clBhdGggPSBpbWdVUkkuc3Vic3RyaW5nKDAsIGltZ1VSSS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VSSUNvbnRvdXJGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVcmlDb250b3VyUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nVVJJQ29udG91ckZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklDb250b3VyRmlsZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyAtIEVuZFxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgaW1nVVJJLCAnUmVtb3ZlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdDb3VsZG5vdCBkZWxldGUgdGhlIGZpbGUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgdHJhbnNmb3JtZWQgaW1hZ2UuXG4gICAgICogQHBhcmFtIGltZ1VSSVBhcmFtIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgVVJJXG4gICAgICovXG4gICAgc2V0VHJhbnNmb3JtZWRJbWFnZShpbWdVUklQYXJhbTogYW55KSB7XG4gICAgICAgIGlmIChpbWdVUklQYXJhbSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2V0dGluZyBpbWFnZSBpbiBwcmV2aWV3IGFyZWEnICsgZSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGFrZSBwaWN0dXJlIHBhcmFtcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLnRha2VQaWNQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMudGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gSE9SSVpPTlRBTF9DRU5URVJcbiAgICAgICAgdGhpcy50YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBpbWFnZSBwYXJhbXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5hdXRvZm9jdXNQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gJzMwMCc7XG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmhlaWdodCA9ICczMDAnO1xuICAgICAgICB0aGlzLmF1dG9mb2N1c1BhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQ0VOVEVSXG4gICAgICAgIHRoaXMuYXV0b2ZvY3VzUGFyYW1zLmFkZFJ1bGUoMTMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGltYWdlIHJlc291cmNlLlxuICAgICAqIEBwYXJhbSBidG4gQnV0dG9uIGltYWdlIGluc3RhbmNlIHJlZmVycmVuY2VcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgSWNvbiBuYW1lXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJbWFnZVJlc291cmNlKGJ0bjogYW55LCBpY29uTmFtZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoaWNvbk5hbWUpO1xuICAgICAgICBidG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGltYWdlIGdhbGxlcnkgcGFyYW1zLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMud2lkdGggPSAnMTAwJztcbiAgICAgICAgdGhpcy5nYWxsZXJ5UGFyYW1zLmhlaWdodCA9ICcxMDAnO1xuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLmdhbGxlcnlQYXJhbXMuYWRkUnVsZSgxMik7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9MRUZUXG4gICAgICAgIHRoaXMuZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIGNhcHR1cmVkIGltYWdlcyBpbiBtZWRpYSBzdG9yZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgQ2FwdHVyZWQgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGltZ1VSSSBUcmFuc2Zvcm1lZCBJbWFnZSBmaWxlIFVSSVxuICAgICAqIEBwYXJhbSBhY3Rpb24gQWN0aW9ucyAnQWRkJy8nUmVtb3ZlJ1xuICAgICAqL1xuICAgIHByaXZhdGUgcmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVQYXRoT3JnKTtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdGhpcyB0aHVtYm5haWwgaW1hZ2Ugd2lsbCBiZSBhdmFpbGFibGUgb25seSBpbiAnQWRkJyBjYXNlLlxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ0FkZCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBpbWdVUkkucmVwbGFjZSgnUFRfSU1HJywgJ3RodW1iX1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aHVtbmFpbE9yZ1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhbGVydCgnQ291bGQgbm90IHN5bmMgdGhlIGZpbGUgJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRodW1ibmFpbCBpbWFnZS5cbiAgICAgKiBAcGFyYW0gaW1nVVJJIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGh1bWJOYWlsSW1hZ2UoaW1nVVJJOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsSW1hZ2VQYXRoID0gb3BlbmN2LmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB2YXIgdGh1bWJuYWlsSW1hZ2VQYXRoID0gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShkc3RJbWdVUkkpO1xuXG4gICAgICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoJ2ZpbGU6Ly8nICsgdGh1bWJuYWlsSW1hZ2VQYXRoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FsbGVyeUJ0bi5zZXRJbWFnZVVSSSh1cmkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiBQZXJmb3JtIGFkYXB0aXZlIHRocmVzaG9sZC5cbiAgICAvLyAgKiBAcGFyYW0gdGhyZXNob2xkVmFsdWUgVGhyZXNob2xkIHZhbHVlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBwZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhyZXNob2xkVmFsdWU6IGFueSk6IHZvaWQge1xuICAgIC8vICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1nRW1wdHkgPSB0aGlzLmltZ1VSSSArICc/dHM9JyArIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIC8vICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nRW1wdHk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAvLyAgICAgICAgIHRoaXMuaW1nVVJJID0gb3BlbmN2LnBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aGlzLndyYXBwZWRJbWFnZSwgdGhpcy5maWxlTmFtZSwgdGhyZXNob2xkVmFsdWUpO1xuICAgIC8vICAgICAgICAgLy8gdGhpcy5faXNJbWFnZUJ0blZpc2libGUgPSB0cnVlO1xuICAgIC8vICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSBmaWxlUGF0aCBDYXB0dXJlZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZpbGVQYXRoOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGltZ1VSSVRlbXAgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgsICcnKTtcbiAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gaW1nVVJJVGVtcC5zdWJzdHJpbmcoMCwgaW1nVVJJVGVtcC5pbmRleE9mKCdSUFRTVFInKSk7XG4gICAgICAgICAgICBjb25zdCByZWN0YW5nbGVQb2ludHNTdHIgPSBpbWdVUklUZW1wLnN1YnN0cmluZyhpbWdVUklUZW1wLmluZGV4T2YoJ1JQVFNUUicpKTtcbiAgICAgICAgICAgIHRoaXMuc2hvd0NhcHR1cmVkUGljdHVyZURpYWxvZyh0cnVlLCBmaWxlUGF0aCwgdGhpcy5pbWdVUkksIHJlY3RhbmdsZVBvaW50c1N0cik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIHdoaWxlIHBlcmZvcm1pbmcgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gcHJvY2Vzcy4gUGxlYXNlIHJldGFrZSBwaWN0dXJlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogbG9hZCBpbWFnZXMuXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgSW1hZ2VBc3NldCBvYmplY3QgaW5zdGFuY2UgcmVmZXJyZW5jZVxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZEltYWdlKGltYWdlQXNzZXQ6IEltYWdlQXNzZXQpOiB2b2lkIHtcbiAgICAgICAgaWYgKGltYWdlQXNzZXQpIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcblxuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZS5mcm9tQXNzZXQoaW1hZ2VBc3NldCkudGhlbihcbiAgICAgICAgICAgICAgICAoaW1nU3JjKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWdTcmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZwID0gKGltYWdlQXNzZXQuaW9zKSA/IGltYWdlQXNzZXQuaW9zIDogaW1hZ2VBc3NldC5hbmRyb2lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZwLmluZGV4T2YoJy5wbmcnKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBmcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1nVVJJO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZnApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnSW1hZ2Ugc291cmNlIGlzIGJhZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBhbGVydCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ltYWdlIEFzc2V0IHdhcyBudWxsJyk7XG4gICAgICAgICAgICBhbGVydCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmVtcHR5O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19