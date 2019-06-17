"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oxseyelogger_1 = require("../logger/oxseyelogger");
var angular_1 = require("nativescript-i18n/angular");
var nativescript_loading_indicator_1 = require("nativescript-loading-indicator");
/**
 * LoadingIndicator Instance variable.
 */
// const LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;
/**
 * Activity loader class to show up application event progress dialog box.
 */
var ActivityLoader = (function () {
    function ActivityLoader() {
        /** LoadingIndicator Instance variable. */
        this._loader = new nativescript_loading_indicator_1.LoadingIndicator();
        /** Logger variable to log message in different level */
        this.logger = new oxseyelogger_1.OxsEyeLogger();
        /**Localization variable */
        this.locale = new angular_1.L();
    }
    /**
     * Gets LoadingIndicator options for both android and ios.
     * @returns options
     */
    ActivityLoader.prototype.getOptions = function () {
        var options = {
            message: this.locale.transform('activity_loader_message'),
            progress: 0.65,
            android: {
                indeterminate: true,
                cancelable: true,
                cancelListener: function (dialog) { console.log('Loading cancelled'); },
                max: 100,
                progressNumberFormat: '%1d/%2d',
                progressPercentFormat: 0.53,
                progressStyle: 1,
                secondaryProgress: 1,
            },
            ios: {
                details: 'Additional detail note!',
                margin: 10,
                dimBackground: true,
                color: '#4B9ED6',
                // background box around indicator
                // hideBezel will override this if true
                backgroundColor: 'yellow',
                hideBezel: true,
            },
        };
        return options;
    };
    /**
     * Shows activity loader.
     */
    ActivityLoader.prototype.show = function () {
        try {
            this._loader.show(this.getOptions());
        }
        catch (error) {
            this.logger.error('Error while showing lodingindicator. ' + error);
        }
    };
    /**
     * Hides activity loader.
     */
    ActivityLoader.prototype.hide = function () {
        this._loader.hide();
    };
    return ActivityLoader;
}());
exports.ActivityLoader = ActivityLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlsb2FkZXIuY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aXZpdHlsb2FkZXIuY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQXNEO0FBRXRELHFEQUE4QztBQUU5QyxpRkFBa0U7QUFFbEU7O0dBRUc7QUFDSCx1RkFBdUY7QUFFdkY7O0dBRUc7QUFDSDtJQUFBO1FBQ0ksMENBQTBDO1FBQ2xDLFlBQU8sR0FBRyxJQUFJLGlEQUFnQixFQUFFLENBQUM7UUFDekMsd0RBQXdEO1FBQ2hELFdBQU0sR0FBRyxJQUFJLDJCQUFZLEVBQUUsQ0FBQztRQUVwQywyQkFBMkI7UUFDbkIsV0FBTSxHQUFHLElBQUksV0FBQyxFQUFFLENBQUM7SUFtRDdCLENBQUM7SUFqREc7OztPQUdHO0lBQ0ssbUNBQVUsR0FBbEI7UUFDSSxJQUFNLE9BQU8sR0FBRztZQUNaLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQztZQUN6RCxRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRTtnQkFDTCxhQUFhLEVBQUUsSUFBSTtnQkFDbkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGNBQWMsWUFBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsR0FBRyxFQUFFLEdBQUc7Z0JBQ1Isb0JBQW9CLEVBQUUsU0FBUztnQkFDL0IscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLGlCQUFpQixFQUFFLENBQUM7YUFDdkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0QsT0FBTyxFQUFFLHlCQUF5QjtnQkFDbEMsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLEtBQUssRUFBRSxTQUFTO2dCQUNoQixrQ0FBa0M7Z0JBQ2xDLHVDQUF1QztnQkFDdkMsZUFBZSxFQUFFLFFBQVE7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJO2FBR2xCO1NBQ0osQ0FBQztRQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNEOztPQUVHO0lBQ0gsNkJBQUksR0FBSjtRQUNJLElBQUksQ0FBQztZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdkUsQ0FBQztJQUNMLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUExREQsSUEwREM7QUExRFksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuXG5pbXBvcnQgeyBMb2FkaW5nSW5kaWNhdG9yIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWxvYWRpbmctaW5kaWNhdG9yJztcblxuLyoqXG4gKiBMb2FkaW5nSW5kaWNhdG9yIEluc3RhbmNlIHZhcmlhYmxlLlxuICovXG4vLyBjb25zdCBMb2FkaW5nSW5kaWNhdG9yID0gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWxvYWRpbmctaW5kaWNhdG9yJykuTG9hZGluZ0luZGljYXRvcjtcblxuLyoqXG4gKiBBY3Rpdml0eSBsb2FkZXIgY2xhc3MgdG8gc2hvdyB1cCBhcHBsaWNhdGlvbiBldmVudCBwcm9ncmVzcyBkaWFsb2cgYm94LlxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlMb2FkZXIge1xuICAgIC8qKiBMb2FkaW5nSW5kaWNhdG9yIEluc3RhbmNlIHZhcmlhYmxlLiAqL1xuICAgIHByaXZhdGUgX2xvYWRlciA9IG5ldyBMb2FkaW5nSW5kaWNhdG9yKCk7XG4gICAgLyoqIExvZ2dlciB2YXJpYWJsZSB0byBsb2cgbWVzc2FnZSBpbiBkaWZmZXJlbnQgbGV2ZWwgKi9cbiAgICBwcml2YXRlIGxvZ2dlciA9IG5ldyBPeHNFeWVMb2dnZXIoKTtcblxuICAgIC8qKkxvY2FsaXphdGlvbiB2YXJpYWJsZSAqL1xuICAgIHByaXZhdGUgbG9jYWxlID0gbmV3IEwoKTtcblxuICAgIC8qKlxuICAgICAqIEdldHMgTG9hZGluZ0luZGljYXRvciBvcHRpb25zIGZvciBib3RoIGFuZHJvaWQgYW5kIGlvcy5cbiAgICAgKiBAcmV0dXJucyBvcHRpb25zXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRPcHRpb25zKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmxvY2FsZS50cmFuc2Zvcm0oJ2FjdGl2aXR5X2xvYWRlcl9tZXNzYWdlJyksXG4gICAgICAgICAgICBwcm9ncmVzczogMC42NSxcbiAgICAgICAgICAgIGFuZHJvaWQ6IHtcbiAgICAgICAgICAgICAgICBpbmRldGVybWluYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuZXIoZGlhbG9nKSB7IGNvbnNvbGUubG9nKCdMb2FkaW5nIGNhbmNlbGxlZCcpOyB9LFxuICAgICAgICAgICAgICAgIG1heDogMTAwLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzTnVtYmVyRm9ybWF0OiAnJTFkLyUyZCcsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NQZXJjZW50Rm9ybWF0OiAwLjUzLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzU3R5bGU6IDEsXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5UHJvZ3Jlc3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW9zOiB7XG4gICAgICAgICAgICAgICAgZGV0YWlsczogJ0FkZGl0aW9uYWwgZGV0YWlsIG5vdGUhJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46IDEwLFxuICAgICAgICAgICAgICAgIGRpbUJhY2tncm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNEI5RUQ2JywgLy8gY29sb3Igb2YgaW5kaWNhdG9yIGFuZCBsYWJlbHNcbiAgICAgICAgICAgICAgICAvLyBiYWNrZ3JvdW5kIGJveCBhcm91bmQgaW5kaWNhdG9yXG4gICAgICAgICAgICAgICAgLy8gaGlkZUJlemVsIHdpbGwgb3ZlcnJpZGUgdGhpcyBpZiB0cnVlXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAneWVsbG93JyxcbiAgICAgICAgICAgICAgICBoaWRlQmV6ZWw6IHRydWUsIC8vIGRlZmF1bHQgZmFsc2UsIGNhbiBoaWRlIHRoZSBzdXJyb3VuZGluZyBiZXplbFxuICAgICAgICAgICAgICAgIC8vIHZpZXc6IFVJVmlldyAvLyBUYXJnZXQgdmlldyB0byBzaG93IG9uIHRvcCBvZiAoRGVmYXVsdHMgdG8gZW50aXJlIHdpbmRvdylcbiAgICAgICAgICAgICAgICAvLyAgbW9kZTogLy8gc2VlIGlPUyBzcGVjaWZpYyBvcHRpb25zIGJlbG93XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvd3MgYWN0aXZpdHkgbG9hZGVyLlxuICAgICAqL1xuICAgIHNob3coKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkZXIuc2hvdyh0aGlzLmdldE9wdGlvbnMoKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignRXJyb3Igd2hpbGUgc2hvd2luZyBsb2RpbmdpbmRpY2F0b3IuICcgKyBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGlkZXMgYWN0aXZpdHkgbG9hZGVyLlxuICAgICAqL1xuICAgIGhpZGUoKSB7XG4gICAgICAgIHRoaXMuX2xvYWRlci5oaWRlKCk7XG4gICAgfVxufVxuIl19