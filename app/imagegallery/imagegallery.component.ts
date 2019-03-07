import { Component, OnDestroy, OnInit, ViewChild, ElementRef, NgZone, ViewContainerRef, ChangeDetectorRef } from "@angular/core";
import { knownFolders, Folder, File } from "tns-core-modules/file-system";
import { Observable, PropertyChangeData } from "tns-core-modules/data/observable";
import * as application from "tns-core-modules/application";
import { RouterExtensions } from "nativescript-angular/router";
import { Router, NavigationExtras } from "@angular/router";
import { ModalDialogService, ModalDialogOptions } from "nativescript-angular/modal-dialog";
import { DialogContent } from "../dialog/dialog.component";
import { ObservableArray } from "data/observable-array";
import { ListViewEventData, ListViewGridLayout, ListViewStaggeredLayout, ListViewLinearLayout, RadListView, LoadOnDemandListViewEventData } from "nativescript-ui-listview";
import * as dialogs from "tns-core-modules/ui/dialogs";
import BitmapFactory = require("nativescript-bitmap-factory");
import KnownColors = require("color/known-colors");
import { ImageSource } from 'tns-core-modules/image-source';
import { Page } from 'tns-core-modules/ui/page';
import { CheckBox } from 'nativescript-checkbox';
import { TransformedImageProvider, ActivityLoader, SendBroadcastImage, TransformedImage } from '../providers/transformedimage.provider';
import * as Permissions from "nativescript-permissions";
import * as Toast from 'nativescript-toast';

let RC_GALLERY = 1;
let page;
declare var android;

@Component({
    selector: "ns-imagegallery",
    moduleId: module.id,
    styleUrls: ['./imagegallery.component.css'],
    templateUrl: "./imagegallery.component.html",
})

export class ImageGalleryComponent implements OnInit, OnDestroy {
    public isBack: boolean;
    public isSharing: boolean;
    public isDeleting: boolean;
    public isPopUpMenu: boolean;
    public isBusy: boolean;
    public selectedCount: number;
    public isCheckBoxVisible: boolean;
    private layout: ListViewLinearLayout;
    private _numberOfAddedItems;
    private thumbImage: any;
    private imageSource: ImageSource;
    private isSelectUnselectAll: boolean;
    public imgURI: any;
    public orderByAscDesc: string;
    public isSortByDateMenu: boolean;


    ngOnDestroy(): void {

    }

    ngOnInit(): void {
        this.activityLoader.show();
        this.imageSource = new ImageSource();
        this.isCheckBoxVisible = false;
        this.isBusy = false;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = false;
        this.isSortByDateMenu = true;
        this.isSelectUnselectAll = true;
        this.layout = new ListViewGridLayout();
        this.layout.scrollDirection = "Vertical";
        // this.loadThumbnailImages();
        this.orderByAscDesc = " DESC";
        this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
    }
    public get imageList(): Array<TransformedImage> {
        return this.transformedImageProvider.imageList;
    }

    constructor(private routerExtensions: RouterExtensions,
        private modalService: ModalDialogService,
        private viewContainerRef: ViewContainerRef,
        private _changeDetectionRef: ChangeDetectorRef,
        private router: Router,
        private transformedImageProvider: TransformedImageProvider,
        private activityLoader: ActivityLoader) {
    }

