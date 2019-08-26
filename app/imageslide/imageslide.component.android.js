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
            this.startScale = this.dragImageItem.scaleX;
            this.isPinchSelected = true;
        }
        else if (args.scale && args.scale !== 1) {
            this.newScale = this.startScale * args.scale;
            this.newScale = Math.min(15, this.newScale);
            this.newScale = Math.max(0.1, this.newScale);
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
            curve: 'easeIn',
            duration: 10,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlc2xpZGUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUU7QUFDekUsMENBQWlEO0FBRWpELDREQUFvRDtBQUNwRCw4REFBNEQ7QUFDNUQsaURBQWdEO0FBS2hELHNEQUErRDtBQUUvRCxxREFBOEM7QUFDOUMsdURBQXNEO0FBQ3RELG9GQUFzRztBQUV0RywwREFBNEQ7QUFDNUQscURBQXVEO0FBRXZELDBDQUE0QztBQUU1QyxzREFBd0Q7QUFFeEQ7O0dBRUc7QUFPSCxJQUFhLG1CQUFtQjtJQXNDNUI7Ozs7OztPQU1HO0lBQ0gsNkJBQ1ksSUFBVSxFQUNWLGdCQUFrQyxFQUNsQyxLQUFxQixFQUNyQix3QkFBa0QsRUFDbEQsTUFBb0IsRUFDcEIsTUFBUztRQU5yQixpQkFXQztRQVZXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQixXQUFNLEdBQU4sTUFBTSxDQUFHO1FBNUJyQixtQ0FBbUM7UUFDM0IsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUN2QixzREFBc0Q7UUFDOUMsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUNyQixrREFBa0Q7UUFDMUMsb0JBQWUsR0FBRyxLQUFLLENBQUM7UUFDaEMsNkNBQTZDO1FBQ3JDLGtCQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQixxRUFBcUU7UUFDN0QseUJBQW9CLEdBQUcsS0FBSyxDQUFDO1FBa0JqQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFT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QUM7d0JBQzFHLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHVDQUF1QyxHQUFHLE1BQU0sQ0FBQyxRQUFROzhCQUN6RSxLQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDO29CQUMvQyxDQUFDLENBQUMsQ0FBQztnQkFDWCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEtBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO29CQUN4QixLQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztvQkFDeEIsS0FBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7b0JBQ3ZCLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUN2RSxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FBQyxBQXhYRCxJQXdYQztBQWhYNEI7SUFBeEIsZ0JBQVMsQ0FBQyxZQUFZLENBQUM7OEJBQWEsaUJBQVU7dURBQUM7QUFSdkMsbUJBQW1CO0lBTi9CLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsNEJBQTRCLENBQUM7UUFDekMsV0FBVyxFQUFFLDZCQUE2QjtLQUM3QyxDQUFDO3FDQStDb0IsV0FBSTtRQUNRLHlCQUFnQjtRQUMzQix1QkFBYyxzQkFDSyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQW5EWixtQkFBbUIsQ0F3WC9CO0FBeFhZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcblxuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhLCBTd2lwZUdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9pbWFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKsKgYXPCoGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICrCoGFzwqBkaWFsb2dzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9ncyc7XG5cbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbi8qKlxuICogSW1hZ2VTbGlkZUNvbXBvbmVudCBpcyB1c2VkIHRvIHNob3cgaW1hZ2UgaW4gZGV0YWlsIHZpZXcsIHdoZXJlIHVzZXIgY2FuIHpvb20taW4vb3V0LlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWltYWdlc2xpZGUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlc2xpZGUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZVNsaWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogIFVzZWQgdG8gc3RvcmUgaW1hZ2Ugc291cmNlIGFuZCBhbHNvIHVzZWQgaW4gR1VJICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcbiAgICAvKiogIFRvIGluZGljYXRlIHRoZSBzaGFyaW5nIG1lbnUgaXMgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwdWJsaWMgaXNTaGFyaW5nOiBib29sZWFuO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB0aGUgZGVsZXRpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBDaGlsZCBlbGVtZW50IHJlZmVycmVuY2UgKi9cbiAgICBAVmlld0NoaWxkKCdpbWdTbGlkZUlkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcbiAgICAvKiogSW1hZ2UgVVJJICovXG4gICAgcHJpdmF0ZSBpbWdVUkk6IHN0cmluZztcbiAgICAvKiogSW1hZ2UgaW5kZXggYmVpbmcgdXNlZCB0byBnZXQgYW4gaW1hZ2UgZm9yIHRoZSBnaXZlbiBpbmRleCAqL1xuICAgIHByaXZhdGUgaW1nSW5kZXg6IG51bWJlcjtcbiAgICAvKiogSW1hZ2UgcmVmZXJyZW5jZSBmcm9tIF9kcmFnSW1hZ2UgKi9cbiAgICBwcml2YXRlIGRyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVggdmFsdWUgKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVg6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgcHJldmlvdXMgZGVsdGFZIHZhbHVlICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgZmlsZSBwYXRoIGluZm9ybWF0aW9uICovXG4gICAgcHJpdmF0ZSBpbWFnZUZpbGVMaXN0OiBhbnlbXTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgbmV4dCBpbmRleCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgaW1nTmV4dDogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBpbml0aWFsIHNjYWxlIHZhbHVlICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogQ29udGFpbnMgbmV3IHNjYWxlIHZhbHVlIHdoaWxlIG1vdmluZyB0aGUgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG5ld1NjYWxlID0gMTtcbiAgICAvKiogVG8gaW5kaWNhdGUgd2hldGhlciBwaW5jaCBpcyB0cmlnZ2VyIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgLyoqIFRvIHN0b3JlIG9sZCBUcmFuc2xhdGVYIHZhbHVlIG9mIGltYWdlICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVkgdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgIC8qKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuXG4gICAgLyoqXG4gICAgICogSW1hZ2VTbGlkZUNvbXBvbmVudCBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gcGFnZSBQYWdlXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyRXh0ZW5zaW9uc1xuICAgICAqIEBwYXJhbSByb3V0ZSBBY3RpdmF0ZWRSb3V0ZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgdGhpcy5yb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUoKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBwYXJhbXNbJ2ltZ1VSSSddO1xuICAgICAgICAgICAgdGhpcy5pbWdJbmRleCA9IHBhcmFtc1snaW1nSW5kZXgnXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHBhZ2UgcHJvcGVydGllcyBsaWtlIG1lbnVzICgnZGVsZXRlJy8nc2hhcmUnKSBhbmQgdGhlIGltYWdlXG4gICAgICogcHJvcGVydGllcyBsaWtlIHRyYW5zbGF0ZVgvdHJhbnNsYXRlWS9zY2FsZVgvc2NhbGVZLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmltZ05leHQgPSB0aGlzLmltZ0luZGV4O1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0ID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0gPSB0aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudCBhcyBJbWFnZTtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2Ugd2hlbiB0aGUgYmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgUGluY2hHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydFNjYWxlID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWDtcbiAgICAgICAgICAgIHRoaXMuaXNQaW5jaFNlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IHRoaXMuc3RhcnRTY2FsZSAqIGFyZ3Muc2NhbGU7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gTWF0aC5taW4oMTUsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMSwgdGhpcy5uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSB0aGlzLm5ld1NjYWxlO1xuXG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0ud2lkdGggPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5oZWlnaHQgPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdXaWR0aCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLmRyYWdJbWFnZUl0ZW0ub3JpZ2luWDtcbiAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLmRyYWdJbWFnZUl0ZW0ub3JpZ2luWTtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgY2VudGVyUG9pbnRYID0gKGNlbnRlclBvaW50WCAqIDIpO1xuICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPCAxNSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPj0gMTUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2xhdGVYVGVtcCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICsgYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWVRlbXAgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArIGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPCB0cmFuc2xhdGVYVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRyYW5zbGF0ZVhUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZIDwgdHJhbnNsYXRlWVRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLm9sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0cmFuc2xhdGVZVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGluY2hTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS5cbiAgICAgKiBBY3R1YWxseSBpdCBicmluZ3MgdGhlIGltYWdlIHRvIGl0J3Mgb3JpZ2luYWwgcG9zaXRpb25zIGFuZCBhbHNvIGFkZHNcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKGFyZ3M6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLmFuaW1hdGUoe1xuICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIHNjYWxlOiB7IHg6IDEsIHk6IDEgfSxcbiAgICAgICAgICAgIGN1cnZlOiAnZWFzZUluJyxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYWdlIGxvYWRlZCBtZXRob2Qgd2hpY2ggaXMgYmVlbiBjYWxsZWQgd2hlbiBpbWFnZXNsaWRlIHBhZ2UgaXMgbG9hZGVkLFxuICAgICAqIHdoZXJlIGl0IHNldHMgdGhlIHNlbGVjdGVkIGltYWdlIGluIHRoZSBzb3VyY2UgZm9yIGRpc3BsYXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBhbnkgb2JqZWN0XG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nSW5kZXhdLmZpbGVQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoZSBpbWFnZSBsZWZ0L3JpZ2h0IHdoaWxlIHN3aXBlIHdpdGggYSBmaW5ndXJlLiBBY3R1YWxseSB3aGVuIGEgZmluZ2VyIGlzIHN3aXBlZFxuICAgICAqIGl0IGNoZWNrcyB0aGF0IHRoZSBzd2lwZSBpcyByaWdodCBkaXJlY3Qgb3IgbGVmdCBkaXJlY3Rpb24sIGJhc2VkIG9uIHRoYXQgaXQgcHVsbHMgdGhlIGltYWdlIGZyb21cbiAgICAgKiB0aGUgaW1hZ2UgbGlzdCBhbmQgZGlzcGxheSBpdCBpbiB2aWV3LiBBZnRlciB0aGF0LCBpdCBzZXRzIHRoZSBpbWFnZSBpbiBkZWZhdWx0IHBvc2l0aW9uIGJ5IGNhbGxpbmdcbiAgICAgKiBvbkRvdWJsZVRhcCBtZXRob2QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBTd2lwZUdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvblN3aXBlKGFyZ3M6IFN3aXBlR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBpZiAodGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9PT0gMSAmJiB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDIgfHwgIWFyZ3MuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0Kys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8PSAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8IDAgfHwgdGhpcy5pbWdOZXh0ID49IHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0ID0gKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW1nSW5kZXggPSB0aGlzLmltZ05leHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdub19pbWFnZV9hdmFpbGFibGUnKSkuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIG9yaWdpbmFsIGltYWdlLlxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICogQHJldHVybnMgaW1hZ2UgdXJpXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgcmV0dXJuIHVyaTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBTaGFyZXMgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgc2hhcmUgYnV0dG9uLiBUaGUgc2hhcmluZyBjYW4gYmUgZG9uZVxuICAgICAqIHZpYSBhbnkgb25lIG9mIHRoZSBtZWRpYXMgc3VwcG9ydGVkIGJ5IGFuZHJvaWQgZGV2aWNlIGJ5IGRlZmF1bHQuIFRoZSBsaXN0IG9mIHN1cHBvcnRlZFxuICAgICAqIG1lZGlhcyB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2hhcmUgYnV0dG9uIGNsaWNrZWQuXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLklOVEVSTkVUXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXNUb0JlQXR0YWNoZWQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2UoaW1nRmlsZU5hbWVPcmcpKTtcbiAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUoaW1nRmlsZU5hbWVPcmcpKTtcblxuICAgICAgICAgICAgICAgICAgICBmaWxlc1RvQmVBdHRhY2hlZCA9IGZpbGVzVG9CZUF0dGFjaGVkLmNvbmNhdCgnLCcgKyB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmlzLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1NFTkRfTVVMVElQTEUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldFR5cGUoJ2ltYWdlL2pwZWcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlc8KgOsKgJyArIGZpbGVzVG9CZUF0dGFjaGVkICsgJy4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1VCSkVDVCwgJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXMuLi4nKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dFBhcmNlbGFibGVBcnJheUxpc3RFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NUUkVBTSwgdXJpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9URVhULCBtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1dSSVRFX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfQUNUSVZJVFlfTkVXX1RBU0spO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc3RhcnRBY3Rpdml0eShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LmNyZWF0ZUNob29zZXIoaW50ZW50LCAnU2VuZCBtYWlsLi4uJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9zZW5kaW5nX21haWwnKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBzZW5kaW5nIG1haWwuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2l2aW5nX3Blcm1pc3Npb24nKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSAnZGVsZXRlJyBidXR0b24gaW4gbWVudS5cbiAgICAgKiBUaGlzIHdpbGwgc2hvdyB1cCBhIGRpYWxvZyB3aW5kb3cgZm9yIGNvbmZpcm1hdGlvbiBmb3IgdGhlIHNlbGVjdGVkIGltYWdlKHMpXG4gICAgICogdG8gYmUgZGVsZXRlZC4gSWYgdXNlciBzYXlzICdPaycsIHRoZW4gdGhvc2UgaW1hZ2Uocykgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGV2aWNlLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIGFueSBib2plY3RcbiAgICAgKi9cbiAgICBvbkRlbGV0ZShhcmdzOiBhbnkpIHtcbiAgICAgICAgZGlhbG9ncy5jb25maXJtKHtcbiAgICAgICAgICAgIHRpdGxlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RlbGV0ZScpLFxuICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkZWxldGluZ19zZWxlY3RlZF9pdGVtJyksXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnb2snKSxcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnY2FuY2VsJyksXG4gICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSAxO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWxGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZSh0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VGaWxlTGlzdC5zcGxpY2UodGhpcy5pbWdOZXh0LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc2VsZWN0ZWRfaW1hZ2VfZGVsZXRlZCcpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA8PSB0aGlzLmltZ05leHQudmFsdWVPZigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ25vX2ltYWdlX2F2YWlsYWJsZScpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLm9uU3dpcGUoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ190aHVtYm5haWxfaW1hZ2UnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyBlcnJvci5zdGFjaywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9kZWxldGluZ19vcmlnaW5hbF9pbWFnZScpICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdub19pbWFnZV9hdmFpbGFibGUnKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19