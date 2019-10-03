import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
// @ts-ignore
import { CaptureComponent } from './capture/capture.component';
// @ts-ignore
import { ImageGalleryComponent } from './imagegallery/imagegallery.component';
// @ts-ignore
import { ImageSlideComponent } from './imageslide/imageslide.component';

const routes: Routes = [
    { path: '', redirectTo: '/capture', pathMatch: 'full' },
    { path: 'capture', component: CaptureComponent },
    { path: 'imagegallery', component: ImageGalleryComponent},
    { path: 'imageslide', component: ImageSlideComponent},
];

/** This is routing module where all the routes used in application will be defined here */
@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule],
})
export class AppRoutingModule { }
