"use strict";
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
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.NativeScriptRouterModule.forRoot(routes)],
            exports: [router_1.NativeScriptRouterModule],
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