    selectImage() {
        this.isCheckBoxVisible = true;
        this.isPopUpMenu = true;
    }
    onPageLoaded(args) {
        page = (args != page) ? <Page>args.object : args;
        let selectedCountTemp = this.selectedCount;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        this.isPopUpMenu = (this.imageList.length > 0) ? this.isPopUpMenu : false;
        this.isSortByDateMenu = (this.imageList.length > 0) ? true : false;
        for (let image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.isDeleting = true;
                this.isSharing = true;
                this.selectedCount = selectedCountTemp;
                break;
            }
        }
    }


    public goBack() {
        this.isBusy = true;
        this.routerExtensions.back();
    }

    public goImageSlide(imgURIParam, imgIndex, args) {
        let navigationExtras: NavigationExtras = {
            queryParams: {
                "imgURI": imgURIParam,
                "imgIndex": imgIndex
            }
        };
        this.router.navigate(["imageslide"], navigationExtras);
    }

    public isChecked(event, imagePath, index) {
        if (event.value)
            this.selectedCount++;
        else
            this.selectedCount--;
        if (this.selectedCount > 0) {
            this.isDeleting = true;
            this.isSharing = true;
        } else {
            this.isDeleting = false;
            this.isSharing = false;
        }
        this.imageList[index].isSelected = event.value;
    }

    public onSelectUnSelectAllCheckBox() {
        if (this.selectedCount !== this.imageList.length && this.selectedCount > 0) {
            dialogs.action({
                message: "Patially selected. Do you want to perform one of the below?",
                cancelButtonText: "Cancel",
                actions: ["Select All", "Unselect All"]
            }).then(result => {
                console.log("Dialog result: " + result);
                if (result == "Select All") {
                    this.isSelectUnselectAll = true;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                } else if (result == "Unselect All") {
                    this.isSelectUnselectAll = false;
                    this.performSelectUnselectAll(this.isSelectUnselectAll);
                }
            });
        } else {
            this.isSelectUnselectAll = (this.selectedCount == this.imageList.length) ? false : true;
            this.performSelectUnselectAll(this.isSelectUnselectAll);
        }
    }

    public onSortByDate() {
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        let clonedImageList = Object.assign([], this.imageList);

        this.transformedImageProvider.imageList = [];
        for (let i = (clonedImageList.length - 1); i >= 0; i--) {
            this.transformedImageProvider.imageList.push(new TransformedImage(
                clonedImageList[i].fileName,
                clonedImageList[i].filePath,
                clonedImageList[i].thumbnailPath,
                clonedImageList[i].isSelected
            ));
        }
        // if (this.orderByAscDesc) {
        //     this.orderByAscDesc = "";
        // } else {
        //     this.orderByAscDesc = " DESC";
        // }
        // this.loadThumbnailImagesByContentResolver(this.orderByAscDesc);
    }

    onShare() {
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.INTERNET], "Needed for sharing files").then(() => {
            try {
                let uris = new java.util.ArrayList<android.net.Uri>();
                let filesToBeAttached = '';
                this.imageList.forEach((image) => {
                    if (image.isSelected) {
                        let imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', ".");
                        let imgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
                        let newFile = new java.io.File(imagePath, imgFileNameOrg);
                        let uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
                        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        uris.add(uri);
                        uris.add(this.getOriginalImage(imgFileNameOrg));
                    }
                });
                if (uris.size() > 0) {
                    let intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("image/jpeg");
                    let message = "Perspective correction pictures : " + filesToBeAttached + ".";
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "Perspective correction pictures...");
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris);
                    // let extra_text = new java.util.ArrayList<String>();
                    // extra_text.add("See attached transformed image files.");
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, "See attached transformed image files.");
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    intent.setFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, "Send mail..."));
                }
            } catch (e) {
                Toast.makeText("Error while sharing images." + e).show();
                console.log("is exception raises during sending mail " + e);
            }
        }).catch(() => {
            Toast.makeText("Error in giving permission.").show();
            console.log("Permission is not granted (sadface)");
        });
    }

    onDelete() {
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: "Delete",
                message: "Deleting selected item(s)?",
                okButtonText: "Ok",
                cancelButtonText: "Cancel"
            }).then(result => {
                if (result) {
                    this.selectedCount = 0;
                    this.isDeleting = false;
                    this.isSharing = false;
                    this.imageList.forEach((image) => {
                        if (image.isSelected) {
                            let file: File = File.fromPath(image.filePath);
                            file.remove()
                                .then((res) => {
                                    let thumbnailFile: File = File.fromPath(image.thumbnailPath);
                                    thumbnailFile.remove()
                                        .then((res) => {
                                            SendBroadcastImage(image.thumbnailPath);
                                            let imgIdx = this.imageList.indexOf(image);
                                            (imgIdx >= 0)
                                            this.imageList.splice(imgIdx, 1);
                                            this.onPageLoaded(page);
                                        }).catch((err) => {
                                            Toast.makeText("Error while deleting thumbnail images").show();
                                            console.log(err.stack);
                                        });

                                }).catch((err) => {
                                    Toast.makeText("Error while deleting images").show();
                                    console.log('Error while deleting original image.' + err.stack);
                                });
                        }

                    });
                    Toast.makeText("Selected images deleted.").show();
                }
            });
        }

    }

    private performSelectUnselectAll(value: any) {
        for (let i = 0; i < this.imageList.length; i++) {
            let checkBox = <CheckBox>page.getViewById('checkbox-' + i);
            checkBox.checked = value;
        }
        this.isSelectUnselectAll = !value
    }

    private getOriginalImage(transformedImage: string): any {
        let imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', ".");

        let imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.substring(0, imgFileNameOrg.indexOf('_transformed')) + '.jpg';
        let newFile = new java.io.File(imagePath, imgFileNameOrg);
        let uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    }

    private loadThumbnailImagesByContentResolver(orderByAscDesc: string) {
        this.transformedImageProvider.loadThumbnailImagesByContentResolver(orderByAscDesc, this.activityLoader);
        // Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
        //     let MediaStore = android.provider.MediaStore;
        //     this.transformedImageProvider.imageList = [];
        //     let cursor = null;
        //     try {
        //         var context = application.android.context;
        //         let columns = [MediaStore.MediaColumns.DATA, MediaStore.MediaColumns.DATE_ADDED];
        //         let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
        //         let uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        //         let where = MediaStore.MediaColumns.DATA + " like '%thumb_PT_IMG%'";
        //         cursor = context.getContentResolver().query(uri, columns, where, null, orderBy);
        //         if (cursor && cursor.getCount() > 0) {
        //             while (cursor.moveToNext()) {
        //                 let column_index = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
        //                 let imageUri = cursor.getString(column_index) + '';
        //                 let name = imageUri.substring(imageUri.lastIndexOf('thumb_PT_IMG'));
        //                 // let image = { fileUri: imageUri, text: name };
        //                 //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith(".png")) {
        //                 let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
        //                 this.transformedImageProvider.imageList.push(new TransformedImage(
        //                     name,
        //                     thumnailOrgPath,
        //                     imageUri,
        //                     false
        //                 ));

        //                 //   }
        //             }
        //         }
        //         this.activityLoader.hide();
        //     } catch (error) {
        //         this.activityLoader.hide();
        //         Toast.makeText("Error while loading gallery images.", "long").show();
        //         console.log('getGalleryPhotos=>', JSON.stringify(error));
        //     }
        // }).catch(() => {
        //     this.activityLoader.hide();
        //     Toast.makeText("Error in giving permission.", "long").show();
        //     console.log("Permission is not granted (sadface)");
        // });
    }
    private loadThumbnailImagesByFileSystem() {
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(() => {
            let capturedPicturePath = '';
            this.transformedImageProvider.imageList = [];
            try {
                capturedPicturePath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
            } catch (e) {
                console.log(e.toString());
                Toast.makeText(e.toString()).show();
            }
            let folders: Folder = Folder.fromPath(capturedPicturePath);
            folders.getEntities()
                .then((entities) => {
                    // entities is array with the document's files and folders.
                    entities.forEach((entity) => {
                        if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith(".png")) {
                            let thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                            this.transformedImageProvider.imageList.push(new TransformedImage(
                                entity.name,
                                thumnailOrgPath,
                                entity.path,
                                false
                            ));
                        }
                    });
                }).catch((err) => {
                    // Failed to obtain folder's contents.
                    Toast.makeText("Error while loading images", "long").show();
                    console.log(err.stack);
                });
            this.activityLoader.hide();
        }).catch(() => {
            Toast.makeText("Error in giving permission.", "long").show();
            console.log("Permission is not granted (sadface)");
        });
    }
}