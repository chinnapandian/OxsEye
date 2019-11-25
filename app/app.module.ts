import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
// import { ItemsComponent } from "./item/items.component";
// import { ItemDetailComponent } from "./item/item-detail.component";

import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';

// @ts-ignore
import { CaptureComponent } from './capture/capture.component';
// @ts-ignore
import { DialogContent } from './dialog/dialog.component';
// @ts-ignore
import { ImageGalleryComponent } from './imagegallery/imagegallery.component';
// @ts-ignore
import { ImageSlideComponent } from './imageslide/imageslide.component';

import { ActivityLoader } from './activityloader/activityloader.common';
// @ts-ignore
import { TransformedImageProvider } from './providers/transformedimage.provider';
// @ts-ignore
import { OxsEyeLogger } from './logger/oxseyelogger';

import { NativeScriptLocalizeModule } from "nativescript-localize/angular";
import { TNSCheckBoxModule } from '@nstudio/nativescript-checkbox/angular';

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports if you need to use the HttpClient wrapper
// import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import * as application from 'tns-core-modules/application';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptLocalizeModule,
        NativeScriptUISideDrawerModule,
        TNSCheckBoxModule
    ],
    declarations: [
        AppComponent,
        // ItemsComponent,
        // ItemDetailComponent,
        CaptureComponent,
        DialogContent,
        ImageGalleryComponent,
        ImageSlideComponent
    ],
    entryComponents: [DialogContent],
    providers: [TransformedImageProvider, ActivityLoader, OxsEyeLogger],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
