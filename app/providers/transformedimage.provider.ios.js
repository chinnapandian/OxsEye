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
     * Deletes the selected image file from the disk.
     *
     * @param fileURI Image file path
     */
    TransformedImageProvider.prototype.deleteFile = function (fileURI) {
        var _this = this;
        var tempFile = file_system_1.File.fromPath(fileURI);
        tempFile.remove()
            .then(function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5pb3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyLmlvcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUMzQyw0REFBb0Q7QUFFcEQsdURBQXNEO0FBS3RELDBDQUE0QztBQUk1Qyx1REFBeUQ7QUFDekQsMERBQTREO0FBRTVEOztHQUVHO0FBRUgsSUFBYSx3QkFBd0I7SUFRakM7O09BRUc7SUFDSCxrQ0FBb0IsTUFBb0I7UUFBcEIsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFRDs7T0FFRztJQUNILHdDQUFLLEdBQUwsVUFBTSxXQUFnQjtRQUVsQixJQUFNLGtCQUFrQixHQUFHLHdCQUF3QixDQUFDLEtBQUssRUFBRTthQUN0RCwwQ0FBMEMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3JFLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUNyRSxJQUFNLHFCQUFxQixHQUFHLGtCQUFrQixDQUFDLDZCQUE2QixDQUFDO1FBQy9FLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQztZQUN4QixJQUFNLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxtQkFBbUI7Z0JBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4RCxxQkFBcUIsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekYsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLHFCQUFxQixDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztZQUNyRCxDQUFDO1FBQ0wsQ0FBQztRQUVELFdBQVcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsaUJBQWlCLENBQUM7YUFDakUsU0FBUzthQUNULGtCQUFrQjthQUNsQix1Q0FBdUMsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCw2Q0FBVSxHQUFWLFVBQVcsT0FBZTtRQUExQixpQkFRQztRQVBHLElBQU0sUUFBUSxHQUFTLGtCQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7YUFDWixJQUFJLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzlELEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0Q7Ozs7Ozs7T0FPRztJQUNILDZDQUFVLEdBQVYsVUFBVyxPQUFlLEVBQUUsWUFBb0I7UUFBaEQsaUJBUUM7UUFQRyxJQUFNLFFBQVEsR0FBUyxrQkFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUN4QixJQUFJLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxLQUFLO1lBQ1gsS0FBSyxDQUFDLFFBQVEsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdELEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxHQUFHLEtBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDMUcsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBeEVELElBd0VDO0FBeEVZLHdCQUF3QjtJQURwQyxpQkFBVSxFQUFFO3lEQVltQiwyQkFBWSxvQkFBWiwyQkFBWTtHQVgvQix3QkFBd0IsQ0F3RXBDO0FBeEVZLDREQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUgfSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL2ZpbGUtc3lzdGVtJztcblxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlIH0gZnJvbSAnLi90cmFuc2Zvcm1lZGltYWdlLmNvbW1vbic7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuXG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuXG5pbXBvcnQgKiBhcyBmcmFtZU1vZHVsZSBmcm9tICd0bnMtY29yZS1tb2R1bGVzL3VpL2ZyYW1lJztcbmltcG9ydCAqIGFzIHV0aWxzTW9kdWxlIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvdXRpbHMvdXRpbHMnO1xuXG4vKipcbiAqIFRoaXMgaXMgYSBwcm92aWRlciBjbGFzcyBjb250YWlucyBjb21tb24gZnVuY3Rpb25hbHl0aWVzIHJlbGF0ZWQgdG8gY2FwdHVyZWQgaW1hZ2UuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIge1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGltYWdlICovXG4gICAgcHVibGljIGltYWdlTGlzdDogYW55O1xuICAgIC8qKiBDb250YWlucyBsaXN0IG9mIGNvbnRvdXIgaW1hZ2VzIGNhcHR1cmVkIHdoaWxlIHBlcmZvcm1pbmcgdHJhbnNmb3JtYXRpb24uXG4gICAgICogQ3VycmVudGx5IHRoaXMgaXMgbm90IGJlZW4gdXNlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgY29udG91ckltYWdlTGlzdDogYW55O1xuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0b3IgZm9yIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9nZ2VyOiBPeHNFeWVMb2dnZXIpIHtcbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5jb250b3VySW1hZ2VMaXN0ID0gW107XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tbW9uIG1ldGhvZCB0byBzaGFyZSBzZWxlY3RlZCBmaWxlcyB2aWEgYXBwbGljYXBsZSBhcHAgbGlrZSBHbWFpbCwgd2hhdHNhcHAsIGV0Yy4uXG4gICAgICovXG4gICAgc2hhcmUoZGF0YVRvU2hhcmU6IGFueSkge1xuXG4gICAgICAgIGNvbnN0IGFjdGl2aXR5Q29udHJvbGxlciA9IFVJQWN0aXZpdHlWaWV3Q29udHJvbGxlci5hbGxvYygpXG4gICAgICAgICAgICAuaW5pdFdpdGhBY3Rpdml0eUl0ZW1zQXBwbGljYXRpb25BY3Rpdml0aWVzKFtkYXRhVG9TaGFyZV0sIG51bGwpO1xuICAgICAgICBhY3Rpdml0eUNvbnRyb2xsZXIuc2V0VmFsdWVGb3JLZXkoJ1RyYW5zZm9ybWVkIEltYWdlKHMpJywgJ1N1YmplY3QnKTtcbiAgICAgICAgY29uc3QgcHJlc2VudFZpZXdDb250cm9sbGVyID0gYWN0aXZpdHlDb250cm9sbGVyLnBvcG92ZXJQcmVzZW50YXRpb25Db250cm9sbGVyO1xuICAgICAgICBpZiAocHJlc2VudFZpZXdDb250cm9sbGVyKSB7XG4gICAgICAgICAgICBjb25zdCBwYWdlID0gZnJhbWVNb2R1bGUudG9wbW9zdCgpLmN1cnJlbnRQYWdlO1xuICAgICAgICAgICAgaWYgKHBhZ2UgJiYgcGFnZS5pb3MubmF2aWdhdGlvbkl0ZW0ucmlnaHRCYXJCdXR0b25JdGVtcyAmJlxuICAgICAgICAgICAgICAgIHBhZ2UuaW9zLm5hdmlnYXRpb25JdGVtLnJpZ2h0QmFyQnV0dG9uSXRlbXMuY291bnQgPiAwKSB7XG4gICAgICAgICAgICAgICAgcHJlc2VudFZpZXdDb250cm9sbGVyLmJhckJ1dHRvbkl0ZW0gPSBwYWdlLmlvcy5uYXZpZ2F0aW9uSXRlbS5yaWdodEJhckJ1dHRvbkl0ZW1zWzBdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwcmVzZW50Vmlld0NvbnRyb2xsZXIuc291cmNlVmlldyA9IHBhZ2UuaW9zLnZpZXc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1dGlsc01vZHVsZS5pb3MuZ2V0dGVyKFVJQXBwbGljYXRpb24sIFVJQXBwbGljYXRpb24uc2hhcmVkQXBwbGljYXRpb24pXG4gICAgICAgICAgICAua2V5V2luZG93XG4gICAgICAgICAgICAucm9vdFZpZXdDb250cm9sbGVyXG4gICAgICAgICAgICAucHJlc2VudFZpZXdDb250cm9sbGVyQW5pbWF0ZWRDb21wbGV0aW9uKGFjdGl2aXR5Q29udHJvbGxlciwgdHJ1ZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc2VsZWN0ZWQgaW1hZ2UgZmlsZSBmcm9tIHRoZSBkaXNrLlxuICAgICAqXG4gICAgICogQHBhcmFtIGZpbGVVUkkgSW1hZ2UgZmlsZSBwYXRoXG4gICAgICovXG4gICAgZGVsZXRlRmlsZShmaWxlVVJJOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgdGVtcEZpbGU6IEZpbGUgPSBGaWxlLmZyb21QYXRoKGZpbGVVUkkpO1xuICAgICAgICB0ZW1wRmlsZS5yZW1vdmUoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgfSkuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGRlbGV0aW5nIHRlbXBvcmFyeSBmaWxlcycpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZW5hbWVzIHRoZSB0cmFuc2Zvcm1lZCBpbWFnZSBmaWxlIG5hbWUgdG8gZ2l2ZW4gbmFtZS4gVGhpcyBpcyBiZWVuIHVzZWQgd2hpbGUgcGVyZm9ybWluZ1xuICAgICAqIG1hbnVhbCB0cmFuc2Zvcm1hdGlvbiB1c2luZyBPcGVuQ1YgQVBJLiBBcyBpdCBjcmVhdGVzIHRlbXBvcmFyeSBmaWxlcyBiZWhpbmQgdGhlIHNjZW5lLFxuICAgICAqIGl0IG5lZWRzIHRvIGJlIHJlbmFtZWQgdG8gcmVmcmVzaCB0aGUgZmluYWwgaW1hZ2UgaW4gdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZmlsZVVSSSBJbWFnZSBmaWxlIHBhdGhcbiAgICAgKiBAcGFyYW0gcmVuYW1lRmlsZXRvIEZpbGVuYW1lIHRvIGJlIHJlbmFtZWQgdG8uXG4gICAgICovXG4gICAgcmVuYW1lRmlsZShmaWxlVVJJOiBzdHJpbmcsIHJlbmFtZUZpbGV0bzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHRlbXBGaWxlOiBGaWxlID0gRmlsZS5mcm9tUGF0aChmaWxlVVJJKTtcbiAgICAgICAgdGVtcEZpbGUucmVuYW1lKHJlbmFtZUZpbGV0bylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSByZW5hbWluZyB0ZW1wb3JhcnkgZmlsZScpLnNob3coKTtcbiAgICAgICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgcmVuYW1pbmcgdGVtcG9yYXJ5IGZpbGVzLiAnICsgdGhpcy5sb2dnZXIuRVJST1JfTVNHX1NFUEFSQVRPUiArIGVycm9yKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==