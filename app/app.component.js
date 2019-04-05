"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_camera_plus_1 = require("@nstudio/nativescript-camera-plus");
var element_registry_1 = require("nativescript-angular/element-registry");
element_registry_1.registerElement('CameraPlus', function () { return nativescript_camera_plus_1.CameraPlus; });
element_registry_1.registerElement('CheckBox', function () { return require('nativescript-checkbox').CheckBox; });
element_registry_1.registerElement('ImageZoom', function () { return require('nativescript-image-zoom').ImageZoom; });
/**
 * This is the application component layout
 * where all other component(s) will be used.
 */
var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'ns-app',
        templateUrl: 'app.component.html'
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMEM7QUFDMUMsOEVBQStEO0FBQy9ELDBFQUF3RTtBQUN4RSxrQ0FBZSxDQUFDLFlBQVksRUFBRSxjQUFNLE9BQUsscUNBQVUsRUFBZixDQUFlLENBQUMsQ0FBQztBQUNyRCxrQ0FBZSxDQUFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsUUFBUSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7QUFDN0Usa0NBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFNBQVMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO0FBQ2pGOzs7R0FHRztBQUtILElBQWEsWUFBWTtJQUF6QjtJQUE0QixDQUFDO0lBQUQsbUJBQUM7QUFBRCxDQUFDLEFBQTdCLElBQTZCO0FBQWhCLFlBQVk7SUFKeEIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxvQkFBb0I7S0FDbEMsQ0FBQztHQUNXLFlBQVksQ0FBSTtBQUFoQixvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2FtZXJhUGx1cyB9IGZyb20gJ0Buc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1cyc7XG5pbXBvcnQgeyByZWdpc3RlckVsZW1lbnQgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5JztcbnJlZ2lzdGVyRWxlbWVudCgnQ2FtZXJhUGx1cycsICgpID0+IDxhbnk+Q2FtZXJhUGx1cyk7XG5yZWdpc3RlckVsZW1lbnQoJ0NoZWNrQm94JywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWNoZWNrYm94JykuQ2hlY2tCb3gpO1xucmVnaXN0ZXJFbGVtZW50KCdJbWFnZVpvb20nLCAoKSA9PiByZXF1aXJlKCduYXRpdmVzY3JpcHQtaW1hZ2Utem9vbScpLkltYWdlWm9vbSk7XG4vKipcbiAqIFRoaXMgaXMgdGhlIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBsYXlvdXQgXG4gKiB3aGVyZSBhbGwgb3RoZXIgY29tcG9uZW50KHMpIHdpbGwgYmUgdXNlZC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnMtYXBwJyxcbiAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7IH1cbiJdfQ==