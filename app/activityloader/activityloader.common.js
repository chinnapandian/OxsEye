"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var oxseyelogger_1 = require("../logger/oxseyelogger");
/**
 * LoadingIndicator Instance variable.
 */
var LoadingIndicator = require('nativescript-loading-indicator').LoadingIndicator;
/**
 * Activity loader class to show up application event progress dialog box.
 */
var ActivityLoader = (function () {
    function ActivityLoader() {
        /** LoadingIndicator Instance variable. */
        this._loader = new LoadingIndicator();
        /** Logger variable to log message in different level */
        this.logger = new oxseyelogger_1.OxsEyeLogger();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHlsb2FkZXIuY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWN0aXZpdHlsb2FkZXIuY29tbW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdURBQXNEO0FBQ3REOztHQUVHO0FBQ0gsSUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQztBQUVwRjs7R0FFRztBQUNIO0lBQUE7UUFDSSwwQ0FBMEM7UUFDbEMsWUFBTyxHQUFHLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztRQUN6Qyx3REFBd0Q7UUFDaEQsV0FBTSxHQUFHLElBQUksMkJBQVksRUFBRSxDQUFDO0lBbUR4QyxDQUFDO0lBakRHOzs7T0FHRztJQUNLLG1DQUFVLEdBQWxCO1FBQ0ksSUFBTSxPQUFPLEdBQUc7WUFDWixPQUFPLEVBQUUsWUFBWTtZQUNyQixRQUFRLEVBQUUsSUFBSTtZQUNkLE9BQU8sRUFBRTtnQkFDTCxhQUFhLEVBQUUsSUFBSTtnQkFDbkIsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLGNBQWMsWUFBQyxNQUFNLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUQsR0FBRyxFQUFFLEdBQUc7Z0JBQ1Isb0JBQW9CLEVBQUUsU0FBUztnQkFDL0IscUJBQXFCLEVBQUUsSUFBSTtnQkFDM0IsYUFBYSxFQUFFLENBQUM7Z0JBQ2hCLGlCQUFpQixFQUFFLENBQUM7YUFDdkI7WUFDRCxHQUFHLEVBQUU7Z0JBQ0QsT0FBTyxFQUFFLHlCQUF5QjtnQkFDbEMsTUFBTSxFQUFFLEVBQUU7Z0JBQ1YsYUFBYSxFQUFFLElBQUk7Z0JBQ25CLEtBQUssRUFBRSxTQUFTO2dCQUNoQixrQ0FBa0M7Z0JBQ2xDLHVDQUF1QztnQkFDdkMsZUFBZSxFQUFFLFFBQVE7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJO2FBR2xCO1NBQ0osQ0FBQztRQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUNEOztPQUVHO0lBQ0gsNkJBQUksR0FBSjtRQUNJLElBQUksQ0FBQztZQUNELElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUNBQXVDLEdBQUcsS0FBSyxDQUFDLENBQUM7UUFDdkUsQ0FBQztJQUNMLENBQUM7SUFDRDs7T0FFRztJQUNILDZCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFDTCxxQkFBQztBQUFELENBQUMsQUF2REQsSUF1REM7QUF2RFksd0NBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcbi8qKlxuICogTG9hZGluZ0luZGljYXRvciBJbnN0YW5jZSB2YXJpYWJsZS5cbiAqL1xuY29uc3QgTG9hZGluZ0luZGljYXRvciA9IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1sb2FkaW5nLWluZGljYXRvcicpLkxvYWRpbmdJbmRpY2F0b3I7XG5cbi8qKlxuICogQWN0aXZpdHkgbG9hZGVyIGNsYXNzIHRvIHNob3cgdXAgYXBwbGljYXRpb24gZXZlbnQgcHJvZ3Jlc3MgZGlhbG9nIGJveC5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2aXR5TG9hZGVyIHtcbiAgICAvKiogTG9hZGluZ0luZGljYXRvciBJbnN0YW5jZSB2YXJpYWJsZS4gKi9cbiAgICBwcml2YXRlIF9sb2FkZXIgPSBuZXcgTG9hZGluZ0luZGljYXRvcigpO1xuICAgIC8qKiBMb2dnZXIgdmFyaWFibGUgdG8gbG9nIG1lc3NhZ2UgaW4gZGlmZmVyZW50IGxldmVsICovXG4gICAgcHJpdmF0ZSBsb2dnZXIgPSBuZXcgT3hzRXllTG9nZ2VyKCk7XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIExvYWRpbmdJbmRpY2F0b3Igb3B0aW9ucyBmb3IgYm90aCBhbmRyb2lkIGFuZCBpb3MuXG4gICAgICogQHJldHVybnMgb3B0aW9uc1xuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0T3B0aW9ucygpOiBhbnkge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgbWVzc2FnZTogJ0xvYWRpbmcuLi4nLFxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAuNjUsXG4gICAgICAgICAgICBhbmRyb2lkOiB7XG4gICAgICAgICAgICAgICAgaW5kZXRlcm1pbmF0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBjYW5jZWxhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNhbmNlbExpc3RlbmVyKGRpYWxvZykgeyBjb25zb2xlLmxvZygnTG9hZGluZyBjYW5jZWxsZWQnKTsgfSxcbiAgICAgICAgICAgICAgICBtYXg6IDEwMCxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc051bWJlckZvcm1hdDogJyUxZC8lMmQnLFxuICAgICAgICAgICAgICAgIHByb2dyZXNzUGVyY2VudEZvcm1hdDogMC41MyxcbiAgICAgICAgICAgICAgICBwcm9ncmVzc1N0eWxlOiAxLFxuICAgICAgICAgICAgICAgIHNlY29uZGFyeVByb2dyZXNzOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlvczoge1xuICAgICAgICAgICAgICAgIGRldGFpbHM6ICdBZGRpdGlvbmFsIGRldGFpbCBub3RlIScsXG4gICAgICAgICAgICAgICAgbWFyZ2luOiAxMCxcbiAgICAgICAgICAgICAgICBkaW1CYWNrZ3JvdW5kOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbG9yOiAnIzRCOUVENicsIC8vIGNvbG9yIG9mIGluZGljYXRvciBhbmQgbGFiZWxzXG4gICAgICAgICAgICAgICAgLy8gYmFja2dyb3VuZCBib3ggYXJvdW5kIGluZGljYXRvclxuICAgICAgICAgICAgICAgIC8vIGhpZGVCZXplbCB3aWxsIG92ZXJyaWRlIHRoaXMgaWYgdHJ1ZVxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3llbGxvdycsXG4gICAgICAgICAgICAgICAgaGlkZUJlemVsOiB0cnVlLCAvLyBkZWZhdWx0IGZhbHNlLCBjYW4gaGlkZSB0aGUgc3Vycm91bmRpbmcgYmV6ZWxcbiAgICAgICAgICAgICAgICAvLyB2aWV3OiBVSVZpZXcgLy8gVGFyZ2V0IHZpZXcgdG8gc2hvdyBvbiB0b3Agb2YgKERlZmF1bHRzIHRvIGVudGlyZSB3aW5kb3cpXG4gICAgICAgICAgICAgICAgLy8gIG1vZGU6IC8vIHNlZSBpT1Mgc3BlY2lmaWMgb3B0aW9ucyBiZWxvd1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNob3dzIGFjdGl2aXR5IGxvYWRlci5cbiAgICAgKi9cbiAgICBzaG93KCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdGhpcy5fbG9hZGVyLnNob3codGhpcy5nZXRPcHRpb25zKCkpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0Vycm9yIHdoaWxlIHNob3dpbmcgbG9kaW5naW5kaWNhdG9yLiAnICsgZXJyb3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEhpZGVzIGFjdGl2aXR5IGxvYWRlci5cbiAgICAgKi9cbiAgICBoaWRlKCkge1xuICAgICAgICB0aGlzLl9sb2FkZXIuaGlkZSgpO1xuICAgIH1cbn1cbiJdfQ==