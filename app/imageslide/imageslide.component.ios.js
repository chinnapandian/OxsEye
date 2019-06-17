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
var frameModule = require("tns-core-modules/ui/frame");
var utilsModule = require("tns-core-modules/utils/utils");
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
        this.imageFileList.forEach(function (image) {
            if (image.isSelected) {
                var transformedImgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
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
            }
        });
        try {
            var activityController = UIActivityViewController.alloc()
                .initWithActivityItemsApplicationActivities([dataToShare], null);
            activityController.setValueForKey('Transformed Image(s)', 'Subject');
            var presentViewController = activityController.popoverPresentationController;
            if (presentViewController) {
                var page = frameModule.topmost().currentPage;
                if (page && page.ios.navigationItem.rightBarButtonItems &&
                    page.ios.navigationItem.rightBarButtonItems.count > 0) {
                    presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
                }
                else {
                    presentViewController.sourceView = page.ios.view;
                }
            }
            utilsModule.ios.getter(UIApplication, UIApplication.sharedApplication)
                .keyWindow
                .rootViewController
                .presentViewControllerAnimatedCompletion(activityController, true, null);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQXlFO0FBQ3pFLDBDQUFpRDtBQUVqRCw0REFBb0Q7QUFDcEQsOERBQTREO0FBRTVELGlEQUFnRDtBQUtoRCxzREFBK0Q7QUFFL0QsdURBQXNEO0FBQ3RELG9GQUFzRztBQUd0RyxxREFBdUQ7QUFFdkQsMENBQTRDO0FBRTVDLDJEQUEyRDtBQUMzRCxpREFBbUQ7QUFDbkQsdURBQXlEO0FBQ3pELDBEQUE0RDtBQUU1RDs7R0FFRztBQU9ILElBQWEsbUJBQW1CO0lBc0M1Qjs7Ozs7O09BTUc7SUFDSCw2QkFDWSxJQUFVLEVBQ1YsZ0JBQWtDLEVBQ2xDLEtBQXFCLEVBQ3JCLHdCQUFrRCxFQUNsRCxNQUFvQjtRQUxoQyxpQkFVQztRQVRXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQTNCaEMsbUNBQW1DO1FBQzNCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdkIsc0RBQXNEO1FBQzlDLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsa0RBQWtEO1FBQzFDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQiw2Q0FBNkM7UUFDckMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIscUVBQXFFO1FBQzdELHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQWlCakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQUMsTUFBTTtZQUNwQyxLQUFJLENBQUMs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QztBQTNaNEI7SUFBeEIsZ0JBQVMsQ0FBQyxZQUFZLENBQUM7OEJBQWEsaUJBQVU7dURBQUM7QUFSdkMsbUJBQW1CO0lBTi9CLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsNEJBQTRCLENBQUM7UUFDekMsV0FBVyxFQUFFLDZCQUE2QjtLQUM3QyxDQUFDO3FDQStDb0IsV0FBSTtRQUNRLHlCQUFnQjtRQUMzQix1QkFBYyxzQkFDSyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVk7R0FsRHZCLG1CQUFtQixDQW1hL0I7QUFuYVksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IFN3aXBlR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5cbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ltYWdlJztcblxuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCAqwqBhc8KgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcblxuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLy8gaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0ICogYXMgZnJhbWVNb2R1bGUgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9mcmFtZSc7XG5pbXBvcnQgKiBhcyB1dGlsc01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzJztcblxuLyoqXG4gKiBJbWFnZVNsaWRlQ29tcG9uZW50IGlzIHVzZWQgdG8gc2hvdyBpbWFnZSBpbiBkZXRhaWwgdmlldywgd2hlcmUgdXNlciBjYW4gem9vbS1pbi9vdXQuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VzbGlkZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9pbWFnZXNsaWRlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlU2xpZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIC8qKiAgVXNlZCB0byBzdG9yZSBpbWFnZSBzb3VyY2UgYW5kIGFsc28gdXNlZCBpbiBHVUkgKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlO1xuICAgIC8qKiAgVG8gaW5kaWNhdGUgdGhlIHNoYXJpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIFRvIGluZGljYXRlIHRoZSBkZWxldGluZyBtZW51IGlzIHZpc2libGUgb3Igbm90ICovXG4gICAgcHVibGljIGlzRGVsZXRpbmc6IGJvb2xlYW47XG4gICAgLyoqIENoaWxkIGVsZW1lbnQgcmVmZXJyZW5jZSAqL1xuICAgIEBWaWV3Q2hpbGQoJ2ltZ1NsaWRlSWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuICAgIC8qKiBJbWFnZSBVUkkgKi9cbiAgICBwcml2YXRlIGltZ1VSSTogc3RyaW5nO1xuICAgIC8qKiBJbWFnZSBpbmRleCBiZWluZyB1c2VkIHRvIGdldCBhbiBpbWFnZSBmb3IgdGhlIGdpdmVuIGluZGV4ICovXG4gICAgcHJpdmF0ZSBpbWdJbmRleDogbnVtYmVyO1xuICAgIC8qKiBJbWFnZSByZWZlcnJlbmNlIGZyb20gX2RyYWdJbWFnZSAqL1xuICAgIHByaXZhdGUgZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgLyoqIENvbnRhaW5zIHByZXZpb3VzIGRlbHRhWCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVkgdmFsdWUgKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBpbWFnZSBmaWxlIHBhdGggaW5mb3JtYXRpb24gKi9cbiAgICBwcml2YXRlIGltYWdlRmlsZUxpc3Q6IGFueVtdO1xuICAgIC8qKiBDb250YWlucyBpbWFnZSBuZXh0IGluZGV4IHZhbHVlICovXG4gICAgcHJpdmF0ZSBpbWdOZXh0OiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIGluaXRpYWwgc2NhbGUgdmFsdWUgKi9cbiAgICBwcml2YXRlIHN0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBDb250YWlucyBuZXcgc2NhbGUgdmFsdWUgd2hpbGUgbW92aW5nIHRoZSBpbWFnZSAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB3aGV0aGVyIHBpbmNoIGlzIHRyaWdnZXIgb3Igbm90ICovXG4gICAgcHJpdmF0ZSBpc1BpbmNoU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIC8qKiBUbyBzdG9yZSBvbGQgVHJhbnNsYXRlWSB2YWx1ZSBvZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90ICovXG4gICAgcHJpdmF0ZSBpc0dvdERlZmF1bHRMb2NhdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBpbWFnZSBkZWZhdWx0IHNjcmVlbiBsb2NhdGlvbiAqL1xuICAgIHByaXZhdGUgZGVmYXVsdFNjcmVlbkxvY2F0aW9uOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBJbWFnZVNsaWRlQ29tcG9uZW50IGNvbnN0cnVjdG9yLlxuICAgICAqIEBwYXJhbSBwYWdlIFBhZ2VcbiAgICAgKiBAcGFyYW0gcm91dGVyRXh0ZW5zaW9ucyBSb3V0ZXJFeHRlbnNpb25zXG4gICAgICogQHBhcmFtIHJvdXRlIEFjdGl2YXRlZFJvdXRlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlLFxuICAgICAgICBwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMsXG4gICAgICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyKSB7XG4gICAgICAgIHRoaXMucm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gcGFyYW1zWydpbWdVUkknXTtcbiAgICAgICAgICAgIHRoaXMuaW1nSW5kZXggPSBwYXJhbXNbJ2ltZ0luZGV4J107XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBwYWdlIHByb3BlcnRpZXMgbGlrZSBtZW51cyAoJ2RlbGV0ZScvJ3NoYXJlJykgYW5kIHRoZSBpbWFnZVxuICAgICAqIHByb3BlcnRpZXMgbGlrZSB0cmFuc2xhdGVYL3RyYW5zbGF0ZVkvc2NhbGVYL3NjYWxlWS5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWdOZXh0ID0gdGhpcy5pbWdJbmRleDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VGaWxlTGlzdCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtID0gdGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQgYXMgSW1hZ2U7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gMTtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgYmFjayB0byBwcmV2aW91cyBwYWdlIHdoZW4gdGhlIGJhY2sgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgICovXG4gICAgZ29CYWNrKCkge1xuICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwaW5jaCBtZXRob2QsIGlzIGJlaW5nIGNhbGxlZCB3aGlsZSBwaW5jaCBldmVudCBmaXJlZCBvbiBpbWFnZSxcbiAgICAgKiB3aGVyZSB0aGUgbmV3IHNjYWxlLCB3aWR0aCAmIGhlaWdodCBvZiB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaGF2ZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiB0byB6b29tLWluL291dC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQaW5jaEdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvblBpbmNoKGFyZ3M6IFBpbmNoR2VzdHVyZUV2ZW50RGF0YSkge1xuXG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0U2NhbGUgPSB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYO1xuICAgICAgICAgICAgdGhpcy5pc1BpbmNoU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gdGhpcy5zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1pbigxNSwgdGhpcy5uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gTWF0aC5tYXgoMC4xLCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IHRoaXMubmV3U2NhbGU7XG5cbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS53aWR0aCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLmhlaWdodCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwYW4vbW92ZSBtZXRob2QsIHdoaWNoIG1vdmVzIGltYWdlIHdoZW4gdXNlciBwcmVzcyAmIGRyYWcgd2l0aCBhIGZpbmdlciBhcm91bmRcbiAgICAgKiB0aGUgaW1hZ2UgYXJlYS4gSGVyZSB0aGUgaW1hZ2UncyB0cmFsYXRlWC90cmFuc2xhdGVZIHZhbHVlcyBhcmUgYmVlbiBjYWxjdWxhdGVkXG4gICAgICogYmFzZWQgb24gdGhlIGltYWdlJ3Mgc2NhbGUsIHdpZHRoICYgaGVpZ2h0LiBBbmQgYWxzbyBpdCB0YWtlcyBjYXJlIG9mIGltYWdlIGJvdW5kYXJ5XG4gICAgICogY2hlY2tpbmcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuICAgICAgICBsZXQgY2VudGVyUG9pbnRYID0gKHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAvIDQpICogKHRoaXMubmV3U2NhbGUpO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdXaWR0aCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLmRyYWdJbWFnZUl0ZW0ub3JpZ2luWDtcbiAgICAgICAgY29uc3QgaW1hZ2VWaWV3SGVpZ2h0ID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLmRyYWdJbWFnZUl0ZW0ub3JpZ2luWTtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgY2VudGVyUG9pbnRYID0gKGNlbnRlclBvaW50WCAqIDIpO1xuICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPCAxNSkge1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzR290RGVmYXVsdExvY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueClcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMucHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVgtLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZICs9IGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMubmV3U2NhbGUgPj0gMTUpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2xhdGVYVGVtcCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICsgYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWVRlbXAgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArIGFyZ3MuZGVsdGFZIC0gdGhpcy5wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPCB0cmFuc2xhdGVYVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMub2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRyYW5zbGF0ZVhUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVZIDwgdHJhbnNsYXRlWVRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLm9sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0cmFuc2xhdGVZVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgdGhpcy5wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGluY2hTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERvdWJsZSB0YXAgbWV0aG9kIGZpcmVzIG9uIHdoZW4gdXNlciB0YXBzIHR3byB0aW1lcyBvbiB0cmFuc2Zvcm1lZCBpbWFnZS4gXG4gICAgICogQWN0dWFsbHkgaXQgYnJpbmdzIHRoZSBpbWFnZSB0byBpdCdzIG9yaWdpbmFsIHBvc2l0aW9ucyBhbmQgYWxzbyBhZGRzIFxuICAgICAqIGNpcmNsZSBwb2ludHMgaWYgaXQgaXMgb3JpZ2luYWwgaW1hZ2UuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uRG91YmxlVGFwKGFyZ3M6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLmFuaW1hdGUoe1xuICAgICAgICAgICAgdHJhbnNsYXRlOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIHNjYWxlOiB7IHg6IDEsIHk6IDEgfSxcbiAgICAgICAgICAgIGN1cnZlOiAnZWFzZUluJyxcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubmV3U2NhbGUgPSAxO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQYWdlIGxvYWRlZCBtZXRob2Qgd2hpY2ggaXMgYmVlbiBjYWxsZWQgd2hlbiBpbWFnZXNsaWRlIHBhZ2UgaXMgbG9hZGVkLFxuICAgICAqIHdoZXJlIGl0IHNldHMgdGhlIHNlbGVjdGVkIGltYWdlIGluIHRoZSBzb3VyY2UgZm9yIGRpc3BsYXkuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IG9iamVjdFxuICAgICAqL1xuICAgIHBhZ2VMb2FkZWQoYXJnczogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBzd2lwZSB3aXRoIGEgZmluZ3VyZS4gQWN0dWFsbHkgd2hlbiBhIGZpbmdlciBpcyBzd2lwZWRcbiAgICAgKiBpdCBjaGVja3MgdGhhdCB0aGUgc3dpcGUgaXMgcmlnaHQgZGlyZWN0IG9yIGxlZnQgZGlyZWN0aW9uLCBiYXNlZCBvbiB0aGF0IGl0IHB1bGxzIHRoZSBpbWFnZSBmcm9tXG4gICAgICogdGhlIGltYWdlIGxpc3QgYW5kIGRpc3BsYXkgaXQgaW4gdmlldy4gQWZ0ZXIgdGhhdCwgaXQgc2V0cyB0aGUgaW1hZ2UgaW4gZGVmYXVsdCBwb3NpdGlvbiBieSBjYWxsaW5nXG4gICAgICogb25Eb3VibGVUYXAgbWV0aG9kLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFN3aXBlR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uU3dpcGUoYXJnczogU3dpcGVHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID09PSAxICYmIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPT09IDEpIHtcbiAgICAgICAgICAgIGlmIChhcmdzLmRpcmVjdGlvbiA9PT0gMiB8fCAhYXJncy5kaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWdOZXh0IDw9IDAgfHwgdGhpcy5pbWdOZXh0ID49IHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0ID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQtLTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWdOZXh0IDwgMCB8fCB0aGlzLmltZ05leHQgPj0gdGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5pbWdJbmRleCA9IHRoaXMuaW1nTmV4dDtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnTm8gaW1hZ2UgYXZhaWxhYmxlLicpLnNob3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub25Eb3VibGVUYXAoYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0cyBvcmlnaW5hbCBpbWFnZS5cbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqIEByZXR1cm5zIGltYWdlIHVyaVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcbiAgICAvLyAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgLy8gICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAvLyAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgLy8gICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIHJldHVybiB1cmk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG5cbiAgICAgICAgbGV0IGRhdGFUb1NoYXJlOiBhbnkgPSB7fTtcbiAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XG4gICAgICAgIGxldCBkb2N1bWVudHMgPSBmcy5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XG5cbiAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnID0gaW1hZ2UuZmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBmaWxlTmFtZSA9IGltYWdlLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIGxldCBwYXRoID0gZnMucGF0aC5qb2luKGRvY3VtZW50cy5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnLCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgZmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgocGF0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkVUlJbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChwYXRoKTtcbiAgICAgICAgICAgICAgICBkYXRhVG9TaGFyZVtkYXRhQ291bnQrK10gPSB0cmFuc2Zvcm1lZFVJSW1hZ2U7XG4gICAgICAgICAgICAgICAgLy9HZXR0aW5nIG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlXG4gICAgICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgICAgICAgICAgICAgIHBhdGggPSBmcy5wYXRoLmpvaW4oZG9jdW1lbnRzLnBhdGgsICdjYXB0dXJlZGltYWdlcycsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRVSUltYWdlT3JnID0gVUlJbWFnZS5pbWFnZU5hbWVkKHBhdGgpO1xuICAgICAgICAgICAgICAgIGRhdGFUb1NoYXJlW2RhdGFDb3VudCsrXSA9IHRyYW5zZm9ybWVkVUlJbWFnZU9yZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHlDb250cm9sbGVyID0gVUlBY3Rpdml0eVZpZXdDb250cm9sbGVyLmFsbG9jKClcbiAgICAgICAgICAgICAgICAuaW5pdFdpdGhBY3Rpdml0eUl0ZW1zQXBwbGljYXRpb25BY3Rpdml0aWVzKFtkYXRhVG9TaGFyZV0sIG51bGwpO1xuICAgICAgICAgICAgYWN0aXZpdHlDb250cm9sbGVyLnNldFZhbHVlRm9yS2V5KCdUcmFuc2Zvcm1lZCBJbWFnZShzKScsICdTdWJqZWN0Jyk7XG4gICAgICAgICAgICBsZXQgcHJlc2VudFZpZXdDb250cm9sbGVyID0gYWN0aXZpdHlDb250cm9sbGVyLnBvcG92ZXJQcmVzZW50YXRpb25Db250cm9sbGVyO1xuICAgICAgICAgICAgaWYgKHByZXNlbnRWaWV3Q29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gZnJhbWVNb2R1bGUudG9wbW9zdCgpLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMgJiZcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtcy5jb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlc2VudFZpZXdDb250cm9sbGVyLmJhckJ1dHRvbkl0ZW0gPSBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXNlbnRWaWV3Q29udHJvbGxlci5zb3VyY2VWaWV3ID0gcGFnZS5pb3MudmlldztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHV0aWxzTW9kdWxlLmlvcy5nZXR0ZXIoVUlBcHBsaWNhdGlvbiwgVUlBcHBsaWNhdGlvbi5zaGFyZWRBcHBsaWNhdGlvbilcbiAgICAgICAgICAgICAgICAua2V5V2luZG93XG4gICAgICAgICAgICAgICAgLnJvb3RWaWV3Q29udHJvbGxlclxuICAgICAgICAgICAgICAgIC5wcmVzZW50Vmlld0NvbnRyb2xsZXJBbmltYXRlZENvbXBsZXRpb24oYWN0aXZpdHlDb250cm9sbGVyLCB0cnVlLCBudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4nICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgLy8gICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAvLyAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgIC8vICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uSU5URVJORVRdLFxuICAgICAgICAvLyAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAvLyAgICAgICAgIHRyeSB7XG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnN0IHVyaXMgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxhbmRyb2lkLm5ldC5Vcmk+KCk7XG4gICAgICAgIC8vICAgICAgICAgICAgIGxldCBmaWxlc1RvQmVBdHRhY2hlZCA9ICcnO1xuICAgICAgICAvLyAgICAgICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuICAgICAgICAvLyAgICAgICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlTmFtZTtcbiAgICAgICAgLy8gICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgIC8vICAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAvLyAgICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAgICAgLy8gICAgICAgICAgICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgIC8vICAgICAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXG4gICAgICAgIC8vICAgICAgICAgICAgIC8vICAgICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAvLyAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZShpbWdGaWxlTmFtZU9yZykpO1xuXG4gICAgICAgIC8vICAgICAgICAgICAgIGZpbGVzVG9CZUF0dGFjaGVkID0gZmlsZXNUb0JlQXR0YWNoZWQuY29uY2F0KCcsJyArIHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgaWYgKHVyaXMuc2l6ZSgpID4gMCkge1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fU0VORF9NVUxUSVBMRSk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0VHlwZSgnaW1hZ2UvanBlZycpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzwqA6wqAnICsgZmlsZXNUb0JlQXR0YWNoZWQgKyAnLic7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVUJKRUNULCAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcy4uLicpO1xuXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1RFWFQsIG1lc3NhZ2UpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfV1JJVEVfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgaW50ZW50LnNldEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmZvcmVncm91bmRBY3Rpdml0eS5zdGFydEFjdGl2aXR5KGFuZHJvaWQuY29udGVudC5JbnRlbnQuY3JlYXRlQ2hvb3NlcihpbnRlbnQsICdTZW5kIG1haWwuLi4nKSk7XG4gICAgICAgIC8vICAgICAgICAgICAgIH1cbiAgICAgICAgLy8gICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAvLyAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLicgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgLy8gICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgIC8vICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgLy8gICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSAnZGVsZXRlJyBidXR0b24gaW4gbWVudS5cbiAgICAgKiBUaGlzIHdpbGwgc2hvdyB1cCBhIGRpYWxvZyB3aW5kb3cgZm9yIGNvbmZpcm1hdGlvbiBmb3IgdGhlIHNlbGVjdGVkIGltYWdlKHMpXG4gICAgICogdG8gYmUgZGVsZXRlZC4gSWYgdXNlciBzYXlzICdPaycsIHRoZW4gdGhvc2UgaW1hZ2Uocykgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGV2aWNlLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBhbnkgYm9qZWN0XG4gICAgICovXG4gICAgb25EZWxldGUoYXJnczogYW55KSB7XG4gICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICBtZXNzYWdlOiAnRGVsZXRpbmfCoHNlbGVjdGVkwqBpdGVtKHMpLi4uJyxcbiAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogJ09rJyxcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlRmlsZUxpc3Quc3BsaWNlKHRoaXMuaW1nTmV4dCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnU2VsZWN0ZWQgaW1hZ2UgZGVsZXRlZC4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA8PSB0aGlzLmltZ05leHQudmFsdWVPZigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnTm8gaW1hZ2UgYXZhaWxhYmxlLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMub25Td2lwZShhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIGVycm9yLnN0YWNrLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgb3JpZ2luYWwgaW1hZ2UuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19