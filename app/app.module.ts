import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptModule } from 'nativescript-angular/nativescript.module';
import { PagerModule } from 'nativescript-pager/angular';
import { NativeScriptUIListViewModule } from 'nativescript-ui-listview/angular';
import { NativeScriptUISideDrawerModule } from 'nativescript-ui-sidedrawer/angular';

import { AppRoutingModule } from './app.routing';

import { AppComponent } from './app.component';

import { CaptureComponent } from './capture/capture.component';
import { DialogContent } from './dialog/dialog.component';
import { ImageGalleryComponent } from './imagegallery/imagegallery.component';
import { ImageSlideComponent } from './imageslide/imageslide.component';

import { ActivityLoader } from './activityloader/activityloader.common';
import { TransformedImageProvider } from './providers/transformedimage.provider';

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

    ],
    declarations: [
        AppComponent,
        CaptureComponent,
        DialogContent,
        ImageGalleryComponent,
        ImageSlideComponent,
    ],
    entryComponents: [DialogContent],
    providers: [TransformedImageProvider, ActivityLoader],
    schemas: [
        NO_ERRORS_SCHEMA,
    ],
})
export class AppModule { }
