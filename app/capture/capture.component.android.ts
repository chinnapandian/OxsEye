import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ImageSource } from 'tns-core-modules/image-source';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { Image } from 'tns-core-modules/ui/image';
import { View } from 'tns-core-modules/ui/core/view';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { DialogContent } from '../dialog/dialog.component';
import { ImageGalleryComponent } from '../imagegallery/imagegallery.component';
import { File } from 'tns-core-modules/file-system';
import { ActivityLoader } from '../activityloader/activityloader.common';
import { SendBroadcastImage } from '../providers/transformedimage.provider';
import { Router } from '@angular/router';
import * as opencv from 'nativescript-opencv-plugin';
import * as Toast from 'nativescript-toast';
import * as application from 'tns-core-modules/application';
import * as fs from 'file-system';

/**
 * Capture component class
 */
@Component({
    selector: 'ns-capture',
    moduleId: module.id,
    styleUrls: ['./capture.component.css'],
    templateUrl: './capture.component.html',
})
export class CaptureComponent implements OnInit, OnDestroy {
    /** Camera instance variable. */
    private _cam: any;
    /** Gallery button. */
    private _galleryBtn: any;
    /** Take picture button. */
    private _takePicBtn: any;
    /** Auto focus button. */
    private _autofocusBtn: any;
    /** Paramaters used to display Gallery button. */
    private _galleryParams: any;
    /** Paramaters used to display Take picture button. */
    private _takePicParams: any;
    /** Paramaters used to display auto focus button. */
    private _autofocusParams: any;
    /** Empty string variable */
    private _empty: any = null;
    
    /** Boolean value to check the camera is visible or not. */
    public isCameraVisible: any;
    /** Transformed Image source */
    public imageSource: ImageSource = new ImageSource();
    /** Original Image source. */
    public imageSourceOrg: any;
    /** Transformed Image URI */
    public imgURI: any;
    /** OpenCV instance variable. */
    public opencvInstance: any;

    /**
     * Constructor for CaptureComponent.
     * @param zone 
     * @param modalService 
     * @param viewContainerRef 
     * @param router 
     * @param activityLoader 
     */
    constructor(
        private zone: NgZone,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private router: Router,
        private activityLoader: ActivityLoader,
        // private _changeDetectionRef: ChangeDetectorRef
    ) {
    }

    /**
     * Initialization method called while angular initialize.
     */
    ngOnInit(): void {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        // this._isImageBtnVisible = false;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createAutoFocusImage();
    }

    /**
     * Destroy method called while angular destroys. 
     */
    ngOnDestroy() {
        console.log('Destroy called...');
    }
    /**
     * Method to check camera loaded or not along with some
     * camera settings initialization.
     * @param args
     */
    camLoaded(args: any): void {
        console.log('***** _cam loaded *****');
        this._cam = args.object as CameraPlus;

        const flashMode = this._cam.getFlashMode();

        // Turn flash on at startup
        if (flashMode === 'off') {
            this._cam.toggleFlash();
        }
        const cb = new android.hardware.Camera.AutoFocusMoveCallback(

            {
                _this: this,
                onAutoFocusMoving(start: any, camera: any) {
                    const animate = this._this._autofocusBtn.animate();
                    if (!start) {
                        animate.scaleX(1);
                        animate.scaleY(1);
                        // Green color
                        const color = android.graphics.Color.parseColor('#008000');
                        this._this._autofocusBtn.setColorFilter(color);
                    } else {
                        animate.scaleX(0.50);
                        animate.scaleY(0.50);
                        animate.setDuration(100);
                        // Red color
                        const color = android.graphics.Color.parseColor('#ff0000');
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
            } catch (e) {
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
    }
    /**
     * Initialize Camera Button.
     */
    initCameraButton() {
        this._cam.nativeView.removeView(this._takePicBtn);
        this._cam.nativeView.addView(this._takePicBtn, this._takePicParams);
    }
    /**
     * initialize image gallery button.
     */
    initImageGalleryButton() {
        this._cam.nativeView.removeView(this._galleryBtn);
        this._cam.nativeView.addView(this._galleryBtn, this._galleryParams);
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
    }
    /**
     * initialize auto focus image button.
     */
    initAutoFocusImageButton() {
        this._cam.nativeView.removeView(this._autofocusBtn);
        this._cam.nativeView.addView(this._autofocusBtn, this._autofocusParams);
    }
    /**
     * Create take picture button.
     */
    createTakePictureButton() {
        const _this = this;
        this._takePicBtn = this.createImageButton();
        this.setImageResource(this._takePicBtn, 'ic_camera');
        // let takePicDrawable = this.getImageDrawable('ic_camera');
        // this._takePicBtn.setImageResource(takePicDrawable);
        const shape = this.createTransparentCircleDrawable();
        this._takePicBtn.setBackgroundDrawable(shape);
        const color = android.graphics.Color.parseColor('#ffffff'); // white color
        this._takePicBtn.setColorFilter(color);
        // this._takePicBtn.setScaleX(0.50);
        // this._takePicBtn.setScaleY(0.50);
        this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.takePicFromCam(_this);
            },
        }));
        this.createTakePictureParams();
    }
    /**
     * Create auto focus image.
     */
    createAutoFocusImage() {
        const _this = this;
        this._autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this._autofocusBtn, 'ic_auto_focus_black');

