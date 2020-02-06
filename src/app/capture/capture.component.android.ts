import { consoleTestResultHandler } from 'tslint/lib/test';
import { alert } from 'tns-core-modules/ui/dialogs';
import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { ImageSource } from 'tns-core-modules/image-source';
import { Folder, knownFolders } from 'tns-core-modules/file-system';

import { AndroidActivityBackPressedEventData, AndroidApplication } from 'tns-core-modules/application';
import { isAndroid, screen } from 'tns-core-modules/platform';

import { ActivityLoader } from '../activityloader/activityloader.common';
// @ts-ignore
import { DialogContent } from '../dialog/dialog.component';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';

import { Label } from 'tns-core-modules/ui/label';
import { Slider } from 'tns-core-modules/ui/slider';
import { Switch } from 'tns-core-modules/ui/switch';

import { localize } from 'nativescript-localize';

import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from 'nativescript-ui-sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-ui-sidedrawer/angular';

// @ts-ignore
import * as opencv from 'nativescript-opencv-plugin';

import * as fs from 'tns-core-modules/file-system';

import * as application from 'tns-core-modules/application';

import * as Toast from 'nativescript-toast';

import * as Permissions from 'nativescript-permissions';

/** global variable declaration to avoid compilation error */
declare var android: any;
/** global variable declaration to avoid compilation error */
declare var java: any;
/** global variable declaration to avoid compilation error */
declare var org: any;

/**
 * Capture component class, which is being used to capture image from camera.
 */
@Component({
    selector: 'sg-capture',
    moduleId: module.id,
    styleUrls: ['./capture.component.css'],
    templateUrl: './capture.component.html',
})
export class CaptureComponent implements OnInit, AfterViewInit {
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
    /** Threshold button for plus sign */
    private thresholdBtnPlus: any;
    /** Parameters used to display threshold button for plus sign */
    private thresholdBtnPlusParams: any;
    /** Threshold button for minus sign */
    private thresholdBtnMinus: any;
    /** Parameters used to display threshold button for minus sign */
    private thresholdBtnMinusParams: any;
    /** Parameters used to display notification button */
    private badgeViewParams: any;
    /** Used to display notification button */
    private badgeView: any;
    /** To display menu button */
    private menuBtn: any;
    /** To display rectangle button */
    private rectangleBtn: any;
    /** Parameters to display rectangle button */
    private rectangleParams: any;
    /** Parameters to display menu button */
    private menuParams: any;
    /** Empty string variable */
    private empty: any = null;

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
    /** Canny threshold value     */
    private thresholdValue = 0;
    /** Threshold value lable height */
    // private labelHeight = 0;
    /** To make label visible or not */
    // private isLabelVisible: boolean;

    /** Transformed image list */
    private imgURIList: any;

    /** Side drawer instance variable */
    private drawer: RadSideDrawer;
    /** Boolean variable to check first time or not to set default values in side drawer menu */
    private isFirstTime = false;
    /** Variable to set milliseconds */
    private oneMilliSecond = 1000;

    /** Checks whether rectangle is on or off */
    private isRectangleOn = true;
    /** Boolean value to indicate bulb is on or off */
    private isBulbVisible = false;

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
    constructor(
        private zone: NgZone,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private router: Router,
        private activityLoader: ActivityLoader,
        private changeDetectionRef: ChangeDetectorRef,
        private logger: OxsEyeLogger,
        private transformedImageProvider: TransformedImageProvider,
    ) {
        this.isFirstTime = true;
    }
    /** Initialyzing side drawer menu instance */
    @ViewChild(RadSideDrawerComponent, { static: true }) public drawerComponent: RadSideDrawerComponent;
    /** It is a callback method which is been invoked by angular*/
    ngAfterViewInit() {
        this.drawer = this.drawerComponent.sideDrawer;
        this.changeDetectionRef.detectChanges();
    }
    /**
     * Method to display green color rectangle or not based on the
     * 'Rectangle available'option which user choose.
     *
     * @param args event object of Switch element
     */
    rectangleAvailable(args) {
        if (this.cam) {
            const contourSwitch = args.object as Switch;
            this.cam.ocvCameraView.isContourRequired = contourSwitch.checked;
            this.transformedImageProvider.isContourRequired = contourSwitch.checked;
            if (!contourSwitch.checked) {
                this.cam.ocvCameraView.sortedRecPointsList.clear();
            }
        }
    }
    /**
     * Method to enable/disable log
     *
     * @param args event object of Switch element
     */
    enableDisableLog(args) {
        if (this.cam) {
            const logSwitch = args.object as Switch;
            org.opencv.android.JavaCameraView.isLogEnabled = logSwitch.checked;
            this.transformedImageProvider.isLogEnabled = logSwitch.checked;
        }
    }
    deleteLogs() {
        this.transformedImageProvider.deleteLogFiles();
    }

