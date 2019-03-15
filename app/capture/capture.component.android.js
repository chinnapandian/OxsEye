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
var CaptureComponent = (function () {
    /**
     * Constructor for CaptureComponent.
     * @param zone
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
        this._isAutomaticChecked = false;
        this._empty = null;
        this.imageSource = new image_source_1.ImageSource();
    }
    /**
     * Initialization method called while angular initialize.
     */
    CaptureComponent.prototype.ngOnInit = function () {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this._isImageBtnVisible = false;
        this.isBusy = false;
        this._isAutomaticChecked = true;
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
        this.isBusy = false;
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
        thisParam.isBusy = true;
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
    CaptureComponent.prototype.showCapturedPictureDialog = function (fullScreen, filePathOrg, imgURI) {
        var _this = this;
        var options = {
            context: {
                imageSource: imgURI,
                imageSourceOrg: filePathOrg,
                isAutoCorrection: true,
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
                this._isImageBtnVisible = true;
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
        this._page = args.object;
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
    /**
     * Perform adaptive threshold.
     * @param thresholdValue
     * @param sargs
     */
    CaptureComponent.prototype.performAdaptiveThreshold = function (thresholdValue, sargs) {
        var _this = this;
        this.zone.run(function () {
            _this.imgEmpty = _this.imgURI + '?ts=' + new Date().getTime();
            _this.imageSource = _this.imgEmpty;
        });
        this.zone.run(function () {
            _this.imgURI = opencv.performAdaptiveThreshold(_this.wrappedImage, _this.fileName, thresholdValue);
            _this._isImageBtnVisible = true;
            _this.imageSource = _this.imgURI;
        });
    };
    /**
     * Perform perspective transformation.
     * @param filePath
     */
    CaptureComponent.prototype.performPerspectiveTransformation = function (filePath) {
        try {
            this.imgURI = opencv.performPerspectiveTransformation(filePath, '');
            this.isBusy = false;
            this.showCapturedPictureDialog(true, filePath, this.imgURI);
        }
        catch (err) {
            console.log(err);
            this.isBusy = false;
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
    })
    /**
     * Capture component class
     */
    ,
    __metadata("design:paramtypes", [core_1.NgZone,
        modal_dialog_1.ModalDialogService,
        core_1.ViewContainerRef,
        router_1.Router,
        activityloader_common_1.ActivityLoader])
], CaptureComponent);
exports.CaptureComponent = CaptureComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdHVyZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNhcHR1cmUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBOEc7QUFHOUcsOERBQTREO0FBSTVELGtFQUEyRjtBQUMzRiwrREFBMkQ7QUFHM0QsaUZBQXlFO0FBQ3pFLG9GQUE0RTtBQUM1RSwwQ0FBeUM7QUFDekMsbURBQXFEO0FBQ3JELDBDQUE0QztBQUM1QywwREFBNEQ7QUFDNUQsZ0NBQWtDO0FBWWxDLElBQWEsZ0JBQWdCO0lBeUJ6Qjs7Ozs7OztPQU9HO0lBQ0gsMEJBQ1ksSUFBWSxFQUNaLFlBQWdDLEVBQ2hDLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2QsY0FBOEI7UUFKOUIsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUNaLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUEzQmxDLHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQUM1QixXQUFNLEdBQVEsSUFBSSxDQUFDO1FBR3BCLGdCQUFXLEdBQWdCLElBQUksMEJBQVcsRUFBRSxDQUFDO0lBMEJwRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQ0FBUSxHQUFSO1FBQ0ksT0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTFDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO1FBQzVCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7UUFDaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQztRQUVo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RztnQkFDQSxLQUFJLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ25CLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQ25ELENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3BDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1lBQzlCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNuQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLHVCQUFDO0FBQUQsQ0FBQyxBQXhqQkQsSUF3akJDO0FBeGpCWSxnQkFBZ0I7SUFWNUIsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxZQUFZO1FBQ3RCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyx5QkFBeUIsQ0FBQztRQUN0QyxXQUFXLEVBQUUsMEJBQTBCO0tBQzFDLENBQUM7SUFFRjs7T0FFRzs7cUNBbUNtQixhQUFNO1FBQ0UsaUNBQWtCO1FBQ2QsdUJBQWdCO1FBQzFCLGVBQU07UUFDRSxzQ0FBYztHQXRDakMsZ0JBQWdCLENBd2pCNUI7QUF4akJZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tICdAbnN0dWRpby9uYXRpdmVzY3JpcHQtY2FtZXJhLXBsdXMnO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBJbWFnZUFzc2V0IH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1hc3NldCc7XG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvaW1hZ2UnO1xuaW1wb3J0IHsgVmlldyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvY29yZS92aWV3JztcbmltcG9ydCB7IE1vZGFsRGlhbG9nT3B0aW9ucywgTW9kYWxEaWFsb2dTZXJ2aWNlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJbWFnZUdhbGxlcnlDb21wb25lbnQgfSBmcm9tICcuLi9pbWFnZWdhbGxlcnkvaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZpbGUtc3lzdGVtJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1jYXB0dXJlJyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2NhcHR1cmUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYXB0dXJlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5cbi8qKlxuICogQ2FwdHVyZSBjb21wb25lbnQgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIENhcHR1cmVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSBfY2FtOiBhbnk7XG4gICAgcHJpdmF0ZSBfaXNJbWFnZUJ0blZpc2libGU6IGFueTtcbiAgICBwcml2YXRlIF90cmFuc2Zvcm1lZEZpbGVQYXRoOiBhbnk7XG4gICAgcHJpdmF0ZSBfcGFnZTogYW55O1xuICAgIHByaXZhdGUgX2dhbGxlcnlCdG46IGFueTtcbiAgICBwcml2YXRlIF90YWtlUGljQnRuOiBhbnk7XG4gICAgcHJpdmF0ZSBfYXV0b2ZvY3VzQnRuOiBhbnk7XG4gICAgcHJpdmF0ZSBfZ2FsbGVyeVBhcmFtczogYW55O1xuICAgIHByaXZhdGUgX3Rha2VQaWNQYXJhbXM6IGFueTtcbiAgICBwcml2YXRlIF9hdXRvZm9jdXNQYXJhbXM6IGFueTtcbiAgICBwcml2YXRlIF9pc0F1dG9tYXRpY0NoZWNrZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlIF9lbXB0eTogYW55ID0gbnVsbDtcblxuICAgIHB1YmxpYyBpc0NhbWVyYVZpc2libGU6IGFueTtcbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgcHVibGljIGltZ1VSSTogYW55O1xuICAgIHB1YmxpYyB3cmFwcGVkSW1hZ2U6IGFueTtcbiAgICBwdWJsaWMgZmlsZU5hbWU6IGFueTtcbiAgICBwdWJsaWMgb3BlbmN2SW5zdGFuY2U6IGFueTtcbiAgICBwdWJsaWMgaW1nRW1wdHk6IGFueTtcbiAgICBwdWJsaWMgaXNCdXN5OiBhbnk7XG4gICAgcHVibGljIHNjcmVlbkhlaWdodDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIENhcHR1cmVDb21wb25lbnQuXG4gICAgICogQHBhcmFtIHpvbmUgXG4gICAgICogQHBhcmFtIG1vZGFsU2VydmljZSBcbiAgICAgKiBAcGFyYW0gdmlld0NvbnRhaW5lclJlZiBcbiAgICAgKiBAcGFyYW0gcm91dGVyIFxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSB6b25lOiBOZ1pvbmUsXG4gICAgICAgIHByaXZhdGUgbW9kYWxTZXJ2aWNlOiBNb2RhbERpYWxvZ1NlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgdmlld0NvbnRhaW5lclJlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIC8vIHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWZcbiAgICApIHtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXphdGlvbiBtZXRob2QgY2FsbGVkIHdoaWxlIGFuZ3VsYXIgaW5pdGlhbGl6ZS5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0luaXRpYWxpemluZyBPcGVuQ1YuLi4nKTtcbiAgICAgICAgdGhpcy5vcGVuY3ZJbnN0YW5jZSA9IG9wZW5jdi5pbml0T3BlbkNWKCk7XG5cbiAgICAgICAgdGhpcy5pc0NhbWVyYVZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9pc0F1dG9tYXRpY0NoZWNrZWQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgdGhpcy5jcmVhdGVBdXRvRm9jdXNJbWFnZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlc3Ryb3kgbWV0aG9kIGNhbGxlZCB3aGlsZSBhbmd1bGFyIGRlc3Ryb3lzLiBcbiAgICAgKi9cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0Rlc3Ryb3kgY2FsbGVkLi4uJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBjaGVjayBjYW1lcmEgbG9hZGVkIG9yIG5vdCBhbG9uZyB3aXRoIHNvbWVcbiAgICAgKiBjYW1lcmEgc2V0dGluZ3MgaW5pdGlhbGl6YXRpb24uXG4gICAgICogQHBhcmFtIGFyZ3NcbiAgICAgKi9cbiAgICBjYW1Mb2FkZWQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcqKioqKiBfY2FtIGxvYWRlZCAqKioqKicpO1xuICAgICAgICB0aGlzLmlzQnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9jYW0gPSBhcmdzLm9iamVjdCBhcyBDYW1lcmFQbHVzO1xuXG4gICAgICAgIGNvbnN0IGZsYXNoTW9kZSA9IHRoaXMuX2NhbS5nZXRGbGFzaE1vZGUoKTtcblxuICAgICAgICAvLyBUdXJuIGZsYXNoIG9uIGF0IHN0YXJ0dXBcbiAgICAgICAgaWYgKGZsYXNoTW9kZSA9PT0gJ29mZicpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbS50b2dnbGVGbGFzaCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNiID0gbmV3IGFuZHJvaWQuaGFyZHdhcmUuQ2FtZXJhLkF1dG9Gb2N1c01vdmVDYWxsYmFjayhcblxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIF90aGlzOiB0aGlzLFxuICAgICAgICAgICAgICAgIG9uQXV0b0ZvY3VzTW92aW5nKHN0YXJ0OiBhbnksIGNhbWVyYTogYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFuaW1hdGUgPSB0aGlzLl90aGlzLl9hdXRvZm9jdXNCdG4uYW5pbWF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWCgxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2NhbGVZKDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR3JlZW4gY29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbG9yID0gYW5kcm9pZC5ncmFwaGljcy5Db2xvci5wYXJzZUNvbG9yKCcjMDA4MDAwJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl90aGlzLl9hdXRvZm9jdXNCdG4uc2V0Q29sb3JGaWx0ZXIoY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZS5zY2FsZVgoMC41MCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlLnNjYWxlWSgwLjUwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc2V0RHVyYXRpb24oMTAwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFJlZCBjb2xvclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyNmZjAwMDAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3RoaXMuX2F1dG9mb2N1c0J0bi5zZXRDb2xvckZpbHRlcihjb2xvcik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGUuc3RhcnQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuX2NhbS5jYW1lcmEpIHtcbiAgICAgICAgICAgIHRoaXMuX2NhbS5jYW1lcmEuc2V0QXV0b0ZvY3VzTW92ZUNhbGxiYWNrKGNiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJncy5kYXRhKSB7XG5cbiAgICAgICAgICAgIHRoaXMuX2NhbS5zaG93Rmxhc2hJY29uID0gdHJ1ZTtcblxuICAgICAgICAgICAgdGhpcy5fY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0Q2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl90YWtlUGljQnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9nYWxsZXJ5QnRuID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLl9hdXRvZm9jdXNCdG4gPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX3Rha2VQaWNQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX2dhbGxlcnlQYXJhbXMgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuX2F1dG9mb2N1c1BhcmFtcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtLnNob3dUb2dnbGVJY29uID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlVGFrZVBpY3R1cmVCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRJbWFnZUdhbGxlcnlCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRDYW1lcmFCdXR0b24oKTtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRBdXRvRm9jdXNJbWFnZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2NhbS5faW5pdEZsYXNoQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fY2FtLl9pbml0VG9nZ2xlQ2FtZXJhQnV0dG9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBURVNUIFRIRSBJQ09OUyBTSE9XSU5HL0hJRElOR1xuICAgICAgICAvLyB0aGlzLl9jYW0uc2hvd0NhcHR1cmVJY29uID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5fY2FtLnNob3dGbGFzaEljb24gPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmNhbWVyYVBsdXMuc2hvd0dhbGxlcnlJY29uID0gZmFsc2U7XG4gICAgICAgIC8vIHRoaXMuY2FtZXJhUGx1cy5zaG93VG9nZ2xlSWNvbiA9IGZhbHNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIENhbWVyYSBCdXR0b24uXG4gICAgICovXG4gICAgaW5pdENhbWVyYUJ1dHRvbigpIHtcbiAgICAgICAgdGhpcy5fY2FtLm5hdGl2ZVZpZXcucmVtb3ZlVmlldyh0aGlzLl90YWtlUGljQnRuKTtcbiAgICAgICAgdGhpcy5fY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLl90YWtlUGljQnRuLCB0aGlzLl90YWtlUGljUGFyYW1zKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogaW5pdGlhbGl6ZSBpbWFnZSBnYWxsZXJ5IGJ1dHRvbi5cbiAgICAgKi9cbiAgICBpbml0SW1hZ2VHYWxsZXJ5QnV0dG9uKCkge1xuICAgICAgICB0aGlzLl9jYW0ubmF0aXZlVmlldy5yZW1vdmVWaWV3KHRoaXMuX2dhbGxlcnlCdG4pO1xuICAgICAgICB0aGlzLl9jYW0ubmF0aXZlVmlldy5hZGRWaWV3KHRoaXMuX2dhbGxlcnlCdG4sIHRoaXMuX2dhbGxlcnlQYXJhbXMpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5fZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogaW5pdGlhbGl6ZSBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbi5cbiAgICAgKi9cbiAgICBpbml0QXV0b0ZvY3VzSW1hZ2VCdXR0b24oKSB7XG4gICAgICAgIHRoaXMuX2NhbS5uYXRpdmVWaWV3LnJlbW92ZVZpZXcodGhpcy5fYXV0b2ZvY3VzQnRuKTtcbiAgICAgICAgdGhpcy5fY2FtLm5hdGl2ZVZpZXcuYWRkVmlldyh0aGlzLl9hdXRvZm9jdXNCdG4sIHRoaXMuX2F1dG9mb2N1c1BhcmFtcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0YWtlIHBpY3R1cmUgYnV0dG9uLlxuICAgICAqL1xuICAgIGNyZWF0ZVRha2VQaWN0dXJlQnV0dG9uKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3Rha2VQaWNCdG4gPSB0aGlzLmNyZWF0ZUltYWdlQnV0dG9uKCk7XG4gICAgICAgIHRoaXMuc2V0SW1hZ2VSZXNvdXJjZSh0aGlzLl90YWtlUGljQnRuLCAnaWNfY2FtZXJhJyk7XG4gICAgICAgIC8vIGxldCB0YWtlUGljRHJhd2FibGUgPSB0aGlzLmdldEltYWdlRHJhd2FibGUoJ2ljX2NhbWVyYScpO1xuICAgICAgICAvLyB0aGlzLl90YWtlUGljQnRuLnNldEltYWdlUmVzb3VyY2UodGFrZVBpY0RyYXdhYmxlKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy5fdGFrZVBpY0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGFuZHJvaWQuZ3JhcGhpY3MuQ29sb3IucGFyc2VDb2xvcignI2ZmZmZmZicpOyAvLyB3aGl0ZSBjb2xvclxuICAgICAgICB0aGlzLl90YWtlUGljQnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgLy8gdGhpcy5fdGFrZVBpY0J0bi5zZXRTY2FsZVgoMC41MCk7XG4gICAgICAgIC8vIHRoaXMuX3Rha2VQaWNCdG4uc2V0U2NhbGVZKDAuNTApO1xuICAgICAgICB0aGlzLl90YWtlUGljQnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ2xpY2soYXJnczogYW55KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMudGFrZVBpY0Zyb21DYW0oX3RoaXMpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLmNyZWF0ZVRha2VQaWN0dXJlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhdXRvIGZvY3VzIGltYWdlLlxuICAgICAqL1xuICAgIGNyZWF0ZUF1dG9Gb2N1c0ltYWdlKCkge1xuICAgICAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX2F1dG9mb2N1c0J0biA9IHRoaXMuY3JlYXRlQXV0b0ZvY3VzSW1hZ2VCdXR0b24oKTtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVJlc291cmNlKHRoaXMuX2F1dG9mb2N1c0J0biwgJ2ljX2F1dG9fZm9jdXNfYmxhY2snKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfYXV0b19mb2N1c19ibGFjaycpO1xuICAgICAgICAvLyB0aGlzLl9hdXRvZm9jdXNCdG4uc2V0SW1hZ2VSZXNvdXJjZShvcGVuR2FsbGVyeURyYXdhYmxlKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZUF1dG9mb2N1c1NoYXBlKCk7XG4gICAgICAgIHRoaXMuX2F1dG9mb2N1c0J0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLmNyZWF0ZUF1dG9Gb2N1c0ltYWdlUGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhdXRvIGZvY3VzIGltYWdlIGJ1dHRvbi5cbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvRm9jdXNJbWFnZUJ1dHRvbigpOiBhbnkge1xuICAgICAgICBjb25zdCBidG4gPSBuZXcgYW5kcm9pZC53aWRnZXQuSW1hZ2VWaWV3KGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCk7XG4gICAgICAgIGJ0bi5zZXRQYWRkaW5nKDM0LCAzNCwgMzQsIDM0KTtcbiAgICAgICAgYnRuLnNldE1heEhlaWdodCgxNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoMTU4KTtcbiAgICAgICAgYnRuLnNldFNjYWxlVHlwZShhbmRyb2lkLndpZGdldC5JbWFnZVZpZXcuU2NhbGVUeXBlLkNFTlRFUl9DUk9QKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBhbmRyb2lkLmdyYXBoaWNzLkNvbG9yLnBhcnNlQ29sb3IoJyMwMDgwMDAnKTsgLy8gR3JlZW4gY29sb3JcbiAgICAgICAgYnRuLnNldENvbG9yRmlsdGVyKGNvbG9yKTtcbiAgICAgICAgcmV0dXJuIGJ0bjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGltYWdlIGdhbGxlcnkgYnV0dG9uLlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlR2FsbGVyeUJ1dHRvbigpIHtcbiAgICAgICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl9nYWxsZXJ5QnRuID0gdGhpcy5jcmVhdGVJbWFnZUJ1dHRvbigpO1xuICAgICAgICB0aGlzLnNldEltYWdlUmVzb3VyY2UodGhpcy5fZ2FsbGVyeUJ0biwgJ2ljX3Bob3RvX2xpYnJhcnlfd2hpdGUnKTtcblxuICAgICAgICAvLyBsZXQgb3BlbkdhbGxlcnlEcmF3YWJsZSA9IHRoaXMuZ2V0SW1hZ2VEcmF3YWJsZSgnaWNfcGhvdG9fbGlicmFyeV93aGl0ZScpO1xuICAgICAgICAvLyB0aGlzLl9nYWxsZXJ5QnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG5cbiAgICAgICAgY29uc3QgZ2FsbGVyeUJ0bklkID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcignZ2FsbGVyeV9idG4nLCAnaWQnLCBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ2V0UGFja2FnZU5hbWUoKSk7XG5cbiAgICAgICAgdGhpcy5fZ2FsbGVyeUJ0bi5zZXRUYWcoZ2FsbGVyeUJ0bklkLCAnZ2FsbGVyeS1idG4tdGFnJyk7XG4gICAgICAgIHRoaXMuX2dhbGxlcnlCdG4uc2V0Q29udGVudERlc2NyaXB0aW9uKCdnYWxsZXJ5LWJ0bi1kZWMnKTtcbiAgICAgICAgY29uc3Qgc2hhcGUgPSB0aGlzLmNyZWF0ZVRyYW5zcGFyZW50Q2lyY2xlRHJhd2FibGUoKTtcbiAgICAgICAgdGhpcy5fZ2FsbGVyeUJ0bi5zZXRCYWNrZ3JvdW5kRHJhd2FibGUoc2hhcGUpO1xuICAgICAgICB0aGlzLl9nYWxsZXJ5QnRuLnNldE9uQ2xpY2tMaXN0ZW5lcihuZXcgYW5kcm9pZC52aWV3LlZpZXcuT25DbGlja0xpc3RlbmVyKHtcbiAgICAgICAgICAgIG9uQ2xpY2soYXJnczogYW55KSB7XG4gICAgICAgICAgICAgICAgX3RoaXMuZ29JbWFnZUdhbGxlcnkoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJbWFnZUdhbGxlcnJ5UGFyYW1zKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgaW1hZ2UgZHJhd2FibGUgaW1hZ2UgaWRcbiAgICAgKiBAcGFyYW0gaWNvbk5hbWUgXG4gICAgICovXG4gICAgZ2V0SW1hZ2VEcmF3YWJsZShpY29uTmFtZTogYW55KTogYW55IHtcbiAgICAgICAgY29uc3QgZHJhd2FibGVJZCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dFxuICAgICAgICAgICAgLmdldFJlc291cmNlcygpXG4gICAgICAgICAgICAuZ2V0SWRlbnRpZmllcihpY29uTmFtZSwgJ2RyYXdhYmxlJywgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdldFBhY2thZ2VOYW1lKCkpO1xuICAgICAgICByZXR1cm4gZHJhd2FibGVJZDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRyYW5zcGFyZW50IGNpcmNsZSBzaGFwZS5cbiAgICAgKi9cbiAgICBjcmVhdGVUcmFuc3BhcmVudENpcmNsZURyYXdhYmxlKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuR3JhZGllbnREcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRDb2xvcigweDk5MDAwMDAwKTtcbiAgICAgICAgc2hhcGUuc2V0Q29ybmVyUmFkaXVzKDk2KTtcbiAgICAgICAgc2hhcGUuc2V0QWxwaGEoMTUwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYXV0byBmb2N1cyBzaGFwZS5cbiAgICAgKi9cbiAgICBjcmVhdGVBdXRvZm9jdXNTaGFwZSgpOiBhbnkge1xuXG4gICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IGFuZHJvaWQuZ3JhcGhpY3MuZHJhd2FibGUuU2hhcGVEcmF3YWJsZSgpO1xuICAgICAgICBzaGFwZS5zZXRBbHBoYSgwKTtcbiAgICAgICAgcmV0dXJuIHNoYXBlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgaW1hZ2UgYnV0dG9uLlxuICAgICAqL1xuICAgIGNyZWF0ZUltYWdlQnV0dG9uKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IGJ0biA9IG5ldyBhbmRyb2lkLndpZGdldC5JbWFnZUJ1dHRvbihhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQpO1xuICAgICAgICBidG4uc2V0UGFkZGluZygzNCwgMzQsIDM0LCAzNCk7XG4gICAgICAgIGJ0bi5zZXRNYXhIZWlnaHQoNTgpO1xuICAgICAgICBidG4uc2V0TWF4V2lkdGgoNTgpO1xuICAgICAgICByZXR1cm4gYnRuO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbWFnZSBzZWxlY3RlZCBldmVudC5cbiAgICAgKiBAcGFyYW0gYXJnc1xuICAgICAqL1xuICAgIGltYWdlc1NlbGVjdGVkRXZlbnQoYXJnczogYW55KTogdm9pZCB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdJTUFHRVMgU0VMRUNURUQgRVZFTlQhISEnKTtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2UoKGFyZ3MuZGF0YSBhcyBJbWFnZUFzc2V0W10pWzBdKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGhvdG8gY2FwdHVyZWQgZXZlbnQuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgcGhvdG9DYXB0dXJlZEV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnUEhPVE8gQ0FQVFVSRUQgRVZFTlQhISEnKTtcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2UoYXJncy5kYXRhIGFzIEltYWdlQXNzZXQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgY2FtZXJhIGV2ZW50LlxuICAgICAqIEBwYXJhbSBhcmdzIFxuICAgICAqL1xuICAgIHRvZ2dsZUNhbWVyYUV2ZW50KGFyZ3M6IGFueSk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZygnY2FtZXJhIHRvZ2dsZWQnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVG9nZ2xlIGZsYXNoIG9uIGNhbWVyYS5cbiAgICAgKi9cbiAgICB0b2dnbGVGbGFzaE9uQ2FtKCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9jYW0udG9nZ2xlRmxhc2goKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVG9nZ2xlIHNob3dpbmcgZmxhc2ggaWNvbi5cbiAgICAgKi9cbiAgICB0b2dnbGVTaG93aW5nRmxhc2hJY29uKCk6IHZvaWQge1xuICAgICAgICBjb25zb2xlLmxvZyhgc2hvd0ZsYXNoSWNvbiA9ICR7dGhpcy5fY2FtLnNob3dGbGFzaEljb259YCk7XG4gICAgICAgIHRoaXMuX2NhbS5zaG93Rmxhc2hJY29uID0gIXRoaXMuX2NhbS5zaG93Rmxhc2hJY29uO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUb2dnbGUgY2FtZXJhLlxuICAgICAqL1xuICAgIHRvZ2dsZVRoZUNhbWVyYSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2FtLnRvZ2dsZUNhbWVyYSgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPcGVuIGNhbWVyYSBsaWJyYXJ5LlxuICAgICAqL1xuICAgIG9wZW5DYW1QbHVzTGlicmFyeSgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5fY2FtLmNob29zZUZyb21MaWJyYXJ5KCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRha2UgcGljdHVyZSBmcm9tIGNhbWVyYS5cbiAgICAgKiBAcGFyYW0gdGhpc1BhcmFtIFxuICAgICAqL1xuICAgIHRha2VQaWNGcm9tQ2FtKHRoaXNQYXJhbTogYW55KTogdm9pZCB7XG4gICAgICAgIHRoaXNQYXJhbS5pc0J1c3kgPSB0cnVlO1xuICAgICAgICB0aGlzUGFyYW0uYWN0aXZpdHlMb2FkZXIuc2hvdygpO1xuICAgICAgICB0aGlzUGFyYW0uX2NhbS50YWtlUGljdHVyZSh7IHNhdmVUb0dhbGxlcnk6IHRydWUgfSk7XG4gICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR28gdG8gaW1hZ2UgZ2FsbGVyeS5cbiAgICAgKi9cbiAgICBnb0ltYWdlR2FsbGVyeSgpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydpbWFnZWdhbGxlcnknXSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3cgY2FwdHVyZWQgcGljdHVyZSBkaWFsb2dcbiAgICAgKiBAcGFyYW0gZnVsbFNjcmVlbiBcbiAgICAgKiBAcGFyYW0gZmlsZVBhdGhPcmcgXG4gICAgICogQHBhcmFtIGltZ1VSSSBcbiAgICAgKi9cbiAgICBzaG93Q2FwdHVyZWRQaWN0dXJlRGlhbG9nKGZ1bGxTY3JlZW46IGJvb2xlYW4sIGZpbGVQYXRoT3JnOiBzdHJpbmcsIGltZ1VSSTogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnM6IE1vZGFsRGlhbG9nT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNvbnRleHQ6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNvdXJjZTogaW1nVVJJLFxuICAgICAgICAgICAgICAgIGltYWdlU291cmNlT3JnOiBmaWxlUGF0aE9yZyxcbiAgICAgICAgICAgICAgICBpc0F1dG9Db3JyZWN0aW9uOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxzY3JlZW46IGZ1bGxTY3JlZW4sXG4gICAgICAgICAgICB2aWV3Q29udGFpbmVyUmVmOiB0aGlzLnZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB0aGlzLm1vZGFsU2VydmljZS5zaG93TW9kYWwoRGlhbG9nQ29udGVudCwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChkaWFsb2dSZXN1bHQ6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChkaWFsb2dSZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGRpbG9nUmVzdWx0VGVtcCA9IGRpYWxvZ1Jlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGRpYWxvZ1Jlc3VsdC5pbmRleE9mKCdfVEVNUCcpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBcdGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFx0XHRkaWxvZ1Jlc3VsdFRlbXAgPSBkaWxvZ1Jlc3VsdFRlbXAucmVwbGFjZSgnX1RFTVAnICsgaSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAvLyBcdH1cbiAgICAgICAgICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFRyYW5zZm9ybWVkSW1hZ2UoZGlhbG9nUmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVUaHVtYk5haWxJbWFnZShkaWFsb2dSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZywgZGlhbG9nUmVzdWx0LCAnQWRkJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0ZpbGVPcmc6IGZzLkZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKGZpbGVQYXRoT3JnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ0ZpbGVPcmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWdGaWxlT3JnLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nVVJJRmlsZTogZnMuRmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgoaW1nVVJJKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdVUklGaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1nVVJJRmlsZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaENhcHR1cmVkSW1hZ2VzaW5NZWRpYVN0b3JlKGZpbGVQYXRoT3JnLCBpbWdVUkksICdSZW1vdmUnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0NvdWxkbm90IGRlbGV0ZSB0aGUgZmlsZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldCB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gXG4gICAgICovXG4gICAgc2V0VHJhbnNmb3JtZWRJbWFnZShpbWdVUklQYXJhbTogYW55KSB7XG4gICAgICAgIGlmIChpbWdVUklQYXJhbSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0ltYWdlQnRuVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBpbWdVUklQYXJhbTtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gaW1nVVJJUGFyYW07XG4gICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1nVVJJKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2V0dGluZyBpbWFnZSBpbiBwcmV2aWV3IGFyZWEnICsgZSwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFnZSBsb2FkZWQuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25QYWdlTG9hZGVkKGFyZ3M6IGFueSkge1xuICAgICAgICB0aGlzLl9wYWdlID0gYXJncy5vYmplY3QgYXMgUGFnZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIHRha2UgcGljdHVyZSBwYXJhbXMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVUYWtlUGljdHVyZVBhcmFtcygpIHtcbiAgICAgICAgdGhpcy5fdGFrZVBpY1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5fdGFrZVBpY1BhcmFtcy53aWR0aCA9ICcxMDAnO1xuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zLmhlaWdodCA9ICcxMDAnO1xuICAgICAgICB0aGlzLl90YWtlUGljUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9CT1RUT01cbiAgICAgICAgdGhpcy5fdGFrZVBpY1BhcmFtcy5hZGRSdWxlKDEyKTtcbiAgICAgICAgLy8gSE9SSVpPTlRBTF9DRU5URVJcbiAgICAgICAgdGhpcy5fdGFrZVBpY1BhcmFtcy5hZGRSdWxlKDExKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGF1dG8gZm9jdXMgaW1hZ2UgcGFyYW1zLlxuICAgICAqL1xuICAgIHByaXZhdGUgY3JlYXRlQXV0b0ZvY3VzSW1hZ2VQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuX2F1dG9mb2N1c1BhcmFtcyA9IG5ldyBhbmRyb2lkLndpZGdldC5SZWxhdGl2ZUxheW91dC5MYXlvdXRQYXJhbXMoLTIsIC0yKTtcbiAgICAgICAgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zLndpZHRoID0gJzMwMCc7XG4gICAgICAgIHRoaXMuX2F1dG9mb2N1c1BhcmFtcy5oZWlnaHQgPSAnMzAwJztcbiAgICAgICAgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zLnNldE1hcmdpbnMoOCwgOCwgOCwgOCk7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9DRU5URVJcbiAgICAgICAgdGhpcy5fYXV0b2ZvY3VzUGFyYW1zLmFkZFJ1bGUoMTMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGltYWdlIHJlc291cmNlLlxuICAgICAqIEBwYXJhbSBidG4gXG4gICAgICogQHBhcmFtIGljb25OYW1lIFxuICAgICAqL1xuICAgIHByaXZhdGUgc2V0SW1hZ2VSZXNvdXJjZShidG46IGFueSwgaWNvbk5hbWU6IGFueSkge1xuICAgICAgICBjb25zdCBvcGVuR2FsbGVyeURyYXdhYmxlID0gdGhpcy5nZXRJbWFnZURyYXdhYmxlKGljb25OYW1lKTtcbiAgICAgICAgYnRuLnNldEltYWdlUmVzb3VyY2Uob3BlbkdhbGxlcnlEcmF3YWJsZSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBpbWFnZSBnYWxsZXJ5IHBhcmFtcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZUltYWdlR2FsbGVycnlQYXJhbXMoKSB7XG4gICAgICAgIHRoaXMuX2dhbGxlcnlQYXJhbXMgPSBuZXcgYW5kcm9pZC53aWRnZXQuUmVsYXRpdmVMYXlvdXQuTGF5b3V0UGFyYW1zKC0yLCAtMik7XG4gICAgICAgIHRoaXMuX2dhbGxlcnlQYXJhbXMud2lkdGggPSAnMTAwJztcbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcy5oZWlnaHQgPSAnMTAwJztcbiAgICAgICAgdGhpcy5fZ2FsbGVyeVBhcmFtcy5zZXRNYXJnaW5zKDgsIDgsIDgsIDgpO1xuICAgICAgICAvLyBBTElHTl9QQVJFTlRfQk9UVE9NXG4gICAgICAgIHRoaXMuX2dhbGxlcnlQYXJhbXMuYWRkUnVsZSgxMik7XG4gICAgICAgIC8vIEFMSUdOX1BBUkVOVF9MRUZUXG4gICAgICAgIHRoaXMuX2dhbGxlcnlQYXJhbXMuYWRkUnVsZSg5KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVmcmVzaCBjYXB0dXJlZCBpbWFnZXMgaW4gbWVkaWEgc3RvcmUuXG4gICAgICogQHBhcmFtIGZpbGVQYXRoT3JnIFxuICAgICAqIEBwYXJhbSBpbWdVUkkgXG4gICAgICogQHBhcmFtIGFjdGlvbiBcbiAgICAgKi9cbiAgICBwcml2YXRlIHJlZnJlc2hDYXB0dXJlZEltYWdlc2luTWVkaWFTdG9yZShmaWxlUGF0aE9yZzogc3RyaW5nLCBpbWdVUkk6IHN0cmluZywgYWN0aW9uOiBzdHJpbmcpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShmaWxlUGF0aE9yZyk7XG4gICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIHRoaXMgdGh1bWJuYWlsIGltYWdlIHdpbGwgYmUgYXZhaWxhYmxlIG9ubHkgaW4gJ0FkZCcgY2FzZS5cbiAgICAgICAgICAgIGlmIChhY3Rpb24gPT09ICdBZGQnKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gaW1nVVJJLnJlcGxhY2UoJ1BUX0lNRycsICd0aHVtYl9QVF9JTUcnKTtcbiAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGh1bW5haWxPcmdQYXRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYWxlcnQoJ0NvdWxkIG5vdCBzeW5jIHRoZSBmaWxlICcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSB0aHVtYm5haWwgaW1hZ2UuXG4gICAgICogQHBhcmFtIGltZ1VSSSBcbiAgICAgKi9cbiAgICBwcml2YXRlIGNyZWF0ZVRodW1iTmFpbEltYWdlKGltZ1VSSTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEltYWdlUGF0aCA9IG9wZW5jdi5jcmVhdGVUaHVtYm5haWxJbWFnZShpbWdVUkkpO1xuICAgICAgICAgICAgLy8gdmFyIHRodW1ibmFpbEltYWdlUGF0aCA9IGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoaW1nVVJJKTtcbiAgICAgICAgICAgIC8vIGNvbS5tYWFzLm9wZW5jdjRuYXRpdmVzY3JpcHQuT3BlbkNWVXRpbHMuY3JlYXRlVGh1bWJuYWlsSW1hZ2UoZHN0SW1nVVJJKTtcblxuICAgICAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5uZXQuVXJpLnBhcnNlKCdmaWxlOi8vJyArIHRodW1ibmFpbEltYWdlUGF0aCk7XG4gICAgICAgICAgICB0aGlzLl9nYWxsZXJ5QnRuLnNldEltYWdlVVJJKHVyaSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBjcmVhdGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtIGFkYXB0aXZlIHRocmVzaG9sZC5cbiAgICAgKiBAcGFyYW0gdGhyZXNob2xkVmFsdWUgXG4gICAgICogQHBhcmFtIHNhcmdzIFxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybUFkYXB0aXZlVGhyZXNob2xkKHRocmVzaG9sZFZhbHVlOiBhbnksIHNhcmdzOiBhbnkpOiB2b2lkIHtcbiAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltZ0VtcHR5ID0gdGhpcy5pbWdVUkkgKyAnP3RzPScgKyBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ0VtcHR5O1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltZ1VSSSA9IG9wZW5jdi5wZXJmb3JtQWRhcHRpdmVUaHJlc2hvbGQodGhpcy53cmFwcGVkSW1hZ2UsIHRoaXMuZmlsZU5hbWUsIHRocmVzaG9sZFZhbHVlKTtcbiAgICAgICAgICAgIHRoaXMuX2lzSW1hZ2VCdG5WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltZ1VSSTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQHBhcmFtIGZpbGVQYXRoIFxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGg6IGFueSk6IHZvaWQge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBvcGVuY3YucGVyZm9ybVBlcnNwZWN0aXZlVHJhbnNmb3JtYXRpb24oZmlsZVBhdGgsICcnKTtcbiAgICAgICAgICAgIHRoaXMuaXNCdXN5ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnNob3dDYXB0dXJlZFBpY3R1cmVEaWFsb2codHJ1ZSwgZmlsZVBhdGgsIHRoaXMuaW1nVVJJKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICAgICAgdGhpcy5pc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIHdoaWxlIHBlcmZvcm1pbmcgcGVyc3BlY3RpdmUgdHJhbnNmb3JtYXRpb24gcHJvY2Vzcy4gUGxlYXNlIHJldGFrZSBwaWN0dXJlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogbG9hZCBpbWFnZXMuXG4gICAgICogQHBhcmFtIGltYWdlQXNzZXQgXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkSW1hZ2UoaW1hZ2VBc3NldDogSW1hZ2VBc3NldCk6IHZvaWQge1xuICAgICAgICBpZiAoaW1hZ2VBc3NldCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuXG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlLmZyb21Bc3NldChpbWFnZUFzc2V0KS50aGVuKFxuICAgICAgICAgICAgICAgIChpbWdTcmMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltZ1NyYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZnAgPSAoaW1hZ2VBc3NldC5pb3MpID8gaW1hZ2VBc3NldC5pb3MgOiBpbWFnZUFzc2V0LmFuZHJvaWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZU9yZyA9IGZwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZnAuaW5kZXhPZignLnBuZycpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1VSSSA9IGZwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWdVUkk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtUGVyc3BlY3RpdmVUcmFuc2Zvcm1hdGlvbihmcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5fZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnSW1hZ2Ugc291cmNlIGlzIGJhZC4nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5fZW1wdHk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnQoJ0Vycm9yIGdldHRpbmcgaW1hZ2Ugc291cmNlIGZyb20gYXNzZXQnKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbWFnZSBBc3NldCB3YXMgbnVsbCcpO1xuICAgICAgICAgICAgYWxlcnQoJ0ltYWdlIEFzc2V0IHdhcyBudWxsJyk7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5fZW1wdHk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=