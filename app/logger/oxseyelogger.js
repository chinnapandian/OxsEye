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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3hzZXllbG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3hzZXllbG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsc0NBQTJDO0FBQzNDLDREQUFrRTtBQUVsRSxzREFBd0Q7QUFDeEQsMENBQTRDO0FBRTVDLCtGQUErRjtBQUUvRixJQUFhLFlBQVk7SUFPdkIsbUNBQW1DO0lBQ25DO1FBQUEsaUJBaUJDO1FBckJELDRCQUE0QjtRQUNyQix3QkFBbUIsR0FBRyxJQUFJLENBQUM7UUFJaEMsV0FBVyxDQUFDLGlCQUFpQixDQUMzQixDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLHFCQUFxQjtZQUNsRCxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxzQkFBc0IsQ0FBQyxFQUNuRCwwQkFBMEIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMvQixJQUFNLFdBQVcsR0FBRywwQkFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzlDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsS0FBSSxDQUFDLElBQUksR0FBRyxrQkFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDLENBQUM7Z0JBQ2hFLEtBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQUMsS0FBSztvQkFDekIsS0FBSyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUMxRCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUM7WUFDRCxLQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsaUJBQWlCLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7WUFDUCxLQUFLLENBQUMsUUFBUSxDQUFDLG1EQUFtRCxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25GLE9BQU8sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRDs7OztPQUlHO0lBQ0ksNEJBQUssR0FBWixVQUFhLE9BQWE7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUssT0FBTyxTQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFHLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLDJCQUFJLEdBQVgsVUFBWSxPQUFhO1FBQUUsd0JBQXdCO2FBQXhCLFVBQXdCLEVBQXhCLHFCQUF3QixFQUF4QixJQUF3QjtZQUF4Qix1Q0FBd0I7O1FBQ2pELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFLLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNEOzs7O01BSUU7SUFDSywyQkFBSSxHQUFYLFVBQVksT0FBYTtRQUFFLHdCQUF3QjthQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7WUFBeEIsdUNBQXdCOztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBSyxPQUFPLFNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRDs7OztNQUlFO0lBQ0ssNEJBQUssR0FBWixVQUFhLE9BQWE7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDbEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUssT0FBTyxTQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFHLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0Q7Ozs7O09BS0c7SUFDSyw2QkFBTSxHQUFkLFVBQWUsSUFBWSxFQUFFLE9BQWU7UUFDMUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBQyxLQUFVO1lBQzlDLEtBQUssQ0FBQyxRQUFRLENBQUMsNEJBQTRCLEdBQUcsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxHQUFHLE9BQU8sR0FBRyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUMzRSxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFHLE9BQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFDSCxtQkFBQztBQUFELENBQUMsQUF2RUQsSUF1RUM7QUF2RVksWUFBWTtJQUR4QixpQkFBVSxFQUFFOztHQUNBLFlBQVksQ0F1RXhCO0FBdkVZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRmlsZSwga25vd25Gb2xkZXJzIH0gZnJvbSAndG5zLWNvcmUtbW9kdWxlcy9maWxlLXN5c3RlbSc7XG5cbmltcG9ydCAqIGFzIFBlcm1pc3Npb25zIGZyb20gJ25hdGl2ZXNjcmlwdC1wZXJtaXNzaW9ucyc7XG5pbXBvcnQgKiBhcyBUb2FzdCBmcm9tICduYXRpdmVzY3JpcHQtdG9hc3QnO1xuXG4vKiogQSBzaW1wbGUgbG9nZ2VyIGNsYXNzLCB3aGljaCBpcyBiZWluZyB1c2VkIHRvIHdyaXRlIGxvZyBpbmZvcm1hdGlvbiB0byBhIGZpbGUgT3hzRXllLmxvZyAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE94c0V5ZUxvZ2dlciB7XG5cbiAgLyoqIEZpbGUgaWRlbnRpZmllciBmb3IgbG9nIGZpbGUgT3hzRXllLmxvZyAqL1xuICBwcml2YXRlIGZpbGU6IEZpbGU7XG4gIC8qKiBMb2cgbWVzc2FnZSBzZXBhcmF0b3IgKi9cbiAgcHVibGljIEVSUk9SX01TR19TRVBBUkFUT1IgPSAnOiAnO1xuXG4gIC8qKiBDb25zdHJ1Y3RvciBmb3IgT3hzRXllTG9nZ2VyICovXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcigpIHtcbiAgICBQZXJtaXNzaW9ucy5yZXF1ZXN0UGVybWlzc2lvbihcbiAgICAgIFthbmRyb2lkLk1hbmlmZXN0LnBlcm1pc3Npb24uUkVBRF9FWFRFUk5BTF9TVE9SQUdFLFxuICAgICAgYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLldSSVRFX0VYVEVSTkFMX1NUT1JBR0VdLFxuICAgICAgJ05lZWRlZCBmb3Igc2hhcmluZyBmaWxlcycpLnRoZW4oKCkgPT4ge1xuICAgICAgICBjb25zdCBhcHBSb290UGF0aCA9IGtub3duRm9sZGVycy5jdXJyZW50QXBwKCk7XG4gICAgICAgIGlmICghdGhpcy5maWxlKSB7XG4gICAgICAgICAgdGhpcy5maWxlID0gRmlsZS5mcm9tUGF0aChhcHBSb290UGF0aC5wYXRoICsgJy9sb2cvb3hzZXllLmxvZycpO1xuICAgICAgICAgIHRoaXMuZmlsZS5yZW1vdmVTeW5jKChlcnJvcikgPT4ge1xuICAgICAgICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIGNsZWFyaW5nIE94c0V5ZSBsb2cgZmlsZS4nKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmZpbGUgPSBGaWxlLmZyb21QYXRoKGFwcFJvb3RQYXRoLnBhdGggKyAnL2xvZy9veHNleWUubG9nJyk7XG4gICAgICB9KS5jYXRjaCgoKSA9PiB7XG4gICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBnaXZpbmcgcGVybWlzc2lvbiB0byBveHNleWUubG9nIGZpbGUuJywgJ2xvbmcnKS5zaG93KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQZXJtaXNzaW9uIGlzIG5vdCBncmFudGVkIChzYWRmYWNlKScpO1xuICAgICAgfSk7XG4gIH1cbiAgLyoqIE1ldGhvZCB0byBsb2cgbWVzc2FnZSBpbiBkZWJ1ZyBsZXZlbFxuICAgKiBcbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSB0byBiZSB3cml0dGVuIHRvIGxvZyBmaWxlXG4gICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHdyaXR0ZW4gaWYgYW55IGFsb25nIHdpdGggb3JpZ2luYWwgbWVzc2FnZVxuICAgKi9cbiAgcHVibGljIGRlYnVnKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuYXBwZW5kKCdERUJVRycsIGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9uYWxQYXJhbXMpfWApO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gaW5mbyBsZXZlbFxuICAgKiBcbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSB0byBiZSB3cml0dGVuIHRvIGxvZyBmaWxlXG4gICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHdyaXR0ZW4gaWYgYW55IGFsb25nIHdpdGggb3JpZ2luYWwgbWVzc2FnZVxuICAgKi9cbiAgcHVibGljIGluZm8obWVzc2FnZT86IGFueSwgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5hcHBlbmQoJ0lORk8gJywgYCR7bWVzc2FnZX0gJHtKU09OLnN0cmluZ2lmeShvcHRpb25hbFBhcmFtcyl9YCk7XG4gIH1cbiAgLyoqIE1ldGhvZCB0byBsb2cgbWVzc2FnZSBpbiB3YXJuaW5nIGxldmVsXG4gICAqIFxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIHdyaXR0ZW4gdG8gbG9nIGZpbGVcbiAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgd3JpdHRlbiBpZiBhbnkgYWxvbmcgd2l0aCBvcmlnaW5hbCBtZXNzYWdlXG4gICovXG4gIHB1YmxpYyB3YXJuKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuYXBwZW5kKCdXQVJOICcsIGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9uYWxQYXJhbXMpfWApO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gZXJyb3IgbGV2ZWxcbiAgICogXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gYmUgd3JpdHRlbiB0byBsb2cgZmlsZVxuICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgb3B0aW9uYWwgcGFyYW1ldGVycyB0byBiZSB3cml0dGVuIGlmIGFueSBhbG9uZyB3aXRoIG9yaWdpbmFsIG1lc3NhZ2VcbiAgKi9cbiAgcHVibGljIGVycm9yKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuYXBwZW5kKCdFUlJPUicsIGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9uYWxQYXJhbXMpfWApO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gYXBwZW5kIG1lc3NhZ2UgaW4gbG9nIGZpbGUgT3hzRXllLmxvZy5cbiAgICogQWN1dGFsbHksIGl0IHJlYWRzIHRoZSBleGlzdGluZyBjb250ZW50cyBhbmQgYWRkcyBpdCB3aXRoIG5ldyBjb21pbmdcbiAgICogbWVzc2FnZSBhbmQgd3JpdGVzIHRvIHRoZSBsb2cgZmlsZS5cbiAgICogXG4gICAqIEBwYXJhbSB0eXBlIGluZGljYXRlcyB3aGF0IHR5cGUgb2YgbWVzc2FnZSBpcyBpdCwgbGlrZSAnZGVidWcnLCAnaW5mbycsICd3YXJuJyBvciAnZXJyb3InXG4gICAqL1xuICBwcml2YXRlIGFwcGVuZCh0eXBlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIGxldCBjb250ZW50ID0gdGhpcy5maWxlLnJlYWRUZXh0U3luYygoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgVG9hc3QubWFrZVRleHQoJ0Vycm9yIHdoaWxlIHJlYWRpbmcgbG9ncy4gJyArIGVycm9yLCAnbG9uZycpLnNob3coKTtcbiAgICB9KTtcbiAgICBjb250ZW50ID0gY29udGVudCArICdcXG4nICsgbmV3IERhdGUoKS50b0lTT1N0cmluZygpICsgJyAnICsgdHlwZSArIG1lc3NhZ2U7XG4gICAgdGhpcy5maWxlLndyaXRlVGV4dFN5bmMoYCR7Y29udGVudH1gKTtcbiAgfVxufVxuIl19