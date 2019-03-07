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
    function ImageSlideComponent(zone, page, routerExtensions, route, transformedImageProvider) {
        var _this = this;
        this.zone = zone;
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
        this.route.queryParams.subscribe(function (params) {
            _this._imgURI = params["imgURI"];
            _this._imgIndex = params["imgIndex"];
        });
    }
    ImageSlideComponent.prototype.ngOnDestroy = function () {
    };
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
    ImageSlideComponent.prototype.goBack = function () {
        this.routerExtensions.back();
    };
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
            var screenLocation_1 = this._dragImageItem.getLocationOnScreen();
            if (this._newScale < 15) {
                if (this._newScale > 1) {
                    if (screenLocation_1.x <= 0
                        && (centerPointX - imageViewWidth) > Math.abs(screenLocation_1.x)) {
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
                    if ((screenLocation_1.y - this._naviBarHeight) <= 0
                        && (centerPointY - imageViewHeight) > Math.abs(screenLocation_1.y)) {
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
    ImageSlideComponent.prototype.onDoubleTap = function (args) {
        this._dragImageItem.animate({
            translate: { x: 0, y: 0 },
            scale: { x: 1, y: 1 },
            curve: "easeIn",
            duration: 10
        }).then(function () {
        });
        this._newScale = 1;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
    };
    ImageSlideComponent.prototype.pageLoaded = function (args) {
        if (this._imageFileList.length > 0)
            this.imageSource = this._imageFileList[this._imgIndex].filePath;
        // const page = args.object;
        this._oldTranslateY = 0;
        this._oldTranslateX = 0;
        // this._dragImageItem = page.getViewById("imgSlideId");
        // this._dragImageItem.translateX = 0;
        // this._dragImageItem.translateY = 0;
        // this._dragImageItem.scaleX = 1;
        // this._dragImageItem.scaleY = 1;
    };
    ImageSlideComponent.prototype.onSwipe = function (args) {
        if (this._dragImageItem.scaleX == 1 && this._dragImageItem.scaleY == 1) {
            if (args.direction == 2 || !args.direction) {
                this._imgNext++;
                if (this._imgNext <= 0 || this._imgNext >= this._imageFileList.length)
                    this._imgNext = 0;
            }
            else if (args.direction == 1) {
                this._imgNext--;
                if (this._imgNext < 0 || this._imgNext >= this._imageFileList.length)
                    this._imgNext = (this._imageFileList.length - 1);
            }
            this._imgIndex = this._imgNext;
            if (this._imageFileList.length > 0)
                this.imageSource = this._imageFileList[this._imgNext].filePath;
            else {
                this.imageSource = null;
                this.isDeleting = false;
                this.isSharing = false;
                Toast.makeText("No image available.").show();
            }
            this.onDoubleTap(args);
        }
    };
    ImageSlideComponent.prototype.getOriginalImage = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', ".");
        var imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    };
    ImageSlideComponent.prototype.onShare = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.INTERNET], "Needed for sharing files").then(function () {
            try {
                var uris = new java.util.ArrayList();
                var filesToBeAttached = '';
                var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', ".");
                var imgFileNameOrg = _this._imageFileList[_this._imgNext].fileName;
                imgFileNameOrg = imgFileNameOrg.replace('thumb_PT_IMG', 'PT_IMG');
                var newFile = new java.io.File(imagePath, imgFileNameOrg);
                var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
                application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                uris.add(uri);
                uris.add(_this.getOriginalImage(imgFileNameOrg));
                filesToBeAttached = filesToBeAttached.concat(',' + _this._imageFileList[_this._imgNext].filePath);
                if (uris.size() > 0) {
                    var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("image/jpeg");
                    var message = "Perspective correction pictures : " + filesToBeAttached + ".";
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "Perspective correction pictures...");
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, message);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, "Send mail..."));
                }
            }
            catch (e) {
                Toast.makeText("Error while sending mail." + e).show();
                console.log("is exception raises during sending mail " + e);
            }
        }).catch(function () {
            Toast.makeText("Error in giving permission.").show();
            console.log("Permission is not granted (sadface)");
        });
    };
    ImageSlideComponent.prototype.onDelete = function (args) {
        var _this = this;
        dialogs.confirm({
            title: "Delete",
            message: "Deleting selected item(s)...",
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        }).then(function (result) {
            if (result) {
                if (_this._imageFileList.length > 0) {
                    _this._dragImageItem.translateX = 0;
                    _this._dragImageItem.translateY = 0;
                    _this._dragImageItem.scaleX = 1;
                    _this._dragImageItem.scaleY = 1;
                    var file = file_system_1.File.fromPath(_this._imageFileList[_this._imgNext].filePath);
                    file.remove()
                        .then(function (res) {
                        var thumbnailFile = file_system_1.File.fromPath(_this._imageFileList[_this._imgNext].thumbnailPath);
                        thumbnailFile.remove()
                            .then(function (res) {
                            transformedimage_provider_1.SendBroadcastImage(_this._imageFileList[_this._imgNext].thumbnailPath);
                            _this._imageFileList.splice(_this._imgNext, 1);
                            Toast.makeText("Selected image deleted.").show();
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
                    Toast.makeText("No image available.").show();
                }
            }
        });
    };
    return ImageSlideComponent;
}());
__decorate([
    core_1.ViewChild("imgSlideId"),
    __metadata("design:type", core_1.ElementRef)
], ImageSlideComponent.prototype, "_dragImage", void 0);
ImageSlideComponent = __decorate([
    core_1.Component({
        selector: "ns-imageslide",
        moduleId: module.id,
        styleUrls: ['./imageslide.component.css'],
        templateUrl: "./imageslide.component.html",
    }),
    __metadata("design:paramtypes", [core_1.NgZone,
        page_1.Page,
        router_1.RouterExtensions,
        router_2.ActivatedRoute,
        transformedimage_provider_1.TransformedImageProvider])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZXNsaWRlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUE0RjtBQUM1Riw0REFBb0Q7QUFDcEQsc0RBQStEO0FBRy9ELGlEQUFnRDtBQUVoRCwwQ0FBaUQ7QUFDakQsb0ZBQXNHO0FBQ3RHLDhEQUE0RDtBQUU1RCwwREFBNEQ7QUFDNUQscURBQXVEO0FBQ3ZELDBDQUE0QztBQUM1QyxzREFBd0Q7QUFZeEQsSUFBYSxtQkFBbUI7SUF5QjVCLDZCQUFvQixJQUFZLEVBQ3BCLElBQVUsRUFDVixnQkFBa0MsRUFDbEMsS0FBcUIsRUFDckIsd0JBQWtEO1FBSjlELGlCQVNDO1FBVG1CLFNBQUksR0FBSixJQUFJLENBQVE7UUFDcEIsU0FBSSxHQUFKLElBQUksQ0FBTTtRQUNWLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsVUFBSyxHQUFMLEtBQUssQ0FBZ0I7UUFDckIsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQWR0RCxnQkFBVyxHQUFHLENBQUMsQ0FBQztRQUNoQixjQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2QscUJBQWdCLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBQ25CLG1CQUFjLEdBQUcsQ0FBQyxDQUFDO1FBT3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxVQUFBLE1BQU07WUFDbkMsS0FBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDaEMsS0FBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMs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QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25EZXN0cm95LCBPbkluaXQsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiwgTmdab25lIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IEZpbGUgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbVwiO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IEV2ZW50RGF0YSB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2RhdGEvb2JzZXJ2YWJsZVwiO1xuaW1wb3J0IHsgU3dpcGVHZXN0dXJlRXZlbnREYXRhIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZ2VzdHVyZXNcIjtcbmltcG9ydCB7IFBhZ2UgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlXCI7XG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEgfSBmcm9tIFwidWkvZ2VzdHVyZXNcIjtcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlIH0gZnJvbSBcIkBhbmd1bGFyL3JvdXRlclwiO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLCBTZW5kQnJvYWRjYXN0SW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSBcInVpL2ltYWdlXCI7XG5pbXBvcnQgKsKgYXPCoGFwcGxpY2F0aW9uIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9nc1wiO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gXCJuYXRpdmVzY3JpcHQtcGVybWlzc2lvbnNcIjtcbmltcG9ydCB7QW5pbWF0aW9uQ3VydmV9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2VudW1zXCI7XG5cbmRlY2xhcmUgdmFyIGFuZHJvaWQ7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiBcIm5zLWltYWdlc2xpZGVcIixcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlc2xpZGUuY29tcG9uZW50LmNzcyddLFxuICAgIHRlbXBsYXRlVXJsOiBcIi4vaW1hZ2VzbGlkZS5jb21wb25lbnQuaHRtbFwiLFxufSlcblxuZXhwb3J0IGNsYXNzIEltYWdlU2xpZGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XG5cbiAgICBwdWJsaWMgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlO1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgcHVibGljIGlzRGVsZXRpbmc6IGJvb2xlYW47XG4gICAgQFZpZXdDaGlsZChcImltZ1NsaWRlSWRcIikgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcbiAgICBwcml2YXRlIF9pbWdVUkk6IHN0cmluZztcbiAgICBwcml2YXRlIF9pbWdJbmRleDogbnVtYmVyO1xuICAgIHByaXZhdGUgX2RyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIHByaXZhdGUgX3ByZXZEZWx0YVg6IG51bWJlcjtcbiAgICBwcml2YXRlIF9wcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaW1hZ2VGaWxlTGlzdDogQXJyYXk8YW55PjtcbiAgICBwcml2YXRlIF9pbWdOZXh0OiBudW1iZXI7XG4gICAgcHJpdmF0ZSBfaXNCdXN5OiBib29sZWFuO1xuICAgIHByaXZhdGUgX25hdmlCYXJIZWlnaHQ6IG51bWJlcjtcbiAgICBwcml2YXRlIF9zdGFydFNjYWxlID0gMTtcbiAgICBwcml2YXRlIF9uZXdTY2FsZSA9IDE7XG4gICAgcHJpdmF0ZSBfaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBfb2xkT3JpZ2luWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkT3JpZ2luWSA9IDA7XG4gICAgcHJpdmF0ZSBfbmV3T3JpZ2luWCA9IDA7XG4gICAgcHJpdmF0ZSBfbmV3T3JpZ2luWSA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgcHJpdmF0ZSBfb2xkVHJhbnNsYXRlWSA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHpvbmU6IE5nWm9uZSxcbiAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlLFxuICAgICAgICBwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMsXG4gICAgICAgIHByaXZhdGUgcm91dGU6IEFjdGl2YXRlZFJvdXRlLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyKSB7XG4gICAgICAgIHRoaXMucm91dGUucXVlcnlQYXJhbXMuc3Vic2NyaWJlKHBhcmFtcyA9PiB7XG4gICAgICAgICAgICB0aGlzLl9pbWdVUkkgPSBwYXJhbXNbXCJpbWdVUklcIl07XG4gICAgICAgICAgICB0aGlzLl9pbWdJbmRleCA9IHBhcmFtc1tcImltZ0luZGV4XCJdO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcblxuICAgICAgICB0aGlzLl9pbWdOZXh0ID0gdGhpcy5faW1nSW5kZXg7XG4gICAgICAgIHRoaXMuX2lzQnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5faW1hZ2VGaWxlTGlzdCA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbSA9IDxJbWFnZT50aGlzLl9kcmFnSW1hZ2UubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDFcbiAgICAgICAgdGhpcy5fbmF2aUJhckhlaWdodCA9IDA7XG4gICAgfVxuICAgIGdvQmFjaygpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICB9XG5cbiAgICBvblBpbmNoKGFyZ3M6IFBpbmNoR2VzdHVyZUV2ZW50RGF0YSkge1xuXG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9uZXdPcmlnaW5YID0gYXJncy5nZXRGb2N1c1goKSAtIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWDtcbiAgICAgICAgICAgIHRoaXMuX25ld09yaWdpblkgPSBhcmdzLmdldEZvY3VzWSgpIC0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZO1xuICAgICAgICAgICAgdGhpcy5fb2xkT3JpZ2luWCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0ub3JpZ2luWCAqIHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpO1xuICAgICAgICAgICAgdGhpcy5fb2xkT3JpZ2luWSA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0ub3JpZ2luWSAqIHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKTtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0U2NhbGUgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWDtcbiAgICAgICAgICAgIHRoaXMuX2lzUGluY2hTZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgICAgfSBlbHNlIGlmIChhcmdzLnNjYWxlICYmIGFyZ3Muc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuX25ld1NjYWxlID0gdGhpcy5fc3RhcnRTY2FsZSAqIGFyZ3Muc2NhbGU7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IE1hdGgubWluKDE1LCB0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLl9uZXdTY2FsZSA9IE1hdGgubWF4KDAuMSwgdGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID0gdGhpcy5fbmV3U2NhbGU7XG5cbiAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0ud2lkdGggPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuX25ld1NjYWxlO1xuICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5oZWlnaHQgPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgKiB0aGlzLl9uZXdTY2FsZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUGFuKGFyZ3M6IFBhbkdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgbGV0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFggPSAodGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZFdpZHRoKCkgLyA0KSAqICh0aGlzLl9uZXdTY2FsZSk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5fZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpIC8gNCkgKiAodGhpcy5fbmV3U2NhbGUpO1xuICAgICAgICBsZXQgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkV2lkdGgoKSAqIHRoaXMuX2RyYWdJbWFnZUl0ZW0ub3JpZ2luWDtcbiAgICAgICAgbGV0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMuX2RyYWdJbWFnZUl0ZW0ub3JpZ2luWTtcblxuXG4gICAgICAgIGlmIChhcmdzLnN0YXRlID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLl9wcmV2RGVsdGFYID0gMDtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgXG4gICAgICAgICAgICBjZW50ZXJQb2ludFggPSAoY2VudGVyUG9pbnRYICogMik7XG4gICAgICAgICAgICBjZW50ZXJQb2ludFkgPSAoY2VudGVyUG9pbnRZICogMik7XG5cbiAgICAgICAgICAgIGxldCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0uZ2V0TG9jYXRpb25PblNjcmVlbigpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fbmV3U2NhbGUgPCAxNSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9uZXdTY2FsZSA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjcmVlbkxvY2F0aW9uLnggPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WCAtIGltYWdlVmlld1dpZHRoKSA+IE1hdGguYWJzKHNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICs9IGFyZ3MuZGVsdGFYIC0gdGhpcy5fcHJldkRlbHRhWDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVgrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMuX29sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5fbmF2aUJhckhlaWdodCkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55KVxuICAgICAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMuX3ByZXZEZWx0YVk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX29sZFRyYW5zbGF0ZVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWS0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0aGlzLl9vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuX25ld1NjYWxlID49IDE1KSB7XG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zbGF0ZVhUZW1wID0gdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYICsgYXJncy5kZWx0YVggLSB0aGlzLl9wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVZVGVtcCA9IHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArIGFyZ3MuZGVsdGFZIC0gdGhpcy5fcHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fb2xkVHJhbnNsYXRlWCA8IHRyYW5zbGF0ZVhUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IHRoaXMuX29sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gdHJhbnNsYXRlWFRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9vbGRUcmFuc2xhdGVZIDwgdHJhbnNsYXRlWVRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5fb2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSB0cmFuc2xhdGVZVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgIHRoaXMuX3ByZXZEZWx0YVkgPSBhcmdzLmRlbHRhWTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDMpIC8vIHVwXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUGluY2hTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIG9uRG91YmxlVGFwKGFyZ3M6IEdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5hbmltYXRlKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICBjdXJ2ZTogXCJlYXNlSW5cIixcbiAgICAgICAgICAgIGR1cmF0aW9uOiAxMFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX25ld1NjYWxlID0gMTtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWSA9IDA7XG4gICAgICAgIHRoaXMuX29sZFRyYW5zbGF0ZVggPSAwO1xuICAgIH1cbiAgICBwYWdlTG9hZGVkKGFyZ3MpIHtcbiAgICAgICAgaWYgKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoID4gMClcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ0luZGV4XS5maWxlUGF0aDtcbiAgICAgICAgLy8gY29uc3QgcGFnZSA9IGFyZ3Mub2JqZWN0O1xuICAgICAgICB0aGlzLl9vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5fb2xkVHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0gPSBwYWdlLmdldFZpZXdCeUlkKFwiaW1nU2xpZGVJZFwiKTtcblxuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgPSAwO1xuICAgICAgICAvLyB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgIC8vIHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICB9XG4gICAgb25Td2lwZShhcmdzOiBTd2lwZUdlc3R1cmVFdmVudERhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RyYWdJbWFnZUl0ZW0uc2NhbGVYID09IDEgJiYgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPT0gMSkge1xuXG4gICAgICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT0gMiB8fCAhYXJncy5kaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0Kys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2ltZ05leHQgPD0gMCB8fCB0aGlzLl9pbWdOZXh0ID49IHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0ID0gMDtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChhcmdzLmRpcmVjdGlvbiA9PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faW1nTmV4dC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbWdOZXh0IDwgMCB8fCB0aGlzLl9pbWdOZXh0ID49IHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWdOZXh0ID0gKHRoaXMuX2ltYWdlRmlsZUxpc3QubGVuZ3RoIC0gMSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2ltZ0luZGV4ID0gdGhpcy5faW1nTmV4dDtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiTm8gaW1hZ2UgYXZhaWxhYmxlLlwiKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uRG91YmxlVGFwKGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgXCIuXCIpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgIGxldCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgbGV0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgXCJveHMuZXllLmZpbGVwcm92aWRlclwiLCBuZXdGaWxlKTtcbiAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbihcIm94cy5leWUuZmlsZXByb3ZpZGVyXCIsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICByZXR1cm4gdXJpO1xuICAgIH1cbiAgICBvblNoYXJlKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSwgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0UsIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5JTlRFUk5FVF0sIFwiTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzXCIpLnRoZW4oKCkgPT4ge1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAgICAgICAgIHZhciBmaWxlc1RvQmVBdHRhY2hlZCA9ICcnO1xuICAgICAgICAgICAgICAgIGxldCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCBcIi5cIik7XG4gICAgICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdGhpcy5faW1hZ2VGaWxlTGlzdFt0aGlzLl9pbWdOZXh0XS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICBsZXQgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgbGV0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgXCJveHMuZXllLmZpbGVwcm92aWRlclwiLCBuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFwib3hzLmV5ZS5maWxlcHJvdmlkZXJcIiwgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLmdldE9yaWdpbmFsSW1hZ2UoaW1nRmlsZU5hbWVPcmcpKTtcblxuICAgICAgICAgICAgICAgIGZpbGVzVG9CZUF0dGFjaGVkID0gZmlsZXNUb0JlQXR0YWNoZWQuY29uY2F0KCcsJyArIHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgIGlmICh1cmlzLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1NFTkRfTVVMVElQTEUpO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0VHlwZShcImltYWdlL2pwZWdcIik7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtZXNzYWdlID0gXCJQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzwqA6wqBcIiArIGZpbGVzVG9CZUF0dGFjaGVkICsgXCIuXCI7XG4gICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsIFwiUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcy4uLlwiKTtcblxuICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgbWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfV1JJVEVfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc3RhcnRBY3Rpdml0eShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LmNyZWF0ZUNob29zZXIoaW50ZW50LCBcIlNlbmQgbWFpbC4uLlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLlwiICsgZSkuc2hvdygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXPCoGV4Y2VwdGlvbsKgcmFpc2VzwqBkdXJpbmfCoHNlbmRpbmfCoG1haWzCoFwiICsgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uXCIpLnNob3coKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSlcIik7XG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG5cbiAgICBvbkRlbGV0ZShhcmdzKSB7XG4gICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICB0aXRsZTogXCJEZWxldGVcIixcbiAgICAgICAgICAgIG1lc3NhZ2U6IFwiRGVsZXRpbmfCoHNlbGVjdGVkwqBpdGVtKHMpLi4uXCIsXG4gICAgICAgICAgICBva0J1dHRvblRleHQ6IFwiT2tcIixcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IFwiQ2FuY2VsXCJcbiAgICAgICAgfSkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVYID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnSW1hZ2VJdGVtLnNjYWxlWSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aCh0aGlzLl9pbWFnZUZpbGVMaXN0W3RoaXMuX2ltZ05leHRdLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKHRoaXMuX2ltYWdlRmlsZUxpc3RbdGhpcy5faW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbWFnZUZpbGVMaXN0LnNwbGljZSh0aGlzLl9pbWdOZXh0LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiU2VsZWN0ZWQgaW1hZ2UgZGVsZXRlZC5cIikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblN3aXBlKGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIG9yaWdpbmFsIGltYWdlLiAnICsgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoXCJObyBpbWFnZSBhdmFpbGFibGUuXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuIl19