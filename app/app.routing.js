"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("nativescript-angular/router");
// @ts-ignore
var capture_component_1 = require("./capture/capture.component");
// @ts-ignore
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
// @ts-ignore
var imageslide_component_1 = require("./imageslide/imageslide.component");
var routes = [
    { path: '', redirectTo: '/capture', pathMatch: 'full' },
    { path: 'capture', component: capture_component_1.CaptureComponent },
    { path: 'imagegallery', component: imagegallery_component_1.ImageGalleryComponent },
    { path: 'imageslide', component: imageslide_component_1.ImageSlideComponent },
];
/** This is routing module where all the routes used in application will be defined here */
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    return AppRoutingModule;
}());
AppRoutingModule = __decorate([
    core_1.NgModule({
        imports: [router_1.NativeScriptRouterModule.forRoot(routes)],
        exports: [router_1.NativeScriptRouterModule],
    })
], AppRoutingModule);
exports.AppRoutingModule = AppRoutingModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLnJvdXRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhcHAucm91dGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBLHNDQUF5QztBQUV6QyxzREFBdUU7QUFDdkUsYUFBYTtBQUNiLGlFQUErRDtBQUMvRCxhQUFhO0FBQ2IsZ0ZBQThFO0FBQzlFLGFBQWE7QUFDYiwwRUFBd0U7QUFFeEUsSUFBTSxNQUFNLEdBQVc7SUFDbkIsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtJQUN2RCxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLG9DQUFnQixFQUFFO0lBQ2hELEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsOENBQXFCLEVBQUM7SUFDekQsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSwwQ0FBbUIsRUFBQztDQUN4RCxDQUFDO0FBRUYsMkZBQTJGO0FBSzNGLElBQWEsZ0JBQWdCO0lBQTdCO0lBQWdDLENBQUM7SUFBRCx1QkFBQztBQUFELENBQUMsQUFBakMsSUFBaUM7QUFBcEIsZ0JBQWdCO0lBSjVCLGVBQVEsQ0FBQztRQUNOLE9BQU8sRUFBRSxDQUFDLGlDQUF3QixDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNuRCxPQUFPLEVBQUUsQ0FBQyxpQ0FBd0IsQ0FBQztLQUN0QyxDQUFDO0dBQ1csZ0JBQWdCLENBQUk7QUFBcEIsNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlcyB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRSb3V0ZXJNb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXInO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgQ2FwdHVyZUNvbXBvbmVudCB9IGZyb20gJy4vY2FwdHVyZS9jYXB0dXJlLmNvbXBvbmVudCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBJbWFnZUdhbGxlcnlDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlZ2FsbGVyeS9pbWFnZWdhbGxlcnkuY29tcG9uZW50Jztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IEltYWdlU2xpZGVDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlc2xpZGUvaW1hZ2VzbGlkZS5jb21wb25lbnQnO1xuXG5jb25zdCByb3V0ZXM6IFJvdXRlcyA9IFtcbiAgICB7IHBhdGg6ICcnLCByZWRpcmVjdFRvOiAnL2NhcHR1cmUnLCBwYXRoTWF0Y2g6ICdmdWxsJyB9LFxuICAgIHsgcGF0aDogJ2NhcHR1cmUnLCBjb21wb25lbnQ6IENhcHR1cmVDb21wb25lbnQgfSxcbiAgICB7IHBhdGg6ICdpbWFnZWdhbGxlcnknLCBjb21wb25lbnQ6IEltYWdlR2FsbGVyeUNvbXBvbmVudH0sXG4gICAgeyBwYXRoOiAnaW1hZ2VzbGlkZScsIGNvbXBvbmVudDogSW1hZ2VTbGlkZUNvbXBvbmVudH0sXG5dO1xuXG4vKiogVGhpcyBpcyByb3V0aW5nIG1vZHVsZSB3aGVyZSBhbGwgdGhlIHJvdXRlcyB1c2VkIGluIGFwcGxpY2F0aW9uIHdpbGwgYmUgZGVmaW5lZCBoZXJlICovXG5ATmdNb2R1bGUoe1xuICAgIGltcG9ydHM6IFtOYXRpdmVTY3JpcHRSb3V0ZXJNb2R1bGUuZm9yUm9vdChyb3V0ZXMpXSxcbiAgICBleHBvcnRzOiBbTmF0aXZlU2NyaXB0Um91dGVyTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgQXBwUm91dGluZ01vZHVsZSB7IH1cbiJdfQ==