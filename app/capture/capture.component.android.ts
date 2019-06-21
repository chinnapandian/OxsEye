import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { ImageSource } from 'tns-core-modules/image-source';

import { ActivityLoader } from '../activityloader/activityloader.common';
import { DialogContent } from '../dialog/dialog.component';
import { SendBroadcastImage } from '../providers/transformedimage.provider';

import { L } from 'nativescript-i18n/angular';
import { OxsEyeLogger } from '../logger/oxseyelogger';

import * as opencv from 'nativescript-opencv-plugin';
import * as Toast from 'nativescript-toast';
import * as fs from 'tns-core-modules/file-system';

import * as application from 'tns-core-modules/application';

/**
 * Capture component class, which is being used to capture image from camera.
 */
@Component({
    selector: 'ns-capture',
    moduleId: module.id,
    styleUrls: ['./capture.component.css'],
    templateUrl: './capture.component.android.html',
})
export class CaptureComponent implements OnInit {
    /** Camera instance variable. */
    private cam: any;
    /** Gallery button. */
    private galleryBtn: any;
    /** Take picture button. */
    private takePicBtn: any;
    /** Auto focus button. */
    private autofocusBtn: any;
    /** Paramaters used to display Gallery button. */
    private galleryParams: any;
    /** Paramaters used to display Take picture button. */
    private takePicParams: any;
    /** Paramaters used to display auto focus button. */
    private autofocusParams: any;
    /** Empty string variable */
    private empty: any = null;
    // /** Localization */
    // private locale: any;
    // /** Lable for save button */
    // private saveBtnLable: any;
    // /** Lable for manual button */
    // private manualBtnLable: any;
    // /** Lable for perform button */
    // private performBtnLable: any;
    // /** Lable for retake button */
    // private retakeBtnLable: any;

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
     *
     * @param zone Angular zone to run a task asynchronously.
     * @param modalService Service modal
     * @param viewContainerRef View container referrence
     * @param router Router
     * @param activityLoader Activity loader indication
     */
    constructor(
        private zone: NgZone,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private router: Router,
        private activityLoader: ActivityLoader,
        // private _changeDetectionRef: ChangeDetectorRef
        private logger: OxsEyeLogger,
        private locale: L,
    ) {
        // this.locale = new L();
    }

    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    ngOnInit(): void {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createAutoFocusImage();
    }

