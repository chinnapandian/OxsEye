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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWtEO0FBQ2xELDBDQUEyRDtBQUUzRCw0REFBNEQ7QUFHNUQsc0RBQStEO0FBSS9ELGlGQUF5RTtBQUN6RSxnRkFBd0U7QUFFeEUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxvRkFBc0c7QUFFdEcsMERBQTREO0FBQzVELHFEQUF1RDtBQUV2RCxzREFBd0Q7QUFDeEQsMENBQTRDO0FBRTVDOzs7R0FHRztBQU9ILElBQWEscUJBQXFCO0lBbUI5Qiw0Q0FBNEM7SUFDNUMsdUNBQXVDO0lBQ3ZDLHFDQUFxQztJQUNyQyxnQ0FBZ0M7SUFFaEM7Ozs7Ozs7T0FPRztJQUNILCtCQUNZLGdCQUFrQyxFQUNsQyxNQUFjLEVBQ2Qsd0JBQWtELEVBQ2xELGNBQThCLEVBQzlCLE1BQW9CLEVBQ3BCLE1BQVM7UUFMVCxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLFdBQU0sR0FBTixNQUFNLENBQUc7UUFDakIsOEVBQThFO1FBQzlFLGdFQUFnRTtJQUNwRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsU0FB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RSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDM0YsS0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ2xILENBQUMsQ0FBQyxDQUFDO1lBQ1AsS0FBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FBQyxHQUFHLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM5RixLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDbEgsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0wsNEJBQUM7QUFBRCxDQUFDLEFBM1pELElBMlpDO0FBM1pZLHFCQUFxQjtJQU5qQyxnQkFBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7UUFDbkIsU0FBUyxFQUFFLENBQUMsOEJBQThCLENBQUM7UUFDM0MsV0FBVyxFQUFFLCtCQUErQjtLQUMvQyxDQUFDO3FDQWtDZ0MseUJBQWdCO1FBQzFCLGVBQU0sc0JBQ1ksb0RBQXdCLG9CQUF4QixvREFBd0Isa0NBQ2xDLHNDQUFjLHNCQUN0QiwyQkFBWSxvQkFBWiwyQkFBWSxrQ0FDWixXQUFDO0dBdENaLHFCQUFxQixDQTJaakM7QUEzWlksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdmlnYXRpb25FeHRyYXMsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEZpbGUsIEZvbGRlciB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBDaGVja0JveCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1jaGVja2JveCc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLyoqXG4gKiBJbWFnZUdhbGxlcnlDb21wb25lbnQgY2xhc3MgaXMgYmVpbmcgdXNlZCB0byBkaXNwbGF5IGFsbCB0aGUgdGh1bWJuYWlsXG4gKiBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2VzIGluIGdhbGxlcnkgdmlldy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1pbWFnZWdhbGxlcnknLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBzaGFyaW5nIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU2hhcmluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBkZWxldGluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIHBvcHVwIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzUG9wVXBNZW51OiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIFNvcnRCeURhdGUgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNTb3J0QnlEYXRlTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBjaGVja2JveCB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDaGVja0JveFZpc2libGU6IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBjaGVja2JveCBzZWxlY3RlZCBjb3VudC4gKi9cbiAgICBwcml2YXRlIHNlbGVjdGVkQ291bnQ6IG51bWJlcjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTZWxlY3QvVW5zZWxlY3RBbGwgbWVudSB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNTZWxlY3RVbnNlbGVjdEFsbDogYm9vbGVhbjtcbiAgICAvKiogU3RvcmVzIG9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnICovXG4gICAgcHJpdmF0ZSBvcmRlckJ5QXNjRGVzYzogc3RyaW5nO1xuICAgIC8qKiBTdG9yZXMgcGFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgcGFnZTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNlbGVjdC91bnNlbGVjdCBBbGwgbWVudSAqL1xuICAgIC8vIHByaXZhdGUgc2VsZWN0VW5zZWxlY3RBbGxMYWJsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3Igc29ydCBieSBkYXRlIG1lbnUgKi9cbiAgICAvLyBwcml2YXRlIHNvcnRCeURhdGVMYWJsZTogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIEltYWdlR2FsbGVyeUNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByb3V0ZXJFeHRlbnNpb25zIFJvdXRlciBleHRlbnNpb24gaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWQgaW1hZ2UgcHJvdmlkZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHkgbG9hZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIsXG4gICAgICAgIHByaXZhdGUgbG9jYWxlOiBMKSB7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0VW5zZWxlY3RBbGxMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc2VsZWN0X3Vuc2VsZWN0X2FsbCcpO1xuICAgICAgICAvLyB0aGlzLnNvcnRCeURhdGVMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc29ydF9ieV9kYXRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgbWVudSBwcm9wZXJ0aWVzIGFuZCBjaGVja2JveCB0byBiZSBzZWxlY3RlZCBpbWFnZShzKSBhbmRcbiAgICAgKiBsb2FkIHRodW1ibmFpbCBpbWFnZXMgZm9yIGdhbGxlcnkgdmlldyB0byBiZSBkaXNwbGF5ZWQuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMubG9hZFRodW1ibmFpbEltYWdlcygpO1xuICAgICAgICB0aGlzLm9yZGVyQnlBc2NEZXNjID0gJyBERVNDJztcbiAgICAgICAgdGhpcy5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIodGhpcy5vcmRlckJ5QXNjRGVzYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0b3JlZCB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2UgbGlzdC5cbiAgICAgKiBAcmV0dXJucyBpbWFnZSBsaXN0LlxuICAgICAqL1xuICAgIGdldCBpbWFnZUxpc3QoKTogVHJhbnNmb3JtZWRJbWFnZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY2hlY2tib3ggYW5kIHBvcHVwIG1lbnUgcHJvcGVydGllcyB0cnVlIGZvciB0aGVtIHRvIGJlIHZpc2libGUuXG4gICAgICovXG4gICAgc2V0Q2hlY2tib3hWaXNpYmxlKCkge1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdGhlIGdhbGxlcnkgcGFnZSBpcyBsb2FkZWQgYW5kIHNldHMgcGFnZSBhbmQgbWVudVxuICAgICAqIHByb3BlcnRpZXMgdmFsdWUgdG8gdHJ1ZS9mYWxzZSBiYXNlZCBvbiB0aHVtYm5haWwgaW1hZ2UgbGlzdCBjb3VudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBvblBhZ2VMb2FkZWQoYXJncykge1xuICAgICAgICB0aGlzLnBhZ2UgPSAoYXJncyAhPT0gdGhpcy5wYWdlKSA/IGFyZ3Mub2JqZWN0IGFzIFBhZ2UgOiBhcmdzO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENvdW50VGVtcCA9IHRoaXMuc2VsZWN0ZWRDb3VudDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0aGlzLmlzUG9wVXBNZW51IDogZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9ICh0aGlzLmltYWdlTGlzdC5sZW5ndGggPiAwKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gc2VsZWN0ZWRDb3VudFRlbXA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2UgKGNhbWVyYSB2aWV3KSB3aGVuIHRoZSBCYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqL1xuICAgIGdvQmFjaygpIHtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3RbaW1hZ2VdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHb2VzIHRvIEltYWdlIHNsaWRlIHBhZ2Ugd2hlbiB1c2VyIGRvZXMgZG91YmxlIHRhcCBvbiBpbWFnZSBhbmQgYWxzbyBuYXZpZ2F0ZXMgd2l0aFxuICAgICAqIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbmQgaW5kZXggb2YgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKiBAcGFyYW0gaW1nSW5kZXhQYXJhbSAgaW1hZ2UgaW5kZXhcbiAgICAgKi9cbiAgICBnb0ltYWdlU2xpZGUoaW1nVVJJUGFyYW0sIGltZ0luZGV4UGFyYW0pIHtcbiAgICAgICAgY29uc3QgbmF2aWdhdGlvbkV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyA9IHtcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgaW1nVVJJOiBpbWdVUklQYXJhbSxcbiAgICAgICAgICAgICAgICBpbWdJbmRleDogaW1nSW5kZXhQYXJhbSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VzbGlkZSddLCBuYXZpZ2F0aW9uRXh0cmFzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGNoZWNrQm94IGlzIGJlZW4gc2VsZWN0ZWQgb3Igbm90LiBJZiBpdCBpcyBzZWxlY3RlZCxcbiAgICAgKiB0aGUgZGVsZXRlL3NoYXJlIG1lbnVzIGFyZSB2aXNpYmxlLCBvdGhlcndpc2UgdGhleSBhcmUgbm90IHZpc2libGUuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgc2FtZSB2YWx1ZSBpbiB0aGUgaW1hZ2UgbGlzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudCBDaGVja2JveCBldmVudCBkYXRhXG4gICAgICogQHBhcmFtIGltYWdlUGF0aCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW5kZXggaW1hZ2UgaW5kZXggaW4gdGhlIGxpc3RcbiAgICAgKi9cbiAgICBpc0NoZWNrZWQoZXZlbnQsIGltYWdlUGF0aCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzaG93IGRpYWxvZyB3aW5kb3cgd2l0aCBvcHRpb25zICdTZWxlY3QgQWxsJyAmICdVbnNlbGVjdCBBbGwnIHdoZW5cbiAgICAgKiB0aGVyZSBpcyBwYXJ0aWFsIHNlbGVjdGlvbiBieSB1c2VyLCB3aGVyZSB1c2VyIGhhdmUgdG8gc2VsZWN0IG9uZSBvZiB0aGUgb3B0aW9uc1xuICAgICAqIGlmIG5lZWRlZCwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICogSWYgdGhlcmUgaXMgbm8gcGFydGlhbCBzZWxlY3Rpb24sIHRoZW4gdGhpcyB3aWxsIHNlbGVjdCBhbGwvdW5zZWxlY3QgYWxsIGJhc2VkIG9uXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGNoZWNrYm94LlxuICAgICAqL1xuICAgIG9uU2VsZWN0VW5TZWxlY3RBbGxDaGVja0JveCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCAhPT0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoICYmIHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19tZXNzYWdlJyksXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkaWFsb2dfY2FuY2VsX2J0bl90ZXh0JyksXG4gICAgICAgICAgICAgICAgYWN0aW9uczogW3RoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX2FjdGlvbl9zZWxlY3RfYWxsJyksIHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX2FjdGlvbl91bnNlbGVjdF9hbGwnKV0sXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2RpYWxvZ19hY3Rpb25fc2VsZWN0X2FsbCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChyZXN1bHQgPT09IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGlhbG9nX2FjdGlvbl91bnNlbGVjdF9hbGwnKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9ICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdXNlciBjaG9vc2UgdGhlIG1lbnUgJ1NvcnRCeURhdGUnLHdoZXJlIHNvcnRzIHRoZSBpbWFnZSBsaXN0XG4gICAgICogYnkgZGF0ZSBpdCBjcmVhdGVkIGFuZCBhbHNvIHNldHMgdGhlIG1lbnVzICdkZWxldGUnLydzaGFyZScgaW52aXNpYmxlLlxuICAgICAqL1xuICAgIG9uU29ydEJ5RGF0ZSgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsb25lZEltYWdlTGlzdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMuaW1hZ2VMaXN0KTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IChjbG9uZWRJbWFnZUxpc3QubGVuZ3RoIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS50aHVtYm5haWxQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5pc1NlbGVjdGVkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5JTlRFUk5FVF0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpcyA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PGFuZHJvaWQubmV0LlVyaT4oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZXNUb0JlQXR0YWNoZWQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IGltYWdlLmZpbGVOYW1lLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2VXaXRoUmVjdGFuZ2xlKGltZ0ZpbGVOYW1lT3JnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJpcy5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudChhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkFDVElPTl9TRU5EX01VTFRJUExFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKCdpbWFnZS9qcGVnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXMgOiAnICsgZmlsZXNUb0JlQXR0YWNoZWQgKyAnLic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVUJKRUNULCAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcy4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dFBhcmNlbGFibGVBcnJheUxpc3RFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NUUkVBTSwgdXJpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgZXh0cmFfdGV4dCA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PFN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhX3RleHQuYWRkKCdTZWUgYXR0YWNoZWQgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZXMuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9URVhULCAnU2VlIGF0dGFjaGVkIHRyYW5zZm9ybWVkIGltYWdlIGZpbGVzLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfV1JJVEVfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmZvcmVncm91bmRBY3Rpdml0eS5zdGFydEFjdGl2aXR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZHJvaWQuY29udGVudC5JbnRlbnQuY3JlYXRlQ2hvb3NlcihpbnRlbnQsICdTaGFyZSBpbWFnZXMuLi4nKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX3NoYXJpbmdfaW1hZ2VzJykgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2l2aW5nX3Blcm1pc3Npb24nKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSAnZGVsZXRlJyBidXR0b24gaW4gbWVudS5cbiAgICAgKiBUaGlzIHdpbGwgc2hvdyB1cCBhIGRpYWxvZyB3aW5kb3cgZm9yIGNvbmZpcm1hdGlvbiBmb3IgdGhlIHNlbGVjdGVkIGltYWdlKHMpXG4gICAgICogdG8gYmUgZGVsZXRlZC4gSWYgdXNlciBzYXlzICdPaycsIHRoZW4gdGhvc2UgaW1hZ2Uocykgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlXG4gICAgICogZGV2aWNlLCBvdGhlcndpc2UgY2FuIGJlIGNhbmNlbGxlZC5cbiAgICAgKi9cbiAgICBvbkRlbGV0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuY29uZmlybSh7XG4gICAgICAgICAgICAgICAgdGl0bGU6IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZGVsZXRlJyksXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdkZWxldGluZ19zZWxlY3RlZF9pdGVtJyksXG4gICAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ29rJyksXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogdGhpcy5sb2NhbGUudHJhbnNmb3JtKCdjYW5jZWwnKSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2VuZEJyb2FkY2FzdEltYWdlKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdJZHggPSB0aGlzLmltYWdlTGlzdC5pbmRleE9mKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ0lkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5zcGxpY2UoaW1nSWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGFnZUxvYWRlZCh0aGlzLnBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2RlbGV0aW5nX3RodW1ibmFpbF9pbWFnZXMnKSArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2RlbGV0aW5nX2ltYWdlcycpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQodGhpcy5sb2NhbGUudHJhbnNmb3JtKCdzZWxlY3RlZF9pbWFnZXNfZGVsZXRlZCcpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhbGwgdGhlIGNoZWNrQm94IGNoZWNrZWQgdmFsdWUgYmFzZWQgb24gd2hhdCBpdCByZWNlaXZlcyB2YWx1ZSBhcyBwYXJhbWV0ZXIuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgY2hlY2tCb3gncyBwYWdlIHByb3BlcnR5IHZhbHVlIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZsYXVlIGxpa2VcbiAgICAgKiBpZiBhbHJlYWR5IGhhcyB0cnVlLCB0aGVuIHNldHMgZmFsc2UsIG90aGVyd2lzZSBpdCBzZXRzIHRydWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hlY2tib3ggdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh2YWx1ZTogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrQm94ID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdjaGVja2JveC0nICsgaSkgYXMgQ2hlY2tCb3g7XG4gICAgICAgICAgICBjaGVja0JveC5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gIXZhbHVlO1xuICAgIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgJy4nKTtcblxuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAvLyAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIC8vIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgLy8gdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIC8vIHJldHVybiB1cmk7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgIC8vIH1cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgb3JpZ2luYWwgaW1hZ2VcbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgIC8vICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltYWdlLnN1YnN0cmluZygwLCB0cmFuc2Zvcm1lZEltYWdlLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICdfY29udG91ci5qcGcnO1xuICAgIC8vICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAvLyAgICAgLy8gY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoXG4gICAgLy8gICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICAvLyB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgLy8gfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0IFVSSSBmb3IgZmlsZS5cbiAgICAvLyAgKiBAcGFyYW0gbmV3RmlsZVxuICAgIC8vICAqIEByZXR1cm5zIFVSSVxuICAgIC8vICAqL1xuICAgIC8vIHByaXZhdGUgZ2V0VVJJRm9yRmlsZShuZXdGaWxlOiBhbnkpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgIC8vICAgICByZXR1cm4gdXJpO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRodW1ibmFpbCBpbWFnZXMgdXNpbmcgY29udGVudCByZXNvbHZlciBieSBvcmRlciB3aGF0IGl0IHJlY2VpdmVzIGFzIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzY1BhcmFtIE9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtLCB0aGlzLmFjdGl2aXR5TG9hZGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgYWxsIHRoZSB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2VzIGZyb20gdGhlIGZpbGUgc3lzdGVtIGFuZCBzdG9yZXMgaW4gdGhlIGltYWdlIGxpc3QgZm9yXG4gICAgICogcHVibGljIGFjY2Vzcy4gVGhlIGZpbGUgc3lzdGVtIG5lZWRzIFJFQURfRVhURVJOQUxfU1RPUkFHRSBwZXJtaXNzaW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZFRodW1ibmFpbEltYWdlc0J5RmlsZVN5c3RlbSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gJyc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZWRQaWN0dXJlUGF0aCA9IGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkuZ2V0QWJzb2x1dGVQYXRoKCkgKyAnL0RDSU0nO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2V0dGluZ19wYXRoJykgKyBlcnJvci50b1N0cmluZygpKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBnZXR0aW5nIHBhdGguICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmb2xkZXJzOiBGb2xkZXIgPSBGb2xkZXIuZnJvbVBhdGgoY2FwdHVyZWRQaWN0dXJlUGF0aCk7XG4gICAgICAgICAgICAgICAgZm9sZGVycy5nZXRFbnRpdGllcygpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChlbnRpdGllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW50aXRpZXMgaXMgYXJyYXkgd2l0aCB0aGUgZG9jdW1lbnQncyBmaWxlcyBhbmQgZm9sZGVycy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbnRpdHkubmFtZS5zdGFydHNXaXRoKCd0aHVtYl9QVF9JTUcnKSAmJiBlbnRpdHkubmFtZS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1uYWlsT3JnUGF0aCA9IGVudGl0eS5wYXRoLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1uYWlsT3JnUGF0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZhaWxlZCB0byBvYnRhaW4gZm9sZGVyJ3MgY29udGVudHMuXG4gICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCh0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2Vycm9yX3doaWxlX2xvYWRpbmdfaW1hZ2VzJykgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnZXJyb3Jfd2hpbGVfZ2l2aW5nX3Blcm1pc3Npb24nKSArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19