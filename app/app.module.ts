import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { PagerModule } from 'nativescript-pager/angular';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';

import { NativeScriptI18nModule } from 'nativescript-i18n/angular';

import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';
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

import { L } from 'nativescript-i18n/angular';

/** This is the main application module contains all the modules used in the application. */
@NgModule({
    bootstrap: [
        AppComponent,
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        PagerModule,
        NativeScriptUIListViewModule,
        NativeScriptUISideDrawerModule,
        NativeScriptI18nModule,

    ],
    declarations: [
        AppComponent,
        CaptureComponent,
        DialogContent,
        ImageGalleryComponent,
        ImageSlideComponent,
    ],
    entryComponents: [DialogContent],
    providers: [TransformedImageProvider, ActivityLoader, OxsEyeLogger, L],
    schemas: [
        NO_ERRORS_SCHEMA,
    ],
})
export class AppModule { }
