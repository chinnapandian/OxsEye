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
var oxseyelogger_1 = require("../logger/oxseyelogger");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var dialogs = require("tns-core-modules/ui/dialogs");
var Toast = require("nativescript-toast");
// import * as Permissions from 'nativescript-permissions';
var fs = require("tns-core-modules/file-system");
// import * as frameModule from 'tns-core-modules/ui/frame';
// import * as utilsModule from 'tns-core-modules/utils/utils';
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
                Toast.makeText('No image available.').show();
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
        var dataToShare = {};
        var dataCount = 0;
        var documents = fs.knownFolders.documents();
        try {
            // this.imageFileList.forEach((image) => {
            //     if (image.isSelected) {
            var thumbnailImgFileName = this.imageFileList[this.imgNext].fileName;
            // imgFileNameOrg = thumbnailImgFileName.replace('thumb_PT_IMG', 'PT_IMG');
            var transformedImgFileNameOrg = thumbnailImgFileName.replace('thumb_PT_IMG', 'PT_IMG');
            // let fileName = image.fileName;
            var path = fs.path.join(documents.path, 'capturedimages', transformedImgFileNameOrg);
            // let file = fs.File.fromPath(path);
            var transformedUIImage = UIImage.imageNamed(path);
            dataToShare[dataCount++] = transformedUIImage;
            //Getting original captured image
            var imgFileNameOrg = transformedImgFileNameOrg.replace('PT_IMG', 'IMG');
            imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
            path = fs.path.join(documents.path, 'capturedimages', imgFileNameOrg);
            var transformedUIImageOrg = UIImage.imageNamed(path);
            dataToShare[dataCount++] = transformedUIImageOrg;
            //     }
            // });
            this.transformedImageProvider.share(dataToShare);
            // let activityController = UIActivityViewController.alloc()
            //     .initWithActivityItemsApplicationActivities([dataToShare], null);
            // activityController.setValueForKey('Transformed Image(s)', 'Subject');
            // let presentViewController = activityController.popoverPresentationController;
            // if (presentViewController) {
            //     var page = frameModule.topmost().currentPage;
            //     if (page && page.ios.navigationItem.rightBarButtonItems &&
            //         page.ios.navigationItem.rightBarButtonItems.count > 0) {
            //         presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
            //     } else {
            //         presentViewController.sourceView = page.ios.view;
            //     }
            // }
            // utilsModule.ios.getter(UIApplication, UIApplication.sharedApplication)
            //     .keyWindow
            //     .rootViewController
            //     .presentViewControllerAnimatedCompletion(activityController, true, null);
        }
        catch (error) {
            Toast.makeText('Error while sharing images.' + error).show();
            this.logger.error('Error while sharing images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
        }
        // Permissions.requestPermission(
        //     [android.Manifest.permission.READ_EXTERNAL_STORAGE,
        //     android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
        //     android.Manifest.permission.INTERNET],
        //     'Needed for sharing files').then(() => {
        //         try {
        //             const uris = new java.util.ArrayList<android.net.Uri>();
        //             let filesToBeAttached = '';
        //             const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
        //             let imgFileNameOrg = this.imageFileList[this.imgNext].fileName;
        //             imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
        //             const newFile = new java.io.File(imagePath, imgFileNameOrg);
        //             // const uri = android.support.v4.content.FileProvider.getUriForFile(
        //             //     application.android.context, 'oxs.eye.fileprovider', newFile);
        //             // application.android.context.grantUriPermission(
        //             //     'oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        //             const uri = this.transformedImageProvider.getURIForFile(newFile);
        //             uris.add(uri);
        //             uris.add(this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
        //             uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
        //             filesToBeAttached = filesToBeAttached.concat(',' + this.imageFileList[this.imgNext].filePath);
        //             if (uris.size() > 0) {
        //                 const intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
        //                 intent.setType('image/jpeg');
        //                 const message = 'Perspective correction pictures : ' + filesToBeAttached + '.';
        //                 intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');
        //                 intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
        //                 intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
        //                 intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        //                 intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
        //                 intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
        //                 application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Send mail...'));
        //             }
        //         } catch (error) {
        //             Toast.makeText('Error while sending mail.' + error).show();
        //             this.logger.error('Error while sending mail. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
        //         }
        //     }).catch((error) => {
        //         Toast.makeText('Error in giving permission.' + error).show();
        //         this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
        //     });
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
            title: 'Delete',
            message: 'Deleting selected item(s)...',
            okButtonText: 'Ok',
            cancelButtonText: 'Cancel',
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
                            // SendBroadcastImage(this.imageFileList[this.imgNext].thumbnailPath);
                            _this.imageFileList.splice(_this.imgNext, 1);
                            Toast.makeText('Selected image deleted.').show();
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
                                Toast.makeText('No image available.').show();
                            }
                            // this.onSwipe(args);
                        }).catch(function (error) {
                            Toast.makeText('Error while deleting thumbnail image. ' + error.stack, 'long').show();
                            _this.logger.error('Error while deleting thumbnail image. ' + module.filename
                                + _this.logger.ERROR_MSG_SEPARATOR + error);
                        });
                    }).catch(function (error) {
                        Toast.makeText('Error while deleting original image. ' + error.stack, 'long').show();
                        _this.logger.error('Error while deleting original image. ' + module.filename
                            + _this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                }
                else {
                    _this.imageSource = null;
                    _this.isDeleting = false;
                    _this.isSharing = false;
                    Toast.makeText('No image available.').show();
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
        router_1.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQXlFO0FBQ3pFLDBDQUFpRDtBQUVqRCw0REFBb0Q7QUFDcEQsOERBQTREO0FBRTVELGlEQUFnRDtBQUtoRCxzREFBK0Q7QUFFL0QsdURBQXNEO0FBQ3RELG9GQUFzRztBQUd0RyxxREFBdUQ7QUFFdkQsMENBQTRDO0FBRTVDLDJEQUEyRDtBQUMzRCxpREFBbUQ7QUFDbkQsNERBQTREO0FBQzVELCtEQUErRDtBQUUvRDs7R0FFRztBQU9ILElBQWEsbUJBQW1CO0lBc0M1Qjs7Ozs7O09BTUc7SUFDSCw2QkFDWSxJQUFVLEVBQ1YsZ0JBQWtDLEVBQ2xDLEtBQXFCLEVBQ3JCLHdCQUFrRCxFQUNsRCxNQUFvQjtRQUxoQyxpQkFVQztRQVRXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQTNCaEMsbUNBQW1DO1FBQzNCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdkIsc0RBQXNEO1FBQzlDLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsa0RBQWtEO1FBQzFDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQiw2Q0FBNkM7UUFDckMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIscUVBQXFFO1FBQzdELHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQWlCakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQUMsTUFBTTtZQUNwQyxLQUFJLENBQUMs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QkFDckUsS0FBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDeEIsS0FBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLEtBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUN2QixLQUFLLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQUFDLEFBdGFELElBc2FDO0FBOVo0QjtJQUF4QixnQkFBUyxDQUFDLFlBQVksQ0FBQzs4QkFBYSxpQkFBVTt1REFBQztBQVJ2QyxtQkFBbUI7SUFOL0IsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztRQUN6QyxXQUFXLEVBQUUsNkJBQTZCO0tBQzdDLENBQUM7cUNBK0NvQixXQUFJO1FBQ1EseUJBQWdCO1FBQzNCLHVCQUFjLHNCQUNLLG9EQUF3QixvQkFBeEIsb0RBQXdCLHNEQUMxQywyQkFBWSxvQkFBWiwyQkFBWTtHQWxEdkIsbUJBQW1CLENBc2EvQjtBQXRhWSxrREFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBBY3RpdmF0ZWRSb3V0ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IEltYWdlU291cmNlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9pbWFnZS1zb3VyY2UnO1xuaW1wb3J0IHsgU3dpcGVHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcblxuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvaW1hZ2UnO1xuXG5pbXBvcnQgeyBSb3V0ZXJFeHRlbnNpb25zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0ICrCoGFzwqBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqwqBhc8KgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuXG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG4vLyBpbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG4vLyBpbXBvcnQgKiBhcyBmcmFtZU1vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lJztcbi8vIGltcG9ydCAqIGFzIHV0aWxzTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHMnO1xuXG4vKipcbiAqIEltYWdlU2xpZGVDb21wb25lbnQgaXMgdXNlZCB0byBzaG93IGltYWdlIGluIGRldGFpbCB2aWV3LCB3aGVyZSB1c2VyIGNhbiB6b29tLWluL291dC5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1pbWFnZXNsaWRlJyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlc2xpZGUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9pbWFnZXNsaWRlLmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VTbGlkZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqICBVc2VkIHRvIHN0b3JlIGltYWdlIHNvdXJjZSBhbmQgYWxzbyB1c2VkIGluIEdVSSAqL1xuICAgIHB1YmxpYyBpbWFnZVNvdXJjZTogSW1hZ2VTb3VyY2U7XG4gICAgLyoqICBUbyBpbmRpY2F0ZSB0aGUgc2hhcmluZyBtZW51IGlzIHZpc2libGUgb3Igbm90ICovXG4gICAgcHVibGljIGlzU2hhcmluZzogYm9vbGVhbjtcbiAgICAvKiogVG8gaW5kaWNhdGUgdGhlIGRlbGV0aW5nIG1lbnUgaXMgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwdWJsaWMgaXNEZWxldGluZzogYm9vbGVhbjtcbiAgICAvKiogQ2hpbGQgZWxlbWVudCByZWZlcnJlbmNlICovXG4gICAgQFZpZXdDaGlsZCgnaW1nU2xpZGVJZCcpIF9kcmFnSW1hZ2U6IEVsZW1lbnRSZWY7XG4gICAgLyoqIEltYWdlIFVSSSAqL1xuICAgIHByaXZhdGUgaW1nVVJJOiBzdHJpbmc7XG4gICAgLyoqIEltYWdlIGluZGV4IGJlaW5nIHVzZWQgdG8gZ2V0IGFuIGltYWdlIGZvciB0aGUgZ2l2ZW4gaW5kZXggKi9cbiAgICBwcml2YXRlIGltZ0luZGV4OiBudW1iZXI7XG4gICAgLyoqIEltYWdlIHJlZmVycmVuY2UgZnJvbSBfZHJhZ0ltYWdlICovXG4gICAgcHJpdmF0ZSBkcmFnSW1hZ2VJdGVtOiBJbWFnZTtcbiAgICAvKiogQ29udGFpbnMgcHJldmlvdXMgZGVsdGFYIHZhbHVlICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIHByZXZpb3VzIGRlbHRhWSB2YWx1ZSAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWTogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGltYWdlIGZpbGUgcGF0aCBpbmZvcm1hdGlvbiAqL1xuICAgIHByaXZhdGUgaW1hZ2VGaWxlTGlzdDogYW55W107XG4gICAgLyoqIENvbnRhaW5zIGltYWdlIG5leHQgaW5kZXggdmFsdWUgKi9cbiAgICBwcml2YXRlIGltZ05leHQ6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgaW5pdGlhbCBzY2FsZSB2YWx1ZSAqL1xuICAgIHByaXZhdGUgc3RhcnRTY2FsZSA9IDE7XG4gICAgLyoqIENvbnRhaW5zIG5ldyBzY2FsZSB2YWx1ZSB3aGlsZSBtb3ZpbmcgdGhlIGltYWdlICovXG4gICAgcHJpdmF0ZSBuZXdTY2FsZSA9IDE7XG4gICAgLyoqIFRvIGluZGljYXRlIHdoZXRoZXIgcGluY2ggaXMgdHJpZ2dlciBvciBub3QgKi9cbiAgICBwcml2YXRlIGlzUGluY2hTZWxlY3RlZCA9IGZhbHNlO1xuICAgIC8qKiBUbyBzdG9yZSBvbGQgVHJhbnNsYXRlWCB2YWx1ZSBvZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgLyoqIFRvIHN0b3JlIG9sZCBUcmFuc2xhdGVZIHZhbHVlIG9mIGltYWdlICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVZID0gMDtcbiAgICAvKiogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGltYWdlIGdvdCBkZWZhdWx0IHNjcmVlbiBsb2NhdGlvbiBvciBub3QgKi9cbiAgICBwcml2YXRlIGlzR290RGVmYXVsdExvY2F0aW9uID0gZmFsc2U7XG4gICAgLyoqIENvbnRhaW5zIGltYWdlIGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uICovXG4gICAgcHJpdmF0ZSBkZWZhdWx0U2NyZWVuTG9jYXRpb246IGFueTtcblxuICAgIC8qKlxuICAgICAqIEltYWdlU2xpZGVDb21wb25lbnQgY29uc3RydWN0b3IuXG4gICAgICogQHBhcmFtIHBhZ2UgUGFnZVxuICAgICAqIEBwYXJhbSByb3V0ZXJFeHRlbnNpb25zIFJvdXRlckV4dGVuc2lvbnNcbiAgICAgKiBAcGFyYW0gcm91dGUgQWN0aXZhdGVkUm91dGVcbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHBhZ2U6IFBhZ2UsXG4gICAgICAgIHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIpIHtcbiAgICAgICAgdGhpcy5yb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUoKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbWdVUkkgPSBwYXJhbXNbJ2ltZ1VSSSddO1xuICAgICAgICAgICAgdGhpcy5pbWdJbmRleCA9IHBhcmFtc1snaW1nSW5kZXgnXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIHBhZ2UgcHJvcGVydGllcyBsaWtlIG1lbnVzICgnZGVsZXRlJy8nc2hhcmUnKSBhbmQgdGhlIGltYWdlXG4gICAgICogcHJvcGVydGllcyBsaWtlIHRyYW5zbGF0ZVgvdHJhbnNsYXRlWS9zY2FsZVgvc2NhbGVZLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmltZ05leHQgPSB0aGlzLmltZ0luZGV4O1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0ID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0gPSB0aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudCBhcyBJbWFnZTtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2Ugd2hlbiB0aGUgYmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBpbmNoIG1ldGhvZCwgaXMgYmVpbmcgY2FsbGVkIHdoaWxlIHBpbmNoIGV2ZW50IGZpcmVkIG9uIGltYWdlLFxuICAgICAqIHdoZXJlIHRoZSBuZXcgc2NhbGUsIHdpZHRoICYgaGVpZ2h0IG9mIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBoYXZlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIHRvIHpvb20taW4vb3V0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG5cbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTY2FsZSA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVg7XG4gICAgICAgICAgICB0aGlzLmlzUGluY2hTZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWluKDE1LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1heCgwLjEsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gdGhpcy5uZXdTY2FsZTtcblxuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLndpZHRoID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uaGVpZ2h0ID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBhbi9tb3ZlIG1ldGhvZCwgd2hpY2ggbW92ZXMgaW1hZ2Ugd2hlbiB1c2VyIHByZXNzICYgZHJhZyB3aXRoIGEgZmluZ2VyIGFyb3VuZFxuICAgICAqIHRoZSBpbWFnZSBhcmVhLiBIZXJlIHRoZSBpbWFnZSdzIHRyYWxhdGVYL3RyYW5zbGF0ZVkgdmFsdWVzIGFyZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiBiYXNlZCBvbiB0aGUgaW1hZ2UncyBzY2FsZSwgd2lkdGggJiBoZWlnaHQuIEFuZCBhbHNvIGl0IHRha2VzIGNhcmUgb2YgaW1hZ2UgYm91bmRhcnlcbiAgICAgKiBjaGVja2luZy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQYW5HZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QYW4oYXJnczogUGFuR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBjb25zdCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICBsZXQgY2VudGVyUG9pbnRZID0gKHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpIC8gNCkgKiAodGhpcy5uZXdTY2FsZSk7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuZHJhZ0ltYWdlSXRlbS5vcmlnaW5YO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuZHJhZ0ltYWdlSXRlbS5vcmlnaW5ZO1xuXG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG4gICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA8IDE1KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uID0gc2NyZWVuTG9jYXRpb247XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueCkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WCAtIGltYWdlVmlld1dpZHRoKSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVYID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdGhpcy5vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFkgLSBpbWFnZVZpZXdIZWlnaHQpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLm9sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5uZXdTY2FsZSA+PSAxNSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVhUZW1wID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggKyBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2xhdGVZVGVtcCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZICsgYXJncy5kZWx0YVkgLSB0aGlzLnByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA8IHRyYW5zbGF0ZVhUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdGhpcy5vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdHJhbnNsYXRlWFRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVkgPCB0cmFuc2xhdGVZVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRyYW5zbGF0ZVlUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRG91YmxlIHRhcCBtZXRob2QgZmlyZXMgb24gd2hlbiB1c2VyIHRhcHMgdHdvIHRpbWVzIG9uIHRyYW5zZm9ybWVkIGltYWdlLiBcbiAgICAgKiBBY3R1YWxseSBpdCBicmluZ3MgdGhlIGltYWdlIHRvIGl0J3Mgb3JpZ2luYWwgcG9zaXRpb25zIGFuZCBhbHNvIGFkZHMgXG4gICAgICogY2lyY2xlIHBvaW50cyBpZiBpdCBpcyBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Eb3VibGVUYXAoYXJnczogR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgY3VydmU6ICdlYXNlSW4nLFxuICAgICAgICAgICAgZHVyYXRpb246IDEwLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5uZXdTY2FsZSA9IDE7XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBhZ2UgbG9hZGVkIG1ldGhvZCB3aGljaCBpcyBiZWVuIGNhbGxlZCB3aGVuIGltYWdlc2xpZGUgcGFnZSBpcyBsb2FkZWQsXG4gICAgICogd2hlcmUgaXQgc2V0cyB0aGUgc2VsZWN0ZWQgaW1hZ2UgaW4gdGhlIHNvdXJjZSBmb3IgZGlzcGxheS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBhbnkgb2JqZWN0XG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzOiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nSW5kZXhdLmZpbGVQYXRoO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoZSBpbWFnZSBsZWZ0L3JpZ2h0IHdoaWxlIHN3aXBlIHdpdGggYSBmaW5ndXJlLiBBY3R1YWxseSB3aGVuIGEgZmluZ2VyIGlzIHN3aXBlZFxuICAgICAqIGl0IGNoZWNrcyB0aGF0IHRoZSBzd2lwZSBpcyByaWdodCBkaXJlY3Qgb3IgbGVmdCBkaXJlY3Rpb24sIGJhc2VkIG9uIHRoYXQgaXQgcHVsbHMgdGhlIGltYWdlIGZyb21cbiAgICAgKiB0aGUgaW1hZ2UgbGlzdCBhbmQgZGlzcGxheSBpdCBpbiB2aWV3LiBBZnRlciB0aGF0LCBpdCBzZXRzIHRoZSBpbWFnZSBpbiBkZWZhdWx0IHBvc2l0aW9uIGJ5IGNhbGxpbmdcbiAgICAgKiBvbkRvdWJsZVRhcCBtZXRob2QuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgU3dpcGVHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPT09IDEgJiYgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAyIHx8ICFhcmdzLmRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPD0gMCB8fCB0aGlzLmltZ05leHQgPj0gdGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLmRpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPCAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9ICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmltZ0luZGV4ID0gdGhpcy5pbWdOZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIG9yaWdpbmFsIGltYWdlLlxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICogQHJldHVybnMgaW1hZ2UgdXJpXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgcmV0dXJuIHVyaTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBTaGFyZXMgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgc2hhcmUgYnV0dG9uLiBUaGUgc2hhcmluZyBjYW4gYmUgZG9uZVxuICAgICAqIHZpYSBhbnkgb25lIG9mIHRoZSBtZWRpYXMgc3VwcG9ydGVkIGJ5IGFuZHJvaWQgZGV2aWNlIGJ5IGRlZmF1bHQuIFRoZSBsaXN0IG9mIHN1cHBvcnRlZFxuICAgICAqIG1lZGlhcyB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2hhcmUgYnV0dG9uIGNsaWNrZWQuXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcblxuICAgICAgICBsZXQgZGF0YVRvU2hhcmU6IGFueSA9IHt9O1xuICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcbiAgICAgICAgbGV0IGRvY3VtZW50cyA9IGZzLmtub3duRm9sZGVycy5kb2N1bWVudHMoKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIHRoaXMuaW1hZ2VGaWxlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgLy8gICAgIGlmIChpbWFnZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICBsZXQgdGh1bWJuYWlsSW1nRmlsZU5hbWUgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlTmFtZTtcbiAgICAgICAgICAgIC8vIGltZ0ZpbGVOYW1lT3JnID0gdGh1bWJuYWlsSW1nRmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuXG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZyA9IHRodW1ibmFpbEltZ0ZpbGVOYW1lLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgIC8vIGxldCBmaWxlTmFtZSA9IGltYWdlLmZpbGVOYW1lO1xuICAgICAgICAgICAgbGV0IHBhdGggPSBmcy5wYXRoLmpvaW4oZG9jdW1lbnRzLnBhdGgsICdjYXB0dXJlZGltYWdlcycsIHRyYW5zZm9ybWVkSW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAgICAgLy8gbGV0IGZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKHBhdGgpO1xuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkVUlJbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChwYXRoKTtcbiAgICAgICAgICAgIGRhdGFUb1NoYXJlW2RhdGFDb3VudCsrXSA9IHRyYW5zZm9ybWVkVUlJbWFnZTtcbiAgICAgICAgICAgIC8vR2V0dGluZyBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZVxuICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgICAgICBwYXRoID0gZnMucGF0aC5qb2luKGRvY3VtZW50cy5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRVSUltYWdlT3JnID0gVUlJbWFnZS5pbWFnZU5hbWVkKHBhdGgpO1xuICAgICAgICAgICAgZGF0YVRvU2hhcmVbZGF0YUNvdW50KytdID0gdHJhbnNmb3JtZWRVSUltYWdlT3JnO1xuICAgICAgICAgICAgLy8gICAgIH1cbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuc2hhcmUoZGF0YVRvU2hhcmUpO1xuICAgICAgICAgICAgLy8gbGV0IGFjdGl2aXR5Q29udHJvbGxlciA9IFVJQWN0aXZpdHlWaWV3Q29udHJvbGxlci5hbGxvYygpXG4gICAgICAgICAgICAvLyAgICAgLmluaXRXaXRoQWN0aXZpdHlJdGVtc0FwcGxpY2F0aW9uQWN0aXZpdGllcyhbZGF0YVRvU2hhcmVdLCBudWxsKTtcbiAgICAgICAgICAgIC8vIGFjdGl2aXR5Q29udHJvbGxlci5zZXRWYWx1ZUZvcktleSgnVHJhbnNmb3JtZWQgSW1hZ2UocyknLCAnU3ViamVjdCcpO1xuICAgICAgICAgICAgLy8gbGV0IHByZXNlbnRWaWV3Q29udHJvbGxlciA9IGFjdGl2aXR5Q29udHJvbGxlci5wb3BvdmVyUHJlc2VudGF0aW9uQ29udHJvbGxlcjtcbiAgICAgICAgICAgIC8vIGlmIChwcmVzZW50Vmlld0NvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIC8vICAgICB2YXIgcGFnZSA9IGZyYW1lTW9kdWxlLnRvcG1vc3QoKS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgIC8vICAgICBpZiAocGFnZSAmJiBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zICYmXG4gICAgICAgICAgICAvLyAgICAgICAgIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMuY291bnQgPiAwKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHByZXNlbnRWaWV3Q29udHJvbGxlci5iYXJCdXR0b25JdGVtID0gcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtc1swXTtcbiAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gICAgICAgICBwcmVzZW50Vmlld0NvbnRyb2xsZXIuc291cmNlVmlldyA9IHBhZ2UuaW9zLnZpZXc7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAvLyB1dGlsc01vZHVsZS5pb3MuZ2V0dGVyKFVJQXBwbGljYXRpb24sIFVJQXBwbGljYXRpb24uc2hhcmVkQXBwbGljYXRpb24pXG4gICAgICAgICAgICAvLyAgICAgLmtleVdpbmRvd1xuICAgICAgICAgICAgLy8gICAgIC5yb290Vmlld0NvbnRyb2xsZXJcbiAgICAgICAgICAgIC8vICAgICAucHJlc2VudFZpZXdDb250cm9sbGVyQW5pbWF0ZWRDb21wbGV0aW9uKGFjdGl2aXR5Q29udHJvbGxlciwgdHJ1ZSwgbnVsbCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgIC8vICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgLy8gICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAvLyAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLklOVEVSTkVUXSxcbiAgICAgICAgLy8gICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gICAgICAgICB0cnkge1xuICAgICAgICAvLyAgICAgICAgICAgICBjb25zdCB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAvLyAgICAgICAgICAgICBsZXQgZmlsZXNUb0JlQXR0YWNoZWQgPSAnJztcbiAgICAgICAgLy8gICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZU5hbWU7XG4gICAgICAgIC8vICAgICAgICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAvLyAgICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgICAgIC8vICAgICAgICAgICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAvLyAgICAgICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFxuICAgICAgICAvLyAgICAgICAgICAgICAvLyAgICAgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgICAgIC8vICAgICAgICAgICAgIHVyaXMuYWRkKHVyaSk7XG4gICAgICAgIC8vICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2UoaW1nRmlsZU5hbWVPcmcpKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUoaW1nRmlsZU5hbWVPcmcpKTtcblxuICAgICAgICAvLyAgICAgICAgICAgICBmaWxlc1RvQmVBdHRhY2hlZCA9IGZpbGVzVG9CZUF0dGFjaGVkLmNvbmNhdCgnLCcgKyB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aCk7XG4gICAgICAgIC8vICAgICAgICAgICAgIGlmICh1cmlzLnNpemUoKSA+IDApIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1NFTkRfTVVMVElQTEUpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW50ZW50LnNldFR5cGUoJ2ltYWdlL2pwZWcnKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlc8KgOsKgJyArIGZpbGVzVG9CZUF0dGFjaGVkICsgJy4nO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1VCSkVDVCwgJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXMuLi4nKTtcblxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW50ZW50LnB1dFBhcmNlbGFibGVBcnJheUxpc3RFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NUUkVBTSwgdXJpcyk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9URVhULCBtZXNzYWdlKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1dSSVRFX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGludGVudC5zZXRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfQUNUSVZJVFlfTkVXX1RBU0spO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc3RhcnRBY3Rpdml0eShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LmNyZWF0ZUNob29zZXIoaW50ZW50LCAnU2VuZCBtYWlsLi4uJykpO1xuICAgICAgICAvLyAgICAgICAgICAgICB9XG4gICAgICAgIC8vICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHNlbmRpbmcgbWFpbC4nICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHNlbmRpbmcgbWFpbC4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIC8vICAgICAgICAgfVxuICAgICAgICAvLyAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIC8vICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAvLyAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIC8vICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgJ2RlbGV0ZScgYnV0dG9uIGluIG1lbnUuXG4gICAgICogVGhpcyB3aWxsIHNob3cgdXAgYSBkaWFsb2cgd2luZG93IGZvciBjb25maXJtYXRpb24gZm9yIHRoZSBzZWxlY3RlZCBpbWFnZShzKVxuICAgICAqIHRvIGJlIGRlbGV0ZWQuIElmIHVzZXIgc2F5cyAnT2snLCB0aGVuIHRob3NlIGltYWdlKHMpIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAqIGRldmljZSwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IGJvamVjdFxuICAgICAqL1xuICAgIG9uRGVsZXRlKGFyZ3M6IGFueSkge1xuICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nwqBzZWxlY3RlZMKgaXRlbShzKS4uLicsXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0LnNwbGljZSh0aGlzLmltZ05leHQsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1NlbGVjdGVkIGltYWdlIGRlbGV0ZWQuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPD0gdGhpcy5pbWdOZXh0LnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ05vIGltYWdlIGF2YWlsYWJsZS4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLm9uU3dpcGUoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIGVycm9yLnN0YWNrLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIG9yaWdpbmFsIGltYWdlLiAnICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19