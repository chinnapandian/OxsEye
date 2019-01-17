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
var app_routing_1 = require("./app.routing");
var app_component_1 = require("./app.component");
var capture_component_1 = require("./capture/capture.component");
var dialog_component_1 = require("./dialog/dialog.component");
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
var imageslide_component_1 = require("./imageslide/imageslide.component");
var angular_1 = require("nativescript-pager/angular");
var angular_2 = require("nativescript-ui-listview/angular");
var transformedimage_provider_1 = require("./providers/transformedimage.provider");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        bootstrap: [
            app_component_1.AppComponent
        ],
        imports: [
            nativescript_module_1.NativeScriptModule,
            app_routing_1.AppRoutingModule,
            angular_1.PagerModule,
            angular_2.NativeScriptUIListViewModule
        ],
        declarations: [
            app_component_1.AppComponent,
            capture_component_1.CaptureComponent,
            dialog_component_1.DialogContent,
            imagegallery_component_1.ImageGalleryComponent,
            imageslide_component_1.ImageSlideComponent
        ],
        entryComponents: [dialog_component_1.DialogContent],
        providers: [transformedimage_provider_1.TransformedImageProvider, transformedimage_provider_1.ActivityLoader],
        schemas: [
            core_1.NO_ERRORS_SCHEMA
        ]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLm1vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxzQ0FBMkQ7QUFDM0QsZ0ZBQThFO0FBQzlFLDZDQUFpRDtBQUNqRCxpREFBK0M7QUFHL0MsaUVBQStEO0FBQy9ELDhEQUEyRDtBQUMzRCxnRkFBOEU7QUFDOUUsMEVBQXdFO0FBQ3hFLHNEQUF5RDtBQUN6RCw0REFBZ0Y7QUFDaEYsbUZBQWlHO0FBeUJqRyxJQUFhLFNBQVM7SUFBdEI7SUFBeUIsQ0FBQztJQUFELGdCQUFDO0FBQUQsQ0FBQyxBQUExQixJQUEwQjtBQUFiLFNBQVM7SUF4QnJCLGVBQVEsQ0FBQztRQUNOLFNBQVMsRUFBRTtZQUNQLDRCQUFZO1NBQ2Y7UUFDRCxPQUFPLEVBQUU7WUFDTCx3Q0FBa0I7WUFDbEIsOEJBQWdCO1lBQ2hCLHFCQUFXO1lBQ1gsc0NBQTRCO1NBRS9CO1FBQ0QsWUFBWSxFQUFFO1lBQ1YsNEJBQVk7WUFDWixvQ0FBZ0I7WUFDaEIsZ0NBQWE7WUFDYiw4Q0FBcUI7WUFDckIsMENBQW1CO1NBQ3RCO1FBQ0QsZUFBZSxFQUFFLENBQUMsZ0NBQWEsQ0FBQztRQUNoQyxTQUFTLEVBQUUsQ0FBQyxvREFBd0IsRUFBRSwwQ0FBYyxDQUFDO1FBQ3JELE9BQU8sRUFBRTtZQUNMLHVCQUFnQjtTQUNuQjtLQUNKLENBQUM7R0FDVyxTQUFTLENBQUk7QUFBYiw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBOT19FUlJPUlNfU0NIRU1BIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdE1vZHVsZSB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9uYXRpdmVzY3JpcHQubW9kdWxlXCI7XG5pbXBvcnQgeyBBcHBSb3V0aW5nTW9kdWxlIH0gZnJvbSBcIi4vYXBwLnJvdXRpbmdcIjtcbmltcG9ydCB7IEFwcENvbXBvbmVudCB9IGZyb20gXCIuL2FwcC5jb21wb25lbnRcIjtcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdFJvdXRlck1vZHVsZSwgTlNNb2R1bGVGYWN0b3J5TG9hZGVyLCB9IGZyb20gXCJuYXRpdmVzY3JpcHQtYW5ndWxhci9yb3V0ZXJcIlxuXG5pbXBvcnQgeyBDYXB0dXJlQ29tcG9uZW50IH0gZnJvbSBcIi4vY2FwdHVyZS9jYXB0dXJlLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgwqBEaWFsb2dDb250ZW50IH0gZnJvbSBcIi4vZGlhbG9nL2RpYWxvZy5jb21wb25lbnRcIjtcbmltcG9ydCB7IEltYWdlR2FsbGVyeUNvbXBvbmVudCB9IGZyb20gXCIuL2ltYWdlZ2FsbGVyeS9pbWFnZWdhbGxlcnkuY29tcG9uZW50XCI7XG5pbXBvcnQgeyBJbWFnZVNsaWRlQ29tcG9uZW50IH0gZnJvbSBcIi4vaW1hZ2VzbGlkZS9pbWFnZXNsaWRlLmNvbXBvbmVudFwiO1xuaW1wb3J0IHsgUGFnZXJNb2R1bGUgfSBmcm9tIFwibmF0aXZlc2NyaXB0LXBhZ2VyL2FuZ3VsYXJcIjtcbmltcG9ydCB7IE5hdGl2ZVNjcmlwdFVJTGlzdFZpZXdNb2R1bGUgfSBmcm9tIFwibmF0aXZlc2NyaXB0LXVpLWxpc3R2aWV3L2FuZ3VsYXJcIjtcbmltcG9ydCB7IFRyYW5zZm9ybWVkSW1hZ2VQcm92aWRlciwgQWN0aXZpdHlMb2FkZXIgfSBmcm9tICcuL3Byb3ZpZGVycy90cmFuc2Zvcm1lZGltYWdlLnByb3ZpZGVyJztcbkBOZ01vZHVsZSh7XG4gICAgYm9vdHN0cmFwOiBbXG4gICAgICAgIEFwcENvbXBvbmVudFxuICAgIF0sXG4gICAgaW1wb3J0czogW1xuICAgICAgICBOYXRpdmVTY3JpcHRNb2R1bGUsXG4gICAgICAgIEFwcFJvdXRpbmdNb2R1bGUsXG4gICAgICAgIFBhZ2VyTW9kdWxlLFxuICAgICAgICBOYXRpdmVTY3JpcHRVSUxpc3RWaWV3TW9kdWxlXG5cbiAgICBdLFxuICAgIGRlY2xhcmF0aW9uczogW1xuICAgICAgICBBcHBDb21wb25lbnQsXG4gICAgICAgIENhcHR1cmVDb21wb25lbnQsXG4gICAgICAgIERpYWxvZ0NvbnRlbnQsXG4gICAgICAgIEltYWdlR2FsbGVyeUNvbXBvbmVudCxcbiAgICAgICAgSW1hZ2VTbGlkZUNvbXBvbmVudFxuICAgIF0sXG4gICAgZW50cnlDb21wb25lbnRzOiBbRGlhbG9nQ29udGVudF0sXG4gICAgcHJvdmlkZXJzOiBbVHJhbnNmb3JtZWRJbWFnZVByb3ZpZGVyLCBBY3Rpdml0eUxvYWRlcl0sXG4gICAgc2NoZW1hczogW1xuICAgICAgICBOT19FUlJPUlNfU0NIRU1BXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBBcHBNb2R1bGUgeyB9XG4iXX0=