        // let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        // this._autofocusBtn.setImageResource(openGalleryDrawable);
        const shape = this.createAutofocusShape();
        this._autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
    }
    /**
     * Create auto focus image button.
     */
    createAutoFocusImageButton(): any {
        const btn = new android.widget.ImageView(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(158);
        btn.setMaxWidth(158);
        btn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
        const color = android.graphics.Color.parseColor('#008000'); // Green color
        btn.setColorFilter(color);
        return btn;
    }
    /**
     * Create image gallery button.
     */
    createImageGalleryButton() {
        const _this = this;
        this._galleryBtn = this.createImageButton();
        this.setImageResource(this._galleryBtn, 'ic_photo_library_white');

        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this._galleryBtn.setImageResource(openGalleryDrawable);

        const galleryBtnId = application.android.context.getResources()
            .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());

        this._galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this._galleryBtn.setContentDescription('gallery-btn-dec');
        const shape = this.createTransparentCircleDrawable();
        this._galleryBtn.setBackgroundDrawable(shape);
        this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.goImageGallery();
            },
        }));
        this.createImageGallerryParams();
    }
    /**
     * Gets image drawable image id
     * @param iconName 
     */
    getImageDrawable(iconName: any): any {
        const drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    }
    /**
     * Create transparent circle shape.
     */
    createTransparentCircleDrawable(): any {
        const shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000);
        shape.setCornerRadius(96);
        shape.setAlpha(150);
        return shape;
    }
    /**
     * Create auto focus shape.
     */
    createAutofocusShape(): any {

        const shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    }
    /**
     * Create image button.
     */
    createImageButton(): any {
        const btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(58);
        btn.setMaxWidth(58);
        return btn;
    }
    /**
     * Image selected event.
     * @param args
     */
    imagesSelectedEvent(args: any): void {
        console.log('IMAGES SELECTED EVENT!!!');
        this.loadImage((args.data as ImageAsset[])[0]);
    }
    /**
     * Photo captured event.
     * @param args 
     */
    photoCapturedEvent(args: any): void {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(args.data as ImageAsset);
    }
    /**
     * Toggle camera event.
     * @param args 
     */
    toggleCameraEvent(args: any): void {
        console.log('camera toggled');
    }
    /**
     * Toggle flash on camera.
     */
    toggleFlashOnCam(): void {
        this._cam.toggleFlash();
    }
    /**
     * Toggle showing flash icon.
     */
    toggleShowingFlashIcon(): void {
        console.log(`showFlashIcon = ${this._cam.showFlashIcon}`);
        this._cam.showFlashIcon = !this._cam.showFlashIcon;
    }
    /**
     * Toggle camera.
     */
    toggleTheCamera(): void {
        this._cam.toggleCamera();
    }
    /**
     * Open camera library.
     */
    openCamPlusLibrary(): void {
        this._cam.chooseFromLibrary();
    }
    /**
     * Take picture from camera.
     * @param thisParam 
     */
    takePicFromCam(thisParam: any): void {
        thisParam.activityLoader.show();
        thisParam._cam.takePicture({ saveToGallery: true });
        this.imgURI = '';
        this.imageSource = this.imgURI;
    }
    /**
     * Go to image gallery.
     */
    goImageGallery() {
        this.router.navigate(['imagegallery']);
    }
    /**
     * Show captured picture dialog
     * @param fullScreen 
     * @param filePathOrg 
     * @param imgURI 
     */
    showCapturedPictureDialog(fullScreen: boolean, filePathOrg: string, imgURI: string, recPointsStr) {
        const options: ModalDialogOptions = {
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
        this.modalService.showModal(DialogContent, options)
            .then((dialogResult: string) => {
                if (dialogResult) {
                    // let dilogResultTemp = dialogResult;
                    // if (dialogResult.indexOf('_TEMP') > 0) {
                    // 	for (let i = 0; i < 4; i++) {
                    // 		dilogResultTemp = dilogResultTemp.replace('_TEMP' + i, '');
                    // 	}
                    // }
                    this.setTransformedImage(dialogResult);
                    this.createThumbNailImage(dialogResult);
                    this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, 'Add');
                } else {
                    try {
                        const imgFileOrg: fs.File = fs.File.fromPath(filePathOrg);

                        if (imgFileOrg) {
                            imgFileOrg.remove();
                        }
                        const imgURIFile: fs.File = fs.File.fromPath(imgURI);
                        if (imgURIFile) {
                            imgURIFile.remove();
                        }
                        // Todo : to be removed later
                        const imgUriContourPath = imgURI.substring(0, imgURI.indexOf('_transformed')) + '_contour.jpg';
                        const imgURIContourFile: fs.File = fs.File.fromPath(imgUriContourPath);
                        if (imgURIContourFile) {
                            imgURIContourFile.remove();
                            SendBroadcastImage(imgUriContourPath);
                        }
                        // Todo - End

                        this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
                    } catch (e) {
                        alert('Couldnot delete the file');
                    }
                }
            });
    }
    /**
     * Set transformed image.
     * @param imgURIParam 
     */
    setTransformedImage(imgURIParam: any) {
        if (imgURIParam) {
            try {
                // this._isImageBtnVisible = true;
                this.imgURI = imgURIParam;
                this.imageSource = imgURIParam;
                SendBroadcastImage(this.imgURI);
            } catch (e) {
                Toast.makeText('Error while setting image in preview area' + e, 'long').show();
            }
        }
    }
    /**
     * On page loaded.
     * @param args 
     */
    onPageLoaded(args: any) {
        // this._page = args.object as Page;
    }
    /**
     * Create take picture params.
     */
    private createTakePictureParams() {
        this._takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._takePicParams.width = '100';
        this._takePicParams.height = '100';
        this._takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this._takePicParams.addRule(12);
        // HORIZONTAL_CENTER
        this._takePicParams.addRule(11);
    }
    /**
     * Create auto focus image params.
     */
    private createAutoFocusImageParams() {
        this._autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._autofocusParams.width = '300';
        this._autofocusParams.height = '300';
        this._autofocusParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_CENTER
        this._autofocusParams.addRule(13);
    }
    /**
     * Sets image resource.
     * @param btn 
     * @param iconName 
     */
    private setImageResource(btn: any, iconName: any) {
        const openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    }
    /**
     * Create image gallery params.
     */
    private createImageGallerryParams() {
        this._galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this._galleryParams.width = '100';
        this._galleryParams.height = '100';
        this._galleryParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this._galleryParams.addRule(12);
        // ALIGN_PARENT_LEFT
        this._galleryParams.addRule(9);
    }
    /**
     * Refresh captured images in media store.
     * @param filePathOrg 
     * @param imgURI 
     * @param action 
     */
    private refreshCapturedImagesinMediaStore(filePathOrg: string, imgURI: string, action: string) {
        try {
            SendBroadcastImage(filePathOrg);
            SendBroadcastImage(imgURI);
            // this thumbnail image will be available only in 'Add' case.
            if (action === 'Add') {
                const thumnailOrgPath = imgURI.replace('PT_IMG', 'thumb_PT_IMG');
                SendBroadcastImage(thumnailOrgPath);
            }
        } catch (e) {
            alert('Could not sync the file ');
        }
    }
    /**
     * Create thumbnail image.
     * @param imgURI 
     */
    private createThumbNailImage(imgURI: string): any {
        try {
            const thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

            const uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            this._galleryBtn.setImageURI(uri);
        } catch (e) {
            console.log('Error while creating thumbnail image. ' + e);
        }
    }

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
    private performPerspectiveTransformation(filePath: any): void {
        try {
            const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            const rectanglePointsStr = imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
        } catch (err) {
            console.log(err);
            this.activityLoader.hide();
            alert('Error while performing perspective transformation process. Please retake picture');
        }
    }
    /**
     * load images.
     * @param imageAsset 
     */
    private loadImage(imageAsset: ImageAsset): void {
        if (imageAsset) {
            this.imageSource = new ImageSource();

            this.imageSource.fromAsset(imageAsset).then(
                (imgSrc) => {
                    if (imgSrc) {
                        this.zone.run(() => {
                            const fp = (imageAsset.ios) ? imageAsset.ios : imageAsset.android;
                            this.imageSourceOrg = fp;
                            this.imgURI = '';

                            if (fp.indexOf('.png') > 0) {
                                this.imgURI = fp;
                                this.imageSource = this.imgURI;
                            } else {
                                this.imgURI = '';
                                this.performPerspectiveTransformation(fp);
                            }
                        });
                    } else {
                        this.imageSource = this._empty;
                        alert('Image source is bad.');
                    }
                },
                (err) => {
                    this.imageSource = this._empty;
                    console.error(err);
                    alert('Error getting image source from asset');
                },
            );
        } else {
            console.log('Image Asset was null');
            alert('Image Asset was null');
            this.imageSource = this._empty;
        }
    }
}
