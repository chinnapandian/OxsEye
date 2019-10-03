import { Component } from '@angular/core';
import { CameraPlus } from '@nstudio/nativescript-camera-plus';
// import { CameraPlus } from 'nativescript-opencv-camera-plus';
import { registerElement } from 'nativescript-angular/element-registry';
// import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// registerElement('L', () => L as any);
registerElement('CameraPlus', () => CameraPlus as any);
registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);
registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);
/**
 * This is the application component layout
 * where all other component(s) will be used.
 */
@Component({
  selector: 'ns-app',
  templateUrl: 'app.component.html',
})
export class AppComponent { }


// import { CameraPlus } from '@nstudio/nativescript-camera-plus';
// // import { CameraPlus } from 'nativescript-opencv-camera-plus';
// import { registerElement } from 'nativescript-angular/element-registry';
// // import { NativeScriptI18nModule, L } from "nativescript-i18n/angular";
// // registerElement('L', () => L as any);
// registerElement('CameraPlus', () => CameraPlus as any);
// registerElement('CheckBox', () => require('nativescript-checkbox').CheckBox);
// registerElement('ImageZoom', () => require('nativescript-image-zoom').ImageZoom);

// import { Component, OnInit, ViewChild } from "@angular/core";
// import * as app from "application";
// import { RouterExtensions } from "nativescript-angular/router";
// import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";

// @Component({
//     selector: "ns-app",
//     moduleId: module.id,
//     templateUrl: "app.component.html"
// })

// export class AppComponent implements OnInit {
//     // private _selectedPage: string;
//     // private _sideDrawerTransition: DrawerTransitionBase;

//     constructor(private routerExtensions: RouterExtensions) {
//         // Use the component constructor to inject services.
//     }

//     ngOnInit(): void {
//         console.log("app component")
//         // this._selectedPage = "/home";
//         // this._sideDrawerTransition = new SlideInOnTopTransition();
//     }

//     // get sideDrawerTransition(): DrawerTransitionBase {
//     //     console.log("sideDrawerTransition");
//     //     return this._sideDrawerTransition;
//     // }

//     // isPageSelected(pageTitle: string): boolean {
//     //     return pageTitle === this._selectedPage;
//     // }

//     // onNavItemTap(navItemRoute: string): void {
//     //     console.log(JSON.stringify(navItemRoute));

//     //     this._selectedPage = navItemRoute;
//     //     this.routerExtensions.navigate([navItemRoute], {
//     //         transition: {
//     //             name: "flip"
//     //         }
//     //     });

//     //     const sideDrawer = <RadSideDrawer>app.getRootView();
//     //     sideDrawer.closeDrawer();
//     // }
// }
