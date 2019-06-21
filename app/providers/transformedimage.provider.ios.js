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
var oxseyelogger_1 = require("../logger/oxseyelogger");
var Toast = require("nativescript-toast");
var frameModule = require("tns-core-modules/ui/frame");
var utilsModule = require("tns-core-modules/utils/utils");
/**
 * This is a provider class contains common functionalyties related to captured image.
 */
var TransformedImageProvider = (function () {
    /**
     * Constructor for TransformedImageProvider
     */
    function TransformedImageProvider(logger) {
        this.logger = logger;
        this.imageList = [];
        this.contourImageList = [];
    }
    /**
     * TODO: this is not been used now. but if needed later uncomment and use it.
     * Loads possible contour images
     */
    // LoadPossibleContourImages() {
    //     this.contourImageList = [];
    //     Permissions.requestPermission(
    //         [android.Manifest.permission.READ_EXTERNAL_STORAGE,
    //         android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
    //         'Needed for sharing files').then(() => {
    //             const MediaStore = android.provider.MediaStore;
    //             let cursor = null;
    //             try {
    //                 const context = application.android.context;
    //                 const columns = [MediaStore.MediaColumns.DATA];
    //                 //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
    //                 const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
    //                 const where = MediaStore.MediaColumns.DATA + ' like "%contourImage%"';
    //                 cursor = context.getContentResolver().query(uri, columns, where, null, null);
    //                 if (cursor && cursor.getCount() > 0) {
    //                     while (cursor.moveToNext()) {
    //                         const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
    //                         const imageUri = cursor.getString(columnIndex) + '';
    //                         const name = imageUri.substring(imageUri.lastIndexOf('contourImage'));
    //                         // let image = { fileUri: imageUri, text: name };
    //                         //  if (imageUri.indexOf('PT_IMG') > 0 && imageUri.endsWith('.png')) {
    //                         //   let thumnailOrgPath = imageUri.replace('thumb_PT_IMG', 'PT_IMG');
    //                         this.contourImageList.push(new TransformedImage(
    //                             name,
    //                             imageUri,
    //                             imageUri,
    //                             false,
    //                         ));
    //                         //   }
    //                     }
    //                 }
    //                 //         activityLoader.hide();
    //             } catch (error) {
    //                 //           activityLoader.hide();
    //                 Toast.makeText('Error while loading contour images.', 'long').show();
    //                 this.logger.error('Error while loading contour images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //             }
    //         }).catch((error) => {
    //             //   activityLoader.hide();
    //             Toast.makeText('Error in giving permission.', 'long').show();
    //             this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //         });
    // }
    /**
     * Common method to share selected files via applicaple app like Gmail, whatsapp, etc..
     */
    TransformedImageProvider.prototype.share = function (dataToShare) {
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
    };
    /**
     * Deletes all the temporary files used to perform transformation. Actually it creates
     * some temporary files behind the scene when it performs perspective transformation using OpenCV API.
     */
    // DeleteFiles() {
    //     this.contourImageList = [];
    //     Permissions.requestPermission(
    //         [android.Manifest.permission.READ_EXTERNAL_STORAGE,
    //         android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
    //         'Needed for sharing files').then(() => {
    //             const MediaStore = android.provider.MediaStore;
    //             let cursor = null;
    //             try {
    //                 const context = application.android.context;
    //                 const columns = [MediaStore.MediaColumns.DATA];
    //                 //      let orderBy = MediaStore.MediaColumns.DATE_ADDED + orderByAscDesc; //MediaStore.Images.Media._ID;
    //                 const uri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
    //                 const where = MediaStore.MediaColumns.DATA + ' like "%_TEMP%"';
    //                 cursor = context.getContentResolver().query(uri, columns, where, null, null);
    //                 if (cursor && cursor.getCount() > 0) {
    //                     while (cursor.moveToNext()) {
    //                         const columnIndex = cursor.getColumnIndex(MediaStore.MediaColumns.DATA);
    //                         const imageUri = cursor.getString(columnIndex) + '';
    //                         const tempFile: File = File.fromPath(imageUri);
    //                         tempFile.remove()
    //                             .then(() => {
    //                                 // SendBroadcastImage(imageUri);
    //                             }).catch((error) => {
    //                                 Toast.makeText('Error while deleting temporary images').show();
    //                                 this.logger.error('Error while deleting temporary files. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //                             });
    //                     }
    //                 }
    //             } catch (error) {
    //                 //           activityLoader.hide();
    //                 Toast.makeText('Error while loading temporary images.', 'long').show();
    //                 this.logger.error('Error while loading temporary images. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //             }
    //         }).catch((error) => {
    //             //   activityLoader.hide();
    //             Toast.makeText('Error in giving permission.', 'long').show();
    //             this.logger.error('Error in giving permission. ' + this.logger.ERROR_MSG_SEPARATOR + error);
    //         });
    // }
    /**
     * Deletes the selected image file from the disk.
     *
     * @param fileURI Image file path
     */
    TransformedImageProvider.prototype.deleteFile = function (fileURI) {
        var _this = this;
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.remove()
            .then(function () {
            // SendBroadcastImage(fileURI);
        }).catch(function (error) {
            Toast.makeText('Error while deleting temporary files').show();
            _this.logger.error('Error while deleting temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    /**
     * Renames the transformed image file name to given name. This is been used while performing
     * manual transformation using OpenCV API. As it creates temporary files behind the scene,
     * it needs to be renamed to refresh the final image in the view.
     *
     * @param fileURI Image file path
     * @param renameFileto Filename to be renamed to.
     */
    TransformedImageProvider.prototype.renameFile = function (fileURI, renameFileto) {
        var _this = this;
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.rename(renameFileto)
            .then(function () {
            // SendBroadcastImage(fileURI);
            // SendBroadcastImage(renameFileto);
        }).catch(function (error) {
            Toast.makeText('Error while renaming temporary file').show();
            _this.logger.error('Error while renaming temporary files. ' + _this.logger.ERROR_MSG_SEPARATOR + error);
        });
    };
    return TransformedImageProvider;
}());
TransformedImageProvider = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof oxseyelogger_1.OxsEyeLogger !== "undefined" && oxseyelogger_1.OxsEyeLogger) === "function" && _a || Object])
], TransformedImageProvider);
exports.TransformedImageProvider = TransformedImageProvider;
var _a;
// /**
//  * Broadcast image to access publicly, so that it will be available to any app.
//  * 
//  * @param imgURI Image file URI
//  */
// export function SendBroadcastImage(imgURI) {
//     const imageFile = new java.io.File(imgURI);
//     const contentUri = android.net.Uri.fromFile(imageFile);
//     const mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
//     application.android.context.sendBroadcast(mediaScanIntent);
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyLmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUMzQyw0REFBb0Q7QUFFcEQsdURBQXNEO0FBS3RELDBDQUE0QztBQUk1Qyx1REFBeUQ7QUFDekQsMERBQTREO0FBRTVEOztHQUVHO0FBRUgsSUFBYSx3QkFBd0I7SUFRakM7O09BRUc7SUFDSCxrQ0FBb0IsTUFBb0I7UUFBcEIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7O09BR0c7SUFDSCxnQ0FBZ0M7SUFFaEMsa0NBQWtDO0lBQ2xDLHFDQUFxQztJQUNyQyw4REFBOEQ7SUFDOUQsK0RBQStEO0lBQy9ELG1EQUFtRDtJQUNuRCw4REFBOEQ7SUFDOUQsaUNBQWlDO0lBQ2pDLG9CQUFvQjtJQUNwQiwrREFBK0Q7SUFDL0Qsa0VBQWtFO0lBQ2xFLDRIQUE0SDtJQUM1SCw0RUFBNEU7SUFDNUUseUZBQXlGO0lBQ3pGLGdHQUFnRztJQUNoRyx5REFBeUQ7SUFDekQsb0RBQW9EO0lBQ3BELG1HQUFtRztJQUNuRywrRUFBK0U7SUFDL0UsaUdBQWlHO0lBQ2pHLDRFQUE0RTtJQUM1RSxpR0FBaUc7SUFDakcsaUdBQWlHO0lBQ2pHLDJFQUEyRTtJQUMzRSxvQ0FBb0M7SUFDcEMsd0NBQXdDO0lBQ3hDLHdDQUF3QztJQUN4QyxxQ0FBcUM7SUFDckMsOEJBQThCO0lBRTlCLGlDQUFpQztJQUNqQyx3QkFBd0I7SUFDeEIsb0JBQW9CO0lBQ3BCLG9EQUFvRDtJQUNwRCxnQ0FBZ0M7SUFDaEMsc0RBQXNEO0lBQ3RELHdGQUF3RjtJQUN4Rix1SEFBdUg7SUFDdkgsZ0JB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QUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNEOzs7Ozs7O09BT0c7SUFDSCw2Q0FBVSxHQUFWLFVBQVcsT0FBZSxFQUFFLFlBQW9CO1FBQWhELGlCQVVDO1FBVEcsSUFBTSxRQUFRLEdBQVMsa0JBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUM7YUFDeEIsSUFBSSxDQUFDO1lBQ0YsK0JBQStCO1lBQy9CLG9DQUFvQztRQUN4QyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdELEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBK0NMLCtCQUFDO0FBQUQsQ0FBQyxBQTFORCxJQTBOQztBQTFOWSx3QkFBd0I7SUFEcEMsaUJBQVUsRUFBRTt5REFZbUIsMkJBQVksb0JBQVosMkJBQVk7R0FYL0Isd0JBQXdCLENBME5wQztBQTFOWSw0REFBd0I7O0FBMk5yQyxNQUFNO0FBQ04sa0ZBQWtGO0FBQ2xGLE1BQU07QUFDTixrQ0FBa0M7QUFDbEMsTUFBTTtBQUNOLCtDQUErQztBQUMvQyxrREFBa0Q7QUFDbEQsOERBQThEO0FBQzlELHVIQUF1SDtBQUN2SCxrRUFBa0U7QUFDbEUsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG5pbXBvcnQgKiBhcyBmcmFtZU1vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lJztcbmltcG9ydCAqIGFzIHV0aWxzTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHMnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwcm92aWRlciBjbGFzcyBjb250YWlucyBjb21tb24gZnVuY3Rpb25hbHl0aWVzIHJlbGF0ZWQgdG8gY2FwdHVyZWQgaW1hZ2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIge1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGltYWdlICovXG4gICAgcHVibGljIGltYWdlTGlzdDogYW55O1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGNvbnRvdXIgaW1hZ2VzIGNhcHR1cmVkIHdoaWxlIHBlcmZvcm1pbmcgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQ3VycmVudGx5IHRoaXMgaXMgbm90IGJlZW4gdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udG91ckltYWdlTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIpIHtcbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVE9ETzogdGhpcyBpcyBub3QgYmVlbiB1c2VkIG5vdy4gYnV0IGlmIG5lZWRlZCBsYXRlciB1bmNvbW1lbnQgYW5kIHVzZSBpdC5cbiAgICAgKiBMb2FkcyBwb3NzaWJsZSBjb250b3VyIGltYWdlc1xuICAgICAqL1xuICAgIC8vIExvYWRQb3NzaWJsZUNvbnRvdXJJbWFnZXMoKSB7XG5cbiAgICAvLyAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgLy8gICAgIFBlcm1pc3Npb25zLnJlcXVlc3RQZXJtaXNzaW9uKFxuICAgIC8vICAgICAgICAgW2FuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5SRUFEX0VYVEVSTkFMX1NUT1JBR0UsXG4gICAgLy8gICAgICAgICBhbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uV1JJVEVfRVhURVJOQUxfU1RPUkFHRV0sXG4gICAgLy8gICAgICAgICAnTmVlZGVkIGZvciBzaGFyaW5nIGZpbGVzJykudGhlbigoKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgY29uc3QgTWVkaWFTdG9yZSA9IGFuZHJvaWQucHJvdmlkZXIuTWVkaWFTdG9yZTtcbiAgICAvLyAgICAgICAgICAgICBsZXQgY3Vyc29yID0gbnVsbDtcbiAgICAvLyAgICAgICAgICAgICB0cnkge1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0O1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5zID0gW01lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEFdO1xuICAgIC8vICAgICAgICAgICAgICAgICAvLyAgICAgIGxldCBvcmRlckJ5ID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFURV9BRERFRCArIG9yZGVyQnlBc2NEZXNjOyAvL01lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLl9JRDtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgdXJpID0gTWVkaWFTdG9yZS5JbWFnZXMuTWVkaWEuRVhURVJOQUxfQ09OVEVOVF9VUkk7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IHdoZXJlID0gTWVkaWFTdG9yZS5NZWRpYUNvbHVtbnMuREFUQSArICcgbGlrZSBcIiVjb250b3VySW1hZ2UlXCInO1xuICAgIC8vICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGltYWdlVXJpLnN1YnN0cmluZyhpbWFnZVVyaS5sYXN0SW5kZXhPZignY29udG91ckltYWdlJykpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxldCBpbWFnZSA9IHsgZmlsZVVyaTogaW1hZ2VVcmksIHRleHQ6IG5hbWUgfTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgaWYgKGltYWdlVXJpLmluZGV4T2YoJ1BUX0lNRycpID4gMCAmJiBpbWFnZVVyaS5lbmRzV2l0aCgnLnBuZycpKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICBsZXQgdGh1bW5haWxPcmdQYXRoID0gaW1hZ2VVcmkucmVwbGFjZSgndGh1bWJfUFRfSU1HJywgJ1BUX0lNRycpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udG91ckltYWdlTGlzdC5wdXNoKG5ldyBUcmFuc2Zvcm1lZEltYWdlKFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVyaSxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmksXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZhbHNlLFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgLy8gICB9XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICBhY3Rpdml0eUxvYWRlci5oaWRlKCk7XG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgY29udG91ciBpbWFnZXMuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSBsb2FkaW5nIGNvbnRvdXIgaW1hZ2VzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAvLyAgICAgICAgICAgICB9XG5cbiAgICAvLyAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgIC8vICAgICAgICAgICAgIC8vICAgYWN0aXZpdHlMb2FkZXIuaGlkZSgpO1xuICAgIC8vICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciBpbiBnaXZpbmcgcGVybWlzc2lvbi4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gfVxuXG4gICAgLyoqXG4gICAgICogQ29tbW9uIG1ldGhvZCB0byBzaGFyZSBzZWxlY3RlZCBmaWxlcyB2aWEgYXBwbGljYXBsZSBhcHAgbGlrZSBHbWFpbCwgd2hhdHNhcHAsIGV0Yy4uXG4gICAgICovXG4gICAgc2hhcmUoZGF0YVRvU2hhcmU6IGFueSkge1xuXG4gICAgICAgIGxldCBhY3Rpdml0eUNvbnRyb2xsZXIgPSBVSUFjdGl2aXR5Vmlld0NvbnRyb2xsZXIuYWxsb2MoKVxuICAgICAgICAgICAgLmluaXRXaXRoQWN0aXZpdHlJdGVtc0FwcGxpY2F0aW9uQWN0aXZpdGllcyhbZGF0YVRvU2hhcmVdLCBudWxsKTtcbiAgICAgICAgYWN0aXZpdHlDb250cm9sbGVyLnNldFZhbHVlRm9yS2V5KCdUcmFuc2Zvcm1lZCBJbWFnZShzKScsICdTdWJqZWN0Jyk7XG4gICAgICAgIGxldCBwcmVzZW50Vmlld0NvbnRyb2xsZXIgPSBhY3Rpdml0eUNvbnRyb2xsZXIucG9wb3ZlclByZXNlbnRhdGlvbkNvbnRyb2xsZXI7XG4gICAgICAgIGlmIChwcmVzZW50Vmlld0NvbnRyb2xsZXIpIHtcbiAgICAgICAgICAgIHZhciBwYWdlID0gZnJhbWVNb2R1bGUudG9wbW9zdCgpLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtcyAmJlxuICAgICAgICAgICAgICAgIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMuY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgcHJlc2VudFZpZXdDb250cm9sbGVyLmJhckJ1dHRvbkl0ZW0gPSBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zWzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmVzZW50Vmlld0NvbnRyb2xsZXIuc291cmNlVmlldyA9IHBhZ2UuaW9zLnZpZXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1dGlsc01vZHVsZS5pb3MuZ2V0dGVyKFVJQXBwbGljYXRpb24sIFVJQXBwbGljYXRpb24uc2hhcmVkQXBwbGljYXRpb24pXG4gICAgICAgICAgICAua2V5V2luZG93XG4gICAgICAgICAgICAucm9vdFZpZXdDb250cm9sbGVyXG4gICAgICAgICAgICAucHJlc2VudFZpZXdDb250cm9sbGVyQW5pbWF0ZWRDb21wbGV0aW9uKGFjdGl2aXR5Q29udHJvbGxlciwgdHJ1ZSwgbnVsbCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgYWxsIHRoZSB0ZW1wb3JhcnkgZmlsZXMgdXNlZCB0byBwZXJmb3JtIHRyYW5zZm9ybWF0aW9uLiBBY3R1YWxseSBpdCBjcmVhdGVzXG4gICAgICogc29tZSB0ZW1wb3JhcnkgZmlsZXMgYmVoaW5kIHRoZSBzY2VuZSB3aGVuIGl0IHBlcmZvcm1zIHBlcnNwZWN0aXZlIHRyYW5zZm9ybWF0aW9uIHVzaW5nIE9wZW5DViBBUEkuXG4gICAgICovXG4gICAgLy8gRGVsZXRlRmlsZXMoKSB7XG4gICAgLy8gICAgIHRoaXMuY29udG91ckltYWdlTGlzdCA9IFtdO1xuICAgIC8vICAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAvLyAgICAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgIC8vICAgICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgIC8vICAgICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgIC8vICAgICAgICAgICAgIGNvbnN0IE1lZGlhU3RvcmUgPSBhbmRyb2lkLnByb3ZpZGVyLk1lZGlhU3RvcmU7XG4gICAgLy8gICAgICAgICAgICAgbGV0IGN1cnNvciA9IG51bGw7XG4gICAgLy8gICAgICAgICAgICAgdHJ5IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dDtcbiAgICAvLyAgICAgICAgICAgICAgICAgY29uc3QgY29sdW1ucyA9IFtNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBXTtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICBsZXQgb3JkZXJCeSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEVfQURERUQgKyBvcmRlckJ5QXNjRGVzYzsgLy9NZWRpYVN0b3JlLkltYWdlcy5NZWRpYS5fSUQ7XG4gICAgLy8gICAgICAgICAgICAgICAgIGNvbnN0IHVyaSA9IE1lZGlhU3RvcmUuSW1hZ2VzLk1lZGlhLkVYVEVSTkFMX0NPTlRFTlRfVVJJO1xuICAgIC8vICAgICAgICAgICAgICAgICBjb25zdCB3aGVyZSA9IE1lZGlhU3RvcmUuTWVkaWFDb2x1bW5zLkRBVEEgKyAnIGxpa2UgXCIlX1RFTVAlXCInO1xuICAgIC8vICAgICAgICAgICAgICAgICBjdXJzb3IgPSBjb250ZXh0LmdldENvbnRlbnRSZXNvbHZlcigpLnF1ZXJ5KHVyaSwgY29sdW1ucywgd2hlcmUsIG51bGwsIG51bGwpO1xuICAgIC8vICAgICAgICAgICAgICAgICBpZiAoY3Vyc29yICYmIGN1cnNvci5nZXRDb3VudCgpID4gMCkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1cnNvci5tb3ZlVG9OZXh0KCkpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IGN1cnNvci5nZXRDb2x1bW5JbmRleChNZWRpYVN0b3JlLk1lZGlhQ29sdW1ucy5EQVRBKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWFnZVVyaSA9IGN1cnNvci5nZXRTdHJpbmcoY29sdW1uSW5kZXgpICsgJyc7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGltYWdlVXJpKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZW5kQnJvYWRjYXN0SW1hZ2UoaW1hZ2VVcmkpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBkZWxldGluZyB0ZW1wb3JhcnkgaW1hZ2VzJykuc2hvdygpO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAvLyAgICAgICAgICAgICAgICAgLy8gICAgICAgICAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgdGVtcG9yYXJ5IGltYWdlcy4nLCAnbG9uZycpLnNob3coKTtcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIGxvYWRpbmcgdGVtcG9yYXJ5IGltYWdlcy4gJyArIHRoaXMubG9nZ2VyLkVSUk9SX01TR19TRVBBUkFUT1IgKyBlcnJvcik7XG4gICAgLy8gICAgICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICB9KS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAvLyAgICAgICAgICAgICAvLyAgIGFjdGl2aXR5TG9hZGVyLmhpZGUoKTtcbiAgICAvLyAgICAgICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3IgaW4gZ2l2aW5nIHBlcm1pc3Npb24uJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgLy8gICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIGluIGdpdmluZyBwZXJtaXNzaW9uLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vIH1cblxuICAgIC8qKlxuICAgICAqIERlbGV0ZXMgdGhlIHNlbGVjdGVkIGltYWdlIGZpbGUgZnJvbSB0aGUgZGlzay5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKi9cbiAgICBkZWxldGVGaWxlKGZpbGVVUkk6IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbW92ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIG5hbWUgdG8gZ2l2ZW4gbmFtZS4gVGhpcyBpcyBiZWVuIHVzZWQgd2hpbGUgcGVyZm9ybWluZ1xuICAgICAqIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLiBBcyBpdCBjcmVhdGVzIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lLFxuICAgICAqIGl0IG5lZWRzIHRvIGJlIHJlbmFtZWQgdG8gcmVmcmVzaCB0aGUgZmluYWwgaW1hZ2UgaW4gdGhlIHZpZXcuXG4gICAgICogXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICogQHBhcmFtIHJlbmFtZUZpbGV0byBGaWxlbmFtZSB0byBiZSByZW5hbWVkIHRvLlxuICAgICAqL1xuICAgIHJlbmFtZUZpbGUoZmlsZVVSSTogc3RyaW5nLCByZW5hbWVGaWxldG86IHN0cmluZykge1xuICAgICAgICBjb25zdCB0ZW1wRmlsZTogRmlsZSA9IEZpbGUuZnJvbVBhdGgoZmlsZVVSSSk7XG4gICAgICAgIHRlbXBGaWxlLnJlbmFtZShyZW5hbWVGaWxldG8pXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gU2VuZEJyb2FkY2FzdEltYWdlKGZpbGVVUkkpO1xuICAgICAgICAgICAgICAgIC8vIFNlbmRCcm9hZGNhc3RJbWFnZShyZW5hbWVGaWxldG8pO1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHJlbmFtaW5nIHRlbXBvcmFyeSBmaWxlJykuc2hvdygpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nZ2VyLmVycm9yKCdFcnJvciB3aGlsZSByZW5hbWluZyB0ZW1wb3JhcnkgZmlsZXMuICcgKyB0aGlzLmxvZ2dlci5FUlJPUl9NU0dfU0VQQVJBVE9SICsgZXJyb3IpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0cyB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2l0aCByZWN0YW5nbGUuIEJ1dCB0aGlzIHdpbGwgbm90IGJlIHVzZWQgd2hlbiBpdCBnb2VzIHRvIHByb2R1Y3Rpb24uXG4gICAgLy8gICogQHBhcmFtIHRyYW5zZm9ybWVkSW1hZ2UgVHJhbnNmb3JtZWQgaW1hZ2UgZmlsZSBwYXRoXG4gICAgLy8gICovXG4gICAgLy8gZ2V0T3JpZ2luYWxJbWFnZVdpdGhSZWN0YW5nbGUodHJhbnNmb3JtZWRJbWFnZTogc3RyaW5nKTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgaW1hZ2VQYXRoID0gbmV3IGphdmEuaW8uRmlsZShhbmRyb2lkLm9zLkVudmlyb25tZW50LmdldEV4dGVybmFsU3RvcmFnZURpcmVjdG9yeSgpICsgJy9EQ0lNJywgJy4nKTtcblxuICAgIC8vICAgICBjb25zdCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2Uuc3Vic3RyaW5nKDAsIHRyYW5zZm9ybWVkSW1hZ2UuaW5kZXhPZignX3RyYW5zZm9ybWVkJykpICsgJ19jb250b3VyLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsICdveHMuZXllLmZpbGVwcm92aWRlcicsIG5ld0ZpbGUpO1xuICAgIC8vICAgICAvLyBhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQuZ3JhbnRVcmlQZXJtaXNzaW9uKCdveHMuZXllLmZpbGVwcm92aWRlcicsXG4gICAgLy8gICAgIC8vICB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgLy8gcmV0dXJuIHVyaTtcbiAgICAvLyAgICAgcmV0dXJuIHRoaXMuZ2V0VVJJRm9yRmlsZShuZXdGaWxlKTtcbiAgICAvLyB9XG5cbiAgICAvLyAvKipcbiAgICAvLyAgKiBHZXRzIHRoZSBvcmlnaW5hbCBjYXB0dXJlZCBpbWFnZS4gVGhpcyB3aWxsIGFsc28gYmUgbm90IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAvLyAgKiBAcGFyYW0gdHJhbnNmb3JtZWRJbWFnZSBUcmFuc2Zvcm1lZCBpbWFnZSBmaWxlIHBhdGhcbiAgICAvLyAgKi9cbiAgICAvLyBnZXRPcmlnaW5hbEltYWdlKHRyYW5zZm9ybWVkSW1hZ2U6IHN0cmluZyk6IGFueSB7XG4gICAgLy8gICAgIGNvbnN0IGltYWdlUGF0aCA9IG5ldyBqYXZhLmlvLkZpbGUoYW5kcm9pZC5vcy5FbnZpcm9ubWVudC5nZXRFeHRlcm5hbFN0b3JhZ2VEaXJlY3RvcnkoKSArICcvRENJTS9DQU1FUkEnLCAnLicpO1xuXG4gICAgLy8gICAgIGxldCBpbWdGaWxlTmFtZU9yZyA9IHRyYW5zZm9ybWVkSW1hZ2UucmVwbGFjZSgnUFRfSU1HJywgJ0lNRycpO1xuICAgIC8vICAgICBpbWdGaWxlTmFtZU9yZyA9IGltZ0ZpbGVOYW1lT3JnLnN1YnN0cmluZygwLCBpbWdGaWxlTmFtZU9yZy5pbmRleE9mKCdfdHJhbnNmb3JtZWQnKSkgKyAnLmpwZyc7XG4gICAgLy8gICAgIGNvbnN0IG5ld0ZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltYWdlUGF0aCwgaW1nRmlsZU5hbWVPcmcpO1xuICAgIC8vICAgICAvLyBjb25zdCB1cmkgPSBhbmRyb2lkLnN1cHBvcnQudjQuY29udGVudC5GaWxlUHJvdmlkZXIuZ2V0VXJpRm9yRmlsZShhcHBsaWNhdGlvbi5hbmRyb2lkLmNvbnRleHQsXG4gICAgLy8gICAgIC8vICAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgLy8gYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLFxuICAgIC8vICAgICAvLyAgdXJpLCBhbmRyb2lkLmNvbnRlbnQuSW50ZW50LkZMQUdfR1JBTlRfUkVBRF9VUklfUEVSTUlTU0lPTik7XG4gICAgLy8gICAgIC8vIHJldHVybiB1cmk7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLmdldFVSSUZvckZpbGUobmV3RmlsZSk7XG4gICAgLy8gfVxuXG4gICAgLy8gLyoqXG4gICAgLy8gICogR2V0cyB0aGUgVVJJIGZvciB0aGUgY2FwdHVyZWQvdHJhbnNmb3JtZWQgaW1hZ2UgZmlsZS5cbiAgICAvLyAgKiBcbiAgICAvLyAgKiBAcGFyYW0gbmV3RmlsZSBGaWxlIG5hbWVcbiAgICAvLyAgKiBAcmV0dXJucyBVUkkgUmV0dXJucyB0aGUgVVJJIG9mIGdpdmVuIGZpbGUgbmFtZVxuICAgIC8vICAqL1xuICAgIC8vIGdldFVSSUZvckZpbGUobmV3RmlsZTogYW55KTogYW55IHtcbiAgICAvLyAgICAgY29uc3QgdXJpID0gYW5kcm9pZC5zdXBwb3J0LnY0LmNvbnRlbnQuRmlsZVByb3ZpZGVyLmdldFVyaUZvckZpbGUoYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LCAnb3hzLmV5ZS5maWxlcHJvdmlkZXInLCBuZXdGaWxlKTtcbiAgICAvLyAgICAgYXBwbGljYXRpb24uYW5kcm9pZC5jb250ZXh0LmdyYW50VXJpUGVybWlzc2lvbignb3hzLmV5ZS5maWxlcHJvdmlkZXInLCB1cmksIGFuZHJvaWQuY29udGVudC5JbnRlbnQuRkxBR19HUkFOVF9SRUFEX1VSSV9QRVJNSVNTSU9OKTtcbiAgICAvLyAgICAgcmV0dXJuIHVyaTtcbiAgICAvLyB9XG59XG4vLyAvKipcbi8vICAqIEJyb2FkY2FzdCBpbWFnZSB0byBhY2Nlc3MgcHVibGljbHksIHNvIHRoYXQgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gYW55IGFwcC5cbi8vICAqIFxuLy8gICogQHBhcmFtIGltZ1VSSSBJbWFnZSBmaWxlIFVSSVxuLy8gICovXG4vLyBleHBvcnQgZnVuY3Rpb24gU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSkge1xuLy8gICAgIGNvbnN0IGltYWdlRmlsZSA9IG5ldyBqYXZhLmlvLkZpbGUoaW1nVVJJKTtcbi8vICAgICBjb25zdCBjb250ZW50VXJpID0gYW5kcm9pZC5uZXQuVXJpLmZyb21GaWxlKGltYWdlRmlsZSk7XG4vLyAgICAgY29uc3QgbWVkaWFTY2FuSW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoJ2FuZHJvaWQuaW50ZW50LmFjdGlvbi5NRURJQV9TQ0FOTkVSX1NDQU5fRklMRScsIGNvbnRlbnRVcmkpO1xuLy8gICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5zZW5kQnJvYWRjYXN0KG1lZGlhU2NhbkludGVudCk7XG4vLyB9XG4iXX0=