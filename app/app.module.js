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
        providers: [transformedimage_provider_1.TransformedImageProvider, activityloader_common_1.ActivityLoader, oxseyelogger_1.OxsEyeLogger],
        schemas: [
            core_1.NO_ERRORS_SCHEMA,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMkQ7QUFDM0QsZ0ZBQThFO0FBQzlFLHNEQUF5RDtBQUN6RCw0REFBZ0Y7QUFDaEYsOERBQW9GO0FBRXBGLHFEQUFtRTtBQUVuRSw2Q0FBaUQ7QUFFakQsaURBQStDO0FBRS9DLGlFQUErRDtBQUMvRCw4REFBMEQ7QUFDMUQsZ0ZBQThFO0FBQzlFLDBFQUF3RTtBQUV4RSxnRkFBd0U7QUFDeEUsbUZBQWlGO0FBRWpGLHNEQUFxRDtBQUVyRCw0RkFBNEY7QUEyQjVGLElBQWEsU0FBUztJQUF0QjtJQUF5QixDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQUFDLEFBQTFCLElBQTBCO0FBQWIsU0FBUztJQTFCckIsZUFBUSxDQUFDO1FBQ04sU0FBUyxFQUFFO1lBQ1AsNEJBQVk7U0FDZjtRQUNELE9BQU8sRUFBRTtZQUNMLHdDQUFrQjtZQUNsQiw4QkFBZ0I7WUFDaEIscUJBQVc7WUFDWCxzQ0FBNEI7WUFDNUIsd0NBQThCO1lBQzlCLGdDQUFzQjtTQUV6QjtRQUNELFlBQVksRUFBRTtZQUNWLDRCQUFZO1lBQ1osb0NBQWdCO1lBQ2hCLGdDQUFhO1lBQ2IsOENBQXFCO1lBQ3JCLDBDQUFtQjtTQUN0QjtRQUNELGVBQWUsRUFBRSxDQUFDLGdDQUFhLENBQUM7UUFDaEMsU0FBUyxFQUFFLENBQUMsb0RBQXdCLEVBQUUsc0NBQWMsRUFBRSwyQkFBWSxDQUFDO1FBQ25FLE9BQU8sRUFBRTtZQUNMLHVCQUFnQjtTQUNuQjtLQUNKLENBQUM7R0FDVyxTQUFTLENBQUk7QUFBYiw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBOT19FUlJPUlNfU0NIRU1BIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRNb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9uYXRpdmVzY3JpcHQubW9kdWxlJztcbmltcG9ydCB7IFBhZ2VyTW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXBhZ2VyL2FuZ3VsYXInO1xuaW1wb3J0IHsgTmF0aXZlU2NyaXB0VUlMaXN0Vmlld01vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC11aS1saXN0dmlldy9hbmd1bGFyJztcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdFVJU2lkZURyYXdlck1vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC11aS1zaWRlZHJhd2VyL2FuZ3VsYXInO1xuXG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRJMThuTW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LWkxOG4vYW5ndWxhcic7XG5cbmltcG9ydCB7IEFwcFJvdXRpbmdNb2R1bGUgfSBmcm9tICcuL2FwcC5yb3V0aW5nJztcblxuaW1wb3J0IHsgQXBwQ29tcG9uZW50IH0gZnJvbSAnLi9hcHAuY29tcG9uZW50JztcblxuaW1wb3J0IHsgQ2FwdHVyZUNvbXBvbmVudCB9IGZyb20gJy4vY2FwdHVyZS9jYXB0dXJlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJbWFnZUdhbGxlcnlDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlZ2FsbGVyeS9pbWFnZWdhbGxlcnkuY29tcG9uZW50JztcbmltcG9ydCB7IEltYWdlU2xpZGVDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlc2xpZGUvaW1hZ2VzbGlkZS5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuXG5pbXBvcnQgeyBPeHNFeWVMb2dnZXIgfSBmcm9tICcuL2xvZ2dlci9veHNleWVsb2dnZXInO1xuXG4vKiogVGhpcyBpcyB0aGUgbWFpbiBhcHBsaWNhdGlvbiBtb2R1bGUgY29udGFpbnMgYWxsIHRoZSBtb2R1bGVzIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLiAqL1xuQE5nTW9kdWxlKHtcbiAgICBib290c3RyYXA6IFtcbiAgICAgICAgQXBwQ29tcG9uZW50LFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgICBOYXRpdmVTY3JpcHRNb2R1bGUsXG4gICAgICAgIEFwcFJvdXRpbmdNb2R1bGUsXG4gICAgICAgIFBhZ2VyTW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSVNpZGVEcmF3ZXJNb2R1bGUsXG4gICAgICAgIE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUsXG5cbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBBcHBDb21wb25lbnQsXG4gICAgICAgIENhcHR1cmVDb21wb25lbnQsXG4gICAgICAgIERpYWxvZ0NvbnRlbnQsXG4gICAgICAgIEltYWdlR2FsbGVyeUNvbXBvbmVudCxcbiAgICAgICAgSW1hZ2VTbGlkZUNvbXBvbmVudCxcbiAgICBdLFxuICAgIGVudHJ5Q29tcG9uZW50czogW0RpYWxvZ0NvbnRlbnRdLFxuICAgIHByb3ZpZGVyczogW1RyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciwgQWN0aXZpdHlMb2FkZXIsIE94c0V5ZUxvZ2dlcl0sXG4gICAgc2NoZW1hczogW1xuICAgICAgICBOT19FUlJPUlNfU0NIRU1BLFxuICAgIF0sXG59KVxuZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiJdfQ==