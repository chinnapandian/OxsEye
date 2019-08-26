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
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var timer_1 = require("tns-core-modules/timer");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var file_system_1 = require("tns-core-modules/file-system");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var angular_1 = require("nativescript-i18n/angular");
var orientation = require("nativescript-orientation");
var Toast = require("nativescript-toast");
var platform = require("tns-core-modules/platform");
var formattedStringModule = require("tns-core-modules/text/formatted-string");
var buttons = require("tns-core-modules/ui/button");
var dialogs = require("tns-core-modules/ui/dialogs");
var opencv = require("nativescript-opencv-plugin");
/** Lable for 'Manual' text */
var LABLE_MANUAL = 'Manual';
/** Lable for 'Perform' text */
var LABLE_PERFORM = 'Perform';
/**
 * Dialog content class.
 */
var DialogContent = (function () {
    /** Lable for Manua/Perform button */
    // private manualPerformBtnLable: any;
    // private _dragImageItem: Image;
    // @ViewChild('imgViewId') _dragImage: ElementRef;
    // private points = new ObservableArray();
    /**
     * Constructor for DialogContent class.
     *
     * @param params contains captured image file information
     * @param transformedImageProvider transformed image provider instance
     */
    function DialogContent(params, transformedImageProvider, logger, locale) {
        this.params = params;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
        this.locale = locale;
        /** Contains true/false to perform transformation automatically or not. */
        this.isAutoCorrection = false;
        /** Transformed Image starting scale. */
        this.startScale = 1;
        /** Transformed Image new scale while moving around. */
        this.newScale = 1;
        /** Stores old TranslateX value of transformed Image. */
        this.oldTranslateX = 0;
        /** Stores old translateY value of transformed Image. */
        this.oldTranslateY = 0;
        /** Boolean value to indicate whether the image got default screen location or not. */
        this.isGotDefaultLocation = false;
        /** To get accurate position, need to adjust the radius value */
        this.circleRadius = 17;
        /** Index value of the transformed image */
        this.imgNext = 0;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // this._dragImageItem = <Image>this._dragImage.nativeElement;
    }
    /**
     * Close method, which close the dialog window opened after captured image from camera.
     * And returns back to the place where the dialog window got triggered, along with
     * the parameter 'result'
     * @param result Which is nothing but empty string or transformed image URI string
     */
    DialogContent.prototype.close = function (result) {
        orientation.enableRotation();
        this.params.closeCallback(result);
    };
    /**
     * Performing manual transformation
     * this is been used to perform transformation manually, where the rectangle
     * points will be choosen by user in the captured image displaying in the dialog window.
     * In the dialog window, there are four circles are being used to select points.
     * Based on the selected points, the transformation will be performed here.
     */
    DialogContent.prototype.performManualCorrection = function () {
        var _this = this;
        var pointsCount = 0;
        this.points.forEach(function (point) {
            if (point) {
                pointsCount++;
            }
        });
        // To get accurate position, need to adjust the radius value;
        // const circleRadius = 17;
        // this.points[0].y = +this.points[0].y - circleRadius;
        // this.points[1].y = +this.points[1].y - circleRadius;
        // this.points[2].y = +this.points[2].y + circleRadius;
        // this.points[3].y = +this.points[3].y + circleRadius;
        var point0Y = (+this.points[0].y - this.circleRadius);
        var point1Y = (+this.points[1].y - this.circleRadius);
        var rectanglePoints = this.points[0].x + '-' + ((point0Y < 0) ? 0 : point0Y) + '#'
            + this.points[1].x + '-' + ((point1Y < 0) ? 0 : point1Y) + '#'
            + this.points[2].x + '-' + (+this.points[2].y + this.circleRadius) + '#'
            + this.points[3].x + '-' + (+this.points[3].y + this.circleRadius);
        this.imageSourceOld = this.imageSource;
        this.imageSource = opencv.performPerspectiveCorrectionManual(this.imageSourceOrg, rectanglePoints, this.imageActualSize.width + '-' + this.imageActualSize.height);
        transformedimage_provider_1.SendBroadcastImage(this.imageSource);
        timer_1.setTimeout(function () {
            _this.transformedImageProvider.deleteFile(_this.imageSourceOld);
        }, 1000);
        this.imageSourceOrg = this.imageSourceOrgOld;
        this.isAutoCorrection = true;
        this.manualBtnText = LABLE_MANUAL;
        // this.manualPerformBtnLable = this.locale.transform('manual');
        this.removeCircles();
        // this.pointsCounter = 0;
        this.transformedImageProvider.DeleteFiles();
    };
    Object.defineProperty(DialogContent.prototype, "imageList", {
        /**
         * Gets rectangle points.
         *
         * @param event Gesture event data
         */
        // getPoints(event: GestureEventData) {
        //     try {
        //         if (this.manualBtnText === LABLE_PERFORM) {
        //             // This is the density of your screen, so we can divide the measured width/height by it.
        //             const scale: number = platform.screen.mainScreen.scale;
        //             this.imageActualSize = this.imgView.getActualSize();
        //             const pointX = event.android.getX() / scale;
        //             const pointY = event.android.getY() / scale;
        //             const actualPoint = { x: pointX, y: pointY, id: this.pointsCounter };
        //             if (this.points.length >= 4) {
        //                 Toast.makeText('Please select only four points.', 'long').show();
        //             } else {
        //                 this.imgGridId.addChild(this.createCircle(actualPoint));
        //             }
        //         }
        //     } catch (error) {
        //         Toast.makeText('Error calling getPoints(). ' + error);
        //         this.logger.error(module.filename + ': ' + error);
        //     }
        // }
        get: function () {
            console.log("imageList:" + JSON.stringify(this.transformedImageProvider.contourImageList));
            return this.transformedImageProvider.contourImageList;
            // return this.contourList;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Show original image, is being used to show original captured image
     * when the 'Manual' button is been pressed, this is where user can select desired points
     * and perform manual transformation. It is also intializing circle points to be displayed
     * in the original image.
     */
    DialogContent.prototype.showOriginalImage = function () {
        this.isAutoCorrection = false;
        this.onDoubleTap();
        if (this.circleBtnList.length === 0) {
            this.initPoints();
            Toast.makeText(this.locale.transform('rectangle_points_info'), 'long').show();
        }
        this.manualBtnText = LABLE_PERFORM;
        // this.manualPerformBtnLable = this.locale.transform('perform');
        this.pointsCounter = 0;
        this.addCircles();
    };
    /**
     * On pinch method, is being called while pinch event fired on image,
     * where the new scale, width & height of the transformed image have been calculated
     * to zoom-in/out.
     * @param args PinchGesture event data
     */
    DialogContent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            // let newOriginX = args.getFocusX() - this.imgView.translateX;
            // let newOriginY = args.getFocusY() - this.imgView.translateY;
            // let oldOriginX = this.imgView.originX * this.imgView.getMeasuredWidth();
            // let oldOriginY = this.imgView.originY * this.imgView.getMeasuredHeight();
            this.startScale = this.imgView.scaleX;
        }
        else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(8, this.newScale);
            this.newScale = Math.max(0.125, this.newScale);
            this.imgView.scaleX = this.newScale;
            this.imgView.scaleY = this.newScale;
            this.imgView.width = this.imgView.getMeasuredWidth() * this.newScale;
            this.imgView.height = this.imgView.getMeasuredHeight() * this.newScale;
        }
    };
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGesture event data
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
                // let screenLocation = this.imgView.getLocationOnScreen();
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
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     */
    DialogContent.prototype.onDoubleTap = function () {
        if (this.manualBtnText !== LABLE_PERFORM) {
            this.imgView.animate({
                translate: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
                curve: 'easeOut',
                duration: 10,
            });
            this.newScale = 1;
            this.oldTranslateY = 0;
            this.oldTranslateX = 0;
        }
        else {
            // this.initPoints();
            this.removeCircles();
            this.addCircles();
        }
    };
    /**
     * Page loaded method which is been called when dialog window is loaded,
     * where all the necessary values for the image to be displayed in the window
     * have been initialized, like transformedImageSource, originalImageSource &
     * rectangle points.
     *
     * @param args Page loaded event data
     */
    DialogContent.prototype.pageLoaded = function (args) {
        this.imageSource = this.params.context.imageSource;
        this.imageSourceOrg = this.params.context.imageSourceOrg;
        this.imageSourceOrgOld = this.params.context.imageSourceOrg;
        this.isAutoCorrection = this.params.context.isAutoCorrection;
        this.imageSourceOld = this.params.context.imageSource;
        var recPointsStrTemp = this.params.context.rectanglePoints;
        this.rectanglePoints = recPointsStrTemp.split('#');
        this.rectanglePoints.shift(); // remove first element
        this.rectanglePoints.pop(); // remove last element
        var page = args.object;
        this.imgView = page.getViewById('imgViewId');
        this.imgGridId = page.getViewById('imgGridId');
        this.imgView.translateX = 0;
        this.imgView.translateY = 0;
        this.imgView.scaleX = 1;
        this.imgView.scaleY = 1;
        // this.imgView.rotate = 90;
        orientation.setOrientation('portrait');
        this.imgNext = 0;
        var fileName = this.imageSource.substring(this.imageSource.lastIndexOf('PT_IMG'), this.imageSource.lastIndexOf('transformed'));
        this.transformedImageProvider.LoadPossibleContourImages(fileName);
        timer_1.setTimeout(function () {
            var selectedImgGrid = page.getViewById('img-grid-0');
            selectedImgGrid.backgroundColor = 'Black';
        }, 500);
        this.isDeleting = false;
        //  setTimeout(() => {
        //    page.actionBarHidden = true;
        // }, 1000);
    };
    DialogContent.prototype.enableDelete = function () {
        if (this.imageList.length > 0) {
            this.isDeleting = !this.isDeleting;
        }
    };
    /**
    * Deletes the selected image(s) when user clicks the 'delete' button in menu.
    * This will show up a dialog window for confirmation for the selected image(s)
    * to be deleted. If user says 'Ok', then those image(s) will be removed from the
    * device, otherwise can be cancelled.
    */
    DialogContent.prototype.onDelete = function (event) {
        var _this = this;
        // if (this.selectedCount > 0) {
        dialogs.confirm({
            title: this.locale.transform('delete'),
            message: this.locale.transform('deleting_selected_item'),
            okButtonText: this.locale.transform('ok'),
            cancelButtonText: this.locale.transform('cancel'),
        }).then(function (result) {
            if (result) {
                _this.isDeleting = false;
                _this.imageList.forEach(function (image) {
                    if (image.filePath == _this.imageSource) {
                        var file = file_system_1.File.fromPath(image.filePath);
                        file.remove()
                            .then(function () {
                            // const thumbnailFile: File = File.fromPath(image.thumbnailPath);
                            // thumbnailFile.remove()
                            //     .then(() => {
                            transformedimage_provider_1.SendBroadcastImage(image.filePath);
                            // this.pageLoaded(event);
                            // }).catch((error) => {
                            //     Toast.makeText(this.locale.transform('error_while_deleting_thumbnail_images') + error).show();
                            //     this.logger.error('Error while deleting thumbnail images. ' + module.filename
                            //         + this.logger.ERROR_MSG_SEPARATOR + error);
                            // });
                            var imgIdx = _this.imageList.indexOf(image);
                            _this.imgNext = imgIdx;
                            _this.nextImage();
                            // if (this.imgNext >= (this.transformedImageProvider.contourImageList.length - 1)) {
                            //     this.imgNext--;
                            // }
                            // if (this.imgNext >= 0) {
                            _this.imageSource = _this.transformedImageProvider.contourImageList[_this.imgNext].filePath;
                            _this.setImageSelected(_this.imgNext, _this.transformedImageProvider.contourImageList.length, event);
                            // }
                            if (imgIdx >= 0) {
                                _this.imageList.splice(imgIdx, 1);
                                Toast.makeText(_this.locale.transform('selected_images_deleted')).show();
                            }
                            if (_this.imageList.length == 0) {
                                _this.imageSource = '';
                                _this.isDeleting = false;
                            }
                        }).catch(function (error) {
                            Toast.makeText(_this.locale.transform('error_while_deleting_images')).show();
                            _this.logger.error('Error while deleting images. ' + module.filename
                                + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }
                });
            }
        });
        // }
    };
    /**
     * Add circles method adds circle points btn in original image.
     */
    DialogContent.prototype.addCircles = function () {
        var _this = this;
        this.circleBtnList.forEach(function (btn) {
            _this.imgGridId.addChild(btn);
        });
    };
    /**
     * Remove circles removes circle points btn from original image.
     */
    DialogContent.prototype.removeCircles = function () {
        var imgElement = this.imgGridId.getChildAt(0);
        this.imgGridId.removeChildren();
        this.imgGridId.addChild(imgElement);
    };
    /**
     * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
     * it checks that the swipe is right direct or left direction, based on that it pulls the image from
     * the image list and display it in view. After that, it sets the image in default position by calling
     * onDoubleTap method.
     *
     * @param args SwipeGestureEventData
     */
    DialogContent.prototype.onSwipe = function (args) {
        // if (this.dragImageItem.scaleX === 1 && this.dragImageItem.scaleY === 1) {
        if (args.direction === 2 || !args.direction) {
            this.nextImage();
        }
        else if (args.direction === 1) {
            this.previousImage();
        }
        // // this.imgIndex = this.imgNext;
        // if (this.imageFileList.length > 0) {
        this.imageSource = this.transformedImageProvider.contourImageList[this.imgNext].filePath;
        this.setImageSelected(this.imgNext, this.transformedImageProvider.contourImageList.length, args);
        // } else {
        //     this.imageSource = null;
        //     Toast.makeText(this.locale.transform('no_image_available')).show();
        // }
        // this.onDoubleTap(args);
        // }
    };
    /**
     * Method to move to previous image
     */
    DialogContent.prototype.previousImage = function () {
        this.imgNext--;
        if (this.imgNext < 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = (this.transformedImageProvider.contourImageList.length - 1);
        }
    };
    /**
     * Method to move to next image.
     */
    DialogContent.prototype.nextImage = function () {
        this.imgNext++;
        if (this.imgNext <= 0 || this.imgNext >= this.transformedImageProvider.contourImageList.length) {
            this.imgNext = 0;
        }
    };
    /**
     * Select the image tapped by user and makes it with selected sign in black color.
     * @param imgURIPath  the image URI path
     * @param index  the index of the selected image
     * @param event the event handler object
     */
    DialogContent.prototype.selectImage = function (imgURIPath, index, event) {
        this.imageSource = imgURIPath;
        this.setImageSelected(index, event.view.parent.parent._childrenCount, event);
    };
    DialogContent.prototype.setImageSelected = function (index, noOfImages, event) {
        for (var i = 0; i < noOfImages; i++) {
            var selectedImgGrid = event.view.page.getViewById('img-grid-' + i);
            selectedImgGrid.backgroundColor = 'gray';
            if (i == index) {
                selectedImgGrid.backgroundColor = 'Black';
            }
        }
    };
    /**
     * Initialize circle points based on the receieved rectangle points and
     * image's width & height.
     */
    DialogContent.prototype.initPoints = function () {
        var _this = this;
        this.points = [];
        this.pointsCounter = 0;
        this.circleBtnList = [];
        // This is the density of your screen, so we can divide the measured width/height by it.
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
                // let pointDiffX = 0;
                // let pointDiffY = 0;
                // if (pointIndex == 1) {
                //     pointDiffX = -10;
                //     pointDiffY = 10;
                // } else if (pointIndex == 2) {
                //     pointDiffX = 10;
                //     pointDiffY = -10;
                // } else if (pointIndex == 3) {
                //     pointDiffX = 10;
                //     pointDiffY = 10;
                // } else if (pointIndex == 4) {
                //     pointDiffX = -10;
                //     pointDiffY = 10;
                // }
                if (pointIndex_1++ > 2) {
                    bottomCircleRadius = bottomCircleRadius * -1;
                }
                //                 topLeft.x = topLeft.x - 10;
                // topLeft.y = topLeft.y - 10;
                // topRight.x = topRight.x + 10;
                // topRight.y = topRight.y - 10;
                // bottomRight.x = bottomRight.x + 10;
                // bottomRight.y = bottomRight.y + 10;
                // bottomLeft.x = bottomLeft.x - 10;
                // bottomLeft.y = bottomLeft.y + 10;
                // let actualPoint = { x: (+points[0] + pointDiffX) * (this.imgGridId.getMeasuredWidth() / scale),
                // y: ((+points[1]+pointDiffY) * (this.imgGridId.getMeasuredHeight() / scale))
                // + circleRadius, id: this.pointsCounter };
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
            //     let actualPoint = { x: this.centerPointX - 75, y: this.centerPointY - 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX + 75, y: this.centerPointY - 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX - 75, y: this.centerPointY + 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
            //     actualPoint = { x: this.centerPointX + 75, y: this.centerPointY + 75, id: this.pointsCounter };
            //     this.createCircle(actualPoint);
        }
    };
    /**
     * This method creates circle points button on original image view
     * based on the points receieved via actualPoint and also takes
     * care of boundary checking while diplaying it.
     *
     * @param actualPoint Contains circle points(x,y)
     */
    DialogContent.prototype.createCircle = function (actualPoint) {
        var _this = this;
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
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
        // Since the selected point by user is always pointing to
        // center of the image (which is (0,0)), so need to select
        // top-left, top-right & bottom-left, for which the actualPointDeltaX/actualPointDeltaY
        // are used.
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
     * Checks the image that it is within the image view boundary or not.
     *
     * @param translateX Image translateX
     * @param translateY Image translateY
     */
    DialogContent.prototype.checkBoundary = function (translateX, translateY) {
        var pointAdjustment = 5; // Need to adjust the center point value to check the boundary
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
    return DialogContent;
}());
DialogContent = __decorate([
    core_1.Component({
        selector: 'modal-content',
        moduleId: module.id,
        styleUrls: ['./dialog.component.css'],
        templateUrl: './dialog.component.html',
    }),
    __metadata("design:paramtypes", [modal_dialog_1.ModalDialogParams, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object, angular_1.L])
], DialogContent);
exports.DialogContent = DialogContent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlhbG9nLmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTBDO0FBQzFDLGtFQUFzRTtBQUN0RSxnREFBb0Q7QUFHcEQsb0ZBQXdIO0FBRXhILDREQUE0RDtBQUU1RCx1REFBc0Q7QUFFdEQscURBQThDO0FBRTlDLHNEQUF3RDtBQUN4RCwwQ0FBNEM7QUFDNUMsb0RBQXNEO0FBQ3RELDhFQUFnRjtBQUNoRixvREFBc0Q7QUFDdEQscURBQXVEO0FBRXZELG1EQUFxRDtBQUVyRCw4QkFBOEI7QUFDOUIsSUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDO0FBQzlCLCtCQUErQjtBQUMvQixJQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7QUFFaEM7O0dBRUc7QUFPSCxJQUFhLGFBQWE7SUFxRHRCLHFDQUFxQztJQUNyQyxzQ0FBc0M7SUFDdEMsaUNBQWlDO0lBQ2pDLGtEQUFrRDtJQUVsRCwwQ0FBMEM7SUFFMUM7Ozs7O09BS0c7SUFDSCx1QkFBb0IsTUFBeUIsRUFDakMsd0JBQWtELEVBQ2xELE1BQW9CLEVBQ3BCLE1BQVM7UUFIRCxXQUFNLEdBQU4sTUFBTSxDQUFtQjtRQUNqQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELFdBQU0sR0FBTixNQUFNLENBQWM7UUFDcEIsV0FBTSxHQUFOLE1BQU0sQ0FBRztRQWhFckIsMEVBQTBFO1FBQ25FLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQXVCaEMsd0NBQXdDO1FBQ2hDLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFLdkIsdURBQXVEO1FBQy9DLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsd0RBQXdEO1FBQ2hELGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLHdEQUF3RDtRQUNoRCxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQixzRkFBc0Y7UUFD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QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsd0JBQXdCLENBQUM7UUFDckMsV0FBVyxFQUFFLHlCQUF5QjtLQUN6QyxDQUFDO3FDQW1FOEIsZ0NBQWlCLHNCQUNQLG9EQUF3QixvQkFBeEIsb0RBQXdCLHNEQUMxQywyQkFBWSxvQkFBWiwyQkFBWSxrQ0FDWixXQUFDO0dBckVaLGFBQWEsQ0ErcEJ6QjtBQS9wQlksc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nUGFyYW1zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IHNldFRpbWVvdXQgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RpbWVyJztcbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSwgU3dpcGVHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBGaWxlLCBGb2xkZXIgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuaW1wb3J0ICogYXMgb3JpZW50YXRpb24gZnJvbSAnbmF0aXZlc2NyaXB0LW9yaWVudGF0aW9uJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBwbGF0Zm9ybSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3BsYXRmb3JtJztcbmltcG9ydCAqIGFzIGZvcm1hdHRlZFN0cmluZ01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3RleHQvZm9ybWF0dGVkLXN0cmluZyc7XG5pbXBvcnQgKiBhcyBidXR0b25zIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvYnV0dG9uJztcbmltcG9ydCAqIGFzIGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcblxuaW1wb3J0ICogYXMgb3BlbmN2IGZyb20gJ25hdGl2ZXNjcmlwdC1vcGVuY3YtcGx1Z2luJztcblxuLyoqIExhYmxlIGZvciAnTWFudWFsJyB0ZXh0ICovXG5jb25zdCBMQUJMRV9NQU5VQUwgPSAnTWFudWFsJztcbi8qKiBMYWJsZSBmb3IgJ1BlcmZvcm0nIHRleHQgKi9cbmNvbnN0IExBQkxFX1BFUkZPUk0gPSAnUGVyZm9ybSc7XG5cbi8qKlxuICogRGlhbG9nIGNvbnRlbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbW9kYWwtY29udGVudCcsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9kaWFsb2cuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9kaWFsb2cuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBEaWFsb2dDb250ZW50IHtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc291cmNlLiAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogYW55O1xuICAgIC8qKiBPcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHVibGljIGltYWdlU291cmNlT3JnOiBhbnk7XG4gICAgLyoqIENvbnRhaW5zIHRydWUvZmFsc2UgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBhdXRvbWF0aWNhbGx5IG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBidXR0b24gbGFiZWwgbmFtZSBlaXRoZXIgJ01hbnVhbCcvICdQZXJmb3JtJyAqL1xuICAgIHB1YmxpYyBtYW51YWxCdG5UZXh0OiBzdHJpbmc7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgZm91ciBwb2ludHMgb2YgdGhlIGltYWdlcy4gKi9cbiAgICBwcml2YXRlIHBvaW50czogYW55O1xuICAgIC8qKiBJbmRpY2F0ZXMgdGhlIG51bWJlciBvZiBwb2ludHMuICovXG4gICAgcHJpdmF0ZSBwb2ludHNDb3VudGVyOiBudW1iZXI7XG4gICAgLyoqIFN0b3JlcyBwcmV2aW91cyBvcmlnaW5hbCBJbWFnZSBzb3VyY2UuICovXG4gICAgcHJpdmF0ZSBpbWFnZVNvdXJjZU9yZ09sZDogYW55O1xuICAgIC8qKiBTdG9yZXMgcHJldmlvdXMgdHJhbnNmb3JtZWQgaW1hZ2Ugc291cmNlLiAqL1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2VPbGQ6IGFueTtcbiAgICAvKiogQ29udGFpbnMgdHJhbnNmb3JtZWQgaW1hZ2UgYWN0dWFsIHNpemUuICovXG4gICAgcHJpdmF0ZSBpbWFnZUFjdHVhbFNpemU6IGFueTtcbiAgICAvKiogTGlzdCBvZiBjaXJjbGUgYnV0dG9ucyAqL1xuICAgIHByaXZhdGUgY2lyY2xlQnRuTGlzdDogYW55O1xuICAgIC8qKiBTdG9yZXMgdHJhbnNmb3JtZWQgaW1hZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIGltZ1ZpZXc6IGFueTtcbiAgICAvKiogSW1hZ2UgZ3JpZCBpZC4gKi9cbiAgICBwcml2YXRlIGltZ0dyaWRJZDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBwcmV2aW91cyBkZWx0YVguICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIHByZXZpb3VzIGRlbHRhWS4gKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2Ugc3RhcnRpbmcgc2NhbGUuICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogVHJhbnNmb3JtZWQgSW1hZ2UgY2VudGVyIHBvaW50WC4gKi9cbiAgICBwcml2YXRlIGNlbnRlclBvaW50WDogYW55O1xuICAgIC8qKiBUcmFuc2Zvcm1lZCBJbWFnZSBjZW50ZXIgcG9pbnRZLiAqL1xuICAgIHByaXZhdGUgY2VudGVyUG9pbnRZOiBhbnk7XG4gICAgLyoqIFRyYW5zZm9ybWVkIEltYWdlIG5ldyBzY2FsZSB3aGlsZSBtb3ZpbmcgYXJvdW5kLiAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBTdG9yZXMgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgdHJhbnNmb3JtZWQgSW1hZ2UuICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogU3RvcmVzIG9sZCB0cmFuc2xhdGVZIHZhbHVlIG9mIHRyYW5zZm9ybWVkIEltYWdlLiAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gaW5kaWNhdGUgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdC4gKi9cbiAgICBwcml2YXRlIGlzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIFN0b3JlcyB0cmFuc2Zvcm1lZCBpbWFnZSdzIHNjcmVlbiBsb2NhdGlvbi4gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIC8qKiBTdG9yZXMgcmVjdGFuZ2xlIHBvaW50cyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQ1YgQVBJIGNhbGwuICovXG4gICAgcHJpdmF0ZSByZWN0YW5nbGVQb2ludHM6IGFueTtcbiAgICAvKiogVG8gZ2V0IGFjY3VyYXRlIHBvc2l0aW9uLCBuZWVkIHRvIGFkanVzdCB0aGUgcmFkaXVzIHZhbHVlICovXG4gICAgcHJpdmF0ZSBjaXJjbGVSYWRpdXMgPSAxNztcbiAgICAvKiogSW5kZXggdmFsdWUgb2YgdGhlIHRyYW5zZm9ybWVkIGltYWdlICovXG4gICAgcHJpdmF0ZSBpbWdOZXh0ID0gMDtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBkZWxldGluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBMYWJsZSBmb3IgTWFudWEvUGVyZm9ybSBidXR0b24gKi9cbiAgICAvLyBwcml2YXRlIG1hbnVhbFBlcmZvcm1CdG5MYWJsZTogYW55O1xuICAgIC8vIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8vIEBWaWV3Q2hpbGQoJ2ltZ1ZpZXdJZCcpIF9kcmFnSW1hZ2U6IEVsZW1lbnRSZWY7XG5cbiAgICAvLyBwcml2YXRlIHBvaW50cyA9IG5ldyBPYnNlcnZhYmxlQXJyYXkoKTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBEaWFsb2dDb250ZW50IGNsYXNzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBhcmFtcyBjb250YWlucyBjYXB0dXJlZCBpbWFnZSBmaWxlIGluZm9ybWF0aW9uXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB0cmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcGFyYW1zOiBNb2RhbERpYWxvZ1BhcmFtcyxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgdGhpcy5tYW51YWxCdG5UZXh0ID0gTEFCTEVfTUFOVUFMO1xuICAgICAgICAvLyB0aGlzLm1hbnVhbFBlcmZvcm1CdG5MYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbWFudWFsJyk7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdCA9IFtdO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtID0gPEltYWdlPnRoaXMuX2RyYWdJbWFnZS5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDbG9zZSBtZXRob2QsIHdoaWNoIGNsb3NlIHRoZSBkaWFsb2cgd2luZG93IG9wZW5lZCBhZnRlciBjYXB0dXJlZCBpbWFnZSBmcm9tIGNhbWVyYS5cbiAgICAgKiBBbmQgcmV0dXJucyBiYWNrIHRvIHRoZSBwbGFjZSB3aGVyZSB0aGUgZGlhbG9nIHdpbmRvdyBnb3QgdHJpZ2dlcmVkLCBhbG9uZyB3aXRoXG4gICAgICogdGhlIHBhcmFtZXRlciAncmVzdWx0J1xuICAgICAqIEBwYXJhbSByZXN1bHQgV2hpY2ggaXMgbm90aGluZyBidXQgZW1wdHkgc3RyaW5nIG9yIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBzdHJpbmdcbiAgICAgKi9cbiAgICBjbG9zZShyZXN1bHQ6IHN0cmluZykge1xuICAgICAgICBvcmllbnRhdGlvbi5lbmFibGVSb3RhdGlvbigpO1xuICAgICAgICB0aGlzLnBhcmFtcy5jbG9zZUNhbGxiYWNrKHJlc3VsdCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1pbmcgbWFudWFsIHRyYW5zZm9ybWF0aW9uXG4gICAgICogdGhpcyBpcyBiZWVuIHVzZWQgdG8gcGVyZm9ybSB0cmFuc2Zvcm1hdGlvbiBtYW51YWxseSwgd2hlcmUgdGhlIHJlY3RhbmdsZVxuICAgICAqIHBvaW50cyB3aWxsIGJlIGNob29zZW4gYnkgdXNlciBpbiB0aGUgY2FwdHVyZWQgaW1hZ2UgZGlzcGxheWluZyBpbiB0aGUgZGlhbG9nIHdpbmRvdy5cbiAgICAgKiBJbiB0aGUgZGlhbG9nIHdpbmRvdywgdGhlcmUgYXJlIGZvdXIgY2lyY2xlcyBhcmUgYmVpbmcgdXNlZCB0byBzZWxlY3QgcG9pbnRzLlxuICAgICAqIEJhc2VkIG9uIHRoZSBzZWxlY3RlZCBwb2ludHMsIHRoZSB0cmFuc2Zvcm1hdGlvbiB3aWxsIGJlIHBlcmZvcm1lZCBoZXJlLlxuICAgICAqL1xuICAgIHBlcmZvcm1NYW51YWxDb3JyZWN0aW9uKCkge1xuICAgICAgICBsZXQgcG9pbnRzQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKChwb2ludDogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAocG9pbnQpIHtcbiAgICAgICAgICAgICAgICBwb2ludHNDb3VudCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBUbyBnZXQgYWNjdXJhdGUgcG9zaXRpb24sIG5lZWQgdG8gYWRqdXN0IHRoZSByYWRpdXMgdmFsdWU7XG4gICAgICAgIC8vIGNvbnN0IGNpcmNsZVJhZGl1cyA9IDE3O1xuICAgICAgICAvLyB0aGlzLnBvaW50c1swXS55ID0gK3RoaXMucG9pbnRzWzBdLnkgLSBjaXJjbGVSYWRpdXM7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzWzFdLnkgPSArdGhpcy5wb2ludHNbMV0ueSAtIGNpcmNsZVJhZGl1cztcbiAgICAgICAgLy8gdGhpcy5wb2ludHNbMl0ueSA9ICt0aGlzLnBvaW50c1syXS55ICsgY2lyY2xlUmFkaXVzO1xuICAgICAgICAvLyB0aGlzLnBvaW50c1szXS55ID0gK3RoaXMucG9pbnRzWzNdLnkgKyBjaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgY29uc3QgcG9pbnQwWSA9ICgrdGhpcy5wb2ludHNbMF0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcG9pbnQxWSA9ICgrdGhpcy5wb2ludHNbMV0ueSAtIHRoaXMuY2lyY2xlUmFkaXVzKTtcbiAgICAgICAgY29uc3QgcmVjdGFuZ2xlUG9pbnRzID0gdGhpcy5wb2ludHNbMF0ueCArICctJyArICgocG9pbnQwWSA8IDApID8gMCA6IHBvaW50MFkpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzFdLnggKyAnLScgKyAoKHBvaW50MVkgPCAwKSA/IDAgOiBwb2ludDFZKSArICcjJ1xuICAgICAgICAgICAgKyB0aGlzLnBvaW50c1syXS54ICsgJy0nICsgKCt0aGlzLnBvaW50c1syXS55ICsgdGhpcy5jaXJjbGVSYWRpdXMpICsgJyMnXG4gICAgICAgICAgICArIHRoaXMucG9pbnRzWzNdLnggKyAnLScgKyAoK3RoaXMucG9pbnRzWzNdLnkgKyB0aGlzLmNpcmNsZVJhZGl1cyk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPbGQgPSB0aGlzLmltYWdlU291cmNlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gb3BlbmN2LnBlcmZvcm1QZXJzcGVjdGl2ZUNvcnJlY3Rpb25NYW51YWwodGhpcy5pbWFnZVNvdXJjZU9yZywgcmVjdGFuZ2xlUG9pbnRzLFxuICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggKyAnLScgKyB0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQpO1xuICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZVNvdXJjZSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZGVsZXRlRmlsZSh0aGlzLmltYWdlU291cmNlT2xkKTtcbiAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLmltYWdlU291cmNlT3JnT2xkO1xuICAgICAgICB0aGlzLmlzQXV0b0NvcnJlY3Rpb24gPSB0cnVlO1xuICAgICAgICB0aGlzLm1hbnVhbEJ0blRleHQgPSBMQUJMRV9NQU5VQUw7XG4gICAgICAgIC8vIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdtYW51YWwnKTtcbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVzKCk7XG4gICAgICAgIC8vIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLkRlbGV0ZUZpbGVzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudCBHZXN0dXJlIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICAvLyBnZXRQb2ludHMoZXZlbnQ6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAvLyAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgPT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAvLyAgICAgICAgICAgICAvLyBUaGlzIGlzIHRoZSBkZW5zaXR5IG9mIHlvdXIgc2NyZWVuLCBzbyB3ZSBjYW4gZGl2aWRlIHRoZSBtZWFzdXJlZCB3aWR0aC9oZWlnaHQgYnkgaXQuXG4gICAgLy8gICAgICAgICAgICAgY29uc3Qgc2NhbGU6IG51bWJlciA9IHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLnNjYWxlO1xuXG4gICAgLy8gICAgICAgICAgICAgdGhpcy5pbWFnZUFjdHVhbFNpemUgPSB0aGlzLmltZ1ZpZXcuZ2V0QWN0dWFsU2l6ZSgpO1xuICAgIC8vICAgICAgICAgICAgIGNvbnN0IHBvaW50WCA9IGV2ZW50LmFuZHJvaWQuZ2V0WCgpIC8gc2NhbGU7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgcG9pbnRZID0gZXZlbnQuYW5kcm9pZC5nZXRZKCkgLyBzY2FsZTtcblxuICAgIC8vICAgICAgICAgICAgIGNvbnN0IGFjdHVhbFBvaW50ID0geyB4OiBwb2ludFgsIHk6IHBvaW50WSwgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuXG4gICAgLy8gICAgICAgICAgICAgaWYgKHRoaXMucG9pbnRzLmxlbmd0aCA+PSA0KSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdQbGVhc2Ugc2VsZWN0IG9ubHkgZm91ciBwb2ludHMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQodGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpKTtcbiAgICAvLyAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgY2FsbGluZyBnZXRQb2ludHMoKS4gJyArIGVycm9yKTtcbiAgICAvLyAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKG1vZHVsZS5maWxlbmFtZSArICc6ICcgKyBlcnJvcik7XG4gICAgLy8gICAgIH1cbiAgICAvLyB9XG5cbiAgICBnZXQgaW1hZ2VMaXN0KCk6IEFycmF5PFRyYW5zZm9ybWVkSW1hZ2U+IHtcbiAgICAgICAgY29uc29sZS5sb2coXCJpbWFnZUxpc3Q6XCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jb250b3VySW1hZ2VMaXN0KSk7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jb250b3VySW1hZ2VMaXN0O1xuICAgICAgICAvLyByZXR1cm4gdGhpcy5jb250b3VyTGlzdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBvcmlnaW5hbCBpbWFnZSwgaXMgYmVpbmcgdXNlZCB0byBzaG93IG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlXG4gICAgICogd2hlbiB0aGUgJ01hbnVhbCcgYnV0dG9uIGlzIGJlZW4gcHJlc3NlZCwgdGhpcyBpcyB3aGVyZSB1c2VyIGNhbiBzZWxlY3QgZGVzaXJlZCBwb2ludHNcbiAgICAgKiBhbmQgcGVyZm9ybSBtYW51YWwgdHJhbnNmb3JtYXRpb24uIEl0IGlzIGFsc28gaW50aWFsaXppbmcgY2lyY2xlIHBvaW50cyB0byBiZSBkaXNwbGF5ZWRcbiAgICAgKiBpbiB0aGUgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICovXG4gICAgc2hvd09yaWdpbmFsSW1hZ2UoKSB7XG4gICAgICAgIHRoaXMuaXNBdXRvQ29ycmVjdGlvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9uRG91YmxlVGFwKCk7XG4gICAgICAgIGlmICh0aGlzLmNpcmNsZUJ0bkxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgncmVjdGFuZ2xlX3BvaW50c19pbmZvJyksICdsb25nJykuc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFudWFsQnRuVGV4dCA9IExBQkxFX1BFUkZPUk07XG4gICAgICAgIC8vIHRoaXMubWFudWFsUGVyZm9ybUJ0bkxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdwZXJmb3JtJyk7XG4gICAgICAgIHRoaXMucG9pbnRzQ291bnRlciA9IDA7XG4gICAgICAgIHRoaXMuYWRkQ2lyY2xlcygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwaW5jaCBtZXRob2QsIGlzIGJlaW5nIGNhbGxlZCB3aGlsZSBwaW5jaCBldmVudCBmaXJlZCBvbiBpbWFnZSxcbiAgICAgKiB3aGVyZSB0aGUgbmV3IHNjYWxlLCB3aWR0aCAmIGhlaWdodCBvZiB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaGF2ZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiB0byB6b29tLWluL291dC5cbiAgICAgKiBAcGFyYW0gYXJncyBQaW5jaEdlc3R1cmUgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICAvLyBsZXQgbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWDtcbiAgICAgICAgICAgIC8vIGxldCBuZXdPcmlnaW5ZID0gYXJncy5nZXRGb2N1c1koKSAtIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZO1xuXG4gICAgICAgICAgICAvLyBsZXQgb2xkT3JpZ2luWCA9IHRoaXMuaW1nVmlldy5vcmlnaW5YICogdGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIC8vIGxldCBvbGRPcmlnaW5ZID0gdGhpcy5pbWdWaWV3Lm9yaWdpblkgKiB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTY2FsZSA9IHRoaXMuaW1nVmlldy5zY2FsZVg7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1pbig4LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgdGhpcy5uZXdTY2FsZSk7XG5cbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWSA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcud2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuaW1nVmlldy5oZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZSBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuaW1nVmlldy5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGlmICh0aGlzLm1hbnVhbEJ0blRleHQgIT09IExBQkxFX1BFUkZPUk0pIHtcbiAgICAgICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5pbWdWaWV3LmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5pbWdWaWV3Lm9yaWdpblg7XG4gICAgICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmltZ1ZpZXcuZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuaW1nVmlldy5vcmlnaW5ZO1xuXG4gICAgICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmltZ1ZpZXcuZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuaW1nVmlldy50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5pbWdWaWV3LnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBBY3R1YWxseSBpdCBicmluZ3MgdGhlIGltYWdlIHRvIGl0J3Mgb3JpZ2luYWwgcG9zaXRpb25zIGFuZCBhbHNvIGFkZHNcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKCkge1xuICAgICAgICBpZiAodGhpcy5tYW51YWxCdG5UZXh0ICE9PSBMQUJMRV9QRVJGT1JNKSB7XG4gICAgICAgICAgICB0aGlzLmltZ1ZpZXcuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGlzLmluaXRQb2ludHMoKTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlcygpO1xuICAgICAgICAgICAgdGhpcy5hZGRDaXJjbGVzKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gZGlhbG9nIHdpbmRvdyBpcyBsb2FkZWQsXG4gICAgICogd2hlcmUgYWxsIHRoZSBuZWNlc3NhcnkgdmFsdWVzIGZvciB0aGUgaW1hZ2UgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB3aW5kb3dcbiAgICAgKiBoYXZlIGJlZW4gaW5pdGlhbGl6ZWQsIGxpa2UgdHJhbnNmb3JtZWRJbWFnZVNvdXJjZSwgb3JpZ2luYWxJbWFnZVNvdXJjZSAmXG4gICAgICogcmVjdGFuZ2xlIHBvaW50cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IHsgb2JqZWN0OiBhbnk7IH0pIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMucGFyYW1zLmNvbnRleHQuaW1hZ2VTb3VyY2U7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2VPcmcgPSB0aGlzLnBhcmFtcy5jb250ZXh0LmltYWdlU291cmNlT3JnO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT3JnT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZU9yZztcbiAgICAgICAgdGhpcy5pc0F1dG9Db3JyZWN0aW9uID0gdGhpcy5wYXJhbXMuY29udGV4dC5pc0F1dG9Db3JyZWN0aW9uO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlT2xkID0gdGhpcy5wYXJhbXMuY29udGV4dC5pbWFnZVNvdXJjZTtcbiAgICAgICAgY29uc3QgcmVjUG9pbnRzU3RyVGVtcCA9IHRoaXMucGFyYW1zLmNvbnRleHQucmVjdGFuZ2xlUG9pbnRzO1xuXG4gICAgICAgIHRoaXMucmVjdGFuZ2xlUG9pbnRzID0gcmVjUG9pbnRzU3RyVGVtcC5zcGxpdCgnIycpO1xuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5zaGlmdCgpOyAvLyByZW1vdmUgZmlyc3QgZWxlbWVudFxuICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5wb3AoKTsgLy8gcmVtb3ZlIGxhc3QgZWxlbWVudFxuICAgICAgICBjb25zdCBwYWdlID0gYXJncy5vYmplY3Q7XG4gICAgICAgIHRoaXMuaW1nVmlldyA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ1ZpZXdJZCcpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZCA9IHBhZ2UuZ2V0Vmlld0J5SWQoJ2ltZ0dyaWRJZCcpO1xuICAgICAgICB0aGlzLmltZ1ZpZXcudHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuaW1nVmlldy50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5pbWdWaWV3LnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuaW1nVmlldy5zY2FsZVkgPSAxO1xuICAgICAgICAvLyB0aGlzLmltZ1ZpZXcucm90YXRlID0gOTA7XG4gICAgICAgIG9yaWVudGF0aW9uLnNldE9yaWVudGF0aW9uKCdwb3J0cmFpdCcpO1xuICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICBjb25zdCBmaWxlTmFtZSA9IHRoaXMuaW1hZ2VTb3VyY2Uuc3Vic3RyaW5nKHRoaXMuaW1hZ2VTb3VyY2UubGFzdEluZGV4T2YoJ1BUX0lNRycpLCB0aGlzLmltYWdlU291cmNlLmxhc3RJbmRleE9mKCd0cmFuc2Zvcm1lZCcpKVxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5Mb2FkUG9zc2libGVDb250b3VySW1hZ2VzKGZpbGVOYW1lKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZEltZ0dyaWQgPSBwYWdlLmdldFZpZXdCeUlkKCdpbWctZ3JpZC0wJyk7XG4gICAgICAgICAgICBzZWxlY3RlZEltZ0dyaWQuYmFja2dyb3VuZENvbG9yID0gJ0JsYWNrJztcbiAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIC8vICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy8gICAgcGFnZS5hY3Rpb25CYXJIaWRkZW4gPSB0cnVlO1xuICAgICAgICAvLyB9LCAxMDAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVuYWJsZURlbGV0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9ICF0aGlzLmlzRGVsZXRpbmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSAnZGVsZXRlJyBidXR0b24gaW4gbWVudS5cbiAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAqIHRvIGJlIGRlbGV0ZWQuIElmIHVzZXIgc2F5cyAnT2snLCB0aGVuIHRob3NlIGltYWdlKHMpIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICogZGV2aWNlLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAqL1xuICAgIHByaXZhdGUgb25EZWxldGUoZXZlbnQ6IGFueSkge1xuICAgICAgICAvLyBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgdGl0bGU6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGVsZXRlJyksXG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RlbGV0aW5nX3NlbGVjdGVkX2l0ZW0nKSxcbiAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdvaycpLFxuICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdjYW5jZWwnKSxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmZpbGVQYXRoID09IHRoaXMuaW1hZ2VTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aHVtYm5haWxGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZS5maWxlUGF0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5wYWdlTG9hZGVkKGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2RlbGV0aW5nX3RodW1ibmFpbF9pbWFnZXMnKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0lkeCA9IHRoaXMuaW1hZ2VMaXN0LmluZGV4T2YoaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSBpbWdJZHg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmV4dEltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0aGlzLmltZ05leHQgPj0gKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmNvbnRvdXJJbWFnZUxpc3QubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIHRoaXMuaW1nTmV4dC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmICh0aGlzLmltZ05leHQgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY29udG91ckltYWdlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEltYWdlU2VsZWN0ZWQodGhpcy5pbWdOZXh0LCB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jb250b3VySW1hZ2VMaXN0Lmxlbmd0aCwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3Quc3BsaWNlKGltZ0lkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdGVkX2ltYWdlc19kZWxldGVkJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ19pbWFnZXMnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBBZGQgY2lyY2xlcyBtZXRob2QgYWRkcyBjaXJjbGUgcG9pbnRzIGJ0biBpbiBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGFkZENpcmNsZXMoKSB7XG4gICAgICAgIHRoaXMuY2lyY2xlQnRuTGlzdC5mb3JFYWNoKChidG46IGFueSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbWdHcmlkSWQuYWRkQ2hpbGQoYnRuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBjaXJjbGVzIHJlbW92ZXMgY2lyY2xlIHBvaW50cyBidG4gZnJvbSBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIHJlbW92ZUNpcmNsZXMoKSB7XG4gICAgICAgIGNvbnN0IGltZ0VsZW1lbnQgPSB0aGlzLmltZ0dyaWRJZC5nZXRDaGlsZEF0KDApO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZC5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICB0aGlzLmltZ0dyaWRJZC5hZGRDaGlsZChpbWdFbGVtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBzd2lwZSB3aXRoIGEgZmluZ3VyZS4gQWN0dWFsbHkgd2hlbiBhIGZpbmdlciBpcyBzd2lwZWRcbiAgICAgKiBpdCBjaGVja3MgdGhhdCB0aGUgc3dpcGUgaXMgcmlnaHQgZGlyZWN0IG9yIGxlZnQgZGlyZWN0aW9uLCBiYXNlZCBvbiB0aGF0IGl0IHB1bGxzIHRoZSBpbWFnZSBmcm9tXG4gICAgICogdGhlIGltYWdlIGxpc3QgYW5kIGRpc3BsYXkgaXQgaW4gdmlldy4gQWZ0ZXIgdGhhdCwgaXQgc2V0cyB0aGUgaW1hZ2UgaW4gZGVmYXVsdCBwb3NpdGlvbiBieSBjYWxsaW5nXG4gICAgICogb25Eb3VibGVUYXAgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgU3dpcGVHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgLy8gaWYgKHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPT09IDEgJiYgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9PT0gMSkge1xuICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDIgfHwgIWFyZ3MuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLm5leHRJbWFnZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZpb3VzSW1hZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICAvLyAvLyB0aGlzLmltZ0luZGV4ID0gdGhpcy5pbWdOZXh0O1xuICAgICAgICAvLyBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmNvbnRvdXJJbWFnZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aDtcbiAgICAgICAgdGhpcy5zZXRJbWFnZVNlbGVjdGVkKHRoaXMuaW1nTmV4dCwgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY29udG91ckltYWdlTGlzdC5sZW5ndGgsIGFyZ3MpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG4gICAgICAgIC8vICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ25vX2ltYWdlX2F2YWlsYWJsZScpKS5zaG93KCk7XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyB0aGlzLm9uRG91YmxlVGFwKGFyZ3MpO1xuICAgICAgICAvLyB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBtb3ZlIHRvIHByZXZpb3VzIGltYWdlXG4gICAgICovXG4gICAgcHJpdmF0ZSBwcmV2aW91c0ltYWdlKCkge1xuICAgICAgICB0aGlzLmltZ05leHQtLTtcbiAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8IDAgfHwgdGhpcy5pbWdOZXh0ID49IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmNvbnRvdXJJbWFnZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLmltZ05leHQgPSAodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuY29udG91ckltYWdlTGlzdC5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gbW92ZSB0byBuZXh0IGltYWdlLlxuICAgICAqL1xuICAgIHByaXZhdGUgbmV4dEltYWdlKCkge1xuICAgICAgICB0aGlzLmltZ05leHQrKztcbiAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8PSAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5jb250b3VySW1hZ2VMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pbWdOZXh0ID0gMDtcbiAgICAgICAgfVxuXG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbGVjdCB0aGUgaW1hZ2UgdGFwcGVkIGJ5IHVzZXIgYW5kIG1ha2VzIGl0IHdpdGggc2VsZWN0ZWQgc2lnbiBpbiBibGFjayBjb2xvci5cbiAgICAgKiBAcGFyYW0gaW1nVVJJUGF0aCAgdGhlIGltYWdlIFVSSSBwYXRoXG4gICAgICogQHBhcmFtIGluZGV4ICB0aGUgaW5kZXggb2YgdGhlIHNlbGVjdGVkIGltYWdlXG4gICAgICogQHBhcmFtIGV2ZW50IHRoZSBldmVudCBoYW5kbGVyIG9iamVjdFxuICAgICAqL1xuICAgIHByaXZhdGUgc2VsZWN0SW1hZ2UoaW1nVVJJUGF0aDogYW55LCBpbmRleDogYW55LCBldmVudDogYW55KSB7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBpbWdVUklQYXRoO1xuICAgICAgICB0aGlzLnNldEltYWdlU2VsZWN0ZWQoaW5kZXgsIGV2ZW50LnZpZXcucGFyZW50LnBhcmVudC5fY2hpbGRyZW5Db3VudCwgZXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0SW1hZ2VTZWxlY3RlZChpbmRleDogYW55LCBub09mSW1hZ2VzOiBhbnksIGV2ZW50OiBhbnkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBub09mSW1hZ2VzOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkSW1nR3JpZCA9IGV2ZW50LnZpZXcucGFnZS5nZXRWaWV3QnlJZCgnaW1nLWdyaWQtJyArIGkpO1xuICAgICAgICAgICAgc2VsZWN0ZWRJbWdHcmlkLmJhY2tncm91bmRDb2xvciA9ICdncmF5JztcbiAgICAgICAgICAgIGlmIChpID09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJbWdHcmlkLmJhY2tncm91bmRDb2xvciA9ICdCbGFjayc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBjaXJjbGUgcG9pbnRzIGJhc2VkIG9uIHRoZSByZWNlaWV2ZWQgcmVjdGFuZ2xlIHBvaW50cyBhbmRcbiAgICAgKiBpbWFnZSdzIHdpZHRoICYgaGVpZ2h0LlxuICAgICAqL1xuICAgIHByaXZhdGUgaW5pdFBvaW50cygpIHtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludHNDb3VudGVyID0gMDtcbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0ID0gW107XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGRlbnNpdHkgb2YgeW91ciBzY3JlZW4sIHNvIHdlIGNhbiBkaXZpZGUgdGhlIG1lYXN1cmVkIHdpZHRoL2hlaWdodCBieSBpdC5cbiAgICAgICAgY29uc3Qgc2NhbGU6IG51bWJlciA9IHBsYXRmb3JtLnNjcmVlbi5tYWluU2NyZWVuLnNjYWxlO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VBY3R1YWxTaXplID0gdGhpcy5pbWdWaWV3LmdldEFjdHVhbFNpemUoKTtcbiAgICAgICAgdGhpcy5jZW50ZXJQb2ludFggPSAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gMikgLyBzY2FsZTtcbiAgICAgICAgdGhpcy5jZW50ZXJQb2ludFkgPSAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDIpIC8gc2NhbGU7XG5cbiAgICAgICAgbGV0IGFjdHVhbFBvaW50ID0ge307XG4gICAgICAgIGlmICh0aGlzLnJlY3RhbmdsZVBvaW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBsZXQgcG9pbnRJbmRleCA9IDE7XG4gICAgICAgICAgICB0aGlzLnJlY3RhbmdsZVBvaW50cy5mb3JFYWNoKChwb2ludCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvaW50cyA9IHBvaW50LnNwbGl0KCclJyk7XG4gICAgICAgICAgICAgICAgbGV0IGJvdHRvbUNpcmNsZVJhZGl1cyA9IHRoaXMuY2lyY2xlUmFkaXVzO1xuICAgICAgICAgICAgICAgIC8vIGxldCBwb2ludERpZmZYID0gMDtcbiAgICAgICAgICAgICAgICAvLyBsZXQgcG9pbnREaWZmWSA9IDA7XG4gICAgICAgICAgICAgICAgLy8gaWYgKHBvaW50SW5kZXggPT0gMSkge1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZYID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gMTA7XG4gICAgICAgICAgICAgICAgLy8gfSBlbHNlIGlmIChwb2ludEluZGV4ID09IDIpIHtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWCA9IDEwO1xuICAgICAgICAgICAgICAgIC8vICAgICBwb2ludERpZmZZID0gLTEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSAzKSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAxMDtcbiAgICAgICAgICAgICAgICAvLyAgICAgcG9pbnREaWZmWSA9IDEwO1xuICAgICAgICAgICAgICAgIC8vIH0gZWxzZSBpZiAocG9pbnRJbmRleCA9PSA0KSB7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlggPSAtMTA7XG4gICAgICAgICAgICAgICAgLy8gICAgIHBvaW50RGlmZlkgPSAxMDtcbiAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgaWYgKHBvaW50SW5kZXgrKyA+IDIpIHsgLy8gRm9yIGNoZWNraW5nIGJvdHRvbiBwb2ludHNcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tQ2lyY2xlUmFkaXVzID0gYm90dG9tQ2lyY2xlUmFkaXVzICogLTE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gICAgICAgICAgICAgICAgIHRvcExlZnQueCA9IHRvcExlZnQueCAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcExlZnQueSA9IHRvcExlZnQueSAtIDEwO1xuICAgICAgICAgICAgICAgIC8vIHRvcFJpZ2h0LnggPSB0b3BSaWdodC54ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gdG9wUmlnaHQueSA9IHRvcFJpZ2h0LnkgLSAxMDtcbiAgICAgICAgICAgICAgICAvLyBib3R0b21SaWdodC54ID0gYm90dG9tUmlnaHQueCArIDEwO1xuICAgICAgICAgICAgICAgIC8vIGJvdHRvbVJpZ2h0LnkgPSBib3R0b21SaWdodC55ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tTGVmdC54ID0gYm90dG9tTGVmdC54IC0gMTA7XG4gICAgICAgICAgICAgICAgLy8gYm90dG9tTGVmdC55ID0gYm90dG9tTGVmdC55ICsgMTA7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGFjdHVhbFBvaW50ID0geyB4OiAoK3BvaW50c1swXSArIHBvaW50RGlmZlgpICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkV2lkdGgoKSAvIHNjYWxlKSxcbiAgICAgICAgICAgICAgICAvLyB5OiAoKCtwb2ludHNbMV0rcG9pbnREaWZmWSkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIHNjYWxlKSlcbiAgICAgICAgICAgICAgICAvLyArIGNpcmNsZVJhZGl1cywgaWQ6IHRoaXMucG9pbnRzQ291bnRlciB9O1xuICAgICAgICAgICAgICAgIGFjdHVhbFBvaW50ID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAoK3BvaW50c1swXSkgKiAodGhpcy5pbWdHcmlkSWQuZ2V0TWVhc3VyZWRXaWR0aCgpIC8gc2NhbGUpLFxuICAgICAgICAgICAgICAgICAgICB5OiAoKCtwb2ludHNbMV0pICogKHRoaXMuaW1nR3JpZElkLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyBzY2FsZSkpICsgYm90dG9tQ2lyY2xlUmFkaXVzLCBpZDogdGhpcy5wb2ludHNDb3VudGVyLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiAwLCB5OiAwLCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogdGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGgsIHk6IDAsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlQ2lyY2xlKGFjdHVhbFBvaW50KTtcbiAgICAgICAgICAgIGFjdHVhbFBvaW50ID0geyB4OiB0aGlzLmltYWdlQWN0dWFsU2l6ZS53aWR0aCwgeTogdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICBhY3R1YWxQb2ludCA9IHsgeDogMCwgeTogdGhpcy5pbWFnZUFjdHVhbFNpemUuaGVpZ2h0LCBpZDogdGhpcy5wb2ludHNDb3VudGVyIH07XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG5cbiAgICAgICAgICAgIC8vICAgICBsZXQgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuY2VudGVyUG9pbnRZIC0gNzUsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICAvLyAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuY2VudGVyUG9pbnRZIC0gNzUsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICAvLyAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuY2VudGVyUG9pbnRYIC0gNzUsIHk6IHRoaXMuY2VudGVyUG9pbnRZICsgNzUsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgICAgICAvLyAgICAgYWN0dWFsUG9pbnQgPSB7IHg6IHRoaXMuY2VudGVyUG9pbnRYICsgNzUsIHk6IHRoaXMuY2VudGVyUG9pbnRZICsgNzUsIGlkOiB0aGlzLnBvaW50c0NvdW50ZXIgfTtcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmNyZWF0ZUNpcmNsZShhY3R1YWxQb2ludCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgY3JlYXRlcyBjaXJjbGUgcG9pbnRzIGJ1dHRvbiBvbiBvcmlnaW5hbCBpbWFnZSB2aWV3XG4gICAgICogYmFzZWQgb24gdGhlIHBvaW50cyByZWNlaWV2ZWQgdmlhIGFjdHVhbFBvaW50IGFuZCBhbHNvIHRha2VzXG4gICAgICogY2FyZSBvZiBib3VuZGFyeSBjaGVja2luZyB3aGlsZSBkaXBsYXlpbmcgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWN0dWFsUG9pbnQgQ29udGFpbnMgY2lyY2xlIHBvaW50cyh4LHkpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjcmVhdGVDaXJjbGUoYWN0dWFsUG9pbnQ6IGFueSk6IGFueSB7XG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY29uc3QgYWN0dWFsUG9pbnREZWx0YVggPSAodGhpcy5pbWFnZUFjdHVhbFNpemUud2lkdGggLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLndpZHRoO1xuICAgICAgICBjb25zdCBhY3R1YWxQb2ludERlbHRhWSA9ICh0aGlzLmltYWdlQWN0dWFsU2l6ZS5oZWlnaHQgLyAyKSAtIHRoaXMuaW1hZ2VBY3R1YWxTaXplLmhlaWdodDtcblxuICAgICAgICBjb25zdCBmb3JtYXR0ZWRTdHJpbmcgPSBuZXcgZm9ybWF0dGVkU3RyaW5nTW9kdWxlLkZvcm1hdHRlZFN0cmluZygpO1xuICAgICAgICBjb25zdCBpY29uU3BhbiA9IG5ldyBmb3JtYXR0ZWRTdHJpbmdNb2R1bGUuU3BhbigpO1xuICAgICAgICBpY29uU3Bhbi5jc3NDbGFzc2VzLmFkZCgnZmEnKTtcbiAgICAgICAgaWNvblNwYW4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZS1wbHVzJyk7XG4gICAgICAgIGljb25TcGFuLnRleHQgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4ZjA2Nyk7XG5cbiAgICAgICAgZm9ybWF0dGVkU3RyaW5nLnNwYW5zLnB1c2goaWNvblNwYW4pO1xuICAgICAgICBjb25zdCBjaXJjbGVCdG46IGFueSA9IG5ldyBidXR0b25zLkJ1dHRvbigpO1xuICAgICAgICBjaXJjbGVCdG4uY3NzQ2xhc3Nlcy5hZGQoJ2NpcmNsZScpO1xuXG4gICAgICAgIGNpcmNsZUJ0bi5pZCA9IHRoaXMucG9pbnRzQ291bnRlcisrO1xuICAgICAgICBjaXJjbGVCdG4uZm9ybWF0dGVkVGV4dCA9IGZvcm1hdHRlZFN0cmluZztcbiAgICAgICAgY2lyY2xlQnRuLm9uKCdwYW4nLCAoYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkgPT4ge1xuICAgICAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tCb3VuZGFyeShjaXJjbGVCdG4udHJhbnNsYXRlWCwgY2lyY2xlQnRuLnRyYW5zbGF0ZVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xNTtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKz0gLTMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9ICsxMDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVYICs9IC0xMDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSArMTA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWSArPSAtMTA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0JvdW5kYXJ5KGNpcmNsZUJ0bi50cmFuc2xhdGVYLCBjaXJjbGVCdG4udHJhbnNsYXRlWSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goKHBvaW50OiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb2ludC5pZCA9PT0gY2lyY2xlQnRuLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50LnggPSBjaXJjbGVCdG4udHJhbnNsYXRlWCAtIGFjdHVhbFBvaW50RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludC55ID0gY2lyY2xlQnRuLnRyYW5zbGF0ZVkgLSBhY3R1YWxQb2ludERlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIFNpbmNlIHRoZSBzZWxlY3RlZCBwb2ludCBieSB1c2VyIGlzIGFsd2F5cyBwb2ludGluZyB0b1xuICAgICAgICAvLyBjZW50ZXIgb2YgdGhlIGltYWdlICh3aGljaCBpcyAoMCwwKSksIHNvIG5lZWQgdG8gc2VsZWN0XG4gICAgICAgIC8vIHRvcC1sZWZ0LCB0b3AtcmlnaHQgJiBib3R0b20tbGVmdCwgZm9yIHdoaWNoIHRoZSBhY3R1YWxQb2ludERlbHRhWC9hY3R1YWxQb2ludERlbHRhWVxuICAgICAgICAvLyBhcmUgdXNlZC5cbiAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVggPSBhY3R1YWxQb2ludC54ICsgYWN0dWFsUG9pbnREZWx0YVg7XG4gICAgICAgIGNpcmNsZUJ0bi50cmFuc2xhdGVZID0gYWN0dWFsUG9pbnQueSArIGFjdHVhbFBvaW50RGVsdGFZO1xuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVggPiAwICYmXG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaXJjbGVCdG4udHJhbnNsYXRlWCA8IDAgJiZcbiAgICAgICAgICAgIChjaXJjbGVCdG4udHJhbnNsYXRlWCAqIC0xKSA+IHRoaXMuY2VudGVyUG9pbnRYKSB7XG4gICAgICAgICAgICBjaXJjbGVCdG4udHJhbnNsYXRlWCA9IHRoaXMuY2VudGVyUG9pbnRYICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNpcmNsZUJ0bi50cmFuc2xhdGVZID4gMCAmJlxuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPCAwICYmXG4gICAgICAgICAgICAoY2lyY2xlQnRuLnRyYW5zbGF0ZVkgKiAtMSkgPiB0aGlzLmNlbnRlclBvaW50WSkge1xuICAgICAgICAgICAgY2lyY2xlQnRuLnRyYW5zbGF0ZVkgPSB0aGlzLmNlbnRlclBvaW50WSAqIC0xO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jaXJjbGVCdG5MaXN0LnB1c2goY2lyY2xlQnRuKTtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChhY3R1YWxQb2ludCk7XG4gICAgICAgIHJldHVybiBjaXJjbGVCdG47XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0aGUgaW1hZ2UgdGhhdCBpdCBpcyB3aXRoaW4gdGhlIGltYWdlIHZpZXcgYm91bmRhcnkgb3Igbm90LlxuICAgICAqXG4gICAgICogQHBhcmFtIHRyYW5zbGF0ZVggSW1hZ2UgdHJhbnNsYXRlWFxuICAgICAqIEBwYXJhbSB0cmFuc2xhdGVZIEltYWdlIHRyYW5zbGF0ZVlcbiAgICAgKi9cbiAgICBwcml2YXRlIGNoZWNrQm91bmRhcnkodHJhbnNsYXRlWDogYW55LCB0cmFuc2xhdGVZOiBhbnkpOiBhbnkge1xuICAgICAgICBjb25zdCBwb2ludEFkanVzdG1lbnQgPSA1OyAvLyBOZWVkIHRvIGFkanVzdCB0aGUgY2VudGVyIHBvaW50IHZhbHVlIHRvIGNoZWNrIHRoZSBib3VuZGFyeVxuICAgICAgICBpZiAodHJhbnNsYXRlWCA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgIHRyYW5zbGF0ZVkgPCAodGhpcy5jZW50ZXJQb2ludFkgLSBwb2ludEFkanVzdG1lbnQpICYmXG4gICAgICAgICAgICAodHJhbnNsYXRlWCAqIC0xKSA8ICh0aGlzLmNlbnRlclBvaW50WCAtIHBvaW50QWRqdXN0bWVudCkgJiZcbiAgICAgICAgICAgICh0cmFuc2xhdGVZICogLTEpIDwgKHRoaXMuY2VudGVyUG9pbnRZIC0gcG9pbnRBZGp1c3RtZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==