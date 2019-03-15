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
var ImageSlideComponent = (function () {
    function ImageSlideComponent(page, routerExtensions, route, transformedImageProvider) {
        var _this = this;
        this.page = page;
        this.routerExtensions = routerExtensions;
        this.route = route;
        this.transformedImageProvider = transformedImageProvider;
        this._startScale = 1;
        this._newScale = 1;
        this._isPinchSelected = false;
        this._oldOriginX = 0;
        this._oldOriginY = 0;
        this._newOriginX = 0;
        this._newOriginY = 0;
        this._oldTranslateX = 0;
        this._oldTranslateY = 0;
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
        this._isBusy = false;
        this.isDeleting = true;
        this.isSharing = true;
        this.imageSource = new image_source_1.ImageSource();
        this._imageFileList = this.transformedImageProvider.imageList;
        this._dragImageItem = this._dragImage.nativeElement;
        this._dragImageItem.translateX = 0;
        this._dragImageItem.translateY = 0;
        this._dragImageItem.scaleX = 1;
        this._dragImageItem.scaleY = 1;
        this._naviBarHeight = 0;
    };
    /**
     * Go back to previous page
     */
    ImageSlideComponent.prototype.goBack = function () {
        this.routerExtensions.back();
    };
    /**
     * Triggers while pinch with two fingers.
     * @param args
     */
    ImageSlideComponent.prototype.onPinch = function (args) {
        if (args.state === 1) {
            this._newOriginX = args.getFocusX() - this._dragImageItem.translateX;
            this._newOriginY = args.getFocusY() - this._dragImageItem.translateY;
            this._oldOriginX = this._dragImageItem.originX * this._dragImageItem.getMeasuredWidth();
            this._oldOriginY = this._dragImageItem.originY * this._dragImageItem.getMeasuredHeight();
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
     * @param args
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
     * @param args
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
     * @param args
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
     * @param args
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
    /**
     * Gets original image.
     * @param transformedImage
     *
     * @returns image uri
     */
    ImageSlideComponent.prototype.getOriginalImage = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
        var imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
        application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    };
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
                var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
                application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                uris.add(uri);
                uris.add(_this.getOriginalImage(imgFileNameOrg));
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
     * @param args
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
                            _this.onSwipe(args);
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
    })
    /**
     * ImageSlideComponent class
     */
    ,
    __metadata("design:paramtypes", [page_1.Page,
        router_1.RouterExtensions,
        router_2.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlc2xpZGUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUU7QUFDekUsNERBQW9EO0FBQ3BELHNEQUErRDtBQUcvRCxpREFBZ0Q7QUFFaEQsMENBQWlEO0FBQ2pELG9GQUFzRztBQUN0Ryw4REFBNEQ7QUFFNUQsMERBQTREO0FBQzVELHFEQUF1RDtBQUN2RCwwQ0FBNEM7QUFDNUMsc0RBQXdEO0FBWXhELElBQWEsbUJBQW1CO0lBMkI1Qiw2QkFDWSxJQUFVLEVBQ1YsZ0JBQWtDLEVBQ2xDLEtBQXFCLEVBQ3JCLHdCQUFrRDtRQUo5RCxpQkFTQztRQVJXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFoQnRELGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGNBQVMsR0FBRyxDQUFDLENBQUM7UUFDZCxxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFDekIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsZ0JBQVcsR0FBRyxDQUFDLENBQUM7UUFDaEIsbUJBQWMsR0FBRyxDQUFDLENBQUM7UUFDbkIsbUJBQWMsR0FBRyxDQUFDLENBQUM7UUFDbkIsMEJBQXFCLEdBQUcsS0FBSyxDQUFDO1FBUWxDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFDLE1BQU07WUFDcEMsS0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsS0FBSSxDQUFDLFNBQVMsR0FBRyxNQUFN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QUFTLENBQUMsWUFBWSxDQUFDOzhCQUFhLGlCQUFVO3VEQUFDO0FBTHZDLG1CQUFtQjtJQVYvQixnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDRCQUE0QixDQUFDO1FBQ3pDLFdBQVcsRUFBRSw2QkFBNkI7S0FDN0MsQ0FBQztJQUVGOztPQUVHOztxQ0E2Qm1CLFdBQUk7UUFDUSx5QkFBZ0I7UUFDM0IsdUJBQWMsc0JBQ0ssb0RBQXdCLG9CQUF4QixvREFBd0I7R0EvQnJELG1CQUFtQixDQWlVL0I7QUFqVVksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZSc7XG5pbXBvcnQgeyBTd2lwZUdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuaW1wb3J0IHsgR2VzdHVyZUV2ZW50RGF0YSwgUGFuR2VzdHVyZUV2ZW50RGF0YSwgUGluY2hHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSAndWkvZ2VzdHVyZXMnO1xuaW1wb3J0IHsgQWN0aXZhdGVkUm91dGUgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAndWkvaW1hZ2UnO1xuaW1wb3J0ICrCoGFzwqBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqwqBhc8KgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VzbGlkZScsXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgICBzdHlsZVVybHM6IFsnLi9pbWFnZXNsaWRlLmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuaHRtbCcsXG59KVxuXG4vKipcbiAqIEltYWdlU2xpZGVDb21wb25lbnQgY2xhc3NcbiAqL1xuZXhwb3J0IGNsYXNzIEltYWdlU2xpZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcbiAgICBwdWJsaWMgaXNTaGFyaW5nOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIEBWaWV3Q2hpbGQoJ2ltZ1NsaWRlSWQnKSBfZHJhZ0ltYWdlOiBFbGVtZW50UmVmO1xuICAgIHByaXZhdGUgX2ltZ1VSSTogc3RyaW5nO1xuICAgIHByaXZhdGUgX2ltZ0luZGV4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfZHJhZ0ltYWdlSXRlbTogSW1hZ2U7XG4gICAgcHJpdmF0ZSBfcHJldkRlbHRhWDogbnVtYmVyO1xuICAgIHByaXZhdGUgX3ByZXZEZWx0YVk6IG51bWJlcjtcbiAgICBwcml2YXRlIF9pbWFnZUZpbGVMaXN0OiBhbnlbXTtcbiAgICBwcml2YXRlIF9pbWdOZXh0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaXNCdXN5OiBib29sZWFuO1xuICAgIHByaXZhdGUgX25hdmlCYXJIZWlnaHQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9zdGFydFNjYWxlID0gMTtcbiAgICBwcml2YXRlIF9uZXdTY2FsZSA9IDE7XG4gICAgcHJpdmF0ZSBfaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfb2xkT3JpZ2luWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkT3JpZ2luWSA9IDA7XG4gICAgcHJpdmF0ZSBfbmV3T3JpZ2luWCA9IDA7XG4gICAgcHJpdmF0ZSBfbmV3T3JpZ2luWSA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgcHJpdmF0ZSBfaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICBwcml2YXRlIF9kZWZhdWx0U2NyZWVuTG9jYXRpb246IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHBhZ2U6IFBhZ2UsXG4gICAgICAgIHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZTogQWN0aXZhdGVkUm91dGUsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIpIHtcbiAgICAgICAgdGhpcy5yb3V0ZS5xdWVyeVBhcmFtcy5zdWJzY3JpYmUoKHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgdGhpcy5faW1nVVJJID0gcGFyYW1zWydpbWdVUkknXTtcbiAgICAgICAgICAgIHRoaXMuX2ltZ0luZGV4ID0gcGFyYW1zWydpbWdJbmRleCddO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQW5ndWxhciBpbml0aWFsaXphdGlvbi5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5faW1nTmV4dCA9IHRoaXMuX2ltZ0luZGV4O1xuICAgICAgICB0aGlzLl9pc0J1c3kgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbmV3IEltYWdlU291cmNlKCk7XG4gICAgICAgIHRoaXMuX2ltYWdlRmlsZUxpc3QgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3Q7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSB0aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudCBhcyBJbWFnZTtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgICAgIHRoaXMuX25hdmlCYXJIZWlnaHQgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHbyBiYWNrIHRvIHByZXZpb3VzIHBhZ2VcbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyaWdnZXJzIHdoaWxlIHBpbmNoIHdpdGggdHdvIGZpbmdlcnMuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5fbmV3T3JpZ2luWCA9IGFyZ3MuZ2V0Rm9jdXNYKCkgLSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICB0aGlzLl9uZXdPcmlnaW5ZID0gYXJncy5nZXRGb2N1c1koKSAtIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWTtcbiAgICAgICAgICAgIHRoaXMuX29sZE9yaWdpblggPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLm9yaWdpblggKiB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKTtcbiAgICAgICAgICAgIHRoaXMuX29sZE9yaWdpblkgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLm9yaWdpblkgKiB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFNjYWxlID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVg7XG4gICAgICAgICAgICB0aGlzLl9pc1BpbmNoU2VsZWN0ZWQgPSB0cnVlO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zY2FsZSAmJiBhcmdzLnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IHRoaXMuX3N0YXJ0U2NhbGUgKiBhcmdzLnNjYWxlO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSBNYXRoLm1pbigxNSwgdGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSBNYXRoLm1heCgwLjEsIHRoaXMuX25ld1NjYWxlKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYID0gdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IHRoaXMuX25ld1NjYWxlO1xuXG4gICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLndpZHRoID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgKiB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uaGVpZ2h0ID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5fbmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgaW1hZ2VzIHdoaWxlIG1vdmUgd2l0aCBhIGZpbmdlci5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpIC8gNCkgKiAodGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdXaWR0aCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5fZHJhZ0ltYWdlSXRlbS5vcmlnaW5YO1xuICAgICAgICBjb25zdCBpbWFnZVZpZXdIZWlnaHQgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLl9kcmFnSW1hZ2VJdGVtLm9yaWdpblk7XG5cbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSAwO1xuICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMikge1xuICAgICAgICAgICAgY2VudGVyUG9pbnRYID0gKGNlbnRlclBvaW50WCAqIDIpO1xuICAgICAgICAgICAgY2VudGVyUG9pbnRZID0gKGNlbnRlclBvaW50WSAqIDIpO1xuICAgICAgICAgICAgLy8gbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9uZXdTY2FsZSA8IDE1KSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0dvdERlZmF1bHRMb2NhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faXNHb3REZWZhdWx0TG9jYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fbmV3U2NhbGUgPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCArPSBhcmdzLmRlbHRhWCAtIHRoaXMuX3ByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWC0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLl9vbGRUcmFuc2xhdGVYO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICgoc2NyZWVuTG9jYXRpb24ueSAtIHRoaXMuX2RlZmF1bHRTY3JlZW5Mb2NhdGlvbi55KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRZIC0gaW1hZ2VWaWV3SGVpZ2h0KSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLnkgLSB0aGlzLl9kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKz0gYXJncy5kZWx0YVkgLSB0aGlzLl9wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbGRUcmFuc2xhdGVZID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5fb2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLl9uZXdTY2FsZSA+PSAxNSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVhUZW1wID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICsgYXJncy5kZWx0YVggLSB0aGlzLl9wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVlUZW1wID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZICsgYXJncy5kZWx0YVkgLSB0aGlzLl9wcmV2RGVsdGFZO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbGRUcmFuc2xhdGVYIDwgdHJhbnNsYXRlWFRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdGhpcy5fb2xkVHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0cmFuc2xhdGVYVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVkgPCB0cmFuc2xhdGVZVGVtcCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLl9vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRyYW5zbGF0ZVlUZW1wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWCA9IGFyZ3MuZGVsdGFYO1xuICAgICAgICAgICAgdGhpcy5fcHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMykge1xuICAgICAgICAgICAgdGhpcy5faXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVzZXRzIGltYWdlIHBvc2l0aW9uIHdoaWxlIGRvdWJsZSB0YXAgd2l0aCBzaW5nbGUgZmluZ3VyZS5cbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uYW5pbWF0ZSh7XG4gICAgICAgICAgICB0cmFuc2xhdGU6IHsgeDogMCwgeTogMCB9LFxuICAgICAgICAgICAgc2NhbGU6IHsgeDogMSwgeTogMSB9LFxuICAgICAgICAgICAgY3VydmU6ICdlYXNlSW4nLFxuICAgICAgICAgICAgZHVyYXRpb246IDEwLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fbmV3U2NhbGUgPSAxO1xuICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIHNlbGVjdGVkIGltYWdlIGluIHRoZSBpbWFnZSBzb3VyY2Ugd2hpbGUgcGFnZSBsb2FkZWQuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgcGFnZUxvYWRlZChhcmdzKSB7XG4gICAgICAgIGlmICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1vdmUgaW1hZ2UgbGVmdC9yaWdodCB3aGlsZSBvbiBzd2lwZSB3aXRoIGZpbmd1cmUuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYID09PSAxICYmIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDIgfHwgIWFyZ3MuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbWdOZXh0IDw9IDAgfHwgdGhpcy5faW1nTmV4dCA+PSB0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0ID0gMDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ltZ05leHQgPCAwIHx8IHRoaXMuX2ltZ05leHQgPj0gdGhpcy5faW1hZ2VGaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dCA9ICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5faW1nSW5kZXggPSB0aGlzLl9pbWdOZXh0O1xuICAgICAgICAgICAgaWYgKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLmZpbGVQYXRoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5vbkRvdWJsZVRhcChhcmdzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlIFxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIGltYWdlIHVyaVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcblxuICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmVzIGltYWdlKHMpIHdoaWxlIG9uIHNoYXJlLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5JTlRFUk5FVF0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpcyA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PGFuZHJvaWQubmV0LlVyaT4oKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGVzVG9CZUF0dGFjaGVkID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTScsICcuJyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0uZmlsZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzVG9CZUF0dGFjaGVkID0gZmlsZXNUb0JlQXR0YWNoZWQuY29uY2F0KCcsJyArIHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJpcy5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudChhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkFDVElPTl9TRU5EX01VTFRJUExFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKCdpbWFnZS9qcGVnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXPCoDrCoCcgKyBmaWxlc1RvQmVBdHRhY2hlZCArICcuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzLi4uJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRQYXJjZWxhYmxlQXJyYXlMaXN0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVFJFQU0sIHVyaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9XUklURV9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnN0YXJ0QWN0aXZpdHkoYW5kcm9pZC5jb250ZW50LkludGVudC5jcmVhdGVDaG9vc2VyKGludGVudCwgJ1NlbmQgbWFpbC4uLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHNlbmRpbmcgbWFpbC4nICsgZSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnaXPCoGV4Y2VwdGlvbsKgcmFpc2VzwqBkdXJpbmfCoHNlbmRpbmfCoG1haWzCoCcgKyBlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSknKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGUgc2VsZWN0ZWQgaW1hZ2UuXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgb25EZWxldGUoYXJncykge1xuICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nwqBzZWxlY3RlZMKgaXRlbShzKS4uLicsXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5faW1hZ2VGaWxlTGlzdFt0aGlzLl9pbWdOZXh0XS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgIGZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWFnZUZpbGVMaXN0LnNwbGljZSh0aGlzLl9pbWdOZXh0LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdTZWxlY3RlZCBpbWFnZSBkZWxldGVkLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25Td2lwZShhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIGVyci5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIGVyci5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19