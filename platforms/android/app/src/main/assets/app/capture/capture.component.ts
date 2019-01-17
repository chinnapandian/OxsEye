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
import * as application from "tns-core-modules/application";
import * as fs from "file-system";

let RC_GALLERY = 9001
declare var android: any

@Component({
	selector: "ns-capture",
	moduleId: module.id,
	styleUrls: ['./capture.component.css'],
	templateUrl: "./capture.component.html",
})
export class CaptureComponent implements OnInit, OnDestroy {
	private cam: CameraPlus;
	private isCameraVisible: any;
	private isImageBtnVisible: any;
	public imageSource: ImageSource;
	public imageSourceOrg: any;

	public imgURI: any;
	public wrappedImage: any;
	public fileName: any;
	public opencvInstance: any;
	public imgEmpty: any;
	public isBusy: any;

	public screenHeight: any;

	private transformedFilePath: any;
	private page: any;
	private galleryBtn: any;
	private takePicBtn: any;
	private autofocusBtn: any;
	private galleryParams: any;
	private takePicParams: any;
	private autofocusParams: any;

	constructor(
		private zone: NgZone,
		private modalService: ModalDialogService,
		private viewContainerRef: ViewContainerRef,
		private router: Router,
		private activityLoader: ActivityLoader
	) {
	}

	ngOnInit(): void {
		console.log("Initializing OpenCV...");
		this.opencvInstance = opencv.initOpenCV();

		this.isCameraVisible = true;
		this.isImageBtnVisible = false;
		this.isBusy = false;

		this.createTakePictureButton();
		this.createImageGalleryButton();
		this.createAutoFocusImage();

	}

	ngOnDestroy() {
		console.log('Destroy called...');
	}

