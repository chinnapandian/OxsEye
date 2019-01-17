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
var file_system_1 = require("tns-core-modules/file-system");
var application = require("tns-core-modules/application");
var router_1 = require("nativescript-angular/router");
var router_2 = require("@angular/router");
var modal_dialog_1 = require("nativescript-angular/modal-dialog");
var nativescript_ui_listview_1 = require("nativescript-ui-listview");
var dialogs = require("tns-core-modules/ui/dialogs");
var image_source_1 = require("tns-core-modules/image-source");
var transformedimage_provider_1 = require("../providers/transformedimage.provider");
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
var RC_GALLERY = 1;
var TransformedImage = (function () {
    function TransformedImage(fileName, filePath, thumbnailPath, isSelected) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.thumbnailPath = thumbnailPath;
        this.isSelected = isSelected;
    }
    return TransformedImage;
}());
var ImageGalleryComponent = (function () {
    function ImageGalleryComponent(routerExtensions, modalService, viewContainerRef, _changeDetectionRef, router, transformedImageProvider, activityLoader) {
        this.routerExtensions = routerExtensions;
        this.modalService = modalService;
        this.viewContainerRef = viewContainerRef;
        this._changeDetectionRef = _changeDetectionRef;
        this.router = router;
        this.transformedImageProvider = transformedImageProvider;
        this.activityLoader = activityLoader;
    }
    ImageGalleryComponent.prototype.ngOnDestroy = function () {
    };
    ImageGalleryComponent.prototype.ngOnInit = function () {
        this.activityLoader.show();
        this.imageSource = new image_source_1.ImageSource();
        this.isCheckBoxVisible = false;
        this.isBusy = false;
        this.selectedCount = 0;
        this.layout = new nativescript_ui_listview_1.ListViewGridLayout();
        this.layout.scrollDirection = "Vertical";
        this.loadThumbnailImages();
    };
    Object.defineProperty(ImageGalleryComponent.prototype, "imageList", {
        get: function () {
            return this.transformedImageProvider.imageList;
        },
        enumerable: true,
        configurable: true
    });
    ImageGalleryComponent.prototype.selectImage = function () {
        this.isCheckBoxVisible = true;
    };
    ImageGalleryComponent.prototype.onPageLoaded = function (args) {
        var selectedCountTemp = this.selectedCount;
        this.selectedCount = 0;
        this.isDeleting = false;
        this.isSharing = false;
        for (var image in this.imageList) {
            if (this.imageList[image].isSelected) {
                this.isDeleting = true;
                this.isSharing = true;
                this.selectedCount = selectedCountTemp;
                break;
            }
        }
    };
    ImageGalleryComponent.prototype.goBack = function () {
        this.isBusy = true;
        this.routerExtensions.back();
    };
    ImageGalleryComponent.prototype.goImageSlide = function (imgURIParam, imgIndex, args) {
        var navigationExtras = {
            queryParams: {
                "imgURI": imgURIParam,
                "imgIndex": imgIndex
            }
        };
        this.router.navigate(["imageslide"], navigationExtras);
    };
    ImageGalleryComponent.prototype.isChecked = function (event, imagePath, index) {
        if (event.value)
            this.selectedCount++;
        else
            this.selectedCount--;
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
    ImageGalleryComponent.prototype.getOriginalImage = function (transformedImage) {
        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM/CAMERA', ".");
        var imgFileNameOrg = transformedImage.replace('PT_IMG', 'IMG');
        imgFileNameOrg = imgFileNameOrg.replace('_transformed.png', '.jpg');
        var newFile = new java.io.File(imagePath, imgFileNameOrg);
        var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
        return uri;
    };
    ImageGalleryComponent.prototype.onShare = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE, android.Manifest.permission.INTERNET], "Needed for sharing files").then(function () {
            try {
                var uris_1 = new java.util.ArrayList();
                var filesToBeAttached = '';
                _this.imageList.forEach(function (image) {
                    if (image.isSelected) {
                        var imagePath = new java.io.File(android.os.Environment.getExternalStorageDirectory() + '/DCIM', ".");
                        var imgFileNameOrg = image.fileName.replace('thumb_PT_IMG', 'PT_IMG');
                        var newFile = new java.io.File(imagePath, imgFileNameOrg);
                        var uri = android.support.v4.content.FileProvider.getUriForFile(application.android.context, "oxs.eye.fileprovider", newFile);
                        application.android.context.grantUriPermission("oxs.eye.fileprovider", uri, android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        uris_1.add(uri);
                        uris_1.add(_this.getOriginalImage(imgFileNameOrg));
                    }
                });
                if (uris_1.size() > 0) {
                    var intent = new android.content.Intent(android.content.Intent.ACTION_SEND_MULTIPLE);
                    intent.setType("text/plain");
                    var message = "File(s) to be shared : " + filesToBeAttached + ".";
                    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, "File(s) to be shared...");
                    intent.putParcelableArrayListExtra(android.content.Intent.EXTRA_STREAM, uris_1);
                    // let extra_text = new java.util.ArrayList<String>();
                    // extra_text.add("See attached transformed image files.");
                    intent.putExtra(android.content.Intent.EXTRA_TEXT, "See attached transformed image files.");
                    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    intent.addFlags(android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
                    application.android.foregroundActivity.startActivity(android.content.Intent.createChooser(intent, "Send mail..."));
                }
            }
            catch (e) {
                Toast.makeText("Error while sharing images." + e).show();
                console.log("is exception raises during sending mail " + e);
            }
        }).catch(function () {
            Toast.makeText("Error in giving permission.").show();
            console.log("Permission is not granted (sadface)");
        });
    };
    ImageGalleryComponent.prototype.onDelete = function () {
        var _this = this;
        if (this.selectedCount > 0) {
            dialogs.confirm({
                title: "Delete",
                message: "Deleting selected item(s)?",
                okButtonText: "Ok",
                cancelButtonText: "Cancel"
            }).then(function (result) {
                if (result) {
                    _this.selectedCount = 0;
                    _this.isDeleting = false;
                    _this.isSharing = false;
                    _this.imageList.forEach(function (image) {
                        if (image.isSelected) {
                            var file = file_system_1.File.fromPath(image.filePath);
                            file.remove()
                                .then(function (res) {
                                var thumbnailFile = file_system_1.File.fromPath(image.thumbnailPath);
                                thumbnailFile.remove()
                                    .then(function (res) {
                                    var imgIdx = _this.imageList.indexOf(image);
                                    (imgIdx >= 0);
                                    _this.imageList.splice(imgIdx, 1);
                                    _this.onPageLoaded(null);
                                }).catch(function (err) {
                                    Toast.makeText("Error while deleting thumbnail images").show();
                                    console.log(err.stack);
                                });
                            }).catch(function (err) {
                                Toast.makeText("Error while deleting images").show();
                                console.log('Error while deleting original image.' + err.stack);
                            });
                        }
                    });
                    Toast.makeText("Selected images deleted.").show();
                }
            });
        }
    };
    ImageGalleryComponent.prototype.getGalleryPhotos = function () {
        var MediaStore = android.provider.MediaStore;
        console.log('getGalleryPhotos');
        var photoList = [];
        var cursor = null;
        try {
            var context = application.android.context;
            var columns = [MediaStore.MediaColumns.DATA];
            var order_by = MediaStore.Images.Media._ID;
            var uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
            cursor = context.getContentResolver().query(uri, columns, null, null, null);
            if (cursor && cursor.getCount() > 0) {
                while (cursor.moveToNext()) {
                    var column_index = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
                    var imageUri = cursor.getString(column_index) + '';
                    var name_1 = imageUri.substring(imageUri.lastIndexOf('.'));
                    var image = { fileUri: imageUri, text: name_1 };
                    if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith(".png")) {
                        this.transformedImageProvider.imageList.push(new TransformedImage('', imageUri, imageUri, false));
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
            console.log('getGalleryPhotos=>', JSON.stringify(error));
        }
    };
    ImageGalleryComponent.prototype.loadThumbnailImages = function () {
        var _this = this;
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE, android.Manifest.permission.WRITE_EXTERNAL_STORAGE], "Needed for sharing files").then(function () {
            var capturedPicturePath = '';
            _this.transformedImageProvider.imageList = [];
            try {
                capturedPicturePath = android.os.Environment.getExternalStorageDirectory().getAbsolutePath() + '/DCIM';
            }
            catch (e) {
                console.log(e.toString());
                Toast.makeText(e.toString()).show();
            }
            var folders = file_system_1.Folder.fromPath(capturedPicturePath);
            folders.getEntities()
                .then(function (entities) {
                // entities is array with the document's files and folders.
                entities.forEach(function (entity) {
                    if (entity.name.startsWith('thumb_PT_IMG') && entity.name.endsWith(".png")) {
                        var thumnailOrgPath = entity.path.replace('thumb_PT_IMG', 'PT_IMG');
                        _this.transformedImageProvider.imageList.push(new TransformedImage(entity.name, thumnailOrgPath, entity.path, false));
                    }
                });
            }).catch(function (err) {
                // Failed to obtain folder's contents.
                Toast.makeText("Error while loading images", "long").show();
                console.log(err.stack);
            });
            _this.activityLoader.hide();
        }).catch(function () {
            Toast.makeText("Error in giving permission.", "long").show();
            console.log("Permission is not granted (sadface)");
        });
    };
    return ImageGalleryComponent;
}());
ImageGalleryComponent = __decorate([
    core_1.Component({
        selector: "ns-imagegallery",
        moduleId: module.id,
        styleUrls: ['./imagegallery.component.css'],
        templateUrl: "./imagegallery.component.html",
    }),
    __metadata("design:paramtypes", [router_1.RouterExtensions,
        modal_dialog_1.ModalDialogService,
        core_1.ViewContainerRef,
        core_1.ChangeDetectorRef,
        router_2.Router,
        transformedimage_provider_1.TransformedImageProvider,
        transformedimage_provider_1.ActivityLoader])
], ImageGalleryComponent);
exports.ImageGalleryComponent = ImageGalleryComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltYWdlZ2FsbGVyeS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBaUk7QUFDakksNERBQTBFO0FBRTFFLDBEQUE0RDtBQUM1RCxzREFBK0Q7QUFDL0QsMENBQTJEO0FBQzNELGtFQUEyRjtBQUczRixxRUFBNEs7QUFDNUsscURBQXVEO0FBR3ZELDhEQUE0RDtBQUU1RCxvRkFBa0c7QUFDbEcsc0RBQXdEO0FBQ3hELDBDQUE0QztBQUU1QyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFFbkI7SUFDSSwwQkFBbUIsUUFBZ0IsRUFBUyxRQUFnQixFQUFTLGFBQXFCLEVBQVMsVUFBbUI7UUFBbkcsYUFBUSxHQUFSLFFBQVEsQ0FBUTtRQUFTLGFBQVEsR0FBUixRQUFRLENBQVE7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBUTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQVM7SUFBSSxDQUFDO0lBQy9ILHVCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFTRCxJQUFhLHFCQUFxQjtJQWdDOUIsK0JBQW9CLGdCQUFrQyxFQUMxQyxZQUFnQyxFQUNoQyxnQkFBa0MsRUFDbEMsbUJBQXNDLEVBQ3RDLE1BQWMsRUFDZCx3QkFBa0QsRUFDbEQsY0FBOEI7UUFOdEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUMxQyxpQkFBWSxHQUFaLFlBQVksQ0FBb0I7UUFDaEMscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQW1CO1FBQ3RDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xELG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtJQUMxQyxDQUFDO0lBekJELDJDQUFXLEdBQVg7SUFFQSxDQUFDO0lBRUQsd0NBQVEsR0FBUjtR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TyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNMLDRCQUFDO0FBQUQsQ0FBQyxBQTdQRCxJQTZQQztBQTdQWSxxQkFBcUI7SUFQakMsZ0JBQVMsQ0FBQztRQUNQLFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1FBQ25CLFNBQVMsRUFBRSxDQUFDLDhCQUE4QixDQUFDO1FBQzNDLFdBQVcsRUFBRSwrQkFBK0I7S0FDL0MsQ0FBQztxQ0FrQ3dDLHlCQUFnQjtRQUM1QixpQ0FBa0I7UUFDZCx1QkFBZ0I7UUFDYix3QkFBaUI7UUFDOUIsZUFBTTtRQUNZLG9EQUF3QjtRQUNsQywwQ0FBYztHQXRDakMscUJBQXFCLENBNlBqQztBQTdQWSxzREFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uRGVzdHJveSwgT25Jbml0LCBWaWV3Q2hpbGQsIEVsZW1lbnRSZWYsIE5nWm9uZSwgVmlld0NvbnRhaW5lclJlZiwgQ2hhbmdlRGV0ZWN0b3JSZWYgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xuaW1wb3J0IHsga25vd25Gb2xkZXJzLCBGb2xkZXIsIEZpbGUgfSBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbVwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgUHJvcGVydHlDaGFuZ2VEYXRhIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlXCI7XG5pbXBvcnQgKiBhcyBhcHBsaWNhdGlvbiBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuaW1wb3J0IHsgUm91dGVyRXh0ZW5zaW9ucyB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IFJvdXRlciwgTmF2aWdhdGlvbkV4dHJhcyB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbmltcG9ydCB7IE1vZGFsRGlhbG9nU2VydmljZSwgTW9kYWxEaWFsb2dPcHRpb25zIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL21vZGFsLWRpYWxvZ1wiO1xuaW1wb3J0IHsgRGlhbG9nQ29udGVudCB9IGZyb20gXCIuLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgT2JzZXJ2YWJsZUFycmF5IH0gZnJvbSBcImRhdGEvb2JzZXJ2YWJsZS1hcnJheVwiO1xuaW1wb3J0IHsgTGlzdFZpZXdFdmVudERhdGEsIExpc3RWaWV3R3JpZExheW91dCwgTGlzdFZpZXdTdGFnZ2VyZWRMYXlvdXQsIExpc3RWaWV3TGluZWFyTGF5b3V0LCBSYWRMaXN0VmlldywgTG9hZE9uRGVtYW5kTGlzdFZpZXdFdmVudERhdGEgfSBmcm9tIFwibmF0aXZlc2NyaXB0LXVpLWxpc3R2aWV3XCI7XG5pbXBvcnQgKiBhcyBkaWFsb2dzIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3NcIjtcbmltcG9ydCBCaXRtYXBGYWN0b3J5ID0gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1iaXRtYXAtZmFjdG9yeVwiKTtcbmltcG9ydCBLbm93bkNvbG9ycyA9IHJlcXVpcmUoXCJjb2xvci9rbm93bi1jb2xvcnNcIik7XG5pbXBvcnQgeyBJbWFnZVNvdXJjZSB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvaW1hZ2Utc291cmNlJztcbmltcG9ydCB7IFBhZ2UgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL3BhZ2UnO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLCBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4uL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gXCJuYXRpdmVzY3JpcHQtcGVybWlzc2lvbnNcIjtcbmltcG9ydCAqIGFzIFRvYXN0IGZyb20gJ25hdGl2ZXNjcmlwdC10b2FzdCc7XG5cbmxldCBSQ19HQUxMRVJZID0gMTtcblxuY2xhc3MgVHJhbnNmb3JtZWRJbWFnZSB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGZpbGVOYW1lOiBzdHJpbmcsIHB1YmxpYyBmaWxlUGF0aDogc3RyaW5nLCBwdWJsaWMgdGh1bWJuYWlsUGF0aDogc3RyaW5nLCBwdWJsaWMgaXNTZWxlY3RlZDogYm9vbGVhbikgeyB9XG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiBcIm5zLWltYWdlZ2FsbGVyeVwiLFxuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc3R5bGVVcmxzOiBbJy4vaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudC5jc3MnXSxcbiAgICB0ZW1wbGF0ZVVybDogXCIuL2ltYWdlZ2FsbGVyeS5jb21wb25lbnQuaHRtbFwiLFxufSlcblxuZXhwb3J0IGNsYXNzIEltYWdlR2FsbGVyeUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcbiAgICBwdWJsaWMgaXNCYWNrOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc1NoYXJpbmc6IGJvb2xlYW47XG4gICAgcHVibGljIGlzRGVsZXRpbmc6IGJvb2xlYW47XG4gICAgcHVibGljIGlzQnVzeTogYm9vbGVhbjtcbiAgICBwdWJsaWMgc2VsZWN0ZWRDb3VudDogbnVtYmVyO1xuICAgIHB1YmxpYyBpc0NoZWNrQm94VmlzaWJsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIGxheW91dDogTGlzdFZpZXdMaW5lYXJMYXlvdXQ7XG4gICAgcHJpdmF0ZSBfbnVtYmVyT2ZBZGRlZEl0ZW1zO1xuICAgIHByaXZhdGUgdGh1bWJJbWFnZTogYW55O1xuICAgIHByaXZhdGUgaW1hZ2VTb3VyY2U6IEltYWdlU291cmNlO1xuICAgIHB1YmxpYyBpbWdVUkk6IGFueTtcblxuXG4gICAgbmdPbkRlc3Ryb3koKTogdm9pZCB7XG5cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5hY3Rpdml0eUxvYWRlci5zaG93KCk7XG4gICAgICAgIHRoaXMuaW1hZ2VTb3VyY2UgPSBuZXcgSW1hZ2VTb3VyY2UoKTtcbiAgICAgICAgdGhpcy5pc0NoZWNrQm94VmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQnVzeSA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmxheW91dCA9IG5ldyBMaXN0Vmlld0dyaWRMYXlvdXQoKTtcbiAgICAgICAgdGhpcy5sYXlvdXQuc2Nyb2xsRGlyZWN0aW9uID0gXCJWZXJ0aWNhbFwiO1xuICAgICAgICB0aGlzLmxvYWRUaHVtYm5haWxJbWFnZXMoKTtcbiAgICB9XG4gICAgcHVibGljIGdldCBpbWFnZUxpc3QoKTogQXJyYXk8VHJhbnNmb3JtZWRJbWFnZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgcm91dGVyRXh0ZW5zaW9uczogUm91dGVyRXh0ZW5zaW9ucyxcbiAgICAgICAgcHJpdmF0ZSBtb2RhbFNlcnZpY2U6IE1vZGFsRGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3Rpb25SZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlcjogVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLFxuICAgICAgICBwcml2YXRlIGFjdGl2aXR5TG9hZGVyOiBBY3Rpdml0eUxvYWRlcikge1xuICAgIH1cblxuICAgIHNlbGVjdEltYWdlKCkge1xuICAgICAgICB0aGlzLmlzQ2hlY2tCb3hWaXNpYmxlID0gdHJ1ZTtcbiAgICB9XG4gICAgb25QYWdlTG9hZGVkKGFyZ3MpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkQ291bnRUZW1wID0gdGhpcy5zZWxlY3RlZENvdW50O1xuICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgZm9yIChsZXQgaW1hZ2UgaW4gdGhpcy5pbWFnZUxpc3QpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmltYWdlTGlzdFtpbWFnZV0uaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNEZWxldGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRDb3VudCA9IHNlbGVjdGVkQ291bnRUZW1wO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ29CYWNrKCkge1xuICAgICAgICB0aGlzLmlzQnVzeSA9IHRydWU7XG4gICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5iYWNrKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdvSW1hZ2VTbGlkZShpbWdVUklQYXJhbSwgaW1nSW5kZXgsIGFyZ3MpIHtcbiAgICAgICAgbGV0IG5hdmlnYXRpb25FeHRyYXM6IE5hdmlnYXRpb25FeHRyYXMgPSB7XG4gICAgICAgICAgICBxdWVyeVBhcmFtczoge1xuICAgICAgICAgICAgICAgIFwiaW1nVVJJXCI6IGltZ1VSSVBhcmFtLFxuICAgICAgICAgICAgICAgIFwiaW1nSW5kZXhcIjogaW1nSW5kZXhcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yb3V0ZXIubmF2aWdhdGUoW1wiaW1hZ2VzbGlkZVwiXSwgbmF2aWdhdGlvbkV4dHJhcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGlzQ2hlY2tlZChldmVudCwgaW1hZ2VQYXRoLCBpbmRleCkge1xuICAgICAgICBpZiAoZXZlbnQudmFsdWUpXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQrKztcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvdW50LS07XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5pc0RlbGV0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzU2hhcmluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW1hZ2VMaXN0W2luZGV4XS5pc1NlbGVjdGVkID0gZXZlbnQudmFsdWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgICAgIGxldCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0vQ0FNRVJBJywgXCIuXCIpO1xuXG4gICAgICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnJlcGxhY2UoJ190cmFuc2Zvcm1lZC5wbmcnLCAnLmpwZycpO1xuICAgICAgICBsZXQgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgIGxldCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsIFwib3hzLmV5ZS5maWxlcHJvdmlkZXJcIiwgbmV3RmlsZSk7XG4gICAgICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5ncmFudFVyaVBlcm1pc3Npb24oXCJveHMuZXllLmZpbGVwcm92aWRlclwiLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgcmV0dXJuIHVyaTtcbiAgICB9XG4gICAgb25TaGFyZSgpIHtcbiAgICAgICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFLCBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uSU5URVJORVRdLCBcIk5lZWRlZCBmb3Igc2hhcmluZyBmaWxlc1wiKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgbGV0IHVyaXMgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxhbmRyb2lkLm5ldC5Vcmk+KCk7XG4gICAgICAgICAgICAgICAgbGV0IGZpbGVzVG9CZUF0dGFjaGVkID0gJyc7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGltYWdlLmlzU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWFnZVBhdGggPSBuZXcgamF2YS5pby5GaWxlKGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkgKyAnL0RDSU0nLCBcIi5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaW1nRmlsZU5hbWVPcmcgPSBpbWFnZS5maWxlTmFtZS5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbmV3RmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1hZ2VQYXRoLCBpbWdGaWxlTmFtZU9yZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCBcIm94cy5leWUuZmlsZXByb3ZpZGVyXCIsIG5ld0ZpbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbihcIm94cy5leWUuZmlsZXByb3ZpZGVyXCIsIHVyaSwgYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJpcy5hZGQodXJpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVyaXMuYWRkKHRoaXMuZ2V0T3JpZ2luYWxJbWFnZShpbWdGaWxlTmFtZU9yZykpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHVyaXMuc2l6ZSgpID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoYW5kcm9pZC5jb250ZW50LkludGVudC5BQ1RJT05fU0VORF9NVUxUSVBMRSk7XG4gICAgICAgICAgICAgICAgICAgIGludGVudC5zZXRUeXBlKFwidGV4dC9wbGFpblwiKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1lc3NhZ2UgPSBcIkZpbGUocykgdG8gYmUgc2hhcmVkIDogXCIgKyBmaWxlc1RvQmVBdHRhY2hlZCArIFwiLlwiO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0RXh0cmEoYW5kcm9pZC5jb250ZW50LkludGVudC5FWFRSQV9TVUJKRUNULCBcIkZpbGUocykgdG8gYmUgc2hhcmVkLi4uXCIpO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQucHV0UGFyY2VsYWJsZUFycmF5TGlzdEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfU1RSRUFNLCB1cmlzKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gbGV0IGV4dHJhX3RleHQgPSBuZXcgamF2YS51dGlsLkFycmF5TGlzdDxTdHJpbmc+KCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIGV4dHJhX3RleHQuYWRkKFwiU2VlIGF0dGFjaGVkIHRyYW5zZm9ybWVkIGltYWdlIGZpbGVzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaW50ZW50LnB1dEV4dHJhKGFuZHJvaWQuY29udGVudC5JbnRlbnQuRVhUUkFfVEVYVCwgXCJTZWUgYXR0YWNoZWQgdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZXMuXCIpO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1JFQURfVVJJX1BFUk1JU1NJT04pO1xuICAgICAgICAgICAgICAgICAgICBpbnRlbnQuYWRkRmxhZ3MoYW5kcm9pZC5jb250ZW50LkludGVudC5GTEFHX0dSQU5UX1dSSVRFX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAgICAgICAgICAgICAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5mb3JlZ3JvdW5kQWN0aXZpdHkuc3RhcnRBY3Rpdml0eShhbmRyb2lkLmNvbnRlbnQuSW50ZW50LmNyZWF0ZUNob29zZXIoaW50ZW50LCBcIlNlbmQgbWFpbC4uLlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiRXJyb3Igd2hpbGUgc2hhcmluZyBpbWFnZXMuXCIgKyBlKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpcyBleGNlcHRpb24gcmFpc2VzIGR1cmluZyBzZW5kaW5nIG1haWwgXCIgKyBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoXCJFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi5cIikuc2hvdygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQZXJtaXNzaW9uIGlzIG5vdCBncmFudGVkIChzYWRmYWNlKVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25EZWxldGUoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkQ291bnQgPiAwKSB7XG4gICAgICAgICAgICBkaWFsb2dzLmNvbmZpcm0oe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIkRlbGV0ZVwiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiRGVsZXRpbmcgc2VsZWN0ZWQgaXRlbShzKT9cIixcbiAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwiT2tcIixcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiBcIkNhbmNlbFwiXG4gICAgICAgICAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzRGVsZXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NoYXJpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZUxpc3QuZm9yRWFjaCgoaW1hZ2UpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZS5pc1NlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlLmZpbGVQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aHVtYm5haWxGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChpbWFnZS50aHVtYm5haWxQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRodW1ibmFpbEZpbGUucmVtb3ZlKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBpbWdJZHggPSB0aGlzLmltYWdlTGlzdC5pbmRleE9mKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGltZ0lkeCA+PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlTGlzdC5zcGxpY2UoaW1nSWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblBhZ2VMb2FkZWQobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dChcIkVycm9yIHdoaWxlIGRlbGV0aW5nIHRodW1ibmFpbCBpbWFnZXNcIikuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIuc3RhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiRXJyb3Igd2hpbGUgZGVsZXRpbmcgaW1hZ2VzXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvciB3aGlsZSBkZWxldGluZyBvcmlnaW5hbCBpbWFnZS4nICsgZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiU2VsZWN0ZWQgaW1hZ2VzIGRlbGV0ZWQuXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZ2V0R2FsbGVyeVBob3RvcygpIHtcbiAgICAgICAgbGV0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdnZXRHYWxsZXJ5UGhvdG9zJylcbiAgICAgICAgbGV0IHBob3RvTGlzdDogQXJyYXk8YW55PiA9IFtdO1xuICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgICAgICAgICAgbGV0IGNvbHVtbnMgPSBbTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQV07XG4gICAgICAgICAgICBsZXQgb3JkZXJfYnkgPSBNZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5fSUQ7XG4gICAgICAgICAgICBsZXQgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG5cbiAgICAgICAgICAgIGN1cnNvciA9IGNvbnRleHQuZ2V0Q29udGVudFJlc29sdmVyKCkucXVlcnkodXJpLCBjb2x1bW5zLCBudWxsLCBudWxsLCBudWxsKTtcbiAgICAgICAgICAgIGlmIChjdXJzb3IgJiYgY3Vyc29yLmdldENvdW50KCkgPiAwKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbHVtbl9pbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGltYWdlVXJpID0gY3Vyc29yLmdldFN0cmluZyhjb2x1bW5faW5kZXgpICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuYW1lID0gaW1hZ2VVcmkuc3Vic3RyaW5nKGltYWdlVXJpLmxhc3RJbmRleE9mKCcuJykpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgaW1hZ2UgPSB7IGZpbGVVcmk6IGltYWdlVXJpLCB0ZXh0OiBuYW1lIH07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbWFnZVVyaS5pbmRleE9mKCdQVF9JTUcnKSA+IDAgJiYgaW1hZ2VVcmkuZW5kc1dpdGgoXCIucG5nXCIpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLmltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2dldEdhbGxlcnlQaG90b3M9PicsIEpTT04uc3RyaW5naWZ5KGVycm9yKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcHJpdmF0ZSBsb2FkVGh1bWJuYWlsSW1hZ2VzKCkge1xuICAgICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSwgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLCBcIk5lZWRlZCBmb3Igc2hhcmluZyBmaWxlc1wiKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGxldCBjYXB0dXJlZFBpY3R1cmVQYXRoID0gJyc7XG4gICAgICAgICAgICB0aGlzLnRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlci5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgY2FwdHVyZWRQaWN0dXJlUGF0aCA9IGFuZHJvaWQub3MuRW52aXJvbm1lbnQuZ2V0RXh0ZXJuYWxTdG9yYWdlRGlyZWN0b3J5KCkuZ2V0QWJzb2x1dGVQYXRoKCkgKyAnL0RDSU0nO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoZS50b1N0cmluZygpKS5zaG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgZm9sZGVyczogRm9sZGVyID0gRm9sZGVyLmZyb21QYXRoKGNhcHR1cmVkUGljdHVyZVBhdGgpO1xuICAgICAgICAgICAgZm9sZGVycy5nZXRFbnRpdGllcygpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGVudGl0aWVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGVudGl0aWVzIGlzIGFycmF5IHdpdGggdGhlIGRvY3VtZW50J3MgZmlsZXMgYW5kIGZvbGRlcnMuXG4gICAgICAgICAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5uYW1lLnN0YXJ0c1dpdGgoJ3RodW1iX1BUX0lNRycpICYmIGVudGl0eS5uYW1lLmVuZHNXaXRoKFwiLnBuZ1wiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCB0aHVtbmFpbE9yZ1BhdGggPSBlbnRpdHkucGF0aC5yZXBsYWNlKCd0aHVtYl9QVF9JTUcnLCAnUFRfSU1HJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIuaW1hZ2VMaXN0LnB1c2gobmV3IFRyYW5zZm9ybWVkSW1hZ2UoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHVtbmFpbE9yZ1BhdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEZhaWxlZCB0byBvYnRhaW4gZm9sZGVyJ3MgY29udGVudHMuXG4gICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KFwiRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZXNcIiwgXCJsb25nXCIpLnNob3coKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyLnN0YWNrKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICBUb2FzdC5tYWtlVGV4dChcIkVycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLlwiLCBcImxvbmdcIikuc2hvdygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJQZXJtaXNzaW9uIGlzIG5vdCBncmFudGVkIChzYWRmYWNlKVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==