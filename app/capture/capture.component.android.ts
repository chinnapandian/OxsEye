import { Component, OnDestroy, OnInit, ViewChild, ElementRef, NgZone, ViewContainerRef } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular/router';
import { Page } from 'tns-core-modules/ui/page';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
import { ImageSource } from 'tns-core-modules/image-source';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { Image } from 'tns-core-modules/ui/image';
import * as opencv from 'nativescript-opencv-plugin';
import * as Toast from 'nativescript-toast';
import { Slider } from "tns-core-modules/ui/slider";
import { Observable, PropertyChangeData } from "tns-core-modules/data/observable";
import { StackLayout } from "tns-core-modules/ui/layouts/stack-layout";
import { GridLayout } from "tns-core-modules/ui/layouts/grid-layout";
import { View } from "tns-core-modules/ui/core/view";
import { RotationGestureEventData } from "tns-core-modules/ui/gestures";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { DialogContent } from "../dialog/dialog.component";
import { ImageGalleryComponent } from "../imagegallery/imagegallery.component";
import { knownFolders, File, Folder } from "tns-core-modules/file-system";
import { SendBroadcastImage, ActivityLoader } from '../providers/transformedimage.provider';
import { Router } from "@angular/router";
import { Switch } from "tns-core-modules/ui/switch";
import * as application from "tns-core-modules/application";
import * as fs from "file-system";

//import { AfterViewInit, ChangeDetectorRef } from "@angular/core";
//import { RadSideDrawerComponent } from "nativescript-ui-sidedrawer/angular";
//import { RadSideDrawer, DrawerTransitionBase, PushTransition } from 'nativescript-ui-sidedrawer';

declare var android: any

@Component({
	selector: "ns-capture",
	moduleId: module.id,
	styleUrls: ['./capture.component.css'],
	templateUrl: "./capture.component.html",
})

export class CaptureComponent implements OnInit, OnDestroy {
	private _cam: any;
	private _isImageBtnVisible: any;
	private _transformedFilePath: any;
	private _page: any;
	private _galleryBtn: any;
	private _takePicBtn: any;
	private _autofocusBtn: any;
	private _galleryParams: any;
	private _takePicParams: any;
	private _autofocusParams: any;
	// private _mainContentText: string;
	private _isAutomaticChecked: boolean;
	// private _sideDrawerTransition: DrawerTransitionBase;

	public isCameraVisible: any;
	public imageSource: ImageSource;
	public imageSourceOrg: any;

	public imgURI: any;
	public wrappedImage: any;
	public fileName: any;
	public opencvInstance: any;
	public imgEmpty: any;
	public isBusy: any;

	public screenHeight: any;

	constructor(
		private zone: NgZone,
		private modalService: ModalDialogService,
		private viewContainerRef: ViewContainerRef,
		private router: Router,
		private activityLoader: ActivityLoader
		//	private _changeDetectionRef: ChangeDetectorRef
	) {
	}


	// @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
	// private drawer: RadSideDrawer;

	// ngAfterViewInit() {
	// 	this.drawer = this.drawerComponent.sideDrawer;
	// 	this._changeDetectionRef.detectChanges();
	// 	// this.sideDrawerTransition = new PushTransition();
	// 	// this._changeDetectionRef.detectChanges();
	// }
	// public onAutomaticChecked(args) {
	// 	this._isAutomaticChecked = (<Switch>args.object).checked;
	// }

	// get sideDrawerTransition(): DrawerTransitionBase {
	//     return this._sideDrawerTransition;
	// }

	// set sideDrawerTransition(value: DrawerTransitionBase) {
	//     this._sideDrawerTransition = value;
	// }

	// get mainContentText() {
	// 	return this._mainContentText;
	// }

	// set mainContentText(value: string) {
	// 	this._mainContentText = value;
	// }

	// public openDrawer() {
	// 	this.drawer.showDrawer();
	// }

