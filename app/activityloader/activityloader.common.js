"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * LoadingIndicator Instance variable.
 */
var LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;
/**
 * Activity loader class.
 */
var ActivityLoader = (function () {
    function ActivityLoader() {
        /** LoadingIndicator Instance variable. */
        this._loader = new LoadingIndicator();
    }
    /**
     * Gets LoadingIndicator options for both android and ios.
     * @returns options
     */
    ActivityLoader.prototype.getOptions = function () {
        var options = {
            message: 'Loading...',
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
     * Show activity loader.
     */
    ActivityLoader.prototype.show = function () {
        try {
            this._loader.show(this.getOptions());
        }
        catch (e) {
            console.log('Error while showing lodingindicator. ' + e);
        }
    };
    /**
     * Hide activity loader.
     */
    ActivityLoader.prototype.hide = function () {
        this._loader.hide();
    };
    return ActivityLoader;
}());
exports.ActivityLoader = ActivityLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlsb2FkZXIuY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aXZpdHlsb2FkZXIuY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7O0dBRUc7QUFDSCxJQUFNLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLGdCQUFnQixDQUFDO0FBQ3BGOztHQUVHO0FBQ0g7SUFBQTtRQUNJLDBDQUEwQztRQUNsQyxZQUFPLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0lBa0Q3QyxDQUFDO0lBakRHOzs7T0FHRztJQUNLLG1DQUFVLEdBQWxCO1FBQ0ksSUFBTSxPQUFPLEdBQUc7WUFDWixPQUFPLEVBQUUsWUFBWTtZQUNyQixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRTtnQkFDTCxhQUFhLEVBQUUsSUFBSTtnQkFDbkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGNBQWMsWUFBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsR0FBRyxFQUFFLEdBQUc7Z0JBQ1Isb0JBQW9CLEVBQUUsU0FBUztnQkFDL0IscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLGlCQUFpQixFQUFFLENBQUM7YUFDdkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0QsT0FBTyxFQUFFLHlCQUF5QjtnQkFDbEMsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLEtBQUssRUFBRSxTQUFTO2dCQUNoQixrQ0FBa0M7Z0JBQ2xDLHVDQUF1QztnQkFDdkMsZUFBZSxFQUFFLFFBQVE7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJO2FBR2xCO1NBQ0osQ0FBQztRQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNEOztPQUVHO0lBQ0gsNkJBQUksR0FBSjtRQUNJLElBQUksQ0FBQztZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsT0FBTyxDQUFDLEdBQUcsQ0FBQyx1Q0FBdUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0wsQ0FBQztJQUNEOztPQUVHO0lBQ0gsNkJBQUksR0FBSjtRQUNJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQXBERCxJQW9EQztBQXBEWSx3Q0FBYyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogTG9hZGluZ0luZGljYXRvciBJbnN0YW5jZSB2YXJpYWJsZS5cbiAqL1xuY29uc3QgTG9hZGluZ0luZGljYXRvciA9IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1sb2FkaW5nLWluZGljYXRvcicpLkxvYWRpbmdJbmRpY2F0b3I7XG4vKipcbiAqIEFjdGl2aXR5IGxvYWRlciBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2aXR5TG9hZGVyIHtcbiAgICAvKiogTG9hZGluZ0luZGljYXRvciBJbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwcml2YXRlIF9sb2FkZXIgPSBuZXcgTG9hZGluZ0luZGljYXRvcigpO1xuICAgIC8qKlxuICAgICAqIEdldHMgTG9hZGluZ0luZGljYXRvciBvcHRpb25zIGZvciBib3RoIGFuZHJvaWQgYW5kIGlvcy5cbiAgICAgKiBAcmV0dXJucyBvcHRpb25zXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRPcHRpb25zKCk6IGFueSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXNzYWdlOiAnTG9hZGluZy4uLicsXG4gICAgICAgICAgICBwcm9ncmVzczogMC42NSxcbiAgICAgICAgICAgIGFuZHJvaWQ6IHtcbiAgICAgICAgICAgICAgICBpbmRldGVybWluYXRlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsTGlzdGVuZXIoZGlhbG9nKSB7IGNvbnNvbGUubG9nKCdMb2FkaW5nIGNhbmNlbGxlZCcpOyB9LFxuICAgICAgICAgICAgICAgIG1heDogMTAwLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzTnVtYmVyRm9ybWF0OiAnJTFkLyUyZCcsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NQZXJjZW50Rm9ybWF0OiAwLjUzLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzU3R5bGU6IDEsXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5UHJvZ3Jlc3M6IDEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaW9zOiB7XG4gICAgICAgICAgICAgICAgZGV0YWlsczogJ0FkZGl0aW9uYWwgZGV0YWlsIG5vdGUhJyxcbiAgICAgICAgICAgICAgICBtYXJnaW46IDEwLFxuICAgICAgICAgICAgICAgIGRpbUJhY2tncm91bmQ6IHRydWUsXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNEI5RUQ2JywgLy8gY29sb3Igb2YgaW5kaWNhdG9yIGFuZCBsYWJlbHNcbiAgICAgICAgICAgICAgICAvLyBiYWNrZ3JvdW5kIGJveCBhcm91bmQgaW5kaWNhdG9yXG4gICAgICAgICAgICAgICAgLy8gaGlkZUJlemVsIHdpbGwgb3ZlcnJpZGUgdGhpcyBpZiB0cnVlXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAneWVsbG93JyxcbiAgICAgICAgICAgICAgICBoaWRlQmV6ZWw6IHRydWUsIC8vIGRlZmF1bHQgZmFsc2UsIGNhbiBoaWRlIHRoZSBzdXJyb3VuZGluZyBiZXplbFxuICAgICAgICAgICAgICAgIC8vIHZpZXc6IFVJVmlldyAvLyBUYXJnZXQgdmlldyB0byBzaG93IG9uIHRvcCBvZiAoRGVmYXVsdHMgdG8gZW50aXJlIHdpbmRvdylcbiAgICAgICAgICAgICAgICAvLyAgbW9kZTogLy8gc2VlIGlPUyBzcGVjaWZpYyBvcHRpb25zIGJlbG93XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gb3B0aW9ucztcbiAgICB9XG4gICAgLyoqXG4gICAgICogU2hvdyBhY3Rpdml0eSBsb2FkZXIuXG4gICAgICovXG4gICAgc2hvdygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRlci5zaG93KHRoaXMuZ2V0T3B0aW9ucygpKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0Vycm9yIHdoaWxlIHNob3dpbmcgbG9kaW5naW5kaWNhdG9yLiAnICsgZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogSGlkZSBhY3Rpdml0eSBsb2FkZXIuXG4gICAgICovXG4gICAgaGlkZSgpIHtcbiAgICAgICAgdGhpcy5fbG9hZGVyLmhpZGUoKTtcbiAgICB9XG59XG4iXX0=