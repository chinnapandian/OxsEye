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
// import { CameraPlus } from 'nativescript-opencv-camera-plus';
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
// import { CameraPlus } from '@nstudio/nativescript-camera-plus';
// // import { CameraPlus } from 'nativescript-opencv-camera-plus';
// import { registerElement } from 'nativescript-angular/element-registry';
// // import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// // registerElement('L', () => L as any);
// registerElement('CameraPlus', () => CameraPlus as any);
// registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);
// registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
// import { Component, OnInit, ViewChild } from "@angular/core";
// import * as app from "application";
// import { RouterExtensions } from "nativescript-angular/router";
// import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
// @Component({
//     selector: "ns-app",
//     moduleId: module.id,
//     templateUrl: "app.component.html"
// })
// export class AppComponent implements OnInit {
//     // private _selectedPage: string;
//     // private _sideDrawerTransition: DrawerTransitionBase;
//     constructor(private routerExtensions: RouterExtensions) {
//         // Use the component constructor to inject services.
//     }
//     ngOnInit(): void {
//         console.log("app component")
//         // this._selectedPage = "/home";
//         // this._sideDrawerTransition = new SlideInOnTopTransition();
//     }
//     // get sideDrawerTransition(): DrawerTransitionBase {
//     //     console.log("sideDrawerTransition");
//     //     return this._sideDrawerTransition;
//     // }
//     // isPageSelected(pageTitle: string): boolean {
//     //     return pageTitle === this._selectedPage;
//     // }
//     // onNavItemTap(navItemRoute: string): void {
//     //     console.log(JSON.stringify(navItemRoute));
//     //     this._selectedPage = navItemRoute;
//     //     this.routerExtensions.navigate([navItemRoute], {
//     //         transition: {
//     //             name: "flip"
//     //         }
//     //     });
//     //     const sideDrawer = <RadSideDrawer>app.getRootView();
//     //     sideDrawer.closeDrawer();
//     // }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMEM7QUFDMUMsOEVBQStEO0FBQy9ELGdFQUFnRTtBQUNoRSwwRUFBd0U7QUFDeEUseUVBQXlFO0FBQ3pFLHdDQUF3QztBQUN4QyxrQ0FBZSxDQUFDLFlBQVksRUFBRSxjQUFNLE9BQUEscUNBQWlCLEVBQWpCLENBQWlCLENBQUMsQ0FBQztBQUN2RCxrQ0FBZSxDQUFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsUUFBUSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7QUFDN0Usa0NBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFNBQVMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO0FBQ2pGOzs7R0FHRztBQUtILElBQWEsWUFBWTtJQUF6QjtJQUE0QixDQUFDO0lBQUQsbUJBQUM7QUFBRCxDQUFDLEFBQTdCLElBQTZCO0FBQWhCLFlBQVk7SUFKeEIsZ0JBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxRQUFRO1FBQ2xCLFdBQVcsRUFBRSxvQkFBb0I7S0FDbEMsQ0FBQztHQUNXLFlBQVksQ0FBSTtBQUFoQixvQ0FBWTtBQUd6QixrRUFBa0U7QUFDbEUsbUVBQW1FO0FBQ25FLDJFQUEyRTtBQUMzRSw0RUFBNEU7QUFDNUUsMkNBQTJDO0FBQzNDLDBEQUEwRDtBQUMxRCxnRkFBZ0Y7QUFDaEYsb0ZBQW9GO0FBRXBGLGdFQUFnRTtBQUNoRSxzQ0FBc0M7QUFDdEMsa0VBQWtFO0FBQ2xFLDRHQUE0RztBQUU1RyxlQUFlO0FBQ2YsMEJBQTBCO0FBQzFCLDJCQUEyQjtBQUMzQix3Q0FBd0M7QUFDeEMsS0FBSztBQUVMLGdEQUFnRDtBQUNoRCx3Q0FBd0M7QUFDeEMsOERBQThEO0FBRTlELGdFQUFnRTtBQUNoRSwrREFBK0Q7QUFDL0QsUUFBUTtBQUVSLHlCQUF5QjtBQUN6Qix1Q0FBdUM7QUFDdkMsMkNBQTJDO0FBQzNDLHdFQUF3RTtBQUN4RSxRQUFRO0FBRVIsNERBQTREO0FBQzVELGtEQUFrRDtBQUNsRCxnREFBZ0Q7QUFDaEQsV0FBVztBQUVYLHNEQUFzRDtBQUN0RCxzREFBc0Q7QUFDdEQsV0FBVztBQUVYLG9EQUFvRDtBQUNwRCx3REFBd0Q7QUFFeEQsZ0RBQWdEO0FBQ2hELDhEQUE4RDtBQUM5RCwrQkFBK0I7QUFDL0Isa0NBQWtDO0FBQ2xDLG1CQUFtQjtBQUNuQixpQkFBaUI7QUFFakIsa0VBQWtFO0FBQ2xFLHVDQUF1QztBQUN2QyxXQUFXO0FBQ1gsSUFBSSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ2FtZXJhUGx1cyB9IGZyb20gJ0Buc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1cyc7XG4vLyBpbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1jYW1lcmEtcGx1cyc7XG5pbXBvcnQgeyByZWdpc3RlckVsZW1lbnQgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5Jztcbi8vIGltcG9ydCB7IE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUsIEwgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhclwiO1xuLy8gcmVnaXN0ZXJFbGVtZW50KCdMJywgKCkgPT4gTCBhcyBhbnkpO1xucmVnaXN0ZXJFbGVtZW50KCdDYW1lcmFQbHVzJywgKCkgPT4gQ2FtZXJhUGx1cyBhcyBhbnkpO1xucmVnaXN0ZXJFbGVtZW50KCdDaGVja0JveCcsICgpID0+IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1jaGVja2JveCcpLkNoZWNrQm94KTtcbnJlZ2lzdGVyRWxlbWVudCgnSW1hZ2Vab29tJywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWltYWdlLXpvb20nKS5JbWFnZVpvb20pO1xuLyoqXG4gKiBUaGlzIGlzIHRoZSBhcHBsaWNhdGlvbiBjb21wb25lbnQgbGF5b3V0XG4gKiB3aGVyZSBhbGwgb3RoZXIgY29tcG9uZW50KHMpIHdpbGwgYmUgdXNlZC5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnMtYXBwJyxcbiAgdGVtcGxhdGVVcmw6ICdhcHAuY29tcG9uZW50Lmh0bWwnLFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDb21wb25lbnQgeyB9XG5cblxuLy8gaW1wb3J0IHsgQ2FtZXJhUGx1cyB9IGZyb20gJ0Buc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1cyc7XG4vLyAvLyBpbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSAnbmF0aXZlc2NyaXB0LW9wZW5jdi1jYW1lcmEtcGx1cyc7XG4vLyBpbXBvcnQgeyByZWdpc3RlckVsZW1lbnQgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9lbGVtZW50LXJlZ2lzdHJ5Jztcbi8vIC8vIGltcG9ydCB7IE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUsIEwgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhclwiO1xuLy8gLy8gcmVnaXN0ZXJFbGVtZW50KCdMJywgKCkgPT4gTCBhcyBhbnkpO1xuLy8gcmVnaXN0ZXJFbGVtZW50KCdDYW1lcmFQbHVzJywgKCkgPT4gQ2FtZXJhUGx1cyBhcyBhbnkpO1xuLy8gcmVnaXN0ZXJFbGVtZW50KCdDaGVja0JveCcsICgpID0+IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1jaGVja2JveCcpLkNoZWNrQm94KTtcbi8vIHJlZ2lzdGVyRWxlbWVudCgnSW1hZ2Vab29tJywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWltYWdlLXpvb20nKS5JbWFnZVpvb20pO1xuXG4vLyBpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbi8vIGltcG9ydCAqIGFzIGFwcCBmcm9tIFwiYXBwbGljYXRpb25cIjtcbi8vIGltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvcm91dGVyXCI7XG4vLyBpbXBvcnQgeyBEcmF3ZXJUcmFuc2l0aW9uQmFzZSwgUmFkU2lkZURyYXdlciwgU2xpZGVJbk9uVG9wVHJhbnNpdGlvbiB9IGZyb20gXCJuYXRpdmVzY3JpcHQtdWktc2lkZWRyYXdlclwiO1xuXG4vLyBAQ29tcG9uZW50KHtcbi8vICAgICBzZWxlY3RvcjogXCJucy1hcHBcIixcbi8vICAgICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuLy8gICAgIHRlbXBsYXRlVXJsOiBcImFwcC5jb21wb25lbnQuaHRtbFwiXG4vLyB9KVxuXG4vLyBleHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbi8vICAgICAvLyBwcml2YXRlIF9zZWxlY3RlZFBhZ2U6IHN0cmluZztcbi8vICAgICAvLyBwcml2YXRlIF9zaWRlRHJhd2VyVHJhbnNpdGlvbjogRHJhd2VyVHJhbnNpdGlvbkJhc2U7XG5cbi8vICAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHJvdXRlckV4dGVuc2lvbnM6IFJvdXRlckV4dGVuc2lvbnMpIHtcbi8vICAgICAgICAgLy8gVXNlIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gaW5qZWN0IHNlcnZpY2VzLlxuLy8gICAgIH1cblxuLy8gICAgIG5nT25Jbml0KCk6IHZvaWQge1xuLy8gICAgICAgICBjb25zb2xlLmxvZyhcImFwcCBjb21wb25lbnRcIilcbi8vICAgICAgICAgLy8gdGhpcy5fc2VsZWN0ZWRQYWdlID0gXCIvaG9tZVwiO1xuLy8gICAgICAgICAvLyB0aGlzLl9zaWRlRHJhd2VyVHJhbnNpdGlvbiA9IG5ldyBTbGlkZUluT25Ub3BUcmFuc2l0aW9uKCk7XG4vLyAgICAgfVxuXG4vLyAgICAgLy8gZ2V0IHNpZGVEcmF3ZXJUcmFuc2l0aW9uKCk6IERyYXdlclRyYW5zaXRpb25CYXNlIHtcbi8vICAgICAvLyAgICAgY29uc29sZS5sb2coXCJzaWRlRHJhd2VyVHJhbnNpdGlvblwiKTtcbi8vICAgICAvLyAgICAgcmV0dXJuIHRoaXMuX3NpZGVEcmF3ZXJUcmFuc2l0aW9uO1xuLy8gICAgIC8vIH1cblxuLy8gICAgIC8vIGlzUGFnZVNlbGVjdGVkKHBhZ2VUaXRsZTogc3RyaW5nKTogYm9vbGVhbiB7XG4vLyAgICAgLy8gICAgIHJldHVybiBwYWdlVGl0bGUgPT09IHRoaXMuX3NlbGVjdGVkUGFnZTtcbi8vICAgICAvLyB9XG5cbi8vICAgICAvLyBvbk5hdkl0ZW1UYXAobmF2SXRlbVJvdXRlOiBzdHJpbmcpOiB2b2lkIHtcbi8vICAgICAvLyAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkobmF2SXRlbVJvdXRlKSk7XG5cbi8vICAgICAvLyAgICAgdGhpcy5fc2VsZWN0ZWRQYWdlID0gbmF2SXRlbVJvdXRlO1xuLy8gICAgIC8vICAgICB0aGlzLnJvdXRlckV4dGVuc2lvbnMubmF2aWdhdGUoW25hdkl0ZW1Sb3V0ZV0sIHtcbi8vICAgICAvLyAgICAgICAgIHRyYW5zaXRpb246IHtcbi8vICAgICAvLyAgICAgICAgICAgICBuYW1lOiBcImZsaXBcIlxuLy8gICAgIC8vICAgICAgICAgfVxuLy8gICAgIC8vICAgICB9KTtcblxuLy8gICAgIC8vICAgICBjb25zdCBzaWRlRHJhd2VyID0gPFJhZFNpZGVEcmF3ZXI+YXBwLmdldFJvb3RWaWV3KCk7XG4vLyAgICAgLy8gICAgIHNpZGVEcmF3ZXIuY2xvc2VEcmF3ZXIoKTtcbi8vICAgICAvLyB9XG4vLyB9XG4iXX0=