	// public onCloseDrawerTap() {
	// 	this.drawer.closeDrawer();
	// }



	ngOnInit(): void {
		// this.mainContentText = "SideDrawer for NativeScript can be easily setup in the HTML definition of your _page by defining tkDrawerContent and tkMainContent. The component has a default transition and position and also exposes notifications related to changes in its state. Swipe from left to open side drawer.";

		console.log("Initializing OpenCV...");
		this.opencvInstance = opencv.initOpenCV();

		this.isCameraVisible = true;
		this._isImageBtnVisible = false;
		this.isBusy = false;
		this._isAutomaticChecked = true;

		this.createTakePictureButton();
		this.createImageGalleryButton();
		this.createAutoFocusImage();

	}

	ngOnDestroy() {
		console.log('Destroy called...');
	}

	camLoaded(e: any): void {
		console.log('***** _cam loaded *****');
		this.isBusy = false;
		this._cam = e.object as CameraPlus;

		let flashMode = this._cam.getFlashMode();

		// Turn flash on at startup
		if (flashMode == 'off') {
			this._cam.toggleFlash();
		}
		let cb = new android.hardware.Camera.AutoFocusMoveCallback(

			{
				_this: this,
				onAutoFocusMoving: function (start, camera) {
					let animate = this._this._autofocusBtn.animate();
					if (!start) {
						animate.scaleX(1);
						animate.scaleY(1);
						let color = android.graphics.Color.parseColor("#008000"); //Green color           
						this._this._autofocusBtn.setColorFilter(color);
					} else {
						animate.scaleX(0.50);
						animate.scaleY(0.50);
						animate.setDuration(100);

						let color = android.graphics.Color.parseColor("#ff0000"); // Red color
						this._this._autofocusBtn.setColorFilter(color);

						animate.start();
					}
				}
			});
		if (this._cam.camera) {
			this._cam.camera.setAutoFocusMoveCallback(cb);
		}
		if (e.data) {

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
		//this._cam.showCaptureIcon = true;
		//this._cam.showFlashIcon = true;
		// this.cameraPlus.showGalleryIcon = false;
		// this.cameraPlus.showToggleIcon = false;
	}
	initCameraButton() {
		this._cam.nativeView.removeView(this._takePicBtn);
		this._cam.nativeView.addView(this._takePicBtn, this._takePicParams);
	}

	initImageGalleryButton() {
		this._cam.nativeView.removeView(this._galleryBtn);
		this._cam.nativeView.addView(this._galleryBtn, this._galleryParams);
		this.setImageResource(this._galleryBtn, 'ic_photo_library_white');
	};
	initAutoFocusImageButton() {
		this._cam.nativeView.removeView(this._autofocusBtn);
		this._cam.nativeView.addView(this._autofocusBtn, this._autofocusParams);
	};
	createTakePictureButton() {
		let _this = this;
		this._takePicBtn = this.createImageButton();
		this.setImageResource(this._takePicBtn, 'ic_camera');
		// let takePicDrawable = this.getImageDrawable('ic_camera');
		// this._takePicBtn.setImageResource(takePicDrawable);
		let shape = this.createTransparentCircleDrawable();
		this._takePicBtn.setBackgroundDrawable(shape);
		let color = android.graphics.Color.parseColor("#ffffff"); // white color
		this._takePicBtn.setColorFilter(color);
		// this._takePicBtn.setScaleX(0.50);
		// this._takePicBtn.setScaleY(0.50);
		this._takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function (args) {
				_this.takePicFromCam(_this);

			}
		}));
		this.createTakePictureParams()
	}

	createAutoFocusImage() {
		let _this = this;
		this._autofocusBtn = this.createAutoFocusImageButton();
		this.setImageResource(this._autofocusBtn, 'ic_auto_focus_black');

		// let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
		// this._autofocusBtn.setImageResource(openGalleryDrawable);
		let shape = this.createAutofocusShape();
		this._autofocusBtn.setBackgroundDrawable(shape);
		this.createAutoFocusImageParams();
	}

	createAutoFocusImageButton(): any {
		let btn = new android.widget.ImageView(application.android.context);
		btn.setPadding(34, 34, 34, 34);
		btn.setMaxHeight(158);
		btn.setMaxWidth(158);
		btn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
		let color = android.graphics.Color.parseColor("#008000"); // Green color
		btn.setColorFilter(color);
		return btn;
	}

	createImageGalleryButton() {
		let _this = this;
		this._galleryBtn = this.createImageButton();
		this.setImageResource(this._galleryBtn, 'ic_photo_library_white');

		// let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
		// this._galleryBtn.setImageResource(openGalleryDrawable);

		let galleryBtnId = application.android.context.getResources().getIdentifier("gallery_btn", "id", application.android.context.getPackageName());

		this._galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
		this._galleryBtn.setContentDescription('gallery-btn-dec');
		let shape = this.createTransparentCircleDrawable();
		this._galleryBtn.setBackgroundDrawable(shape);
		this._galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function (args) {
				_this.goImageGallery();
			}
		}));
		this.createImageGallerryParams();
	}


	getImageDrawable(iconName): any {
		let drawableId = application.android.context
			.getResources()
			.getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
		return drawableId;
	}
	createTransparentCircleDrawable(): any {
		let shape = new android.graphics.drawable.GradientDrawable();
		shape.setColor(0x99000000);
		shape.setCornerRadius(96);
		shape.setAlpha(150);
		return shape;
	}
	createAutofocusShape(): any {

		let shape = new android.graphics.drawable.ShapeDrawable();
		shape.setAlpha(0);
		return shape;

	}
	createImageButton(): any {
		let btn = new android.widget.ImageButton(application.android.context);
		btn.setPadding(34, 34, 34, 34);
		btn.setMaxHeight(58);
		btn.setMaxWidth(58);
		return btn;
	}

	imagesSelectedEvent(e: any): void {
		console.log('IMAGES SELECTED EVENT!!!');
		this.loadImage((e.data as ImageAsset[])[0]);
	}

	photoCapturedEvent(e: any): void {
		console.log('PHOTO CAPTURED EVENT!!!');
		this.loadImage(e.data as ImageAsset);
	}

	toggleCameraEvent(e: any): void {
		console.log("camera toggled");
	}

	recordDemoVideo(): void {
		try {
			console.log(`*** start recording ***`);
			this._cam.record();
		} catch (err) {
			console.log(err);
		}
	}

	stopRecordingDemoVideo(): void {
		try {
			console.log(`*** stop recording ***`);
			this._cam.stop();
			console.log(`*** after this._cam.stop() ***`);
		} catch (err) {
			console.log(err);
		}
	}

	toggleFlashOnCam(): void {
		this._cam.toggleFlash();
	}

	toggleShowingFlashIcon(): void {
		console.log(`showFlashIcon = ${this._cam.showFlashIcon}`);
		this._cam.showFlashIcon = !this._cam.showFlashIcon;
	}

	toggleTheCamera(): void {
		this._cam.toggleCamera();
	}

	openCamPlusLibrary(): void {
		this._cam.chooseFromLibrary();
	}

	takePicFromCam(_this): void {
		_this.isBusy = true;
		_this.activityLoader.show();
		_this._cam.takePicture({ saveToGallery: true });


		this.imgURI = '';
		this.imageSource = null;
	}

	goImageGallery() {
		this.router.navigate(["imagegallery"]);
	}

	showCapturedPictureDialog(fullscreen: boolean, filePathOrg: string, imgURI: string) {
		let options: ModalDialogOptions = {
			context: {
				imageSource: imgURI,
				imageSourceOrg: filePathOrg,
				isAutoCorrection: true //this._isAutomaticChecked
			},
			fullscreen: fullscreen,
			viewContainerRef: this.viewContainerRef
		};
		this.activityLoader.hide();
		this.modalService.showModal(DialogContent, options)
			.then((dialogResult: string) => {
				if (dialogResult) {
					// let dilogResultTemp = dialogResult;
					// if (dialogResult.indexOf("_TEMP") > 0) {
					// 	for (let i = 0; i < 4; i++) {
					// 		dilogResultTemp = dilogResultTemp.replace("_TEMP" + i, "");
					// 	}
					// }
					this.setTransformedImage(dialogResult);
					this.createThumbNailImage(dialogResult);
					this.refreshCapturedImagesinMediaStore(filePathOrg, dialogResult, "Add");
				} else {
					try {
						let imgFileOrg: fs.File = fs.File.fromPath(filePathOrg);

						if (imgFileOrg)
							imgFileOrg.remove();
						let imgURIFile: fs.File = fs.File.fromPath(imgURI);
						if (imgURIFile)
							imgURIFile.remove();
						this.refreshCapturedImagesinMediaStore(filePathOrg, imgURI, "Remove");
					} catch (e) {
						alert('Couldnot delete the file');
					}
				}
			})
	}

	setTransformedImage(imgURIParam) {
		if (imgURIParam) {
			try {
				this._isImageBtnVisible = true;
				this.imgURI = imgURIParam;
				this.imageSource = imgURIParam;
				SendBroadcastImage(this.imgURI);
			} catch (e) {
				Toast.makeText("Error while setting image in preview area" + e, "long").show();
			}
		}
	}

	// handle value change
	onSliderLoaded(args): void {
		const sliderComponent: Slider = <Slider>args.object;
		sliderComponent.on("valueChange", (sargs) => {
			console.log("SliderValue: " + (<Slider>sargs.object).value);
			var thresholdValue = (<Slider>sargs.object).value;
			if (thresholdValue % 2 == 0) {
				thresholdValue++;
			}
			this._isImageBtnVisible = false;

			this.performAdaptiveThreshold(thresholdValue, sargs);
		});
	}
	onPageLoaded(args) {
		this._page = <Page>args.object;

	}

	private createTakePictureParams() {
		this._takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this._cam.insetButtons === true) {
		// var layoutHeight = this._cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		// this._takePicParams.setMargins(8, 8, 8, yMargin);
		// }
		// else {
		this._takePicParams.width = "100";
		this._takePicParams.height = "100";
		this._takePicParams.setMargins(8, 8, 8, 8);
		// }
		this._takePicParams.addRule(12); //ALIGN_PARENT_BOTTOM
		this._takePicParams.addRule(11); //HORIZONTAL_CENTER
	}

	private createAutoFocusImageParams() {
		this._autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this.insetButtons === true) {
		// var layoutWidth = this._cam._nativeView.getWidth();
		// console.log("layoutWidth = " + layoutWidth);
		// var xMargin = layoutWidth * 0.1;
		// var layoutHeight = this._cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		this._autofocusParams.width = "300";
		this._autofocusParams.height = "300";
		//_galleryParams.setMargins(xMargin, 18, 18, yMargin);
		this._autofocusParams.setMargins(8, 8, 8, 8);
		// }
		this._autofocusParams.addRule(13); //ALIGN_PARENT_CENTER
	}

	private setImageResource(btn, iconName) {
		let openGalleryDrawable = this.getImageDrawable(iconName);
		btn.setImageResource(openGalleryDrawable);
	}

	private createImageGallerryParams() {
		this._galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this.insetButtons === true) {
		// var layoutWidth = this._cam._nativeView.getWidth();
		// console.log("layoutWidth = " + layoutWidth);
		// var xMargin = layoutWidth * 0.1;
		// var layoutHeight = this._cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		this._galleryParams.width = "100";
		this._galleryParams.height = "100";
		// this._galleryParams.setMargins(xMargin, 8, 8, yMargin);
		this._galleryParams.setMargins(8, 8, 8, 8);
		// }
		// else {
		//     _galleryParams.setMargins(8, 8, 8, 8);
		// }
		this._galleryParams.addRule(12); //ALIGN_PARENT_BOTTOM
		this._galleryParams.addRule(9); //ALIGN_PARENT_LEFT
	}

	private refreshCapturedImagesinMediaStore(filePathOrg: string, imgURI: string, action: string) {
		try {
			SendBroadcastImage(filePathOrg);
			SendBroadcastImage(imgURI);
			if (action == "Add") { // this thumbnail image will be available only in 'Add' case.
				let thumnailOrgPath = imgURI.replace('PT_IMG', 'thumb_PT_IMG');
				SendBroadcastImage(thumnailOrgPath);
			}
		} catch (e) {
			alert('Could not sync the file ');
		}
	}
	private createThumbNailImage(imgURI: string): any {
		try {
			let thumbnailImagePath = opencv.createThumbnailImage(imgURI);
			// var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
			//com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

			let uri = android.net.Uri.parse("file://" + thumbnailImagePath);
			this._galleryBtn.setImageURI(uri);
		} catch (e) {
			console.log('Error while creating thumbnail image. ' + e);
		}
	}

	private performAdaptiveThreshold(thresholdValue, sargs): void {
		this.zone.run(() => {
			this.imgEmpty = this.imgURI + "?ts=" + new Date().getTime();
			this.imageSource = this.imgEmpty;
		});
		this.zone.run(() => {
			this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, thresholdValue);
			this._isImageBtnVisible = true;
			this.imageSource = this.imgURI;
		});
	}
	private performPerspectiveTransformation(filePath): void {
		try {
			// this.wrappedImage = opencv.performPerspectiveTransformationForWrappedImage(filePath);
			// this.fileName = opencv.getFileName(filePath);
			// this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, 41);

			// let contourPath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath();
			// try {

			// 	for (let i = 0; i < 10; i++) {
			// 		let contourImgFile: fs.File = fs.File.fromPath(contourPath + "/contourImage0" + i + ".jpg");
			// 		if (contourImgFile)
			// 			contourImgFile.remove();
			// 	}
			// } catch (e) {
			// 	alert('Couldnot delete contour image file');
			// }
			this.imgURI = opencv.performPerspectiveTransformation(filePath, '');

			// if (!this.imgURI) {
			// 	Toast.makeText("No rectangles were found. Please take correct picture.", "long").show();
			// }
			this.isBusy = false;

			// for (let i = 0; i < 10; i++) {
			// 	SendBroadcastImage(contourPath + "/contourImage0" + i + ".jpg");
			// }
			this.showCapturedPictureDialog(true, filePath, this.imgURI);
		} catch (err) {
			console.log(err);
			this.isBusy = false;
			alert('Error while performing perspective transformation process. Please retake picture');
		}
	}

	private loadImage(imageAsset: ImageAsset): void {
		if (imageAsset) {
			this.imageSource = new ImageSource();

			this.imageSource.fromAsset(imageAsset).then(
				(imgSrc) => {
					if (imgSrc) {
						this.zone.run(() => {
							var fp = (imageAsset.ios) ? imageAsset.ios : imageAsset.android;

							this.imageSourceOrg = fp;

							this.imgURI = '';

							if (fp.indexOf('.png') > 0) {
								this.imgURI = fp;
								this.imageSource = this.imgURI;
							} else {
								this.imgURI = '';

								this.performPerspectiveTransformation(fp);
							}
						})
					} else {
						this.imageSource = null;
						alert('Image source is bad.');
					}
				},
				(err) => {
					this.imageSource = null;
					console.error(err);
					alert('Error getting image source from asset');
				}
			)
		} else {
			console.log('Image Asset was null')
			alert('Image Asset was null');
			this.imageSource = null;
		}
	}
}
