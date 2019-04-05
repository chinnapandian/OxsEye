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
var router_2 = require("@angular/router");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var transformedimage_common_1 = require("../providers/transformedimage.common");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
/**
 * ImageGalleryComponent class.
 */
var ImageGalleryComponent = (function () {
    /**
     * Constructor for ImageGalleryComponent
     * @param routerExtensions
     * @param modalService
     * @param viewContainerRef
     * @param _changeDetectionRef
     * @param router
     * @param transformedImageProvider
     * @param activityLoader
     */
    function ImageGalleryComponent(routerExtensions, modalService, viewContainerRef, _changeDetectionRef, router, transformedImageProvider, activityLoader) {
        this.routerExtensions = routerExtensions;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this._changeDetectionRef = _changeDetectionRef;
        this.router = router;
        this.transformedImageProvider = transformedImageProvider;
        this.activityLoader = activityLoader;
    }
    /**
   * Angular initialize method.
   */
    ImageGalleryComponent.prototype.ngOnInit = function () {
        this.activityLoader.show();
        this.isCheckBoxVisible = false;
        this._selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = false;
        this.isSortByDateMenu = true;
        this._isSelectUnselectAll = true;
        // this.loadThumbnailImages();
        this._orderByAscDesc = ' DESC';
        this.loadThumbnailImagesByContentResolver(this._orderByAscDesc);
    };
    Object.defineProperty(ImageGalleryComponent.prototype, "imageList", {
        /**
         * Get image list.
         * @returns image list.
         */
        get: function () {
            return this.transformedImageProvider.imageList;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Set checkbox visible.
     */
    ImageGalleryComponent.prototype.setCheckboxVisible = function () {
        this.isCheckBoxVisible = true;
        this.isPopUpMenu = true;
    };
    /**
     * On page loaded
     * @param args
     */
    ImageGalleryComponent.prototype.onPageLoaded = function (args) {
        this._page = (args !== this._page) ? args.object : args;
        var selectedCountTemp = this._selectedCount;
        this._selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = (this.imageList.length > 0) ? this.isPopUpMenu : false;
        this.isSortByDateMenu = (this.imageList.length > 0) ? true : false;
        for (var image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.isDeleting = true;
                this.isSharing = true;
                this._selectedCount = selectedCountTemp;
                break;
            }
        }
    };
    /**
     * Go back
     */
    ImageGalleryComponent.prototype.goBack = function () {
        for (var image in this.imageList) {
            this.imageList[image].isSelected = false;
        }
        this.routerExtensions.back();
    };
    /**
     * Go to Image slide page
     * @param imgURIParam
     * @param imgIndexParam
     * @param args
     */
    ImageGalleryComponent.prototype.goImageSlide = function (imgURIParam, imgIndexParam, args) {
        var navigationExtras = {
            queryParams: {
                imgURI: imgURIParam,
                imgIndex: imgIndexParam,
            },
        };
        this.router.navigate(['imageslide'], navigationExtras);
    };
    /**
     * Is checkBox checked or not.
     * @param event
     * @param imagePath
     * @param index
     */
    ImageGalleryComponent.prototype.isChecked = function (event, imagePath, index) {
        if (event.value) {
            this._selectedCount++;
        }
        else {
            this._selectedCount--;
        }
        if (this._selectedCount > 0) {
            this.isDeleting = true;
            this.isSharing = true;
        }
        else {
            this.isDeleting = false;
            this.isSharing = false;
        }
        this.imageList[index].isSelected = event.value;
    };
    /**
     * Select/Unselect all checkbox
     */
    ImageGalleryComponent.prototype.onSelectUnSelectAllCheckBox = function () {
        var _this = this;
        if (this._selectedCount !== this.imageList.length && this._selectedCount > 0) {
            dialogs.action({
                message: 'Patially selected. Do you want to perform one of the below?',
                cancelButtonText: 'Cancel',
                actions: ['Select All', 'Unselect All'],
            }).then(function (result) {
                if (result === 'Select All') {
                    _this._isSelectUnselectAll = true;
                    _this.performSelectUnselectAll(_this._isSelectUnselectAll);
                }
                else if (result === 'Unselect All') {
                    _this._isSelectUnselectAll = false;
                    _this.performSelectUnselectAll(_this._isSelectUnselectAll);
                }
            });
        }
        else {
            this._isSelectUnselectAll = (this._selectedCount === this.imageList.length) ? false : true;
            this.performSelectUnselectAll(this._isSelectUnselectAll);
        }
    };
    /**
     * Sort images by date.
     */
    ImageGalleryComponent.prototype.onSortByDate = function () {
        this._selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        var clonedImageList = Object.assign([], this.imageList);
        this.transformedImageProvider.imageList = [];
        for (var i = (clonedImageList.length - 1); i >= 0; i--) {
            this.transformedImageProvider.imageList.push(new transformedimage_common_1.TransformedImage(clonedImageList[i].fileName, clonedImageList[i].filePath, clonedImageList[i].thumbnailPath, clonedImageList[i].isSelected));
        }
    };
    /**
     * Share selected image(s)
     */
    ImageGalleryComponent.prototype.onShare = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERNET], 'Needed for sharing files').then(function () {
            try {
                var uris_1 = new java.util.ArrayList();
                var filesToBeAttached = '';
                _this.imageList.forEach(function (image) {
                    if (image.isSelected) {
                        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
                        var imgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
                        var newFile = new java.io.File(imagePath, imgFileNameOrg);
                        // const uri = android.support.v4.content.FileProvider.getUriForFile(
                        //     application.android.context, 'oxs.eye.fileprovider', newFile);
                        // application.android.context.grantUriPermission(
                        //     'oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        var uri = _this.transformedImageProvider.getURIForFile(newFile);
                        uris_1.add(uri);
                        uris_1.add(_this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                        uris_1.add(_this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                    }
                });
                if (uris_1.size() > 0) {
                    var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType('image/jpeg');
                    var message = 'Perspective correction pictures : ' + filesToBeAttached + '.';
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris_1);
                    // let extra_text = new java.util.ArrayList<String>();
                    // extra_text.add('See attached transformed image files.');
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, 'See attached transformed image files.');
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, 'Share images...'));
                }
            }
            catch (e) {
                Toast.makeText('Error while sharing images.' + e).show();
                console.log('is exception raises during sending mail ' + e);
            }
        }).catch(function () {
            Toast.makeText('Error in giving permission.').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    /**
     * Delete selected image(s)
     */
    ImageGalleryComponent.prototype.onDelete = function () {
        var _this = this;
        if (this._selectedCount > 0) {
            dialogs.confirm({
                title: 'Delete',
                message: 'Deleting selected item(s)?',
                okButtonText: 'Ok',
                cancelButtonText: 'Cancel',
            }).then(function (result) {
                if (result) {
                    _this._selectedCount = 0;
                    _this.isDeleting = false;
                    _this.isSharing = false;
                    _this.imageList.forEach(function (image) {
                        if (image.isSelected) {
                            var file = file_system_1.File.fromPath(image.filePath);
                            file.remove()
                                .then(function () {
                                var thumbnailFile = file_system_1.File.fromPath(image.thumbnailPath);
                                thumbnailFile.remove()
                                    .then(function () {
                                    transformedimage_provider_1.SendBroadcastImage(image.thumbnailPath);
                                    var imgIdx = _this.imageList.indexOf(image);
                                    if (imgIdx >= 0) {
                                        _this.imageList.splice(imgIdx, 1);
                                    }
                                    _this.onPageLoaded(_this._page);
                                }).catch(function (err) {
                                    Toast.makeText('Error while deleting thumbnail images').show();
                                    console.log(err.stack);
                                });
                            }).catch(function (err) {
                                Toast.makeText('Error while deleting images').show();
                                console.log('Error while deleting original image.' + err.stack);
                            });
                        }
                    });
                    Toast.makeText('Selected images deleted.').show();
                }
            });
        }
    };
    /**
     * Perform select/unselect all checkbox.
     * @param value
     */
    ImageGalleryComponent.prototype.performSelectUnselectAll = function (value) {
        for (var i = 0; i < this.imageList.length; i++) {
            var checkBox = this._page.getViewById('checkbox-' + i);
            checkBox.checked = value;
        }
        this._isSelectUnselectAll = !value;
    };
    // /**
    //  * Get original image
    //  * @param transformedImage 
    //  */
    // private getOriginalImage(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', '.');
    //     let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
    //     imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     // application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     // return uri;
    //     return this.transformedImageProvider.getURIForFile(newFile);
    // }
    // /**
    //  * Get original image
    //  * @param transformedImage 
    //  */
    // private getOriginalImageWithRectangle(transformedImage: string): any {
    //     const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
    //     let imgFileNameOrg = transformedImage.substring(0, transformedImage.indexOf('_transformed')) + '_contour.jpg';
    //     const newFile = new java.io.File(imagePath, imgFileNameOrg);
    //     // const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     // application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     // return uri;
    //     return this.transformedImageProvider.getURIForFile(newFile);
    // }
    // /**
    //  * Get URI for file.
    //  * @param newFile 
    //  * @returns URI
    //  */
    // private getURIForFile(newFile: any): any {
    //     const uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, 'oxs.eye.fileprovider', newFile);
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     return uri;
    // }
    /**
     * Load thumbnail images by content resolver.
     * @param orderByAscDescParam
     */
    ImageGalleryComponent.prototype.loadThumbnailImagesByContentResolver = function (orderByAscDescParam) {
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader);
    };
    /**
     * Load thumbnail images by file system
     */
    ImageGalleryComponent.prototype.loadThumbnailImagesByFileSystem = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files')
            .then(function () {
            var capturedPicturePath = '';
            _this.transformedImageProvider.imageList = [];
            try {
                capturedPicturePath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
            }
            catch (e) {
                console.log(e.toString());
                Toast.makeText(e.toString()).show();
            }
            var folders = file_system_1.Folder.fromPath(capturedPicturePath);
            folders.getEntities()
                .then(function (entities) {
                // entities is array with the document's files and folders.
                entities.forEach(function (entity) {
                    if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith('.png')) {
                        var thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                        _this.transformedImageProvider.imageList.push(new transformedimage_common_1.TransformedImage(entity.name, thumnailOrgPath, entity.path, false));
                    }
                });
            }).catch(function (err) {
                // Failed to obtain folder's contents.
                Toast.makeText('Error while loading images', 'long').show();
                console.log(err.stack);
            });
            _this.activityLoader.hide();
        }).catch(function () {
            Toast.makeText('Error in giving permission.', 'long').show();
            console.log('Permission is not granted (sadface)');
        });
    };
    return ImageGalleryComponent;
}());
ImageGalleryComponent = __decorate([
    core_1.Component({
        selector: 'ns-imagegallery',
        moduleId: module.id,
        styleUrls: ['./imagegallery.component.css'],
        templateUrl: './imagegallery.component.html',
    }),
    __metadata("design:paramtypes", [router_1.RouterExtensions,
        modal_dialog_1.ModalDialogService,
        core_1.ViewContainerRef,
        core_1.ChangeDetectorRef,
        router_2.Router, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, activityloader_common_1.ActivityLoader])
], ImageGalleryComponent);
exports.ImageGalleryComponent = ImageGalleryComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWlJO0FBQ2pJLDREQUE0RDtBQUM1RCxzREFBK0Q7QUFDL0QsMENBQTJEO0FBQzNELGtFQUEyRjtBQUszRixnRkFBd0U7QUFDeEUsaUZBQXlFO0FBQ3pFLG9GQUFzRztBQUN0RywwREFBNEQ7QUFDNUQscURBQXVEO0FBQ3ZELHNEQUF3RDtBQUN4RCwwQ0FBNEM7QUFHNUM7O0dBRUc7QUFPSCxJQUFhLHFCQUFxQjtJQW9COUI7Ozs7Ozs7OztPQVNHO0lBQ0gsK0JBQ1ksZ0JBQWtDLEVBQ2xDLFlBQWdDLEVBQ2hDLGdCQUFrQyxFQUNsQyxtQkFBc0MsRUFDdEMsTUFBYyxFQUNkLHdCQUFrRCxFQUNsRCxjQUE4QjtRQU45QixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLGlCQUFZLEdBQVosWUFBWSxDQUFvQjtRQUNoQyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBbUI7UUFDdEMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBMEI7UUFDbEQsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBQzFDLENBQUM7SUFDRDs7S0FFQztJQUNELHdDQUFRLEdBQVI7UUFDSSxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdB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Q0FBcUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNMLDRCQUFDO0FBQUQsQ0FBQyxBQXZYRCxJQXVYQztBQXZYWSxxQkFBcUI7SUFOakMsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO1FBQzNDLFdBQVcsRUFBRSwrQkFBK0I7S0FDL0MsQ0FBQztxQ0FnQ2dDLHlCQUFnQjtRQUNwQixpQ0FBa0I7UUFDZCx1QkFBZ0I7UUFDYix3QkFBaUI7UUFDOUIsZUFBTSxzQkFDWSxvREFBd0Isb0JBQXhCLG9EQUF3QixrQ0FDbEMsc0NBQWM7R0FyQ2pDLHFCQUFxQixDQXVYakM7QUF2WFksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBGaWxlLCBGb2xkZXIgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkV4dHJhcywgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IE1vZGFsRGlhbG9nT3B0aW9ucywgTW9kYWxEaWFsb2dTZXJ2aWNlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvbW9kYWwtZGlhbG9nJztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuaW1wb3J0IHsgQ2hlY2tCb3ggfSBmcm9tICduYXRpdmVzY3JpcHQtY2hlY2tib3gnO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cblxuLyoqXG4gKiBJbWFnZUdhbGxlcnlDb21wb25lbnQgY2xhc3MuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VnYWxsZXJ5JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgc2hhcmluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgZGVsZXRpbmcgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNEZWxldGluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBwb3B1cCBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1BvcFVwTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTb3J0QnlEYXRlIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU29ydEJ5RGF0ZU1lbnU6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgY2hlY2tib3ggdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2hlY2tCb3hWaXNpYmxlOiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgY2hlY2tib3ggc2VsZWN0ZWQgY291bnQuICovXG4gICAgcHJpdmF0ZSBfc2VsZWN0ZWRDb3VudDogbnVtYmVyO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIFNlbGVjdC9VbnNlbGVjdEFsbCBtZW51IHZpc2libGUgb3Igbm90ICovXG4gICAgcHJpdmF0ZSBfaXNTZWxlY3RVbnNlbGVjdEFsbDogYm9vbGVhbjtcbiAgICAvKiogU3RvcmVzIG9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnICovXG4gICAgcHJpdmF0ZSBfb3JkZXJCeUFzY0Rlc2M6IHN0cmluZztcbiAgICAvKiogU3RvcmVzIHBhZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIF9wYWdlO1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIEltYWdlR2FsbGVyeUNvbXBvbmVudFxuICAgICAqIEBwYXJhbSByb3V0ZXJFeHRlbnNpb25zIFxuICAgICAqIEBwYXJhbSBtb2RhbFNlcnZpY2UgXG4gICAgICogQHBhcmFtIHZpZXdDb250YWluZXJSZWYgXG4gICAgICogQHBhcmFtIF9jaGFuZ2VEZXRlY3Rpb25SZWYgXG4gICAgICogQHBhcmFtIHJvdXRlciBcbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIFxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIG1vZGFsU2VydmljZTogTW9kYWxEaWFsb2dTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsXG4gICAgICAgIHByaXZhdGUgX2NoYW5nZURldGVjdGlvblJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyKSB7XG4gICAgfVxuICAgIC8qKlxuICAgKiBBbmd1bGFyIGluaXRpYWxpemUgbWV0aG9kLlxuICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2lzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5fb3JkZXJCeUFzY0Rlc2MgPSAnIERFU0MnO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcih0aGlzLl9vcmRlckJ5QXNjRGVzYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldCBpbWFnZSBsaXN0LlxuICAgICAqIEByZXR1cm5zIGltYWdlIGxpc3QuXG4gICAgICovXG4gICAgZ2V0IGltYWdlTGlzdCgpOiBUcmFuc2Zvcm1lZEltYWdlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXQgY2hlY2tib3ggdmlzaWJsZS5cbiAgICAgKi9cbiAgICBzZXRDaGVja2JveFZpc2libGUoKSB7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogT24gcGFnZSBsb2FkZWRcbiAgICAgKiBAcGFyYW0gYXJncyBcbiAgICAgKi9cbiAgICBvblBhZ2VMb2FkZWQoYXJncykge1xuICAgICAgICB0aGlzLl9wYWdlID0gKGFyZ3MgIT09IHRoaXMuX3BhZ2UpID8gYXJncy5vYmplY3QgYXMgUGFnZSA6IGFyZ3M7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ291bnRUZW1wID0gdGhpcy5fc2VsZWN0ZWRDb3VudDtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApID8gdGhpcy5pc1BvcFVwTWVudSA6IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdGVkQ291bnQgPSBzZWxlY3RlZENvdW50VGVtcDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHbyBiYWNrXG4gICAgICovXG4gICAgZ29CYWNrKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGltYWdlIGluIHRoaXMuaW1hZ2VMaXN0KSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvIHRvIEltYWdlIHNsaWRlIHBhZ2VcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gXG4gICAgICogQHBhcmFtIGltZ0luZGV4UGFyYW0gXG4gICAgICogQHBhcmFtIGFyZ3MgXG4gICAgICovXG4gICAgZ29JbWFnZVNsaWRlKGltZ1VSSVBhcmFtLCBpbWdJbmRleFBhcmFtLCBhcmdzKSB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRpb25FeHRyYXM6IE5hdmlnYXRpb25FeHRyYXMgPSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtczoge1xuICAgICAgICAgICAgICAgIGltZ1VSSTogaW1nVVJJUGFyYW0sXG4gICAgICAgICAgICAgICAgaW1nSW5kZXg6IGltZ0luZGV4UGFyYW0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ2ltYWdlc2xpZGUnXSwgbmF2aWdhdGlvbkV4dHJhcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIElzIGNoZWNrQm94IGNoZWNrZWQgb3Igbm90LlxuICAgICAqIEBwYXJhbSBldmVudCBcbiAgICAgKiBAcGFyYW0gaW1hZ2VQYXRoIFxuICAgICAqIEBwYXJhbSBpbmRleCBcbiAgICAgKi9cbiAgICBpc0NoZWNrZWQoZXZlbnQsIGltYWdlUGF0aCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZENvdW50Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RlZENvdW50LS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX3NlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbGVjdC9VbnNlbGVjdCBhbGwgY2hlY2tib3hcbiAgICAgKi9cbiAgICBvblNlbGVjdFVuU2VsZWN0QWxsQ2hlY2tCb3goKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RlZENvdW50ICE9PSB0aGlzLmltYWdlTGlzdC5sZW5ndGggJiYgdGhpcy5fc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUGF0aWFsbHkgc2VsZWN0ZWQuIERvIHlvdSB3YW50IHRvIHBlcmZvcm0gb25lIG9mIHRoZSBiZWxvdz8nLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnU2VsZWN0IEFsbCcsICdVbnNlbGVjdCBBbGwnXSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdTZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9pc1NlbGVjdFVuc2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5faXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgPT09ICdVbnNlbGVjdCBBbGwnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzU2VsZWN0VW5zZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5faXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9pc1NlbGVjdFVuc2VsZWN0QWxsID0gKHRoaXMuX3NlbGVjdGVkQ291bnQgPT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLl9pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTb3J0IGltYWdlcyBieSBkYXRlLlxuICAgICAqL1xuICAgIG9uU29ydEJ5RGF0ZSgpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbG9uZWRJbWFnZUxpc3QgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLmltYWdlTGlzdCk7XG5cbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAoY2xvbmVkSW1hZ2VMaXN0Lmxlbmd0aCAtIDEpOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVOYW1lLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0udGh1bWJuYWlsUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uaXNTZWxlY3RlZCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNoYXJlIHNlbGVjdGVkIGltYWdlKHMpXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLklOVEVSTkVUXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlc1RvQmVBdHRhY2hlZCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0ZpbGVOYW1lT3JnID0gaW1hZ2UuZmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlKGltZ0ZpbGVOYW1lT3JnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUoaW1nRmlsZU5hbWVPcmcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmlzLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1NFTkRfTVVMVElQTEUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldFR5cGUoJ2ltYWdlL2pwZWcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcyA6ICcgKyBmaWxlc1RvQmVBdHRhY2hlZCArICcuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBleHRyYV90ZXh0ID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8U3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFfdGV4dC5hZGQoJ1NlZSBhdHRhY2hlZCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlcy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1RFWFQsICdTZWUgYXR0YWNoZWQgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZXMuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9XUklURV9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnN0YXJ0QWN0aXZpdHkoYW5kcm9pZC5jb250ZW50LkludGVudC5jcmVhdGVDaG9vc2VyKGludGVudCwgJ1NoYXJlIGltYWdlcy4uLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHNoYXJpbmcgaW1hZ2VzLicgKyBlKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdpcyBleGNlcHRpb24gcmFpc2VzIGR1cmluZyBzZW5kaW5nIG1haWwgJyArIGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQZXJtaXNzaW9uIGlzIG5vdCBncmFudGVkIChzYWRmYWNlKScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZSBzZWxlY3RlZCBpbWFnZShzKVxuICAgICAqL1xuICAgIG9uRGVsZXRlKCkge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdEZWxldGUnLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdEZWxldGluZyBzZWxlY3RlZCBpdGVtKHMpPycsXG4gICAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiAnT2snLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdJZHggPSB0aGlzLmltYWdlTGlzdC5pbmRleE9mKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ0lkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5zcGxpY2UoaW1nSWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGFnZUxvYWRlZCh0aGlzLl9wYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2VzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyBpbWFnZXMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgZGVsZXRpbmcgb3JpZ2luYWwgaW1hZ2UuJyArIGVyci5zdGFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnU2VsZWN0ZWQgaW1hZ2VzIGRlbGV0ZWQuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFBlcmZvcm0gc2VsZWN0L3Vuc2VsZWN0IGFsbCBjaGVja2JveC5cbiAgICAgKiBAcGFyYW0gdmFsdWUgXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodmFsdWU6IGFueSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaGVja0JveCA9IHRoaXMuX3BhZ2UuZ2V0Vmlld0J5SWQoJ2NoZWNrYm94LScgKyBpKSBhcyBDaGVja0JveDtcbiAgICAgICAgICAgIGNoZWNrQm94LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9pc1NlbGVjdFVuc2VsZWN0QWxsID0gIXZhbHVlO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBcbiAgICAvLyAgKi9cbiAgICAvLyBwcml2YXRlIGdldE9yaWdpbmFsSW1hZ2UodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNL0NBTUVSQScsICcuJyk7XG5cbiAgICAvLyAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgLy8gICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAvLyAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgLy8gICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIC8vIHJldHVybiB1cmk7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIC8vIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBcbiAgICAvLyAgKi9cbiAgICAvLyBwcml2YXRlIGdldE9yaWdpbmFsSW1hZ2VXaXRoUmVjdGFuZ2xlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTScsICcuJyk7XG5cbiAgICAvLyAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWFnZS5zdWJzdHJpbmcoMCwgdHJhbnNmb3JtZWRJbWFnZS5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnX2NvbnRvdXIuanBnJztcbiAgICAvLyAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgLy8gICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIC8vIHJldHVybiB1cmk7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIC8vIH1cblxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldCBVUkkgZm9yIGZpbGUuXG4gICAgLy8gICogQHBhcmFtIG5ld0ZpbGUgXG4gICAgLy8gICogQHJldHVybnMgVVJJXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRVUklGb3JGaWxlKG5ld0ZpbGU6IGFueSk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIHJldHVybiB1cmk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aHVtYm5haWwgaW1hZ2VzIGJ5IGNvbnRlbnQgcmVzb2x2ZXIuXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjUGFyYW0gXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtLCB0aGlzLmFjdGl2aXR5TG9hZGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZCB0aHVtYm5haWwgaW1hZ2VzIGJ5IGZpbGUgc3lzdGVtXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlGaWxlU3lzdGVtKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNhcHR1cmVkUGljdHVyZVBhdGggPSAnJztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlZFBpY3R1cmVQYXRoID0gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKS5nZXRBYnNvbHV0ZVBhdGgoKSArICcvRENJTSc7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dChlLnRvU3RyaW5nKCkpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZm9sZGVyczogRm9sZGVyID0gRm9sZGVyLmZyb21QYXRoKGNhcHR1cmVkUGljdHVyZVBhdGgpO1xuICAgICAgICAgICAgICAgIGZvbGRlcnMuZ2V0RW50aXRpZXMoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoZW50aXRpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVudGl0aWVzIGlzIGFycmF5IHdpdGggdGhlIGRvY3VtZW50J3MgZmlsZXMgYW5kIGZvbGRlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50aXR5Lm5hbWUuc3RhcnRzV2l0aCgndGh1bWJfUFRfSU1HJykgJiYgZW50aXR5Lm5hbWUuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBlbnRpdHkucGF0aC5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFpbGVkIHRvIG9idGFpbiBmb2xkZXIncyBjb250ZW50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlcycsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQZXJtaXNzaW9uIGlzIG5vdCBncmFudGVkIChzYWRmYWNlKScpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19