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
// @ts-ignore
var capture_component_1 = require("./capture/capture.component");
// @ts-ignore
var dialog_component_1 = require("./dialog/dialog.component");
// @ts-ignore
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
// @ts-ignore
var imageslide_component_1 = require("./imageslide/imageslide.component");
var activityloader_common_1 = require("./activityloader/activityloader.common");
// @ts-ignore
var transformedimage_provider_1 = require("./providers/transformedimage.provider");
// @ts-ignore
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMkQ7QUFDM0QsZ0ZBQThFO0FBQzlFLHNEQUF5RDtBQUN6RCw0REFBZ0Y7QUFDaEYsOERBQW9GO0FBRXBGLHFEQUFtRTtBQUVuRSw2Q0FBaUQ7QUFFakQsaURBQStDO0FBQy9DLGFBQWE7QUFDYixpRUFBK0Q7QUFDL0QsYUFBYTtBQUNiLDhEQUEwRDtBQUMxRCxhQUFhO0FBQ2IsZ0ZBQThFO0FBQzlFLGFBQWE7QUFDYiwwRUFBd0U7QUFFeEUsZ0ZBQXdFO0FBQ3hFLGFBQWE7QUFDYixtRkFBaUY7QUFDakYsYUFBYTtBQUNiLHNEQUFxRDtBQUVyRCxxREFBOEM7QUFFOUMsNEZBQTRGO0FBMkI1RixJQUFhLFNBQVM7SUFBdEI7SUFBeUIsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FBQyxBQUExQixJQUEwQjtBQUFiLFNBQVM7SUExQnJCLGVBQVEsQ0FBQztRQUNOLFNBQVMsRUFBRTtZQUNQLDRCQUFZO1NBQ2Y7UUFDRCxPQUFPLEVBQUU7WUFDTCx3Q0FBa0I7WUFDbEIsOEJBQWdCO1lBQ2hCLHFCQUFXO1lBQ1gsc0NBQTRCO1lBQzVCLHdDQUE4QjtZQUM5QixnQ0FBc0I7U0FFekI7UUFDRCxZQUFZLEVBQUU7WUFDViw0QkFBWTtZQUNaLG9DQUFnQjtZQUNoQixnQ0FBYTtZQUNiLDhDQUFxQjtZQUNyQiwwQ0FBbUI7U0FDdEI7UUFDRCxlQUFlLEVBQUUsQ0FBQyxnQ0FBYSxDQUFDO1FBQ2hDLFNBQVMsRUFBRSxDQUFDLG9EQUF3QixFQUFFLHNDQUFjLEVBQUUsMkJBQVksRUFBRSxXQUFDLENBQUM7UUFDdEUsT0FBTyxFQUFFO1lBQ0wsdUJBQWdCO1NBQ25CO0tBQ0osQ0FBQztHQUNXLFNBQVMsQ0FBSTtBQUFiLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIE5PX0VSUk9SU19TQ0hFTUEgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdE1vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC1hbmd1bGFyL25hdGl2ZXNjcmlwdC5tb2R1bGUnO1xuaW1wb3J0IHsgUGFnZXJNb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtcGFnZXIvYW5ndWxhcic7XG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXVpLWxpc3R2aWV3L2FuZ3VsYXInO1xuaW1wb3J0IHsgTmF0aXZlU2NyaXB0VUlTaWRlRHJhd2VyTW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXVpLXNpZGVkcmF3ZXIvYW5ndWxhcic7XG5cbmltcG9ydCB7IE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtaTE4bi9hbmd1bGFyJztcblxuaW1wb3J0IHsgQXBwUm91dGluZ01vZHVsZSB9IGZyb20gJy4vYXBwLnJvdXRpbmcnO1xuXG5pbXBvcnQgeyBBcHBDb21wb25lbnQgfSBmcm9tICcuL2FwcC5jb21wb25lbnQnO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgQ2FwdHVyZUNvbXBvbmVudCB9IGZyb20gJy4vY2FwdHVyZS9jYXB0dXJlLmNvbXBvbmVudCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBEaWFsb2dDb250ZW50IH0gZnJvbSAnLi9kaWFsb2cvZGlhbG9nLmNvbXBvbmVudCc7XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgeyBJbWFnZUdhbGxlcnlDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlZ2FsbGVyeS9pbWFnZWdhbGxlcnkuY29tcG9uZW50Jztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IEltYWdlU2xpZGVDb21wb25lbnQgfSBmcm9tICcuL2ltYWdlc2xpZGUvaW1hZ2VzbGlkZS5jb21wb25lbnQnO1xuXG5pbXBvcnQgeyBBY3Rpdml0eUxvYWRlciB9IGZyb20gJy4vYWN0aXZpdHlsb2FkZXIvYWN0aXZpdHlsb2FkZXIuY29tbW9uJztcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciB9IGZyb20gJy4vcHJvdmlkZXJzL3RyYW5zZm9ybWVkaW1hZ2UucHJvdmlkZXInO1xuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHsgT3hzRXllTG9nZ2VyIH0gZnJvbSAnLi9sb2dnZXIvb3hzZXllbG9nZ2VyJztcblxuaW1wb3J0IHsgTCB9IGZyb20gJ25hdGl2ZXNjcmlwdC1pMThuL2FuZ3VsYXInO1xuXG4vKiogVGhpcyBpcyB0aGUgbWFpbiBhcHBsaWNhdGlvbiBtb2R1bGUgY29udGFpbnMgYWxsIHRoZSBtb2R1bGVzIHVzZWQgaW4gdGhlIGFwcGxpY2F0aW9uLiAqL1xuQE5nTW9kdWxlKHtcbiAgICBib290c3RyYXA6IFtcbiAgICAgICAgQXBwQ29tcG9uZW50LFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgICBOYXRpdmVTY3JpcHRNb2R1bGUsXG4gICAgICAgIEFwcFJvdXRpbmdNb2R1bGUsXG4gICAgICAgIFBhZ2VyTW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSVNpZGVEcmF3ZXJNb2R1bGUsXG4gICAgICAgIE5hdGl2ZVNjcmlwdEkxOG5Nb2R1bGUsXG5cbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBBcHBDb21wb25lbnQsXG4gICAgICAgIENhcHR1cmVDb21wb25lbnQsXG4gICAgICAgIERpYWxvZ0NvbnRlbnQsXG4gICAgICAgIEltYWdlR2FsbGVyeUNvbXBvbmVudCxcbiAgICAgICAgSW1hZ2VTbGlkZUNvbXBvbmVudCxcbiAgICBdLFxuICAgIGVudHJ5Q29tcG9uZW50czogW0RpYWxvZ0NvbnRlbnRdLFxuICAgIHByb3ZpZGVyczogW1RyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciwgQWN0aXZpdHlMb2FkZXIsIE94c0V5ZUxvZ2dlciwgTF0sXG4gICAgc2NoZW1hczogW1xuICAgICAgICBOT19FUlJPUlNfU0NIRU1BLFxuICAgIF0sXG59KVxuZXhwb3J0IGNsYXNzIEFwcE1vZHVsZSB7IH1cbiJdfQ==