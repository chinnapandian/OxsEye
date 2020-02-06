"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var file_system_1 = require("tns-core-modules/file-system");
var router_2 = require("nativescript-angular/router");
var activityloader_common_1 = require("../activityloader/activityloader.common");
var transformedimage_common_1 = require("../providers/transformedimage.common");
// import { L } from 'nativescript-i18n/angular';
var nativescript_localize_1 = require("nativescript-localize");
// @ts-ignore
var oxseyelogger_1 = require("../logger/oxseyelogger");
// @ts-ignore
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var application = require("tns-core-modules/application");
var dialogs = require("tns-core-modules/ui/dialogs");
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
var platform = require("tns-core-modules/platform");
/**
 * ImageGalleryComponent class is being used to display all the thumbnail
 * images of transformed images in gallery view.
 */
var ImageGalleryComponent = /** @class */ (function () {
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
        /** Sets hieght for the image gallery view */
        this.listHeight = 0;
        var todayDt = new Date();
        var dtFormatter = new java.text.SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        var day = todayDt.getDate() + '';
        if (todayDt.getDate() < 10) {
            day = '0' + day;
        }
        var month = (todayDt.getMonth() + 1) + '';
        if ((todayDt.getMonth() + 1) < 10) {
            month = '0' + month;
        }
        this.today = (day + '-' + (month) + '-' + todayDt.getFullYear());
        todayDt.setDate(todayDt.getDate() - 1);
        day = todayDt.getDate() + '';
        if (todayDt.getDate() < 10) {
            day = '0' + day;
        }
        month = (todayDt.getMonth() + 1) + '';
        if ((todayDt.getMonth() + 1) < 10) {
            month = '0' + month;
        }
        this.yesterday = (day + '-' + (month) + '-' + todayDt.getFullYear());
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
        this.isPopUpMenu = true;
        this.isSortByDateMenu = true;
        this.isSelectUnselectAll = false;
        this.isCheckedAll = false;
        // this.loadThumbnailImages();
        this.orderByAscDesc = ' DESC';
        this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
        this.listHeight = platform.screen.mainScreen.heightDIPs - 125;
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
    ImageGalleryComponent.prototype.setCheckboxVisible = function (isChecked, index) {
        this.isCheckBoxVisible = !this.isCheckBoxVisible;
        if (!this.isCheckBoxVisible) {
            for (var image in this.imageList) {
                if (this.imageList[image].isSelected) {
                    this.imageList[image].isSelected = false;
                }
            }
            this.selectedCount = 0;
        }
        else {
            this.btnChecked(isChecked, index);
        }
        // this.isPopUpMenu = true;
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
        // this.page.bindingContext = new GalleryViewModel(this.imageList);
        // let searchObj = this.page.getViewById('searchId');
        //  searchObj.on(Observable.propertyChangeEvent, (propertyChangeData: PropertyChangeData) => {
        //     if (propertyChangeData.propertyName == "searchPhrase") {
        //         console.log('Search option working...');
        //         // this._refilter();
        //     }
        // });
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
    ImageGalleryComponent.prototype.selectImage = function (isChecked, index) {
        if (this.isCheckBoxVisible) {
            this.btnChecked(isChecked, index);
        }
    };
    ImageGalleryComponent.prototype.btnChecked = function (isChecked, index) {
        if (!isChecked) {
            this.selectedCount++;
            // this.isBtnChecked = true;
            // event.object.page.getViewById('checkbox-yes-' + index).visibility = 'visible';
            // event.object.page.getViewById('checkbox-no-' + index).visibility = 'collapsed';
            // event.object.text = "&#xf14a;";
        }
        else {
            this.selectedCount--;
            // this.isBtnChecked = false;
            // event.object.page.getViewById('checkbox-yes-' + index).visibility = 'collapsed';
            // event.object.page.getViewById('checkbox-no-' + index).visibility = 'visible';
            // event.object.text = "&#xf0c8;";
        }
        this.isCheckedAll = false;
        if (this.selectedCount > 0 && this.selectedCount == this.imageList.length) {
            this.isCheckedAll = true;
        }
        // if (this.selectedCount > 0) {
        //     this.isDeleting = true;
        //     this.isSharing = true;
        // } else {
        //     this.isDeleting = false;
        //     this.isSharing = false;
        // }
        this.imageList[index].isSelected = !isChecked;
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
                message: nativescript_localize_1.localize('dialog_message'),
                cancelButtonText: nativescript_localize_1.localize('dialog_cancel_btn_text'),
                actions: [nativescript_localize_1.localize('dialog_action_select_all'), nativescript_localize_1.localize('dialog_action_unselect_all')],
            }).then(function (result) {
                if (result === nativescript_localize_1.localize('dialog_action_select_all')) {
                    _this.isSelectUnselectAll = true;
                    _this.performSelectUnselectAll(_this.isSelectUnselectAll);
                }
                else if (result === nativescript_localize_1.localize('dialog_action_unselect_all')) {
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
    // /**
    //  * This method fires when user choose the menu 'SortByDate',where sorts the image list
    //  * by date it created and also sets the menus 'delete'/'share' invisible.
    //  */
    // onSortByDate() {
    //     this.selectedCount = 0;
    //     this.isDeleting = false;
    //     this.isSharing = false;
    //     const clonedImageList = Object.assign([], this.imageList);
    //     this.transformedImageProvider.imageList = [];
    //     for (let i = (clonedImageList.length - 1); i >= 0; i--) {
    //         this.transformedImageProvider.imageList.push(new TransformedImage(
    //             clonedImageList[i].fileName,
    //             clonedImageList[i].filePath,
    //             clonedImageList[i].thumbnailPath,
    //             clonedImageList[i].isSelected,
    //             clonedImageList[i].date,
    //             clonedImageList[i].displayStyle
    //         ));
    //     }
    // }
    /**
     * Shares selected image(s) when user clicks the share button. The sharing can be done
     * via any one of the medias supported by android device by default. The list of supported
     * medias will be visible when the share button clicked.
     */
    ImageGalleryComponent.prototype.onShare = function () {
        var _this = this;
        if (this.selectedCount > 0) {
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
                            // const uri = newFile.toURI().toString();
                            uris_1.add(uri);
                            uris_1.add(_this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                            //       uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                            if (_this.transformedImageProvider.isLogEnabled) {
                                var logFileName = image.fileName.replace('thumb_PT_IMG', 'LogcatPT_IMG');
                                logFileName = logFileName.substring(0, logFileName.indexOf('_transformed')) + '.txt';
                                var logFilePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/oelog', '.');
                                var logFile = new java.io.File(logFilePath, logFileName);
                                var logFileUri = _this.transformedImageProvider.getURIForFile(logFile);
                                uris_1.add(logFileUri);
                            }
                        }
                    });
                    if (uris_1.size() > 0) {
                        var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                        intent.setType('*/*');
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
                    Toast.makeText(nativescript_localize_1.localize('error_while_sharing_images') + error).show();
                    _this.logger.error('Error while sharing images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
                }
            }).catch(function (error) {
                Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission') + error).show();
                _this.logger.error('Error in giving permission. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
        }
        else {
            Toast.makeText(nativescript_localize_1.localize('no_image_selected'), 'long').show();
        }
    };
    // onShareCurrent(index) {
    //     this.imageList[index].isSelected = true;
    //     this.selectedCount++;
    //     this.onShare();
    // }
    // onDeleteCurrent(index) {
    //     if (!this.imageList[index].isSelected) {
    //         this.imageList[index].isSelected = true;
    //         this.selectedCount++;
    //     }
    //     this.onDelete();
    // }
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
                title: nativescript_localize_1.localize('delete'),
                message: nativescript_localize_1.localize('deleting_selected_item'),
                okButtonText: nativescript_localize_1.localize('ok'),
                cancelButtonText: nativescript_localize_1.localize('cancel'),
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
                                        if (_this.imageList.length > 0) {
                                            // let bnrIdx = 0;
                                            if (_this.imageList[imgIdx].displayStyle === 'banner') {
                                                if (_this.imageList.length > 1) {
                                                    _this.imageList[imgIdx + 1].displayStyle = 'banner';
                                                }
                                            }
                                        }
                                        _this.imageList.splice(imgIdx, 1);
                                    }
                                    if (_this.imageList.length > 0) {
                                        _this.onPageLoaded(_this.page);
                                    }
                                    else {
                                        _this.routerExtensions.back();
                                    }
                                }).catch(function (error) {
                                    Toast.makeText(nativescript_localize_1.localize('error_while_deleting_thumbnail_images') + error).show();
                                    _this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                        + _this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                            }).catch(function (error) {
                                Toast.makeText(nativescript_localize_1.localize('error_while_deleting_images')).show();
                                _this.logger.error('Error while deleting images.. ' + module.filename
                                    + _this.logger.ERROR_MSG_SEPARATOR + error);
                            });
                        }
                    });
                    Toast.makeText(nativescript_localize_1.localize('selected_images_deleted')).show();
                }
            });
        }
        else {
            Toast.makeText(nativescript_localize_1.localize('no_image_selected'), 'long').show();
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
            // const checkBox = this.page.getViewById('checkbox-' + i) as CheckBox;
            // checkBox.checked = value;
            this.imageList[i].isSelected = value;
        }
        if (value) {
            this.selectedCount = this.imageList.length;
        }
        else {
            this.selectedCount = 0;
        }
        this.isCheckedAll = value;
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
                Toast.makeText(nativescript_localize_1.localize('error_while_getting_path') + error.toString()).show();
                _this.logger.error('Error while getting path.. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            }
            var folders = file_system_1.Folder.fromPath(capturedPicturePath);
            folders.getEntities()
                .then(function (entities) {
                // entities is array with the document's files and folders.
                entities.forEach(function (entity) {
                    if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith('.png')) {
                        var thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                        _this.transformedImageProvider.imageList.push(new transformedimage_common_1.TransformedImage(entity.name, thumnailOrgPath, entity.path, false, '01-01-2000', 'image'));
                    }
                });
            }).catch(function (error) {
                // Failed to obtain folder's contents.
                Toast.makeText(nativescript_localize_1.localize('error_while_loading_images') + error, 'long').show();
                _this.logger.error('Error while loading images. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
            });
            _this.activityLoader.hide();
        }).catch(function (error) {
            Toast.makeText(nativescript_localize_1.localize('error_while_giving_permission') + error, 'long').show();
            _this.logger.error('Error in giving permission. ' + module.filename + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    ImageGalleryComponent.prototype.getDate = function (date) {
        if (date === this.today) {
            return 'Today';
        }
        if (date === this.yesterday) {
            return 'Yesterday';
        }
        return date;
    };
    ImageGalleryComponent.prototype.templateSelector = function (item) {
        // let dtString = 'banner';
        // console.log(this.today);
        // const todayDate = new Date();
        // const dateToday = (todayDate.getDate() + '-' + ((todayDate.getMonth() + 1)) + '-' + todayDate.getFullYear());
        // if (dateToday == item.date) {
        //     dtString = 'today';
        // }
        // return dtString;
        return item.displayStyle;
    };
    var _a, _b;
    ImageGalleryComponent = __decorate([
        core_1.Component({
            selector: 'ns-imagegallery',
            moduleId: module.id,
            styleUrls: ['./imagegallery.component.css'],
            templateUrl: './imagegallery.component.html',
        }),
        __metadata("design:paramtypes", [router_2.RouterExtensions,
            router_1.Router, typeof (_a = typeof transformedimage_provider_1.TransformedImageProvider !== "undefined" && transformedimage_provider_1.TransformedImageProvider) === "function" ? _a : Object, activityloader_common_1.ActivityLoader, typeof (_b = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" ? _b : Object])
    ], ImageGalleryComponent);
    return ImageGalleryComponent;
}());
exports.ImageGalleryComponent = ImageGalleryComponent;
