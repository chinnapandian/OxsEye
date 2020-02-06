"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_camera_plus_1 = require("@nstudio/nativescript-camera-plus");
var element_registry_1 = require("nativescript-angular/element-registry");
element_registry_1.registerElement('CameraPlus', function () { return nativescript_camera_plus_1.CameraPlus; });
element_registry_1.registerElement('CheckBox', function () { return require('@nstudio/nativescript-checkbox').CheckBox; });
element_registry_1.registerElement('ImageSwipe', function () { return require('nativescript-image-swipe/image-swipe').ImageSwipe; });
/** Application startup component */
var AppComponent = /** @class */ (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        core_1.Component({
            selector: 'ns-app',
            templateUrl: './app.component.html',
        })
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
