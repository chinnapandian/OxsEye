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
var router_1 = require("@angular/router");
var file_system_1 = require("tns-core-modules/file-system");
var image_source_1 = require("tns-core-modules/image-source");
var page_1 = require("tns-core-modules/ui/page");
var router_2 = require("nativescript-angular/router");
var angular_1 = require("nativescript-i18n/angular");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
/**
 * ImageSlideComponent is used to show image in detail view, where user can zoom-in/out.
 */
var ImageSlideComponent = (function () {
    /**
     * ImageSlideComponent constructor.
     * @param page Page
     * @param routerExtensions RouterExtensions
     * @param route ActivatedRoute
     * @param transformedImageProvider TransformedImageProvider
     */
    function ImageSlideComponent(page, routerExtensions, route, transformedImageProvider, logger, locale) {
        var _this = this;
        this.page = page;
        this.routerExtensions = routerExtensions;
        this.route = route;
        this.transformedImageProvider = transformedImageProvider;
        this.logger = logger;
        this.locale = locale;
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
        this.imgNext = this.imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new image_source_1.ImageSource();
        this.imageFileList = this.transformedImageProvider.imageList;
        this.dragImageItem = this._dragImage.nativeElement;
        this.dragImageItem.translateX = 0;
        this.dragImageItem.translateY = 0;
        this.dragImageItem.scaleX = 1;
        this.dragImageItem.scaleY = 1;
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
        if (args.state === 1) {
            console.log('args.state == 1');
            this.startScale = this.dragImageItem.scaleX;
            this.isPinchSelected = true;
        }
        else if (args.scale && args.scale !== 1) {
            console.log('args.state !== 1');
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(8, this.newScale);
            this.newScale = Math.max(0.125, this.newScale);
            this.dragImageItem.scaleX = this.newScale;
            this.dragImageItem.scaleY = this.newScale;
            this.dragImageItem.width = this.dragImageItem.getMeasuredWidth() * this.newScale;
            this.dragImageItem.height = this.dragImageItem.getMeasuredHeight() * this.newScale;
        }
        //     let item = this.dragImageItem;
        //     if (args.state === 1) {
        //         this.isPinchSelected = true;
        //     const newOriginX = args.getFocusX() - item.translateX;
        //     const newOriginY = args.getFocusY() - item.translateY;
        //     const oldOriginX = item.originX * item.getMeasuredWidth();
        //     const oldOriginY = item.originY * item.getMeasuredHeight();
        //     item.translateX += (oldOriginX - newOriginX) * (1 - item.scaleX);
        //     item.translateY += (oldOriginY - newOriginY) * (1 - item.scaleY);
        //     item.originX = newOriginX / item.getMeasuredWidth();
        //     item.originY = newOriginY / item.getMeasuredHeight();
        //     this.startScale = item.scaleX;
        // }
        // else if (args.scale && args.scale !== 1) {
        //     let newScale = this.startScale * args.scale;
        //     newScale = Math.min(8, newScale);
        //     newScale = Math.max(0.125, newScale);
        //     item.scaleX = newScale;
        //     item.scaleY = newScale;
        // }
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
        //     let item = this.dragImageItem;
        //     if (args.state === 1) {
        //     this.prevDeltaX = 0;
        //     this.prevDeltaY = 0;
        // }
        // else if (args.state === 2) {
        //     item.translateX += args.deltaX - this.prevDeltaX;
        //     item.translateY += args.deltaY - this.prevDeltaY;
        //     this.prevDeltaX = args.deltaX;
        //     this.prevDeltaY = args.deltaY;
        // }
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
            // let screenLocation = this.dragImageItem.getLocationOnScreen();
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
        if (this.imageFileList.length > 0) {
            this.imageSource = this.imageFileList[this.imgIndex].filePath;
        }
        this.oldTranslateY = 0;
        this.oldTranslateX = 0;
        // this.dragImageItem.translateX = 0;
        // this.dragImageItem.translateY = 0;
        // this.dragImageItem.scaleX = 1;
        // this.dragImageItem.scaleY = 1;
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
        if (this.dragImageItem.scaleX === 1 && this.dragImageItem.scaleY === 1) {
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
                Toast.makeText(this.locale.transform('no_image_available')).show();
            }
            this.onDoubleTap(args);
        }
    };
    // /**
    //  * Gets original image.
    //  * @param transformedImage
    //  * @returns image uri
    //  */
    // private getOriginalImage(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
    //     let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
    //     imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider',
    //     uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     return uri;
    // }
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
                // const uri = android.support.v4.content.FileProvider.getUriForFile(
                //     application.android.context, 'oxs.eye.fileprovider', newFile);
                // application.android.context.grantUriPermission(
                //     'oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                var uri = _this.transformedImageProvider.getURIForFile(newFile);
                uris.add(uri);
                uris.add(_this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                uris.add(_this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                filesToBeAttached = filesToBeAttached.concat(',' + _this.imageFileList[_this.imgNext].filePath);
                if (uris.size() > 0) {
                    var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType('image/jpeg');
                    var message = 'Perspective correction pictures : ' + filesToBeAttached + '.';
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Send mail...'));
                }
            }
            catch (error) {
                Toast.makeText(_this.locale.transform('error_while_sending_mail') + error).show();
                _this.logger.error('Error while sending mail. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            Toast.makeText(_this.locale.transform('error_while_giving_permission') + error).show();
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
            title: this.locale.transform('delete'),
            message: this.locale.transform('deleting_selected_item'),
            okButtonText: this.locale.transform('ok'),
            cancelButtonText: this.locale.transform('cancel'),
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
                            Toast.makeText(_this.locale.transform('selected_image_deleted')).show();
                            if (_this.imageFileList.length > 0) {
                                if (_this.imageFileList.length <= _this.imgNext.valueOf()) {
                                    _this.imgNext = 0;
                                }
                                _this.imageSource = _this.imageFileList[_this.imgNext].filePath;
                            }
                            else {
                                _this.imageSource = null;
                                _this.isDeleting = false;
                                _this.isSharing = false;
                                Toast.makeText(_this.locale.transform('no_image_available')).show();
                            }
                            // this.onSwipe(args);
                        }).catch(function (error) {
                            Toast.makeText(_this.locale.transform('error_while_deleting_thumbnail_image')
                                + error.stack, 'long').show();
                            _this.logger.error('Error while deleting thumbnail image. ' + module.filename
                                + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }).catch(function (error) {
                        Toast.makeText(_this.locale.transform('error_while_deleting_original_image') + error.stack, 'long').show();
                        _this.logger.error('Error while deleting original image. ' + module.filename
                            + _this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                }
                else {
                    _this.imageSource = null;
                    _this.isDeleting = false;
                    _this.isSharing = false;
                    Toast.makeText(_this.locale.transform('no_image_available')).show();
                }
            }
        });
    };
    return ImageSlideComponent;
}());
__decorate([
    core_1.ViewChild('imgSlideId'),
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
        router_1.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object, angular_1.L])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlc2xpZGUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUU7QUFDekUsMENBQWlEO0FBRWpELDREQUFvRDtBQUNwRCw4REFBNEQ7QUFDNUQsaURBQWdEO0FBS2hELHNEQUErRDtBQUUvRCxxREFBOEM7QUFDOUMsdURBQXNEO0FBQ3RELG9GQUFzRztBQUV0RywwREFBNEQ7QUFDNUQscURBQXVEO0FBRXZELDBDQUE0QztBQUU1QyxzREFBd0Q7QUFFeEQ7O0dBRUc7QUFPSCxJQUFhLG1CQUFtQjtJQXVDNUI7Ozs7OztPQU1HO0lBQ0gsNkJBQ1ksSUFBVSxFQUNWLGdCQUFrQyxFQUNsQyxLQUFxQixFQUNyQix3QkFBa0QsRUFDbEQsTUFBb0IsRUFDcEIsTUFBUztRQU5yQixpQkFXQztRQVZXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixXQUFNLEdBQU4sTUFBTSxDQUFHO1FBN0JyQixtQ0FBbUM7UUFDM0IsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUN2QixzREFBc0Q7UUFDOUMsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNyQixrREFBa0Q7UUFDMUMsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDaEMsNkNBQTZDO1FBQ3JDLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQixxRUFBcUU7UUFDN0QseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBbUJqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFT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RUFBRSxDQUFDO2dCQUN2RSxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FBQyxBQXRhRCxJQXNhQztBQTlaNEI7SUFBeEIsZ0JBQVMsQ0FBQyxZQUFZLENBQUM7OEJBQWEsaUJBQVU7dURBQUM7QUFSdkMsbUJBQW1CO0lBTi9CLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsNEJBQTRCLENBQUM7UUFDekMsV0FBVyxFQUFFLDZCQUE2QjtLQUM3QyxDQUFDO3FDQWdEb0IsV0FBSTtRQUNRLHlCQUFnQjtRQUMzQix1QkFBYyxzQkFDSyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQXBEWixtQkFBbUIsQ0FzYS9CO0FBdGFZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcblxuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhLCBTd2lwZUdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9pbWFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKsKgYXPCoGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICrCoGFzwqBkaWFsb2dzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9ncyc7XG5cbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbi8qKlxuICogSW1hZ2VTbGlkZUNvbXBvbmVudCBpcyB1c2VkIHRvIHNob3cgaW1hZ2UgaW4gZGV0YWlsIHZpZXcsIHdoZXJlIHVzZXIgY2FuIHpvb20taW4vb3V0LlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWltYWdlc2xpZGUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlc2xpZGUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZVNsaWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogIFVzZWQgdG8gc3RvcmUgaW1hZ2Ugc291cmNlIGFuZCBhbHNvIHVzZWQgaW4gR1VJICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcbiAgICAvKiogIFRvIGluZGljYXRlIHRoZSBzaGFyaW5nIG1lbnUgaXMgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwdWJsaWMgaXNTaGFyaW5nOiBib29sZWFuO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB0aGUgZGVsZXRpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBDaGlsZCBlbGVtZW50IHJlZmVycmVuY2UgKi9cbiAgICBAVmlld0NoaWxkKCdpbWdTbGlkZUlkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcbiAgICAvKiogSW1hZ2UgVVJJICovXG4gICAgcHJpdmF0ZSBpbWdVUkk6IHN0cmluZztcbiAgICAvKiogSW1hZ2UgaW5kZXggYmVpbmcgdXNlZCB0byBnZXQgYW4gaW1hZ2UgZm9yIHRoZSBnaXZlbiBpbmRleCAqL1xuICAgIHByaXZhdGUgaW1nSW5kZXg6IG51bWJlcjtcbiAgICAvKiogSW1hZ2UgcmVmZXJyZW5jZSBmcm9tIF9kcmFnSW1hZ2UgKi9cbiAgICBwcml2YXRlIGRyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVggdmFsdWUgKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVg6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgcHJldmlvdXMgZGVsdGFZIHZhbHVlICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgZmlsZSBwYXRoIGluZm9ybWF0aW9uICovXG4gICAgcHJpdmF0ZSBpbWFnZUZpbGVMaXN0OiBhbnlbXTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgbmV4dCBpbmRleCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgaW1nTmV4dDogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBpbml0aWFsIHNjYWxlIHZhbHVlICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogQ29udGFpbnMgbmV3IHNjYWxlIHZhbHVlIHdoaWxlIG1vdmluZyB0aGUgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG5ld1NjYWxlID0gMTtcbiAgICAvKiogVG8gaW5kaWNhdGUgd2hldGhlciBwaW5jaCBpcyB0cmlnZ2VyIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgLyoqIFRvIHN0b3JlIG9sZCBUcmFuc2xhdGVYIHZhbHVlIG9mIGltYWdlICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVkgdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgIC8qKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuICAgIFxuXG4gICAgLyoqXG4gICAgICogSW1hZ2VTbGlkZUNvbXBvbmVudCBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gcGFnZSBQYWdlXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyRXh0ZW5zaW9uc1xuICAgICAqIEBwYXJhbSByb3V0ZSBBY3RpdmF0ZWRSb3V0ZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgdGhpcy5yb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUoKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBwYXJhbXNbJ2ltZ1VSSSddO1xuICAgICAgICAgICAgdGhpcy5pbWdJbmRleCA9IHBhcmFtc1snaW1nSW5kZXgnXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHBhZ2UgcHJvcGVydGllcyBsaWtlIG1lbnVzICgnZGVsZXRlJy8nc2hhcmUnKSBhbmQgdGhlIGltYWdlXG4gICAgICogcHJvcGVydGllcyBsaWtlIHRyYW5zbGF0ZVgvdHJhbnNsYXRlWS9zY2FsZVgvc2NhbGVZLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmltZ05leHQgPSB0aGlzLmltZ0luZGV4O1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0ID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0gPSB0aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudCBhcyBJbWFnZTtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2Ugd2hlbiB0aGUgYmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgUGluY2hHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FyZ3Muc3RhdGUgPT0gMScpO1xuICAgICAgICAgICAgdGhpcy5zdGFydFNjYWxlID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWDtcbiAgICAgICAgICAgIHRoaXMuaXNQaW5jaFNlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FyZ3Muc3RhdGUgIT09IDEnKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWluKDgsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMTI1LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IHRoaXMubmV3U2NhbGU7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS53aWR0aCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLmhlaWdodCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgfVxuXG4gICAgLy8gICAgIGxldCBpdGVtID0gdGhpcy5kcmFnSW1hZ2VJdGVtO1xuICAgIC8vICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgIC8vICAgICAgICAgdGhpcy5pc1BpbmNoU2VsZWN0ZWQgPSB0cnVlO1xuICAgIC8vICAgICBjb25zdCBuZXdPcmlnaW5YID0gYXJncy5nZXRGb2N1c1goKSAtIGl0ZW0udHJhbnNsYXRlWDtcbiAgICAvLyAgICAgY29uc3QgbmV3T3JpZ2luWSA9IGFyZ3MuZ2V0Rm9jdXNZKCkgLSBpdGVtLnRyYW5zbGF0ZVk7XG5cbiAgICAvLyAgICAgY29uc3Qgb2xkT3JpZ2luWCA9IGl0ZW0ub3JpZ2luWCAqIGl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgIC8vICAgICBjb25zdCBvbGRPcmlnaW5ZID0gaXRlbS5vcmlnaW5ZICogaXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpO1xuXG4gICAgLy8gICAgIGl0ZW0udHJhbnNsYXRlWCArPSAob2xkT3JpZ2luWCAtIG5ld09yaWdpblgpICogKDEgLSBpdGVtLnNjYWxlWCk7XG4gICAgLy8gICAgIGl0ZW0udHJhbnNsYXRlWSArPSAob2xkT3JpZ2luWSAtIG5ld09yaWdpblkpICogKDEgLSBpdGVtLnNjYWxlWSk7XG5cbiAgICAvLyAgICAgaXRlbS5vcmlnaW5YID0gbmV3T3JpZ2luWCAvIGl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgIC8vICAgICBpdGVtLm9yaWdpblkgPSBuZXdPcmlnaW5ZIC8gaXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpO1xuXG4gICAgLy8gICAgIHRoaXMuc3RhcnRTY2FsZSA9IGl0ZW0uc2NhbGVYO1xuICAgIC8vIH1cblxuICAgIC8vIGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgIC8vICAgICBsZXQgbmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgIC8vICAgICBuZXdTY2FsZSA9IE1hdGgubWluKDgsIG5ld1NjYWxlKTtcbiAgICAvLyAgICAgbmV3U2NhbGUgPSBNYXRoLm1heCgwLjEyNSwgbmV3U2NhbGUpO1xuXG4gICAgLy8gICAgIGl0ZW0uc2NhbGVYID0gbmV3U2NhbGU7XG4gICAgLy8gICAgIGl0ZW0uc2NhbGVZID0gbmV3U2NhbGU7XG4gICAgLy8gfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwYW4vbW92ZSBtZXRob2QsIHdoaWNoIG1vdmVzIGltYWdlIHdoZW4gdXNlciBwcmVzcyAmIGRyYWcgd2l0aCBhIGZpbmdlciBhcm91bmRcbiAgICAgKiB0aGUgaW1hZ2UgYXJlYS4gSGVyZSB0aGUgaW1hZ2UncyB0cmFsYXRlWC90cmFuc2xhdGVZIHZhbHVlcyBhcmUgYmVlbiBjYWxjdWxhdGVkXG4gICAgICogYmFzZWQgb24gdGhlIGltYWdlJ3Mgc2NhbGUsIHdpZHRoICYgaGVpZ2h0LiBBbmQgYWxzbyBpdCB0YWtlcyBjYXJlIG9mIGltYWdlIGJvdW5kYXJ5XG4gICAgICogY2hlY2tpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBQYW5HZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgIC8vICAgICBsZXQgaXRlbSA9IHRoaXMuZHJhZ0ltYWdlSXRlbTtcbiAgICAvLyAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAvLyAgICAgdGhpcy5wcmV2RGVsdGFYID0gMDtcbiAgICAvLyAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAvLyB9XG4gICAgLy8gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgIC8vICAgICBpdGVtLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgLy8gICAgIGl0ZW0udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcblxuICAgIC8vICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAvLyAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG4gICAgLy8gfVxuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICBsZXQgY2VudGVyUG9pbnRZID0gKHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpIC8gNCkgKiAodGhpcy5uZXdTY2FsZSk7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuZHJhZ0ltYWdlSXRlbS5vcmlnaW5YO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuZHJhZ0ltYWdlSXRlbS5vcmlnaW5ZO1xuXG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG4gICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA8IDE1KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uID0gc2NyZWVuTG9jYXRpb247XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueCkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WCAtIGltYWdlVmlld1dpZHRoKSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVYID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdGhpcy5vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFkgLSBpbWFnZVZpZXdIZWlnaHQpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLm9sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA+PSAxNSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVhUZW1wID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggKyBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2xhdGVZVGVtcCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZICsgYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA8IHRyYW5zbGF0ZVhUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdGhpcy5vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdHJhbnNsYXRlWFRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVkgPCB0cmFuc2xhdGVZVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRyYW5zbGF0ZVlUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRG91YmxlIHRhcCBtZXRob2QgZmlyZXMgb24gd2hlbiB1c2VyIHRhcHMgdHdvIHRpbWVzIG9uIHRyYW5zZm9ybWVkIGltYWdlLlxuICAgICAqIEFjdHVhbGx5IGl0IGJyaW5ncyB0aGUgaW1hZ2UgdG8gaXQncyBvcmlnaW5hbCBwb3NpdGlvbnMgYW5kIGFsc28gYWRkc1xuICAgICAqIGNpcmNsZSBwb2ludHMgaWYgaXQgaXMgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoYXJnczogR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgY3VydmU6ICdlYXNlT3V0JyxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAzMDAsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5ld1NjYWxlID0gMTtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gaW1hZ2VzbGlkZSBwYWdlIGlzIGxvYWRlZCxcbiAgICAgKiB3aGVyZSBpdCBzZXRzIHRoZSBzZWxlY3RlZCBpbWFnZSBpbiB0aGUgc291cmNlIGZvciBkaXNwbGF5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IG9iamVjdFxuICAgICAqL1xuICAgIHBhZ2VMb2FkZWQoYXJnczogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAvLyB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIC8vIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgLy8gdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgIC8vIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBzd2lwZSB3aXRoIGEgZmluZ3VyZS4gQWN0dWFsbHkgd2hlbiBhIGZpbmdlciBpcyBzd2lwZWRcbiAgICAgKiBpdCBjaGVja3MgdGhhdCB0aGUgc3dpcGUgaXMgcmlnaHQgZGlyZWN0IG9yIGxlZnQgZGlyZWN0aW9uLCBiYXNlZCBvbiB0aGF0IGl0IHB1bGxzIHRoZSBpbWFnZSBmcm9tXG4gICAgICogdGhlIGltYWdlIGxpc3QgYW5kIGRpc3BsYXkgaXQgaW4gdmlldy4gQWZ0ZXIgdGhhdCwgaXQgc2V0cyB0aGUgaW1hZ2UgaW4gZGVmYXVsdCBwb3NpdGlvbiBieSBjYWxsaW5nXG4gICAgICogb25Eb3VibGVUYXAgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgU3dpcGVHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPT09IDEgJiYgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAyIHx8ICFhcmdzLmRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPD0gMCB8fCB0aGlzLmltZ05leHQgPj0gdGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLmRpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPCAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9ICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmltZ0luZGV4ID0gdGhpcy5pbWdOZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbm9faW1hZ2VfYXZhaWxhYmxlJykpLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub25Eb3VibGVUYXAoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0cyBvcmlnaW5hbCBpbWFnZS5cbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqIEByZXR1cm5zIGltYWdlIHVyaVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcbiAgICAvLyAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgLy8gICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAvLyAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgLy8gICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIHJldHVybiB1cmk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5JTlRFUk5FVF0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpcyA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PGFuZHJvaWQubmV0LlVyaT4oKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVzVG9CZUF0dGFjaGVkID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTScsICcuJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbihcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh1cmkpO1xuICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlKGltZ0ZpbGVOYW1lT3JnKSk7XG4gICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2VXaXRoUmVjdGFuZ2xlKGltZ0ZpbGVOYW1lT3JnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgZmlsZXNUb0JlQXR0YWNoZWQgPSBmaWxlc1RvQmVBdHRhY2hlZC5jb25jYXQoJywnICsgdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJpcy5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudChhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkFDVElPTl9TRU5EX01VTFRJUExFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKCdpbWFnZS9qcGVnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXPCoDrCoCcgKyBmaWxlc1RvQmVBdHRhY2hlZCArICcuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzLi4uJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRQYXJjZWxhYmxlQXJyYXlMaXN0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVFJFQU0sIHVyaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9XUklURV9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnN0YXJ0QWN0aXZpdHkoYW5kcm9pZC5jb250ZW50LkludGVudC5jcmVhdGVDaG9vc2VyKGludGVudCwgJ1NlbmQgbWFpbC4uLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfc2VuZGluZ19tYWlsJykgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJykgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgJ2RlbGV0ZScgYnV0dG9uIGluIG1lbnUuXG4gICAgICogVGhpcyB3aWxsIHNob3cgdXAgYSBkaWFsb2cgd2luZG93IGZvciBjb25maXJtYXRpb24gZm9yIHRoZSBzZWxlY3RlZCBpbWFnZShzKVxuICAgICAqIHRvIGJlIGRlbGV0ZWQuIElmIHVzZXIgc2F5cyAnT2snLCB0aGVuIHRob3NlIGltYWdlKHMpIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAqIGRldmljZSwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBhbnkgYm9qZWN0XG4gICAgICovXG4gICAgb25EZWxldGUoYXJnczogYW55KSB7XG4gICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICB0aXRsZTogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkZWxldGUnKSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGVsZXRpbmdfc2VsZWN0ZWRfaXRlbScpLFxuICAgICAgICAgICAgb2tCdXR0b25UZXh0OiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ29rJyksXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NhbmNlbCcpLFxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlRmlsZUxpc3Quc3BsaWNlKHRoaXMuaW1nTmV4dCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdGVkX2ltYWdlX2RlbGV0ZWQnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPD0gdGhpcy5pbWdOZXh0LnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdub19pbWFnZV9hdmFpbGFibGUnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5vblN3aXBlKGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGh1bWJuYWlsX2ltYWdlJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGVycm9yLnN0YWNrLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ19vcmlnaW5hbF9pbWFnZScpICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnbm9faW1hZ2VfYXZhaWxhYmxlJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==