	public camLoaded(e: any): void {
		console.log('***** cam loaded *****');
		this.isBusy = false;
		this.cam = e.object as CameraPlus;

		let flashMode = this.cam.getFlashMode();

		// Turn flash on at startup
		if (flashMode == 'off') {
			this.cam.toggleFlash();
		}
		let cb = new android.hardware.Camera.AutoFocusMoveCallback(

			{
				_this: this,
				onAutoFocusMoving: function (start, camera) {
					let animate = this._this.autofocusBtn.animate();
					if (!start) {
						animate.scaleX(1);
						animate.scaleY(1);
						let color = android.graphics.Color.parseColor("#008000"); //Green color           
						this._this.autofocusBtn.setColorFilter(color);
					} else {
						animate.scaleX(0.50);
						animate.scaleY(0.50);
						animate.setDuration(100);

						let color = android.graphics.Color.parseColor("#ff0000"); // Red color
						this._this.autofocusBtn.setColorFilter(color);

						animate.start();
					}
				}
			});
		if (this.cam._camera) {
			this.cam._camera.setAutoFocusMoveCallback(cb);
		}
		if (e.data) {

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
		//this.cam.showCaptureIcon = true;
		//this.cam.showFlashIcon = true;
		// this.cameraPlus.showGalleryIcon = false;
		// this.cameraPlus.showToggleIcon = false;
	}
	public initCameraButton() {
		this.cam._nativeView.removeView(this.takePicBtn);
		this.cam._nativeView.addView(this.takePicBtn, this.takePicParams);
	}

	public initImageGalleryButton() {
		this.cam._nativeView.removeView(this.galleryBtn);
		this.cam._nativeView.addView(this.galleryBtn, this.galleryParams);
	};
	public initAutoFocusImageButton() {
		this.cam._nativeView.removeView(this.autofocusBtn);
		this.cam._nativeView.addView(this.autofocusBtn, this.autofocusParams);
	};
	public createTakePictureButton() {
		let _this = this;
		this.takePicBtn = this.createImageButton();
		let takePicDrawable = this.getImageDrawable('ic_camera');
		this.takePicBtn.setImageResource(takePicDrawable);
		let shape = this.createTransparentCircleDrawable();
		this.takePicBtn.setBackgroundDrawable(shape);
		let color = android.graphics.Color.parseColor("#ffffff"); // white color
		this.takePicBtn.setColorFilter(color);
		// this.takePicBtn.setScaleX(0.50);
		// this.takePicBtn.setScaleY(0.50);
		this.takePicBtn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function (args) {
				_this.takePicFromCam(_this);

			}
		}));
		this.createTakePictureParams()
	}
	private createTakePictureParams() {
		this.takePicParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this.cam.insetButtons === true) {
		// var layoutHeight = this.cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		// this.takePicParams.setMargins(8, 8, 8, yMargin);
		// }
		// else {
		this.takePicParams.width = "100";
		this.takePicParams.height = "100";
		this.takePicParams.setMargins(8, 8, 8, 8);
		// }
		this.takePicParams.addRule(12); //ALIGN_PARENT_BOTTOM
		this.takePicParams.addRule(11); //HORIZONTAL_CENTER
	}
	public createAutoFocusImage() {
		let _this = this;
		this.autofocusBtn = this.createAutoFocusImageButton();
		let openGalleryDrawable = this.getImageDrawable('ic_auto_focus_black');
		this.autofocusBtn.setImageResource(openGalleryDrawable);
		let shape = this.createAutofocusShape();
		this.autofocusBtn.setBackgroundDrawable(shape);
		this.createAutoFocusImageParams();
	}
	private createAutoFocusImageParams() {
		this.autofocusParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this.insetButtons === true) {
		// var layoutWidth = this.cam._nativeView.getWidth();
		// console.log("layoutWidth = " + layoutWidth);
		// var xMargin = layoutWidth * 0.1;
		// var layoutHeight = this.cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		this.autofocusParams.width = "300";
		this.autofocusParams.height = "300";
		//galleryParams.setMargins(xMargin, 18, 18, yMargin);
		this.autofocusParams.setMargins(8, 8, 8, 8);
		// }
		this.autofocusParams.addRule(13); //ALIGN_PARENT_CENTER
	}
	public createAutoFocusImageButton(): any {
		let btn = new android.widget.ImageView(application.android.context);
		btn.setPadding(34, 34, 34, 34);
		btn.setMaxHeight(158);
		btn.setMaxWidth(158);
		btn.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
		let color = android.graphics.Color.parseColor("#008000"); // Green color
		btn.setColorFilter(color);
		return btn;
	}

	public createImageGalleryButton() {
		let _this = this;
		this.galleryBtn = this.createImageButton();

		let openGalleryDrawable = this.getImageDrawable('ic_photo_library_white');
		this.galleryBtn.setImageResource(openGalleryDrawable);

		let galleryBtnId = application.android.context.getResources().getIdentifier("gallery_btn", "id", application.android.context.getPackageName());

		this.galleryBtn.setTag(galleryBtnId, 'gallery-btn-tag');
		this.galleryBtn.setContentDescription('gallery-btn-dec');
		let shape = this.createTransparentCircleDrawable();
		this.galleryBtn.setBackgroundDrawable(shape);
		this.galleryBtn.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function (args) {
				_this.goImageGallery();
			}
		}));
		this.createImageGallerryParams();
	}
	private createImageGallerryParams() {
		this.galleryParams = new android.widget.RelativeLayout.LayoutParams(-2, -2);
		// if (this.insetButtons === true) {
		// var layoutWidth = this.cam._nativeView.getWidth();
		// console.log("layoutWidth = " + layoutWidth);
		// var xMargin = layoutWidth * 0.1;
		// var layoutHeight = this.cam._nativeView.getHeight();
		// console.log("layoutHeight = " + layoutHeight);
		// var yMargin = layoutHeight * 0.1;
		this.galleryParams.width = "100";
		this.galleryParams.height = "100";
		// this.galleryParams.setMargins(xMargin, 8, 8, yMargin);
		this.galleryParams.setMargins(8, 8, 8, 8);
		// }
		// else {
		//     galleryParams.setMargins(8, 8, 8, 8);
		// }
		this.galleryParams.addRule(12); //ALIGN_PARENT_BOTTOM
		this.galleryParams.addRule(9); //ALIGN_PARENT_LEFT
	}
	public getImageDrawable(iconName): any {
		let drawableId = application.android.context
			.getResources()
			.getIdentifier(iconName, 'drawable', application.android.context.getPackageName());
		return drawableId;
	}
	public createTransparentCircleDrawable(): any {
		let shape = new android.graphics.drawable.GradientDrawable();
		shape.setColor(0x99000000);
		shape.setCornerRadius(96);
		shape.setAlpha(150);
		return shape;
	}
	public createAutofocusShape(): any {

		let shape = new android.graphics.drawable.ShapeDrawable();
		shape.setAlpha(0);
		return shape;

	}
	public createImageButton(): any {
		let btn = new android.widget.ImageButton(application.android.context);
		btn.setPadding(34, 34, 34, 34);
		btn.setMaxHeight(58);
		btn.setMaxWidth(58);
		return btn;
	}

	public imagesSelectedEvent(e: any): void {
		console.log('IMAGES SELECTED EVENT!!!');
		this.loadImage((e.data as ImageAsset[])[0]);
	}

	public photoCapturedEvent(e: any): void {
		console.log('PHOTO CAPTURED EVENT!!!');
		this.loadImage(e.data as ImageAsset);
	}

	public toggleCameraEvent(e: any): void {
		console.log("camera toggled");
	}

	public recordDemoVideo(): void {
		try {
			console.log(`*** start recording ***`);
			this.cam.record();
		} catch (err) {
			console.log(err);
		}
	}

	public stopRecordingDemoVideo(): void {
		try {
			console.log(`*** stop recording ***`);
			this.cam.stop();
			console.log(`*** after this.cam.stop() ***`);
		} catch (err) {
			console.log(err);
		}
	}

	public toggleFlashOnCam(): void {
		this.cam.toggleFlash();
	}

	public toggleShowingFlashIcon(): void {
		console.log(`showFlashIcon = ${this.cam.showFlashIcon}`);
		this.cam.showFlashIcon = !this.cam.showFlashIcon;
	}

	public toggleTheCamera(): void {
		this.cam.toggleCamera();
	}

	public openCamPlusLibrary(): void {
		this.cam.chooseFromLibrary();
	}

	public takePicFromCam(_this): void {
		_this.isBusy = true;
		_this.activityLoader.show();
		_this.cam.takePicture({ saveToGallery: true });


		this.imgURI = '';
		this.imageSource = null;
	}

	public goImageGallery() {
		this.router.navigate(["imagegallery"]);
	}

	public showCapturedPictureDialog(fullscreen: boolean, filePathOrg: string, imgURI: string) {
		let options: ModalDialogOptions = {
			context: {
				imageSource: imgURI,
				imageSourceOrg: filePathOrg
			},
			fullscreen: fullscreen,
			viewContainerRef: this.viewContainerRef
		};
		this.activityLoader.hide();
		this.modalService.showModal(DialogContent, options)
			.then((dialogResult: string) => {
				if (dialogResult) {
					this.setTransformedImage(dialogResult);
					this.createThumbNailImage(dialogResult);
				} else {
					try {
						let imgFileOrg: fs.File = fs.File.fromPath(filePathOrg);

						if (imgFileOrg)
							imgFileOrg.remove();
						let imgURIFile: fs.File = fs.File.fromPath(imgURI);
						if (imgURIFile)
							imgURIFile.remove();
						SendBroadcastImage(filePathOrg);
						SendBroadcastImage(imgURI);
					} catch (e) {
						alert('Couldnot delete the file');
					}
				}
			})
	}

	public setTransformedImage(imgURIParam) {
		if (imgURIParam) {
			try {
				this.isImageBtnVisible = true;
				this.imgURI = imgURIParam;
				this.imageSource = imgURIParam;
				SendBroadcastImage(this.imgURI);
			} catch (e) {
				Toast.makeText("Error while setting image in preview area" + e, "long").show();
			}
		}
	}

	// handle value change
	public onSliderLoaded(args): void {
		const sliderComponent: Slider = <Slider>args.object;
		sliderComponent.on("valueChange", (sargs) => {
			console.log("SliderValue: " + (<Slider>sargs.object).value);
			var thresholdValue = (<Slider>sargs.object).value;
			if (thresholdValue % 2 == 0) {
				thresholdValue++;
			}
			this.isImageBtnVisible = false;

			this.performAdaptiveThreshold(thresholdValue, sargs);
		});
	}
	onPageLoaded(args) {
		this.page = <Page>args.object;
	}

	private createThumbNailImage(imgURI: string): any {
		try {
			let thumbnailImagePath = opencv.createThumbnailImage(imgURI);
			// var thumbnailImagePath = com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(imgURI);
			//com.maas.opencv4nativescript.OpenCVUtils.createThumbnailImage(dstImgURI);

			let uri = android.net.Uri.parse("file://" + thumbnailImagePath);
			this.galleryBtn.setImageURI(uri);
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
			this.isImageBtnVisible = true;
			this.imageSource = this.imgURI;
		});
	}
	private performPerspectiveTransformation(filePath): void {
		try {
			// this.wrappedImage = opencv.performPerspectiveTransformationForWrappedImage(filePath);
			// this.fileName = opencv.getFileName(filePath);
			// this.imgURI = opencv.performAdaptiveThreshold(this.wrappedImage, this.fileName, 41);
			this.imgURI = opencv.performPerspectiveTransformation(filePath, '');
			if (!this.imgURI) {
				Toast.makeText("No rectangles were found. Please take correct picture.", "long").show();
			}
			this.isBusy = false;
			this.showCapturedPictureDialog(true, filePath, this.imgURI);
		} catch (err) {
			console.log(err);
			alert('Error while calling performPerspectiveTransformation.');
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