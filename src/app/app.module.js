"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var nativescript_module_1 = require("nativescript-angular/nativescript.module");
var app_routing_module_1 = require("./app-routing.module");
var app_component_1 = require("./app.component");
// import { ItemsComponent } from './item/items.component';
// import { ItemDetailComponent } from './item/item-detail.component';
var angular_1 = require("nativescript-ui-sidedrawer/angular");
// @ts-ignore
var capture_component_1 = require("./capture/capture.component");
// @ts-ignore
var dialog_component_1 = require("./dialog/dialog.component");
// @ts-ignore
var imagegallery_component_1 = require("./imagegallery/imagegallery.component");
// @ts-ignore
var imageslide_component_1 = require("./imageslide/imageslide.component");
// @ts-ignore
var transformedimage_provider_1 = require("./providers/transformedimage.provider");
// @ts-ignore
var oxseyelogger_1 = require("./logger/oxseyelogger");
var activityloader_common_1 = require("./activityloader/activityloader.common");
var angular_2 = require("nativescript-localize/angular");
var angular_3 = require("@nstudio/nativescript-checkbox/angular");
var AppModule = /** @class */ (function () {
    /*
    Pass your application module to the bootstrapModule function located in main.ts to start your app
    */
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            bootstrap: [
                app_component_1.AppComponent,
            ],
            imports: [
                nativescript_module_1.NativeScriptModule,
                app_routing_module_1.AppRoutingModule,
                angular_2.NativeScriptLocalizeModule,
                angular_1.NativeScriptUISideDrawerModule,
                angular_3.TNSCheckBoxModule,
            ],
            declarations: [
                app_component_1.AppComponent,
                // ItemsComponent,
                // ItemDetailComponent,
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
        /*
        Pass your application module to the bootstrapModule function located in main.ts to start your app
        */
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
