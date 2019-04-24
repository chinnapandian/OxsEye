import {Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

import { File, Folder } from 'tns-core-modules/file-system';
import { Page } from 'tns-core-modules/ui/page';

import { RouterExtensions } from 'nativescript-angular/router';

import { CheckBox } from 'nativescript-checkbox';

import { ActivityLoader } from '../activityloader/activityloader.common';
import { TransformedImage } from '../providers/transformedimage.common';

import { SendBroadcastImage, TransformedImageProvider } from '../providers/transformedimage.provider';

import * as application from 'tns-core-modules/application';
import * as dialogs from 'tns-core-modules/ui/dialogs';

import * as Permissions from 'nativescript-permissions';
import * as Toast from 'nativescript-toast';

/**
 * ImageGalleryComponent class.
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

    /**
     * Constructor for ImageGalleryComponent
     * @param routerExtensions Router extension instance
     * @param router Router instance
     * @param transformedImageProvider Transformed image provider instance
     * @param activityLoader Activity loader instance
     */
    constructor(
        private routerExtensions: RouterExtensions,
        private router: Router,
        private transformedImageProvider: TransformedImageProvider,
        private activityLoader: ActivityLoader) {
    }

    /**
     * Angular initialize method.
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
     * Get image list.
     * @returns image list.
     */
    get imageList(): TransformedImage[] {
        return this.transformedImageProvider.imageList;
    }
    /**
     * Set checkbox visible.
     */
    setCheckboxVisible() {
        this.isCheckBoxVisible = true;
        this.isPopUpMenu = true;
    }
    /**
     * On page loaded
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
     * Go back
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
     * Go to Image slide page
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
     * Is checkBox checked or not.
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
     * Select/Unselect all checkbox
     */
    onSelectUnSelectAllCheckBox() {
        if (this.selectedCount !== this.imageList.length && this.selectedCount > 0) {
            dialogs.action({
                message: 'Patially selected. Do you want to perform one of the below?',
                cancelButtonText: 'Cancel',
                actions: ['Select All', 'Unselect All'],
            }).then((result) => {
                if (result === 'Select All') {
                    this.isSelectUnselectAll = true;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                } else if (result === 'Unselect All') {
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
     * Sort images by date.
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
     * Share selected image(s)
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
                } catch (e) {
                    Toast.makeText('Error while sharing images.' + e).show();
                    console.log('is exception raises during sending mail ' + e);
                }
            }).catch(() => {
                Toast.makeText('Error in giving permission.').show();
                console.log('Permission is not granted (sadface)');
            });
    }
    /**
     * Delete selected image(s)
     */
    onDelete() {
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: 'Delete',
                message: 'Deleting selected item(s)?',
                okButtonText: 'Ok',
                cancelButtonText: 'Cancel',
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
                                        }).catch((err) => {
                                            Toast.makeText('Error while deleting thumbnail images').show();
                                            console.log(err.stack);
                                        });

                                }).catch((err) => {
                                    Toast.makeText('Error while deleting images').show();
                                    console.log('Error while deleting original image.' + err.stack);
                                });
                        }

                    });
                    Toast.makeText('Selected images deleted.').show();
                }
            });
        }
    }
    /**
     * Perform select/unselect all checkbox.
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
     * Load thumbnail images by content resolver.
     * @param orderByAscDescParam OrderBy value 'Asc'/'Desc'
     */
    private loadThumbnailImagesByContentResolver(orderByAscDescParam: string) {
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDescParam, this.activityLoader);
    }
    /**
     * Load thumbnail images by file system
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
                } catch (e) {
                    console.log(e.toString());
                    Toast.makeText(e.toString()).show();
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
                    }).catch((err) => {
                        // Failed to obtain folder's contents.
                        Toast.makeText('Error while loading images', 'long').show();
                        console.log(err.stack);
                    });
                this.activityLoader.hide();
            }).catch(() => {
                Toast.makeText('Error in giving permission.', 'long').show();
                console.log('Permission is not granted (sadface)');
            });
    }
}
