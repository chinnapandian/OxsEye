"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
// import { NavigationEnd, Router } from "@angular/router";
// import { RouterExtensions } from "nativescript-angular/router";
// import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
// import { filter } from "rxjs/operators";
var nativescript_camera_plus_1 = require("@nstudio/nativescript-camera-plus");
var element_registry_1 = require("nativescript-angular/element-registry");
//import { Repeater } from "tns-core-modules/ui/repeater";
// import { BottomBar, BottomBarItem, TITLE_STATE, SelectedIndexChangedEventData, Notification } from 'nativescript-bottombar';
// registerElement('BottomBar', () => BottomBar);
element_registry_1.registerElement("CameraPlus", function () { return nativescript_camera_plus_1.CameraPlus; });
//registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
//registerElement("Repeater", () => <any>Repeater);
element_registry_1.registerElement('CheckBox', function () { return require('nativescript-checkbox').CheckBox; });
element_registry_1.registerElement('ImageZoom', function () { return require('nativescript-image-zoom').ImageZoom; });
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
// implements OnInit {
//     private _activatedUrl: string;
//     private _sideDrawerTransition: DrawerTransitionBase;
//     constructor(private router: Router, private routerExtensions: RouterExtensions) {
//         // Use the component constructor to inject services.
//     }
//     ngOnInit(): void {
//         this._activatedUrl = "/home";
//         this._sideDrawerTransition = new SlideInOnTopTransition();
//         // this.router.events
//         // .pipe(filter((event: any) => event instanceof NavigationEnd))
//         // .subscribe((event: NavigationEnd) => this._activatedUrl = event.urlAfterRedirects);
//     }
//     get sideDrawerTransition(): DrawerTransitionBase {
//         return this._sideDrawerTransition;
//     }
//     isComponentSelected(url: string): boolean {
//         return this._activatedUrl === url;
//     }
//     onNavItemTap(navItemRoute: string): void {
//         this.routerExtensions.navigate([navItemRoute], {
//             transition: {
//                 name: "fade"
//             }
//         });
//         const sideDrawer = <RadSideDrawer>app.getRootView();
//         sideDrawer.closeDrawer();
//     }
// }
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBNkQ7QUFDN0QsMkRBQTJEO0FBQzNELGtFQUFrRTtBQUNsRSw0R0FBNEc7QUFDNUcsMkNBQTJDO0FBQzNDLDhFQUErRDtBQUMvRCwwRUFBd0U7QUFHeEUsMERBQTBEO0FBQzFELCtIQUErSDtBQUMvSCxpREFBaUQ7QUFDakQsa0NBQWUsQ0FBQyxZQUFZLEVBQUUsY0FBTSxPQUFLLHFDQUFVLEVBQWYsQ0FBZSxDQUFDLENBQUM7QUFDckQsbUZBQW1GO0FBQ25GLG1EQUFtRDtBQUNuRCxrQ0FBZSxDQUFDLFVBQVUsRUFBRSxjQUFNLE9BQUEsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsUUFBUSxFQUF6QyxDQUF5QyxDQUFDLENBQUM7QUFDN0Usa0NBQWUsQ0FBQyxXQUFXLEVBQUUsY0FBTSxPQUFBLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLFNBQVMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUFDO0FBT2pGLElBQWEsWUFBWTtJQUF6QjtJQUEyQixDQUFDO0lBQUQsbUJBQUM7QUFBRCxDQUFDLEFBQTVCLElBQTRCO0FBQWYsWUFBWTtJQUp4QixnQkFBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsV0FBVyxFQUFFLG9CQUFvQjtLQUNsQyxDQUFDO0dBQ1csWUFBWSxDQUFHO0FBQWYsb0NBQVk7QUFDekIsc0JBQXNCO0FBQ3RCLHFDQUFxQztBQUNyQywyREFBMkQ7QUFFM0Qsd0ZBQXdGO0FBQ3hGLCtEQUErRDtBQUMvRCxRQUFRO0FBRVIseUJBQXlCO0FBQ3pCLHdDQUF3QztBQUN4QyxxRUFBcUU7QUFFckUsZ0NBQWdDO0FBQ2hDLDJFQUEyRTtBQUMzRSxpR0FBaUc7QUFDakcsUUFBUTtBQUVSLHlEQUF5RDtBQUN6RCw2Q0FBNkM7QUFDN0MsUUFBUTtBQUVSLGtEQUFrRDtBQUNsRCw2Q0FBNkM7QUFDN0MsUUFBUTtBQUVSLGlEQUFpRDtBQUNqRCwyREFBMkQ7QUFDM0QsNEJBQTRCO0FBQzVCLCtCQUErQjtBQUMvQixnQkFBZ0I7QUFDaEIsY0FBYztBQUVkLCtEQUErRDtBQUMvRCxvQ0FBb0M7QUFDcEMsUUFBUTtBQUNSLElBQUkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIE9uSW5pdCwgVmlld0NoaWxkIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbi8vIGltcG9ydCB7IE5hdmlnYXRpb25FbmQsIFJvdXRlciB9IGZyb20gXCJAYW5ndWxhci9yb3V0ZXJcIjtcbi8vIGltcG9ydCB7IFJvdXRlckV4dGVuc2lvbnMgfSBmcm9tIFwibmF0aXZlc2NyaXB0LWFuZ3VsYXIvcm91dGVyXCI7XG4vLyBpbXBvcnQgeyBEcmF3ZXJUcmFuc2l0aW9uQmFzZSwgUmFkU2lkZURyYXdlciwgU2xpZGVJbk9uVG9wVHJhbnNpdGlvbiB9IGZyb20gXCJuYXRpdmVzY3JpcHQtdWktc2lkZWRyYXdlclwiO1xuLy8gaW1wb3J0IHsgZmlsdGVyIH0gZnJvbSBcInJ4anMvb3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBDYW1lcmFQbHVzIH0gZnJvbSBcIkBuc3R1ZGlvL25hdGl2ZXNjcmlwdC1jYW1lcmEtcGx1c1wiO1xuaW1wb3J0IHsgcmVnaXN0ZXJFbGVtZW50IH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2VsZW1lbnQtcmVnaXN0cnlcIjtcbmltcG9ydCAqIGFzIGFwcCBmcm9tIFwidG5zLWNvcmUtbW9kdWxlcy9hcHBsaWNhdGlvblwiO1xuXG4vL2ltcG9ydCB7IFJlcGVhdGVyIH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvdWkvcmVwZWF0ZXJcIjtcbi8vIGltcG9ydCB7IEJvdHRvbUJhciwgQm90dG9tQmFySXRlbSwgVElUTEVfU1RBVEUsIFNlbGVjdGVkSW5kZXhDaGFuZ2VkRXZlbnREYXRhLCBOb3RpZmljYXRpb24gfSBmcm9tICduYXRpdmVzY3JpcHQtYm90dG9tYmFyJztcbi8vIHJlZ2lzdGVyRWxlbWVudCgnQm90dG9tQmFyJywgKCkgPT4gQm90dG9tQmFyKTtcbnJlZ2lzdGVyRWxlbWVudChcIkNhbWVyYVBsdXNcIiwgKCkgPT4gPGFueT5DYW1lcmFQbHVzKTtcbi8vcmVnaXN0ZXJFbGVtZW50KCdJbWFnZVpvb20nLCAoKSA9PiByZXF1aXJlKCduYXRpdmVzY3JpcHQtaW1hZ2Utem9vbScpLkltYWdlWm9vbSk7XG4vL3JlZ2lzdGVyRWxlbWVudChcIlJlcGVhdGVyXCIsICgpID0+IDxhbnk+UmVwZWF0ZXIpO1xucmVnaXN0ZXJFbGVtZW50KCdDaGVja0JveCcsICgpID0+IHJlcXVpcmUoJ25hdGl2ZXNjcmlwdC1jaGVja2JveCcpLkNoZWNrQm94KTtcbnJlZ2lzdGVyRWxlbWVudCgnSW1hZ2Vab29tJywgKCkgPT4gcmVxdWlyZSgnbmF0aXZlc2NyaXB0LWltYWdlLXpvb20nKS5JbWFnZVpvb20pO1xuXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogXCJucy1hcHBcIixcbiAgdGVtcGxhdGVVcmw6IFwiYXBwLmNvbXBvbmVudC5odG1sXCJcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ29tcG9uZW50IHt9XG4vLyBpbXBsZW1lbnRzIE9uSW5pdCB7XG4vLyAgICAgcHJpdmF0ZSBfYWN0aXZhdGVkVXJsOiBzdHJpbmc7XG4vLyAgICAgcHJpdmF0ZSBfc2lkZURyYXdlclRyYW5zaXRpb246IERyYXdlclRyYW5zaXRpb25CYXNlO1xuXG4vLyAgICAgY29uc3RydWN0b3IocHJpdmF0ZSByb3V0ZXI6IFJvdXRlciwgcHJpdmF0ZSByb3V0ZXJFeHRlbnNpb25zOiBSb3V0ZXJFeHRlbnNpb25zKSB7XG4vLyAgICAgICAgIC8vIFVzZSB0aGUgY29tcG9uZW50IGNvbnN0cnVjdG9yIHRvIGluamVjdCBzZXJ2aWNlcy5cbi8vICAgICB9XG5cbi8vICAgICBuZ09uSW5pdCgpOiB2b2lkIHtcbi8vICAgICAgICAgdGhpcy5fYWN0aXZhdGVkVXJsID0gXCIvaG9tZVwiO1xuLy8gICAgICAgICB0aGlzLl9zaWRlRHJhd2VyVHJhbnNpdGlvbiA9IG5ldyBTbGlkZUluT25Ub3BUcmFuc2l0aW9uKCk7XG5cbi8vICAgICAgICAgLy8gdGhpcy5yb3V0ZXIuZXZlbnRzXG4vLyAgICAgICAgIC8vIC5waXBlKGZpbHRlcigoZXZlbnQ6IGFueSkgPT4gZXZlbnQgaW5zdGFuY2VvZiBOYXZpZ2F0aW9uRW5kKSlcbi8vICAgICAgICAgLy8gLnN1YnNjcmliZSgoZXZlbnQ6IE5hdmlnYXRpb25FbmQpID0+IHRoaXMuX2FjdGl2YXRlZFVybCA9IGV2ZW50LnVybEFmdGVyUmVkaXJlY3RzKTtcbi8vICAgICB9XG5cbi8vICAgICBnZXQgc2lkZURyYXdlclRyYW5zaXRpb24oKTogRHJhd2VyVHJhbnNpdGlvbkJhc2Uge1xuLy8gICAgICAgICByZXR1cm4gdGhpcy5fc2lkZURyYXdlclRyYW5zaXRpb247XG4vLyAgICAgfVxuXG4vLyAgICAgaXNDb21wb25lbnRTZWxlY3RlZCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuLy8gICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZhdGVkVXJsID09PSB1cmw7XG4vLyAgICAgfVxuXG4vLyAgICAgb25OYXZJdGVtVGFwKG5hdkl0ZW1Sb3V0ZTogc3RyaW5nKTogdm9pZCB7XG4vLyAgICAgICAgIHRoaXMucm91dGVyRXh0ZW5zaW9ucy5uYXZpZ2F0ZShbbmF2SXRlbVJvdXRlXSwge1xuLy8gICAgICAgICAgICAgdHJhbnNpdGlvbjoge1xuLy8gICAgICAgICAgICAgICAgIG5hbWU6IFwiZmFkZVwiXG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgIH0pO1xuXG4vLyAgICAgICAgIGNvbnN0IHNpZGVEcmF3ZXIgPSA8UmFkU2lkZURyYXdlcj5hcHAuZ2V0Um9vdFZpZXcoKTtcbi8vICAgICAgICAgc2lkZURyYXdlci5jbG9zZURyYXdlcigpO1xuLy8gICAgIH1cbi8vIH1cbiJdfQ==