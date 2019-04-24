"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// this import should be first in order to load some required settings (like globals and reflect-metadata)
var platform_1 = require("nativescript-angular/platform");
var application = require("tns-core-modules/application");
var traceModule = require("tns-core-modules/trace");
var app_module_1 = require("./app.module");
/**
 * Error handler variable to handle error across system.
 */
var errorHandler = {
    handlerError: function (err) {
        // option 1 (development) - throw the error
        // throw err;
        alert('error :' + err);
        // option 2 (development) - logging the error via write method provided from trace module
        traceModule.write(err, 'unhandled-error', traceModule.messageType.error);
        // (production) - custom functionality for error handling
        // reportToAnalytics(err)
    },
};
traceModule.setErrorHandler(errorHandler);
// application.run({ moduleName: 'AppModule' });
application.on('discardedErrorEvent', function (args) {
    var error = args.error;
    alert(error);
    console.log('Received discarded exception:');
    console.log(error.message);
    console.log(error.stackTrace);
    console.log(error.nativeException);
    // report the exception in your analytics solution here
});
platform_1.platformNativeScriptDynamic().bootstrapModule(app_module_1.AppModule);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwR0FBMEc7QUFDMUcsMERBQTRFO0FBRTVFLDBEQUE0RDtBQUM1RCxvREFBc0Q7QUFDdEQsMkNBQXlDO0FBQ3pDOztHQUVHO0FBQ0gsSUFBTSxZQUFZLEdBQTZCO0lBQzNDLFlBQVksWUFBQyxHQUFHO1FBQ1osMkNBQTJDO1FBQzNDLGFBQWE7UUFDYixLQUFLLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLHlGQUF5RjtRQUN6RixXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxpQkFBaUIsRUFBRSxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXpFLHlEQUF5RDtRQUN6RCx5QkFBeUI7SUFDN0IsQ0FBQztDQUNKLENBQUM7QUFFRixXQUFXLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzFDLGdEQUFnRDtBQUNoRCxXQUFXLENBQUMsRUFBRSxDQUFDLHFCQUFxQixFQUFFLFVBQUMsSUFBSTtJQUN2QyxJQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3pCLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNiLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM5QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNuQyx1REFBdUQ7QUFDM0QsQ0FBQyxDQUFDLENBQUM7QUFDSCxzQ0FBMkIsRUFBRSxDQUFDLGVBQWUsQ0FBQyxzQkFBUyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0aGlzIGltcG9ydCBzaG91bGQgYmUgZmlyc3QgaW4gb3JkZXIgdG8gbG9hZCBzb21lIHJlcXVpcmVkIHNldHRpbmdzIChsaWtlIGdsb2JhbHMgYW5kIHJlZmxlY3QtbWV0YWRhdGEpXG5pbXBvcnQgeyBwbGF0Zm9ybU5hdGl2ZVNjcmlwdER5bmFtaWMgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9wbGF0Zm9ybSc7XG5cbmltcG9ydCAqIGFzIGFwcGxpY2F0aW9uIGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvYXBwbGljYXRpb24nO1xuaW1wb3J0ICogYXMgdHJhY2VNb2R1bGUgZnJvbSAndG5zLWNvcmUtbW9kdWxlcy90cmFjZSc7XG5pbXBvcnQgeyBBcHBNb2R1bGUgfSBmcm9tICcuL2FwcC5tb2R1bGUnO1xuLyoqXG4gKiBFcnJvciBoYW5kbGVyIHZhcmlhYmxlIHRvIGhhbmRsZSBlcnJvciBhY3Jvc3Mgc3lzdGVtLlxuICovXG5jb25zdCBlcnJvckhhbmRsZXI6IHRyYWNlTW9kdWxlLkVycm9ySGFuZGxlciA9IHtcbiAgICBoYW5kbGVyRXJyb3IoZXJyKSB7XG4gICAgICAgIC8vIG9wdGlvbiAxIChkZXZlbG9wbWVudCkgLSB0aHJvdyB0aGUgZXJyb3JcbiAgICAgICAgLy8gdGhyb3cgZXJyO1xuICAgICAgICBhbGVydCgnZXJyb3IgOicgKyBlcnIpO1xuICAgICAgICAvLyBvcHRpb24gMiAoZGV2ZWxvcG1lbnQpIC0gbG9nZ2luZyB0aGUgZXJyb3IgdmlhIHdyaXRlIG1ldGhvZCBwcm92aWRlZCBmcm9tIHRyYWNlIG1vZHVsZVxuICAgICAgICB0cmFjZU1vZHVsZS53cml0ZShlcnIsICd1bmhhbmRsZWQtZXJyb3InLCB0cmFjZU1vZHVsZS5tZXNzYWdlVHlwZS5lcnJvcik7XG5cbiAgICAgICAgLy8gKHByb2R1Y3Rpb24pIC0gY3VzdG9tIGZ1bmN0aW9uYWxpdHkgZm9yIGVycm9yIGhhbmRsaW5nXG4gICAgICAgIC8vIHJlcG9ydFRvQW5hbHl0aWNzKGVycilcbiAgICB9LFxufTtcblxudHJhY2VNb2R1bGUuc2V0RXJyb3JIYW5kbGVyKGVycm9ySGFuZGxlcik7XG4vLyBhcHBsaWNhdGlvbi5ydW4oeyBtb2R1bGVOYW1lOiAnQXBwTW9kdWxlJyB9KTtcbmFwcGxpY2F0aW9uLm9uKCdkaXNjYXJkZWRFcnJvckV2ZW50JywgKGFyZ3MpID0+IHtcbiAgICBjb25zdCBlcnJvciA9IGFyZ3MuZXJyb3I7XG4gICAgYWxlcnQoZXJyb3IpO1xuICAgIGNvbnNvbGUubG9nKCdSZWNlaXZlZCBkaXNjYXJkZWQgZXhjZXB0aW9uOicpO1xuICAgIGNvbnNvbGUubG9nKGVycm9yLm1lc3NhZ2UpO1xuICAgIGNvbnNvbGUubG9nKGVycm9yLnN0YWNrVHJhY2UpO1xuICAgIGNvbnNvbGUubG9nKGVycm9yLm5hdGl2ZUV4Y2VwdGlvbik7XG4gICAgLy8gcmVwb3J0IHRoZSBleGNlcHRpb24gaW4geW91ciBhbmFseXRpY3Mgc29sdXRpb24gaGVyZVxufSk7XG5wbGF0Zm9ybU5hdGl2ZVNjcmlwdER5bmFtaWMoKS5ib290c3RyYXBNb2R1bGUoQXBwTW9kdWxlKTtcbiJdfQ==