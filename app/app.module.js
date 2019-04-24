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
var app_routing_1 = require("./app.routing");
var app_component_1 = require("./app.component");
var capture_component_1 = require("./capture/capture.component");
var dialog_component_1 = require("./dialog/dialog.component");
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
var imageslide_component_1 = require("./imageslide/imageslide.component");
var activityloader_common_1 = require("./activityloader/activityloader.common");
var transformedimage_provider_1 = require("./providers/transformedimage.provider");
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
        ],
        declarations: [
            app_component_1.AppComponent,
            capture_component_1.CaptureComponent,
            dialog_component_1.DialogContent,
            imagegallery_component_1.ImageGalleryComponent,
            imageslide_component_1.ImageSlideComponent,
        ],
        entryComponents: [dialog_component_1.DialogContent],
        providers: [transformedimage_provider_1.TransformedImageProvider, activityloader_common_1.ActivityLoader],
        schemas: [
            core_1.NO_ERRORS_SCHEMA,
        ],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMkQ7QUFDM0QsZ0ZBQThFO0FBQzlFLHNEQUF5RDtBQUN6RCw0REFBZ0Y7QUFDaEYsOERBQW9GO0FBRXBGLDZDQUFpRDtBQUVqRCxpREFBK0M7QUFFL0MsaUVBQStEO0FBQy9ELDhEQUEwRDtBQUMxRCxnRkFBOEU7QUFDOUUsMEVBQXdFO0FBRXhFLGdGQUF3RTtBQUN4RSxtRkFBaUY7QUEyQmpGLElBQWEsU0FBUztJQUF0QjtJQUF5QixDQUFDO0lBQUQsZ0JBQUM7QUFBRCxDQUFDLEFBQTFCLElBQTBCO0FBQWIsU0FBUztJQXpCckIsZUFBUSxDQUFDO1FBQ04sU0FBUyxFQUFFO1lBQ1AsNEJBQVk7U0FDZjtRQUNELE9BQU8sRUFBRTtZQUNMLHdDQUFrQjtZQUNsQiw4QkFBZ0I7WUFDaEIscUJBQVc7WUFDWCxzQ0FBNEI7WUFDNUIsd0NBQThCO1NBRWpDO1FBQ0QsWUFBWSxFQUFFO1lBQ1YsNEJBQVk7WUFDWixvQ0FBZ0I7WUFDaEIsZ0NBQWE7WUFDYiw4Q0FBcUI7WUFDckIsMENBQW1CO1NBQ3RCO1FBQ0QsZUFBZSxFQUFFLENBQUMsZ0NBQWEsQ0FBQztRQUNoQyxTQUFTLEVBQUUsQ0FBQyxvREFBd0IsRUFBRSxzQ0FBYyxDQUFDO1FBQ3JELE9BQU8sRUFBRTtZQUNMLHVCQUFnQjtTQUNuQjtLQUNKLENBQUM7R0FDVyxTQUFTLENBQUk7QUFBYiw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBOT19FUlJPUlNfU0NIRU1BIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRNb2R1bGUgfSBmcm9tICduYXRpdmVzY3JpcHQtYW5ndWxhci9uYXRpdmVzY3JpcHQubW9kdWxlJztcbmltcG9ydCB7IFBhZ2VyTW9kdWxlIH0gZnJvbSAnbmF0aXZlc2NyaXB0LXBhZ2VyL2FuZ3VsYXInO1xuaW1wb3J0IHsgTmF0aXZlU2NyaXB0VUlMaXN0Vmlld01vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC11aS1saXN0dmlldy9hbmd1bGFyJztcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdFVJU2lkZURyYXdlck1vZHVsZSB9IGZyb20gJ25hdGl2ZXNjcmlwdC11aS1zaWRlZHJhd2VyL2FuZ3VsYXInO1xuXG5pbXBvcnQgeyBBcHBSb3V0aW5nTW9kdWxlIH0gZnJvbSAnLi9hcHAucm91dGluZyc7XG5cbmltcG9ydCB7IEFwcENvbXBvbmVudCB9IGZyb20gJy4vYXBwLmNvbXBvbmVudCc7XG5cbmltcG9ydCB7IENhcHR1cmVDb21wb25lbnQgfSBmcm9tICcuL2NhcHR1cmUvY2FwdHVyZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRGlhbG9nQ29udGVudCB9IGZyb20gJy4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnQnO1xuaW1wb3J0IHsgSW1hZ2VHYWxsZXJ5Q29tcG9uZW50IH0gZnJvbSAnLi9pbWFnZWdhbGxlcnkvaW1hZ2VnYWxsZXJ5LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBJbWFnZVNsaWRlQ29tcG9uZW50IH0gZnJvbSAnLi9pbWFnZXNsaWRlL2ltYWdlc2xpZGUuY29tcG9uZW50JztcblxuaW1wb3J0IHsgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuL2FjdGl2aXR5bG9hZGVyL2FjdGl2aXR5bG9hZGVyLmNvbW1vbic7XG5pbXBvcnQgeyBUcmFuc2Zvcm1lZEltYWdlUHJvdmlkZXIgfSBmcm9tICcuL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcblxuQE5nTW9kdWxlKHtcbiAgICBib290c3RyYXA6IFtcbiAgICAgICAgQXBwQ29tcG9uZW50LFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgICBOYXRpdmVTY3JpcHRNb2R1bGUsXG4gICAgICAgIEFwcFJvdXRpbmdNb2R1bGUsXG4gICAgICAgIFBhZ2VyTW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSVNpZGVEcmF3ZXJNb2R1bGUsXG5cbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBBcHBDb21wb25lbnQsXG4gICAgICAgIENhcHR1cmVDb21wb25lbnQsXG4gICAgICAgIERpYWxvZ0NvbnRlbnQsXG4gICAgICAgIEltYWdlR2FsbGVyeUNvbXBvbmVudCxcbiAgICAgICAgSW1hZ2VTbGlkZUNvbXBvbmVudCxcbiAgICBdLFxuICAgIGVudHJ5Q29tcG9uZW50czogW0RpYWxvZ0NvbnRlbnRdLFxuICAgIHByb3ZpZGVyczogW1RyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciwgQWN0aXZpdHlMb2FkZXJdLFxuICAgIHNjaGVtYXM6IFtcbiAgICAgICAgTk9fRVJST1JTX1NDSEVNQSxcbiAgICBdLFxufSlcbmV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgeyB9XG4iXX0=