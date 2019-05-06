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
// import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// registerElement('L', () => L as any);
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
        templateUrl: 'app.component.html',
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMEM7QUFDMUMsOEVBQStEO0FBQy9ELDBFQUF3RTtBQUN4RSx5RUFBeUU7QUFDekUsd0NBQXdDO0FBQ3hDLGtDQUFlLENBQUMsWUFBWSxFQUFFLGNBQU0sT0FBQSxxQ0FBaUIsRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0FBQ3ZELGtDQUFlLENBQUMsVUFBVSxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxRQUFRLEVBQXpDLENBQXlDLENBQUMsQ0FBQztBQUM3RSxrQ0FBZSxDQUFDLFdBQVcsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLHlCQUF5QixDQUFDLENBQUMsU0FBUyxFQUE1QyxDQUE0QyxDQUFDLENBQUM7QUFDakY7OztHQUdHO0FBS0gsSUFBYSxZQUFZO0lBQXpCO0lBQTRCLENBQUM7SUFBRCxtQkFBQztBQUFELENBQUMsQUFBN0IsSUFBNkI7QUFBaEIsWUFBWTtJQUp4QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLG9CQUFvQjtLQUNsQyxDQUFDO0dBQ1csWUFBWSxDQUFJO0FBQWhCLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzJztcbmltcG9ydCB7IHJlZ2lzdGVyRWxlbWVudCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnknO1xuLy8gaW1wb3J0IHsgTmF0aXZlU2NyaXB0STE4bk1vZHVsZSwgTCB9IGZyb20gXCJuYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyXCI7XG4vLyByZWdpc3RlckVsZW1lbnQoJ0wnLCAoKSA9PiBMIGFzIGFueSk7XG5yZWdpc3RlckVsZW1lbnQoJ0NhbWVyYVBsdXMnLCAoKSA9PiBDYW1lcmFQbHVzIGFzIGFueSk7XG5yZWdpc3RlckVsZW1lbnQoJ0NoZWNrQm94JywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWNoZWNrYm94JykuQ2hlY2tCb3gpO1xucmVnaXN0ZXJFbGVtZW50KCdJbWFnZVpvb20nLCAoKSA9PiByZXF1aXJlKCduYXRpdmVzY3JpcHQtaW1hZ2Utem9vbScpLkltYWdlWm9vbSk7XG4vKipcbiAqIFRoaXMgaXMgdGhlIGFwcGxpY2F0aW9uIGNvbXBvbmVudCBsYXlvdXRcbiAqIHdoZXJlIGFsbCBvdGhlciBjb21wb25lbnQocykgd2lsbCBiZSB1c2VkLlxuICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICducy1hcHAnLFxuICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCcsXG59KVxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7IH1cbiJdfQ==