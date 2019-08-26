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
var Toast = require("nativescript-toast");
/** A simple logger class, which is being used to write log information to a file OxsEye.log */
var OxsEyeLogger = (function () {
    /** Constructor for OxsEyeLogger */
    function OxsEyeLogger() {
        /** Log message separator */
        this.ERROR_MSG_SEPARATOR = ': ';
        // Permissions.requestPermission(
        //   [android.Manifest.permission.READ_EXTERNAL_STORAGE,
        //   android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
        //   'Needed for sharing files').then(() => {
        var appRootPath = file_system_1.knownFolders.currentApp();
        if (!this.file) {
            this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
            this.file.removeSync(function (error) {
                Toast.makeText('Error while clearing OxsEye log file.');
            });
        }
        this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
        // }).catch(() => {
        //   Toast.makeText('Error while giving permission to oxseye.log file.', 'long').show();
        //   console.log('Permission is not granted (sadface)');
        // });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3hzZXllbG9nZ2VyLmlvcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm94c2V5ZWxvZ2dlci5pb3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxzQ0FBMkM7QUFDM0MsNERBQWtFO0FBR2xFLDBDQUE0QztBQUU1QywrRkFBK0Y7QUFFL0YsSUFBYSxZQUFZO0lBT3ZCLG1DQUFtQztJQUNuQztRQUpBLDRCQUE0QjtRQUNyQix3QkFBbUIsR0FBRyxJQUFJLENBQUM7UUFJaEMsaUNBQWlDO1FBQ2pDLHdEQUF3RDtRQUN4RCx5REFBeUQ7UUFDekQsNkNBQTZDO1FBQ3pDLElBQU0sV0FBVyxHQUFHLDBCQUFZLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDOUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQUMsS0FBSztnQkFDekIsS0FBSyxDQUFDLFFBQVEsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1lBQzFELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ2xFLG1CQUFtQjtRQUNuQix3RkFBd0Y7UUFDeEYsd0RBQXdEO1FBQ3hELE1BQU07SUFDVixDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLDRCQUFLLEdBQVosVUFBYSxPQUFhO1FBQUUsd0JBQXdCO2FBQXhCLFVBQXdCLEVBQXhCLHFCQUF3QixFQUF4QixJQUF3QjtZQUF4Qix1Q0FBd0I7O1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFLLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNEOzs7O09BSUc7SUFDSSwyQkFBSSxHQUFYLFVBQVksT0FBYTtRQUFFLHdCQUF3QjthQUF4QixVQUF3QixFQUF4QixxQkFBd0IsRUFBeEIsSUFBd0I7WUFBeEIsdUNBQXdCOztRQUNqRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBSyxPQUFPLFNBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDRDs7OztPQUlHO0lBQ0ksMkJBQUksR0FBWCxVQUFZLE9BQWE7UUFBRSx3QkFBd0I7YUFBeEIsVUFBd0IsRUFBeEIscUJBQXdCLEVBQXhCLElBQXdCO1lBQXhCLHVDQUF3Qjs7UUFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUssT0FBTyxTQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFHLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ0Q7Ozs7T0FJRztJQUNJLDRCQUFLLEdBQVosVUFBYSxPQUFhO1FBQUUsd0JBQXdCO2FBQXhCLFVBQXdCLEVBQXhCLHFCQUF3QixFQUF4QixJQUF3QjtZQUF4Qix1Q0FBd0I7O1FBQ2xELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFLLE9BQU8sU0FBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBRyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUNEOzs7OztPQUtHO0lBQ0ssNkJBQU0sR0FBZCxVQUFlLElBQVksRUFBRSxPQUFlO1FBQzFDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQUMsS0FBVTtZQUM5QyxLQUFLLENBQUMsUUFBUSxDQUFDLDRCQUE0QixHQUFHLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN0RSxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sR0FBRyxPQUFPLEdBQUcsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksR0FBRyxPQUFPLENBQUM7UUFDM0UsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBRyxPQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0gsbUJBQUM7QUFBRCxDQUFDLEFBdkVELElBdUVDO0FBdkVZLFlBQVk7SUFEeEIsaUJBQVUsRUFBRTs7R0FDQSxZQUFZLENBdUV4QjtBQXZFWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEZpbGUsIGtub3duRm9sZGVycyB9IGZyb20gJ3Rucy1jb3JlLW1vZHVsZXMvZmlsZS1zeXN0ZW0nO1xuXG5pbXBvcnQgKiBhcyBQZXJtaXNzaW9ucyBmcm9tICduYXRpdmVzY3JpcHQtcGVybWlzc2lvbnMnO1xuaW1wb3J0ICogYXMgVG9hc3QgZnJvbSAnbmF0aXZlc2NyaXB0LXRvYXN0JztcblxuLyoqIEEgc2ltcGxlIGxvZ2dlciBjbGFzcywgd2hpY2ggaXMgYmVpbmcgdXNlZCB0byB3cml0ZSBsb2cgaW5mb3JtYXRpb24gdG8gYSBmaWxlIE94c0V5ZS5sb2cgKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBPeHNFeWVMb2dnZXIge1xuXG4gIC8qKiBGaWxlIGlkZW50aWZpZXIgZm9yIGxvZyBmaWxlIE94c0V5ZS5sb2cgKi9cbiAgcHJpdmF0ZSBmaWxlOiBGaWxlO1xuICAvKiogTG9nIG1lc3NhZ2Ugc2VwYXJhdG9yICovXG4gIHB1YmxpYyBFUlJPUl9NU0dfU0VQQVJBVE9SID0gJzogJztcblxuICAvKiogQ29uc3RydWN0b3IgZm9yIE94c0V5ZUxvZ2dlciAqL1xuICBwdWJsaWMgY29uc3RydWN0b3IoKSB7XG4gICAgLy8gUGVybWlzc2lvbnMucmVxdWVzdFBlcm1pc3Npb24oXG4gICAgLy8gICBbYW5kcm9pZC5NYW5pZmVzdC5wZXJtaXNzaW9uLlJFQURfRVhURVJOQUxfU1RPUkFHRSxcbiAgICAvLyAgIGFuZHJvaWQuTWFuaWZlc3QucGVybWlzc2lvbi5XUklURV9FWFRFUk5BTF9TVE9SQUdFXSxcbiAgICAvLyAgICdOZWVkZWQgZm9yIHNoYXJpbmcgZmlsZXMnKS50aGVuKCgpID0+IHtcbiAgICAgICAgY29uc3QgYXBwUm9vdFBhdGggPSBrbm93bkZvbGRlcnMuY3VycmVudEFwcCgpO1xuICAgICAgICBpZiAoIXRoaXMuZmlsZSkge1xuICAgICAgICAgIHRoaXMuZmlsZSA9IEZpbGUuZnJvbVBhdGgoYXBwUm9vdFBhdGgucGF0aCArICcvbG9nL294c2V5ZS5sb2cnKTtcbiAgICAgICAgICB0aGlzLmZpbGUucmVtb3ZlU3luYygoZXJyb3IpID0+IHtcbiAgICAgICAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSBjbGVhcmluZyBPeHNFeWUgbG9nIGZpbGUuJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5maWxlID0gRmlsZS5mcm9tUGF0aChhcHBSb290UGF0aC5wYXRoICsgJy9sb2cvb3hzZXllLmxvZycpO1xuICAgICAgLy8gfSkuY2F0Y2goKCkgPT4ge1xuICAgICAgLy8gICBUb2FzdC5tYWtlVGV4dCgnRXJyb3Igd2hpbGUgZ2l2aW5nIHBlcm1pc3Npb24gdG8gb3hzZXllLmxvZyBmaWxlLicsICdsb25nJykuc2hvdygpO1xuICAgICAgLy8gICBjb25zb2xlLmxvZygnUGVybWlzc2lvbiBpcyBub3QgZ3JhbnRlZCAoc2FkZmFjZSknKTtcbiAgICAgIC8vIH0pO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gZGVidWcgbGV2ZWxcbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSB0byBiZSB3cml0dGVuIHRvIGxvZyBmaWxlXG4gICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHdyaXR0ZW4gaWYgYW55IGFsb25nIHdpdGggb3JpZ2luYWwgbWVzc2FnZVxuICAgKi9cbiAgcHVibGljIGRlYnVnKG1lc3NhZ2U/OiBhbnksIC4uLm9wdGlvbmFsUGFyYW1zOiBhbnlbXSk6IHZvaWQge1xuICAgIHRoaXMuYXBwZW5kKCdERUJVRycsIGAke21lc3NhZ2V9ICR7SlNPTi5zdHJpbmdpZnkob3B0aW9uYWxQYXJhbXMpfWApO1xuICB9XG4gIC8qKiBNZXRob2QgdG8gbG9nIG1lc3NhZ2UgaW4gaW5mbyBsZXZlbFxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIHdyaXR0ZW4gdG8gbG9nIGZpbGVcbiAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgd3JpdHRlbiBpZiBhbnkgYWxvbmcgd2l0aCBvcmlnaW5hbCBtZXNzYWdlXG4gICAqL1xuICBwdWJsaWMgaW5mbyhtZXNzYWdlPzogYW55LCAuLi5vcHRpb25hbFBhcmFtczogYW55W10pOiB2b2lkIHtcbiAgICB0aGlzLmFwcGVuZCgnSU5GTyAnLCBgJHttZXNzYWdlfSAke0pTT04uc3RyaW5naWZ5KG9wdGlvbmFsUGFyYW1zKX1gKTtcbiAgfVxuICAvKiogTWV0aG9kIHRvIGxvZyBtZXNzYWdlIGluIHdhcm5pbmcgbGV2ZWxcbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSB0byBiZSB3cml0dGVuIHRvIGxvZyBmaWxlXG4gICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyBvcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHdyaXR0ZW4gaWYgYW55IGFsb25nIHdpdGggb3JpZ2luYWwgbWVzc2FnZVxuICAgKi9cbiAgcHVibGljIHdhcm4obWVzc2FnZT86IGFueSwgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5hcHBlbmQoJ1dBUk4gJywgYCR7bWVzc2FnZX0gJHtKU09OLnN0cmluZ2lmeShvcHRpb25hbFBhcmFtcyl9YCk7XG4gIH1cbiAgLyoqIE1ldGhvZCB0byBsb2cgbWVzc2FnZSBpbiBlcnJvciBsZXZlbFxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIHRvIGJlIHdyaXR0ZW4gdG8gbG9nIGZpbGVcbiAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIG9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgd3JpdHRlbiBpZiBhbnkgYWxvbmcgd2l0aCBvcmlnaW5hbCBtZXNzYWdlXG4gICAqL1xuICBwdWJsaWMgZXJyb3IobWVzc2FnZT86IGFueSwgLi4ub3B0aW9uYWxQYXJhbXM6IGFueVtdKTogdm9pZCB7XG4gICAgdGhpcy5hcHBlbmQoJ0VSUk9SJywgYCR7bWVzc2FnZX0gJHtKU09OLnN0cmluZ2lmeShvcHRpb25hbFBhcmFtcyl9YCk7XG4gIH1cbiAgLyoqIE1ldGhvZCB0byBhcHBlbmQgbWVzc2FnZSBpbiBsb2cgZmlsZSBPeHNFeWUubG9nLlxuICAgKiBBY3V0YWxseSwgaXQgcmVhZHMgdGhlIGV4aXN0aW5nIGNvbnRlbnRzIGFuZCBhZGRzIGl0IHdpdGggbmV3IGNvbWluZ1xuICAgKiBtZXNzYWdlIGFuZCB3cml0ZXMgdG8gdGhlIGxvZyBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSBpbmRpY2F0ZXMgd2hhdCB0eXBlIG9mIG1lc3NhZ2UgaXMgaXQsIGxpa2UgJ2RlYnVnJywgJ2luZm8nLCAnd2Fybicgb3IgJ2Vycm9yJ1xuICAgKi9cbiAgcHJpdmF0ZSBhcHBlbmQodHlwZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBsZXQgY29udGVudCA9IHRoaXMuZmlsZS5yZWFkVGV4dFN5bmMoKGVycm9yOiBhbnkpID0+IHtcbiAgICAgIFRvYXN0Lm1ha2VUZXh0KCdFcnJvciB3aGlsZSByZWFkaW5nIGxvZ3MuICcgKyBlcnJvciwgJ2xvbmcnKS5zaG93KCk7XG4gICAgfSk7XG4gICAgY29udGVudCA9IGNvbnRlbnQgKyAnXFxuJyArIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSArICcgJyArIHR5cGUgKyBtZXNzYWdlO1xuICAgIHRoaXMuZmlsZS53cml0ZVRleHRTeW5jKGAke2NvbnRlbnR9YCk7XG4gIH1cbn1cbiJdfQ==