    /**
     * This method is called when camera is loaded, where all the neccessary things like
     * displaying buttons(takePicture, gallery, flash, camera & autoFocus) on camera view
     * are taken care and also initializes camera instance.
     *
     * @param args CameraPlus instance referrence.
     */
    camLoaded(args: any): void {
        // this.saveBtnLable = this.locale.transform('save');
        // this.manualBtnLable = this.locale.transform('manual');
        // this.retakeBtnLable = this.locale.transform('retake');
        // this.performBtnLable = this.locale.transform('perform');

        this.cam = args.object as CameraPlus;
        const flashMode = this.cam.getFlashMode();

        // Turn flash on at startup
        if (flashMode === 'on') {
            this.cam.toggleFlash();
        }
        const cb = new android.hardware.Camera.AutoFocusMoveCallback(

            {
                _this: this,
                onAutoFocusMoving(start: any, camera: any) {
                    const animate = this._this.autofocusBtn.animate();
                    if (!start) {
                        animate.scaleX(1);
                        animate.scaleY(1);
                        // Green color
                        const color = android.graphics.Color.parseColor('#008000');
                        this._this.autofocusBtn.setColorFilter(color);
                    } else {
                        animate.scaleX(0.50);
                        animate.scaleY(0.50);
                        animate.setDuration(100);
                        // Red color
                        const color = android.graphics.Color.parseColor('#ff0000');
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
            } catch (e) {
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
    }
    /**
     * This method initializes camera button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    initCameraButton() {
        this.cam.nativeView.removeView(this.takePicBtn);
        this.cam.nativeView.addView(this.takePicBtn, this.takePicParams);
    }
    /**
     * This method initializes gallery button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    initImageGalleryButton() {
        this.cam.nativeView.removeView(this.galleryBtn);
        this.cam.nativeView.addView(this.galleryBtn, this.galleryParams);
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
    }
    /**
     * This method initializes autoFocus button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    initAutoFocusImageButton() {
        this.cam.nativeView.removeView(this.autofocusBtn);
        this.cam.nativeView.addView(this.autofocusBtn, this.autofocusParams);
    }
    /**
     * Creates take picture button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createTakePictureButton() {
        const _this = this;
        this.takePicBtn = this.createImageButton();
        this.setImageResource(this.takePicBtn, 'ic_camera');
        const shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        const color = android.graphics.Color.parseColor('#ffffff'); // white color
        this.takePicBtn.setColorFilter(color);
        this.takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.takePicFromCam(_this);
            },
        }));
        this.createTakePictureParams();
    }
    /**
     * Creates auto focus image button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createAutoFocusImage() {
        const _this = this;
        this.autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this.autofocusBtn, 'ic_auto_focus_black');

        // let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
        // this.autofocusBtn.setImageResource(openGalleryDrawable);
        const shape = this.createAutofocusShape();
        this.autofocusBtn.setBackgroundDrawable(shape);
        this.createAutoFocusImageParams();
    }
    /**
     * Creates auto focus image button with help ImageView widget and settings
     * it's attributes like padding, height, width, color & scaleType.
     *
     * @returns Returns button object
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
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createImageGalleryButton() {
        const _this = this;
        this.galleryBtn = this.createImageButton();
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');

        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);

        const galleryBtnId = application.android.context.getResources()
            .getIdentifier('gallery_btn', 'id', application.android.context.getPackageName());

        this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
        this.galleryBtn.setContentDescription('gallery-btn-dec');
        const shape = this.createTransparentCircleDrawable();
        this.galleryBtn.setBackgroundDrawable(shape);
        this.galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.goImageGallery();
            },
        }));
        this.createImageGallerryParams();
    }
    /**
     * Gets actual icon image using icon name from context.
     *
     * @param iconName Icon Name
     */
    getImageDrawable(iconName: any): any {
        const drawableId = application.android.context
            .getResources()
            .getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
        return drawableId;
    }
    /**
     * Creates transparent circle shape with help of GradientDrawable object
     * and sets it's attributes like color, radius and alpha.
     *
     * @returns Returns shape object
     */
    createTransparentCircleDrawable(): any {
        const shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000);
        shape.setCornerRadius(96);
        shape.setAlpha(150);
        return shape;
    }
    /**
     * Creates auto focus shape using ShapeDrawable object and
     * sets alpha.
     * @returns Returns shape object
     */
    createAutofocusShape(): any {

        const shape = new android.graphics.drawable.ShapeDrawable();
        shape.setAlpha(0);
        return shape;
    }
    /**
     * Creates image button with help of ImageButton widget
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns button object
     */
    createImageButton(): any {
        const btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(34, 34, 34, 34);
        btn.setMaxHeight(58);
        btn.setMaxWidth(58);
        return btn;
    }
    /**
     * Photo captured event fires when a picture is taken from camera, which actually
     * loads the captured image from ImageAsset.
     *
     * @param args Image captured event data
     */
    photoCapturedEvent(args: any): void {
        console.log('PHOTO CAPTURED EVENT!!!');
        this.loadImage(args.data as ImageAsset);
    }
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
    toggleFlashOnCam(): void {
        this.cam.toggleFlash();
    }
    /**
     * Method to display flash icon based on it's property value true/false.
     */
    toggleShowingFlashIcon(): void {
        console.log(`showFlashIcon = ${this.cam.showFlashIcon}`);
        this.cam.showFlashIcon = !this.cam.showFlashIcon;
    }
    /**
     * Method to switch front/back camera.
     */
    toggleTheCamera(): void {
        this.cam.toggleCamera();
    }
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
    takePicFromCam(thisParam: any): void {
        thisParam.activityLoader.show();
        thisParam.cam.takePicture({ saveToGallery: true });
        this.imgURI = '';
        this.imageSource = this.imgURI;
    }
    /**
     * It takes to image gallery view when user clicks on gallery button on camera view.
     */
    goImageGallery() {
        this.router.navigate(['imagegallery']);
    }
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
    showCapturedPictureDialog(fullScreen: boolean, filePathOrg: string, imgURI: string, recPointsStr) {
        const options: ModalDialogOptions = {
            context: {
                imageSource: imgURI,
                imageSourceOrg: filePathOrg,
                isAutoCorrection: true,
                rectanglePoints: recPointsStr,
                // saveBtnLable: this.saveBtnLable,
                // manualBtnLable: this.manualBtnLable,
                // retakeBtnLable: this.retakeBtnLable,
                // performBtnLable: this.performBtnLable,
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
                            imgFileOrg.removeSync();
                        }
                        const imgURIFile: fs.File = fs.File.fromPath(imgURI);
                        if (imgURIFile) {
                            imgURIFile.removeSync();
                        }
                        // Todo : to be removed later
                        const imgUriContourPath = imgURI.substring(0, imgURI.indexOf('_transformed')) + '_contour.jpg';
                        const imgURIContourFile: fs.File = fs.File.fromPath(imgUriContourPath);
                        if (imgURIContourFile) {
                            imgURIContourFile.removeSync();
                            SendBroadcastImage(imgUriContourPath);
                        }
                        // Todo - End

                        this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
                    } catch (error) {
                        Toast.makeText(this.locale.transform('could_not_delete_the_capture_image') + error, 'long').show();
                        this.logger.error(module.filename + ': ' + error);
                    }
                }
            });
    }
    /**
     * Sets the transformed image in gallery image button.
     *
     * @param imgURIParam Transformed image file URI
     */
    setTransformedImage(imgURIParam: any) {
        if (imgURIParam) {
            try {
                // this._isImageBtnVisible = true;
                this.imgURI = imgURIParam;
                this.imageSource = imgURIParam;
                SendBroadcastImage(this.imgURI);
            } catch (error) {
                Toast.makeText(this.locale.transform('error_while_setting_image_in_preview_area') + error, 'long').show();
                this.logger.error(module.filename + ': ' + error);
            }
        }
    }

