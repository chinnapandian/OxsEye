import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ModalDialogOptions, ModalDialogService } from 'nativescript-angular/modal-dialog';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { ImageSource, fromFile } from 'tns-core-modules/image-source';
import { Folder, path, knownFolders } from "tns-core-modules/file-system";

import { ActivityLoader } from '../activityloader/activityloader.common';
import { DialogContent } from '../dialog/dialog.component';
import { SendBroadcastImage } from '../providers/transformedimage.provider';

import { L } from 'nativescript-i18n/angular';
import { OxsEyeLogger } from '../logger/oxseyelogger';

import { Color } from 'tns-core-modules/color';
// import { OpenCvCameraPreview } from 'nativescript-opencv';
// import * as cv from 'nativescript-opencv';

import * as opencv from 'nativescript-opencv-plugin';
import * as Toast from 'nativescript-toast';
import * as fs from 'tns-core-modules/file-system';


import * as application from 'tns-core-modules/application';
// import * as buttonModule from "tns-core-modules/ui/button";

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
    private cam: CameraPlus;
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
    /** Localization */
    private locale: any;
    /** Lable for save button */
    private saveBtnLable: any;
    /** Lable for manual button */
    private manualBtnLable: any;
    /** Lable for perform button */
    private performBtnLable: any;
    /** Lable for retake button */
    private retakeBtnLable: any;

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

    /** Flash button variable */
    private flashBtn: any;
    /** Indicates whether flash is on/off */
    private flashEnabled: boolean = false;

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
    ) {
        this.locale = new L();
    }


    /**
     * Initialization method initializes OpenCV module and buttons like
     * takePicture, gallery and autoFocus buttons in camera view.
     */
    ngOnInit(): void {
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
    }
    createButtons() {
        const width = this.cam.width;
        const height = this.cam.height;
        this.createTakePictureButton(width, height);
        this.createImageGalleryButton(height);
        this.createFlashButton(width, height);
        this.createSwitchCameraButton(width, height);
    }
    /**
     * This method is called when camera is loaded, where all the neccessary things like
     * displaying buttons(takePicture, gallery, flash, camera & autoFocus) on camera view
     * are taken care and also initializes camera instance.
     * 
     * @param args CameraPlus instance referrence.
     */
    camLoaded(args: any): void {
        console.log('camLoaded..');

        this.saveBtnLable = this.locale.transform('save');
        this.manualBtnLable = this.locale.transform('manual');
        this.retakeBtnLable = this.locale.transform('retake');
        this.performBtnLable = this.locale.transform('perform');

        this.cam = args.object as CameraPlus;
        const flashMode = this.cam.getFlashMode();

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
    createTakePictureButton(width: any, height: any) {
        const _this = this;
        let picOutline = createImageButton(_this, CGRectMake(width - 69, height - 80, 50, 50), null
            , null, null, createIcon('picOutline', null, null), null
        );
        picOutline.transform = CGAffineTransformMakeScale(1.5, 1.5);
        this.cam.ios.addSubview(picOutline); //snapPicture
        var takePicBtn = createImageButton(_this, CGRectMake(width - 70, height - 80.7, 50, 50), null, 'snapPicture', null, createIcon('takePic', null, null), null);
        this.cam.ios.addSubview(takePicBtn);
        this.cam._swifty._owner.get().confirmPhotos = false;
        // this.cam._swifty.snapPicture =  function (options) {
        //     alert('snapPicture....');
        // };
    }

    /**
     * Creates flash button in the camera view
     * 
     * @param width width of the camera view
     */
    createFlashButton(width: any, height: any) {
        this.cam._swifty._flashBtnHandler = flashBtnHandler;
        this.cam._swifty._flashBtnHandler();
    }

    /**
     * Creates switch camera button in the camera view
     * 
     * @param width width of the camera view
     */
    createSwitchCameraButton(width: any, height: any) {
        var switchCameraBtn = createImageButton(this, CGRectMake(width - 85, 80, 100, 50), null, 'switchCam', null, createIcon('toggle', CGSizeMake(65, 50), null), null);
        switchCameraBtn.transform = CGAffineTransformMakeScale(0.75, 0.75);
        this.cam.nativeView.addSubview(switchCameraBtn);
    }

    /**
     * Creates image gallery button. Actually it creates image button and setting
     * it's properties like image icon, shape and color along with click event listener in it.
     */
    createImageGalleryButton(height: any) {
        const _this = this;
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

    }
    chooseFromLibrary() {
        alert('chooseFromLibrary');
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
    photoCapturedEvent(capturedData: any): void {
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
    }
    /**
     * This is been called when toggle the camera button.
     * @param args Camera toggle event data
     */
    toggleCameraEvent(args: any): void {
        console.log('camera toggled');
        // const width = this.cam.width;
        // const height = this.cam.height;
        // this.createFlashButton(width, height);
        // this.cam._swifty._owner.get().showFlashIcon = true;
    }

    /**
     * This method is called when toggle the flash icon on camera. This actually
     * flash off when it already is on or vice-versa.
     */
    toggleFlashOnCam(): void {
        alert("Clicked Flash");
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

    imagesGalleryEvent(args: any): void {
        this.router.navigate(['imagegallery']);
    }
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
    showCapturedPictureDialog(fullScreen: boolean, filePathOrg: string, imgURI: string, recPointsStr) {
        const options: ModalDialogOptions = {
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
                    // this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, 'Add');
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
                            // SendBroadcastImage(imgUriContourPath);
                        }
                        // Todo - End

                        // this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, 'Remove');
                    } catch (error) {
                        Toast.makeText('Could not delete the capture image.' + error, 'long').show();
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
                // SendBroadcastImage(this.imgURI);
            } catch (error) {
                Toast.makeText('Error while setting image in preview area' + error, 'long').show();
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
            Toast.makeText('Could not sync the captured image file. ' + error, 'long').show();
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
            // Todo: const thumbnailImagePath = opencv.createThumbnailImage(imgURI);
            let thumbnailImagePath = OpenCVWrapper.createThumbnailImage(imgURI);
            // com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

            // const uri = android.net.Uri.parse('file://' + thumbnailImagePath);
            // thumbnailImagePath = thumbnailImagePath.toString().substring(7);
            let buttonImage = UIImage.imageNamed(thumbnailImagePath);
            this.galleryBtn.setImageForState(buttonImage, UIControlState.Normal);
            this.galleryBtn.setImageForState(buttonImage, UIControlState.Highlighted);
            this.galleryBtn.setImageForState(buttonImage, UIControlState.Selected);
        } catch (error) {
            Toast.makeText('Error while creating thumbnail image. ' + error, 'long').show();
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
            let ptImgPngUri = '';
            // let opencvInstance = OpenCVWrapper.new();
            ptImgPngUri = OpenCVWrapper.performTransformation(filePath);
            console.log('Transformed Image URI: ', ptImgPngUri);

            // const imgURITemp = opencv.performPerspectiveTransformation(filePath, '');
            this.imgURI = ptImgPngUri.substring(0, ptImgPngUri.indexOf('RPTSTR'));
            const rectanglePointsStr = ptImgPngUri.substring(ptImgPngUri.indexOf('RPTSTR'));
            this.showCapturedPictureDialog(true, filePath, this.imgURI, rectanglePointsStr);
            // this.showCapturedPictureDialog(true, filePath, ptImgPngUri, '');
        } catch (error) {
            this.activityLoader.hide();
            Toast.makeText('Error while performing perspective transformation process. Please retake picture', 'long').show();
        }
    }
    /**
     * Method to perform prespective transformation for the captured image 
     * and sets the transformed image URI in this.imgURI variable.
     * 
     * @param imageAsset ImageAsset object instance referrence
     */
    private loadImage(capturedData: any): void {
        let cameraPlus = capturedData.object as CameraPlus;
        let imageAsset: PHAsset = capturedData.data;
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


            this.imageSource = new ImageSource();

            this.imageSource.fromAsset(capturedData.data).then(
                (imgSrc) => {
                    if (imgSrc) {
                        this.zone.run(() => {

                            // const img: ImageSource = <ImageSource>fromFile(imgSrc);
                            // const folder: Folder = <Folder>knownFolders.currentApp();
                            var folder = fs.path.join(fs.knownFolders.documents().path);
        // let folders0 = fs.Folder.fromPath(folder0);
                            // const folderDest = knownFolders.documents();
                            const fileName = 'capturedimages/IMG_' + Date.now() + '.jpg';
                            const pathDest = path.join(folder, fileName);
                            const saved: boolean = imgSrc.saveToFile(pathDest, "jpg");
                            if (saved) {
                                // UIImageWriteToSavedPhotosAlbum(capturedData.data.nativeImage, null, null, null);
                                // imgSrc.saveToAlbum(this.imageSource, false, false, function () {
                                //     alert('The photo was saved!');
                                // });
                                console.log('Org File Path: ' + pathDest);

                                // const fp = (cameraPlus.ios) ? cameraPlus.ios : cameraPlus.android;
                                // this.imageSourceOrg = fp;
                                this.imgURI = '';
                                this.imgURI = pathDest;

                                // if (fp.indexOf('.png') > 0) {
                                //     this.imgURI = fp;
                                this.imageSource = this.imgURI;
                                // } else {
                                //     this.imgURI = '';
                                this.performPerspectiveTransformation(pathDest);
                            }
                        });
                    } else {
                        this.imageSource = this.empty;
                        Toast.makeText('Image source is bad.', 'long').show();
                    }
                },
                (error) => {
                    this.imageSource = this.empty;
                    this.logger.error('Error getting image source from asset. ' + module.filename
                        + this.logger.ERROR_MSG_SEPARATOR + error);
                    Toast.makeText('Error getting image source from asset.', 'long').show();
                },
            );
        } else {
            this.logger.error('Image Asset was null. ' + module.filename);
            Toast.makeText('Image Asset was null', 'long').show();
            this.imageSource = this.empty;
        }
    }
}
var goImageGallery = function (_this: any): any {
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
}
var snapPicture = function () {
    alert('snapPicture');
}

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
var createIcon = function (type, size, color): any {
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
var drawFlash = function (color: any) {
    var iconColor = new Color(color || '#fff').ios;
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
var drawFlashOff = function (color: any) {
    var iconColor = new Color(color || '#fff').ios;
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
var drawToggle = function (color: any) {
    var iconColor = new Color(color || '#fff').ios;
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
var drawPicOutline = function (color: any) {
    var iconColor = new Color(color || '#fff').ios;
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
    var iconColor = new Color(color || '#fff').ios;
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
    var iconColor = new Color(color || '#fff').ios;
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
var createImageButton = function (target: any, frame: any, label: any, eventName: any, align: any, img: any, imgSelected: any
): any {
    var btn;
    if (frame) {
        btn = UIButton.alloc().initWithFrame(frame);
    }
    else {
        btn = UIButton.alloc().init();
    }
    if (label) {
        btn.setTitleForState(label, 0);
        btn.setTitleColorForState(new Color('#fff').ios, 0);
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