    /** Toggle side drawer menu */
    toggleDrawer() {
        this.drawer.toggleDrawerState();
    }
    /**
     * Sets contour size what user enters
     * @param textVal contour size what user enters
     */
    // submitContourSize(textVal) {
    //     this.transformedImageProvider.contourSize = textVal;
    // }
    /**
     * Sets camera light threshold value what user enters
     * @param textVal camera light threshold value user enters
     */
    submitCameraLightThresholdValue(textVal) {
        this.transformedImageProvider.cameraLightThresholdValue = textVal;
        this.transformedImageProvider.settingsData.cameraLight.thresholdValue = textVal;
        this.transformedImageProvider.saveSettings();
    }
    /**
     * Sets camera light time out value what user enters
     * @param textVal time out value user enters
     */
    submitCameraLightTimeOutValue(textVal) {
        this.transformedImageProvider.cameraLightTimeOutValue = textVal;
    }
    /**
     * Sets adaptive threshold value from user enters
     * @param textVal adaptive threshold value user enters
     */
    submitAdaptiveThresholdValue(textVal) {
        if (textVal % 2 == 0) {
            alert('Only odd numbers allowed.');
            return;
        }
        this.transformedImageProvider.adaptiveThresholdValue = textVal;
        this.transformedImageProvider.settingsData.perspectiveTransformation.thresholdValue = textVal;
        this.transformedImageProvider.saveSettings();
    }
    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    ngOnInit(): void {
        this.opencvInstance = opencv.initOpenCV();
        this.isCameraVisible = true;
        this.createTakePictureButton();
        this.createImageGalleryButton();
        // this.createThresholdImageButtonMinus();
        // this.createThresholdImageButtonPlus();
        this.createAutoFocusImage();
        this.createBadgeView();
        this.createMenuButton();
        this.createRectangleButton();
        if (!isAndroid) {
            return;
        }
        application.android.on(AndroidApplication.activityBackPressedEvent, (data: AndroidActivityBackPressedEventData) => {
            if (this.router.isActive('/capture', false)) {
                data.cancel = true; // prevents default back button behavior
                data.activity.moveTaskToBack(true);
            }
        });


    }
    /**
     * Initialize threshold buttons(plus/minus)
    */
    initThresholdButton() {
        this.thresholdValue = 50;
        this.initButtons();
    }
    /**
     * Initialize all required button on camera view.
    */
    initButtons() {
        // this.initThresholdButtonPlus();
        // this.initThresholdButtonMinus();
        this.initImageGalleryButton();
        this.initCameraButton();
        this.initAutoFocusImageButton();
        this.initBadgeView();
        this.initMenuButton();
        this.initRectangleButton();
    }
    /**
     * It is a callback method and is been invoked when camera view is disappeared
     */
    onUnloaded(args: any) {
        const cameraPlus: any = args.object as CameraPlus;
        if (cameraPlus) {
            if (cameraPlus.ocvCameraView) {
                cameraPlus.ocvCameraView.disableView();
            }
            cameraPlus._nativeView.removeView(cameraPlus.ocvCameraView);
            // this.isContourRequiredOld = this.isContourRequired;
        }
    }
    // /**
    //  * This is been invoked when the threshold values being changed by user
    //  * using threshold button(plus/minus)
    //  *
    //  * @param threshold  is threshold value what user enters from UI
    //  * @param sound  is a sound object
    //  */
    // onCannyThresholdValueChange(threshold: any, sound: any) {
    //     const audioManager = application.android.context.getSystemService(android.content.Context.AUDIO_SERVICE);
    //     audioManager.playSoundEffect(sound, 0.5);
    //     this.cam.ocvCameraView.cannyThreshold = threshold;
    //     const label = this.cam.page.getViewById('thresholdLabelId') as Label;
    //     label.text = threshold;
    //     label.textWrap = true;
    //     label.textAlignment = 'center';
    //     label.visibility = 'visible';
    //     setTimeout(() => {
    //         label.visibility = 'collapse';
    //     }, 200);
    // }
    /**
     * This method is called when camera is loaded, where all the neccessary things like
     * displaying buttons(takePicture, gallery, flash, camera & autoFocus) on camera view
     * are taken care and also initializes camera instance.
     *
     * @param args CameraPlus instance referrence.
     */
    camLoaded(args: any): void {
        this.cam = args.object as CameraPlus;
        const flashMode = this.cam.getFlashMode();
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
                        this._this.cam.isAutoFocusDone = true;
                    } else {
                        this._this.cam.isAutoFocusDone = false;
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
            if (this.isFirstTime) {
                this.transformedImageProvider.loadSettings();
                // this.transformedImageProvider.cameraLightThresholdValue = this.cam.ocvCameraView.mFlashThreshold;
                this.transformedImageProvider.cameraLightTimeOutValue = (this.cam.ocvCameraView.mFlashTimeOut / this.oneMilliSecond);
                // this.transformedImageProvider.adaptiveThresholdValue = this.cam.ocvCameraView.adaptiveThreshold;
                this.transformedImageProvider.isContourRequired = this.cam.ocvCameraView.isContourRequired;
                this.transformedImageProvider.isLogEnabled = org.opencv.android.JavaCameraView.isLogEnabled;
                // this.transformedImageProvider.contourSize = this.cam.ocvCameraView.contourSize;
                this.isFirstTime = false;
            } else {
                this.cam.ocvCameraView.mFlashThreshold = this.transformedImageProvider.cameraLightThresholdValue;
                this.cam.ocvCameraView.mFlashTimeOut = this.transformedImageProvider.cameraLightTimeOutValue * this.oneMilliSecond;
                this.cam.ocvCameraView.adaptiveThreshold = this.transformedImageProvider.adaptiveThresholdValue;
                this.cam.ocvCameraView.isContourRequired = this.transformedImageProvider.isContourRequired;
                org.opencv.android.JavaCameraView.isLogEnabled = this.transformedImageProvider.isLogEnabled;
                // this.cam.ocvCameraView.contourSize = this.transformedImageProvider.contourSize;
            }
            // this.setCameraLightOnOff(this.cam.camera);
        }
        if (args.data) {
            this.cam.showFlashIcon = false;
            this.cam.showToggleIcon = false;
            try {
                this.initButtons();
                this.transformedImageProvider.getThumbnailImagesCountByContentResolver(' DESC', this.activityLoader, this.badgeView);
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
            }
            this.cam._takePicBtn = this.takePicBtn;
        }

        this.initThresholdButton();
        // TEST THE ICONS SHOWING/HIDING
        // this.cam.showCaptureIcon = true;
        // this.cam.showFlashIcon = true;
        // this.cameraPlus.showGalleryIcon = false;
        // this.cameraPlus.showToggleIcon = false;
    }
    /** Checks bulb icon is visible or not */
    checkBulbVisible() {
        if (this.cam.isTorchOn) {
            this.isBulbVisible = this.cam.isTorchOn;
        }
        // console.log('checkBulbVisible', this.isBulbVisible);
    }
    enableDisableLight() {
        this.cam.ocvCameraView.isLightStoppedManually = !this.cam.ocvCameraView.isLightStoppedManually;
        const bulbLabel = this.cam.page.getViewById('bulbId') as Label;
        if (this.cam.ocvCameraView.isLightStoppedManually) {
            var params = this.cam.camera.getParameters();
            params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_OFF);
            this.cam.camera.setParameters(params);
            bulbLabel.className = 'far bulb-icon-fontsize';
        } else {
            bulbLabel.className = 'fas bulb-icon-fontsize';
        }
    }
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
    //                 break;
    //             case android.app.UiModeManager.MODE_NIGHT_AUTO:
    //                 Toast.makeText('android.content.res.Configuration.UI_MODE_NIGHT_AUTO', 'long').show();
    //                 break;
    //             case android.app.UiModeManager.MODE_NIGHT_NO:
    //                 Toast.makeText('android.content.res.Configuration.UI_MODE_NIGHT_NO', 'long').show();
    //                 break;
    //             default:
    //                 Toast.makeText('android.content.res.Configuration.DEFAULT', 'long').show();
    //                 break;
    //         }
    //         const nightModeFlags =
    //             application.android.context.getResources().getConfiguration().uiMode &
    //             android.content.res.Configuration.UI_MODE_NIGHT_MASK;
    //         const params = cameraParam.getParameters();
    //         switch (nightModeFlags) {
    //             case android.content.res.Configuration.UI_MODE_NIGHT_YES:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_YES', 'long').show();
    //                 params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_TORCH); //FLASH_MODE_TORCH);
    //                 cameraParam.setParameters(params);
    //                 break;
    //             case android.content.res.Configuration.UI_MODE_NIGHT_NO:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_NO', 'long').show();
    //                 params.setFlashMode(android.hardware.Camera.Parameters.FLASH_MODE_OFF);
    //                 cameraParam.setParameters(params);
    //                 break;
    //             case android.content.res.Configuration.UI_MODE_NIGHT_UNDEFINED:
    //                 Toast.makeText('android.content.res.Configuration..1.UI_MODE_NIGHT_UNDEFINED', 'long').show();
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
    // /**
    //  * This method initializes plus threshold button in camera view, actually
    //  * it removes an existing one if exists and adds it. And also sets
    //  * the image icon for it.
    //  */
    // initThresholdButtonPlus() {
    //     this.cam._nativeView.removeView(this.thresholdBtnPlus);
    //     this.cam._nativeView.addView(this.thresholdBtnPlus, this.thresholdBtnPlusParams);
    //     this.setImageResource(this.thresholdBtnPlus, 'ic_add_circle_white');
    //     this.cam._nativeView.bringChildToFront(this.thresholdBtnPlus);
    // }
    // /**
    //  * This method initializes minus threshold button in camera view, actually
    //  * it removes an existing one if exists and adds it. And also sets
    //  * the image icon for it.
    //  */
    // initThresholdButtonMinus() {
    //     this.cam._nativeView.removeView(this.thresholdBtnMinus);
    //     this.cam._nativeView.addView(this.thresholdBtnMinus, this.thresholdBtnMinusParams);
    //     this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
    //     this.cam._nativeView.bringChildToFront(this.thresholdBtnMinus);
    // }
    /**
     * This method initializes menu button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    initMenuButton() {
        this.cam._nativeView.removeView(this.menuBtn);
        this.cam._nativeView.addView(this.menuBtn, this.menuParams);
    }
    /**
     * This method initializes rectangle button in camera view, actually
     * it removes an existing one if exists and adds it. And also sets
     * the image icon for it.
     */
    initRectangleButton() {
        this.cam._nativeView.removeView(this.rectangleBtn);
        this.cam._nativeView.addView(this.rectangleBtn, this.rectangleParams);
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
        if (this.takePicBtn) {
            this.initCameraButton();
        } else {
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
    }
    /**
     * Creates auto focus image button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createAutoFocusImage() {
        const _this = this;
        this.autofocusBtn = this.createAutoFocusImageButton();
        this.setImageResource(this.autofocusBtn, 'ic_auto_focus_black');
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
     * Creates menu button. Actually it creates side drawer menun and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createMenuButton() {
        const _this = this;
        this.menuBtn = this.createImageButton();
        this.menuBtn.setId('mb12');
        this.setImageResource(this.menuBtn, 'ic_menu_white');
        const shape = this.createTransparentCircleDrawable();
        this.menuBtn.setBackgroundDrawable(shape);
        this.menuBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                _this.toggleDrawer();
            },
        }));
        this.createMenuParams();
    }
    /** Create layout parameters for menu button, which sets properties like width, height,
     * margin and rules.
     */
    createMenuParams() {
        this.menuParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.menuParams.width = '100';
        this.menuParams.height = '100';
        this.menuParams.setMargins(8, 8, 8, 8);
        // ALIGN_PARENT_BOTTOM
        this.menuParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
        // ALIGN_PARENT_RIGHT
        this.menuParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);

    }

    /**
     * Creates rectangle button. Actually it creates rectangle icon and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    private createRectangleButton() {
        const _this = this;
        this.rectangleBtn = this.createImageButton();
        this.rectangleBtn.setId('rb12');
        this.setImageResource(this.rectangleBtn, 'ic_rectangular_on');
        const shape = this.createTransparentCircleDrawable();
        this.rectangleBtn.setBackgroundDrawable(shape);
        // Green color
        const color = android.graphics.Color.parseColor('#008000');
        this.rectangleBtn.setColorFilter(color);
        this.rectangleBtn.setOnClickListener(new android.view.View.OnClickListener({
            onClick(args: any) {
                if (!_this.isRectangleOn) {
                    _this.setImageResource(_this.rectangleBtn, 'ic_rectangular_on');
                    const color = android.graphics.Color.parseColor('#008000');
                    _this.rectangleBtn.setColorFilter(color);
                    _this.isRectangleOn = !_this.isRectangleOn;
                    _this.cam.ocvCameraView.isContourRequired = true;
                    _this.transformedImageProvider.isContourRequired = true;
                } else {
                    _this.setImageResource(_this.rectangleBtn, 'ic_rectangular_off');
                    const color = android.graphics.Color.parseColor('#ff0000');
                    _this.rectangleBtn.setColorFilter(color);
                    _this.isRectangleOn = !_this.isRectangleOn;
                    _this.cam.ocvCameraView.isContourRequired = false;
                    _this.transformedImageProvider.isContourRequired = false;
                    _this.cam.ocvCameraView.sortedRecPointsList.clear();
                }
            },
        }));
        this.createRectangleParams();
    }
    /** Create layout parameters for rectangle button, which sets properties like width, height,
     * margin and rules.
     */
    private createRectangleParams() {
        this.rectangleParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.rectangleParams.width = '100';
        this.rectangleParams.height = '100';
        this.rectangleParams.setMargins(8, 8, 18, 8);
        // ALIGN_PARENT_TOP
        this.rectangleParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
        // ALIGN_PARENT_LEFT
        this.rectangleParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);

    }
    /**
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createImageGalleryButton() {
        const _this = this;
        this.galleryBtn = this.createImageButton();
        this.galleryBtn.setId('gb12');
        this.setImageResource(this.galleryBtn, 'ic_photo_library_white');
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
    // /** Creates threshold button(plus) and sets it's attributes like padding, image resource,
    //  * scaltype and click event listener. In click event, it sets the threshold value what user enters in UI,
    //  * based on that the finding contour strategy will be changed.
    //  */
    // private createThresholdImageButtonPlus() {
    //     const _this = this;
    //     this.thresholdBtnPlus = this.createImageButton();
    //     this.thresholdBtnPlus.setPadding(34, 5, 34, 34);
    //     this.setImageResource(this.thresholdBtnPlus, 'ic_add_circle_white');
    //     this.thresholdBtnPlus.setContentDescription('threshold-btn-plus-dec');
    //     const shape = this.createCircleDrawableForThresholdBtn();
    //     this.thresholdBtnPlus.setBackgroundDrawable(shape);
    //     this.thresholdBtnPlus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
    //     this.thresholdBtnPlus.setOnClickListener(new android.view.View.OnClickListener({
    //         onClick(view: any) {
    //             _this.thresholdValue++;
    //             _this.onCannyThresholdValueChange(_this.thresholdValue, android.view.SoundEffectConstants.NAVIGATION_UP);

    //         },
    //     }));
    //     this.createThresholdBtnPlusParams();
    // }
    // /** Create layout parameters for threshold button(plus), which sets properties like width, height,
    //  * margin and rules.
    //  */
    // private createThresholdBtnPlusParams() {
    //     this.thresholdBtnPlusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
    //     this.thresholdBtnPlusParams.width = '70';
    //     this.thresholdBtnPlusParams.height = '115';
    //     this.thresholdBtnPlusParams.setMargins(8, 8, 8, 110);
    //     // ALIGN_PARENT_BOTTOM
    //     this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
    //     // ALIGN_PARENT_RIGHT
    //     this.thresholdBtnPlusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);

    // }
    // /** Creates threshold button(minus) and sets it's attributes like padding, image resource,
    //  * scaltype and click event listener. In click event, it sets the threshold value what user enters in UI,
    //  * based on that the finding contour strategy will be changed.
    //  */
    // private createThresholdImageButtonMinus() {
    //     const _this = this;
    //     this.thresholdBtnMinus = this.createImageButton();
    //     this.thresholdBtnMinus.setId('minus123');
    //     this.thresholdBtnMinus.setPadding(34, 34, 34, 5);
    //     this.setImageResource(this.thresholdBtnMinus, 'ic_minus_circle_white');
    //     this.thresholdBtnMinus.setContentDescription('threshold-btn-plus-dec');
    //     const shape = this.createCircleDrawableForThresholdBtn();
    //     this.thresholdBtnMinus.setBackgroundDrawable(shape);
    //     this.thresholdBtnMinus.setScaleType(android.widget.ImageView.ScaleType.CENTER);
    //     this.thresholdBtnMinus.setOnClickListener(new android.view.View.OnClickListener({
    //         onClick(args: any) {
    //             _this.thresholdValue--;
    //             _this.onCannyThresholdValueChange(_this.thresholdValue, android.view.SoundEffectConstants.NAVIGATION_DOWN);
    //         },
    //     }));
    //     this.createThresholdBtnMinusParams();
    // }
    // /** Create layout parameters for threshold button(minus), which sets properties like width, height,
    //  * margin and rules.
    //  */
    // private createThresholdBtnMinusParams() {
    //     this.thresholdBtnMinusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
    //     this.thresholdBtnMinusParams.width = '70';
    //     this.thresholdBtnMinusParams.height = '115';
    //     this.thresholdBtnMinusParams.setMargins(8, 8, 8, 8);
    //     // ALIGN_PARENT_BOTTOM
    //     this.thresholdBtnMinusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
    //     // ALIGN_PARENT_RIGHT
    //     this.thresholdBtnMinusParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_RIGHT);

    // }
    // /** Creats transparent circle for threshold buttons */
    // private createCircleDrawableForThresholdBtn(): any {
    //     const shape = new android.graphics.drawable.GradientDrawable();
    //     shape.setColor(0x99000000);
    //     shape.setCornerRadius(10);
    //     shape.setAlpha(100);
    //     return shape;
    // }
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
     * This method initializes badge view to show captured image(s), actually
     * it removes an existing one if exists and adds it.
     */
    initBadgeView() {
        this.cam._nativeView.removeView(this.badgeView);
        this.cam._nativeView.addView(this.badgeView, this.badgeViewParams);
        // this.badgeView.setText(this.transformedImageProvider.imagesCount + '');
    }
    /**
     * Creates text view to show captured image count
     * and sets it's attributes like padding, maxHeight & maxwidth.
     *
     * @returns Returns TextView object
     */
    createBadgeView() {
        this.badgeView = new android.widget.TextView(application.android.context);
        this.badgeView.setPadding(1, 2, 1, 1);
        this.badgeView.setBackgroundColor(0xff00ff00);
        this.badgeView.setText(this.transformedImageProvider.imagesCount + '');
        this.badgeView.setTextColor(0xFFFFFFFF);
        this.badgeView.setTextAlignment(0x00000004);
        const shape = this.createBadgeViewCircleDrawable();
        this.badgeView.setBackgroundDrawable(shape);
        this.createBadgeViewParams();
    }
    /**
     * Creates badge view circle shape with help of GradientDrawable object
     * and sets it's attributes like color, radius and alpha.
     *
     * @returns Returns shape object
     */
    createBadgeViewCircleDrawable(): any {
        const shape = new android.graphics.drawable.GradientDrawable();
        shape.setColor(0xffff0000);
        shape.setCornerRadius(50);
        shape.setAlpha(150);
        return shape;
    }
    /** Create layout parameters for image count notification button, which sets properties like width, height,
     * margin and rules.
     */
    private createBadgeViewParams() {
        this.badgeViewParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
        this.badgeViewParams.width = '50';
        this.badgeViewParams.height = '50';
        const btnY = (screen.mainScreen.heightDIPs * screen.mainScreen.scale) * 0.76;
        const btnX = (screen.mainScreen.widthDIPs * screen.mainScreen.scale) * 0.07;
        this.badgeViewParams.setMargins(60, 1, 1, 60);

        // ALIGN_PARENT_BOTTOM
        this.badgeViewParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        // ALIGN_PARENT_RIGHT
        this.badgeViewParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
    }
    /**
     * Photo captured event fires when a picture is taken from camera, which actually
     * loads the captured image from ImageAsset.
     *
     * @param args Image captured event data
     */
    photoCapturedEvent(args: any): void {
        this.loadImage(args.data as ImageAsset);
    }
    /**
     * This is been called when toggle the camera button.
     * @param args Camera toggle event data
     */
    toggleCameraEvent(args: any): void {
    }

    /**
     * This method is called when toggle the flash icon on camera. This actually
     * flash off when it already is on or vice-versa.
     */
    toggleFlashOnCam(): void {
        // this.cam.toggleFlash();
    }
    /**
     * Method to display flash icon based on it's property value true/false.
     */
    toggleShowingFlashIcon(): void {
        this.cam.showFlashIcon = !this.cam.showFlashIcon;
    }
    /**
     * Method to switch front/back camera.
     */
    toggleTheCamera(): void {
        this.cam.toggleCamera();
    }
    /**
     * Takes picture from camera when user press the takePicture button on camera view.
     * Then it sets the captured image URI into imageSource to be displayed in front-end.
     *
     * @param thisParam Contains cameraplus instance
     */
    takePicFromCam(thisParam: any): void {
        if (!this.transformedImageProvider.isContourRequired) {
            thisParam.cam.ocvCameraView.sortedRecPointsList.clear();
        }
        thisParam.cam.takePicture({ saveToGallery: true });
        thisParam.activityLoader.show();
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
                ocvCamera: this.cam.ocvCameraView
            },
            // fullscreen: fullScreen,
            viewContainerRef: this.viewContainerRef,
        };
        this.activityLoader.hide();
        this.modalService.showModal(DialogContent, options)
            .then((dialogResult: any) => {
                if (dialogResult) {
                    let capturedCount = 0;
                    if (dialogResult.length > 0) {
                        this.setTransformedImage(this.imgURI);
                        dialogResult.forEach((transformedImg) => {
                            if (transformedImg.isSelected) {
                                this.removeSelectedCapturedImageFromStorage(transformedImg.filePath);
                            } else {
                                this.createThumbNailImage(transformedImg.filePath);
                                this.refreshCapturedImagesinMediaStore(filePathOrg, transformedImg.filePath, 'Add');
                                capturedCount++;
                            }
                        });
                        this.badgeView.setVisibility(android.view.View.VISIBLE);
                        this.transformedImageProvider.imagesCount += capturedCount;
                        const badgeView = this.badgeView;
                        const imgCount = this.transformedImageProvider.imagesCount;
                        setTimeout(() => {
                            badgeView.setText(imgCount + '');
                        }, 100);
                    }
                    this.cam.camera.startPreview();
                    // this.setCameraLightOnOff(this.cam.camera);
                } else {
                    this.removeSelectedCapturedImageFromStorage(filePathOrg);
                    this.removeCapturedImagesFromStorage(imgURI);
                }
            });
    }
    /**
     * Removes the selected captured image from storage and refresh the images list.
     *
     * @param filePathOrg the image file path to be removed
     */
    private removeSelectedCapturedImageFromStorage(filePathOrg: any) {
        try {
            const imgFileOrg: fs.File = fs.File.fromPath(filePathOrg);
            if (imgFileOrg) {
                imgFileOrg.removeSync();
                this.refreshCapturedImagesinMediaStore(filePathOrg, filePathOrg, 'Remove');
            }
        } catch (error) {
            Toast.makeText(localize('could_not_delete_the_capture_image') + error, 'long').show();
            this.logger.error(module.filename + ': removeSelectedCapturedImageFromStorage : ' + error);
            this.cam.camera.startPreview();
            // this.setCameraLightOnOff(this.cam.camera);
        }
    }
    /**
     * Removes the selected captured images from storage and refresh the images list.
     *
     * @param capturedImgList  the list of image file path to be removed
     */
    private removeCapturedImagesFromStorage(capturedImgList: any) {
        try {
            if (!this.imgURIList.isEmpty()) {
                for (let i = 0; i < this.imgURIList.size(); i++) {
                    const transformedImg = this.imgURIList.get(i);
                    const imgURIFile: fs.File = fs.File.fromPath(transformedImg);
                    if (imgURIFile) {
                        imgURIFile.removeSync();
                    }
                    this.refreshCapturedImagesinMediaStore(transformedImg, transformedImg, 'Remove');
                }
            }
            this.cam.camera.startPreview();
            // this.setCameraLightOnOff(this.cam.camera);
        } catch (error) {
            Toast.makeText(localize('could_not_delete_the_capture_image') + error, 'long').show();
            this.logger.error(module.filename + ': removeCapturedImagesFromStorage :' + error);
            this.cam.camera.startPreview();
            // this.setCameraLightOnOff(this.cam.camera);
        }
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
                Toast.makeText(localize('error_while_setting_image_in_preview_area') + error, 'long').show();
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
        this.galleryParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_BOTTOM);
        // ALIGN_PARENT_LEFT
        this.galleryParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_LEFT);
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
            Toast.makeText(localize('could_not_sync_the_captured_image_file') + error, 'long').show();
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
            // const thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            const thumbnailImagePath = org.opencv.android.JavaCameraView.createThumbnailImage(imgURI,600);
            // var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

            const uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            this.galleryBtn.setImageURI(uri);
        } catch (error) {
            Toast.makeText(localize('error_while_creating_thumbnail_image') + error, 'long').show();
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
            const rectanglePointsStr = 'RPTSTR';
            let logFile = '';
            if (this.transformedImageProvider.isContourRequired) {
                if (this.transformedImageProvider.isLogEnabled) {
                    console.log('OxsEye log enabled.');
                    const fileName = this.cam.ocvCameraView.getFileName(filePath);
                    // const appRootPath = knownFolders.currentApp();
                    const logPath = android.os.Environment.getExternalStorageDirectory() + '/DCIM/oelog';
                    // const documents: Folder = <Folder>knownFolders.documents();
                    const folder: Folder = <Folder>Folder.fromPath(logPath);
                    logFile = logPath + '/Logcat' + fileName + '.txt';
                    org.opencv.android.JavaCameraView.createLogs(logFile);
                    console.log('OxsEye log created: ' + logFile);
                }
                this.imgURIList = this.cam.ocvCameraView.transformMore(filePath);
                if (!this.imgURIList.isEmpty()) {
                    this.imgURI = this.imgURIList.get(0);
                    for (let i = 0; i < this.imgURIList.size(); i++) {
                        SendBroadcastImage(this.imgURIList.get(i));
                    }
                    const fileName = this.imgURI.substring(this.imgURI.lastIndexOf('PT_IMG'), this.imgURI.lastIndexOf('transformed'));
                    setTimeout(() => {
                        this.transformedImageProvider.LoadPossibleContourImages(fileName)
                            .then(() => {
                                this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
                            });
                    }, 300);
                } else {
                    this.activityLoader.hide();
                    Toast.makeText(localize('no_image_captured'), 'long').show();
                    this.cam.camera.startPreview();
                }
            } else if (!this.transformedImageProvider.isContourRequired) {
                this.imgURIList = new java.util.ArrayList();
                // const srcImg = org.opencv.imgcodecs.Imgcodecs.imread(filePath, org.opencv.core.CvType.CV_8UC1);
                // console.log('srcImgd :' + srcImg);
                this.imgURI = this.cam.ocvCameraView.performAdaptiveThreshold(filePath, this.transformedImageProvider.adaptiveThresholdValue);
                    console.log('this.imgURI...  :' + this.imgURI );
                SendBroadcastImage(this.imgURI);
                this.imgURIList.add(this.imgURI);
                const fileName = this.imgURI.substring(this.imgURI.lastIndexOf('PT_IMG'), this.imgURI.lastIndexOf('transformed'));
                setTimeout(() => {
                    this.transformedImageProvider.LoadPossibleContourImages(fileName)
                        .then(() => {
                            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
                        });
                }, 300);
            }
            if (this.transformedImageProvider.isLogEnabled) {
                if (org.opencv.android.JavaCameraView.logProcess) {
                    org.opencv.android.JavaCameraView.logProcess.destroy();
                }
                if (org.opencv.android.JavaCameraView.clearLogProcess) {
                    org.opencv.android.JavaCameraView.clearLogProcess.destroy();
                }
                SendBroadcastImage(logFile);
            }
        } catch (error) {
            this.activityLoader.hide();
            Toast.makeText(localize('error_while_performing_perspective_transformation'), 'long').show();
            console.log(module.id + ': ' +error);
            this.logger.error(module.filename + ': ' + error);
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
                        Toast.makeText(localize('image_source_is_bad'), 'long').show();
                    }
                },
                (error) => {
                    this.imageSource = this.empty;
                    this.logger.error('Error getting image source from asset. ' + module.filename
                        + this.logger.ERROR_MSG_SEPARATOR + error);
                    Toast.makeText(localize('error_getting_image_source_from_asset'), 'long').show();
                },
            );
        } else {
            this.logger.error('Image Asset was null. ' + module.filename);
            Toast.makeText(localize('image_asset_was_null'), 'long').show();
            this.imageSource = this.empty;
        }
    }
}
