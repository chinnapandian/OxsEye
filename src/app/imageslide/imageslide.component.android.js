"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var file_system_1 = require("tns-core-modules/file-system");
var image_source_1 = require("tns-core-modules/image-source");
var page_1 = require("tns-core-modules/ui/page");
var router_2 = require("nativescript-angular/router");
var nativescript_localize_1 = require("nativescript-localize");
// @ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
// @ts-ignore
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
// import { EventData, Observable } from 'data/observable';
var observable_array_1 = require("tns-core-modules/data/observable-array");
var observable_1 = require("tns-core-modules/data/observable");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
/** View model variable for observable instance */
var viewModel;
/** View model variable for observable array */
var imageUrlList = new observable_array_1.ObservableArray();
/**
 * ImageSlideComponent is used to show image in detail view, where user can zoom-in/out.
 */
var ImageSlideComponent = /** @class */ (function () {
    /**
     * ImageSlideComponent constructor.
     * @param page Page
     * @param routerExtensions RouterExtensions
     * @param route ActivatedRoute
     * @param transformedImageProvider TransformedImageProvider
     */
    function ImageSlideComponent(page, routerExtensions, route, transformedImageProvider, logger) {
        var _this = this;
        this.page = page;
        this.routerExtensions = routerExtensions;
        this.route = route;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
        /** Contains initial scale value */
        this.startScale = 1;
        /** Contains new scale value while moving the image */
        this.newScale = 1;
        /** To indicate whether pinch is trigger or not */
        this.isPinchSelected = false;
        /** To store old TranslateX value of image */
        this.oldTranslateX = 0;
        /** To store old TranslateY value of image */
        this.oldTranslateY = 0;
        /** Indicates whether the image got default screen location or not */
        this.isGotDefaultLocation = false;
        /** Image url list with obserable array */
        this.imageUrlList = new observable_array_1.ObservableArray();
        /** The pagenumber for the selected image */
        this.pageNumber = 0;
        this.route.queryParams.subscribe(function (params) {
            _this.imgURI = params['imgURI'];
            _this.imgIndex = params['imgIndex'];
        });
    }
    /**
     * Initializes page properties like menus ('delete'/'share') and the image
     * properties like translateX/translateY/scaleX/scaleY.
     */
    ImageSlideComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.imgNext = this.imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.isDeleted = false;
        this.imageSource = new image_source_1.ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
        this.dragImageItem = this._dragImage.nativeElement;
        this.dragImageItem.translateX = 0;
        this.dragImageItem.translateY = 0;
        this.dragImageItem.scaleX = 1;
        this.dragImageItem.scaleY = 1;
        this.imageSource = this.imageFileList[this.imgIndex].filePath;
        this.pageNumber = this.imgIndex;
        this.imageFileList.forEach(function (img) {
            var imageFile = new java.io.File(img.filePath);
            _this.imageUrlList.push({ imageUrl: imageFile.toURL().toString() });
        });
        viewModel = new observable_1.Observable();
        viewModel.set('imageUrlList', this.imageUrlList);
        viewModel.set('pageNumber', this.imgIndex);
        this.page.bindingContext = viewModel;
    };
    /**
     * It is a callback method and invoked by ImageSwipe element
     * when the image is changed in view and sets the pagenumber.
     *
     * @param args event data of ImageSwipe element
     */
    ImageSlideComponent.prototype.pageChanged = function (e) {
        if (this.imgNext.valueOf() == e.page && e.page == 0 && this.isDeleted) {
            this.pageNumber = 1;
            viewModel.set('pageNumber', 1);
            this.isDeleted = false;
        }
        this.imgNext = e.page;
    };
    /**
     * Goes back to previous page when the back button is pressed.
     */
    ImageSlideComponent.prototype.goBack = function () {
        this.routerExtensions.back();
    };
    /**
     * On pinch method, is being called while pinch event fired on image,
     * where the new scale, width & height of the transformed image have been calculated
     * to zoom-in/out.
     *
     * @param args PinchGestureEventData
     */
    ImageSlideComponent.prototype.onPinch = function (args) {
        if (args.state == 1) {
            this.startScale = this.dragImageItem.scaleX;
            this.isPinchSelected = true;
        }
        else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(5, this.newScale);
            this.newScale = Math.max(0.125, this.newScale);
            this.dragImageItem.scaleX = this.newScale;
            this.dragImageItem.scaleY = this.newScale;
            this.dragImageItem.width = this.dragImageItem.getMeasuredWidth() * this.newScale;
            this.dragImageItem.height = this.dragImageItem.getMeasuredHeight() * this.newScale;
        }
    };
    /**
     * On pan/move method, which moves image when user press & drag with a finger around
     * the image area. Here the image's tralateX/translateY values are been calculated
     * based on the image's scale, width & height. And also it takes care of image boundary
     * checking.
     *
     * @param args PanGestureEventData
     */
    ImageSlideComponent.prototype.onPan = function (args) {
        var screenLocation = this.dragImageItem.getLocationOnScreen();
        var centerPointX = (this.dragImageItem.getMeasuredWidth() / 4) * (this.newScale);
        var centerPointY = (this.dragImageItem.getMeasuredHeight() / 4) * (this.newScale);
        var imageViewWidth = this.dragImageItem.getMeasuredWidth() * this.dragImageItem.originX;
        var imageViewHeight = this.dragImageItem.getMeasuredHeight() * this.dragImageItem.originY;
        if (args.state === 1) {
            this.prevDeltaX = 0;
            this.prevDeltaY = 0;
        }
        else if (args.state === 2) {
            centerPointX = (centerPointX * 2);
            centerPointY = (centerPointY * 2);
            if (this.newScale < 15) {
                if (!this.isGotDefaultLocation) {
                    this.defaultScreenLocation = screenLocation;
                    this.isGotDefaultLocation = true;
                }
                if (this.newScale > 1) {
                    if ((screenLocation.x - this.defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this.defaultScreenLocation.x)) {
                        this.dragImageItem.translateX += args.deltaX - this.prevDeltaX;
                        this.oldTranslateX = this.dragImageItem.translateX;
                    }
                    else {
                        if (this.oldTranslateX > 0) {
                            this.oldTranslateX--;
                        }
                        else {
                            this.oldTranslateX++;
                        }
                        this.dragImageItem.translateX = this.oldTranslateX;
                    }
                    if ((screenLocation.y - this.defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this.defaultScreenLocation.y)) {
                        this.dragImageItem.translateY += args.deltaY - this.prevDeltaY;
                        this.oldTranslateY = this.dragImageItem.translateY;
                    }
                    else {
                        if (this.oldTranslateY > 0) {
                            this.oldTranslateY--;
                        }
                        else {
                            this.oldTranslateY++;
                        }
                        this.dragImageItem.translateY = this.oldTranslateY;
                    }
                }
            }
            if (this.newScale >= 15) {
                var translateXTemp = this.dragImageItem.translateX + args.deltaX - this.prevDeltaX;
                var translateYTemp = this.dragImageItem.translateY + args.deltaY - this.prevDeltaY;
                if (this.oldTranslateX < translateXTemp) {
                    this.dragImageItem.translateX = this.oldTranslateX;
                }
                else {
                    this.dragImageItem.translateX = translateXTemp;
                }
                if (this.oldTranslateY < translateYTemp) {
                    this.dragImageItem.translateY = this.oldTranslateY;
                }
                else {
                    this.dragImageItem.translateY = translateYTemp;
                }
            }
            this.prevDeltaX = args.deltaX;
            this.prevDeltaY = args.deltaY;
        }
        else if (args.state === 3) {
            this.isPinchSelected = false;
        }
    };
    /**
     * Double tap method fires on when user taps two times on transformed image.
     * Actually it brings the image to it's original positions and also adds
     * circle points if it is original image.
     *
     * @param args GestureEventData
     */
    ImageSlideComponent.prototype.onDoubleTap = function (args) {
        this.dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeOut',
            duration: 300,
        });
        this.newScale = 1;
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    };
    /**
     * Page loaded method which is been called when imageslide page is loaded,
     * where it sets the selected image in the source for display.
     *
     * @param args any object
     */
    ImageSlideComponent.prototype.pageLoaded = function (args) {
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
    };
    /**
     * Moves the image left/right while swipe with a fingure. Actually when a finger is swiped
     * it checks that the swipe is right direct or left direction, based on that it pulls the image from
     * the image list and display it in view. After that, it sets the image in default position by calling
     * onDoubleTap method.
     *
     * @param args SwipeGestureEventData
     */
    ImageSlideComponent.prototype.onSwipe = function (args) {
        if (args.direction === 2 || !args.direction) {
            this.imgNext++;
            if (this.imgNext <= 0 || this.imgNext >= this.imageFileList.length) {
                this.imgNext = 0;
            }
        }
        else if (args.direction === 1) {
            this.imgNext--;
            if (this.imgNext < 0 || this.imgNext >= this.imageFileList.length) {
                this.imgNext = (this.imageFileList.length - 1);
            }
        }
        this.imgIndex = this.imgNext;
        if (this.imageFileList.length > 0) {
            this.imageSource = this.imageFileList[this.imgNext].filePath;
        }
        else {
            this.imageSource = null;
            this.isDeleting = false;
            this.isSharing = false;
            Toast.makeText(nativescript_localize_1.localize('no_image_available')).show();
        }
    };
    /**
     * Shares selected image(s) when user clicks the share button. The sharing can be done
     * via any one of the medias supported by android device by default. The list of supported
     * medias will be visible when the share button clicked.
     */
    ImageSlideComponent.prototype.onShare = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERNET], 'Needed for sharing files').then(function () {
            try {
                var uris = new java.util.ArrayList();
                var filesToBeAttached = '';
                var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
                var imgFileNameOrg = _this.imageFileList[_this.imgNext].fileName;
                imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                var newFile = new java.io.File(imagePath, imgFileNameOrg);
                var uri = _this.transformedImageProvider.getURIForFile(newFile);
                uris.add(uri);
                uris.add(_this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                // uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                // let logFileName = imgFileNameOrg.replace('thumb_PT_IMG', 'LogcatPT_IMG');
                if (_this.transformedImageProvider.isLogEnabled) {
                    var logFileName = 'Logcat' + imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.txt';
                    var logFilePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/oelog', '.');
                    var logFile = new java.io.File(logFilePath, logFileName);
                    var logFileUri = _this.transformedImageProvider.getURIForFile(logFile);
                    uris.add(logFileUri);
                }
                filesToBeAttached = filesToBeAttached.concat(',' + _this.imageFileList[_this.imgNext].filePath);
                if (uris.size() > 0) {
                    var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType('*/*');
                    var message = 'Perspective correction pictures¬†:¬†' + filesToBeAttached + '.';
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Share image(s)...'));
                }
            }
            catch (error) {
                Toast.makeText(nativescript_localize_1.localize('error_while_sending_mail') + error).show();
                _this.logger.error('Error while sending mail. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission') + error).show();
            _this.logger.error('Error in giving permission. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Deletes the selected image(s) when user clicks the 'delete' button in menu.
     * This will show up a dialog window for confirmation for the selected image(s)
     * to be deleted. If user says 'Ok', then those image(s) will be removed from the
     * device, otherwise can be cancelled.
     *
     * @param args any boject
     */
    ImageSlideComponent.prototype.onDelete = function (args) {
        var _this = this;
        dialogs.confirm({
            title: nativescript_localize_1.localize('delete'),
            message: nativescript_localize_1.localize('deleting_selected_item'),
            okButtonText: nativescript_localize_1.localize('ok'),
            cancelButtonText: nativescript_localize_1.localize('cancel'),
        }).then(function (result) {
            if (result) {
                if (_this.imageFileList.length > 0) {
                    _this.dragImageItem.translateX = 0;
                    _this.dragImageItem.translateY = 0;
                    _this.dragImageItem.scaleX = 1;
                    _this.dragImageItem.scaleY = 1;
                    var file = file_system_1.File.fromPath(_this.imageFileList[_this.imgNext].filePath);
                    file.remove()
                        .then(function () {
                        var thumbnailFile = file_system_1.File.fromPath(_this.imageFileList[_this.imgNext].thumbnailPath);
                        thumbnailFile.remove()
                            .then(function () {
                            transformedimage_provider_1.SendBroadcastImage(_this.imageFileList[_this.imgNext].thumbnailPath);
                            _this.imageFileList.splice(_this.imgNext, 1);
                            var slicedImages = _this.imageUrlList.slice(0, _this.imgNext);
                            var slicedImages0 = _this.imageUrlList.slice(_this.imgNext + 1, _this.imageUrlList.length);
                            var imgNextOld = _this.imgNext;
                            _this.imageUrlList.splice(0, _this.imageUrlList.length);
                            viewModel.set('imageUrlList', _this.imageUrlList);
                            _this.page.bindingContext = viewModel;
                            slicedImages.forEach(function (img) {
                                _this.imageUrlList.push(img);
                            });
                            slicedImages0.forEach(function (img) {
                                _this.imageUrlList.push(img);
                            });
                            _this.isDeleted = true;
                            Toast.makeText(nativescript_localize_1.localize('selected_image_deleted')).show();
                            if (_this.imageFileList.length > 0) {
                                if ((_this.imageFileList.length) <= _this.imgNext.valueOf()) {
                                    _this.imgNext = 0;
                                }
                                else {
                                    if (imgNextOld.valueOf() == 0) {
                                        _this.pageNumber = 1;
                                        viewModel.set('pageNumber', 1);
                                    }
                                    else {
                                        _this.pageNumber = _this.imgNext;
                                        viewModel.set('pageNumber', _this.imgNext);
                                    }
                                }
                                _this.imageSource = _this.imageFileList[_this.imgNext].filePath;
                                viewModel.set('imageUrlList', _this.imageUrlList);
                                _this.page.bindingContext = viewModel;
                            }
                            else {
                                _this.imageUrlList = _this.imageUrlList;
                                viewModel.set('imageUrlList', _this.imageUrlList);
                                _this.page.bindingContext = viewModel;
                                _this.imageSource = null;
                                _this.isDeleting = false;
                                _this.isSharing = false;
                                Toast.makeText(nativescript_localize_1.localize('no_image_available')).show();
                            }
                        }).catch(function (error) {
                            Toast.makeText(nativescript_localize_1.localize('error_while_deleting_thumbnail_image')
                                + error.stack, 'long').show();
                            _this.logger.error('Error while deleting thumbnail image.. ' + module.filename
                                + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }).catch(function (error) {
                        Toast.makeText(nativescript_localize_1.localize('error_while_deleting_original_image') + error.stack, 'long').show();
                        _this.logger.error('Error while deleting original image. ' + module.filename
                            + _this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                }
                else {
                    _this.imageSource = null;
                    _this.isDeleting = false;
                    _this.isSharing = false;
                    Toast.makeText(nativescript_localize_1.localize('no_image_available')).show();
                }
            }
        });
    };
    var _a, _b;
    __decorate([
        core_1.ViewChild('imgSlideId', { static: true }),
        __metadata("design:type", core_1.ElementRef)
    ], ImageSlideComponent.prototype, "_dragImage", void 0);
    ImageSlideComponent = __decorate([
        core_1.Component({
            selector: 'ns-imageslide',
            moduleId: module.id,
            styleUrls: ['./imageslide.component.css'],
            templateUrl: './imageslide.component.html',
        }),
        __metadata("design:paramtypes", [page_1.Page,
            router_2.RouterExtensions,
            router_1.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" ? _a : Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" ? _b : Object])
    ], ImageSlideComponent);
    return ImageSlideComponent;
}());
exports.ImageSlideComponent = ImageSlideComponent;
