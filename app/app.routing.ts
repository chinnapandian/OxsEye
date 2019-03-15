import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { Routes } from '@angular/router';

import { CaptureComponent } from './capture/capture.component';
import { ImageGalleryComponent } from './imagegallery/imagegallery.component';
import { ImageSlideComponent } from './imageslide/imageslide.component';

const routes: Routes = [
    { path: '', redirectTo: '/capture', pathMatch: 'full' },
    { path: 'capture', component: CaptureComponent },
    { path: 'imagegallery', component: ImageGalleryComponent},
    { path: 'imageslide', component: ImageSlideComponent}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }