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
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
/** A simple logger class, which is being used to write log information to a file OxsEye.log */
var OxsEyeLogger = (function () {
    /** Constructor for OxsEyeLogger */
    function OxsEyeLogger() {
        var _this = this;
        /** Log message separator */
        this.ERROR_MSG_SEPARATOR = ': ';
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
            var appRootPath = file_system_1.knownFolders.currentApp();
            if (!_this.file) {
                _this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
                _this.file.removeSync(function (error) {
                    Toast.makeText('Error while clearing OxsEye log file.');
                });
            }
            _this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
        }).catch(function () {
            Toast.makeText('Error while giving permission to oxseye.log file.', 'long').show();
            console.log('Permission is not granted (sadface)');
        });
    }
    /** Method to log message in debug level
     *
     * @param message Message to be written to log file
     * @param optionalParams optional parameters to be written if any along with original message
     */
    OxsEyeLogger.prototype.debug = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.append('DEBUG', message + " " + JSON.stringify(optionalParams));
    };
    /** Method to log message in info level
     *
     * @param message Message to be written to log file
     * @param optionalParams optional parameters to be written if any along with original message
     */
    OxsEyeLogger.prototype.info = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.append('INFO ', message + " " + JSON.stringify(optionalParams));
    };
    /** Method to log message in warning level
     *
     * @param message Message to be written to log file
     * @param optionalParams optional parameters to be written if any along with original message
    */
    OxsEyeLogger.prototype.warn = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.append('WARN ', message + " " + JSON.stringify(optionalParams));
    };
    /** Method to log message in error level
     *
     * @param message Message to be written to log file
     * @param optionalParams optional parameters to be written if any along with original message
    */
    OxsEyeLogger.prototype.error = function (message) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        this.append('ERROR', message + " " + JSON.stringify(optionalParams));
    };
    /** Method to append message in log file OxsEye.log.
     * Acutally, it reads the existing contents and adds it with new coming
     * message and writes to the log file.
     *
     * @param type indicates what type of message is it, like 'debug', 'info', 'warn' or 'error'
     */
    OxsEyeLogger.prototype.append = function (type, message) {
        var content = this.file.readTextSync(function (error) {
            Toast.makeText('Error while reading logs. ' + error, 'long').show();
        });
        content = content + '\n' + new Date().toISOString() + ' ' + type + message;
        this.file.writeTextSync("" + content);
    };
    return OxsEyeLogger;
}());
OxsEyeLogger = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], OxsEyeLogger);
exports.OxsEyeLogger = OxsEyeLogger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3hzZXllbG9nZ2VyLmFuZHJvaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJveHNleWVsb2dnZXIuYW5kcm9pZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLHNDQUEyQztBQUMzQyw0REFBa0U7QUFFbEUsc0RBQXdEO0FBQ3hELDBDQUE0QztBQUU1QywrRkFBK0Y7QUFFL0YsSUFBYSxZQUFZO0lBT3ZCLG1DQUFtQztJQUNuQztRQUFBLGlCQWlCQztRQXJCRCw0QkFBNEI7UUFDckIsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1FBSWhDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FDM0IsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUI7WUFDbEQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsc0JBQXNCLENBQUMsRUFDbkQsMEJBQTBCLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDL0IsSUFBTSxXQUFXLEdBQUcsMEJBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNmLEtBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNoRSxLQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFDLEtBQUs7b0JBQ3pCLEtBQUssQ0FBQyxRQUFRLENBQUMsdUNBQXVDLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsS0FBSSxDQUFDLElBQUksR0FBRyxrQkFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDLENBQUM7UUFDbEUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1lBQ1AsS0FBSyxDQUFDLFFBQVEsQ0FBQyxtREFBbUQsRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNuRixPQUFPLENBQUMsR0FBRyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7UUFDckQsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLDRCQUFLLEdBQVosVUFBYSxPQUFhO1FBQUUsd0JBQXdCO2FBQXhCLFVBQXdCLEVBQXhCLHFCQUF3QixFQUF4QixJQUF3QjtZQUF4Qix1Q0FBd0I7O1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFLLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSwyQkFBSSxHQUFYLFVBQVksT0FBYTtRQUFFLHdCQUF3QjthQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7WUFBeEIsdUNBQXdCOztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBSyxPQUFPLFNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRDs7OztNQUlFO0lBQ0ssMkJBQUksR0FBWCxVQUFZLE9BQWE7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUssT0FBTyxTQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFHLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0Q7Ozs7TUFJRTtJQUNLLDRCQUFLLEdBQVosVUFBYSxPQUFhO1FBQUUsd0JBQXdCO2FBQXhCLFVBQXdCLEVBQXhCLHFCQUF3QixFQUF4QixJQUF3QjtZQUF4Qix1Q0FBd0I7O1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFLLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0ssNkJBQU0sR0FBZCxVQUFlLElBQVksRUFBRSxPQUFlO1FBQzFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQUMsS0FBVTtZQUM5QyxLQUFLLENBQUMsUUFBUSxDQUFDLDRCQUE0QixHQUFHLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sR0FBRyxPQUFPLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7UUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBRyxPQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBdkVELElBdUVDO0FBdkVZLFlBQVk7SUFEeEIsaUJBQVUsRUFBRTs7R0FDQSxZQUFZLENBdUV4QjtBQXZFWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUsIGtub3duRm9sZGVycyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLyoqIEEgc2ltcGxlIGxvZ2dlciBjbGFzcywgd2hpY2ggaXMgYmVpbmcgdXNlZCB0byB3cml0ZSBsb2cgaW5mb3JtYXRpb24gdG8gYSBmaWxlIE94c0V5ZS5sb2cgKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPeHNFeWVMb2dnZXIge1xuXG4gIC8qKiBGaWxlIGlkZW50aWZpZXIgZm9yIGxvZyBmaWxlIE94c0V5ZS5sb2cgKi9cbiAgcHJpdmF0ZSBmaWxlOiBGaWxlO1xuICAvKiogTG9nIG1lc3NhZ2Ugc2VwYXJhdG9yICovXG4gIHB1YmxpYyBFUlJPUl9NU0dfU0VQQVJBVE9SID0gJzogJztcblxuICAvKiogQ29uc3RydWN0b3IgZm9yIE94c0V5ZUxvZ2dlciAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3QgYXBwUm9vdFBhdGggPSBrbm93bkZvbGRlcnMuY3VycmVudEFwcCgpO1xuICAgICAgICBpZiAoIXRoaXMuZmlsZSkge1xuICAgICAgICAgIHRoaXMuZmlsZSA9IEZpbGUuZnJvbVBhdGgoYXBwUm9vdFBhdGgucGF0aCArICcvbG9nL294c2V5ZS5sb2cnKTtcbiAgICAgICAgICB0aGlzLmZpbGUucmVtb3ZlU3luYygoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBjbGVhcmluZyBPeHNFeWUgbG9nIGZpbGUuJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWxlID0gRmlsZS5mcm9tUGF0aChhcHBSb290UGF0aC5wYXRoICsgJy9sb2cvb3hzZXllLmxvZycpO1xuICAgICAgfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZ2l2aW5nIHBlcm1pc3Npb24gdG8gb3hzZXllLmxvZyBmaWxlLicsICdsb25nJykuc2hvdygpO1xuICAgICAgICBjb25zb2xlLmxvZygnUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSknKTtcbiAgICAgIH0pO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gZGVidWcgbGV2ZWxcbiAgICogXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgd3JpdHRlbiB0byBsb2cgZmlsZVxuICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgb3B0aW9uYWwgcGFyYW1ldGVycyB0byBiZSB3cml0dGVuIGlmIGFueSBhbG9uZyB3aXRoIG9yaWdpbmFsIG1lc3NhZ2VcbiAgICovXG4gIHB1YmxpYyBkZWJ1ZyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmFwcGVuZCgnREVCVUcnLCBgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9wdGlvbmFsUGFyYW1zKX1gKTtcbiAgfVxuICAvKiogTWV0aG9kIHRvIGxvZyBtZXNzYWdlIGluIGluZm8gbGV2ZWxcbiAgICogXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgd3JpdHRlbiB0byBsb2cgZmlsZVxuICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgb3B0aW9uYWwgcGFyYW1ldGVycyB0byBiZSB3cml0dGVuIGlmIGFueSBhbG9uZyB3aXRoIG9yaWdpbmFsIG1lc3NhZ2VcbiAgICovXG4gIHB1YmxpYyBpbmZvKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuYXBwZW5kKCdJTkZPICcsIGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9uYWxQYXJhbXMpfWApO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gd2FybmluZyBsZXZlbFxuICAgKiBcbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSB0byBiZSB3cml0dGVuIHRvIGxvZyBmaWxlXG4gICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHdyaXR0ZW4gaWYgYW55IGFsb25nIHdpdGggb3JpZ2luYWwgbWVzc2FnZVxuICAqL1xuICBwdWJsaWMgd2FybihtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmFwcGVuZCgnV0FSTiAnLCBgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9wdGlvbmFsUGFyYW1zKX1gKTtcbiAgfVxuICAvKiogTWV0aG9kIHRvIGxvZyBtZXNzYWdlIGluIGVycm9yIGxldmVsXG4gICAqIFxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIHdyaXR0ZW4gdG8gbG9nIGZpbGVcbiAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgd3JpdHRlbiBpZiBhbnkgYWxvbmcgd2l0aCBvcmlnaW5hbCBtZXNzYWdlXG4gICovXG4gIHB1YmxpYyBlcnJvcihtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmFwcGVuZCgnRVJST1InLCBgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9wdGlvbmFsUGFyYW1zKX1gKTtcbiAgfVxuICAvKiogTWV0aG9kIHRvIGFwcGVuZCBtZXNzYWdlIGluIGxvZyBmaWxlIE94c0V5ZS5sb2cuXG4gICAqIEFjdXRhbGx5LCBpdCByZWFkcyB0aGUgZXhpc3RpbmcgY29udGVudHMgYW5kIGFkZHMgaXQgd2l0aCBuZXcgY29taW5nXG4gICAqIG1lc3NhZ2UgYW5kIHdyaXRlcyB0byB0aGUgbG9nIGZpbGUuXG4gICAqIFxuICAgKiBAcGFyYW0gdHlwZSBpbmRpY2F0ZXMgd2hhdCB0eXBlIG9mIG1lc3NhZ2UgaXMgaXQsIGxpa2UgJ2RlYnVnJywgJ2luZm8nLCAnd2Fybicgb3IgJ2Vycm9yJ1xuICAgKi9cbiAgcHJpdmF0ZSBhcHBlbmQodHlwZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBsZXQgY29udGVudCA9IHRoaXMuZmlsZS5yZWFkVGV4dFN5bmMoKGVycm9yOiBhbnkpID0+IHtcbiAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSByZWFkaW5nIGxvZ3MuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgfSk7XG4gICAgY29udGVudCA9IGNvbnRlbnQgKyAnXFxuJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSArICcgJyArIHR5cGUgKyBtZXNzYWdlO1xuICAgIHRoaXMuZmlsZS53cml0ZVRleHRTeW5jKGAke2NvbnRlbnR9YCk7XG4gIH1cbn1cbiJdfQ==