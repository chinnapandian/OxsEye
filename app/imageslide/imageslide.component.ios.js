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
            var thumbnailImgFileName = this.imageFileList[this.imgNext].fileName;
            var transformedImgFileNameOrg = thumbnailImgFileName.replace('thumb_PT_IMG', 'PT_IMG');
            var imgFilePath = fs.path.join(documents.path, 'capturedimages', transformedImgFileNameOrg);
            var transformedUIImage = UIImage.imageNamed(imgFilePath);
            dataToShare[dataCount++] = transformedUIImage;
            // Getting original captured image
            var imgFileNameOrg = transformedImgFileNameOrg.replace('PT_IMG', 'IMG');
            imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
            imgFilePath = fs.path.join(documents.path, 'capturedimages', imgFileNameOrg);
            var transformedUIImageOrg = UIImage.imageNamed(imgFilePath);
            dataToShare[dataCount++] = transformedUIImageOrg;
            this.transformedImageProvider.share(dataToShare);
        }
        catch (error) {
            Toast.makeText('Error while sharing images.' + error).show();
            this.logger.error('Error while sharing images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VzbGlkZS5jb21wb25lbnQuaW9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQXlFO0FBQ3pFLDBDQUFpRDtBQUVqRCw0REFBb0Q7QUFDcEQsOERBQTREO0FBRTVELGlEQUFnRDtBQUtoRCxzREFBK0Q7QUFFL0QsdURBQXNEO0FBQ3RELG9GQUFzRztBQUd0RyxxREFBdUQ7QUFFdkQsMENBQTRDO0FBRTVDLDJEQUEyRDtBQUMzRCxpREFBbUQ7QUFDbkQsNERBQTREO0FBQzVELCtEQUErRDtBQUUvRDs7R0FFRztBQU9ILElBQWEsbUJBQW1CO0lBc0M1Qjs7Ozs7O09BTUc7SUFDSCw2QkFDWSxJQUFVLEVBQ1YsZ0JBQWtDLEVBQ2xDLEtBQXFCLEVBQ3JCLHdCQUFrRCxFQUNsRCxNQUFvQjtRQUxoQyxpQkFVQztRQVRXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQTNCaEMsbUNBQW1DO1FBQzNCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdkIsc0RBQXNEO1FBQzlDLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsa0RBQWtEO1FBQzFDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQiw2Q0FBNkM7UUFDckMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIscUVBQXFFO1FBQzdELHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQWlCakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQUMsTUFBTTtZQUNwQyxLQUFJLENBQUMs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LEVBQUUsQ0FBQzt3QkFDckYsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEdBQUcsTUFBTSxDQUFDLFFBQVE7OEJBQ3JFLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDO2dCQUNYLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osS0FBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7b0JBQ3hCLEtBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO29CQUN4QixLQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztvQkFDdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNqRCxDQUFDO1lBQ0wsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLDBCQUFDO0FBQUQsQ0FBQyxBQWxXRCxJQWtXQztBQTFWNEI7SUFBeEIsZ0JBQVMsQ0FBQyxZQUFZLENBQUM7OEJBQWEsaUJBQVU7dURBQUM7QUFSdkMsbUJBQW1CO0lBTi9CLGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsNEJBQTRCLENBQUM7UUFDekMsV0FBVyxFQUFFLDZCQUE2QjtLQUM3QyxDQUFDO3FDQStDb0IsV0FBSTtRQUNRLHlCQUFnQjtRQUMzQix1QkFBYyxzQkFDSyxvREFBd0Isb0JBQXhCLG9EQUF3QixzREFDMUMsMkJBQVksb0JBQVosMkJBQVk7R0FsRHZCLG1CQUFtQixDQWtXL0I7QUFsV1ksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBGaWxlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IFN3aXBlR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5cbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgSW1hZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ltYWdlJztcblxuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCAqwqBhc8KgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcblxuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLy8gaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuLy8gaW1wb3J0ICogYXMgZnJhbWVNb2R1bGUgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9mcmFtZSc7XG4vLyBpbXBvcnQgKiBhcyB1dGlsc01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzJztcblxuLyoqXG4gKiBJbWFnZVNsaWRlQ29tcG9uZW50IGlzIHVzZWQgdG8gc2hvdyBpbWFnZSBpbiBkZXRhaWwgdmlldywgd2hlcmUgdXNlciBjYW4gem9vbS1pbi9vdXQuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VzbGlkZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9pbWFnZXNsaWRlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlU2xpZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIC8qKiAgVXNlZCB0byBzdG9yZSBpbWFnZSBzb3VyY2UgYW5kIGFsc28gdXNlZCBpbiBHVUkgKi9cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlO1xuICAgIC8qKiAgVG8gaW5kaWNhdGUgdGhlIHNoYXJpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIFRvIGluZGljYXRlIHRoZSBkZWxldGluZyBtZW51IGlzIHZpc2libGUgb3Igbm90ICovXG4gICAgcHVibGljIGlzRGVsZXRpbmc6IGJvb2xlYW47XG4gICAgLyoqIENoaWxkIGVsZW1lbnQgcmVmZXJyZW5jZSAqL1xuICAgIEBWaWV3Q2hpbGQoJ2ltZ1NsaWRlSWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuICAgIC8qKiBJbWFnZSBVUkkgKi9cbiAgICBwcml2YXRlIGltZ1VSSTogc3RyaW5nO1xuICAgIC8qKiBJbWFnZSBpbmRleCBiZWluZyB1c2VkIHRvIGdldCBhbiBpbWFnZSBmb3IgdGhlIGdpdmVuIGluZGV4ICovXG4gICAgcHJpdmF0ZSBpbWdJbmRleDogbnVtYmVyO1xuICAgIC8qKiBJbWFnZSByZWZlcnJlbmNlIGZyb20gX2RyYWdJbWFnZSAqL1xuICAgIHByaXZhdGUgZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgLyoqIENvbnRhaW5zIHByZXZpb3VzIGRlbHRhWCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVkgdmFsdWUgKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBpbWFnZSBmaWxlIHBhdGggaW5mb3JtYXRpb24gKi9cbiAgICBwcml2YXRlIGltYWdlRmlsZUxpc3Q6IGFueVtdO1xuICAgIC8qKiBDb250YWlucyBpbWFnZSBuZXh0IGluZGV4IHZhbHVlICovXG4gICAgcHJpdmF0ZSBpbWdOZXh0OiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIGluaXRpYWwgc2NhbGUgdmFsdWUgKi9cbiAgICBwcml2YXRlIHN0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBDb250YWlucyBuZXcgc2NhbGUgdmFsdWUgd2hpbGUgbW92aW5nIHRoZSBpbWFnZSAqL1xuICAgIHByaXZhdGUgbmV3U2NhbGUgPSAxO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB3aGV0aGVyIHBpbmNoIGlzIHRyaWdnZXIgb3Igbm90ICovXG4gICAgcHJpdmF0ZSBpc1BpbmNoU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVggdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIC8qKiBUbyBzdG9yZSBvbGQgVHJhbnNsYXRlWSB2YWx1ZSBvZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgLyoqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90ICovXG4gICAgcHJpdmF0ZSBpc0dvdERlZmF1bHRMb2NhdGlvbiA9IGZhbHNlO1xuICAgIC8qKiBDb250YWlucyBpbWFnZSBkZWZhdWx0IHNjcmVlbiBsb2NhdGlvbiAqL1xuICAgIHByaXZhdGUgZGVmYXVsdFNjcmVlbkxvY2F0aW9uOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBJbWFnZVNsaWRlQ29tcG9uZW50IGNvbnN0cnVjdG9yLlxuICAgICAqIEBwYXJhbSBwYWdlIFBhZ2VcbiAgICAgKiBAcGFyYW0gcm91dGVyRXh0ZW5zaW9ucyBSb3V0ZXJFeHRlbnNpb25zXG4gICAgICogQHBhcmFtIHJvdXRlIEFjdGl2YXRlZFJvdXRlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXJcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlLFxuICAgICAgICBwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMsXG4gICAgICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyKSB7XG4gICAgICAgIHRoaXMucm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKChwYXJhbXMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW1nVVJJID0gcGFyYW1zWydpbWdVUkknXTtcbiAgICAgICAgICAgIHRoaXMuaW1nSW5kZXggPSBwYXJhbXNbJ2ltZ0luZGV4J107XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBwYWdlIHByb3BlcnRpZXMgbGlrZSBtZW51cyAoJ2RlbGV0ZScvJ3NoYXJlJykgYW5kIHRoZSBpbWFnZVxuICAgICAqIHByb3BlcnRpZXMgbGlrZSB0cmFuc2xhdGVYL3RyYW5zbGF0ZVkvc2NhbGVYL3NjYWxlWS5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5pbWdOZXh0ID0gdGhpcy5pbWdJbmRleDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgICAgIHRoaXMuaW1hZ2VGaWxlTGlzdCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtID0gdGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQgYXMgSW1hZ2U7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gMTtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgYmFjayB0byBwcmV2aW91cyBwYWdlIHdoZW4gdGhlIGJhY2sgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgICovXG4gICAgZ29CYWNrKCkge1xuICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBPbiBwaW5jaCBtZXRob2QsIGlzIGJlaW5nIGNhbGxlZCB3aGlsZSBwaW5jaCBldmVudCBmaXJlZCBvbiBpbWFnZSxcbiAgICAgKiB3aGVyZSB0aGUgbmV3IHNjYWxlLCB3aWR0aCAmIGhlaWdodCBvZiB0aGUgdHJhbnNmb3JtZWQgaW1hZ2UgaGF2ZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiB0byB6b29tLWluL291dC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBpbmNoR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uUGluY2goYXJnczogUGluY2hHZXN0dXJlRXZlbnREYXRhKSB7XG5cbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTY2FsZSA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVg7XG4gICAgICAgICAgICB0aGlzLmlzUGluY2hTZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSB0aGlzLnN0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWluKDE1LCB0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMubmV3U2NhbGUgPSBNYXRoLm1heCgwLjEsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gdGhpcy5uZXdTY2FsZTtcblxuICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLndpZHRoID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uaGVpZ2h0ID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLm5ld1NjYWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE9uIHBhbi9tb3ZlIG1ldGhvZCwgd2hpY2ggbW92ZXMgaW1hZ2Ugd2hlbiB1c2VyIHByZXNzICYgZHJhZyB3aXRoIGEgZmluZ2VyIGFyb3VuZFxuICAgICAqIHRoZSBpbWFnZSBhcmVhLiBIZXJlIHRoZSBpbWFnZSdzIHRyYWxhdGVYL3RyYW5zbGF0ZVkgdmFsdWVzIGFyZSBiZWVuIGNhbGN1bGF0ZWRcbiAgICAgKiBiYXNlZCBvbiB0aGUgaW1hZ2UncyBzY2FsZSwgd2lkdGggJiBoZWlnaHQuIEFuZCBhbHNvIGl0IHRha2VzIGNhcmUgb2YgaW1hZ2UgYm91bmRhcnlcbiAgICAgKiBjaGVja2luZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBhbkdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WCA9ICh0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpIC8gNCkgKiAodGhpcy5uZXdTY2FsZSk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5kcmFnSW1hZ2VJdGVtLm9yaWdpblg7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5kcmFnSW1hZ2VJdGVtLm9yaWdpblk7XG5cbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgIGNlbnRlclBvaW50WSA9IChjZW50ZXJQb2ludFkgKiAyKTtcbiAgICAgICAgICAgIC8vIGxldCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlIDwgMTUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID49IDE1KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWFRlbXAgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCArIGFyZ3MuZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVlUZW1wID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKyBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVYIDwgdHJhbnNsYXRlWFRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0cmFuc2xhdGVYVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA8IHRyYW5zbGF0ZVlUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdHJhbnNsYXRlWVRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMykge1xuICAgICAgICAgICAgdGhpcy5pc1BpbmNoU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEb3VibGUgdGFwIG1ldGhvZCBmaXJlcyBvbiB3aGVuIHVzZXIgdGFwcyB0d28gdGltZXMgb24gdHJhbnNmb3JtZWQgaW1hZ2UuXG4gICAgICogQWN0dWFsbHkgaXQgYnJpbmdzIHRoZSBpbWFnZSB0byBpdCdzIG9yaWdpbmFsIHBvc2l0aW9ucyBhbmQgYWxzbyBhZGRzXG4gICAgICogY2lyY2xlIHBvaW50cyBpZiBpdCBpcyBvcmlnaW5hbCBpbWFnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIEdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5hbmltYXRlKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICBjdXJ2ZTogJ2Vhc2VJbicsXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5ld1NjYWxlID0gMTtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gaW1hZ2VzbGlkZSBwYWdlIGlzIGxvYWRlZCxcbiAgICAgKiB3aGVyZSBpdCBzZXRzIHRoZSBzZWxlY3RlZCBpbWFnZSBpbiB0aGUgc291cmNlIGZvciBkaXNwbGF5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IG9iamVjdFxuICAgICAqL1xuICAgIHBhZ2VMb2FkZWQoYXJnczogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBzd2lwZSB3aXRoIGEgZmluZ3VyZS4gQWN0dWFsbHkgd2hlbiBhIGZpbmdlciBpcyBzd2lwZWRcbiAgICAgKiBpdCBjaGVja3MgdGhhdCB0aGUgc3dpcGUgaXMgcmlnaHQgZGlyZWN0IG9yIGxlZnQgZGlyZWN0aW9uLCBiYXNlZCBvbiB0aGF0IGl0IHB1bGxzIHRoZSBpbWFnZSBmcm9tXG4gICAgICogdGhlIGltYWdlIGxpc3QgYW5kIGRpc3BsYXkgaXQgaW4gdmlldy4gQWZ0ZXIgdGhhdCwgaXQgc2V0cyB0aGUgaW1hZ2UgaW4gZGVmYXVsdCBwb3NpdGlvbiBieSBjYWxsaW5nXG4gICAgICogb25Eb3VibGVUYXAgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgU3dpcGVHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPT09IDEgJiYgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9PT0gMSkge1xuICAgICAgICAgICAgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAyIHx8ICFhcmdzLmRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPD0gMCB8fCB0aGlzLmltZ05leHQgPj0gdGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLmRpcmVjdGlvbiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmltZ05leHQgPCAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9ICh0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmltZ0luZGV4ID0gdGhpcy5pbWdOZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIG9yaWdpbmFsIGltYWdlLlxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICogQHJldHVybnMgaW1hZ2UgdXJpXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgcmV0dXJuIHVyaTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBTaGFyZXMgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgc2hhcmUgYnV0dG9uLiBUaGUgc2hhcmluZyBjYW4gYmUgZG9uZVxuICAgICAqIHZpYSBhbnkgb25lIG9mIHRoZSBtZWRpYXMgc3VwcG9ydGVkIGJ5IGFuZHJvaWQgZGV2aWNlIGJ5IGRlZmF1bHQuIFRoZSBsaXN0IG9mIHN1cHBvcnRlZFxuICAgICAqIG1lZGlhcyB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2hhcmUgYnV0dG9uIGNsaWNrZWQuXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcblxuICAgICAgICBjb25zdCBkYXRhVG9TaGFyZTogYW55ID0ge307XG4gICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xuICAgICAgICBjb25zdCBkb2N1bWVudHMgPSBmcy5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCB0aHVtYm5haWxJbWdGaWxlTmFtZSA9IHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVOYW1lO1xuXG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnID0gdGh1bWJuYWlsSW1nRmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgbGV0IGltZ0ZpbGVQYXRoID0gZnMucGF0aC5qb2luKGRvY3VtZW50cy5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnLCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVUlJbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChpbWdGaWxlUGF0aCk7XG4gICAgICAgICAgICBkYXRhVG9TaGFyZVtkYXRhQ291bnQrK10gPSB0cmFuc2Zvcm1lZFVJSW1hZ2U7XG5cbiAgICAgICAgICAgIC8vIEdldHRpbmcgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2VcbiAgICAgICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1nRmlsZU5hbWVPcmcucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgICAgICAgICAgaW1nRmlsZVBhdGggPSBmcy5wYXRoLmpvaW4oZG9jdW1lbnRzLnBhdGgsICdjYXB0dXJlZGltYWdlcycsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVUlJbWFnZU9yZyA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChpbWdGaWxlUGF0aCk7XG4gICAgICAgICAgICBkYXRhVG9TaGFyZVtkYXRhQ291bnQrK10gPSB0cmFuc2Zvcm1lZFVJSW1hZ2VPcmc7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5zaGFyZShkYXRhVG9TaGFyZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlICdkZWxldGUnIGJ1dHRvbiBpbiBtZW51LlxuICAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAgKiB0byBiZSBkZWxldGVkLiBJZiB1c2VyIHNheXMgJ09rJywgdGhlbiB0aG9zZSBpbWFnZShzKSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IGJvamVjdFxuICAgICAqL1xuICAgIG9uRGVsZXRlKGFyZ3M6IGFueSkge1xuICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nwqBzZWxlY3RlZMKgaXRlbShzKS4uLicsXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gMTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUZpbGVMaXN0LnNwbGljZSh0aGlzLmltZ05leHQsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1NlbGVjdGVkIGltYWdlIGRlbGV0ZWQuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggPD0gdGhpcy5pbWdOZXh0LnZhbHVlT2YoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltZ05leHQgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ05vIGltYWdlIGF2YWlsYWJsZS4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzLm9uU3dpcGUoYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIGVycm9yLnN0YWNrLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2UuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIG9yaWdpbmFsIGltYWdlLiAnICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19