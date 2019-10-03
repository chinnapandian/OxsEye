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
var router_2 = require("nativescript-angular/router");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var transformedimage_common_1 = require("../providers/transformedimage.common");
var angular_1 = require("nativescript-i18n/angular");
var oxseyelogger_1 = require("../logger/oxseyelogger");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
/**
 * ImageGalleryComponent class is being used to display all the thumbnail
 * images of transformed images in gallery view.
 */
var ImageGalleryComponent = (function () {
    // /** Lable for select/unselect All menu */
    // private selectUnselectAllLable: any;
    // /** Lable for sort by date menu */
    // private sortByDateLable: any;
    /**
     * Constructor for ImageGalleryComponent.
     *
     * @param routerExtensions Router extension instance
     * @param router Router instance
     * @param transformedImageProvider Transformed image provider instance
     * @param activityLoader Activity loader instance
     */
    function ImageGalleryComponent(routerExtensions, router, transformedImageProvider, activityLoader, logger, locale) {
        this.routerExtensions = routerExtensions;
        this.router = router;
        this.transformedImageProvider = transformedImageProvider;
        this.activityLoader = activityLoader;
        this.logger = logger;
        this.locale = locale;
        // this.selectUnselectAllLable = this.locale.transform('select_unselect_all');
        // this.sortByDateLable = this.locale.transform('sort_by_date');
    }
    /**
     * Initializes menu properties and checkbox to be selected image(s) and
     * load thumbnail images for gallery view to be displayed.
     */
    ImageGalleryComponent.prototype.ngOnInit = function () {
        this.activityLoader.show();
        this.isCheckBoxVisible = false;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = false;
        this.isSortByDateMenu = true;
        this.isSelectUnselectAll = true;
        // this.loadThumbnailImages();
        this.orderByAscDesc = ' DESC';
        this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
    };
    Object.defineProperty(ImageGalleryComponent.prototype, "imageList", {
        /**
         * Gets the stored transformed thumbnail image list.
         * @returns image list.
         */
        get: function () {
            return this.transformedImageProvider.imageList;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Sets the checkbox and popup menu properties true for them to be visible.
     */
    ImageGalleryComponent.prototype.setCheckboxVisible = function () {
        this.isCheckBoxVisible = true;
        this.isPopUpMenu = true;
    };
    /**
     * This method fires when the gallery page is loaded and sets page and menu
     * properties value to true/false based on thumbnail image list count.
     *
     * @param args Page loaded event data
     */
    ImageGalleryComponent.prototype.onPageLoaded = function (args) {
        this.page = (args !== this.page) ? args.object : args;
        var selectedCountTemp = this.selectedCount;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = (this.imageList.length > 0) ? this.isPopUpMenu : false;
        this.isSortByDateMenu = (this.imageList.length > 0) ? true : false;
        for (var image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.isDeleting = true;
                this.isSharing = true;
                this.selectedCount = selectedCountTemp;
                break;
            }
        }
    };
    /**
     * Goes back to previous page (camera view) when the Back button is pressed.
     */
    ImageGalleryComponent.prototype.goBack = function () {
        for (var image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.imageList[image].isSelected = false;
            }
        }
        this.routerExtensions.back();
    };
    /**
     * Goes to Image slide page when user does double tap on image and also navigates with
     * transformed image URI and index of it.
     *
     * @param imgURIParam Transformed image file URI
     * @param imgIndexParam  image index
     */
    ImageGalleryComponent.prototype.goImageSlide = function (imgURIParam, imgIndexParam) {
        var navigationExtras = {
            queryParams: {
                imgURI: imgURIParam,
                imgIndex: imgIndexParam,
            },
        };
        this.router.navigate(['imageslide'], navigationExtras);
    };
    /**
     * Checks whether the checkBox is been selected or not. If it is selected,
     * the delete/share menus are visible, otherwise they are not visible.
     * And also sets the same value in the image list.
     *
     * @param event Checkbox event data
     * @param imagePath transformed image file path
     * @param index image index in the list
     */
    ImageGalleryComponent.prototype.isChecked = function (event, imagePath, index) {
        if (event.value) {
            this.selectedCount++;
        }
        else {
            this.selectedCount--;
        }
        if (this.selectedCount > 0) {
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
     * Method to show dialog window with options 'Select All' & 'Unselect All' when
     * there is partial selection by user, where user have to select one of the options
     * if needed, otherwise can be cancelled.
     * If there is no partial selection, then this will select all/unselect all based on
     * the current value of the checkbox.
     */
    ImageGalleryComponent.prototype.onSelectUnSelectAllCheckBox = function () {
        var _this = this;
        if (this.selectedCount !== this.imageList.length && this.selectedCount > 0) {
            dialogs.action({
                message: this.locale.transform('dialog_message'),
                cancelButtonText: this.locale.transform('dialog_cancel_btn_text'),
                actions: [this.locale.transform('dialog_action_select_all'), this.locale.transform('dialog_action_unselect_all')],
            }).then(function (result) {
                if (result === _this.locale.transform('dialog_action_select_all')) {
                    _this.isSelectUnselectAll = true;
                    _this.performSelectUnselectAll(_this.isSelectUnselectAll);
                }
                else if (result === _this.locale.transform('dialog_action_unselect_all')) {
                    _this.isSelectUnselectAll = false;
                    _this.performSelectUnselectAll(_this.isSelectUnselectAll);
                }
            });
        }
        else {
            this.isSelectUnselectAll = (this.selectedCount === this.imageList.length) ? false : true;
            this.performSelectUnselectAll(this.isSelectUnselectAll);
        }
    };
    /**
     * This method fires when user choose the menu 'SortByDate',where sorts the image list
     * by date it created and also sets the menus 'delete'/'share' invisible.
     */
    ImageGalleryComponent.prototype.onSortByDate = function () {
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        var clonedImageList = Object.assign([], this.imageList);
        this.transformedImageProvider.imageList = [];
        for (var i = (clonedImageList.length - 1); i >= 0; i--) {
            this.transformedImageProvider.imageList.push(new transformedimage_common_1.TransformedImage(clonedImageList[i].fileName, clonedImageList[i].filePath, clonedImageList[i].thumbnailPath, clonedImageList[i].isSelected));
        }
    };
    /**
     * Shares selected image(s) when user clicks the share button. The sharing can be done
     * via any one of the medias supported by android device by default. The list of supported
     * medias will be visible when the share button clicked.
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
            catch (error) {
                Toast.makeText(_this.locale.transform('error_while_sharing_images') + error).show();
                _this.logger.error('Error while sharing images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
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
     */
    ImageGalleryComponent.prototype.onDelete = function () {
        var _this = this;
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: this.locale.transform('delete'),
                message: this.locale.transform('deleting_selected_item'),
                okButtonText: this.locale.transform('ok'),
                cancelButtonText: this.locale.transform('cancel'),
            }).then(function (result) {
                if (result) {
                    _this.selectedCount = 0;
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
                                    if (_this.imageList.length > 0) {
                                        _this.onPageLoaded(_this.page);
                                    }
                                    else {
                                        _this.routerExtensions.back();
                                    }
                                }).catch(function (error) {
                                    Toast.makeText(_this.locale.transform('error_while_deleting_thumbnail_images') + error).show();
                                    _this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                        + _this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                            }).catch(function (error) {
                                Toast.makeText(_this.locale.transform('error_while_deleting_images')).show();
                                _this.logger.error('Error while deleting images. ' + module.filename
                                    + _this.logger.ERROR_MSG_SEPARATOR + error);
                            });
                        }
                    });
                    Toast.makeText(_this.locale.transform('selected_images_deleted')).show();
                }
            });
        }
    };
    /**
     * Sets all the checkBox checked value based on what it receives value as parameter.
     * And also sets the checkBox's page property value based on the current vlaue like
     * if already has true, then sets false, otherwise it sets true.
     *
     * @param value Checkbox value
     */
    ImageGalleryComponent.prototype.performSelectUnselectAll = function (value) {
        for (var i = 0; i < this.imageList.length; i++) {
            var checkBox = this.page.getViewById('checkbox-' + i);
            checkBox.checked = value;
        }
        this.isSelectUnselectAll = !value;
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
    //     // const uri = android.support.v4.content.FileProvider.getUriForFile(
    //     // application.android.context, 'oxs.eye.fileprovider', newFile);
    //     // application.android.context.grantUriPermission('oxs.eye.fileprovider',
    //     // uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
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
    //     // const uri = android.support.v4.content.FileProvider.getUriForFile(
    //    // application.android.context, 'oxs.eye.fileprovider', newFile);
    //     // application.android.context.grantUriPermission('oxs.eye.fileprovider',
    //     // uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
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
    //     application.android.context.grantUriPermission('oxs.eye.fileprovider',
    //     uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
    //     return uri;
    // }
    /**
     * Loads thumbnail images using content resolver by order what it receives as parameter.
     *
     * @param orderByAscDescParam OrderBy value 'Asc'/'Desc'
     */
    ImageGalleryComponent.prototype.loadThumbnailImagesByContentResolver = function (orderByAscDescParam) {
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader, null);
    };
    /**
     * Loads all the transformed thumbnail images from the file system and stores in the image list for
     * public access. The file system needs READ_EXTERNAL_STORAGE permission.
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
            catch (error) {
                Toast.makeText(_this.locale.transform('error_while_getting_path') + error.toString()).show();
                _this.logger.error('Error while getting path. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
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
            }).catch(function (error) {
                // Failed to obtain folder's contents.
                Toast.makeText(_this.locale.transform('error_while_loading_images') + error, 'long').show();
                _this.logger.error('Error while loading images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
            _this.activityLoader.hide();
        }).catch(function (error) {
            Toast.makeText(_this.locale.transform('error_while_giving_permission') + error, 'long').show();
            _this.logger.error('Error in giving permission. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
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
    __metadata("design:paramtypes", [router_2.RouterExtensions,
        router_1.Router, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, activityloader_common_1.ActivityLoader, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object, angular_1.L])
], ImageGalleryComponent);
exports.ImageGalleryComponent = ImageGalleryComponent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWtEO0FBQ2xELDBDQUEyRDtBQUUzRCw0REFBNEQ7QUFHNUQsc0RBQStEO0FBSS9ELGlGQUF5RTtBQUN6RSxnRkFBd0U7QUFFeEUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxvRkFBc0c7QUFFdEcsMERBQTREO0FBQzVELHFEQUF1RDtBQUV2RCxzREFBd0Q7QUFDeEQsMENBQTRDO0FBRTVDOzs7R0FHRztBQU9ILElBQWEscUJBQXFCO0lBbUI5Qiw0Q0FBNEM7SUFDNUMsdUNBQXVDO0lBQ3ZDLHFDQUFxQztJQUNyQyxnQ0FBZ0M7SUFFaEM7Ozs7Ozs7T0FPRztJQUNILCtCQUNZLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2Qsd0JBQWtELEVBQ2xELGNBQThCLEVBQzlCLE1BQW9CLEVBQ3BCLE1BQVM7UUFMVCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUFDakIsOEVBQThFO1FBQzlFLGdFQUFnRTtJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FB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QkFBeEIsb0RBQXdCLGtDQUNsQyxzQ0FBYyxzQkFDdEIsMkJBQVksb0JBQVosMkJBQVksa0NBQ1osV0FBQztHQXRDWixxQkFBcUIsQ0ErWmpDO0FBL1pZLHNEQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uRXh0cmFzLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBGaWxlLCBGb2xkZXIgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuXG5pbXBvcnQgeyBSb3V0ZXJFeHRlbnNpb25zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQ2hlY2tCb3ggfSBmcm9tICduYXRpdmVzY3JpcHQtY2hlY2tib3gnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UuY29tbW9uJztcblxuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqIGFzIGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcblxuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbi8qKlxuICogSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IGNsYXNzIGlzIGJlaW5nIHVzZWQgdG8gZGlzcGxheSBhbGwgdGhlIHRodW1ibmFpbFxuICogaW1hZ2VzIG9mIHRyYW5zZm9ybWVkIGltYWdlcyBpbiBnYWxsZXJ5IHZpZXcuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VnYWxsZXJ5JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgc2hhcmluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgZGVsZXRpbmcgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNEZWxldGluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBwb3B1cCBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1BvcFVwTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTb3J0QnlEYXRlIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU29ydEJ5RGF0ZU1lbnU6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgY2hlY2tib3ggdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2hlY2tCb3hWaXNpYmxlOiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgY2hlY2tib3ggc2VsZWN0ZWQgY291bnQuICovXG4gICAgcHJpdmF0ZSBzZWxlY3RlZENvdW50OiBudW1iZXI7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgU2VsZWN0L1Vuc2VsZWN0QWxsIG1lbnUgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwcml2YXRlIGlzU2VsZWN0VW5zZWxlY3RBbGw6IGJvb2xlYW47XG4gICAgLyoqIFN0b3JlcyBvcmRlckJ5IHZhbHVlICdBc2MnLydEZXNjJyAqL1xuICAgIHByaXZhdGUgb3JkZXJCeUFzY0Rlc2M6IHN0cmluZztcbiAgICAvKiogU3RvcmVzIHBhZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIHBhZ2U7XG4gICAgLy8gLyoqIExhYmxlIGZvciBzZWxlY3QvdW5zZWxlY3QgQWxsIG1lbnUgKi9cbiAgICAvLyBwcml2YXRlIHNlbGVjdFVuc2VsZWN0QWxsTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNvcnQgYnkgZGF0ZSBtZW51ICovXG4gICAgLy8gcHJpdmF0ZSBzb3J0QnlEYXRlTGFibGU6IGFueTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBJbWFnZUdhbGxlcnlDb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcm91dGVyRXh0ZW5zaW9ucyBSb3V0ZXIgZXh0ZW5zaW9uIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHJvdXRlciBSb3V0ZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIFRyYW5zZm9ybWVkIGltYWdlIHByb3ZpZGVyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIGFjdGl2aXR5TG9hZGVyIEFjdGl2aXR5IGxvYWRlciBpbnN0YW5jZVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMsXG4gICAgICAgIHByaXZhdGUgcm91dGVyOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgdHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyOiBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgYWN0aXZpdHlMb2FkZXI6IEFjdGl2aXR5TG9hZGVyLFxuICAgICAgICBwcml2YXRlIGxvZ2dlcjogT3hzRXllTG9nZ2VyLFxuICAgICAgICBwcml2YXRlIGxvY2FsZTogTCkge1xuICAgICAgICAvLyB0aGlzLnNlbGVjdFVuc2VsZWN0QWxsTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdF91bnNlbGVjdF9hbGwnKTtcbiAgICAgICAgLy8gdGhpcy5zb3J0QnlEYXRlTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NvcnRfYnlfZGF0ZScpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIG1lbnUgcHJvcGVydGllcyBhbmQgY2hlY2tib3ggdG8gYmUgc2VsZWN0ZWQgaW1hZ2UocykgYW5kXG4gICAgICogbG9hZCB0aHVtYm5haWwgaW1hZ2VzIGZvciBnYWxsZXJ5IHZpZXcgdG8gYmUgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpcy5pc0NoZWNrQm94VmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAvLyB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXMoKTtcbiAgICAgICAgdGhpcy5vcmRlckJ5QXNjRGVzYyA9ICcgREVTQyc7XG4gICAgICAgIHRoaXMubG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKHRoaXMub3JkZXJCeUFzY0Rlc2MpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBzdG9yZWQgdHJhbnNmb3JtZWQgdGh1bWJuYWlsIGltYWdlIGxpc3QuXG4gICAgICogQHJldHVybnMgaW1hZ2UgbGlzdC5cbiAgICAgKi9cbiAgICBnZXQgaW1hZ2VMaXN0KCk6IFRyYW5zZm9ybWVkSW1hZ2VbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3Q7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgdGhlIGNoZWNrYm94IGFuZCBwb3B1cCBtZW51IHByb3BlcnRpZXMgdHJ1ZSBmb3IgdGhlbSB0byBiZSB2aXNpYmxlLlxuICAgICAqL1xuICAgIHNldENoZWNrYm94VmlzaWJsZSgpIHtcbiAgICAgICAgdGhpcy5pc0NoZWNrQm94VmlzaWJsZSA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSB0cnVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBmaXJlcyB3aGVuIHRoZSBnYWxsZXJ5IHBhZ2UgaXMgbG9hZGVkIGFuZCBzZXRzIHBhZ2UgYW5kIG1lbnVcbiAgICAgKiBwcm9wZXJ0aWVzIHZhbHVlIHRvIHRydWUvZmFsc2UgYmFzZWQgb24gdGh1bWJuYWlsIGltYWdlIGxpc3QgY291bnQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYXJncyBQYWdlIGxvYWRlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYWdlTG9hZGVkKGFyZ3MpIHtcbiAgICAgICAgdGhpcy5wYWdlID0gKGFyZ3MgIT09IHRoaXMucGFnZSkgPyBhcmdzLm9iamVjdCBhcyBQYWdlIDogYXJncztcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDb3VudFRlbXAgPSB0aGlzLnNlbGVjdGVkQ291bnQ7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApID8gdGhpcy5pc1BvcFVwTWVudSA6IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IHNlbGVjdGVkQ291bnRUZW1wO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgYmFjayB0byBwcmV2aW91cyBwYWdlIChjYW1lcmEgdmlldykgd2hlbiB0aGUgQmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyB0byBJbWFnZSBzbGlkZSBwYWdlIHdoZW4gdXNlciBkb2VzIGRvdWJsZSB0YXAgb24gaW1hZ2UgYW5kIGFsc28gbmF2aWdhdGVzIHdpdGhcbiAgICAgKiB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgYW5kIGluZGV4IG9mIGl0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGltZ1VSSVBhcmFtIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgVVJJXG4gICAgICogQHBhcmFtIGltZ0luZGV4UGFyYW0gIGltYWdlIGluZGV4XG4gICAgICovXG4gICAgZ29JbWFnZVNsaWRlKGltZ1VSSVBhcmFtLCBpbWdJbmRleFBhcmFtKSB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRpb25FeHRyYXM6IE5hdmlnYXRpb25FeHRyYXMgPSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtczoge1xuICAgICAgICAgICAgICAgIGltZ1VSSTogaW1nVVJJUGFyYW0sXG4gICAgICAgICAgICAgICAgaW1nSW5kZXg6IGltZ0luZGV4UGFyYW0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ2ltYWdlc2xpZGUnXSwgbmF2aWdhdGlvbkV4dHJhcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBjaGVja0JveCBpcyBiZWVuIHNlbGVjdGVkIG9yIG5vdC4gSWYgaXQgaXMgc2VsZWN0ZWQsXG4gICAgICogdGhlIGRlbGV0ZS9zaGFyZSBtZW51cyBhcmUgdmlzaWJsZSwgb3RoZXJ3aXNlIHRoZXkgYXJlIG5vdCB2aXNpYmxlLlxuICAgICAqIEFuZCBhbHNvIHNldHMgdGhlIHNhbWUgdmFsdWUgaW4gdGhlIGltYWdlIGxpc3QuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZXZlbnQgQ2hlY2tib3ggZXZlbnQgZGF0YVxuICAgICAqIEBwYXJhbSBpbWFnZVBhdGggdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGluZGV4IGltYWdlIGluZGV4IGluIHRoZSBsaXN0XG4gICAgICovXG4gICAgaXNDaGVja2VkKGV2ZW50LCBpbWFnZVBhdGgsIGluZGV4KSB7XG4gICAgICAgIGlmIChldmVudC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmltYWdlTGlzdFtpbmRleF0uaXNTZWxlY3RlZCA9IGV2ZW50LnZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gc2hvdyBkaWFsb2cgd2luZG93IHdpdGggb3B0aW9ucyAnU2VsZWN0IEFsbCcgJiAnVW5zZWxlY3QgQWxsJyB3aGVuXG4gICAgICogdGhlcmUgaXMgcGFydGlhbCBzZWxlY3Rpb24gYnkgdXNlciwgd2hlcmUgdXNlciBoYXZlIHRvIHNlbGVjdCBvbmUgb2YgdGhlIG9wdGlvbnNcbiAgICAgKiBpZiBuZWVkZWQsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqIElmIHRoZXJlIGlzIG5vIHBhcnRpYWwgc2VsZWN0aW9uLCB0aGVuIHRoaXMgd2lsbCBzZWxlY3QgYWxsL3Vuc2VsZWN0IGFsbCBiYXNlZCBvblxuICAgICAqIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBjaGVja2JveC5cbiAgICAgKi9cbiAgICBvblNlbGVjdFVuU2VsZWN0QWxsQ2hlY2tCb3goKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgIT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCAmJiB0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBkaWFsb2dzLmFjdGlvbih7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfbWVzc2FnZScpLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX2NhbmNlbF9idG5fdGV4dCcpLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFt0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19hY3Rpb25fc2VsZWN0X2FsbCcpLCB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19hY3Rpb25fdW5zZWxlY3RfYWxsJyldLFxuICAgICAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfYWN0aW9uX3NlbGVjdF9hbGwnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19hY3Rpb25fdW5zZWxlY3RfYWxsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSAodGhpcy5zZWxlY3RlZENvdW50ID09PSB0aGlzLmltYWdlTGlzdC5sZW5ndGgpID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBmaXJlcyB3aGVuIHVzZXIgY2hvb3NlIHRoZSBtZW51ICdTb3J0QnlEYXRlJyx3aGVyZSBzb3J0cyB0aGUgaW1hZ2UgbGlzdFxuICAgICAqIGJ5IGRhdGUgaXQgY3JlYXRlZCBhbmQgYWxzbyBzZXRzIHRoZSBtZW51cyAnZGVsZXRlJy8nc2hhcmUnIGludmlzaWJsZS5cbiAgICAgKi9cbiAgICBvblNvcnRCeURhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbG9uZWRJbWFnZUxpc3QgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLmltYWdlTGlzdCk7XG5cbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAoY2xvbmVkSW1hZ2VMaXN0Lmxlbmd0aCAtIDEpOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVOYW1lLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0udGh1bWJuYWlsUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uaXNTZWxlY3RlZCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNoYXJlcyBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSBzaGFyZSBidXR0b24uIFRoZSBzaGFyaW5nIGNhbiBiZSBkb25lXG4gICAgICogdmlhIGFueSBvbmUgb2YgdGhlIG1lZGlhcyBzdXBwb3J0ZWQgYnkgYW5kcm9pZCBkZXZpY2UgYnkgZGVmYXVsdC4gVGhlIGxpc3Qgb2Ygc3VwcG9ydGVkXG4gICAgICogbWVkaWFzIHdpbGwgYmUgdmlzaWJsZSB3aGVuIHRoZSBzaGFyZSBidXR0b24gY2xpY2tlZC5cbiAgICAgKi9cbiAgICBvblNoYXJlKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uSU5URVJORVRdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaXMgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxhbmRyb2lkLm5ldC5Vcmk+KCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVzVG9CZUF0dGFjaGVkID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTScsICcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nRmlsZU5hbWVPcmcgPSBpbWFnZS5maWxlTmFtZS5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh1cmkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2UoaW1nRmlsZU5hbWVPcmcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVyaXMuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fU0VORF9NVUxUSVBMRSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0VHlwZSgnaW1hZ2UvanBlZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzIDogJyArIGZpbGVzVG9CZUF0dGFjaGVkICsgJy4nO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1VCSkVDVCwgJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXMuLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRQYXJjZWxhYmxlQXJyYXlMaXN0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVFJFQU0sIHVyaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGV4dHJhX3RleHQgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxTdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBleHRyYV90ZXh0LmFkZCgnU2VlIGF0dGFjaGVkIHRyYW5zZm9ybWVkIGltYWdlIGZpbGVzLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgJ1NlZSBhdHRhY2hlZCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlcy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1dSSVRFX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfQUNUSVZJVFlfTkVXX1RBU0spO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc3RhcnRBY3Rpdml0eShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LmNyZWF0ZUNob29zZXIoaW50ZW50LCAnU2hhcmUgaW1hZ2VzLi4uJykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9zaGFyaW5nX2ltYWdlcycpICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHNoYXJpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJykgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgJ2RlbGV0ZScgYnV0dG9uIGluIG1lbnUuXG4gICAgICogVGhpcyB3aWxsIHNob3cgdXAgYSBkaWFsb2cgd2luZG93IGZvciBjb25maXJtYXRpb24gZm9yIHRoZSBzZWxlY3RlZCBpbWFnZShzKVxuICAgICAqIHRvIGJlIGRlbGV0ZWQuIElmIHVzZXIgc2F5cyAnT2snLCB0aGVuIHRob3NlIGltYWdlKHMpIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAqIGRldmljZSwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICovXG4gICAgb25EZWxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgICAgIHRpdGxlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RlbGV0ZScpLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGVsZXRpbmdfc2VsZWN0ZWRfaXRlbScpLFxuICAgICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdvaycpLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnY2FuY2VsJyksXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nSWR4ID0gdGhpcy5pbWFnZUxpc3QuaW5kZXhPZihpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3Quc3BsaWNlKGltZ0lkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25QYWdlTG9hZGVkKHRoaXMucGFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGh1bWJuYWlsX2ltYWdlcycpICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfaW1hZ2VzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdGVkX2ltYWdlc19kZWxldGVkJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGFsbCB0aGUgY2hlY2tCb3ggY2hlY2tlZCB2YWx1ZSBiYXNlZCBvbiB3aGF0IGl0IHJlY2VpdmVzIHZhbHVlIGFzIHBhcmFtZXRlci5cbiAgICAgKiBBbmQgYWxzbyBzZXRzIHRoZSBjaGVja0JveCdzIHBhZ2UgcHJvcGVydHkgdmFsdWUgYmFzZWQgb24gdGhlIGN1cnJlbnQgdmxhdWUgbGlrZVxuICAgICAqIGlmIGFscmVhZHkgaGFzIHRydWUsIHRoZW4gc2V0cyBmYWxzZSwgb3RoZXJ3aXNlIGl0IHNldHMgdHJ1ZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGVja2JveCB2YWx1ZVxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tCb3ggPSB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoJ2NoZWNrYm94LScgKyBpKSBhcyBDaGVja0JveDtcbiAgICAgICAgICAgIGNoZWNrQm94LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSAhdmFsdWU7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldCBvcmlnaW5hbCBpbWFnZVxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgIC8vICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICAvLyB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgLy8gfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldCBvcmlnaW5hbCBpbWFnZVxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuXG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAvLyAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIC8vIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgIC8vICAgICAvLyByZXR1cm4gdXJpO1xuICAgIC8vICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAvLyB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgVVJJIGZvciBmaWxlLlxuICAgIC8vICAqIEBwYXJhbSBuZXdGaWxlXG4gICAgLy8gICogQHJldHVybnMgVVJJXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRVUklGb3JGaWxlKG5ld0ZpbGU6IGFueSk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIHJldHVybiB1cmk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGh1bWJuYWlsIGltYWdlcyB1c2luZyBjb250ZW50IHJlc29sdmVyIGJ5IG9yZGVyIHdoYXQgaXQgcmVjZWl2ZXMgYXMgcGFyYW1ldGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjUGFyYW0gT3JkZXJCeSB2YWx1ZSAnQXNjJy8nRGVzYydcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIubG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjUGFyYW0sIHRoaXMuYWN0aXZpdHlMb2FkZXIsIG51bGwpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhbGwgdGhlIHRyYW5zZm9ybWVkIHRodW1ibmFpbCBpbWFnZXMgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gYW5kIHN0b3JlcyBpbiB0aGUgaW1hZ2UgbGlzdCBmb3JcbiAgICAgKiBwdWJsaWMgYWNjZXNzLiBUaGUgZmlsZSBzeXN0ZW0gbmVlZHMgUkVBRF9FWFRFUk5BTF9TVE9SQUdFIHBlcm1pc3Npb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlGaWxlU3lzdGVtKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGNhcHR1cmVkUGljdHVyZVBhdGggPSAnJztcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjYXB0dXJlZFBpY3R1cmVQYXRoID0gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKS5nZXRBYnNvbHV0ZVBhdGgoKSArICcvRENJTSc7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9nZXR0aW5nX3BhdGgnKSArIGVycm9yLnRvU3RyaW5nKCkpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlcnM6IEZvbGRlciA9IEZvbGRlci5mcm9tUGF0aChjYXB0dXJlZFBpY3R1cmVQYXRoKTtcbiAgICAgICAgICAgICAgICBmb2xkZXJzLmdldEVudGl0aWVzKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGVudGl0aWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnRpdGllcyBpcyBhcnJheSB3aXRoIHRoZSBkb2N1bWVudCdzIGZpbGVzIGFuZCBmb2xkZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5uYW1lLnN0YXJ0c1dpdGgoJ3RodW1iX1BUX0lNRycpICYmIGVudGl0eS5uYW1lLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gZW50aXR5LnBhdGgucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFpbGVkIHRvIG9idGFpbiBmb2xkZXIncyBjb250ZW50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfbG9hZGluZ19pbWFnZXMnKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9naXZpbmdfcGVybWlzc2lvbicpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=