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
                var imgFilepath = fs.path.join(documents.path, 'capturedimages', transformedImgFileNameOrg);
                // let file = fs.File.fromPath(path);
                var transformedUIImage = UIImage.imageNamed(imgFilepath);
                dataToShare[dataCount++] = transformedUIImage;
                // Getting original captured image
                var imgFileNameOrg = transformedImgFileNameOrg.replace('PT_IMG', 'IMG');
                imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
                imgFilepath = fs.path.join(documents.path, 'capturedimages', imgFileNameOrg);
                var transformedUIImageOrg = UIImage.imageNamed(imgFilepath);
                dataToShare[dataCount++] = transformedUIImageOrg;
            }
        });
        try {
            this.transformedImageProvider.share(dataToShare);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbWFnZWdhbGxlcnkuY29tcG9uZW50Lmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUFrRDtBQUNsRCwwQ0FBMkQ7QUFFM0QsNERBQWdGO0FBR2hGLHNEQUErRDtBQUkvRCxpRkFBeUU7QUFDekUsZ0ZBQXdFO0FBRXhFLHFEQUE4QztBQUM5Qyx1REFBc0Q7QUFFdEQsb0ZBQXNHO0FBR3RHLHFEQUF1RDtBQUd2RCwwQ0FBNEM7QUFDNUMsaURBQW1EO0FBRW5EOzs7R0FHRztBQU9ILElBQWEscUJBQXFCO0lBc0I5Qjs7Ozs7OztPQU9HO0lBQ0gsK0JBQ1ksZ0JBQWtDLEVBQ2xDLE1BQWMsRUFDZCx3QkFBa0QsRUFDbEQsY0FBOEIsRUFDOUIsTUFBb0I7UUFKcEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsNkJBQXdCLEdBQXhCLHdCQUF3QixDQUEwQjtRQUNsRCxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7UUFDOUIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUM1QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksV0FBQyxFQUFFLENBQUM7UUFDdEIsOEVBQThFO1FBQzlFLGdFQUFnRTtJQUNwRSxDQUFDO0lBQ0Q7OztPQUdHO0lBQ0gsd0NBQVEsR0FBUjtRQUNJLDhCQUE4QjtRQUM5QixJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7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MFZqQztBQTFWWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmF2aWdhdGlvbkV4dHJhcywgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgRmlsZSwgRm9sZGVyLCBrbm93bkZvbGRlcnMsIHBhdGggfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuXG5pbXBvcnQgeyBSb3V0ZXJFeHRlbnNpb25zIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQ2hlY2tCb3ggfSBmcm9tICduYXRpdmVzY3JpcHQtY2hlY2tib3gnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UuY29tbW9uJztcblxuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5cbmltcG9ydCB7IFNlbmRCcm9hZGNhc3RJbWFnZSwgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uJztcbmltcG9ydCAqIGFzIGRpYWxvZ3MgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy91aS9kaWFsb2dzJztcblxuaW1wb3J0ICogYXMgUGVybWlzc2lvbnMgZnJvbSAnbmF0aXZlc2NyaXB0LXBlcm1pc3Npb25zJztcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuLyoqXG4gKiBJbWFnZUdhbGxlcnlDb21wb25lbnQgY2xhc3MgaXMgYmVpbmcgdXNlZCB0byBkaXNwbGF5IGFsbCB0aGUgdGh1bWJuYWlsXG4gKiBpbWFnZXMgb2YgdHJhbnNmb3JtZWQgaW1hZ2VzIGluIGdhbGxlcnkgdmlldy5cbiAqL1xuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICducy1pbWFnZWdhbGxlcnknLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5odG1sJyxcbn0pXG5leHBvcnQgY2xhc3MgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBzaGFyaW5nIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzU2hhcmluZzogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBkZWxldGluZyBtZW51IHZpc2libGUgb3Igbm90LiAqL1xuICAgIHB1YmxpYyBpc0RlbGV0aW5nOiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIHBvcHVwIG1lbnUgdmlzaWJsZSBvciBub3QuICovXG4gICAgcHVibGljIGlzUG9wVXBNZW51OiBib29sZWFuO1xuICAgIC8qKiBCb29sZWFuIHZhbHVlIHRvIG1ha2UgdGhlIFNvcnRCeURhdGUgbWVudSB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNTb3J0QnlEYXRlTWVudTogYm9vbGVhbjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBjaGVja2JveCB2aXNpYmxlIG9yIG5vdC4gKi9cbiAgICBwdWJsaWMgaXNDaGVja0JveFZpc2libGU6IGJvb2xlYW47XG4gICAgLyoqIEluZGljYXRlcyBjaGVja2JveCBzZWxlY3RlZCBjb3VudC4gKi9cbiAgICBwcml2YXRlIHNlbGVjdGVkQ291bnQ6IG51bWJlcjtcbiAgICAvKiogQm9vbGVhbiB2YWx1ZSB0byBtYWtlIHRoZSBTZWxlY3QvVW5zZWxlY3RBbGwgbWVudSB2aXNpYmxlIG9yIG5vdCAqL1xuICAgIHByaXZhdGUgaXNTZWxlY3RVbnNlbGVjdEFsbDogYm9vbGVhbjtcbiAgICAvKiogU3RvcmVzIG9yZGVyQnkgdmFsdWUgJ0FzYycvJ0Rlc2MnICovXG4gICAgcHJpdmF0ZSBvcmRlckJ5QXNjRGVzYzogc3RyaW5nO1xuICAgIC8qKiBTdG9yZXMgcGFnZSByZWZlcnJlbmNlLiAqL1xuICAgIHByaXZhdGUgcGFnZTtcbiAgICAvKiogTG9jYWxpemF0aW9uICovXG4gICAgcHJpdmF0ZSBsb2NhbGU6IEw7XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RvciBmb3IgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHJvdXRlckV4dGVuc2lvbnMgUm91dGVyIGV4dGVuc2lvbiBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSByb3V0ZXIgUm91dGVyIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciBUcmFuc2Zvcm1lZCBpbWFnZSBwcm92aWRlciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBhY3Rpdml0eUxvYWRlciBBY3Rpdml0eSBsb2FkZXIgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2dnZXI6IE94c0V5ZUxvZ2dlcikge1xuICAgICAgICB0aGlzLmxvY2FsZSA9IG5ldyBMKCk7XG4gICAgICAgIC8vIHRoaXMuc2VsZWN0VW5zZWxlY3RBbGxMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc2VsZWN0X3Vuc2VsZWN0X2FsbCcpO1xuICAgICAgICAvLyB0aGlzLnNvcnRCeURhdGVMYWJsZSA9IHRoaXMubG9jYWxlLnRyYW5zZm9ybSgnc29ydF9ieV9kYXRlJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemVzIG1lbnUgcHJvcGVydGllcyBhbmQgY2hlY2tib3ggdG8gYmUgc2VsZWN0ZWQgaW1hZ2UocykgYW5kXG4gICAgICogbG9hZCB0aHVtYm5haWwgaW1hZ2VzIGZvciBnYWxsZXJ5IHZpZXcgdG8gYmUgZGlzcGxheWVkLlxuICAgICAqL1xuICAgIG5nT25Jbml0KCk6IHZvaWQge1xuICAgICAgICAvLyB0aGlzLmFjdGl2aXR5TG9hZGVyLnNob3coKTtcbiAgICAgICAgdGhpcy5pc0NoZWNrQm94VmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1BvcFVwTWVudSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzU29ydEJ5RGF0ZU1lbnUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUZpbGVTeXN0ZW0oKTtcbiAgICAgICAgLy8gdGhpcy5vcmRlckJ5QXNjRGVzYyA9ICcgREVTQyc7XG5cbiAgICAgICAgLy8gICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXNCeUNvbnRlbnRSZXNvbHZlcih0aGlzLm9yZGVyQnlBc2NEZXNjKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgc3RvcmVkIHRyYW5zZm9ybWVkIHRodW1ibmFpbCBpbWFnZSBsaXN0LlxuICAgICAqIEByZXR1cm5zIGltYWdlIGxpc3QuXG4gICAgICovXG4gICAgZ2V0IGltYWdlTGlzdCgpOiBUcmFuc2Zvcm1lZEltYWdlW10ge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSBjaGVja2JveCBhbmQgcG9wdXAgbWVudSBwcm9wZXJ0aWVzIHRydWUgZm9yIHRoZW0gdG8gYmUgdmlzaWJsZS5cbiAgICAgKi9cbiAgICBzZXRDaGVja2JveFZpc2libGUoKSB7XG4gICAgICAgIHRoaXMuaXNDaGVja0JveFZpc2libGUgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzUG9wVXBNZW51ID0gdHJ1ZTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmltYWdlTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2hlY2tCb3ggPSB0aGlzLnBhZ2UuZ2V0Vmlld0J5SWQoJ2NoZWNrYm94LScgKyBpKSBhcyBDaGVja0JveDtcbiAgICAgICAgICAgIGNoZWNrQm94LnNjYWxlWCA9IDEuNzU7XG4gICAgICAgICAgICBjaGVja0JveC5zY2FsZVkgPSAxLjc1O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdGhlIGdhbGxlcnkgcGFnZSBpcyBsb2FkZWQgYW5kIHNldHMgcGFnZSBhbmQgbWVudVxuICAgICAqIHByb3BlcnRpZXMgdmFsdWUgdG8gdHJ1ZS9mYWxzZSBiYXNlZCBvbiB0aHVtYm5haWwgaW1hZ2UgbGlzdCBjb3VudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhcmdzIFBhZ2UgbG9hZGVkIGV2ZW50IGRhdGFcbiAgICAgKi9cbiAgICBvblBhZ2VMb2FkZWQoYXJncykge1xuICAgICAgICB0aGlzLnBhZ2UgPSAoYXJncyAhPT0gdGhpcy5wYWdlKSA/IGFyZ3Mub2JqZWN0IGFzIFBhZ2UgOiBhcmdzO1xuICAgICAgICBjb25zdCBzZWxlY3RlZENvdW50VGVtcCA9IHRoaXMuc2VsZWN0ZWRDb3VudDtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNQb3BVcE1lbnUgPSAodGhpcy5pbWFnZUxpc3QubGVuZ3RoID4gMCkgPyB0aGlzLmlzUG9wVXBNZW51IDogZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTb3J0QnlEYXRlTWVudSA9ICh0aGlzLmltYWdlTGlzdC5sZW5ndGggPiAwKSA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gc2VsZWN0ZWRDb3VudFRlbXA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogR29lcyBiYWNrIHRvIHByZXZpb3VzIHBhZ2UgKGNhbWVyYSB2aWV3KSB3aGVuIHRoZSBCYWNrIGJ1dHRvbiBpcyBwcmVzc2VkLlxuICAgICAqL1xuICAgIGdvQmFjaygpIHtcbiAgICAgICAgZm9yIChjb25zdCBpbWFnZSBpbiB0aGlzLmltYWdlTGlzdCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaW1hZ2VMaXN0W2ltYWdlXS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3RbaW1hZ2VdLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMuYmFjaygpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHb2VzIHRvIEltYWdlIHNsaWRlIHBhZ2Ugd2hlbiB1c2VyIGRvZXMgZG91YmxlIHRhcCBvbiBpbWFnZSBhbmQgYWxzbyBuYXZpZ2F0ZXMgd2l0aFxuICAgICAqIHRyYW5zZm9ybWVkIGltYWdlIFVSSSBhbmQgaW5kZXggb2YgaXQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gaW1nVVJJUGFyYW0gVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBVUklcbiAgICAgKiBAcGFyYW0gaW1nSW5kZXhQYXJhbSAgaW1hZ2UgaW5kZXhcbiAgICAgKi9cbiAgICBnb0ltYWdlU2xpZGUoaW1nVVJJUGFyYW0sIGltZ0luZGV4UGFyYW0pIHtcbiAgICAgICAgY29uc3QgbmF2aWdhdGlvbkV4dHJhczogTmF2aWdhdGlvbkV4dHJhcyA9IHtcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgaW1nVVJJOiBpbWdVUklQYXJhbSxcbiAgICAgICAgICAgICAgICBpbWdJbmRleDogaW1nSW5kZXhQYXJhbSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFsnaW1hZ2VzbGlkZSddLCBuYXZpZ2F0aW9uRXh0cmFzKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ2hlY2tzIHdoZXRoZXIgdGhlIGNoZWNrQm94IGlzIGJlZW4gc2VsZWN0ZWQgb3Igbm90LiBJZiBpdCBpcyBzZWxlY3RlZCxcbiAgICAgKiB0aGUgZGVsZXRlL3NoYXJlIG1lbnVzIGFyZSB2aXNpYmxlLCBvdGhlcndpc2UgdGhleSBhcmUgbm90IHZpc2libGUuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgc2FtZSB2YWx1ZSBpbiB0aGUgaW1hZ2UgbGlzdC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudCBDaGVja2JveCBldmVudCBkYXRhXG4gICAgICogQHBhcmFtIGltYWdlUGF0aCB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gaW5kZXggaW1hZ2UgaW5kZXggaW4gdGhlIGxpc3RcbiAgICAgKi9cbiAgICBpc0NoZWNrZWQoZXZlbnQsIGltYWdlUGF0aCwgaW5kZXgpIHtcbiAgICAgICAgaWYgKGV2ZW50LnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudC0tO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBzaG93IGRpYWxvZyB3aW5kb3cgd2l0aCBvcHRpb25zICdTZWxlY3QgQWxsJyAmICdVbnNlbGVjdCBBbGwnIHdoZW5cbiAgICAgKiB0aGVyZSBpcyBwYXJ0aWFsIHNlbGVjdGlvbiBieSB1c2VyLCB3aGVyZSB1c2VyIGhhdmUgdG8gc2VsZWN0IG9uZSBvZiB0aGUgb3B0aW9uc1xuICAgICAqIGlmIG5lZWRlZCwgb3RoZXJ3aXNlIGNhbiBiZSBjYW5jZWxsZWQuXG4gICAgICogSWYgdGhlcmUgaXMgbm8gcGFydGlhbCBzZWxlY3Rpb24sIHRoZW4gdGhpcyB3aWxsIHNlbGVjdCBhbGwvdW5zZWxlY3QgYWxsIGJhc2VkIG9uXG4gICAgICogdGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGNoZWNrYm94LlxuICAgICAqL1xuICAgIG9uU2VsZWN0VW5TZWxlY3RBbGxDaGVja0JveCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRDb3VudCAhPT0gdGhpcy5pbWFnZUxpc3QubGVuZ3RoICYmIHRoaXMuc2VsZWN0ZWRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGRpYWxvZ3MuYWN0aW9uKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnUGF0aWFsbHkgc2VsZWN0ZWQuIERvIHlvdSB3YW50IHRvIHBlcmZvcm0gb25lIG9mIHRoZSBiZWxvdz8nLFxuICAgICAgICAgICAgICAgIGNhbmNlbEJ1dHRvblRleHQ6ICdDYW5jZWwnLFxuICAgICAgICAgICAgICAgIGFjdGlvbnM6IFsnU2VsZWN0IEFsbCcsICdVbnNlbGVjdCBBbGwnXSxcbiAgICAgICAgICAgIH0pLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgPT09ICdTZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVzdWx0ID09PSAnVW5zZWxlY3QgQWxsJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJmb3JtU2VsZWN0VW5zZWxlY3RBbGwodGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RVbnNlbGVjdEFsbCA9ICh0aGlzLnNlbGVjdGVkQ291bnQgPT09IHRoaXMuaW1hZ2VMaXN0Lmxlbmd0aCkgPyBmYWxzZSA6IHRydWU7XG4gICAgICAgICAgICB0aGlzLnBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh0aGlzLmlzU2VsZWN0VW5zZWxlY3RBbGwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGZpcmVzIHdoZW4gdXNlciBjaG9vc2UgdGhlIG1lbnUgJ1NvcnRCeURhdGUnLHdoZXJlIHNvcnRzIHRoZSBpbWFnZSBsaXN0XG4gICAgICogYnkgZGF0ZSBpdCBjcmVhdGVkIGFuZCBhbHNvIHNldHMgdGhlIG1lbnVzICdkZWxldGUnLydzaGFyZScgaW52aXNpYmxlLlxuICAgICAqL1xuICAgIG9uU29ydEJ5RGF0ZSgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50ID0gMDtcbiAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNTaGFyaW5nID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGNsb25lZEltYWdlTGlzdCA9IE9iamVjdC5hc3NpZ24oW10sIHRoaXMuaW1hZ2VMaXN0KTtcblxuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IChjbG9uZWRJbWFnZUxpc3QubGVuZ3RoIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QucHVzaChuZXcgVHJhbnNmb3JtZWRJbWFnZShcbiAgICAgICAgICAgICAgICBjbG9uZWRJbWFnZUxpc3RbaV0uZmlsZU5hbWUsXG4gICAgICAgICAgICAgICAgY2xvbmVkSW1hZ2VMaXN0W2ldLmZpbGVQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS50aHVtYm5haWxQYXRoLFxuICAgICAgICAgICAgICAgIGNsb25lZEltYWdlTGlzdFtpXS5pc1NlbGVjdGVkLFxuICAgICAgICAgICAgKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hhcmVzIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlIHNoYXJlIGJ1dHRvbi4gVGhlIHNoYXJpbmcgY2FuIGJlIGRvbmVcbiAgICAgKiB2aWEgYW55IG9uZSBvZiB0aGUgbWVkaWFzIHN1cHBvcnRlZCBieSBhbmRyb2lkIGRldmljZSBieSBkZWZhdWx0LiBUaGUgbGlzdCBvZiBzdXBwb3J0ZWRcbiAgICAgKiBtZWRpYXMgd2lsbCBiZSB2aXNpYmxlIHdoZW4gdGhlIHNoYXJlIGJ1dHRvbiBjbGlja2VkLlxuICAgICAqL1xuICAgIG9uU2hhcmUoKSB7XG4gICAgICAgIGNvbnN0IGRhdGFUb1NoYXJlOiBhbnkgPSB7fTtcbiAgICAgICAgbGV0IGRhdGFDb3VudCA9IDA7XG4gICAgICAgIGNvbnN0IGRvY3VtZW50cyA9IGZzLmtub3duRm9sZGVycy5kb2N1bWVudHMoKTtcblxuICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnID0gaW1hZ2UuZmlsZU5hbWUucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgIC8vIGxldCBmaWxlTmFtZSA9IGltYWdlLmZpbGVOYW1lO1xuICAgICAgICAgICAgICAgIGxldCBpbWdGaWxlcGF0aCA9IGZzLnBhdGguam9pbihkb2N1bWVudHMucGF0aCwgJ2NhcHR1cmVkaW1hZ2VzJywgdHJhbnNmb3JtZWRJbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgLy8gbGV0IGZpbGUgPSBmcy5GaWxlLmZyb21QYXRoKHBhdGgpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVkVUlJbWFnZSA9IFVJSW1hZ2UuaW1hZ2VOYW1lZChpbWdGaWxlcGF0aCk7XG4gICAgICAgICAgICAgICAgZGF0YVRvU2hhcmVbZGF0YUNvdW50KytdID0gdHJhbnNmb3JtZWRVSUltYWdlO1xuICAgICAgICAgICAgICAgIC8vIEdldHRpbmcgb3JpZ2luYWwgY2FwdHVyZWQgaW1hZ2VcbiAgICAgICAgICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSB0cmFuc2Zvcm1lZEltZ0ZpbGVOYW1lT3JnLnJlcGxhY2UoJ1BUX0lNRycsICdJTUcnKTtcbiAgICAgICAgICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgICAgICAgICAgICAgaW1nRmlsZXBhdGggPSBmcy5wYXRoLmpvaW4oZG9jdW1lbnRzLnBhdGgsICdjYXB0dXJlZGltYWdlcycsIGltZ0ZpbGVOYW1lT3JnKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lZFVJSW1hZ2VPcmcgPSBVSUltYWdlLmltYWdlTmFtZWQoaW1nRmlsZXBhdGgpO1xuICAgICAgICAgICAgICAgIGRhdGFUb1NoYXJlW2RhdGFDb3VudCsrXSA9IHRyYW5zZm9ybWVkVUlJbWFnZU9yZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5zaGFyZShkYXRhVG9TaGFyZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuICcgKyBtb2R1bGUuZmlsZW5hbWUgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlKHMpIHdoZW4gdXNlciBjbGlja3MgdGhlICdkZWxldGUnIGJ1dHRvbiBpbiBtZW51LlxuICAgICAqIFRoaXMgd2lsbCBzaG93IHVwIGEgZGlhbG9nIHdpbmRvdyBmb3IgY29uZmlybWF0aW9uIGZvciB0aGUgc2VsZWN0ZWQgaW1hZ2UocylcbiAgICAgKiB0byBiZSBkZWxldGVkLiBJZiB1c2VyIHNheXMgJ09rJywgdGhlbiB0aG9zZSBpbWFnZShzKSB3aWxsIGJlIHJlbW92ZWQgZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UsIG90aGVyd2lzZSBjYW4gYmUgY2FuY2VsbGVkLlxuICAgICAqL1xuICAgIG9uRGVsZXRlKCkge1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZENvdW50ID4gMCkge1xuICAgICAgICAgICAgZGlhbG9ncy5jb25maXJtKHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0RlbGV0ZScsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ0RlbGV0aW5nIHNlbGVjdGVkIGl0ZW0ocyk/JyxcbiAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6ICdPaycsXG4gICAgICAgICAgICAgICAgY2FuY2VsQnV0dG9uVGV4dDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB9KS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5mb3JFYWNoKChpbWFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBmaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS5maWxlUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nSWR4ID0gdGhpcy5pbWFnZUxpc3QuaW5kZXhPZihpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWdJZHggPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3Quc3BsaWNlKGltZ0lkeCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VMb2FkZWQodGhpcy5wYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXMuJyArIGVycm9yKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBkZWxldGluZyB0aHVtYm5haWwgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzJykuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIGltYWdlcy4gJyArIG1vZHVsZS5maWxlbmFtZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdTZWxlY3RlZCBpbWFnZXMgZGVsZXRlZC4nKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogU2V0cyBhbGwgdGhlIGNoZWNrQm94IGNoZWNrZWQgdmFsdWUgYmFzZWQgb24gd2hhdCBpdCByZWNlaXZlcyB2YWx1ZSBhcyBwYXJhbWV0ZXIuXG4gICAgICogQW5kIGFsc28gc2V0cyB0aGUgY2hlY2tCb3gncyBwYWdlIHByb3BlcnR5IHZhbHVlIGJhc2VkIG9uIHRoZSBjdXJyZW50IHZsYXVlIGxpa2VcbiAgICAgKiBpZiBhbHJlYWR5IGhhcyB0cnVlLCB0aGVuIHNldHMgZmFsc2UsIG90aGVyd2lzZSBpdCBzZXRzIHRydWUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmFsdWUgQ2hlY2tib3ggdmFsdWVcbiAgICAgKi9cbiAgICBwcml2YXRlIHBlcmZvcm1TZWxlY3RVbnNlbGVjdEFsbCh2YWx1ZTogYW55KSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5pbWFnZUxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNoZWNrQm94ID0gdGhpcy5wYWdlLmdldFZpZXdCeUlkKCdjaGVja2JveC0nICsgaSkgYXMgQ2hlY2tCb3g7XG4gICAgICAgICAgICBjaGVja0JveC5jaGVja2VkID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pc1NlbGVjdFVuc2VsZWN0QWxsID0gIXZhbHVlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aHVtYm5haWwgaW1hZ2VzIHVzaW5nIGNvbnRlbnQgcmVzb2x2ZXIgYnkgb3JkZXIgd2hhdCBpdCByZWNlaXZlcyBhcyBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gb3JkZXJCeUFzY0Rlc2NQYXJhbSBPcmRlckJ5IHZhbHVlICdBc2MnLydEZXNjJ1xuICAgICAqL1xuICAgIHByaXZhdGUgbG9hZFRodW1ibmFpbEltYWdlc0J5Q29udGVudFJlc29sdmVyKG9yZGVyQnlBc2NEZXNjUGFyYW06IHN0cmluZykge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5sb2FkVGh1bWJuYWlsSW1hZ2VzQnlDb250ZW50UmVzb2x2ZXIob3JkZXJCeUFzY0Rlc2NQYXJhbSwgdGhpcy5hY3Rpdml0eUxvYWRlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIExvYWRzIGFsbCB0aGUgdHJhbnNmb3JtZWQgdGh1bWJuYWlsIGltYWdlcyBmcm9tIHRoZSBmaWxlIHN5c3RlbSBhbmQgc3RvcmVzIGluIHRoZSBpbWFnZSBsaXN0IGZvclxuICAgICAqIHB1YmxpYyBhY2Nlc3MuIFRoZSBmaWxlIHN5c3RlbSBuZWVkcyBSRUFEX0VYVEVSTkFMX1NUT1JBR0UgcGVybWlzc2lvbi5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxvYWRUaHVtYm5haWxJbWFnZXNCeUZpbGVTeXN0ZW0oKSB7XG4gICAgICAgIC8vIGxldCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gJyc7XG4gICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdCA9IFtdO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gY2FwdHVyZWRQaWN0dXJlUGF0aCA9IGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkuZ2V0QWJzb2x1dGVQYXRoKCkgKyAnL0RDSU0nO1xuICAgICAgICAgICAgY29uc3QgZm9sZGVyOiBGb2xkZXIgPSBrbm93bkZvbGRlcnMuY3VycmVudEFwcCgpIGFzIEZvbGRlcjtcbiAgICAgICAgICAgIC8vIGNvbnN0IGZvbGRlckRlc3QgPSBrbm93bkZvbGRlcnMuZG9jdW1lbnRzKCk7XG4gICAgICAgICAgICAvLyBjb25zdCBmaWxlTmFtZSA9ICdjYXB0dXJlZGltYWdlcy9JTUdfJyArIERhdGUubm93KCkgKyAnLmpwZyc7XG4gICAgICAgICAgICAvLyBjb25zdCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gcGF0aC5qb2luKGZvbGRlci5wYXRoLCAnY2FwdHVyZWRpbWFnZXMnKTtcblxuICAgICAgICAgICAgY29uc3QgZm9sZGVyMCA9IGZzLnBhdGguam9pbihmcy5rbm93bkZvbGRlcnMuZG9jdW1lbnRzKCkucGF0aCwgJ2NhcHR1cmVkaW1hZ2VzJywgJ3RodW1ibmFpbHMnKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbGRlcnMwID0gZnMuRm9sZGVyLmZyb21QYXRoKGZvbGRlcjApO1xuICAgICAgICAgICAgZm9sZGVyczAuZ2V0RW50aXRpZXMoKVxuICAgICAgICAgICAgICAgIC50aGVuKChlbnRpdGllcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBlbnRpdGllcyBpcyBhcnJheSB3aXRoIHRoZSBkb2N1bWVudCdzIGZpbGVzIGFuZCBmb2xkZXJzLlxuICAgICAgICAgICAgICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIChlbnRpdHkubmFtZS5zdGFydHNXaXRoKCd0aHVtYl9QVF9JTUcnKSAmJiBlbnRpdHkubmFtZS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdGh1bW5haWxPcmdQYXRoID0gZW50aXR5LnBhdGgucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoID0gdGh1bW5haWxPcmdQYXRoLnJlcGxhY2UoJ3RodW1ibmFpbHMvJywgJycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5Lm5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGh1bW5haWxPcmdQYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBGYWlsZWQgdG8gb2J0YWluIGZvbGRlcidzIGNvbnRlbnRzLlxuICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZXMuJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2VzLiAnICsgbW9kdWxlLmZpbGVuYW1lICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4nICsgZXJyb3IudG9TdHJpbmcoKSkuc2hvdygpO1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGdldHRpbmcgcGF0aC4gJyArIG1vZHVsZS5maWxlbmFtZSArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=