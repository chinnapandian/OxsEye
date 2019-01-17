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
//import { Repeater } from "tns-core-modules/ui/repeater";
// import { BottomBar, BottomBarItem, TITLE_STATE, SelectedIndexChangedEventData, Notification } from 'nativescript-bottombar';
// registerElement('BottomBar', () => BottomBar);
element_registry_1.registerElement("CameraPlus", function () { return nativescript_camera_plus_1.CameraPlus; });
//registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
//registerElement("Repeater", () => <any>Repeater);
element_registry_1.registerElement('CheckBox', function () { return require('nativescript-checkbox').CheckBox; });
var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: "ns-app",
        templateUrl: "app.component.html"
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMEM7QUFDMUMsOEVBQStEO0FBQy9ELDBFQUF3RTtBQUN4RSwwREFBMEQ7QUFDMUQsK0hBQStIO0FBQy9ILGlEQUFpRDtBQUNqRCxrQ0FBZSxDQUFDLFlBQVksRUFBRSxjQUFNLE9BQUsscUNBQVUsRUFBZixDQUFlLENBQUMsQ0FBQztBQUNyRCxtRkFBbUY7QUFDbkYsbURBQW1EO0FBQ25ELGtDQUFlLENBQUMsVUFBVSxFQUFFLGNBQU0sT0FBQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxRQUFRLEVBQXpDLENBQXlDLENBQUMsQ0FBQztBQU03RSxJQUFhLFlBQVk7SUFBekI7SUFBMkIsQ0FBQztJQUFELG1CQUFDO0FBQUQsQ0FBQyxBQUE1QixJQUE0QjtBQUFmLFlBQVk7SUFKeEIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxvQkFBb0I7S0FDbEMsQ0FBQztHQUNXLFlBQVksQ0FBRztBQUFmLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IENhbWVyYVBsdXMgfSBmcm9tIFwiQG5zdHVkaW8vbmF0aXZlc2NyaXB0LWNhbWVyYS1wbHVzXCI7XG5pbXBvcnQgeyByZWdpc3RlckVsZW1lbnQgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvZWxlbWVudC1yZWdpc3RyeVwiO1xuLy9pbXBvcnQgeyBSZXBlYXRlciB9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL3JlcGVhdGVyXCI7XG4vLyBpbXBvcnQgeyBCb3R0b21CYXIsIEJvdHRvbUJhckl0ZW0sIFRJVExFX1NUQVRFLCBTZWxlY3RlZEluZGV4Q2hhbmdlZEV2ZW50RGF0YSwgTm90aWZpY2F0aW9uIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWJvdHRvbWJhcic7XG4vLyByZWdpc3RlckVsZW1lbnQoJ0JvdHRvbUJhcicsICgpID0+IEJvdHRvbUJhcik7XG5yZWdpc3RlckVsZW1lbnQoXCJDYW1lcmFQbHVzXCIsICgpID0+IDxhbnk+Q2FtZXJhUGx1cyk7XG4vL3JlZ2lzdGVyRWxlbWVudCgnSW1hZ2Vab29tJywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWltYWdlLXpvb20nKS5JbWFnZVpvb20pO1xuLy9yZWdpc3RlckVsZW1lbnQoXCJSZXBlYXRlclwiLCAoKSA9PiA8YW55PlJlcGVhdGVyKTtcbnJlZ2lzdGVyRWxlbWVudCgnQ2hlY2tCb3gnLCAoKSA9PiByZXF1aXJlKCduYXRpdmVzY3JpcHQtY2hlY2tib3gnKS5DaGVja0JveCk7XG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJucy1hcHBcIixcbiAgdGVtcGxhdGVVcmw6IFwiYXBwLmNvbXBvbmVudC5odG1sXCJcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHt9XG4iXX0=