    /**
     * Creates layout params using LayoutParams widget for takePicture button
     * and sets it's params like height, width, margin & rules.
     */
    private createTakePictureParams() {
        this.takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.takePicParams.width = '100';
        this.takePicParams.height = '100';
        this.takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.takePicParams.addRule(12);
        // HORIZONTAL_CENTER
        this.takePicParams.addRule(11);
    }
    /**
     * Creates layout params using LayoutParams widget for autoFocus button
     * and sets it's params like height, width, margin & rules.
     */
    private createAutoFocusImageParams() {
        this.autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.autofocusParams.width = '300';
        this.autofocusParams.height = '300';
        this.autofocusParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_CENTER
        this.autofocusParams.addRule(13);
    }
    /**
     * Sets image resource to given image button.
     *
     * @param btn Button image instance referrence
     * @param iconName Icon name
     */
    private setImageResource(btn: any, iconName: any) {
        const openGalleryDrawable = this.getImageDrawable(iconName);
        btn.setImageResource(openGalleryDrawable);
    }
    /**
     * Creates layout params using LayoutParams widget for gallery button
     * and sets it's params like height, width, margin & rules.
     */
    private createImageGallerryParams() {
        this.galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.galleryParams.width = '100';
        this.galleryParams.height = '100';
        this.galleryParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.galleryParams.addRule(12);
        // ALIGN_PARENT_LEFT
        this.galleryParams.addRule(9);
    }
    /**
     * Refreshes the captured images in media store meaning that the new captured image will be
     * available to public access. That can be done by SendBroadcastImage method.
     *
     * @param filePathOrg Captured Image file path
     * @param imgURI Transformed Image file URI
     * @param action Actions 'Add'/'Remove'
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
        } catch (error) {
            Toast.makeText(this.locale.transform('could_not_sync_the_captured_image_file') + error, 'long').show();
            this.logger.error(module.filename + ': ' + error);
        }
    }
    /**
     * Creates thumbnail image for the captured transformed image and sets it in gallery button.
     *
     * @param imgURI Transformed image file path
     */
    private createThumbNailImage(imgURI: string): any {
        try {
            const thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

            const uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            this.galleryBtn.setImageURI(uri);
        } catch (error) {
            Toast.makeText(this.locale.transform('error_while_creating_thumbnail_image') + error, 'long').show();
            this.logger.error(module.filename + ': ' + error);
        }
    }

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
    private performPerspectiveTransformation(filePath: any): void {
        try {
            const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            const rectanglePointsStr = imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
        } catch (error) {
            this.activityLoader.hide();
            Toast.makeText(this.locale.transform('error_while_performing_perspective_transformation'), 'long').show();
        }
    }
    /**
     * Method to perform prespective transformation for the captured image
     * and sets the transformed image URI in this.imgURI variable.
     *
     * @param imageAsset ImageAsset object instance referrence
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
                        this.imageSource = this.empty;
                        Toast.makeText(this.locale.transform('image_source_is_bad'), 'long').show();
                    }
                },
                (error) => {
                    this.imageSource = this.empty;
                    this.logger.error('Error getting image source from asset. ' + module.filename
                        + this.logger.ERROR_MSG_SEPARATOR + error);
                    Toast.makeText(this.locale.transform('error_getting_image_source_from_asset'), 'long').show();
                },
            );
        } else {
            this.logger.error('Image Asset was null. ' + module.filename);
            Toast.makeText(this.locale.transform('image_asset_was_null'), 'long').show();
            this.imageSource = this.empty;
        }
    }
}
