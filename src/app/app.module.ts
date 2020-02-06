import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { ItemsComponent } from './item/items.component';
// import { ItemDetailComponent } from './item/item-detail.component';

import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';

// @ts-ignore
import { CaptureComponent } from './capture/capture.component';
// @ts-ignore
import { DialogContent } from './dialog/dialog.component';
// @ts-ignore
import { ImageGalleryComponent } from './imagegallery/imagegallery.component';
// @ts-ignore
import { ImageSlideComponent } from './imageslide/imageslide.component';

// @ts-ignore
import { TransformedImageProvider } from './providers/transformedimage.provider';

// @ts-ignore
import { OxsEyeLogger } from './logger/oxseyelogger';

import { ActivityLoader } from './activityloader/activityloader.common';

import { NativeScriptLocalizeModule } from 'nativescript-localize/angular';

import { TNSCheckBoxModule } from '@nstudio/nativescript-checkbox/angular';

import { PagerModule } from "nativescript-pager/angular";
import { NativeScriptUIPhotoZoomModule } from "nativescript-photo-zoom/angular";
// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from 'nativescript-angular/forms';

// Uncomment and add to NgModule imports if you need to use the HttpClient wrapper
// import { NativeScriptHttpClientModule } from 'nativescript-angular/http-client';
import * as application from 'tns-core-modules/application';
import * as photoZoom from "nativescript-photo-zoom";

if (application.android) {
    application.on("launch", () => {
        photoZoom.initialize();
    });
}

@NgModule({
    bootstrap: [
        AppComponent,
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NativeScriptLocalizeModule,
        NativeScriptUISideDrawerModule,
        TNSCheckBoxModule,
        PagerModule,
        NativeScriptUIPhotoZoomModule
    ],
    declarations: [
        AppComponent,
        // ItemsComponent,
        // ItemDetailComponent,
        CaptureComponent,
        DialogContent,
        ImageGalleryComponent,
        ImageSlideComponent,
    ],
    entryComponents: [DialogContent],
    providers: [TransformedImageProvider, ActivityLoader, OxsEyeLogger],
    schemas: [
        NO_ERRORS_SCHEMA,
    ],
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule { }
