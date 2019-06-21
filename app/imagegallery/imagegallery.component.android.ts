import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { File, Folder } from 'tns-core-modules/file-system';
import { Page } from 'tns-core-modules/ui/page';

import { RouterExtensions } from 'nativescript-angular/router';

import { CheckBox } from 'nativescript-checkbox';

import { ActivityLoader } from '../activityloader/activityloader.common';
import { TransformedImage } from '../providers/transformedimage.common';

import { L } from 'nativescript-i18n/angular';
import { OxsEyeLogger } from '../logger/oxseyelogger';

import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import * as Permissions from 'nativescript-permissions';
import * as Toast from 'nativescript-toast';

/**
 * ImageGalleryComponent class is being used to display all the thumbnail
 * images of transformed images in gallery view.
 */
@Component({
    selector: 'ns-imagegallery',
    moduleId: module.id,
    styleUrls: ['./imagegallery.component.css'],
    templateUrl: './imagegallery.component.android.html',
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
    constructor(
        private routerExtensions: RouterExtensions,
        private router: Router,
        private transformedImageProvider: TransformedImageProvider,
        private activityLoader: ActivityLoader,
        private logger: OxsEyeLogger,
        private locale: L) {
        // this.selectUnselectAllLable = this.locale.transform('select_unselect_all');
        // this.sortByDateLable = this.locale.transform('sort_by_date');
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
        this.isPopUpMenu = false;
        this.isSortByDateMenu = true;
        this.isSelectUnselectAll = true;
        // this.loadThumbnailImages();
        this.orderByAscDesc = ' DESC';
        this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
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
    setCheckboxVisible() {
        this.isCheckBoxVisible = true;
        this.isPopUpMenu = true;
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
                message: this.locale.transform('dialog_message'),
                cancelButtonText: this.locale.transform('dialog_cancel_btn_text'),
                actions: [this.locale.transform('dialog_action_select_all'), this.locale.transform('dialog_action_unselect_all')],
            }).then((result) => {
                if (result === this.locale.transform('dialog_action_select_all')) {
                    this.isSelectUnselectAll = true;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                } else if (result === this.locale.transform('dialog_action_unselect_all')) {
                    this.isSelectUnselectAll = false;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                }
            });
        } else {
            this.isSelectUnselectAll = (this.selectedCount === this.imageList.length) ? false : true;
            this.performSelectUnselectAll(this.isSelectUnselectAll);
        }
    }
    /**
     * This method fires when user choose the menu 'SortByDate',where sorts the image list
     * by date it created and also sets the menus 'delete'/'share' invisible.
     */
    onSortByDate() {
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        const clonedImageList = Object.assign([], this.imageList);

        this.transformedImageProvider.imageList = [];
        for (let i = (clonedImageList.length - 1); i >= 0; i--) {
            this.transformedImageProvider.imageList.push(new TransformedImage(
                clonedImageList[i].fileName,
                clonedImageList[i].filePath,
                clonedImageList[i].thumbnailPath,
                clonedImageList[i].isSelected,
            ));
        }
    }
    /**
     * Shares selected image(s) when user clicks the share button. The sharing can be done
     * via any one of the medias supported by android device by default. The list of supported
     * medias will be visible when the share button clicked.
     */
    onShare() {
        Permissions.requestPermission(
            [android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
            android.Manifest.permission.INTERNET],
            'Needed for sharing files').then(() => {
                try {
                    const uris = new java.util.ArrayList<android.net.Uri>();
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
                            uris.add(uri);
                            uris.add(this.transformedImageProvider.getOriginalImage(imgFileNameOrg));
                            uris.add(this.transformedImageProvider.getOriginalImageWithRectangle(imgFileNameOrg));
                        }
                    });
                    if (uris.size() > 0) {
                        const intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                        intent.setType('image/jpeg');
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
                    Toast.makeText(this.locale.transform('error_while_sharing_images') + error).show();
                    this.logger.error('Error while sharing images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                }
            }).catch((error) => {
                Toast.makeText(this.locale.transform('error_while_giving_permission') + error).show();
                this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
    /**
     * Deletes the selected image(s) when user clicks the 'delete' button in menu.
     * This will show up a dialog window for confirmation for the selected image(s)
     * to be deleted. If user says 'Ok', then those image(s) will be removed from the
     * device, otherwise can be cancelled.
     */
    onDelete() {
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: this.locale.transform('delete'),
                message: this.locale.transform('deleting_selected_item'),
                okButtonText: this.locale.transform('ok'),
                cancelButtonText: this.locale.transform('cancel'),
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
                                                this.imageList.splice(imgIdx, 1);
                                            }
                                            this.onPageLoaded(this.page);
                                        }).catch((error) => {
                                            Toast.makeText(this.locale.transform('error_while_deleting_thumbnail_images') + error).show();
                                            this.logger.error('Error while deleting thumbnail images. ' + module.filename
                                                + this.logger.ERROR_MSG_SEPARATOR + error);
                                        });

                                }).catch((error) => {
                                    Toast.makeText(this.locale.transform('error_while_deleting_images')).show();
                                    this.logger.error('Error while deleting images. ' + module.filename
                                        + this.logger.ERROR_MSG_SEPARATOR + error);
                                });
                        }

                    });
                    Toast.makeText(this.locale.transform('selected_images_deleted')).show();
                }
            });
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
            const checkBox = this.page.getViewById('checkbox-' + i) as CheckBox;
            checkBox.checked = value;
        }
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
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader);
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
                    Toast.makeText(this.locale.transform('error_while_getting_path') + error.toString()).show();
                    this.logger.error('Error while getting path. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
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
                                ));
                            }
                        });
                    }).catch((error) => {
                        // Failed to obtain folder's contents.
                        Toast.makeText(this.locale.transform('error_while_loading_images') + error, 'long').show();
                        this.logger.error('Error while loading images. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
                    });
                this.activityLoader.hide();
            }).catch((error) => {
                Toast.makeText(this.locale.transform('error_while_giving_permission') + error, 'long').show();
                this.logger.error('Error in giving permission. ' + module.filename + this.logger.ERROR_MSG_SEPARATOR + error);
            });
    }
}
