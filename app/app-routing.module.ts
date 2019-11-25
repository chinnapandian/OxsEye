import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

// import { ItemsComponent } from "./item/items.component";
// import { ItemDetailComponent } from "./item/item-detail.component";

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
    { path: 'imageslide', component: ImageSlideComponent}
];
// const routes: Routes = [
//     { path: "", redirectTo: "/items", pathMatch: "full" },
//     { path: "items", component: ItemsComponent },
//     { path: "item/:id", component: ItemDetailComponent }
// ];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
