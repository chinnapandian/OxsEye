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
import * as Permissions from 'nativescript-permissions';

import { AndroidApplication, AndroidActivityBackPressedEventData } from "tns-core-modules/application";
import { isAndroid, screen } from "tns-core-modules/platform";
import { Slider } from "tns-core-modules/ui/slider";
import { Label } from "tns-core-modules/ui/label";

/**
 * Capture component class, which is being used to capture image from camera.
 */
@Component({
    selector: 'ns-capture',
    moduleId: module.id,
    styleUrls: ['./capture.component.css'],
    templateUrl: './capture.component.html',
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
    private thresholdBtnPlus: any;
    private thresholdBtnPlusParams: any;
    private thresholdBtnMinus: any;
    private thresholdBtnMinusParams: any;
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
    /** Poisition to place slider component */
    // private screenHeight = 0;
    /** Canny threshold value     */
    private thresholdValue = 0;
    /** Threshold value lable height */
    // private labelHeight = 0;
    /** To make label visible or not */
    // private isLabelVisible: boolean;

    /** Transformed image list */
    private imgURIList: any;

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
    }

    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    ngOnInit(): void {
        console.log('Initializing OpenCV...');
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        // this.isLabelVisible = false;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        this.createThresholdImageButtonPlus();
        this.createThresholdImageButtonMinus();
        this.createAutoFocusImage();
        if (!isAndroid) {
            return;
        }
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            if (this.router.isActive("/capture", false)) {
                data.cancel = true; // prevents default back button behavior
                data.activity.moveTaskToBack(true);
            }
        });

    }
    setSliderPoistion() {
        this.thresholdValue = 50;
        let plusPercentageWidth = 0.85;
        let plusPercentageHeight = 0.67;
        let minusPercentageWidth = 0.85;
        let minusPercentageHeight = 0.75;
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
    }
    onUnloaded(args: any) {
        let cameraPlus: any = args.object as CameraPlus;
        if (cameraPlus) {
            if (cameraPlus.ocvCameraView) {
                cameraPlus.ocvCameraView.disableView();
            }
            cameraPlus._nativeView.removeView(cameraPlus.ocvCameraView);
        }
        console.log('onUnloaded called');
    }
    onCannyThresholdValueChange(threshold: any, sound: any) {
        let audioManager = application.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
        audioManager.playSoundEffect(sound, 0.5);
        console.log('onCannyThresholdValueChange called', threshold);
        this.cam.ocvCameraView.cannyThreshold = threshold;
        const label = <Label>this.cam.page.getViewById("thresholdLabelId");
        label.text = threshold;
        label.textWrap = true;
        label.textAlignment = "center";
        label.visibility = 'visible';
        console.log('this.cam.ocvCameraView.cannyThreshold: ', this.cam.ocvCameraView.cannyThreshold);
        setTimeout(function () {
            label.visibility = 'collapse';
        }, 200);
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
        // if(!this.cam.nativeView || this.cam.nativeView == null) {
        //     this.cam._nativeView.removeAllViews(); // = this.cam._nativeView;
        // }
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
            this.cam.showFlashIcon = false;
            this.cam.showToggleIcon = false;
            try {
                this.initImageGalleryButton();
                this.initCameraButton();
                // this.initThresholdButtonPlus();
                // this.initThresholdButtonMinus();
                this.initAutoFocusImageButton();
                this.cam._takePicBtn = this.takePicBtn;
            } catch (e) {
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
    }
    /**
     * This method initializes camera button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    initCameraButton() {
        this.cam._nativeView.removeView(this.takePicBtn);
        this.cam._nativeView.addView(this.takePicBtn, this.takePicParams);
    }
    /**
     * This method initializes gallery button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    initImageGalleryButton() {
        this.cam._nativeView.removeView(this.galleryBtn);
        this.cam._nativeView.addView(this.galleryBtn, 0, this.galleryParams);
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
        this.cam._nativeView.bringChildToFront(this.galleryBtn);
    }
    initThresholdButtonPlus(percentageWidth, percentageHeight) {
        console.log('initThresholdButtonPlus called...');
        this.cam._nativeView.removeView(this.thresholdBtnPlus);
        const btnY = screen.mainScreen.heightPixels * percentageHeight;
        const btnX = screen.mainScreen.widthPixels * percentageWidth;//widthDIPs;// * 0.75;
        this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnPlus, this.thresholdBtnPlusParams);
    }
    initThresholdButtonMinus(percentageWidth, percentageHeight) {
        console.log('initThresholdButtonMinus called...');
        this.cam._nativeView.removeView(this.thresholdBtnMinus);
        const btnY = screen.mainScreen.heightPixels * percentageHeight;
        const btnX = screen.mainScreen.widthPixels * percentageWidth;//widthDIPs;// * 0.75;
        this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        this.cam._nativeView.addView(this.thresholdBtnMinus, this.thresholdBtnMinusParams);
        // this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
        // this.cam._nativeView.bringChildToFront(this.thresholdBtnMinus);
    }
    /**
     * This method initializes autoFocus button in camera view, actually
     * it removes an existing one if exists and adds it.
     */
    initAutoFocusImageButton() {
        this.cam._nativeView.removeView(this.autofocusBtn);
        this.cam._nativeView.addView(this.autofocusBtn, this.autofocusParams);
    }
    /**
     * Creates take picture button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createTakePictureButton() {
        const _this = this;
        this.takePicBtn = this.createTakePicButton();
        this.setImageResource(this.takePicBtn, 'ic_camera_alt_white');
        const shape = this.createTransparentCircleDrawable();
        this.takePicBtn.setBackgroundDrawable(shape);
        const color = android.graphics.Color.parseColor('#ffffff'); // white color
        this.takePicBtn.setColorFilter(color);
        this.takePicBtn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
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
    private createThresholdImageButtonPlus() {
        const _this = this;
        this.thresholdBtnPlus = this.createImageButton();
        this.thresholdBtnPlus.setPadding(34, 5, 34, 34);
        this.setImageResource(this.thresholdBtnPlus, 'ic_add_circle_white_3x');

        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);

        const galleryBtnPlusId = application.android.context.getResources()
            .getIdentifier('threshold_btn_plus', 'id', application.android.context.getPackageName());

        this.thresholdBtnPlus.setTag(galleryBtnPlusId, 'threshold-btn-plus-tag');
        this.thresholdBtnPlus.setContentDescription('threshold-btn-plus-dec');
        const shape = this.createCircleDrawableForThresholdBtn();
        this.thresholdBtnPlus.setBackgroundDrawable(shape);
        this.thresholdBtnPlus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        this.thresholdBtnPlus.setOnClickListener(new android.view.View.OnClickListener({
            onClick(view: any) {
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
    }

    private createThresholdBtnPlusParams() {
        this.thresholdBtnPlusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.thresholdBtnPlusParams.width = '70';
        this.thresholdBtnPlusParams.height = '105';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = screen.mainScreen.heightDIPs * 0.78;
        // const btnX = screen.mainScreen.widthDIPs;//widthDIPs;// * 0.75;
        const btnY = screen.mainScreen.heightPixels * 0.66;
        const btnX = screen.mainScreen.widthPixels * 0.85;//widthDIPs;// * 0.75;
        this.thresholdBtnPlusParams.setMargins(btnX, btnY, 18, 18);
        // // ALIGN_PARENT_BOTTOM
        // this.thresholdBtnPlusParams.addRule(12);
        // // ALIGN_PARENT_RIGHT
        // this.thresholdBtnPlusParams.addRule(11);
    }
    private createThresholdImageButtonMinus() {
        const _this = this;
        this.thresholdBtnMinus = this.createImageButton();
        this.thresholdBtnMinus.setPadding(34, 34, 34, 5);
        this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');

        // let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
        // this.galleryBtn.setImageResource(openGalleryDrawable);

        // const galleryBtnPlusId = application.android.context.getResources()
        //     .getIdentifier('threshold_btn_minus', 'id', application.android.context.getPackageName());

        // this.thresholdBtnPlus.setTag(galleryBtnPlusId, 'threshold-btn-plus-tag');
        this.thresholdBtnMinus.setContentDescription('threshold-btn-plus-dec');
        const shape = this.createCircleDrawableForThresholdBtn();
        this.thresholdBtnMinus.setBackgroundDrawable(shape);
        this.thresholdBtnMinus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
        this.thresholdBtnMinus.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.thresholdValue--;
                _this.onCannyThresholdValueChange(_this.thresholdValue, android.view.SoundEffectConstants.NAVIGATION_DOWN);
            },
        }));
        this.createThresholdBtnMinusParams();
    }
    private createThresholdBtnMinusParams() {
        this.thresholdBtnMinusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.thresholdBtnMinusParams.width = '70';
        this.thresholdBtnMinusParams.height = '105';
        //  this.thresholdBtnPlusParams.x = '500';
        // this.thresholdBtnPlusParams.y = '500';
        // const btnY = screen.mainScreen.heightDIPs * 0.78;
        // const btnX = screen.mainScreen.widthDIPs;//widthDIPs;// * 0.75;
        const btnY = screen.mainScreen.heightPixels * 0.74;
        const btnX = screen.mainScreen.widthPixels * 0.85;//widthDIPs;// * 0.75;
        this.thresholdBtnMinusParams.setMargins(btnX, btnY, 18, 18);
        // // ALIGN_PARENT_BOTTOM
        // this.thresholdBtnPlusParams.addRule(12);
        // // ALIGN_PARENT_RIGHT
        // this.thresholdBtnPlusParams.addRule(11);
    }
    private createCircleDrawableForThresholdBtn(): any {
        const shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0x99000000);//(0xFFFFFFFF); //(0x99000000);
        shape.setCornerRadius(10);
        shape.setAlpha(100);
        return shape;
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
        shape.setCornerRadius(100);
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
     * Creates image button with help of ImageButton widget
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns button object
     */
    createTakePicButton(): any {
        const btn = new android.widget.ImageButton(application.android.context);
        btn.setPadding(14, 14, 14, 14);
        btn.setMaxHeight(178);
        btn.setMaxWidth(178);

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
    toggleCameraEvent(args: any): void {
        console.log('camera toggled');
    }

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
                    if (!this.imgURIList.isEmpty()) {
                        this.setTransformedImage(dialogResult);
                        for (let i = 0; i < this.imgURIList.size(); i++) {
                            const imgURITemp = this.imgURIList.get(i);
                            this.createThumbNailImage(imgURITemp);
                            this.refreshCapturedImagesinMediaStore(filePathOrg, imgURITemp, 'Add');
                        }
                    }
                    this.cam.camera.startPreview();
                } else {
                    try {
                        const imgFileOrg: fs.File = fs.File.fromPath(filePathOrg);
                        if (imgFileOrg) {
                            imgFileOrg.removeSync();
                        }
                        if (!this.imgURIList.isEmpty()) {
                            for (let i = 0; i < this.imgURIList.size(); i++) {
                                const imgURITemp = this.imgURIList.get(i);
                                const imgURIFile: fs.File = fs.File.fromPath(imgURITemp);
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

                                this.refreshCapturedImagesinMediaStore(filePathOrg, imgURITemp, 'Remove');
                            }
                        }
                        this.cam.camera.startPreview();
                    } catch (error) {
                        Toast.makeText(this.locale.transform('could_not_delete_the_capture_image') + error, 'long').show();
                        this.logger.error(module.filename + ': ' + error);
                        this.cam.camera.startPreview();
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
        this.takePicParams.width = '150';
        this.takePicParams.height = '150';
        this.takePicParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.takePicParams.addRule(12);
        // CENTER_HORIZONTAL
        this.takePicParams.addRule(14);
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
            // const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            // this.imgURI = imgURITemp.substring(0, imgURITemp.indexOf('RPTSTR'));
            const rectanglePointsStr = 'RPTSTR'; //imgURITemp.substring(imgURITemp.indexOf('RPTSTR'));
            // this.imgURI = this.cam.ocvCameraView.transform(filePath);
            this.imgURIList = this.cam.ocvCameraView.transformMore(filePath);
            if (!this.imgURIList.isEmpty()) {
                this.imgURI = this.imgURIList.get(0);
                for (let i = 0; i < this.imgURIList.size(); i++) {
                    SendBroadcastImage(this.imgURIList.get(i));
                }
                this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
            } else {
                this.activityLoader.hide();
                Toast.makeText(this.locale.transform('no_image_captured'), 'long').show();
                this.cam.camera.startPreview();
            }
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
