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
var dialogs = require("tns-core-modules/ui/dialogs");
var Toast = require("nativescript-toast");
var fs = require("tns-core-modules/file-system");
var frameModule = require("tns-core-modules/ui/frame");
var utilsModule = require("tns-core-modules/utils/utils");
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
        // this.selectUnselectAllLable = this.locale.transform('select_unselect_all');
        // this.sortByDateLable = this.locale.transform('sort_by_date');
    }
    /**
     * Initializes menu properties and checkbox to be selected image(s) and
     * load thumbnail images for gallery view to be displayed.
     */
    ImageGalleryComponent.prototype.ngOnInit = function () {
        // this.activityLoader.show();
        this.isCheckBoxVisible = false;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = false;
        this.isSortByDateMenu = true;
        this.isSelectUnselectAll = true;
        this.loadThumbnailImagesByFileSystem();
        // this.orderByAscDesc = ' DESC';
        //      this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
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
        for (var i = 0; i < this.imageList.length; i++) {
            var checkBox = this.page.getViewById('checkbox-' + i);
            checkBox.scaleX = 1.75;
            checkBox.scaleY = 1.75;
        }
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
        // const navigationExtras: NavigationExtras = {
        //     queryParams: {
        //         imgURI: imgURIParam,
        //         imgIndex: imgIndexParam,
        //     },
        // };
        // this.router.navigate(['imageslide'], navigationExtras);
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
        var dataToShare = {};
        var dataCount = 0;
        var documents = fs.knownFolders.documents();
        this.imageList.forEach(function (image) {
            if (image.isSelected) {
                var transformedImgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
                // let fileName = image.fileName;
                var path_1 = fs.path.join(documents.path, 'capturedimages', transformedImgFileNameOrg);
                // let file = fs.File.fromPath(path);
                var transformedUIImage = UIImage.imageNamed(path_1);
                dataToShare[dataCount++] = transformedUIImage;
                //Getting original captured image
                var imgFileNameOrg = transformedImgFileNameOrg.replace('PT_IMG', 'IMG');
                imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
                path_1 = fs.path.join(documents.path, 'capturedimages', imgFileNameOrg);
                var transformedUIImageOrg = UIImage.imageNamed(path_1);
                dataToShare[dataCount++] = transformedUIImageOrg;
            }
        });
        try {
            var activityController = UIActivityViewController.alloc()
                .initWithActivityItemsApplicationActivities([dataToShare], null);
            activityController.setValueForKey('Transformed Image(s)', 'Subject');
            var presentViewController = activityController.popoverPresentationController;
            if (presentViewController) {
                var page = frameModule.topmost().currentPage;
                if (page && page.ios.navigationItem.rightBarButtonItems &&
                    page.ios.navigationItem.rightBarButtonItems.count > 0) {
                    presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
                }
                else {
                    presentViewController.sourceView = page.ios.view;
                }
            }
            utilsModule.ios.getter(UIApplication, UIApplication.sharedApplication)
                .keyWindow
                .rootViewController
                .presentViewControllerAnimatedCompletion(activityController, true, null);
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
                                    // SendBroadcastImage(image.thumbnailPath);
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
        // let capturedPicturePath = '';
        this.transformedImageProvider.imageList = [];
        try {
            // capturedPicturePath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
            var folder = file_system_1.knownFolders.currentApp();
            // const folderDest = knownFolders.documents();
            // const fileName = 'capturedimages/IMG_' + Date.now() + '.jpg';
            // const capturedPicturePath = path.join(folder.path, 'capturedimages');
            var folder0 = fs.path.join(fs.knownFolders.documents().path, 'capturedimages', 'thumbnails');
            var folders0 = fs.Folder.fromPath(folder0);
            folders0.getEntities()
                .then(function (entities) {
                // entities is array with the document's files and folders.
                entities.forEach(function (entity) {
                    // if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith('.png')) {
                    var thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                    _this.transformedImageProvider.imageList.push(new transformedimage_common_1.TransformedImage(entity.name, thumnailOrgPath, entity.path, false));
                    // }
                });
            }).catch(function (error) {
                // Failed to obtain folder's contents.
                Toast.makeText('Error while loading images.' + error, 'long').show();
                _this.logger.error('Error while loading images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
            this.activityLoader.hide();
        }
        catch (error) {
            Toast.makeText('Error while getting path.' + error.toString()).show();
            this.logger.error('Error while getting path. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
        }
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
        router_1.Router, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" && _a || Object, activityloader_common_1.ActivityLoader, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _b || Object])
], ImageGalleryComponent);
exports.ImageGalleryComponent = ImageGalleryComponent;
var _a, _b;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZWdhbGxlcnkuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFrRDtBQUNsRCwwQ0FBMkQ7QUFFM0QsNERBQWdGO0FBR2hGLHNEQUErRDtBQUkvRCxpRkFBeUU7QUFDekUsZ0ZBQXdFO0FBRXhFLHFEQUE4QztBQUM5Qyx1REFBc0Q7QUFFdEQsb0ZBQXNHO0FBR3RHLHFEQUF1RDtBQUd2RCwwQ0FBNEM7QUFDNUMsaURBQW1EO0FBQ25ELHVEQUF5RDtBQUN6RCwwREFBNEQ7QUFFNUQ7OztHQUdHO0FBT0gsSUFBYSxxQkFBcUI7SUEwQjlCOzs7Ozs7O09BT0c7SUFDSCwrQkFDWSxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLHdCQUFrRCxFQUNsRCxjQUE4QixFQUM5QixNQUFvQjtRQUpwQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxXQUFDLEVBQUUsQ0FBQztRQUN0Qiw4RUFBOEU7UUFDOUUsZ0VBQWdFO0lBQ3BFLENBQUM7SUFDRDs7O09BR0c7SUFDSCx3Q0FBUSxHQUFSO1FBQ0ksOEJBQThCO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxD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QztZQUNsSCxDQUFDLENBQUMsQ0FBQztZQUNQLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLENBQUMsUUFBUSxDQUFDLDJCQUEyQixHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ3RFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDRCQUE0QixHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNoSCxDQUFDO0lBQ0wsQ0FBQztJQUNMLDRCQUFDO0FBQUQsQ0FBQyxBQTlXRCxJQThXQztBQTlXWSxxQkFBcUI7SUFOakMsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO1FBQzNDLFdBQVcsRUFBRSwrQkFBK0I7S0FDL0MsQ0FBQztxQ0FvQ2dDLHlCQUFnQjtRQUMxQixlQUFNLHNCQUNZLG9EQUF3QixvQkFBeEIsb0RBQXdCLGtDQUNsQyxzQ0FBYyxzQkFDdEIsMkJBQVksb0JBQVosMkJBQVk7R0F2Q3ZCLHFCQUFxQixDQThXakM7QUE5V1ksc0RBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdmlnYXRpb25FeHRyYXMsIFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEZpbGUsIEZvbGRlciwgcGF0aCwga25vd25Gb2xkZXJzIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgeyBQYWdlIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9wYWdlJztcblxuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IENoZWNrQm94IH0gZnJvbSAnbmF0aXZlc2NyaXB0LWNoZWNrYm94JztcblxuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZSB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4uL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG5pbXBvcnQgeyBTZW5kQnJvYWRjYXN0SW1hZ2UsIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuaW1wb3J0ICogYXMgYXBwbGljYXRpb24gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvbic7XG5pbXBvcnQgKiBhcyBkaWFsb2dzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9ncyc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuaW1wb3J0ICogYXMgZnMgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5pbXBvcnQgKiBhcyBmcmFtZU1vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lJztcbmltcG9ydCAqIGFzIHV0aWxzTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHMnO1xuXG4vKipcbiAqIEltYWdlR2FsbGVyeUNvbXBvbmVudCBjbGFzcyBpcyBiZWluZyB1c2VkIHRvIGRpc3BsYXkgYWxsIHRoZSB0aHVtYm5haWwgXG4gKiBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2VzIGluIGdhbGxlcnkgdmlldy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1pbWFnZWdhbGxlcnknLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBzaGFyaW5nIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU2hhcmluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBkZWxldGluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIHBvcHVwIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzUG9wVXBNZW51OiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIFNvcnRCeURhdGUgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNTb3J0QnlEYXRlTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBjaGVja2JveCB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDaGVja0JveFZpc2libGU6IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBjaGVja2JveCBzZWxlY3RlZCBjb3VudC4gKi9cbiAgICBwcml2YXRlIHNlbGVjdGVkQ291bnQ6IG51bWJlcjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTZWxlY3QvVW5zZWxlY3RBbGwgbWVudSB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNTZWxlY3RVbnNlbGVjdEFsbDogYm9vbGVhbjtcbiAgICAvKiogU3RvcmVzIG9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnICovXG4gICAgcHJpdmF0ZSBvcmRlckJ5QXNjRGVzYzogc3RyaW5nO1xuICAgIC8qKiBTdG9yZXMgcGFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgcGFnZTtcbiAgICAvKiogTGFibGUgZm9yIHNlbGVjdC91bnNlbGVjdCBBbGwgbWVudSAqL1xuICAgIC8vIHByaXZhdGUgc2VsZWN0VW5zZWxlY3RBbGxMYWJsZTogYW55O1xuICAgIC8vIC8qKiBMYWJsZSBmb3Igc29ydCBieSBkYXRlIG1lbnUgKi9cbiAgICAvLyBwcml2YXRlIHNvcnRCeURhdGVMYWJsZTogYW55O1xuICAgIC8qKiBMb2NhbGl6YXRpb24gKi9cbiAgICBwcml2YXRlIGxvY2FsZTogTDtcblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdG9yIGZvciBJbWFnZUdhbGxlcnlDb21wb25lbnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyIGV4dGVuc2lvbiBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvY2FsZSA9IG5ldyBMKCk7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0VW5zZWxlY3RBbGxMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc2VsZWN0X3Vuc2VsZWN0X2FsbCcpO1xuICAgICAgICAvLyB0aGlzLnNvcnRCeURhdGVMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc29ydF9ieV9kYXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIG1lbnUgcHJvcGVydGllcyBhbmQgY2hlY2tib3ggdG8gYmUgc2VsZWN0ZWQgaW1hZ2UocykgYW5kXG4gICAgICogbG9hZCB0aHVtYm5haWwgaW1hZ2VzIGZvciBnYWxsZXJ5IHZpZXcgdG8gYmUgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICAvLyB0aGlzLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpcy5pc0NoZWNrQm94VmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUZpbGVTeXN0ZW0oKTtcbiAgICAgICAgLy8gdGhpcy5vcmRlckJ5QXNjRGVzYyA9ICcgREVTQyc7XG5cbiAgICAgICAgLy8gICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcih0aGlzLm9yZGVyQnlBc2NEZXNjKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgc3RvcmVkIHRyYW5zZm9ybWVkIHRodW1ibmFpbCBpbWFnZSBsaXN0LlxuICAgICAqIEByZXR1cm5zIGltYWdlIGxpc3QuXG4gICAgICovXG4gICAgZ2V0IGltYWdlTGlzdCgpOiBUcmFuc2Zvcm1lZEltYWdlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjaGVja2JveCBhbmQgcG9wdXAgbWVudSBwcm9wZXJ0aWVzIHRydWUgZm9yIHRoZW0gdG8gYmUgdmlzaWJsZS5cbiAgICAgKi9cbiAgICBzZXRDaGVja2JveFZpc2libGUoKSB7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tCb3ggPSB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoJ2NoZWNrYm94LScgKyBpKSBhcyBDaGVja0JveDtcbiAgICAgICAgICAgIGNoZWNrQm94LnNjYWxlWCA9IDEuNzU7XG4gICAgICAgICAgICBjaGVja0JveC5zY2FsZVkgPSAxLjc1O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdGhlIGdhbGxlcnkgcGFnZSBpcyBsb2FkZWQgYW5kIHNldHMgcGFnZSBhbmQgbWVudVxuICAgICAqIHByb3BlcnRpZXMgdmFsdWUgdG8gdHJ1ZS9mYWxzZSBiYXNlZCBvbiB0aHVtYm5haWwgaW1hZ2UgbGlzdCBjb3VudC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gYXJncyBQYWdlIGxvYWRlZCBldmVudCBkYXRhXG4gICAgICovXG4gICAgb25QYWdlTG9hZGVkKGFyZ3MpIHtcbiAgICAgICAgdGhpcy5wYWdlID0gKGFyZ3MgIT09IHRoaXMucGFnZSkgPyBhcmdzLm9iamVjdCBhcyBQYWdlIDogYXJncztcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDb3VudFRlbXAgPSB0aGlzLnNlbGVjdGVkQ291bnQ7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApID8gdGhpcy5pc1BvcFVwTWVudSA6IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IHNlbGVjdGVkQ291bnRUZW1wO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgYmFjayB0byBwcmV2aW91cyBwYWdlIChjYW1lcmEgdmlldykgd2hlbiB0aGUgQmFjayBidXR0b24gaXMgcHJlc3NlZC5cbiAgICAgKi9cbiAgICBnb0JhY2soKSB7XG4gICAgICAgIGZvciAoY29uc3QgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yb3V0ZXJFeHRlbnNpb25zLmJhY2soKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyB0byBJbWFnZSBzbGlkZSBwYWdlIHdoZW4gdXNlciBkb2VzIGRvdWJsZSB0YXAgb24gaW1hZ2UgYW5kIGFsc28gbmF2aWdhdGVzIHdpdGhcbiAgICAgKiB0cmFuc2Zvcm1lZCBpbWFnZSBVUkkgYW5kIGluZGV4IG9mIGl0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBpbWdVUklQYXJhbSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIFVSSVxuICAgICAqIEBwYXJhbSBpbWdJbmRleFBhcmFtICBpbWFnZSBpbmRleFxuICAgICAqL1xuICAgIGdvSW1hZ2VTbGlkZShpbWdVUklQYXJhbSwgaW1nSW5kZXhQYXJhbSkge1xuICAgICAgICAvLyBjb25zdCBuYXZpZ2F0aW9uRXh0cmFzOiBOYXZpZ2F0aW9uRXh0cmFzID0ge1xuICAgICAgICAvLyAgICAgcXVlcnlQYXJhbXM6IHtcbiAgICAgICAgLy8gICAgICAgICBpbWdVUkk6IGltZ1VSSVBhcmFtLFxuICAgICAgICAvLyAgICAgICAgIGltZ0luZGV4OiBpbWdJbmRleFBhcmFtLFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gfTtcbiAgICAgICAgLy8gdGhpcy5yb3V0ZXIubmF2aWdhdGUoWydpbWFnZXNsaWRlJ10sIG5hdmlnYXRpb25FeHRyYXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDaGVja3Mgd2hldGhlciB0aGUgY2hlY2tCb3ggaXMgYmVlbiBzZWxlY3RlZCBvciBub3QuIElmIGl0IGlzIHNlbGVjdGVkLFxuICAgICAqIHRoZSBkZWxldGUvc2hhcmUgbWVudXMgYXJlIHZpc2libGUsIG90aGVyd2lzZSB0aGV5IGFyZSBub3QgdmlzaWJsZS5cbiAgICAgKiBBbmQgYWxzbyBzZXRzIHRoZSBzYW1lIHZhbHVlIGluIHRoZSBpbWFnZSBsaXN0LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBldmVudCBDaGVja2JveCBldmVudCBkYXRhXG4gICAgICogQHBhcmFtIGltYWdlUGF0aCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW5kZXggaW1hZ2UgaW5kZXggaW4gdGhlIGxpc3RcbiAgICAgKi9cbiAgICBpc0NoZWNrZWQoZXZlbnQsIGltYWdlUGF0aCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzaG93IGRpYWxvZyB3aW5kb3cgd2l0aCBvcHRpb25zICdTZWxlY3QgQWxsJyAmICdVbnNlbGVjdCBBbGwnIHdoZW5cbiAgICAgKiB0aGVyZSBpcyBwYXJ0aWFsIHNlbGVjdGlvbiBieSB1c2VyLCB3aGVyZSB1c2VyIGhhdmUgdG8gc2VsZWN0IG9uZSBvZiB0aGUgb3B0aW9uc1xuICAgICAqIGlmIG5lZWRlZCwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICogSWYgdGhlcmUgaXMgbm8gcGFydGlhbCBzZWxlY3Rpb24sIHRoZW4gdGhpcyB3aWxsIHNlbGVjdCBhbGwvdW5zZWxlY3QgYWxsIGJhc2VkIG9uXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGNoZWNrYm94LlxuICAgICAqL1xuICAgIG9uU2VsZWN0VW5TZWxlY3RBbGxDaGVja0JveCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCAhPT0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoICYmIHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUGF0aWFsbHkgc2VsZWN0ZWQuIERvIHlvdSB3YW50IHRvIHBlcmZvcm0gb25lIG9mIHRoZSBiZWxvdz8nLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnU2VsZWN0IEFsbCcsICdVbnNlbGVjdCBBbGwnXSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdTZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAnVW5zZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9ICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdXNlciBjaG9vc2UgdGhlIG1lbnUgJ1NvcnRCeURhdGUnLHdoZXJlIHNvcnRzIHRoZSBpbWFnZSBsaXN0XG4gICAgICogYnkgZGF0ZSBpdCBjcmVhdGVkIGFuZCBhbHNvIHNldHMgdGhlIG1lbnVzICdkZWxldGUnLydzaGFyZScgaW52aXNpYmxlLlxuICAgICAqL1xuICAgIG9uU29ydEJ5RGF0ZSgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsb25lZEltYWdlTGlzdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMuaW1hZ2VMaXN0KTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IChjbG9uZWRJbWFnZUxpc3QubGVuZ3RoIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS50aHVtYm5haWxQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5pc1NlbGVjdGVkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIGxldCBkYXRhVG9TaGFyZTogYW55ID0ge307XG4gICAgICAgIGxldCBkYXRhQ291bnQgPSAwO1xuICAgICAgICBsZXQgZG9jdW1lbnRzID0gZnMua25vd25Gb2xkZXJzLmRvY3VtZW50cygpO1xuXG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnID0gaW1hZ2UuZmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBmaWxlTmFtZSA9IGltYWdlLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIGxldCBwYXRoID0gZnMucGF0aC5qb2luKGRvY3VtZW50cy5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnLCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgZmlsZSA9IGZzLkZpbGUuZnJvbVBhdGgocGF0aCk7XG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkVUlJbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChwYXRoKTtcbiAgICAgICAgICAgICAgICBkYXRhVG9TaGFyZVtkYXRhQ291bnQrK10gPSB0cmFuc2Zvcm1lZFVJSW1hZ2U7XG4gICAgICAgICAgICAgICAgLy9HZXR0aW5nIG9yaWdpbmFsIGNhcHR1cmVkIGltYWdlXG4gICAgICAgICAgICAgICAgbGV0IGltZ0ZpbGVOYW1lT3JnID0gdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZy5yZXBsYWNlKCdQVF9JTUcnLCAnSU1HJyk7XG4gICAgICAgICAgICAgICAgaW1nRmlsZU5hbWVPcmcgPSBpbWdGaWxlTmFtZU9yZy5zdWJzdHJpbmcoMCwgaW1nRmlsZU5hbWVPcmcuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJy5qcGcnO1xuICAgICAgICAgICAgICAgIHBhdGggPSBmcy5wYXRoLmpvaW4oZG9jdW1lbnRzLnBhdGgsICdjYXB0dXJlZGltYWdlcycsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRVSUltYWdlT3JnID0gVUlJbWFnZS5pbWFnZU5hbWVkKHBhdGgpO1xuICAgICAgICAgICAgICAgIGRhdGFUb1NoYXJlW2RhdGFDb3VudCsrXSA9IHRyYW5zZm9ybWVkVUlJbWFnZU9yZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBsZXQgYWN0aXZpdHlDb250cm9sbGVyID0gVUlBY3Rpdml0eVZpZXdDb250cm9sbGVyLmFsbG9jKClcbiAgICAgICAgICAgICAgICAuaW5pdFdpdGhBY3Rpdml0eUl0ZW1zQXBwbGljYXRpb25BY3Rpdml0aWVzKFtkYXRhVG9TaGFyZV0sIG51bGwpO1xuICAgICAgICAgICAgYWN0aXZpdHlDb250cm9sbGVyLnNldFZhbHVlRm9yS2V5KCdUcmFuc2Zvcm1lZCBJbWFnZShzKScsICdTdWJqZWN0Jyk7XG4gICAgICAgICAgICBsZXQgcHJlc2VudFZpZXdDb250cm9sbGVyID0gYWN0aXZpdHlDb250cm9sbGVyLnBvcG92ZXJQcmVzZW50YXRpb25Db250cm9sbGVyO1xuICAgICAgICAgICAgaWYgKHByZXNlbnRWaWV3Q29udHJvbGxlcikge1xuICAgICAgICAgICAgICAgIHZhciBwYWdlID0gZnJhbWVNb2R1bGUudG9wbW9zdCgpLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgICAgIGlmIChwYWdlICYmIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMgJiZcbiAgICAgICAgICAgICAgICAgICAgcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtcy5jb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlc2VudFZpZXdDb250cm9sbGVyLmJhckJ1dHRvbkl0ZW0gPSBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zWzBdO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHByZXNlbnRWaWV3Q29udHJvbGxlci5zb3VyY2VWaWV3ID0gcGFnZS5pb3MudmlldztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHV0aWxzTW9kdWxlLmlvcy5nZXR0ZXIoVUlBcHBsaWNhdGlvbiwgVUlBcHBsaWNhdGlvbi5zaGFyZWRBcHBsaWNhdGlvbilcbiAgICAgICAgICAgICAgICAua2V5V2luZG93XG4gICAgICAgICAgICAgICAgLnJvb3RWaWV3Q29udHJvbGxlclxuICAgICAgICAgICAgICAgIC5wcmVzZW50Vmlld0NvbnRyb2xsZXJBbmltYXRlZENvbXBsZXRpb24oYWN0aXZpdHlDb250cm9sbGVyLCB0cnVlLCBudWxsKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4nICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBzaGFyaW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2Uocykgd2hlbiB1c2VyIGNsaWNrcyB0aGUgJ2RlbGV0ZScgYnV0dG9uIGluIG1lbnUuXG4gICAgICogVGhpcyB3aWxsIHNob3cgdXAgYSBkaWFsb2cgd2luZG93IGZvciBjb25maXJtYXRpb24gZm9yIHRoZSBzZWxlY3RlZCBpbWFnZShzKVxuICAgICAqIHRvIGJlIGRlbGV0ZWQuIElmIHVzZXIgc2F5cyAnT2snLCB0aGVuIHRob3NlIGltYWdlKHMpIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZVxuICAgICAqIGRldmljZSwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICovXG4gICAgb25EZWxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnRGVsZXRlJyxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnRGVsZXRpbmcgc2VsZWN0ZWQgaXRlbShzKT8nLFxuICAgICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogJ09rJyxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VMaXN0LmZvckVhY2goKGltYWdlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW1hZ2UuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRodW1ibmFpbEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bWJuYWlsRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGltYWdlLnRodW1ibmFpbFBhdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdJZHggPSB0aGlzLmltYWdlTGlzdC5pbmRleE9mKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltZ0lkeCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5zcGxpY2UoaW1nSWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUGFnZUxvYWRlZCh0aGlzLnBhZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGh1bWJuYWlsIGltYWdlcy4nICsgZXJyb3IpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyBpbWFnZXMnKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ1NlbGVjdGVkIGltYWdlcyBkZWxldGVkLicpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIGFsbCB0aGUgY2hlY2tCb3ggY2hlY2tlZCB2YWx1ZSBiYXNlZCBvbiB3aGF0IGl0IHJlY2VpdmVzIHZhbHVlIGFzIHBhcmFtZXRlci5cbiAgICAgKiBBbmQgYWxzbyBzZXRzIHRoZSBjaGVja0JveCdzIHBhZ2UgcHJvcGVydHkgdmFsdWUgYmFzZWQgb24gdGhlIGN1cnJlbnQgdmxhdWUgbGlrZVxuICAgICAqIGlmIGFscmVhZHkgaGFzIHRydWUsIHRoZW4gc2V0cyBmYWxzZSwgb3RoZXJ3aXNlIGl0IHNldHMgdHJ1ZS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hlY2tib3ggdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh2YWx1ZTogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrQm94ID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdjaGVja2JveC0nICsgaSkgYXMgQ2hlY2tCb3g7XG4gICAgICAgICAgICBjaGVja0JveC5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gIXZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aHVtYm5haWwgaW1hZ2VzIHVzaW5nIGNvbnRlbnQgcmVzb2x2ZXIgYnkgb3JkZXIgd2hhdCBpdCByZWNlaXZlcyBhcyBwYXJhbWV0ZXIuXG4gICAgICogXG4gICAgICogQHBhcmFtIG9yZGVyQnlBc2NEZXNjUGFyYW0gT3JkZXJCeSB2YWx1ZSAnQXNjJy8nRGVzYydcbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIubG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjUGFyYW0sIHRoaXMuYWN0aXZpdHlMb2FkZXIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyBhbGwgdGhlIHRyYW5zZm9ybWVkIHRodW1ibmFpbCBpbWFnZXMgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gYW5kIHN0b3JlcyBpbiB0aGUgaW1hZ2UgbGlzdCBmb3JcbiAgICAgKiBwdWJsaWMgYWNjZXNzLiBUaGUgZmlsZSBzeXN0ZW0gbmVlZHMgUkVBRF9FWFRFUk5BTF9TVE9SQUdFIHBlcm1pc3Npb24uXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlGaWxlU3lzdGVtKCkge1xuICAgICAgICAvLyBsZXQgY2FwdHVyZWRQaWN0dXJlUGF0aCA9ICcnO1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIGNhcHR1cmVkUGljdHVyZVBhdGggPSBhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpLmdldEFic29sdXRlUGF0aCgpICsgJy9EQ0lNJztcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlcjogRm9sZGVyID0gPEZvbGRlcj5rbm93bkZvbGRlcnMuY3VycmVudEFwcCgpO1xuICAgICAgICAgICAgLy8gY29uc3QgZm9sZGVyRGVzdCA9IGtub3duRm9sZGVycy5kb2N1bWVudHMoKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGZpbGVOYW1lID0gJ2NhcHR1cmVkaW1hZ2VzL0lNR18nICsgRGF0ZS5ub3coKSArICcuanBnJztcbiAgICAgICAgICAgIC8vIGNvbnN0IGNhcHR1cmVkUGljdHVyZVBhdGggPSBwYXRoLmpvaW4oZm9sZGVyLnBhdGgsICdjYXB0dXJlZGltYWdlcycpO1xuXG4gICAgICAgICAgICBsZXQgZm9sZGVyMCA9IGZzLnBhdGguam9pbihmcy5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkucGF0aCwgJ2NhcHR1cmVkaW1hZ2VzJywgJ3RodW1ibmFpbHMnKTtcbiAgICAgICAgICAgIGxldCBmb2xkZXJzMCA9IGZzLkZvbGRlci5mcm9tUGF0aChmb2xkZXIwKTtcbiAgICAgICAgICAgIGZvbGRlcnMwLmdldEVudGl0aWVzKClcbiAgICAgICAgICAgICAgICAudGhlbigoZW50aXRpZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZW50aXRpZXMgaXMgYXJyYXkgd2l0aCB0aGUgZG9jdW1lbnQncyBmaWxlcyBhbmQgZm9sZGVycy5cbiAgICAgICAgICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZiAoZW50aXR5Lm5hbWUuc3RhcnRzV2l0aCgndGh1bWJfUFRfSU1HJykgJiYgZW50aXR5Lm5hbWUuZW5kc1dpdGgoJy5wbmcnKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGh1bW5haWxPcmdQYXRoID0gZW50aXR5LnBhdGgucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBGYWlsZWQgdG8gb2J0YWluIGZvbGRlcidzIGNvbnRlbnRzLlxuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZXMuJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4nICsgZXJyb3IudG9TdHJpbmcoKSkuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=