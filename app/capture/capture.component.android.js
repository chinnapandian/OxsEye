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
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var dialog_component_1 = require("../dialog/dialog.component");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var router_1 = require("@angular/router");
var opencv = require("nativescript-opencv-plugin");
var Toast = require("nativescript-toast");
var application = require("tns-core-modules/application");
var fs = require("file-system");
/**
 * Capture component class
 */
var CaptureComponent = (function () {
    /**
     * Constructor for CaptureComponent.
     * @param zone Angular zone to run a task asynchronously.
     * @param modalService
     * @param viewContainerRef
     * @param router
     * @param activityLoader
     */
    function CaptureComponent(zone, modalService, viewContainerRef, router, activityLoader) {
        this.zone = zone;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this.router = router;
        this.activityLoader = activityLoader;
        /** Empty string variable */
        this._empty = null;
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
     * @param args
     */
    CaptureComponent.prototype.camLoaded = function (args) {
        console.log('***** _cam loaded *****');
        this._cam = args.object;
        var flashMode = this._cam.getFlashMode();
        // Turn flash on at startup
        if (flashMode === 'off') {
            this._cam.toggleFlash();
        }
        var cb = new android.hardware.Camera.AutoFocusMoveCallback({
            _this: this,
            onAutoFocusMoving: function (start, camera) {
                var animate = this._this._autofocusBtn.animate();
                if (!start) {
                    animate.scaleX(1);
                    animate.scaleY(1);
                    // Green color
                    var color = android.graphics.Color.parseColor('#008000');
                    this._this._autofocusBtn.setColorFilter(color);
                }
                else {
                    animate.scaleX(0.50);
                    animate.scaleY(0.50);
                    animate.setDuration(100);
                    // Red color
                    var color = android.graphics.Color.parseColor('#ff0000');
                    this._this._autofocusBtn.setColorFilter(color);
                    animate.start();
                }
            },
        });
        if (this._cam.camera) {
            this._cam.camera.setAutoFocusMoveCallback(cb);
        }
        if (args.data) {
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
        // this._cam.showCaptureIcon = true;
        // this._cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    };
    /**
     * Initialize Camera Button.
     */
    CaptureComponent.prototype.initCameraButton = function () {
        this._cam.nativeView.removeView(this._takePicBtn);
        this._cam.nativeView.addView(this._takePicBtn, this._takePicParams);
    };
    /**
     * initialize image gallery button.
     */
    CaptureComponent.prototype.initImageGalleryButton = function () {
        this._cam.nativeView.removeView(this._galleryBtn);
        this._cam.nativeView.addView(this._galleryBtn, this._galleryParams);
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
    };
    /**
     * initialize auto focus image button.
     */
    CaptureComponent.prototype.initAutoFocusImageButton = function () {
        this._cam.nativeView.removeView(this._autofocusBtn);
        this._cam.nativeView.addView(this._autofocusBtn, this._autofocusParams);
    };
    /**
     * Create take picture button.
     */
    CaptureComponent.prototype.createTakePictureButton = function () {
        var _this = this;
        this._takePicBtn = this.createImageButton();
        this.setImageResource(this._takePicBtn, 'ic_camera');
        // let takePicDrawable = this.getImageDrawable('ic_camera');
        // this._takePicBtn.setImageResource(takePicDrawable);
        var shape = this.createTransparentCircleDrawable();
        this._takePicBtn.setBackgroundDrawable(shape);
        var color = android.graphics.Color.parseColor('#ffffff'); // white color
        this._takePicBtn.setColorFilter(color);
        // this._takePicBtn.setScaleX(0.50);
        // this._takePicBtn.setScaleY(0.50);
        this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
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
        this._autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this._autofocusBtn, 'ic_auto_focus_black');
        // let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        // this._autofocusBtn.setImageResource(openGalleryDrawable);
        var shape = this.createAutofocusShape();
        this._autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
    };
    /**
     * Create auto focus image button.
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
        this._galleryBtn = this.createImageButton();
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this._galleryBtn.setImageResource(openGalleryDrawable);
        var galleryBtnId = application.android.context.getResources()
            .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());
        this._galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this._galleryBtn.setContentDescription('gallery-btn-dec');
        var shape = this.createTransparentCircleDrawable();
        this._galleryBtn.setBackgroundDrawable(shape);
        this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick: function (args) {
                _this.goImageGallery();
            },
        }));
        this.createImageGallerryParams();
    };
    /**
     * Gets image drawable image id
     * @param iconName
     */
    CaptureComponent.prototype.getImageDrawable = function (iconName) {
        var drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    };
    /**
     * Create transparent circle shape.
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
     */
    CaptureComponent.prototype.createAutofocusShape = function () {
        var shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    };
    /**
     * Create image button.
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
     * @param args
     */
    CaptureComponent.prototype.imagesSelectedEvent = function (args) {
        console.log('IMAGES SELECTED EVENT!!!');
        this.loadImage(args.data[0]);
    };
    /**
     * Photo captured event.
     * @param args
     */
    CaptureComponent.prototype.photoCapturedEvent = function (args) {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(args.data);
    };
    /**
     * Toggle camera event.
     * @param args
     */
    CaptureComponent.prototype.toggleCameraEvent = function (args) {
        console.log('camera toggled');
    };
    /**
     * Toggle flash on camera.
     */
    CaptureComponent.prototype.toggleFlashOnCam = function () {
        this._cam.toggleFlash();
    };
    /**
     * Toggle showing flash icon.
     */
    CaptureComponent.prototype.toggleShowingFlashIcon = function () {
        console.log("showFlashIcon = " + this._cam.showFlashIcon);
        this._cam.showFlashIcon = !this._cam.showFlashIcon;
    };
    /**
     * Toggle camera.
     */
    CaptureComponent.prototype.toggleTheCamera = function () {
        this._cam.toggleCamera();
    };
    /**
     * Open camera library.
     */
    CaptureComponent.prototype.openCamPlusLibrary = function () {
        this._cam.chooseFromLibrary();
    };
    /**
     * Take picture from camera.
     * @param thisParam
     */
    CaptureComponent.prototype.takePicFromCam = function (thisParam) {
        thisParam.activityLoader.show();
        thisParam._cam.takePicture({ saveToGallery: true });
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
     * @param fullScreen
     * @param filePathOrg
     * @param imgURI
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
     * @param imgURIParam
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
     * On page loaded.
     * @param args
     */
    CaptureComponent.prototype.onPageLoaded = function (args) {
        // this._page = args.object as Page;
    };
    /**
     * Create take picture params.
     */
    CaptureComponent.prototype.createTakePictureParams = function () {
        this._takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._takePicParams.width = '100';
        this._takePicParams.height = '100';
        this._takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this._takePicParams.addRule(12);
        // HORIZONTAL_CENTER
        this._takePicParams.addRule(11);
    };
    /**
     * Create auto focus image params.
     */
    CaptureComponent.prototype.createAutoFocusImageParams = function () {
        this._autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._autofocusParams.width = '300';
        this._autofocusParams.height = '300';
        this._autofocusParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_CENTER
        this._autofocusParams.addRule(13);
    };
    /**
     * Sets image resource.
     * @param btn
     * @param iconName
     */
    CaptureComponent.prototype.setImageResource = function (btn, iconName) {
        var openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    };
    /**
     * Create image gallery params.
     */
    CaptureComponent.prototype.createImageGallerryParams = function () {
        this._galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._galleryParams.width = '100';
        this._galleryParams.height = '100';
        this._galleryParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this._galleryParams.addRule(12);
        // ALIGN_PARENT_LEFT
        this._galleryParams.addRule(9);
    };
    /**
     * Refresh captured images in media store.
     * @param filePathOrg
     * @param imgURI
     * @param action
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
     * @param imgURI
     */
    CaptureComponent.prototype.createThumbNailImage = function (imgURI) {
        try {
            var thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);
            var uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            this._galleryBtn.setImageURI(uri);
        }
        catch (e) {
            console.log('Error while creating thumbnail image. ' + e);
        }
    };
    // /**
    //  * Perform adaptive threshold.
    //  * @param thresholdValue 
    //  * @param sargs 
    //  */
    // private performAdaptiveThreshold(thresholdValue: any, sargs: any): void {
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
     * @param filePath
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
     * @param imageAsset
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
                    _this.imageSource = _this._empty;
                    alert('Image source is bad.');
                }
            }, function (err) {
                _this.imageSource = _this._empty;
                console.error(err);
                alert('Error getting image source from asset');
            });
        }
        else {
            console.log('Image Asset was null');
            alert('Image Asset was null');
            this.imageSource = this._empty;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBOEc7QUFHOUcsOERBQTREO0FBSTVELGtFQUEyRjtBQUMzRiwrREFBMkQ7QUFHM0QsaUZBQXlFO0FBQ3pFLG9GQUE0RTtBQUM1RSwwQ0FBeUM7QUFDekMsbURBQXFEO0FBQ3JELDBDQUE0QztBQUM1QywwREFBNEQ7QUFDNUQsZ0NBQWtDO0FBRWxDOztHQUVHO0FBT0gsSUFBYSxnQkFBZ0I7SUE0QnpCOzs7Ozs7O09BT0c7SUFDSCwwQkFDWSxJQUFZLEVBQ1osWUFBZ0MsRUFDaEMsZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCxjQUE4QjtRQUo5QixTQUFJLEdBQUosSUFBSSxDQUFRO1FBQ1osaUJBQVksR0FBWixZQUFZLENBQW9CO1FBQ2hDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQTFCMUMsNEJBQTRCO1FBQ3BCLFdBQU0sR0FBUSxJQUFJLENBQUM7UUFHM0IsK0JBQStCO1FBQ3hCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO0lBd0JwRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLG1DQUFtQztRQUNuQyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsb0JBQW9CLEVBQUUs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S0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNuQixLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQ0osQ0FBQztRQUNOLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUNwQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDbkMsQ0FBQztJQUNMLENBQUM7SUFDTCx1QkFBQztBQUFELENBQUMsQUFqa0JELElBaWtCQztBQWprQlksZ0JBQWdCO0lBTjVCLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsWUFBWTtRQUN0QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMseUJBQXlCLENBQUM7UUFDdEMsV0FBVyxFQUFFLDBCQUEwQjtLQUMxQyxDQUFDO3FDQXNDb0IsYUFBTTtRQUNFLGlDQUFrQjtRQUNkLHVCQUFnQjtRQUMxQixlQUFNO1FBQ0Usc0NBQWM7R0F6Q2pDLGdCQUFnQixDQWlrQjVCO0FBamtCWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE5nWm9uZSwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuaW1wb3J0IHsgSW1hZ2VBc3NldCB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2UtYXNzZXQnO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ltYWdlJztcbmltcG9ydCB7IFZpZXcgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2NvcmUvdmlldyc7XG5pbXBvcnQgeyBNb2RhbERpYWxvZ09wdGlvbnMsIE1vZGFsRGlhbG9nU2VydmljZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZyc7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IH0gZnJvbSAnLi4vaW1hZ2VnYWxsZXJ5L2ltYWdlZ2FsbGVyeS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCAqIGFzIG9wZW5jdiBmcm9tICduYXRpdmVzY3JpcHQtb3BlbmN2LXBsdWdpbic7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmaWxlLXN5c3RlbSc7XG5cbi8qKlxuICogQ2FwdHVyZSBjb21wb25lbnQgY2xhc3NcbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1jYXB0dXJlJyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYXB0dXJlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgQ2FwdHVyZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgICAvKiogQ2FtZXJhIGluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHByaXZhdGUgX2NhbTogYW55O1xuICAgIC8qKiBHYWxsZXJ5IGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIF9nYWxsZXJ5QnRuOiBhbnk7XG4gICAgLyoqIFRha2UgcGljdHVyZSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBfdGFrZVBpY0J0bjogYW55O1xuICAgIC8qKiBBdXRvIGZvY3VzIGJ1dHRvbi4gKi9cbiAgICBwcml2YXRlIF9hdXRvZm9jdXNCdG46IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgR2FsbGVyeSBidXR0b24uICovXG4gICAgcHJpdmF0ZSBfZ2FsbGVyeVBhcmFtczogYW55O1xuICAgIC8qKiBQYXJhbWF0ZXJzIHVzZWQgdG8gZGlzcGxheSBUYWtlIHBpY3R1cmUgYnV0dG9uLiAqL1xuICAgIHByaXZhdGUgX3Rha2VQaWNQYXJhbXM6IGFueTtcbiAgICAvKiogUGFyYW1hdGVycyB1c2VkIHRvIGRpc3BsYXkgYXV0byBmb2N1cyBidXR0b24uICovXG4gICAgcHJpdmF0ZSBfYXV0b2ZvY3VzUGFyYW1zOiBhbnk7XG4gICAgLyoqIEVtcHR5IHN0cmluZyB2YXJpYWJsZSAqL1xuICAgIHByaXZhdGUgX2VtcHR5OiBhbnkgPSBudWxsO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIGNoZWNrIHRoZSBjYW1lcmEgaXMgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2FtZXJhVmlzaWJsZTogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBzb3VyY2UgKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgLyoqIE9yaWdpbmFsIEltYWdlIHNvdXJjZS4gKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2VPcmc6IGFueTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgVVJJICovXG4gICAgcHVibGljIGltZ1VSSTogYW55O1xuICAgIC8qKiBPcGVuQ1YgaW5zdGFuY2UgdmFyaWFibGUuICovXG4gICAgcHVibGljIG9wZW5jdkluc3RhbmNlOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgQ2FwdHVyZUNvbXBvbmVudC5cbiAgICAgKiBAcGFyYW0gem9uZSBBbmd1bGFyIHpvbmUgdG8gcnVuIGEgdGFzayBhc3luY2hyb25vdXNseS5cbiAgICAgKiBAcGFyYW0gbW9kYWxTZXJ2aWNlIFxuICAgICAqIEBwYXJhbSB2aWV3Q29udGFpbmVyUmVmIFxuICAgICAqIEBwYXJhbSByb3V0ZXIgXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgLy8gcHJpdmF0ZSBfY2hhbmdlRGV0ZWN0aW9uUmVmOiBDaGFuZ2VEZXRlY3RvclJlZlxuICAgICkge1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemF0aW9uIG1ldGhvZCBjYWxsZWQgd2hpbGUgYW5ndWxhciBpbml0aWFsaXplLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSW5pdGlhbGl6aW5nIE9wZW5DVi4uLicpO1xuICAgICAgICB0aGlzLm9wZW5jdkluc3RhbmNlID0gb3BlbmN2LmluaXRPcGVuQ1YoKTtcbiAgICAgICAgdGhpcy5pc0NhbWVyYVZpc2libGUgPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXN0cm95IG1ldGhvZCBjYWxsZWQgd2hpbGUgYW5ndWxhciBkZXN0cm95cy4gXG4gICAgICovXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdEZXN0cm95IGNhbGxlZC4uLicpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gY2hlY2sgY2FtZXJhIGxvYWRlZCBvciBub3QgYWxvbmcgd2l0aCBzb21lXG4gICAgICogY2FtZXJhIHNldHRpbmdzIGluaXRpYWxpemF0aW9uLlxuICAgICAqIEBwYXJhbSBhcmdzXG4gICAgICovXG4gICAgY2FtTG9hZGVkKGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnKioqKiogX2NhbSBsb2FkZWQgKioqKionKTtcbiAgICAgICAgdGhpcy5fY2FtID0gYXJncy5vYmplY3QgYXMgQ2FtZXJhUGx1cztcblxuICAgICAgICBjb25zdCBmbGFzaE1vZGUgPSB0aGlzLl9jYW0uZ2V0Rmxhc2hNb2RlKCk7XG5cbiAgICAgICAgLy8gVHVybiBmbGFzaCBvbiBhdCBzdGFydHVwXG4gICAgICAgIGlmIChmbGFzaE1vZGUgPT09ICdvZmYnKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW0udG9nZ2xlRmxhc2goKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYiA9IG5ldyBhbmRyb2lkLmhhcmR3YXJlLkNhbWVyYS5BdXRvRm9jdXNNb3ZlQ2FsbGJhY2soXG5cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBfdGhpczogdGhpcyxcbiAgICAgICAgICAgICAgICBvbkF1dG9Gb2N1c01vdmluZyhzdGFydDogYW55LCBjYW1lcmE6IGFueSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhbmltYXRlID0gdGhpcy5fdGhpcy5fYXV0b2ZvY3VzQnRuLmFuaW1hdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyZWVuIGNvbG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignIzAwODAwMCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdGhpcy5fYXV0b2ZvY3VzQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVYKDAuNTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVkoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNldER1cmF0aW9uKDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBSZWQgY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjZmYwMDAwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLl9hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIGlmICh0aGlzLl9jYW0uY2FtZXJhKSB7XG4gICAgICAgICAgICB0aGlzLl9jYW0uY2FtZXJhLnNldEF1dG9Gb2N1c01vdmVDYWxsYmFjayhjYik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFyZ3MuZGF0YSkge1xuXG4gICAgICAgICAgICB0aGlzLl9jYW0uc2hvd0ZsYXNoSWNvbiA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMuX2NhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdENhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fdGFrZVBpY0J0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fZ2FsbGVyeUJ0biA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV0b2ZvY3VzQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9nYWxsZXJ5UGFyYW1zID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRvZm9jdXNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbS5zaG93VG9nZ2xlSWNvbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9jYW0uX2luaXRGbGFzaEJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbS5faW5pdFRvZ2dsZUNhbWVyYUJ1dHRvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVEVTVCBUSEUgSUNPTlMgU0hPV0lORy9ISURJTkdcbiAgICAgICAgLy8gdGhpcy5fY2FtLnNob3dDYXB0dXJlSWNvbiA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMuX2NhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5jYW1lcmFQbHVzLnNob3dHYWxsZXJ5SWNvbiA9IGZhbHNlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd1RvZ2dsZUljb24gPSBmYWxzZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBDYW1lcmEgQnV0dG9uLlxuICAgICAqL1xuICAgIGluaXRDYW1lcmFCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuX2NhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5fdGFrZVBpY0J0bik7XG4gICAgICAgIHRoaXMuX2NhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5fdGFrZVBpY0J0biwgdGhpcy5fdGFrZVBpY1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemUgaW1hZ2UgZ2FsbGVyeSBidXR0b24uXG4gICAgICovXG4gICAgaW5pdEltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5fY2FtLm5hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLl9nYWxsZXJ5QnRuKTtcbiAgICAgICAgdGhpcy5fY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLl9nYWxsZXJ5QnRuLCB0aGlzLl9nYWxsZXJ5UGFyYW1zKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuX2dhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIGluaXRpYWxpemUgYXV0byBmb2N1cyBpbWFnZSBidXR0b24uXG4gICAgICovXG4gICAgaW5pdEF1dG9Gb2N1c0ltYWdlQnV0dG9uKCkge1xuICAgICAgICB0aGlzLl9jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuX2F1dG9mb2N1c0J0bik7XG4gICAgICAgIHRoaXMuX2NhbS5uYXRpdmVWaWV3LmFkZFZpZXcodGhpcy5fYXV0b2ZvY3VzQnRuLCB0aGlzLl9hdXRvZm9jdXNQYXJhbXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGFrZSBwaWN0dXJlIGJ1dHRvbi5cbiAgICAgKi9cbiAgICBjcmVhdGVUYWtlUGljdHVyZUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl90YWtlUGljQnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5fdGFrZVBpY0J0biwgJ2ljX2NhbWVyYScpO1xuICAgICAgICAvLyBsZXQgdGFrZVBpY0RyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKCdpY19jYW1lcmEnKTtcbiAgICAgICAgLy8gdGhpcy5fdGFrZVBpY0J0bi5zZXRJbWFnZVJlc291cmNlKHRha2VQaWNEcmF3YWJsZSk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuX3Rha2VQaWNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZmZmZmYnKTsgLy8gd2hpdGUgY29sb3JcbiAgICAgICAgdGhpcy5fdGFrZVBpY0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgIC8vIHRoaXMuX3Rha2VQaWNCdG4uc2V0U2NhbGVYKDAuNTApO1xuICAgICAgICAvLyB0aGlzLl90YWtlUGljQnRuLnNldFNjYWxlWSgwLjUwKTtcbiAgICAgICAgdGhpcy5fdGFrZVBpY0J0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLnRha2VQaWNGcm9tQ2FtKF90aGlzKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBpbWFnZS5cbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvRm9jdXNJbWFnZSgpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl9hdXRvZm9jdXNCdG4gPSB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLl9hdXRvZm9jdXNCdG4sICdpY19hdXRvX2ZvY3VzX2JsYWNrJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcbiAgICAgICAgLy8gdGhpcy5fYXV0b2ZvY3VzQnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVBdXRvZm9jdXNTaGFwZSgpO1xuICAgICAgICB0aGlzLl9hdXRvZm9jdXNCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBpbWFnZSBidXR0b24uXG4gICAgICovXG4gICAgY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTogYW55IHtcbiAgICAgICAgY29uc3QgYnRuID0gbmV3IGFuZHJvaWQud2lkZ2V0LkltYWdlVmlldyhhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoMTU4KTtcbiAgICAgICAgYnRuLnNldE1heFdpZHRoKDE1OCk7XG4gICAgICAgIGJ0bi5zZXRTY2FsZVR5cGUoYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3LlNjYWxlVHlwZS5DRU5URVJfQ1JPUCk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjMDA4MDAwJyk7IC8vIEdyZWVuIGNvbG9yXG4gICAgICAgIGJ0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG4gICAgICAgIHJldHVybiBidG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbWFnZSBnYWxsZXJ5IGJ1dHRvbi5cbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKSB7XG4gICAgICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5fZ2FsbGVyeUJ0biA9IHRoaXMuY3JlYXRlSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuX2dhbGxlcnlCdG4sICdpY19waG90b19saWJyYXJ5X3doaXRlJyk7XG5cbiAgICAgICAgLy8gbGV0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICAgICAgLy8gdGhpcy5fZ2FsbGVyeUJ0bi5zZXRJbWFnZVJlc291cmNlKG9wZW5HYWxsZXJ5RHJhd2FibGUpO1xuXG4gICAgICAgIGNvbnN0IGdhbGxlcnlCdG5JZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoJ2dhbGxlcnlfYnRuJywgJ2lkJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuXG4gICAgICAgIHRoaXMuX2dhbGxlcnlCdG4uc2V0VGFnKGdhbGxlcnlCdG5JZCwgJ2dhbGxlcnktYnRuLXRhZycpO1xuICAgICAgICB0aGlzLl9nYWxsZXJ5QnRuLnNldENvbnRlbnREZXNjcmlwdGlvbignZ2FsbGVyeS1idG4tZGVjJyk7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gdGhpcy5jcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk7XG4gICAgICAgIHRoaXMuX2dhbGxlcnlCdG4uc2V0QmFja2dyb3VuZERyYXdhYmxlKHNoYXBlKTtcbiAgICAgICAgdGhpcy5fZ2FsbGVyeUJ0bi5zZXRPbkNsaWNrTGlzdGVuZXIobmV3IGFuZHJvaWQudmlldy5WaWV3Lk9uQ2xpY2tMaXN0ZW5lcih7XG4gICAgICAgICAgICBvbkNsaWNrKGFyZ3M6IGFueSkge1xuICAgICAgICAgICAgICAgIF90aGlzLmdvSW1hZ2VHYWxsZXJ5KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMuY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIGltYWdlIGRyYXdhYmxlIGltYWdlIGlkXG4gICAgICogQHBhcmFtIGljb25OYW1lIFxuICAgICAqL1xuICAgIGdldEltYWdlRHJhd2FibGUoaWNvbk5hbWU6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IGRyYXdhYmxlSWQgPSBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHRcbiAgICAgICAgICAgIC5nZXRSZXNvdXJjZXMoKVxuICAgICAgICAgICAgLmdldElkZW50aWZpZXIoaWNvbk5hbWUsICdkcmF3YWJsZScsIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5nZXRQYWNrYWdlTmFtZSgpKTtcbiAgICAgICAgcmV0dXJuIGRyYXdhYmxlSWQ7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0cmFuc3BhcmVudCBjaXJjbGUgc2hhcGUuXG4gICAgICovXG4gICAgY3JlYXRlVHJhbnNwYXJlbnRDaXJjbGVEcmF3YWJsZSgpOiBhbnkge1xuICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBhbmRyb2lkLmdyYXBoaWNzLmRyYXdhYmxlLkdyYWRpZW50RHJhd2FibGUoKTtcbiAgICAgICAgc2hhcGUuc2V0Q29sb3IoMHg5OTAwMDAwMCk7XG4gICAgICAgIHNoYXBlLnNldENvcm5lclJhZGl1cyg5Nik7XG4gICAgICAgIHNoYXBlLnNldEFscGhhKDE1MCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGF1dG8gZm9jdXMgc2hhcGUuXG4gICAgICovXG4gICAgY3JlYXRlQXV0b2ZvY3VzU2hhcGUoKTogYW55IHtcblxuICAgICAgICBjb25zdCBzaGFwZSA9IG5ldyBhbmRyb2lkLmdyYXBoaWNzLmRyYXdhYmxlLlNoYXBlRHJhd2FibGUoKTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMCk7XG4gICAgICAgIHJldHVybiBzaGFwZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGltYWdlIGJ1dHRvbi5cbiAgICAgKi9cbiAgICBjcmVhdGVJbWFnZUJ1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VCdXR0b24oYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0KTtcbiAgICAgICAgYnRuLnNldFBhZGRpbmcoMzQsIDM0LCAzNCwgMzQpO1xuICAgICAgICBidG4uc2V0TWF4SGVpZ2h0KDU4KTtcbiAgICAgICAgYnRuLnNldE1heFdpZHRoKDU4KTtcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW1hZ2Ugc2VsZWN0ZWQgZXZlbnQuXG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKi9cbiAgICBpbWFnZXNTZWxlY3RlZEV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnSU1BR0VTIFNFTEVDVEVEIEVWRU5UISEhJyk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKChhcmdzLmRhdGEgYXMgSW1hZ2VBc3NldFtdKVswXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBob3RvIGNhcHR1cmVkIGV2ZW50LlxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIHBob3RvQ2FwdHVyZWRFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1BIT1RPIENBUFRVUkVEIEVWRU5UISEhJyk7XG4gICAgICAgIHRoaXMubG9hZEltYWdlKGFyZ3MuZGF0YSBhcyBJbWFnZUFzc2V0KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGNhbWVyYSBldmVudC5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICB0b2dnbGVDYW1lcmFFdmVudChhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2NhbWVyYSB0b2dnbGVkJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBmbGFzaCBvbiBjYW1lcmEuXG4gICAgICovXG4gICAgdG9nZ2xlRmxhc2hPbkNhbSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2FtLnRvZ2dsZUZsYXNoKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRvZ2dsZSBzaG93aW5nIGZsYXNoIGljb24uXG4gICAgICovXG4gICAgdG9nZ2xlU2hvd2luZ0ZsYXNoSWNvbigpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coYHNob3dGbGFzaEljb24gPSAke3RoaXMuX2NhbS5zaG93Rmxhc2hJY29ufWApO1xuICAgICAgICB0aGlzLl9jYW0uc2hvd0ZsYXNoSWNvbiA9ICF0aGlzLl9jYW0uc2hvd0ZsYXNoSWNvbjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVUaGVDYW1lcmEoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NhbS50b2dnbGVDYW1lcmEoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT3BlbiBjYW1lcmEgbGlicmFyeS5cbiAgICAgKi9cbiAgICBvcGVuQ2FtUGx1c0xpYnJhcnkoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuX2NhbS5jaG9vc2VGcm9tTGlicmFyeSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUYWtlIHBpY3R1cmUgZnJvbSBjYW1lcmEuXG4gICAgICogQHBhcmFtIHRoaXNQYXJhbSBcbiAgICAgKi9cbiAgICB0YWtlUGljRnJvbUNhbSh0aGlzUGFyYW06IGFueSk6IHZvaWQge1xuICAgICAgICB0aGlzUGFyYW0uYWN0aXZpdHlMb2FkZXIuc2hvdygpO1xuICAgICAgICB0aGlzUGFyYW0uX2NhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR28gdG8gaW1hZ2UgZ2FsbGVyeS5cbiAgICAgKi9cbiAgICBnb0ltYWdlR2FsbGVyeSgpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydpbWFnZWdhbGxlcnknXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2dcbiAgICAgKiBAcGFyYW0gZnVsbFNjcmVlbiBcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgXG4gICAgICogQHBhcmFtIGltZ1VSSSBcbiAgICAgKi9cbiAgICBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxTY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCByZWNQb2ludHNTdHIpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uczogTW9kYWxEaWFsb2dPcHRpb25zID0ge1xuICAgICAgICAgICAgY29udGV4dDoge1xuICAgICAgICAgICAgICAgIGltYWdlU291cmNlOiBpbWdVUkksXG4gICAgICAgICAgICAgICAgaW1hZ2VTb3VyY2VPcmc6IGZpbGVQYXRoT3JnLFxuICAgICAgICAgICAgICAgIGlzQXV0b0NvcnJlY3Rpb246IHRydWUsXG4gICAgICAgICAgICAgICAgcmVjdGFuZ2xlUG9pbnRzOiByZWNQb2ludHNTdHIsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbHNjcmVlbjogZnVsbFNjcmVlbixcbiAgICAgICAgICAgIHZpZXdDb250YWluZXJSZWY6IHRoaXMudmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgIHRoaXMubW9kYWxTZXJ2aWNlLnNob3dNb2RhbChEaWFsb2dDb250ZW50LCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGRpYWxvZ1Jlc3VsdDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGRpYWxvZ1Jlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBsZXQgZGlsb2dSZXN1bHRUZW1wID0gZGlhbG9nUmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZGlhbG9nUmVzdWx0LmluZGV4T2YoJ19URU1QJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0Zm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gXHRcdGRpbG9nUmVzdWx0VGVtcCA9IGRpbG9nUmVzdWx0VGVtcC5yZXBsYWNlKCdfVEVNUCcgKyBpLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0fVxuICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtZWRJbWFnZShkaWFsb2dSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZVRodW1iTmFpbEltYWdlKGRpYWxvZ1Jlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBkaWFsb2dSZXN1bHQsICdBZGQnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nRmlsZU9yZzogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoZmlsZVBhdGhPcmcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nRmlsZU9yZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVPcmcucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklGaWxlOiBmcy5GaWxlID0gZnMuRmlsZS5mcm9tUGF0aChpbWdVUkkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUZpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdVUklGaWxlLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVG9kbyA6IHRvIGJlIHJlbW92ZWQgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ1VyaUNvbnRvdXJQYXRoID0gaW1nVVJJLnN1YnN0cmluZygwLCBpbWdVUkkuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdVUklDb250b3VyRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVXJpQ29udG91clBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1VSSUNvbnRvdXJGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nVVJJQ29udG91ckZpbGUucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VyaUNvbnRvdXJQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRvZG8gLSBFbmRcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoQ2FwdHVyZWRJbWFnZXNpbk1lZGlhU3RvcmUoZmlsZVBhdGhPcmcsIGltZ1VSSSwgJ1JlbW92ZScpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnQ291bGRub3QgZGVsZXRlIHRoZSBmaWxlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0IHRyYW5zZm9ybWVkIGltYWdlLlxuICAgICAqIEBwYXJhbSBpbWdVUklQYXJhbSBcbiAgICAgKi9cbiAgICBzZXRUcmFuc2Zvcm1lZEltYWdlKGltZ1VSSVBhcmFtOiBhbnkpIHtcbiAgICAgICAgaWYgKGltZ1VSSVBhcmFtKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGltZ1VSSVBhcmFtO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWdVUkkpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBzZXR0aW5nIGltYWdlIGluIHByZXZpZXcgYXJlYScgKyBlLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwYWdlIGxvYWRlZC5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvblBhZ2VMb2FkZWQoYXJnczogYW55KSB7XG4gICAgICAgIC8vIHRoaXMuX3BhZ2UgPSBhcmdzLm9iamVjdCBhcyBQYWdlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgdGFrZSBwaWN0dXJlIHBhcmFtcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCkge1xuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zLndpZHRoID0gJzEwMCc7XG4gICAgICAgIHRoaXMuX3Rha2VQaWNQYXJhbXMuaGVpZ2h0ID0gJzEwMCc7XG4gICAgICAgIHRoaXMuX3Rha2VQaWNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0JPVFRPTVxuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTIpO1xuICAgICAgICAvLyBIT1JJWk9OVEFMX0NFTlRFUlxuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zLmFkZFJ1bGUoMTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBpbWFnZSBwYXJhbXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVBdXRvRm9jdXNJbWFnZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zID0gbmV3IGFuZHJvaWQud2lkZ2V0LlJlbGF0aXZlTGF5b3V0LkxheW91dFBhcmFtcygtMiwgLTIpO1xuICAgICAgICB0aGlzLl9hdXRvZm9jdXNQYXJhbXMud2lkdGggPSAnMzAwJztcbiAgICAgICAgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zLmhlaWdodCA9ICczMDAnO1xuICAgICAgICB0aGlzLl9hdXRvZm9jdXNQYXJhbXMuc2V0TWFyZ2lucyg4LCA4LCA4LCA4KTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0NFTlRFUlxuICAgICAgICB0aGlzLl9hdXRvZm9jdXNQYXJhbXMuYWRkUnVsZSgxMyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgaW1hZ2UgcmVzb3VyY2UuXG4gICAgICogQHBhcmFtIGJ0biBcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXRJbWFnZVJlc291cmNlKGJ0bjogYW55LCBpY29uTmFtZTogYW55KSB7XG4gICAgICAgIGNvbnN0IG9wZW5HYWxsZXJ5RHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoaWNvbk5hbWUpO1xuICAgICAgICBidG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGltYWdlIGdhbGxlcnkgcGFyYW1zLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlSW1hZ2VHYWxsZXJyeVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLl9nYWxsZXJ5UGFyYW1zLmhlaWdodCA9ICcxMDAnO1xuICAgICAgICB0aGlzLl9nYWxsZXJ5UGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gQUxJR05fUEFSRU5UX0xFRlRcbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcy5hZGRSdWxlKDkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZWZyZXNoIGNhcHR1cmVkIGltYWdlcyBpbiBtZWRpYSBzdG9yZS5cbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgXG4gICAgICogQHBhcmFtIGltZ1VSSSBcbiAgICAgKiBAcGFyYW0gYWN0aW9uIFxuICAgICAqL1xuICAgIHByaXZhdGUgcmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nLCBhY3Rpb246IHN0cmluZykge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVQYXRoT3JnKTtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdGhpcyB0aHVtYm5haWwgaW1hZ2Ugd2lsbCBiZSBhdmFpbGFibGUgb25seSBpbiAnQWRkJyBjYXNlLlxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ0FkZCcpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBpbWdVUkkucmVwbGFjZSgnUFRfSU1HJywgJ3RodW1iX1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aHVtbmFpbE9yZ1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBhbGVydCgnQ291bGQgbm90IHN5bmMgdGhlIGZpbGUgJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRodW1ibmFpbCBpbWFnZS5cbiAgICAgKiBAcGFyYW0gaW1nVVJJIFxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlVGh1bWJOYWlsSW1hZ2UoaW1nVVJJOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsSW1hZ2VQYXRoID0gb3BlbmN2LmNyZWF0ZVRodW1ibmFpbEltYWdlKGltZ1VSSSk7XG4gICAgICAgICAgICAvLyB2YXIgdGh1bWJuYWlsSW1hZ2VQYXRoID0gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gY29tLm1hYXMub3BlbmN2NG5hdGl2ZXNjcmlwdC5PcGVuQ1ZVdGlscy5jcmVhdGVUaHVtYm5haWxJbWFnZShkc3RJbWdVUkkpO1xuXG4gICAgICAgICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLm5ldC5VcmkucGFyc2UoJ2ZpbGU6Ly8nICsgdGh1bWJuYWlsSW1hZ2VQYXRoKTtcbiAgICAgICAgICAgIHRoaXMuX2dhbGxlcnlCdG4uc2V0SW1hZ2VVUkkodXJpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIGNyZWF0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogUGVyZm9ybSBhZGFwdGl2ZSB0aHJlc2hvbGQuXG4gICAgLy8gICogQHBhcmFtIHRocmVzaG9sZFZhbHVlIFxuICAgIC8vICAqIEBwYXJhbSBzYXJncyBcbiAgICAvLyAgKi9cbiAgICAvLyBwcml2YXRlIHBlcmZvcm1BZGFwdGl2ZVRocmVzaG9sZCh0aHJlc2hvbGRWYWx1ZTogYW55LCBzYXJnczogYW55KTogdm9pZCB7XG4gICAgLy8gICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgdGhpcy5pbWdFbXB0eSA9IHRoaXMuaW1nVVJJICsgJz90cz0nICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgLy8gICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdFbXB0eTtcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgdGhpcy5pbWdVUkkgPSBvcGVuY3YucGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRoaXMud3JhcHBlZEltYWdlLCB0aGlzLmZpbGVOYW1lLCB0aHJlc2hvbGRWYWx1ZSk7XG4gICAgLy8gICAgICAgICAvLyB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgLy8gICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIFxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGg6IGFueSk6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgaW1nVVJJVGVtcCA9IG9wZW5jdi5wZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmaWxlUGF0aCwgJycpO1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklUZW1wLnN1YnN0cmluZygwLCBpbWdVUklUZW1wLmluZGV4T2YoJ1JQVFNUUicpKTtcbiAgICAgICAgICAgIGNvbnN0IHJlY3RhbmdsZVBvaW50c1N0ciA9IGltZ1VSSVRlbXAuc3Vic3RyaW5nKGltZ1VSSVRlbXAuaW5kZXhPZignUlBUU1RSJykpO1xuICAgICAgICAgICAgdGhpcy5zaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKHRydWUsIGZpbGVQYXRoLCB0aGlzLmltZ1VSSSwgcmVjdGFuZ2xlUG9pbnRzU3RyKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICBhbGVydCgnRXJyb3Igd2hpbGUgcGVyZm9ybWluZyBwZXJzcGVjdGl2ZSB0cmFuc2Zvcm1hdGlvbiBwcm9jZXNzLiBQbGVhc2UgcmV0YWtlIHBpY3R1cmUnKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBsb2FkIGltYWdlcy5cbiAgICAgKiBAcGFyYW0gaW1hZ2VBc3NldCBcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRJbWFnZShpbWFnZUFzc2V0OiBJbWFnZUFzc2V0KTogdm9pZCB7XG4gICAgICAgIGlmIChpbWFnZUFzc2V0KSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG5cbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UuZnJvbUFzc2V0KGltYWdlQXNzZXQpLnRoZW4oXG4gICAgICAgICAgICAgICAgKGltZ1NyYykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW1nU3JjKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmcCA9IChpbWFnZUFzc2V0LmlvcykgPyBpbWFnZUFzc2V0LmlvcyA6IGltYWdlQXNzZXQuYW5kcm9pZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcC5pbmRleE9mKCcucG5nJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gZnA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1QZXJzcGVjdGl2ZVRyYW5zZm9ybWF0aW9uKGZwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KCdJbWFnZSBzb3VyY2UgaXMgYmFkLicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9lbXB0eTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICBhbGVydCgnRXJyb3IgZ2V0dGluZyBpbWFnZSBzb3VyY2UgZnJvbSBhc3NldCcpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0ltYWdlIEFzc2V0IHdhcyBudWxsJyk7XG4gICAgICAgICAgICBhbGVydCgnSW1hZ2UgQXNzZXQgd2FzIG51bGwnKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9lbXB0eTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==