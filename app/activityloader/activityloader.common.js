"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;
/**
 * Activity loader class.
 */
var ActivityLoader = (function () {
    function ActivityLoader() {
        this._loader = new LoadingIndicator();
    }
    // android and ios have some platform specific options
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlsb2FkZXIuY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aXZpdHlsb2FkZXIuY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztBQUNwRjs7R0FFRztBQUNIO0lBQUE7UUFDWSxZQUFPLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0lBZ0Q3QyxDQUFDO0lBOUNHLHNEQUFzRDtJQUM5QyxtQ0FBVSxHQUFsQjtRQUNJLElBQU0sT0FBTyxHQUFHO1lBQ1osT0FBTyxFQUFFLFlBQVk7WUFDckIsUUFBUSxFQUFFLElBQUk7WUFDZCxPQUFPLEVBQUU7Z0JBQ0wsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixjQUFjLFlBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVELEdBQUcsRUFBRSxHQUFHO2dCQUNSLG9CQUFvQixFQUFFLFNBQVM7Z0JBQy9CLHFCQUFxQixFQUFFLElBQUk7Z0JBQzNCLGFBQWEsRUFBRSxDQUFDO2dCQUNoQixpQkFBaUIsRUFBRSxDQUFDO2FBQ3ZCO1lBQ0QsR0FBRyxFQUFFO2dCQUNELE9BQU8sRUFBRSx5QkFBeUI7Z0JBQ2xDLE1BQU0sRUFBRSxFQUFFO2dCQUNWLGFBQWEsRUFBRSxJQUFJO2dCQUNuQixLQUFLLEVBQUUsU0FBUztnQkFDaEIsa0NBQWtDO2dCQUNsQyx1Q0FBdUM7Z0JBQ3ZDLGVBQWUsRUFBRSxRQUFRO2dCQUN6QixTQUFTLEVBQUUsSUFBSTthQUdsQjtTQUNKLENBQUM7UUFDRixNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ25CLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUM7WUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztRQUN6QyxDQUFDO1FBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0QsQ0FBQztJQUNMLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUFqREQsSUFpREM7QUFqRFksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBMb2FkaW5nSW5kaWNhdG9yID0gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWxvYWRpbmctaW5kaWNhdG9yJykuTG9hZGluZ0luZGljYXRvcjtcbi8qKlxuICogQWN0aXZpdHkgbG9hZGVyIGNsYXNzLlxuICovXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlMb2FkZXIge1xuICAgIHByaXZhdGUgX2xvYWRlciA9IG5ldyBMb2FkaW5nSW5kaWNhdG9yKCk7XG5cbiAgICAvLyBhbmRyb2lkIGFuZCBpb3MgaGF2ZSBzb21lIHBsYXRmb3JtIHNwZWNpZmljIG9wdGlvbnNcbiAgICBwcml2YXRlIGdldE9wdGlvbnMoKTogYW55IHtcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdMb2FkaW5nLi4uJyxcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLjY1LFxuICAgICAgICAgICAgYW5kcm9pZDoge1xuICAgICAgICAgICAgICAgIGluZGV0ZXJtaW5hdGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxMaXN0ZW5lcihkaWFsb2cpIHsgY29uc29sZS5sb2coJ0xvYWRpbmcgY2FuY2VsbGVkJyk7IH0sXG4gICAgICAgICAgICAgICAgbWF4OiAxMDAsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NOdW1iZXJGb3JtYXQ6ICclMWQvJTJkJyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1BlcmNlbnRGb3JtYXQ6IDAuNTMsXG4gICAgICAgICAgICAgICAgcHJvZ3Jlc3NTdHlsZTogMSxcbiAgICAgICAgICAgICAgICBzZWNvbmRhcnlQcm9ncmVzczogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpb3M6IHtcbiAgICAgICAgICAgICAgICBkZXRhaWxzOiAnQWRkaXRpb25hbCBkZXRhaWwgbm90ZSEnLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogMTAsXG4gICAgICAgICAgICAgICAgZGltQmFja2dyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjb2xvcjogJyM0QjlFRDYnLCAvLyBjb2xvciBvZiBpbmRpY2F0b3IgYW5kIGxhYmVsc1xuICAgICAgICAgICAgICAgIC8vIGJhY2tncm91bmQgYm94IGFyb3VuZCBpbmRpY2F0b3JcbiAgICAgICAgICAgICAgICAvLyBoaWRlQmV6ZWwgd2lsbCBvdmVycmlkZSB0aGlzIGlmIHRydWVcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd5ZWxsb3cnLFxuICAgICAgICAgICAgICAgIGhpZGVCZXplbDogdHJ1ZSwgLy8gZGVmYXVsdCBmYWxzZSwgY2FuIGhpZGUgdGhlIHN1cnJvdW5kaW5nIGJlemVsXG4gICAgICAgICAgICAgICAgLy8gdmlldzogVUlWaWV3IC8vIFRhcmdldCB2aWV3IHRvIHNob3cgb24gdG9wIG9mIChEZWZhdWx0cyB0byBlbnRpcmUgd2luZG93KVxuICAgICAgICAgICAgICAgIC8vICBtb2RlOiAvLyBzZWUgaU9TIHNwZWNpZmljIG9wdGlvbnMgYmVsb3dcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBvcHRpb25zO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTaG93IGFjdGl2aXR5IGxvYWRlci5cbiAgICAgKi9cbiAgICBzaG93KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVyLnNob3codGhpcy5nZXRPcHRpb25zKCkpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3Igd2hpbGUgc2hvd2luZyBsb2RpbmdpbmRpY2F0b3IuICcgKyBlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvKipcbiAgICAgKiBIaWRlIGFjdGl2aXR5IGxvYWRlci5cbiAgICAgKi9cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLl9sb2FkZXIuaGlkZSgpO1xuICAgIH1cbn1cbiJdfQ==