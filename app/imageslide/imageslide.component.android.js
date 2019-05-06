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
                Toast.makeText('Error while sending mail.' + error).show();
                _this.logger.error('Error while sending mail. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
        }).catch(function (error) {
            Toast.makeText('Error in giving permission.' + error).show();
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
                            transformedimage_provider_1.SendBroadcastImage(_this.imageFileList[_this.imgNext].thumbnailPath);
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
        router_1.ActivatedRoute, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, oxseyelogger_1.OxsEyeLogger])
], ImageSlideComponent);
exports.ImageSlideComponent = ImageSlideComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VzbGlkZS5jb21wb25lbnQuYW5kcm9pZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlc2xpZGUuY29tcG9uZW50LmFuZHJvaWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBeUU7QUFDekUsMENBQWlEO0FBRWpELDREQUFvRDtBQUNwRCw4REFBNEQ7QUFFNUQsaURBQWdEO0FBS2hELHNEQUErRDtBQUUvRCx1REFBc0Q7QUFDdEQsb0ZBQXNHO0FBRXRHLDBEQUE0RDtBQUM1RCxxREFBdUQ7QUFFdkQsMENBQTRDO0FBRTVDLHNEQUF3RDtBQUV4RDs7R0FFRztBQU9ILElBQWEsbUJBQW1CO0lBc0M1Qjs7Ozs7O09BTUc7SUFDSCw2QkFDWSxJQUFVLEVBQ1YsZ0JBQWtDLEVBQ2xDLEtBQXFCLEVBQ3JCLHdCQUFrRCxFQUNsRCxNQUFvQjtRQUxoQyxpQkFVQztRQVRXLFNBQUksR0FBSixJQUFJLENBQU07UUFDVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFVBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQTNCaEMsbUNBQW1DO1FBQzNCLGVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdkIsc0RBQXNEO1FBQzlDLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFDckIsa0RBQWtEO1FBQzFDLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ2hDLDZDQUE2QztRQUNyQyxrQkFBYSxHQUFHLENBQUMsQ0FBQztRQUMxQiw2Q0FBNkM7UUFDckMsa0JBQWEsR0FBRyxDQUFDLENBQUM7UUFDMUIscUVBQXFFO1FBQzdELHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQWlCakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFVBQUMsTUFBTTtZQUNwQyxLQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FB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QXhCLGdCQUFTLENBQUMsWUFBWSxDQUFDOzhCQUFhLGlCQUFVO3VEQUFDO0FBUnZDLG1CQUFtQjtJQU4vQixnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDRCQUE0QixDQUFDO1FBQ3pDLFdBQVcsRUFBRSw2QkFBNkI7S0FDN0MsQ0FBQztxQ0ErQ29CLFdBQUk7UUFDUSx5QkFBZ0I7UUFDM0IsdUJBQWMsc0JBQ0ssb0RBQXdCLG9CQUF4QixvREFBd0Isa0NBQzFDLDJCQUFZO0dBbER2QixtQkFBbUIsQ0FzWC9CO0FBdFhZLGtEQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEFjdGl2YXRlZFJvdXRlIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgRmlsZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgSW1hZ2VTb3VyY2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ltYWdlLXNvdXJjZSc7XG5pbXBvcnQgeyBTd2lwZUdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuXG5pbXBvcnQgeyBHZXN0dXJlRXZlbnREYXRhLCBQYW5HZXN0dXJlRXZlbnREYXRhLCBQaW5jaEdlc3R1cmVFdmVudERhdGEgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2dlc3R1cmVzJztcbmltcG9ydCB7IEltYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9pbWFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKsKgYXPCoGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICrCoGFzwqBkaWFsb2dzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9ncyc7XG5cbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5cbi8qKlxuICogSW1hZ2VTbGlkZUNvbXBvbmVudCBpcyB1c2VkIHRvIHNob3cgaW1hZ2UgaW4gZGV0YWlsIHZpZXcsIHdoZXJlIHVzZXIgY2FuIHpvb20taW4vb3V0LlxuICovXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ25zLWltYWdlc2xpZGUnLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VzbGlkZS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlc2xpZGUuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBJbWFnZVNsaWRlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogIFVzZWQgdG8gc3RvcmUgaW1hZ2Ugc291cmNlIGFuZCBhbHNvIHVzZWQgaW4gR1VJICovXG4gICAgcHVibGljIGltYWdlU291cmNlOiBJbWFnZVNvdXJjZTtcbiAgICAvKiogIFRvIGluZGljYXRlIHRoZSBzaGFyaW5nIG1lbnUgaXMgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwdWJsaWMgaXNTaGFyaW5nOiBib29sZWFuO1xuICAgIC8qKiBUbyBpbmRpY2F0ZSB0aGUgZGVsZXRpbmcgbWVudSBpcyB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBDaGlsZCBlbGVtZW50IHJlZmVycmVuY2UgKi9cbiAgICBAVmlld0NoaWxkKCdpbWdTbGlkZUlkJykgX2RyYWdJbWFnZTogRWxlbWVudFJlZjtcbiAgICAvKiogSW1hZ2UgVVJJICovXG4gICAgcHJpdmF0ZSBpbWdVUkk6IHN0cmluZztcbiAgICAvKiogSW1hZ2UgaW5kZXggYmVpbmcgdXNlZCB0byBnZXQgYW4gaW1hZ2UgZm9yIHRoZSBnaXZlbiBpbmRleCAqL1xuICAgIHByaXZhdGUgaW1nSW5kZXg6IG51bWJlcjtcbiAgICAvKiogSW1hZ2UgcmVmZXJyZW5jZSBmcm9tIF9kcmFnSW1hZ2UgKi9cbiAgICBwcml2YXRlIGRyYWdJbWFnZUl0ZW06IEltYWdlO1xuICAgIC8qKiBDb250YWlucyBwcmV2aW91cyBkZWx0YVggdmFsdWUgKi9cbiAgICBwcml2YXRlIHByZXZEZWx0YVg6IG51bWJlcjtcbiAgICAvKiogQ29udGFpbnMgcHJldmlvdXMgZGVsdGFZIHZhbHVlICovXG4gICAgcHJpdmF0ZSBwcmV2RGVsdGFZOiBudW1iZXI7XG4gICAgLyoqIENvbnRhaW5zIGxpc3Qgb2YgaW1hZ2UgZmlsZSBwYXRoIGluZm9ybWF0aW9uICovXG4gICAgcHJpdmF0ZSBpbWFnZUZpbGVMaXN0OiBhbnlbXTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgbmV4dCBpbmRleCB2YWx1ZSAqL1xuICAgIHByaXZhdGUgaW1nTmV4dDogbnVtYmVyO1xuICAgIC8qKiBDb250YWlucyBpbml0aWFsIHNjYWxlIHZhbHVlICovXG4gICAgcHJpdmF0ZSBzdGFydFNjYWxlID0gMTtcbiAgICAvKiogQ29udGFpbnMgbmV3IHNjYWxlIHZhbHVlIHdoaWxlIG1vdmluZyB0aGUgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG5ld1NjYWxlID0gMTtcbiAgICAvKiogVG8gaW5kaWNhdGUgd2hldGhlciBwaW5jaCBpcyB0cmlnZ2VyIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNQaW5jaFNlbGVjdGVkID0gZmFsc2U7XG4gICAgLyoqIFRvIHN0b3JlIG9sZCBUcmFuc2xhdGVYIHZhbHVlIG9mIGltYWdlICovXG4gICAgcHJpdmF0ZSBvbGRUcmFuc2xhdGVYID0gMDtcbiAgICAvKiogVG8gc3RvcmUgb2xkIFRyYW5zbGF0ZVkgdmFsdWUgb2YgaW1hZ2UgKi9cbiAgICBwcml2YXRlIG9sZFRyYW5zbGF0ZVkgPSAwO1xuICAgIC8qKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgaW1hZ2UgZ290IGRlZmF1bHQgc2NyZWVuIGxvY2F0aW9uIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNHb3REZWZhdWx0TG9jYXRpb24gPSBmYWxzZTtcbiAgICAvKiogQ29udGFpbnMgaW1hZ2UgZGVmYXVsdCBzY3JlZW4gbG9jYXRpb24gKi9cbiAgICBwcml2YXRlIGRlZmF1bHRTY3JlZW5Mb2NhdGlvbjogYW55O1xuXG4gICAgLyoqXG4gICAgICogSW1hZ2VTbGlkZUNvbXBvbmVudCBjb25zdHJ1Y3Rvci5cbiAgICAgKiBAcGFyYW0gcGFnZSBQYWdlXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyRXh0ZW5zaW9uc1xuICAgICAqIEBwYXJhbSByb3V0ZSBBY3RpdmF0ZWRSb3V0ZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZSxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBBY3RpdmF0ZWRSb3V0ZSxcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLnJvdXRlLnF1ZXJ5UGFyYW1zLnN1YnNjcmliZSgocGFyYW1zKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmltZ1VSSSA9IHBhcmFtc1snaW1nVVJJJ107XG4gICAgICAgICAgICB0aGlzLmltZ0luZGV4ID0gcGFyYW1zWydpbWdJbmRleCddO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgcGFnZSBwcm9wZXJ0aWVzIGxpa2UgbWVudXMgKCdkZWxldGUnLydzaGFyZScpIGFuZCB0aGUgaW1hZ2VcbiAgICAgKiBwcm9wZXJ0aWVzIGxpa2UgdHJhbnNsYXRlWC90cmFuc2xhdGVZL3NjYWxlWC9zY2FsZVkuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW1nTmV4dCA9IHRoaXMuaW1nSW5kZXg7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG5ldyBJbWFnZVNvdXJjZSgpO1xuICAgICAgICB0aGlzLmltYWdlRmlsZUxpc3QgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3Q7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbSA9IHRoaXMuX2RyYWdJbWFnZS5uYXRpdmVFbGVtZW50IGFzIEltYWdlO1xuICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCA9IDA7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9IDE7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSAxO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHb2VzIGJhY2sgdG8gcHJldmlvdXMgcGFnZSB3aGVuIHRoZSBiYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqL1xuICAgIGdvQmFjaygpIHtcbiAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGluY2ggbWV0aG9kLCBpcyBiZWluZyBjYWxsZWQgd2hpbGUgcGluY2ggZXZlbnQgZmlyZWQgb24gaW1hZ2UsXG4gICAgICogd2hlcmUgdGhlIG5ldyBzY2FsZSwgd2lkdGggJiBoZWlnaHQgb2YgdGhlIHRyYW5zZm9ybWVkIGltYWdlIGhhdmUgYmVlbiBjYWxjdWxhdGVkXG4gICAgICogdG8gem9vbS1pbi9vdXQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgUGluY2hHZXN0dXJlRXZlbnREYXRhXG4gICAgICovXG4gICAgb25QaW5jaChhcmdzOiBQaW5jaEdlc3R1cmVFdmVudERhdGEpIHtcblxuICAgICAgICBpZiAoYXJncy5zdGF0ZSA9PT0gMSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydFNjYWxlID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWDtcbiAgICAgICAgICAgIHRoaXMuaXNQaW5jaFNlbGVjdGVkID0gdHJ1ZTtcblxuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc2NhbGUgJiYgYXJncy5zY2FsZSAhPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IHRoaXMuc3RhcnRTY2FsZSAqIGFyZ3Muc2NhbGU7XG4gICAgICAgICAgICB0aGlzLm5ld1NjYWxlID0gTWF0aC5taW4oMTUsIHRoaXMubmV3U2NhbGUpO1xuICAgICAgICAgICAgdGhpcy5uZXdTY2FsZSA9IE1hdGgubWF4KDAuMSwgdGhpcy5uZXdTY2FsZSk7XG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVYID0gdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVkgPSB0aGlzLm5ld1NjYWxlO1xuXG4gICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0ud2lkdGggPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5uZXdTY2FsZTtcbiAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5oZWlnaHQgPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRIZWlnaHQoKSAqIHRoaXMubmV3U2NhbGU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFuL21vdmUgbWV0aG9kLCB3aGljaCBtb3ZlcyBpbWFnZSB3aGVuIHVzZXIgcHJlc3MgJiBkcmFnIHdpdGggYSBmaW5nZXIgYXJvdW5kXG4gICAgICogdGhlIGltYWdlIGFyZWEuIEhlcmUgdGhlIGltYWdlJ3MgdHJhbGF0ZVgvdHJhbnNsYXRlWSB2YWx1ZXMgYXJlIGJlZW4gY2FsY3VsYXRlZFxuICAgICAqIGJhc2VkIG9uIHRoZSBpbWFnZSdzIHNjYWxlLCB3aWR0aCAmIGhlaWdodC4gQW5kIGFsc28gaXQgdGFrZXMgY2FyZSBvZiBpbWFnZSBib3VuZGFyeVxuICAgICAqIGNoZWNraW5nLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhbkdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvblBhbihhcmdzOiBQYW5HZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIGNvbnN0IHNjcmVlbkxvY2F0aW9uID0gdGhpcy5kcmFnSW1hZ2VJdGVtLmdldExvY2F0aW9uT25TY3JlZW4oKTtcbiAgICAgICAgbGV0IGNlbnRlclBvaW50WCA9ICh0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpIC8gNCkgKiAodGhpcy5uZXdTY2FsZSk7XG4gICAgICAgIGxldCBjZW50ZXJQb2ludFkgPSAodGhpcy5kcmFnSW1hZ2VJdGVtLmdldE1lYXN1cmVkSGVpZ2h0KCkgLyA0KSAqICh0aGlzLm5ld1NjYWxlKTtcbiAgICAgICAgY29uc3QgaW1hZ2VWaWV3V2lkdGggPSB0aGlzLmRyYWdJbWFnZUl0ZW0uZ2V0TWVhc3VyZWRXaWR0aCgpICogdGhpcy5kcmFnSW1hZ2VJdGVtLm9yaWdpblg7XG4gICAgICAgIGNvbnN0IGltYWdlVmlld0hlaWdodCA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRNZWFzdXJlZEhlaWdodCgpICogdGhpcy5kcmFnSW1hZ2VJdGVtLm9yaWdpblk7XG5cbiAgICAgICAgaWYgKGFyZ3Muc3RhdGUgPT09IDEpIHtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWCA9IDA7XG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVkgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGFyZ3Muc3RhdGUgPT09IDIpIHtcbiAgICAgICAgICAgIGNlbnRlclBvaW50WCA9IChjZW50ZXJQb2ludFggKiAyKTtcbiAgICAgICAgICAgIGNlbnRlclBvaW50WSA9IChjZW50ZXJQb2ludFkgKiAyKTtcbiAgICAgICAgICAgIC8vIGxldCBzY3JlZW5Mb2NhdGlvbiA9IHRoaXMuZHJhZ0ltYWdlSXRlbS5nZXRMb2NhdGlvbk9uU2NyZWVuKCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlIDwgMTUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNHb3REZWZhdWx0TG9jYXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24gPSBzY3JlZW5Mb2NhdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0dvdERlZmF1bHRMb2NhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID4gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHNjcmVlbkxvY2F0aW9uLnggLSB0aGlzLmRlZmF1bHRTY3JlZW5Mb2NhdGlvbi54KSA8PSAwXG4gICAgICAgICAgICAgICAgICAgICAgICAmJiAoY2VudGVyUG9pbnRYIC0gaW1hZ2VWaWV3V2lkdGgpID4gTWF0aC5hYnMoc2NyZWVuTG9jYXRpb24ueCAtIHRoaXMuZGVmYXVsdFNjcmVlbkxvY2F0aW9uLngpXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggKz0gYXJncy5kZWx0YVggLSB0aGlzLnByZXZEZWx0YVg7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVggPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYW5zbGF0ZVggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKChzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSkgPD0gMFxuICAgICAgICAgICAgICAgICAgICAgICAgJiYgKGNlbnRlclBvaW50WSAtIGltYWdlVmlld0hlaWdodCkgPiBNYXRoLmFicyhzY3JlZW5Mb2NhdGlvbi55IC0gdGhpcy5kZWZhdWx0U2NyZWVuTG9jYXRpb24ueSlcbiAgICAgICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSArPSBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhbnNsYXRlWSA9IHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9sZFRyYW5zbGF0ZVktLTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZKys7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IHRoaXMub2xkVHJhbnNsYXRlWTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLm5ld1NjYWxlID49IDE1KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWFRlbXAgPSB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWCArIGFyZ3MuZGVsdGFYIC0gdGhpcy5wcmV2RGVsdGFYO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVlUZW1wID0gdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVkgKyBhcmdzLmRlbHRhWSAtIHRoaXMucHJldkRlbHRhWTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vbGRUcmFuc2xhdGVYIDwgdHJhbnNsYXRlWFRlbXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0aGlzLm9sZFRyYW5zbGF0ZVg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSB0cmFuc2xhdGVYVGVtcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhbnNsYXRlWSA8IHRyYW5zbGF0ZVlUZW1wKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdGhpcy5vbGRUcmFuc2xhdGVZO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS50cmFuc2xhdGVZID0gdHJhbnNsYXRlWVRlbXA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnByZXZEZWx0YVggPSBhcmdzLmRlbHRhWDtcbiAgICAgICAgICAgIHRoaXMucHJldkRlbHRhWSA9IGFyZ3MuZGVsdGFZO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoYXJncy5zdGF0ZSA9PT0gMykge1xuICAgICAgICAgICAgdGhpcy5pc1BpbmNoU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBEb3VibGUgdGFwIG1ldGhvZCBmaXJlcyBvbiB3aGVuIHVzZXIgdGFwcyB0d28gdGltZXMgb24gdHJhbnNmb3JtZWQgaW1hZ2UuIFxuICAgICAqIEFjdHVhbGx5IGl0IGJyaW5ncyB0aGUgaW1hZ2UgdG8gaXQncyBvcmlnaW5hbCBwb3NpdGlvbnMgYW5kIGFsc28gYWRkcyBcbiAgICAgKiBjaXJjbGUgcG9pbnRzIGlmIGl0IGlzIG9yaWdpbmFsIGltYWdlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIEdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvbkRvdWJsZVRhcChhcmdzOiBHZXN0dXJlRXZlbnREYXRhKSB7XG4gICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5hbmltYXRlKHtcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogeyB4OiAwLCB5OiAwIH0sXG4gICAgICAgICAgICBzY2FsZTogeyB4OiAxLCB5OiAxIH0sXG4gICAgICAgICAgICBjdXJ2ZTogJ2Vhc2VJbicsXG4gICAgICAgICAgICBkdXJhdGlvbjogMTAsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5ld1NjYWxlID0gMTtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFnZSBsb2FkZWQgbWV0aG9kIHdoaWNoIGlzIGJlZW4gY2FsbGVkIHdoZW4gaW1hZ2VzbGlkZSBwYWdlIGlzIGxvYWRlZCxcbiAgICAgKiB3aGVyZSBpdCBzZXRzIHRoZSBzZWxlY3RlZCBpbWFnZSBpbiB0aGUgc291cmNlIGZvciBkaXNwbGF5LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIGFueSBvYmplY3RcbiAgICAgKi9cbiAgICBwYWdlTG9hZGVkKGFyZ3M6IGFueSkge1xuICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdJbmRleF0uZmlsZVBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVZID0gMDtcbiAgICAgICAgdGhpcy5vbGRUcmFuc2xhdGVYID0gMDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhlIGltYWdlIGxlZnQvcmlnaHQgd2hpbGUgc3dpcGUgd2l0aCBhIGZpbmd1cmUuIEFjdHVhbGx5IHdoZW4gYSBmaW5nZXIgaXMgc3dpcGVkXG4gICAgICogaXQgY2hlY2tzIHRoYXQgdGhlIHN3aXBlIGlzIHJpZ2h0IGRpcmVjdCBvciBsZWZ0IGRpcmVjdGlvbiwgYmFzZWQgb24gdGhhdCBpdCBwdWxscyB0aGUgaW1hZ2UgZnJvbVxuICAgICAqIHRoZSBpbWFnZSBsaXN0IGFuZCBkaXNwbGF5IGl0IGluIHZpZXcuIEFmdGVyIHRoYXQsIGl0IHNldHMgdGhlIGltYWdlIGluIGRlZmF1bHQgcG9zaXRpb24gYnkgY2FsbGluZ1xuICAgICAqIG9uRG91YmxlVGFwIG1ldGhvZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBTd2lwZUdlc3R1cmVFdmVudERhdGFcbiAgICAgKi9cbiAgICBvblN3aXBlKGFyZ3M6IFN3aXBlR2VzdHVyZUV2ZW50RGF0YSkge1xuICAgICAgICBpZiAodGhpcy5kcmFnSW1hZ2VJdGVtLnNjYWxlWCA9PT0gMSAmJiB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID09PSAxKSB7XG4gICAgICAgICAgICBpZiAoYXJncy5kaXJlY3Rpb24gPT09IDIgfHwgIWFyZ3MuZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0Kys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8PSAwIHx8IHRoaXMuaW1nTmV4dCA+PSB0aGlzLmltYWdlRmlsZUxpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZ3MuZGlyZWN0aW9uID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW1nTmV4dCA8IDAgfHwgdGhpcy5pbWdOZXh0ID49IHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWdOZXh0ID0gKHRoaXMuaW1hZ2VGaWxlTGlzdC5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW1nSW5kZXggPSB0aGlzLmltZ05leHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gdGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ05vIGltYWdlIGF2YWlsYWJsZS4nKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9uRG91YmxlVGFwKGFyZ3MpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldHMgb3JpZ2luYWwgaW1hZ2UuXG4gICAgLy8gICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VcbiAgICAvLyAgKiBAcmV0dXJucyBpbWFnZSB1cmlcbiAgICAvLyAgKi9cbiAgICAvLyBwcml2YXRlIGdldE9yaWdpbmFsSW1hZ2UodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNL0NBTUVSQScsICcuJyk7XG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgIC8vICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgIC8vICAgICByZXR1cm4gdXJpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIFNoYXJlcyBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSBzaGFyZSBidXR0b24uIFRoZSBzaGFyaW5nIGNhbiBiZSBkb25lXG4gICAgICogdmlhIGFueSBvbmUgb2YgdGhlIG1lZGlhcyBzdXBwb3J0ZWQgYnkgYW5kcm9pZCBkZXZpY2UgYnkgZGVmYXVsdC4gVGhlIGxpc3Qgb2Ygc3VwcG9ydGVkXG4gICAgICogbWVkaWFzIHdpbGwgYmUgdmlzaWJsZSB3aGVuIHRoZSBzaGFyZSBidXR0b24gY2xpY2tlZC5cbiAgICAgKi9cbiAgICBvblNoYXJlKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uSU5URVJORVRdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaXMgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxhbmRyb2lkLm5ldC5Vcmk+KCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWxlc1RvQmVBdHRhY2hlZCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZShpbWdGaWxlTmFtZU9yZykpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzVG9CZUF0dGFjaGVkID0gZmlsZXNUb0JlQXR0YWNoZWQuY29uY2F0KCcsJyArIHRoaXMuaW1hZ2VGaWxlTGlzdFt0aGlzLmltZ05leHRdLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVyaXMuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fU0VORF9NVUxUSVBMRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0VHlwZSgnaW1hZ2UvanBlZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzwqA6wqAnICsgZmlsZXNUb0JlQXR0YWNoZWQgKyAnLic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVUJKRUNULCAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcy4uLicpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1RFWFQsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfV1JJVEVfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmZvcmVncm91bmRBY3Rpdml0eS5zdGFydEFjdGl2aXR5KGFuZHJvaWQuY29udGVudC5JbnRlbnQuY3JlYXRlQ2hvb3NlcihpbnRlbnQsICdTZW5kIG1haWwuLi4nKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLicgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2VuZGluZyBtYWlsLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSAnZGVsZXRlJyBidXR0b24gaW4gbWVudS5cbiAgICAgKiBUaGlzIHdpbGwgc2hvdyB1cCBhIGRpYWxvZyB3aW5kb3cgZm9yIGNvbmZpcm1hdGlvbiBmb3IgdGhlIHNlbGVjdGVkIGltYWdlKHMpXG4gICAgICogdG8gYmUgZGVsZXRlZC4gSWYgdXNlciBzYXlzICdPaycsIHRoZW4gdGhvc2UgaW1hZ2Uocykgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGV2aWNlLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBhbnkgYm9qZWN0XG4gICAgICovXG4gICAgb25EZWxldGUoYXJnczogYW55KSB7XG4gICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICBtZXNzYWdlOiAnRGVsZXRpbmfCoHNlbGVjdGVkwqBpdGVtKHMpLi4uJyxcbiAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogJ09rJyxcbiAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnSW1hZ2VJdGVtLnRyYW5zbGF0ZVggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0udHJhbnNsYXRlWSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhZ0ltYWdlSXRlbS5zY2FsZVggPSAxO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYWdJbWFnZUl0ZW0uc2NhbGVZID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0uZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UodGhpcy5pbWFnZUZpbGVMaXN0W3RoaXMuaW1nTmV4dF0udGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlRmlsZUxpc3Quc3BsaWNlKHRoaXMuaW1nTmV4dCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnU2VsZWN0ZWQgaW1hZ2UgZGVsZXRlZC4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbWFnZUZpbGVMaXN0Lmxlbmd0aCA8PSB0aGlzLmltZ05leHQudmFsdWVPZigpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1nTmV4dCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSB0aGlzLmltYWdlRmlsZUxpc3RbdGhpcy5pbWdOZXh0XS5maWxlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZVNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnTm8gaW1hZ2UgYXZhaWxhYmxlLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMub25Td2lwZShhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlLiAnICsgZXJyb3Iuc3RhY2ssICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZS4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4gJyArIGVycm9yLnN0YWNrLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgb3JpZ2luYWwgaW1hZ2UuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlU291cmNlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdObyBpbWFnZSBhdmFpbGFibGUuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19