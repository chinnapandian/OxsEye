"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var file_system_1 = require("tns-core-modules/file-system");
var Permissions = require("nativescript-permissions");
var Toast = require("nativescript-toast");
/** A simple logger class, which is being used to write log information to a file OxsEye.log */
var OxsEyeLogger = /** @class */ (function () {
    /** Constructor for OxsEyeLogger */
    function OxsEyeLogger() {
        var _this = this;
        /** Log message separator */
        this.ERROR_MSG_SEPARATOR = ': ';
        // [android.Manifest.permission.CAMERA,
        //   android.Manifest.permission.READ_EXTERNAL_STORAGE,
        //   android.Manifest.permission.WRITE_EXTERNAL_STORAGE],
        Permissions.requestPermission([android.Manifest.permission.READ_EXTERNAL_STORAGE,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE], 'Needed for sharing files').then(function () {
            var appRootPath = file_system_1.knownFolders.currentApp();
            if (!_this.file) {
                _this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
                _this.file.removeSync(function (error) {
                    Toast.makeText('Error while clearing OxsEye log file..');
                });
            }
            _this.file = file_system_1.File.fromPath(appRootPath.path + '/log/oxseye.log');
        }).catch(function (e) {
            Toast.makeText('Error while giving permission to oxseye.log file.', 'long').show();
            console.log('Permission is not granted (sadface)', e);
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
    OxsEyeLogger = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [])
    ], OxsEyeLogger);
    return OxsEyeLogger;
}());
exports.OxsEyeLogger = OxsEyeLogger;
