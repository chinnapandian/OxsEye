"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_module_1 = require("nativescript-angular/nativescript.module");
var angular_1 = require("nativescript-pager/angular");
var angular_2 = require("nativescript-ui-listview/angular");
var angular_3 = require("nativescript-ui-sidedrawer/angular");
var angular_4 = require("nativescript-i18n/angular");
var app_routing_1 = require("./app.routing");
var app_component_1 = require("./app.component");
var capture_component_1 = require("./capture/capture.component");
var dialog_component_1 = require("./dialog/dialog.component");
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
var imageslide_component_1 = require("./imageslide/imageslide.component");
var activityloader_common_1 = require("./activityloader/activityloader.common");
var transformedimage_provider_1 = require("./providers/transformedimage.provider");
var oxseyelogger_1 = require("./logger/oxseyelogger");
var angular_5 = require("nativescript-i18n/angular");
/** This is the main application module contains all the modules used in the application. */
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        bootstrap: [
            app_component_1.AppComponent,
        ],
        imports: [
            nativescript_module_1.NativeScriptModule,
            app_routing_1.AppRoutingModule,
            angular_1.PagerModule,
            angular_2.NativeScriptUIListViewModule,
            angular_3.NativeScriptUISideDrawerModule,
            angular_4.NativeScriptI18nModule,
        ],
        declarations: [
            app_component_1.AppComponent,
            capture_component_1.CaptureComponent,
            dialog_component_1.DialogContent,
            imagegallery_component_1.ImageGalleryComponent,
            imageslide_component_1.ImageSlideComponent,
        ],
        entryComponents: [dialog_component_1.DialogContent],
        providers: [transformedimage_provider_1.TransformedImageProvider, activityloader_common_1.ActivityLoader, oxseyelogger_1.OxsEyeLogger, angular_5.L],
        schemas: [
            core_1.NO_ERRORS_SCHEMA,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMkQ7QUFDM0QsZ0ZBQThFO0FBQzlFLHNEQUF5RDtBQUN6RCw0REFBZ0Y7QUFDaEYsOERBQW9GO0FBRXBGLHFEQUFtRTtBQUVuRSw2Q0FBaUQ7QUFFakQsaURBQStDO0FBRS9DLGlFQUErRDtBQUMvRCw4REFBMEQ7QUFDMUQsZ0ZBQThFO0FBQzlFLDBFQUF3RTtBQUV4RSxnRkFBd0U7QUFDeEUsbUZBQWlGO0FBRWpGLHNEQUFxRDtBQUVyRCxxREFBOEM7QUFFOUMsNEZBQTRGO0FBMkI1RixJQUFhLFNBQVM7SUFBdEI7SUFBeUIsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FBQyxBQUExQixJQUEwQjtBQUFiLFNBQVM7SUExQnJCLGVBQVEsQ0FBQztRQUNOLFNBQVMsRUFBRTtZQUNQLDRCQUFZO1NBQ2Y7UUFDRCxPQUFPLEVBQUU7WUFDTCx3Q0FBa0I7WUFDbEIsOEJBQWdCO1lBQ2hCLHFCQUFXO1lBQ1gsc0NBQTRCO1lBQzVCLHdDQUE4QjtZQUM5QixnQ0FBc0I7U0FFekI7UUFDRCxZQUFZLEVBQUU7WUFDViw0QkFBWTtZQUNaLG9DQUFnQjtZQUNoQixnQ0FBYTtZQUNiLDhDQUFxQjtZQUNyQiwwQ0FBbUI7U0FDdEI7UUFDRCxlQUFlLEVBQUUsQ0FBQyxnQ0FBYSxDQUFDO1FBQ2hDLFNBQVMsRUFBRSxDQUFDLG9EQUF3QixFQUFFLHNDQUFjLEVBQUUsMkJBQVksRUFBRSxXQUFDLENBQUM7UUFDdEUsT0FBTyxFQUFFO1lBQ0wsdUJBQWdCO1NBQ25CO0tBQ0osQ0FBQztHQUNXLFNBQVMsQ0FBSTtBQUFiLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE5PX0VSUk9SU19TQ0hFTUEgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdE1vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL25hdGl2ZXNjcmlwdC5tb2R1bGUnO1xuaW1wb3J0IHsgUGFnZXJNb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtcGFnZXIvYW5ndWxhcic7XG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXVpLWxpc3R2aWV3L2FuZ3VsYXInO1xuaW1wb3J0IHsgTmF0aXZlU2NyaXB0VUlTaWRlRHJhd2VyTW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXVpLXNpZGVkcmF3ZXIvYW5ndWxhcic7XG5cbmltcG9ydCB7IE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuaW1wb3J0IHsgQXBwUm91dGluZ01vZHVsZSB9IGZyb20gJy4vYXBwLnJvdXRpbmcnO1xuXG5pbXBvcnQgeyBBcHBDb21wb25lbnQgfSBmcm9tICcuL2FwcC5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBDYXB0dXJlQ29tcG9uZW50IH0gZnJvbSAnLi9jYXB0dXJlL2NhcHR1cmUuY29tcG9uZW50JztcbmltcG9ydCB7IERpYWxvZ0NvbnRlbnQgfSBmcm9tICcuL2RpYWxvZy9kaWFsb2cuY29tcG9uZW50JztcbmltcG9ydCB7IEltYWdlR2FsbGVyeUNvbXBvbmVudCB9IGZyb20gJy4vaW1hZ2VnYWxsZXJ5L2ltYWdlZ2FsbGVyeS5jb21wb25lbnQnO1xuaW1wb3J0IHsgSW1hZ2VTbGlkZUNvbXBvbmVudCB9IGZyb20gJy4vaW1hZ2VzbGlkZS9pbWFnZXNsaWRlLmNvbXBvbmVudCc7XG5cbmltcG9ydCB7IEFjdGl2aXR5TG9hZGVyIH0gZnJvbSAnLi9hY3Rpdml0eWxvYWRlci9hY3Rpdml0eWxvYWRlci5jb21tb24nO1xuaW1wb3J0IHsgVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyIH0gZnJvbSAnLi9wcm92aWRlcnMvdHJhbnNmb3JtZWRpbWFnZS5wcm92aWRlcic7XG5cbmltcG9ydCB7IE94c0V5ZUxvZ2dlciB9IGZyb20gJy4vbG9nZ2VyL294c2V5ZWxvZ2dlcic7XG5cbmltcG9ydCB7IEwgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuLyoqIFRoaXMgaXMgdGhlIG1haW4gYXBwbGljYXRpb24gbW9kdWxlIGNvbnRhaW5zIGFsbCB0aGUgbW9kdWxlcyB1c2VkIGluIHRoZSBhcHBsaWNhdGlvbi4gKi9cbkBOZ01vZHVsZSh7XG4gICAgYm9vdHN0cmFwOiBbXG4gICAgICAgIEFwcENvbXBvbmVudCxcbiAgICBdLFxuICAgIGltcG9ydHM6IFtcbiAgICAgICAgTmF0aXZlU2NyaXB0TW9kdWxlLFxuICAgICAgICBBcHBSb3V0aW5nTW9kdWxlLFxuICAgICAgICBQYWdlck1vZHVsZSxcbiAgICAgICAgTmF0aXZlU2NyaXB0VUlMaXN0Vmlld01vZHVsZSxcbiAgICAgICAgTmF0aXZlU2NyaXB0VUlTaWRlRHJhd2VyTW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRJMThuTW9kdWxlLFxuXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgICAgICAgQXBwQ29tcG9uZW50LFxuICAgICAgICBDYXB0dXJlQ29tcG9uZW50LFxuICAgICAgICBEaWFsb2dDb250ZW50LFxuICAgICAgICBJbWFnZUdhbGxlcnlDb21wb25lbnQsXG4gICAgICAgIEltYWdlU2xpZGVDb21wb25lbnQsXG4gICAgXSxcbiAgICBlbnRyeUNvbXBvbmVudHM6IFtEaWFsb2dDb250ZW50XSxcbiAgICBwcm92aWRlcnM6IFtUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIsIEFjdGl2aXR5TG9hZGVyLCBPeHNFeWVMb2dnZXIsIExdLFxuICAgIHNjaGVtYXM6IFtcbiAgICAgICAgTk9fRVJST1JTX1NDSEVNQSxcbiAgICBdLFxufSlcbmV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgeyB9XG4iXX0=