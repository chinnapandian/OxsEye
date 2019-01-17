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
var application = require("tns-core-modules/application");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var TransformedImageProvider = (function () {
    function TransformedImageProvider() {
        this.imageList = [];
    }
    return TransformedImageProvider;
}());
TransformedImageProvider = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], TransformedImageProvider);
exports.TransformedImageProvider = TransformedImageProvider;
function SendBroadcastImage(imgURI) {
    var imageFile = new java.io.File(imgURI);
    var contentUri = android.net.Uri.fromFile(imageFile);
    var mediaScanIntent = new android.content.Intent('android.intent.action.MEDIA_SCANNER_SCAN_FILE', contentUri);
    application.android.context.sendBroadcast(mediaScanIntent);
}
exports.SendBroadcastImage = SendBroadcastImage;
var ActivityLoader = (function () {
    function ActivityLoader() {
        //var enums = require("ui/enums");
        this.loader = new LoadingIndicator();
    }
    // optional options
    // android and ios have some platform specific options
    ActivityLoader.prototype.getOptions = function () {
        var options = {
            message: 'Loading...',
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: true,
                cancelListener: function (dialog) { console.log("Loading cancelled"); },
                max: 100,
                progressNumberFormat: "%1d/%2d",
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1
            },
            ios: {
                details: "Additional detail note!",
                margin: 10,
                dimBackground: true,
                color: "#4B9ED6",
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: "yellow",
                hideBezel: true // default false, can hide the surrounding bezel
                //view: UIView // Target view to show on top of (Defaults to entire window)
                //  mode: // see iOS specific options below
            }
        };
        return options;
    };
    ActivityLoader.prototype.show = function () {
        try {
            this.loader.show(this.getOptions());
        }
        catch (e) {
            console.log('Error while showing lodingindicator. ' + e);
        }
    };
    ActivityLoader.prototype.hide = function () {
        this.loader.hide();
    };
    return ActivityLoader;
}());
exports.ActivityLoader = ActivityLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBMkM7QUFFM0MsMERBQTREO0FBSTVELElBQUksZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsZ0JBQWdCLENBQUM7QUFLbEYsSUFBYSx3QkFBd0I7SUFFakM7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0wsK0JBQUM7QUFBRCxDQUFDLEFBTEQsSUFLQztBQUxZLHdCQUF3QjtJQURwQyxpQkFBVSxFQUFFOztHQUNBLHdCQUF3QixDQUtwQztBQUxZLDREQUF3QjtBQU1yQyw0QkFBbUMsTUFBTTtJQUNyQyxJQUFJLFNBQVMsR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRCxJQUFJLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLCtDQUErQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzlHLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMvRCxDQUFDO0FBTEQsZ0RBS0M7QUFFRDtJQUFBO1FBRUksa0NBQWtDO1FBQzFCLFdBQU0sR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUEwQzVDLENBQUM7SUF6Q0csbUJBQW1CO0lBQ25CLHNEQUFzRDtJQUM5QyxtQ0FBVSxHQUFsQjtRQUNJLElBQUksT0FBTyxHQUFHO1lBQ1YsT0FBTyxFQUFFLFlBQVk7WUFDckIsUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixjQUFjLEVBQUUsVUFBVSxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFBLENBQUMsQ0FBQztnQkFDdEUsR0FBRyxFQUFFLEdBQUc7Z0JBQ1Isb0JBQW9CLEVBQUUsU0FBUztnQkFDL0IscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLGlCQUFpQixFQUFFLENBQUM7YUFDdkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0QsT0FBTyxFQUFFLHlCQUF5QjtnQkFDbEMsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLEtBQUssRUFBRSxTQUFTO2dCQUNoQixrQ0FBa0M7Z0JBQ2xDLHVDQUF1QztnQkFDdkMsZUFBZSxFQUFFLFFBQVE7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJLENBQUMsZ0RBQWdEO2dCQUNoRSwyRUFBMkU7Z0JBQzNFLDJDQUEyQzthQUM5QztTQUNKLENBQUM7UUFDRixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDTSw2QkFBSSxHQUFYO1FBQ0ksSUFBSSxDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUFDLEtBQUssQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzdELENBQUM7SUFDTCxDQUFDO0lBQ00sNkJBQUksR0FBWDtRQUNJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQTdDRCxJQTZDQztBQTdDWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IGtub3duRm9sZGVycywgRm9sZGVyLCBGaWxlLCBwYXRoIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW1cIjtcbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL2FwcGxpY2F0aW9uXCI7XG5pbXBvcnQgKsKgYXPCoGRpYWxvZ3MgZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvZGlhbG9nc1wiO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gXCJuYXRpdmVzY3JpcHQtcGVybWlzc2lvbnNcIjtcbnZhciBMb2FkaW5nSW5kaWNhdG9yID0gcmVxdWlyZShcIm5hdGl2ZXNjcmlwdC1sb2FkaW5nLWluZGljYXRvclwiKS5Mb2FkaW5nSW5kaWNhdG9yO1xuXG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB7XG4gICAgcHVibGljIGltYWdlTGlzdDogYW55O1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5pbWFnZUxpc3QgPSBbXTtcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gU2VuZEJyb2FkY2FzdEltYWdlKGltZ1VSSSkge1xuICAgIGxldCBpbWFnZUZpbGUgPSBuZXcgamF2YS5pby5GaWxlKGltZ1VSSSk7XG4gICAgbGV0IGNvbnRlbnRVcmkgPSBhbmRyb2lkLm5ldC5VcmkuZnJvbUZpbGUoaW1hZ2VGaWxlKTtcbiAgICBsZXQgbWVkaWFTY2FuSW50ZW50ID0gbmV3IGFuZHJvaWQuY29udGVudC5JbnRlbnQoJ2FuZHJvaWQuaW50ZW50LmFjdGlvbi5NRURJQV9TQ0FOTkVSX1NDQU5fRklMRScsIGNvbnRlbnRVcmkpO1xuICAgIGFwcGxpY2F0aW9uLmFuZHJvaWQuY29udGV4dC5zZW5kQnJvYWRjYXN0KG1lZGlhU2NhbkludGVudCk7XG59XG5cbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUxvYWRlciB7XG5cbiAgICAvL3ZhciBlbnVtcyA9IHJlcXVpcmUoXCJ1aS9lbnVtc1wiKTtcbiAgICBwcml2YXRlIGxvYWRlciA9IG5ldyBMb2FkaW5nSW5kaWNhdG9yKCk7XG4gICAgLy8gb3B0aW9uYWwgb3B0aW9uc1xuICAgIC8vIGFuZHJvaWQgYW5kIGlvcyBoYXZlIHNvbWUgcGxhdGZvcm0gc3BlY2lmaWMgb3B0aW9uc1xuICAgIHByaXZhdGUgZ2V0T3B0aW9ucygpOiBhbnkge1xuICAgICAgICBsZXQgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdMb2FkaW5nLi4uJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLjY1LFxuICAgICAgICAgICAgYW5kcm9pZDoge1xuICAgICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW5lcjogZnVuY3Rpb24gKGRpYWxvZykgeyBjb25zb2xlLmxvZyhcIkxvYWRpbmcgY2FuY2VsbGVkXCIpIH0sXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NOdW1iZXJGb3JtYXQ6IFwiJTFkLyUyZFwiLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzUGVyY2VudEZvcm1hdDogMC41MyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1N0eWxlOiAxLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeVByb2dyZXNzOiAxXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW9zOiB7XG4gICAgICAgICAgICAgICAgZGV0YWlsczogXCJBZGRpdGlvbmFsIGRldGFpbCBub3RlIVwiLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogMTAsXG4gICAgICAgICAgICAgICAgZGltQmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb2xvcjogXCIjNEI5RUQ2XCIsIC8vIGNvbG9yIG9mIGluZGljYXRvciBhbmQgbGFiZWxzXG4gICAgICAgICAgICAgICAgLy8gYmFja2dyb3VuZCBib3ggYXJvdW5kIGluZGljYXRvclxuICAgICAgICAgICAgICAgIC8vIGhpZGVCZXplbCB3aWxsIG92ZXJyaWRlIHRoaXMgaWYgdHJ1ZVxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ5ZWxsb3dcIixcbiAgICAgICAgICAgICAgICBoaWRlQmV6ZWw6IHRydWUgLy8gZGVmYXVsdCBmYWxzZSwgY2FuIGhpZGUgdGhlIHN1cnJvdW5kaW5nIGJlemVsXG4gICAgICAgICAgICAgICAgLy92aWV3OiBVSVZpZXcgLy8gVGFyZ2V0IHZpZXcgdG8gc2hvdyBvbiB0b3Agb2YgKERlZmF1bHRzIHRvIGVudGlyZSB3aW5kb3cpXG4gICAgICAgICAgICAgICAgLy8gIG1vZGU6IC8vIHNlZSBpT1Mgc3BlY2lmaWMgb3B0aW9ucyBiZWxvd1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gICAgcHVibGljIHNob3coKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmxvYWRlci5zaG93KHRoaXMuZ2V0T3B0aW9ucygpKTtcbiAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgc2hvd2luZyBsb2RpbmdpbmRpY2F0b3IuICcgKyBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwdWJsaWMgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5sb2FkZXIuaGlkZSgpO1xuICAgIH1cbn1cbiJdfQ==