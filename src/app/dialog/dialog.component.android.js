"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var file_system_1 = require("tns-core-modules/file-system");
var timer_1 = require("tns-core-modules/timer");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
// @ts-ignore
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
// @ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
var nativescript_localize_1 = require("nativescript-localize");
var page_1 = require("tns-core-modules/ui/page");
var observable_array_1 = require("tns-core-modules/data/observable-array");
var observable_1 = require("tns-core-modules/data/observable");
var Toast = require("nativescript-toast");
var platform = require("tns-core-modules/platform");
var formattedStringModule = require("tns-core-modules/text/formatted-string");
var buttons = require("tns-core-modules/ui/button");
var dialogs = require("tns-core-modules/ui/dialogs");
/** Lable for 'Manual' text */
var LABLE_MANUAL = 'Manual';
/** Lable for 'Perform' text */
var LABLE_PERFORM = 'Perform';
/** View model variable for observable instance */
var viewModel;
/**
 * Dialog content class.
 */
var DialogContent = /** @class */ (function () {
    /**
     * Constructor for DialogContent class.
     *
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     * @param logger OxsEye logger instance
     * @param page Page instance
     */
    function DialogContent(params, transformedImageProvider, logger, page) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
        this.page = page;
        /** Contains true/false to perform transformation automatically or not. */
        this.isAutoCorrection = false;
        /** Transformed Image starting scale. */
        this.startScale = 1;
        /** Transformed Image new scale while moving around. */
        this.newScale = 1;
        /** Stores old TranslateX value of transformed Image. */
        this.oldTranslateX = 0;
        /** Stores old translateY value of transformed Image. */
        this.oldTranslateY = 0;
        /** Boolean value to indicate whether the image got default screen location or not. */
        this.isGotDefaultLocation = false;
        /** To get accurate position, need to adjust the radius value */
        this.circleRadius = 17;
        /** Index value of the transformed image */
        this.imgNext = 0;
        /** To check check mark visible or not */
        this.isCheckMarkVisible = false;
        /** To check cross mark visible or not */
        this.isCrossMarkVisible = false;
        /** contains image URL list */
        this.imageUrlList0 = new observable_array_1.ObservableArray();
        /** Sets pagenumber for selected image, which is one of the attributes of ImageSwipe element */
        this.pageNumber = 3;
        /** Adaptive threshold value */
        this.adaptiveThresholdValue = 41;
        this.manualBtnText = LABLE_MANUAL;
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
    }
    /** It is a callback method which is been invoked by angular,
     * where all initializations are happening like  loading the capture image(s) in perspective form and
     * setting them in image view.
     */
    DialogContent.prototype.ngOnInit = function () {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        var recPointsStrTemp = this.params.context.rectanglePoints;
        // this.ocvCameraView = this.params.context.ocvCamera;
        this.imgNext = 0;
        // const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'));
        // this.transformedImageProvider.LoadPossibleContourImages(fileName);
        this.pageNumber = this.imgNext;
        viewModel = new observable_1.Observable();
        viewModel.set('imageUrlList0', this.imageUrlList0);
        viewModel.set('pageNumber', this.imgNext);
        this.page.bindingContext = viewModel;
        this.isSelected = false;
        this.isCheckMarkVisible = false;
        this.isCrossMarkVisible = true;
    };
    DialogContent.prototype.ngOnDestroy = function () {
        console.log('ngOnDestroy called....');
        this.imgView.refresh();
        viewModel = null;
        this.imageUrlList0 = null;
        this.page.bindingContext = null;
        this.imageSource = null;
        this.imageSourceOrg = null;
        this.imageSourceOrgOld = null;
        this.isAutoCorrection = null;
        this.imageSourceOld = null;
        this.rectanglePoints = null;
        var page = null;
        this.imgView = null;
        this.imgGridId = null;
        this.imageList = null;
    };
    DialogContent.prototype.onSliderLoaded = function (argsloaded) {
        var sliderComponent = argsloaded.object;
        sliderComponent.on("valueChange", function (args) {
            var slider = args.object;
            this.adaptiveThresholdValue = slider.value;
            console.log("Slider\u00A0new\u00A0value\u00A0" + slider.value);
        });
    };
    // private minusThresholdValue() {
    //     this.adaptiveThresholdValue -= 2;
    //     this.imageSource = this.ocvCameraView.performAdaptiveThresholdUsingWarppedImage(this.imageSourceOrg, this.imageSource, this.adaptiveThresholdValue);
    //     console.log('minusThresholdValue....');
    // }
    // private plusThresholdValue() {
    //     this.adaptiveThresholdValue += 2;
    //     let imageSourceNew = this.ocvCameraView.performAdaptiveThresholdUsingWarppedImage(this.imageSourceOrg, this.imageSourceOld, this.adaptiveThresholdValue);
    //     const ptSrc = org.opencv.imgcodecs.Imgcodecs.imread(imageSourceNew);
    //     imageSourceNew = imageSourceNew.replace('.png', this.adaptiveThresholdValue + '.png');
    //     org.opencv.imgcodecs.Imgcodecs.imwrite(imageSourceNew, ptSrc);
    //     this.imageSource = imageSourceNew;
    //     this.imageUrlList0.splice(0, this.imageUrlList0.length);
    //     const imageFile = new java.io.File(imageSourceNew);
    //     this.imageUrlList0.push({ imageUrl: imageFile.toURL().toString() });
    //     this.imgView.refresh();
    //     viewModel.set('imageUrlList0', this.imageUrlList0);
    //     viewModel.set('pageNumber', this.imgNext);
    //     this.page.bindingContext = viewModel;
    //     this.imgView.refresh();
    //     console.log('plusThresholdValue....');
    // }
    /**
     * It is a callback method and invoked by ImageSwipe element
     * when the image is changed in view and sets the pagenumber.
     *
     * @param args event data of ImageSwipe element
     */
    DialogContent.prototype.pageChanged = function (args) {
        this.imgNext = args.page;
        this.pageNumber = this.imgNext;
        this.isSelected = this.imageList[this.imgNext].isSelected;
        viewModel.set('imageUrlList0', this.imageUrlList0);
        viewModel.set('pageNumber', this.imgNext);
        this.page.bindingContext = viewModel;
        var imgSwipe = args.object;
        // const checkBox = imgSwipe.parent.getViewById('checkbox-delete') as CheckBox;
        // checkBox.checked = this.imageList[this.imgNext].isSelected;
        this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
        this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, imgSwipe.parent.parent);
    };
    /**
     * Close method, which close the dialog window opened after captured image from camera.
     * And returns back to the place where the dialog window got triggered, along with
     * the parameter 'result'
     * @param result Which is nothing but empty string or transformed image URI string
     */
    DialogContent.prototype.close = function (result) {
        // orientation.enableRotation();
        this.params.closeCallback(result);
    };
    /**
     * Performing manual transformation
     * this is been used to perform transformation manually, where the rectangle
     * points will be choosen by user in the captured image displaying in the dialog window.
     * In the dialog window, there are four circles are being used to select points.
     * Based on the selected points, the transformation will be performed here.
     */
    DialogContent.prototype.performManualCorrection = function () {
        var _this = this;
        var pointsCount = 0;
        this.points.forEach(function (point) {
            if (point) {
                pointsCount++;
            }
        });
        var point0Y = (+this.points[0].y - this.circleRadius);
        var point1Y = (+this.points[1].y - this.circleRadius);
        var rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
            + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
            + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
            + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
        this.imageSourceOld = this.imageSource;
        // this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints,
        //     this.imageActualSize.width + '-' + this.imageActualSize.height);
        transformedimage_provider_1.SendBroadcastImage(this.imageSource);
        timer_1.setTimeout(function () {
            _this.transformedImageProvider.deleteFile(_this.imageSourceOld);
        }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = localize('manual');
        this.removeCircles();
        this.transformedImageProvider.DeleteFiles();
    };
    Object.defineProperty(DialogContent.prototype, "imageList0", {
        /** Accessor to get image list and used in the UI */
        get: function () {
            return this.transformedImageProvider.contourList;
        },
        enumerable: true,
        configurable: true
    });
    // /** Accessor to get image URL list and used in the UI */
    // get imageUrlList0(): any {
    //     return this.imageUrlList;
    // }
    /**
     * Show original image, is being used to show original captured image
     * when the 'Manual' button is been pressed, this is where user can select desired points
     * and perform manual transformation. It is also intializing circle points to be displayed
     * in the original image.
     */
    DialogContent.prototype.showOriginalImage = function () {
        this.isAutoCorrection = false;
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText(nativescript_localize_1.localize('rectangle_points_info'), 'long').show();
        }
        this.manualBtnText = LABLE_PERFORM;
        // this.manualPerformBtnLable = localize('perform');
        this.pointsCounter = 0;
        this.addCircles();
    };
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGesture event data
     */
    DialogContent.prototype.onPan = function (args) {
        var screenLocation = this.imgView.getLocationOnScreen();
        if (this.manualBtnText !== LABLE_PERFORM) {
            var centerPointX = (this.imgView.getMeasuredWidth() / 4) * (this.newScale);
            var centerPointY = (this.imgView.getMeasuredHeight() / 4) * (this.newScale);
            var imageViewWidth = this.imgView.getMeasuredWidth() * this.imgView.originX;
            var imageViewHeight = this.imgView.getMeasuredHeight() * this.imgView.originY;
            if (args.state === 1) {
                this.prevDeltaX = 0;
                this.prevDeltaY = 0;
            }
            else if (args.state === 2) {
                centerPointX = (centerPointX * 2);
                centerPointY = (centerPointY * 2);
                if (!this.isGotDefaultLocation) {
                    this.defaultScreenLocation = screenLocation;
                    this.isGotDefaultLocation = true;
                }
                if (this.newScale > 1) {
                    if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)) {
                        this.imgView.translateX += args.deltaX - this.prevDeltaX;
                        this.oldTranslateX = this.imgView.translateX;
                    }
                    else {
                        if (this.oldTranslateX > 0) {
                            this.oldTranslateX--;
                        }
                        else {
                            this.oldTranslateX++;
                        }
                        this.imgView.translateX = this.oldTranslateX;
                    }
                    if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)) {
                        this.imgView.translateY += args.deltaY - this.prevDeltaY;
                        this.oldTranslateY = this.imgView.translateY;
                    }
                    else {
                        if (this.oldTranslateY > 0) {
                            this.oldTranslateY--;
                        }
                        else {
                            this.oldTranslateY++;
                        }
                        this.imgView.translateY = this.oldTranslateY;
                    }
                }
                this.prevDeltaX = args.deltaX;
                this.prevDeltaY = args.deltaY;
            }
        }
    };
    /**
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     */
    DialogContent.prototype.onDoubleTap = function () {
        this.imgView.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeOut',
            duration: 10,
        });
        this.newScale = 1;
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    };
    /**
     * Checks whether the checkBox is been selected or not. If it is selected,
     * the delete/share menus are visible, otherwise they are not visible.
     * And also sets the same value in the image list.
     *
     * @param event Checkbox event data
     * @param imagePath transformed image file path
     * @param index image index in the list
     */
    DialogContent.prototype.isChecked = function (event) {
        this.imageList[this.pageNumber].isSelected = !this.imageList[this.pageNumber].isSelected;
        this.isCheckMarkVisible = this.imageList[this.pageNumber].isSelected;
        this.isCrossMarkVisible = !this.isCheckMarkVisible;
    };
    DialogContent.prototype.navigatingTo = function () {
        console.log('navigatingTo called...');
    };
    /**
     * Page loaded method which is been called when dialog window is loaded,
     * where all the necessary values for the image to be displayed in the window
     * have been initialized, like transformedImageSource, originalImageSource &
     * rectangle points.
     *
     * @param args Page loaded event data
     */
    DialogContent.prototype.pageLoaded = function (args) {
        var _this = this;
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        var recPointsStrTemp = this.params.context.rectanglePoints;
        this.rectanglePoints = recPointsStrTemp.split('#');
        this.rectanglePoints.shift();
        this.rectanglePoints.pop();
        var page = args.object;
        this.imgView = page.getViewById('imgViewId');
        this.imgGridId = page.getViewById('imgGridId');
        this.imgView.translateX = 0;
        this.imgView.translateY = 0;
        this.imgView.scaleX = 1;
        this.imgView.scaleY = 1;
        // this.imgView.rotate = 90;
        // orientation.setOrientation('portrait');
        this.imgNext = 0;
        // const fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'));
        // this.transformedImageProvider.LoadPossibleContourImages(fileName);
        // setTimeout(() => {
        console.log('pageLoaded called....');
        this.imageList = this.transformedImageProvider.contourList;
        this.imageUrlList0.splice(0, this.imageUrlList0.length);
        this.imageList.forEach(function (img) {
            var imageFile = new java.io.File(img.filePath);
            _this.imageUrlList0.push({ imageUrl: imageFile.toURL().toString() });
        });
        console.log('pageLoaded called...1....');
        viewModel.set('imageUrlList0', this.imageUrlList0);
        viewModel.set('pageNumber', this.imgNext);
        this.page.bindingContext = viewModel;
        var selectedImgGrid = page.getViewById('img-grid-0');
        if (selectedImgGrid) {
            selectedImgGrid.backgroundColor = 'Black';
        }
        // }, 100);
        this.isDeleting = false;
    };
    /**
     * Deletes the selected image(s) when user clicks the 'delete' button in menu.
     * This will show up a dialog window for confirmation for the selected image(s)
     * to be deleted. If user says 'Ok', then those image(s) will be removed from the
     * device, otherwise can be cancelled.
     */
    DialogContent.prototype.onDelete = function (event) {
        var _this = this;
        dialogs.confirm({
            title: nativescript_localize_1.localize('delete'),
            message: nativescript_localize_1.localize('deleting_selected_item'),
            okButtonText: nativescript_localize_1.localize('ok'),
            cancelButtonText: nativescript_localize_1.localize('cancel'),
        }).then(function (result) {
            if (result) {
                _this.isDeleting = false;
                _this.imageList.forEach(function (image) {
                    if (image.filePath == _this.imageSource) {
                        var file = file_system_1.File.fromPath(image.filePath);
                        file.remove()
                            .then(function () {
                            transformedimage_provider_1.SendBroadcastImage(image.filePath);
                            var imgIdx = _this.imageList.indexOf(image);
                            _this.imgNext = imgIdx;
                            _this.nextImage();
                            _this.imageSource = _this.transformedImageProvider.contourImageList[_this.imgNext].filePath;
                            _this.setImageSelected(_this.imgNext, _this.transformedImageProvider.contourImageList.length, event.view.page);
                            if (imgIdx >= 0) {
                                _this.imageList.splice(imgIdx, 1);
                                Toast.makeText(nativescript_localize_1.localize('selected_images_deleted')).show();
                            }
                            if (_this.imageList.length == 0) {
                                _this.imageSource = '';
                                _this.isDeleting = false;
                            }
                        }).catch(function (error) {
                            Toast.makeText(nativescript_localize_1.localize('error_while_deleting_images')).show();
                            _this.logger.error('Error while deleting images. ' + module.filename
                                + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }
                });
            }
        });
    };
    /**
     * Add circles method adds circle points btn in original image.
     */
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this.circleBtnList.forEach(function (btn) {
            _this.imgGridId.addChild(btn);
        });
    };
    /**
     * Remove circles removes circle points btn from original image.
     */
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
    };
    /**
     * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
     * it checks that the swipe is right direct or left direction, based on that it pulls the image from
     * the image list and display it in view. After that, it sets the image in default position by calling
     * onDoubleTap method.
     *
     * @param args SwipeGestureEventData
     */
    DialogContent.prototype.onSwipe = function (args) {
        if (args.direction === 2 || !args.direction) {
            this.nextImage();
        }
        else if (args.direction === 1) {
            this.previousImage();
        }
        this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
        this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, args.view.page);
    };
    /**
     * Method to move to previous image
     */
    DialogContent.prototype.previousImage = function () {
        this.imgNext--;
        if (this.imgNext < 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = (this.transformedImageProvider.contourImageList.length - 1);
        }
    };
    /**
     * Method to move to next image.
     */
    DialogContent.prototype.nextImage = function () {
        this.imgNext++;
        if (this.imgNext <= 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = 0;
        }
    };
    /**
     * Select the image tapped by user and makes it with selected sign in black color.
     * @param imgURIPath  the image URI path
     * @param index  the index of the selected image
     * @param event the event handler object
     */
    DialogContent.prototype.selectImage = function (imgURIPath, index, event) {
        this.imageSource = imgURIPath;
        this.setImageSelected(index, event.view.parent.parent._childrenCount, event.view.parent.parent);
    };
    /**
     * Sets the selected image in black border to indicate that is been selected in view.
     *
     * @param index index of the image
     * @param noOfImages number of images
     * @param eventPage event data object
     */
    DialogContent.prototype.setImageSelected = function (index, noOfImages, eventPage) {
        for (var i = 0; i < noOfImages; i++) {
            var selectedImgGrid = eventPage.getViewById('img-grid-' + i);
            selectedImgGrid.backgroundColor = 'gray';
            if (i === index) {
                selectedImgGrid.backgroundColor = 'Black';
                this.imgNext = index;
                this.pageNumber = this.imgNext;
                // const checkBox = eventPage.getViewById('checkbox-delete') as CheckBox;
                // checkBox.checked = this.imageList[this.imgNext].isSelected;
                this.isCheckMarkVisible = this.imageList[this.imgNext].isSelected;
                this.isCrossMarkVisible = !this.imageList[this.imgNext].isSelected;
            }
        }
    };
    /**
     * Initialize circle points based on the receieved rectangle points and
     * image's width & height.
     */
    DialogContent.prototype.initPoints = function () {
        var _this = this;
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
        var scale = platform.screen.mainScreen.scale;
        this.imageActualSize = this.imgView.getActualSize();
        this.centerPointX = (this.imgGridId.getMeasuredWidth() / 2) / scale;
        this.centerPointY = (this.imgGridId.getMeasuredHeight() / 2) / scale;
        var actualPoint = {};
        if (this.rectanglePoints.length > 0) {
            var pointIndex_1 = 1;
            this.rectanglePoints.forEach(function (point) {
                var points = point.split('%');
                var bottomCircleRadius = _this.circleRadius;
                if (pointIndex_1++ > 2) { // For checking bottom points
                    bottomCircleRadius = bottomCircleRadius * -1;
                }
                actualPoint = {
                    x: (+points[0]) * (_this.imgGridId.getMeasuredWidth() / scale),
                    y: ((+points[1]) * (_this.imgGridId.getMeasuredHeight() / scale)) + bottomCircleRadius, id: _this.pointsCounter,
                };
                _this.createCircle(actualPoint);
            });
        }
        else {
            actualPoint = { x: 0, y: 0, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this.imageActualSize.width, y: 0, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: this.imageActualSize.width, y: this.imageActualSize.height, id: this.pointsCounter };
            this.createCircle(actualPoint);
            actualPoint = { x: 0, y: this.imageActualSize.height, id: this.pointsCounter };
            this.createCircle(actualPoint);
        }
    };
    /**
     * This method creates circle points button on original image view
     * based on the points receieved via actualPoint and also takes
     * care of boundary checking while diplaying it.
     *
     * @param actualPoint Contains circle points(x,y)
     */
    DialogContent.prototype.createCircle = function (actualPoint) {
        var _this = this;
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        var actualPointDeltaX = (this.imageActualSize.width / 2) - this.imageActualSize.width;
        var actualPointDeltaY = (this.imageActualSize.height / 2) - this.imageActualSize.height;
        var formattedString = new formattedStringModule.FormattedString();
        var iconSpan = new formattedStringModule.Span();
        iconSpan.cssClasses.add('fa');
        iconSpan.cssClasses.add('circle-plus');
        iconSpan.text = String.fromCharCode(0xf067);
        formattedString.spans.push(iconSpan);
        var circleBtn = new buttons.Button();
        circleBtn.cssClasses.add('circle');
        circleBtn.id = this.pointsCounter++;
        circleBtn.formattedText = formattedString;
        circleBtn.on('pan', function (args) {
            if (args.state === 1) {
                _this.prevDeltaX = 0;
                _this.prevDeltaY = 0;
                if (_this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += -15;
                    circleBtn.translateY += -30;
                }
                else {
                    if (circleBtn.translateX < 0) {
                        circleBtn.translateX += +10;
                    }
                    else {
                        circleBtn.translateX += -10;
                    }
                    if (circleBtn.translateY < 0) {
                        circleBtn.translateY += +10;
                    }
                    else {
                        circleBtn.translateY += -10;
                    }
                }
            }
            else if (args.state === 2) {
                if (_this.checkBoundary(circleBtn.translateX, circleBtn.translateY)) {
                    circleBtn.translateX += args.deltaX - _this.prevDeltaX;
                    circleBtn.translateY += args.deltaY - _this.prevDeltaY;
                    _this.points.forEach(function (point) {
                        if (point) {
                            if (point.id === circleBtn.id) {
                                point.x = circleBtn.translateX - actualPointDeltaX;
                                point.y = circleBtn.translateY - actualPointDeltaY;
                            }
                        }
                    });
                    _this.prevDeltaX = args.deltaX;
                    _this.prevDeltaY = args.deltaY;
                }
            }
            else if (args.state === 3) {
            }
        });
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
        circleBtn.translateX = actualPoint.x + actualPointDeltaX;
        circleBtn.translateY = actualPoint.y + actualPointDeltaY;
        if (circleBtn.translateX > 0 &&
            circleBtn.translateX > this.centerPointX) {
            circleBtn.translateX = this.centerPointX;
        }
        if (circleBtn.translateX < 0 &&
            (circleBtn.translateX * -1) > this.centerPointX) {
            circleBtn.translateX = this.centerPointX * -1;
        }
        if (circleBtn.translateY > 0 &&
            circleBtn.translateY > this.centerPointY) {
            circleBtn.translateY = this.centerPointY;
        }
        if (circleBtn.translateY < 0 &&
            (circleBtn.translateY * -1) > this.centerPointY) {
            circleBtn.translateY = this.centerPointY * -1;
        }
        this.circleBtnList.push(circleBtn);
        this.points.push(actualPoint);
        return circleBtn;
    };
    /**
     * Checks the image that it is within the image view boundary or not.
     *
     * @param translateX Image translateX
     * @param translateY Image translateY
     */
    DialogContent.prototype.checkBoundary = function (translateX, translateY) {
        var pointAdjustment = 5; // Need to adjust the center point value to check the boundary
        if (translateX < (this.centerPointX - pointAdjustment) &&
            translateY < (this.centerPointY - pointAdjustment) &&
            (translateX * -1) < (this.centerPointX - pointAdjustment) &&
            (translateY * -1) < (this.centerPointY - pointAdjustment)) {
            return true;
        }
        else {
            return false;
        }
    };
    var _a, _b;
    DialogContent = __decorate([
        core_1.Component({
            selector: 'modal-content',
            moduleId: module.id,
            styleUrls: ['./dialog.component.css'],
            templateUrl: './dialog.component.html',
        }),
        __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" ? _a : Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" ? _b : Object, page_1.Page])
    ], DialogContent);
    return DialogContent;
}());
exports.DialogContent = DialogContent;
