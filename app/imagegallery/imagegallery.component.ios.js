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
// import * as frameModule from 'tns-core-modules/ui/frame';
// import * as utilsModule from 'tns-core-modules/utils/utils';
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
            this.transformedImageProvider.share(dataToShare);
            // let activityController = UIActivityViewController.alloc()
            //     .initWithActivityItemsApplicationActivities([dataToShare], null);
            // activityController.setValueForKey('Transformed Image(s)', 'Subject');
            // let presentViewController = activityController.popoverPresentationController;
            // if (presentViewController) {
            //     var page = frameModule.topmost().currentPage;
            //     if (page && page.ios.navigationItem.rightBarButtonItems &&
            //         page.ios.navigationItem.rightBarButtonItems.count > 0) {
            //         presentViewController.barButtonItem = page.ios.navigationItem.rightBarButtonItems[0];
            //     } else {
            //         presentViewController.sourceView = page.ios.view;
            //     }
            // }
            // utilsModule.ios.getter(UIApplication, UIApplication.sharedApplication)
            //     .keyWindow
            //     .rootViewController
            //     .presentViewControllerAnimatedCompletion(activityController, true, null);
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
                    thumnailOrgPath = thumnailOrgPath.replace('thumbnails/', '');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZWdhbGxlcnkuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFrRDtBQUNsRCwwQ0FBMkQ7QUFFM0QsNERBQWdGO0FBR2hGLHNEQUErRDtBQUkvRCxpRkFBeUU7QUFDekUsZ0ZBQXdFO0FBRXhFLHFEQUE4QztBQUM5Qyx1REFBc0Q7QUFFdEQsb0ZBQXNHO0FBR3RHLHFEQUF1RDtBQUd2RCwwQ0FBNEM7QUFDNUMsaURBQW1EO0FBQ25ELDREQUE0RDtBQUM1RCwrREFBK0Q7QUFFL0Q7OztHQUdHO0FBT0gsSUFBYSxxQkFBcUI7SUEwQjlCOzs7Ozs7O09BT0c7SUFDSCwrQkFDWSxnQkFBa0MsRUFDbEMsTUFBYyxFQUNkLHdCQUFrRCxFQUNsRCxjQUE4QixFQUM5QixNQUFvQjtRQUpwQixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWtCO1FBQ2xDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUM5QixXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQzVCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxXQUFDLEVBQUUsQ0FBQztRQUN0Qiw4RUFBOEU7UUFDOUUsZ0VBQWdFO0lBQ3BFLENBQUM7SUFDRDs7O09BR0c7SUFDSCx3Q0FBUSxHQUFSO1FBQ0ksOEJBQThCO1FBQzlCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxD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LGdCQUFTLENBQUM7UUFDUCxRQUFRLEVBQUUsaUJBQWlCO1FBQzNCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtRQUNuQixTQUFTLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQztRQUMzQyxXQUFXLEVBQUUsK0JBQStCO0tBQy9DLENBQUM7cUNBb0NnQyx5QkFBZ0I7UUFDMUIsZUFBTSxzQkFDWSxvREFBd0Isb0JBQXhCLG9EQUF3QixrQ0FDbEMsc0NBQWMsc0JBQ3RCLDJCQUFZLG9CQUFaLDJCQUFZO0dBdkN2QixxQkFBcUIsQ0FnWGpDO0FBaFhZLHNEQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uRXh0cmFzLCBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBGaWxlLCBGb2xkZXIsIHBhdGgsIGtub3duRm9sZGVycyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuaW1wb3J0IHsgUGFnZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdWkvcGFnZSc7XG5cbmltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBDaGVja0JveCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1jaGVja2JveCc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2UgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5jb21tb24nO1xuXG5pbXBvcnQgeyBMIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgU2VuZEJyb2FkY2FzdEltYWdlLCBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgZGlhbG9ncyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3MnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuLy8gaW1wb3J0ICogYXMgZnJhbWVNb2R1bGUgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9mcmFtZSc7XG4vLyBpbXBvcnQgKiBhcyB1dGlsc01vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3V0aWxzL3V0aWxzJztcblxuLyoqXG4gKiBJbWFnZUdhbGxlcnlDb21wb25lbnQgY2xhc3MgaXMgYmVpbmcgdXNlZCB0byBkaXNwbGF5IGFsbCB0aGUgdGh1bWJuYWlsIFxuICogaW1hZ2VzIG9mIHRyYW5zZm9ybWVkIGltYWdlcyBpbiBnYWxsZXJ5IHZpZXcuXG4gKi9cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbnMtaW1hZ2VnYWxsZXJ5JyxcbiAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICAgIHN0eWxlVXJsczogWycuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgc2hhcmluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgZGVsZXRpbmcgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNEZWxldGluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBwb3B1cCBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc1BvcFVwTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTb3J0QnlEYXRlIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU29ydEJ5RGF0ZU1lbnU6IGJvb2xlYW47XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgY2hlY2tib3ggdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzQ2hlY2tCb3hWaXNpYmxlOiBib29sZWFuO1xuICAgIC8qKiBJbmRpY2F0ZXMgY2hlY2tib3ggc2VsZWN0ZWQgY291bnQuICovXG4gICAgcHJpdmF0ZSBzZWxlY3RlZENvdW50OiBudW1iZXI7XG4gICAgLyoqIEJvb2xlYW4gdmFsdWUgdG8gbWFrZSB0aGUgU2VsZWN0L1Vuc2VsZWN0QWxsIG1lbnUgdmlzaWJsZSBvciBub3QgKi9cbiAgICBwcml2YXRlIGlzU2VsZWN0VW5zZWxlY3RBbGw6IGJvb2xlYW47XG4gICAgLyoqIFN0b3JlcyBvcmRlckJ5IHZhbHVlICdBc2MnLydEZXNjJyAqL1xuICAgIHByaXZhdGUgb3JkZXJCeUFzY0Rlc2M6IHN0cmluZztcbiAgICAvKiogU3RvcmVzIHBhZ2UgcmVmZXJyZW5jZS4gKi9cbiAgICBwcml2YXRlIHBhZ2U7XG4gICAgLyoqIExhYmxlIGZvciBzZWxlY3QvdW5zZWxlY3QgQWxsIG1lbnUgKi9cbiAgICAvLyBwcml2YXRlIHNlbGVjdFVuc2VsZWN0QWxsTGFibGU6IGFueTtcbiAgICAvLyAvKiogTGFibGUgZm9yIHNvcnQgYnkgZGF0ZSBtZW51ICovXG4gICAgLy8gcHJpdmF0ZSBzb3J0QnlEYXRlTGFibGU6IGFueTtcbiAgICAvKiogTG9jYWxpemF0aW9uICovXG4gICAgcHJpdmF0ZSBsb2NhbGU6IEw7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50LlxuICAgICAqIFxuICAgICAqIEBwYXJhbSByb3V0ZXJFeHRlbnNpb25zIFJvdXRlciBleHRlbnNpb24gaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gcm91dGVyIFJvdXRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgVHJhbnNmb3JtZWQgaW1hZ2UgcHJvdmlkZXIgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gYWN0aXZpdHlMb2FkZXIgQWN0aXZpdHkgbG9hZGVyIGluc3RhbmNlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyxcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSB0cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXI6IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBhY3Rpdml0eUxvYWRlcjogQWN0aXZpdHlMb2FkZXIsXG4gICAgICAgIHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIpIHtcbiAgICAgICAgdGhpcy5sb2NhbGUgPSBuZXcgTCgpO1xuICAgICAgICAvLyB0aGlzLnNlbGVjdFVuc2VsZWN0QWxsTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NlbGVjdF91bnNlbGVjdF9hbGwnKTtcbiAgICAgICAgLy8gdGhpcy5zb3J0QnlEYXRlTGFibGUgPSB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ3NvcnRfYnlfZGF0ZScpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyBtZW51IHByb3BlcnRpZXMgYW5kIGNoZWNrYm94IHRvIGJlIHNlbGVjdGVkIGltYWdlKHMpIGFuZFxuICAgICAqIGxvYWQgdGh1bWJuYWlsIGltYWdlcyBmb3IgZ2FsbGVyeSB2aWV3IHRvIGJlIGRpc3BsYXllZC5cbiAgICAgKi9cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgLy8gdGhpcy5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NvcnRCeURhdGVNZW51ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlGaWxlU3lzdGVtKCk7XG4gICAgICAgIC8vIHRoaXMub3JkZXJCeUFzY0Rlc2MgPSAnIERFU0MnO1xuXG4gICAgICAgIC8vICAgICAgdGhpcy5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIodGhpcy5vcmRlckJ5QXNjRGVzYyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHN0b3JlZCB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2UgbGlzdC5cbiAgICAgKiBAcmV0dXJucyBpbWFnZSBsaXN0LlxuICAgICAqL1xuICAgIGdldCBpbWFnZUxpc3QoKTogVHJhbnNmb3JtZWRJbWFnZVtdIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgY2hlY2tib3ggYW5kIHBvcHVwIG1lbnUgcHJvcGVydGllcyB0cnVlIGZvciB0aGVtIHRvIGJlIHZpc2libGUuXG4gICAgICovXG4gICAgc2V0Q2hlY2tib3hWaXNpYmxlKCkge1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IHRydWU7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrQm94ID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdjaGVja2JveC0nICsgaSkgYXMgQ2hlY2tCb3g7XG4gICAgICAgICAgICBjaGVja0JveC5zY2FsZVggPSAxLjc1O1xuICAgICAgICAgICAgY2hlY2tCb3guc2NhbGVZID0gMS43NTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBmaXJlcyB3aGVuIHRoZSBnYWxsZXJ5IHBhZ2UgaXMgbG9hZGVkIGFuZCBzZXRzIHBhZ2UgYW5kIG1lbnVcbiAgICAgKiBwcm9wZXJ0aWVzIHZhbHVlIHRvIHRydWUvZmFsc2UgYmFzZWQgb24gdGh1bWJuYWlsIGltYWdlIGxpc3QgY291bnQuXG4gICAgICogXG4gICAgICogQHBhcmFtIGFyZ3MgUGFnZSBsb2FkZWQgZXZlbnQgZGF0YVxuICAgICAqL1xuICAgIG9uUGFnZUxvYWRlZChhcmdzKSB7XG4gICAgICAgIHRoaXMucGFnZSA9IChhcmdzICE9PSB0aGlzLnBhZ2UpID8gYXJncy5vYmplY3QgYXMgUGFnZSA6IGFyZ3M7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ291bnRUZW1wID0gdGhpcy5zZWxlY3RlZENvdW50O1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9ICh0aGlzLmltYWdlTGlzdC5sZW5ndGggPiAwKSA/IHRoaXMuaXNQb3BVcE1lbnUgOiBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NvcnRCeURhdGVNZW51ID0gKHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCA+IDApID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICBmb3IgKGNvbnN0IGltYWdlIGluIHRoaXMuaW1hZ2VMaXN0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3RbaW1hZ2VdLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSBzZWxlY3RlZENvdW50VGVtcDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBHb2VzIGJhY2sgdG8gcHJldmlvdXMgcGFnZSAoY2FtZXJhIHZpZXcpIHdoZW4gdGhlIEJhY2sgYnV0dG9uIGlzIHByZXNzZWQuXG4gICAgICovXG4gICAgZ29CYWNrKCkge1xuICAgICAgICBmb3IgKGNvbnN0IGltYWdlIGluIHRoaXMuaW1hZ2VMaXN0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pbWFnZUxpc3RbaW1hZ2VdLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEdvZXMgdG8gSW1hZ2Ugc2xpZGUgcGFnZSB3aGVuIHVzZXIgZG9lcyBkb3VibGUgdGFwIG9uIGltYWdlIGFuZCBhbHNvIG5hdmlnYXRlcyB3aXRoXG4gICAgICogdHJhbnNmb3JtZWQgaW1hZ2UgVVJJIGFuZCBpbmRleCBvZiBpdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKiBAcGFyYW0gaW1nSW5kZXhQYXJhbSAgaW1hZ2UgaW5kZXhcbiAgICAgKi9cbiAgICBnb0ltYWdlU2xpZGUoaW1nVVJJUGFyYW0sIGltZ0luZGV4UGFyYW0pIHtcbiAgICAgICAgY29uc3QgbmF2aWdhdGlvbkV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyA9IHtcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgaW1nVVJJOiBpbWdVUklQYXJhbSxcbiAgICAgICAgICAgICAgICBpbWdJbmRleDogaW1nSW5kZXhQYXJhbSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VzbGlkZSddLCBuYXZpZ2F0aW9uRXh0cmFzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGNoZWNrQm94IGlzIGJlZW4gc2VsZWN0ZWQgb3Igbm90LiBJZiBpdCBpcyBzZWxlY3RlZCxcbiAgICAgKiB0aGUgZGVsZXRlL3NoYXJlIG1lbnVzIGFyZSB2aXNpYmxlLCBvdGhlcndpc2UgdGhleSBhcmUgbm90IHZpc2libGUuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgc2FtZSB2YWx1ZSBpbiB0aGUgaW1hZ2UgbGlzdC5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZXZlbnQgQ2hlY2tib3ggZXZlbnQgZGF0YVxuICAgICAqIEBwYXJhbSBpbWFnZVBhdGggdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIGluZGV4IGltYWdlIGluZGV4IGluIHRoZSBsaXN0XG4gICAgICovXG4gICAgaXNDaGVja2VkKGV2ZW50LCBpbWFnZVBhdGgsIGluZGV4KSB7XG4gICAgICAgIGlmIChldmVudC52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQtLTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaXNTaGFyaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmltYWdlTGlzdFtpbmRleF0uaXNTZWxlY3RlZCA9IGV2ZW50LnZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gc2hvdyBkaWFsb2cgd2luZG93IHdpdGggb3B0aW9ucyAnU2VsZWN0IEFsbCcgJiAnVW5zZWxlY3QgQWxsJyB3aGVuXG4gICAgICogdGhlcmUgaXMgcGFydGlhbCBzZWxlY3Rpb24gYnkgdXNlciwgd2hlcmUgdXNlciBoYXZlIHRvIHNlbGVjdCBvbmUgb2YgdGhlIG9wdGlvbnNcbiAgICAgKiBpZiBuZWVkZWQsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqIElmIHRoZXJlIGlzIG5vIHBhcnRpYWwgc2VsZWN0aW9uLCB0aGVuIHRoaXMgd2lsbCBzZWxlY3QgYWxsL3Vuc2VsZWN0IGFsbCBiYXNlZCBvblxuICAgICAqIHRoZSBjdXJyZW50IHZhbHVlIG9mIHRoZSBjaGVja2JveC5cbiAgICAgKi9cbiAgICBvblNlbGVjdFVuU2VsZWN0QWxsQ2hlY2tCb3goKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgIT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCAmJiB0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBkaWFsb2dzLmFjdGlvbih7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ1BhdGlhbGx5IHNlbGVjdGVkLiBEbyB5b3Ugd2FudCB0byBwZXJmb3JtIG9uZSBvZiB0aGUgYmVsb3c/JyxcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiAnQ2FuY2VsJyxcbiAgICAgICAgICAgICAgICBhY3Rpb25zOiBbJ1NlbGVjdCBBbGwnLCAnVW5zZWxlY3QgQWxsJ10sXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ID09PSAnU2VsZWN0IEFsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3VsdCA9PT0gJ1Vuc2VsZWN0IEFsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyZm9ybVNlbGVjdFVuc2VsZWN0QWxsKHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSAodGhpcy5zZWxlY3RlZENvdW50ID09PSB0aGlzLmltYWdlTGlzdC5sZW5ndGgpID8gZmFsc2UgOiB0cnVlO1xuICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBmaXJlcyB3aGVuIHVzZXIgY2hvb3NlIHRoZSBtZW51ICdTb3J0QnlEYXRlJyx3aGVyZSBzb3J0cyB0aGUgaW1hZ2UgbGlzdFxuICAgICAqIGJ5IGRhdGUgaXQgY3JlYXRlZCBhbmQgYWxzbyBzZXRzIHRoZSBtZW51cyAnZGVsZXRlJy8nc2hhcmUnIGludmlzaWJsZS5cbiAgICAgKi9cbiAgICBvblNvcnRCeURhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICBjb25zdCBjbG9uZWRJbWFnZUxpc3QgPSBPYmplY3QuYXNzaWduKFtdLCB0aGlzLmltYWdlTGlzdCk7XG5cbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAoY2xvbmVkSW1hZ2VMaXN0Lmxlbmd0aCAtIDEpOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVOYW1lLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5maWxlUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0udGh1bWJuYWlsUGF0aCxcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uaXNTZWxlY3RlZCxcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNoYXJlcyBzZWxlY3RlZCBpbWFnZShzKSB3aGVuIHVzZXIgY2xpY2tzIHRoZSBzaGFyZSBidXR0b24uIFRoZSBzaGFyaW5nIGNhbiBiZSBkb25lXG4gICAgICogdmlhIGFueSBvbmUgb2YgdGhlIG1lZGlhcyBzdXBwb3J0ZWQgYnkgYW5kcm9pZCBkZXZpY2UgYnkgZGVmYXVsdC4gVGhlIGxpc3Qgb2Ygc3VwcG9ydGVkXG4gICAgICogbWVkaWFzIHdpbGwgYmUgdmlzaWJsZSB3aGVuIHRoZSBzaGFyZSBidXR0b24gY2xpY2tlZC5cbiAgICAgKi9cbiAgICBvblNoYXJlKCkge1xuICAgICAgICBsZXQgZGF0YVRvU2hhcmU6IGFueSA9IHt9O1xuICAgICAgICBsZXQgZGF0YUNvdW50ID0gMDtcbiAgICAgICAgbGV0IGRvY3VtZW50cyA9IGZzLmtub3duRm9sZGVycy5kb2N1bWVudHMoKTtcblxuICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZyA9IGltYWdlLmZpbGVOYW1lLnJlcGxhY2UoJ3RodW1iX1BUX0lNRycsICdQVF9JTUcnKTtcbiAgICAgICAgICAgICAgICAvLyBsZXQgZmlsZU5hbWUgPSBpbWFnZS5maWxlTmFtZTtcbiAgICAgICAgICAgICAgICBsZXQgcGF0aCA9IGZzLnBhdGguam9pbihkb2N1bWVudHMucGF0aCwgJ2NhcHR1cmVkaW1hZ2VzJywgdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKHBhdGgpO1xuICAgICAgICAgICAgICAgIGxldCB0cmFuc2Zvcm1lZFVJSW1hZ2UgPSBVSUltYWdlLmltYWdlTmFtZWQocGF0aCk7XG4gICAgICAgICAgICAgICAgZGF0YVRvU2hhcmVbZGF0YUNvdW50KytdID0gdHJhbnNmb3JtZWRVSUltYWdlO1xuICAgICAgICAgICAgICAgIC8vR2V0dGluZyBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZVxuICAgICAgICAgICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1nRmlsZU5hbWVPcmcucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICAgICAgICAgIGltZ0ZpbGVOYW1lT3JnID0gaW1nRmlsZU5hbWVPcmcuc3Vic3RyaW5nKDAsIGltZ0ZpbGVOYW1lT3JnLmluZGV4T2YoJ190cmFuc2Zvcm1lZCcpKSArICcuanBnJztcbiAgICAgICAgICAgICAgICBwYXRoID0gZnMucGF0aC5qb2luKGRvY3VtZW50cy5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgbGV0IHRyYW5zZm9ybWVkVUlJbWFnZU9yZyA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChwYXRoKTtcbiAgICAgICAgICAgICAgICBkYXRhVG9TaGFyZVtkYXRhQ291bnQrK10gPSB0cmFuc2Zvcm1lZFVJSW1hZ2VPcmc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuc2hhcmUoZGF0YVRvU2hhcmUpO1xuICAgICAgICAgICAgLy8gbGV0IGFjdGl2aXR5Q29udHJvbGxlciA9IFVJQWN0aXZpdHlWaWV3Q29udHJvbGxlci5hbGxvYygpXG4gICAgICAgICAgICAvLyAgICAgLmluaXRXaXRoQWN0aXZpdHlJdGVtc0FwcGxpY2F0aW9uQWN0aXZpdGllcyhbZGF0YVRvU2hhcmVdLCBudWxsKTtcbiAgICAgICAgICAgIC8vIGFjdGl2aXR5Q29udHJvbGxlci5zZXRWYWx1ZUZvcktleSgnVHJhbnNmb3JtZWQgSW1hZ2UocyknLCAnU3ViamVjdCcpO1xuICAgICAgICAgICAgLy8gbGV0IHByZXNlbnRWaWV3Q29udHJvbGxlciA9IGFjdGl2aXR5Q29udHJvbGxlci5wb3BvdmVyUHJlc2VudGF0aW9uQ29udHJvbGxlcjtcbiAgICAgICAgICAgIC8vIGlmIChwcmVzZW50Vmlld0NvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIC8vICAgICB2YXIgcGFnZSA9IGZyYW1lTW9kdWxlLnRvcG1vc3QoKS5jdXJyZW50UGFnZTtcbiAgICAgICAgICAgIC8vICAgICBpZiAocGFnZSAmJiBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zICYmXG4gICAgICAgICAgICAvLyAgICAgICAgIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMuY291bnQgPiAwKSB7XG4gICAgICAgICAgICAvLyAgICAgICAgIHByZXNlbnRWaWV3Q29udHJvbGxlci5iYXJCdXR0b25JdGVtID0gcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtc1swXTtcbiAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gICAgICAgICBwcmVzZW50Vmlld0NvbnRyb2xsZXIuc291cmNlVmlldyA9IHBhZ2UuaW9zLnZpZXc7XG4gICAgICAgICAgICAvLyAgICAgfVxuICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAvLyB1dGlsc01vZHVsZS5pb3MuZ2V0dGVyKFVJQXBwbGljYXRpb24sIFVJQXBwbGljYXRpb24uc2hhcmVkQXBwbGljYXRpb24pXG4gICAgICAgICAgICAvLyAgICAgLmtleVdpbmRvd1xuICAgICAgICAgICAgLy8gICAgIC5yb290Vmlld0NvbnRyb2xsZXJcbiAgICAgICAgICAgIC8vICAgICAucHJlc2VudFZpZXdDb250cm9sbGVyQW5pbWF0ZWRDb21wbGV0aW9uKGFjdGl2aXR5Q29udHJvbGxlciwgdHJ1ZSwgbnVsbCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlICdkZWxldGUnIGJ1dHRvbiBpbiBtZW51LlxuICAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAgKiB0byBiZSBkZWxldGVkLiBJZiB1c2VyIHNheXMgJ09rJywgdGhlbiB0aG9zZSBpbWFnZShzKSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqL1xuICAgIG9uRGVsZXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlhbG9ncy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nIHNlbGVjdGVkIGl0ZW0ocyk/JyxcbiAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nSWR4ID0gdGhpcy5pbWFnZUxpc3QuaW5kZXhPZihpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3Quc3BsaWNlKGltZ0lkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VMb2FkZWQodGhpcy5wYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdTZWxlY3RlZCBpbWFnZXMgZGVsZXRlZC4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhbGwgdGhlIGNoZWNrQm94IGNoZWNrZWQgdmFsdWUgYmFzZWQgb24gd2hhdCBpdCByZWNlaXZlcyB2YWx1ZSBhcyBwYXJhbWV0ZXIuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgY2hlY2tCb3gncyBwYWdlIHByb3BlcnR5IHZhbHVlIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZsYXVlIGxpa2VcbiAgICAgKiBpZiBhbHJlYWR5IGhhcyB0cnVlLCB0aGVuIHNldHMgZmFsc2UsIG90aGVyd2lzZSBpdCBzZXRzIHRydWUuXG4gICAgICogXG4gICAgICogQHBhcmFtIHZhbHVlIENoZWNrYm94IHZhbHVlXG4gICAgICovXG4gICAgcHJpdmF0ZSBwZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodmFsdWU6IGFueSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjaGVja0JveCA9IHRoaXMucGFnZS5nZXRWaWV3QnlJZCgnY2hlY2tib3gtJyArIGkpIGFzIENoZWNrQm94O1xuICAgICAgICAgICAgY2hlY2tCb3guY2hlY2tlZCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9ICF2YWx1ZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgdGh1bWJuYWlsIGltYWdlcyB1c2luZyBjb250ZW50IHJlc29sdmVyIGJ5IG9yZGVyIHdoYXQgaXQgcmVjZWl2ZXMgYXMgcGFyYW1ldGVyLlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBvcmRlckJ5QXNjRGVzY1BhcmFtIE9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcihvcmRlckJ5QXNjRGVzY1BhcmFtLCB0aGlzLmFjdGl2aXR5TG9hZGVyKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogTG9hZHMgYWxsIHRoZSB0cmFuc2Zvcm1lZCB0aHVtYm5haWwgaW1hZ2VzIGZyb20gdGhlIGZpbGUgc3lzdGVtIGFuZCBzdG9yZXMgaW4gdGhlIGltYWdlIGxpc3QgZm9yXG4gICAgICogcHVibGljIGFjY2Vzcy4gVGhlIGZpbGUgc3lzdGVtIG5lZWRzIFJFQURfRVhURVJOQUxfU1RPUkFHRSBwZXJtaXNzaW9uLlxuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZFRodW1ibmFpbEltYWdlc0J5RmlsZVN5c3RlbSgpIHtcbiAgICAgICAgLy8gbGV0IGNhcHR1cmVkUGljdHVyZVBhdGggPSAnJztcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0ID0gW107XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBjYXB0dXJlZFBpY3R1cmVQYXRoID0gYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKS5nZXRBYnNvbHV0ZVBhdGgoKSArICcvRENJTSc7XG4gICAgICAgICAgICBjb25zdCBmb2xkZXI6IEZvbGRlciA9IDxGb2xkZXI+a25vd25Gb2xkZXJzLmN1cnJlbnRBcHAoKTtcbiAgICAgICAgICAgIC8vIGNvbnN0IGZvbGRlckRlc3QgPSBrbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XG4gICAgICAgICAgICAvLyBjb25zdCBmaWxlTmFtZSA9ICdjYXB0dXJlZGltYWdlcy9JTUdfJyArIERhdGUubm93KCkgKyAnLmpwZyc7XG4gICAgICAgICAgICAvLyBjb25zdCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gcGF0aC5qb2luKGZvbGRlci5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnKTtcblxuICAgICAgICAgICAgbGV0IGZvbGRlcjAgPSBmcy5wYXRoLmpvaW4oZnMua25vd25Gb2xkZXJzLmRvY3VtZW50cygpLnBhdGgsICdjYXB0dXJlZGltYWdlcycsICd0aHVtYm5haWxzJyk7XG4gICAgICAgICAgICBsZXQgZm9sZGVyczAgPSBmcy5Gb2xkZXIuZnJvbVBhdGgoZm9sZGVyMCk7XG4gICAgICAgICAgICBmb2xkZXJzMC5nZXRFbnRpdGllcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGVudGl0aWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVudGl0aWVzIGlzIGFycmF5IHdpdGggdGhlIGRvY3VtZW50J3MgZmlsZXMgYW5kIGZvbGRlcnMuXG4gICAgICAgICAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgKGVudGl0eS5uYW1lLnN0YXJ0c1dpdGgoJ3RodW1iX1BUX0lNRycpICYmIGVudGl0eS5uYW1lLmVuZHNXaXRoKCcucG5nJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aHVtbmFpbE9yZ1BhdGggPSBlbnRpdHkucGF0aC5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGggPSB0aHVtbmFpbE9yZ1BhdGgucmVwbGFjZSgndGh1bWJuYWlscy8nLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5LnBhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWxlZCB0byBvYnRhaW4gZm9sZGVyJ3MgY29udGVudHMuXG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBsb2FkaW5nIGltYWdlcy4nICsgZXJyb3IsICdsb25nJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZ2V0dGluZyBwYXRoLicgKyBlcnJvci50b1N0cmluZygpKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZ2V0dGluZyBwYXRoLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==