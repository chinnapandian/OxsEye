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
var file_system_1 = require("tns-core-modules/file-system");
var router_1 = require("nativescript-angular/router");
var page_1 = require("tns-core-modules/ui/page");
var router_2 = require("@angular/router");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var image_source_1 = require("tns-core-modules/image-source");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Toast = require("nativescript-toast");
var Permissions = require("nativescript-permissions");
/**
 * ImageSlideComponent Component.
 */
var ImageSlideComponent = (function () {
    /**
     * ImageSlideComponent constructor.
     * @param page Page
     * @param routerExtensions RouterExtensions
     * @param route ActivatedRoute
     * @param transformedImageProvider TransformedImageProvider
     */
    function ImageSlideComponent(page, routerExtensions, route, transformedImageProvider) {
        var _this = this;
        this.page = page;
        this.routerExtensions = routerExtensions;
        this.route = route;
        this.transformedImageProvider = transformedImageProvider;
        /** Contains initial scale value */
        this._startScale = 1;
        /** Contains new scale value while moving the image */
        this._newScale = 1;
        /** To indicate whether pinch is trigger or not */
        this._isPinchSelected = false;
        /** To store old TranslateX value of image */
        this._oldTranslateX = 0;
        /** To store old TranslateY value of image */
        this._oldTranslateY = 0;
        /** Indicates whether the image got default screen location or not */
        this._isGotDefaultLocation = false;
        this.route.queryParams.subscribe(function (params) {
            _this._imgURI = params['imgURI'];
            _this._imgIndex = params['imgIndex'];
        });
    }
    /**
     * Angular initialization.
     */
    ImageSlideComponent.prototype.ngOnInit = function () {
        this._imgNext = this._imgIndex;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new image_source_1.ImageSource();
        this._imageFileList = this.transformedImageProvider.imageList;
        this._dragImageItem = this._dragImage.nativeElement;
        this._dragImageItem.translateX = 0;
        this._dragImageItem.translateY = 0;
        this._dragImageItem.scaleX = 1;
        this._dragImageItem.scaleY = 1;
    };
    /**
     * Go back to previous page
     */
    ImageSlideComponent.prototype.goBack = function () {
        this.routerExtensions.back();
    };
    /**
     * Triggers while pinch with two fingers.
     * @param args PinchGestureEventData
     */
    ImageSlideComponent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            this._startScale = this._dragImageItem.scaleX;
            this._isPinchSelected = true;
        }
        else if (args.scale && args.scale !== 1) {
            this._newScale = this._startScale * args.scale;
            this._newScale = Math.min(15, this._newScale);
            this._newScale = Math.max(0.1, this._newScale);
            this._dragImageItem.scaleX = this._newScale;
            this._dragImageItem.scaleY = this._newScale;
            this._dragImageItem.width = this._dragImageItem.getMeasuredWidth() * this._newScale;
            this._dragImageItem.height = this._dragImageItem.getMeasuredHeight() * this._newScale;
        }
    };
    /**
     * Moves images while move with a finger.
     * @param args PanGestureEventData
     */
    ImageSlideComponent.prototype.onPan = function (args) {
        var screenLocation = this._dragImageItem.getLocationOnScreen();
        var centerPointX = (this._dragImageItem.getMeasuredWidth() / 4) * (this._newScale);
        var centerPointY = (this._dragImageItem.getMeasuredHeight() / 4) * (this._newScale);
        var imageViewWidth = this._dragImageItem.getMeasuredWidth() * this._dragImageItem.originX;
        var imageViewHeight = this._dragImageItem.getMeasuredHeight() * this._dragImageItem.originY;
        if (args.state === 1) {
            this._prevDeltaX = 0;
            this._prevDeltaY = 0;
        }
        else if (args.state === 2) {
            centerPointX = (centerPointX * 2);
            centerPointY = (centerPointY * 2);
            // let screenLocation = this._dragImageItem.getLocationOnScreen();
            if (this._newScale < 15) {
                if (!this._isGotDefaultLocation) {
                    this._defaultScreenLocation = screenLocation;
                    this._isGotDefaultLocation = true;
                }
                if (this._newScale > 1) {
                    if ((screenLocation.x - this._defaultScreenLocation.x) <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation.x - this._defaultScreenLocation.x)) {
                        this._dragImageItem.translateX += args.deltaX - this._prevDeltaX;
                        this._oldTranslateX = this._dragImageItem.translateX;
                    }
                    else {
                        if (this._oldTranslateX > 0) {
                            this._oldTranslateX--;
                        }
                        else {
                            this._oldTranslateX++;
                        }
                        this._dragImageItem.translateX = this._oldTranslateX;
                    }
                    if ((screenLocation.y - this._defaultScreenLocation.y) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation.y - this._defaultScreenLocation.y)) {
                        this._dragImageItem.translateY += args.deltaY - this._prevDeltaY;
                        this._oldTranslateY = this._dragImageItem.translateY;
                    }
                    else {
                        if (this._oldTranslateY > 0) {
                            this._oldTranslateY--;
                        }
                        else {
                            this._oldTranslateY++;
                        }
                        this._dragImageItem.translateY = this._oldTranslateY;
                    }
                }
            }
            if (this._newScale >= 15) {
                var translateXTemp = this._dragImageItem.translateX + args.deltaX - this._prevDeltaX;
                var translateYTemp = this._dragImageItem.translateY + args.deltaY - this._prevDeltaY;
                if (this._oldTranslateX < translateXTemp) {
                    this._dragImageItem.translateX = this._oldTranslateX;
                }
                else {
                    this._dragImageItem.translateX = translateXTemp;
                }
                if (this._oldTranslateY < translateYTemp) {
                    this._dragImageItem.translateY = this._oldTranslateY;
                }
                else {
                    this._dragImageItem.translateY = translateYTemp;
                }
            }
            this._prevDeltaX = args.deltaX;
            this._prevDeltaY = args.deltaY;
        }
        else if (args.state === 3) {
            this._isPinchSelected = false;
        }
    };
    /**
     * Resets image position while double tap with single fingure.
     * @param args GestureEventData
     */
    ImageSlideComponent.prototype.onDoubleTap = function (args) {
        this._dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: 'easeIn',
            duration: 10,
        });
        this._newScale = 1;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    };
    /**
     * Sets the selected image in the image source while page loaded.
     * @param args any object
     */
    ImageSlideComponent.prototype.pageLoaded = function (args) {
        if (this._imageFileList.length > 0) {
            this.imageSource = this._imageFileList[this._imgIndex].filePath;
        }
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    };
    /**
     * Move image left/right while on swipe with fingure.
     * @param args SwipeGestureEventData
     */
    ImageSlideComponent.prototype.onSwipe = function (args) {
        if (this._dragImageItem.scaleX === 1 && this._dragImageItem.scaleY === 1) {
            if (args.direction === 2 || !args.direction) {
                this._imgNext++;
                if (this._imgNext <= 0 || this._imgNext >= this._imageFileList.length) {
                    this._imgNext = 0;
                }
            }
            else if (args.direction === 1) {
                this._imgNext--;
                if (this._imgNext < 0 || this._imgNext >= this._imageFileList.length) {
                    this._imgNext = (this._imageFileList.length - 1);
                }
            }
            this._imgIndex = this._imgNext;
            if (this._imageFileList.length > 0) {
                this.imageSource = this._imageFileList[this._imgNext].filePath;
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
    //  * 
    //  * @returns image uri
    //  */
    // private getOriginalImage(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
    //     let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
    //     imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     return uri;
    // }
    /**
     * Shares image(s) while on share.
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
                var imgFileNameOrg = _this._imageFileList[_this._imgNext].fileName;
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
                filesToBeAttached = filesToBeAttached.concat(',' + _this._imageFileList[_this._imgNext].filePath);
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
            catch (e) {
                Toast.makeText('Error while sending mail.' + e).show();
                console.log('is exception raises during sending mail ' + e);
            }
        }).catch(function () {
            Toast.makeText('Error in giving permission.').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    /**
     * Delete selected image.
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
                if (_this._imageFileList.length > 0) {
                    _this._dragImageItem.translateX = 0;
                    _this._dragImageItem.translateY = 0;
                    _this._dragImageItem.scaleX = 1;
                    _this._dragImageItem.scaleY = 1;
                    var file = file_system_1.File.fromPath(_this._imageFileList[_this._imgNext].filePath);
                    file.remove()
                        .then(function () {
                        var thumbnailFile = file_system_1.File.fromPath(_this._imageFileList[_this._imgNext].thumbnailPath);
                        thumbnailFile.remove()
                            .then(function () {
                            transformedimage_provider_1.SendBroadcastImage(_this._imageFileList[_this._imgNext].thumbnailPath);
                            _this._imageFileList.splice(_this._imgNext, 1);
                            Toast.makeText('Selected image deleted.').show();
                            if (_this._imageFileList.length > 0) {
                                if (_this._imageFileList.length == _this._imgNext.valueOf()) {
                                    _this._imgNext = 0;
                                }
                                _this.imageSource = _this._imageFileList[_this._imgNext].filePath;
                            }
                            else {
                                _this.imageSource = null;
                                _this.isDeleting = false;
                                _this.isSharing = false;
                                Toast.makeText('No image available.').show();
                            }
                            // this.onSwipe(args);
                        }).catch(function (err) {
                            console.log('Error while deleting thumbnail image. ' + err.stack);
                        });
                    }).catch(function (err) {
                        console.log('Error while deleting original image. ' + err.stack);
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
        router_1.RouterExtensions,
        router_2.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlc2xpZGUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUU7QUFDekUsNERBQW9EO0FBQ3BELHNEQUErRDtBQUcvRCxpREFBZ0Q7QUFFaEQsMENBQWlEO0FBQ2pELG9GQUFzRztBQUN0Ryw4REFBNEQ7QUFFNUQsMERBQTREO0FBQzVELHFEQUF1RDtBQUN2RCwwQ0FBNEM7QUFDNUMsc0RBQXdEO0FBRXhEOztHQUVHO0FBT0gsSUFBYSxtQkFBbUI7SUFzQzVCOzs7Ozs7T0FNRztJQUNILDZCQUNZLElBQVUsRUFDVixnQkFBa0MsRUFDbEMsS0FBcUIsRUFDckIsd0JBQWtEO1FBSjlELGlCQVNDO1FBUlcsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQTFCOUQsbUNBQW1DO1FBQzNCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLHNEQUFzRDtRQUM5QyxjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCLGtEQUFrRDtRQUMxQyxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDakMsNkNBQTZDO1FBQ3JDLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLDZDQUE2QztRQUN0QyxtQkFBYyxHQUFHLENBQUMsQ0FBQztRQUMxQixxRUFBcUU7UUFDOUQsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBZ0JsQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsVUFBQyxNQUFNO1lBQ3BDLEtBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2hDLEtBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxD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LFVBQUMsR0FBRzt3QkFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDckUsQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixLQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztvQkFDeEIsS0FBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLEtBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUN2QixLQUFLLENBQUMsUUFBUSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2pELENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsMEJBQUM7QUFBRCxDQUFDLEFBM1ZELElBMlZDO0FBblY0QjtJQUF4QixnQkFBUyxDQUFDLFlBQVksQ0FBQzs4QkFBYSxpQkFBVTt1REFBQztBQVJ2QyxtQkFBbUI7SUFOL0IsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQztRQUN6QyxXQUFXLEVBQUUsNkJBQTZCO0tBQzdDLENBQUM7cUNBK0NvQixXQUFJO1FBQ1EseUJBQWdCO1FBQzNCLHVCQUFjLHNCQUNLLG9EQUF3QixvQkFBeEIsb0RBQXdCO0dBakRyRCxtQkFBbUIsQ0EyVi9CO0FBM1ZZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9kYXRhL29ic2VydmFibGUnO1xuaW1wb3J0IHsgU3dpcGVHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9nZXN0dXJlcyc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcbmltcG9ydCB7IEdlc3R1cmVFdmVudERhdGEsIFBhbkdlc3R1cmVFdmVudERhdGEsIFBpbmNoR2VzdHVyZUV2ZW50RGF0YSB9IGZyb20gJ3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBJbWFnZSB9IGZyb20gJ3VpL2ltYWdlJztcbmltcG9ydCAqwqBhc8KgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG4vKipcbiAqIEltYWdlU2xpZGVDb21wb25lbnQgQ29tcG9uZW50LlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWltYWdlc2xpZGUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlc2xpZGUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZVNsaWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogIFVzZWQgdG8gc3RvcmUgaW1hZ2Ugc291cmNlIGFuZCBhbHNvIHVzZWQgaW4gR1VJICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcbiAgICAvKiogIFRvIGluZGljYXRlIHRoZSBzaGFyaW5nIG1lbnUgaXMgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwdWJsaWMgaXNTaGFyaW5nOiBib29sZWFuO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB0aGUgZGVsZXRpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBDaGlsZCBlbGVtZW50IHJlZmVycmVuY2UgKi9cbiAgICBAVmlld0NoaWxkKCdpbWdTbGlkZUlkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcbiAgICAvKiogSW1hZ2UgVVJJICovXG4gICAgcHJpdmF0ZSBfaW1nVVJJOiBzdHJpbmc7XG4gICAgLyoqIEltYWdlIGluZGV4IGJlaW5nIHVzZWQgdG8gZ2V0IGFuIGltYWdlIGZvciB0aGUgZ2l2ZW4gaW5kZXggKi9cbiAgICBwcml2YXRlIF9pbWdJbmRleDogbnVtYmVyO1xuICAgIC8qKiBJbWFnZSByZWZlcnJlbmNlIGZyb20gX2RyYWdJbWFnZSAqL1xuICAgIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVggdmFsdWUgKi9cbiAgICBwcml2YXRlIF9wcmV2RGVsdGFYOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIHByZXZpb3VzIGRlbHRhWSB2YWx1ZSAqL1xuICAgIHByaXZhdGUgX3ByZXZEZWx0YVk6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgbGlzdCBvZiBpbWFnZSBmaWxlIHBhdGggaW5mb3JtYXRpb24gKi9cbiAgICBwcml2YXRlIF9pbWFnZUZpbGVMaXN0OiBhbnlbXTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgbmV4dCBpbmRleCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgX2ltZ05leHQ6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgaW5pdGlhbCBzY2FsZSB2YWx1ZSAqL1xuICAgIHByaXZhdGUgX3N0YXJ0U2NhbGUgPSAxO1xuICAgIC8qKiBDb250YWlucyBuZXcgc2NhbGUgdmFsdWUgd2hpbGUgbW92aW5nIHRoZSBpbWFnZSAqL1xuICAgIHByaXZhdGUgX25ld1NjYWxlID0gMTtcbiAgICAvKiogVG8gaW5kaWNhdGUgd2hldGhlciBwaW5jaCBpcyB0cmlnZ2VyIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgX2lzUGluY2hTZWxlY3RlZCA9IGZhbHNlO1xuICAgIC8qKiBUbyBzdG9yZSBvbGQgVHJhbnNsYXRlWCB2YWx1ZSBvZiBpbWFnZSAqL1xuICAgIHByaXZhdGUgX29sZFRyYW5zbGF0ZVggPSAwO1xuICAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVkgdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIF9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgLyoqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBpbWFnZSBnb3QgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gb3Igbm90ICovXG4gICAgcHJpdmF0ZSBfaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAgLyoqIENvbnRhaW5zIGltYWdlIGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uICovXG4gICAgcHJpdmF0ZSBfZGVmYXVsdFNjcmVlbkxvY2F0aW9uOiBhbnk7XG4gICAgXG4gICAgLyoqXG4gICAgICogSW1hZ2VTbGlkZUNvbXBvbmVudCBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gcGFnZSBQYWdlXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyRXh0ZW5zaW9uc1xuICAgICAqIEBwYXJhbSByb3V0ZSBBY3RpdmF0ZWRSb3V0ZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcikge1xuICAgICAgICB0aGlzLnJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZSgocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9pbWdVUkkgPSBwYXJhbXNbJ2ltZ1VSSSddO1xuICAgICAgICAgICAgdGhpcy5faW1nSW5kZXggPSBwYXJhbXNbJ2ltZ0luZGV4J107XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBbmd1bGFyIGluaXRpYWxpemF0aW9uLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLl9pbWdOZXh0ID0gdGhpcy5faW1nSW5kZXg7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuICAgICAgICB0aGlzLl9pbWFnZUZpbGVMaXN0ID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtID0gdGhpcy5fZHJhZ0ltYWdlLm5hdGl2ZUVsZW1lbnQgYXMgSW1hZ2U7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYID0gMTtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHbyBiYWNrIHRvIHByZXZpb3VzIHBhZ2VcbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzIHdoaWxlIHBpbmNoIHdpdGggdHdvIGZpbmdlcnMuXG4gICAgICogQHBhcmFtIGFyZ3MgUGluY2hHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRTY2FsZSA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYO1xuICAgICAgICAgICAgdGhpcy5faXNQaW5jaFNlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSB0aGlzLl9zdGFydFNjYWxlICogYXJncy5zY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gTWF0aC5taW4oMTUsIHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gTWF0aC5tYXgoMC4xLCB0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSB0aGlzLl9uZXdTY2FsZTtcblxuICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS53aWR0aCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLmhlaWdodCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX25ld1NjYWxlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmVzIGltYWdlcyB3aGlsZSBtb3ZlIHdpdGggYSBmaW5nZXIuXG4gICAgICogQHBhcmFtIGFyZ3MgUGFuR2VzdHVyZUV2ZW50RGF0YVxuICAgICAqL1xuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgY29uc3Qgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WCA9ICh0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAvIDQpICogKHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WSA9ICh0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld1dpZHRoID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLl9kcmFnSW1hZ2VJdGVtLm9yaWdpblg7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX2RyYWdJbWFnZUl0ZW0ub3JpZ2luWTtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAyKSB7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG4gICAgICAgICAgICAvLyBsZXQgc2NyZWVuTG9jYXRpb24gPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX25ld1NjYWxlIDwgMTUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuX2lzR290RGVmYXVsdExvY2F0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbiA9IHNjcmVlbkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9uZXdTY2FsZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFggLSBpbWFnZVZpZXdXaWR0aCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi54IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5fcHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMuX29sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5fZGVmYXVsdFNjcmVlbkxvY2F0aW9uLnkpIDw9IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICYmIChjZW50ZXJQb2ludFkgLSBpbWFnZVZpZXdIZWlnaHQpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLl9vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX25ld1NjYWxlID49IDE1KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWFRlbXAgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggKyBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWVRlbXAgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKyBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVggPCB0cmFuc2xhdGVYVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLl9vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRyYW5zbGF0ZVhUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWSA8IHRyYW5zbGF0ZVlUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRoaXMuX29sZFRyYW5zbGF0ZVk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdHJhbnNsYXRlWVRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gYXJncy5kZWx0YVg7XG4gICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFZID0gYXJncy5kZWx0YVk7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnN0YXRlID09PSAzKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1BpbmNoU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXNldHMgaW1hZ2UgcG9zaXRpb24gd2hpbGUgZG91YmxlIHRhcCB3aXRoIHNpbmdsZSBmaW5ndXJlLlxuICAgICAqIEBwYXJhbSBhcmdzIEdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgY3VydmU6ICdlYXNlSW4nLFxuICAgICAgICAgICAgZHVyYXRpb246IDEwLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSAxO1xuICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHNlbGVjdGVkIGltYWdlIGluIHRoZSBpbWFnZSBzb3VyY2Ugd2hpbGUgcGFnZSBsb2FkZWQuXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IG9iamVjdFxuICAgICAqL1xuICAgIHBhZ2VMb2FkZWQoYXJnczogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBvbiBzd2lwZSB3aXRoIGZpbmd1cmUuXG4gICAgICogQHBhcmFtIGFyZ3MgU3dpcGVHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYID09PSAxICYmIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDIgfHwgIWFyZ3MuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbWdOZXh0IDw9IDAgfHwgdGhpcy5faW1nTmV4dCA+PSB0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0ID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ltZ05leHQgPCAwIHx8IHRoaXMuX2ltZ05leHQgPj0gdGhpcy5faW1hZ2VGaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dCA9ICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5faW1nSW5kZXggPSB0aGlzLl9pbWdOZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIG9yaWdpbmFsIGltYWdlLlxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFxuICAgIC8vICAqIFxuICAgIC8vICAqIEByZXR1cm5zIGltYWdlIHVyaVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcblxuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgcmV0dXJuIHVyaTtcbiAgICAvLyB9XG5cbiAgICAvKipcbiAgICAgKiBTaGFyZXMgaW1hZ2Uocykgd2hpbGUgb24gc2hhcmUuXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLklOVEVSTkVUXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmlsZXNUb0JlQXR0YWNoZWQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdGhpcy5faW1hZ2VGaWxlTGlzdFt0aGlzLl9pbWdOZXh0XS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZShpbWdGaWxlTmFtZU9yZykpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzVG9CZUF0dGFjaGVkID0gZmlsZXNUb0JlQXR0YWNoZWQuY29uY2F0KCcsJyArIHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJpcy5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudChhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkFDVElPTl9TRU5EX01VTFRJUExFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKCdpbWFnZS9qcGVnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXPCoDrCoCcgKyBmaWxlc1RvQmVBdHRhY2hlZCArICcuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzLi4uJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRQYXJjZWxhYmxlQXJyYXlMaXN0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVFJFQU0sIHVyaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9XUklURV9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnN0YXJ0QWN0aXZpdHkoYW5kcm9pZC5jb250ZW50LkludGVudC5jcmVhdGVDaG9vc2VyKGludGVudCwgJ1NlbmQgbWFpbC4uLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHNlbmRpbmcgbWFpbC4nICsgZSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXPCoGV4Y2VwdGlvbsKgcmFpc2VzwqBkdXJpbmfCoHNlbmRpbmfCoG1haWzCoCcgKyBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSknKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgc2VsZWN0ZWQgaW1hZ2UuXG4gICAgICogQHBhcmFtIGFyZ3MgYW55IGJvamVjdFxuICAgICAqL1xuICAgIG9uRGVsZXRlKGFyZ3M6IGFueSkge1xuICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nwqBzZWxlY3RlZMKgaXRlbShzKS4uLicsXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5faW1hZ2VGaWxlTGlzdFt0aGlzLl9pbWdOZXh0XS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWFnZUZpbGVMaXN0LnNwbGljZSh0aGlzLl9pbWdOZXh0LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdTZWxlY3RlZCBpbWFnZSBkZWxldGVkLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5faW1hZ2VGaWxlTGlzdC5sZW5ndGggPT0gdGhpcy5faW1nTmV4dC52YWx1ZU9mKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcy5vblN3aXBlKGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIG9yaWdpbmFsIGltYWdlLiAnICsgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ05vIGltYWdlIGF2YWlsYWJsZS4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=