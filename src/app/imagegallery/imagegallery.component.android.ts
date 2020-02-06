import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { File, Folder } from 'tns-core-modules/file-system';
import { Page } from 'tns-core-modules/ui/page';

import { RouterExtensions } from 'nativescript-angular/router';

// import { CheckBox } from 'nativescript-checkbox';
import { CheckBox } from '@nstudio/nativescript-checkbox';

import { ActivityLoader } from '../activityloader/activityloader.common';
import { TransformedImage } from '../providers/transformedimage.common';

// import { L } from 'nativescript-i18n/angular';
import { localize } from 'nativescript-localize';
// @ts-ignore
import { OxsEyeLogger } from '../logger/oxseyelogger';
// @ts-ignore
import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import * as Permissions from 'nativescript-permissions';
import * as Toast from 'nativescript-toast';
import * as platform from 'tns-core-modules/platform';

/** global variable declaration to avoid compilation error */
declare var android: any;
/** global variable declaration to avoid compilation error */
declare var java: any;

/**
 * ImageGalleryComponent class is being used to display all the thumbnail
 * images of transformed images in gallery view.
 */
@Component({
    selector: 'ns-imagegallery',
    moduleId: module.id,
    styleUrls: ['./imagegallery.component.css'],
    templateUrl: './imagegallery.component.html',
})
export class ImageGalleryComponent implements OnInit {
    /** Boolean value to make the sharing menu visible or not. */
    public isSharing: boolean;
    /** Boolean value to make the deleting menu visible or not. */
    public isDeleting: boolean;
    /** Boolean value to make the popup menu visible or not. */
    public isPopUpMenu: boolean;
    /** Boolean value to make the SortByDate menu visible or not. */
    public isSortByDateMenu: boolean;
    /** Boolean value to make the checkbox visible or not. */
    public isCheckBoxVisible: boolean;
    /** Indicates checkbox selected count. */
    private selectedCount: number;
    /** Boolean value to make the Select/UnselectAll menu visible or not */
    private isSelectUnselectAll: boolean;
    /** Stores orderBy value 'Asc'/'Desc' */
    private orderByAscDesc: string;
    /** Stores page referrence. */
    private page;
    /** Sets hieght for the image gallery view */
    private listHeight = 0;
    /** To store image date */
    // private today: any;
    /** To store today's date */
    private today: any;
    /** To store yesterday's date */
    private yesterday: any;

    // private isBtnChecked: boolean;
    private isCheckedAll: boolean;

    // @ObservableProperty() searchPhrase: string;
    private searchPhrase: string;

    /**
     * Constructor for ImageGalleryComponent.
     *
     * @param routerExtensions Router extension instance
     * @param router Router instance
     * @param transformedImageProvider Transformed image provider instance
     * @param activityLoader Activity loader instance
     */
    constructor(
        private routerExtensions: RouterExtensions,
        private router: Router,
        private transformedImageProvider: TransformedImageProvider,
        private activityLoader: ActivityLoader,
        private logger: OxsEyeLogger) {
        const todayDt = new Date();
        const dtFormatter = new java.text.SimpleDateFormat("dd-MM-yyyy HH:mm:ss");
        let day = todayDt.getDate() + '';
        if (todayDt.getDate() < 10) {
            day = '0' + day;
        }
        let month = (todayDt.getMonth() + 1) + '';
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
    ngOnInit(): void {
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
    }
    /**
     * Gets the stored transformed thumbnail image list.
     * @returns image list.
     */
    get imageList(): TransformedImage[] {
        return this.transformedImageProvider.imageList;
    }
    /**
     * Sets the checkbox and popup menu properties true for them to be visible.
     */
    setCheckboxVisible(isChecked, index) {
        this.isCheckBoxVisible = !this.isCheckBoxVisible;
        if (!this.isCheckBoxVisible) {
            for (const image in this.imageList) {
                if (this.imageList[image].isSelected) {
                    this.imageList[image].isSelected = false;
                }
            }
            this.selectedCount = 0;
        } else {
            this.btnChecked(isChecked, index);
        }
        // this.isPopUpMenu = true;
    }
    /**
     * This method fires when the gallery page is loaded and sets page and menu
     * properties value to true/false based on thumbnail image list count.
     *
     * @param args Page loaded event data
     */
    onPageLoaded(args) {
        this.page = (args !== this.page) ? args.object as Page : args;
        const selectedCountTemp = this.selectedCount;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = (this.imageList.length > 0) ? this.isPopUpMenu : false;
        this.isSortByDateMenu = (this.imageList.length > 0) ? true : false;
        for (const image in this.imageList) {
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
    }
    /**
     * Goes back to previous page (camera view) when the Back button is pressed.
     */
    goBack() {
        for (const image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.imageList[image].isSelected = false;
            }
        }
        this.routerExtensions.back();
    }
    /**
     * Goes to Image slide page when user does double tap on image and also navigates with
     * transformed image URI and index of it.
     *
     * @param imgURIParam Transformed image file URI
     * @param imgIndexParam  image index
     */
    goImageSlide(imgURIParam, imgIndexParam) {
        const navigationExtras: NavigationExtras = {
            queryParams: {
                imgURI: imgURIParam,
                imgIndex: imgIndexParam,
            },
        };
        this.router.navigate(['imageslide'], navigationExtras);
    }
    /**
     * Checks whether the checkBox is been selected or not. If it is selected,
     * the delete/share menus are visible, otherwise they are not visible.
     * And also sets the same value in the image list.
     *
     * @param event Checkbox event data
     * @param imagePath transformed image file path
     * @param index image index in the list
     */
    isChecked(event, imagePath, index) {
        if (event.value) {
            this.selectedCount++;
        } else {
            this.selectedCount--;
        }
        if (this.selectedCount > 0) {
            this.isDeleting = true;
            this.isSharing = true;
        } else {
            this.isDeleting = false;
            this.isSharing = false;
        }
        this.imageList[index].isSelected = event.value;
    }

    selectImage(isChecked, index) {
        if (this.isCheckBoxVisible) {
            this.btnChecked(isChecked, index);
        }
    }
    btnChecked(isChecked, index) {
        if (!isChecked) {
            this.selectedCount++;
            // this.isBtnChecked = true;
            // event.object.page.getViewById('checkbox-yes-' + index).visibility = 'visible';
            // event.object.page.getViewById('checkbox-no-' + index).visibility = 'collapsed';
            // event.object.text = "&#xf14a;";
        } else {
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
    }
    /**
     * Method to show dialog window with options 'Select All' & 'Unselect All' when
     * there is partial selection by user, where user have to select one of the options
     * if needed, otherwise can be cancelled.
     * If there is no partial selection, then this will select all/unselect all based on
     * the current value of the checkbox.
     */
    onSelectUnSelectAllCheckBox() {
        if (this.selectedCount !== this.imageList.length && this.selectedCount > 0) {
            dialogs.action({
                message: localize('dialog_message'),
                cancelButtonText: localize('dialog_cancel_btn_text'),
                actions: [localize('dialog_action_select_all'), localize('dialog_action_unselect_all')],
            }).then((result) => {
                if (result === localize('dialog_action_select_all')) {
                    this.isSelectUnselectAll = true;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                } else if (result === localize('dialog_action_unselect_all')) {
                    this.isSelectUnselectAll = false;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                }
            });
        } else {
            this.isSelectUnselectAll = (this.selectedCount === this.imageList.length) ? false : true;
            this.performSelectUnselectAll(this.isSelectUnselectAll);
        }
    }
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
    onShare() {
        if (this.selectedCount > 0) {
            Permissions.requestPermission(
                [android.Manifest.permission.READ_EXTERNAL_STORAGE,
                android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                android.Manifest.permission.INTERNET],
                'Needed for sharing files').then(() => {
                    try {
                        const uris = new java.util.ArrayList();
                        const filesToBeAttached = '';
                        this.imageList.forEach((image) => {
                            if (image.isSelected) {
                                const imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', '.');
                                const imgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
                                const newFile = new java.io.File(imagePath, imgFileNameOrg);
                                // const uri = android.support.v4.content.FileProvider.getUriForFile(
                                //     application.android.context, 'oxs.eye.fileprovider', newFile);
                                // application.android.context.grantUriPermission(
                                //     'oxs.eye.fileprovider', uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                                const uri = this.transformedImageProvider.getURIForFile(newFile);
                                // const uri = newFile.toURI().toString();
                                uris.add(uri);
                                uris.add(this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                                //       uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                                if (this.transformedImageProvider.isLogEnabled) {
                                    let logFileName = image.fileName.replace('thumb_PT_IMG', 'LogcatPT_IMG');
                                    logFileName = logFileName.substring(0, logFileName.indexOf('_transformed')) + '.txt';
                                    const logFilePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/oelog', '.');
                                    const logFile = new java.io.File(logFilePath, logFileName);
                                    const logFileUri = this.transformedImageProvider.getURIForFile(logFile);
                                    uris.add(logFileUri);
                                }
                            }
                        });
                        if (uris.size() > 0) {
                            const intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                            intent.setType('*/*');
                            const message = 'Perspective correction pictures : ' + filesToBeAttached + '.';
                            intent.putExtra(android.content.Intent.EXTRA_SUBJECT, 'Perspective correction pictures...');
                            intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                            // let extra_text = new java.util.ArrayList<String>();
                            // extra_text.add('See attached transformed image files.');
                            intent.putExtra(android.content.Intent.EXTRA_TEXT, 'See attached transformed image files.');
                            intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                            intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                            application.android.foregroundActivity.startActivity(
                                android.content.Intent.createChooser(intent, 'Share images...'));
                        }
                    } catch (error) {
                        Toast.makeText(localize('error_while_sharing_images') + error).show();
                        this.logger.error('Error while sharing images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                    }
                }).catch((error) => {
                    Toast.makeText(localize('error_while_giving_permission') + error).show();
                    this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                });
        } else {
            Toast.makeText(localize('no_image_selected'), 'long').show();
        }
    }
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
    onDelete() {
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: localize('delete'),
                message: localize('deleting_selected_item'),
                okButtonText: localize('ok'),
                cancelButtonText: localize('cancel'),
            }).then((result) => {
                if (result) {
                    this.selectedCount = 0;
                    this.isDeleting = false;
                    this.isSharing = false;
                    this.imageList.forEach((image) => {
                        if (image.isSelected) {
                            const file: File = File.fromPath(image.filePath);
                            file.remove()
                                .then(() => {
                                    const thumbnailFile: File = File.fromPath(image.thumbnailPath);
                                    thumbnailFile.remove()
                                        .then(() => {
                                            SendBroadcastImage(image.thumbnailPath);
                                            const imgIdx = this.imageList.indexOf(image);
                                            if (imgIdx >= 0) {
                                                if (this.imageList.length > 0) {
                                                    // let bnrIdx = 0;
                                                    if (this.imageList[imgIdx].displayStyle === 'banner') {
                                                        if (this.imageList.length > 1) {
                                                            this.imageList[imgIdx + 1].displayStyle = 'banner';
                                                        }
                                                    }
                                                }
                                                this.imageList.splice(imgIdx, 1);
                                            }
                                            if (this.imageList.length > 0) {
                                                this.onPageLoaded(this.page);
                                            } else {
                                                this.routerExtensions.back();
                                            }
                                        }).catch((error) => {
                                            Toast.makeText(localize('error_while_deleting_thumbnail_images') + error).show();
                                            this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                                + this.logger.ERROR_MSG_SEPARATOR + error);
                                        });

                                }).catch((error) => {
                                    Toast.makeText(localize('error_while_deleting_images')).show();
                                    this.logger.error('Error while deleting images.. ' + module.filename
                                        + this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                        }

                    });
                    Toast.makeText(localize('selected_images_deleted')).show();
                }
            });
        } else {
            Toast.makeText(localize('no_image_selected'), 'long').show();
        }
    }
    /**
     * Sets all the checkBox checked value based on what it receives value as parameter.
     * And also sets the checkBox's page property value based on the current vlaue like
     * if already has true, then sets false, otherwise it sets true.
     *
     * @param value Checkbox value
     */
    private performSelectUnselectAll(value: any) {
        for (let i = 0; i < this.imageList.length; i++) {
            // const checkBox = this.page.getViewById('checkbox-' + i) as CheckBox;
            // checkBox.checked = value;
            this.imageList[i].isSelected = value;
        }
        if (value) {
            this.selectedCount = this.imageList.length;
        } else {
            this.selectedCount = 0;
        }
        this.isCheckedAll = value;
        this.isSelectUnselectAll = !value;
    }
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
    private loadThumbnailImagesByContentResolver(orderByAscDescParam: string) {
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader, null);
    }
    /**
     * Loads all the transformed thumbnail images from the file system and stores in the image list for
     * public access. The file system needs READ_EXTERNAL_STORAGE permission.
     */
    private loadThumbnailImagesByFileSystem() {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
            'Needed for sharing files')
            .then(() => {
                let capturedPicturePath = '';
                this.transformedImageProvider.imageList = [];
                try {
                    capturedPicturePath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
                } catch (error) {
                    Toast.makeText(localize('error_while_getting_path') + error.toString()).show();
                    this.logger.error('Error while getting path.. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                }
                const folders: Folder = Folder.fromPath(capturedPicturePath);
                folders.getEntities()
                    .then((entities) => {
                        // entities is array with the document's files and folders.
                        entities.forEach((entity) => {
                            if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith('.png')) {
                                const thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                                this.transformedImageProvider.imageList.push(new TransformedImage(
                                    entity.name,
                                    thumnailOrgPath,
                                    entity.path,
                                    false,
                                    '01-01-2000',
                                    'image'
                                ));
                            }
                        });
                    }).catch((error) => {
                        // Failed to obtain folder's contents.
                        Toast.makeText(localize('error_while_loading_images') + error, 'long').show();
                        this.logger.error('Error while loading images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                this.activityLoader.hide();
            }).catch((error) => {
                Toast.makeText(localize('error_while_giving_permission') + error, 'long').show();
                this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    private getDate(date: any): any {
        if (date === this.today) {
            return 'Today';
        }
        if (date === this.yesterday) {
            return 'Yesterday';
        }
        return date;
    }
    public templateSelector(item) {
        // let dtString = 'banner';
        // console.log(this.today);
        // const todayDate = new Date();
        // const dateToday = (todayDate.getDate() + '-' + ((todayDate.getMonth() + 1)) + '-' + todayDate.getFullYear());
        // if (dateToday == item.date) {
        //     dtString = 'today';
        // }
        // return dtString;
        return item.displayStyle;
    }
}
