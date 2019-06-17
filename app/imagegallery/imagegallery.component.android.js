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
                                    _this.onPageLoaded(_this.page);
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
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWtEO0FBQ2xELDBDQUEyRDtBQUUzRCw0REFBNEQ7QUFHNUQsc0RBQStEO0FBSS9ELGlGQUF5RTtBQUN6RSxnRkFBd0U7QUFFeEUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxvRkFBc0c7QUFFdEcsMERBQTREO0FBQzVELHFEQUF1RDtBQUV2RCxzREFBd0Q7QUFDeEQsMENBQTRDO0FBRTVDOzs7R0FHRztBQU9ILElBQWEscUJBQXFCO0lBbUI5Qiw0Q0FBNEM7SUFDNUMsdUNBQXVDO0lBQ3ZDLHFDQUFxQztJQUNyQyxnQ0FBZ0M7SUFFaEM7Ozs7Ozs7T0FPRztJQUNILCtCQUNZLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2Qsd0JBQWtELEVBQ2xELGNBQThCLEVBQzlCLE1BQW9CLEVBQ3BCLE1BQVM7UUFMVCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUFDakIsOEVBQThFO1FBQzlFLGdFQUFnRTtJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FB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RSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0YsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ2xILENBQUMsQ0FBQyxDQUFDO1lBQ1AsS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5RixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDbEgsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQUFDLEFBM1pELElBMlpDO0FBM1pZLHFCQUFxQjtJQU5qQyxnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsOEJBQThCLENBQUM7UUFDM0MsV0FBVyxFQUFFLCtCQUErQjtLQUMvQyxDQUFDO3FDQWtDZ0MseUJBQWdCO1FBQzFCLGVBQU0sc0JBQ1ksb0RBQXdCLG9CQUF4QixvREFBd0Isa0NBQ2xDLHNDQUFjLHNCQUN0QiwyQkFBWSxvQkFBWiwyQkFBWSxrQ0FDWixXQUFDO0dBdENaLHFCQUFxQixDQTJaakM7QUEzWlksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdmlnYXRpb25FeHRyYXMsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEZpbGUsIEZvbGRlciB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBDaGVja0JveCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1jaGVja2JveCc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLyoqXG4gKiBJbWFnZUdhbGxlcnlDb21wb25lbnQgY2xhc3MgaXMgYmVpbmcgdXNlZCB0byBkaXNwbGF5IGFsbCB0aGUgdGh1bWJuYWlsIFxuICogaW1hZ2VzIG9mIHRyYW5zZm9ybWVkIGltYWdlcyBpbiBnYWxsZXJ5IHZpZXcuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VnYWxsZXJ5JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgc2hhcmluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgZGVsZXRpbmcgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNEZWxldGluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBwb3B1cCBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1BvcFVwTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTb3J0QnlEYXRlIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU29ydEJ5RGF0ZU1lbnU6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgY2hlY2tib3ggdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2hlY2tCb3hWaXNpYmxlOiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgY2hlY2tib3ggc2VsZWN0ZWQgY291bnQuICovXG4gICAgcHJpdmF0ZSBzZWxlY3RlZENvdW50OiBudW1iZXI7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgU2VsZWN0L1Vuc2VsZWN0QWxsIG1lbnUgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwcml2YXRlIGlzU2VsZWN0VW5zZWxlY3RBbGw6IGJvb2xlYW47XG4gICAgLyoqIFN0b3JlcyBvcmRlckJ5IHZhbHVlICdBc2MnLydEZXNjJyAqL1xuICAgIHByaXZhdGUgb3JkZXJCeUFzY0Rlc2M6IHN0cmluZztcbiAgICAvKiogU3RvcmVzIHBhZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIHBhZ2U7XG4gICAgLy8gLyoqIExhYmxlIGZvciBzZWxlY3QvdW5zZWxlY3QgQWxsIG1lbnUgKi9cbiAgICAvLyBwcml2YXRlIHNlbGVjdFVuc2VsZWN0QWxsTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNvcnQgYnkgZGF0ZSBtZW51ICovXG4gICAgLy8gcHJpdmF0ZSBzb3J0QnlEYXRlTGFibGU6IGFueTtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBJbWFnZUdhbGxlcnlDb21wb25lbnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyIGV4dGVuc2lvbiBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhbGU6IEwpIHtcbiAgICAgICAgLy8gdGhpcy5zZWxlY3RVbnNlbGVjdEFsbExhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzZWxlY3RfdW5zZWxlY3RfYWxsJyk7XG4gICAgICAgIC8vIHRoaXMuc29ydEJ5RGF0ZUxhYmxlID0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzb3J0X2J5X2RhdGUnKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBtZW51IHByb3BlcnRpZXMgYW5kIGNoZWNrYm94IHRvIGJlIHNlbGVjdGVkIGltYWdlKHMpIGFuZFxuICAgICAqIGxvYWQgdGh1bWJuYWlsIGltYWdlcyBmb3IgZ2FsbGVyeSB2aWV3IHRvIGJlIGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NvcnRCeURhdGVNZW51ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgLy8gdGhpcy5sb2FkVGh1bWJuYWlsSW1hZ2VzKCk7XG4gICAgICAgIHRoaXMub3JkZXJCeUFzY0Rlc2MgPSAnIERFU0MnO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcih0aGlzLm9yZGVyQnlBc2NEZXNjKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgc3RvcmVkIHRyYW5zZm9ybWVkIHRodW1ibmFpbCBpbWFnZSBsaXN0LlxuICAgICAqIEByZXR1cm5zIGltYWdlIGxpc3QuXG4gICAgICovXG4gICAgZ2V0IGltYWdlTGlzdCgpOiBUcmFuc2Zvcm1lZEltYWdlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjaGVja2JveCBhbmQgcG9wdXAgbWVudSBwcm9wZXJ0aWVzIHRydWUgZm9yIHRoZW0gdG8gYmUgdmlzaWJsZS5cbiAgICAgKi9cbiAgICBzZXRDaGVja2JveFZpc2libGUoKSB7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gdHJ1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgZmlyZXMgd2hlbiB0aGUgZ2FsbGVyeSBwYWdlIGlzIGxvYWRlZCBhbmQgc2V0cyBwYWdlIGFuZCBtZW51XG4gICAgICogcHJvcGVydGllcyB2YWx1ZSB0byB0cnVlL2ZhbHNlIGJhc2VkIG9uIHRodW1ibmFpbCBpbWFnZSBsaXN0IGNvdW50LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBvblBhZ2VMb2FkZWQoYXJncykge1xuICAgICAgICB0aGlzLnBhZ2UgPSAoYXJncyAhPT0gdGhpcy5wYWdlKSA/IGFyZ3Mub2JqZWN0IGFzIFBhZ2UgOiBhcmdzO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENvdW50VGVtcCA9IHRoaXMuc2VsZWN0ZWRDb3VudDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0aGlzLmlzUG9wVXBNZW51IDogZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9ICh0aGlzLmltYWdlTGlzdC5sZW5ndGggPiAwKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gc2VsZWN0ZWRDb3VudFRlbXA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2UgKGNhbWVyYSB2aWV3KSB3aGVuIHRoZSBCYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqL1xuICAgIGdvQmFjaygpIHtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3RbaW1hZ2VdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHb2VzIHRvIEltYWdlIHNsaWRlIHBhZ2Ugd2hlbiB1c2VyIGRvZXMgZG91YmxlIHRhcCBvbiBpbWFnZSBhbmQgYWxzbyBuYXZpZ2F0ZXMgd2l0aFxuICAgICAqIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbmQgaW5kZXggb2YgaXQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGltZ1VSSVBhcmFtIFRyYW5zZm9ybWVkIGltYWdlIGZpbGUgVVJJXG4gICAgICogQHBhcmFtIGltZ0luZGV4UGFyYW0gIGltYWdlIGluZGV4XG4gICAgICovXG4gICAgZ29JbWFnZVNsaWRlKGltZ1VSSVBhcmFtLCBpbWdJbmRleFBhcmFtKSB7XG4gICAgICAgIGNvbnN0IG5hdmlnYXRpb25FeHRyYXM6IE5hdmlnYXRpb25FeHRyYXMgPSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtczoge1xuICAgICAgICAgICAgICAgIGltZ1VSSTogaW1nVVJJUGFyYW0sXG4gICAgICAgICAgICAgICAgaW1nSW5kZXg6IGltZ0luZGV4UGFyYW0sXG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbJ2ltYWdlc2xpZGUnXSwgbmF2aWdhdGlvbkV4dHJhcyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIHRoZSBjaGVja0JveCBpcyBiZWVuIHNlbGVjdGVkIG9yIG5vdC4gSWYgaXQgaXMgc2VsZWN0ZWQsXG4gICAgICogdGhlIGRlbGV0ZS9zaGFyZSBtZW51cyBhcmUgdmlzaWJsZSwgb3RoZXJ3aXNlIHRoZXkgYXJlIG5vdCB2aXNpYmxlLlxuICAgICAqIEFuZCBhbHNvIHNldHMgdGhlIHNhbWUgdmFsdWUgaW4gdGhlIGltYWdlIGxpc3QuXG4gICAgICogXG4gICAgICogQHBhcmFtIGV2ZW50IENoZWNrYm94IGV2ZW50IGRhdGFcbiAgICAgKiBAcGFyYW0gaW1hZ2VQYXRoIHRyYW5zZm9ybWVkIGltYWdlIGZpbGUgcGF0aFxuICAgICAqIEBwYXJhbSBpbmRleCBpbWFnZSBpbmRleCBpbiB0aGUgbGlzdFxuICAgICAqL1xuICAgIGlzQ2hlY2tlZChldmVudCwgaW1hZ2VQYXRoLCBpbmRleCkge1xuICAgICAgICBpZiAoZXZlbnQudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCsrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50LS07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbWFnZUxpc3RbaW5kZXhdLmlzU2VsZWN0ZWQgPSBldmVudC52YWx1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHNob3cgZGlhbG9nIHdpbmRvdyB3aXRoIG9wdGlvbnMgJ1NlbGVjdCBBbGwnICYgJ1Vuc2VsZWN0IEFsbCcgd2hlblxuICAgICAqIHRoZXJlIGlzIHBhcnRpYWwgc2VsZWN0aW9uIGJ5IHVzZXIsIHdoZXJlIHVzZXIgaGF2ZSB0byBzZWxlY3Qgb25lIG9mIHRoZSBvcHRpb25zXG4gICAgICogaWYgbmVlZGVkLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAgKiBJZiB0aGVyZSBpcyBubyBwYXJ0aWFsIHNlbGVjdGlvbiwgdGhlbiB0aGlzIHdpbGwgc2VsZWN0IGFsbC91bnNlbGVjdCBhbGwgYmFzZWQgb25cbiAgICAgKiB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgY2hlY2tib3guXG4gICAgICovXG4gICAgb25TZWxlY3RVblNlbGVjdEFsbENoZWNrQm94KCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ICE9PSB0aGlzLmltYWdlTGlzdC5sZW5ndGggJiYgdGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlhbG9ncy5hY3Rpb24oe1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX21lc3NhZ2UnKSxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19jYW5jZWxfYnRuX3RleHQnKSxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfYWN0aW9uX3NlbGVjdF9hbGwnKSwgdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfYWN0aW9uX3Vuc2VsZWN0X2FsbCcpXSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX2FjdGlvbl9zZWxlY3RfYWxsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfYWN0aW9uX3Vuc2VsZWN0X2FsbCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gKHRoaXMuc2VsZWN0ZWRDb3VudCA9PT0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgZmlyZXMgd2hlbiB1c2VyIGNob29zZSB0aGUgbWVudSAnU29ydEJ5RGF0ZScsd2hlcmUgc29ydHMgdGhlIGltYWdlIGxpc3RcbiAgICAgKiBieSBkYXRlIGl0IGNyZWF0ZWQgYW5kIGFsc28gc2V0cyB0aGUgbWVudXMgJ2RlbGV0ZScvJ3NoYXJlJyBpbnZpc2libGUuXG4gICAgICovXG4gICAgb25Tb3J0QnlEYXRlKCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgY2xvbmVkSW1hZ2VMaXN0ID0gT2JqZWN0LmFzc2lnbihbXSwgdGhpcy5pbWFnZUxpc3QpO1xuXG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gKGNsb25lZEltYWdlTGlzdC5sZW5ndGggLSAxKTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5maWxlTmFtZSxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLnRodW1ibmFpbFBhdGgsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmlzU2VsZWN0ZWQsXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaGFyZXMgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgc2hhcmUgYnV0dG9uLiBUaGUgc2hhcmluZyBjYW4gYmUgZG9uZVxuICAgICAqIHZpYSBhbnkgb25lIG9mIHRoZSBtZWRpYXMgc3VwcG9ydGVkIGJ5IGFuZHJvaWQgZGV2aWNlIGJ5IGRlZmF1bHQuIFRoZSBsaXN0IG9mIHN1cHBvcnRlZFxuICAgICAqIG1lZGlhcyB3aWxsIGJlIHZpc2libGUgd2hlbiB0aGUgc2hhcmUgYnV0dG9uIGNsaWNrZWQuXG4gICAgICovXG4gICAgb25TaGFyZSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLklOVEVSTkVUXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmlzID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8YW5kcm9pZC5uZXQuVXJpPigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlc1RvQmVBdHRhY2hlZCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0ZpbGVOYW1lT3JnID0gaW1hZ2UuZmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICdveHMuZXllLmZpbGVwcm92aWRlcicsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmlzLmFkZCh0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRPcmlnaW5hbEltYWdlKGltZ0ZpbGVOYW1lT3JnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUoaW1nRmlsZU5hbWVPcmcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cmlzLnNpemUoKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGludGVudCA9IG5ldyBhbmRyb2lkLmNvbnRlbnQuSW50ZW50KGFuZHJvaWQuY29udGVudC5JbnRlbnQuQUNUSU9OX1NFTkRfTVVMVElQTEUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldFR5cGUoJ2ltYWdlL2pwZWcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcyA6ICcgKyBmaWxlc1RvQmVBdHRhY2hlZCArICcuJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NVQkpFQ1QsICdQZXJzcGVjdGl2ZSBjb3JyZWN0aW9uIHBpY3R1cmVzLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBleHRyYV90ZXh0ID0gbmV3IGphdmEudXRpbC5BcnJheUxpc3Q8U3RyaW5nPigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXh0cmFfdGV4dC5hZGQoJ1NlZSBhdHRhY2hlZCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlcy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5wdXRFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1RFWFQsICdTZWUgYXR0YWNoZWQgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZXMuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9XUklURV9VUklfUEVSTUlTU0lPTik7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQuc2V0RmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0FDVElWSVRZX05FV19UQVNLKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuZm9yZWdyb3VuZEFjdGl2aXR5LnN0YXJ0QWN0aXZpdHkoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5kcm9pZC5jb250ZW50LkludGVudC5jcmVhdGVDaG9vc2VyKGludGVudCwgJ1NoYXJlIGltYWdlcy4uLicpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfc2hhcmluZ19pbWFnZXMnKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9naXZpbmdfcGVybWlzc2lvbicpICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlICdkZWxldGUnIGJ1dHRvbiBpbiBtZW51LlxuICAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAgKiB0byBiZSBkZWxldGVkLiBJZiB1c2VyIHNheXMgJ09rJywgdGhlbiB0aG9zZSBpbWFnZShzKSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqL1xuICAgIG9uRGVsZXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlhbG9ncy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkZWxldGUnKSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RlbGV0aW5nX3NlbGVjdGVkX2l0ZW0nKSxcbiAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnb2snKSxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2NhbmNlbCcpLFxuICAgICAgICAgICAgfSkudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2UuZmlsZVBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bWJuYWlsRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoaW1hZ2UudGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtYm5haWxGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1hZ2UudGh1bWJuYWlsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGltZ0lkeCA9IHRoaXMuaW1hZ2VMaXN0LmluZGV4T2YoaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1nSWR4ID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LnNwbGljZShpbWdJZHgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25QYWdlTG9hZGVkKHRoaXMucGFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfdGh1bWJuYWlsX2ltYWdlcycpICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZGVsZXRpbmdfaW1hZ2VzJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdGVkX2ltYWdlc19kZWxldGVkJykpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGFsbCB0aGUgY2hlY2tCb3ggY2hlY2tlZCB2YWx1ZSBiYXNlZCBvbiB3aGF0IGl0IHJlY2VpdmVzIHZhbHVlIGFzIHBhcmFtZXRlci5cbiAgICAgKiBBbmQgYWxzbyBzZXRzIHRoZSBjaGVja0JveCdzIHBhZ2UgcHJvcGVydHkgdmFsdWUgYmFzZWQgb24gdGhlIGN1cnJlbnQgdmxhdWUgbGlrZVxuICAgICAqIGlmIGFscmVhZHkgaGFzIHRydWUsIHRoZW4gc2V0cyBmYWxzZSwgb3RoZXJ3aXNlIGl0IHNldHMgdHJ1ZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hlY2tib3ggdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh2YWx1ZTogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrQm94ID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdjaGVja2JveC0nICsgaSkgYXMgQ2hlY2tCb3g7XG4gICAgICAgICAgICBjaGVja0JveC5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gIXZhbHVlO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcblxuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgLy8gdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIC8vIHJldHVybiB1cmk7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIC8vIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnN1YnN0cmluZygwLCB0cmFuc2Zvcm1lZEltYWdlLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgLy8gICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICAvLyB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgLy8gfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0IFVSSSBmb3IgZmlsZS5cbiAgICAvLyAgKiBAcGFyYW0gbmV3RmlsZVxuICAgIC8vICAqIEByZXR1cm5zIFVSSVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0VVJJRm9yRmlsZShuZXdGaWxlOiBhbnkpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgIC8vICAgICByZXR1cm4gdXJpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRodW1ibmFpbCBpbWFnZXMgdXNpbmcgY29udGVudCByZXNvbHZlciBieSBvcmRlciB3aGF0IGl0IHJlY2VpdmVzIGFzIHBhcmFtZXRlci5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gb3JkZXJCeUFzY0Rlc2NQYXJhbSBPcmRlckJ5IHZhbHVlICdBc2MnLydEZXNjJ1xuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjUGFyYW06IHN0cmluZykge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbSwgdGhpcy5hY3Rpdml0eUxvYWRlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvYWRzIGFsbCB0aGUgdHJhbnNmb3JtZWQgdGh1bWJuYWlsIGltYWdlcyBmcm9tIHRoZSBmaWxlIHN5c3RlbSBhbmQgc3RvcmVzIGluIHRoZSBpbWFnZSBsaXN0IGZvclxuICAgICAqIHB1YmxpYyBhY2Nlc3MuIFRoZSBmaWxlIHN5c3RlbSBuZWVkcyBSRUFEX0VYVEVSTkFMX1NUT1JBR0UgcGVybWlzc2lvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRUaHVtYm5haWxJbWFnZXNCeUZpbGVTeXN0ZW0oKSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgY2FwdHVyZWRQaWN0dXJlUGF0aCA9ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGNhcHR1cmVkUGljdHVyZVBhdGggPSBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpLmdldEFic29sdXRlUGF0aCgpICsgJy9EQ0lNJztcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dldHRpbmdfcGF0aCcpICsgZXJyb3IudG9TdHJpbmcoKSkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZ2V0dGluZyBwYXRoLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgZm9sZGVyczogRm9sZGVyID0gRm9sZGVyLmZyb21QYXRoKGNhcHR1cmVkUGljdHVyZVBhdGgpO1xuICAgICAgICAgICAgICAgIGZvbGRlcnMuZ2V0RW50aXRpZXMoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoZW50aXRpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVudGl0aWVzIGlzIGFycmF5IHdpdGggdGhlIGRvY3VtZW50J3MgZmlsZXMgYW5kIGZvbGRlcnMuXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZW50aXR5Lm5hbWUuc3RhcnRzV2l0aCgndGh1bWJfUFRfSU1HJykgJiYgZW50aXR5Lm5hbWUuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtbmFpbE9yZ1BhdGggPSBlbnRpdHkucGF0aC5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWlsZWQgdG8gb2J0YWluIGZvbGRlcidzIGNvbnRlbnRzLlxuICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdlcnJvcl93aGlsZV9sb2FkaW5nX2ltYWdlcycpICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2dpdmluZ19wZXJtaXNzaW9uJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==