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
    /**
     * Constructor for ImageGalleryComponent.
     *
     * @param routerExtensions Router extension instance
     * @param router Router instance
     * @param transformedImageProvider Transformed image provider instance
     * @param activityLoader Activity loader instance
     */
    function ImageGalleryComponent(routerExtensions, router, transformedImageProvider, activityLoader, logger) {
        this.routerExtensions = routerExtensions;
        this.router = router;
        this.transformedImageProvider = transformedImageProvider;
        this.activityLoader = activityLoader;
        this.logger = logger;
        this.locale = new angular_1.L();
        this.selectUnselectAllLable = this.locale.transform('select_unselect_all');
        this.sortByDateLable = this.locale.transform('sort_by_date');
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
                message: 'Patially selected. Do you want to perform one of the below?',
                cancelButtonText: 'Cancel',
                actions: ['Select All', 'Unselect All'],
            }).then(function (result) {
                if (result === 'Select All') {
                    _this.isSelectUnselectAll = true;
                    _this.performSelectUnselectAll(_this.isSelectUnselectAll);
                }
                else if (result === 'Unselect All') {
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
                Toast.makeText('Error while sharing images.' + error).show();
                _this.logger.error('Error while sharing images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
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
     */
    ImageGalleryComponent.prototype.onDelete = function () {
        var _this = this;
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: 'Delete',
                message: 'Deleting selected item(s)?',
                okButtonText: 'Ok',
                cancelButtonText: 'Cancel',
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
                                    Toast.makeText('Error while deleting thumbnail images.' + error).show();
                                    _this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                        + _this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                            }).catch(function (error) {
                                Toast.makeText('Error while deleting images').show();
                                _this.logger.error('Error while deleting images. ' + module.filename
                                    + _this.logger.ERROR_MSG_SEPARATOR + error);
                            });
                        }
                    });
                    Toast.makeText('Selected images deleted.').show();
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
                Toast.makeText('Error while getting path.' + error.toString()).show();
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
                Toast.makeText('Error while loading images.' + error, 'long').show();
                _this.logger.error('Error while loading images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
            _this.activityLoader.hide();
        }).catch(function (error) {
            Toast.makeText('Error in giving permission.' + error, 'long').show();
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
        router_1.Router, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, activityloader_common_1.ActivityLoader,
        oxseyelogger_1.OxsEyeLogger])
], ImageGalleryComponent);
exports.ImageGalleryComponent = ImageGalleryComponent;
var _a;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5hbmRyb2lkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQWtEO0FBQ2xELDBDQUEyRDtBQUUzRCw0REFBNEQ7QUFHNUQsc0RBQStEO0FBSS9ELGlGQUF5RTtBQUN6RSxnRkFBd0U7QUFFeEUscURBQThDO0FBQzlDLHVEQUFzRDtBQUV0RCxvRkFBc0c7QUFFdEcsMERBQTREO0FBQzVELHFEQUF1RDtBQUV2RCxzREFBd0Q7QUFDeEQsMENBQTRDO0FBRTVDOzs7R0FHRztBQU9ILElBQWEscUJBQXFCO0lBMEI5Qjs7Ozs7OztPQU9HO0lBQ0gsK0JBQ1ksZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCx3QkFBa0QsRUFDbEQsY0FBOEIsRUFDOUIsTUFBb0I7UUFKcEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBQyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLHNCQUFzQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDM0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsd0NBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMvQixJQUFJLENB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QVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO1FBQzNDLFdBQVcsRUFBRSwrQkFBK0I7S0FDL0MsQ0FBQztxQ0FvQ2dDLHlCQUFnQjtRQUMxQixlQUFNLHNCQUNZLG9EQUF3QixvQkFBeEIsb0RBQXdCLGtDQUNsQyxzQ0FBYztRQUN0QiwyQkFBWTtHQXZDdkIscUJBQXFCLENBNlpqQztBQTdaWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkV4dHJhcywgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgRmlsZSwgRm9sZGVyIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcblxuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IENoZWNrQm94IH0gZnJvbSAnbmF0aXZlc2NyaXB0LWNoZWNrYm94JztcblxuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBkaWFsb2dzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9ncyc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG4vKipcbiAqIEltYWdlR2FsbGVyeUNvbXBvbmVudCBjbGFzcyBpcyBiZWluZyB1c2VkIHRvIGRpc3BsYXkgYWxsIHRoZSB0aHVtYm5haWwgXG4gKiBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2VzIGluIGdhbGxlcnkgdmlldy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1pbWFnZWdhbGxlcnknLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBzaGFyaW5nIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU2hhcmluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBkZWxldGluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIHBvcHVwIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzUG9wVXBNZW51OiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIFNvcnRCeURhdGUgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNTb3J0QnlEYXRlTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBjaGVja2JveCB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDaGVja0JveFZpc2libGU6IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBjaGVja2JveCBzZWxlY3RlZCBjb3VudC4gKi9cbiAgICBwcml2YXRlIHNlbGVjdGVkQ291bnQ6IG51bWJlcjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTZWxlY3QvVW5zZWxlY3RBbGwgbWVudSB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNTZWxlY3RVbnNlbGVjdEFsbDogYm9vbGVhbjtcbiAgICAvKiogU3RvcmVzIG9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnICovXG4gICAgcHJpdmF0ZSBvcmRlckJ5QXNjRGVzYzogc3RyaW5nO1xuICAgIC8qKiBTdG9yZXMgcGFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgcGFnZTtcbiAgICAvKiogTGFibGUgZm9yIHNlbGVjdC91bnNlbGVjdCBBbGwgbWVudSAqL1xuICAgIHByaXZhdGUgc2VsZWN0VW5zZWxlY3RBbGxMYWJsZTogYW55O1xuICAgIC8qKiBMYWJsZSBmb3Igc29ydCBieSBkYXRlIG1lbnUgKi9cbiAgICBwcml2YXRlIHNvcnRCeURhdGVMYWJsZTogYW55O1xuICAgIC8qKiBMb2NhbGl6YXRpb24gKi9cbiAgICBwcml2YXRlIGxvY2FsZTogTDtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBJbWFnZUdhbGxlcnlDb21wb25lbnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyIGV4dGVuc2lvbiBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvY2FsZSA9IG5ldyBMKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0VW5zZWxlY3RBbGxMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc2VsZWN0X3Vuc2VsZWN0X2FsbCcpO1xuICAgICAgICB0aGlzLnNvcnRCeURhdGVMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc29ydF9ieV9kYXRlJyk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgbWVudSBwcm9wZXJ0aWVzIGFuZCBjaGVja2JveCB0byBiZSBzZWxlY3RlZCBpbWFnZShzKSBhbmRcbiAgICAgKiBsb2FkIHRodW1ibmFpbCBpbWFnZXMgZm9yIGdhbGxlcnkgdmlldyB0byBiZSBkaXNwbGF5ZWQuXG4gICAgICovXG4gICAgbmdPbkluaXQoKTogdm9pZCB7XG4gICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuc2hvdygpO1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9IHRydWU7XG4gICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9IHRydWU7XG4gICAgICAgIC8vIHRoaXMubG9hZFRodW1ibmFpbEltYWdlcygpO1xuICAgICAgICB0aGlzLm9yZGVyQnlBc2NEZXNjID0gJyBERVNDJztcbiAgICAgICAgdGhpcy5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIodGhpcy5vcmRlckJ5QXNjRGVzYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0b3JlZCB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2UgbGlzdC5cbiAgICAgKiBAcmV0dXJucyBpbWFnZSBsaXN0LlxuICAgICAqL1xuICAgIGdldCBpbWFnZUxpc3QoKTogVHJhbnNmb3JtZWRJbWFnZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY2hlY2tib3ggYW5kIHBvcHVwIG1lbnUgcHJvcGVydGllcyB0cnVlIGZvciB0aGVtIHRvIGJlIHZpc2libGUuXG4gICAgICovXG4gICAgc2V0Q2hlY2tib3hWaXNpYmxlKCkge1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdGhlIGdhbGxlcnkgcGFnZSBpcyBsb2FkZWQgYW5kIHNldHMgcGFnZSBhbmQgbWVudVxuICAgICAqIHByb3BlcnRpZXMgdmFsdWUgdG8gdHJ1ZS9mYWxzZSBiYXNlZCBvbiB0aHVtYm5haWwgaW1hZ2UgbGlzdCBjb3VudC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQYWdlIGxvYWRlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYWdlTG9hZGVkKGFyZ3MpIHtcbiAgICAgICAgdGhpcy5wYWdlID0gKGFyZ3MgIT09IHRoaXMucGFnZSkgPyBhcmdzLm9iamVjdCBhcyBQYWdlIDogYXJncztcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDb3VudFRlbXAgPSB0aGlzLnNlbGVjdGVkQ291bnQ7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApID8gdGhpcy5pc1BvcFVwTWVudSA6IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IHNlbGVjdGVkQ291bnRUZW1wO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgYmFjayB0byBwcmV2aW91cyBwYWdlIChjYW1lcmEgdmlldykgd2hlbiB0aGUgQmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyB0byBJbWFnZSBzbGlkZSBwYWdlIHdoZW4gdXNlciBkb2VzIGRvdWJsZSB0YXAgb24gaW1hZ2UgYW5kIGFsc28gbmF2aWdhdGVzIHdpdGhcbiAgICAgKiB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgYW5kIGluZGV4IG9mIGl0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbWdVUklQYXJhbSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIFVSSVxuICAgICAqIEBwYXJhbSBpbWdJbmRleFBhcmFtICBpbWFnZSBpbmRleFxuICAgICAqL1xuICAgIGdvSW1hZ2VTbGlkZShpbWdVUklQYXJhbSwgaW1nSW5kZXhQYXJhbSkge1xuICAgICAgICBjb25zdCBuYXZpZ2F0aW9uRXh0cmFzOiBOYXZpZ2F0aW9uRXh0cmFzID0ge1xuICAgICAgICAgICAgcXVlcnlQYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBpbWdVUkk6IGltZ1VSSVBhcmFtLFxuICAgICAgICAgICAgICAgIGltZ0luZGV4OiBpbWdJbmRleFBhcmFtLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydpbWFnZXNsaWRlJ10sIG5hdmlnYXRpb25FeHRyYXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY2hlY2tCb3ggaXMgYmVlbiBzZWxlY3RlZCBvciBub3QuIElmIGl0IGlzIHNlbGVjdGVkLFxuICAgICAqIHRoZSBkZWxldGUvc2hhcmUgbWVudXMgYXJlIHZpc2libGUsIG90aGVyd2lzZSB0aGV5IGFyZSBub3QgdmlzaWJsZS5cbiAgICAgKiBBbmQgYWxzbyBzZXRzIHRoZSBzYW1lIHZhbHVlIGluIHRoZSBpbWFnZSBsaXN0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBldmVudCBDaGVja2JveCBldmVudCBkYXRhXG4gICAgICogQHBhcmFtIGltYWdlUGF0aCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW5kZXggaW1hZ2UgaW5kZXggaW4gdGhlIGxpc3RcbiAgICAgKi9cbiAgICBpc0NoZWNrZWQoZXZlbnQsIGltYWdlUGF0aCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzaG93IGRpYWxvZyB3aW5kb3cgd2l0aCBvcHRpb25zICdTZWxlY3QgQWxsJyAmICdVbnNlbGVjdCBBbGwnIHdoZW5cbiAgICAgKiB0aGVyZSBpcyBwYXJ0aWFsIHNlbGVjdGlvbiBieSB1c2VyLCB3aGVyZSB1c2VyIGhhdmUgdG8gc2VsZWN0IG9uZSBvZiB0aGUgb3B0aW9uc1xuICAgICAqIGlmIG5lZWRlZCwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICogSWYgdGhlcmUgaXMgbm8gcGFydGlhbCBzZWxlY3Rpb24sIHRoZW4gdGhpcyB3aWxsIHNlbGVjdCBhbGwvdW5zZWxlY3QgYWxsIGJhc2VkIG9uXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGNoZWNrYm94LlxuICAgICAqL1xuICAgIG9uU2VsZWN0VW5TZWxlY3RBbGxDaGVja0JveCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCAhPT0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoICYmIHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUGF0aWFsbHkgc2VsZWN0ZWQuIERvIHlvdSB3YW50IHRvIHBlcmZvcm0gb25lIG9mIHRoZSBiZWxvdz8nLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnU2VsZWN0IEFsbCcsICdVbnNlbGVjdCBBbGwnXSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdTZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAnVW5zZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9ICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdXNlciBjaG9vc2UgdGhlIG1lbnUgJ1NvcnRCeURhdGUnLHdoZXJlIHNvcnRzIHRoZSBpbWFnZSBsaXN0XG4gICAgICogYnkgZGF0ZSBpdCBjcmVhdGVkIGFuZCBhbHNvIHNldHMgdGhlIG1lbnVzICdkZWxldGUnLydzaGFyZScgaW52aXNpYmxlLlxuICAgICAqL1xuICAgIG9uU29ydEJ5RGF0ZSgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsb25lZEltYWdlTGlzdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMuaW1hZ2VMaXN0KTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IChjbG9uZWRJbWFnZUxpc3QubGVuZ3RoIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS50aHVtYm5haWxQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5pc1NlbGVjdGVkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5JTlRFUk5FVF0sXG4gICAgICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJpcyA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PGFuZHJvaWQubmV0LlVyaT4oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsZXNUb0JlQXR0YWNoZWQgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IGltYWdlLmZpbGVOYW1lLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdGaWxlID0gbmV3IGphdmEuaW8uRmlsZShpbWFnZVBhdGgsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5nZXRVUklGb3JGaWxlKG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHVyaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldE9yaWdpbmFsSW1hZ2VXaXRoUmVjdGFuZ2xlKGltZ0ZpbGVOYW1lT3JnKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJpcy5zaXplKCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbnRlbnQgPSBuZXcgYW5kcm9pZC5jb250ZW50LkludGVudChhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkFDVElPTl9TRU5EX01VTFRJUExFKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKCdpbWFnZS9qcGVnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1BlcnNwZWN0aXZlIGNvcnJlY3Rpb24gcGljdHVyZXMgOiAnICsgZmlsZXNUb0JlQXR0YWNoZWQgKyAnLic7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVUJKRUNULCAnUGVyc3BlY3RpdmUgY29ycmVjdGlvbiBwaWN0dXJlcy4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dFBhcmNlbGFibGVBcnJheUxpc3RFeHRyYShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkVYVFJBX1NUUkVBTSwgdXJpcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgZXh0cmFfdGV4dCA9IG5ldyBqYXZhLnV0aWwuQXJyYXlMaXN0PFN0cmluZz4oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhX3RleHQuYWRkKCdTZWUgYXR0YWNoZWQgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZXMuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9URVhULCAnU2VlIGF0dGFjaGVkIHRyYW5zZm9ybWVkIGltYWdlIGZpbGVzLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LmFkZEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGludGVudC5hZGRGbGFncyhhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfV1JJVEVfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW50ZW50LnNldEZsYWdzKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19BQ1RJVklUWV9ORVdfVEFTSyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBsaWNhdGlvbi5hbmRyb2lkLmZvcmVncm91bmRBY3Rpdml0eS5zdGFydEFjdGl2aXR5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuZHJvaWQuY29udGVudC5JbnRlbnQuY3JlYXRlQ2hvb3NlcihpbnRlbnQsICdTaGFyZSBpbWFnZXMuLi4nKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLicgKyBlcnJvcikuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4gJyAgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlICdkZWxldGUnIGJ1dHRvbiBpbiBtZW51LlxuICAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAgKiB0byBiZSBkZWxldGVkLiBJZiB1c2VyIHNheXMgJ09rJywgdGhlbiB0aG9zZSBpbWFnZShzKSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqL1xuICAgIG9uRGVsZXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlhbG9ncy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nIHNlbGVjdGVkIGl0ZW0ocyk/JyxcbiAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nSWR4ID0gdGhpcy5pbWFnZUxpc3QuaW5kZXhPZihpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3Quc3BsaWNlKGltZ0lkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VMb2FkZWQodGhpcy5wYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyBpbWFnZXMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnU2VsZWN0ZWQgaW1hZ2VzIGRlbGV0ZWQuJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNldHMgYWxsIHRoZSBjaGVja0JveCBjaGVja2VkIHZhbHVlIGJhc2VkIG9uIHdoYXQgaXQgcmVjZWl2ZXMgdmFsdWUgYXMgcGFyYW1ldGVyLlxuICAgICAqIEFuZCBhbHNvIHNldHMgdGhlIGNoZWNrQm94J3MgcGFnZSBwcm9wZXJ0eSB2YWx1ZSBiYXNlZCBvbiB0aGUgY3VycmVudCB2bGF1ZSBsaWtlXG4gICAgICogaWYgYWxyZWFkeSBoYXMgdHJ1ZSwgdGhlbiBzZXRzIGZhbHNlLCBvdGhlcndpc2UgaXQgc2V0cyB0cnVlLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB2YWx1ZSBDaGVja2JveCB2YWx1ZVxuICAgICAqL1xuICAgIHByaXZhdGUgcGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tCb3ggPSB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoJ2NoZWNrYm94LScgKyBpKSBhcyBDaGVja0JveDtcbiAgICAgICAgICAgIGNoZWNrQm94LmNoZWNrZWQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSAhdmFsdWU7XG4gICAgfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldCBvcmlnaW5hbCBpbWFnZVxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgIC8vICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICAvLyB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgLy8gfVxuICAgIC8vIC8qKlxuICAgIC8vICAqIEdldCBvcmlnaW5hbCBpbWFnZVxuICAgIC8vICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlV2l0aFJlY3RhbmdsZSh0cmFuc2Zvcm1lZEltYWdlOiBzdHJpbmcpOiBhbnkge1xuICAgIC8vICAgICBjb25zdCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCAnLicpO1xuXG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShcbiAgICAvLyAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIC8vIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgIC8vICAgICAvLyByZXR1cm4gdXJpO1xuICAgIC8vICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAvLyB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXQgVVJJIGZvciBmaWxlLlxuICAgIC8vICAqIEBwYXJhbSBuZXdGaWxlXG4gICAgLy8gICogQHJldHVybnMgVVJJXG4gICAgLy8gICovXG4gICAgLy8gcHJpdmF0ZSBnZXRVUklGb3JGaWxlKG5ld0ZpbGU6IGFueSk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IHVyaSA9IGFuZHJvaWQuc3VwcG9ydC52NC5jb250ZW50LkZpbGVQcm92aWRlci5nZXRVcmlGb3JGaWxlKGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dCwgJ294cy5leWUuZmlsZXByb3ZpZGVyJywgbmV3RmlsZSk7XG4gICAgLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oJ294cy5leWUuZmlsZXByb3ZpZGVyJyxcbiAgICAvLyAgICAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIHJldHVybiB1cmk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGh1bWJuYWlsIGltYWdlcyB1c2luZyBjb250ZW50IHJlc29sdmVyIGJ5IG9yZGVyIHdoYXQgaXQgcmVjZWl2ZXMgYXMgcGFyYW1ldGVyLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzY1BhcmFtIE9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtLCB0aGlzLmFjdGl2aXR5TG9hZGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgYWxsIHRoZSB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2VzIGZyb20gdGhlIGZpbGUgc3lzdGVtIGFuZCBzdG9yZXMgaW4gdGhlIGltYWdlIGxpc3QgZm9yXG4gICAgICogcHVibGljIGFjY2Vzcy4gVGhlIGZpbGUgc3lzdGVtIG5lZWRzIFJFQURfRVhURVJOQUxfU1RPUkFHRSBwZXJtaXNzaW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZFRodW1ibmFpbEltYWdlc0J5RmlsZVN5c3RlbSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICAgICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgICAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gJyc7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgY2FwdHVyZWRQaWN0dXJlUGF0aCA9IGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkuZ2V0QWJzb2x1dGVQYXRoKCkgKyAnL0RDSU0nO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBnZXR0aW5nIHBhdGguJyArIGVycm9yLnRvU3RyaW5nKCkpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IGZvbGRlcnM6IEZvbGRlciA9IEZvbGRlci5mcm9tUGF0aChjYXB0dXJlZFBpY3R1cmVQYXRoKTtcbiAgICAgICAgICAgICAgICBmb2xkZXJzLmdldEVudGl0aWVzKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGVudGl0aWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnRpdGllcyBpcyBhcnJheSB3aXRoIHRoZSBkb2N1bWVudCdzIGZpbGVzIGFuZCBmb2xkZXJzLlxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5uYW1lLnN0YXJ0c1dpdGgoJ3RodW1iX1BUX0lNRycpICYmIGVudGl0eS5uYW1lLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gZW50aXR5LnBhdGgucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRmFpbGVkIHRvIG9idGFpbiBmb2xkZXIncyBjb250ZW50cy5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlcy4nICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuIl19